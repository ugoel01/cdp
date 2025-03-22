import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function ManageClaims() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Fetch all claims
  const fetchClaims = async () => {
    try {
      const response = await api.get("/admin/claims");
      setClaims(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch claims.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // ✅ Handle Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ✅ Handle Approve or Reject Claim
  const handleUpdateClaimStatus = async (claimId, status) => {
    try {
  
      await api.put(
        `/admin/claims/${claimId}/status`,
        { status }, 
        { headers: { "Content-Type": "application/json" } } 
      );
  
      setSuccess(`Claim ${status} successfully!`);
      fetchClaims();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update claim status.");
    }
  };
  

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* ✅ Admin Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Panel</h1>

        <div className="flex space-x-6">
          <button onClick={() => navigate("/admin-dashboard")} className="hover:text-gray-300 transition">
            🏠 Dashboard
          </button>
          <button onClick={() => navigate("/admin/manage-policies")} className="hover:text-gray-300 transition">
            📜 Manage Policies
          </button>
          <button onClick={() => navigate("/admin/manage-claims")} className="hover:text-gray-300 transition">
            📂 Manage Claims
          </button>
          <button onClick={() => navigate("/admin/create-policy")} className="hover:text-gray-300 transition">
            ➕ Create Policy
          </button>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition duration-200"
          >
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* ✅ Main Content */}
      <div className="max-w-7xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-md flex-grow">
        <h2 className="text-2xl font-bold text-center text-gray-800">Manage Claims</h2>

        {/* Show Messages */}
        {error && <p className="text-red-500 text-center mt-4 bg-red-100 p-2 rounded-md">{error}</p>}
        {success && <p className="text-green-500 text-center mt-4 bg-green-100 p-2 rounded-md">{success}</p>}

        {/* ✅ Loading Animation */}
        {loading ? (
  <div className="flex justify-center items-center mt-6">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
  </div>
) : claims.filter(claim => claim.status === "Pending").length > 0 ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
    {claims
      .filter(claim => claim.status === "Pending") // ✅ Show only Pending claims
      .map((claim) => (
        <div key={claim._id} className="p-6 border border-gray-300 rounded-lg shadow-md bg-gray-50">
          <h3 className="text-lg font-semibold text-blue-700">
            Claim ID: {claim._id}
          </h3>

          <p className="text-gray-600"><strong>User:</strong> {claim.userId.name}</p>
          <p className="text-gray-600"><strong>Policy:</strong> {claim.policyId.policyNumber} ({claim.policyId.type})</p>
          <p className="text-gray-600"><strong>Coverage:</strong> ${claim.policyId.coverageAmount}</p>
          <p className="text-gray-600"><strong>Claim Amount:</strong> ${claim.amount}</p>
          <p className="text-gray-600"><strong>Status:</strong> 
            <span className="font-bold text-yellow-500">
              {claim.status}
            </span>
          </p>
          <p className="text-gray-600"><strong>Filed On:</strong> {new Date(claim.dateFiled).toLocaleDateString()}</p>

          {/* ✅ Approve & Reject Buttons */}
          <div className="mt-3 flex flex-col space-y-2">
            <button
              onClick={() => handleUpdateClaimStatus(claim._id, "Approved")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              ✅ Approve
            </button>
            <button
              onClick={() => handleUpdateClaimStatus(claim._id, "Rejected")}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              ❌ Reject
            </button>
          </div>
        </div>
      ))}
  </div>
) : (
  <p className="text-gray-500 text-center mt-6">No pending claims available.</p>
)}

      </div>
    </div>
  );
}

export default ManageClaims;
