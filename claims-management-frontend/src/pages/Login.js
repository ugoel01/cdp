import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/users/login", formData);

      const { token, role, userId, email, name } = response.data;
      if (!userId || !email) {
        throw new Error("Missing user data in response.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userID", userId);
      localStorage.setItem("email", email);
      localStorage.setItem("name", name);

      setLoading(false);
      navigate(role === "Admin" ? "/admin-dashboard" : "/user-dashboard");
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* ✅ Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Claim Management</h1>
        <div className="space-x-4">
          <a href="/" className="hover:text-gray-300 transition">🏠 Home</a>
          <a href="/signup" className="hover:text-gray-300 transition">✍ Sign Up</a>
        </div>
      </nav>

      {/* ✅ Login Form */}
      <div className="flex justify-center items-center flex-grow">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-bold text-center text-blue-700">Welcome Back!</h2>
          <p className="text-gray-500 text-center mb-4">Manage your claims effortlessly.</p>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
                placeholder="Enter your email..."
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300"
                placeholder="Enter your password..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full text-white py-2 rounded-lg transition duration-200 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "🚀 Login"}
            </button>
          </form>

          {/* Extra Links */}
          <p className="text-sm text-center mt-4">
            <a href="/forgot-password" className="text-blue-500 hover:underline">
              🔑 Forgot Password?
            </a>
          </p>
          <p className="text-sm text-center mt-4">
            New here?{" "}
            <a href="/signup" className="text-blue-500 hover:underline">
              ✨ Create an Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
