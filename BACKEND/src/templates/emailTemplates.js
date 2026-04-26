/**
 * @file emailTemplates.js
 * @purpose Server-side HTML email templates for all transactional emails
 *   sent by the platform (verification, password reset, 2FA, contact, newsletter).
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * -----------------------------------------------
 * [Cross-Site Scripting (XSS) / HTML Injection]
 *   - All user-controlled string values (name, email, subject, message)
 *     are passed through escapeHtml() before being embedded in HTML.
 *   - This prevents HTML injection via email templates where a malicious
 *     actor could inject <script> tags or other HTML through form inputs.
 *   - The escapeHtml function encodes the 5 critical HTML entities:
 *     &, <, >, ", and ' — covering all standard injection vectors.
 *
 * [Reliance on Untrusted Inputs]
 *   - System-generated values (verification URLs, reset URLs, TOTP codes)
 *     are NOT escaped because they are server-generated, not user-supplied.
 *   - Only fields that originate from user input are escaped.
 */

/**
 * escapeHtml: Escape user-controlled strings before HTML embedding.
 *
 * [XSS / HTML Injection]
 * Converts the 5 HTML special characters to their safe entity equivalents:
 *   & → &amp;   (prevents entity injection)
 *   < → &lt;    (prevents tag opening)
 *   > → &gt;    (prevents tag closing)
 *   " → &quot;  (prevents attribute value breakout)
 *   ' → &#039;  (prevents single-quote attribute breakout)
 *
 * Non-string inputs (null, undefined, numbers) are safely converted to
 * string before escaping to avoid runtime errors.
 *
 * @param {*} str - The value to escape (typically a user-supplied string)
 * @returns {string} - HTML-safe version of the input
 */
