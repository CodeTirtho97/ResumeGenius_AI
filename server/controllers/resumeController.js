const fs = require("fs");
const pdfParse = require("pdf-parse");
const natural = require("natural");
const OpenAI = require("openai");
const cacheService = require("../services/cacheService");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Extract Text from PDF
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text.replace(/\s{2,}/g, " ").trim(); // Removes extra spaces
  } catch (err) {
    console.error("❌ Error extracting text from PDF:", err);
    return null;
  }
};

// ✅ Enhanced Keyword Extraction Algorithm
const extractRelevantKeywords = (text) => {
  try {
    text = text.replace(/\s+/g, " ").trim();

    // Email & Phone Extraction
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex =
      /(\+\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/g;

    const email = text.match(emailRegex)?.[0] || "Not Found";
    const phone = text.match(phoneRegex)?.[0] || "Not Found";

    // Enhanced Keywords - Add more comprehensive lists
    const programmingSkills = [
      "Python",
      "Java",
      "JavaScript",
      "TypeScript",
      "C\\+\\+",
      "C#",
      "PHP",
      "Ruby",
      "Swift",
      "Kotlin",
      "Go",
      "Rust",
      "Scala",
      "Perl",
      "Bash",
      "Shell",
      "PowerShell",
      "MATLAB",
      "R",
      "Dart",
      "Objective-C",
      "Groovy",
    ];

    const databaseSkills = [
      "SQL",
      "NoSQL",
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "Firebase",
      "DynamoDB",
      "Oracle",
      "Redis",
      "Cassandra",
      "MariaDB",
      "SQLite",
      "Neo4j",
      "Elasticsearch",
      "Snowflake",
      "Databricks",
      "MSSQL",
      "BigQuery",
    ];

    const cloudSkills = [
      "AWS",
      "Azure",
      "GCP",
      "Google Cloud",
      "Cloud Computing",
      "Serverless",
      "Lambda",
      "EC2",
      "S3",
      "RDS",
      "Kubernetes",
      "Docker",
      "Containerization",
      "Terraform",
      "CloudFormation",
      "Ansible",
      "Pulumi",
      "IAM",
      "VPC",
      "CDK",
      "Cloud Functions",
    ];

    const aiMlSkills = [
      "Machine Learning",
      "Deep Learning",
      "AI",
      "Artificial Intelligence",
      "TensorFlow",
      "PyTorch",
      "Keras",
      "scikit-learn",
      "NLP",
      "Computer Vision",
      "Neural Networks",
      "Regression",
      "Classification",
      "Clustering",
      "Reinforcement Learning",
      "GPT",
      "LLM",
      "Large Language Models",
      "BERT",
      "Transformers",
      "Data Science",
    ];

    const webDevSkills = [
      "React",
      "Angular",
      "Vue",
      "Next.js",
      "Svelte",
      "Node.js",
      "Express",
      "Django",
      "Flask",
      "Spring Boot",
      "Laravel",
      "ASP.NET",
      "HTML",
      "CSS",
      "SASS",
      "LESS",
      "Bootstrap",
      "Tailwind",
      "Material UI",
      "Redux",
      "GraphQL",
      "REST API",
      "WebSockets",
      "OAuth",
      "JWT",
      "Webpack",
      "Vite",
      "Rollup",
      "npm",
      "yarn",
    ];

    const devOpsSkills = [
      "CI/CD",
      "Jenkins",
      "GitHub Actions",
      "GitLab CI",
      "CircleCI",
      "Travis CI",
      "DevOps",
      "SRE",
      "Site Reliability",
      "Monitoring",
      "Prometheus",
      "Grafana",
      "ELK Stack",
      "Datadog",
      "New Relic",
      "Splunk",
      "Infrastructure as Code",
      "GitOps",
      "ArgoCD",
      "Helm",
      "Istio",
      "Service Mesh",
    ];

    const softSkills = [
      "Leadership",
      "Communication",
      "Teamwork",
      "Problem Solving",
      "Critical Thinking",
      "Time Management",
      "Adaptability",
      "Creativity",
      "Collaboration",
      "Project Management",
      "Agile",
      "Scrum",
      "Kanban",
      "Lean",
      "Mentoring",
      "Customer Focus",
      "Presentation",
      "Negotiation",
      "Decision Making",
      "JIRA",
      "Confluence",
    ];

    const educationKeywords = [
      "Bachelor",
      "Master",
      "B.Tech",
      "M.Tech",
      "PhD",
      "GPA",
      "CGPA",
      "Computer Science",
      "Information Technology",
      "Electrical Engineering",
      "Machine Learning",
      "Artificial Intelligence",
      "Data Science",
      "Software Engineering",
      "Computer Engineering",
      "Honors",
      "Distinction",
      "Cum Laude",
      "Magna Cum Laude",
      "Summa Cum Laude",
    ];

    const jobTitles = [
      "Software Engineer",
      "Developer",
      "Full Stack",
      "Frontend",
      "Backend",
      "DevOps",
      "SRE",
      "Data Scientist",
      "Machine Learning Engineer",
      "Product Manager",
      "Project Manager",
      "Technical Lead",
      "Engineering Manager",
      "CTO",
      "VP of Engineering",
      "Director",
      "Architect",
      "Solutions Architect",
      "Cloud Architect",
      "Security Engineer",
      "QA Engineer",
      "Test Engineer",
      "Automation Engineer",
      "Mobile Developer",
      "Android Developer",
      "iOS Developer",
    ];

    const certifications = [
      "AWS Certified",
      "Google Cloud Certified",
      "Azure Certified",
      "Microsoft Certified",
      "CompTIA",
      "CISSP",
      "PMP",
      "Scrum Master",
      "ITIL",
      "TOGAF",
      "Oracle Certified",
      "Kubernetes Certified",
      "Terraform Certified",
      "Cisco Certified",
      "CISA",
      "CISM",
      "OSCP",
      "CEH",
      "CCNA",
      "CCNP",
      "CKA",
      "CKAD",
      "CKS",
      "RHCE",
    ];

    // Context-aware keyword extraction with TF-IDF inspired approach
    const allSkills = [
      ...programmingSkills,
      ...databaseSkills,
      ...cloudSkills,
      ...aiMlSkills,
      ...webDevSkills,
      ...devOpsSkills,
      ...softSkills,
    ];

    // Calculate term frequency for each skill
    const extractedSkills = [];
    const skillScore = {};

    allSkills.forEach((skill) => {
      const regex = new RegExp(`\\b${skill}\\b`, "gi");
      const matches = text.match(regex);
      if (matches) {
        extractedSkills.push(skill);

        // Count occurrences and nearby keywords for relevance scoring
        const count = matches.length;
        const skillContext =
          text.indexOf(skill) > 0
            ? text.substring(
                Math.max(0, text.indexOf(skill) - 50),
                Math.min(text.length, text.indexOf(skill) + 50)
              )
            : "";

        // Higher score if skill appears in context of projects, work experience
        const contextRelevance =
          /project|experience|develop|implement|create|build|design/i.test(
            skillContext
          )
            ? 1.5
            : 1.0;

        skillScore[skill] = count * contextRelevance;
      }
    });

    // Sort skills by relevance score
    const sortedSkills = extractedSkills.sort(
      (a, b) => skillScore[b] - skillScore[a]
    );

    // Extract other categories using enhanced approach
    const extractedEducation = educationKeywords.filter((edu) =>
      new RegExp(`\\b${edu}\\b`, "gi").test(text)
    );
    const extractedJobTitles = jobTitles.filter((title) =>
      new RegExp(`\\b${title}\\b`, "gi").test(text)
    );
    const extractedCertifications = certifications.filter((cert) =>
      new RegExp(`\\b${cert}\\b`, "gi").test(text)
    );

    return {
      email,
      phone,
      extractedSkills: sortedSkills,
      extractedCertifications,
      extractedJobTitles,
      extractedEducation,
      skillScore, // Include the relevance scores
    };
  } catch (err) {
    console.error("❌ Error in extractRelevantKeywords():", err);
    return { error: "Error extracting keywords" };
  }
};

// ✅ Extract Job Description Keywords
const extractJobDescriptionKeywords = (text) => {
  try {
    text = text.replace(/\s+/g, " ").trim();

    // Enhanced keywords for job descriptions
    const programmingSkills = [
      "Python",
      "Java",
      "JavaScript",
      "TypeScript",
      "C++",
      "C#",
      "PHP",
      "Ruby",
      "Swift",
      "Kotlin",
      "Go",
      "Rust",
      "Scala",
      "Perl",
      "Bash",
      "Shell",
      "PowerShell",
      "MATLAB",
      "R",
      "Dart",
      "Objective-C",
      "Groovy",
    ];

    const databaseSkills = [
      "SQL",
      "NoSQL",
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "Firebase",
      "DynamoDB",
      "Oracle",
      "Redis",
      "Cassandra",
      "MariaDB",
      "SQLite",
      "Neo4j",
      "Elasticsearch",
      "Snowflake",
      "Databricks",
      "MSSQL",
      "BigQuery",
    ];

    const cloudSkills = [
      "AWS",
      "Azure",
      "GCP",
      "Google Cloud",
      "Cloud Computing",
      "Serverless",
      "Lambda",
      "EC2",
      "S3",
      "RDS",
      "Kubernetes",
      "Docker",
      "Containerization",
      "Terraform",
      "CloudFormation",
      "Ansible",
      "Pulumi",
      "IAM",
      "VPC",
      "CDK",
      "Cloud Functions",
    ];

    const aiMlSkills = [
      "Machine Learning",
      "Deep Learning",
      "AI",
      "Artificial Intelligence",
      "TensorFlow",
      "PyTorch",
      "Keras",
      "scikit-learn",
      "NLP",
      "Computer Vision",
      "Neural Networks",
      "Regression",
      "Classification",
      "Clustering",
      "Reinforcement Learning",
      "GPT",
      "LLM",
      "Large Language Models",
      "BERT",
      "Transformers",
      "Data Science",
    ];

    const webDevSkills = [
      "React",
      "Angular",
      "Vue",
      "Next.js",
      "Svelte",
      "Node.js",
      "Express",
      "Django",
      "Flask",
      "Spring Boot",
      "Laravel",
      "ASP.NET",
      "HTML",
      "CSS",
      "SASS",
      "LESS",
      "Bootstrap",
      "Tailwind",
      "Material UI",
      "Redux",
      "GraphQL",
      "REST API",
      "WebSockets",
      "OAuth",
      "JWT",
      "Webpack",
      "Vite",
      "Rollup",
      "npm",
      "yarn",
    ];

    const devOpsSkills = [
      "CI/CD",
      "Jenkins",
      "GitHub Actions",
      "GitLab CI",
      "CircleCI",
      "Travis CI",
      "DevOps",
      "SRE",
      "Site Reliability",
      "Monitoring",
      "Prometheus",
      "Grafana",
      "ELK Stack",
      "Datadog",
      "New Relic",
      "Splunk",
      "Infrastructure as Code",
      "GitOps",
      "ArgoCD",
      "Helm",
      "Istio",
      "Service Mesh",
    ];

    const softSkills = [
      "Leadership",
      "Communication",
      "Teamwork",
      "Problem Solving",
      "Critical Thinking",
      "Time Management",
      "Adaptability",
      "Creativity",
      "Collaboration",
      "Project Management",
      "Agile",
      "Scrum",
      "Kanban",
      "Lean",
      "Mentoring",
      "Customer Focus",
      "Presentation",
      "Negotiation",
      "Decision Making",
      "JIRA",
      "Confluence",
    ];

    // Combine all skill categories
    const allSkills = [
      ...programmingSkills,
      ...databaseSkills,
      ...cloudSkills,
      ...aiMlSkills,
      ...webDevSkills,
      ...devOpsSkills,
      ...softSkills,
    ];

    const educationKeywords = [
      "Bachelor",
      "Master",
      "B.Tech",
      "M.Tech",
      "PhD",
      "GPA",
      "Computer Science",
      "Information Technology",
      "Electrical Engineering",
      "Machine Learning",
      "Artificial Intelligence",
      "Data Science",
      "Software Engineering",
    ];

    const jobTitles = [
      "Software Engineer",
      "Developer",
      "Full Stack",
      "Frontend",
      "Backend",
      "DevOps",
      "SRE",
      "Data Scientist",
      "Machine Learning Engineer",
      "Product Manager",
      "Project Manager",
      "Technical Lead",
      "Engineering Manager",
    ];

    const certifications = [
      "AWS Certified",
      "Google Cloud Certified",
      "Azure Certified",
      "Microsoft Certified",
      "CompTIA",
      "CISSP",
      "PMP",
      "Scrum Master",
      "ITIL",
      "TOGAF",
      "Oracle Certified",
      "Kubernetes Certified",
      "Terraform Certified",
    ];

    // Find all skills in job description with case-insensitive matching
    const extractedSkills = allSkills.filter((skill) =>
      new RegExp(
        `\\b${skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`,
        "i"
      ).test(text)
    );

    const extractedEducation = educationKeywords.filter((edu) =>
      new RegExp(
        `\\b${edu.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`,
        "i"
      ).test(text)
    );

    const extractedJobTitles = jobTitles.filter((title) =>
      new RegExp(
        `\\b${title.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`,
        "i"
      ).test(text)
    );

    const extractedCertifications = certifications.filter((cert) =>
      new RegExp(
        `\\b${cert.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`,
        "i"
      ).test(text)
    );

    return {
      extractedSkills,
      extractedEducation,
      extractedJobTitles,
      extractedCertifications,
    };
  } catch (err) {
    console.error("❌ Error in extractJobDescriptionKeywords():", err);
    return { error: "Error extracting job description keywords" };
  }
};

// ✅ AI-Powered Resume Improvement Suggestions with Caching
const getAiSuggestions = async (resumeData, jobDescription) => {
  try {
    // Generate a cache key based on resume data and job description
    const cacheKey = cacheService.generateCacheKey({
      resumeData: resumeData.extractedSkills
        ? resumeData.extractedSkills.sort()
        : [],
      jobDescription: jobDescription,
    });

    // Try to get from cache first
    const cachedResult = cacheService.getFromCache(cacheKey);
    if (cachedResult) {
      console.log("✅ Using cached AI suggestions");
      return cachedResult;
    }

    console.log("🔄 Cache miss - Generating new AI suggestions");
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
      max_tokens: 500,
    });

    if (
      !response ||
      !response.choices ||
      response.choices.length === 0 ||
      !response.choices[0].message
    ) {
      throw new Error("Invalid OpenAI response: No message content found.");
    }

    // Process the suggestions
    const suggestions = response.choices[0].message.content
      .trim()
      .split("\n")
      .filter((s) => s.trim() !== "");

    // Save to cache for future use
    cacheService.saveToCache(cacheKey, suggestions, 72); // Cache for 72 hours

    return suggestions;
  } catch (error) {
    console.error("❌ Error generating AI suggestions:", error);
    return ["AI suggestions could not be generated."];
  }
};

