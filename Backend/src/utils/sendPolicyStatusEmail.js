const sendEmail = require("./sendEmail");
const generateContent = require("../services/llmService");

const sendPolicyStatusEmail = async (to, name, policyDetails, status) => {
  const { type, coverageAmount, premium, duration } = policyDetails;
  
  const prompt = `
  Write a notification email for a user named ${name} about their insurance policy status.
  Their policy has been ${status === 'approved' ? 'APPROVED' : 'REJECTED'}.
  
  Include the following policy details:
  - Policy type: ${type}
  - Coverage amount: $${coverageAmount}
  - Premium: $${premium}
  - Duration: ${duration} years
  
  ${status === 'approved' 
    ? 'The tone should be congratulatory and informative. Include details about when coverage begins and how to access policy documents.'
    : 'The tone should be respectful and clear. Briefly explain that the policy could not be approved at this time.'
  }
  
  End with a warm signature from "Friendly Insurance Policy Team".
  Keep it concise but informative.
  `;

  try {
    const emailText = await generateContent(prompt);
    const subject = `Policy ${status === 'approved' ? 'Approved' : 'Not Approved'} - ${type} Insurance`;

    await sendEmail(to, subject, emailText);
  } catch (error) {
    console.error(`Error sending policy ${status} email:`, error.message);
    // Log but don't throw to prevent transaction failures if email fails
  }
};

module.exports = sendPolicyStatusEmail;
