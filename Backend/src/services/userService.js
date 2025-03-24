const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Policy = require("../models/Policy");
const Policyholder = require("../models/Policyholder");
const PolicyRequest = require("../models/PolicyRequest");
const jwt = require("jsonwebtoken")
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const sendWelcomeEmail = require("../utils/sendWelcomeEmail");
const sendLoginEmail = require("../utils/sendLoginEmail");
const sendPolicyPurchaseEmail = require("../utils/sendPolicyPurchaseEmail");
const { createContact } = require("./mauticService");
const { createOrUpdateProfile } = require("../controllers/unomiController");

require("dotenv").config()

const baseURL = process.env.UNOMI_API_URL;

// Register User (With Password Hashing)
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

  // Hash password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ name, email, password: hashedPassword, role });
  await newUser.save();

  try {
    // Save to Unomi
    const [firstName, ...lastNameParts] = name.split(" ");
    const lastName = lastNameParts.join(" ") || "Unknown";
    await createOrUpdateProfile({
      userId: newUser._id.toString(),
      firstName,
      lastName,
      email,
    });
    console.log("User profile created/updated in Unomi");
  } catch (error) {
    console.error("Failed to save user data to Unomi:", error.message);
  }

  try {
    // Optionally create contact in Mautic
    await createContact({ name, email });
    console.log("Contact created in Mautic");
  } catch (error) {
    console.error("Failed to create contact in Mautic:", error.message);
  }

  return newUser;
};
// Login User (Compare Hashed Password)
// Login User (Compare Hashed Password)
exports.loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error("Please fill all details Carefully");
    }

    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not Registered");

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password.");

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Update profile in Unomi on login
    if (user.name) {
      const [firstName, ...lastNameParts] = user.name.split(" ");
      const lastName = lastNameParts.join(" ");
      
      console.log(`Updating Unomi Profile for User: ${user._id}`);
      
      try {
        await createOrUpdateProfile({
          userId: user._id.toString(),
          firstName: firstName || "Unknown",
          lastName: lastName || "Unknown",
          email: user.email,
        });
      } catch (unomiError) {
        console.error("Unomi Profile Update Failed:", unomiError.message);
      }
    }

    return {
      message: "Login successful",
      token,
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  } catch (error) {
    console.error("Login Error:", error.message);
    throw error;
  }

  email = email.trim().toLowerCase();

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not Registered");

  // Compare hashed password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password.");

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
  
  // Send login notification email
  try {
    const loginTime = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Kolkata' 
    });
    const device = "Web Browser"; // You can enhance this to detect actual browser/device
    await sendLoginEmail(user.email, user.name, loginTime, device);
  } catch (error) {
    console.error("Failed to send login notification:", error);
    // Continue login process even if email fails
  }

  // Return user details & token
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
const { updateProfile } = require("../controllers/unomiController");

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

  // Extract first and last names from the name field
  const [firstName, ...lastNameParts] = user.name.split(" ");
  const lastName = lastNameParts.join(" ");

  // Update Unomi Profile
  try {
    console.log(`Updating Unomi Profile for User ID: ${user._id}`);
    await updateProfile(user._id.toString(), {
      firstName: firstName || "Unknown",
      lastName: lastName || "Unknown",
      email: user.email,
    });
  } catch (unomiError) {
    console.error("Failed to update Unomi profile:", unomiError.message);
  }

  return user;
};


// Delete User
// exports.deleteUser = async (userId) => {
//   // Check if the user exists
//   const user = await User.findById(userId);
//   if (!user) throw new Error("User not found.");

//   // Check if user has active policies
//   const policyholder = await Policyholder.findOne({ userId });
//   if (policyholder && policyholder.policies.length > 0) {
//     throw new Error("User cannot be deleted as they have active policies.");
//   }

//   // Permanently delete user
//   await User.findByIdAndDelete(userId);

//   return { message: "User account permanently deleted." };
// };
const axios = require('axios');

exports.deleteUser = async (userId) => {
  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found.");

    // Check if user has active policies
    const policyholder = await Policyholder.findOne({ userId });
    if (policyholder && policyholder.policies.length > 0) {
      throw new Error("User cannot be deleted as they have active policies.");
    }

    // Search for profiles in Apache Unomi
    const searchBody = {
      condition: {
        type: "profilePropertyCondition",
        parameterValues: {
          propertyName: "properties.userId",
          comparisonOperator: "equals",
          propertyValue: userId
        }
      }
    };

    const searchResponse = await axios.post(`${baseURL}/cxs/profiles/search`, searchBody, {
      headers: {
        Authorization: `Basic ${Buffer.from('karaf:karaf').toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    const profileIds = searchResponse.data.list.map(profile => profile.itemId);

    if (profileIds.length === 0) {
      console.log('No profiles found for deletion in Unomi.');
    } else {
      console.log('Profiles to be deleted:', profileIds);

      // Delete profiles using DELETE API for each profile
      for (const profileId of profileIds) {
        await axios.delete(`${baseURL}/cxs/profiles/${profileId}`, {
          headers: {
            Authorization: `Basic ${Buffer.from('karaf:karaf').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        });
      }
      console.log('Profiles deleted successfully.');
    }

    // Permanently delete user from CMS database
    await User.findByIdAndDelete(userId);
    return { message: "User account and associated profiles permanently deleted." };
  } catch (error) {
    console.error('Error during deletion:', error.message);
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

  // Check if the user has already requested this policy
  const existingRequest = await PolicyRequest.findOne({ userId, policyId, status: "Pending" });
  if (existingRequest) {
    throw new Error("You have already requested this policy. Please wait for admin approval.");
  }

  // Save the policy request for admin approval
  const policyRequest = new PolicyRequest({
    userId,
    policyId,
    startDate,
    endDate,
    status: "Pending", // Admin needs to approve it
  });
  console.log(policyRequest);

  await policyRequest.save();

  // Send policy purchase email notification
  try {
    const policyDetails = {
      type: policy.type,
      coverageAmount: policy.coverageAmount,
      premium: policy.premium,
      duration: policy.duration
    };
    
    await sendPolicyPurchaseEmail(user.email, user.name, policyDetails);
  } catch (error) {
    console.error("Failed to send policy purchase notification:", error);
    // Continue with policy purchase even if email fails
  }

  return { message: "Your policy request has been submitted for admin approval." };
};

// Get User's Purchased Policies
exports.getUserPolicies = async (userId) => {
  const policyholder = await Policyholder.findOne({ userId })
    .populate({
      path: "policies.policyId", // Populate policyId from Policy collection
      select: "policyNumber coverageAmount" // Fetch specific fields
    })
    .lean(); // Convert to plain JSON object

  if (!policyholder) throw new Error("User has not purchased any policies.");

  return policyholder.policies;
};

// Forgot Password (Send Email with Reset Link)
exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not registered.");

  // Generate Reset Token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
  await user.save();

  // Send Email with Reset Link
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail(user.email, "Password Reset Request", `Click to reset: ${resetLink}`);

  return { message: "Password reset link sent to email." };
};

// Reset Password (Verify Token & Update Password)
exports.resetPassword = async (token, newPassword) => {
  const user = await User.findOne({ 
    resetPasswordToken: token, 
    resetPasswordExpires: { $gt: Date.now() } 
  });

  if (!user) throw new Error("Invalid or expired reset token.");

  // Hash new password and update user
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: "Password reset successful. You can now log in." };
};