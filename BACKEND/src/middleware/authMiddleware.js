const ory = require("../lib/ory");
const User = require("../models/User");

// Comma-separated list of emails that should be granted admin role on first
// Ory-backed sign-in, or promoted if they already have a user-role account.
// Example: ADMIN_EMAILS=alice@example.com,bob@example.com
const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

if (adminEmails.length === 0) {
  console.log("[auth] ADMIN_EMAILS is empty — no email will be auto-promoted to admin.");
} else {
  console.log(`[auth] ADMIN_EMAILS configured: ${adminEmails.join(", ")}`);
}

const isAdminEmail = (email) =>
  Boolean(email) && adminEmails.includes(email.toLowerCase());

/**
 * Protect routes using Ory session verification
 */
exports.protect = async (req, res, next) => {
  try {
    const cookie = req.header("Cookie");

    if (!cookie) {
      return res.status(401).json({ success: false, message: "Not authorized to access this route" });
    }

    const { data: session } = await ory.toSession({ cookie });

    if (!session || !session.active) {
      return res.status(401).json({ success: false, message: "Session expired or invalid" });
    }

    let user = await User.findOne({ oryId: session.identity.id });
    const email = session.identity.traits.email;
    const name = session.identity.traits.name || email.split("@")[0];
    const shouldBeAdmin = isAdminEmail(email);

    if (!user) {
      user = await User.findOne({ email });

      if (user) {
        user.oryId = session.identity.id;
        if (shouldBeAdmin && user.role !== "admin") {
          user.role = "admin";
        }
        await user.save();
      } else {
        user = await User.create({
          oryId: session.identity.id,
          email: email,
          name: name,
          role: shouldBeAdmin ? "admin" : "user",
          isEmailVerified: true,
        });
      }
    } else if (shouldBeAdmin && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    req.user = user;

    next();
  } catch (err) {
    if (err.response?.status !== 401 && err.message !== "Not authorized to access this route") {
      console.error("Ory session verification error:", err.message);
    }
    return res.status(401).json({ success: false, message: "Not authorized to access this route" });
  }
};

/**
 * Authorize based on user roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
