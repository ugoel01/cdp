const express = require("express");
const router = express.Router();
const claimController = require("../controllers/claimController");
const { authenticateUser, isUser } = require("../middleware/auth");


router.post("/", authenticateUser, isUser, claimController.createClaim);

// Get all claims for a specific user
router.get("/user/:userId", authenticateUser, isUser,claimController.getClaimsByUser);

// Delete a claim (Users can cancel only "Pending" claims)
router.delete("/:id", authenticateUser, isUser,claimController.deleteClaim);

module.exports = router;
