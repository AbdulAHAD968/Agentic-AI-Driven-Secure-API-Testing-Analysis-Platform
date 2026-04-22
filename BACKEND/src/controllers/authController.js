const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/email");
const { verificationEmail, resetPasswordEmail, twoFactorEmail } = require("../templates/emailTemplates");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");


const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
};


const sendTokenResponse = (user, statusCode, res, is2faRequired = false) => {
  if (is2faRequired) {
    return res.status(statusCode).json({
      success: true,
      message: "2FA Required",
      twoFactorRequired: true,
      userId: user._id,
    });
  }

  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  };

  res.cookie("token", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: { user },
  });
};



exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });

    
    const verificationToken = user.createVerificationToken();
    await user.save({ validateBeforeSave: false });

    
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: "Verify your Topic AI account",
        html: verificationEmail(verifyUrl),
      });

      res.status(201).json({
        success: true,
        message: "Registration successful. Please check your email to verify your account.",
      });
    } catch (err) {
      user.verificationToken = undefined;
      user.verificationTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: "Email could not be sent. Please try again later." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.body.token).digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Token is invalid or has expired" });
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Email verified successfully. You can now log in." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.resendVerification = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    const verificationToken = user.createVerificationToken();
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: "Verify your Topic AI account",
      html: verificationEmail(verifyUrl),
    });

    res.status(200).json({ success: true, message: "Verification email resent." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password +twoFactorSecret +loginAttempts +lockUntil");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
      return res.status(423).json({ 
        success: false, 
        message: `Account is temporarily locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.` 
      });
    }

    const isMatch = await user.comparePassword(password, user.password);

    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;
      
      
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; 
        await user.save();
        return res.status(423).json({ 
          success: false, 
          message: "Too many failed attempts. Account locked for 15 minutes." 
        });
      }
      
      await user.save();
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ success: false, message: "Please verify your email first", emailNotVerified: true });
    }

    
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    
    if (user.isTwoFactorEnabled) {
      await user.save();
      return sendTokenResponse(user, 200, res, true);
    }

    user.lastLogin = Date.now();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.verifyLogin2FA = async (req, res, next) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findById(userId).select("+twoFactorSecret");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (!verified) {
      return res.status(401).json({ success: false, message: "Invalid authentication code" });
    }

    user.lastLogin = Date.now();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found with that email" });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset your Topic AI password",
        html: resetPasswordEmail(resetUrl),
      });

      res.status(200).json({ success: true, message: "Token sent to email" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: "Email could not be sent" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.body.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.setup2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const secret = speakeasy.generateSecret({
      name: `Topic AI (${user.email})`,
    });

    user.twoFactorAuthTempSecret = secret.base32;
    await user.save();

    const dataUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      dataUrl,
      secret: secret.base32,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.activate2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id).select("+twoFactorAuthTempSecret");

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuthTempSecret,
      encoding: "base32",
      token,
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    user.twoFactorSecret = user.twoFactorAuthTempSecret;
    user.twoFactorAuthTempSecret = undefined;
    user.isTwoFactorEnabled = true;
    await user.save();

    res.status(200).json({ success: true, message: "Two-Factor Authentication activated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.disable2FA = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.comparePassword(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    user.twoFactorSecret = undefined;
    user.isTwoFactorEnabled = false;
    await user.save();

    res.status(200).json({ success: true, message: "Two-Factor Authentication disabled" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
};



exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};
