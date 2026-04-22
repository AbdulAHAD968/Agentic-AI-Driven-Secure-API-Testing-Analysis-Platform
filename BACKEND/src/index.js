const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const slowdown = require("express-slow-down");
const connectDB = require("./config/db");
const customSanitizer = require("./utils/sanitizer");

dotenv.config();

// Connect Database
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

// Temporary disablement to isolate Express 5 conflict
// app.use(customSanitizer);
// app.use(helmet());

app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    credentials: true,
  })
);

// Basic functional middleware
app.use((req, res, next) => {
  next();
});

// Stricter rate limiting for security-sensitive paths (Temporarily disabled)
// const securityLimiter = rateLimit({ ... });

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
  if (process.env.NODE_ENV !== "development") {
    console.error(err.message);
  } else {
    console.error(err.stack);
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
