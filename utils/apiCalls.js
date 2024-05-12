import { GoogleGenerativeAI } from "@google/generative-ai";
import prompts from "./prompts.js";
export async function getPromptReplyFromGemini(msg) {
  // For text-only input, use the gemini-pro model
  try {
    // console.log("API_key: ", );
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt =
      prompts.autoResponsePrompt +
      "\n\n\n now respond to this given msg::\n\n" +
      msg;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // console.log(text);
    return text;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
