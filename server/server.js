const express = require("express");
const cors = require("cors");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();

// ✅ Middleware Setup
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Enable JSON request body parsing
app.use(express.urlencoded({ extended: true })); // Allow URL-encoded data

// ✅ Health Check Route (To check if the server is running)
app.get("/", (req, res) => {
    res.send("✅ ResumeGenius AI Server is Running!");
});

// ✅ Register API Routes
app.use("/api/resume", resumeRoutes);  // Ensure this line exists

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));