// ✅ Compare Resume with Job Description + AI Feedback
const compareResumeWithJobDescription = async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;

    if (!resumeData || !jobDescription) {
      return res
        .status(400)
        .json({ error: "Resume data or job description missing!" });
    }

    const jobData = extractJobDescriptionKeywords(jobDescription);
    const stemmer = natural.PorterStemmer;

    const matchedSkills = resumeData.extractedSkills.filter((skill) =>
      jobData.extractedSkills.some(
        (jobSkill) =>
          stemmer.stem(skill.toLowerCase()) ===
          stemmer.stem(jobSkill.toLowerCase())
      )
    );

    const matchedJobTitles = resumeData.extractedJobTitles.filter((title) =>
      jobData.extractedJobTitles.some(
        (jobTitle) =>
          natural.JaroWinklerDistance(
            title.toLowerCase(),
            jobTitle.toLowerCase()
          ) > 0.85
      )
    );

    const matchedEducation = resumeData.extractedEducation.filter((edu) =>
      jobData.extractedEducation.some((jobEdu) =>
        edu.toLowerCase().includes(jobEdu.toLowerCase())
      )
    );

    const matchedCertifications = resumeData.extractedCertifications.filter(
      (cert) =>
        jobData.extractedCertifications.some((jobCert) =>
          cert.toLowerCase().includes(jobCert.toLowerCase())
        )
    );

    let score = 0;
    const maxScore =
      jobData.extractedSkills.length * 10 +
      jobData.extractedJobTitles.length * 15 +
      jobData.extractedEducation.length * 8 +
      jobData.extractedCertifications.length * 5;

    score += matchedSkills.length * 10;
    score += matchedJobTitles.length * 15;
    score += matchedEducation.length * 8;
    score += matchedCertifications.length * 5;

    const scorePercentage =
      maxScore > 0 ? ((score / maxScore) * 100).toFixed(2) : 0;

    return {
      matchedSkills,
      matchedEducation,
      matchedJobTitles,
      matchedCertifications,
      scorePercentage,
      extractedSkills: jobData.extractedSkills, // Include all skills from job description
    };
  } catch (error) {
    console.error("❌ Error comparing resume:", error);
    throw error;
  }
};

