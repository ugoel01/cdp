import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "User",
    adminKey: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    if (formData.role === "Admin") {
      userData.adminKey = formData.adminKey;
    }

    try {
      await api.post("/users/register", userData);
      setSuccess("🎉 Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      
      {/* ✅ Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Claim Management</h1>
        <div className="space-x-4">
          <a href="/" className="hover:text-gray-300 transition">🏠 Home</a>
          <a href="/login" className="hover:text-gray-300 transition">🔑 Login</a>
        </div>
      </nav>

      {/* ✅ Signup Form */}
      <div className="flex justify-center items-center flex-grow">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-blue-700">Join Us Today! 🚀</h2>
          <p className="text-gray-500 text-center mb-4">Sign up to manage your policies and claims with ease.</p>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
                placeholder="Create a password"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
                placeholder="Confirm your password"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Admin Key (If Admin) */}
            {formData.role === "Admin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Admin Key</label>
                <input
                  type="password"
                  name="adminKey"
                  value={formData.adminKey}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
                  placeholder="Enter Admin Key"
                />
              </div>
            )}

            {/* Signup Button */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              🎉 Create Account
            </button>
          </form>

          {/* Login Link */}
          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              🔑 Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
