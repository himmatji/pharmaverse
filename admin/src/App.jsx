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

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h1 className="text-white text-2xl font-bold">Loading PharmaVerse...</h1>
          <p className="text-gray-400 mt-2">Please wait</p>
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
    </BrowserRouter>
  );
}

export default App;