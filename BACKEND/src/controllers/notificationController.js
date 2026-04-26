/**
 * @file notificationController.js
 * @purpose Handles user notification reads/hides and admin notification
 *   management while enforcing object-level authorization.
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * [API1:2023 - Broken Object Level Authorization]
 *   - Users may only read or mutate notifications addressed to them or to "all".
 * [Error Handling]
 *   - Internal database errors are logged server-side and generic messages are
 *     returned to clients to avoid leaking implementation details.
 */

const Notification = require("../models/Notification");

const canAccessNotification = (notification, userId) =>
  notification.recipient === "all" || notification.recipient?.toString() === userId.toString();

const hasUserMarker = (markers, userId) =>
  markers.some((id) => id.toString() === userId.toString());

const sendServerError = (res, context, err) => {
  console.error(`${context}:`, err.message);
  return res.status(500).json({ success: false, message: "Notification request could not be completed." });
};

/**
 * getNotifications: Return notifications visible to the authenticated user.
 *
 * [API1:2023 - BOLA]
 * Query includes either broadcast notifications or records where recipient is
 * req.user.id, preventing users from listing another user's notification data.
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipient: "all" },
        { recipient: req.user.id },
      ],
      hiddenBy: { $ne: req.user.id },
    }).sort("-createdAt").limit(50);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    return sendServerError(res, "Get notifications failed", err);
  }
};

/**
 * hideNotification: Hide one notification for the current user.
 *
 * [API1:2023 - BOLA]
 * The notification must be addressed to the requester or broadcast to "all";
 * otherwise a 404 is returned so unauthorized IDs are not confirmed.
 */
exports.hideNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification || !canAccessNotification(notification, req.user.id)) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (!hasUserMarker(notification.hiddenBy, req.user.id)) {
      notification.hiddenBy.push(req.user.id);
      await notification.save();
    }

    res.status(200).json({ success: true, message: "Notification removed from view" });
  } catch (err) {
    return sendServerError(res, "Hide notification failed", err);
  }
};

/**
 * markAsRead: Mark a notification as read by the current user.
 *
 * [API1:2023 - BOLA]
 * Uses the same recipient check as hideNotification to prevent cross-user
 * state changes on notification objects.
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification || !canAccessNotification(notification, req.user.id)) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (!hasUserMarker(notification.readBy, req.user.id)) {
      notification.readBy.push(req.user.id);
      await notification.save();
    }

    res.status(200).json({ success: true });
  } catch (err) {
    return sendServerError(res, "Mark notification read failed", err);
  }
};

/**
 * adminCreateNotification: Create a broadcast or targeted notification.
 *
 * [API5:2023 - Broken Function Level Authorization]
 * This function is mounted only behind admin RBAC in adminRoutes.
 */
exports.adminCreateNotification = async (req, res) => {
  try {
    const { title, message, type, recipient } = req.body;

    const notification = await Notification.create({
      title,
      message,
      type: type || "info",
      recipient: recipient || "all",
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    return sendServerError(res, "Admin create notification failed", err);
  }
};

exports.adminGetNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort("-createdAt");
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    return sendServerError(res, "Admin get notifications failed", err);
  }
};

exports.adminDeleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Notification removed" });
  } catch (err) {
    return sendServerError(res, "Admin delete notification failed", err);
  }
};

exports.adminPurgeNotifications = async (req, res) => {
  try {
    const { days } = req.query;
    let query = {};

    if (days && days !== "all") {
      if (!/^\d+$/.test(days)) {
        return res.status(400).json({ success: false, message: "Invalid purge window" });
      }

      // [Input Validation / API4:2023] Bounds avoid accidental mass deletion and resource abuse.
      const purgeDays = Number.parseInt(days, 10);
      if (purgeDays < 1 || purgeDays > 365) {
        return res.status(400).json({ success: false, message: "Invalid purge window" });
      }

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - purgeDays);
      query.createdAt = { $lt: cutoff };
    } else if (days !== "all") {
      return res.status(400).json({ success: false, message: "Invalid purge window" });
    }

    // [Authorization / Audit Data Protection] Route-level admin RBAC must guard this destructive operation.
    const result = await Notification.deleteMany(query);
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications purged successfully`,
    });
  } catch (err) {
    return sendServerError(res, "Admin purge notifications failed", err);
  }
};
