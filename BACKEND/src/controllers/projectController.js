/**
 * @file projectController.js
 * @purpose Handles all project lifecycle operations: upload with encryption,
 *   AI-powered SAST/DAST scanning, report retrieval, and deletion.
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * -----------------------------------------------
 * [Missing Encryption of Sensitive Data]
 *   - Uploaded source code is immediately AES-256-CBC encrypted by
 *     vaultService.encrypt() before being written to the vault directory.
 *   - Temporary unencrypted files are deleted from uploads/ after encryption.
 *
 * [Path Traversal]
 *   - path.basename() + regex allowlist strip directory traversal sequences
 *     from the original filename before it is used in the vault path.
 *
 * [Missing or Incorrect Authorization / API1:2023 - BOLA]
 *   - All project queries include { user: req.user.id } to enforce ownership.
 *     A user can never access, scan, or delete another user's project.
 *
 * [Upload of Dangerous Files]
 *   - File type and size are pre-validated by multer in projectRoutes.js.
 *   - ZIP extraction limits total extracted content to 100KB to prevent
 *     zip-bomb style resource exhaustion attacks.
 *   - node_modules, vendor, and .git directories are excluded from analysis.
 *
 * [Error Handling]
 *   - Detailed errors are logged server-side only; clients receive generic messages.
 *   - Temp files are cleaned up on both success and failure paths.
 *
 * [API10:2023 - Unsafe Consumption of APIs]
 *   - AI-generated vulnerability findings are parsed and normalised before
 *     being stored — never trusted raw.
 */

const Project       = require("../models/Project");
const Vulnerability = require("../models/Vulnerability");
const Notification  = require("../models/Notification");
const AuditLog      = require("../models/AuditLog");
const vaultService  = require("../utils/vaultService");
const aiScannerService = require("../utils/aiScannerService");
const sandboxService   = require("../utils/sandboxService");
const fs   = require("fs");
const path = require("path");

/**
 * createProject: Upload, encrypt, and store a new source code project.
 *
 * Security checks performed:
 * 1. Requires an uploaded file (multer validates type and size in the route).
 * 2. Sanitizes the filename with path.basename() + regex to prevent path traversal.
 * 3. Encrypts the file buffer with AES-256-CBC before writing to vault.
 * 4. Deletes the plaintext temp file from uploads/ after successful vault write.
 * 5. On failure, also removes any temp file to prevent plaintext leakage.
 *
 * [Path Traversal / Upload of Dangerous Files / Missing Encryption of Sensitive Data]
 *
 * @param {Object} req.file        - multer file object (path, originalname)
 * @param {Object} req.body        - { name, description }
 * @param {Object} req.user        - Authenticated user (set by protect middleware)
 * @returns {Object} 201 with project data, or 400/500 error
 */
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    // [Upload of Dangerous Files] File presence check (type/size already validated by multer)
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Source code file is required" });
    }

    // [Missing Encryption of Sensitive Data] Encrypt file buffer before vault storage
    const fileBuffer      = fs.readFileSync(req.file.path);
    const encryptedContent = vaultService.encrypt(fileBuffer);

    /**
     * [Path Traversal]
     * path.basename() strips any directory components (e.g., "../../etc/passwd").
     * The regex further removes any characters outside alphanumerics, dots, underscores,
     * and hyphens — preventing shell metacharacter injection in the filename.
     */
    const safeFileName = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
    const vaultPath    = path.join(__dirname, "../../vault", `${Date.now()}_${safeFileName}.enc`);

    // Create vault directory if it doesn't exist (first run)
    if (!fs.existsSync(path.dirname(vaultPath))) {
      fs.mkdirSync(path.dirname(vaultPath), { recursive: true });
    }

    // Write ONLY the encrypted buffer to disk — plaintext never persisted
    fs.writeFileSync(vaultPath, encryptedContent);

    // [API1:2023 - BOLA] Associate project with the authenticated user's ID
    const project = await Project.create({
      name,
      description,
      user:      req.user.id,
      vaultPath: vaultPath,
      fileName:  req.file.originalname,
    });

    /**
     * [Upload of Dangerous Files] Delete the unencrypted temp file.
     * Wrapped in try-catch because Windows Defender may briefly lock the file;
     * the project is already safely saved, so we warn but don't fail.
     */
    try {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (cleanupErr) {
      console.warn("Could not delete temp file, but project was saved:", cleanupErr.message);
    }

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (err) {
    // [Error Handling] Log full error server-side; clean up temp file on failure
    console.error("Error creating project:", err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: "Project could not be created. Please try again later." });
  }
};

