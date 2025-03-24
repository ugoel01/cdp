const sendEmail = require("./sendEmail");
const generateContent = require("../services/llmService");

const sendPolicyPurchaseEmail = async (to, name, policyDetails) => {
  const { type, coverageAmount, premium, duration } = policyDetails;
  
  const prompt = `
  Write a confirmation email for a user named ${name} who just purchased an insurance policy.
  Include the following policy details:
  - Policy type: ${type}
  - Coverage amount: $${coverageAmount}
  
  The tone should be professional yet warm. Express gratitude for their trust in our company.
  Mention that the policy is pending approval, and they will receive another notification once approved.
  Include a brief reminder about the benefits of having insurance.
  End with a warm signature from "Friendly Insurance Team".
  Keep it concise but informative.
  `;

  try {
    const emailText = await generateContent(prompt);
    const subject = `Your ${type} Insurance Purchase Confirmation`;

    await sendEmail(to, subject, emailText);
  } catch (error) {
    console.error("Error sending policy purchase email:", error.message);
  }
};

module.exports = sendPolicyPurchaseEmail;
