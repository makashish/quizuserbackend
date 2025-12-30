require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/quizdb";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const QuestionSchema = new mongoose.Schema({
  id: Number,

  subjectId: {
    type: Number,
    required: true
  },

  question: Object,
  options: Object,
  answer: Object
});

const Question = mongoose.model("Question", QuestionSchema);

const questions = JSON.parse(
  fs.readFileSync("questions-multilang.json", "utf-8")
);

(async () => {
  try {
    await Question.deleteMany({});
    await Question.insertMany(questions);

    console.log("✅ Questions with subjectId inserted successfully");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
    mongoose.disconnect();
  }
})();