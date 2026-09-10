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
    showLanguage: false,
    showMPharmBranch: false
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
    ],
    showMPharmBranch: false
  },
  "M.Pharm": {
    type: "semester",
    options: [
      { value: "1", label: "Semester 1" },
      { value: "2", label: "Semester 2" },
      { value: "3", label: "Semester 3" },
      { value: "4", label: "Semester 4" }
    ],
    showLanguage: false,
    showMPharmBranch: true
  },
  "Pharm.D": {
    type: "year",
    options: [
      { value: "1", label: "1st Year" },
      { value: "2", label: "2nd Year" },
      { value: "3", label: "3rd Year" },
      { value: "4", label: "4th Year" },
      { value: "5", label: "5th Year" },
      { value: "6", label: "6th Year" }
    ],
    showLanguage: false,
    showMPharmBranch: false
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
    showLanguage: false,
    showMPharmBranch: false
  }
};

// ========== M.PHARM BRANCHES ==========
const MPHARM_BRANCHES = [
  { value: "Pharmaceutics", label: "Pharmaceutics" },
  { value: "Pharmacology", label: "Pharmacology" },
  { value: "Pharmaceutical Chemistry", label: "Pharmaceutical Chemistry" },
  { value: "Pharmacognosy", label: "Pharmacognosy" },
  { value: "Regulatory Affairs", label: "Regulatory Affairs" }
];

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

// ========== D.PHARM SUBJECTS ==========
const DPHARM_SUBJECTS = {
  1: [
    "Pharmaceutics",
    "Pharmaceutical Chemistry",
    "Pharmacognosy",
    "Human Anatomy & Physiology",
    "Social Pharmacy"
  ],
  2: [
    "Pharmacology",
    "Community Pharmacy & Management",
    "Biochemistry & Clinical Pathology",
    "Pharmacotherapeutics",
    "Hospital & Clinical Pharmacy",
    "Pharmacy Law & Ethics"
  ]
};

// ========== M.PHARM SUBJECTS (BRANCH-WISE + SEMESTER-WISE) ==========
const MPHARM_SUBJECTS = {
  "Pharmaceutics": {
    1: [
      "Modern Pharmaceutical Analytical Techniques",
      "Drug Delivery System",
      "Modern Pharmaceutics",
      "Regulatory Affair"
    ],
    2: [
      "Molecular Pharmaceutics (Nano Tech and Targeted DDS)",
      "Advanced Biopharmaceutics & Pharmacokinetics",
      "Computer Aided Drug Delivery System",
      "Cosmetic and Cosmeceuticals"
    ],
    3: ["Research Methodology & Biostatistics", "Research Work"],
    4: ["Research Work"]
  },
  "Pharmacology": {
    1: [
      "Modern Pharmaceutical Analytical Techniques",
      "Advanced Pharmacology-I",
      "Pharmacological and Toxicological Screening Methods-I",
      "Cellular and Molecular Pharmacology"
    ],
    2: [
      "Advanced Pharmacology-II",
      "Pharmacological and Toxicological Screening Methods-II",
      "Principles of Drug Discovery",
      "Experimental Pharmacology Practical-II"
    ],
    3: ["Research Methodology & Biostatistics", "Research Work"],
    4: ["Research Work"]
  },
  "Pharmaceutical Chemistry": {
    1: [
      "Modern Pharmaceutical Analytical Techniques",
      "Advanced Organic Chemistry-I",
      "Advanced Medicinal Chemistry",
      "Chemistry of Natural Products"
    ],
    2: [
      "Advanced Spectral Analysis",
      "Advanced Organic Chemistry-II",
      "Computer Aided Drug Design",
      "Pharmaceutical Process Chemistry"
    ],
    3: ["Research Methodology & Biostatistics", "Research Work"],
    4: ["Research Work"]
  },
  "Pharmacognosy": {
    1: [
      "Modern Pharmaceutical Analytical Techniques",
      "Advanced Pharmacognosy-I",
      "Phytochemistry",
      "Industrial Pharmacognostical Technology"
    ],
    2: [
      "Medicinal Biotechnology",
      "Advanced Pharmacognosy-II",
      "Indian System of Medicine",
      "Herbal Cosmetics"
    ],
    3: ["Research Methodology & Biostatistics", "Research Work"],
    4: ["Research Work"]
  },
  "Regulatory Affairs": {
    1: [
      "Good Regulatory Practices",
      "Documentation and Regulatory Writing",
      "Clinical Research Regulations",
      "Regulations and Legislation for Drugs & Cosmetics, Medical Devices, Biologicals & Herbals, and Food & Nutraceuticals in India and Intellectual Property Rights"
    ],
    2: [
      "Regulatory Aspects of Drugs & Cosmetics",
      "Regulatory Aspects of Herbal & Biologicals",
      "Regulatory Aspects of Medical Devices",
      "Regulatory Aspects of Food & Nutraceuticals"
    ],
    3: ["Research Methodology & Biostatistics", "Research Work"],
    4: ["Research Work"]
  }
};

