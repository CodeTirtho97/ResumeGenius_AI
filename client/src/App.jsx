import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
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
} from "react-icons/fa";

// Import custom components
import SkillsRadarChart from './components/SkillsRadarChart';
import TailoredBulletPoints from './components/TailoredBulletPoints';
import SkeletonLoader from './components/SkeletonLoader';
import ProcessingAnimation from './components/ProcessingAnimation';
import InfoPanel from './components/InfoPanel';
import BackgroundSVG from './components/BackgroundSVG';

function App() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hello! I'm <strong>ResumeGenius AI</strong>. Let's analyze your resume step by step." },
    { sender: "bot", text: "Do you want to upload your resume now?" },
  ]);
  const [showTyping, setShowTyping] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // States for job description and UI controls
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [chatEnded, setChatEnded] = useState(false);
  const [lastChatTimestamp, setLastChatTimestamp] = useState(localStorage.getItem("lastChatTimestamp") || null);
  const [showCooldownModal, setShowCooldownModal] = useState(false);
  const [cooldownMinutes, setCooldownMinutes] = useState(0);

  // States for skills matching and tailored content
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [tailoredBullets, setTailoredBullets] = useState([]);

  useEffect(() => {
    const lastTimestamp = localStorage.getItem("lastChatTimestamp");
    if (lastTimestamp) {
      const lastTime = new Date(lastTimestamp);
      const currentTime = new Date();
      const timeDiff = (currentTime - lastTime) / (1000 * 60); // Convert milliseconds to minutes
  
      if (timeDiff < 60) {
        setShowCooldownModal(true);
        setCooldownMinutes(Math.ceil(60 - timeDiff));
      }
    }
  }, []);  

  const handleUserResponse = (response) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: response, timestamp: new Date().toLocaleTimeString() },
    ]);

    if (response === "Yes ✅") {
      setShowTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Great! 📂 Upload your resume below." },
          { sender: "bot", text: "Waiting...", fileUpload: true },
        ]);
        setShowTyping(false);
      }, 1000);
    } else {
      setShowTyping(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "No worries! You can upload it later 😊." },
        ]);
        setShowTyping(false);
      }, 1000);
    }
  };

  const handleJobDescriptionSubmit = async () => {
    if (!file || !jobDescription.trim()) {
        setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Please upload a resume and provide a job description." }]);
        return;
    }

    setMessages((prev) => [
        ...prev,
        { sender: "user", text: "📄 Sent the Job Description" },
        { sender: "bot", showProcessingAnimation: true, processingText: "Analyzing resume & job match..." },
    ]);

    setShowJobModal(false);
    setShowTyping(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
        // Handle rate limiting response
        const response = await fetch(`${BACKEND_URL}/api/resume/analyze-resume`, {
            method: "POST",
            body: formData,
        });

        // Handle rate limiting response
        if (response.status === 429) {
            const rateLimitData = await response.json();
            
            setMessages((prev) => [
                ...prev.filter(msg => !msg.showProcessingAnimation),
                { 
                    sender: "bot", 
                    text: `⏳ Rate limit exceeded! You can analyze another resume in ${rateLimitData.cooldownMinutes} minutes.` 
                }
            ]);
            
            setShowCooldownModal(true);
            setCooldownMinutes(rateLimitData.cooldownMinutes);
            setShowTyping(false);
            return;
        }

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        // Store matched skills and calculate missing skills
        setMatchedSkills(data.matchedSkills || []);
        
        // Extract missing skills from job description
        const missingSkills = data.extractedSkills ? 
            data.extractedSkills.filter(skill => !data.matchedSkills.includes(skill)) : [];
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
            ...prev.filter(msg => !msg.showProcessingAnimation),
            { 
                sender: "bot", 
                text: `Your ATS Score: <strong>${data.scorePercentage}%</strong> ${feedback}`,
                showSkillsRadar: true
            },
            { 
                sender: "bot", 
                text: "Would you like me to tailor your resume for this job?",
                showTailorButton: true
            },
            { 
                sender: "bot", 
                text: "Would you like AI-powered suggestions to improve your resume?", 
                aiSuggestionRequest: true 
            },
        ]);
    } catch (error) {
        setMessages((prev) => [
            ...prev.filter(msg => !msg.showProcessingAnimation),
            { sender: "bot", text: "⚠️ Error processing resume. Please try again!" },
        ]);
    }

    setShowTyping(false);
};

