const express = require("express");
const { updateProfile, updatePassword } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

const router = express.Router();

router.use(protect); 

router.put("/profile", upload.single("avatar"), updateProfile);
router.put("/password", updatePassword);

module.exports = router;
