const sendEmail = require("./sendEmail");
const generateContent = require("../services/llmService");

const sendPolicyApprovalEmail = async (to, name, policyDetails, status) => {
  const { type, coverageAmount, startDate, endDate } = policyDetails;
  
  const prompt = `
  Write a notification email for a user named ${name} about their insurance policy purchase request.
  
  Include the following policy details:
  - Policy type: ${type}
  - Coverage amount: $${coverageAmount}
  - Start date: ${new Date(startDate).toLocaleDateString()}
  - End date: ${new Date(endDate).toLocaleDateString()}
  - Status: ${status.toUpperCase()}
  
  ${status === 'approved' 
    ? 'The tone should be positive and welcoming. Explain that their policy is now active and they can file claims against it if needed. Mention they can view policy details in their dashboard. Include a brief note about the benefits of having insurance.'
    : 'The tone should be empathetic but professional. Explain that their policy purchase request could not be approved at this time. Invite them to contact customer support for more information or to submit a new request.'
  }
  
  End with a warm signature from "Friendly Insurance Team".
  Keep it concise but informative and supportive.
  `;

  try {
    // Try to generate content with LLM
    let emailText;
    try {
      emailText = await generateContent(prompt);
    } catch (llmError) {
      console.error("LLM service error:", llmError);
      // Fallback to static template if LLM fails
      emailText = generateFallbackEmailContent(name, policyDetails, status);
    }
    
    const subject = `Policy Purchase Request ${status.toUpperCase()}`;

    await sendEmail(to, subject, emailText);
    console.log(`Policy ${status} email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Error sending policy ${status} email:`, error.message);
  }
};

// Fallback email content generator
function generateFallbackEmailContent(name, policyDetails, status) {
  const { type, coverageAmount, startDate, endDate } = policyDetails;
  
  if (status === 'approved') {
    return `Dear ${name},

We are pleased to inform you that your insurance policy purchase request has been APPROVED.

Policy Details:
- Policy Type: ${type}
- Coverage Amount: $${coverageAmount}
- Start Date: ${new Date(startDate).toLocaleDateString()}
- End Date: ${new Date(endDate).toLocaleDateString()}

Your policy is now active and you can file claims against it if needed. You can view your policy details in your dashboard.

If you have any questions about your coverage, please contact our customer support team.

Thank you for choosing our insurance services.

Warm regards,
Friendly Insurance Team`;
  } 
  else {
    return `Dear ${name},

We regret to inform you that your insurance policy purchase request has been REJECTED.

Policy Details:
- Policy Type: ${type}
- Coverage Amount: $${coverageAmount}
- Requested Start Date: ${new Date(startDate).toLocaleDateString()}
- Requested End Date: ${new Date(endDate).toLocaleDateString()}

If you have any questions about this decision or would like to submit a new request, please contact our customer support team.

Warm regards,
Friendly Insurance Team`;
  }
}

module.exports = sendPolicyApprovalEmail;