const handleAiSuggestionRequest = async () => {
  setMessages((prev) => [
    ...prev,
    { sender: "user", text: "Yes ✅" },
    { sender: "bot", showProcessingAnimation: true, processingText: "Fetching AI-powered resume suggestions... 🤖" },
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

    // Extract & clean up AI suggestions
    let aiSuggestions = data.aiSuggestions.map((suggestion) => suggestion.trim()).filter((s) => s !== "");

    // Ensure exactly 5 suggestions
    if (aiSuggestions.length > 5) {
      aiSuggestions = aiSuggestions.slice(1, 6); // Take the first 5 suggestions
    } else {
      while (aiSuggestions.length < 5) {
        aiSuggestions.push("More details can improve this section."); // Fill up to 5
      }
    }

    // Check if there's an extra conclusion message (more than 5)
    let conclusionMessage = "";
    if (data.aiSuggestions.length > 5) {
      conclusionMessage = `<p style="margin-top: 10px; font-size: 14px; color: #780000;">
        ${data.aiSuggestions[data.aiSuggestions.length - 1]}
      </p>`;
    }

    // Formatting function for bold text
    const formatTextWithStrongTags = (text) => {
      return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); // Converts **bold** to <strong>bold</strong>
    };

    // Format AI suggestions dynamically
    const formattedAiSuggestions = aiSuggestions.map((suggestion) => `
      <div style="background: #2d3748; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
        <span style="color: #00FF7F;">✔️</span>
        <span style="color: #D1D5DB;"> ${formatTextWithStrongTags(suggestion)}</span>
      </div>
    `).join("");

    // Final structured message
    const finalMessage = `
      <div style="background-color: #ffd166; padding: 15px; border-radius: 10px; color: #780000; font-family: 'Poppins', sans-serif;">
        <p><strong>🚀 AI-Suggested Resume Improvements</strong></p>
        ${formattedAiSuggestions}
        ${conclusionMessage} <!-- Displayed separately if present -->
      </div>
    `;

    setMessages((prev) => [
      ...prev.filter(msg => !msg.showProcessingAnimation),
      { sender: "bot", text: finalMessage },
      { sender: "bot", text: "🎉 Thank you for using ResumeGenius AI! Hope you'll improve and succeed in job selection! 🎯" },
    ]);

    setChatEnded(true);
    const timestamp = new Date().toISOString();
    localStorage.setItem("lastChatTimestamp", timestamp);
    setLastChatTimestamp(timestamp);
  } catch (error) {
    setMessages((prev) => [
      ...prev.filter(msg => !msg.showProcessingAnimation),
      { sender: "bot", text: "⚠️ Oops! AI suggestions couldn't be fetched. Try again after a few mins!" },
    ]);
  }

  setShowTyping(false);
};

