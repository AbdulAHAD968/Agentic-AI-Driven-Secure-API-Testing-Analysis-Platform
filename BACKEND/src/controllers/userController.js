/**
 * @file userController.js
 * @purpose Handles authenticated profile and password updates.
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * [API3:2023 - Broken Object Property Level Authorization]
 *   - Only allowlisted fields are assigned; request bodies cannot mass-assign
 *     role, active, password hash, or other privileged properties.
 * [The Hidden Dangers in Password Handling]
 *   - Password changes require the current password and use the User pre-save
 *     bcrypt hook so plaintext is never stored.
 * [Error Handling]
 *   - Internal errors are logged server-side and generic responses are returned.
 */

const User = require("../models/User");

/**
 * updateProfile: Update safe profile fields for the current user.
 *
 * [Input Validation / Mass Assignment Protection]
 * Reads only name from req.body and avatar from the trusted upload middleware.
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    // [Upload of Dangerous Files] Cloudinary middleware validates/stores avatar; only the returned hosted path is saved.
    if (req.file) user.avatar = req.file.path;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (err) {
    console.error("Profile update failed:", err.message);
    res.status(500).json({ success: false, message: "Profile could not be updated." });
  }
};

/**
 * updatePassword: Change password after re-authenticating the current password.
 *
 * [Authentication Bypass / Password Handling]
 * Requiring currentPassword limits damage from a stolen unlocked session.
 * Assigning newPassword triggers User.js bcrypt hashing and policy validation.
 */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    if (!(await user.comparePassword(currentPassword, user.password))) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Password update failed:", err.message);
    res.status(500).json({ success: false, message: "Password could not be updated." });
  }
};
