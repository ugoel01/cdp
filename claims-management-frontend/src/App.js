import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Signup from "./pages/Signup"; 
import Login from "./pages/Login"; 
import UserDashboard from "./pages/UserDashboard";
import BuyPolicy from "./pages/BuyPolicy";
import FileClaim from "./pages/FileClaim";
import Myclaim from "./pages/Myclaim";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCreatePolicy from "./pages/AdminCreatePolicy";
import AdminManagePolicies from "./pages/AdminManagePolicies";
import ManageClaims from "./pages/ManageClaims";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import AdminPolicyRequests from "./pages/AdminPolicyRequests";


function Home() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      
      {/* ✅ Navbar */}
      <nav className="bg-blue-700 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Claim Management System</h1>
        <div className="space-x-4">
          <Link to="/signup">
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200">
              ✍ Sign Up
            </button>
          </Link>
          <Link to="/login">
            <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition duration-200">
              🔑 Login
            </button>
          </Link>
        </div>
      </nav>

      {/* ✅ Hero Section */}
      <div className="flex flex-col items-center justify-center flex-grow text-center px-6">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-6">
          Secure Your Future with <span className="text-blue-600">Easy Insurance Claims</span> 🛡️
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Our Claim Management System ensures a **hassle-free** process for managing 
          your insurance claims. Whether you're filing a new claim or managing policies, 
          we've got you covered! ✅
        </p>

        {/* ✅ Benefits Section */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white shadow-lg rounded-lg text-center">
            <h3 className="text-xl font-bold text-blue-700">📜 Easy Policy Management</h3>
            <p className="text-gray-600 mt-2">Manage all your insurance policies in one place.</p>
          </div>
          <div className="p-6 bg-white shadow-lg rounded-lg text-center">
            <h3 className="text-xl font-bold text-green-700">⚡ Quick Claims Processing</h3>
            <p className="text-gray-600 mt-2">Get your claims **approved faster** with automated verification.</p>
          </div>
          <div className="p-6 bg-white shadow-lg rounded-lg text-center">
            <h3 className="text-xl font-bold text-red-700">💰 Secure Payouts</h3>
            <p className="text-gray-600 mt-2">Your claims are processed securely with **instant** payouts.</p>
          </div>
        </div>

        {/* ✅ Call-to-Action Buttons */}
        <div className="mt-10 space-x-4">
          <Link to="/signup">
            <button className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-600 transition duration-200">
              Get Started 🚀
            </button>
          </Link>
          <Link to="/login">
            <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-yellow-600 transition duration-200">
              Manage Your Claims 🔑
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/BuyPolicy" element={<BuyPolicy />} />
        <Route path="/FileClaim" element={<FileClaim />} />
        <Route path="/myclaims" element={<Myclaim />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-policy" element={<AdminCreatePolicy />} />  
        <Route path="/admin/manage-policies" element={<AdminManagePolicies />} />
        <Route path="/admin/manage-claims" element={<ManageClaims />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/policy-requests" element={<AdminPolicyRequests />} />
        


      </Routes>
    </Router>
  );
}

export default App;
