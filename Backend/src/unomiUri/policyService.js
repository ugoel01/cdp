const axios = require('axios');
const base64 = require('base-64');

const UNOMI_URL = "http://localhost:8181/cxs/profiles/search";
const AUTH_HEADER = {
  Authorization: `Basic ${base64.encode('karaf:karaf')}`,
  'Content-Type': 'application/json',
};

const getPolicyCount = async () => {
  const policyTypes = ['LIFE', 'HEALTH', 'TRAVEL', 'AUTO'];
  const policyCounts = {};

  for (const policy of policyTypes) {
    const queryPayload = {
      condition: {
        type: 'booleanCondition',
        parameterValues: {
          operator: 'and',
          subConditions: [
            {
              type: 'profilePropertyCondition',
              parameterValues: {
                propertyName: 'systemProperties.isAnonymousProfile',
                comparisonOperator: 'missing',
              },
            },
            {
              type: 'profilePropertyCondition',
              parameterValues: {
                propertyName: 'properties.policyName',
                comparisonOperator: 'equals',
                propertyValue: policy,
              },
            },
          ],
        },
      },
    };

    try {
      const response = await axios.post(UNOMI_URL, queryPayload, {
        headers: AUTH_HEADER,
      });
      const count = response.data.list ? response.data.list.length : 0;
      policyCounts[policy] = count;
    } catch (error) {
      console.error(`Error fetching data for ${policy}:`, error.message);
      policyCounts[policy] = 'Error';
    }
  }

  return policyCounts;
};

module.exports = { getPolicyCount };
