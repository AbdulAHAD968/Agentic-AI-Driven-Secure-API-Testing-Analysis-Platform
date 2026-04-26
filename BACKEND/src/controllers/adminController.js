/**
 * @file adminController.js
 * @purpose Provides admin-only endpoints for user management, contact inquiry
 *   handling, newsletter dispatch, audit log viewing/purging, and
 *   cross-user project/vulnerability access.
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * -----------------------------------------------
 * [Missing or Incorrect Authorization / API5:2023 - Broken Function Level Authorization]
 *   - All functions in this file are called only through admin routes that
 *     are guarded by protect() + authorize("admin") middleware. Regular
 *     users cannot reach any of these endpoints.
 *
 * [API3:2023 - Broken Object Property Level Authorization / Mass Assignment]
 *   - updateUser whitelists only { name, email, active, role } — req.body
 *     is never passed directly to findByIdAndUpdate, preventing an attacker
 *     from injecting fields like oryId, password, or loginAttempts.
 *
 * [Integer Overflow / Input Validation]
 *   - purgeAuditLogs strictly validates the 'days' query parameter as a
 *     non-negative integer before using it in a date arithmetic operation.
 *
 * [XSS / Cross-Site Scripting]
 *   - sendNewsletter strips <script> tags from admin-provided HTML before
 *     sending to subscribers, reducing XSS risk in email clients.
 *
 * [Error Handling]
 *   - All functions use structured try-catch and return appropriate HTTP
 *     status codes without leaking stack traces to API consumers.
 */

const User       = require("../models/User");
const Newsletter = require("../models/Newsletter");
const Contact    = require("../models/Contact");
const sendEmail  = require("../utils/email");
const { contactReplyEmail } = require("../templates/emailTemplates");

// ─── User Management ──────────────────────────────────────────────────────────

/**
 * getStats: Return platform-wide statistics.
 *
 * [API5:2023 - Broken Function Level Authorization]
 * Only reachable by admins (enforced by route middleware).
 *
 * @returns {Object} 200 with totalUsers, verifiedUsers, totalSubscribers, etc.
 */
