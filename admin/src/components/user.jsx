import { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  UserCog,
  CheckCircle,
  AlertCircle,
  Shield,
  ShieldCheck,
  Calendar,
  Clock,
  Mail,
  BookOpen,
  Sparkles,
  Crown,
  Eye,
  EyeOff,
  Search,
  TrendingUp,
  Star,
  Award,
  UserPlus,
  Flame,
  Diamond,
  Wallet
} from "lucide-react";

// ========== ✅ DYNAMIC BASE URL - Works on both Localhost & EC2 ==========
const EC2_BASE_URL = "https://api.pharmaverse.co.in";
const LOCAL_BASE_URL = "http://localhost:5000";

const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const BASE_URL = isProduction ? EC2_BASE_URL : LOCAL_BASE_URL;

console.log(`🌐 UsersComponent running in ${isProduction ? "PRODUCTION (EC2)" : "DEVELOPMENT (Localhost)"} mode`);
console.log(`📡 API Base URL: ${BASE_URL}`);

const API_URL = `${BASE_URL}/api/auth`;

const UsersComponent = () => {
  const [users, setUsers] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState("subadmins");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedStats, setSelectedStats] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    permissions: [],
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const coursesList = [
    "B.Pharm",
    "D.Pharm",
    "M.Pharm",
    "Pharm.D",
    "PhD",
  ];

  // ================= GET TOKEN =================
  const getToken = () => {
    return localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
  };

  // ================= GET CURRENT ADMIN =================
  const getCurrentAdmin = () => {
    const adminFromLocal = localStorage.getItem("admin");
    const adminFromSession = sessionStorage.getItem("admin");
    return JSON.parse(adminFromLocal || adminFromSession || "{}");
  };

  const currentAdmin = getCurrentAdmin();
  const isSuperAdmin = currentAdmin?.role === "super_admin";

  // ================= GET AUTH HEADERS =================
  const getAuthHeaders = () => {
    const token = getToken();
    if (!token) return null;
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ================= FETCH SUB-ADMINS =================
  const fetchSubAdmins = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/subadmins`, headers);
      setSubAdmins(response.data.subAdmins || []);
    } catch (error) {
      console.error("FETCH SUB-ADMINS ERROR:", error);
      
      if (error.response?.status === 401) {
        setMessage({
          type: "error",
          text: "Session expired. Please login again.",
        });
        localStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        sessionStorage.removeItem("admin");
        setTimeout(() => {
          window.location.href = "/admin-login";
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Failed to fetch sub-admins",
        });
      }
    }
  };

  // ================= FETCH NORMAL USERS =================
  const fetchNormalUsers = async () => {
    const headers = getAuthHeaders();
    if (!headers) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/users`, headers);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("FETCH USERS ERROR:", error);
      
      if (error.response?.status === 401) {
        setMessage({
          type: "error",
          text: "Session expired. Please login again.",
        });
      } else {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Failed to fetch users",
        });
      }
    }
  };

  // ================= LOAD DATA =================
  useEffect(() => {
    if (isSuperAdmin) {
      Promise.all([fetchSubAdmins(), fetchNormalUsers()]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  // ================= SUBMIT (CREATE/UPDATE) =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const headers = getAuthHeaders();
    if (!headers) {
      setMessage({
        type: "error",
        text: "No authentication token found. Please login again.",
      });
      return;
    }

    if (!formData.name || !formData.email) {
      setMessage({
        type: "error",
        text: "Name and email are required",
      });
      return;
    }

    if (!editingUser && !formData.password) {
      setMessage({
        type: "error",
        text: "Password is required for new sub-admin",
      });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    try {
      let response;
      if (editingUser) {
        response = await axios.put(
          `${API_URL}/subadmin/${editingUser._id}`,
          {
            name: formData.name,
            permissions: formData.permissions,
            isActive: true,
            password: formData.password || undefined
          },
          headers
        );
        setMessage({
          type: "success",
          text: "Sub-admin updated successfully",
        });
      } else {
        response = await axios.post(
          `${API_URL}/register-subadmin`,
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            permissions: formData.permissions,
          },
          headers
        );
        setMessage({
          type: "success",
          text: "Sub-admin created successfully",
        });
      }

      setShowModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        permissions: [],
      });
      setEditingUser(null);
      await fetchSubAdmins();
      
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Submit error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  // ================= DELETE SUB-ADMIN =================
  const handleDeleteSubAdmin = async (adminId) => {
    if (!window.confirm("⚠️ Delete this sub-admin? This action cannot be undone.")) return;

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      await axios.delete(`${API_URL}/subadmin/${adminId}`, headers);
      await fetchSubAdmins();
      setMessage({
        type: "success",
        text: "Sub-admin deleted successfully",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Delete failed",
      });
    }
  };

  // ================= DELETE NORMAL USER =================
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("⚠️ Delete this user? This action cannot be undone.")) return;

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      await axios.delete(`${API_URL}/users/${userId}`, headers);
      await fetchNormalUsers();
      setMessage({
        type: "success",
        text: "User deleted successfully",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Delete failed",
      });
    }
  };

  // ================= EDIT SUB-ADMIN =================
  const handleEdit = (subAdmin) => {
    setEditingUser(subAdmin);
    setFormData({
      name: subAdmin.name,
      email: subAdmin.email,
      password: "",
      permissions: subAdmin.permissions?.courses || [],
    });
    setShowModal(true);
  };

  // ================= TOGGLE COURSE =================
  const toggleCourse = (course) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(course)
        ? prev.permissions.filter((c) => c !== course)
        : [...prev.permissions, course],
    }));
  };

  // ================= FILTERED DATA =================
  const filteredSubAdmins = subAdmins.filter(admin =>
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ================= STATS =================
  const activeSubAdmins = subAdmins.filter(a => a.isActive).length;
  const totalCoursesEnrolled = users.reduce((sum, user) => sum + (user.enrolledCourses?.length || 0), 0);
  const premiumUsers = users.filter(u => u.isPremium).length;
  const totalRevenue = users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);

  // ================= ACCESS DENIED =================
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-4">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 text-center max-w-md border border-white/10">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-red-500/20 rounded-bl-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 bg-purple-500/20 rounded-tr-full blur-2xl"></div>
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl animate-pulse">
              <Shield size={32} className="sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-300 text-sm sm:text-base">Only Super Admin can manage users and admins</p>
          </div>
        </div>
      </div>
    );
  }

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-4">
        <div className="text-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 border-4 border-purple-500 rounded-full border-b-transparent animate-spin animation-delay-300"></div>
            <div className="absolute inset-4 border-4 border-pink-500 rounded-full border-l-transparent animate-spin animation-delay-600"></div>
          </div>
          <div className="text-base sm:text-lg md:text-xl font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
            Loading Dashboard...
          </div>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">Fetching latest data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Premium Background Effects - Hidden on mobile */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 hidden sm:block">
        <div className="absolute top-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 px-2 sm:px-4">
        {/* HEADER SECTION - Responsive */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                    <Users size={18} className="sm:w-5 sm:h-5 md:w-7 md:h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-800 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Admin Control Hub
                  </h1>
                  <p className="text-gray-500 text-xs sm:text-sm md:text-base ml-0 sm:ml-2">Complete control over your admin team and user base</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingUser(null);
                setFormData({
                  name: "",
                  email: "",
                  password: "",
                  permissions: [],
                });
                setShowModal(true);
              }}
              className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 transition-all duration-500 hover:scale-105 shadow-2xl text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <UserPlus size={16} className="sm:w-5 sm:h-5 relative z-10" />
              <span className="relative z-10 font-semibold text-sm sm:text-base md:text-lg">Create Sub Admin</span>
              <Sparkles size={14} className="sm:w-4 sm:h-4 relative z-10 animate-pulse" />
            </button>
          </div>
        </div>

        {/* PREMIUM STATS CARDS - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8 md:mb-10">
          {/* Card 1 - Total Sub-Admins */}
          <div 
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-white/50"
            onMouseEnter={() => setSelectedStats('subadmins')}
            onMouseLeave={() => setSelectedStats(null)}
          >
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <UserCog size={14} className="sm:w-5 sm:h-5 text-white" />
                </div>
                <TrendingUp size={14} className="sm:w-4 sm:h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm font-medium">Total Sub-Admins</p>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mt-1">{subAdmins.length}</p>
              <div className="mt-2 sm:mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-slideIn" style={{ width: `${Math.min((subAdmins.length / 20) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Card 2 - Active Sub-Admins */}
          <div 
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-white/50"
            onMouseEnter={() => setSelectedStats('active')}
            onMouseLeave={() => setSelectedStats(null)}
          >
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck size={14} className="sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm font-medium">Active Sub-Admins</p>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-600 mt-1">{activeSubAdmins}</p>
              <div className="mt-2 sm:mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-slideIn" style={{ width: `${(activeSubAdmins / (subAdmins.length || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Card 3 - Total Users */}
          <div 
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-white/50"
            onMouseEnter={() => setSelectedStats('users')}
            onMouseLeave={() => setSelectedStats(null)}
          >
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Users size={14} className="sm:w-5 sm:h-5 text-white" />
                </div>
                <Award size={14} className="sm:w-4 sm:h-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm font-medium">Total Users</p>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">{users.length}</p>
              <div className="mt-2 sm:mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-slideIn" style={{ width: `${Math.min((users.length / 1000) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Card 4 - Total Enrollments */}
          <div 
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-white/50"
            onMouseEnter={() => setSelectedStats('enrollments')}
            onMouseLeave={() => setSelectedStats(null)}
          >
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <BookOpen size={14} className="sm:w-5 sm:h-5 text-white" />
                </div>
                <Flame size={14} className="sm:w-4 sm:h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm font-medium">Total Enrollments</p>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">{totalCoursesEnrolled}</p>
              <div className="mt-2 sm:mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-slideIn" style={{ width: `${Math.min((totalCoursesEnrolled / 500) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Card 5 - Premium Users */}
          <div 
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-white/50"
            onMouseEnter={() => setSelectedStats('premium')}
            onMouseLeave={() => setSelectedStats(null)}
          >
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Diamond size={14} className="sm:w-5 sm:h-5 text-white" />
                </div>
                <Star size={14} className="sm:w-4 sm:h-4 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm font-medium">Premium Users</p>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-yellow-600 mt-1">{premiumUsers}</p>
              <div className="mt-2 sm:mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-slideIn" style={{ width: `${(premiumUsers / (users.length || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Card 6 - Total Revenue */}
          <div 
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-white/50"
            onMouseEnter={() => setSelectedStats('revenue')}
            onMouseLeave={() => setSelectedStats(null)}
          >
            <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-500 to-rose-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Wallet size={14} className="sm:w-5 sm:h-5 text-white" />
                </div>
                <TrendingUp size={14} className="sm:w-4 sm:h-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm font-medium">Total Revenue</p>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-red-600 mt-1">₹{totalRevenue.toLocaleString()}</p>
              <div className="mt-2 sm:mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-slideIn" style={{ width: `${Math.min((totalRevenue / 100000) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ALERT MESSAGE - Responsive */}
        {message.text && (
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 animate-slideDown backdrop-blur-sm shadow-lg ${
              message.type === "success"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
                : "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle size={12} className="sm:w-4 sm:h-4 text-white" />
              </div>
            ) : (
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle size={12} className="sm:w-4 sm:h-4 text-white" />
              </div>
            )}
            <span className="flex-1 font-medium text-xs sm:text-sm md:text-base">{message.text}</span>
            <button onClick={() => setMessage({ type: "", text: "" })} className="hover:opacity-70 transition-opacity p-1 rounded-full hover:bg-white/50">
              <X size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        )}

        {/* SEARCH BAR - Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="relative max-w-md group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <Search size={16} className="sm:w-4 sm:h-4 absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm text-sm sm:text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={14} className="sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PREMIUM TABS - Responsive */}
        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 bg-white/50 backdrop-blur-sm p-1.5 rounded-xl sm:rounded-2xl w-full sm:w-fit shadow-lg border border-white/50">
          <button
            onClick={() => setActiveTab("subadmins")}
            className={`flex-1 sm:flex-auto px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-500 flex items-center justify-center gap-1.5 sm:gap-2 relative overflow-hidden group text-sm sm:text-base ${
              activeTab === "subadmins"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-105"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {activeTab === "subadmins" && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
            )}
            <UserCog size={14} className="sm:w-4 sm:h-4 relative z-10" />
            <span className="relative z-10 text-xs sm:text-sm">Sub-Admins</span>
            <span className={`relative z-10 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${
              activeTab === "subadmins" ? "bg-white/20" : "bg-gray-200"
            }`}>
              {filteredSubAdmins.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 sm:flex-auto px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-500 flex items-center justify-center gap-1.5 sm:gap-2 relative overflow-hidden group text-sm sm:text-base ${
              activeTab === "users"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-105"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {activeTab === "users" && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
            )}
            <Users size={14} className="sm:w-4 sm:h-4 relative z-10" />
            <span className="relative z-10 text-xs sm:text-sm">Users</span>
            <span className={`relative z-10 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${
              activeTab === "users" ? "bg-white/20" : "bg-gray-200"
            }`}>
              {filteredUsers.length}
            </span>
          </button>
        </div>

        {/* SUB-ADMINS SECTION - Responsive */}
        {activeTab === "subadmins" && (
          <div className="grid gap-3 sm:gap-4 md:gap-5">
            {filteredSubAdmins.length === 0 ? (
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center border border-white/50 shadow-xl">
                <div className="absolute top-0 right-0 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-tr-full"></div>
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-inner">
                    <UserCog size={40} className="sm:w-12 sm:h-12 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-lg sm:text-xl md:text-2xl font-medium">No sub-admins found</p>
                  <p className="text-gray-400 text-xs sm:text-sm md:text-base mt-2">Click "Create Sub Admin" to add your first team member</p>
                </div>
              </div>
            ) : (
              filteredSubAdmins.map((admin, index) => (
                <div
                  key={admin._id}
                  className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-white/50 animate-slideUp"
                  style={{ animationDelay: `${index * 80}ms` }}
                  onMouseEnter={() => setHoveredCard(admin._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full"></div>
                  <div className="absolute -inset-px bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
                  <div className={`relative p-4 sm:p-5 md:p-6 transition-all duration-500 ${hoveredCard === admin._id ? 'scale-[1.01]' : ''}`}>
                    <div className="flex flex-col md:flex-row flex-wrap items-start gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-[200px]">
                        <div className={`relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 ${
                          admin.role === "super_admin" 
                            ? "bg-gradient-to-br from-yellow-500 to-amber-600 animate-float" 
                            : "bg-gradient-to-br from-indigo-600 to-purple-600"
                        } group-hover:scale-110`}>
                          {admin.role === "super_admin" ? (
                            <Crown size={24} className="sm:w-6 sm:h-6 text-white" />
                          ) : (
                            <Shield size={24} className="sm:w-6 sm:h-6 text-white" />
                          )}
                          {admin.isActive && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-base sm:text-lg md:text-xl">{admin.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="p-0.5 sm:p-1 bg-gray-100 rounded-md sm:rounded-lg">
                              <Mail size={10} className="sm:w-3 sm:h-3 text-gray-400" />
                            </div>
                            <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 break-all">{admin.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold shadow-md flex items-center gap-1.5 ${
                          admin.role === "super_admin"
                            ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200"
                            : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200"
                        }`}>
                          {admin.role === "super_admin" ? <Crown size={10} className="sm:w-3 sm:h-3" /> : <Shield size={10} className="sm:w-3 sm:h-3" />}
                          {admin.role === "super_admin" ? "Super Admin" : "Sub Admin"}
                        </span>

                        <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-md ${
                          admin.isActive
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
                            : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                          {admin.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-[180px]">
                        <div className="flex flex-wrap gap-1.5">
                          {admin.role === "super_admin" ? (
                            <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 rounded-lg text-[10px] font-medium flex items-center gap-1 border border-yellow-200 shadow-sm">
                              <Sparkles size={10} />
                              Unlimited Access • All Courses
                            </span>
                          ) : admin.permissions?.courses?.length > 0 ? (
                            admin.permissions.courses.map((course) => (
                              <span key={course} className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-600 rounded-lg text-[10px] font-medium border border-indigo-100 shadow-sm hover:scale-105 transition-transform">
                                {course}
                              </span>
                            ))
                          ) : (
                            <span className="text-red-500 text-[10px] flex items-center gap-1">
                              <AlertCircle size={10} />
                              No Permissions Assigned
                            </span>
                          )}
                        </div>
                      </div>

                      {admin.role !== "super_admin" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(admin)}
                            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 hover:scale-110 shadow-md group/btn"
                            title="Edit Sub Admin"
                          >
                            <Edit2 size={14} className="sm:w-4 sm:h-4 group-hover/btn:rotate-12 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubAdmin(admin._id)}
                            className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:from-red-100 hover:to-rose-100 transition-all duration-300 hover:scale-110 shadow-md group/btn"
                            title="Delete Sub Admin"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4 group-hover/btn:rotate-12 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={`absolute bottom-0 left-0 h-0.5 sm:h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 ${hoveredCard === admin._id ? 'w-full' : 'w-0'}`}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* NORMAL USERS SECTION - Responsive */}
        {activeTab === "users" && (
          <div className="grid gap-3 sm:gap-4 md:gap-5">
            {filteredUsers.length === 0 ? (
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center border border-white/50 shadow-xl">
                <div className="absolute top-0 right-0 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-tr-full"></div>
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-inner">
                    <Users size={40} className="sm:w-12 sm:h-12 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-lg sm:text-xl md:text-2xl font-medium">No users registered yet</p>
                  <p className="text-gray-400 text-xs sm:text-sm md:text-base mt-2">Users will appear here when they sign up</p>
                </div>
              </div>
            ) : (
              filteredUsers.map((user, index) => (
                <div
                  key={user._id}
                  className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-white/50 animate-slideUp"
                  style={{ animationDelay: `${index * 80}ms` }}
                  onMouseEnter={() => setHoveredCard(user._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-bl-full"></div>
                  <div className="absolute -inset-px bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
                  <div className={`relative p-4 sm:p-5 md:p-6 transition-all duration-500 ${hoveredCard === user._id ? 'scale-[1.01]' : ''}`}>
                    <div className="flex flex-col md:flex-row flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-[200px]">
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-500">
                          <Users size={24} className="sm:w-6 sm:h-6 text-white" />
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-base sm:text-lg md:text-xl">{user.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="p-0.5 sm:p-1 bg-gray-100 rounded-md sm:rounded-lg">
                              <Mail size={10} className="sm:w-3 sm:h-3 text-gray-400" />
                            </div>
                            <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 break-all">{user.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {user.isPremium && (
                          <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1.5 shadow-md">
                            <Diamond size={10} className="sm:w-3 sm:h-3" />
                            Premium
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:from-red-100 hover:to-rose-100 transition-all duration-300 hover:scale-110 shadow-md group/btn"
                          title="Delete User"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4 group-hover/btn:rotate-12 transition-transform" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-100 flex flex-wrap gap-4 sm:gap-6 md:gap-8">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="p-1 sm:p-1.5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-md sm:rounded-lg">
                          <Calendar size={12} className="sm:w-3.5 sm:h-3.5 text-indigo-500" />
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-600">
                          Joined: {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="p-1 sm:p-1.5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-md sm:rounded-lg">
                          <Clock size={12} className="sm:w-3.5 sm:h-3.5 text-blue-500" />
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-600">
                          Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "Never"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="p-1 sm:p-1.5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-md sm:rounded-lg">
                          <BookOpen size={12} className="sm:w-3.5 sm:h-3.5 text-purple-500" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-gray-700">
                          Enrolled: {user.enrolledCourses?.length || 0} {user.enrolledCourses?.length === 1 ? 'course' : 'courses'}
                        </span>
                      </div>
                    </div>

                    {user.enrolledCourses?.length > 0 && (
                      <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5">
                        {user.enrolledCourses.map((course) => (
                          <span key={course} className="px-2 sm:px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 rounded-lg text-[10px] sm:text-xs font-medium border border-purple-100 shadow-sm hover:scale-105 transition-transform">
                            {course}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={`absolute bottom-0 left-0 h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 transition-all duration-700 ${hoveredCard === user._id ? 'w-full' : 'w-0'}`}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* PREMIUM MODAL - Responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn border border-white/50">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-tr-full"></div>
            
            <div className="relative">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl">
                      {editingUser ? <Edit2 size={18} className="sm:w-5 sm:h-5 text-white" /> : <UserPlus size={18} className="sm:w-5 sm:h-5 text-white" />}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {editingUser ? "Edit Sub Admin" : "Add Sub Admin"}
                    </h2>
                    <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1">
                      {editingUser ? "Update admin permissions" : "Create a new admin account"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="hover:bg-gray-100 p-1.5 sm:p-2 rounded-full transition-all duration-200"
                >
                  <X size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    {editingUser ? "New Password (optional)" : "Password *"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={editingUser ? "Enter new password or leave blank" : "Enter password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 pr-9 sm:pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={14} className="sm:w-4 sm:h-4" /> : <Eye size={14} className="sm:w-4 sm:h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-700 text-xs sm:text-sm mb-1 sm:mb-2">Course Permissions</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-2 sm:mb-3">
                    Select which courses this sub-admin can manage
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {coursesList.map((course) => (
                      <button
                        key={course}
                        type="button"
                        onClick={() => toggleCourse(course)}
                        className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs md:text-sm font-medium transition-all duration-300 ${
                          formData.permissions.includes(course)
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                        }`}
                      >
                        {course}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="relative group w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 mt-2 sm:mt-4 shadow-xl overflow-hidden text-sm sm:text-base"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {editingUser ? <Edit2 size={14} className="sm:w-4 sm:h-4" /> : <UserPlus size={14} className="sm:w-4 sm:h-4" />}
                    {editingUser ? "Update Sub Admin" : "Create Sub Admin"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.25s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out forwards; opacity: 0; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.8s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-blob { animation: blob 7s infinite; }
        .animate-shimmer { animation: shimmer 1.5s infinite; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        @media (max-width: 640px) {
          .animate-slideUp {
            animation-duration: 0.3s;
          }
        }
      `}</style>
    </div>
  );
};

export default UsersComponent;