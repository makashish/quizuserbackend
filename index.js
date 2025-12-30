require("dotenv").config(); // Load .env variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ Connection error:", err));

// ✅ Mongoose Schemas
const SubjectSchema = new mongoose.Schema({
  id: Number,
  name: String,
});

const QuestionSchema = new mongoose.Schema({
  id: Number,
  subjectId: String,       // Link question to a subject
  question: Object,        // Can store language-based questions, e.g., { en: "Q?", hi: "प्रश्न?" }
  options: Object,         // Same structure: { en: ["a","b"], hi: ["अ","ब"] }
  answer: Object,          // Correct answer per language
});

const Subject = mongoose.model("Subject", SubjectSchema);
const Question = mongoose.model("Question", QuestionSchema);

// ✅ API endpoints

// Get all subjects
app.get("/api/subjects", async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ id: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// Get questions by subject
app.get("/api/questions/:subjectId", async (req, res) => {
  try {
    const { subjectId } = req.params;

    const questions = await Question
      .find({ subjectId })   // 🔥 NO Number()
      .sort({ id: 1 });

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});
// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));