import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Bell, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  X, 
  Edit2, 
  Trash2,
  Eye,
  EyeOff,
  Info,
  AlertTriangle,
  CheckCircle as CheckCircleIcon,
  XCircle,
  Sparkles,
  TrendingUp,
  Zap,
  Award,
  Shield,
  Star,
  Flame,
  Gem,
  Rocket,
  Activity,
  BarChart3,
  Heart,
  ThumbsUp,
  MessageCircle,
  Share2
} from "lucide-react";

const API_URL = "http://localhost:5000/api/admin";

const AdminNotice = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "info",
    startDate: "",
    endDate: "",
    isActive: true
  });

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  // Fetch notices
  const fetchNotices = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API_URL}/notices`, headers);
      setNotices(response.data.notices || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
      setMessage({ type: "error", text: "Failed to load notices" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Filter active notices (last 24 hours)
  const getActiveNotices = () => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return notices.filter(notice => {
      if (!notice.isActive) return false;
      const noticeDate = new Date(notice.createdAt);
      return noticeDate >= twentyFourHoursAgo;
    });
  };

  // Filter upcoming notices
  const getUpcomingNotices = () => {
    const now = new Date();
    return notices.filter(notice => {
      if (!notice.isActive) return false;
      if (notice.startDate) {
        const startDate = new Date(notice.startDate);
        return startDate > now;
      }
      return false;
    });
  };

  // Filter expired notices
  const getExpiredNotices = () => {
    const now = new Date();
    return notices.filter(notice => {
      if (notice.endDate) {
        const endDate = new Date(notice.endDate);
        return endDate < now;
      }
      return false;
    });
  };

  // Get notices based on filter
  const getFilteredNotices = () => {
    switch(selectedFilter) {
      case "active": return getActiveNotices();
      case "upcoming": return getUpcomingNotices();
      case "expired": return getExpiredNotices();
      default: return notices;
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const headers = getAuthHeaders();
      
      if (editingNotice) {
        await axios.put(`${API_URL}/notices/${editingNotice._id}`, formData, headers);
        setMessage({ type: "success", text: "Notice updated successfully!" });
      } else {
        await axios.post(`${API_URL}/notices`, formData, headers);
        setMessage({ type: "success", text: "Notice created successfully!" });
      }
      
      setShowModal(false);
      resetForm();
      fetchNotices();
      
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: error.response?.data?.message || "Operation failed" });
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Delete this notice? This action cannot be undone.")) return;
    
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_URL}/notices/${id}`, headers);
      fetchNotices();
      setMessage({ type: "success", text: "Notice deleted successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Delete failed" });
    }
  };

  // Handle edit
  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      description: notice.description,
      type: notice.type,
      startDate: notice.startDate ? notice.startDate.split('T')[0] : "",
      endDate: notice.endDate ? notice.endDate.split('T')[0] : "",
      isActive: notice.isActive
    });
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "info",
      startDate: "",
      endDate: "",
      isActive: true
    });
    setEditingNotice(null);
  };

  // Get type styles
  const getTypeStyles = (type) => {
    switch(type) {
      case 'info': return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200';
      case 'warning': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200';
      case 'success': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200';
      case 'danger': return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'info': return <Info size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'success': return <CheckCircleIcon size={16} />;
      case 'danger': return <XCircle size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const getBorderColor = (type) => {
    switch(type) {
      case 'info': return 'border-blue-500';
      case 'warning': return 'border-yellow-500';
      case 'success': return 'border-green-500';
      case 'danger': return 'border-red-500';
      default: return 'border-gray-500';
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const activeNotices = getActiveNotices();
  const upcomingNotices = getUpcomingNotices();
  const expiredNotices = getExpiredNotices();
  const filteredNotices = getFilteredNotices();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 border-4 border-pink-500 rounded-full border-b-transparent animate-spin animation-delay-300"></div>
          </div>
          <div className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
            Loading Notices...
          </div>
          <p className="text-gray-400 text-sm mt-2">Fetching announcements</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex justify-between items-start flex-wrap gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                  <Bell size={28} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Notices & Announcements
                </h1>
                <p className="text-gray-500 ml-2">Manage your platform announcements and alerts</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all duration-500 hover:scale-105 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Plus size={22} className="relative z-10" />
            <span className="relative z-10 font-semibold text-lg">Create Notice</span>
            <Sparkles size={18} className="relative z-10 animate-pulse" />
          </button>
        </div>

        {/* MESSAGE */}
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

        {/* STATS CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div 
            onClick={() => setSelectedFilter("all")}
            className={`group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border ${
              selectedFilter === "all" ? "border-purple-500 shadow-purple-100" : "border-white/50"
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Bell size={28} className="text-white" />
                </div>
                <TrendingUp size={20} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Total Notices</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mt-2">{notices.length}</p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-slideIn" style={{ width: `${Math.min((notices.length / 50) * 100, 100)}%` }}></div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setSelectedFilter("active")}
            className={`group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border ${
              selectedFilter === "active" ? "border-green-500 shadow-green-100" : "border-white/50"
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Zap size={28} className="text-white" />
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-gray-500 text-sm font-medium">Active Notices</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{activeNotices.length}</p>
              <p className="text-xs text-gray-400 mt-2">Last 24 hours</p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-slideIn" style={{ width: `${(activeNotices.length / (notices.length || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setSelectedFilter("upcoming")}
            className={`group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border ${
              selectedFilter === "upcoming" ? "border-yellow-500 shadow-yellow-100" : "border-white/50"
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Calendar size={28} className="text-white" />
                </div>
                <Rocket size={20} className="text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Upcoming Notices</p>
              <p className="text-4xl font-bold text-yellow-600 mt-2">{upcomingNotices.length}</p>
              <p className="text-xs text-gray-400 mt-2">Scheduled for future</p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-slideIn" style={{ width: `${(upcomingNotices.length / (notices.length || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setSelectedFilter("expired")}
            className={`group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border ${
              selectedFilter === "expired" ? "border-gray-500 shadow-gray-100" : "border-white/50"
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-500 to-gray-600 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  <Clock size={28} className="text-white" />
                </div>
                <Activity size={20} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Expired Notices</p>
              <p className="text-4xl font-bold text-gray-600 mt-2">{expiredNotices.length}</p>
              <p className="text-xs text-gray-400 mt-2">Past announcements</p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-gray-500 to-gray-600 rounded-full animate-slideIn" style={{ width: `${(expiredNotices.length / (notices.length || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* NOTICES LIST */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
              {selectedFilter === "all" && <Bell size={22} className="text-purple-500" />}
              {selectedFilter === "active" && <Zap size={22} className="text-green-500" />}
              {selectedFilter === "upcoming" && <Calendar size={22} className="text-yellow-500" />}
              {selectedFilter === "expired" && <Clock size={22} className="text-gray-500" />}
              {selectedFilter === "all" && "All Notices"}
              {selectedFilter === "active" && "Active Notices (Last 24 Hours)"}
              {selectedFilter === "upcoming" && "Upcoming Notices"}
              {selectedFilter === "expired" && "Expired Notices"}
            </h2>
            <div className="text-sm text-gray-400">{filteredNotices.length} notices found</div>
          </div>
          
          {filteredNotices.length === 0 ? (
            <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-3xl p-16 text-center border border-white/50 shadow-xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-tr-full"></div>
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <Bell size={56} className="text-gray-300" />
                </div>
                <p className="text-gray-500 text-2xl font-medium">No notices found</p>
                <p className="text-gray-400 mt-2">Click "Create Notice" to add your first announcement</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotices.map((notice, index) => (
                <div
                  key={notice._id}
                  className={`group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border animate-slideUp`}
                  style={{ animationDelay: `${index * 80}ms` }}
                  onMouseEnter={() => setHoveredCard(notice._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-bl-full"></div>
                  <div className={`absolute -inset-px bg-gradient-to-r ${getBorderColor(notice.type)} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur`}></div>
                  <div className={`relative p-6 transition-all duration-500 ${hoveredCard === notice._id ? 'scale-[1.01]' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${getTypeStyles(notice.type)} shadow-md group-hover:scale-110 transition-transform`}>
                          {getTypeIcon(notice.type)}
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{notice.title}</h3>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(notice)}
                          className="p-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 hover:scale-110 shadow-md"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(notice._id)}
                          className="p-2 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:from-red-100 hover:to-rose-100 transition-all duration-300 hover:scale-110 shadow-md"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{notice.description || "No description provided"}</p>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <div className="p-1 bg-gray-100 rounded-lg">
                          <Calendar size={12} className="text-gray-500" />
                        </div>
                        {formatShortDate(notice.createdAt)}
                      </span>
                      {notice.endDate && (
                        <span className="flex items-center gap-1.5">
                          <div className="p-1 bg-gray-100 rounded-lg">
                            <Clock size={12} className="text-gray-500" />
                          </div>
                          Until {formatShortDate(notice.endDate)}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className={`text-xs px-3 py-1.5 rounded-xl ${getTypeStyles(notice.type)} font-medium flex items-center gap-1.5`}>
                        {getTypeIcon(notice.type)}
                        {notice.type.toUpperCase()}
                      </span>
                      {notice.isActive && (
                        <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                          Active
                        </span>
                      )}
                    </div>

                    {/* Premium animated border */}
                    <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${notice.type === 'info' ? 'from-blue-500 to-indigo-500' : notice.type === 'warning' ? 'from-yellow-500 to-orange-500' : notice.type === 'success' ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500'} transition-all duration-700 ${hoveredCard === notice._id ? 'w-full' : 'w-0'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="relative bg-white rounded-3xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn border border-white/50">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-tr-full"></div>
            
            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
                      {editingNotice ? <Edit2 size={24} className="text-white" /> : <Bell size={24} className="text-white" />}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {editingNotice ? "Edit Notice" : "Create Notice"}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {editingNotice ? "Update announcement details" : "Add a new announcement"}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    placeholder="Enter notice title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Enter notice description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notice Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['info', 'warning', 'success', 'danger'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                          formData.type === type
                            ? `bg-gradient-to-r ${
                                type === 'info' ? 'from-blue-600 to-indigo-600' :
                                type === 'warning' ? 'from-yellow-600 to-orange-600' :
                                type === 'success' ? 'from-green-600 to-emerald-600' :
                                'from-red-600 to-rose-600'
                              } text-white shadow-lg scale-105`
                            : `bg-gray-100 text-gray-600 hover:bg-gray-200`
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label className="text-sm text-gray-700">Active (show in notices)</label>
                </div>

                <button
                  type="submit"
                  className="relative group w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 mt-4 shadow-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {editingNotice ? <Edit2 size={18} /> : <Plus size={18} />}
                    {editingNotice ? "Update Notice" : "Create Notice"}
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
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.5s ease-out forwards; opacity: 0; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 1s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-blob { animation: blob 7s infinite; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default AdminNotice;