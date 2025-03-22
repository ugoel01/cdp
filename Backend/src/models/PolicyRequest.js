const mongoose = require("mongoose");

const PolicyRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: "Policy", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date},
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  requestedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PolicyRequest", PolicyRequestSchema);
