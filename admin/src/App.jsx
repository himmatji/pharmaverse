import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Adminlogin from "./components/Adminlogin";
import AdminDashboard from "./components/admindeshboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // ================= HELPER: GET TOKEN FROM ANY STORAGE =================
  const getToken = () => {
    return localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
  };

  // ================= HELPER: GET ADMIN DATA FROM ANY STORAGE =================
  const getAdminData = () => {
    const adminFromLocal = localStorage.getItem("admin");
    const adminFromSession = sessionStorage.getItem("admin");
    const adminData = JSON.parse(adminFromLocal || adminFromSession || "{}");
    return adminData;
  };

  // ================= HELPER: VALIDATE TOKEN EXPIRY =================
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  // ================= AUTH CHECK =================
  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const adminData = getAdminData();
      
      console.log("=== AUTH CHECK ===");
      console.log("Token exists:", !!token);
      console.log("Admin data:", adminData);
      
      if (token && isTokenValid(token) && adminData.role) {
        setIsLoggedIn(true);
        console.log("✅ User is authenticated");
      } else {
        // Clear invalid data
        if (token && !isTokenValid(token)) {
          console.log("⚠️ Token expired, clearing storage");
          localStorage.removeItem("adminToken");
          sessionStorage.removeItem("adminToken");
          localStorage.removeItem("admin");
          sessionStorage.removeItem("admin");
        }
        setIsLoggedIn(false);
        console.log("❌ User is not authenticated");
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // ================= LOGIN =================
  const handleLogin = () => {
    console.log("🔐 Login successful, setting state");
    setIsLoggedIn(true);
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    console.log("🚪 Logging out, clearing storage");
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    sessionStorage.removeItem("admin");
    setIsLoggedIn(false);
  };

  // ================= LOADING - Responsive =================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 border-4 border-pink-500 rounded-full border-b-transparent animate-spin animation-delay-300"></div>
            <div className="absolute inset-4 border-4 border-indigo-500 rounded-full border-l-transparent animate-spin animation-delay-600"></div>
          </div>
          <h1 className="text-white text-xl sm:text-2xl font-bold">
            Loading PharmaVerse...
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN ROUTE */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/admin-dashboard" replace />
            ) : (
              <Adminlogin onLogin={handleLogin} />
            )
          }
        />

        {/* ADMIN LOGIN ALIAS */}
        <Route
          path="/admin-login"
          element={
            isLoggedIn ? (
              <Navigate to="/admin-dashboard" replace />
            ) : (
              <Adminlogin onLogin={handleLogin} />
            )
          }
        />

        {/* DASHBOARD MAIN ROUTE */}
        <Route
          path="/admin-dashboard"
          element={
            isLoggedIn ? (
              <AdminDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* DASHBOARD WITH TAB ROUTE */}
        <Route
          path="/admin-dashboard/:tab"
          element={
            isLoggedIn ? (
              <AdminDashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* DEFAULT ROUTE - Redirect based on auth status */}
        <Route
          path="/"
          element={
            <Navigate
              to={isLoggedIn ? "/admin-dashboard" : "/login"}
              replace
            />
          }
        />

        {/* CATCH ALL - Redirect unknown routes */}
        <Route
          path="*"
          element={
            <Navigate
              to={isLoggedIn ? "/admin-dashboard" : "/login"}
              replace
            />
          }
        />
      </Routes>

      {/* Global Styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        @media (max-width: 640px) {
          .animation-delay-300, .animation-delay-600 {
            animation-duration: 0.8s;
          }
        }
      `}</style>
    </BrowserRouter>
  );
}

export default App;