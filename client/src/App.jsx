import { useState } from "react";
import axios from "axios";
import { CircularProgress, Button, TextField, Card, CardContent, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";

function App() {
  const [file, setFile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [matchResults, setMatchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [matchScore, setMatchScore] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage("⚠️ Please upload a resume first!");
      return;
    }
    setLoading(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const { data } = await axios.post("http://localhost:5000/api/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ API Response:", data);
      setResumeData(data.extractedData);
    } catch (error) {
      console.error("❌ Error uploading resume:", error);
      setErrorMessage("❌ Failed to upload resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!resumeData || !jobDescription.trim()) {
      setErrorMessage("⚠️ Please upload a resume and enter a job description!");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    setMatchScore(null);  // ✅ Reset before loading new results
  
    try {
      const { data } = await axios.post("http://localhost:5000/api/resume/compare", {
        resumeData,
        jobDescription,
      });
  
      console.log("✅ API Response:", data); // ✅ Debugging Log
  
      if (data && typeof data.scorePercentage === "number") {
        setMatchResults(data);
        setMatchScore(data.scorePercentage);  // ✅ Ensure valid number
      } else {
        setMatchScore(0); // ✅ Fallback if no valid score is found
      }
    } catch (error) {
      console.error("❌ Error comparing resume with job description:", error);
      setErrorMessage("❌ Failed to compare resume. Please check API connection.");
      setMatchScore(0);  // ✅ Prevent UI breaking
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#111", color: "white", padding: "20px" }}>
      <motion.h1 
        style={{ fontSize: "32px", fontWeight: "bold", color: "#FFD700", marginBottom: "20px" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        ResumeGenius AI - Resume Analyzer
      </motion.h1>

      {/* File Upload Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <input type="file" onChange={handleFileChange} style={{ color: "white" }} />
        <Button variant="contained" color="warning" onClick={handleUpload} disabled={loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : "Upload Resume"}
        </Button>
      </div>

      {errorMessage && <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>}

      {/* Extracted Data Display */}
      {resumeData && (
        <motion.div style={{ marginTop: "20px", width: "100%", maxWidth: "650px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <Card sx={{ backgroundColor: "#222", color: "#fff" }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: "#FFD700" }}>Extracted Data</Typography>
              <Typography><strong>Skills:</strong> {resumeData.extractedSkills.join(", ")}</Typography>
              <Typography><strong>Education:</strong> {resumeData.extractedEducation.join(", ")}</Typography>
              <Typography><strong>Job Titles:</strong> {resumeData.extractedJobTitles.join(", ")}</Typography>
              <Typography><strong>Certifications:</strong> {resumeData.extractedCertifications.join(", ") || "No certifications found"}</Typography>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Job Description Input */}
      {resumeData && (
        <motion.div style={{ marginTop: "20px", width: "100%", maxWidth: "650px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Paste Job Description Here"
            variant="outlined"
            sx={{ backgroundColor: "#333", color: "white", borderRadius: "5px" }}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <Button variant="contained" color="warning" sx={{ marginTop: "10px", width: "100%" }} onClick={handleCompare}>
            Compare
          </Button>
        </motion.div>
      )}

      {/* Matching Results & AI Suggestions */}
      {matchResults && (
        <motion.div style={{ marginTop: "20px", width: "100%", maxWidth: "650px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <Card sx={{ backgroundColor: "#222", color: "#fff" }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: "#FFD700" }}>Matching Results</Typography>
              <Typography><strong>Matched Skills:</strong> {matchResults.matchedSkills.join(", ")}</Typography>
              <Typography><strong>Matched Education:</strong> {matchResults.matchedEducation.join(", ")}</Typography>
              <Typography><strong>Matched Job Titles:</strong> {matchResults.matchedJobTitles.join(", ")}</Typography>
              <Typography><strong>Matched Certifications:</strong> {matchResults.matchedCertifications.join(", ")}</Typography>

              <Typography sx={{ color: "#FFD700", marginTop: "10px" }}>
                Overall Match Score: {matchScore !== null ? `${matchScore.toFixed(2)}%` : "Calculating..."}
              </Typography>

              <Box sx={{ backgroundColor: "#444", height: "10px", width: "100%", borderRadius: "5px", overflow: "hidden", marginTop: "10px" }}>
                <motion.div 
                  style={{ height: "100%", backgroundColor: matchScore > 70 ? "lime" : matchScore > 40 ? "orange" : "red" }}
                  initial={{ width: "0%" }} 
                  animate={{ width: matchScore !== null ? `${matchScore}%` : "0%" }} 
                  transition={{ duration: 1 }}
                />
              </Box>

              <Button onClick={() => setShowSuggestions(!showSuggestions)} variant="outlined" color="warning" sx={{ marginTop: "10px" }}>
                {showSuggestions ? "Hide AI Suggestions" : "Show AI Suggestions"}
              </Button>

              {showSuggestions && <Typography sx={{ marginTop: "10px" }}>{matchResults.aiSuggestions}</Typography>}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default App;