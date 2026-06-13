import { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  Calendar,
  Clock,
  Activity,
  Crown,
  ShieldCheck,
  Sparkles,
  DollarSign,
  Edit2,
  Check,
  X,
} from "lucide-react";

// ========== ✅ DYNAMIC BASE URL - Works on both Localhost & EC2 ==========
const EC2_BASE_URL = "http://13.233.8.100:5000";
const LOCAL_BASE_URL = "http://localhost:5000";

const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const BASE_URL = isProduction ? EC2_BASE_URL : LOCAL_BASE_URL;

console.log(`🌐 AdminProfile running in ${isProduction ? "PRODUCTION (EC2)" : "DEVELOPMENT (Localhost)"} mode`);
console.log(`📡 API Base URL: ${BASE_URL}`);

const API_URL = `${BASE_URL}/api/auth`;
const MAIN_API_URL = `${BASE_URL}/api`;

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    createdAt: "",
    lastLogin: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [premiumPrice, setPremiumPrice] = useState(999);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editPriceValue, setEditPriceValue] = useState(999);
  const [priceSaving, setPriceSaving] = useState(false);
  const [priceMessage, setPriceMessage] = useState({ type: "", text: "" });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const getToken = () => {
    return (
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("adminToken")
    );
  };

  const getAuthHeaders = () => {
    const token = getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch current price from backend
  const fetchPremiumPrice = async () => {
    try {
      const res = await axios.get(`${MAIN_API_URL}/admin/public-price`);
      setPremiumPrice(res.data.price);
      setEditPriceValue(res.data.price);
    } catch (err) {
      console.log("Error fetching price:", err);
      // Fallback to localStorage
      const savedPrice = localStorage.getItem("premium_price");
      if (savedPrice) {
        setPremiumPrice(parseInt(savedPrice));
        setEditPriceValue(parseInt(savedPrice));
      }
    }
  };

  // Update price in backend
  const updatePremiumPrice = async () => {
    if (editPriceValue < 0) {
      setPriceMessage({ type: "error", text: "Price cannot be negative" });
      return;
    }

    setPriceSaving(true);
    try {
      const token = getToken();
      await axios.put(
        `${MAIN_API_URL}/admin/price`,
        { price: editPriceValue },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      localStorage.setItem("premium_price", editPriceValue);
      
      setPremiumPrice(editPriceValue);
      setPriceMessage({ type: "success", text: `Price updated to ₹${editPriceValue}!` });
      setIsEditingPrice(false);
      
      setTimeout(() => {
        setPriceMessage({ type: "", text: "" });
      }, 3000);
    } catch (error) {
      console.error("Error updating price:", error);
      setPriceMessage({ type: "error", text: "Failed to update price" });
    } finally {
      setPriceSaving(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/profile`,
        getAuthHeaders()
      );

      if (response.data.success) {
        setProfile(response.data.admin);
        setFormData({
          name: response.data.admin.name || "",
          email: response.data.admin.email || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.log(error);
      setMessage({
        type: "error",
        text: "Failed to load profile",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchPremiumPrice();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setMessage({
        type: "error",
        text: "Passwords do not match",
      });
      setSaving(false);
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await axios.put(
        `${API_URL}/update-profile`,
        updateData,
        getAuthHeaders()
      );

      if (response.data.success) {
        setProfile(response.data.user);
        setMessage({
          type: "success",
          text: "Profile updated successfully",
        });
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-10 text-center border border-blue-100 max-w-md w-full">
          <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 sm:mb-5"></div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-700">Loading Profile...</h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 animate-fadeIn">

        {/* Header - Responsive */}
        <div className="bg-white/80 backdrop-blur-lg border border-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-2xl transition-all duration-300">
          <div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg">
                <User size={20} className="sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Admin Profile</h1>
                <p className="text-gray-500 text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1">Manage your account settings & course pricing</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-3 sm:px-4 md:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 border border-blue-200 shadow-sm w-full sm:w-auto">
            {profile.role === "super_admin" ? (
              <Crown size={16} className="sm:w-5 sm:h-5 text-yellow-500" />
            ) : (
              <ShieldCheck size={16} className="sm:w-5 sm:h-5 text-blue-600" />
            )}
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Account Role</p>
              <h3 className="font-semibold text-gray-700 text-xs sm:text-sm">
                {profile.role === "super_admin" ? "Super Admin" : "Administrator"}
              </h3>
            </div>
          </div>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {/* Joined On Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-white shadow-lg p-4 sm:p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-blue-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <Calendar size={18} className="sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500 text-[10px] sm:text-sm">Joined On</p>
                <h3 className="font-bold text-gray-800 text-xs sm:text-sm md:text-base">{formatDate(profile.createdAt)}</h3>
              </div>
            </div>
          </div>

          {/* Last Login Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-white shadow-lg p-4 sm:p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-green-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <Clock size={18} className="sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 text-[10px] sm:text-sm">Last Login</p>
                <h3 className="font-bold text-gray-800 text-xs sm:text-sm md:text-base">{formatDate(profile.lastLogin)}</h3>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-white shadow-lg p-4 sm:p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-purple-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                <Activity size={18} className="sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-500 text-[10px] sm:text-sm">Status</p>
                <h3 className="font-bold text-green-600 text-xs sm:text-sm md:text-base">Active</h3>
              </div>
            </div>
          </div>

          {/* Course Price Card - Responsive */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-white shadow-lg p-4 sm:p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                  <DollarSign size={18} className="sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 text-[10px] sm:text-sm">Premium Course Price</p>
                  {!isEditingPrice ? (
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <h3 className="font-bold text-xl sm:text-2xl text-gray-800">₹{premiumPrice}</h3>
                      <button
                        onClick={() => {
                          setEditPriceValue(premiumPrice);
                          setIsEditingPrice(true);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-all"
                        title="Edit Price"
                      >
                        <Edit2 size={12} className="sm:w-4 sm:h-4 text-gray-400 hover:text-blue-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                      <input
                        type="number"
                        value={editPriceValue}
                        onChange={(e) => setEditPriceValue(parseInt(e.target.value) || 0)}
                        className="w-20 sm:w-28 px-1.5 sm:px-2 py-1 border border-gray-300 rounded-lg text-base sm:text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        autoFocus
                        min="0"
                        step="100"
                      />
                      <button
                        onClick={updatePremiumPrice}
                        disabled={priceSaving}
                        className="p-1 bg-green-500 hover:bg-green-600 rounded-lg transition-all disabled:opacity-50"
                        title="Save"
                      >
                        {priceSaving ? (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Check size={12} className="sm:w-4 sm:h-4 text-white" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingPrice(false);
                          setEditPriceValue(premiumPrice);
                          setPriceMessage({ type: "", text: "" });
                        }}
                        className="p-1 bg-red-500 hover:bg-red-600 rounded-lg transition-all"
                        title="Cancel"
                      >
                        <X size={12} className="sm:w-4 sm:h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {priceMessage.text && (
              <div className={`mt-2 sm:mt-3 text-[10px] sm:text-xs font-medium ${priceMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {priceMessage.text}
              </div>
            )}
            {!isEditingPrice && (
              <p className="text-[8px] sm:text-xs text-gray-400 mt-2 sm:mt-3">Click edit icon to change course price</p>
            )}
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-md border animate-slideDown ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? <CheckCircle size={16} className="sm:w-5 sm:h-5" /> : <AlertCircle size={16} className="sm:w-5 sm:h-5" />}
            <span className="font-medium text-xs sm:text-sm">{message.text}</span>
          </div>
        )}

        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {/* Left Side - Profile Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-white shadow-lg p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-xl">
                  <User size={32} className="sm:w-9 sm:h-9 md:w-11 md:h-11 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 sm:border-3 border-white animate-pulse"></div>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mt-3 sm:mt-4 md:mt-5">{profile.name}</h2>
              <p className="text-gray-500 text-xs sm:text-sm md:text-base mt-1 break-all">{profile.email}</p>
              <div className="mt-3 sm:mt-4 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs md:text-sm font-semibold text-blue-700 border border-blue-200">
                {profile.role === "super_admin" ? "Super Administrator" : "Administrator"}
              </div>
            </div>

            <div className="mt-5 sm:mt-6 md:mt-8 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <Mail size={14} className="sm:w-[18px] sm:h-[18px] text-blue-500" />
                <span className="text-gray-700 text-[11px] sm:text-xs md:text-sm truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <Shield size={14} className="sm:w-[18px] sm:h-[18px] text-green-500" />
                <span className="text-gray-700 text-xs sm:text-sm">Secure Account</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <Calendar size={14} className="sm:w-[18px] sm:h-[18px] text-purple-500" />
                <span className="text-gray-700 text-[11px] sm:text-xs md:text-sm">Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Right Side - Edit Form */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-white shadow-lg p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Sparkles size={18} className="sm:w-5 sm:h-5 text-blue-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Edit Profile</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Full Name</label>
                <div className="relative">
                  <User size={14} className="sm:w-[18px] sm:h-[18px] absolute left-3 sm:left-4 top-3 sm:top-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="sm:w-[18px] sm:h-[18px] absolute left-3 sm:left-4 top-3 sm:top-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-all text-sm sm:text-base"
              >
                {showPasswordSection ? "Cancel Password Change" : "Change Password"}
              </button>

              {showPasswordSection && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl sm:rounded-3xl p-3 sm:p-5 space-y-3 sm:space-y-5 animate-slideDown">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Current Password</label>
                    <div className="relative">
                      <Lock size={14} className="sm:w-[18px] sm:h-[18px] absolute left-3 sm:left-4 top-3 sm:top-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl sm:rounded-2xl pl-9 sm:pl-12 pr-9 sm:pr-12 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={14} className="sm:w-[18px] sm:h-[18px]" /> : <Eye size={14} className="sm:w-[18px] sm:h-[18px]" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.01] hover:shadow-xl transition-all duration-300 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} className="sm:w-[18px] sm:h-[18px]" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease; }
        .animate-slideDown { animation: slideDown 0.3s ease; }
        
        @media (max-width: 640px) {
          .animate-fadeIn { animation-duration: 0.3s; }
        }
      `}</style>
    </div>
  );
};

export default AdminProfile;