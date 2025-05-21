import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Divider,
  Tooltip,
  Modal,
  TextField,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  FaUpload,
  FaCheck,
  FaTimes,
  FaPaperclip,
  FaRobot,
  FaUser,
  FaInfoCircle,
} from "react-icons/fa";
import DOMPurify from "dompurify"; // Added for sanitizing HTML

// Import custom components
// eslint-disable-next-line react/prop-types
import SkillsRadarChart from "./components/SkillsRadarChart";
// eslint-disable-next-line react/prop-types
import TailoredBulletPoints from "./components/TailoredBulletPoints";
// eslint-disable-next-line react/prop-types
import SkeletonLoader from "./components/SkeletonLoader";
// eslint-disable-next-line react/prop-types
import ProcessingAnimation from "./components/ProcessingAnimation";
// eslint-disable-next-line react/prop-types
import InfoPanel from "./components/InfoPanel";
// eslint-disable-next-line react/prop-types
import BackgroundSVG from "./components/BackgroundSVG";

function App() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "bot",
      text: "👋 Hello! I'm <strong>ResumeGenius AI</strong>. Let's analyze your resume step by step.",
    },
    { id: "2", sender: "bot", text: "Do you want to upload your resume now?" },
  ]);
  const [showTyping, setShowTyping] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [chatEnded, setChatEnded] = useState(false);
  const [lastChatTimestamp, setLastChatTimestamp] = useState(localStorage.getItem("lastChatTimestamp") || null);
  const [showCooldownModal, setShowCooldownModal] = useState(false);
  const [cooldownMinutes, setCooldownMinutes] = useState(0);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [tailoredBullets, setTailoredBullets] = useState([]);

  useEffect(() => {
    const lastTimestamp = localStorage.getItem("lastChatTimestamp");
    if (lastTimestamp) {
      const lastTime = new Date(lastTimestamp);
      const currentTime = new Date();
      const timeDiff = (currentTime - lastTime) / (1000 * 60);
      if (timeDiff < 60) {
        setShowCooldownModal(true);
        setCooldownMinutes(Math.ceil(60 - timeDiff));
      }
    }
  }, []); // Added empty dependency array

  const handleUserResponse = (response) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, sender: "user", text: response, timestamp: new Date().toLocaleTimeString() },
    ]);

    if (response === "Yes ✅") {
      setShowTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: `${Date.now()}-${Math.random()}`, sender: "bot", text: "Great! 📂 Upload your resume below." },
          { id: `${Date.now()}-${Math.random()}`, sender: "bot", text: "Waiting...", fileUpload: true },
        ]);
        setShowTyping(false);
      }, 1000);
    } else {
      setShowTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: `${Date.now()}-${Math.random()}`, sender: "bot", text: "No worries! You can upload it later 😊." },
        ]);
        setShowTyping(false);
      }, 1000);
    }
  };

  const handleJobDescriptionSubmit = async () => {
    if (!file || !jobDescription.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          sender: "bot",
          text: "⚠️ Please upload a resume and provide a job description.",
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, sender: "user", text: "📄 Sent the Job Description" },
      {
        id: `${Date.now()}-${Math.random()}`,
        sender: "bot",
        showProcessingAnimation: true,
        processingText: "Analyzing resume & job match...",
      },
    ]);

    setShowJobModal(false);
    setShowTyping(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      const response = await fetch(`${BACKEND_URL}/api/resume/analyze-resume`, {
        method: "POST",
        body: formData,
      });

      if (response.status === 429) {
        const rateLimitData = await response.json();
        setMessages((prev) => [
          ...prev.filter((msg) => !msg.showProcessingAnimation),
          {
            id: `${Date.now()}-${Math.random()}`,
            sender: "bot",
            text: `⏳ Rate limit exceeded! You can analyze another resume in ${rateLimitData.cooldownMinutes} minutes.`,
          },
        ]);
        setShowCooldownModal(true);
        setCooldownMinutes(rateLimitData.cooldownMinutes);
        setShowTyping(false);
        return;
      }

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setMatchedSkills(data.matchedSkills || []);
      const missingSkills = data.extractedSkills
        ? data.extractedSkills.filter((skill) => !data.matchedSkills.includes(skill))
        : [];
      setMissingSkills(missingSkills);

      let feedback;
      if (data.scorePercentage >= 90) {
        feedback = "🔥 Excellent!";
      } else if (data.scorePercentage >= 80) {
        feedback = "✅ Very Good!";
      } else if (data.scorePercentage >= 65) {
        feedback = "🟡 Good, but can be improved.";
      } else {
        feedback = "🔴 Needs Improvement!";
      }

      setMessages((prev) => [
        ...prev.filter((msg) => !msg.showProcessingAnimation),
        {
          id: `${Date.now()}-${Math.random()}`,
          sender: "bot",
          text: `Your ATS Score: <strong>${data.scorePercentage}%</strong> ${feedback}`,
          showSkillsRadar: true,
        },
        {
          id: `${Date.now()}-${Math.random()}`,
          sender: "bot",
          text: "Would you like me to tailor your resume for this job?",
          showTailorButton: true,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.showProcessingAnimation),
        {
          id: `${Date.now()}-${Math.random()}`,
          sender: "bot",
          text: "⚠️ Error processing resume. Please try again!",
        },
      ]);
    }

    setShowTyping(false);
  };

  const handleAiSuggestionRequest = async () => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, sender: "user", text: "Yes ✅" },
      {
        id: `${Date.now()}-${Math.random()}`,
        sender: "bot",
        showProcessingAnimation: true,
        processingText: "Fetching AI-powered resume suggestions... 🤖",
      },
    ]);

    setShowTyping(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/resume/get-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: file, jobDescription }),
      });

      const data = await response.json();

      if (!Array.isArray(data.aiSuggestions) || data.aiSuggestions.length === 0) {
        throw new Error("Invalid AI suggestions format");
      }

      let aiSuggestions = data.aiSuggestions.map((suggestion) => suggestion.trim()).filter((s) => s !== "");
      if (aiSuggestions.length > 5) {
        aiSuggestions = aiSuggestions.slice(1, 6);
      } else {
        while (aiSuggestions.length < 5) {
          aiSuggestions.push("More details can improve this section.");
        }
      }

      let conclusionMessage = "";
      if (data.aiSuggestions.length > 5) {
        conclusionMessage = `<p style="margin-top: 10px; font-size: 14px; color: #780000;">
          ${DOMPurify.sanitize(data.aiSuggestions[data.aiSuggestions.length - 1])}
        </p>`;
      }

      const formatTextWithStrongTags = (text) => {
        return DOMPurify.sanitize(text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"));
      };

      const formattedAiSuggestions = aiSuggestions
        .map(
          (suggestion) => `
        <div style="background: #2d3748; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
          <span style="color: #00FF7F;">✔️</span>
          <span style="color: #D1D5DB;"> ${formatTextWithStrongTags(suggestion)}</span>
        </div>
      `
        )
        .join("");

      const finalMessage = `
        <div style="background-color: #ffd166; padding: 15px; border-radius: 10px; color: #780000; font-family: 'Poppins', sans-serif;">
          <p><strong>🚀 AI-Suggested Resume Improvements</strong></p>
          ${formattedAiSuggestions}
          ${conclusionMessage}
        </div>
      `;

      setMessages((prev) => [
        ...prev.filter((msg) => !msg.showProcessingAnimation),
        { id: `${Date.now()}-${Math.random()}`, sender: "bot", text: finalMessage },
        {
          id: `${Date.now()}-${Math.random()}`,
          sender: "bot",
          text: "🎉 Thank you for using ResumeGenius AI! Hope you'll improve and succeed in job selection! 🎯",
        },
      ]);

      setChatEnded(true);
      const timestamp = new Date().toISOString();
      localStorage.setItem("lastChatTimestamp", timestamp);
      setLastChatTimestamp(timestamp);
    } catch (error) {
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.showProcessingAnimation),
        {
          id: `${Date.now()}-${Math.random()}`,
          sender: "bot",
          text: "⚠️ Oops! AI suggestions couldn't be fetched. Try again after a few mins!",
        },
      ]);
    }

    setShowTyping(false);
  };

  const extractResumeText = async (file) => {
    if (!file) return "Your resume text here";
    return `Resume content for ${file.name}`;
  };

  const handleTailorResume = async () => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, sender: "user", text: "🎯 Tailor my resume to this job" },
      {
        id: `${Date.now()}-${Math.random()}`,
        sender: "bot",
        showProcessingAnimation: true,
        processingText: "Generating tailored resume bullet points...",
      },
    ]);

    try {
      const resumeText = await extractResumeText(file);
      const response = await fetch(`${BACKEND_URL}/api/resume/tailor-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await response.json();

      if (data.tailoredBullets) {
        setTailoredBullets(data.tailoredBullets);
        setMessages((prev) => [
          ...prev.filter((msg) => !msg.showProcessingAnimation),
          {
            id: `${Date.now()}-${Math.random()}`,
            sender: "bot",
            text: "✅ Here are your tailored resume bullet points:",
          },
          { id: `${Date.now()}-${Math.random()}`, sender: "bot", showTailoredBulletsComponent: true },
          {
            id: `${Date.now()}-${Math.random()}`,
            sender: "bot",
            text: "Would you like AI-powered suggestions to further improve your resume?",
            aiSuggestionRequest: true,
          },
        ]);
      } else {
        throw new Error("Failed to generate tailored bullet points");
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.showProcessingAnimation),
        {
          id: `${Date.now()}-${Math.random()}`,
          sender: "bot",
          text: "❌ Sorry, I couldn't generate tailored bullet points. Please try again.",
        },
        {
          id: `${Date.now()}-${Math.random()}`,
          sender: "bot",
          text: "Would you like AI-powered suggestions to improve your resume?",
          aiSuggestionRequest: true,
        },
      ]);
    }
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          sender: "bot",
          text: "⚠️ Oops! No file selected. Please try again.",
        },
      ]);
      return;
    }

    setFile(uploadedFile);
    setMessages((prev) => [
      ...prev.filter((msg) => !msg.fileUpload),
      {
        id: `${Date.now()}-${Math.random()}`,
        sender: "user",
        text: `📎 ${uploadedFile.name}`,
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: `${Date.now()}-${Math.random()}`,
        sender: "bot",
        text: "Got it! Let's move forward to the next step.",
      },
      {
        id: `${Date.now()}-${Math.random()}`,
        sender: "bot",
        text: "Got it! Now, would you like to provide a job description?",
      },
      { id: `${Date.now()}-${Math.random()}`, sender: "bot", jobDescriptionRequest: true },
    ]);
  };

  const handleStartNewChat = () => {
    const lastTimestamp = localStorage.getItem("lastChatTimestamp");
    if (lastTimestamp) {
      const lastTime = new Date(lastTimestamp);
      const currentTime = new Date();
      const timeDiff = (currentTime - lastTime) / (1000 * 60);
      if (timeDiff < 60) {
        setShowCooldownModal(true);
        setCooldownMinutes(Math.ceil(60 - timeDiff));
        return;
      }
    }
    window.location.reload();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        padding: { xs: "15px", md: "30px" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <BackgroundSVG />

      <Box
        sx={{
          textAlign: "center",
          marginBottom: "30px",
          background: "rgba(10, 25, 41, 0.4)",
          padding: "1.5rem",
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          width: { xs: "95%", md: "70%", lg: "60%" },
          maxWidth: "800px",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle, rgba(0, 224, 255, 0.15) 0%, rgba(0, 224, 255, 0) 70%)",
            borderRadius: "16px",
            zIndex: -1,
            animation: "pulse 8s infinite",
          },
          "@keyframes pulse": {
            "0%": { opacity: 0.5 },
            "50%": { opacity: 0.8 },
            "100%": { opacity: 0.5 },
          },
        }}
      >
        <Typography
          variant="h2"
          fontWeight="bold"
          sx={{
            color: "#00E0FF",
            textShadow: "0px 3px 8px rgba(0, 224, 255, 0.4)",
            fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
            letterSpacing: "-0.01em",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          ResumeGenius <span style={{ color: "#06d6a0" }}>AI</span>
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: "#06d6a0",
            letterSpacing: "0.8px",
            fontStyle: "italic",
            textShadow: "0px 3px 6px rgba(6, 214, 160, 0.5)",
            marginTop: "5px",
            fontSize: { xs: "1rem", sm: "1.2rem", md: "1.25rem" },
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
          }}
        >
          Resume Analyzer & ATS Optimizer
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          justifyContent: "center",
          gap: { xs: "20px", md: "40px" },
          width: "100%",
          maxWidth: "1200px",
          alignItems: { xs: "center", lg: "flex-start" },
        }}
      >
        <Paper
          sx={{
            flex: "3",
            height: { xs: "60vh", sm: "70vh" },
            width: { xs: "95%", sm: "90%", md: "80%", lg: "auto" },
            backgroundColor: "rgba(18, 30, 46, 0.7)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            padding: { xs: "15px", sm: "20px" },
            paddingBottom: "25px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": { background: "rgba(255, 255, 255, 0.05)" },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(255, 255, 255, 0.15)",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb:hover": { background: "rgba(255, 255, 255, 0.25)" },
          }}
        >
          <Box
            sx={{
              position: "sticky",
              top: "0",
              zIndex: "10",
              background: "rgba(10, 25, 41, 0.95)",
              padding: "15px",
              borderRadius: "12px 12px 0 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backdropFilter: "blur(10px)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
              mb: 1,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="600"
              sx={{
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <FaRobot style={{ color: "#00E0FF" }} /> Resume Bot
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: chatEnded ? "#FFA500" : "#36B37E",
                fontSize: { xs: "0.7rem", sm: "0.8rem" },
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {chatEnded ? (
                <>Last seen on {new Date(lastChatTimestamp).toLocaleString()}</>
              ) : (
                <>
                  Online <span style={{ color: "#36B37E", fontSize: "8px", marginLeft: "4px" }}>●</span>
                </>
              )}
            </Typography>
          </Box>

          {messages.map((msg) =>
            msg.fileUpload ? (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  alignSelf: "flex-start",
                  background: "rgba(57, 62, 70, 0.5)",
                  padding: "12px 16px",
                  borderRadius: "15px 15px 15px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backdropFilter: "blur(5px)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Typography sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}>
                  📂 Upload your resume:
                </Typography>
                <Tooltip title="Attach a File">
                  <IconButton
                    onClick={() => fileInputRef.current.click()}
                    color="warning"
                    aria-label="Upload resume file"
                    sx={{
                      width: "36px",
                      height: "36px",
                      backgroundColor: "rgba(255, 160, 0, 0.1)",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "rgba(255, 160, 0, 0.2)",
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <FaPaperclip />
                  </IconButton>
                </Tooltip>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  aria-hidden="true"
                />
              </motion.div>
            ) : msg.showProcessingAnimation ? (
              <ProcessingAnimation key={msg.id} text={msg.processingText} />
            ) : (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  background:
                    msg.sender === "user"
                      ? "linear-gradient(135deg, #00ADB5 0%, #0097A7 100%)"
                      : "rgba(57, 62, 70, 0.6)",
                  color: msg.sender === "user" ? "white" : "#E0E0E0",
                  padding: "12px 16px",
                  borderRadius: msg.sender === "user" ? "15px 15px 0 15px" : "15px 15px 15px 0",
                  maxWidth: "75%",
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(5px)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  wordBreak: "break-word",
                }}
              >
                {msg.sender === "user" ? (
                  <FaUser style={{ marginTop: "3px", minWidth: "14px" }} />
                ) : (
                  <FaRobot style={{ marginTop: "3px", minWidth: "14px", color: "#00E0FF" }} />
                )}
                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                  <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }} />
                  {msg.timestamp && (
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.7, fontSize: "10px", alignSelf: "flex-end", mt: 0.5 }}
                    >
                      {msg.timestamp}
                    </Typography>
                  )}
                  {msg.showSkillsRadar && (
                    <SkillsRadarChart matchedSkills={matchedSkills} missingSkills={missingSkills} />
                  )}
                  {msg.showTailoredBulletsComponent && (
                    <TailoredBulletPoints tailoredBullets={tailoredBullets} />
                  )}
                </Box>
              </motion.div>
            )
          )}

          {showTyping && <SkeletonLoader />}

          {messages[messages.length - 1].text === "Do you want to upload your resume now?" && (
            <Box sx={{ display: "flex", justifyContent: "center", gap: "10px", mt: 1 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<FaCheck />}
                onClick={() => handleUserResponse("Yes ✅")}
                sx={{
                  background: "linear-gradient(135deg, #36B37E 0%, #2D9E6D 100%)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2D9E6D 0%, #36B37E 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 15px rgba(54, 179, 126, 0.4)",
                  },
                  fontWeight: 600,
                  px: 3,
                }}
              >
                YES
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<FaTimes />}
                onClick={() => handleUserResponse("No ❌")}
                sx={{
                  background: "linear-gradient(135deg, #FF5757 0%, #FF3131 100%)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    background: "linear-gradient(135deg, #FF3131 0%, #FF5757 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 15px rgba(255, 87, 87, 0.4)",
                  },
                  fontWeight: 600,
                  px: 3,
                }}
              >
                NO
              </Button>
            </Box>
          )}

          {messages[messages.length - 1].jobDescriptionRequest && (
            <Button
              onClick={() => setShowJobModal(true)}
              sx={{
                background: "linear-gradient(135deg, #00E0FF 0%, #06d6a0 100%)",
                color: "#0A1929",
                fontWeight: "bold",
                fontSize: { xs: "0.9rem", sm: "1rem" },
                padding: { xs: "10px 14px", sm: "10px 16px" },
                borderRadius: "30px",
                boxShadow: "0px 4px 10px rgba(0, 224, 255, 0.2)",
                textTransform: "none",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 6px 15px rgba(0, 224, 255, 0.4)",
                  background: "linear-gradient(135deg, #06d6a0 0%, #00E0FF 100%)",
                },
                alignSelf: "center",
                mt: 1,
              }}
            >
              🚀 Provide Job Description
            </Button>
          )}

          {messages[messages.length - 1].aiSuggestionRequest && (
            <Button
              onClick={handleAiSuggestionRequest}
              sx={{
                background: "linear-gradient(90deg, #00E0FF, #06d6a0)",
                color: "#0A1929",
                fontWeight: "bold",
                textTransform: "uppercase",
                padding: { xs: "10px 16px", sm: "12px 20px" },
                borderRadius: "30px",
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  background: "linear-gradient(90deg, #06d6a0, #00E0FF)",
                  boxShadow: "0px 0px 15px rgba(0, 224, 255, 0.6)",
                  transform: "scale(1.05)",
                },
                alignSelf: "center",
                mt: 1,
              }}
            >
              🚀 Get AI Suggestions
            </Button>
          )}

          {messages[messages.length - 1].showTailorButton && (
            <Button
              onClick={handleTailorResume}
              sx={{
                background: "linear-gradient(135deg, #FFC107 0%, #FF9800 100%)",
                color: "#0A1929",
                fontWeight: "bold",
                padding: { xs: "10px 16px", sm: "10px 16px" },
                borderRadius: "30px",
                boxShadow: "0px 4px 10px rgba(255, 193, 7, 0.3)",
                textTransform: "none",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 6px 15px rgba(255, 193, 7, 0.4)",
                  background: "linear-gradient(135deg, #FF9800 0%, #FFC107 100%)",
                },
                alignSelf: "center",
                mt: 1,
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
              }}
            >
              🎯 Tailor My Resume
            </Button>
          )}

          {chatEnded && (
            <Button
              onClick={handleStartNewChat}
              sx={{
                background: "#FF5733",
                color: "#fff",
                fontWeight: "bold",
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                textTransform: "uppercase",
                padding: "12px 24px",
                borderRadius: "8px",
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                letterSpacing: "1px",
                transition: "all 0.3s ease-in-out",
                boxShadow: "0px 4px 8px rgba(255, 87, 51, 0.4)",
                "&:hover": {
                  background: "#E84118",
                  transform: "translateY(-2px)",
                  boxShadow: "0px 6px 12px rgba(255, 87, 51, 0.6)",
                },
                "&:active": {
                  transform: "translateY(1px)",
                  boxShadow: "none",
                },
                alignSelf: "center",
                mt: 2,
              }}
            >
              🔄 Start a New Chat
            </Button>
          )}
        </Paper>

        <InfoPanel />
      </Box>

      <Modal
        open={showJobModal}
        onClose={() => setShowJobModal(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: "#121E2E",
            padding: "25px",
            borderRadius: "16px",
            width: "90%",
            maxWidth: "420px",
            boxShadow: "0px 8px 20px rgba(0, 224, 255, 0.2)",
            border: "1px solid rgba(0, 224, 255, 0.2)",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              color: "#00E0FF",
              textAlign: "center",
              marginBottom: "15px",
              fontFamily: "'Inter', sans-serif",
              textShadow: "0px 3px 8px rgba(0, 224, 255, 0.3)",
              fontSize: { xs: "1.2rem", sm: "1.4rem" },
            }}
          >
            📄 Paste Job Description
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Paste Job Description..."
            onChange={(e) => setJobDescription(e.target.value)}
            InputProps={{
              sx: {
                background: "rgba(10, 25, 41, 0.7)",
                color: "#E0E0E0",
                borderRadius: "10px",
                padding: "12px",
                caretColor: "#00E0FF",
                fontSize: "0.9rem",
                fontFamily: "'Inter', sans-serif",
                "&::placeholder": { color: "#8FA3BF", opacity: 1 },
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgba(0, 224, 255, 0.3)" },
                "&:hover fieldset": { borderColor: "rgba(0, 224, 255, 0.5)" },
                "&.Mui-focused fieldset": {
                  borderColor: "#00E0FF",
                  boxShadow: "0px 0px 12px rgba(0, 224, 255, 0.3)",
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleJobDescriptionSubmit}
            sx={{
              marginTop: "20px",
              width: "100%",
              padding: "14px",
              fontWeight: "bold",
              fontSize: "0.9rem",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #00E0FF 0%, #06d6a0 100%)",
              boxShadow: "0px 4px 10px rgba(0, 224, 255, 0.3)",
              textTransform: "none",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.03)",
                boxShadow: "0px 6px 15px rgba(0, 224, 255, 0.4)",
                background: "linear-gradient(135deg, #06d6a0 0%, #00E0FF 100%)",
              },
              color: "#0A1929",
              letterSpacing: "0.5px",
            }}
          >
            🚀 Submit
          </Button>
        </motion.div>
      </Modal>

      <Modal
        open={showCooldownModal}
        onClose={() => setShowCooldownModal(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <Box
          sx={{
            background: "#121E2E",
            padding: "25px",
            borderRadius: "16px",
            width: "90%",
            maxWidth: "420px",
            margin: "auto",
            boxShadow: "0px 8px 20px rgba(0, 255, 198, 0.15)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "1px solid rgba(0, 255, 198, 0.3)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "#00FFC6",
              fontFamily: "'Inter', sans-serif",
              fontWeight: "bold",
              letterSpacing: "1px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: { xs: "1.2rem", sm: "1.4rem" },
            }}
          >
            ⏳ Chat Cooldown
          </Typography>
          <Typography
            sx={{
              fontSize: "0.9rem",
              color: "#BBBBBB",
              marginTop: "15px",
              fontFamily: "'Inter', sans-serif",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            AI suggestions use a paid service and are limited to one resume per hour.
            <br />
            Please come back in{" "}
            <strong style={{ color: "#FFD700", fontSize: "1rem" }}>{cooldownMinutes} minutes</strong>.
          </Typography>
          <Button
            onClick={() => setShowCooldownModal(false)}
            sx={{
              marginTop: "20px",
              background: "linear-gradient(90deg, #FF5733, #E84118)",
              color: "#fff",
              fontWeight: "bold",
              padding: "12px 30px",
              borderRadius: "10px",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0px 6px 15px rgba(255, 87, 51, 0.3)",
              },
              "&:active": {
                transform: "translateY(1px)",
                boxShadow: "none",
              },
            }}
          >
            ❌ Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}

export default App;