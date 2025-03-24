const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");

const User = require("../models/User");
const Policy = require("../models/Policy");
const Policyholder = require("../models/Policyholder");
const PolicyRequest = require("../models/PolicyRequest");

const sendEmail = require("../utils/sendEmail");
const sendWelcomeEmail = require("../utils/sendWelcomeEmail");
const sendLoginEmail = require("../utils/sendLoginEmail");
const sendPolicyPurchaseEmail = require("../utils/sendPolicyPurchaseEmail");

const { createOrUpdateProfile, updateProfile } = require("../controllers/unomiController");
const { createContact } = require("./mauticService");

require("dotenv").config();

const baseURL = process.env.UNOMI_API_URL;

// Register User
exports.registerUser = async (data) => {
  let { name, email, password, role, adminKey } = data;

  if (!name || !email || !password || !role) {
    throw new Error("All fields are required.");
  }

  email = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  if (await User.findOne({ email })) {
    throw new Error("User already exists.");
  }

  if (role === "Admin" && adminKey !== process.env.ADMIN_SECRET_KEY) {
    throw new Error("Invalid Admin registration key.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, role });
  await newUser.save();

  try {
    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ") || "Unknown";

    await createOrUpdateProfile({
      userId: newUser._id.toString(),
      firstName,
      lastName,
      email,
    });
  } catch (error) {
    console.error("Failed to save user data to Unomi:", error.message);
  }

  try {
    await sendWelcomeEmail(email, name);
  } catch (error) {
    console.error("Failed to send welcome email:", error.message);
  }

  try {
    if (role === "User") {
      await createContact({ name, email, segmentIds: 1 });
    }
  } catch (error) {
    console.error("Failed to create contact in Mautic:", error.message);
  }

  return newUser;
};

// Login User
exports.loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Please fill all details carefully.");
  }

  email = email.trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not registered");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password.");

  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  try {
    const [firstName, ...lastNameParts] = user.name.split(" ");
    const lastName = lastNameParts.join(" ") || "Unknown";

    await createOrUpdateProfile({
      userId: user._id.toString(),
      firstName,
      lastName,
      email: user.email,
    });
  } catch (unomiError) {
    console.error("Unomi profile update failed:", unomiError.message);
  }

  try {
    const loginTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const device = "Web Browser";
    await sendLoginEmail(user.email, user.name, loginTime, device);
  } catch (error) {
    console.error("Failed to send login notification:", error.message);
  }

  return {
    message: "Login successful",
    token,
    userId: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
};

// Update User
exports.updateUser = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found.");

  if (data.name) user.name = data.name.trim();
  if (data.email) user.email = data.email.trim().toLowerCase();
  if (data.password && data.password.length >= 6) {
    user.password = await bcrypt.hash(data.password.trim(), 10);
  } else if (data.password) {
    throw new Error("Password must be at least 6 characters long.");
  }

  await user.save();

  const [firstName, ...lastNameParts] = user.name.split(" ");
  const lastName = lastNameParts.join(" ") || "Unknown";

  try {
    await updateProfile(user._id.toString(), {
      firstName,
      lastName,
      email: user.email,
    });
  } catch (unomiError) {
    console.error("Failed to update Unomi profile:", unomiError.message);
  }

  return user;
};

// Delete User
exports.deleteUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found.");

    const policyholder = await Policyholder.findOne({ userId });
    if (policyholder && policyholder.policies.length > 0) {
      throw new Error("User cannot be deleted as they have active policies.");
    }

    const searchBody = {
      condition: {
        type: "profilePropertyCondition",
        parameterValues: {
          propertyName: "properties.userId",
          comparisonOperator: "equals",
          propertyValue: userId,
        },
      },
    };

    const searchResponse = await axios.post(
      `${baseURL}/cxs/profiles/search`,
      searchBody,
      {
        headers: {
          Authorization: `Basic ${Buffer.from("karaf:karaf").toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const profileIds = searchResponse.data.list.map((profile) => profile.itemId);

    for (const profileId of profileIds) {
      await axios.delete(`${baseURL}/cxs/profiles/${profileId}`, {
        headers: {
          Authorization: `Basic ${Buffer.from("karaf:karaf").toString("base64")}`,
          "Content-Type": "application/json",
        },
      });
    }

    await User.findByIdAndDelete(userId);
    return { message: "User account and associated profiles permanently deleted." };
  } catch (error) {
    console.error("Error during deletion:", error.message);
    throw error;
  }
};

// Get All Policies
exports.getAllPolicies = async () => {
  return await Policy.find();
};

// Buy Policy
exports.buyPolicy = async (userId, policyId, startDate, endDate) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found.");

  const policy = await Policy.findById(policyId);
  if (!policy) throw new Error("Policy does not exist.");

  const existingRequest = await PolicyRequest.findOne({ userId, policyId, status: "Pending" });
  if (existingRequest) {
    throw new Error("You have already requested this policy. Please wait for admin approval.");
  }

  const policyRequest = new PolicyRequest({
    userId,
    policyId,
    startDate,
    endDate,
    status: "Pending",
  });

  await policyRequest.save();

  try {
    const policyDetails = {
      type: policy.type,
      coverageAmount: policy.coverageAmount,
      premium: policy.premium,
      duration: policy.duration,
    };

    await sendPolicyPurchaseEmail(user.email, user.name, policyDetails);
    await createContact({ name: user.name, email: user.email, segmentIds: 2 });
  } catch (error) {
    console.error("Failed to send policy purchase notification:", error.message);
  }

  return { message: "Your policy request has been submitted for admin approval." };
};

// Get User's Purchased Policies
exports.getUserPolicies = async (userId) => {
  const policyholder = await Policyholder.findOne({ userId })
    .populate({
      path: "policies.policyId",
      select: "policyNumber coverageAmount",
    })
    .lean();

  if (!policyholder) throw new Error("User has not purchased any policies.");

  return policyholder.policies;
};

// Forgot Password
exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not registered.");

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail(user.email, "Password Reset Request", `Click to reset: ${resetLink}`);

  return { message: "Password reset link sent to email." };
};

// Reset Password
exports.resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error("Invalid or expired reset token.");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: "Password reset successful. You can now log in." };
};
