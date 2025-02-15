# 🚀 ResumeGenius AI - Resume Analyzer & ATS Optimizer

ResumeGenius AI is an **AI-powered resume analysis and optimization tool** that helps job seekers improve their resumes by matching them against job descriptions and providing **ATS-friendly** enhancements. It leverages **OpenAI's GPT-4**, **resume parsing algorithms**, and **intelligent job-resume matching** to help candidates optimize their applications for better job selection chances.



---

## 🔥 Features

✔ **AI-Powered Resume Analysis** – Extracts and evaluates key resume sections  
✔ **ATS Compatibility Scoring** – Matches resumes against job descriptions  
✔ **AI Resume Optimization** – Provides structured suggestions for improvement  
✔ **Skill Gap Analysis** – Identifies missing skills & recommends additions  
✔ **Automated File Cleanup** – Deletes resume files post-processing  
✔ **Interactive UI/UX** – Uses Framer Motion for smooth animations  
✔ **Fullstack Implementation** – React frontend with Node.js backend  

---

## 🌐 Live Demo

🔗 **Live Website:** [ResumeGenius AI](https://resume-genius-ai.vercel.app/)

---

## 📸 Screenshots

### 🏆 AI-powered Resume Analysis


### 🎯 AI Suggestions & Skill Gap Analysis


---

## ⚙️ Tech Stack

### **Frontend**
- ⚛️ **React.js** – Modern UI framework  
- 🎨 **Material UI** – Sleek and responsive UI components  
- 🎭 **Framer Motion** – Smooth animations  

### **Backend**
- 🌍 **Node.js & Express.js** – REST API for resume analysis  
- 🛠 **OpenAI API** – AI-powered resume improvement suggestions  
- 📜 **PDF-Parse** – Extracts text from uploaded resumes  
- 🔍 **Natural.js** – Text analysis and similarity matching  
- 🛢 **MongoDB** – Temporary file storage for analysis  

---

## 🏗 Folder Structure
    ```bash
    /ResumeGenius_AI
    │── /client                # React frontend
    │   ├── /src
    │   │   ├── /components    # UI Components
    │   │   ├── /pages         # Main Pages
    │   │   ├── App.js         # Root Component
    │   │   ├── index.js       # React Entry Point
    │── /server                # Node.js backend
    │   ├── /controllers       # Business Logic
    │   ├── /routes            # Express API Routes
    │   ├── /uploads           # Temporary Resume Uploads
    │   ├── server.js          # Express Server
    │── package.json           # Dependencies
    │── README.md              # Documentation
    ```

---

## 🚀 Installation & Setup

### **1️⃣ Clone the Repository**
    ```bash
    git clone https://github.com/CodeTirtho97/ResumeGenius-AI.git
    cd ResumeGenius-AI
    ```
### 2️⃣ Install Dependencies
    ```bash
    # Install frontend dependencies
    cd client
    npm install

    # Install backend dependencies
    cd ../server
    npm install
    ```

### 3️⃣ Set Up Environment Variables
    Create a .env file inside the /server folder and add:
    ```bash
    OPENAI_API_KEY=your_openai_api_key
    PORT=5000
    ```

### 4️⃣ Run the Project
    ```bash
    # Start backend
    cd server
    node server.js

    # Start frontend
    cd ../client
    npm start
    ```
    Now visit http://localhost:3000 in your browser.

---

## 🎯 API Endpoints
### Resume Upload & Parsing
    ```bash
    POST /api/resume/analyze-resume
    ```
    - Uploads resume, extracts text, and generates ATS match score.
    - Body: FormData { resume: file }
    - Response: { scorePercentage, matchedSkills, extractedEducation, extractedJobTitles }

### Get AI Suggestions
    ```bash
    POST /api/resume/get-suggestions
    ```
    - Generates AI-powered resume improvements.
    - Body: { resumeData: object, jobDescription: string }
    - Response: { aiSuggestions: [ "Improve bullet points", "Add technical keywords", ... ] }

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to check the issues page.

---

## 📜 License
This project is licensed under the MIT License.