const AdmZip = require("adm-zip");

/**
 * triggerScan: Start an AI-powered SAST + DAST scan on a project's source code.
 *
 * Security checks performed:
 * 1. Verifies project ownership (BOLA prevention).
 * 2. Confirms the vault file exists before starting.
 * 3. Decrypts source code in-memory — decrypted content is never written to disk.
 * 4. ZIP extraction limits total content to 100KB (zip-bomb protection).
 * 5. Excludes node_modules, vendor, and .git from analysis.
 * 6. Returns 200 immediately; scanning runs asynchronously in the background.
 *
 * [API1:2023 - BOLA / Missing Encryption of Sensitive Data / Upload of Dangerous Files]
 *
 * @param {string} req.params.id - Project MongoDB ObjectId
 * @param {Object} req.user      - Authenticated user (set by protect middleware)
 * @returns {Object} 200 confirming scan started, or 400/404 error
 */
exports.triggerScan = async (req, res) => {
  try {
    // [API1:2023 - BOLA] Query includes user filter — user can only scan their own project
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or unauthorized access" });
    }

    // Prevent concurrent scans on the same project
    if (project.scanStatus === "scanning") {
      return res.status(400).json({ success: false, message: "Scan already in progress" });
    }

    // Verify vault file is accessible before starting
    if (!project.vaultPath || !fs.existsSync(project.vaultPath)) {
      return res.status(400).json({ success: false, message: "Source code not found in vault. Please re-upload project." });
    }

    project.scanStatus = "scanning";
    await project.save();

    // Respond immediately so the client isn't left waiting for the full AI scan
    res.status(200).json({
      success: true,
      message: "Security scan started in background",
    });

    // Background scan — errors are caught and logged; they do NOT affect the HTTP response
    (async () => {
      try {
        // Clear any previous findings before fresh scan
        await Vulnerability.deleteMany({ project: project._id });

        // [Missing Encryption of Sensitive Data] Decrypt in-memory only — never written to disk
        const encryptedBuffer = fs.readFileSync(project.vaultPath);
        const decryptedBuffer = vaultService.decrypt(encryptedBuffer);

        let codeContent = "";
        const isZip = project.fileName?.toLowerCase().endsWith(".zip");

        if (isZip) {
          const zip        = new AdmZip(decryptedBuffer);
          const zipEntries = zip.getEntries();

          const sourceExtensions = [".js", ".ts", ".py", ".go", ".java", ".php", ".c", ".cpp", ".cs"];

          /**
           * [Upload of Dangerous Files - Zip Bomb Protection]
           * Total extracted content is capped at 100KB. If the ZIP expands
           * beyond this limit, extraction stops early to prevent memory exhaustion.
           */
          let totalExtractedSize = 0;
          const MAX_SIZE = 100 * 1024; // 100KB cap

          for (const entry of zipEntries) {
            if (entry.isDirectory) continue;

            const normalizedEntryName = path.posix.normalize(entry.entryName.replace(/\\/g, "/"));
            /**
             * [Path Traversal / Zip Slip]
             * Even though entries are read in memory and not extracted to disk,
             * rejecting absolute or ../ paths prevents confusing file labels from
             * reaching the scanner prompt or audit output.
             */
            if (
              normalizedEntryName.startsWith("../") ||
              normalizedEntryName.includes("/../") ||
              path.posix.isAbsolute(normalizedEntryName)
            ) continue;

            const ext = path.extname(normalizedEntryName).toLowerCase();

            // Skip dependency and version-control directories — not user code
            if (
              normalizedEntryName.includes("node_modules") ||
              normalizedEntryName.includes("vendor") ||
              normalizedEntryName.includes(".git")
            ) continue;

            if (sourceExtensions.includes(ext)) {
              const content = entry.getData().toString("utf8");
              if (totalExtractedSize + content.length < MAX_SIZE) {
                codeContent           += `\n--- File: ${normalizedEntryName} ---\n${content}\n`;
                totalExtractedSize    += content.length;
              } else {
                break; // Stop before exceeding the memory budget
              }
            }
          }
        } else {
          codeContent = decryptedBuffer.toString("utf8");
        }

        if (!codeContent || codeContent.trim() === "") {
          throw new Error("No readable source code found in project files.");
        }

        // [API10:2023 - Unsafe Consumption of APIs] Run SAST; findings are normalized before DB insert
        await aiScannerService.runSAST(project, codeContent);

        // [API10:2023] Run DAST; findings are normalized before DB insert
        await sandboxService.runDAST(project, ["/api/login", "/api/user/profile"]);

        // Notify user if high-severity findings were detected
        const highFindings = await Vulnerability.find({
          project:  project._id,
          severity: { $in: ["Critical", "High"] },
        });

        const notificationTitle = highFindings.length > 0
          ? "High Severity Vulnerabilities Detected"
          : "Security Scan Completed";

        const notificationMsg = highFindings.length > 0
          ? `AI Scan for project "${project.name}" identified ${highFindings.length} critical or high-risk vulnerabilities.`
          : `AI Scan for project "${project.name}" completed. No critical issues found.`;

        await Notification.create({
          recipient: project.user,
          title:     notificationTitle,
          message:   notificationMsg,
          type:      highFindings.length > 0 ? "warning" : "info",
        });

        // Mark scan as completed
        const updatedProject = await Project.findByIdAndUpdate(
          project._id,
          { scanStatus: "completed", lastScan: Date.now() },
          { new: true }
        );

        if (updatedProject) {
          console.log(`Real analysis for project ${project._id} completed successfully.`);

          // Audit log the successful scan for compliance traceability
          await AuditLog.create({
            user:       project.user,
            action:     "SCAN_COMPLETED",
            resource:   "Project",
            resourceId: project._id,
            details:    `Security scan for "${project.name}" finished successfully. Findings aggregated.`,
            status:     "success",
          });
        } else {
          console.warn(`Project ${project._id} was deleted during scan. Skipping status update.`);
        }
      } catch (backgroundError) {
        console.error(`Background scan failed for project ${project._id}:`, backgroundError);

        try {
          await Project.findByIdAndUpdate(project._id, { scanStatus: "failed" });
        } catch (saveError) {
          // Ignore — project may have been deleted by user during scan
        }

        // Audit log the failure
        await AuditLog.create({
          user:       project.user,
          action:     "SCAN_FAILED",
          resource:   "Project",
          resourceId: project._id,
          details:    `Security scan for "${project.name}" failed: ${backgroundError.message}`,
          status:     "failure",
        });

        // Notify user of failure only if project still exists
        const projectStillExists = await Project.exists({ _id: project._id });
        if (projectStillExists) {
          await Notification.create({
            recipient: project.user,
            title:     "Security Scan Failed",
            message:   `The security scan for "${project.name}" failed: ${backgroundError.message}`,
            type:      "error",
          });
        }
      }
    })();
  } catch (err) {
    console.error("Trigger scan failed:", err.message);
    res.status(500).json({ success: false, message: "Security scan could not be started." });
  }
};

