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

// ========== DYNAMIC BASE URL CONFIGURATION ==========
// This ensures all API calls work on both localhost and EC2
const EC2_BASE_URL = "http://13.233.8.100:5000";
const LOCAL_BASE_URL = "http://localhost:5000";

// Auto-detect environment
const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
export const BASE_URL = isProduction ? EC2_BASE_URL : LOCAL_BASE_URL;

console.log(`🌐 App running in ${isProduction ? "PRODUCTION (EC2)" : "DEVELOPMENT (Localhost)"} mode`);
console.log(`📡 API Base URL: ${BASE_URL}`);

// Set default axios base URL
axios.defaults.baseURL = BASE_URL;

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

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if Razorpay script is loaded
    const checkRazorpay = () => {
      if (window.Razorpay) {
        setIsLoading(false);
      } else {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => setIsLoading(false);
        script.onerror = () => {
          console.error('Failed to load Razorpay');
          setIsLoading(false);
        };
        document.body.appendChild(script);
      }
    };
    
    checkRazorpay();
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

          {/* PROFILE PAGE - Auth protected */}
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