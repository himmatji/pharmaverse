import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

/* HOME COMPONENTS */
import Banner from "./components/banner";
import Icons from "./components/icons";
import FeatureSection from "./components/featuresection";
import QuickAccessSection from "./components/QuickAccessSection";
import StudentFeaturesSection from "./components/StudentFeaturesSection";
import Premium from "./components/premium";

/* PAGES */
import BPharm from "./pages/BPharm";
import DPharm from "./pages/DPharm";
import MPharm from "./pages/MPharm";
import PharmD from "./pages/PharmD";
import PhD from "./pages/PhD";
import Profile from "./pages/Profile";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.pharmaverse.co.in";

/* HOME PAGE */
const Home = () => {
  return (
    <>
      <Banner />
      <Icons />
      <FeatureSection />
      <QuickAccessSection />
      <StudentFeaturesSection />
      <Premium />
    </>
  );
};

/* Remove all stale authentication data in one place. */
const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userToken");
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  /* Load Razorpay once. Do not block the app forever if it fails. */
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
    script.onload = () => setIsLoading(false);
    script.onerror = () => {
      console.error("Failed to load Razorpay");
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      // Keep the Razorpay script available for the rest of the app.
    };
  }, []);

  /*
   * Verify an existing session periodically.
   * IMPORTANT: a stale/invalid JWT is cleared on ANY 401 so the app
   * does not keep sending the same bad token every 5 seconds.
   */
  useEffect(() => {
    const verifySession = async () => {
      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

      if (!token || !isLoggedIn) return;

      try {
        await axios.get(`${API_BASE}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        if (error.response?.status === 401) {
          clearAuthStorage();

          // Stop the repeated 401 loop and send the user to Home.
          if (window.location.pathname !== "/") {
            window.location.replace("/");
          } else {
            window.location.reload();
          }
        } else if (import.meta.env.DEV) {
          console.error("Session verification error:", error);
        }
      }
    };

    // Verify once after the app starts.
    verifySession();

    // Keep the existing session check behavior, but safely handle 401s.
    const interval = setInterval(verifySession, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading secure payment gateway...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar />

        <Routes>
          {/* HOME - No auth required */}
          <Route path="/" element={<Home />} />

          {/* PROFILE - Auth protected */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* COURSE PAGES - Auth protected */}
          <Route
            path="/bpharm"
            element={
              <ProtectedRoute>
                <BPharm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dpharm"
            element={
              <ProtectedRoute>
                <DPharm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mpharm"
            element={
              <ProtectedRoute>
                <MPharm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pharmd"
            element={
              <ProtectedRoute>
                <PharmD />
              </ProtectedRoute>
            }
          />

          <Route
            path="/phd"
            element={
              <ProtectedRoute>
                <PhD />
              </ProtectedRoute>
            }
          />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
