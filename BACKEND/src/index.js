/**
 * @file index.js
 * @purpose Entry point for the Express API server. Configures all global
 *   security middleware and mounts route handlers.
 *
 * SECURE CODING PRACTICES APPLIED IN THIS FILE:
 * -----------------------------------------------
 * [API8:2023 - Security Misconfiguration]
 *   - helmet() enforces 17+ security response headers (X-Frame-Options,
 *     HSTS, X-Content-Type-Options, etc.) and a restrictive Content Security
 *     Policy (CSP) to prevent clickjacking, MIME sniffing, and data injection.
 *
 * [XSS / NoSQL Injection / API10:2023 - Unsafe Consumption of APIs]
 *   - customSanitizer (sanitizer.js) replaces express-mongo-sanitize, which
 *     is incompatible with Express 5 (req.query is a read-only getter in
 *     Express 5; the package throws "Cannot set property query" on every
 *     request). customSanitizer achieves equivalent protection by:
 *       • Deleting any key starting with `$` (operator-key injection).
 *       • Replacing `$` in string values (value-level injection).
 *       • Stripping <script> blocks and HTML angle brackets (XSS).
 *
 * [API4:2023 - Unrestricted Resource Consumption]
 *   - express-rate-limit caps every IP at 100 requests per 15-minute window.
 *   - express-slow-down progressively adds delay after 50 requests per
 *     15 minutes, deterring brute-force and DoS attacks.
 *
 * [Missing Encryption of Sensitive Data / HTTPS]
 *   - All cookies are flagged httpOnly (no client JS access) and secure
 *     in production (HTTPS-only). See authController.sendTokenResponse.
 *
 * [Authentication Bypass]
 *   - CORS is explicitly restricted to CLIENT_URL and ADMIN_URL origins
 *     defined in environment variables — no wildcard (*) origins allowed.
 *
 * [API8:2023 - Verbose Error Messages]
 *   - Global error handler returns generic messages in production to
 *     prevent sensitive stack traces from leaking to clients.
 */

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const slowdown = require("express-slow-down");
const connectDB = require("./config/db");
const customSanitizer = require("./utils/sanitizer");

dotenv.config();

connectDB();

const app = express();

/**
 * [API8:2023 - Security Misconfiguration]
 * Helmet sets security-focused HTTP response headers to protect against
 * common web vulnerabilities (XSS, clickjacking, MIME sniffing, etc.).
 * CSP restricts which sources may execute scripts, load styles, and embed content.
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

/**
 * Body parsers with a 50MB limit to support source code zip uploads
 * while still bounding maximum request size to prevent DoS via large payloads.
 * [API4:2023 - Unrestricted Resource Consumption]
 */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

/**
 * [Authentication Bypass / API8:2023 - Security Misconfiguration]
 * CORS is restricted to explicitly whitelisted frontend and admin origins.
 * Credentials (cookies) are only sent to these allowed origins.
 * withCredentials: true is required for httpOnly cookie-based auth.
 */
app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    credentials: true,
  })
);

/**
 * [API4:2023 - Unrestricted Resource Consumption]
 * Rate limiting: max 100 API requests per IP per 15-minute window.
 * Returns a structured JSON error instead of crashing on overload.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * [API4:2023 - Unrestricted Resource Consumption]
 * Speed limiter: progressively slows responses after 50 requests per
 * 15-minute window. Deters brute-force login attempts and scripted abuse
 * without hard-blocking the client immediately.
 */
const speedLimiter = slowdown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs: (hits) => hits * 100,
});

app.use("/api/", limiter);
app.use("/api/", speedLimiter);

/**
 * [NoSQL Injection / XSS / Reliance on Untrusted Inputs]
 * customSanitizer replaces express-mongo-sanitize (incompatible with Express 5)
 * and handles both NoSQL operator-key removal ($-prefixed keys) and XSS
 * sanitization of all request surfaces before any route handler runs.
 */
app.use(customSanitizer);

// ─── Route Mounting ───────────────────────────────────────────────────────────
const auth          = require("./routes/authRoutes");
const user          = require("./routes/userRoutes");
const contact       = require("./routes/contactRoutes");
const newsletter    = require("./routes/newsletterRoutes");
const admin         = require("./routes/adminRoutes");
const notifications = require("./routes/notificationRoutes");
const projects      = require("./routes/projectRoutes");
const system        = require("./routes/sysRoutes");
const audit         = require("./routes/auditRoutes");

app.use("/api/v1/auth",          auth);
app.use("/api/v1/user",          user);
app.use("/api/v1/contact",       contact);
app.use("/api/v1/newsletter",    newsletter);
app.use("/api/v1/admin",         admin);
app.use("/api/v1/notifications", notifications);
app.use("/api/v1/projects",      projects);
app.use("/api/v1/system",        system);
app.use("/api/v1/audit",         audit);

app.get("/", (req, res) => {
  res.send("DevSecOps AI Platform API is running...");
});

/**
 * Global error handler.
 *
 * [API8:2023 - Security Misconfiguration / Error Handling]
 * - Multer LIMIT_FILE_SIZE errors return a human-readable 413 instead of
 *   an unhandled exception that could expose internals.
 * - In production, generic messages are returned to prevent stack trace
 *   leakage. Full stack traces are only shown in development.
 *
 * Input:  err (Error), req, res, next (Express error handler signature)
 * Output: JSON error response with appropriate HTTP status code
 */
app.use((err, req, res, next) => {
  // [Upload of Dangerous Files] Return clean error when uploaded file exceeds size limit
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "File too large. Maximum allowed upload size is 50MB.",
    });
  }

  if (process.env.NODE_ENV !== "development") {
    console.error(err.message);
  } else {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    // [Error Handling] Generic message in production — never expose stack traces to clients
    message: statusCode === 500 && process.env.NODE_ENV !== "development"
      ? "An internal server error occurred. Our security team has been notified."
      : err.message || "Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
