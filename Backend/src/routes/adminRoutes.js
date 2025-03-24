const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateUser, isAdmin } = require("../middleware/auth");

// Admin routes
router.post("/policies", authenticateUser, isAdmin, adminController.createPolicy);
router.put("/policies/:id",  authenticateUser, isAdmin,adminController.updatePolicy);
router.delete("/policies/:id",  authenticateUser, isAdmin,adminController.deletePolicy);
router.get("/policies",  authenticateUser, isAdmin,adminController.getAllPolicies);
router.get("/purchased-policies", authenticateUser, isAdmin,adminController.getAllPurchasedPolicies);
router.get("/claims",authenticateUser, isAdmin, adminController.getAllClaims);
router.put("/claims/:id/status", authenticateUser, isAdmin, adminController.updateClaimStatus);
router.get("/pending-requests", adminController.getPendingPolicyRequests);
router.post("/approve-policy", adminController.approvePolicyPurchase);
router.get("/analytics", authenticateUser, isAdmin, adminController.getAnalytics);

module.exports = router;
