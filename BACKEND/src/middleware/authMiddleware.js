const ory = require("../lib/ory");
const User = require("../models/User");

/**
 * Protect routes using Ory session verification
 */
exports.protect = async (req, res, next) => {
  try {
    // Ory uses cookies for browser-based sessions.
    // We pass the Cookie header to Ory to verify the session.
    const cookie = req.header("Cookie");
    
    if (!cookie) {
      return res.status(401).json({ success: false, message: "Not authorized to access this route" });
    }

    const { data: session } = await ory.toSession({ cookie });

    if (!session || !session.active) {
      return res.status(401).json({ success: false, message: "Session expired or invalid" });
    }

    // Map Ory identity to our local User model if needed
    // Ory identity ID is unique and persistent
    let user = await User.findOne({ oryId: session.identity.id });

    if (!user) {
      // Optionally create a local user record if it doesn't exist
      // user = await User.create({
      //   oryId: session.identity.id,
      //   email: session.identity.traits.email,
      //   name: session.identity.traits.name,
      //   role: 'user'
      // });
      
      // For now, let's just attach the Ory identity to req.user
      req.user = {
        id: session.identity.id,
        email: session.identity.traits.email,
        name: session.identity.traits.name,
        role: 'user', // Default role
        ...session.identity
      };
    } else {
      req.user = user;
    }

    next();
  } catch (err) {
    console.error("Ory session verification error:", err.message);
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
