const Claim = require("../models/Claim");
const Policy = require("../models/Policy");
const Policyholder = require("../models/Policyholder");
const mongoose = require("mongoose");

// Create a New Claim
exports.createClaim = async ({
  userId,
  policyId,
  Document,
  amount,
  dateFiled,
}) => {
  try {
    // Validate required fields
    if (!userId || !policyId || !Document || !amount || !dateFiled) {
      throw new Error("All fields are required.");
    }

    // Convert policyId & userId to ObjectId to avoid type errors
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(policyId)) {
      throw new Error("Invalid userId or policyId format.");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const policyObjectId = new mongoose.Types.ObjectId(policyId);

    // Validate Document (Ensure it's a valid URL)
    const urlRegex = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;
    if (!urlRegex.test(Document)) {
      throw new Error("Invalid document URL.");
    }

    // Ensure user owns the policy
    const policyholder = await Policyholder.findOne({
      userId: userObjectId
    });

    // if (!policyholder) {
    //   throw new Error("User does not own this policy and cannot file a claim.");
    // }

    // Ensure policy exists
    const policy = await Policy.findById(policyObjectId);
    if (!policy) {
      throw new Error("Policy not found.");
    }

    // Validate claim amount
    if (amount <= 0) {
      throw new Error("Claim amount must be greater than zero.");
    }
    if (amount > policy.coverageAmount) {
      throw new Error(
        `Claim amount cannot exceed policy coverage amount ($${policy.coverageAmount}).`
      );
    }

    // Save claim in MongoDB
    const newClaim = new Claim({
      userId: userObjectId, 
      policyId: policyObjectId, 
      Document,
      amount,
      status: "Pending",
      dateFiled,
    });

    return await newClaim.save();
  } catch (error) {
    throw new Error(error.message || "Error creating claim.");
  }
};

// Get All Claims for a User
exports.getClaimsByUser = async (userId) => {
  return await Claim.find({ userId }).populate(
    "policyId",
    "policyNumber type coverageAmount"
  );
};

// Delete a Claim
exports.deleteClaim = async (claimId, userId) => {
  const claim = await Claim.findById(claimId);
  if (!claim) throw new Error("Claim not found.");
  if (claim.userId.toString() !== userId)
    throw new Error("Unauthorized action.");
  if (claim.status !== "Pending")
    throw new Error("Cannot delete a processed claim.");

  await Claim.deleteOne({ _id: claimId });
  return { message: "Claim canceled successfully." };
};
