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
} from "lucide-react";

const API_URL = "https://api.pharmaverse.co.in/api/admin";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="bg-white shadow-xl rounded-3xl p-10 text-center border border-blue-100">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
          <h2 className="text-xl font-bold text-gray-700">Loading Profile...</h2>
          <p className="text-gray-500 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border border-white rounded-3xl shadow-lg p-6 flex items-center justify-between flex-wrap gap-4 hover:shadow-2xl transition-all duration-300">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-2xl shadow-lg">
                <User className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Admin Profile</h1>
                <p className="text-gray-500 mt-1">Manage your account settings</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-5 py-3 rounded-2xl flex items-center gap-3 border border-blue-200 shadow-sm">
            {profile.role === "super_admin" ? (
              <Crown className="text-yellow-500" size={22} />
            ) : (
              <ShieldCheck className="text-blue-600" size={22} />
            )}
            <div>
              <p className="text-xs text-gray-500">Account Role</p>
              <h3 className="font-semibold text-gray-700">
                {profile.role === "super_admin" ? "Super Admin" : "Administrator"}
              </h3>
            </div>
          </div>
        </div>

        {/* Stats Cards - Full Width Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Joined On Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl border border-white shadow-lg p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-2xl">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Joined On</p>
                <h3 className="font-bold text-gray-800 text-lg">{formatDate(profile.createdAt)}</h3>
              </div>
            </div>
          </div>

          {/* Last Login Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl border border-white shadow-lg p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-4 rounded-2xl">
                <Clock className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Last Login</p>
                <h3 className="font-bold text-gray-800 text-lg">{formatDate(profile.lastLogin)}</h3>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl border border-white shadow-lg p-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-4 rounded-2xl">
                <Activity className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Status</p>
                <h3 className="font-bold text-green-600 text-lg">Active</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`rounded-2xl p-4 flex items-center gap-3 shadow-md border animate-slideDown ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl border border-white shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-xl">
                  <User className="text-white" size={45} />
                </div>
                <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white animate-pulse"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mt-5">{profile.name}</h2>
              <p className="text-gray-500 mt-1">{profile.email}</p>
              <div className="mt-4 bg-gradient-to-r from-blue-100 to-indigo-100 px-5 py-2 rounded-2xl text-sm font-semibold text-blue-700 border border-blue-200">
                {profile.role === "super_admin" ? "Super Administrator" : "Administrator"}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                <Mail className="text-blue-500" size={18} />
                <span className="text-gray-700 text-sm">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                <Shield className="text-green-500" size={18} />
                <span className="text-gray-700 text-sm">Secure Account</span>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                <Calendar className="text-purple-500" size={18} />
                <span className="text-gray-700 text-sm">Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-3xl border border-white shadow-lg p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-blue-500" size={22} />
              <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-all"
              >
                {showPasswordSection ? "Cancel Password Change" : "Change Password"}
              </button>

              {showPasswordSection && (
                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 space-y-5 animate-slideDown">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-12 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.01] hover:shadow-xl transition-all duration-300 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
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
      `}</style>
    </div>
  );
};

export default AdminProfile;