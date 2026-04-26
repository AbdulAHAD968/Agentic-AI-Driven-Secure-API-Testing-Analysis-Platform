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


connectDB();

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cookieParser());





app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL],
    credentials: true,
  })
);


app.use((req, res, next) => {
  next();
});




const auth = require("./routes/authRoutes");
const user = require("./routes/userRoutes");
const contact = require("./routes/contactRoutes");
const newsletter = require("./routes/newsletterRoutes");
const admin = require("./routes/adminRoutes");
const notifications = require("./routes/notificationRoutes");
const projects = require("./routes/projectRoutes");
const system = require("./routes/sysRoutes");
const audit = require("./routes/auditRoutes");

app.use("/api/v1/auth", auth);
app.use("/api/v1/user", user);
app.use("/api/v1/contact", contact);
app.use("/api/v1/newsletter", newsletter);
app.use("/api/v1/admin", admin);
app.use("/api/v1/notifications", notifications);
app.use("/api/v1/projects", projects);
app.use("/api/v1/system", system);
app.use("/api/v1/audit", audit);

app.get("/", (req, res) => {
  res.send("DevSecOps AI Platform API is running...");
});

app.use((err, req, res, next) => {
  // Handle multer file size errors cleanly
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
    message: statusCode === 500 && process.env.NODE_ENV !== "development" 
      ? "An internal server error occurred. Our security team has been notified."
      : err.message || "Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
