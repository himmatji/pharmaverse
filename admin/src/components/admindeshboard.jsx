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
  TrendingUp as TrendingUpIcon,
  Edit,
  Save,
  Upload,
  Plus,
  Trash2,
  Layers,
  CheckCircle,
  ArrowRight,
  Trash,
  Pencil
} from "lucide-react";

const API_URL = "https://api.pharmaverse.co.in/api/admin";

// ========== COURSE CONFIG ==========
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

// ========== B.PHARM SUBJECTS ==========
const BPHARM_SUBJECTS = {
  1: [
    "Basics of Python Programming for Pharmaceutical Sciences",
    "General Pharmacy",
    "Healthcare Psychology and Communication Skills",
    "Human Anatomy, Physiology and Pathophysiology I",
    "Introduction to Pharmacognosy",
    "Pharmaceutical Inorganic and Analytical Chemistry"
  ],
  2: [
    "Applied Biostatistics and Data Analytics for Pharmaceutical Sciences",
    "Biochemistry",
    "Human Anatomy, Physiology and Pathophysiology II",
    "Pharmaceutical Organic Chemistry",
    "Pharmacognosy and Phytochemistry",
    "Physical Pharmaceutics"
  ],
  3: [
    "Introduction to Machine Learning in Pharmaceutical Sciences",
    "Environmental Sciences",
    "Ethics and Universal Human Values",
    "General Pharmacology",
    "Heterocyclic Compounds and Stereochemistry",
    "Pharmaceutical Dosage Forms I",
    "Pharmaceutical Engineering",
    "Pharmaceutical Microbiology"
  ],
  4: [
    "Herbal Drug Technology",
    "Medicinal Chemistry",
    "Pharmaceutical Biotechnology",
    "Social Pharmacy and Public Health",
    "Systemic Pharmacology I"
  ],
  5: [
    "Biomedicinal Chemistry",
    "Industrial Pharmacognosy",
    "Innovation and Startup Ecosystem",
    "Pharmaceutical Dosage Form II",
    "Pharmaceutical Quality Assurance",
    "Systemic Pharmacology II"
  ],
  6: [
    "Advanced Pharmacognosy",
    "Biopharmaceutics and Pharmacokinetics",
    "Intellectual Property Rights",
    "AI Applications in Pharmaceutical Sciences",
    "Pharmaceutical Analysis",
    "Pharmaceutical Jurisprudence",
    "Green Chemistry",
    "Materiovigilance and Hemovigilance",
    "Scientific Writing",
    "Drug Store and Business Management",
    "Career Building in Cultivation of Medicinal Plants",
    "Active Pharmaceutical Ingredients"
  ],
  7: [
    "Biostatistics Research Methodology",
    "Cosmetics and Cosmeceuticals",
    "AI in Clinical Applications",
    "Modern Analytical Techniques",
    "Pharmacovigilance",
    "Pharmacy Practice",
    "Regulatory Affairs",
    "Current Good Manufacturing Practices (cGMP)",
    "Pharmaceutical Automation",
    "Modern Techniques in Cellular Biology",
    "Medical Devices",
    "Transformation of Food Waste into Medicinal Products",
    "Biosimilars, Vaccines & Macromolecules"
  ],
  8: [
    "Ethical Considerations and Translational Applications of AI in Pharmacy",
    "Clinical Pharmacotherapeutics",
    "Industrial Pharmacy and Facility Design",
    "Pharmaceutical Management",
    "Sterile Dosage Forms and Novel Drug Delivery System",
    "Pharmaceutical Packaging",
    "Supply Chain Management",
    "Industrial Safety and Waste Management",
    "Traditional Healing Practices of India",
    "Futuristic Pharma through AR/VR: Pharma 4.0",
    "Herbal Cosmetics for Industry Perspective"
  ]
};

