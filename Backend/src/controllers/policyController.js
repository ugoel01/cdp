const policyService = require("../services/policyService");

exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await policyService.getAllPolicies();
    res.json(policies);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPolicyById = async (req, res) => {
  try {
    const policy = await policyService.getPolicyById(req.params.id);
    res.json(policy);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
