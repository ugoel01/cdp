const sendEmail = require("./sendEmail");
const generateContent = require("../services/llmService");

const sendClaimStatusEmail = async (to, name, claimDetails, newStatus) => {
  const { claimNumber, policyType, claimAmount } = claimDetails;
  
  const prompt = `
  Write a notification email for a user named ${name} about their insurance claim status update.
  
  Include the following claim details:
  - Claim reference number: ${claimNumber}
  - Policy type: ${policyType}
  - Claimed amount: $${claimAmount}
  - New status: ${newStatus.toUpperCase()}
  
  ${newStatus === 'approved' 
    ? 'The tone should be positive and relieved. Explain that their claim has been approved and when they can expect to receive the payment. Include details about the payment process.'
    : newStatus === 'rejected'
      ? 'The tone should be empathetic but clear. Explain that their claim could not be approved and briefly mention possible reasons. Provide information about the appeal process if applicable.'
      : 'The tone should be informative and reassuring. Explain that their claim is being processed and what the next steps are.'
  }
  
  End with a warm signature from "Friendly Insurance Claims Team".
  Keep it concise but supportive and clear.
  `;

  try {
    const emailText = await generateContent(prompt);
    const subject = `Claim #${claimNumber} Status Update - ${newStatus.toUpperCase()}`;

    await sendEmail(to, subject, emailText);
  } catch (error) {
    console.error(`Error sending claim ${newStatus} email:`, error.message);
    // Log but don't throw to prevent transaction failures if email fails
  }
};

module.exports = sendClaimStatusEmail;
