const Notification = require("../models/Notification");



exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipient: "all" },
        { recipient: req.user.id }
      ],
      hiddenBy: { $ne: req.user.id }
    }).sort("-createdAt").limit(50);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.hideNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (!notification.hiddenBy.includes(req.user.id)) {
      notification.hiddenBy.push(req.user.id);
      await notification.save();
    }

    res.status(200).json({ success: true, message: "Notification removed from view" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (!notification.readBy.includes(req.user.id)) {
      notification.readBy.push(req.user.id);
      await notification.save();
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



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
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.adminGetNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort("-createdAt");
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.adminDeleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Notification removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
