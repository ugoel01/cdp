import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function MyClaims() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userId = localStorage.getItem("userID");

  useEffect(() => {
    if (!userId) {
      handleLogout();
      return;
    }

    // Fetch User Claims
    const fetchUserClaims = async () => {
      try {
        const response = await api.get(`/claims/user/${userId}`);
        setClaims(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch claims.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserClaims();
  }, [userId]);

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ✅ Cancel Claim Function
  const handleCancelClaim = async (claimId) => {
    try {
      const response = await api.delete(`/claims/${claimId}?userId=${userId}`);
      setSuccess(response.data.message);

      // Refresh claims list after deletion
      setClaims((prevClaims) =>
        prevClaims.filter((claim) => claim._id !== claimId)
      );

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel claim.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      
      {/* ✅ Navigation Bar */}
      <nav className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">My Claims</h1>

        <div className="flex space-x-4">
          <button onClick={() => navigate("/user-dashboard")} className="hover:text-gray-300">🏠 Dashboard</button>
          <button onClick={() => navigate("/FileClaim")} className="hover:text-gray-300">📂 File a Claim</button>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition duration-200">
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* ✅ Main Content */}
      <div className="max-w-6xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-md flex-grow">
        <h2 className="text-2xl font-bold text-center text-gray-800">Your Claims</h2>

        {/* Show Messages */}
        {error && <p className="text-red-500 text-center mt-4 bg-red-100 p-2 rounded-md">{error}</p>}
        {success && <p className="text-green-500 text-center mt-4 bg-green-100 p-2 rounded-md">{success}</p>}

        {/* ✅ Loading Animation */}
        {loading ? (
          <div className="flex justify-center items-center mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : claims.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {claims.map((claim) => (
              <div key={claim._id} className="p-4 border border-gray-200 rounded-lg shadow-md bg-gray-50">
                <h3 className="text-lg font-semibold text-blue-700">{claim.policyId.type}</h3>
                <p className="text-gray-600">Policy Number: <span className="font-medium">{claim.policyId.policyNumber}</span></p>
                <p className="text-gray-600">Claim Amount: <span className="font-medium">${claim.amount}</span></p>
                <p className="text-gray-600">Date Filed: <span className="font-medium">{new Date(claim.dateFiled).toLocaleDateString()}</span></p>
                <p className={`font-medium mt-2 ${claim.status === "Pending" ? "text-yellow-500" : claim.status === "Approved" ? "text-green-600" : "text-red-500"}`}>
                  Status: {claim.status}
                </p>

                {/* ✅ Cancel Button (Only if Pending) */}
                {claim.status === "Pending" && (
                  <button
                    onClick={() => handleCancelClaim(claim._id)}
                    className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg w-full transition duration-200"
                  >
                    Cancel Claim
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-6">You have no claims.</p>
        )}
      </div>
    </div>
  );
}

export default MyClaims;
