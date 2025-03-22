import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await api.post("/users/forgot-password", { email });
      setMessage("✅ Reset link sent! Check your email.");
    } catch (err) {
      setMessage("❌ Failed to send reset link. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ✅ Navigation Bar */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">🔑 Forgot Password</h1>
        <button onClick={() => navigate("/login")} className="hover:text-gray-300">
          🔙 Back to Login
        </button>
      </nav>

      {/* ✅ Forgot Password Card */}
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">🔒 Forgot Your Password?</h2>
          <p className="text-gray-600 text-center mb-4">Enter your email and we'll send you a reset link.</p>

          {message && (
            <p className={`text-center p-2 rounded-md mb-4 ${message.includes("✅") ? "text-green-500 bg-green-100" : "text-red-500 bg-red-100"}`}>
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ✅ Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>

            {/*Submit Button */}
            <button
              type="submit"
              className={`w-full text-white py-2 rounded-lg transition duration-200 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={loading}
            >
              {loading ? "🔄 Sending..." : "📩 Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