// ========== PHARM.D SUBJECTS (YEAR-WISE) ==========
const PHARMD_SUBJECTS = {
  1: [
    "Human Anatomy & Physiology",
    "Pharmaceutics-I",
    "Medicinal Biochemistry",
    "Pharmaceutical Organic Chemistry",
    "Pharmaceutical Inorganic Chemistry",
    "Remedial Mathematics / Biology"
  ],
  2: [
    "Pathophysiology",
    "Pharmaceutical Microbiology",
    "Pharmacognosy & Phytopharmaceuticals",
    "Pharmacology-I",
    "Community Pharmacy",
    "Pharmacotherapeutics-I"
  ],
  3: [
    "Pharmacology-II",
    "Pharmaceutical Analysis",
    "Pharmacotherapeutics-II",
    "Pharmaceutical Jurisprudence",
    "Medicinal Chemistry",
    "Pharmaceutical Formulations"
  ],
  4: [
    "Pharmacotherapeutics-III",
    "Hospital Pharmacy",
    "Clinical Pharmacy",
    "Biostatistics & Research Methodology",
    "Biopharmaceutics & Pharmacokinetics",
    "Clinical Toxicology"
  ],
  5: [
    "Clinical Research",
    "Pharmacoepidemiology",
    "Pharmacoeconomics",
    "Clinical Pharmacokinetics",
    "Clerkship",
    "Project Work"
  ],
  6: [
    "Clinical Internship",
    "Advanced Clinical Practice",
    "Research Project",
    "Clinical Case Studies",
    "Hospital Training",
    "Project Work"
  ]
};

// ========== PHD SUBJECTS ==========
const PHD_SUBJECTS = {
  1: [
    "Research Methodology",
    "Advanced Pharmaceutical Sciences",
    "Pharmaceutical Analysis",
    "Biostatistics",
    "Scientific Writing"
  ],
  2: [
    "Advanced Pharmacology",
    "Pharmaceutical Technology",
    "Pharmaceutical Chemistry",
    "Pharmacognosy",
    "Pharmaceutical Management"
  ],
  3: [
    "Clinical Research",
    "Pharmaceutical Biotechnology",
    "Pharmaceutical Quality",
    "Pharmaceutical Marketing",
    "Pharmaceutical Ethics"
  ],
  4: [
    "Pharmaceutical Nanotechnology",
    "Pharmaceutical Informatics",
    "Pharmaceutical Policy",
    "Pharmaceutical Leadership",
    "Pharmaceutical Innovation"
  ],
  5: [
    "Advanced Research Methods",
    "Pharmaceutical Sustainability",
    "Pharmaceutical Entrepreneurship",
    "Pharmaceutical Regulations",
    "Pharmaceutical Practice"
  ],
  6: [
    "Pharmaceutical Thesis",
    "Pharmaceutical Defense",
    "Pharmaceutical Publication",
    "Pharmaceutical Presentation",
    "Pharmaceutical Collaboration"
  ]
};

