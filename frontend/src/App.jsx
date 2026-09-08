import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

/* COMPONENTS */
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

/* HOME COMPONENTS */
import Banner from "./components/banner";
import QuickAccessSection from "./components/QuickAccessSection";

/* PAGES */
import BPharm from "./pages/BPharm";
import DPharm from "./pages/DPharm";
import MPharm from "./pages/MPharm";
import PharmD from "./pages/PharmD";
import PhD from "./pages/PhD";
import Profile from "./pages/Profile";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://api.pharmaverse.co.in";

/* =========================
   HOME PAGE
========================= */

const Home = () => {
  return (
    <>
      {/* HERO BANNER */}
      <Banner />

      {/* QUICK ACCESS */}
      <QuickAccessSection />
    </>
  );
};

/* =========================
   CLEAR AUTH DATA
========================= */

const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userToken");
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
};

/* =========================
   APP
========================= */

function App() {
  const [isLoading, setIsLoading] = useState(true);

  /* =========================
     LOAD RAZORPAY
  ========================= */

  useEffect(() => {
    if (window.Razorpay) {
      setIsLoading(false);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      const finish = () => setIsLoading(false);

      existingScript.addEventListener("load", finish);
      existingScript.addEventListener("error", finish);

      return () => {
        existingScript.removeEventListener("load", finish);
        existingScript.removeEventListener("error", finish);
      };
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      setIsLoading(false);
    };

    script.onerror = () => {
      console.error("Failed to load Razorpay");
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {};
  }, []);

  /* =========================
     VERIFY SESSION
  ========================= */

  useEffect(() => {
    const verifySession = async () => {
      const token =
        localStorage.getItem("userToken") ||
        localStorage.getItem("token");

      const isLoggedIn =
        localStorage.getItem("isLoggedIn") === "true";

      if (!token || !isLoggedIn) {
        return;
      }

      try {
        await axios.get(`${API_BASE}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        if (error.response?.status === 401) {
          clearAuthStorage();

          if (window.location.pathname !== "/") {
            window.location.replace("/");
          } else {
            window.location.reload();
          }
        } else if (import.meta.env.DEV) {
          console.error(
            "Session verification error:",
            error
          );
        }
      }
    };

    /* Verify once when app starts */
    verifySession();

    /* Verify every 5 seconds */
    const interval = setInterval(
      verifySession,
      5000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  /* =========================
     LOADING SCREEN
  ========================= */

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />

            <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     MAIN APP
  ========================= */

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">

        {/* NAVBAR */}
        <Navbar />

        <Routes>

          {/* =====================
              HOME
          ===================== */}

          <Route
            path="/"
            element={<Home />}
          />

          {/* =====================
              PROFILE
          ===================== */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* =====================
              BPHARM
          ===================== */}

          <Route
            path="/bpharm"
            element={
              <ProtectedRoute>
                <BPharm />
              </ProtectedRoute>
            }
          />

          {/* =====================
              DPHARM
          ===================== */}

          <Route
            path="/dpharm"
            element={
              <ProtectedRoute>
                <DPharm />
              </ProtectedRoute>
            }
          />

          {/* =====================
              MPHARM
          ===================== */}

          <Route
            path="/mpharm"
            element={
              <ProtectedRoute>
                <MPharm />
              </ProtectedRoute>
            }
          />

          {/* =====================
              PHARMD
          ===================== */}

          <Route
            path="/pharmd"
            element={
              <ProtectedRoute>
                <PharmD />
              </ProtectedRoute>
            }
          />

          {/* =====================
              PHD
          ===================== */}

          <Route
            path="/phd"
            element={
              <ProtectedRoute>
                <PhD />
              </ProtectedRoute>
            }
          />

        </Routes>

        {/* FOOTER */}
        <Footer />

      </div>
    </BrowserRouter>
  );
}

export default App;