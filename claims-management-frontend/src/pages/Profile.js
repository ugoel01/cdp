import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Profile() {
  const navigate = useNavigate();
  
  // ✅ Get User Data from Local Storage
  const storedName = localStorage.getItem("name") || "User";
  const storedEmail = localStorage.getItem("email") || "Not Available";
  const storedRole = localStorage.getItem("role") || "User";

  const userId = localStorage.getItem("userID");

  const [name, setName] = useState(storedName);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Update User Details (Save to Local Storage & API)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    localStorage.setItem("name", name.trim()); // ✅ Save updated name to Local Storage

    // Prepare update data
    const updateData = { name };
    if (password.trim()) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      updateData.password = password.trim();
    }

    try {
      await api.put(`/users/${userId}`, updateData);
      setSuccess("Profile updated successfully.");
      setPassword(""); // Clear password field after update
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    }
  };

  // ✅ Delete User Account
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      localStorage.clear(); // ✅ Remove user data from Local Storage
      navigate("/signup");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account.");
    }
  };

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      
      {/* ✅ Navigation Bar */}
      <nav className="bg-blue-600 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Profile</h1>
        
        <div className="flex space-x-6">
          <button onClick={() => navigate("/user-dashboard")} className="hover:text-gray-300 transition">
            🏠 Dashboard
          </button>
          <button onClick={() => navigate("/my-claims")} className="hover:text-gray-300 transition">
            📂 My Claims
          </button>
          <button onClick={() => navigate("/file-claim")} className="hover:text-gray-300 transition">
            ➕ File a Claim
          </button>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition duration-200"
          >
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* ✅ Profile Form */}
      <div className="max-w-lg mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Profile Information</h2>

        {/* Show Messages */}
        {error && <p className="text-red-500 text-center mt-4 bg-red-100 p-2 rounded-md">{error}</p>}
        {success && <p className="text-green-500 text-center mt-4 bg-green-100 p-2 rounded-md">{success}</p>}

        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Email (Read-Only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={storedEmail}
              disabled
              className="w-full p-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Role (Read-Only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <input
              type="text"
              value={storedRole}
              disabled
              className="w-full p-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password (Optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          {/* Update Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Update Profile
          </button>
        </form>

        {/* Delete Account Button */}
        <button
          onClick={handleDeleteAccount}
          className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-200"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

export default Profile;
