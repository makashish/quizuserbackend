const fs = require("fs");
const path = require("path");
const translate = require("google-translate-api-x");

// 🌐 Languages to translate into
const languages = [
  "hi", "bn", "ta", "te", "gu", "pa", "or",
  "as", "kn", "ml", "mr", "ne", "ur", "sa"
];

// ⏱ Delay function
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// 📦 Correct paths (IMPORTANT)
const sourceFile = path.join(__dirname, "data", "questions-en.json");
const targetFile = path.join(__dirname, "data", "questions-multilang.json");

// ❌ Safety check
if (!fs.existsSync(sourceFile)) {
  console.error("❌ Source file not found:", sourceFile);
  process.exit(1);
}

async function translateQuestions() {
  const raw = fs.readFileSync(sourceFile, "utf-8");
  const original = JSON.parse(raw);

  console.log("✅ Loaded questions:", original.length);

  const translated = [];

  for (const [index, q] of original.entries()) {

    const entry = {
      id: q.id,
      subjectId: q.subjectId,   // 🔥 keep subject
      question: { en: q.question },
      options: { en: q.options },
      answer: { en: q.answer }
    };

    for (const lang of languages) {
      try {
        await delay(600);

        // Translate question
        const qTrans = await translate(q.question, { to: lang });
        entry.question[lang] = qTrans.text;

        // Translate options
        const optTrans = [];
        for (const opt of q.options) {
          await delay(300);
          const res = await translate(opt, { to: lang });
          optTrans.push(res.text);
        }
        entry.options[lang] = optTrans;

        // Translate answer
        await delay(300);
        const ansTrans = await translate(q.answer, { to: lang });
        entry.answer[lang] = ansTrans.text;

      } catch (err) {
        console.error(
          `❌ Error translating Q${q.id} (${lang}):`,
          err.message
        );
      }
    }

    translated.push(entry);
    console.log(`✅ Translated Q ${index + 1}/${original.length}`);
  }

  fs.writeFileSync(
    targetFile,
    JSON.stringify(translated, null, 2),
    "utf-8"
  );

  console.log("\n🎉 Translation complete!");
  console.log("📁 Saved at:", targetFile);
}

// ▶ Run
translateQuestions();