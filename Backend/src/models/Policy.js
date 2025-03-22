const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema({
  policyNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  coverageAmount: { type: Number, required: true },
  cost: { type: Number, required: false }, 
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

module.exports = mongoose.model("Policy", PolicySchema);
