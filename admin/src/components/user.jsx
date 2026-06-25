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

const API_URL = "https://api.pharmaverse.co.in/api/admin";

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
    "PharmaD",
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

  // ================= SUBMIT =================
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

    try {
      if (editingUser) {
        await axios.put(
          `${API_URL}/subadmins/${editingUser._id}`,
          formData,
          headers
        );
        setMessage({
          type: "success",
          text: "Sub-admin updated successfully",
        });
      } else {
        await axios.post(
          `${API_URL}/register-subadmin`,
          formData,
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
      console.error(error);
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
      await axios.delete(`${API_URL}/subadmins/${adminId}`, headers);
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
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-12 text-center max-w-md border border-white/10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/20 rounded-bl-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-tr-full blur-2xl"></div>
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
              <Shield size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-300">Only Super Admin can manage users and admins</p>
          </div>
        </div>
      </div>
    );
  }

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 border-4 border-purple-500 rounded-full border-b-transparent animate-spin animation-delay-300"></div>
            <div className="absolute inset-4 border-4 border-pink-500 rounded-full border-l-transparent animate-spin animation-delay-600"></div>
          </div>
          <div className="text-xl font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
            Loading Dashboard...
          </div>
          <p className="text-gray-400 text-sm mt-2">Fetching latest data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10">
        {/* HEADER SECTION */}
        <div className="mb-10">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                    <Users size={28} className="text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Admin Control Hub
                  </h1>
                  <p className="text-gray-500 ml-2">Complete control over your admin team and user base</p>
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
              className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-indigo-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <UserPlus size={22} className="relative z-10" />
              <span className="relative z-10 font-semibold text-lg">Create Sub Admin</span>
              <Sparkles size={18} className="relative z-10 animate-pulse" />
            </button>
          </div>
        </div>

        {/* PREMIUM STATS CARDS - 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-10">
          {/* Card 1 - Total Sub-Admins */}
          <div 
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-white/50"
            onMouseEnter={() => setSelectedStats('subadmins')}
            onMouseLeave={() => setSelectedStats(null)}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <UserCog size={22} className="text-white" />
                </div>
                <TrendingUp size={20} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Total Sub-Admins</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mt-1">{subAdmins.length}</p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-slideIn" style={{ width: `${Math.min((subAdmins.length / 20) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Card 2 - Active Sub-Admins */}
          <div 
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-white/50"
            onMouseEnter={() => setSelectedStats('active')}
            onMouseLeave={() => setSelectedStats(null)}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck size={22} className="text-white" />
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-gray-500 text-sm font-medium">Active Sub-Admins</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{activeSubAdmins}</p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-slideIn" style={{ width: `${(activeSubAdmins / (subAdmins.length || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Card 3 - Total Users */}
          <div 
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-white/50"
            onMouseEnter={() => setSelectedStats('users')}
            onMouseLeave={() => setSelectedStats(null)}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Users size={22} className="text-white" />
                </div>
                <Award size={20} className="text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-1">{users.length}</p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-slideIn" style={{ width: `${Math.min((users.length / 1000) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Card 4 - Total Enrollments */}
          <div 
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-white/50"
            onMouseEnter={() => setSelectedStats('enrollments')}
            onMouseLeave={() => setSelectedStats(null)}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <BookOpen size={22} className="text-white" />
                </div>
                <Flame size={20} className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Total Enrollments</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">{totalCoursesEnrolled}</p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-slideIn" style={{ width: `${Math.min((totalCoursesEnrolled / 500) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Card 5 - Premium Users */}
          <div 
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-white/50"
            onMouseEnter={() => setSelectedStats('premium')}
            onMouseLeave={() => setSelectedStats(null)}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Diamond size={22} className="text-white" />
                </div>
                <Star size={20} className="text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Premium Users</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{premiumUsers}</p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-slideIn" style={{ width: `${(premiumUsers / (users.length || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Card 6 - Total Revenue */}
          <div 
            className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border border-white/50"
            onMouseEnter={() => setSelectedStats('revenue')}
            onMouseLeave={() => setSelectedStats(null)}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-500 to-rose-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Wallet size={22} className="text-white" />
                </div>
                <TrendingUp size={20} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-red-600 mt-1">₹{totalRevenue.toLocaleString()}</p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-slideIn" style={{ width: `${Math.min((totalRevenue / 100000) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ALERT MESSAGE */}
        {message.text && (
          <div
            className={`mb-6 p-5 rounded-2xl flex items-center gap-3 animate-slideDown backdrop-blur-sm shadow-lg ${
              message.type === "success"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
                : "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle size={16} className="text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle size={16} className="text-white" />
              </div>
            )}
            <span className="flex-1 font-medium">{message.text}</span>
            <button onClick={() => setMessage({ type: "", text: "" })} className="hover:opacity-70 transition-opacity p-1 rounded-full hover:bg-white/50">
              <X size={18} />
            </button>
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="mb-8">
          <div className="relative max-w-md group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PREMIUM TABS */}
        <div className="flex gap-3 mb-8 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl w-fit shadow-lg border border-white/50">
          <button
            onClick={() => setActiveTab("subadmins")}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-500 flex items-center gap-2 relative overflow-hidden group ${
              activeTab === "subadmins"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-105"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {activeTab === "subadmins" && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
            )}
            <UserCog size={18} className="relative z-10" />
            <span className="relative z-10">Sub-Admins</span>
            <span className={`relative z-10 px-2 py-0.5 rounded-full text-xs ${
              activeTab === "subadmins" ? "bg-white/20" : "bg-gray-200"
            }`}>
              {filteredSubAdmins.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-500 flex items-center gap-2 relative overflow-hidden group ${
              activeTab === "users"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-105"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {activeTab === "users" && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
            )}
            <Users size={18} className="relative z-10" />
            <span className="relative z-10">Users</span>
            <span className={`relative z-10 px-2 py-0.5 rounded-full text-xs ${
              activeTab === "users" ? "bg-white/20" : "bg-gray-200"
            }`}>
              {filteredUsers.length}
            </span>
          </button>
        </div>

        {/* SUB-ADMINS SECTION */}
        {activeTab === "subadmins" && (
          <div className="grid gap-5">
            {filteredSubAdmins.length === 0 ? (
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-3xl p-16 text-center border border-white/50 shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-tr-full"></div>
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <UserCog size={56} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-2xl font-medium">No sub-admins found</p>
                  <p className="text-gray-400 mt-2">Click "Create Sub Admin" to add your first team member</p>
                </div>
              </div>
            ) : (
              filteredSubAdmins.map((admin, index) => (
                <div
                  key={admin._id}
                  className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-white/50 animate-slideUp"
                  style={{ animationDelay: `${index * 80}ms` }}
                  onMouseEnter={() => setHoveredCard(admin._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full"></div>
                  <div className="absolute -inset-px bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
                  <div className={`relative p-6 transition-all duration-500 ${hoveredCard === admin._id ? 'scale-[1.01]' : ''}`}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-5 flex-1 min-w-[220px]">
                        <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 ${
                          admin.role === "super_admin" 
                            ? "bg-gradient-to-br from-yellow-500 to-amber-600 animate-float" 
                            : "bg-gradient-to-br from-indigo-600 to-purple-600"
                        } group-hover:scale-110`}>
                          {admin.role === "super_admin" ? (
                            <Crown size={32} className="text-white" />
                          ) : (
                            <Shield size={32} className="text-white" />
                          )}
                          {admin.isActive && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-xl">{admin.name}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="p-1 bg-gray-100 rounded-lg">
                              <Mail size={12} className="text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-500">{admin.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 ${
                          admin.role === "super_admin"
                            ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200"
                            : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200"
                        }`}>
                          {admin.role === "super_admin" ? <Crown size={12} /> : <Shield size={12} />}
                          {admin.role === "super_admin" ? "Super Admin" : "Sub Admin"}
                        </span>

                        <span className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md ${
                          admin.isActive
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
                            : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200"
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${admin.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                          {admin.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <div className="flex flex-wrap gap-2">
                          {admin.role === "super_admin" ? (
                            <span className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 rounded-xl text-xs font-medium flex items-center gap-2 border border-yellow-200 shadow-sm">
                              <Sparkles size={12} />
                              Unlimited Access • All Courses
                            </span>
                          ) : admin.permissions?.courses?.length > 0 ? (
                            admin.permissions.courses.map((course) => (
                              <span key={course} className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-600 rounded-xl text-xs font-medium border border-indigo-100 shadow-sm hover:scale-105 transition-transform">
                                {course}
                              </span>
                            ))
                          ) : (
                            <span className="text-red-500 text-sm flex items-center gap-1">
                              <AlertCircle size={14} />
                              No Permissions Assigned
                            </span>
                          )}
                        </div>
                      </div>

                      {admin.role !== "super_admin" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(admin)}
                            className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 hover:scale-110 shadow-md group/btn"
                            title="Edit Sub Admin"
                          >
                            <Edit2 size={18} className="group-hover/btn:rotate-12 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubAdmin(admin._id)}
                            className="p-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:from-red-100 hover:to-rose-100 transition-all duration-300 hover:scale-110 shadow-md group/btn"
                            title="Delete Sub Admin"
                          >
                            <Trash2 size={18} className="group-hover/btn:rotate-12 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Premium animated border */}
                    <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 ${hoveredCard === admin._id ? 'w-full' : 'w-0'}`}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* NORMAL USERS SECTION */}
        {activeTab === "users" && (
          <div className="grid gap-5">
            {filteredUsers.length === 0 ? (
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-3xl p-16 text-center border border-white/50 shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-tr-full"></div>
                <div className="relative">
                  <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <Users size={56} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-2xl font-medium">No users registered yet</p>
                  <p className="text-gray-400 mt-2">Users will appear here when they sign up</p>
                </div>
              </div>
            ) : (
              filteredUsers.map((user, index) => (
                <div
                  key={user._id}
                  className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-white/50 animate-slideUp"
                  style={{ animationDelay: `${index * 80}ms` }}
                  onMouseEnter={() => setHoveredCard(user._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-bl-full"></div>
                  <div className="absolute -inset-px bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur"></div>
                  <div className={`relative p-6 transition-all duration-500 ${hoveredCard === user._id ? 'scale-[1.01]' : ''}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-5 flex-1 min-w-[220px]">
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-500">
                          <Users size={32} className="text-white" />
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-lg"></div>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-xl">{user.name}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="p-1 bg-gray-100 rounded-lg">
                              <Mail size={12} className="text-gray-400" />
                            </div>
                            <span className="text-sm text-gray-500">{user.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {user.isPremium && (
                          <span className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border border-orange-200 flex items-center gap-2 shadow-md">
                            <Diamond size={12} />
                            Premium
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-3 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:from-red-100 hover:to-rose-100 transition-all duration-300 hover:scale-110 shadow-md group/btn"
                          title="Delete User"
                        >
                          <Trash2 size={18} className="group-hover/btn:rotate-12 transition-transform" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-8">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                          <Calendar size={14} className="text-indigo-500" />
                        </div>
                        <span className="text-sm text-gray-600">
                          Joined: {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                          <Clock size={14} className="text-blue-500" />
                        </div>
                        <span className="text-sm text-gray-600">
                          Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "Never"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                          <BookOpen size={14} className="text-purple-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Enrolled: {user.enrolledCourses?.length || 0} {user.enrolledCourses?.length === 1 ? 'course' : 'courses'}
                        </span>
                      </div>
                    </div>

                    {user.enrolledCourses?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {user.enrolledCourses.map((course) => (
                          <span key={course} className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 rounded-xl text-xs font-medium border border-purple-100 shadow-sm hover:scale-105 transition-transform">
                            {course}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Premium animated border */}
                    <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 transition-all duration-700 ${hoveredCard === user._id ? 'w-full' : 'w-0'}`}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* PREMIUM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="relative bg-white rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn border border-white/50">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-tr-full"></div>
            
            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                      {editingUser ? <Edit2 size={24} className="text-white" /> : <UserPlus size={24} className="text-white" />}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {editingUser ? "Edit Sub Admin" : "Add Sub Admin"}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {editingUser ? "Update admin permissions" : "Create a new admin account"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="hover:bg-gray-100 p-2 rounded-full transition-all duration-200"
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editingUser ? "New Password (optional)" : "Password *"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={editingUser ? "Enter new password or leave blank" : "Enter password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-700 mb-2">Course Permissions</p>
                  <p className="text-xs text-gray-400 mb-3">
                    Select which courses this sub-admin can manage
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {coursesList.map((course) => (
                      <button
                        key={course}
                        type="button"
                        onClick={() => toggleCourse(course)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
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
                  className="relative group w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 mt-4 shadow-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {editingUser ? <Edit2 size={18} /> : <UserPlus size={18} />}
                    {editingUser ? "Update Sub Admin" : "Create Sub Admin"}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Global Animations */}
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
          50% { transform: translateY(-10px); }
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
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.5s ease-out forwards; opacity: 0; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 1s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-blob { animation: blob 7s infinite; }
        .animate-shimmer { animation: shimmer 1.5s infinite; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default UsersComponent;