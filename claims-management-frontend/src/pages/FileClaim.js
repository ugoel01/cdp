import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function FileClaim() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [claimData, setClaimData] = useState({
    policyId: "",
    amount: "",
    dateFiled: getTodayDate(), // Auto-set today's date
    documentLink: "", // Store file link
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userId = localStorage.getItem("userId") || localStorage.getItem("userID");

  // ✅ Function to Get Today's Date (YYYY-MM-DD format)
  function getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  useEffect(() => {
    // Fetch User Policies
    const fetchPolicies = async () => {
      try {
        const response = await api.get(`/users/my-policies/${userId}`);
        console.log("Fetched Policies:", response.data);
        
        if (Array.isArray(response.data)) {
          setPolicies(response.data);
        } else {
          setError("Invalid response format.");
        }
      } catch (err) {
        setError("Failed to fetch policies.");
      }
    };
    fetchPolicies();
  }, [userId]);

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Find the selected policy to check coverage amount
    const selectedPolicy = policies.find((policy) => policy.policyId._id === claimData.policyId);

    if (!selectedPolicy) {
      setError("Invalid policy selection.");
      return;
    }

    const maxCoverageAmount = selectedPolicy.policyId.coverageAmount;

    // Validate claim amount
    if (Number(claimData.amount) > maxCoverageAmount) {
      setError(`Claim amount cannot exceed coverage amount ($${maxCoverageAmount}).`);
      return;
    }

    // Validate document link
    if (!claimData.documentLink.startsWith("http")) {
      setError("Please enter a valid document URL.");
      return;
    }

    const claimPayload = {
      userId,
      policyId: claimData.policyId,
      amount: Number(claimData.amount),
      dateFiled: claimData.dateFiled,
      Document: claimData.documentLink, // ✅ Use file link instead of file upload
    };

    try {
      await api.post("/claims", claimPayload);
      setSuccess("Claim filed successfully!");
      setTimeout(() => navigate("/user-dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to file claim.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* ✅ Navigation Bar */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Claims Management</h1>
        <div className="space-x-4">
          <button onClick={() => navigate("/user-dashboard")} className="bg-gray-200 text-black px-4 py-2 rounded-lg hover:bg-gray-300">
            Home
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ✅ File Claim Form */}
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-4">File a Claim</h2>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Select Policy */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Policy</label>
              <select
                name="policyId"
                value={claimData.policyId}
                onChange={(e) => setClaimData({ ...claimData, policyId: e.target.value })}
                required
                className="w-full p-2 border rounded-lg"
              >
                <option value="">-- Choose Policy --</option>
                {policies.map((policy) => (
                  <option key={policy._id} value={policy.policyId._id}>
                    {policy.policyId.policyNumber} - Coverage: ${policy.policyId.coverageAmount}
                  </option>
                ))}
              </select>
            </div>

            {/* Claim Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Claim Amount</label>
              <input
                type="number"
                name="amount"
                value={claimData.amount}
                onChange={(e) => setClaimData({ ...claimData, amount: e.target.value })}
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>

            {/* Auto-Set Date Filed */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Filed</label>
              <input
                type="date"
                name="dateFiled"
                value={claimData.dateFiled}
                readOnly
                className="w-full p-2 border rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Document Link (Proof of Claim) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Document Link</label>
              <input
                type="text"
                name="documentLink"
                value={claimData.documentLink}
                onChange={(e) => setClaimData({ ...claimData, documentLink: e.target.value })}
                placeholder="Paste Google Drive or Cloud Storage link here"
                required
                className="w-full p-2 border rounded-lg"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
              Submit Claim
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FileClaim;
