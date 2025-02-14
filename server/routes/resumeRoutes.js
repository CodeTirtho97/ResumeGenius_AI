const express = require("express");
const multer = require("multer");
const { parseResume, compareResumeWithJobDescription } = require("../controllers/resumeController");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Store uploaded PDFs in 'uploads/'

// ✅ Route to Handle Resume Upload & Parsing
router.post("/upload", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("✅ Resume Uploaded:", req.file.path);

        const resumeData = await parseResume(req.file.path);
        
        if (!resumeData || resumeData.error) {
            return res.status(500).json({ error: "Failed to extract resume data" });
        }

        res.json({ extractedData: resumeData });
    } catch (error) {
        console.error("❌ Error uploading resume:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Route to Compare Resume with Job Description
router.post("/compare", async (req, res) => {
    try {
        const { resumeData, jobDescription } = req.body;

        if (!resumeData || !jobDescription) {
            return res.status(400).json({ error: "Resume data or job description missing!" });
        }

        console.log("✅ Comparing Resume with Job Description...");
        compareResumeWithJobDescription(req, res);
    } catch (error) {
        console.error("❌ Error comparing resume with job description:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;