const express = require("express");
const {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  getSubscribers,
  sendNewsletter,
  getInquiries,
  updateInquiry,
  deleteInquiry,
  replyToInquiry,
} = require("../controllers/adminController");
const { 
  adminCreateNotification, 
  adminGetNotifications, 
  adminDeleteNotification 
} = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getStats);

router.get("/users", getUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/newsletter", getSubscribers);
router.post("/newsletter/send", sendNewsletter);

router.get("/contacts", getInquiries);
router.put("/contacts/:id", updateInquiry);
router.delete("/contacts/:id", deleteInquiry);
router.post("/contacts/:id/reply", replyToInquiry);


router.get("/notifications", adminGetNotifications);
router.post("/notifications", adminCreateNotification);
router.delete("/notifications/:id", adminDeleteNotification);

module.exports = router;
