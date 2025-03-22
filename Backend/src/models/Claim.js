const mongoose = require("mongoose");

const ClaimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  policyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Policy",
    required: true,
  },
  Document: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  dateFiled: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Claim", ClaimSchema);
