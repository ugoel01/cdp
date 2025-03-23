const axios = require('axios');
const base64 = require('base-64');

const UNOMI_URL = "http://localhost:8181/cxs/query/profile/count";
const AUTH_HEADER = {
  Authorization: `Basic ${base64.encode('karaf:karaf')}`,
  'Content-Type': 'application/json',
};

const getPolicyCount = async () => {
  const policyTypes = ['LIFE', 'HEALTH', 'TRAVEL', 'AUTO', 'BUSINESS'];
  const policyCounts = {};

  for (const policy of policyTypes) {
    const queryPayload = {
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
    };

    try {
      const response = await axios.post(UNOMI_URL, queryPayload, {
        headers: AUTH_HEADER,
      });

      const count = response.data;
      console.log(`Count for ${policy}:`, count);
      policyCounts[policy] = count;
    } catch (error) {
      console.error(`Error fetching data for ${policy}:`, error.response?.data || error.message);
      policyCounts[policy] = 'Error';
    }
  }

  return policyCounts;
};

module.exports = { getPolicyCount };
