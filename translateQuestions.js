const fs = require("fs");
const translate = require("google-translate-api-x");

// 🌐 Languages to translate into
const languages = ["hi", "bn", "ta", "te", "gu", "pa", "or", "ks"]; // Hindi, Bengali, Tamil, Telugu, etc.

// 🔃 Translate function
async function translateText(text, lang) {
  try {
    const res = await translate(text, { to: lang });
    return res.text;
  } catch (err) {
    console.error(`❌ Error translating to ${lang}:`, err.message);
    return text; // fallback to original
  }
}

// 📦 Load original questions.json (must be English-only)
const sourceFile = "questions-en.json"; // You must prepare this file
const targetFile = "questions-multilang.json";

async function translateQuestions() {
  const raw = fs.readFileSync(sourceFile, "utf-8");
  const questions = JSON.parse(raw);

  for (const q of questions) {
    const qid = q.id;

    // Translate question text
    q.question = { en: q.question }; // convert original string to object
    for (const lang of languages) {
      q.question[lang] = await translateText(q.question.en, lang);
    }

    // Translate options
    const originalOptions = q.options;
    q.options = { en: originalOptions };
    for (const lang of languages) {
      const translatedOpts = [];
      for (const opt of originalOptions) {
        translatedOpts.push(await translateText(opt, lang));
      }
      q.options[lang] = translatedOpts;
    }

    // Translate answer
    q.answer = { en: q.answer };
    for (const lang of languages) {
      q.answer[lang] = await translateText(q.answer.en, lang);
    }

    console.log(`✅ Translated Q${qid}`);
  }

  fs.writeFileSync(targetFile, JSON.stringify(questions, null, 2));
  console.log(`\n🎉 Saved translated questions to ${targetFile}`);
}

translateQuestions();