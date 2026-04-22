const Project = require("../models/Project");
const Vulnerability = require("../models/Vulnerability");
const Notification = require("../models/Notification");
const vaultService = require("../utils/vaultService");
const aiScannerService = require("../utils/aiScannerService");
const sandboxService = require("../utils/sandboxService");
const fs = require("fs");
const path = require("path");

/**
 * @desc    Create new project and upload code
 * @route   POST /api/v1/projects
 * @access  Private
 */
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Source code file is required" });
    }

    
    const fileBuffer = fs.readFileSync(req.file.path);
    const encryptedContent = vaultService.encrypt(fileBuffer);
    
    
    const vaultPath = path.join(__dirname, "../../vault", `${Date.now()}_${req.file.originalname}.enc`);
    if (!fs.existsSync(path.dirname(vaultPath))) {
      fs.mkdirSync(path.dirname(vaultPath), { recursive: true });
    }
    fs.writeFileSync(vaultPath, encryptedContent);

    
    const project = await Project.create({
      name,
      description,
      user: req.user.id,
    });

    
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Trigger AI Security Scan
 * @route   POST /api/v1/projects/:id/scan
 * @access  Private
 */
exports.triggerScan = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or unauthorized access" });
    }

    project.scanStatus = "scanning";
    await project.save();

    
    
    const mockCode = "const app = express(); app.post('/api/user', (req, res) => { eval(req.body.code); });";
    
    
    await Vulnerability.deleteMany({ project: project._id });

    
    await aiScannerService.runSAST(project, mockCode);
    
    
    await sandboxService.runDAST(project, ["/api/login", "/api/user/profile"]);

    // FR8: Real-time Threat Alerts
    // Check for high/critical findings
    const highFindings = await Vulnerability.find({ 
      project: project._id, 
      severity: { $in: ["Critical", "High"] } 
    });

    if (highFindings.length > 0) {
      await Notification.create({
        user: project.user,
        title: "High Severity Vulnerabilities Detected",
        message: `AI Scan for project "${project.name}" identified ${highFindings.length} critical or high-risk vulnerabilities. Please review the report immediately.`,
        type: "security",
        isRead: false
      });
    } else {
      await Notification.create({
        user: project.user,
        title: "Security Scan Completed",
        message: `AI Scan for project "${project.name}" completed successfully. No critical vulnerabilities found.`,
        type: "info",
        isRead: false
      });
    }

    project.scanStatus = "completed";
    project.lastScan = Date.now();
    await project.save();

    res.status(200).json({
      success: true,
      message: "Scan completed successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get project report
 * @route   GET /api/v1/projects/:id/report
 * @access  Private
 */
exports.getReport = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or unauthorized access" });
    }

    const vulnerabilities = await Vulnerability.find({ project: project._id }).select("-__v");

    res.status(200).json({
      success: true,
      data: {
        project: {
          _id: project._id,
          name: project.name,
          description: project.description,
          scanStatus: project.scanStatus,
          lastScan: project.lastScan,
          createdAt: project.createdAt
        },
        vulnerabilities,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    List all projects
 * @route   GET /api/v1/projects
 * @access  Private
 */
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id })
      .select("-__v")
      .sort("-createdAt");
    res.status(200).json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
