// const mongoose = require("mongoose");

// const PolicyholderSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   policies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Policy", required: true }],
//   purchaseDate: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("Policyholder", PolicyholderSchema);

const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: "Policy", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

const PolicyholderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    policies: [policySchema], // Store an array of policy objects
    purchaseDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    }
  },
  {
    timestamps: true 
  }
);

module.exports = mongoose.model("Policyholder", PolicyholderSchema);
