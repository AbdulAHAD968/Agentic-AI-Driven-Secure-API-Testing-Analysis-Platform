const Project = require("../models/Project");
const Vulnerability = require("../models/Vulnerability");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const vaultService = require("../utils/vaultService");
const aiScannerService = require("../utils/aiScannerService");
const sandboxService = require("../utils/sandboxService");
const fs = require("fs");
const path = require("path");


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
      vaultPath: vaultPath,
      fileName: req.file.originalname,
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

const AdmZip = require("adm-zip");


exports.triggerScan = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or unauthorized access" });
    }

    if (project.scanStatus === "scanning") {
      return res.status(400).json({ success: false, message: "Scan already in progress" });
    }

    if (!project.vaultPath || !fs.existsSync(project.vaultPath)) {
      return res.status(400).json({ success: false, message: "Source code not found in vault. Please re-upload project." });
    }

    project.scanStatus = "scanning";
    await project.save();

    
    res.status(200).json({
      success: true,
      message: "Security scan started in background",
    });

    
    (async () => {
      try {
        
        await Vulnerability.deleteMany({ project: project._id });

        
        const encryptedBuffer = fs.readFileSync(project.vaultPath);
        const decryptedBuffer = vaultService.decrypt(encryptedBuffer);
        
        let codeContent = "";
        const isZip = project.fileName?.toLowerCase().endsWith(".zip");

        if (isZip) {
          
          const zip = new AdmZip(decryptedBuffer);
          const zipEntries = zip.getEntries();
          
          const sourceExtensions = [".js", ".ts", ".py", ".go", ".java", ".php", ".c", ".cpp", ".cs"];
          let totalExtractedSize = 0;
          const MAX_SIZE = 100 * 1024; 

          for (const entry of zipEntries) {
            if (entry.isDirectory) continue;
            
            const ext = path.extname(entry.entryName).toLowerCase();
            
            if (entry.entryName.includes("node_modules") || entry.entryName.includes("vendor") || entry.entryName.includes(".git")) continue;

            if (sourceExtensions.includes(ext)) {
              const content = entry.getData().toString("utf8");
              if (totalExtractedSize + content.length < MAX_SIZE) {
                codeContent += `\n--- File: ${entry.entryName} ---\n${content}\n`;
                totalExtractedSize += content.length;
              } else {
                break;
              }
            }
          }
        } else {
          
          codeContent = decryptedBuffer.toString("utf8");
        }

        if (!codeContent || codeContent.trim() === "") {
          throw new Error("No readable source code found in project files.");
        }

        
        await aiScannerService.runSAST(project, codeContent);
        
        
        await sandboxService.runDAST(project, ["/api/login", "/api/user/profile"]);

        
        const highFindings = await Vulnerability.find({ 
          project: project._id, 
          severity: { $in: ["Critical", "High"] } 
        });

        const notificationTitle = highFindings.length > 0 
          ? "High Severity Vulnerabilities Detected" 
          : "Security Scan Completed";
          
        const notificationMsg = highFindings.length > 0
          ? `AI Scan for project "${project.name}" identified ${highFindings.length} critical or high-risk vulnerabilities.`
          : `AI Scan for project "${project.name}" completed. No critical issues found.`;

        await Notification.create({
          recipient: project.user,
          title: notificationTitle,
          message: notificationMsg,
          type: highFindings.length > 0 ? "warning" : "info"
        });

        
        const updatedProject = await Project.findByIdAndUpdate(
          project._id,
          { scanStatus: "completed", lastScan: Date.now() },
          { new: true }
        );

        if (updatedProject) {
          console.log(`Real analysis for project ${project._id} completed successfully.`);
          
          
          await AuditLog.create({
            user: project.user,
            action: "SCAN_COMPLETED",
            resource: "Project",
            resourceId: project._id,
            details: `Security scan for "${project.name}" finished successfully. Findings aggregated.`,
            status: "success"
          });
        } else {
          console.warn(`Project ${project._id} was deleted during scan. Skipping status update.`);
        }
      } catch (backgroundError) {
        console.error(`Background scan failed for project ${project._id}:`, backgroundError);
        
        try {
          await Project.findByIdAndUpdate(project._id, { scanStatus: "failed" });
        } catch (saveError) {
          
        }

        
        await AuditLog.create({
          user: project.user,
          action: "SCAN_FAILED",
          resource: "Project",
          resourceId: project._id,
          details: `Security scan for "${project.name}" failed: ${backgroundError.message}`,
          status: "failure"
        });
        
        
        const projectStillExists = await Project.exists({ _id: project._id });
        if (projectStillExists) {
          await Notification.create({
            recipient: project.user,
            title: "Security Scan Failed",
            message: `The security scan for "${project.name}" failed: ${backgroundError.message}`,
            type: "error"
          });
        }
      }
    })();

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


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

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id })
      .select("-__v")
      .sort("-createdAt");
    
    
    const projectsWithSummary = await Promise.all(projects.map(async (project) => {
      const findings = await Vulnerability.find({ project: project._id });
      return {
        ...project.toObject(),
        findingsSummary: {
          critical: findings.filter(f => f.severity === "Critical").length,
          high: findings.filter(f => f.severity === "High").length,
          medium: findings.filter(f => f.severity === "Medium").length,
          low: findings.filter(f => f.severity === "Low").length
        }
      };
    }));

    res.status(200).json({ success: true, data: projectsWithSummary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found or unauthorized access" });
    }

    
    await Vulnerability.deleteMany({ project: project._id });
    
    
    

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project and associated findings deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getProjectStats = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id });
    const projectIds = projects.map(p => p._id);
    
    
    const allFindings = await Vulnerability.find({ project: { $in: projectIds } });
    
    const counts = {
      critical: allFindings.filter(v => v.severity === "Critical").length,
      high: allFindings.filter(v => v.severity === "High").length,
      medium: allFindings.filter(v => v.severity === "Medium").length,
      low: allFindings.filter(v => v.severity === "Low").length,
      info: allFindings.filter(v => v.severity === "Info").length,
    };

    const totalVulnerabilities = allFindings.length;
    
    
    
    const weightedSum = (counts.critical * 15) + (counts.high * 7) + (counts.medium * 3) + (counts.low * 1);
    
    
    
    const rawScore = projects.length > 0 ? Math.max(0, 100 - (weightedSum / projects.length)) : 100;
    
    // Map score to Grade
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
        totalProjects: projects.length,
        totalVulnerabilities,
        criticalIssues: counts.critical + counts.high,
        grade,
        score: Math.round(rawScore),
        severityCounts: counts,
        recentActivity: projects.filter(p => p.lastScan && (Date.now() - new Date(p.lastScan)) < 86400000).length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
