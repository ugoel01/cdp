const genAI = require("@google/generative-ai");
require("dotenv").config();

const genAIInstance = new genAI.GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateWelcomeEmail(userName) {
    try {
        const model = genAIInstance.getGenerativeModel({ model: "models/gemini-1.5-flash" });
        const prompt = `Write a warm welcome email for a new user named ${userName}. Make it friendly and engaging.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini AI Error:", error.message);
        return "Welcome to our platform! We are excited to have you.";
    }
}

module.exports = generateWelcomeEmail;
