const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const slowdown = require("express-slow-down");
const customSanitizer = require("./utils/sanitizer");

// ... (skipping to middleware section)

app.use(express.json());
app.use(cookieParser());

// Data sanitization against NoSQL injection & XSS (Express 5 Compatible)
app.use(customSanitizer);

app.use(helmet());


app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    credentials: true,
  })
);


// Request timeout (ASVS V13.1 - Resource Exhaustion Protection)
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).send('Request Timeout');
  });
  next();
});

const speedLimiter = slowdown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: (hits) => hits * 100, // begin adding 100ms of delay per request above 50
});
app.use("/api", speedLimiter);

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100, 
});
app.use("/api", limiter);

// Stricter rate limiting for security-sensitive paths
const securityLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 requests per hour
  message: "Too many requests from this IP, please try again after an hour",
});
app.use("/api/v1/auth/login", securityLimiter);
app.use("/api/v1/projects/:id/scan", securityLimiter);


const auth = require("./routes/authRoutes");
const user = require("./routes/userRoutes");
const contact = require("./routes/contactRoutes");
const newsletter = require("./routes/newsletterRoutes");
const admin = require("./routes/adminRoutes");
const notifications = require("./routes/notificationRoutes");
const projects = require("./routes/projectRoutes");
const system = require("./routes/sysRoutes");

app.use("/api/v1/auth", auth);
app.use("/api/v1/user", user);
app.use("/api/v1/contact", contact);
app.use("/api/v1/newsletter", newsletter);
app.use("/api/v1/admin", admin);
app.use("/api/v1/notifications", notifications);
app.use("/api/v1/projects", projects);
app.use("/api/v1/system", system);


app.get("/", (req, res) => {
  res.send("DevSecOps AI Platform API is running...");
});


app.use((err, req, res, next) => {
  // API8:2023 - Security Misconfiguration Protection
  // Hide detailed error stacks in production
  if (process.env.NODE_ENV !== "development") {
    console.error(err.message); // Log message only
  } else {
    console.error(err.stack); // Full stack in dev
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV !== "development" 
      ? "An internal server error occurred. Our security team has been notified."
      : err.message || "Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