/**
 * getReport: Retrieve a project's details and vulnerability findings.
 *
 * [API1:2023 - BOLA]
 * The DB query enforces { user: req.user.id } so a user can only read
 * reports for their own projects — accessing another user's project ID
 * returns 404 rather than 403 to avoid confirming the resource exists.
 *
 * @param {string} req.params.id - Project MongoDB ObjectId
 * @returns {Object} 200 with project + vulnerabilities, or 404 error
 */
exports.getReport = async (req, res) => {
  try {
    // [API1:2023 - BOLA] Ownership enforced at query level
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or unauthorized access" });
    }

    const vulnerabilities = await Vulnerability.find({ project: project._id }).select("-__v");

    res.status(200).json({
      success: true,
      data: {
        project: {
          _id:         project._id,
          name:        project.name,
          description: project.description,
          scanStatus:  project.scanStatus,
          lastScan:    project.lastScan,
          createdAt:   project.createdAt,
        },
        vulnerabilities,
      },
    });
  } catch (err) {
    console.error("Get report failed:", err.message);
    res.status(500).json({ success: false, message: "Report could not be loaded." });
  }
};

/**
 * getProjects: List all projects owned by the authenticated user.
 *
 * [API1:2023 - BOLA]
 * Filters by { user: req.user.id } so users can only see their own projects.
 * Includes a pre-aggregated findingsSummary for dashboard display.
 *
 * @returns {Object} 200 with array of projects and their summary counts
 */
