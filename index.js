require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch((err) => console.error("❌ Connection error:", err));

// Mongoose schema and model
const QuestionSchema = new mongoose.Schema({
  id: Number,
  question: Object,
  options: Object,
  answer: Object,
});

const Question = mongoose.model("Question", QuestionSchema);

// Root route
app.get("/", (req, res) => {
  res.send("✅ Quiz Backend is running!");
});

// API route
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await Question.find().sort({ id: 1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});