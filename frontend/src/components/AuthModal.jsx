import { useState, useEffect } from "react";
import { X, Mail, Lock, User, LogIn, Eye, EyeOff, Phone } from "lucide-react";
import axios from "axios";

const API_URL = "https://api.pharmaverse.co.in/api/auth";

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIdentifier("");
      setEmail("");
      setMobile("");
      setPassword("");
      setName("");
      setIsLogin(true);
      setError("");
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Login
        if (!identifier) {
          setError("Please enter Email or Mobile Number");
          setLoading(false);
          return;
        }

        const response = await axios.post(`${API_URL}/signin`, {
          identifier,
          password,
        });

        if (response.data.success) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("isLoggedIn", "true");
          
          if (onLoginSuccess) onLoginSuccess();
        }
      } else {
        // ✅ FIX 1: Signup validation
        if (!email && !mobile) {
          setError("Please enter Email or Mobile Number");
          setLoading(false);
          return;
        }

        if (!name) {
          setError("Please enter your Full Name");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }

        const response = await axios.post(`${API_URL}/signup`, {
          name,
          email: email || undefined,
          mobile: mobile || undefined,
          password,
        });

        if (response.data.success) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("isLoggedIn", "true");
          
          if (onLoginSuccess) onLoginSuccess();
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      <div className="relative bg-white rounded-3xl w-full max-w-[90%] sm:max-w-md p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in duration-300 mx-2 sm:mx-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} className="sm:w-[22px] sm:h-[22px]" />
        </button>

        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
            <LogIn size={28} className="sm:w-[36px] sm:h-[36px] text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isLogin ? "Welcome Back!" : "Create Account"}
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">
            {isLogin 
              ? "Login to access study materials" 
              : "Sign up to start learning for free"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs sm:text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Signup Fields */}
          {!isLogin && (
            <>
              {/* Name Field */}
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition">
                <User size={18} className="sm:w-[20px] sm:h-[20px] text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 outline-none bg-transparent text-sm sm:text-base"
                  required
                />
              </div>

              {/* Email Field (Optional) */}
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition">
                <Mail size={18} className="sm:w-[20px] sm:h-[20px] text-gray-400" />
                <input
                  type="email"
                  placeholder="Email (Optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 outline-none bg-transparent text-sm sm:text-base"
                />
              </div>

              {/* ✅ FIX 2: Mobile Field - Only Numbers, Max 10 digits */}
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition">
                <Phone size={18} className="sm:w-[20px] sm:h-[20px] text-gray-400" />
                <input
                  type="tel"
                  placeholder="Mobile Number (Optional)"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="flex-1 outline-none bg-transparent text-sm sm:text-base"
                />
              </div>
            </>
          )}

          {/* Login Field */}
          {isLogin && (
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition">
              <Mail size={18} className="sm:w-[20px] sm:h-[20px] text-gray-400" />
              <input
                type="text"
                placeholder="Email or Mobile Number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="flex-1 outline-none bg-transparent text-sm sm:text-base"
                required
              />
            </div>
          )}

          {/* Password Field with Toggle */}
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition">
            <Lock size={18} className="sm:w-[20px] sm:h-[20px] text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 outline-none bg-transparent text-sm sm:text-base"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition p-1"
            >
              {showPassword ? (
                <EyeOff size={18} className="sm:w-[20px] sm:h-[20px]" />
              ) : (
                <Eye size={18} className="sm:w-[20px] sm:h-[20px]" />
              )}
            </button>
          </div>

          {isLogin && (
            <div className="text-right">
              <button type="button" className="text-xs sm:text-sm text-purple-600 hover:text-purple-700">
                Forgot Password?
              </button>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
          </button>

          <p className="text-center text-gray-600 text-xs sm:text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setShowPassword(false);
                setIdentifier("");
                setEmail("");
                setMobile("");
                setPassword("");
                setName("");
              }}
              className="text-purple-600 font-semibold hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </form>

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 text-center">
          <p className="text-[10px] sm:text-xs text-gray-400">
            Login required to access study materials
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;