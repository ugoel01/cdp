const sendEmail = require("./sendEmail");
const generateContent = require("../services/llmService");

const sendLoginEmail = async (to, name, loginTime, device) => {
  const prompt = `
  Write a short security notification email for a user named ${name} who just logged into our insurance platform.
  Include the following details:
  - Login time: ${loginTime}
  - Device/browser used: ${device}
  
  The email should be brief and professional. Mention that if they didn't log in, they should contact support immediately.
  End with a warm signature from "Friendly Insurance Security Team".
  `;

  try {
    const emailText = await generateContent(prompt);
    const subject = "New Login Detected - Friendly Insurance";

    await sendEmail(to, subject, emailText);
  } catch (error) {
    console.error("Error sending login notification email:", error.message);
  }
};

module.exports = sendLoginEmail;
