import { useState } from "react";
import axios from "axios";

const API_URL = "https://api.pharmaverse.co.in/api/admin";

function Adminlogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      console.log("📝 LOGIN RESPONSE:", res.data);

      if (res.data.success) {
        // ================= STORE TOKEN =================
        const token = res.data.token;
        localStorage.setItem("adminToken", token);
        sessionStorage.setItem("adminToken", token);
        
        // ================= STORE ADMIN DATA =================
        const adminData = res.data.user || res.data.admin || {};
        
        // Ensure super admin has all permissions
        if (adminData.role === "super_admin") {
          adminData.permissions = {
            courses: ["B.Pharm", "D.Pharm", "M.Pharm", "PharmaD", "PhD"]
          };
        }
        
        // Save to both storages for compatibility
        localStorage.setItem("admin", JSON.stringify(adminData));
        sessionStorage.setItem("admin", JSON.stringify(adminData));
        
        console.log("✅ Token stored:", token);
        console.log("✅ Admin data stored:", adminData);
        
        // ================= VERIFY TOKEN WORKS =================
        try {
          const verifyRes = await axios.get("https://api.pharmaverse.co.in/api/auth/verify", {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("✅ Token verification:", verifyRes.data);
        } catch (verifyErr) {
          console.warn("⚠️ Token verification failed:", verifyErr.response?.data);
        }
        
        // ================= LOGIN SUCCESS =================
        if (onLogin) {
          onLogin(true);
        } else {
          // Redirect to dashboard
          window.location.href = "/admin/dashboard";
        }
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("❌ LOGIN ERROR:", err);
      
      let errorMessage = "Invalid credentials";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.request) {
        errorMessage = "Server not responding. Please check if backend is running.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        
        {/* LOGO */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            PV
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mt-5">
            PharmaVerse
          </h1>

          <p className="text-gray-500 mt-2">
            Admin Panel Login
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>

            <input
              type="email"
              placeholder="admin@pharmaverse.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              required
              autoComplete="email"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              required
              autoComplete="current-password"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login to Dashboard"
            )}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Secure Admin Access Only
          </p>
        </div>
      </div>
    </div>
  );
}

export default Adminlogin;