const sendEmail = require("./sendEmail");
const generateContent = require("../services/llmService");


const sendWelcomeEmail = async (to, name) => {
    const prompt = `
    Write a warm, friendly welcome email for a new user named ${name} who just joined an insurance platform called "Friendly Insurance".
    The tone should be positive and reassuring. Mention that insurance is about peace of mind, protection, and being there when it matters most.
    Keep the message short and engaging. End with a warm signature from "Friendly Insurance".
    `;
    

  try {
    const emailText = await generateContent(prompt);
    const subject = "Welcome to Our Platform!";

    await sendEmail(to, subject, emailText);
  } catch (error) {
    console.error("Error sending welcome email:", error.message);
    throw error;
  }
};

module.exports = sendWelcomeEmail;
