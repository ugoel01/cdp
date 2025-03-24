import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Chatbot from "../components/Chatbot"; // Import chatbot
import { Pie, Bar } from "react-chartjs-2";
import { useNotification } from "../context/NotificationContext";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

function AdminDashboard() {
  const navigate = useNavigate();
  const [section, setSection] = useState("analytics");
  const [policies, setPolicies] = useState([]);
  const [purchasedPolicies, setPurchasedPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [users, setUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const { showError } = useNotification();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      localStorage.clear();
      navigate("/login");
    } catch (err) {
      showError("Logout failed. Please try again.");
      localStorage.clear();
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [policiesRes, purchasedRes, claimsRes, requestsRes] = await Promise.all([
        api.get("/admin/policies"),
        api.get("/admin/purchased-policies"),
        api.get("/admin/claims"),
        api.get("/admin/pending-requests")
      ]);
      setPolicies(policiesRes.data || []);
      setPurchasedPolicies(purchasedRes.data || []);
      setClaims(claimsRes.data || []);
      setPendingRequests(requestsRes.data || []);

      const uniqueUsers = new Set();
      purchasedRes.data?.forEach((p) => uniqueUsers.add(p.userId));
      setUsers(uniqueUsers.size);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Failed to fetch admin data.";
      setError(errorMessage);
      showError(errorMessage);
      
      if (err.response && err.response.status === 401) {
        showError("Your session has expired. Please login again.");
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const policyTypeCount = {};
  policies.forEach((p) => {
    const type = p.type || "Unknown";
    policyTypeCount[type] = (policyTypeCount[type] || 0) + 1;
  });

  const claimStatusCount = {
    Pending: 0,
    Approved: 0,
    Rejected: 0
  };
  claims.forEach((c) => {
    claimStatusCount[c.status || "Pending"] += 1;
  });

  const policyChartData = {
    labels: Object.keys(policyTypeCount),
    datasets: [
      {
        data: Object.values(policyTypeCount),
        backgroundColor: ["#60a5fa", "#34d399", "#fbbf24", "#f87171"],
        borderWidth: 1
      }
    ]
  };

  const claimChartData = {
    labels: Object.keys(claimStatusCount),
    datasets: [
      {
        label: "Claims",
        data: Object.values(claimStatusCount),
        backgroundColor: ["#facc15", "#4ade80", "#f87171"],
        borderWidth: 1
      }
    ]
  };

  const SectionTabs = () => (
    <div className="flex flex-wrap gap-4 justify-center mt-6">
      <button
        className={`px-4 py-2 rounded-md ${
          section === "analytics" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
        onClick={() => setSection("analytics")}
      >
        📊 Analytics
      </button>
      <button
        className={`px-4 py-2 rounded-md ${
          section === "purchased" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
        onClick={() => setSection("purchased")}
      >
        📋 Purchased Policies
      </button>
      <button
        className={`px-4 py-2 rounded-md ${
          section === "claims" ? "bg-blue-600 text-white" : "bg-gray-200"
        }`}
        onClick={() => setSection("claims")}
      >
        📂 Recent Claims
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white relative flex flex-col">
      {/* Admin Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">Admin Dashboard</h1>
        <div className="flex space-x-6">
          <button onClick={() => navigate("/admin-dashboard")} className="hover:text-gray-300">🏠 Dashboard</button>
          <button onClick={() => navigate("/admin/manage-policies")} className="hover:text-gray-300">📜 Manage Policies</button>
          <button onClick={() => navigate("/admin/policy-requests")} className="hover:text-gray-300">✅ Approve Requests</button>
          <button onClick={() => navigate("/admin/manage-claims")} className="hover:text-gray-300">📂 Manage Claims</button>
          <button onClick={() => navigate("/admin/create-policy")} className="hover:text-gray-300">➕ Create Policy</button>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition duration-200">
            🚪 Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 w-full">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 mb-4 rounded-md">{error}</div>
        )}

        <SectionTabs />

        {loading ? (
          <div className="text-center mt-10">
            <div className="animate-spin h-10 w-10 border-t-4 border-blue-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        ) : (
          <>
            {section === "analytics" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Policies by Type</h2>
                  <div className="h-64">
                    <Pie data={policyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Claims by Status</h2>
                  <div className="h-64">
                    <Bar data={claimChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            )}

            {section === "purchased" && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">📋 All Purchased Policies</h2>
                {purchasedPolicies.map((user) => (
                  <div key={user.userId} className="p-6 border border-gray-200 rounded-xl shadow-md mb-6 bg-white">
                    <h3 className="text-lg font-bold text-blue-700 mb-2">
                      {user.userName} (User ID: <span className="text-blue-500">{user.userId}</span>)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="px-4 py-2 border">Policy No.</th>
                            <th className="px-4 py-2 border">Type</th>
                            <th className="px-4 py-2 border">Coverage</th>
                            <th className="px-4 py-2 border">Cost</th>
                            <th className="px-4 py-2 border">Start Date</th>
                            <th className="px-4 py-2 border">End Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {user.purchasedPolicies.map((policy) => (
                            <tr key={policy._id} className="hover:bg-gray-100">
                              <td className="px-4 py-2 border">{policy.policyNumber}</td>
                              <td className="px-4 py-2 border">{policy.type}</td>
                              <td className="px-4 py-2 border text-green-700 font-medium">${policy.coverageAmount}</td>
                              <td className="px-4 py-2 border">${policy.cost || "N/A"}</td>
                              <td className="px-4 py-2 border">{new Date(policy.startDate).toLocaleDateString()}</td>
                              <td className="px-4 py-2 border">{new Date(policy.endDate).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {section === "claims" && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">📂 Recent Claims</h2>
                <div className="bg-white shadow-md rounded-md overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="px-4 py-2">Claim ID</th>
                        <th className="px-4 py-2">Amount</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claims.slice(0, 10).map((claim) => (
                        <tr key={claim._id} className="hover:bg-gray-100">
                          <td className="px-4 py-2">{claim._id.slice(0, 8)}</td>
                          <td className="px-4 py-2">${claim.amount || 0}</td>
                          <td className="px-4 py-2">{claim.status}</td>
                          <td className="px-4 py-2">
  {claim.dateFiled
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }).format(new Date(claim.dateFiled))
    : "N/A"}
</td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Chatbot Button */}
      <button 
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center w-14 h-14"
        onClick={() => setShowChatbot(!showChatbot)}
      >
        <img src="/chatbot.png" alt="chatbot-icon" className="w-8 h-8" />
      </button>

      {/* Chatbot Component */}
      {showChatbot && <Chatbot setShowChatbot={setShowChatbot} />}
    </div>
  );
}

export default AdminDashboard;
