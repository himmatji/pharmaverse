import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  User, Mail, Calendar, Edit2, Save, X, Lock, ShoppingBag, 
  FileText, Video, BookOpen, Eye, Clock, CheckCircle, AlertCircle,
  TrendingUp, Shield, Sparkles, Crown, ArrowRight, Download,
  Settings, Key, RefreshCw, Rocket, XCircle, Maximize2, Minimize2,
  File, FileArchive, FileImage, FileVideo, Trash2
} from "lucide-react";
import axios from "axios";

// ========== DYNAMIC BASE URL - Works on both Localhost & EC2 ==========
const EC2_BASE_URL = "http://3.109.121.96:5000";
const LOCAL_BASE_URL = "http://localhost:5000";

// Auto-detect environment
const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const BASE_URL = isProduction ? EC2_BASE_URL : LOCAL_BASE_URL;

console.log(`🌐 Running in ${isProduction ? "PRODUCTION (EC2)" : "DEVELOPMENT (Localhost)"} mode`);
console.log(`📡 API Base URL: ${BASE_URL}`);

const API_URL = `${BASE_URL}/api/auth`;

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("downloads");
  
  const [showViewer, setShowViewer] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerLoading, setViewerLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const refreshUserData = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const latestUser = response.data.user;
        localStorage.setItem("user", JSON.stringify(latestUser));
        setUser(latestUser);
        setEditForm({
          name: latestUser.name,
          email: latestUser.email,
        });
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const latestUser = response.data.user;
        localStorage.setItem("user", JSON.stringify(latestUser));
        setUser(latestUser);
        setEditForm({
          name: latestUser.name,
          email: latestUser.email,
        });
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Load user error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      refreshUserData();
      if (location.state?.tab === 'downloads') {
        setActiveTab('downloads');
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleUpdateProfile = async () => {
    setUpdateError("");
    setUpdateSuccess("");
    try {
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/update-profile`,
        { name: editForm.name, email: editForm.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        const updatedUser = { ...user, name: editForm.name, email: editForm.email };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setUpdateSuccess("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setUpdateSuccess(""), 3000);
      }
    } catch (error) {
      setUpdateError(error.response?.data?.message || "Failed to update profile");
      setTimeout(() => setUpdateError(""), 3000);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    try {
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setPasswordSuccess("Password changed successfully!");
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(""), 3000);
      }
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Failed to change password");
    }
  };

  const handleViewFile = async (item) => {
    setViewerLoading(true);
    setViewingFile(item);
  
    try {
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");
  
      if (!token) {
        alert("Please login again");
        navigate("/");
        return;
      }
  
      const baseUrl = `${BASE_URL}/api/admin/public/download/${item.productType}/${item.productId}`;
  
      const response = await fetch(baseUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }
  
      const blob = await response.blob();
      const contentType = response.headers.get("content-type") || "application/octet-stream";
      const blobUrl = URL.createObjectURL(blob);
  
      setFileUrl(blobUrl);
      setFileType(contentType);
      setShowViewer(true);
    } catch (error) {
      console.error("View error:", error);
      alert("Error loading file");
    } finally {
      setViewerLoading(false);
    }
  };

  const handleDownloadFile = (item) => {
    const token = localStorage.getItem("userToken") || localStorage.getItem("token");
    if (!token) {
      alert("Please login again");
      navigate("/");
      return;
    }
    
    const downloadUrl = `${BASE_URL}/api/admin/public/download/${item.productType}/${item.productId}?token=${token}`;
    window.open(downloadUrl, "_blank");
  };

  // ✅ FIXED: Delete using unique _id instead of productType/productId
  const handleDeleteDownload = async () => {
    if (!itemToDelete) return;
    
    try {
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        navigate("/");
        return;
      }

      // Use _id for deletion
      const downloadId = itemToDelete._id;
      
      if (!downloadId) {
        alert("Invalid download record");
        return;
      }

      const response = await axios.delete(
        `${API_URL}/download-history/${downloadId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await refreshUserData();
        alert("Download record deleted successfully");
      } else {
        alert(response.data.message || "Failed to delete download record");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.response?.data?.message || "Error deleting download record");
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const closeViewer = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    setShowViewer(false);
    setViewingFile(null);
    setFileUrl("");
    setFileType("");
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    const viewerElement = document.getElementById("file-viewer-content");
    if (!isFullscreen) {
      if (viewerElement?.requestFullscreen) {
        viewerElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  const formatRelativeTime = (date) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return formatDate(date);
  };

  const purchases = user?.purchasedItems || [];
  const downloads = user?.downloadHistory || [];
  const totalSpent = purchases.reduce((sum, item) => sum + (item.amount || 499), 0);
  const totalDownloads = downloads.length;

  const getProductIcon = (type) => {
    switch(type) {
      case 'paid-pdf': return <FileText size={20} />;
      case 'practical-video': return <Video size={20} />;
      case 'predictive-paper': return <BookOpen size={20} />;
      case 'note': return <FileText size={20} />;
      case 'paper': return <BookOpen size={20} />;
      default: return <Download size={20} />;
    }
  };

  const getProductLightColor = (type) => {
    switch(type) {
      case 'paid-pdf': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'practical-video': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'predictive-paper': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'note': return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'paper': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getProductTypeName = (type) => {
    switch(type) {
      case 'paid-pdf': return 'Paid PDF';
      case 'practical-video': return 'Practical Video';
      case 'predictive-paper': return 'Predictive Paper';
      case 'note': return 'Note';
      case 'paper': return 'Paper';
      default: return 'Download';
    }
  };

  const stats = [
    { label: "Total Purchases", value: purchases.length, icon: ShoppingBag, gradient: "from-violet-500 to-purple-500", text: "text-violet-600", bg: "bg-violet-50" },
    { label: "Total Downloads", value: totalDownloads, icon: Download, gradient: "from-sky-500 to-blue-500", text: "text-sky-600", bg: "bg-sky-50" },
    { label: "Total Spent", value: `₹${totalSpent.toLocaleString()}`, icon: TrendingUp, gradient: "from-emerald-500 to-teal-500", text: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Member Since", value: formatDate(user?.createdAt).split(',')[0], icon: Calendar, gradient: "from-amber-500 to-orange-500", text: "text-amber-600", bg: "bg-amber-50" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-sky-200 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-sky-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-3 border-4 border-purple-400 rounded-full border-b-transparent animate-spin animation-delay-300"></div>
            <div className="absolute inset-6 border-4 border-pink-400 rounded-full border-l-transparent animate-spin animation-delay-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-purple-500 rounded-xl animate-bounce flex items-center justify-center">
                <Rocket size={24} className="text-white" />
              </div>
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-700 animate-pulse">Loading your profile...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-100 py-10 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-gradient-to-r from-sky-200/30 to-blue-200/30 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full filter blur-3xl animate-pulse-slow animation-delay-2000"></div>
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-2 h-2 bg-gradient-to-r from-sky-400 to-purple-400 rounded-full animate-float" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${3 + Math.random() * 5}s`, opacity: 0.4 }} />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/60 backdrop-blur-md rounded-full border border-white/50 shadow-lg mb-4 hover:scale-105 transition-all duration-300 animate-float">
            <Crown size={16} className="text-amber-500" />
            <span className="text-sm text-gray-700">Welcome Back, <span className="font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>!</span>
            <Sparkles size={14} className="text-sky-500 animate-pulse" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-sky-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">Profile Dashboard</h1>
          <p className="text-gray-500 mt-3 text-base sm:text-lg">Manage your account and track your activity</p>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
          {stats.map((stat, idx) => (
            <div key={idx} className={`group relative ${stat.bg} rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden`}>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"></div>
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-xl`}></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <stat.icon size={22} className="sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="w-0.5 h-8 sm:h-12 bg-gradient-to-b from-gray-300 to-transparent rounded-full group-hover:h-14 sm:group-hover:h-16 transition-all duration-500"></div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <p className="text-gray-600 text-xs sm:text-sm font-medium tracking-wide">{stat.label}</p>
                  <p className={`text-xl sm:text-3xl font-bold ${stat.text} mt-1`}>{stat.value}</p>
                  <div className="mt-2 sm:mt-3 h-1 bg-gray-200/50 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-700 group-hover:w-full`} style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs - Responsive */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl w-full sm:w-fit mx-auto shadow-xl border border-white/50">
          <button onClick={() => setActiveTab("downloads")} className={`px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-500 flex items-center gap-2 transform hover:scale-105 text-sm sm:text-base ${activeTab === "downloads" ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg" : "text-gray-700 hover:text-gray-900 hover:bg-white/50"}`}>
            <Download size={16} className="sm:w-[18px] sm:h-[18px]" /> Downloads ({totalDownloads})
          </button>
          <button onClick={() => setActiveTab("purchases")} className={`px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-500 flex items-center gap-2 transform hover:scale-105 text-sm sm:text-base ${activeTab === "purchases" ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg" : "text-gray-700 hover:text-gray-900 hover:bg-white/50"}`}>
            <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" /> Purchases ({purchases.length})
          </button>
          <button onClick={() => setActiveTab("settings")} className={`px-4 sm:px-8 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-500 flex items-center gap-2 transform hover:scale-105 text-sm sm:text-base ${activeTab === "settings" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg" : "text-gray-700 hover:text-gray-900 hover:bg-white/50"}`}>
            <Settings size={16} className="sm:w-[18px] sm:h-[18px]" /> Settings
          </button>
        </div>

        {/* Downloads Tab */}
        {activeTab === "downloads" && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-sky-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <Download size={18} className="sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Download History</h2>
                  <p className="text-gray-500 text-xs sm:text-sm">Content you've downloaded</p>
                </div>
              </div>
              <button onClick={refreshUserData} disabled={refreshing} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 disabled:opacity-50">
                <RefreshCw size={16} className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {downloads.length === 0 ? (
              <div className="text-center py-12 sm:py-20">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                  <Download size={40} className="sm:w-14 sm:h-14 text-gray-300" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">No downloads yet</h3>
                <p className="text-gray-400 text-sm sm:text-base mb-6">Start exploring and download content</p>
                <button onClick={() => navigate('/bpharm')} className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg text-sm sm:text-base">
                  Browse Content <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {downloads.map((item, index) => (
                  <div key={item._id || index} className="group bg-white rounded-xl p-4 sm:p-5 border border-gray-100 hover:border-sky-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${getProductLightColor(item.productType)} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 border shadow-md`}>
                          {getProductIcon(item.productType)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-base sm:text-lg">{item.productTitle || 'Study Material'}</h4>
                          <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                            <span className={`text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${getProductLightColor(item.productType)} font-medium`}>
                              {getProductTypeName(item.productType)}
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                              <Clock size={10} className="sm:w-3 sm:h-3" /> {formatRelativeTime(item.downloadedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                        <button onClick={() => handleViewFile(item)} className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-md text-sm">
                          <Eye size={14} className="sm:w-4 sm:h-4" /> View
                        </button>
                        <button onClick={() => handleDownloadFile(item)} className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white font-semibold hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-md text-sm">
                          <Download size={14} className="sm:w-4 sm:h-4" /> Download
                        </button>
                        <button 
                          onClick={() => {
                            setItemToDelete(item);
                            setShowDeleteConfirm(true);
                          }} 
                          className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-md text-sm"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Purchases Tab */}
        {activeTab === "purchases" && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                <ShoppingBag size={18} className="sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">My Purchases</h2>
                <p className="text-gray-500 text-xs sm:text-sm">Content you've bought</p>
              </div>
            </div>

            {purchases.length === 0 ? (
              <div className="text-center py-12 sm:py-20">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                  <ShoppingBag size={40} className="sm:w-14 sm:h-14 text-gray-300" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">No purchases yet</h3>
                <p className="text-gray-400 text-sm sm:text-base mb-6">You haven't purchased any content yet.</p>
                <button onClick={() => navigate('/bpharm')} className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg text-sm sm:text-base">
                  Browse Courses <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((item, index) => (
                  <div key={index} className="group bg-white rounded-xl p-4 sm:p-5 border border-gray-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${getProductLightColor(item.productType)} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-md`}>
                          {getProductIcon(item.productType)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-base sm:text-lg">{item.productTitle || 'Study Material'}</h4>
                          <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                            <span className={`text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${getProductLightColor(item.productType)} font-medium`}>{getProductTypeName(item.productType)}</span>
                            <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1"><Calendar size={10} className="sm:w-3 sm:h-3" /> {new Date(item.purchasedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                        <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">₹{item.amount || 499}</p>
                        <button onClick={() => handleViewFile(item)} className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg text-sm">
                          <Eye size={14} className="sm:w-4 sm:h-4" /> View Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                <Settings size={18} className="sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Account Settings</h2>
                <p className="text-gray-500 text-xs sm:text-sm">Manage your profile information</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 sm:p-6 border border-gray-100 hover:border-emerald-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md"><User size={18} className="sm:w-5 sm:h-5 text-white" /></div>
                    <div><h3 className="text-lg sm:text-xl font-bold text-gray-800">Profile Information</h3><p className="text-gray-500 text-xs sm:text-sm">Update your personal details</p></div>
                  </div>
                  {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-100 transition-all duration-300 hover:scale-105 text-sm"><Edit2 size={14} className="sm:w-4 sm:h-4" /> Edit Profile</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setIsEditing(false); setEditForm({ name: user.name, email: user.email }); }} className="px-3 sm:px-5 py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition text-sm">Cancel</button>
                      <button onClick={handleUpdateProfile} className="px-3 sm:px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:scale-105 transition text-sm">Save Changes</button>
                    </div>
                  )}
                </div>

                {updateSuccess && <div className="mb-4 p-2 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs sm:text-sm flex items-center gap-2 animate-slideDown"><CheckCircle size={14} className="sm:w-4 sm:h-4" /> {updateSuccess}</div>}
                {updateError && <div className="mb-4 p-2 sm:p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm flex items-center gap-2 animate-slideDown"><AlertCircle size={14} className="sm:w-4 sm:h-4" /> {updateError}</div>}

                <div className="space-y-4">
                  <div><label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    {isEditing ? <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                    : <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-gray-100 shadow-sm"><User size={16} className="sm:w-[18px] sm:h-[18px] text-emerald-500" /><span className="text-gray-800 font-medium text-sm sm:text-base">{user?.name}</span></div>}
                  </div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    {isEditing ? <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
                    : <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-gray-100 shadow-sm"><Mail size={16} className="sm:w-[18px] sm:h-[18px] text-emerald-500" /><span className="text-gray-800 text-sm sm:text-base">{user?.email}</span></div>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Member Since</label><div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-gray-100 shadow-sm"><Calendar size={16} className="sm:w-[18px] sm:h-[18px] text-emerald-500" /><span className="text-gray-700 text-sm sm:text-base">{formatDate(user?.createdAt)}</span></div></div>
                    <div><label className="block text-sm font-semibold text-gray-700 mb-2">Last Login</label><div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-gray-100 shadow-sm"><Clock size={16} className="sm:w-[18px] sm:h-[18px] text-emerald-500" /><span className="text-gray-700 text-sm sm:text-base">{formatRelativeTime(user?.lastLogin)}</span></div></div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 sm:p-6 border border-gray-100 hover:border-emerald-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md"><Lock size={18} className="sm:w-5 sm:h-5 text-white" /></div><div><h3 className="text-lg sm:text-xl font-bold text-gray-800">Security</h3><p className="text-gray-500 text-xs sm:text-sm">Update your password and security settings</p></div></div>
                  <button onClick={() => setShowPasswordModal(true)} className="px-4 sm:px-5 py-2 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:scale-105 shadow-sm text-sm">Change Password</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      {showViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={closeViewer}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-6xl h-[90vh] shadow-2xl animate-scaleIn overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  {viewingFile && getProductIcon(viewingFile.productType)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">{viewingFile?.productTitle || 'File Preview'}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500">{getProductTypeName(viewingFile?.productType)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={toggleFullscreen} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-all">
                  {isFullscreen ? <Minimize2 size={16} className="sm:w-5 sm:h-5" /> : <Maximize2 size={16} className="sm:w-5 sm:h-5" />}
                </button>
                <button onClick={closeViewer} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-all">
                  <XCircle size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div id="file-viewer-content" className="flex-1 overflow-auto bg-gray-100">
              {viewerLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm sm:text-base">Loading file...</p>
                  </div>
                </div>
              ) : (
                <>
                  {fileType.startsWith("image/") && (
                    <div className="h-full flex items-center justify-center bg-black">
                      <img src={fileUrl} alt="preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  {fileType.startsWith("video/") && (
                    <div className="h-full flex items-center justify-center bg-black">
                      <video controls autoPlay className="max-w-full max-h-full">
                        <source src={fileUrl} type={fileType} />
                      </video>
                    </div>
                  )}
                  {fileType === "application/pdf" && (
                    <iframe src={fileUrl} className="w-full h-full" title="PDF Viewer" style={{ border: "none" }} />
                  )}
                  {!fileType.startsWith("image/") && !fileType.startsWith("video/") && fileType !== "application/pdf" && (
                    <iframe src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`} className="w-full h-full" title="Document Viewer" style={{ border: "none" }} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl animate-scaleIn border border-gray-100">
            <div className="absolute top-0 right-0 w-36 h-36 sm:w-48 sm:h-48 bg-gradient-to-br from-rose-100 to-red-100 rounded-bl-full opacity-60"></div>
            <div className="relative flex items-center gap-3 mb-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                <Trash2 size={18} className="sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-black">Delete Download Record</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Are you sure you want to delete this?</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm sm:text-base mb-6">
              This will only remove the download record from your history. 
              The file will still be available for download from the store.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }} 
                className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold text-gray-800 text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteDownload} 
                className="flex-1 px-3 sm:px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-xl hover:from-rose-700 hover:to-red-700 transition-all duration-300 font-semibold shadow-md hover:scale-105 text-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowPasswordModal(false)}></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl animate-scaleIn border border-gray-100">
            <div className="absolute top-0 right-0 w-36 h-36 sm:w-48 sm:h-48 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-bl-full opacity-60"></div>
            <div className="relative flex items-center gap-3 mb-5"><div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md"><Key size={18} className="sm:w-5 sm:h-5 text-white" /></div><div><h3 className="text-xl sm:text-2xl font-bold text-black">Change Password</h3><p className="text-gray-600 text-xs sm:text-sm">Update your security credentials</p></div></div>
            {passwordSuccess && <div className="mb-4 p-2 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs sm:text-sm flex items-center gap-2 animate-slideDown"><CheckCircle size={14} className="sm:w-4 sm:h-4" /> {passwordSuccess}</div>}
            {passwordError && <div className="mb-4 p-2 sm:p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs sm:text-sm flex items-center gap-2 animate-slideDown"><AlertCircle size={14} className="sm:w-4 sm:h-4" /> {passwordError}</div>}
            <div className="space-y-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Enter current password" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Enter new password (min 6 chars)" /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="Confirm new password" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowPasswordModal(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setPasswordError(""); }} className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold text-gray-800 text-sm">Cancel</button>
              <button onClick={handleChangePassword} className="flex-1 px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 font-semibold shadow-md hover:scale-105 text-sm">Update Password</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.25s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient 3s ease infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-bounce { animation: bounce 1s ease-in-out infinite; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Profile;