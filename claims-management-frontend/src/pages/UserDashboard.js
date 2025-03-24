import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useNotification } from "../context/NotificationContext";

function UserDashboard() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const { showError } = useNotification();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      showError("Logout failed. Please try again.");
      localStorage.clear();
      navigate("/login");
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userID");
    const storedName = localStorage.getItem("name");

    if (!storedUserId) {
      handleLogout();
      return;
    }

    setName(storedName || "User");

    const fetchUserPolicies = async () => {
      try {
        const response = await api.get(`/users/my-policies/${storedUserId}`);

        if (response.data?.error === "User has not purchased any policies.") {
          setPolicies([]);
          setError(""); 
        } else {
          setPolicies(response.data);
        }
      } catch (err) {
        console.error("API Fetch Error:", err.response?.data || err.message);
        if (err.response && err.response.status === 401) {
          showError("Your session has expired. Please login again.");
          handleLogout();
        } else {
          const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to fetch your policies.";
          showError("You don't have any active policies.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserPolicies();
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen flex flex-col">
      <nav className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Claim Management</h1>
        <div className="flex space-x-4">
          <button onClick={() => navigate("/user-dashboard")} className="hover:text-gray-300">🏠 Dashboard</button>
          <button onClick={() => navigate("/BuyPolicy")} className="hover:text-gray-300">📜 Buy Policy</button>
          <button onClick={() => navigate("/FileClaim")} className="hover:text-gray-300">📂 File a Claim</button>
          <button onClick={() => navigate("/myclaims")} className="hover:text-gray-300">📂 My Claims</button>
          <button onClick={() => navigate("/profile")} className="hover:text-gray-300">👤 Profile</button>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition duration-200">
            🚪 Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto mt-8 p-6 bg-white shadow-xl rounded-md flex-grow">
        <h2 className="text-3xl font-extrabold text-center text-gray-800">Your Policies</h2>

        <p className="text-gray-500 text-center mt-2">Welcome, <span className="font-semibold">{name}</span>!</p>

        {error && (
          <p className="text-red-500 text-center mt-4 bg-red-100 p-2 rounded-md">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center items-center mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : policies.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {policies.map((policy) => (
              <div key={policy._id} className="p-6 border border-gray-200 rounded-xl shadow-lg bg-gradient-to-r from-blue-100 to-gray-50 hover:shadow-xl transition duration-200 transform hover:scale-105">
                <h3 className="text-xl font-bold text-blue-700">{policy.policyId?.policyNumber || "Unknown Policy"}</h3>
                <p className="text-gray-700 text-lg">
                  <span className="font-semibold text-gray-900">Coverage:</span> <span className="font-medium text-green-600">${policy.policyId?.coverageAmount || "N/A"}</span>
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Start Date:</span> {new Date(policy.startDate).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">End Date:</span> {new Date(policy.endDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-6">You don't have any active policies.</p>
        )}
      </div>

      <footer className="bg-blue-600 text-white text-center py-4 mt-8 shadow-md">
        <p>2025 Claim Management System. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default UserDashboard;
