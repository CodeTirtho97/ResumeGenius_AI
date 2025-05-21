const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const resumeRoutes = require("./routes/resumeRoutes");
const cleanupService = require("./services/cleanupService");
const cacheService = require("./services/cacheService");
const rateLimitService = require("./services/rateLimitService");
require("dotenv").config();

const app = express();

// ✅ Ensure required directories exist
const UPLOADS_DIR = path.join(__dirname, "uploads");
const CACHE_DIR = path.join(__dirname, "cache");
const DATA_DIR = path.join(__dirname, "data");

[UPLOADS_DIR, CACHE_DIR, DATA_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// ✅ Middleware Setup
app.use(cors()); // Allow cross-origin requests
app.use(express.json({ limit: "10mb" })); // Increase JSON limit for larger payloads
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Allow URL-encoded data with increased limit

// ✅ Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms - ${req.ip}`
    );
  });
  next();
});

// ✅ Health Check Route
app.get("/", (req, res) => {
  res.json({
    status: "✅ ResumeGenius AI Server is Running!",
    version: "1.1.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ✅ Register API Routes
app.use("/api/resume", resumeRoutes);

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  // Determine status code based on error type
  const statusCode = err.statusCode || 500;

  // Format error response
  const errorResponse = {
    error: err.message || "Internal Server Error",
    status: statusCode,
    timestamp: new Date().toISOString(),
  };

  // Add stack trace in development mode
  if (process.env.NODE_ENV !== "production") {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

// ✅ 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `The requested endpoint ${req.originalUrl} does not exist.`,
  });
});

// ✅ Schedule cleanup services
const setupScheduledTasks = () => {
  // Schedule file cleanup every 1 hour for files older than 24 hours
  cleanupService.scheduleCleanup(1, 24);
  console.log(
    "🕒 Scheduled file cleanup service (every 1 hour, deletes files older than 24 hours)"
  );

  // Schedule cache cleanup to run every hour
  setInterval(() => {
    console.log("🕒 Running scheduled cache cleanup");
    cacheService.clearExpiredCache();
  }, 60 * 60 * 1000); // Every hour

  // Schedule rate limit data cleanup
  setInterval(() => {
    console.log("🕒 Running scheduled rate limit cleanup");
    rateLimitService.cleanupExpiredRateLimits();
  }, 6 * 60 * 60 * 1000); // Every 6 hours
};

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
✅ ===================================================
🚀 ResumeGenius AI Server running on http://localhost:${PORT}
🔒 Environment: ${process.env.NODE_ENV || "development"}
📂 Storage: File retention set to 24 hours
🕒 Scheduled tasks initialized
⏱️ Rate limiting: 1 resume analysis per hour per user
✅ ===================================================
    `);

  // Start scheduled tasks
  setupScheduledTasks();
});
