const User = require("../models/User");
const Newsletter = require("../models/Newsletter");
const Contact = require("../models/Contact");
const sendEmail = require("../utils/email");
const { contactReplyEmail } = require("../templates/emailTemplates");



exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const totalSubscribers = await Newsletter.countDocuments();
    const totalInquiries = await Contact.countDocuments();
    const newInquiries = await Contact.countDocuments({ status: "new" });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        totalSubscribers,
        totalInquiries,
        newInquiries,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};





exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort("-createdAt");
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.updateUser = async (req, res) => {
  try {
    // Whitelist allowed fields to prevent mass assignment
    const allowedFields = { name: req.body.name, email: req.body.email, active: req.body.active };
    // Only admins can change roles
    if (req.body.role !== undefined) {
      allowedFields.role = req.body.role;
    }
    const user = await User.findByIdAndUpdate(req.params.id, allowedFields, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};





exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort("-subscribedAt");
    res.status(200).json({ success: true, data: subscribers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.sendNewsletter = async (req, res) => {
  try {
    const { subject, htmlContent } = req.body;

    if (!subject || !htmlContent) {
      return res.status(400).json({ success: false, message: "Subject and content are required." });
    }

    // Strip any raw <script> tags from admin-provided HTML to reduce injection risk
    const safeHtmlContent = htmlContent.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

    const subscribers = await Newsletter.find();

    const emailPromises = subscribers.map((sub) =>
      sendEmail({
        email: sub.email,
        subject: subject,
        html: safeHtmlContent,
      })
    );

    await Promise.all(emailPromises);

    res.status(200).json({
      success: true,
      message: `Newsletter sent to ${subscribers.length} subscribers.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};






exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Contact.find().sort("-createdAt");
    res.status(200).json({ success: true, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.updateInquiry = async (req, res) => {
  try {
    const inquiry = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
      new: true,
    });
    res.status(200).json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.deleteInquiry = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Inquiry deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.replyToInquiry = async (req, res) => {
  try {
    const { message } = req.body;
    const inquiry = await Contact.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    await sendEmail({
      email: inquiry.email,
      subject: `Re: ${inquiry.subject} - Topic AI Support`,
      html: contactReplyEmail(inquiry.name, message),
    });

    inquiry.status = "replied";
    await inquiry.save();

    res.status(200).json({ success: true, message: "Reply sent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { user: req.user.id };
    
    const logs = await require("../models/AuditLog").find(query)
      .populate("user", "name email")
      .sort("-createdAt")
      .limit(500); 
    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAuditStats = async (req, res) => {
  try {
    const AuditLog = require("../models/AuditLog");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = req.user.role === "admin" ? {} : { user: req.user.id };

    const [total, success, failure, todayCount] = await Promise.all([
      AuditLog.countDocuments(query),
      AuditLog.countDocuments({ ...query, status: "success" }),
      AuditLog.countDocuments({ ...query, status: "failure" }),
      AuditLog.countDocuments({ ...query, createdAt: { $gte: today } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        success,
        failure,
        todayCount,
        successRate: total > 0 ? ((success / total) * 100).toFixed(1) : 100
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAuditLog = async (req, res) => {
  try {
    const AuditLog = require("../models/AuditLog");
    const log = await AuditLog.findById(req.params.id);
    
    if (!log) {
      return res.status(404).json({ success: false, message: "Log not found" });
    }

    // Check ownership
    if (req.user.role !== "admin" && log.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this log" });
    }

    await log.deleteOne();
    res.status(200).json({ success: true, message: "Log entry deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.purgeAuditLogs = async (req, res) => {
  try {
    const AuditLog = require("../models/AuditLog");
    const { days } = req.query;
    
    let query = req.user.role === "admin" ? {} : { user: req.user.id };

    if (days && days !== "all") {
      // Strictly validate: must be a positive integer
      const parsedDays = parseInt(days, 10);
      if (!Number.isInteger(parsedDays) || parsedDays < 0 || String(parsedDays) !== String(days)) {
        return res.status(400).json({ success: false, message: "Invalid 'days' parameter. Must be a non-negative integer." });
      }
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parsedDays);
      query.createdAt = { $lt: cutoff };
    }

    const result = await AuditLog.deleteMany(query);
    
    res.status(200).json({ 
      success: true, 
      message: `${result.deletedCount} logs purged successfully` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getAllProjects = async (req, res) => {
  try {
    const Project = require("../models/Project");
    const Vulnerability = require("../models/Vulnerability");
    
    const projects = await Project.find()
      .populate("user", "name email")
      .select("-__v")
      .sort("-createdAt");
      
    // Calculate summaries
    const projectsWithSummary = await Promise.all(projects.map(async (project) => {
      const findings = await Vulnerability.find({ project: project._id });
      return {
        ...project.toObject(),
        findingsSummary: {
          critical: findings.filter(f => f.severity === "Critical").length,
          high: findings.filter(f => f.severity === "High").length,
          medium: findings.filter(f => f.severity === "Medium").length,
          low: findings.filter(f => f.severity === "Low").length,
          info: findings.filter(f => f.severity === "Info").length
        }
      };
    }));

    res.status(200).json({ success: true, data: projectsWithSummary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllVulnerabilities = async (req, res) => {
  try {
    const Vulnerability = require("../models/Vulnerability");
    const vulnerabilities = await Vulnerability.find()
      .populate({
        path: 'project',
        select: 'name user',
        populate: { path: 'user', select: 'name email' }
      })
      .select("-__v")
      .sort("-createdAt")
      .limit(1000); // Prevent massive payloads if many vulns

    res.status(200).json({ success: true, data: vulnerabilities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

