// ================= CONFIG =================
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= SUPPORTED LANGUAGES =================
const SUPPORTED_LANGUAGES = [
  "en", // default
  "hi", "bn", "ta", "te", "gu", "pa", "or",
  "as", "kn", "ml", "mr", "ne", "ur", "sa"
];

// ================= MONGODB CONNECTION =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ================= SCHEMAS =================

// 🔹 Subject Schema
const SubjectSchema = new mongoose.Schema(
  {
    id: {
      type: String,        // physics, chemistry, maths
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    name: {
      type: Object,        // { en: "Physics", hi: "भौतिकी", bn: "..."}
      required: true
    }
  },
  { timestamps: true }
);

// 🔹 Question Schema (MULTI-LANGUAGE)
const QuestionSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true
    },
    subjectId: {
      type: String,        // MUST match Subject.id
      required: true,
      lowercase: true,
      index: true
    },
    question: {
      type: Object,        // { en: "Q?", hi: "...", bn: "..." }
      required: true
    },
    options: {
      type: Object,        // { en: ["A","B"], hi: ["अ","ब"] }
      required: true
    },
    answer: {
      type: Object,        // { en: "A", hi: "अ" }
      required: true
    }
  },
  { timestamps: true }
);

const Subject = mongoose.model("Subject", SubjectSchema);
const Question = mongoose.model("Question", QuestionSchema);

// ================= API ENDPOINTS =================

// 🔹 Health check
app.get("/", (req, res) => {
  res.json({
    status: "Quiz API running 🚀",
    supportedLanguages: SUPPORTED_LANGUAGES
  });
});

// 🔹 Get all subjects
app.get("/api/subjects", async (req, res) => {
  try {
    const lang = (req.query.lang || "en").toLowerCase();

    const subjects = await Subject.find().sort({ id: 1 });

    const formatted = subjects.map((s) => ({
      id: s.id,
      name: s.name[lang] || s.name.en || ""
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Subject fetch error:", err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// 🔹 Get questions by subject + language
app.get("/api/questions/:subjectId/:language", async (req, res) => {
  try {
    const subjectId = req.params.subjectId.toLowerCase();
    let language = req.params.language.toLowerCase();

    // ✅ Validate language
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      language = "en";
    }

    const questions = await Question.find({ subjectId }).sort({ id: 1 });

    if (!questions.length) {
      return res.json([]);
    }

    const formatted = questions.map((q) => ({
      id: q.id,
      subjectId: q.subjectId,
      question: q.question[language] || q.question.en || "",
      options: q.options[language] || q.options.en || [],
      answer: q.answer[language] || q.answer.en || ""
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Question fetch error:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);