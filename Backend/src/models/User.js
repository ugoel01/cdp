const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ["User", "Admin"], 
    required: true 
  },
  policies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Policy" }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

module.exports = mongoose.model("User", UserSchema);
