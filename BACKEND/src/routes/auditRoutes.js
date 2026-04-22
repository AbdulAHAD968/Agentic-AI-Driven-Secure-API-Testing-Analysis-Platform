const express = require("express");
const { 
  getAuditLogs, 
  getAuditStats, 
  deleteAuditLog, 
  purgeAuditLogs 
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/logs", getAuditLogs);
router.get("/stats", getAuditStats);
router.delete("/purge", purgeAuditLogs);
router.delete("/:id", deleteAuditLog);

module.exports = router;
