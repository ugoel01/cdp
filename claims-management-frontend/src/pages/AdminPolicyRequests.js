import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import toast from "react-hot-toast";

function AdminPolicyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get("/admin/pending-requests");
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId, action) => {
    try {
      await api.post("/admin/approve-policy", { requestId, action });
      fetchPendingRequests(); // Refresh the list after approval/rejection
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process request.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Admin Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
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
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-md mt-8">
        <h2 className="text-2xl font-bold text-center text-gray-800">Pending Policy Requests</h2>

        {error && <p className="text-red-500 text-center mt-4 bg-red-100 p-2 rounded-md">{error}</p>}

        {loading ? (
          <div className="flex justify-center items-center mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : requests.length > 0 ? (
          <table className="w-full mt-6 border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">User</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Policy</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Coverage</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{request.userId.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{request.policyId.type}</td>
                  <td className="border border-gray-300 px-4 py-2">${request.policyId.coverageAmount}</td>
                  <td className="border border-gray-300 px-4 py-2 text-yellow-600 font-semibold">{request.status}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button 
                      className="bg-green-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-green-600 transition"
                      onClick={() => handleApproval(request._id, "Approve")}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                      onClick={() => handleApproval(request._id, "Reject")}
                    >
                      ❌ Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center mt-6">No pending requests.</p>
        )}
      </div>
    </div>
  );
}

export default AdminPolicyRequests;
