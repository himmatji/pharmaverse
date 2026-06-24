import { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./navbar";
import UsersComponent from "./user";
import AdminProfile from "./AdminProfile";
import AdminNotice from "./AdminNotice";
import { 
  FileText, 
  CreditCard, 
  Video, 
  BookOpen, 
  Users, 
  Activity,
  GraduationCap,
  Brain,
  X,
  PlayCircle,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  Eye,
  Star,
  Zap,
  Award,
  BarChart3,
  Sparkles,
  ShoppingCart,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  TrendingUp as TrendingUpIcon
} from "lucide-react";

// ========== ONLY LOCALHOST - NO DYNAMIC URL ==========
const API_URL = "https://api.pharmaverse.co.in/api/admin";

// ========== COURSE CONFIG - SEMESTER/YEAR/LANGUAGE OPTIONS ==========
const COURSE_CONFIG = {
  "B.Pharm": {
    type: "semester",
    options: [
      { value: "1", label: "Semester 1" },
      { value: "2", label: "Semester 2" },
      { value: "3", label: "Semester 3" },
      { value: "4", label: "Semester 4" },
      { value: "5", label: "Semester 5" },
      { value: "6", label: "Semester 6" },
      { value: "7", label: "Semester 7" },
      { value: "8", label: "Semester 8" }
    ],
    showLanguage: false
  },
  "D.Pharm": {
    type: "year",
    options: [
      { value: "1", label: "1st Year" },
      { value: "2", label: "2nd Year" }
    ],
    showLanguage: true,
    languageOptions: [
      { value: "hindi", label: "हिंदी (Hindi)" },
      { value: "english", label: "English" }
    ]
  },
  "M.Pharm": {
    type: "semester",
    options: [
      { value: "1", label: "Semester 1" },
      { value: "2", label: "Semester 2" },
      { value: "3", label: "Semester 3" },
      { value: "4", label: "Semester 4" }
    ],
    showLanguage: false
  },
  "Pharm.D": {
    type: "semester",
    options: [
      { value: "1", label: "Semester 1" },
      { value: "2", label: "Semester 2" },
      { value: "3", label: "Semester 3" },
      { value: "4", label: "Semester 4" },
      { value: "5", label: "Semester 5" },
      { value: "6", label: "Semester 6" },
      { value: "7", label: "Semester 7" },
      { value: "8", label: "Semester 8" }
    ],
    showLanguage: false
  },
  "PhD": {
    type: "semester",
    options: [
      { value: "1", label: "Semester 1" },
      { value: "2", label: "Semester 2" },
      { value: "3", label: "Semester 3" },
      { value: "4", label: "Semester 4" },
      { value: "5", label: "Semester 5" },
      { value: "6", label: "Semester 6" }
    ],
    showLanguage: false
  }
};

const getCourseOptions = (course) => {
  return COURSE_CONFIG[course] || { ...COURSE_CONFIG["B.Pharm"], showLanguage: false };
};

const AdminDashboard = ({ initialTab = "dashboard", onLogout }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalVideos: 0,
    totalUsers: 0,
    totalPaidPDFs: 0,
    totalPapers: 0,
  });
  const [notes, setNotes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [paidPDFs, setPaidPDFs] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState({ type: null, open: false });
  const [uploading, setUploading] = useState(false);

  // FREE PDF FORM
  const [noteForm, setNoteForm] = useState({
    title: "", description: "", course: "B.Pharm",
    semester: "", year: "", language: "",
    fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: ""
  });

  // FREE VIDEO FORM
  const [freeVideoForm, setFreeVideoForm] = useState({
    title: "",
    description: "",
    course: "B.Pharm",
    semester: "", year: "", language: "",
    videoUrl: "",
    thumbnail: "",
    isPremium: false
  });

  // FREE PAPER FORM
  const [freePaperForm, setFreePaperForm] = useState({
    title: "", description: "", course: "B.Pharm", 
    semester: "", year: "", language: "",
    difficulty: "Medium",
    fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: ""
  });

  // PAID PDF FORM - WITHOUT PRICE
  const [pdfForm, setPdfForm] = useState({
    title: "", description: "", course: "B.Pharm", 
    semester: "", year: "", language: "",
    fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: ""
  });

  // PREMIUM VIDEO FORM
  const [premiumVideoForm, setPremiumVideoForm] = useState({
    title: "",
    description: "",
    course: "B.Pharm",
    semester: "", year: "", language: "",
    videoUrl: "",
    thumbnail: "",
    isPremium: true
  });

  // PREMIUM PAPER FORM
  const [premiumPaperForm, setPremiumPaperForm] = useState({
    title: "", description: "", course: "B.Pharm", 
    semester: "", year: "", language: "",
    difficulty: "Medium",
    fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: "", 
    isPremium: true
  });

  const [popularContent, setPopularContent] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [revenueStats, setRevenueStats] = useState({
    monthlyRevenue: 0,
    totalDownloads: 0,
    activeUsers: 0,
    revenueGrowth: 0,
    downloadGrowth: 0
  });
  const [weeklyData, setWeeklyData] = useState([
    { day: "Mon", views: 0, downloads: 0, revenue: 0 },
    { day: "Tue", views: 0, downloads: 0, revenue: 0 },
    { day: "Wed", views: 0, downloads: 0, revenue: 0 },
    { day: "Thu", views: 0, downloads: 0, revenue: 0 },
    { day: "Fri", views: 0, downloads: 0, revenue: 0 },
    { day: "Sat", views: 0, downloads: 0, revenue: 0 },
    { day: "Sun", views: 0, downloads: 0, revenue: 0 }
  ]);

  const currentAdmin = JSON.parse(localStorage.getItem("admin") || "{}");
  const isSuperAdmin = currentAdmin.role === "super_admin";
  const allowedCourses = currentAdmin.permissions?.courses || [];

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (admin) {
      try {
        const adminData = JSON.parse(admin);
        setAdminName(adminData.name || adminData.username || "Admin");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // ==================== FILTER FUNCTIONS ====================
  const getFilteredNotes = () => {
    if (isSuperAdmin) return notes;
    return notes.filter(note => allowedCourses.includes(note.course));
  };

  const getFilteredVideos = () => {
    if (isSuperAdmin) return videos;
    return videos.filter(video => allowedCourses.includes(video.course));
  };

  const getFreeVideos = () => {
    const filtered = isSuperAdmin
      ? videos
      : videos.filter(video => allowedCourses.includes(video.course));
    return filtered.filter(video => video.isPremium === false);
  };

  const getPremiumVideos = () => {
    const filtered = isSuperAdmin
      ? videos
      : videos.filter(video => allowedCourses.includes(video.course));
    return filtered.filter(video => video.isPremium === true);
  };

  const getFilteredPapers = () => {
    if (isSuperAdmin) return papers;
    return papers.filter(paper => allowedCourses.includes(paper.course));
  };

  const getFreePapers = () => {
    const filtered = isSuperAdmin
      ? papers
      : papers.filter(paper => allowedCourses.includes(paper.course));
    return filtered.filter(paper => paper.isPremium === false);
  };

  const getPremiumPapers = () => {
    const filtered = isSuperAdmin
      ? papers
      : papers.filter(paper => allowedCourses.includes(paper.course));
    return filtered.filter(paper => paper.isPremium === true);
  };

  const getFilteredPaidPDFs = () => {
    if (isSuperAdmin) return paidPDFs;
    return paidPDFs.filter(pdf => allowedCourses.includes(pdf.course));
  };

  const getTotalDownloadsFromData = () => {
    let total = 0;
    notes.forEach(note => { total += note.downloadCount || 0; });
    videos.forEach(video => { total += video.downloadCount || 0; });
    paidPDFs.forEach(pdf => { total += pdf.downloadCount || 0; });
    papers.forEach(paper => { total += paper.downloadCount || 0; });
    return total;
  };

  const getMonthlyRevenueFromData = () => {
    return getFilteredPaidPDFs().reduce((sum, pdf) => sum + (pdf.price || 0), 0);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      if (onLogout) onLogout();
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const isTokenValid = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  const fetchAllData = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token || !isTokenValid()) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      if (onLogout) onLogout();
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, notesRes, videosRes, paidRes, papersRes, popularRes, activityRes, revenueRes, weeklyRes] = await Promise.allSettled([
        axios.get(`${API_URL}/stats`, { headers }),
        axios.get(`${API_URL}/notes`, { headers }),
        axios.get(`${API_URL}/videos`, { headers }),
        axios.get(`${API_URL}/paid-pdfs`, { headers }),
        axios.get(`${API_URL}/papers`, { headers }),
        axios.get(`${API_URL}/popular-content`, { headers }),
        axios.get(`${API_URL}/recent-activity`, { headers }),
        axios.get(`${API_URL}/revenue-stats`, { headers }),
        axios.get(`${API_URL}/weekly-performance`, { headers })
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (notesRes.status === "fulfilled") setNotes(notesRes.value.data || []);
      if (videosRes.status === "fulfilled") setVideos(videosRes.value.data || []);
      if (paidRes.status === "fulfilled") setPaidPDFs(paidRes.value.data || []);
      if (papersRes.status === "fulfilled") setPapers(papersRes.value.data || []);
      if (popularRes.status === "fulfilled") setPopularContent(popularRes.value.data.notes || []);
      if (activityRes.status === "fulfilled") setRecentActivities(activityRes.value.data.activities || []);
      if (revenueRes.status === "fulfilled") {
        setRevenueStats({
          monthlyRevenue: revenueRes.value.data.monthlyRevenue || 0,
          totalDownloads: revenueRes.value.data.totalDownloads || 0,
          activeUsers: revenueRes.value.data.activeUsers || 0,
          revenueGrowth: revenueRes.value.data.revenueGrowth || 0,
          downloadGrowth: revenueRes.value.data.downloadGrowth || 0
        });
      }
      if (weeklyRes.status === "fulfilled" && weeklyRes.value.data.data) {
        setWeeklyData(weeklyRes.value.data.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load dashboard data. Please refresh the page.");
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        if (onLogout) onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ========== HELPER: Reset semester/year/language when course changes ==========
  const handleCourseChange = (formType, course) => {
    const resetData = { semester: "", year: "", language: "" };
    
    if (formType === "note") {
      setNoteForm({ ...noteForm, course, ...resetData });
    } else if (formType === "freeVideo") {
      setFreeVideoForm({ ...freeVideoForm, course, ...resetData });
    } else if (formType === "freePaper") {
      setFreePaperForm({ ...freePaperForm, course, ...resetData });
    } else if (formType === "paidPdf") {
      setPdfForm({ ...pdfForm, course, ...resetData });
    } else if (formType === "premiumVideo") {
      setPremiumVideoForm({ ...premiumVideoForm, course, ...resetData });
    } else if (formType === "premiumPaper") {
      setPremiumPaperForm({ ...premiumPaperForm, course, ...resetData });
    }
  };

  // ========== RENDER SEMESTER/YEAR + LANGUAGE DROPDOWNS ==========
  const renderSemesterYearLanguageDropdowns = (formType, formData, setFormData) => {
    const config = getCourseOptions(formData.course);
    const isSemester = config.type === "semester";
    const placeholder = isSemester ? "Select Semester" : "Select Year";
    const fieldName = isSemester ? "semester" : "year";
    
    return (
      <div className="space-y-4">
        <select 
          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData[fieldName] || ""}
          onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value, language: "" })}
        >
          <option value="">{placeholder}</option>
          {config.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {config.showLanguage && (
          <select 
            className="w-full border border-orange-300 rounded-xl px-4 py-3 bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={formData.language || ""}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          >
            <option value="">Select Language (Hindi/English)</option>
            {config.languageOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>
    );
  };

  // ==================== FREE PDF UPLOAD ====================
  const handleNoteFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNoteForm({
          ...noteForm,
          fileName: file.name,
          fileType: file.type,
          fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
          fileData: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNoteThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNoteForm({ ...noteForm, thumbnail: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("No token");
      await axios.post(`${API_URL}/notes`, noteForm, headers);
      setShowModal({ type: null, open: false });
      setNoteForm({ title: "", description: "", course: "B.Pharm", semester: "", year: "", language: "", fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: "" });
      fetchAllData();
      alert("✅ Free PDF uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ==================== FREE VIDEO UPLOAD ====================
  const handleFreeVideoThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFreeVideoForm({ ...freeVideoForm, thumbnail: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFreeVideoSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("No token");
      await axios.post(
        `${API_URL}/videos`,
        {
          ...freeVideoForm,
          isPremium: false,
        },
        headers
      );
      setShowModal({ type: null, open: false });
      setFreeVideoForm({
        title: "",
        description: "",
        course: "B.Pharm",
        semester: "", year: "", language: "",
        videoUrl: "",
        thumbnail: "",
        isPremium: false
      });
      fetchAllData();
      alert("✅ Free Video added successfully!");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ==================== FREE PAPER UPLOAD ====================
  const handleFreePaperFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFreePaperForm({
          ...freePaperForm,
          fileName: file.name,
          fileType: file.type,
          fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
          fileData: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFreePaperThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFreePaperForm({ ...freePaperForm, thumbnail: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFreePaperSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("No token");
      await axios.post(
        `${API_URL}/papers`,
        {
          ...freePaperForm,
          isPremium: false,
        },
        headers
      );
      setShowModal({ type: null, open: false });
      setFreePaperForm({ title: "", description: "", course: "B.Pharm", semester: "", year: "", language: "", difficulty: "Medium", fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: "" });
      fetchAllData();
      alert("✅ Free Paper uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ==================== PAID PDF UPLOAD - WITHOUT PRICE ====================
  const handlePdfFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPdfForm({
          ...pdfForm,
          fileName: file.name,
          fileType: file.type,
          fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
          fileData: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPdfForm({ ...pdfForm, thumbnail: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("No token");
      await axios.post(`${API_URL}/paid-pdfs`, pdfForm, headers);
      setShowModal({ type: null, open: false });
      setPdfForm({ title: "", description: "", course: "B.Pharm", semester: "", year: "", language: "", fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: "" });
      fetchAllData();
      alert("✅ Paid PDF uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ==================== PREMIUM VIDEO UPLOAD ====================
  const handlePremiumVideoThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPremiumVideoForm({ ...premiumVideoForm, thumbnail: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePremiumVideoSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("No token");
      await axios.post(
        `${API_URL}/videos`,
        {
          ...premiumVideoForm,
          isPremium: true,
        },
        headers
      );
      setShowModal({ type: null, open: false });
      setPremiumVideoForm({
        title: "",
        description: "",
        course: "B.Pharm",
        semester: "", year: "", language: "",
        videoUrl: "",
        thumbnail: "",
        isPremium: true
      });
      fetchAllData();
      alert("✅ Premium Video added successfully!");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ==================== PREMIUM PAPER UPLOAD ====================
  const handlePremiumPaperFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPremiumPaperForm({
          ...premiumPaperForm,
          fileName: file.name,
          fileType: file.type,
          fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
          fileData: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePremiumPaperThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPremiumPaperForm({ ...premiumPaperForm, thumbnail: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePremiumPaperSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("No token");
      await axios.post(
        `${API_URL}/papers`,
        {
          ...premiumPaperForm,
          isPremium: true,
        },
        headers
      );
      setShowModal({ type: null, open: false });
      setPremiumPaperForm({ title: "", description: "", course: "B.Pharm", semester: "", year: "", language: "", difficulty: "Medium", fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: "", isPremium: true });
      fetchAllData();
      alert("✅ Premium Paper uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ==================== DELETE ====================
  const handleDelete = async (id, type) => {
    if (window.confirm("Delete this item?")) {
      try {
        const headers = getAuthHeaders();
        if (!headers) throw new Error("No token");
        let url = "";
        if (type === "note") url = `${API_URL}/notes/${id}`;
        else if (type === "video") url = `${API_URL}/videos/${id}`;
        else if (type === "pdf") url = `${API_URL}/paid-pdfs/${id}`;
        else if (type === "paper") url = `${API_URL}/papers/${id}`;
        await axios.delete(url, headers);
        fetchAllData();
        alert("Deleted successfully!");
      } catch (error) {
        console.error(error);
        alert("Delete failed");
      }
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    if (hours < 48) return 'Yesterday';
    return `${Math.floor(hours / 24)} days ago`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-orange-100 text-orange-700';
      case 'Expert': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trendValue >= 0 ? 'text-green-600' : 'text-red-600'} bg-gray-50 px-2 py-1 rounded-full`}>
              {trendValue >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="font-semibold">{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );

  const EnhancedCard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue, children, onClick }) => (
    <div onClick={onClick} className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trendValue >= 0 ? 'text-green-600' : 'text-red-600'} bg-gray-50 px-2 py-1 rounded-full`}>
              {trendValue >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="font-semibold">{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        {value && <p className="text-3xl font-bold text-gray-800">{value}</p>}
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        {children}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 border-4 border-purple-600 rounded-full border-b-transparent animate-spin animation-delay-300"></div>
          </div>
          <p className="text-xl text-gray-600 animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg font-semibold mb-2">Error Loading Data</p>
          <p className="text-gray-500 mb-4">{error}</p>
          <button onClick={fetchAllData} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <AdminNavbar notes={notes} videos={videos} paidPDFs={paidPDFs} papers={papers} />
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      <div className="ml-[250px] p-8 mt-16">
        
        {/* ==================== DASHBOARD TAB ==================== */}
        {activeTab === "dashboard" && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Dashboard Overview</h2>
              <p className="text-gray-500 mt-2">Welcome back, {adminName}! Here's your real-time platform analytics</p>
            </div>
            <div className="grid md:grid-cols-5 gap-6 mb-8">
              <StatCard title="Free Materials" value={stats.totalNotes} icon={FileText} color="from-blue-500 to-blue-700" />
              <StatCard title="Paid PDFs" value={stats.totalPaidPDFs} icon={CreditCard} color="from-purple-500 to-purple-700" />
              <StatCard title="Video Lectures" value={stats.totalVideos} icon={Video} color="from-red-500 to-red-700" />
              <StatCard title="Predictive Papers" value={stats.totalPapers} icon={BookOpen} color="from-green-500 to-green-700" />
              <StatCard title="Active Users" value={stats.totalUsers} icon={Users} color="from-orange-500 to-orange-700" />
            </div>
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="group relative overflow-hidden rounded-3xl transition-all duration-700 hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl border border-gray-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100 to-emerald-50 rounded-bl-full opacity-60"></div>
                <div className="relative p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2"><div className="p-2 bg-green-100 rounded-xl"><Wallet size={20} className="text-green-600" /></div><p className="text-green-600 text-sm font-semibold tracking-wide uppercase">Monthly Revenue</p></div>
                      <div className="flex items-baseline gap-3 flex-wrap"><span className="text-5xl md:text-6xl font-bold text-gray-800 tracking-tight">{formatCurrency(getMonthlyRevenueFromData())}</span><div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${revenueStats.revenueGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{revenueStats.revenueGrowth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}<span>{Math.abs(revenueStats.revenueGrowth)}%</span></div></div>
                      <p className="text-gray-400 text-sm">vs last month • Real-time analytics</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500"><TrendingUpIcon size={28} className="text-white" /></div>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100"><div className="flex items-center gap-2 text-gray-400 text-sm"><RefreshCw size={14} className="animate-spin-slow" /><span>Live Updates</span></div><div className="w-2/3 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-slideIn" style={{ width: `${Math.min((getMonthlyRevenueFromData() / 100000) * 100, 100)}%` }}></div></div></div>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-3xl transition-all duration-700 hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl border border-gray-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-bl-full opacity-60"></div>
                <div className="relative p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="space-y-3"><div className="flex items-center gap-2"><div className="p-2 bg-blue-100 rounded-xl"><Download size={20} className="text-blue-600" /></div><p className="text-blue-600 text-sm font-semibold tracking-wide uppercase">Total Downloads</p></div><div className="flex items-baseline gap-3 flex-wrap"><span className="text-5xl md:text-6xl font-bold text-gray-800 tracking-tight">{getTotalDownloadsFromData().toLocaleString()}</span><div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${revenueStats.downloadGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{revenueStats.downloadGrowth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}<span>{Math.abs(revenueStats.downloadGrowth)}%</span></div></div><p className="text-gray-400 text-sm">All content types combined</p></div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500"><Download size={28} className="text-white" /></div>
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100"><div className="flex items-center gap-2 text-gray-400 text-sm"><RefreshCw size={14} className="animate-spin-slow" /><span>Live Updates</span></div><div className="w-2/3 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 animate-slideIn" style={{ width: `${Math.min((getTotalDownloadsFromData() / 5000) * 100, 100)}%` }}></div></div></div>
                </div>
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <EnhancedCard title="Weekly Performance" icon={BarChart3} color="from-blue-500 to-cyan-700">
                <div className="mt-4"><div className="flex items-end justify-between h-64 gap-3">{weeklyData.length > 0 ? (weeklyData.map((day, index) => { const maxViews = Math.max(...weeklyData.map(d => d.views || d.totalViews || 0), 1); const height = Math.min(((day.views || day.totalViews || 0) / maxViews) * 100, 100); return (<div key={day.day || day.name || index} className="flex-1 flex flex-col items-center gap-2 group"><div className="relative w-full"><div className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500 group-hover:scale-x-105" style={{ height: `${height}px`, minHeight: '4px' }}><div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{day.views || day.totalViews || 0} views</div></div></div><span className="text-xs text-gray-500 font-medium">{day.day || day.name}</span><span className="text-[10px] text-gray-400">{day.downloads || 0} downloads</span></div>); })) : (<div className="w-full text-center text-gray-500 py-12">No data available yet</div>)}</div><div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t"><div className="text-center"><p className="text-2xl font-bold text-gray-800">{weeklyData.reduce((sum, d) => sum + (d.views || d.totalViews || 0), 0).toLocaleString()}</p><p className="text-xs text-gray-400">Total Views</p></div><div className="text-center"><p className="text-2xl font-bold text-gray-800">{weeklyData.reduce((sum, d) => sum + (d.downloads || 0), 0).toLocaleString()}</p><p className="text-xs text-gray-400">Total Downloads</p></div><div className="text-center"><p className="text-2xl font-bold text-gray-800">{weeklyData.reduce((sum, d) => sum + (d.revenue || 0), 0).toLocaleString()}</p><p className="text-xs text-gray-400">Revenue (₹)</p></div></div></div>
              </EnhancedCard>
              <EnhancedCard title="Recent Activity" icon={Activity} color="from-green-500 to-teal-700">
                <div className="mt-4 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">{recentActivities.length > 0 ? (recentActivities.map((activity, idx) => (<div key={idx} className="group flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-300 border-l-4 border-green-500"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform"><FileText size={18} className="text-green-600" /></div><div className="flex-1"><p className="font-medium text-gray-800 text-sm">{activity.message}</p><p className="text-xs text-gray-500 line-clamp-1">{activity.title}</p><p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={10} />{formatDate(activity.time)}</p></div></div>))) : (<div className="text-center text-gray-500 py-12"><Activity size={48} className="mx-auto mb-3 text-gray-300" /><p>No recent activities</p></div>)}</div>
              </EnhancedCard>
            </div>
            <div className="grid lg:grid-cols-1 gap-8">
              <EnhancedCard title="Popular Content" icon={Star} color="from-yellow-500 to-amber-700">
                <div className="mt-4 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">{popularContent.length > 0 ? (popularContent.map((item, index) => (<div key={item._id} className="group flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 transition-all duration-300 cursor-pointer"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-500'}`}>{index + 1}</div><div className="flex-1"><p className="font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors line-clamp-1">{item.title}</p><p className="text-xs text-gray-500">{item.course} • {item.views || 0} views</p></div><Eye size={16} className="text-gray-400 group-hover:text-yellow-500 transition-colors" /></div>))) : (<div className="text-center text-gray-500 py-12"><Star size={48} className="mx-auto mb-3 text-gray-300" /><p>No popular content yet</p></div>)}</div>
              </EnhancedCard>
            </div>
          </div>
        )}

        {/* ==================== FREE MATERIALS TAB ==================== */}
        {activeTab === "materials" && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Free Materials</h2>
              <p className="text-gray-500 mt-1">Upload PDF, Video, or Paper - Sab FREE hoga students ke liye</p>
            </div>

            {/* 3 Upload Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div onClick={() => setShowModal({ type: "freePdf", open: true })} className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-all duration-500">
                <div className="flex items-center justify-between mb-4"><div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center"><FileText size={28} /></div><span className="text-2xl font-bold">{getFilteredNotes().length}</span></div>
                <h3 className="text-xl font-bold mb-1">Free PDF / Notes</h3>
                <p className="text-blue-100 text-sm">Upload PDF, DOC, PPT files</p>
                <div className="mt-4 flex items-center text-blue-200 text-sm">Add New →</div>
              </div>
              <div onClick={() => setShowModal({ type: "freeVideo", open: true })} className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-all duration-500">
                <div className="flex items-center justify-between mb-4"><div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center"><Video size={28} /></div><span className="text-2xl font-bold">{getFilteredVideos().length}</span></div>
                <h3 className="text-xl font-bold mb-1">Free Videos</h3>
                <p className="text-red-100 text-sm">Upload YouTube video links (FREE)</p>
                <div className="mt-4 flex items-center text-red-200 text-sm">Add New →</div>
              </div>
              <div onClick={() => setShowModal({ type: "freePaper", open: true })} className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-all duration-500">
                <div className="flex items-center justify-between mb-4"><div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center"><Brain size={28} /></div><span className="text-2xl font-bold">{getFilteredPapers().length}</span></div>
                <h3 className="text-xl font-bold mb-1">Free Papers</h3>
                <p className="text-green-100 text-sm">Upload predictive papers (FREE)</p>
                <div className="mt-4 flex items-center text-green-200 text-sm">Add New →</div>
              </div>
            </div>

            {/* SHOW ALL FREE CONTENT */}
            {(getFilteredNotes().length === 0 && getFreeVideos().length === 0 && getFreePapers().length === 0) ? (
              <div className="bg-white rounded-2xl shadow-lg border p-16 text-center">
                <div className="text-7xl mb-4">📭</div>
                <p className="text-gray-500 text-xl">No free content uploaded yet</p>
                <p className="text-gray-400 mt-2">Click on any card above to upload</p>
              </div>
            ) : (
              <>
                {/* Free PDFs */}
                {getFilteredNotes().length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={24} className="text-blue-500" /> Free PDFs & Notes ({getFilteredNotes().length})</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getFilteredNotes().map((note) => (
                        <div key={note._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500">
                          {note.thumbnail && <img src={note.thumbnail} className="w-full h-48 object-cover" />}
                          <div className="p-5">
                            <div className="flex justify-between items-start"><h4 className="font-bold text-lg">{note.title}</h4><button onClick={() => handleDelete(note._id, "note")} className="text-red-500"><X size={18} /></button></div>
                            <div className="flex gap-2 my-2 flex-wrap"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{note.course}</span>{note.semester && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Sem {note.semester}</span>}{note.year && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Year {note.year}</span>}{note.language && <span className={`text-xs px-2 py-1 rounded-full ${note.language === 'hindi' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{note.language === 'hindi' ? 'हिंदी' : 'English'}</span>}<span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Free</span></div>
                            <p className="text-sm text-gray-500 line-clamp-2">{note.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Free Videos */}
                {getFreeVideos().length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Video size={24} className="text-red-500" /> Free Videos ({getFreeVideos().length})</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getFreeVideos().map((video) => (
                        <div key={video._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500">
                          {video.thumbnail && <img src={video.thumbnail} className="w-full h-48 object-cover" />}
                          <div className="p-5">
                            <div className="flex justify-between items-start"><h4 className="font-bold text-lg">{video.title}</h4><button onClick={() => handleDelete(video._id, "video")} className="text-red-500"><X size={18} /></button></div>
                            <div className="flex gap-2 my-2 flex-wrap"><span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{video.course}</span>{video.semester && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Sem {video.semester}</span>}{video.year && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Year {video.year}</span>}{video.language && <span className={`text-xs px-2 py-1 rounded-full ${video.language === 'hindi' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{video.language === 'hindi' ? 'हिंदी' : 'English'}</span>}<span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Free</span></div>
                            <p className="text-sm text-gray-500 line-clamp-2">{video.description}</p>
                            {video.videoUrl && <a href={video.videoUrl} target="_blank" className="text-red-500 text-sm mt-2 inline-block">Watch Video →</a>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Free Papers */}
                {getFreePapers().length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Brain size={24} className="text-green-500" /> Free Papers ({getFreePapers().length})</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getFreePapers().map((paper) => (
                        <div key={paper._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500">
                          {paper.thumbnail && <img src={paper.thumbnail} className="w-full h-48 object-cover" />}
                          <div className="p-5">
                            <div className="flex justify-between items-start"><h4 className="font-bold text-lg">{paper.title}</h4><button onClick={() => handleDelete(paper._id, "paper")} className="text-red-500"><X size={18} /></button></div>
                            <div className="flex gap-2 my-2 flex-wrap"><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{paper.course}</span>{paper.semester && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Sem {paper.semester}</span>}{paper.year && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Year {paper.year}</span>}{paper.language && <span className={`text-xs px-2 py-1 rounded-full ${paper.language === 'hindi' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{paper.language === 'hindi' ? 'हिंदी' : 'English'}</span>}<span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(paper.difficulty)}`}>{paper.difficulty}</span></div>
                            <p className="text-sm text-gray-500 line-clamp-2">{paper.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ==================== PAID PDFs TAB ==================== */}
        {activeTab === "paid" && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
              <div><h2 className="text-4xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent">Paid PDF Materials</h2><p className="text-gray-500 mt-1">Manage your premium educational content</p></div>
              <button onClick={() => setShowModal({ type: "paidPdf", open: true })} className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2">+ Add Paid PDF</button>
            </div>
            {getFilteredPaidPDFs().length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border p-16 text-center"><div className="text-7xl mb-4">💰</div><p className="text-gray-500 text-xl">No paid PDFs found</p></div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getFilteredPaidPDFs().map((pdf) => (
                  <div key={pdf._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500">
                    {pdf.thumbnail && <img src={pdf.thumbnail} className="w-full h-56 object-cover" />}
                    <div className="p-5">
                      <div className="flex justify-between"><h3 className="text-xl font-bold">{pdf.title}</h3><button onClick={() => handleDelete(pdf._id, "pdf")} className="text-red-500"><X size={18} /></button></div>
                      <div className="flex gap-2 my-2 flex-wrap"><span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">{pdf.course}</span>{pdf.semester && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Sem {pdf.semester}</span>}{pdf.year && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Year {pdf.year}</span>}{pdf.language && <span className={`text-xs px-2 py-1 rounded-full ${pdf.language === 'hindi' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{pdf.language === 'hindi' ? 'हिंदी' : 'English'}</span>}</div>
                      <div className="mt-3 text-green-600 font-bold">₹{pdf.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== VIDEOS TAB (PREMIUM) ==================== */}
        {activeTab === "videos" && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
              <div><h2 className="text-4xl font-bold bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent">Premium Video Library</h2><p className="text-gray-500 mt-1">Manage premium video lectures</p></div>
              <button onClick={() => setShowModal({ type: "premiumVideo", open: true })} className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2">+ Add Premium Video</button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getPremiumVideos().map((video) => (
                <div key={video._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {video.thumbnail && <img src={video.thumbnail} className="w-full h-48 object-cover" />}
                  <div className="p-5">
                    <div className="flex justify-between"><h3 className="text-xl font-bold">{video.title}</h3><button onClick={() => handleDelete(video._id, "video")} className="text-red-500"><X size={18} /></button></div>
                    <div className="flex gap-2 my-2 flex-wrap"><span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">{video.course}</span>{video.semester && <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Sem {video.semester}</span>}{video.year && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Year {video.year}</span>}{video.language && <span className={`text-xs px-2 py-1 rounded-full ${video.language === 'hindi' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{video.language === 'hindi' ? 'हिंदी' : 'English'}</span>}<span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Premium</span></div>
                    {video.videoUrl && <a href={video.videoUrl} target="_blank" className="text-red-500 text-sm">Watch Video →</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== PAPERS TAB (PREMIUM) ==================== */}
        {activeTab === "papers" && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
              <div><h2 className="text-4xl font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">Premium Predictive Papers</h2><p className="text-gray-500 mt-1">Manage premium exam papers</p></div>
              <button onClick={() => setShowModal({ type: "premiumPaper", open: true })} className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2">+ Add Premium Paper</button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getPremiumPapers().map((paper) => (
                <div key={paper._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {paper.thumbnail && <img src={paper.thumbnail} className="w-full h-48 object-cover" />}
                  <div className="p-5">
                    <div className="flex justify-between"><h3 className="text-xl font-bold">{paper.title}</h3><button onClick={() => handleDelete(paper._id, "paper")} className="text-red-500"><X size={18} /></button></div>
                    <div className="flex gap-2 my-2 flex-wrap"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{paper.course}</span>{paper.semester && <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Sem {paper.semester}</span>}{paper.year && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Year {paper.year}</span>}{paper.language && <span className={`text-xs px-2 py-1 rounded-full ${paper.language === 'hindi' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{paper.language === 'hindi' ? 'हिंदी' : 'English'}</span>}<span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(paper.difficulty)}`}>{paper.difficulty}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "users" && <UsersComponent />}
        {activeTab === "profile" && <AdminProfile />}
        {activeTab === "notice" && <AdminNotice />}
      </div>

      {/* ==================== MODALS ==================== */}

      {/* FREE PDF MODAL */}
      {showModal.type === "freePdf" && showModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-bold flex items-center gap-2"><FileText size={24} className="text-blue-600" />Upload Free PDF</h3><button onClick={() => setShowModal({ type: null, open: false })}><X size={24} /></button></div>
            <form onSubmit={handleNoteSubmit} className="space-y-5">
              <input type="text" placeholder="Title *" className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={noteForm.title} onChange={(e) => setNoteForm({...noteForm, title: e.target.value})} required />
              <textarea placeholder="Description" rows="3" className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={noteForm.description} onChange={(e) => setNoteForm({...noteForm, description: e.target.value})}></textarea>
              <select className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={noteForm.course} onChange={(e) => handleCourseChange("note", e.target.value)}>
                <option value="B.Pharm">B.Pharm</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="PhD">PhD</option>
              </select>
              
              {renderSemesterYearLanguageDropdowns("note", noteForm, setNoteForm)}

              <div className="border-2 border-dashed rounded-xl p-4 text-center"><label className="cursor-pointer text-blue-600"><input type="file" accept="image/*" onChange={handleNoteThumbnail} className="hidden" />{noteForm.thumbnail ? <img src={noteForm.thumbnail} className="h-32 mx-auto rounded" /> : <div>📸 Upload Thumbnail</div>}</label></div>
              <div className="border-2 border-dashed rounded-xl p-4 text-center"><label className="cursor-pointer text-blue-600"><input type="file" onChange={handleNoteFileUpload} className="hidden" />{noteForm.fileName ? <div>📄 {noteForm.fileName}</div> : <div>📁 Upload PDF/DOC/PPT</div>}</label></div>
              <button type="submit" disabled={uploading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">{uploading ? "Uploading..." : "Upload Free PDF"}</button>
            </form>
          </div>
        </div>
      )}

      {/* FREE VIDEO MODAL */}
      {showModal.type === "freeVideo" && showModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-bold flex items-center gap-2"><Video size={24} className="text-red-600" />Upload Free Video</h3><button onClick={() => setShowModal({ type: null, open: false })}><X size={24} /></button></div>
            <form onSubmit={handleFreeVideoSubmit} className="space-y-5">
              <input type="text" placeholder="Title *" className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" value={freeVideoForm.title} onChange={(e) => setFreeVideoForm({...freeVideoForm, title: e.target.value})} required />
              <textarea placeholder="Description" rows="3" className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" value={freeVideoForm.description} onChange={(e) => setFreeVideoForm({...freeVideoForm, description: e.target.value})}></textarea>
              <select className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" value={freeVideoForm.course} onChange={(e) => handleCourseChange("freeVideo", e.target.value)}>
                <option value="B.Pharm">B.Pharm</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="PhD">PhD</option>
              </select>
              
              {renderSemesterYearLanguageDropdowns("freeVideo", freeVideoForm, setFreeVideoForm)}

              <input type="url" placeholder="YouTube Video URL *" className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" value={freeVideoForm.videoUrl} onChange={(e) => setFreeVideoForm({...freeVideoForm, videoUrl: e.target.value})} required />
              <div className="border-2 border-dashed rounded-xl p-4 text-center"><label className="cursor-pointer text-red-600"><input type="file" accept="image/*" onChange={handleFreeVideoThumbnail} className="hidden" />{freeVideoForm.thumbnail ? <img src={freeVideoForm.thumbnail} className="h-32 mx-auto rounded" /> : <div>📸 Upload Thumbnail</div>}</label></div>
              <button type="submit" disabled={uploading} className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition">{uploading ? "Uploading..." : "Upload Free Video"}</button>
            </form>
          </div>
        </div>
      )}

      {/* FREE PAPER MODAL */}
      {showModal.type === "freePaper" && showModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-bold flex items-center gap-2"><Brain size={24} className="text-green-600" />Upload Free Paper</h3><button onClick={() => setShowModal({ type: null, open: false })}><X size={24} /></button></div>
            <form onSubmit={handleFreePaperSubmit} className="space-y-5">
              <input type="text" placeholder="Title *" className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" value={freePaperForm.title} onChange={(e) => setFreePaperForm({...freePaperForm, title: e.target.value})} required />
              <textarea placeholder="Description" rows="3" className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" value={freePaperForm.description} onChange={(e) => setFreePaperForm({...freePaperForm, description: e.target.value})}></textarea>
              <select className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" value={freePaperForm.course} onChange={(e) => handleCourseChange("freePaper", e.target.value)}>
                <option value="B.Pharm">B.Pharm</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="PhD">PhD</option>
              </select>
              
              {renderSemesterYearLanguageDropdowns("freePaper", freePaperForm, setFreePaperForm)}

              <select className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" value={freePaperForm.difficulty} onChange={(e) => setFreePaperForm({...freePaperForm, difficulty: e.target.value})}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
              <div className="border-2 border-dashed rounded-xl p-4 text-center"><label className="cursor-pointer text-green-600"><input type="file" accept="image/*" onChange={handleFreePaperThumbnail} className="hidden" />{freePaperForm.thumbnail ? <img src={freePaperForm.thumbnail} className="h-32 mx-auto rounded" /> : <div>📸 Upload Thumbnail</div>}</label></div>
              <div className="border-2 border-dashed rounded-xl p-4 text-center"><label className="cursor-pointer text-green-600"><input type="file" onChange={handleFreePaperFileUpload} className="hidden" />{freePaperForm.fileName ? <div>📄 {freePaperForm.fileName}</div> : <div>📁 Upload PDF</div>}</label></div>
              <button type="submit" disabled={uploading} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">{uploading ? "Uploading..." : "Upload Free Paper"}</button>
            </form>
          </div>
        </div>
      )}

      {/* PAID PDF MODAL - WITHOUT PRICE FIELD */}
      {showModal.type === "paidPdf" && showModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-bold flex items-center gap-2"><CreditCard size={24} className="text-purple-600" />Upload Paid PDF</h3><button onClick={() => setShowModal({ type: null, open: false })}><X size={24} /></button></div>
            <form onSubmit={handlePdfSubmit} className="space-y-5">
              <input type="text" placeholder="Title *" className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" value={pdfForm.title} onChange={(e) => setPdfForm({...pdfForm, title: e.target.value})} required />
              <textarea placeholder="Description" rows="3" className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" value={pdfForm.description} onChange={(e) => setPdfForm({...pdfForm, description: e.target.value})}></textarea>
              <select className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" value={pdfForm.course} onChange={(e) => handleCourseChange("paidPdf", e.target.value)}>
                <option value="B.Pharm">B.Pharm</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="PhD">PhD</option>
              </select>
              
              {renderSemesterYearLanguageDropdowns("paidPdf", pdfForm, setPdfForm)}

              {/* ❌ PRICE FIELD REMOVED ❌ */}
              
              <div className="border-2 border-dashed rounded-xl p-4 text-center"><label className="cursor-pointer text-purple-600"><input type="file" accept="image/*" onChange={handlePdfThumbnail} className="hidden" />{pdfForm.thumbnail ? <img src={pdfForm.thumbnail} className="h-32 mx-auto rounded" /> : <div>📸 Upload Thumbnail</div>}</label></div>
              <div className="border-2 border-dashed rounded-xl p-4 text-center"><label className="cursor-pointer text-purple-600"><input type="file" onChange={handlePdfFileUpload} className="hidden" />{pdfForm.fileName ? <div>📄 {pdfForm.fileName}</div> : <div>📁 Upload PDF</div>}</label></div>
              <button type="submit" disabled={uploading} className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition">{uploading ? "Uploading..." : "Upload Paid PDF"}</button>
            </form>
          </div>
        </div>
      )}

      {/* PREMIUM VIDEO MODAL */}
      {showModal.type === "premiumVideo" && showModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-bold flex items-center gap-2"><Video size={24} className="text-red-600" />Upload Premium Video</h3><button onClick={() => setShowModal({ type: null, open: false })}><X size={24} /></button></div>
            <form onSubmit={handlePremiumVideoSubmit} className="space-y-5">
              <input type="text" placeholder="Title *" className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" value={premiumVideoForm.title} onChange={(e) => setPremiumVideoForm({...premiumVideoForm, title: e.target.value})} required />
              <textarea placeholder="Description" rows="3" className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" value={premiumVideoForm.description} onChange={(e) => setPremiumVideoForm({...premiumVideoForm, description: e.target.value})}></textarea>
              <select className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" value={premiumVideoForm.course} onChange={(e) => handleCourseChange("premiumVideo", e.target.value)}>
                <option value="B.Pharm">B.Pharm</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="PhD">PhD</option>
              </select>
              
              {renderSemesterYearLanguageDropdowns("premiumVideo", premiumVideoForm, setPremiumVideoForm)}

              <input type="url" placeholder="YouTube Video URL *" className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" value={premiumVideoForm.videoUrl} onChange={(e) => setPremiumVideoForm({...premiumVideoForm, videoUrl: e.target.value})} required />
              <div className="border-2 border-dashed rounded-xl p-4 text-center"><label className="cursor-pointer text-red-600"><input type="file" accept="image/*" onChange={handlePremiumVideoThumbnail} className="hidden" />{premiumVideoForm.thumbnail ? <img src={premiumVideoForm.thumbnail} className="h-32 mx-auto rounded" /> : <div>📸 Upload Thumbnail</div>}</label></div>
              <button type="submit" disabled={uploading} className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition">{uploading ? "Uploading..." : "Upload Premium Video"}</button>
            </form>
          </div>
        </div>
      )}

      {/* PREMIUM PAPER MODAL */}
      {showModal.type === "premiumPaper" && showModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-bold flex items-center gap-2"><Brain size={24} className="text-green-600" />Upload Premium Paper</h3><button onClick={() => setShowModal({ type: null, open: false })}><X size={24} /></button></div>
            <form onSubmit={handlePremiumPaperSubmit} className="space-y-5">
              <input type="text" placeholder="Title *" className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" value={premiumPaperForm.title} onChange={(e) => setPremiumPaperForm({...premiumPaperForm, title: e.target.value})} required />
              <textarea placeholder="Description" rows="3" className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" value={premiumPaperForm.description} onChange={(e) => setPremiumPaperForm({...premiumPaperForm, description: e.target.value})}></textarea>
              <select className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" value={premiumPaperForm.course} onChange={(e) => handleCourseChange("premiumPaper", e.target.value)}>
                <option value="B.Pharm">B.Pharm</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="PhD">PhD</option>
              </select>
              
              {renderSemesterYearLanguageDropdowns("premiumPaper", premiumPaperForm, setPremiumPaperForm)}

              <select className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500" value={premiumPaperForm.difficulty} onChange={(e) => setPremiumPaperForm({...premiumPaperForm, difficulty: e.target.value})}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
              </select>
              <div className="border-2 border-dashed rounded-xl p-4 text-center"><label className="cursor-pointer text-green-600"><input type="file" accept="image/*" onChange={handlePremiumPaperThumbnail} className="hidden" />{premiumPaperForm.thumbnail ? <img src={premiumPaperForm.thumbnail} className="h-32 mx-auto rounded" /> : <div>📸 Upload Thumbnail</div>}</label></div>
              <div className="border-2 border-dashed rounded-xl p-4 text-center"><label className="cursor-pointer text-green-600"><input type="file" onChange={handlePremiumPaperFileUpload} className="hidden" />{premiumPaperForm.fileName ? <div>📄 {premiumPaperForm.fileName}</div> : <div>📁 Upload PDF</div>}</label></div>
              <button type="submit" disabled={uploading} className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition">{uploading ? "Uploading..." : "Upload Premium Paper"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;