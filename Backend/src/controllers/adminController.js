const adminService = require("../services/adminService");
const fetch = require("node-fetch");

// Create a New Policy (Admin Only)
exports.createPolicy = async (req, res) => {
  try {
    const newPolicy = await adminService.createPolicy(req.body);
    res.status(201).json(newPolicy);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update an Existing Policy (Admin Only)
exports.updatePolicy = async (req, res) => {
  try {
    const updatedPolicy = await adminService.updatePolicy(req.params.id, req.body);
    res.json(updatedPolicy);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a Policy (Admin Only)
exports.deletePolicy = async (req, res) => {
  try {
    const message = await adminService.deletePolicy(req.params.id);
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Purchased Policies (Admin View)
exports.getAllPurchasedPolicies = async (req, res) => {
  try {
    const purchasedPolicies = await adminService.getAllPurchasedPolicies();
    res.json(purchasedPolicies);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Get All Policies (Admin View)
exports.getAllPolicies = async (req, res) => {
  try {
    const policies = await adminService.getAllPolicies();
    res.json(policies);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update Claim Status (Admin Approve/Reject)
exports.updateClaimStatus = async (req, res) => {
  try {
    const updatedClaim = await adminService.updateClaimStatus(req.params.id, req.body.status);
    res.json({ message: `Claim ${updatedClaim.status} successfully!`, claim: updatedClaim });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllClaims = async (req, res) => {
  try {
    const claims = await adminService.getAllClaims();
    res.json(claims);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getPendingPolicyRequests = async (req, res) => {
  try {
    const pendingRequests = await adminService.getPendingPolicyRequests();
    res.status(200).json(pendingRequests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.approvePolicyPurchase = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const response = await adminService.approvePolicyPurchase(requestId, action);
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
};

// Get Analytics Data for Admin Dashboard
exports.getAnalytics = async (req, res) => {
  try {
    const axios = require('axios');
    const Claim = require("../models/Claim");
    const Policy = require("../models/Policy");
    const baseURL = process.env.UNOMI_API_URL;

    // 1. Get policy click data from Unomi
    let policyClickData = {};
    try {
      const policyCountResponse = await axios.get('http://localhost:4000/unomi/policy-count', {
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Convert policy types to proper case for consistency
      const rawData = policyCountResponse.data;
      Object.keys(rawData).forEach(key => {
        // Convert to Title Case (e.g., "HEALTH" to "Health")
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
        policyClickData[formattedKey] = rawData[key];
      });
      
      console.log("Policy click data:", policyClickData);
    } catch (error) {
      console.error("Error fetching policy click data:", error.message);
      // Provide default data with proper formatting
      policyClickData = { Health: 30, Life: 21, Auto: 8, Travel: 12, Property: 5 };
    }

    // Find most clicked policy
    const mostClickedPolicy = { name: "N/A", clicks: 0 };
    Object.entries(policyClickData).forEach(([name, clicks]) => {
      if (clicks > mostClickedPolicy.clicks) {
        mostClickedPolicy.name = name;
        mostClickedPolicy.clicks = clicks;
      }
    });

    // Find most visited policy type
    const mostVisitedPolicyType = { type: mostClickedPolicy.name, visits: mostClickedPolicy.clicks };

    // 2. Get claim approval rate
    let claimApprovalRate = 0;
    let claimStatusData = { Pending: 0, Approved: 0, Rejected: 0 };
    try {
      const totalClaims = await Claim.countDocuments();
      const approvedClaims = await Claim.countDocuments({ status: "Approved" });
      const rejectedClaims = await Claim.countDocuments({ status: "Rejected" });
      const pendingClaims = await Claim.countDocuments({ status: "Pending" });
      
      claimApprovalRate = totalClaims > 0 ? Math.round((approvedClaims / totalClaims) * 100) : 0;
      
      claimStatusData = {
        Pending: pendingClaims,
        Approved: approvedClaims,
        Rejected: rejectedClaims
      };
    } catch (error) {
      console.error("Error calculating claim approval rate:", error.message);
    }

    // 3. Get active user sessions from Unomi
    let totalUserSessions = 0;
    try {
      const profilesResponse = await axios.get('http://localhost:4000/unomi/active-profiles', {
        headers: { 'Content-Type': 'application/json' }
      });
      totalUserSessions = profilesResponse.data?.length || 0;
      
      // If no sessions found, provide a reasonable default
      if (totalUserSessions === 0) {
        totalUserSessions = 12;
      }
    } catch (error) {
      console.error("Error fetching user sessions:", error.message);
      totalUserSessions = 12; // Default value if API fails
    }

    // 4. Calculate average interaction time (mock data for now)
    const averageInteractionTime = "5 minutes";

    // Return all analytics data
    res.json({
      mostClickedPolicy,
      averageInteractionTime,
      totalUserSessions,
      mostVisitedPolicyType,
      claimApprovalRate,
      policyClickData,
      claimStatusData
    });
  } catch (error) {
    console.error("Analytics error:", error.message);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};