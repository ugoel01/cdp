const axios = require("axios");
require("dotenv").config();

const baseURL = process.env.MAUTIC_BASE_URL;
const auth = {
  username: process.env.MAUTIC_USER,
  password: process.env.MAUTIC_PASS,
};

async function createContact({ name, email, segmentIds }) {
  try {
    // Create contact
    const res = await axios.post(`${baseURL}/api/contacts/new`, {
      firstname: name,
      email: email,
    }, { auth });

    const contactId = res.data.contact.id;

    // Handle single or multiple segment IDs
    if (segmentIds) {
      const ids = Array.isArray(segmentIds) ? segmentIds : [segmentIds];

      // Add contact to each segment
      for (const id of ids) {
        await axios.post(`${baseURL}/api/segments/${id}/contact/${contactId}/add`, null, { auth });
      }
    }

    return contactId;
  } catch (err) {
    console.error("Mautic createContact error:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { createContact };
