const genAI = require("@google/generative-ai");
require("dotenv").config();

const genAIInstance = new genAI.GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const generateContent = async (prompt) => {
  try {
    const model = genAIInstance.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini AI Error:", error.message);
    return "We encountered an issue generating your content.";
  }
};

module.exports = generateContent;
