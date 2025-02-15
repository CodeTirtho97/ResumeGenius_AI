const fs = require("fs");
const pdfParse = require("pdf-parse");
const natural = require("natural");
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // ✅ Ensure this is set in `.env`
});

// ✅ Extract Text from PDF
const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        return pdfData.text.replace(/\s{2,}/g, " ").trim();  // Removes extra spaces
    } catch (err) {
        console.error("❌ Error extracting text from PDF:", err);
        return null;
    }
};

// ✅ Extract Relevant Keywords from Resume
const extractRelevantKeywords = (text) => {
    try {
        text = text.replace(/\s+/g, " ").trim();

        // Email & Phone Extraction
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/g;

        const email = text.match(emailRegex)?.[0] || "Not Found";
        const phone = text.match(phoneRegex)?.[0] || "Not Found";

        // Keyword Lists
        const skillsKeywords = ["Python", "Java", "JavaScript", "C\\+\\+", "C#", "SQL", "MongoDB", "SAP", "AWS", "Cloud Computing", "Docker", "Kubernetes", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Flask", "Django", "React", "Node.js"];
        const certificationsKeywords = ["AWS Certified", "Google Cloud Certified", "PMP", "HackerRank", "Coursera"];
        const jobTitles = ["Analyst", "Engineer", "Developer", "Consultant", "Manager", "Intern"];
        const educationKeywords = ["Bachelor", "Master", "B.Tech", "M.Tech", "PhD", "GPA"];

        // Extract Keywords
        const extractedSkills = skillsKeywords.filter(skill => new RegExp(`\\b${skill}\\b`, "gi").test(text));
        const extractedCertifications = certificationsKeywords.filter(cert => new RegExp(`\\b${cert}\\b`, "gi").test(text));
        const extractedJobTitles = jobTitles.filter(title => new RegExp(`\\b${title}\\b`, "gi").test(text));
        const extractedEducation = educationKeywords.filter(edu => new RegExp(`\\b${edu}\\b`, "gi").test(text));

        return { email, phone, extractedSkills, extractedCertifications, extractedJobTitles, extractedEducation };

    } catch (err) {
        console.error("❌ Error in extractRelevantKeywords():", err);
        return { error: "Error extracting keywords" };
    }
};

// ✅ Extract Job Description Keywords
const extractJobDescriptionKeywords = (text) => {
    try {
        text = text.replace(/\s+/g, " ").trim();

        const skillsKeywords = ["Python", "Java", "JavaScript", "C++", "C#", "SQL", "MongoDB", "SAP", "AWS", "Cloud Computing", "Docker", "Kubernetes", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Flask", "Django", "React", "Node.js"];
        const educationKeywords = ["Bachelor", "Master", "B.Tech", "M.Tech", "PhD", "GPA"];
        const jobTitles = ["Analyst", "Engineer", "Developer", "Consultant", "Manager", "Intern"];
        const certifications = ["AWS Certified", "Google Cloud Certified", "PMP", "HackerRank", "Coursera"];

        const extractedSkills = skillsKeywords.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
        const extractedEducation = educationKeywords.filter(edu => text.toLowerCase().includes(edu.toLowerCase()));
        const extractedJobTitles = jobTitles.filter(title => text.toLowerCase().includes(title.toLowerCase()));
        const extractedCertifications = certifications.filter(cert => text.toLowerCase().includes(cert.toLowerCase()));

        return { extractedSkills, extractedEducation, extractedJobTitles, extractedCertifications };

    } catch (err) {
        console.error("❌ Error in extractJobDescriptionKeywords():", err);
        return { error: "Error extracting job description keywords" };
    }
};

// ✅ AI-Powered Resume Improvement Suggestions
const suggestResumeImprovements = async (resumeData, jobDescription) => {
    try {
        const prompt = `
        Given the following resume details:
        ${JSON.stringify(resumeData, null, 2)}

        And the following job description:
        ${jobDescription}

        Suggest 5 major improvements as bullet points to better align the resume with the job description.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
            max_tokens: 500
        });

        //console.log("✅ OpenAI API Response:", JSON.stringify(response, null, 2)); // Full response logging

        // 🔹 Ensure response contains choices and message content
        if (!response || !response.choices || response.choices.length === 0 || !response.choices[0].message) {
            throw new Error("Invalid OpenAI response: No message content found.");
        }

        return response.choices[0].message.content.trim();

    } catch (error) {
        console.error("❌ Error generating AI suggestions:", error);
        return "AI suggestions could not be generated.";
    }
};

// ✅ Compare Resume with Job Description + AI Feedback
const compareResumeWithJobDescription = async (req, res) => {
    const filePath = req.file?.path; // ✅ Get the uploaded file path
    try {
        const { resumeData, jobDescription } = req.body;

        if (!resumeData || !jobDescription) {
            return res.status(400).json({ error: "Resume data or job description missing!" });
        }

        const jobData = extractJobDescriptionKeywords(jobDescription);
        const stemmer = natural.PorterStemmer;

        const matchedSkills = resumeData.extractedSkills.filter(skill =>
            jobData.extractedSkills.some(jobSkill => stemmer.stem(skill.toLowerCase()) === stemmer.stem(jobSkill.toLowerCase()))
        );

        const matchedJobTitles = resumeData.extractedJobTitles.filter(title =>
            jobData.extractedJobTitles.some(jobTitle => natural.JaroWinklerDistance(title.toLowerCase(), jobTitle.toLowerCase()) > 0.85)
        );

        const matchedEducation = resumeData.extractedEducation.filter(edu =>
            jobData.extractedEducation.some(jobEdu => edu.toLowerCase().includes(jobEdu.toLowerCase()))
        );

        const matchedCertifications = resumeData.extractedCertifications.filter(cert =>
            jobData.extractedCertifications.some(jobCert => cert.toLowerCase().includes(jobCert.toLowerCase()))
        );

        let score = 0;
        const maxScore = 
            (jobData.extractedSkills.length * 10) + 
            (jobData.extractedJobTitles.length * 15) + 
            (jobData.extractedEducation.length * 8) + 
            (jobData.extractedCertifications.length * 5);

        score += matchedSkills.length * 10;  
        score += matchedJobTitles.length * 15;
        score += matchedEducation.length * 8;
        score += matchedCertifications.length * 5;

        const scorePercentage = maxScore > 0 ? ((score / maxScore) * 100).toFixed(2) : 0;

        //console.log("✅ Calculated Match Score:", scorePercentage);

        res.json({ matchedSkills, matchedEducation, matchedJobTitles, matchedCertifications, scorePercentage });

    } catch (error) {
        console.error("❌ Error comparing resume:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ AI Suggestions Route (Fetch AI-generated resume improvements)
const getAiSuggestions = async (resumeData, jobDescription) => {
    const filePath = resumeData.file?.path; // ✅ Get the uploaded file path
    try {
        const prompt = `
        Given the following resume details:
        ${JSON.stringify(resumeData, null, 2)}

        And the following job description:
        ${jobDescription}

        Suggest 5 major improvements as bullet points to better align the resume with the job description.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
            max_tokens: 500
        });

        if (!response || !response.choices || response.choices.length === 0 || !response.choices[0].message) {
            throw new Error("Invalid OpenAI response: No message content found.");
        }

        // ✅ Ensure AI response is returned as an array of suggestions
        const suggestions = response.choices[0].message.content.trim().split("\n").filter(s => s.trim() !== "");

        return suggestions; // ✅ Return an array instead of a single string

    } catch (error) {
        console.error("❌ Error generating AI suggestions:", error);
        return ["AI suggestions could not be generated."]; // ✅ Ensure a fallback array
    } finally {
        // ✅ Delete the file after AI processing
        if (filePath && fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error(`❌ Error deleting file: ${filePath}`, err);
                else console.log(`✅ Successfully deleted file: ${filePath}`);
            });
        }
    }
};

// ✅ Ensure both functions are exported
module.exports = { 
    parseResume: async (filePath) => {
        const extractedText = await extractTextFromPDF(filePath);
        return extractedText ? extractRelevantKeywords(extractedText) : { error: "Failed to extract text" };
    },
    suggestResumeImprovements,
    compareResumeWithJobDescription,
    getAiSuggestions, // ✅ New function added here
};