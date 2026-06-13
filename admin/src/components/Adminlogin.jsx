import { useState } from "react";
import axios from "axios";

// ========== ✅ SAHI - EC2 API URL FOR FRONTEND ==========
const EC2_BASE_URL = "http://3.109.121.96:5000";
const LOCAL_BASE_URL = "http://localhost:5000";

// Auto-detect environment
const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const BASE_URL = isProduction ? EC2_BASE_URL : LOCAL_BASE_URL;

console.log(`🌐 AdminLogin running in ${isProduction ? "PRODUCTION (EC2)" : "DEVELOPMENT (Localhost)"} mode`);
console.log(`📡 API Base URL: ${BASE_URL}`);

const API_URL = `${BASE_URL}/api/admin`;

function Adminlogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
            courses: ["B.Pharm", "D.Pharm", "M.Pharm", "Pharm.D", "PhD"]
          };
        }
        
        // Save to both storages for compatibility
        localStorage.setItem("admin", JSON.stringify(adminData));
        sessionStorage.setItem("admin", JSON.stringify(adminData));
        
        console.log("✅ Token stored:", token);
        console.log("✅ Admin data stored:", adminData);
        
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
        
        {/* LOGO */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
            PV
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 sm:mt-5">
            PharmaVerse
          </h1>

          <p className="text-gray-500 text-sm sm:text-base mt-1 sm:mt-2">
            Admin Panel Login
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm flex items-start gap-2">
            <span className="text-base sm:text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Admin Email
            </label>

            <input
              type="email"
              placeholder="admin@pharmaverse.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm sm:text-base"
              required
              autoComplete="email"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Password
            </label>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm sm:text-base"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2.5 sm:py-3 rounded-xl font-semibold transition duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          <p className="text-[10px] sm:text-xs text-gray-400">
            Secure Admin Access Only
          </p>
        </div>
      </div>
    </div>
  );
}

export default Adminlogin;