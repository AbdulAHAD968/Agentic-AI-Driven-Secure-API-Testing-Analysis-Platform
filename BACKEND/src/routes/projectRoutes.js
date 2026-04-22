const express = require("express");
const router = express.Router();
const { 
  createProject, 
  getProjects, 
  triggerScan, 
  getReport 
} = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { audit } = require("../middleware/auditMiddleware");
const multer = require("multer");
const path = require("path");

// Configure multer for temp storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /js|py|txt|zip|json/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File upload only supports source code files!"));
  }
});

router.use(protect);

router.route("/")
  .get(getProjects)
  .post(upload.single("code"), audit("CREATE_PROJECT"), createProject);

router.post("/:id/scan", audit("TRIGGER_SCAN"), triggerScan);
router.get("/:id/report", getReport);

module.exports = router;
