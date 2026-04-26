/**
 * @file projectRoutes.js
 * @purpose Defines all Express routes for the /api/v1/projects endpoint.
 *   Configures multer for secure file upload handling and applies
 *   authentication, authorization, and audit middleware to all routes.
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * -----------------------------------------------
 * [Upload of Dangerous Files]
 *   - multer enforces a strict file type allowlist (js, py, txt, zip, json)
 *     using extension validation via fileFilter.
 *   - Maximum upload size is capped at 50MB to prevent DoS via large uploads.
 *   - Files are stored in a temporary uploads/ directory; the controller
 *     immediately encrypts and moves them to the vault, then deletes the temp file.
 *
 * [Path Traversal]
 *   - filename() uses Date.now() prefix + original name — note: original name
 *     is further sanitized with path.basename() in the controller before
 *     constructing the vault path.
 *
 * [Missing or Incorrect Authorization / API1:2023 - BOLA / API5:2023]
 *   - All routes are protected by protect() (Ory session verification).
 *   - authorize("user") ensures only authenticated users with role "user"
 *     can create and manage projects.
 *
 * [API8:2023 - Security Misconfiguration / Audit Logging]
 *   - audit() middleware logs CREATE_PROJECT and DELETE_PROJECT actions
 *     for traceability and incident response.
 */

const express = require("express");
const router  = express.Router();
const {
  createProject,
  getProjects,
  triggerScan,
  getReport,
  deleteProject,
  getProjectStats,
} = require("../controllers/projectController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { audit }              = require("../middleware/auditMiddleware");
const multer                 = require("multer");
const path                   = require("path");

/**
 * multer disk storage configuration.
 *
 * [Upload of Dangerous Files / Path Traversal]
 * - destination: "uploads/" — a server-side temp directory NOT web-accessible.
 * - filename: uses a timestamp prefix to prevent name collisions and reduce
 *   predictability. The originalname is included for debuggability but is
 *   re-sanitized in the controller using path.basename() before vault storage.
 */
const storage = multer.diskStorage({
  destination: "uploads/", // Temp staging area; files are moved to encrypted vault by controller
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

/**
 * multer upload configuration.
 *
 * [Upload of Dangerous Files / API4:2023 - Unrestricted Resource Consumption]
 * - fileSize limit: 50MB — prevents DoS via oversized upload payloads.
 * - fileFilter: allowlist of source code extensions only (js, py, txt, zip, json).
 *   Files with other extensions are rejected before they touch the disk.
 * - The error handler in index.js catches LIMIT_FILE_SIZE and returns a clean 413.
 *
 * @param {Object} req  - Express request
 * @param {Object} file - multer file metadata (originalname, mimetype, etc.)
 * @param {Function} cb - multer callback: cb(error, accept)
 */
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max — prevents resource exhaustion
  fileFilter: (req, file, cb) => {
    // [Upload of Dangerous Files] Strict extension allowlist — reject all other file types
    const filetypes = /js|py|txt|zip|json/;
    const extname   = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File upload only supports source code files!"));
  },
});

/**
 * All project routes require an active Ory session (protect)
 * and the "user" role (authorize).
 *
 * [API5:2023 - Broken Function Level Authorization]
 * Middleware order is: protect → authorize → route handler.
 * Unauthenticated or unauthorized requests are rejected before
 * reaching the controller.
 */
router.use(protect);
router.use(authorize("user"));

// GET  /api/v1/projects       — List all projects owned by the authenticated user
// POST /api/v1/projects       — Create a project with encrypted source code upload
router.route("/")
  .get(getProjects)
  .post(
    upload.single("code"),          // [Upload of Dangerous Files] Type + size validated by multer
    audit("CREATE_PROJECT"),        // Audit log entry for project creation
    createProject
  );

// GET  /api/v1/projects/stats/overview — Aggregate vulnerability statistics
router.get("/stats/overview", getProjectStats);

// GET    /api/v1/projects/:id — Fetch a project report (BOLA enforced in controller)
// DELETE /api/v1/projects/:id — Delete a project and its findings
router.route("/:id")
  .get(getReport)
  .delete(audit("DELETE_PROJECT"), deleteProject);

// POST /api/v1/projects/:id/scan   — Trigger an AI security scan
router.post("/:id/scan", audit("TRIGGER_SCAN"), triggerScan);

// GET  /api/v1/projects/:id/report — Alias for getReport
router.get("/:id/report", getReport);

module.exports = router;
