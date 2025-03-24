import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import axios from 'axios';


function ManagePolicies() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [updatedFields, setUpdatedFields] = useState({ coverageAmount: "", cost: "" });

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await api.get("/users/policies");
        setPolicies(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch policies.");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear localStorage and redirect even if API call fails
      localStorage.clear();
      navigate("/login");
    }
  };

  // ✅ Handle Input Change for Editing
  const handleInputChange = (e) => {
    setUpdatedFields({ ...updatedFields, [e.target.name]: e.target.value });
  };

  // ✅ Handle Update for Coverage Amount & Cost
  const handleUpdate = async (policyId, policyNumber) => {
    if (!updatedFields.coverageAmount || !updatedFields.cost) {
      setError("Please enter values for both Coverage Amount and Cost.");
      return;
    }

    try {
      await api.put(`/admin/policies/${policyId}`, {
        policyNumber,
        coverageAmount: updatedFields.coverageAmount,
        cost: updatedFields.cost,
      });

      setSuccess("Policy updated successfully!");
      setPolicies((prevPolicies) =>
        prevPolicies.map((policy) =>
          policy._id === policyId
            ? { ...policy, coverageAmount: updatedFields.coverageAmount, cost: updatedFields.cost }
            : policy
        )
      );

      setEditingPolicy(null);
      setUpdatedFields({ coverageAmount: "", cost: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update policy.");
    }
  };

 // ✅ Handle Delete Policy
const handleDelete = async (policyId, policyNumber) => {
  try {
    console.log(policyNumber);
    await api.delete(`/admin/policies/${policyId}?policyNumber=${policyNumber}`);
    setSuccess("Policy deleted successfully!");
    setPolicies((prevPolicies) => prevPolicies.filter((policy) => policy._id !== policyId));

    const policyIdNumber = policyNumber.replace(/\D/g, '');
    // ✅ Send Data to Apache Unomi (Profiles) with Authorization
    try {
      const response = await axios.delete(`http://localhost:8181/cxs/profiles/profile${policyIdNumber}`, {
        headers: {
          Authorization: `Basic ${btoa('karaf:karaf')}`, // ✅ Use btoa for Base64
          'Content-Type': 'application/json'
        }
      });

      console.log("Policy deleted from Apache Unomi:", response.data);
    } catch (error) {
      console.error("Error in deleting policy from Apache Unomi:", error?.response?.data || error.message);
    }
  } catch (err) {
    setError(err.response?.data?.message || "Failed to delete policy.");
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
        <h2 className="text-2xl font-bold text-center text-gray-800">Manage Policies</h2>

        {/* Show Messages */}
        {error && <p className="text-red-500 text-center mt-4 bg-red-100 p-2 rounded-md">{error}</p>}
        {success && <p className="text-green-500 text-center mt-4 bg-green-100 p-2 rounded-md">{success}</p>}

        {/* ✅ Loading Animation */}
        {loading ? (
          <div className="flex justify-center items-center mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : policies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {policies.map((policy) => (
              <div key={policy._id} className="p-6 border border-gray-300 rounded-lg shadow-md bg-gray-50">
                <h3 className="text-lg font-semibold text-blue-700">
                  {policy.policyNumber} - {policy.type}
                </h3>

                <p className="text-gray-600">Coverage Amount: ${policy.coverageAmount}</p>
                <p className="text-gray-600">Cost: ${policy.cost || "N/A"}</p>
                <p className="text-gray-600">Start Date: {new Date(policy.startDate).toLocaleDateString()}</p>
                <p className="text-gray-600">End Date: {new Date(policy.endDate).toLocaleDateString()}</p>

                {/* ✅ Update Coverage Amount & Cost */}
                {editingPolicy === policy._id ? (
                  <div className="mt-3">
                    <input
                      type="number"
                      name="coverageAmount"
                      placeholder="New Coverage Amount"
                      value={updatedFields.coverageAmount}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      name="cost"
                      placeholder="New Cost"
                      value={updatedFields.cost}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg mt-2"
                    />
                    <button
                      onClick={() => handleUpdate(policy._id, policy.policyNumber)}
                      className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full transition duration-200"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingPolicy(policy._id)}
                    className="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg w-full transition duration-200"
                  >
                    ✏️ Update Policy
                  </button>
                )}

                {/* ✅ Delete Button */}
                <button
                  onClick={() => handleDelete(policy._id, policy.policyNumber)}
                  className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg w-full transition duration-200"
                >
                  🗑 Delete Policy
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-6">No policies available.</p>
        )}
      </div>
    </div>
  );
}

export default ManagePolicies;
