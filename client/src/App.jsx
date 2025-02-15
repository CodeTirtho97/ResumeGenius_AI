import { useState, useRef } from "react";
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

import { useEffect } from "react";

function App() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hello! I'm <strong>ResumeGenius AI</strong>. Let's analyze your resume step by step." },
    { sender: "bot", text: "Do you want to upload your resume now?" },
  ]);
  const [showTyping, setShowTyping] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // ✅ Add these missing state variables
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobDescription, setJobDescription] = useState("");

  const [chatEnded, setChatEnded] = useState(false);
  const [lastChatTimestamp, setLastChatTimestamp] = useState(localStorage.getItem("lastChatTimestamp") || null);

  useEffect(() => {
    const lastTimestamp = localStorage.getItem("lastChatTimestamp");
    if (lastTimestamp) {
      const lastTime = new Date(lastTimestamp);
      const currentTime = new Date();
      const timeDiff = (currentTime - lastTime) / (1000 * 60); // Convert milliseconds to minutes
  
      if (timeDiff < 60) {
        setShowCooldownModal(true); // ✅ Auto-show cooldown modal
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
        { sender: "bot", text: "Processing your resume... ⏳" },
    ]);

    setShowJobModal(false);
    setShowTyping(true);

    // ✅ Send Correct FormData
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
        const response = await fetch("http://localhost:5000/api/resume/analyze-resume", {
            method: "POST",
            body: formData, // ✅ Using FormData instead of JSON
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

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
            ...prev,
            { sender: "bot", text: `Your ATS Score: <strong>${data.scorePercentage}%</strong> ${feedback}` },
            { sender: "bot", text: "Would you like AI-powered suggestions to improve your resume?" },
            { sender: "bot", aiSuggestionRequest: true },
        ]);
    } catch (error) {
        setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "⚠️ Error processing resume. Please try again!" },
        ]);
    }

    setShowTyping(false);
};

