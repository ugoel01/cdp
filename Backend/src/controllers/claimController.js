const claimService = require("../services/claimService");

exports.createClaim = async (req, res) => {
  try {
    console.log(req.body);
    const newClaim = await claimService.createClaim(req.body);
    res.status(201).json(newClaim);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getClaimsByUser = async (req, res) => {
  try {
    const claims = await claimService.getClaimsByUser(req.params.userId);
    res.json(claims);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteClaim = async (req, res) => {
  try {
    const message = await claimService.deleteClaim(req.params.id, req.query.userId);
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
