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

  // ================= CHECK AUTH ON MOUNT =================
  useEffect(() => {
    // Check if token exists in storage
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    const admin = localStorage.getItem("admin") || sessionStorage.getItem("admin");
    
    if (token && admin) {
      try {
        const adminData = JSON.parse(admin);
        // Optional: Check if token is expired
        setIsLoggedIn(true);
      } catch (e) {
        console.error("Error parsing admin data:", e);
        // Clear invalid data
        localStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        sessionStorage.removeItem("admin");
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, []);

  // ================= LOGIN =================
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    sessionStorage.removeItem("admin");
    setIsLoggedIn(false);
  };

  // ================= LOADING =================
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
        {/* LOGIN */}
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

        {/* ADMIN LOGIN */}
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

        {/* DASHBOARD */}
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

        {/* DASHBOARD TABS */}
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

        {/* HOME */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* CATCH ALL */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
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
      `}</style>
    </BrowserRouter>
  );
}

export default App;