const escapeHtml = (str) => {
  if (typeof str !== "string") return String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * getBaseTemplate: Wrap email content in a consistent branded HTML shell.
 *
 * The base template includes only inline styles (no external style sheets
 * that could be blocked by email clients) and a minimal, safe content structure.
 *
 * @param {string} content - Inner HTML content (must have user fields pre-escaped)
 * @returns {string}       - Complete HTML email string
 */
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
    .wrapper  { padding: 40px 20px; }
    .container {
      background-color: #ffffff;
      border: 1px solid #f0eee6;
      border-radius: 12px;
      margin: 0 auto;
      max-width: 600px;
      padding: 48px;
    }
    .header   { margin-bottom: 32px; }
    .logo     { color: #141413; font-family: 'Georgia', serif; font-size: 24px; font-weight: 600; text-decoration: none; }
    h1        { color: #141413; font-family: 'Georgia', serif; font-size: 28px; font-weight: 500; line-height: 1.2; margin: 0 0 24px 0; }
    p         { color: #5e5d59; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; }
    .button   { background-color: #c96442; border-radius: 8px; color: #faf9f5 !important; display: inline-block; font-size: 16px; font-weight: 500; padding: 14px 28px; text-decoration: none; margin-top: 12px; }
    .footer   { color: #87867f; font-size: 14px; margin-top: 32px; border-top: 1px solid #f0eee6; padding-top: 24px; }
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

/**
 * verificationEmail: Email verification link template.
 *
 * The url is a server-generated value — not user-supplied — so it is
 * embedded directly without escaping.
 *
 * @param {string} url - The verification URL (server-generated)
 * @returns {string}   - Complete HTML email
 */
exports.verificationEmail = (url) => getBaseTemplate(`
  <h1>Verify your email address</h1>
  <p>Thank you for starting your journey with Topic AI. To finalize your account setup, please verify your email address by clicking the button below.</p>
  <a href="${url}" class="button">Verify Email Address</a>
  <p style="margin-top: 24px; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
`);

/**
 * resetPasswordEmail: Password reset link template.
 *
 * The url is server-generated. Link expires in 10 minutes (enforced in User model).
 *
 * @param {string} url - The password reset URL (server-generated)
 * @returns {string}   - Complete HTML email
 */
exports.resetPasswordEmail = (url) => getBaseTemplate(`
  <h1>Reset your password</h1>
  <p>We received a request to reset your password for your Topic AI account. Click the button below to choose a new one.</p>
  <a href="${url}" class="button">Reset Password</a>
  <p style="margin-top: 24px; font-size: 14px;">This link will expire in 10 minutes. If you didn't request a password reset, please secure your account.</p>
`);

/**
 * twoFactorEmail: TOTP code delivery template.
 *
 * The code is server-generated by speakeasy — not user-supplied.
 *
 * @param {string} code - The TOTP code (server-generated)
 * @returns {string}    - Complete HTML email
 */
exports.twoFactorEmail = (code) => getBaseTemplate(`
  <h1>Your Two-Factor Authentication Code</h1>
  <p>Use the code below to complete your login to Topic AI.</p>
  <div style="background-color: #faf9f5; border: 1px solid #e8e6dc; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
    <span style="font-family: monospace; font-size: 32px; font-weight: 600; letter-spacing: 4px; color: #141413;">${code}</span>
  </div>
  <p style="font-size: 14px;">This code is valid for 5 minutes. Do not share it with anyone.</p>
`);

/**
 * contactNotificationEmail: Notify admin of a new contact form submission.
 *
 * [XSS / HTML Injection]
 * All four fields (name, email, subject, message) come from the user's
 * contact form submission and are escaped with escapeHtml() before
 * embedding in the HTML template.
 *
 * @param {Object} details - { name, email, subject, message } from the contact form
 * @returns {string}       - Complete HTML email with escaped user data
 */
exports.contactNotificationEmail = (details) => getBaseTemplate(`
  <h1>New Inquiry from ${escapeHtml(details.name)}</h1>
  <p>You have a new message from the contact form:</p>
  <div style="background-color: #faf9f5; border: 1px solid #e8e6dc; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p><strong>Name:</strong> ${escapeHtml(details.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(details.email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(details.subject)}</p>
    <p><strong>Message:</strong><br/>${escapeHtml(details.message)}</p>
  </div>
`);

/**
 * contactAcknowledgementEmail: Auto-reply to confirm receipt of a contact form.
 *
 * [XSS] The user's name is escaped before being interpolated.
 *
 * @param {string} name - The submitter's name (user-supplied, escaped)
 * @returns {string}    - Complete HTML email
 */
exports.contactAcknowledgementEmail = (name) => getBaseTemplate(`
  <h1>We've received your message</h1>
  <p>Hello ${escapeHtml(name)},</p>
  <p>Thank you for reaching out to Topic AI. This is a confirmation that we've received your message and our team will get back to you shortly.</p>
  <p>If you have any urgent matters, feel free to reply to this email.</p>
`);

/**
 * newsletterWelcomeEmail: Welcome email for new newsletter subscribers.
 *
 * Contains no user-controlled fields — no escaping required.
 *
 * @returns {string} - Complete HTML email
 */
exports.newsletterWelcomeEmail = () => getBaseTemplate(`
  <h1>Welcome to the Topic AI Newsletter</h1>
  <p>Thank you for subscribing! You're now on our list to receive the latest updates, deep dives into AI automation, and exclusive insights from our team.</p>
  <p>We promise to respect your inbox—only thoughtful, high-quality content will cross your path.</p>
  <p>Stay tuned for our next dispatch.</p>
`);

/**
 * contactReplyEmail: Admin reply to a specific contact inquiry.
 *
 * [XSS / HTML Injection]
 * Both the user's name (from the original inquiry) and the admin's reply
 * message are escaped. Even though the message is admin-authored, escaping
 * ensures that if an admin accidentally types HTML it isn't rendered as code.
 *
 * @param {string} name    - Inquiry submitter's name (escaped)
 * @param {string} message - Admin's reply text (escaped)
 * @returns {string}       - Complete HTML email
 */
exports.contactReplyEmail = (name, message) => getBaseTemplate(`
  <h1>Reply to your inquiry</h1>
  <p>Hello ${escapeHtml(name)},</p>
  <p>Our team has reviewed your message and would like to provide the following update:</p>
  <div style="background-color: #faf9f5; border: 1px solid #e8e6dc; border-radius: 8px; padding: 24px; margin: 24px 0; font-family: 'Newsreader', serif; font-size: 18px; line-height: 1.6; color: #141413; white-space: pre-wrap;">
    ${escapeHtml(message)}
  </div>
  <p>If you have any further questions, simply reply to this email and we'll be happy to assist.</p>
`);
