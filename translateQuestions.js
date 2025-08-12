const fs = require("fs");
const translate = require("google-translate-api-x");

// 🌐 Languages to translate into
const languages = ["hi", "bn", "ta", "te", "gu", "pa", "or", "as", "kn", "ml", "mr", "ne", "ur", "sa"]; // Hindi, Bengali, Tamil, Telugu, etc.

// ⏱ Delay function
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// 📦 Load original questions
const sourceFile = "questions-en.json"; // Your English-only file
const targetFile = "questions-multilang.json";

async function translateQuestions() {
  const raw = fs.readFileSync(sourceFile, "utf-8");
  const original = JSON.parse(raw);
  const translated = [];

  for (const [index, q] of original.entries()) {
    const entry = {
      id: q.id,
      question: { en: q.question },
      options: { en: q.options },
      answer: { en: q.answer }
    };

    for (const lang of languages) {
      try {
        await delay(500); // Delay between language blocks

        // Translate question
        const qTrans = await translate(q.question, { to: lang });
        entry.question[lang] = qTrans.text;

        // Translate options
        const optTrans = await Promise.all(
          q.options.map(async (opt) => {
            await delay(300); // Delay per option
            const res = await translate(opt, { to: lang });
            return res.text;
          })
        );
        entry.options[lang] = optTrans;

        await delay(500); // Delay before answer
        const ansTrans = await translate(q.answer, { to: lang });
        entry.answer[lang] = ansTrans.text;

      } catch (err) {
        console.error(`❌ Error translating question ${q.id} to ${lang}:`, err.message);
      }
    }

    translated.push(entry);
    console.log(`✅ Translated Q${index + 1}/${original.length}`);
  }

  fs.writeFileSync(targetFile, JSON.stringify(translated, null, 2));
  console.log(`\n🎉 Translation complete. Saved to ${targetFile}`);
}

translateQuestions();