const getCourseOptions = (course) => {
  return COURSE_CONFIG[course] || { ...COURSE_CONFIG["B.Pharm"], showLanguage: false, showMPharmBranch: false };
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
    mpharmBranch: "",
    category: "",
    semester: "",
    subject: "",
    unit: "",
    language: "",
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

  // ========== ADMIN PERMISSIONS ==========
  const getStoredAdmin = () => {
    try {
      const rawAdmin = localStorage.getItem("admin");
      return rawAdmin ? JSON.parse(rawAdmin) : null;
    } catch (e) {
      console.error("Failed to read admin data:", e);
      return null;
    }
  };

  const storedAdmin = getStoredAdmin();
  const isSuperAdmin = storedAdmin?.role === "super_admin";
  const allowedCourses = Array.isArray(storedAdmin?.permissions?.courses)
    ? storedAdmin.permissions.courses
    : [];

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
    const allNotes = Array.isArray(notes) ? notes : [];
    const allVideos = Array.isArray(videos) ? videos : [];
    const allPaidPDFs = Array.isArray(paidPDFs) ? paidPDFs : [];
    const allPapers = Array.isArray(papers) ? papers : [];

    return (
      allNotes.reduce((total, item) => total + Number(item?.downloadCount || 0), 0) +
      allVideos.reduce((total, item) => total + Number(item?.downloadCount || 0), 0) +
      allPaidPDFs.reduce((total, item) => total + Number(item?.downloadCount || 0), 0) +
      allPapers.reduce((total, item) => total + Number(item?.downloadCount || 0), 0)
    );
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

    setLoading(true);
    setError(null);

    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };

      const [
        statsRes,
        notesRes,
        videosRes,
        paidRes,
        papersRes,
        popularRes,
        activityRes,
        revenueRes,
        weeklyRes,
        pricesRes
      ] = await Promise.allSettled([
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

      if (statsRes.status === "fulfilled") {
        const data = statsRes.value?.data || {};
        setStats({
          totalNotes: Number(data.totalNotes || 0),
          totalVideos: Number(data.totalVideos || 0),
          totalUsers: Number(data.totalUsers || 0),
          totalPaidPDFs: Number(data.totalPaidPDFs || 0),
          totalPapers: Number(data.totalPapers || 0)
        });
      }

      if (notesRes.status === "fulfilled") {
        const response = notesRes.value?.data;
        setNotes(Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []);
      } else {
        console.error("Notes API error:", notesRes.reason);
        setNotes([]);
      }

      if (videosRes.status === "fulfilled") {
        const response = videosRes.value?.data;
        setVideos(Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []);
      } else {
        console.error("Videos API error:", videosRes.reason);
        setVideos([]);
      }

      if (paidRes.status === "fulfilled") {
        const response = paidRes.value?.data;
        setPaidPDFs(Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []);
      } else {
        console.error("Paid PDFs API error:", paidRes.reason);
        setPaidPDFs([]);
      }

      if (papersRes.status === "fulfilled") {
        const response = papersRes.value?.data;
        setPapers(Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []);
      } else {
        console.error("Papers API error:", papersRes.reason);
        setPapers([]);
      }

      if (popularRes.status === "fulfilled") {
        const response = popularRes.value?.data;
        setPopularContent(Array.isArray(response?.notes) ? response.notes : []);
      } else {
        console.error("Popular content API error:", popularRes.reason);
        setPopularContent([]);
      }

      if (activityRes.status === "fulfilled") {
        const response = activityRes.value?.data;
        setRecentActivities(Array.isArray(response?.activities) ? response.activities : []);
      } else {
        console.error("Recent activity API error:", activityRes.reason);
        setRecentActivities([]);
      }

      if (revenueRes.status === "fulfilled") {
        const data = revenueRes.value?.data || {};
        setRevenueStats({
          monthlyRevenue: Number(data.totalRevenue || 0),
          totalDownloads: Number(data.totalDownloads || 0),
          activeUsers: Number(data.activeUsers || 0),
          revenueGrowth: Number(data.revenueGrowth || 0),
          downloadGrowth: Number(data.downloadGrowth || 0)
        });
      } else {
        console.error("Revenue API error:", revenueRes.reason);
      }

      if (weeklyRes.status === "fulfilled") {
        const response = weeklyRes.value?.data;
        if (Array.isArray(response?.data)) {
          setWeeklyData(response.data);
        }
      } else {
        console.error("Weekly API error:", weeklyRes.reason);
      }

      if (pricesRes.status === "fulfilled") {
        const response = pricesRes.value?.data;
        if (response && typeof response === "object" && !Array.isArray(response)) {
          setCoursePrices(response);
        }
      } else {
        console.error("Course prices API error:", pricesRes.reason);
      }

    } catch (error) {
      console.error("❌ Admin dashboard error:", error);

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("admin");
        if (onLogout) onLogout();
        return;
      }

      setError("Failed to load dashboard data. Please refresh the page.");
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
    setUploadForm(prev => ({
      ...prev,
      units: prev.units.map((unit, i) =>
        i === index ? { ...unit, [field]: value } : unit
      )
    }));
  };

  const handleTopicChange = (unitIndex, topicIndex, value) => {
    setUploadForm(prev => ({
      ...prev,
      units: prev.units.map((unit, i) => {
        if (i !== unitIndex) return unit;
        return {
          ...unit,
          topics: unit.topics.map((topic, j) =>
            j === topicIndex ? value : topic
          )
        };
      })
    }));
  };

  const addUnit = () => {
    setUploadForm(prev => {
      const usedIds = prev.units
        .map(unit => Number(unit?.id))
        .filter(id => Number.isInteger(id) && id > 0);

      const newId = usedIds.length > 0 ? Math.max(...usedIds) + 1 : 1;

      return {
        ...prev,
        units: [
          ...prev.units,
          { id: newId, name: `Unit ${newId}`, topics: [""] }
        ]
      };
    });
  };

  const removeUnit = (index) => {
    if (uploadForm.units.length <= 1) {
      alert("At least one unit is required");
      return;
    }

    setUploadForm(prev => ({
      ...prev,
      units: prev.units.filter((_, i) => i !== index)
    }));
  };

  const addTopic = (unitIndex) => {
    setUploadForm(prev => ({
      ...prev,
      units: prev.units.map((unit, i) =>
        i === unitIndex
          ? { ...unit, topics: [...unit.topics, ""] }
          : unit
      )
    }));
  };

  const removeTopic = (unitIndex, topicIndex) => {
    if (uploadForm.units[unitIndex]?.topics?.length <= 1) {
      alert("At least one topic is required");
      return;
    }

    setUploadForm(prev => ({
      ...prev,
      units: prev.units.map((unit, i) =>
        i === unitIndex
          ? { ...unit, topics: unit.topics.filter((_, j) => j !== topicIndex) }
          : unit
      )
    }));
  };

  // ========== GET SUBJECTS BASED ON BRANCH ==========
  const getSubjectsForBranch = () => {
    const branchName = getBranchName();
    const semesterKey = uploadForm.semester;

    if (!semesterKey) return [];

    if (branchName === "M.Pharm") {
      if (!uploadForm.mpharmBranch) return [];
      return MPHARM_SUBJECTS[uploadForm.mpharmBranch]?.[semesterKey] || [];
    }

    switch (branchName) {
      case "B.Pharm":
        return BPHARM_SUBJECTS[semesterKey] || [];
      case "D.Pharm":
        return DPHARM_SUBJECTS[semesterKey] || [];
      case "Pharm.D":
        return PHARMD_SUBJECTS[semesterKey] || [];
      case "PhD":
        return PHD_SUBJECTS[semesterKey] || [];
      default:
        return BPHARM_SUBJECTS[semesterKey] || [];
    }
  };

  // ========== GET SEMESTER/YEAR OPTIONS BASED ON BRANCH ==========
  const getBranchOptions = () => {
    const branchName = getBranchName();
    const config = COURSE_CONFIG[branchName];

    if (!config || !Array.isArray(config.options)) {
      return [];
    }

    return config.options;
  };

  const getSubjectsForSemester = () => {
    const branchName = getBranchName();
    
    if (branchName === "D.Pharm") {
      return DPHARM_SUBJECTS[uploadForm.semester] || [];
    }
    
    if (branchName === "M.Pharm") {
      if (!uploadForm.mpharmBranch) return [];
      return MPHARM_SUBJECTS[uploadForm.mpharmBranch]?.[uploadForm.semester] || [];
    }
    
    if (branchName === "Pharm.D") {
      return PHARMD_SUBJECTS[uploadForm.semester] || [];
    }
    
    if (branchName === "PhD") {
      return PHD_SUBJECTS[uploadForm.semester] || [];
    }
    
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
      fetchAllData();

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

    const branchName = getBranchName();

    if (branchName === "M.Pharm" && !uploadForm.mpharmBranch) {
      alert("Please select M.Pharm specialization (branch)");
      return;
    }
    
    if (branchName === "D.Pharm" && !uploadForm.language) {
      alert("Please select a language (Hindi/English)");
      return;
    }
    
    if (!uploadForm.semester) {
      alert("Please select a semester/year");
      return;
    }
    if (!uploadForm.subject) {
      alert("Please select a subject");
      return;
    }
    if (!uploadForm.unit) {
      alert("Please select a unit");
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
      const branchValue = branchName === "M.Pharm"
        ? uploadForm.mpharmBranch
        : branchName;

      formData.append("branch", branchValue);
      formData.append("course", branchName);
      formData.append("mpharmBranch", uploadForm.mpharmBranch || "");
      formData.append("category", uploadForm.category);
      formData.append("semester", uploadForm.semester);
      formData.append("subject", uploadForm.subject);
      formData.append("unit", uploadForm.unit);
      formData.append("language", uploadForm.language || "english");
      formData.append("units", JSON.stringify(uploadForm.units));
      formData.append("title", uploadForm.title || `${uploadForm.subject} - ${uploadForm.category}`);
      formData.append("description", uploadForm.description || `${uploadForm.category} for ${uploadForm.subject}`);
      formData.append("isPremium", uploadForm.isPremium);
      formData.append("type", uploadForm.type);
      formData.append("file", uploadForm.file);

      // ✅ Pharm.D ke liye year field bhi bhej do (backend compatibility)
      if (branchName === "Pharm.D") {
        formData.append("year", uploadForm.semester);
      }

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
          mpharmBranch: "",
          category: "",
          semester: "",
          subject: "",
          unit: "",
          language: "",
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

  // ========== RENDER UPLOAD TAB ==========
  const renderUploadTab = () => {
    const branchName = getBranchName();
    const subjects = getSubjectsForBranch();
    const branchOptions = getBranchOptions();
    const isYearBased = COURSE_CONFIG[branchName]?.type === "year";
    const showLanguage = COURSE_CONFIG[branchName]?.showLanguage || false;
    const showMPharmBranch = COURSE_CONFIG[branchName]?.showMPharmBranch || false;

    const branchContent = notes.filter((n) => {
      if (branchName === "M.Pharm") {
        const itemCourse = String(n?.course || "").trim().toLowerCase();
        const itemBranch = String(n?.branch || n?.mpharmBranch || "").trim();

        return (
          itemCourse === "m.pharm" &&
          MPHARM_BRANCHES.some((b) => b.value === itemBranch)
        );
      }

      if (branchName === "Pharm.D") {
        const itemCourse = String(n?.course || "").trim().toLowerCase();
        return itemCourse === "pharm.d";
      }

      return n?.branch === branchName || n?.course === branchName;
    });

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
          <div className="px-6 sm:px-8 py-5 border-b border-gray-100 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md">
                    <Upload size={18} />
                  </div>
                  <h3 className="text-xl font-['Space_Grotesk'] font-bold text-gray-800">Upload Content</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 font-['Inter'] mt-1 ml-11">
                  {branchName === "M.Pharm"
                    ? "Select Branch, Semester, Subject & Unit"
                    : isYearBased
                    ? "Select Language, Year, Subject & Unit"
                    : "Select Semester, Subject & Unit"}
                </p>
              </div>
              {uploadForm.unit && uploadForm.subject && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-['Inter'] font-bold">
                  <CheckCircle size={15} />
                  Unit {uploadForm.unit}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-6 rounded-2xl bg-sky-50 border border-sky-100 p-4 animate-pulse">
                <div className="flex justify-between text-xs sm:text-sm font-['Inter'] text-gray-600 mb-2">
                  <span className="font-semibold">Uploading...</span>
                  <span className="font-bold text-sky-600">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-5">
              {/* Branch */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-white shadow-sm text-sky-600">
                    <GraduationCap size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-['Inter'] font-bold">Course</p>
                    <p className="font-['Inter'] font-bold text-gray-800 truncate">{branchName}</p>
                  </div>
                </div>
                <span className="text-[11px] font-['Inter'] font-semibold text-sky-600 bg-white px-2.5 py-1 rounded-full border border-sky-100">
                  Auto selected
                </span>
              </div>

              {/* Step 1: Category */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-bold">1</span>
                  <label className="text-sm font-['Inter'] font-bold text-gray-800">What are you uploading?</label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setUploadForm(prev => ({ ...prev, category: cat.id }))}
                      className={`group p-3.5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 font-['Inter'] text-left ${
                        uploadForm.category === cat.id
                          ? `border-sky-500 bg-gradient-to-r ${cat.color} text-white shadow-lg scale-[1.02]`
                          : "border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50 hover:-translate-y-0.5 text-gray-700"
                      }`}
                    >
                      <span className={`p-2 rounded-xl ${uploadForm.category === cat.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500 group-hover:text-sky-600"}`}>
                        {cat.icon}
                      </span>
                      <span className="font-semibold text-sm leading-tight">{cat.id}</span>
                      {uploadForm.category === cat.id && <CheckCircle size={16} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 1.5: Language (Only for D.Pharm) */}
              {showLanguage && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold">1.5</span>
                    <label className="text-sm font-['Inter'] font-bold text-gray-800">Language</label>
                    {uploadForm.language && (
                      <span className="text-xs font-['Inter'] font-bold text-amber-600">
                        {uploadForm.language === "hindi" ? "🇮🇳 Hindi" : "🇬🇧 English"} selected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { value: "hindi", label: "हिंदी (Hindi)", icon: "🇮🇳" },
                      { value: "english", label: "English", icon: "🇬🇧" }
                    ].map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => setUploadForm(prev => ({ ...prev, language: lang.value }))}
                        className={`p-3.5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 font-['Inter'] text-left ${
                          uploadForm.language === lang.value
                            ? "border-amber-500 bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg scale-[1.02]"
                            : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50 hover:-translate-y-0.5 text-gray-700"
                        }`}
                      >
                        <span className="text-2xl">{lang.icon}</span>
                        <span className="font-semibold text-sm">{lang.label}</span>
                        {uploadForm.language === lang.value && <CheckCircle size={16} className="ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1.7: M.Pharm Branch (Only for M.Pharm) */}
              {showMPharmBranch && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold">1.7</span>
                    <label className="text-sm font-['Inter'] font-bold text-gray-800">M.Pharm Branch / Specialization</label>
                    {uploadForm.mpharmBranch && (
                      <span className="text-xs font-['Inter'] font-bold text-indigo-600">
                        {uploadForm.mpharmBranch} selected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {MPHARM_BRANCHES.map((b) => (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() =>
                          setUploadForm((prev) => ({
                            ...prev,
                            mpharmBranch: b.value,
                            subject: "",
                            unit: "",
                          }))
                        }
                        className={`p-3.5 rounded-2xl border-2 transition-all duration-300 font-['Inter'] text-left flex items-center gap-2 ${
                          uploadForm.mpharmBranch === b.value
                            ? "border-indigo-500 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-[1.02]"
                            : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 hover:-translate-y-0.5 text-gray-700"
                        }`}
                      >
                        <span className="font-semibold text-sm">{b.label}</span>
                        {uploadForm.mpharmBranch === b.value && <CheckCircle size={16} className="ml-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Semester/Year */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold">2</span>
                  <label className="text-sm font-['Inter'] font-bold text-gray-800">
                    {isYearBased ? "Year" : "Semester"}
                  </label>
                </div>
                <select
                  value={uploadForm.semester}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, semester: e.target.value, subject: "", unit: "" }))}
                  disabled={branchName === "M.Pharm" && !uploadForm.mpharmBranch}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-800 font-['Inter'] text-sm font-medium outline-none transition-all focus:border-purple-400 focus:ring-4 focus:ring-purple-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {branchName === "M.Pharm" && !uploadForm.mpharmBranch
                      ? "Select M.Pharm branch first"
                      : `Select ${isYearBased ? "year" : "semester"}`}
                  </option>
                  {branchOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Step 3: Subject */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-bold">3</span>
                  <label className="text-sm font-['Inter'] font-bold text-gray-800">Subject</label>
                </div>
                <select
                  value={uploadForm.subject}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
                  disabled={!uploadForm.semester}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-800 font-['Inter'] text-sm font-medium outline-none transition-all focus:border-purple-400 focus:ring-4 focus:ring-purple-50 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <option value="">{uploadForm.semester ? "Select subject" : `Select ${isYearBased ? "year" : "semester"} first`}</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Step 4: Unit */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold">4</span>
                    <label className="text-sm font-['Inter'] font-bold text-gray-800">Unit</label>
                  </div>
                  {uploadForm.unit && (
                    <span className="text-xs font-['Inter'] font-bold text-emerald-600">Unit {uploadForm.unit} selected</span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((unitNum) => (
                    <button
                      key={unitNum}
                      type="button"
                      disabled={!uploadForm.subject}
                      onClick={() => setUploadForm(prev => ({ ...prev, unit: unitNum }))}
                      className={`py-3 px-2 rounded-xl border-2 transition-all duration-300 font-['Inter'] font-bold text-sm ${
                        uploadForm.unit === unitNum
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-lg scale-[1.03]"
                          : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 text-gray-700"
                      } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200`}
                    >
                      Unit {unitNum}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 5: File */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">5</span>
                  <label className="text-sm font-['Inter'] font-bold text-gray-800">Choose file</label>
                </div>
                <div className="relative">
                  <input
                    id="upload-file-input"
                    type="file"
                    onChange={handleUploadFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                  />
                  <div className={`p-5 sm:p-6 border-2 border-dashed rounded-2xl text-center transition-all duration-300 ${
                    uploadForm.file
                      ? "border-emerald-300 bg-emerald-50/60"
                      : "border-gray-300 bg-gray-50/60 hover:border-sky-400 hover:bg-sky-50/50"
                  }`}>
                    <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${uploadForm.file ? "bg-emerald-100 text-emerald-600" : "bg-white text-sky-500 shadow-sm"}`}>
                      {uploadForm.file ? <CheckCircle size={25} /> : <Upload size={25} />}
                    </div>
                    <p className="font-['Inter'] text-sm text-gray-700 font-medium">
                      {uploadForm.file ? (
                        <span className="text-emerald-700 font-bold break-all">{uploadForm.file.name}</span>
                      ) : (
                        <>Click to choose a file <span className="text-gray-400">or drag & drop</span></>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 font-['Inter'] mt-1">PDF, DOC, PPT, XLS, TXT • Max 50MB</p>
                  </div>
                </div>
              </div>

              {/* Optional details */}
              <details className="group rounded-2xl border border-gray-200 bg-gray-50/70">
                <summary className="cursor-pointer list-none px-4 py-3 font-['Inter'] text-sm font-semibold text-gray-700 flex items-center justify-between">
                  <span>Optional details</span>
                  <span className="text-xs text-gray-400 group-open:hidden">Title, description & premium</span>
                  <span className="text-xs text-gray-400 hidden group-open:inline">Hide</span>
                </summary>
                <div className="px-4 pb-4 pt-1 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="title"
                      value={uploadForm.title}
                      onChange={handleUploadChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none font-['Inter'] text-sm"
                      placeholder="Title (optional)"
                    />
                    <input
                      type="text"
                      name="description"
                      value={uploadForm.description}
                      onChange={handleUploadChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none font-['Inter'] text-sm"
                      placeholder="Description (optional)"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPremium"
                      checked={uploadForm.isPremium}
                      onChange={handleUploadChange}
                      className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                    />
                    <span className="font-['Inter'] text-sm text-gray-700">
                      <span className="font-semibold">Premium content</span>
                      <span className="text-xs text-gray-400 block">Students need to purchase it.</span>
                    </span>
                  </label>
                </div>
              </details>

              {/* File type */}
              <div>
                <label className="block text-sm font-['Inter'] font-bold text-gray-800 mb-2">Content type</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {["note", "video", "paper"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUploadForm(prev => ({ ...prev, type }))}
                      className={`py-3 rounded-xl border-2 transition-all duration-300 font-['Inter'] font-semibold text-sm capitalize ${
                        uploadForm.type === type
                          ? "border-sky-500 bg-sky-500 text-white shadow-md scale-[1.02]"
                          : "border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50 text-gray-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full py-4 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white rounded-2xl font-['Inter'] font-bold text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Upload to {uploadForm.unit ? `Unit ${uploadForm.unit}` : "Selected Unit"}
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
                          {(item.mpharmBranch || item.branch) && branchName === "M.Pharm" && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                              {item.mpharmBranch || item.branch}
                            </span>
                          )}
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {COURSE_CONFIG[branchName]?.type === "year" ? `Year ${item.semester || item.year}` : `Sem ${item.semester}`}
                          </span>
                          {item.language && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              item.language === "hindi" 
                                ? "bg-orange-100 text-orange-700" 
                                : "bg-blue-100 text-blue-700"
                            }`}>
                              {item.language === "hindi" ? "🇮🇳 Hindi" : "🇬🇧 English"}
                            </span>
                          )}
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
                      <p className="text-3xl font-bold text-gray-800">{Number(revenueStats.totalDownloads || getTotalDownloadsFromData() || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${revenueStats.downloadGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {revenueStats.downloadGrowth >= 0 ? '↑' : '↓'} {Math.abs(revenueStats.downloadGrowth)}%
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" style={{ width: `${Math.min((Number(revenueStats.totalDownloads || getTotalDownloadsFromData() || 0) / 5000) * 100, 100)}%` }}></div>
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