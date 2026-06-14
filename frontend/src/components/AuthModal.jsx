import { useState, useEffect } from "react";
import { X, Mail, Lock, User, LogIn } from "lucide-react";
import axios from "axios";

// ========== DYNAMIC BASE URL - Works on both Localhost & EC2 ==========
const EC2_BASE_URL = "https://api.pharmaverse.co.in";
const LOCAL_BASE_URL = "http://localhost:5000";

// Auto-detect environment
const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const BASE_URL = isProduction ? EC2_BASE_URL : LOCAL_BASE_URL;

console.log(`🌐 AuthModal running in ${isProduction ? "PRODUCTION (EC2)" : "DEVELOPMENT (Localhost)"} mode`);
console.log(`📡 Auth API Base URL: ${BASE_URL}`);

const API_URL = `${BASE_URL}/api/auth`;

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setName("");
      setIsLogin(true);
      setError("");
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const response = await axios.post(`${API_URL}/signin`, {
          email,
          password,
        });

        if (response.data.success) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("userToken", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("isLoggedIn", "true");
          
          if (onLoginSuccess) onLoginSuccess();
          onClose();
        }
      } else {
        const response = await axios.post(`${API_URL}/signup`, {
          name,
          email,
          password,
        });

        if (response.data.success) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("userToken", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("isLoggedIn", "true");
          
          if (onLoginSuccess) onLoginSuccess();
          onClose();
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-scaleIn mx-4">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-all duration-300 hover:rotate-90"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
            <LogIn size={36} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {isLogin ? "Welcome Back!" : "Create Account"}
          </h2>
          <p className="text-gray-500 mt-2">
            {isLogin 
              ? "Login to access study materials" 
              : "Sign up to start learning for free"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center animate-slideDown">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition-all duration-300">
              <User size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 outline-none bg-transparent"
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition-all duration-300">
            <Mail size={20} className="text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 outline-none bg-transparent"
              required
            />
          </div>
          
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition-all duration-300">
            <Lock size={20} className="text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 outline-none bg-transparent"
              required
            />
          </div>

          {isLogin && (
            <div className="text-right">
              <button 
                type="button" 
                className="text-sm text-purple-600 hover:text-purple-700 transition-colors duration-300 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Please wait...
              </span>
            ) : (
              isLogin ? "Sign In" : "Sign Up"
            )}
          </button>

          {/* Toggle between Login/Signup */}
          <p className="text-center text-gray-600 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-purple-600 font-semibold hover:underline transition-colors duration-300"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>

      {/* CSS Animations - Fixed: removed 'jsx' attribute */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AuthModal;