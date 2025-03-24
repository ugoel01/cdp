import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function CreatePolicy() {
  const navigate = useNavigate();
  const [newPolicy, setNewPolicy] = useState({
    policyNumber: "",
    type: "",
    coverageAmount: "",
    cost: "",
    startDate: "",
    endDate: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setNewPolicy({ ...newPolicy, [e.target.name]: e.target.value });
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPolicy.policyNumber || !newPolicy.type || !newPolicy.coverageAmount || !newPolicy.cost || !newPolicy.startDate || !newPolicy.endDate) {
      setError("All fields are required.");
      return;
    }

    try {
      await api.post("/admin/policies", newPolicy);
      setSuccess("Policy created successfully!");
      setNewPolicy({
        policyNumber: "",
        type: "",
        coverageAmount: "",
        cost: "",
        startDate: "",
        endDate: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create policy.");
    }
  };

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

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      
      {/* Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Panel</h1>

        <div className="flex space-x-6">
          <button onClick={() => navigate("/admin-dashboard")} className="hover:text-gray-300 transition">
            Dashboard
          </button>
          <button onClick={() => navigate("/admin/manage-policies")} className="hover:text-gray-300 transition">
            Manage Policies
          </button>
          <button onClick={() => navigate("/admin/manage-claims")} className="hover:text-gray-300 transition">
            Manage Claims
          </button>
          <button onClick={() => navigate("/admin/create-policy")} className="hover:text-gray-300 transition">
            Create Policy
          </button>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Create Policy Form */}
      <div className="max-w-lg mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Create New Policy</h2>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {success && <p className="text-green-500 text-center mt-4">{success}</p>}

        <form onSubmit={handleCreatePolicy} className="space-y-4">
          <input type="text" name="policyNumber" placeholder="Policy Number" value={newPolicy.policyNumber} onChange={handleChange} required className="w-full p-2 border rounded-lg" />
          <input type="text" name="type" placeholder="Policy Type" value={newPolicy.type} onChange={handleChange} required className="w-full p-2 border rounded-lg" />
          <input type="number" name="coverageAmount" placeholder="Coverage Amount" value={newPolicy.coverageAmount} onChange={handleChange} required className="w-full p-2 border rounded-lg" />
          <input type="number" name="cost" placeholder="Cost" value={newPolicy.cost} onChange={handleChange} required className="w-full p-2 border rounded-lg" />
          <input type="date" name="startDate" placeholder="Start Date" value={newPolicy.startDate} onChange={handleChange} required className="w-full p-2 border rounded-lg" />
          <input type="date" name="endDate" placeholder="End Date" value={newPolicy.endDate} onChange={handleChange} required className="w-full p-2 border rounded-lg" />
          
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200">
            Create Policy
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePolicy;
