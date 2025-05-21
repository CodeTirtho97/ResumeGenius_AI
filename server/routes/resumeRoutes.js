const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
  parseResume,
  compareResumeWithJobDescription,
  getAiSuggestions,
  generateTailoredResume,
} = require("../controllers/resumeController");
const rateLimitService = require("../services/rateLimitService");

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".pdf");
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// ✅ Route to Handle Resume Upload & Parsing with Rate Limiting
router.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file || !req.body.jobDescription) {
      return res
        .status(400)
        .json({ error: "Resume file or job description missing!" });
    }

    // Get client IP as identifier
    const identifier = req.ip || req.connection.remoteAddress;

    // Check if user is rate limited
    if (rateLimitService.isRateLimited(identifier)) {
      const timeRemaining =
        rateLimitService.getCooldownTimeRemaining(identifier);
      return res.status(429).json({
        error: "Rate limit exceeded",
        message: `You can analyze another resume in ${timeRemaining} minutes.`,
        cooldownMinutes: timeRemaining,
      });
    }

    // Record this usage
    rateLimitService.recordUsage(identifier);

    console.log("✅ Resume Uploaded:", req.file.path);

    // ✅ Extract text & keywords from uploaded resume
    const resumeData = await parseResume(req.file.path);

    if (!resumeData || resumeData.error) {
      return res.status(500).json({ error: "Failed to extract resume data" });
    }

    // ✅ Compare Resume with Job Description
    const jobDescription = req.body.jobDescription;
    const comparisonResult = await compareResumeWithJobDescription(
      { body: { resumeData, jobDescription } },
      res
    );

    res.json(comparisonResult);
  } catch (error) {
    console.error("❌ Error analyzing resume:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ AI Suggestions Route with Improved Error Handling
router.post("/get-suggestions", async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;

    if (!resumeData || !jobDescription) {
      return res
        .status(400)
        .json({ error: "Resume data or job description missing!" });
    }

    // ✅ Generate AI Suggestions
    const aiSuggestions = await getAiSuggestions(resumeData, jobDescription);

    if (
      !aiSuggestions ||
      (Array.isArray(aiSuggestions) && aiSuggestions.length === 0)
    ) {
      return res
        .status(500)
        .json({ error: "Failed to generate AI suggestions" });
    }

    return res.json({ aiSuggestions });
  } catch (error) {
    console.error("❌ Error fetching AI suggestions:", error);

    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

// ✅ New Route: Tailor Resume based on Job Description
router.post("/tailor-resume", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res
        .status(400)
        .json({ error: "Resume text and job description are required!" });
    }

    // Get client IP as identifier
    const identifier = req.ip || req.connection.remoteAddress;

    // Check if user is rate limited (reusing the same rate limit as analyze-resume)
    if (rateLimitService.isRateLimited(identifier)) {
      const timeRemaining =
        rateLimitService.getCooldownTimeRemaining(identifier);
      return res.status(429).json({
        error: "Rate limit exceeded",
        message: `You can tailor another resume in ${timeRemaining} minutes.`,
        cooldownMinutes: timeRemaining,
      });
    }

    const tailoredResume = await generateTailoredResume(
      resumeText,
      jobDescription
    );

    // If there was an error generating tailored resume
    if (tailoredResume.error) {
      return res.status(500).json({ error: tailoredResume.error });
    }

    res.json(tailoredResume);
  } catch (error) {
    console.error("❌ Error tailoring resume:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Error handling middleware for Multer errors
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        message: "File size should not exceed 5MB.",
      });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
});

module.exports = router;
