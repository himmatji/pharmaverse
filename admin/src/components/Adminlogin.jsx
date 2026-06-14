import { useState } from "react";
import axios from "axios";

// Production URL - change karo agar domain different hai
const API_URL = import.meta.env.PROD 
  ? "https://api.pharmaverse.co.in/api/admin"  // Production
  : "/api/admin";  // Development

function Adminlogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("📤 Sending to:", `${API_URL}/login`);
    console.log("📧 Email:", email);

    try {
      const res = await axios.post(`${API_URL}/login`, {
        email: email.trim(),
        password: password
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("📥 Response:", res.data);

      if (res.data.success) {
        // Store token
        const token = res.data.token;
        localStorage.setItem("adminToken", token);
        sessionStorage.setItem("adminToken", token);
        
        // Store admin data
        const adminData = res.data.user;
        localStorage.setItem("admin", JSON.stringify(adminData));
        sessionStorage.setItem("admin", JSON.stringify(adminData));
        
        console.log("✅ Login successful!");
        
        // Call onLogin or redirect
        if (onLogin) {
          onLogin(true);
        } else {
          window.location.href = "/admin-dashboard";
        }
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("❌ ERROR:", err);
      
      let errorMessage = "Login failed. Please try again.";
      
      if (err.code === 'ERR_NETWORK') {
        errorMessage = "Cannot connect to server. Please check your internet connection.";
      } else if (err.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            PV
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-5">PharmaVerse</h1>
          <p className="text-gray-500 mt-2">Admin Panel Login</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@pharmaverse.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">Secure Admin Access Only</p>
        </div>
      </div>
    </div>
  );
}

export default Adminlogin;