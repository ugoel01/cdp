const axios = require('axios');

// Create or Update Unomi Profile
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

// Get Active Profiles with Multiple Associations in Last 15 Days
exports.getActiveProfiles = async (req, res) => {
  try {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    console.log('Sending POST request to Unomi API...');

    const response = await axios.post(
      'http://localhost:8181/cxs/profiles/search',
      {
        offset: 0,
        limit: 100,
        condition: {
          type: 'booleanCondition',
          parameterValues: {
            operator: 'and',
            subConditions: [
              
            ]
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
    console.log('Response data:', response.data);

    // Filter profiles with more than one association
    const activeProfiles = response.data.filter(profile => profile.version > 1);

    // Return only email and id
    const result = activeProfiles.map(profile => ({
      email: profile.properties?.email || 'N/A',
      id: profile.itemId
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('POST request failed. Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
