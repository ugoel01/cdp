const express = require("express");
const router = express.Router();
const policyController = require("../controllers/policyController");
const { authenticateUser, isUser } = require("../middleware/auth");

//Get all policies (Available to everyone)
router.get("/",policyController.getAllPolicies);

// Get a policy by ID (Available to everyone)
router.get("/:id", policyController.getPolicyById);

module.exports = router;
