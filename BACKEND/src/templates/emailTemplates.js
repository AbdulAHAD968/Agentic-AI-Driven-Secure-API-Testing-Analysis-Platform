const getBaseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      background-color: #f5f4ed;
      color: #141413;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      padding: 40px 20px;
    }
    .container {
      background-color: #ffffff;
      border: 1px solid #f0eee6;
      border-radius: 12px;
      margin: 0 auto;
      max-width: 600px;
      padding: 48px;
    }
    .header {
      margin-bottom: 32px;
    }
    .logo {
      color: #141413;
      font-family: 'Georgia', serif;
      font-size: 24px;
      font-weight: 600;
      text-decoration: none;
    }
    h1 {
      color: #141413;
      font-family: 'Georgia', serif;
      font-size: 28px;
      font-weight: 500;
      line-height: 1.2;
      margin: 0 0 24px 0;
    }
    p {
      color: #5e5d59;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    .button {
      background-color: #c96442;
      border-radius: 8px;
      color: #faf9f5 !important;
      display: inline-block;
      font-size: 16px;
      font-weight: 500;
      padding: 14px 28px;
      text-decoration: none;
      margin-top: 12px;
    }
    .footer {
      color: #87867f;
      font-size: 14px;
      margin-top: 32px;
      border-top: 1px solid #f0eee6;
      padding-top: 24px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="#" class="logo">Topic AI</a>
      </div>
      ${content}
      <div class="footer">
        <p>You received this email because it's required for your account security and functionality.</p>
        <p>&copy; 2026 Topic AI. Intelligent Automation.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

exports.verificationEmail = (url) => getBaseTemplate(`
  <h1>Verify your email address</h1>
  <p>Thank you for starting your journey with Topic AI. To finalize your account setup, please verify your email address by clicking the button below.</p>
  <a href="${url}" class="button">Verify Email Address</a>
  <p style="margin-top: 24px; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
`);

exports.resetPasswordEmail = (url) => getBaseTemplate(`
  <h1>Reset your password</h1>
  <p>We received a request to reset your password for your Topic AI account. Click the button below to choose a new one.</p>
  <a href="${url}" class="button">Reset Password</a>
  <p style="margin-top: 24px; font-size: 14px;">This link will expire in 10 minutes. If you didn't request a password reset, please secure your account.</p>
`);

exports.twoFactorEmail = (code) => getBaseTemplate(`
  <h1>Your Two-Factor Authentication Code</h1>
  <p>Use the code below to complete your login to Topic AI.</p>
  <div style="background-color: #faf9f5; border: 1px solid #e8e6dc; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
    <span style="font-family: monospace; font-size: 32px; font-weight: 600; letter-spacing: 4px; color: #141413;">${code}</span>
  </div>
  <p style="font-size: 14px;">This code is valid for 5 minutes. Do not share it with anyone.</p>
`);

exports.contactNotificationEmail = (details) => getBaseTemplate(`
  <h1>New Inquiry from ${details.name}</h1>
  <p>You have a new message from the contact form:</p>
  <div style="background-color: #faf9f5; border: 1px solid #e8e6dc; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p><strong>Name:</strong> ${details.name}</p>
    <p><strong>Email:</strong> ${details.email}</p>
    <p><strong>Subject:</strong> ${details.subject}</p>
    <p><strong>Message:</strong><br/>${details.message}</p>
  </div>
`);

exports.contactAcknowledgementEmail = (name) => getBaseTemplate(`
  <h1>We've received your message</h1>
  <p>Hello ${name},</p>
  <p>Thank you for reaching out to Topic AI. This is a confirmation that we've received your message and our team will get back to you shortly.</p>
  <p>If you have any urgent matters, feel free to reply to this email.</p>
`);

exports.newsletterWelcomeEmail = () => getBaseTemplate(`
  <h1>Welcome to the Topic AI Newsletter</h1>
  <p>Thank you for subscribing! You're now on our list to receive the latest updates, deep dives into AI automation, and exclusive insights from our team.</p>
  <p>We promise to respect your inbox—only thoughtful, high-quality content will cross your path.</p>
  <p>Stay tuned for our next dispatch.</p>
`);

exports.contactReplyEmail = (name, message) => getBaseTemplate(`
  <h1>Reply to your inquiry</h1>
  <p>Hello ${name},</p>
  <p>Our team has reviewed your message and would like to provide the following update:</p>
  <div style="background-color: #faf9f5; border: 1px solid #e8e6dc; border-radius: 8px; padding: 24px; margin: 24px 0; font-family: 'Newsreader', serif; font-size: 18px; line-height: 1.6; color: #141413; white-space: pre-wrap;">
    ${message}
  </div>
  <p>If you have any further questions, simply reply to this email and we'll be happy to assist.</p>
`);
