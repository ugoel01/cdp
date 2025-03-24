const axios = require('axios');
require("dotenv").config();

const baseURL = process.env.UNOMI_API_URL;
// Create or Update Unomi Profile
exports.createOrUpdateProfile = async ({ userId, firstName, lastName, email }) => {
  if (!userId || !firstName || !lastName || !email) {
    throw new Error("Missing required fields for Unomi profile update.");
  }

  try {
    const response = await axios.post(
      `${baseURL}/cxs/profiles`,
      {
        properties: {
          userId,
          firstName,
          lastName,
          email
        }
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from('karaf:karaf').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Unomi Profile Updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("Unomi Profile Update Error:", error.message);
    throw error;
  }
};




exports.getActiveProfiles = async (req, res) => {
  try {
    console.log('Sending POST request to Unomi API...');

    const response = await axios.post(
      `${baseURL}/cxs/profiles/search`,
      {
        offset: 0,
        limit: 100,
        condition: {
          type: 'booleanCondition',
          parameterValues: {
            operator: 'and',
            subConditions: []
          }
        }
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from('karaf:karaf').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('POST request successful. Response status:', response.status);

    const profiles = response.data?.list || [];

    // Extract and count valid emails
    const emailCounts = profiles
      .map(profile => profile.properties?.email)
      .filter(email => email)
      .reduce((acc, email) => {
        acc[email] = (acc[email] || 0) + 1;
        return acc;
      }, {});

    // Convert to array and sort by count in descending order
    const sortedEmails = Object.entries(emailCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([email, count]) => ({ email, count }));

    res.status(200).json(sortedEmails);
  } catch (error) {
    console.error('POST request failed. Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
