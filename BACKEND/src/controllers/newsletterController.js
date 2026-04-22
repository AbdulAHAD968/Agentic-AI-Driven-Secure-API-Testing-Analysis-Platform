const Newsletter = require("../models/Newsletter");
const sendEmail = require("../utils/email");
const { newsletterWelcomeEmail } = require("../templates/emailTemplates");



exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide an email address" });
    }

    
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ success: false, message: "This email is already subscribed to our newsletter" });
    }

    await Newsletter.create({ email });

    
    try {
      await sendEmail({
        email: email,
        subject: "Welcome to the Topic AI Newsletter",
        html: newsletterWelcomeEmail(),
      });
    } catch (err) {
      console.error("Newsletter Welcome Email Error:", err);
      
    }

    res.status(201).json({
      success: true,
      message: "Successfully subscribed to the Topic AI newsletter!",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Email already subscribed" });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
