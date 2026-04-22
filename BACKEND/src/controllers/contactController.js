const Contact = require("../models/Contact");
const sendEmail = require("../utils/email");
const { contactNotificationEmail, contactAcknowledgementEmail } = require("../templates/emailTemplates");



exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Please provide all details" });
    }

    
    await Contact.create({ name, email, subject, message });

    
    await sendEmail({
      email: process.env.SMTP_EMAIL, 
      subject: `[Contact Form] ${subject}`,
      html: contactNotificationEmail({ name, email, subject, message }),
    });

    
    await sendEmail({
      email: email,
      subject: "We've received your message - Topic AI",
      html: contactAcknowledgementEmail(name),
    });

    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon.",
    });
  } catch (err) {
    console.error("Contact Form Error:", err);
    res.status(500).json({ success: false, message: "Server Error. Please try again later." });
  }
};