const handleAiSuggestionRequest = async () => {
  setMessages((prev) => [
    ...prev,
    { sender: "user", text: "Yes ✅" },
    { sender: "bot", text: "Fetching AI-powered resume suggestions... 🤖" },
  ]);

  setShowTyping(true);

  try {
    const response = await fetch("http://localhost:5000/api/resume/get-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeData: file, jobDescription }),
    });

    const data = await response.json();

    if (!Array.isArray(data.aiSuggestions) || data.aiSuggestions.length === 0) {
      throw new Error("Invalid AI suggestions format");
    }

    // 🔹 Extract & clean up AI suggestions
    let aiSuggestions = data.aiSuggestions.map((suggestion) => suggestion.trim()).filter((s) => s !== "");

    // 🔹 Ensure exactly 5 suggestions
    if (aiSuggestions.length > 5) {
      aiSuggestions = aiSuggestions.slice(1, 6); // Take the first 5 suggestions
    } else {
      while (aiSuggestions.length < 5) {
        aiSuggestions.push("More details can improve this section."); // Fill up to 5
      }
    }

    // 🔹 Check if there's an extra conclusion message (more than 5)
    let conclusionMessage = "";
    if (data.aiSuggestions.length > 5) {
      conclusionMessage = `<p style="margin-top: 10px; font-size: 14px; color: #780000;">
        ${data.aiSuggestions[data.aiSuggestions.length - 1]}
      </p>`;
    }

    // 🔹 Formatting function for bold text
    const formatTextWithStrongTags = (text) => {
      return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); // Converts **bold** to <strong>bold</strong>
    };

    // 🔹 Format AI suggestions dynamically
    const formattedAiSuggestions = aiSuggestions.map((suggestion) => `
      <div style="background: #2d3748; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
        <span style="color: #00FF7F;">✔️</span>
        <span style="color: #D1D5DB;"> ${formatTextWithStrongTags(suggestion)}</span>
      </div>
    `).join("");

    // 🔹 Final structured message
    const finalMessage = `
      <div style="background-color: #ffd166; padding: 15px; border-radius: 10px; color: #780000; font-family: 'Poppins', sans-serif;">
        <p><strong>🚀 AI-Suggested Resume Improvements</strong></p>
        ${formattedAiSuggestions}
        ${conclusionMessage} <!-- Displayed separately if present -->
      </div>
    `;

    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: finalMessage },
      { sender: "bot", text: "🎉 Thank you for using ResumeGenius AI! Hope you'll improve and succeed in job selection! 🎯" },
    ]);

    setChatEnded(true);
    const timestamp = new Date().toISOString();
    localStorage.setItem("lastChatTimestamp", timestamp);
    setLastChatTimestamp(timestamp);
  } catch (error) {
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "⚠️ Oops! AI suggestions couldn't be fetched. Try again after a few mins!" },
    ]);
  }

  setShowTyping(false);
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
        setShowCooldownModal(true); // ✅ Show cooldown modal instead of starting chat
        return;
      }
    }
  
    window.location.reload(); // ✅ Restart chat normally if cooldown is over
  };

  const [showCooldownModal, setShowCooldownModal] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #1B1B1B, #2A2A2A)",
        padding: "30px",
        display: "flex",
        flexDirection: "column", // ✅ Keeps heading centered
        alignItems: "center",
        marginBottom: "20px",
        overflow: "hidden"
      }}
    >
      {/* Heading and Subheading */}
      <Box sx={{ textAlign: "center", marginBottom: "30px" }}>
        <Typography
          variant="h2"
          fontWeight="bold"
          sx={{
            fontFamily: "'Poppins', sans-serif",
            color: "#00E0FF",
            letterSpacing: "1px",
            textShadow: "0px 3px 8px rgba(0, 224, 255, 0.4)",
          }}
        >
          ResumeGenius <span style={{ color: "#00FFC6" }}>AI</span>
        </Typography>

        <Typography
          variant="h5"
          fontWeight="medium"
          sx={{
            fontFamily: "'Raleway', sans-serif",
            color: "#06d6a0",
            letterSpacing: "0.8px",
            fontStyle: "italic",
            textShadow: "0px 3px 6px rgba(6, 214, 160, 0.5)",
            marginTop: "5px",
          }}
        >
          Resume Analyzer & ATS Optimizer
        </Typography>

        {/* <Typography
          variant="body1"
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            textAlign: "center",
            color: "#EEEEEE",
            letterSpacing: "0.5px",
            lineHeight: "1.5",
            background: "linear-gradient(to right, #00E0FF, #06d6a0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "14px",
            marginBottom: "20px",
          }}
        >
          A sleek and interactive AI-powered tool to optimize your resume for Applicant Tracking Systems.
        </Typography> */}
      </Box>

      {/* Chat Window - Centered */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          maxWidth: "1200px",
          width: "100%",
          alignItems: "flex-start",
        }}
      >
        {/* ✅ Chat Window */}
        <Paper
          sx={{
            flex: "3",
            height: "70vh",
            backgroundColor: "#222831",
            borderRadius: "18px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
            padding: "20px",
            paddingBottom: "25px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            color: "white",
          }}
        >
          {/* ✅ Chat Header */}
          <Box
            sx={{
              position: "sticky",
              top: "0",
              zIndex: "10",
              background: "#1B1B1B",
              padding: "15px",
              borderRadius: "12px 12px 0 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "white" }}>
              Resume Bot
            </Typography>
            <Typography variant="body2" color={chatEnded ? "#FFA500" : "#00FF00"}>
              {chatEnded ? `Last seen on ${new Date(lastChatTimestamp).toLocaleString()}` : "Online 🟢"}
            </Typography>
          </Box>
            {messages.map((msg, index) =>
              msg.fileUpload ? (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    alignSelf: "flex-start",
                    background: "#393e46",
                    padding: "12px",
                    borderRadius: "15px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Typography>📂 Upload your resume:</Typography>
                  <Tooltip title="Attach a File">
                    <IconButton onClick={() => fileInputRef.current.click()} color="warning">
                      <FaPaperclip />
                    </IconButton>
                  </Tooltip>
                  <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
                </motion.div>
              ) : (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    background: msg.sender === "user" ? "#00ADB5" : "#393E46",
                    color: msg.sender === "user" ? "white" : "lightgray",
                    padding: "12px",
                    borderRadius: "15px",
                    maxWidth: "75%",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {msg.sender === "user" ? <FaUser /> : <FaRobot />}
                  <span dangerouslySetInnerHTML={{ __html: msg.text }} />
                  <Typography variant="caption" sx={{ opacity: 0.7, fontSize: "10px" }}>
                    {msg.timestamp}
                  </Typography>
                </motion.div>
              )
            )}

        {/* User Response Options */}
        {messages[messages.length - 1].text === "Do you want to upload your resume now?" && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <Button variant="contained" color="success" startIcon={<FaCheck />} onClick={() => handleUserResponse("Yes ✅")}>
              YES
            </Button>
            <Button variant="contained" color="error" startIcon={<FaTimes />} onClick={() => handleUserResponse("No ❌")}>
              NO
            </Button>
          </Box>
        )}
        {messages[messages.length - 1].jobDescriptionRequest && (
        <Button
        onClick={() => setShowJobModal(true)}
        sx={{
          background: "linear-gradient(135deg, #00E0FF 0%, #06d6a0 100%)", // ✅ Gradient matching theme
          color: "white",
          fontWeight: "bold",
          fontSize: "16px",
          padding: "10px 16px",
          borderRadius: "30px", // ✅ Rounded look
          boxShadow: "0px 4px 10px rgba(0, 224, 255, 0.2)", // ✅ Subtle glow effect
          textTransform: "none",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.05)", // ✅ Slight pop effect
            boxShadow: "0px 6px 15px rgba(0, 224, 255, 0.4)",
            background: "linear-gradient(135deg, #06d6a0 0%, #00E0FF 100%)", // ✅ Reversed gradient on hover
          },
        }}
      >
        🚀 Provide Job Description
      </Button>
        )}

      <Modal
        open={showJobModal}
        onClose={() => setShowJobModal(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backdropFilter: "blur(6px)", // ✅ Smooth blur effect for background
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: "#1E1E1E", // ✅ Dark theme background
            padding: "25px",
            borderRadius: "12px",
            width: "420px",
            boxShadow: "0px 8px 20px rgba(0, 224, 255, 0.2)", // ✅ Glowing shadow effect
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              color: "#00E0FF",
              textAlign: "center",
              marginBottom: "15px",
              fontFamily: "'Poppins', sans-serif",
              textShadow: "0px 3px 8px rgba(0, 224, 255, 0.5)",
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
                background: "#1E1E1E", // ✅ Dark background inside textarea
                color: "#E0E0E0", // ✅ Light text color for visibility
                borderRadius: "8px",
                padding: "12px",
                caretColor: "#00E0FF", // ✅ Ensure blinking cursor is visible
                fontSize: "14px",
                fontFamily: "'Poppins', sans-serif",
                "&::placeholder": { color: "#8FA3BF", opacity: 1 }, // ✅ Improve placeholder visibility
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#00E0FF" },
                "&:hover fieldset": { borderColor: "#06d6a0" },
                "&.Mui-focused fieldset": {
                  borderColor: "#06d6a0",
                  boxShadow: "0px 0px 12px rgba(0, 224, 255, 0.6)", // ✅ Better glow effect on focus
                },
              },
            }}
          />

          <Button
            variant="contained"
            onClick={handleJobDescriptionSubmit}
            sx={{
              marginTop: "15px",
              width: "100%",
              padding: "12px",
              fontWeight: "bold",
              fontSize: "14px",
              borderRadius: "30px",
              background: "linear-gradient(135deg, #00E0FF 0%, #06d6a0 100%)",
              boxShadow: "0px 4px 10px rgba(0, 224, 255, 0.3)",
              textTransform: "none",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0px 6px 15px rgba(0, 224, 255, 0.4)",
                background: "linear-gradient(135deg, #06d6a0 0%, #00E0FF 100%)",
              },
            }}
          >
            🚀 Submit
          </Button>
        </motion.div>
      </Modal>

      {messages[messages.length - 1].aiSuggestionRequest && (
        <Button
        onClick={handleAiSuggestionRequest}
        sx={{
          background: "linear-gradient(90deg, #00E0FF, #06d6a0)", // ✅ Gradient theme
          color: "#0F172A", // ✅ Dark text for contrast
          fontWeight: "bold",
          textTransform: "uppercase",
          padding: "12px 20px",
          borderRadius: "30px", // ✅ Rounded design
          fontSize: "14px",
          fontFamily: "'Poppins', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            background: "linear-gradient(90deg, #06d6a0, #00E0FF)", // ✅ Reverse gradient on hover
            boxShadow: "0px 0px 15px rgba(0, 224, 255, 0.6)", // ✅ Glowing effect
            transform: "scale(1.05)", // ✅ Slight bounce effect
          },
        }}
      >
        🚀 Get AI Suggestions
      </Button>
      )}
      {/* ✅ Start New Chat Button */}
      {chatEnded && (
        <Button
        onClick={handleStartNewChat}
        sx={{
          background: "#FF5733", // ✅ Bold primary color (Not gradient)
          color: "#fff",
          fontWeight: "bold",
          fontSize: "14px",
          textTransform: "uppercase",
          padding: "12px 24px",
          borderRadius: "8px", // ✅ Slightly rounded edges (Not pill-shaped like other buttons)
          fontFamily: "'Poppins', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          letterSpacing: "1px",
          transition: "all 0.3s ease-in-out",
          boxShadow: "0px 4px 8px rgba(255, 87, 51, 0.4)", // ✅ Soft shadow
          "&:hover": {
            background: "#E84118", // ✅ Darker red shade on hover
            transform: "translateY(-2px)", // ✅ Floating effect
            boxShadow: "0px 6px 12px rgba(255, 87, 51, 0.6)", // ✅ Enhanced shadow on hover
          },
          "&:active": {
            transform: "translateY(1px)", // ✅ Slight downward press effect
            boxShadow: "none", // ✅ Removes shadow on click
          },
        }}
      >
        🔄 Start a New Chat
      </Button>
      )}
    </Paper>

    {/* ✅ Cooldown Modal Auto-Shows & Forces Exit */}
    <Modal open={showCooldownModal} onClose={() => setShowCooldownModal(true)}>
      <Box
        sx={{
          background: "#1F1F1F",
          padding: "25px",
          borderRadius: "12px",
          width: "420px",
          margin: "auto",
          boxShadow: "0px 8px 20px rgba(0, 255, 198, 0.2)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "2px solid #00FFC6",
        }}
      >
        {/* 🔥 Cooldown Title */}
        <Typography
          variant="h5"
          sx={{
            color: "#00FFC6",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: "bold",
            letterSpacing: "1px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ⏳ Chat Cooldown
        </Typography>

        {/* ℹ️ Info Text */}
        <Typography
          sx={{
            fontSize: "15px",
            color: "#BBBBBB",
            marginTop: "15px",
            fontFamily: "'Raleway', sans-serif",
            textAlign: "center",
          }}
        >
          AI suggestions use a paid service and are limited to one resume per hour.
          <br />
          Please come back in{" "}
          <strong style={{ color: "#FFD700", fontSize: "16px" }}>
            {Math.ceil(60 - ((new Date() - new Date(lastChatTimestamp)) / (1000 * 60)))} minutes
          </strong>.
        </Typography>

        {/* 🚀 Force Exit Button */}
        <Button
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back(); // ✅ Go back if possible
            } else {
              window.location.href = "about:blank"; // ✅ Redirect to a blank page as a fallback
            }
          }}
          sx={{
            marginTop: "20px",
            background: "linear-gradient(90deg, #FF5733, #E84118)",
            color: "#fff",
            fontWeight: "bold",
            padding: "12px 30px",
            borderRadius: "8px",
          }}
        >
          ❌ Exit Now
        </Button>
      </Box>
    </Modal>

      {/* Info Panel - Right Side */}
      <Paper
        sx={{
          flex: "1.5",
          height: "70vh",
          backgroundColor: "#1F2937",
          color: "white",
          borderRadius: "15px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
          padding: "25px",
          marginBottom: "30px", // ✅ Fixes bottom cutoff issue
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          <FaInfoCircle /> Info Panel
        </Typography>
        <Divider sx={{ background: "#4B5563", marginY: "10px" }} />
        <Typography variant="h5">
          <strong>📌 How to Use:</strong> 
        </Typography>
        <ul style={{ paddingLeft: "20px" }}>
          <li>Upload your resume (PDF only).</li>
          <li>Provide a job description to analyze match score.</li>
          <li>Receive AI suggestions for resume improvements.</li>
        </ul>
        <Divider sx={{ background: "#4B5563", marginY: "10px" }} />
        <Typography variant="h5">
          <strong>🔍 AI-Powered Analysis:</strong> 
        </Typography>
        <ul style={{ paddingLeft: "20px" }}>
          <li>Calculates ATS match score.</li>
          <li>Identifies missing keywords & skills.</li>
          <li>Suggests modifications for better job fit.</li>
        </ul>
        <Divider sx={{ background: "#4B5563", marginY: "10px" }} />
        <Typography variant="h5">
          <strong>⚠️ AI Usage Limitation:</strong> 
        </Typography>
        <ul style={{ paddingLeft: "20px" }}>
          <li>One resume analysis per hour.</li>
          <li>Results are stored locally for future reference.</li>
        </ul>
      </Paper>
    </Box>
  </Box>
  );
}

export default App;