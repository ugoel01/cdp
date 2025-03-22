const axios = require('axios');
//hello
exports.createOrUpdateProfile = async ({ userId, firstName, lastName, email }) => {
  if (!userId || !firstName || !lastName || !email) {
    throw new Error("Missing required fields for Unomi profile update.");
  }

  try {
    const response = await axios.post(
      'http://localhost:8181/cxs/profiles',
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
