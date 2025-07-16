require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");

// ✅ Use environment variable or fallback
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/quizdb";

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const QuestionSchema = new mongoose.Schema({
  id: Number,
  question: Object, // { en: "...", hi: "...", ... }
  options: Object,  // { en: [], hi: [], ... }
  answer: Object    // { en: "...", hi: "...", ... }
});

const Question = mongoose.model("Question", QuestionSchema);

// ✅ Load data from multilingual JSON file
const questions = JSON.parse(fs.readFileSync("questions-multilang.json", "utf-8"));

// ✅ Clear existing and insert new questions
Question.deleteMany({})
  .then(() => Question.insertMany(questions))
  .then(() => {
    console.log("✅ Multilingual questions inserted into MongoDB");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ Error inserting questions:", err.message);
    mongoose.disconnect();
  });