const axios = require("axios");
require("dotenv").config();

const baseURL = process.env.MAUTIC_BASE_URL;
const auth = {
  username: process.env.MAUTIC_USER,
  password: process.env.MAUTIC_PASS,
};

async function createContact({ name, email }) {
  try {
    const res = await axios.post(`${baseURL}/api/contacts/new`, {
      firstname: name,
      email: email,
    }, { auth });

    console.log("✅ Contact created:", res.data.contact);
    return res.data.contact.id;
  } catch (err) {
    console.error("❌ Mautic createContact error:", err.response?.data || err.message);
  }
}

module.exports = { createContact };
