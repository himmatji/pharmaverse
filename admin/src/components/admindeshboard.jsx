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
  Brain,
  X,
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  Eye,
  Star,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  TrendingUp as TrendingUpIcon,
  Menu
} from "lucide-react";

// ========== ✅ SAHI - EC2 API URL FOR FRONTEND ==========
const EC2_BASE_URL = "http://3.109.121.96:5000";
const LOCAL_BASE_URL = "http://localhost:5000";

const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
const BASE_URL = isProduction ? EC2_BASE_URL : LOCAL_BASE_URL;

console.log(`🌐 AdminDashboard running in ${isProduction ? "PRODUCTION (EC2)" : "DEVELOPMENT (Localhost)"} mode`);
console.log(`📡 API Base URL: ${BASE_URL}`);

const API_URL = `${BASE_URL}/api/admin`;

const AdminDashboard = ({ initialTab = "dashboard", onLogout }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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

  // FORM STATES (same as before)
  const [noteForm, setNoteForm] = useState({
    title: "", description: "", course: "B.Pharm", language: "",
    semester: "", year: "",
    fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: ""
  });

  const [freeVideoForm, setFreeVideoForm] = useState({
    title: "", description: "", course: "B.Pharm",
    semester: "", year: "",
    videoUrl: "", thumbnail: "", isPremium: false
  });

  const [freePaperForm, setFreePaperForm] = useState({
    title: "", description: "", course: "B.Pharm",
    semester: "", year: "", difficulty: "Medium",
    fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: ""
  });

  const [pdfForm, setPdfForm] = useState({
    title: "", description: "", course: "B.Pharm", language: "",
    semester: "", year: "",
    fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: ""
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

  // Close mobile sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    return 0;
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

  // ==================== UPLOAD HANDLERS (same as before) ====================
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
    
    if (noteForm.course === "D.Pharm" && !noteForm.language) {
      alert("Please select language (Hindi or English) for D.Pharm");
      return;
    }
    if (noteForm.course === "D.Pharm" && !noteForm.year) {
      alert("Please select Year for D.Pharm");
      return;
    }
    if (noteForm.course !== "D.Pharm" && !noteForm.semester) {
      alert("Please select Semester");
      return;
    }
    
    setUploading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("No token");
      
      const noteData = {
        title: noteForm.title,
        description: noteForm.description,
        course: noteForm.course,
        fileName: noteForm.fileName,
        fileType: noteForm.fileType,
        fileSize: noteForm.fileSize,
        fileData: noteForm.fileData,
        thumbnail: noteForm.thumbnail,
        semester: "",
        year: "",
        language: noteForm.language || ""
      };
      
      if (noteForm.course === "D.Pharm") {
        noteData.year = noteForm.year;
      } else {
        noteData.semester = noteForm.semester;
      }
      
      await axios.post(`${API_URL}/notes`, noteData, headers);
      setShowModal({ type: null, open: false });
      setNoteForm({ title: "", description: "", course: "B.Pharm", language: "", semester: "", year: "", fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: "" });
      fetchAllData();
      alert("✅ Free PDF uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

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
    
    if (freeVideoForm.course === "D.Pharm" && !freeVideoForm.year) {
      alert("Please select Year for D.Pharm");
      return;
    }
    if (freeVideoForm.course !== "D.Pharm" && !freeVideoForm.semester) {
      alert("Please select Semester");
      return;
    }
    
    setUploading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("No token");
      
      const videoData = {
        title: freeVideoForm.title,
        description: freeVideoForm.description,
        course: freeVideoForm.course,
        videoUrl: freeVideoForm.videoUrl,
        thumbnail: freeVideoForm.thumbnail,
        isPremium: false,
        semester: "",
        year: ""
      };
      
      if (freeVideoForm.course === "D.Pharm") {
        videoData.year = freeVideoForm.year;
      } else {
        videoData.semester = freeVideoForm.semester;
      }
      
      await axios.post(`${API_URL}/videos`, videoData, headers);
      setShowModal({ type: null, open: false });
      setFreeVideoForm({
        title: "", description: "", course: "B.Pharm", semester: "", year: "",
        videoUrl: "", thumbnail: "", isPremium: false
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
    
    if (freePaperForm.course === "D.Pharm") {
      if (!freePaperForm.year) {
        alert("Please select Year for D.Pharm");
        return;
      }
    } else {
      if (!freePaperForm.semester) {
        alert("Please select Semester");
        return;
      }
    }
    
    setUploading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("No token");
      
      const paperData = {
        title: freePaperForm.title,
        description: freePaperForm.description,
        course: freePaperForm.course,
        difficulty: freePaperForm.difficulty,
        isPremium: false,
        fileName: freePaperForm.fileName,
        fileType: freePaperForm.fileType,
        fileSize: freePaperForm.fileSize,
        fileData: freePaperForm.fileData,
        thumbnail: freePaperForm.thumbnail,
        semester: "",
        year: ""
      };
      
      if (freePaperForm.course === "D.Pharm") {
        paperData.year = freePaperForm.year;
      } else {
        paperData.semester = freePaperForm.semester;
      }
      
      await axios.post(`${API_URL}/papers`, paperData, headers);
      setShowModal({ type: null, open: false });
      setFreePaperForm({ 
        title: "", description: "", course: "B.Pharm", semester: "", year: "", 
        difficulty: "Medium", fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: "" 
      });
      fetchAllData();
      alert("✅ Free Paper uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

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
    
    if (pdfForm.course === "D.Pharm") {
      if (!pdfForm.language) {
        alert("Please select language (Hindi or English) for D.Pharm");
        return;
      }
      if (!pdfForm.year) {
        alert("Please select Year for D.Pharm");
        return;
      }
    } else {
      if (!pdfForm.semester) {
        alert("Please select Semester");
        return;
      }
    }
    
    setUploading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("No token");
      
      const pdfData = {
        title: pdfForm.title,
        description: pdfForm.description,
        course: pdfForm.course,
        fileName: pdfForm.fileName,
        fileType: pdfForm.fileType,
        fileSize: pdfForm.fileSize,
        fileData: pdfForm.fileData,
        thumbnail: pdfForm.thumbnail,
        semester: "",
        year: "",
        language: pdfForm.language || ""
      };
      
      if (pdfForm.course === "D.Pharm") {
        pdfData.year = pdfForm.year;
      } else {
        pdfData.semester = pdfForm.semester;
      }
      
      await axios.post(`${API_URL}/paid-pdfs`, pdfData, headers);
      setShowModal({ type: null, open: false });
      setPdfForm({ 
        title: "", description: "", course: "B.Pharm", language: "", semester: "", year: "", 
        fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: "" 
      });
      fetchAllData();
      alert("✅ Paid PDF uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handlePremiumVideoSubmit = async (e) => {
    e.preventDefault();
    
    if (freeVideoForm.course === "D.Pharm" && !freeVideoForm.year) {
      alert("Please select Year for D.Pharm");
      return;
    }
    if (freeVideoForm.course !== "D.Pharm" && !freeVideoForm.semester) {
      alert("Please select Semester");
      return;
    }
    
    setUploading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("No token");
      
      const videoData = {
        title: freeVideoForm.title,
        description: freeVideoForm.description,
        course: freeVideoForm.course,
        videoUrl: freeVideoForm.videoUrl,
        thumbnail: freeVideoForm.thumbnail,
        isPremium: true,
        semester: "",
        year: ""
      };
      
      if (freeVideoForm.course === "D.Pharm") {
        videoData.year = freeVideoForm.year;
      } else {
        videoData.semester = freeVideoForm.semester;
      }
      
      await axios.post(`${API_URL}/videos`, videoData, headers);
      setShowModal({ type: null, open: false });
      setFreeVideoForm({
        title: "", description: "", course: "B.Pharm", semester: "", year: "",
        videoUrl: "", thumbnail: "", isPremium: true
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

  const handlePremiumPaperSubmit = async (e) => {
    e.preventDefault();
    
    if (freePaperForm.course === "D.Pharm") {
      if (!freePaperForm.year) {
        alert("Please select Year for D.Pharm");
        return;
      }
    } else {
      if (!freePaperForm.semester) {
        alert("Please select Semester");
        return;
      }
    }
    
    setUploading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("No token");
      
      const paperData = {
        title: freePaperForm.title,
        description: freePaperForm.description,
        course: freePaperForm.course,
        difficulty: freePaperForm.difficulty,
        isPremium: true,
        fileName: freePaperForm.fileName,
        fileType: freePaperForm.fileType,
        fileSize: freePaperForm.fileSize,
        fileData: freePaperForm.fileData,
        thumbnail: freePaperForm.thumbnail,
        semester: "",
        year: ""
      };
      
      if (freePaperForm.course === "D.Pharm") {
        paperData.year = freePaperForm.year;
      } else {
        paperData.semester = freePaperForm.semester;
      }
      
      await axios.post(`${API_URL}/papers`, paperData, headers);
      setShowModal({ type: null, open: false });
      setFreePaperForm({ 
        title: "", description: "", course: "B.Pharm", semester: "", year: "", 
        difficulty: "Medium", fileName: "", fileType: "", fileSize: "", fileData: "", thumbnail: "" 
      });
      fetchAllData();
      alert("✅ Premium Paper uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

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

  const LanguageSelect = ({ form, setForm, type = "note" }) => {
    if (form.course !== "D.Pharm") return null;
    if (type !== "note" && type !== "paid") return null;
    
    return (
      <select 
        className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" 
        value={form.language} 
        onChange={(e) => {
          if (type === "note") setForm({...form, language: e.target.value});
          else if (type === "paid") setPdfForm({...pdfForm, language: e.target.value});
        }}
        required={form.course === "D.Pharm"}
      >
        <option value="">Select Language *</option>
        <option value="hindi">हिंदी (Hindi)</option>
        <option value="english">English</option>
      </select>
    );
  };

  const DynamicSemesterYearSelect = ({ form, setForm, type = "note" }) => {
    if (form.course === "D.Pharm") {
      return (
        <select 
          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" 
          value={form.year} 
          onChange={(e) => {
            if (type === "note") setForm({...form, year: e.target.value});
            else if (type === "video") setFreeVideoForm({...freeVideoForm, year: e.target.value});
            else if (type === "paper") setFreePaperForm({...freePaperForm, year: e.target.value});
            else if (type === "paid") setPdfForm({...pdfForm, year: e.target.value});
          }}
          required
        >
          <option value="">Select Year *</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
        </select>
      );
    } else if (form.course === "M.Pharm") {
      return (
        <select 
          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" 
          value={form.semester} 
          onChange={(e) => {
            if (type === "note") setForm({...form, semester: e.target.value});
            else if (type === "video") setFreeVideoForm({...freeVideoForm, semester: e.target.value});
            else if (type === "paper") setFreePaperForm({...freePaperForm, semester: e.target.value});
            else if (type === "paid") setPdfForm({...pdfForm, semester: e.target.value});
          }}
          required
        >
          <option value="">Select Semester *</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
          <option value="3">Semester 3</option>
          <option value="4">Semester 4</option>
        </select>
      );
    } else if (form.course === "PhD") {
      return (
        <select 
          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" 
          value={form.semester} 
          onChange={(e) => {
            if (type === "note") setForm({...form, semester: e.target.value});
            else if (type === "video") setFreeVideoForm({...freeVideoForm, semester: e.target.value});
            else if (type === "paper") setFreePaperForm({...freePaperForm, semester: e.target.value});
            else if (type === "paid") setPdfForm({...pdfForm, semester: e.target.value});
          }}
          required
        >
          <option value="">Select Semester *</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
          <option value="3">Semester 3</option>
          <option value="4">Semester 4</option>
          <option value="5">Semester 5</option>
          <option value="6">Semester 6</option>
        </select>
      );
    } else {
      return (
        <select 
          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" 
          value={form.semester} 
          onChange={(e) => {
            if (type === "note") setForm({...form, semester: e.target.value});
            else if (type === "video") setFreeVideoForm({...freeVideoForm, semester: e.target.value});
            else if (type === "paper") setFreePaperForm({...freePaperForm, semester: e.target.value});
            else if (type === "paid") setPdfForm({...pdfForm, semester: e.target.value});
          }}
          required
        >
          <option value="">Select Semester *</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
          <option value="3">Semester 3</option>
          <option value="4">Semester 4</option>
          <option value="5">Semester 5</option>
          <option value="6">Semester 6</option>
          <option value="7">Semester 7</option>
          <option value="8">Semester 8</option>
        </select>
      );
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
      <div className="relative p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={20} className="sm:w-6 sm:h-6" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs sm:text-sm ${trendValue >= 0 ? 'text-green-600' : 'text-red-600'} bg-gray-50 px-1.5 sm:px-2 py-1 rounded-full`}>
              {trendValue >= 0 ? <TrendingUp size={12} className="sm:w-3 sm:h-3" /> : <TrendingDown size={12} className="sm:w-3 sm:h-3" />}
              <span className="font-semibold">{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">{title}</h3>
        <p className="text-xl sm:text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  const EnhancedCard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue, children, onClick }) => (
    <div onClick={onClick} className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
      <div className="relative p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={20} className="sm:w-6 sm:h-6" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs sm:text-sm ${trendValue >= 0 ? 'text-green-600' : 'text-red-600'} bg-gray-50 px-1.5 sm:px-2 py-1 rounded-full`}>
              {trendValue >= 0 ? <TrendingUp size={12} className="sm:w-3 sm:h-3" /> : <TrendingDown size={12} className="sm:w-3 sm:h-3" />}
              <span className="font-semibold">{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">{title}</h3>
        {value && <p className="text-xl sm:text-3xl font-bold text-gray-800">{value}</p>}
        {subtitle && <p className="text-xs sm:text-sm text-gray-400 mt-1">{subtitle}</p>}
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center px-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 border-4 border-purple-600 rounded-full border-b-transparent animate-spin animation-delay-300"></div>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center bg-white rounded-2xl p-6 sm:p-8 shadow-xl max-w-md">
          <div className="text-5xl sm:text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-base sm:text-lg font-semibold mb-2">Error Loading Data</p>
          <p className="text-gray-500 text-sm sm:text-base mb-4">{error}</p>
          <button onClick={fetchAllData} className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm sm:text-base">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <AdminNavbar notes={notes} videos={videos} paidPDFs={paidPDFs} papers={papers} />
      
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar - Responsive */}
      <div className={`
        fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:block
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      </div>

      {/* Overlay for mobile sidebar */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}
      
      {/* Main Content - Responsive margin/padding */}
      <div className="lg:ml-[250px] p-3 sm:p-4 md:p-6 lg:p-8">
        
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="animate-fadeIn">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Dashboard Overview</h2>
              <p className="text-gray-500 text-sm sm:text-base mt-2">Welcome back, {adminName}! Here's your real-time platform analytics</p>
            </div>
            
            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatCard title="Free Materials" value={stats.totalNotes} icon={FileText} color="from-blue-500 to-blue-700" />
              <StatCard title="Paid PDFs" value={stats.totalPaidPDFs} icon={CreditCard} color="from-purple-500 to-purple-700" />
              <StatCard title="Video Lectures" value={stats.totalVideos} icon={Video} color="from-red-500 to-red-700" />
              <StatCard title="Predictive Papers" value={stats.totalPapers} icon={BookOpen} color="from-green-500 to-green-700" />
              <StatCard title="Active Users" value={stats.totalUsers} icon={Users} color="from-orange-500 to-orange-700" />
            </div>
            
            {/* Revenue & Downloads Section - Responsive */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
              <div className="group relative overflow-hidden rounded-2xl transition-all duration-700 hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl border border-gray-100">
                <div className="relative p-4 sm:p-6 md:p-8">
                  <div className="flex items-start justify-between mb-4 sm:mb-6 flex-wrap gap-3">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg sm:rounded-xl"><Wallet size={16} className="sm:w-5 sm:h-5 text-green-600" /></div>
                        <p className="text-green-600 text-xs sm:text-sm font-semibold tracking-wide uppercase">Monthly Revenue</p>
                      </div>
                      <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                        <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 tracking-tight">{formatCurrency(getMonthlyRevenueFromData())}</span>
                        <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${revenueStats.revenueGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {revenueStats.revenueGrowth >= 0 ? <ArrowUpRight size={14} className="sm:w-4 sm:h-4" /> : <ArrowDownRight size={14} className="sm:w-4 sm:h-4" />}
                          <span>{Math.abs(revenueStats.revenueGrowth)}%</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm">vs last month • Real-time analytics</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <TrendingUpIcon size={20} className="sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-2xl transition-all duration-700 hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl border border-gray-100">
                <div className="relative p-4 sm:p-6 md:p-8">
                  <div className="flex items-start justify-between mb-4 sm:mb-6 flex-wrap gap-3">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg sm:rounded-xl"><Download size={16} className="sm:w-5 sm:h-5 text-blue-600" /></div>
                        <p className="text-blue-600 text-xs sm:text-sm font-semibold tracking-wide uppercase">Total Downloads</p>
                      </div>
                      <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                        <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 tracking-tight">{getTotalDownloadsFromData().toLocaleString()}</span>
                        <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${revenueStats.downloadGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {revenueStats.downloadGrowth >= 0 ? <ArrowUpRight size={14} className="sm:w-4 sm:h-4" /> : <ArrowDownRight size={14} className="sm:w-4 sm:h-4" />}
                          <span>{Math.abs(revenueStats.downloadGrowth)}%</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs sm:text-sm">All content types combined</p>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <Download size={20} className="sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Weekly Performance & Recent Activity - Responsive */}
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
              <EnhancedCard title="Weekly Performance" icon={BarChart3} color="from-blue-500 to-cyan-700">
                <div className="mt-4">
                  <div className="flex items-end justify-between h-48 sm:h-56 md:h-64 gap-1 sm:gap-2 md:gap-3">
                    {weeklyData.length > 0 ? (
                      weeklyData.map((day, index) => {
                        const maxViews = Math.max(...weeklyData.map(d => d.views || d.totalViews || 0), 1);
                        const height = Math.min(((day.views || day.totalViews || 0) / maxViews) * 100, 100);
                        return (
                          <div key={day.day || day.name || index} className="flex-1 flex flex-col items-center gap-1 sm:gap-2 group">
                            <div className="relative w-full">
                              <div className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500 group-hover:scale-x-105" style={{ height: `${height}px`, minHeight: '4px' }}>
                                <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{day.views || day.totalViews || 0} views</div>
                              </div>
                            </div>
                            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{day.day || day.name}</span>
                            <span className="text-[8px] sm:text-[10px] text-gray-400">{day.downloads || 0} downloads</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full text-center text-gray-500 py-8 sm:py-12">No data available yet</div>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t">
                    <div className="text-center">
                      <p className="text-lg sm:text-2xl font-bold text-gray-800">{weeklyData.reduce((sum, d) => sum + (d.views || d.totalViews || 0), 0).toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">Total Views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg sm:text-2xl font-bold text-gray-800">{weeklyData.reduce((sum, d) => sum + (d.downloads || 0), 0).toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">Total Downloads</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg sm:text-2xl font-bold text-gray-800">{weeklyData.reduce((sum, d) => sum + (d.revenue || 0), 0).toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">Revenue (₹)</p>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
              
              <EnhancedCard title="Recent Activity" icon={Activity} color="from-green-500 to-teal-700">
                <div className="mt-4 space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto custom-scrollbar">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, idx) => (
                      <div key={idx} className="group flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-300 border-l-4 border-green-500">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText size={14} className="sm:w-[18px] sm:h-[18px] text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-xs sm:text-sm">{activity.message}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">{activity.title}</p>
                          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock size={10} />{formatDate(activity.time)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8 sm:py-12">
                      <Activity size={32} className="sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm sm:text-base">No recent activities</p>
                    </div>
                  )}
                </div>
              </EnhancedCard>
            </div>
            
            {/* Popular Content - Responsive */}
            <div className="grid lg:grid-cols-1 gap-4 sm:gap-6 md:gap-8">
              <EnhancedCard title="Popular Content" icon={Star} color="from-yellow-500 to-amber-700">
                <div className="mt-4 space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-y-auto custom-scrollbar">
                  {popularContent.length > 0 ? (
                    popularContent.map((item, index) => (
                      <div key={item._id} className="group flex items-center p-2 sm:p-3 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 transition-all duration-300 cursor-pointer">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold mr-2 sm:mr-3 text-xs sm:text-sm ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-500'}`}>{index + 1}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors line-clamp-1 text-sm sm:text-base">{item.title}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">{item.course} • {item.views || 0} views</p>
                        </div>
                        <Eye size={14} className="sm:w-4 sm:h-4 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8 sm:py-12">
                      <Star size={32} className="sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm sm:text-base">No popular content yet</p>
                    </div>
                  )}
                </div>
              </EnhancedCard>
            </div>
          </div>
        )}

        {/* FREE MATERIALS TAB */}
        {activeTab === "materials" && (
          <div className="animate-fadeIn">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Free Materials</h2>
              <p className="text-gray-500 text-sm sm:text-base mt-1">Upload PDF, Video, or Paper - Sab FREE hoga students ke liye</p>
            </div>

            {/* Upload Cards - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div onClick={() => setShowModal({ type: "freePdf", open: true })} className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-4 sm:p-6 text-white cursor-pointer hover:scale-105 transition-all duration-500">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center"><FileText size={20} className="sm:w-7 sm:h-7" /></div>
                  <span className="text-xl sm:text-2xl font-bold">{getFilteredNotes().length}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1">Free PDF / Notes</h3>
                <p className="text-blue-100 text-xs sm:text-sm">Upload PDF, DOC, PPT files</p>
                <div className="mt-3 sm:mt-4 flex items-center text-blue-200 text-xs sm:text-sm">Add New →</div>
              </div>
              <div onClick={() => setShowModal({ type: "freeVideo", open: true })} className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-4 sm:p-6 text-white cursor-pointer hover:scale-105 transition-all duration-500">
                <div className="flex items-center justify-between mb-3 sm:mb-4"><div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center"><Video size={20} className="sm:w-7 sm:h-7" /></div><span className="text-xl sm:text-2xl font-bold">{getFilteredVideos().length}</span></div>
                <h3 className="text-lg sm:text-xl font-bold mb-1">Free Videos</h3>
                <p className="text-red-100 text-xs sm:text-sm">Upload YouTube video links (FREE)</p>
                <div className="mt-3 sm:mt-4 flex items-center text-red-200 text-xs sm:text-sm">Add New →</div>
              </div>
              <div onClick={() => setShowModal({ type: "freePaper", open: true })} className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-4 sm:p-6 text-white cursor-pointer hover:scale-105 transition-all duration-500">
                <div className="flex items-center justify-between mb-3 sm:mb-4"><div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center"><Brain size={20} className="sm:w-7 sm:h-7" /></div><span className="text-xl sm:text-2xl font-bold">{getFilteredPapers().length}</span></div>
                <h3 className="text-lg sm:text-xl font-bold mb-1">Free Papers</h3>
                <p className="text-green-100 text-xs sm:text-sm">Upload predictive papers (FREE)</p>
                <div className="mt-3 sm:mt-4 flex items-center text-green-200 text-xs sm:text-sm">Add New →</div>
              </div>
            </div>

            {getFilteredNotes().length === 0 && getFreeVideos().length === 0 && getFreePapers().length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border p-8 sm:p-16 text-center">
                <div className="text-5xl sm:text-7xl mb-4">📭</div>
                <p className="text-gray-500 text-lg sm:text-xl">No free content uploaded yet</p>
                <p className="text-gray-400 text-sm sm:text-base mt-2">Click on any card above to upload</p>
              </div>
            ) : (
              <>
                {getFilteredNotes().length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={20} className="sm:w-6 sm:h-6 text-blue-500" /> Free PDFs & Notes ({getFilteredNotes().length})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {getFilteredNotes().map((note) => (
                        <div key={note._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500">
                          {note.thumbnail && <img src={note.thumbnail} className="w-full h-40 sm:h-48 object-cover" />}
                          <div className="p-4 sm:p-5">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-base sm:text-lg">{note.title}</h4>
                              <button onClick={() => handleDelete(note._id, "note")} className="text-red-500"><X size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                            </div>
                            <div className="flex gap-1.5 sm:gap-2 my-2 flex-wrap">
                              <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">{note.course}</span>
                              {note.semester && <span className="text-[10px] sm:text-xs bg-purple-100 text-purple-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">Sem {note.semester}</span>}
                              {note.year && <span className="text-[10px] sm:text-xs bg-purple-100 text-purple-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">{note.year}</span>}
                              {note.language && <span className="text-[10px] sm:text-xs bg-pink-100 text-pink-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">{note.language === 'hindi' ? 'हिंदी' : 'English'}</span>}
                              <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">Free</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{note.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {getFreeVideos().length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Video size={20} className="sm:w-6 sm:h-6 text-red-500" /> Free Videos ({getFreeVideos().length})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {getFreeVideos().map((video) => (
                        <div key={video._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500">
                          {video.thumbnail && <img src={video.thumbnail} className="w-full h-40 sm:h-48 object-cover" />}
                          <div className="p-4 sm:p-5">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-base sm:text-lg">{video.title}</h4>
                              <button onClick={() => handleDelete(video._id, "video")} className="text-red-500"><X size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                            </div>
                            <div className="flex gap-1.5 sm:gap-2 my-2 flex-wrap">
                              <span className="text-[10px] sm:text-xs bg-red-100 text-red-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">{video.course}</span>
                              {video.semester && <span className="text-[10px] sm:text-xs bg-purple-100 text-purple-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">Sem {video.semester}</span>}
                              {video.year && <span className="text-[10px] sm:text-xs bg-purple-100 text-purple-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">{video.year}</span>}
                              <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">Free</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{video.description}</p>
                            {video.videoUrl && <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="text-red-500 text-xs sm:text-sm mt-2 inline-block">Watch Video →</a>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {getFreePapers().length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Brain size={20} className="sm:w-6 sm:h-6 text-green-500" /> Free Papers ({getFreePapers().length})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {getFreePapers().map((paper) => (
                        <div key={paper._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500">
                          {paper.thumbnail && <img src={paper.thumbnail} className="w-full h-40 sm:h-48 object-cover" />}
                          <div className="p-4 sm:p-5">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-base sm:text-lg">{paper.title}</h4>
                              <button onClick={() => handleDelete(paper._id, "paper")} className="text-red-500"><X size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                            </div>
                            <div className="flex gap-1.5 sm:gap-2 my-2 flex-wrap">
                              <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">{paper.course}</span>
                              {paper.semester && <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">Sem {paper.semester}</span>}
                              {paper.year && <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">{paper.year}</span>}
                              <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${getDifficultyColor(paper.difficulty)}`}>{paper.difficulty}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{paper.description}</p>
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

        {/* PAID PDFs TAB */}
        {activeTab === "paid" && (
          <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-800 to-purple-600 bg-clip-text text-transparent">Paid PDF Materials</h2>
                <p className="text-gray-500 text-sm sm:text-base mt-1">Manage your premium educational content</p>
              </div>
              <button onClick={() => setShowModal({ type: "paidPdf", open: true })} className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base">+ Add Paid PDF</button>
            </div>
            {getFilteredPaidPDFs().length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border p-8 sm:p-16 text-center">
                <div className="text-5xl sm:text-7xl mb-4">💰</div>
                <p className="text-gray-500 text-lg sm:text-xl">No paid PDFs found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {getFilteredPaidPDFs().map((pdf) => (
                  <div key={pdf._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500">
                    {pdf.thumbnail && <img src={pdf.thumbnail} className="w-full h-40 sm:h-56 object-cover" />}
                    <div className="p-4 sm:p-5">
                      <div className="flex justify-between">
                        <h3 className="text-base sm:text-xl font-bold">{pdf.title}</h3>
                        <button onClick={() => handleDelete(pdf._id, "pdf")} className="text-red-500"><X size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2 my-2 flex-wrap">
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 text-[10px] sm:text-xs rounded-full">{pdf.course}</span>
                        {pdf.semester && <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs rounded-full">Semester {pdf.semester}</span>}
                        {pdf.year && <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs rounded-full">{pdf.year}</span>}
                        {pdf.language && <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-pink-100 text-pink-700 text-[10px] sm:text-xs rounded-full">{pdf.language === 'hindi' ? 'हिंदी' : 'English'}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === "videos" && (
          <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent">Premium Video Library</h2>
                <p className="text-gray-500 text-sm sm:text-base mt-1">Manage premium video lectures</p>
              </div>
              <button onClick={() => setShowModal({ type: "premiumVideo", open: true })} className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base">+ Add Premium Video</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {getPremiumVideos().map((video) => (
                <div key={video._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {video.thumbnail && <img src={video.thumbnail} className="w-full h-40 sm:h-48 object-cover" />}
                  <div className="p-4 sm:p-5">
                    <div className="flex justify-between">
                      <h3 className="text-base sm:text-xl font-bold">{video.title}</h3>
                      <button onClick={() => handleDelete(video._id, "video")} className="text-red-500"><X size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2 my-2 flex-wrap">
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-100 text-red-700 text-[10px] sm:text-xs rounded-full">{video.course}</span>
                      {video.semester && <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 text-[10px] sm:text-xs rounded-full">Sem {video.semester}</span>}
                      {video.year && <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 text-[10px] sm:text-xs rounded-full">{video.year}</span>}
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 text-[10px] sm:text-xs rounded-full">Premium</span>
                    </div>
                    {video.videoUrl && <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="text-red-500 text-xs sm:text-sm">Watch Video →</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAPERS TAB */}
        {activeTab === "papers" && (
          <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">Premium Predictive Papers</h2>
                <p className="text-gray-500 text-sm sm:text-base mt-1">Manage premium exam papers</p>
              </div>
              <button onClick={() => setShowModal({ type: "premiumPaper", open: true })} className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm sm:text-base">+ Add Premium Paper</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {getPremiumPapers().map((paper) => (
                <div key={paper._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {paper.thumbnail && <img src={paper.thumbnail} className="w-full h-40 sm:h-48 object-cover" />}
                  <div className="p-4 sm:p-5">
                    <div className="flex justify-between">
                      <h3 className="text-base sm:text-xl font-bold">{paper.title}</h3>
                      <button onClick={() => handleDelete(paper._id, "paper")} className="text-red-500"><X size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                    </div>
                    <div className="flex gap-1.5 sm:gap-2 my-2 flex-wrap">
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 text-[10px] sm:text-xs rounded-full">{paper.course}</span>
                      {paper.semester && <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs rounded-full">Sem {paper.semester}</span>}
                      {paper.year && <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs rounded-full">{paper.year}</span>}
                      <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${getDifficultyColor(paper.difficulty)}`}>{paper.difficulty}</span>
                    </div>
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

      {/* ==================== MODALS (same as before, just responsive) ==================== */}
      
      {/* FREE PDF MODAL */}
      {showModal.type === "freePdf" && showModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><FileText size={20} className="sm:w-6 sm:h-6 text-blue-600" />Upload Free PDF</h3>
              <button onClick={() => setShowModal({ type: null, open: false })}><X size={20} className="sm:w-6 sm:h-6" /></button>
            </div>
            <form onSubmit={handleNoteSubmit} className="space-y-4 sm:space-y-5">
              <input type="text" placeholder="Title *" className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-blue-500 text-sm sm:text-base" value={noteForm.title} onChange={(e) => setNoteForm({...noteForm, title: e.target.value})} required />
              <textarea placeholder="Description" rows="3" className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-blue-500 text-sm sm:text-base" value={noteForm.description} onChange={(e) => setNoteForm({...noteForm, description: e.target.value})} />
              <select className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-blue-500 text-sm sm:text-base" value={noteForm.course} onChange={(e) => setNoteForm({...noteForm, course: e.target.value, semester: "", year: "", language: ""})}>
                <option value="B.Pharm">B.Pharm</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="PhD">PhD</option>
              </select>
              <LanguageSelect form={noteForm} setForm={setNoteForm} type="note" />
              <DynamicSemesterYearSelect form={noteForm} setForm={setNoteForm} type="note" />
              <div className="border-2 border-dashed rounded-xl p-3 sm:p-4 text-center hover:border-blue-500 transition-colors">
                <label className="cursor-pointer text-blue-600 text-sm sm:text-base">
                  <input type="file" accept="image/*" onChange={handleNoteThumbnail} className="hidden" />
                  {noteForm.thumbnail ? <img src={noteForm.thumbnail} className="h-24 sm:h-32 mx-auto rounded" /> : <div>📸 Upload Thumbnail (Optional)</div>}
                </label>
              </div>
              <div className="border-2 border-dashed rounded-xl p-3 sm:p-4 text-center hover:border-blue-500 transition-colors">
                <label className="cursor-pointer text-blue-600 text-sm sm:text-base">
                  <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleNoteFileUpload} className="hidden" required />
                  {noteForm.fileName ? <div>📄 {noteForm.fileName}</div> : <div>📁 Upload PDF/DOC/PPT *</div>}
                </label>
              </div>
              <button type="submit" disabled={uploading} className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base">{uploading ? "Uploading..." : "Upload Free PDF"}</button>
            </form>
          </div>
        </div>
      )}

      {/* FREE VIDEO MODAL */}
      {showModal.type === "freeVideo" && showModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6"><h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><Video size={20} className="sm:w-6 sm:h-6 text-red-600" />Upload Free Video</h3><button onClick={() => setShowModal({ type: null, open: false })}><X size={20} className="sm:w-6 sm:h-6" /></button></div>
            <form onSubmit={handleFreeVideoSubmit} className="space-y-4 sm:space-y-5">
              <input type="text" placeholder="Title *" className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-red-500 text-sm sm:text-base" value={freeVideoForm.title} onChange={(e) => setFreeVideoForm({...freeVideoForm, title: e.target.value})} required />
              <textarea placeholder="Description" rows="3" className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-red-500 text-sm sm:text-base" value={freeVideoForm.description} onChange={(e) => setFreeVideoForm({...freeVideoForm, description: e.target.value})} />
              <select className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-red-500 text-sm sm:text-base" value={freeVideoForm.course} onChange={(e) => setFreeVideoForm({...freeVideoForm, course: e.target.value, semester: "", year: ""})}>
                <option value="B.Pharm">B.Pharm</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="PhD">PhD</option>
              </select>
              <DynamicSemesterYearSelect form={freeVideoForm} setForm={setFreeVideoForm} type="video" />
              <input type="url" placeholder="YouTube Video URL *" className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-red-500 text-sm sm:text-base" value={freeVideoForm.videoUrl} onChange={(e) => setFreeVideoForm({...freeVideoForm, videoUrl: e.target.value})} required />
              <div className="border-2 border-dashed rounded-xl p-3 sm:p-4 text-center hover:border-red-500 transition-colors">
                <label className="cursor-pointer text-red-600 text-sm sm:text-base">
                  <input type="file" accept="image/*" onChange={handleFreeVideoThumbnail} className="hidden" />
                  {freeVideoForm.thumbnail ? <img src={freeVideoForm.thumbnail} className="h-24 sm:h-32 mx-auto rounded" /> : <div>📸 Upload Thumbnail (Optional)</div>}
                </label>
              </div>
              <button type="submit" disabled={uploading} className="w-full bg-red-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base">{uploading ? "Uploading..." : "Upload Free Video"}</button>
            </form>
          </div>
        </div>
      )}

      {/* FREE PAPER MODAL */}
      {showModal.type === "freePaper" && showModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6"><h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><Brain size={20} className="sm:w-6 sm:h-6 text-green-600" />Upload Free Paper</h3><button onClick={() => setShowModal({ type: null, open: false })}><X size={20} className="sm:w-6 sm:h-6" /></button></div>
            <form onSubmit={handleFreePaperSubmit} className="space-y-4 sm:space-y-5">
              <input type="text" placeholder="Title *" className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-green-500 text-sm sm:text-base" value={freePaperForm.title} onChange={(e) => setFreePaperForm({...freePaperForm, title: e.target.value})} required />
              <textarea placeholder="Description" rows="3" className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-green-500 text-sm sm:text-base" value={freePaperForm.description} onChange={(e) => setFreePaperForm({...freePaperForm, description: e.target.value})} />
              <select className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-green-500 text-sm sm:text-base" value={freePaperForm.course} onChange={(e) => setFreePaperForm({...freePaperForm, course: e.target.value, semester: "", year: ""})}>
                <option value="B.Pharm">B.Pharm</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="PhD">PhD</option>
              </select>
              <DynamicSemesterYearSelect form={freePaperForm} setForm={setFreePaperForm} type="paper" />
              <select className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-green-500 text-sm sm:text-base" value={freePaperForm.difficulty} onChange={(e) => setFreePaperForm({...freePaperForm, difficulty: e.target.value})}>
                <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option><option value="Expert">Expert</option>
              </select>
              <div className="border-2 border-dashed rounded-xl p-3 sm:p-4 text-center hover:border-green-500 transition-colors">
                <label className="cursor-pointer text-green-600 text-sm sm:text-base">
                  <input type="file" accept="image/*" onChange={handleFreePaperThumbnail} className="hidden" />
                  {freePaperForm.thumbnail ? <img src={freePaperForm.thumbnail} className="h-24 sm:h-32 mx-auto rounded" /> : <div>📸 Upload Thumbnail (Optional)</div>}
                </label>
              </div>
              <div className="border-2 border-dashed rounded-xl p-3 sm:p-4 text-center hover:border-green-500 transition-colors">
                <label className="cursor-pointer text-green-600 text-sm sm:text-base">
                  <input type="file" accept=".pdf" onChange={handleFreePaperFileUpload} className="hidden" required />
                  {freePaperForm.fileName ? <div>📄 {freePaperForm.fileName}</div> : <div>📁 Upload PDF *</div>}
                </label>
              </div>
              <button type="submit" disabled={uploading} className="w-full bg-green-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base">{uploading ? "Uploading..." : "Upload Free Paper"}</button>
            </form>
          </div>
        </div>
      )}

      {/* PAID PDF MODAL */}
      {showModal.type === "paidPdf" && showModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><CreditCard size={20} className="sm:w-6 sm:h-6 text-purple-600" />Upload Paid PDF</h3>
              <button onClick={() => setShowModal({ type: null, open: false })}><X size={20} className="sm:w-6 sm:h-6" /></button>
            </div>
            <form onSubmit={handlePdfSubmit} className="space-y-4 sm:space-y-5">
              <input type="text" placeholder="Title *" className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-purple-500 text-sm sm:text-base" value={pdfForm.title} onChange={(e) => setPdfForm({...pdfForm, title: e.target.value})} required />
              <textarea placeholder="Description" rows="3" className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-purple-500 text-sm sm:text-base" value={pdfForm.description} onChange={(e) => setPdfForm({...pdfForm, description: e.target.value})} />
              <select className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-purple-500 text-sm sm:text-base" value={pdfForm.course} onChange={(e) => setPdfForm({...pdfForm, course: e.target.value, semester: "", year: "", language: ""})}>
                <option value="B.Pharm">B.Pharm</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="PhD">PhD</option>
              </select>
              <LanguageSelect form={pdfForm} setForm={setPdfForm} type="paid" />
              <DynamicSemesterYearSelect form={pdfForm} setForm={setPdfForm} type="paid" />
              <div className="border-2 border-dashed rounded-xl p-3 sm:p-4 text-center hover:border-purple-500 transition-colors">
                <label className="cursor-pointer text-purple-600 text-sm sm:text-base">
                  <input type="file" accept="image/*" onChange={handlePdfThumbnail} className="hidden" />
                  {pdfForm.thumbnail ? <img src={pdfForm.thumbnail} className="h-24 sm:h-32 mx-auto rounded" /> : <div>📸 Upload Thumbnail (Optional)</div>}
                </label>
              </div>
              <div className="border-2 border-dashed rounded-xl p-3 sm:p-4 text-center hover:border-purple-500 transition-colors">
                <label className="cursor-pointer text-purple-600 text-sm sm:text-base">
                  <input type="file" accept=".pdf" onChange={handlePdfFileUpload} className="hidden" required />
                  {pdfForm.fileName ? <div>📄 {pdfForm.fileName}</div> : <div>📁 Upload PDF *</div>}
                </label>
              </div>
              <button type="submit" disabled={uploading} className="w-full bg-purple-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base">{uploading ? "Uploading..." : "Upload Paid PDF"}</button>
            </form>
          </div>
        </div>
      )}

      {/* PREMIUM VIDEO MODAL */}
      {showModal.type === "premiumVideo" && showModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6"><h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><Video size={20} className="sm:w-6 sm:h-6 text-red-600" />Upload Premium Video</h3><button onClick={() => setShowModal({ type: null, open: false })}><X size={20} className="sm:w-6 sm:h-6" /></button></div>
            <form onSubmit={handlePremiumVideoSubmit} className="space-y-4 sm:space-y-5">
              <input type="text" placeholder="Title *" className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-red-500 text-sm sm:text-base" value={freeVideoForm.title} onChange={(e) => setFreeVideoForm({...freeVideoForm, title: e.target.value})} required />
              <textarea placeholder="Description" rows="3" className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-red-500 text-sm sm:text-base" value={freeVideoForm.description} onChange={(e) => setFreeVideoForm({...freeVideoForm, description: e.target.value})} />
              <select className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-red-500 text-sm sm:text-base" value={freeVideoForm.course} onChange={(e) => setFreeVideoForm({...freeVideoForm, course: e.target.value, semester: "", year: ""})}>
                <option value="B.Pharm">B.Pharm</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="PhD">PhD</option>
              </select>
              <DynamicSemesterYearSelect form={freeVideoForm} setForm={setFreeVideoForm} type="video" />
              <input type="url" placeholder="YouTube Video URL *" className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-red-500 text-sm sm:text-base" value={freeVideoForm.videoUrl} onChange={(e) => setFreeVideoForm({...freeVideoForm, videoUrl: e.target.value})} required />
              <div className="border-2 border-dashed rounded-xl p-3 sm:p-4 text-center hover:border-red-500 transition-colors">
                <label className="cursor-pointer text-red-600 text-sm sm:text-base">
                  <input type="file" accept="image/*" onChange={handleFreeVideoThumbnail} className="hidden" />
                  {freeVideoForm.thumbnail ? <img src={freeVideoForm.thumbnail} className="h-24 sm:h-32 mx-auto rounded" /> : <div>📸 Upload Thumbnail (Optional)</div>}
                </label>
              </div>
              <button type="submit" disabled={uploading} className="w-full bg-red-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base">{uploading ? "Uploading..." : "Upload Premium Video"}</button>
            </form>
          </div>
        </div>
      )}

      {/* PREMIUM PAPER MODAL */}
      {showModal.type === "premiumPaper" && showModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6"><h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><Brain size={20} className="sm:w-6 sm:h-6 text-green-600" />Upload Premium Paper</h3><button onClick={() => setShowModal({ type: null, open: false })}><X size={20} className="sm:w-6 sm:h-6" /></button></div>
            <form onSubmit={handlePremiumPaperSubmit} className="space-y-4 sm:space-y-5">
              <input type="text" placeholder="Title *" className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-green-500 text-sm sm:text-base" value={freePaperForm.title} onChange={(e) => setFreePaperForm({...freePaperForm, title: e.target.value})} required />
              <textarea placeholder="Description" rows="3" className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-green-500 text-sm sm:text-base" value={freePaperForm.description} onChange={(e) => setFreePaperForm({...freePaperForm, description: e.target.value})} />
              <select className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-green-500 text-sm sm:text-base" value={freePaperForm.course} onChange={(e) => setFreePaperForm({...freePaperForm, course: e.target.value, semester: "", year: ""})}>
                <option value="B.Pharm">B.Pharm</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="PhD">PhD</option>
              </select>
              <DynamicSemesterYearSelect form={freePaperForm} setForm={setFreePaperForm} type="paper" />
              <select className="w-full border rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-green-500 text-sm sm:text-base" value={freePaperForm.difficulty} onChange={(e) => setFreePaperForm({...freePaperForm, difficulty: e.target.value})}>
                <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option><option value="Expert">Expert</option>
              </select>
              <div className="border-2 border-dashed rounded-xl p-3 sm:p-4 text-center hover:border-green-500 transition-colors">
                <label className="cursor-pointer text-green-600 text-sm sm:text-base">
                  <input type="file" accept="image/*" onChange={handleFreePaperThumbnail} className="hidden" />
                  {freePaperForm.thumbnail ? <img src={freePaperForm.thumbnail} className="h-24 sm:h-32 mx-auto rounded" /> : <div>📸 Upload Thumbnail (Optional)</div>}
                </label>
              </div>
              <div className="border-2 border-dashed rounded-xl p-3 sm:p-4 text-center hover:border-green-500 transition-colors">
                <label className="cursor-pointer text-green-600 text-sm sm:text-base">
                  <input type="file" accept=".pdf" onChange={handleFreePaperFileUpload} className="hidden" required />
                  {freePaperForm.fileName ? <div>📄 {freePaperForm.fileName}</div> : <div>📁 Upload PDF *</div>}
                </label>
              </div>
              <button type="submit" disabled={uploading} className="w-full bg-green-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base">{uploading ? "Uploading..." : "Upload Premium Paper"}</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        @media (max-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;