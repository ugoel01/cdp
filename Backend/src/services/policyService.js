const Policy = require("../models/Policy");

// Get All Policies
exports.getAllPolicies = async () => {
  return await Policy.find();
};

// Get Policy by ID
exports.getPolicyById = async (policyId) => {
  const policy = await Policy.findById(policyId);
  if (!policy) throw new Error("Policy not found.");
  return policy;
};