exports.getProjects = async (req, res) => {
  try {
    // [API1:2023 - BOLA] Scoped to authenticated user's projects only
    const projects = await Project.find({ user: req.user.id })
      .select("-__v")
      .sort("-createdAt");

    const projectsWithSummary = await Promise.all(projects.map(async (project) => {
      const findings = await Vulnerability.find({ project: project._id });
      return {
        ...project.toObject(),
        findingsSummary: {
          critical: findings.filter(f => f.severity === "Critical").length,
          high:     findings.filter(f => f.severity === "High").length,
          medium:   findings.filter(f => f.severity === "Medium").length,
          low:      findings.filter(f => f.severity === "Low").length,
        },
      };
    }));

    res.status(200).json({ success: true, data: projectsWithSummary });
  } catch (err) {
    console.error("Get projects failed:", err.message);
    res.status(500).json({ success: false, message: "Projects could not be loaded." });
  }
};

/**
 * deleteProject: Delete a project and all associated vulnerability findings.
 *
 * [API1:2023 - BOLA]
 * Verifies project ownership before deletion.
 * Associated Vulnerability documents are cascade-deleted to prevent orphaned data.
 *
 * @param {string} req.params.id - Project MongoDB ObjectId
 * @returns {Object} 200 success or 404 error
 */
exports.deleteProject = async (req, res) => {
  try {
    // [API1:2023 - BOLA] Only the owning user can delete the project
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or unauthorized access" });
    }

    // Cascade delete all vulnerability findings linked to this project
    await Vulnerability.deleteMany({ project: project._id });

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project and associated findings deleted successfully",
    });
  } catch (err) {
    console.error("Delete project failed:", err.message);
    res.status(500).json({ success: false, message: "Project could not be deleted." });
  }
};

/**
 * getProjectStats: Compute aggregate security statistics for the dashboard.
 *
 * [API1:2023 - BOLA]
 * Statistics are computed only across projects owned by req.user.id.
 * A weighted severity scoring model produces a letter grade (A+ to F).
 *
 * @returns {Object} 200 with totalProjects, totalVulnerabilities, grade, severityCounts
 */
exports.getProjectStats = async (req, res) => {
  try {
    // [API1:2023 - BOLA] Scoped to authenticated user's projects
    const projects    = await Project.find({ user: req.user.id });
    const projectIds  = projects.map(p => p._id);
    const allFindings = await Vulnerability.find({ project: { $in: projectIds } });

    const counts = {
      critical: allFindings.filter(v => v.severity === "Critical").length,
      high:     allFindings.filter(v => v.severity === "High").length,
      medium:   allFindings.filter(v => v.severity === "Medium").length,
      low:      allFindings.filter(v => v.severity === "Low").length,
      info:     allFindings.filter(v => v.severity === "Info").length,
    };

    const totalVulnerabilities = allFindings.length;

    // Weighted scoring: Critical=15, High=7, Medium=3, Low=1
    const weightedSum = (counts.critical * 15) + (counts.high * 7) + (counts.medium * 3) + (counts.low * 1);
    const rawScore    = projects.length > 0 ? Math.max(0, 100 - (weightedSum / projects.length)) : 100;

    // Map numeric score to letter grade
    let grade = "A+";
    if (rawScore < 98) grade = "A+";
    if (rawScore < 95) grade = "A";
    if (rawScore < 90) grade = "A-";
    if (rawScore < 85) grade = "B+";
    if (rawScore < 80) grade = "B";
    if (rawScore < 70) grade = "C";
    if (rawScore < 60) grade = "D";
    if (rawScore < 50) grade = "F";

    res.status(200).json({
      success: true,
      data: {
        totalProjects:      projects.length,
        totalVulnerabilities,
        criticalIssues:     counts.critical + counts.high,
        grade,
        score:              Math.round(rawScore),
        severityCounts:     counts,
        recentActivity:     projects.filter(p => p.lastScan && (Date.now() - new Date(p.lastScan)) < 86400000).length,
      },
    });
  } catch (err) {
    console.error("Get project stats failed:", err.message);
    res.status(500).json({ success: false, message: "Project statistics could not be loaded." });
  }
};
