const cron = require("node-cron");
const sendPolicyReminders = require("./jobs/sendReminders");

// Runs every day at 9:00 AM
cron.schedule("0 9 * * *", async () => {
  console.log("⏰ Running daily policy reminder emails...");
  await sendPolicyReminders();
});