// ✅ Generate tailored resume bullet points with caching
const generateTailoredResume = async (resumeText, jobDescription) => {
  try {
    // Generate a cache key based on resume text and job description
    const cacheKey = cacheService.generateCacheKey({
      resumeText: resumeText.substring(0, 200), // Use first 200 chars to avoid too large keys
      jobDescription: jobDescription.substring(0, 200),
    });

    // Try to get from cache first
    const cachedResult = cacheService.getFromCache(cacheKey);
    if (cachedResult) {
      console.log("✅ Using cached tailored resume bullets");
      return cachedResult;
    }

    console.log("🔄 Cache miss - Generating new tailored resume bullets");

    const prompt = `
        You are an expert resume writer specializing in tailoring resumes to match job descriptions.
        
        ORIGINAL RESUME:
        ${resumeText}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        INSTRUCTIONS:
        1. Rewrite 3-5 bullet points from the resume to better align with the job description
        2. For each bullet point, provide:
           - The original bullet text
           - The improved, tailored version
           - A brief explanation of why the change improves the match
        3. Focus on incorporating keywords, quantifying achievements, and highlighting relevant experience
        4. Keep the improved bullet point concise and professional
        5. Format your response as JSON with this structure:
        {
          "tailoredBullets": [
            {
              "original": "Original bullet text",
              "improved": "Improved bullet text",
              "explanation": "Brief explanation of the improvement"
            },
            ...
          ]
        }
        `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    // Parse the JSON response
    const contentString = response.choices[0].message.content.trim();
    const result = JSON.parse(contentString);

    // Save to cache for future use
    cacheService.saveToCache(cacheKey, result, 72); // Cache for 72 hours

    return result;
  } catch (error) {
    console.error("❌ Error generating tailored resume:", error);
    return { error: "Failed to generate tailored resume suggestions." };
  }
};

// ✅ Export all functions
module.exports = {
  parseResume: async (filePath) => {
    const extractedText = await extractTextFromPDF(filePath);
    return extractedText
      ? extractRelevantKeywords(extractedText)
      : { error: "Failed to extract text" };
  },
  compareResumeWithJobDescription,
  getAiSuggestions,
  generateTailoredResume,
};
