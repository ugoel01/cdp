const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
require("dotenv").config(); 

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {
    const msg = {
      to,
      from: "ayushanandbtcs@gmail.com",
      subject,
      text,
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email. Please try again later.");
  }
};

module.exports = sendEmail;