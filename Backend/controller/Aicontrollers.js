import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_KEY,
});

/**
 * Safely parses AI output containing JSON array, even if extra text exists.
 */
function parseAIJsonArray(output, type = "flashcard") {
  // Remove code fences and trim
  let cleaned = output.replace(/```json/g, "").replace(/```/g, "").trim();

  // Extract JSON array from any extra text
  const match = cleaned.match(/\[.*\]/s); // s flag = dot matches newline
  if (!match) return [];

  try {
    const parsed = JSON.parse(match[0]);

    // Validate each object matches expected structure
    if (type === "flashcard") {
      return parsed.filter(fc => fc.question && fc.answer);
    } else if (type === "quiz") {
      return parsed
        .filter(q => q.question && q.options && q.correctAnswer)
        .map(q => ({ ...q, score: q.score || 1 })); // ensure score exists
    } else {
      return parsed;
    }
  } catch (err) {
    console.error("Failed to parse AI JSON:", err.message);
    console.log("Raw output:", output);
    return [];
  }
}

export const generateAI = async (text, mode) => {
  let prompt = "";

  switch (mode) {
    case "summary":
      prompt = `
You are an AI assistant. Summarize the following text in a simple and clear way, 
include detailed explanation and examples if needed. Respond ONLY with the summary text, 
do NOT include any code fences or extra text.

Text:
${text}
      `;
      break;

    case "flashcard":
      prompt = `
You are an AI that generates educational flashcards. 
Read the text below and create an array of flashcards in JSON format only. 
Each flashcard must have exactly two fields: 
- "question" (string)
- "answer" (string)

Respond ONLY with a valid JSON array. Do NOT include any Markdown, backticks, explanations, or extra text.

Text:
${text}
      `;
      break;

    case "quiz":
      prompt = `
You are an AI that generates quiz questions. 
Read the text below and create an array of quiz objects in JSON format only. 
Each quiz object must have the following fields: 
- "question" (string)
- "options" (array of 4 strings)
- "correctAnswer" (string)
- "score" (number, default 1)
- "explanation" (string that explains why the correct answer is correct)

Respond ONLY with a valid JSON array. Do NOT include any Markdown, backticks, explanations, or extra text.

Text:
${text}
      `;
      break;

    default:
      throw new Error("Invalid mode. Must be 'summary', 'flashcard', or 'quiz'.");
  }

  const res = await client.chat.completions.create({
    model: "deepseek/deepseek-chat-v3.1",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1200, 
  });

  let content = res.choices[0].message.content;

  if (mode === "flashcard" || mode === "quiz") {
    content = parseAIJsonArray(content, mode);
  }

  return content;
};
