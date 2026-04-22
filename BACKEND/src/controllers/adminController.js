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
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
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
    const subscribers = await Newsletter.find();

    const emailPromises = subscribers.map((sub) =>
      sendEmail({
        email: sub.email,
        subject: subject,
        html: htmlContent,
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
