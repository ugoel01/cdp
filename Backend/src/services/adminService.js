const Policy = require("../models/Policy");
const User = require("../models/User");
const Claim = require("../models/Claim");
const Policyholder = require("../models/Policyholder");
const PolicyRequest = require("../models/PolicyRequest");
const sendClaimStatusEmail = require("../utils/sendClaimStatusEmail");
const sendPolicyApprovalEmail = require("../utils/sendPolicyApprovalEmail");
const sendEmail = require("../utils/sendEmail"); 


// Create a New Policy
exports.createPolicy = async (data) => {
  const { policyNumber, type, coverageAmount, cost,  startDate, endDate } = data;

  if (!policyNumber || !type || !coverageAmount || !startDate || !endDate) {
    throw new Error("All fields are required.");
  }

  const newPolicy = new Policy({
    policyNumber,
    type,
    coverageAmount: parseFloat(coverageAmount),
    cost:parseFloat(cost),
    startDate,
    endDate
  });

  await newPolicy.save();
  return newPolicy;
};

//Update an Existing Policy (Admin Only)
exports.updatePolicy = async (policyId, data) => {
  const updatedPolicy = await Policy.findByIdAndUpdate(policyId, data, { new: true });
  if (!updatedPolicy) throw new Error("Policy not found.");
  return updatedPolicy;
};

//Delete a Policy (Admin Only) - Prevent deletion if purchased by users
exports.deletePolicy = async (policyId) => {
  const policy = await Policy.findById(policyId);
  if (!policy) throw new Error("Policy not found.");

  // Check if any user has purchased this policy - fixed query
  const policyholder = await Policyholder.findOne({ "policies.policyId": policyId });
  if (policyholder) {
    throw new Error("Policy cannot be deleted. It has been purchased by users.");
  }

  await Policy.deleteOne({ _id: policyId });
  return { message: "Policy deleted successfully." };
};

//Get All Purchased Policies (Admin Only)
// exports.getAllPurchasedPolicies = async () => {
//   const policyholders = await Policyholder.find().populate("userId").populate("policies");

//   return policyholders.map(policyholder => ({
//     userId: policyholder.userId._id,
//     userName: policyholder.userId.name,
//     purchasedPolicies: policyholder.policies
//   }));
// };
exports.getAllPurchasedPolicies = async () => {
  const policyholders = await Policyholder.find()
    .populate({
      path: "userId",
      select: "name"
    })
    .populate({
      path: "policies.policyId",
      select: "policyNumber type coverageAmount cost startDate endDate"
    });

  return policyholders.map(policyholder => ({
    userId: policyholder.userId._id,
    userName: policyholder.userId.name,
    purchasedPolicies: policyholder.policies.map(policy => {
      return {
        _id: policy._id,
        policyNumber: policy.policyId?.policyNumber || "N/A",
        type: policy.policyId?.type || "Unknown",
        coverageAmount: policy.policyId?.coverageAmount || "N/A",
        cost: policy.policyId?.cost !== undefined ? `${policy.policyId.cost}` : "N/A", 
        startDate: policy.startDate,
        endDate: policy.endDate
      };
    })
  }));
};


//Update Claim Status (Approve/Reject) (Admin Only)
exports.updateClaimStatus = async (claimId, status) => {
  const claim = await Claim.findById(claimId).populate("userId", "email name");

  if (!claim) throw new Error("Claim not found.");
  if (claim.status !== "Pending") throw new Error("Claim has already been processed.");

  claim.status = status;
  await claim.save();

  // Send Email Notification
  const userEmail = claim.userId.email;
  const userName = claim.userId.name;

  const claimDetails = {
    claimNumber: claim._id,
    policyType: claim.policyType,      
    claimAmount: claim.claimAmount
  };

  await sendClaimStatusEmail(userEmail, userName, claimDetails, status.toLowerCase());

  return claim;
};


//Get All Policies (Admin View)
exports.getAllPolicies = async () => {
  return await Policy.find();
};

exports.getAllClaims = async () => {
  return await Claim.find()
    .populate("userId", "name email")  // Fetch User Details (Name, Email)
    .populate("policyId", "policyNumber type coverageAmount");  // Fetch Policy Details
};

exports.approvePolicyPurchase = async (requestId, action) => {
  const policyRequest = await PolicyRequest.findById(requestId);
  if (!policyRequest) throw new Error("Policy request not found.");
  if (policyRequest.status !== "Pending") throw new Error("This request has already been processed.");

  if (action === "Approve") {
    // Find user and policy
    const user = await User.findById(policyRequest.userId);
    const policy = await Policy.findById(policyRequest.policyId);

    if (!user || !policy) throw new Error("User or policy not found.");

    // Assign policy to user
    let policyholder = await Policyholder.findOne({ userId: user._id });

    if (policyholder) {
      // Push the full policy object with all required fields
      policyholder.policies.push({
        policyId: policy._id,
        startDate: policyRequest.startDate,
        endDate: policyRequest.endDate
      });
      await policyholder.save();
    } else {
      // If no policyholder exists, create one with the correct format
      policyholder = new Policyholder({
        userId: user._id,
        policies: [{
          policyId: policy._id,
          startDate: policyRequest.startDate,
          endDate: policyRequest.endDate
        }]
      });
      await policyholder.save();
    }
    
    // Mark request as approved
    policyRequest.status = "Approved";
    await policyRequest.save();

    // Notify user via email using LLM service
    const policyDetails = {
      type: policy.type,
      coverageAmount: policy.coverageAmount,
      startDate: policyRequest.startDate,
      endDate: policyRequest.endDate
    };

    try {
      await sendPolicyApprovalEmail(user.email, user.name, policyDetails, 'approved');
    } catch (emailError) {
      console.error("Failed to send policy approval email:", emailError);

    }

    return { message: "Policy purchase approved and assigned to user." };
  } else if (action === "Reject") {
    policyRequest.status = "Rejected";
    await policyRequest.save();

    // Notify user via email using LLM service
    const user = await User.findById(policyRequest.userId);
    const policy = await Policy.findById(policyRequest.policyId);
    
    if (user && policy) {
      const policyDetails = {
        type: policy.type,
        coverageAmount: policy.coverageAmount,
        startDate: policyRequest.startDate,
        endDate: policyRequest.endDate
      };

      try {
        await sendPolicyApprovalEmail(user.email, user.name, policyDetails, 'rejected');
      } catch (emailError) {
        console.error("Failed to send policy rejection email:", emailError);
        // Continue execution even if email fails
      }
    }

    return { message: "Policy purchase request has been rejected." };
  } else {
    throw new Error("Invalid action. Use 'Approve' or 'Reject'.");
  }
};

//Get All Pending Policy Requests
exports.getPendingPolicyRequests = async () => {
  return await PolicyRequest.find({ status: "Pending" }).populate("userId policyId");
};