const express = require("express");
const multer = require("multer");
const { parseResume, compareResumeWithJobDescription, getAiSuggestions } = require("../controllers/resumeController");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // ✅ Save uploaded PDFs in "uploads/"

// ✅ Route to Handle Resume Upload & Parsing
router.post("/analyze-resume", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file || !req.body.jobDescription) {
            return res.status(400).json({ error: "Resume file or job description missing!" });
        }

        console.log("✅ Resume Uploaded:", req.file.path);

        // ✅ Extract text & keywords from uploaded resume
        const resumeData = await parseResume(req.file.path);

        if (!resumeData || resumeData.error) {
            return res.status(500).json({ error: "Failed to extract resume data" });
        }

        // ✅ Compare Resume with Job Description
        const jobDescription = req.body.jobDescription;
        const comparisonResult = await compareResumeWithJobDescription({ body: { resumeData, jobDescription } }, res);

        res.json(comparisonResult);
    } catch (error) {
        console.error("❌ Error analyzing resume:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ AI Suggestions Route - Ensure Single Response
router.post("/get-suggestions", async (req, res) => {
    try {
        const { resumeData, jobDescription } = req.body;

        if (!resumeData || !jobDescription) {
            return res.status(400).json({ error: "Resume data or job description missing!" }); // ✅ Added "return"
        }

        // ✅ Generate AI Suggestions (Ensure response is sent once)
        const aiSuggestions = await getAiSuggestions(resumeData, jobDescription);

        return res.json({ aiSuggestions }); // ✅ Ensure a single response
    } catch (error) {
        console.error("❌ Error fetching AI suggestions:", error);

        if (!res.headersSent) {  // ✅ Prevent multiple responses
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

module.exports = router;