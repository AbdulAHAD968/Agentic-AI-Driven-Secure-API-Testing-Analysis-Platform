const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  register,
  verifyEmail,
  resendVerification,
  login,
  verifyLogin2FA,
  forgotPassword,
  resetPassword,
  setup2FA,
  activate2FA,
  disable2FA,
  logout,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * [API4:2023 - Unrestricted Resource Consumption / Authentication Bypass]
 * Auth endpoints receive a stricter limiter than the global API limiter to
 * slow credential stuffing, token guessing, and email-abuse workflows.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Please try again later." },
});

router.post("/register", authLimiter, register);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/resend-verification", authLimiter, resendVerification);
router.post("/login", authLimiter, login);
router.post("/login/2fa", authLimiter, verifyLogin2FA);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

router.get("/logout", logout);
router.get("/me", protect, getMe);

router.post("/setup-2fa", protect, setup2FA);
router.post("/activate-2fa", protect, activate2FA);
router.post("/disable-2fa", protect, disable2FA);

module.exports = router;
