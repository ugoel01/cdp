const axios = require("axios");
require("dotenv").config();

const baseURL = process.env.MAUTIC_BASE_URL;
const auth = {
  username: process.env.MAUTIC_USER,
  password: process.env.MAUTIC_PASS,
};

const SEGMENT_ID = 1; 

async function createContact({ name, email }) {
  try {
    const res = await axios.post(`${baseURL}/api/contacts/new`, {
      firstname: name,
      email: email,
    }, { auth });

    const contactId = res.data.contact.id;

    // Add contact to the segment
    await axios.post(`${baseURL}/api/segments/${SEGMENT_ID}/contact/${contactId}/add`, null, { auth });

    return contactId;
  } catch (err) {
    console.error("Mautic createContact error:", err.response?.data || err.message);
  }
}


module.exports = { createContact };