const getCourseOptions = (course) => {
  return COURSE_CONFIG[course] || { ...COURSE_CONFIG["B.Pharm"], showLanguage: false };
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;

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

  // ========== COURSE PRICES STATE ==========
  const [coursePrices, setCoursePrices] = useState({
    "B.Pharm": { price: 99, discount: 0 },
    "D.Pharm": { price: 79, discount: 0 },
    "M.Pharm": { price: 149, discount: 0 },
    "Pharm.D": { price: 129, discount: 0 },
    "PhD": { price: 199, discount: 0 }
  });
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [savingPrices, setSavingPrices] = useState(false);

  // ========== UPLOAD FORM STATE ==========
  const [uploadForm, setUploadForm] = useState({
    branch: "B.Pharm",
    category: "",
    semester: "",
    subject: "",
    unit: "",
    units: [{ id: 1, name: "Unit 1", topics: [""] }],
    title: "",
    description: "",
    file: null,
    isPremium: false,
    type: "note"
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  // ========== CATEGORIES ==========
  const categories = [
    { id: "Notes", icon: <BookOpen size={18} />, color: "from-blue-500 to-indigo-500", bg: "from-blue-50 to-indigo-50" },
    { id: "Exam Crash Course", icon: <Zap size={18} />, color: "from-orange-500 to-amber-500", bg: "from-orange-50 to-amber-50" },
    { id: "PYQs", icon: <Brain size={18} />, color: "from-rose-500 to-pink-500", bg: "from-rose-50 to-pink-50" }
  ];

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

  const getFilteredNotes = () => {
    if (isSuperAdmin) return notes;
    return notes.filter(note => allowedCourses.includes(note.course));
  };

  const getFilteredVideos = () => {
    if (isSuperAdmin) return videos;
    return videos.filter(video => allowedCourses.includes(video.course));
  };

  const getFreeVideos = () => {
    const filtered = isSuperAdmin ? videos : videos.filter(video => allowedCourses.includes(video.course));
    return filtered.filter(video => video.isPremium === false);
  };

  const getPremiumVideos = () => {
    const filtered = isSuperAdmin ? videos : videos.filter(video => allowedCourses.includes(video.course));
    return filtered.filter(video => video.isPremium === true);
  };

  const getFilteredPapers = () => {
    if (isSuperAdmin) return papers;
    return papers.filter(paper => allowedCourses.includes(paper.course));
  };

  const getFreePapers = () => {
    const filtered = isSuperAdmin ? papers : papers.filter(paper => allowedCourses.includes(paper.course));
    return filtered.filter(paper => paper.isPremium === false);
  };

  const getPremiumPapers = () => {
    const filtered = isSuperAdmin ? papers : papers.filter(paper => allowedCourses.includes(paper.course));
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

  // ========== DISCOUNT FUNCTIONS ==========
  const getDiscountedPrice = (price, discount) => {
    if (discount > 0) {
      const discounted = price - (price * discount / 100);
      return parseFloat(discounted.toFixed(2));
    }
    return parseFloat(price.toFixed(2));
  };

  const getDiscountDisplay = (price, discount) => {
    const discounted = getDiscountedPrice(price, discount);
    if (discount > 0) {
      return {
        original: price,
        discounted: discounted,
        display: `₹${discounted.toFixed(2)}`,
        badge: `${discount}% OFF`
      };
    }
    return {
      original: price,
      discounted: price,
      display: `₹${price.toFixed(2)}`,
      badge: null
    };
  };

  // ========== FETCH DATA ==========
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
      const [statsRes, notesRes, videosRes, paidRes, papersRes, popularRes, activityRes, revenueRes, weeklyRes, pricesRes] = await Promise.allSettled([
        axios.get(`${API_URL}/stats`, { headers }),
        axios.get(`${API_URL}/notes`, { headers }),
        axios.get(`${API_URL}/videos`, { headers }),
        axios.get(`${API_URL}/paid-pdfs`, { headers }),
        axios.get(`${API_URL}/papers`, { headers }),
        axios.get(`${API_URL}/popular-content`, { headers }),
        axios.get(`${API_URL}/recent-activity`, { headers }),
        axios.get(`${API_URL}/revenue-stats`, { headers }),
        axios.get(`${API_URL}/weekly-performance`, { headers }),
        axios.get(`${API_URL}/course-prices`, { headers })
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
          monthlyRevenue: revenueRes.value.data.totalRevenue || 0,
          totalDownloads: revenueRes.value.data.totalDownloads || 0,
          activeUsers: revenueRes.value.data.activeUsers || 0,
          revenueGrowth: revenueRes.value.data.revenueGrowth || 0,
          downloadGrowth: revenueRes.value.data.downloadGrowth || 0
        });
      }
      if (weeklyRes.status === "fulfilled" && weeklyRes.value.data.data) {
        setWeeklyData(weeklyRes.value.data.data);
      }
      if (pricesRes.status === "fulfilled" && pricesRes.value.data) {
        setCoursePrices(pricesRes.value.data);
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

  // ========== SAVE COURSE PRICES ==========
  const handleSaveCoursePrices = async () => {
    for (const [course, data] of Object.entries(coursePrices)) {
      if (data.price < 0) {
        alert(`${course} price cannot be negative`);
        return;
      }
      if (data.discount < 0 || data.discount > 100) {
        alert(`${course} discount must be between 0 and 100`);
        return;
      }
    }

    setSavingPrices(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) throw new Error("No token");
      await axios.put(`${API_URL}/course-prices`, { prices: coursePrices }, headers);
      alert("✅ Course prices updated successfully!");
      setShowPriceModal(false);
      fetchAllData();
    } catch (error) {
      alert("❌ Failed to update prices: " + (error.response?.data?.message || error.message));
    } finally {
      setSavingPrices(false);
    }
  };

  const resetToDefault = () => {
    if (window.confirm("Reset all prices to default values?")) {
      const defaultPrices = {
        "B.Pharm": { price: 99, discount: 0 },
        "D.Pharm": { price: 79, discount: 0 },
        "M.Pharm": { price: 149, discount: 0 },
        "Pharm.D": { price: 129, discount: 0 },
        "PhD": { price: 199, discount: 0 }
      };
      setCoursePrices(defaultPrices);
    }
  };

  // ========== COMPRESS IMAGE ==========
  const compressImage = (file, maxWidth = 400, maxHeight = 400) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ========== UPLOAD FORM HANDLERS ==========
  const handleUploadChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleUploadFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File size exceeds 50MB limit.`);
        e.target.value = '';
        return;
      }
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUnitChange = (index, field, value) => {
    const updatedUnits = [...uploadForm.units];
    updatedUnits[index][field] = value;
    setUploadForm(prev => ({ ...prev, units: updatedUnits }));
  };

  const handleTopicChange = (unitIndex, topicIndex, value) => {
    const updatedUnits = [...uploadForm.units];
    updatedUnits[unitIndex].topics[topicIndex] = value;
    setUploadForm(prev => ({ ...prev, units: updatedUnits }));
  };

  const addUnit = () => {
    const newId = uploadForm.units.length + 1;
    setUploadForm(prev => ({
      ...prev,
      units: [...prev.units, { id: newId, name: `Unit ${newId}`, topics: [""] }]
    }));
  };

  const removeUnit = (index) => {
    if (uploadForm.units.length <= 1) {
      alert("At least one unit is required");
      return;
    }
    const updatedUnits = uploadForm.units.filter((_, i) => i !== index);
    setUploadForm(prev => ({ ...prev, units: updatedUnits }));
  };

  const addTopic = (unitIndex) => {
    const updatedUnits = [...uploadForm.units];
    updatedUnits[unitIndex].topics.push("");
    setUploadForm(prev => ({ ...prev, units: updatedUnits }));
  };

  const removeTopic = (unitIndex, topicIndex) => {
    const updatedUnits = [...uploadForm.units];
    if (updatedUnits[unitIndex].topics.length <= 1) {
      alert("At least one topic is required");
      return;
    }
    updatedUnits[unitIndex].topics.splice(topicIndex, 1);
    setUploadForm(prev => ({ ...prev, units: updatedUnits }));
  };

  const getSubjectsForSemester = () => {
    if (!uploadForm.semester) return [];
    return BPHARM_SUBJECTS[uploadForm.semester] || [];
  };

  const getBranchName = () => {
    if (!activeTab?.startsWith("branch-")) return "B.Pharm";
    const branchId = activeTab.replace("branch-", "");
    const branchNames = {
      bpharm: "B.Pharm",
      dpharm: "D.Pharm",
      mpharm: "M.Pharm",
      phd: "PhD",
      pharmd: "Pharm.D"
    };
    return branchNames[branchId] || "B.Pharm";
  };

  // ========== DELETE CONTENT ==========
  const handleDeleteContent = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Please login first");
        return;
      }

      let url;
      if (type === "note") url = `${API_URL}/notes/${id}`;
      else if (type === "video") url = `${API_URL}/videos/${id}`;
      else if (type === "paper") url = `${API_URL}/papers/${id}`;
      else {
        alert("Invalid content type");
        return;
      }

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("✅ Content deleted successfully!");
      fetchAllData(); // Refresh data

    } catch (error) {
      alert("❌ Failed to delete: " + (error.response?.data?.message || error.message));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.category) {
      alert("Please select a category");
      return;
    }
    if (!uploadForm.semester) {
      alert("Please select a semester");
      return;
    }
    if (!uploadForm.subject) {
      alert("Please select a subject");
      return;
    }
    if (!uploadForm.file) {
      alert("Please select a file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Please login first");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("branch", getBranchName());
      formData.append("category", uploadForm.category);
      formData.append("semester", uploadForm.semester);
      formData.append("subject", uploadForm.subject);
      formData.append("unit", uploadForm.unit || 1);
      formData.append("units", JSON.stringify(uploadForm.units));
      formData.append("title", uploadForm.title || `${uploadForm.subject} - ${uploadForm.category}`);
      formData.append("description", uploadForm.description || `${uploadForm.category} for ${uploadForm.subject}`);
      formData.append("isPremium", uploadForm.isPremium);
      formData.append("type", uploadForm.type);
      formData.append("file", uploadForm.file);

      const response = await axios.post(
        `${API_URL}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      if (response.data.success) {
        alert("✅ Upload successful!");
        setUploadForm({
          branch: getBranchName(),
          category: "",
          semester: "",
          subject: "",
          unit: "",
          units: [{ id: 1, name: "Unit 1", topics: [""] }],
          title: "",
          description: "",
          file: null,
          isPremium: false,
          type: "note"
        });
        setUploadProgress(0);
        document.getElementById("upload-file-input").value = "";
        fetchAllData();
      } else {
        alert("❌ " + (response.data.message || "Upload failed"));
      }
    } catch (error) {
      alert("❌ Upload failed: " + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
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

  const isBranchTab = () => {
    return activeTab?.startsWith("branch-");
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  const EnhancedCard = ({ title, icon: Icon, color, children }) => (
    <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );

  const CoursePriceCard = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 rounded-xl">
            <DollarSign size={24} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Premium Course Prices</h3>
            <p className="text-gray-500 text-sm">Set prices & discounts for each course</p>
          </div>
        </div>
        <button
          onClick={() => setShowPriceModal(true)}
          className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all duration-300 flex items-center gap-2 text-sm"
        >
          <Edit size={16} /> Manage Prices
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Object.entries(coursePrices).map(([course, data]) => {
          const discountInfo = getDiscountDisplay(data.price, data.discount);
          return (
            <div key={course} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
              <p className="font-semibold text-gray-700 text-sm">{course}</p>
              <p className="text-2xl font-bold text-gray-900">{discountInfo.display}</p>
              {discountInfo.badge && (
                <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {discountInfo.badge}
                </span>
              )}
              {!discountInfo.badge && (
                <span className="inline-block mt-1 text-xs text-gray-400">No Discount</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ========== RENDER UPLOAD TAB (Branch Click) ==========
  const renderUploadTab = () => {
    const subjects = getSubjectsForSemester();
    const branchName = getBranchName();

    // Filter content for this branch
    const branchContent = notes.filter(n => n.branch === branchName || n.course === branchName);

    return (
      <div className="animate-fadeIn">
        <div className="mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-3xl sm:text-4xl font-['Space_Grotesk'] font-extrabold text-gray-900">
              <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">{branchName}</span>
            </h2>
            <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 font-['Inter'] font-bold text-sm rounded-full border border-emerald-200">
              {branchContent.length} Items
            </span>
          </div>
          <p className="text-gray-500 font-['Inter'] text-sm mt-2">Upload and manage content for {branchName}</p>
        </div>

        {/* ========== UPLOAD FORM ========== */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-blue-50">
            <h3 className="text-xl font-['Space_Grotesk'] font-bold text-gray-800 flex items-center gap-2">
              <Upload size={20} className="text-sky-600" />
              Upload New Content
            </h3>
          </div>
          <div className="p-6 sm:p-8">
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-6 bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex justify-between text-sm font-['Inter'] text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-6">
              {/* Branch - Auto filled */}
              <div>
                <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">
                  Branch <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
                  <GraduationCap className="text-sky-600" size={20} />
                  <span className="font-['Inter'] font-medium text-gray-800">{branchName}</span>
                  <span className="text-xs text-gray-400 ml-auto">(Selected)</span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setUploadForm(prev => ({ ...prev, category: cat.id }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 font-['Inter'] ${
                        uploadForm.category === cat.id
                          ? `border-sky-500 bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                          : "border-gray-200 hover:border-sky-300 hover:bg-sky-50 text-gray-700"
                      }`}
                    >
                      <span className={uploadForm.category === cat.id ? "text-white" : "text-gray-500"}>
                        {cat.icon}
                      </span>
                      <span className="font-medium text-sm">{cat.id}</span>
                      {uploadForm.category === cat.id && <CheckCircle size={16} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => setUploadForm(prev => ({ ...prev, semester: sem, subject: "" }))}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 font-['Inter'] font-semibold text-sm ${
                        uploadForm.semester === sem
                          ? "border-sky-500 bg-sky-500 text-white shadow-lg scale-105"
                          : "border-gray-200 hover:border-sky-300 hover:bg-sky-50 text-gray-700"
                      }`}
                    >
                      {sem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                {uploadForm.semester ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
                    {subjects.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => setUploadForm(prev => ({ ...prev, subject }))}
                        className={`p-3 rounded-xl border-2 transition-all duration-300 text-left font-['Inter'] text-sm ${
                          uploadForm.subject === subject
                            ? "border-purple-500 bg-purple-500 text-white shadow-lg scale-105"
                            : "border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} />
                          <span className="truncate">{subject}</span>
                          {uploadForm.subject === subject && <CheckCircle size={14} className="ml-auto" />}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 rounded-xl text-gray-500 font-['Inter'] text-sm text-center">
                    Please select a semester first
                  </div>
                )}
              </div>

              {/* Units */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-['Inter'] font-semibold text-gray-700">
                    Units & Topics <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addUnit}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-['Inter'] text-sm font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    <Plus size={16} /> Add Unit
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {uploadForm.units.map((unit, unitIndex) => (
                    <div key={unitIndex} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="text"
                          value={unit.name}
                          onChange={(e) => handleUnitChange(unitIndex, "name", e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none font-['Inter'] text-sm transition-all"
                          placeholder="Unit name (e.g. Unit 1)"
                        />
                        <button
                          type="button"
                          onClick={() => removeUnit(unitIndex)}
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-['Inter'] font-medium text-gray-500">Topics</span>
                          <button
                            type="button"
                            onClick={() => addTopic(unitIndex)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-['Inter'] font-semibold flex items-center gap-1"
                          >
                            <Plus size={14} /> Add Topic
                          </button>
                        </div>
                        {unit.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={topic}
                              onChange={(e) => handleTopicChange(unitIndex, topicIndex, e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none font-['Inter'] text-sm transition-all"
                              placeholder={`Topic ${topicIndex + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeTopic(unitIndex, topicIndex)}
                              className="p-1 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={uploadForm.title}
                    onChange={handleUploadChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none font-['Inter'] text-sm transition-all"
                    placeholder="Enter title (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={uploadForm.description}
                    onChange={handleUploadChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none font-['Inter'] text-sm transition-all"
                    placeholder="Enter description (optional)"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">
                  Upload File <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="upload-file-input"
                    type="file"
                    onChange={handleUploadFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                  />
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-sky-400 transition-all duration-300 bg-gray-50/50">
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="font-['Inter'] text-sm text-gray-600">
                      {uploadForm.file ? (
                        <span className="text-emerald-600 font-semibold">{uploadForm.file.name}</span>
                      ) : (
                        <>
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 font-['Inter'] mt-1">
                      PDF, DOC, PPT, XLS, TXT (Max 50MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Premium Toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPremium"
                    checked={uploadForm.isPremium}
                    onChange={handleUploadChange}
                    className="w-5 h-5 rounded border-gray-300 text-sky-600 focus:ring-sky-400 focus:ring-2 cursor-pointer"
                  />
                  <span className="font-['Inter'] text-sm text-gray-700">
                    Mark as Premium Content
                    <span className="text-xs text-gray-400 block">Students will need to purchase to access</span>
                  </span>
                </label>
              </div>

              {/* File Type */}
              <div>
                <label className="block text-sm font-['Inter'] font-semibold text-gray-700 mb-2">File Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {["note", "video", "paper"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUploadForm(prev => ({ ...prev, type }))}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 font-['Inter'] font-medium text-sm capitalize ${
                        uploadForm.type === type
                          ? "border-sky-500 bg-sky-500 text-white shadow-lg"
                          : "border-gray-200 hover:border-sky-300 hover:bg-sky-50 text-gray-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-4 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white rounded-2xl font-['Inter'] font-bold text-lg shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Upload Content
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ========== UPLOADED CONTENT LIST ========== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-['Space_Grotesk'] font-bold text-gray-800 flex items-center gap-2">
              <FileText size={20} className="text-emerald-600" />
              Uploaded Content ({branchContent.length})
            </h3>
            <button
              onClick={() => fetchAllData()}
              className="text-sm text-sky-600 hover:text-sky-700 font-['Inter'] font-medium flex items-center gap-1"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {branchContent.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg font-['Inter']">No content uploaded yet for {branchName}</p>
              <p className="text-gray-400 text-sm mt-1">Upload your first content using the form above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {branchContent.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-['Space_Grotesk'] font-bold text-gray-800 truncate">{item.title}</h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{item.category}</span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Sem {item.semester}</span>
                          {item.isPremium && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Premium</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-['Inter']">Subject: {item.subject}</p>
                        {item.units && item.units.length > 0 && (
                          <p className="text-xs text-gray-400 font-['Inter'] mt-1">
                            {item.units.length} unit{item.units.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <button
                          onClick={() => handleDeleteContent(item._id, "note")}
                          className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-['Inter']">
                        📄 {item.fileName} • {item.fileSize}
                      </p>
                      <p className="text-xs text-gray-400 font-['Inter'] mt-1">
                        📅 {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`h-1 w-full bg-gradient-to-r ${item.isPremium ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-teal-500'}`}></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

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
      <AdminNavbar />
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      
      <div className="lg:ml-[250px] p-4 sm:p-6 md:p-8 mt-16 min-h-[calc(100vh-64px)]">
        
        {/* ========== DASHBOARD ========== */}
        {activeTab === "dashboard" && (
          <div className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Dashboard Overview</h2>
              <p className="text-gray-500 mt-2">Welcome, {adminName}! Here's your real-time platform analytics</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
              <StatCard title="Free Materials" value={stats.totalNotes} icon={FileText} color="from-blue-500 to-blue-700" />
              <StatCard title="Paid PDFs" value={stats.totalPaidPDFs} icon={CreditCard} color="from-purple-500 to-purple-700" />
              <StatCard title="Video Lectures" value={stats.totalVideos} icon={Video} color="from-red-500 to-red-700" />
              <StatCard title="Predictive Papers" value={stats.totalPapers} icon={BookOpen} color="from-green-500 to-green-700" />
              <StatCard title="Active Users" value={stats.totalUsers} icon={Users} color="from-orange-500 to-orange-700" />
            </div>

            <div className="mb-8">
              <CoursePriceCard />
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-xl"><Wallet size={24} className="text-green-600" /></div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Monthly Revenue</p>
                      <p className="text-3xl font-bold text-gray-800">{formatCurrency(revenueStats.monthlyRevenue)}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${revenueStats.revenueGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {revenueStats.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueStats.revenueGrowth)}%
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: `${Math.min((revenueStats.monthlyRevenue / 100000) * 100, 100)}%` }}></div>
                </div>
                <p className="text-gray-400 text-sm mt-2">vs last month • Real-time analytics</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl"><Download size={24} className="text-blue-600" /></div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">Total Downloads</p>
                      <p className="text-3xl font-bold text-gray-800">{getTotalDownloadsFromData().toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${revenueStats.downloadGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {revenueStats.downloadGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueStats.downloadGrowth)}%
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" style={{ width: `${Math.min((getTotalDownloadsFromData() / 5000) * 100, 100)}%` }}></div>
                </div>
                <p className="text-gray-400 text-sm mt-2">All content types combined</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <EnhancedCard title="Weekly Performance" icon={BarChart3} color="from-blue-500 to-cyan-700">
                <div className="mt-2">
                  <div className="flex items-end justify-between h-48 gap-2">
                    {weeklyData.length > 0 ? (
                      weeklyData.map((day, index) => {
                        const maxViews = Math.max(...weeklyData.map(d => d.views || d.totalViews || 0), 1);
                        const height = Math.min(((day.views || day.totalViews || 0) / maxViews) * 100, 100);
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="relative w-full">
                              <div className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-500" style={{ height: `${height}px`, minHeight: '4px' }}>
                                <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {day.views || 0} views
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-500 font-medium">{day.day}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-full text-center text-gray-500 py-8">No data available</div>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-800">{weeklyData.reduce((sum, d) => sum + (d.views || 0), 0).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">Total Views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-800">{weeklyData.reduce((sum, d) => sum + (d.downloads || 0), 0).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">Downloads</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-800">₹{weeklyData.reduce((sum, d) => sum + (d.revenue || 0), 0).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">Revenue</p>
                    </div>
                  </div>
                </div>
              </EnhancedCard>

              <EnhancedCard title="Recent Activity" icon={Activity} color="from-green-500 to-teal-700">
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {recentActivities.length > 0 ? (
                    recentActivities.slice(0, 10).map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <FileText size={14} className="text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{activity.message}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={10} /> {formatDate(activity.time)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <Activity size={40} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No recent activities</p>
                    </div>
                  )}
                </div>
              </EnhancedCard>
            </div>

            <EnhancedCard title="Popular Content" icon={Star} color="from-yellow-500 to-amber-700">
              <div className="mt-2 space-y-2">
                {popularContent.length > 0 ? (
                  popularContent.slice(0, 5).map((item, index) => (
                    <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-yellow-50 transition-all duration-300">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-500'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.course} • {item.views || 0} views</p>
                      </div>
                      <Eye size={14} className="text-gray-400 flex-shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Star size={40} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No popular content yet</p>
                  </div>
                )}
              </div>
            </EnhancedCard>
          </div>
        )}

        {/* ========== BRANCH UPLOAD TAB ========== */}
        {isBranchTab() && renderUploadTab()}

        {/* ========== USERS TAB ========== */}
        {activeTab === "users" && <UsersComponent />}

        {/* ========== PROFILE TAB ========== */}
        {activeTab === "profile" && <AdminProfile />}

        {/* ========== NOTICE TAB ========== */}
        {activeTab === "notice" && <AdminNotice />}
      </div>

      {/* ========== PRICE MANAGEMENT MODAL ========== */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <DollarSign size={24} className="text-amber-500" />
                Manage Course Prices
              </h3>
              <button 
                onClick={() => setShowPriceModal(false)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {Object.entries(coursePrices).map(([course, data]) => (
                <div key={course} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold text-gray-800">{course}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {data.discount > 0 ? `${data.discount}% OFF` : 'No Discount'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 font-medium block mb-1">Price (₹)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={data.price}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            const newPrice = value === '' ? 0 : parseFloat(value);
                            setCoursePrices({
                              ...coursePrices,
                              [course]: { ...data, price: isNaN(newPrice) ? 0 : newPrice }
                            });
                          }
                        }}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 font-medium block mb-1">Discount %</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={data.discount}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            const newDiscount = value === '' ? 0 : parseFloat(value);
                            const validDiscount = Math.min(Math.max(isNaN(newDiscount) ? 0 : newDiscount, 0), 100);
                            setCoursePrices({
                              ...coursePrices,
                              [course]: { ...data, discount: validDiscount }
                            });
                          }
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Preview:</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {data.discount > 0 ? (
                        <>
                          <span className="text-gray-400 line-through">₹{Number(data.price).toFixed(2)}</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{getDiscountedPrice(data.price, data.discount).toFixed(2)}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {data.discount}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-gray-800">₹{Number(data.price).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <button
                  onClick={handleSaveCoursePrices}
                  disabled={savingPrices}
                  className="flex-1 min-w-[120px] bg-amber-500 text-white py-3 rounded-xl font-semibold hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} className="inline mr-2" /> 
                  {savingPrices ? 'Saving...' : 'Save All Prices'}
                </button>
                <button
                  onClick={resetToDefault}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Reset Default
                </button>
                <button
                  onClick={() => setShowPriceModal(false)}
                  className="px-6 py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;