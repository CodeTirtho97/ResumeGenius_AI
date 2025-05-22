const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
  parseResume,
  compareResumeWithJobDescription,
  getAiSuggestions,
  generateTailoredResume,
  extractTextFromPDF,
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

// ✅ UPDATED: Resume Analysis with relaxed rate limiting (5 per hour)
router.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file || !req.body.jobDescription) {
      return res
        .status(400)
        .json({ error: "Resume file or job description missing!" });
    }

    const identifier = req.ip || req.connection.remoteAddress;

    // Check rate limit for analysis (5 per hour)
    if (rateLimitService.isRateLimited(identifier, "analyze")) {
      const timeRemaining = rateLimitService.getCooldownTimeRemaining(
        identifier,
        "analyze"
      );
      const stats = rateLimitService.getUsageStats(identifier);

      return res.status(429).json({
        error: "Resume analysis limit reached",
        message: `You've analyzed ${stats.analyze.currentHour}/${stats.analyze.limit} resumes this hour. Next analysis available in ${timeRemaining} minutes.`,
        cooldownMinutes: timeRemaining,
        operation: "analyze",
        usageStats: stats,
      });
    }

    console.log("✅ Resume Uploaded:", req.file.path);

    // Extract text & keywords from uploaded resume
    const resumeData = await parseResume(req.file.path);

    if (!resumeData || resumeData.error) {
      return res.status(500).json({ error: "Failed to extract resume data" });
    }

    // Record analysis usage (no OpenAI API used here)
    rateLimitService.recordUsage(identifier, "analyze");

    // Compare Resume with Job Description
    const jobDescription = req.body.jobDescription;
    const comparisonResult = await compareResumeWithJobDescription(
      { body: { resumeData, jobDescription } },
      res
    );

    const currentStats = rateLimitService.getUsageStats(identifier);

    res.json({
      ...comparisonResult,
      rateLimitStatus: {
        analyze: {
          used: currentStats.analyze.currentHour,
          limit: currentStats.analyze.limit,
          remaining: currentStats.analyze.remaining,
          timeUntilReset: rateLimitService.getCooldownTimeRemaining(
            identifier,
            "analyze"
          ),
        },
        tailor: {
          used: currentStats.tailor.currentHour,
          limit: currentStats.tailor.limit,
          remaining: currentStats.tailor.remaining,
          timeUntilReset: rateLimitService.getCooldownTimeRemaining(
            identifier,
            "tailor"
          ),
        },
        suggestions: {
          used: currentStats.suggestions.currentHour,
          limit: currentStats.suggestions.limit,
          remaining: currentStats.suggestions.remaining,
          timeUntilReset: rateLimitService.getCooldownTimeRemaining(
            identifier,
            "suggestions"
          ),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error analyzing resume:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ UPDATED: AI Suggestions with strict rate limiting (2 per hour)
router.post("/get-suggestions", async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;

    if (!resumeData || !jobDescription) {
      return res
        .status(400)
        .json({ error: "Resume data or job description missing!" });
    }

    const identifier = req.ip || req.connection.remoteAddress;

    // Check rate limit for AI suggestions (2 per hour - expensive OpenAI calls)
    if (rateLimitService.isRateLimited(identifier, "suggestions")) {
      const timeRemaining = rateLimitService.getCooldownTimeRemaining(
        identifier,
        "suggestions"
      );
      const stats = rateLimitService.getUsageStats(identifier);

      return res.status(429).json({
        error: "AI suggestions limit reached",
        message: `You've used ${stats.suggestions.currentHour}/${stats.suggestions.limit} AI suggestion requests this hour. Next request available in ${timeRemaining} minutes.`,
        cooldownMinutes: timeRemaining,
        operation: "suggestions",
        usageStats: stats,
      });
    }

    // Generate AI Suggestions (OpenAI API call)
    const aiSuggestions = await getAiSuggestions(resumeData, jobDescription);

    if (
      !aiSuggestions ||
      (Array.isArray(aiSuggestions) && aiSuggestions.length === 0)
    ) {
      return res
        .status(500)
        .json({ error: "Failed to generate AI suggestions" });
    }

    // Record AI usage AFTER successful API call
    rateLimitService.recordUsage(identifier, "suggestions");

    const currentStats = rateLimitService.getUsageStats(identifier);

    return res.json({
      aiSuggestions,
      rateLimitStatus: {
        analyze: {
          used: currentStats.analyze.currentHour,
          limit: currentStats.analyze.limit,
          remaining: currentStats.analyze.remaining,
        },
        tailor: {
          used: currentStats.tailor.currentHour,
          limit: currentStats.tailor.limit,
          remaining: currentStats.tailor.remaining,
        },
        suggestions: {
          used: currentStats.suggestions.currentHour,
          limit: currentStats.suggestions.limit,
          remaining: currentStats.suggestions.remaining,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching AI suggestions:", error);

    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

// ✅ UPDATED: Tailored Resume with strict rate limiting (2 per hour)
router.post(
  "/tailor-resume-with-file",
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file || !req.body.jobDescription) {
        return res
          .status(400)
          .json({ error: "Resume file and job description are required!" });
      }

      const identifier = req.ip || req.connection.remoteAddress;

      // Check rate limit for tailoring (2 per hour - expensive OpenAI calls)
      if (rateLimitService.isRateLimited(identifier, "tailor")) {
        const timeRemaining = rateLimitService.getCooldownTimeRemaining(
          identifier,
          "tailor"
        );
        const stats = rateLimitService.getUsageStats(identifier);

        return res.status(429).json({
          error: "Resume tailoring limit reached",
          message: `You've used ${stats.tailor.currentHour}/${stats.tailor.limit} tailoring requests this hour. Next request available in ${timeRemaining} minutes.`,
          cooldownMinutes: timeRemaining,
          operation: "tailor",
          usageStats: stats,
        });
      }

      // Extract text from uploaded resume
      console.log("✅ Resume Uploaded for tailoring:", req.file.path);

      const resumeText = await extractTextFromPDF(req.file.path);
      if (!resumeText) {
        return res
          .status(500)
          .json({ error: "Failed to extract text from PDF" });
      }

      const jobDescription = req.body.jobDescription;

      // Generate tailored resume bullet points (OpenAI API call)
      const tailoredResume = await generateTailoredResume(
        resumeText,
        jobDescription
      );

      // If there was an error generating tailored resume
      if (tailoredResume.error) {
        return res.status(500).json({ error: tailoredResume.error });
      }

      // Record tailoring usage AFTER successful API call
      rateLimitService.recordUsage(identifier, "tailor");

      const currentStats = rateLimitService.getUsageStats(identifier);

      res.json({
        ...tailoredResume,
        rateLimitStatus: {
          analyze: {
            used: currentStats.analyze.currentHour,
            limit: currentStats.analyze.limit,
            remaining: currentStats.analyze.remaining,
          },
          tailor: {
            used: currentStats.tailor.currentHour,
            limit: currentStats.tailor.limit,
            remaining: currentStats.tailor.remaining,
          },
          suggestions: {
            used: currentStats.suggestions.currentHour,
            limit: currentStats.suggestions.limit,
            remaining: currentStats.suggestions.remaining,
          },
        },
      });
    } catch (error) {
      console.error("❌ Error tailoring resume with file:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// ✅ UPDATED: Rate limit status endpoint with detailed information
router.get("/rate-limit-status", (req, res) => {
  try {
    const identifier = req.ip || req.connection.remoteAddress;
    const stats = rateLimitService.getUsageStats(identifier);

    const status = {
      analyze: {
        used: stats.analyze.currentHour,
        limit: stats.analyze.limit,
        remaining: stats.analyze.remaining,
        isLimited: rateLimitService.isRateLimited(identifier, "analyze"),
        timeUntilReset: rateLimitService.getCooldownTimeRemaining(
          identifier,
          "analyze"
        ),
        description: "Resume analysis (PDF parsing & keyword extraction)",
      },
      tailor: {
        used: stats.tailor.currentHour,
        limit: stats.tailor.limit,
        remaining: stats.tailor.remaining,
        isLimited: rateLimitService.isRateLimited(identifier, "tailor"),
        timeUntilReset: rateLimitService.getCooldownTimeRemaining(
          identifier,
          "tailor"
        ),
        description: "AI-powered resume tailoring (OpenAI API)",
      },
      suggestions: {
        used: stats.suggestions.currentHour,
        limit: stats.suggestions.limit,
        remaining: stats.suggestions.remaining,
        isLimited: rateLimitService.isRateLimited(identifier, "suggestions"),
        timeUntilReset: rateLimitService.getCooldownTimeRemaining(
          identifier,
          "suggestions"
        ),
        description: "AI-powered improvement suggestions (OpenAI API)",
      },
      summary: {
        totalAnalyses: stats.analyze.currentHour,
        totalAICalls: stats.tailor.currentHour + stats.suggestions.currentHour,
        maxAnalysesPerHour: 5,
        maxAICallsPerHour: 4, // 2 tailor + 2 suggestions
      },
    };

    res.json(status);
  } catch (error) {
    console.error("❌ Error getting rate limit status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Original tailor resume endpoint (for backward compatibility)
router.post("/tailor-resume", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res
        .status(400)
        .json({ error: "Resume text and job description are required!" });
    }

    const identifier = req.ip || req.connection.remoteAddress;

    // Check rate limit for tailoring
    if (rateLimitService.isRateLimited(identifier, "tailor")) {
      const timeRemaining = rateLimitService.getCooldownTimeRemaining(
        identifier,
        "tailor"
      );
      return res.status(429).json({
        error: "Tailoring rate limit exceeded",
        message: `You can tailor another resume in ${timeRemaining} minutes.`,
        cooldownMinutes: timeRemaining,
        operation: "tailor",
      });
    }

    const tailoredResume = await generateTailoredResume(
      resumeText,
      jobDescription
    );

    // Record usage after successful completion
    rateLimitService.recordUsage(identifier, "tailor");

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
