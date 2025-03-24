const sgMail = require("@sendgrid/mail");

require("dotenv").config(); 

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_SENDER,
      subject,
      text,
    };

    await sgMail.send(msg);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email. Please try again later.");
  }
};

module.exports = sendEmail;