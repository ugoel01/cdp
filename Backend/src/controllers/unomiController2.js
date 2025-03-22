const { getPolicyCount } = require('../unomiUri/policyService');

const getPolicyCountHandler = async (req, res) => {
  try {
    const counts = await getPolicyCount();
    res.status(200).json(counts);
  } catch (error) {
    console.error('Error fetching policy count:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getPolicyCountHandler };
