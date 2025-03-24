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

// exports.getActiveProfiles = async (req, res) => {
//   try {
//     console.log('Sending POST request to Unomi API...');

//     const response = await axios.post(
//       'http://localhost:8181/cxs/profiles/search',
//       {
//         offset: 0,
//         limit: 100,
//         condition: {
//           type: 'booleanCondition',
//           parameterValues: {
//             operator: 'and',
//             subConditions: []
//           }
//         }
//       },
//       {
//         headers: {
//           Authorization: `Basic ${Buffer.from('karaf:karaf').toString('base64')}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     console.log('POST request successful. Response status:', response.status);

//     const profiles = response.data?.list || [];

//     // Filter profiles with version > 1 and exclude temporary profiles
//     const activeProfiles = profiles
//       .filter(profile => profile.version > 1 && !profile.itemId.startsWith('temp_'))
//       .map(profile => ({
//         email: profile.properties?.email || 'N/A',
//         id: profile.itemId
//       }));

//     res.status(200).json(activeProfiles);
//   } catch (error) {
//     console.error('POST request failed. Error:', error.message);
//     res.status(500).json({ error: error.message });
//   }
// };



exports.getActiveProfiles = async (req, res) => {
  try {
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