const handleTailorResume = async () => {
  setMessages((prev) => [
    ...prev,
    { sender: "user", text: "🎯 Tailor my resume to this job" },
    { sender: "bot", showProcessingAnimation: true, processingText: "Generating tailored resume bullet points..." },
  ]);
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/resume/tailor-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        resumeText: "Your resume text will need to be extracted here", // You'll need to modify this 
        jobDescription 
      }),
    });
    
    const data = await response.json();
    
    if (data.tailoredBullets) {
      setTailoredBullets(data.tailoredBullets);
      
      setMessages((prev) => [
        ...prev.filter(msg => !msg.showProcessingAnimation),
        { sender: "bot", text: "✅ Here are your tailored resume bullet points:" },
        { sender: "bot", showTailoredBulletsComponent: true }
      ]);
    } else {
      throw new Error("Failed to generate tailored bullet points");
    }
  } catch (error) {
    setMessages((prev) => [
      ...prev.filter(msg => !msg.showProcessingAnimation),
      { sender: "bot", text: "❌ Sorry, I couldn't generate tailored bullet points. Please try again." }
    ]);
  }
};

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Oops! No file selected. Please try again." },
      ]);
      return;
    }

    setFile(uploadedFile);
    setMessages((prev) => [
      ...prev.filter((msg) => !msg.fileUpload),
      { sender: "user", text: `📎 ${uploadedFile.name}`, timestamp: new Date().toLocaleTimeString() },
      { sender: "bot", text: "Got it! Let's move forward to the next step." },
    ]);

    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Got it! Now, would you like to provide a job description?" },
      { sender: "bot", jobDescriptionRequest: true }, // This flag ensures chat will wait for user input
    ]);
  };

  const handleStartNewChat = () => {
    const lastTimestamp = localStorage.getItem("lastChatTimestamp");
    if (lastTimestamp) {
      const lastTime = new Date(lastTimestamp);
      const currentTime = new Date();
      const timeDiff = (currentTime - lastTime) / (1000 * 60); // Convert milliseconds to minutes
  
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

      {/* App Header with improved styling */}
      <Box 
        sx={{ 
          textAlign: "center", 
          marginBottom: "30px",
          background: 'rgba(10, 25, 41, 0.4)',
          padding: '1.5rem',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          width: { xs: '95%', md: '70%', lg: '60%' },
          maxWidth: '800px',
          // Add pulse animation to the title glow
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(0, 224, 255, 0.15) 0%, rgba(0, 224, 255, 0) 70%)',
            borderRadius: '16px',
            zIndex: -1,
            animation: 'pulse 8s infinite',
          },
          '@keyframes pulse': {
            '0%': { opacity: 0.5 },
            '50%': { opacity: 0.8 },
            '100%': { opacity: 0.5 },
          },
        }}
      >
        <Typography
          variant="h2"
          fontWeight="bold"
          sx={{
            color: "#00E0FF",
            textShadow: "0px 3px 8px rgba(0, 224, 255, 0.4)",
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
            letterSpacing: '-0.01em',
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
            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.25rem' },
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
          }}
        >
          Resume Analyzer & ATS Optimizer
        </Typography>
      </Box>

      {/* Main content area */}
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
        {/* Chat Window */}
        <Paper
          sx={{
            flex: "3",
            height: { xs: "60vh", sm: "70vh" },
            width: { xs: "95%", sm: "90%", md: "80%", lg: "auto" },
            backgroundColor: "rgba(18, 30, 46, 0.7)", // More transparent
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
            backdropFilter: "blur(10px)", // Add blur effect for glass morphism
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'rgba(255, 255, 255, 0.25)',
            },
          }}
        >
          {/* Chat Header - Improved styling */}
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
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
              }}
            >
              <FaRobot style={{ color: "#00E0FF" }} /> Resume Bot
            </Typography>
            <Typography 
              variant="body2" 
              sx={{
                color: chatEnded ? "#FFA500" : "#36B37E",
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {chatEnded ? (
                <>
                  Last seen on {new Date(lastChatTimestamp).toLocaleString()} 
                </>
              ) : (
                <>
                  Online <span style={{ color: "#36B37E", fontSize: '8px', marginLeft: '4px' }}>●</span>
                </>
              )}
            </Typography>
          </Box>

          {/* Improved message bubbles styling */}
          {messages.map((msg, index) =>
            msg.fileUpload ? (
              <motion.div
                key={index}
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
                <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>📂 Upload your resume:</Typography>
                <Tooltip title="Attach a File">
                  <IconButton 
                    onClick={() => fileInputRef.current.click()} 
                    color="warning"
                    sx={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: 'rgba(255, 160, 0, 0.1)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 160, 0, 0.2)',
                        transform: 'scale(1.05)',
                      }
                    }}
                  >
                    <FaPaperclip />
                  </IconButton>
                </Tooltip>
                <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
              </motion.div>
            ) : msg.showProcessingAnimation ? (
              <ProcessingAnimation key={index} text={msg.processingText} />
            ) : (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  background: msg.sender === "user" 
                    ? "linear-gradient(135deg, #00ADB5 0%, #0097A7 100%)" 
                    : "rgba(57, 62, 70, 0.6)",
                  color: msg.sender === "user" ? "white" : "#E0E0E0",
                  padding: "12px 16px",
                  borderRadius: msg.sender === "user" 
                    ? "15px 15px 0 15px" 
                    : "15px 15px 15px 0",
                  maxWidth: "75%",
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
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
                  <FaUser style={{ marginTop: '3px', minWidth: '14px' }} />
                ) : (
                  <FaRobot style={{ marginTop: '3px', minWidth: '14px', color: '#00E0FF' }} />
                )}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                  
                  {msg.timestamp && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        opacity: 0.7, 
                        fontSize: '10px',
                        alignSelf: 'flex-end',
                        mt: 0.5
                      }}
                    >
                      {msg.timestamp}
                    </Typography>
                  )}
                  
                  {/* Skills Radar Chart */}
                  {msg.showSkillsRadar && (
                    <SkillsRadarChart matchedSkills={matchedSkills} missingSkills={missingSkills} />
                  )}
                  
                  {/* Tailored Bullets Component */}
                  {msg.showTailoredBulletsComponent && (
                    <TailoredBulletPoints tailoredBullets={tailoredBullets} />
                  )}
                </Box>
              </motion.div>
            )
          )}

          {/* Show typing indicator */}
          {showTyping && <SkeletonLoader />}

          {/* User Response Options - Improved styling */}
          {messages[messages.length - 1].text === "Do you want to upload your resume now?" && (
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: "10px",
              mt: 1,
            }}>
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<FaCheck />} 
                onClick={() => handleUserResponse("Yes ✅")}
                sx={{
                  background: 'linear-gradient(135deg, #36B37E 0%, #2D9E6D 100%)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2D9E6D 0%, #36B37E 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 15px rgba(54, 179, 126, 0.4)',
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
                  background: 'linear-gradient(135deg, #FF5757 0%, #FF3131 100%)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FF3131 0%, #FF5757 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 15px rgba(255, 87, 87, 0.4)',
                  },
                  fontWeight: 600,
                  px: 3,
                }}
              >
                NO
              </Button>
            </Box>
          )}

          {/* Provide Job Description Button - Improved styling */}
          {messages[messages.length - 1].jobDescriptionRequest && (
            <Button
              onClick={() => setShowJobModal(true)}
              sx={{
                background: "linear-gradient(135deg, #00E0FF 0%, #06d6a0 100%)",
                color: "#0A1929",
                fontWeight: "bold",
                fontSize: { xs: '0.9rem', sm: '1rem' },
                padding: { xs: '10px 14px', sm: '10px 16px' },
                borderRadius: "30px",
                boxShadow: "0px 4px 10px rgba(0, 224, 255, 0.2)",
                textTransform: "none",
                transition: "all 0.2s ease-in-out",
                '&:hover': {
                  transform: "scale(1.05)",
                  boxShadow: "0px 6px 15px rgba(0, 224, 255, 0.4)",
                  background: "linear-gradient(135deg, #06d6a0 0%, #00E0FF 100%)",
                },
                alignSelf: 'center',
                mt: 1,
              }}
            >
              🚀 Provide Job Description
            </Button>
          )}

          {/* AI Suggestions Button - Improved styling */}
          {messages[messages.length - 1].aiSuggestionRequest && (
            <Button
              onClick={handleAiSuggestionRequest}
              sx={{
                background: "linear-gradient(90deg, #00E0FF, #06d6a0)",
                color: "#0A1929",
                fontWeight: "bold",
                textTransform: "uppercase",
                padding: { xs: '10px 16px', sm: '12px 20px' },
                borderRadius: "30px",
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                fontFamily: "'Inter', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.3s ease-in-out",
                '&:hover': {
                  background: "linear-gradient(90deg, #06d6a0, #00E0FF)",
                  boxShadow: "0px 0px 15px rgba(0, 224, 255, 0.6)",
                  transform: "scale(1.05)",
                },
                alignSelf: 'center',
                mt: 1,
              }}
            >
              🚀 Get AI Suggestions
            </Button>
          )}

          {/* Tailor Resume Button - Add this for the new feature */}
          {messages[messages.length - 1].showTailorButton && (
            <Button
              onClick={handleTailorResume}
              sx={{
                background: "linear-gradient(135deg, #FFC107 0%, #FF9800 100%)",
                color: "#0A1929",
                fontWeight: "bold",
                padding: { xs: '10px 16px', sm: '10px 16px' },
                borderRadius: "30px",
                boxShadow: "0px 4px 10px rgba(255, 193, 7, 0.3)",
                textTransform: "none",
                transition: "all 0.2s ease-in-out",
                '&:hover': {
                  transform: "scale(1.05)",
                  boxShadow: "0px 6px 15px rgba(255, 193, 7, 0.4)",
                  background: "linear-gradient(135deg, #FF9800 0%, #FFC107 100%)",
                },
                alignSelf: 'center',
                mt: 1,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
              }}
            >
              🎯 Tailor My Resume
            </Button>
          )}

          {/* Start New Chat Button - Improved styling */}
          {chatEnded && (
            <Button
              onClick={handleStartNewChat}
              sx={{
                background: "#FF5733",
                color: "#fff",
                fontWeight: "bold",
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
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
                '&:hover': {
                  background: "#E84118",
                  transform: "translateY(-2px)",
                  boxShadow: "0px 6px 12px rgba(255, 87, 51, 0.6)",
                },
                '&:active': {
                  transform: "translateY(1px)",
                  boxShadow: "none",
                },
                alignSelf: 'center',
                mt: 2,
              }}
            >
              🔄 Start a New Chat
            </Button>
          )}
        </Paper>

        <InfoPanel />
        
      </Box>

      {/* Job Description Modal - Improved styling */}
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
              fontSize: { xs: '1.2rem', sm: '1.4rem' },
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
                '&::placeholder': { color: "#8FA3BF", opacity: 1 },
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: "rgba(0, 224, 255, 0.3)" },
                '&:hover fieldset': { borderColor: "rgba(0, 224, 255, 0.5)" },
                '&.Mui-focused fieldset': {
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
              '&:hover': {
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

      {/* Cooldown Modal - Improved styling */}
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
          {/* Cooldown Title */}
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
              fontSize: { xs: '1.2rem', sm: '1.4rem' },
            }}
          >
            ⏳ Chat Cooldown
          </Typography>

          {/* Info Text */}
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
            <strong style={{ color: "#FFD700", fontSize: "1rem" }}>
              {cooldownMinutes} minutes
            </strong>.
          </Typography>

          {/* Exit Button */}
          <Button
            onClick={() => {
              setShowCooldownModal(false);
            }}
            sx={{
              marginTop: "20px",
              background: "linear-gradient(90deg, #FF5733, #E84118)",
              color: "#fff",
              fontWeight: "bold",
              padding: "12px 30px",
              borderRadius: "10px",
              transition: "all 0.2s ease-in-out",
              '&:hover': {
                transform: "translateY(-2px)",
                boxShadow: "0px 6px 15px rgba(255, 87, 51, 0.3)",
              },
              '&:active': {
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