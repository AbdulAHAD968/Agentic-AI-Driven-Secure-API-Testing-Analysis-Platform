const express = require("express");
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

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/login", login);
router.post("/login/2fa", verifyLogin2FA);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/logout", logout);
router.get("/me", protect, getMe);

router.post("/setup-2fa", protect, setup2FA);
router.post("/activate-2fa", protect, activate2FA);
router.post("/disable-2fa", protect, disable2FA);

module.exports = router;
