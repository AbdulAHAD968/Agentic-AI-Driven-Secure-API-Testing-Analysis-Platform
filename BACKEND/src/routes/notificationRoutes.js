const express = require("express");
const { getNotifications, markAsRead, hideNotification } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.put("/:id/read", markAsRead);
router.delete("/:id", hideNotification);

module.exports = router;
