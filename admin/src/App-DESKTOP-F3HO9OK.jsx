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

  // ================= FORCE LOGOUT ON REFRESH =================
  useEffect(() => {
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminToken");

    localStorage.removeItem("admin");
    sessionStorage.removeItem("admin");

    setIsLoggedIn(false);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h1 className="text-white text-2xl font-bold">
            Loading PharmaVerse...
          </h1>
          <p className="text-gray-400 mt-2">Please wait</p>
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
    </BrowserRouter>
  );
}

export default App;