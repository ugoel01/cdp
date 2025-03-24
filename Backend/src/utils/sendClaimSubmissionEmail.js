const sendEmail = require("./sendEmail");
const generateContent = require("../services/llmService");

const sendClaimSubmissionEmail = async (to, name, claimDetails) => {
  const { policyType, claimAmount } = claimDetails;
  
  const prompt = `
  Write a confirmation email for a user named ${name} who just submitted an insurance claim.
  Include the following claim details:
  - Policy type: ${policyType}
  - Claimed amount: $${claimAmount}
  
  The tone should be empathetic and reassuring. Let them know their claim is being processed, and our team will review it shortly.
  Provide a brief timeline of the claim review process.
  Mention that they will be notified once the claim status changes.
  End with a warm signature from "Friendly Insurance Claims Team".
  Keep it concise but supportive.
  `;

  try {
    const emailText = await generateContent(prompt);
    const subject = `Claim - Submission Received`;

    await sendEmail(to, subject, emailText);
  } catch (error) {
    console.error("Error sending claim submission email:", error.message);
    // Log but don't throw to prevent transaction failures if email fails
  }
};

module.exports = sendClaimSubmissionEmail;
