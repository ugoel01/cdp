import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/users/reset-password", { token, newPassword });
      setMessage(response.data.message);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ Navigation Bar */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">🔒 Secure Password Reset</h1>
        <button onClick={() => navigate("/login")} className="hover:text-gray-300">
          🔙 Back to Login
        </button>
      </nav>

      {/* ✅ Reset Password Card */}
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">🔑 Reset Your Password</h2>

          {message && (
            <p className={`text-center p-2 rounded-md mb-4 ${message.includes("success") ? "text-green-500 bg-green-100" : "text-red-500 bg-red-100"}`}>
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ✅ New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>

            {/* ✅ Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>

            {/* ✅ Submit Button */}
            <button
              type="submit"
              className={`w-full text-white py-2 rounded-lg transition duration-200 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={loading}
            >
              {loading ? "🔄 Resetting..." : "🔒 Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
