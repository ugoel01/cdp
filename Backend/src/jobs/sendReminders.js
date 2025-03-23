const Policyholder = require("../models/Policyholder");
const User = require("../models/User");
const sendReminderEmail = require("../utils/sendEmail");
const generateContent = require("../services/llmService");

const sendPolicyReminders = async () => {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  try {
    const policyholders = await Policyholder.find({
      "policies.endDate": { $gte: today, $lte: nextWeek },
    }).populate("userId policies.policyId"); // populate policy data

    for (const holder of policyholders) {
      const user = holder.userId;
      if (!user?.email) continue;

      const expiringPolicies = holder.policies.filter(policy =>
        policy.endDate >= today && policy.endDate <= nextWeek
      );

      for (const policy of expiringPolicies) {
        const policyData = policy.policyId;

        const prompt = `
You are an insurance assistant. Write a friendly and professional reminder email to a user. Use the details below to personalize the message:

- User Name: ${user.name}
- Policy Number: ${policyData.policyNumber}
- Policy Type: ${policyData.type}
- Coverage Amount: $${policyData.coverageAmount}
- Policy Cost: $${policyData.cost ?? "N/A"}

The email should notify the user that their policy is expiring soon, encourage them to renew it, and offer assistance if needed. Keep it concise (under 150 words).
        `;

        const emailText = await generateContent(prompt);

        await sendReminderEmail(
          user.email,
          `Reminder: Your ${policyData.type} Policy #${policyData.policyNumber} is Expiring`,
          emailText
        );
      }
    }
  } catch (err) {
    console.error("Error sending reminders:", err);
  }
};

module.exports = sendPolicyReminders;
