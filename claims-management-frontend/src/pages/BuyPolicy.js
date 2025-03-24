import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";

function BuyPolicy() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [purchasedPolicies, setPurchasedPolicies] = useState([]);
  const userId = localStorage.getItem("userID");
  const sessionId = localStorage.getItem("sessionId") || "1234567890abcdef";

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await api.get("/policies");
        setPolicies(response.data);
      } catch (err) {
        setError("❌ Failed to load policies. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPolicies = async () => {
      if (!userId) return;
      try {
        const response = await api.get(`/users/my-policies/${userId}`);
        setPurchasedPolicies(response.data.map((policy) => policy._id));
      } catch (err) {
        console.error("⚠️ Error fetching user policies:", err.response?.data || err.message);
      }
    };

    fetchPolicies();
    fetchUserPolicies();
  }, [userId]);

  const sendUnomiEvent = async (policy) => {
    const eventPayload = {
      events: [
        {
          eventType: "viewPolicy",
          scope: "cms",
          source: {
            itemId: policy._id,
            itemType: "policy",
          },
          target: {
            itemId: userId,
            itemType: "profile",
          },
          properties: {
            policyName: policy.type,
            userID: userId,
          },
        },
      ],
      sessionId,
    };

    try {
      await api.post("/unomi/track", eventPayload); // Using backend proxy route
      console.log("✅ Unomi event sent");
    } catch (error) {
      console.error("Error sending Unomi event:", error);
    }
  };

  const handlePolicyTitleClick = (policy) => {
    console.log("Policy clicked:", policy);
    sendUnomiEvent(policy);
  };

  const handleBuyPolicy = async (policyId, duration) => {
    if (!userId) {
      navigate("/login");
      return;
    }

    if (purchasedPolicies.includes(policyId)) {
      toast.error("You have already purchased this policy!");
      return;
    }

    const today = new Date();
    const endDate = new Date(today);
    endDate.setFullYear(today.getFullYear() + duration);

    try {
      const response = await api.post("/users/buy-policy", {
        userId,
        policyId,
        startDate: today,
        endDate: endDate,
      });

      toast.success(response.data.message);
      setPurchasedPolicies([...purchasedPolicies, policyId]);
      setSuccessMessage("🎉 Policy purchased successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Something went wrong";
      toast.error(errorMessage);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <nav className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Buy Policy</h1>
        <button onClick={() => navigate("/user-dashboard")} className="hover:text-gray-300">🏠 Back to Dashboard</button>
      </nav>

      <div className="max-w-5xl mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Available Policies</h2>
        {successMessage && <p className="text-green-600 text-center mt-4 bg-green-100 p-2 rounded-md">{successMessage}</p>}
        {error && <p className="text-red-500 text-center mt-4 bg-red-100 p-2 rounded-md">{error}</p>}

        {loading ? (
          <div className="flex justify-center items-center mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {policies.length > 0 ? (
              policies.map((policy) => (
                <div key={policy._id} className="p-6 border border-gray-200 rounded-lg shadow-md bg-gray-50">
                  <h3
                    className="text-lg font-semibold text-blue-700 cursor-pointer hover:underline"
                    onClick={() => handlePolicyTitleClick(policy)}
                  >
                    {policy.type}
                  </h3>
                  <p className="text-gray-600">Policy Number: <span className="font-medium">{policy.policyNumber}</span></p>
                  <p className="text-gray-600">Coverage: <span className="font-medium">${policy.coverageAmount}</span></p>
                  <p className="text-gray-600">Cost: <span className="font-bold text-green-600">${policy.cost}</span></p>

                  {purchasedPolicies.includes(policy._id) ? (
                    <p className="text-green-600 font-semibold mt-4">Already Purchased ✅</p>
                  ) : (
                    <>
                      <p className="text-gray-600 mt-2">Select Duration:</p>
                      <div className="flex gap-4 mt-2">
                        <button onClick={() => handleBuyPolicy(policy._id, 1)} className="w-full text-white py-2 rounded-lg bg-blue-500 hover:bg-blue-600">Buy for 1 Year</button>
                        <button onClick={() => handleBuyPolicy(policy._id, 2)} className="w-full text-white py-2 rounded-lg bg-blue-500 hover:bg-blue-600">Buy for 2 Years</button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center col-span-3">No policies available at the moment.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyPolicy;