exports.getStats = async (req, res) => {
  try {
    const totalUsers       = await User.countDocuments();
    const verifiedUsers    = await User.countDocuments({ isEmailVerified: true });
    const totalSubscribers = await Newsletter.countDocuments();
    const totalInquiries   = await Contact.countDocuments();
    const newInquiries     = await Contact.countDocuments({ status: "new" });

    res.status(200).json({
      success: true,
      data: { totalUsers, verifiedUsers, totalSubscribers, totalInquiries, newInquiries },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * getUsers: List all registered users.
 *
 * [API5:2023 - Broken Function Level Authorization]
 * Admin-only. Route middleware enforces this before this function runs.
 *
 * @returns {Object} 200 with array of user documents (password excluded by schema)
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort("-createdAt");
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * updateUser: Update a specific user's allowed fields.
 *
 * [API3:2023 - Broken Object Property Level Authorization / Mass Assignment]
 * - req.body is NOT passed directly to Mongoose — only explicitly whitelisted
 *   fields (name, email, active) are extracted and used in the update.
 * - The 'role' field can only be changed by an admin (this function), and even
 *   then, only if req.body.role is explicitly provided.
 * - This prevents privilege escalation via mass assignment (e.g., setting
 *   oryId, loginAttempts, resetPasswordToken via the request body).
 *
 * @param {string} req.params.id  - Target user's MongoDB ObjectId
 * @param {Object} req.body       - May include name, email, active, role
 * @returns {Object} 200 with updated user, or 404 if not found
 */
exports.updateUser = async (req, res) => {
  try {
    // [Mass Assignment] Whitelist — only these fields may be updated via this endpoint
    const allowedFields = {
      name:   req.body.name,
      email:  req.body.email,
      active: req.body.active,
    };

    // [API5:2023] Role changes are intentional admin actions — include only if provided
    if (req.body.role !== undefined) {
      allowedFields.role = req.body.role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, allowedFields, {
      new:            true,
      runValidators:  true,
    });

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * deleteUser: Permanently delete a user account.
 *
 * [API5:2023 - Broken Function Level Authorization]
 * Admin-only action enforced by route middleware.
 *
 * @param {string} req.params.id - Target user's MongoDB ObjectId
 * @returns {Object} 200 success message
 */
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Newsletter ───────────────────────────────────────────────────────────────

/**
 * getSubscribers: List all newsletter subscribers.
 *
 * @returns {Object} 200 with array of subscriber documents
 */
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort("-subscribedAt");
    res.status(200).json({ success: true, data: subscribers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * sendNewsletter: Broadcast an HTML newsletter to all subscribers.
 *
 * [XSS / Cross-Site Scripting]
 * - Admin-provided HTML content is sanitized by stripping <script> blocks
 *   before it is sent to subscribers. This reduces XSS risk in email clients
 *   that render HTML, while preserving legitimate formatting markup.
 * - Input validation ensures both subject and htmlContent are provided.
 *
 * @param {string} req.body.subject     - Email subject line
 * @param {string} req.body.htmlContent - HTML email body (sanitized before send)
 * @returns {Object} 200 success or 400 if fields are missing
 */
exports.sendNewsletter = async (req, res) => {
  try {
    const { subject, htmlContent } = req.body;

    // [Input Validation] Both fields required
    if (!subject || !htmlContent) {
      return res.status(400).json({ success: false, message: "Subject and content are required." });
    }

    // [XSS] Strip <script> blocks from admin HTML to prevent email client XSS
    const safeHtmlContent = htmlContent.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");

    const subscribers = await Newsletter.find();

    const emailPromises = subscribers.map((sub) =>
      sendEmail({
        email:   sub.email,
        subject: subject,
        html:    safeHtmlContent,
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

// ─── Contact / Inquiries ──────────────────────────────────────────────────────

/**
 * getInquiries: List all contact form submissions.
 *
 * @returns {Object} 200 with array of Contact documents
 */
exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Contact.find().sort("-createdAt");
    res.status(200).json({ success: true, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * updateInquiry: Update the status of a contact inquiry.
 *
 * [API3:2023 - Mass Assignment]
 * Only the 'status' field is accepted from req.body — other fields
 * cannot be injected through this endpoint.
 *
 * @param {string} req.params.id   - Inquiry MongoDB ObjectId
 * @param {string} req.body.status - New status value
 * @returns {Object} 200 with updated inquiry
 */
exports.updateInquiry = async (req, res) => {
  try {
    // [Mass Assignment] Only 'status' is extracted — not the whole req.body
    const inquiry = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.status(200).json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * deleteInquiry: Permanently delete a contact inquiry.
 *
 * @param {string} req.params.id - Inquiry MongoDB ObjectId
 * @returns {Object} 200 success message
 */
exports.deleteInquiry = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Inquiry deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * replyToInquiry: Send an email reply to a contact inquiry submitter.
 *
 * [XSS / HTML Injection]
 * - The reply message is passed through contactReplyEmail() which applies
 *   escapeHtml() to all user-controlled fields before embedding them in HTML.
 *
 * @param {string} req.params.id    - Inquiry MongoDB ObjectId
 * @param {string} req.body.message - Admin's reply text
 * @returns {Object} 200 success or 404 if inquiry not found
 */
exports.replyToInquiry = async (req, res) => {
  try {
    const { message } = req.body;
    const inquiry = await Contact.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    await sendEmail({
      email:   inquiry.email,
      subject: `Re: ${inquiry.subject} - Topic AI Support`,
      // [XSS] HTML escaping applied inside contactReplyEmail template
      html:    contactReplyEmail(inquiry.name, message),
    });

    inquiry.status = "replied";
    await inquiry.save();

    res.status(200).json({ success: true, message: "Reply sent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────

/**
 * getAuditLogs: Retrieve audit log entries.
 *
 * [Missing or Incorrect Authorization]
 * Admins see all logs; regular users (if this route were ever exposed to them)
 * would see only their own. The 500-entry limit prevents unbounded data leakage.
 *
 * @returns {Object} 200 with array of AuditLog documents
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { user: req.user.id };

    const logs = await require("../models/AuditLog").find(query)
      .populate("user", "name email")
      .sort("-createdAt")
      .limit(500); // Prevent unbounded response payload

    res.status(200).json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * getAuditStats: Return summary statistics for audit logs.
 *
 * @returns {Object} 200 with total, success, failure counts and success rate
 */
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
      AuditLog.countDocuments({ ...query, createdAt: { $gte: today } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        success,
        failure,
        todayCount,
        successRate: total > 0 ? ((success / total) * 100).toFixed(1) : 100,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * deleteAuditLog: Delete a single audit log entry.
 *
 * [Missing or Incorrect Authorization / API1:2023 - BOLA]
 * Verifies ownership before deletion: non-admin users can only delete their
 * own log entries. Admins can delete any log entry.
 *
 * @param {string} req.params.id - AuditLog MongoDB ObjectId
 * @returns {Object} 200 success or 403/404 error
 */
exports.deleteAuditLog = async (req, res) => {
  try {
    const AuditLog = require("../models/AuditLog");
    const log = await AuditLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ success: false, message: "Log not found" });
    }

    // [API1:2023 - BOLA] Non-admins can only delete their own log entries
    if (req.user.role !== "admin" && log.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this log" });
    }

    await log.deleteOne();
    res.status(200).json({ success: true, message: "Log entry deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * purgeAuditLogs: Bulk delete audit logs older than a given number of days.
 *
 * [Integer Overflow / Input Validation / SQL Injection (NoSQL equivalent)]
 * - The 'days' query parameter is strictly validated: it must be a
 *   non-negative whole integer. Floating-point values, negative numbers,
 *   and non-numeric strings are all rejected with a 400 error.
 * - parseInt() result is compared to the original string to detect
 *   inputs like "7.5" that parseInt would silently truncate.
 * - Prevents integer overflow from being used to construct an
 *   arbitrary cutoff date.
 *
 * @param {string} req.query.days - Number of days to retain ("all" deletes everything)
 * @returns {Object} 200 with count of purged logs, or 400 on invalid input
 */
exports.purgeAuditLogs = async (req, res) => {
  try {
    const AuditLog = require("../models/AuditLog");
    const { days } = req.query;

    let query = req.user.role === "admin" ? {} : { user: req.user.id };

    if (days && days !== "all") {
      // [Integer Overflow / Input Validation] Strict non-negative integer check
      const parsedDays = parseInt(days, 10);
      if (!Number.isInteger(parsedDays) || parsedDays < 0 || String(parsedDays) !== String(days)) {
        return res.status(400).json({
          success: false,
          message: "Invalid 'days' parameter. Must be a non-negative integer.",
        });
      }
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parsedDays);
      query.createdAt = { $lt: cutoff };
    }

    const result = await AuditLog.deleteMany(query);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} logs purged successfully`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Platform-Wide Project/Vulnerability View (Admin) ────────────────────────

/**
 * getAllProjects: List all projects across all users with finding summaries.
 *
 * [API5:2023 - Broken Function Level Authorization]
 * Only admins reach this endpoint (enforced by route middleware).
 * Regular users cannot enumerate all users' projects via this function.
 *
 * @returns {Object} 200 with projects array including findingsSummary per project
 */
exports.getAllProjects = async (req, res) => {
  try {
    const Project       = require("../models/Project");
    const Vulnerability = require("../models/Vulnerability");

    const projects = await Project.find()
      .populate("user", "name email")
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
          info:     findings.filter(f => f.severity === "Info").length,
        },
      };
    }));

    res.status(200).json({ success: true, data: projectsWithSummary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * getAllVulnerabilities: List all vulnerability findings platform-wide.
 *
 * [API5:2023 - Broken Function Level Authorization]
 * Admin-only. Results are capped at 1000 entries to prevent unbounded responses.
 *
 * @returns {Object} 200 with vulnerability array (populated with project + user info)
 */
exports.getAllVulnerabilities = async (req, res) => {
  try {
    const Vulnerability = require("../models/Vulnerability");
    const vulnerabilities = await Vulnerability.find()
      .populate({
        path:     "project",
        select:   "name user",
        populate: { path: "user", select: "name email" },
      })
      .select("-__v")
      .sort("-createdAt")
      .limit(1000); // Prevent massive payloads

    res.status(200).json({ success: true, data: vulnerabilities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
