import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

import bannerImg from "../assets/pharmacy-lab student.jpeg";

import {
  BookOpen,
  FileText,
  Video,
  Brain,
  Download,
  GraduationCap,
  PlayCircle,
  Lock,
  Eye,
  Crown,
  Sparkles,
  Rocket,
  ArrowLeft,
  CheckCircle,
  Book,
  Layers,
  FolderOpen,
  Zap,
  Award,
  Target,
  Gem,
  Shield,
  Trophy,
  ArrowRight,
  HeartPulse,
  Microscope,
  Pill,
  FlaskRound,
  Users,
  Stethoscope,
  ChevronRight,
  Code2,
  MessageSquare,
  Atom,
  Leaf,
  Beaker
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.pharmaverse.co.in";

// ========== CATEGORIES ==========
const categories = [
  { 
    id: "Notes", 
    label: "Notes", 
    icon: BookOpen, 
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    bgGradient: "from-blue-50 via-indigo-50 to-purple-50",
    glowColor: "rgba(99, 102, 241, 0.3)",
    description: "Click below to view notes by Imperfect Pharmacy",
    stats: "500+ PDFs",
    badge: "Most Popular"
  },
  { 
    id: "Exam Crash Course", 
    label: "Exam Crash Course", 
    icon: Rocket, 
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    bgGradient: "from-orange-50 via-amber-50 to-yellow-50",
    glowColor: "rgba(251, 146, 60, 0.3)",
    description: "Click below to view Exam Crash Course by Imperfect Pharmacy",
    stats: "8 Semesters",
    badge: "🔥 Crash"
  },
  { 
    id: "PYQs", 
    label: "PYQs", 
    icon: Brain, 
    gradient: "from-rose-500 via-pink-500 to-purple-500",
    bgGradient: "from-rose-50 via-pink-50 to-purple-50",
    glowColor: "rgba(244, 63, 94, 0.3)",
    description: "Click below to view PYQs by Imperfect Pharmacy",
    stats: "1000+ Questions",
    badge: "📝 Exam"
  }
];

// ========== NEW SEMESTER 1 DATA - ONLY 6 SUBJECTS ==========
const NOTES_DATA = {
  1: {
    "Basics of Python Programming for Pharmaceutical Sciences": {
      units: [
        { id: 1, name: "Unit 1", topics: ["Introduction to Python", "Variables & Data Types", "Operators"] },
        { id: 2, name: "Unit 2", topics: ["Control Structures", "Loops", "Functions"] },
        { id: 3, name: "Unit 3", topics: ["Data Structures", "Lists", "Tuples", "Dictionaries"] },
        { id: 4, name: "Unit 4", topics: ["File Handling", "Exception Handling", "Modules"] },
        { id: 5, name: "Unit 5", topics: ["NumPy Basics", "Pandas Intro", "Data Visualization"] }
      ]
    },
    "General Pharmacy": {
      units: [
        { id: 1, name: "Unit 1", topics: ["Introduction to Pharmacy", "History", "Scope"] },
        { id: 2, name: "Unit 2", topics: ["Pharmaceutical Calculations", "Weights & Measures"] },
        { id: 3, name: "Unit 3", topics: ["Dosage Forms", "Routes of Administration"] },
        { id: 4, name: "Unit 4", topics: ["Pharmacopoeias", "Standards", "Quality Control"] },
        { id: 5, name: "Unit 5", topics: ["Prescription", "Dispensing", "Patient Counseling"] }
      ]
    },
    "Healthcare Psychology and Communication Skills": {
      units: [
        { id: 1, name: "Unit 1", topics: ["Introduction to Psychology", "Human Behavior"] },
        { id: 2, name: "Unit 2", topics: ["Memory", "Learning", "Perception"] },
        { id: 3, name: "Unit 3", topics: ["Motivation", "Emotions", "Stress"] },
        { id: 4, name: "Unit 4", topics: ["Communication Skills", "Verbal & Non-Verbal"] },
        { id: 5, name: "Unit 5", topics: ["Patient Communication", "Healthcare Ethics"] }
      ]
    },
    "Human Anatomy, Physiology and Pathophysiology I": {
      units: [
        { id: 1, name: "Unit 1", topics: ["Introduction to Human Body", "Cell", "Tissues"] },
        { id: 2, name: "Unit 2", topics: ["Skeletal System", "Muscular System"] },
        { id: 3, name: "Unit 3", topics: ["Cardiovascular System", "Blood"] },
        { id: 4, name: "Unit 4", topics: ["Respiratory System", "Digestive System"] },
        { id: 5, name: "Unit 5", topics: ["Pathophysiology Basics", "Disease Mechanisms"] }
      ]
    },
    "Introduction to Pharmacognosy": {
      units: [
        { id: 1, name: "Unit 1", topics: ["History of Pharmacognosy", "Scope"] },
        { id: 2, name: "Unit 2", topics: ["Classification of Drugs", "Plant Metabolites"] },
        { id: 3, name: "Unit 3", topics: ["Alkaloids", "Glycosides", "Terpenoids"] },
        { id: 4, name: "Unit 4", topics: ["Plant Drugs", "Extraction Methods"] },
        { id: 5, name: "Unit 5", topics: ["Quality Control", "Herbal Formulations"] }
      ]
    },
    "Pharmaceutical Inorganic and Analytical Chemistry": {
      units: [
        { id: 1, name: "Unit 1", topics: ["Introduction to Inorganic Chemistry", "Atomic Structure"] },
        { id: 2, name: "Unit 2", topics: ["Periodic Table", "Chemical Bonding"] },
        { id: 3, name: "Unit 3", topics: ["Acids, Bases", "Buffer Solutions"] },
        { id: 4, name: "Unit 4", topics: ["Qualitative Analysis", "Quantitative Analysis"] },
        { id: 5, name: "Unit 5", topics: ["Instrumental Analysis", "Titrimetric Methods"] }
      ]
    }
  }
};

// ========== CRASH COURSE DATA - SAME 6 SUBJECTS ==========
const CRASH_DATA = {
  1: {
    "Basics of Python Programming for Pharmaceutical Sciences": {
      units: [
        { id: 1, name: "Unit 1", topics: ["Crash - Python Intro", "Variables", "Data Types"] },
        { id: 2, name: "Unit 2", topics: ["Crash - Loops", "Functions", "OOP"] },
        { id: 3, name: "Unit 3", topics: ["Crash - Lists", "Dictionaries", "Sets"] },
        { id: 4, name: "Unit 4", topics: ["Crash - File I/O", "Error Handling"] },
        { id: 5, name: "Unit 5", topics: ["Crash - NumPy", "Pandas", "Matplotlib"] }
      ]
    },
    "General Pharmacy": {
      units: [
        { id: 1, name: "Unit 1", topics: ["Crash - Pharmacy Intro", "History", "Scope"] },
        { id: 2, name: "Unit 2", topics: ["Crash - Pharm Calculations", "Dosage Forms"] },
        { id: 3, name: "Unit 3", topics: ["Crash - Routes", "Pharmacopoeias"] },
        { id: 4, name: "Unit 4", topics: ["Crash - Quality Control", "Standards"] },
        { id: 5, name: "Unit 5", topics: ["Crash - Prescription", "Dispensing"] }
      ]
    },
    "Healthcare Psychology and Communication Skills": {
      units: [
        { id: 1, name: "Unit 1", topics: ["Crash - Psychology Intro", "Behavior"] },
        { id: 2, name: "Unit 2", topics: ["Crash - Memory", "Learning", "Perception"] },
        { id: 3, name: "Unit 3", topics: ["Crash - Motivation", "Emotions"] },
        { id: 4, name: "Unit 4", topics: ["Crash - Communication", "Verbal Skills"] },
        { id: 5, name: "Unit 5", topics: ["Crash - Patient Communication", "Ethics"] }
      ]
    },
    "Human Anatomy, Physiology and Pathophysiology I": {
      units: [
        { id: 1, name: "Unit 1", topics: ["Crash - Human Body", "Cells", "Tissues"] },
        { id: 2, name: "Unit 2", topics: ["Crash - Skeletal", "Muscular"] },
        { id: 3, name: "Unit 3", topics: ["Crash - Heart", "Blood"] },
        { id: 4, name: "Unit 4", topics: ["Crash - Lungs", "Digestive"] },
        { id: 5, name: "Unit 5", topics: ["Crash - Pathophysiology", "Diseases"] }
      ]
    },
    "Introduction to Pharmacognosy": {
      units: [
        { id: 1, name: "Unit 1", topics: ["Crash - Pharmacognosy History"] },
        { id: 2, name: "Unit 2", topics: ["Crash - Drug Classification"] },
        { id: 3, name: "Unit 3", topics: ["Crash - Alkaloids", "Glycosides"] },
        { id: 4, name: "Unit 4", topics: ["Crash - Plant Drugs", "Extraction"] },
        { id: 5, name: "Unit 5", topics: ["Crash - QC", "Herbal Formulations"] }
      ]
    },
    "Pharmaceutical Inorganic and Analytical Chemistry": {
      units: [
        { id: 1, name: "Unit 1", topics: ["Crash - Inorganic Chem Intro"] },
        { id: 2, name: "Unit 2", topics: ["Crash - Periodic Table", "Bonding"] },
        { id: 3, name: "Unit 3", topics: ["Crash - Acids, Bases, Buffers"] },
        { id: 4, name: "Unit 4", topics: ["Crash - Qualitative Analysis"] },
        { id: 5, name: "Unit 5", topics: ["Crash - Instrumental Analysis"] }
      ]
    }
  }
};

// ========== PYQS DATA - SAME 6 SUBJECTS ==========
const PYQS_DATA = {
  1: {
    "Basics of Python Programming for Pharmaceutical Sciences": {
      units: [
        { id: 1, name: "Unit 1", topics: ["PYQ - Python Basics", "Variables", "Data Types"] },
        { id: 2, name: "Unit 2", topics: ["PYQ - Control Flow", "Functions"] },
        { id: 3, name: "Unit 3", topics: ["PYQ - Data Structures"] },
        { id: 4, name: "Unit 4", topics: ["PYQ - File Handling"] },
        { id: 5, name: "Unit 5", topics: ["PYQ - NumPy", "Pandas"] }
      ]
    },
    "General Pharmacy": {
      units: [
        { id: 1, name: "Unit 1", topics: ["PYQ - Pharmacy Intro"] },
        { id: 2, name: "Unit 2", topics: ["PYQ - Calculations"] },
        { id: 3, name: "Unit 3", topics: ["PYQ - Dosage Forms"] },
        { id: 4, name: "Unit 4", topics: ["PYQ - Pharmacopoeias"] },
        { id: 5, name: "Unit 5", topics: ["PYQ - Prescription"] }
      ]
    },
    "Healthcare Psychology and Communication Skills": {
      units: [
        { id: 1, name: "Unit 1", topics: ["PYQ - Psychology Intro"] },
        { id: 2, name: "Unit 2", topics: ["PYQ - Memory & Learning"] },
        { id: 3, name: "Unit 3", topics: ["PYQ - Motivation"] },
        { id: 4, name: "Unit 4", topics: ["PYQ - Communication"] },
        { id: 5, name: "Unit 5", topics: ["PYQ - Patient Ethics"] }
      ]
    },
    "Human Anatomy, Physiology and Pathophysiology I": {
      units: [
        { id: 1, name: "Unit 1", topics: ["PYQ - Human Body"] },
        { id: 2, name: "Unit 2", topics: ["PYQ - Skeletal System"] },
        { id: 3, name: "Unit 3", topics: ["PYQ - Cardiovascular"] },
        { id: 4, name: "Unit 4", topics: ["PYQ - Respiratory"] },
        { id: 5, name: "Unit 5", topics: ["PYQ - Pathophysiology"] }
      ]
    },
    "Introduction to Pharmacognosy": {
      units: [
        { id: 1, name: "Unit 1", topics: ["PYQ - Pharmacognosy History"] },
        { id: 2, name: "Unit 2", topics: ["PYQ - Drug Classification"] },
        { id: 3, name: "Unit 3", topics: ["PYQ - Alkaloids"] },
        { id: 4, name: "Unit 4", topics: ["PYQ - Plant Drugs"] },
        { id: 5, name: "Unit 5", topics: ["PYQ - QC"] }
      ]
    },
    "Pharmaceutical Inorganic and Analytical Chemistry": {
      units: [
        { id: 1, name: "Unit 1", topics: ["PYQ - Inorganic Chem"] },
        { id: 2, name: "Unit 2", topics: ["PYQ - Periodic Table"] },
        { id: 3, name: "Unit 3", topics: ["PYQ - Acids & Bases"] },
        { id: 4, name: "Unit 4", topics: ["PYQ - Qualitative Analysis"] },
        { id: 5, name: "Unit 5", topics: ["PYQ - Instrumental"] }
      ]
    }
  }
};

// ========== SEMESTER COLORS ==========
const semesterColors = [
  { gradient: "from-rose-500 to-pink-500", glow: "rgba(244, 63, 94, 0.3)", bg: "from-rose-50 to-pink-50" },
  { gradient: "from-blue-500 to-cyan-500", glow: "rgba(59, 130, 246, 0.3)", bg: "from-blue-50 to-cyan-50" },
  { gradient: "from-emerald-500 to-teal-500", glow: "rgba(16, 185, 129, 0.3)", bg: "from-emerald-50 to-teal-50" },
  { gradient: "from-purple-500 to-indigo-500", glow: "rgba(139, 92, 246, 0.3)", bg: "from-purple-50 to-indigo-50" },
  { gradient: "from-orange-500 to-amber-500", glow: "rgba(251, 146, 60, 0.3)", bg: "from-orange-50 to-amber-50" },
  { gradient: "from-pink-500 to-rose-500", glow: "rgba(236, 72, 153, 0.3)", bg: "from-pink-50 to-rose-50" },
  { gradient: "from-cyan-500 to-blue-500", glow: "rgba(6, 182, 212, 0.3)", bg: "from-cyan-50 to-blue-50" },
  { gradient: "from-teal-500 to-emerald-500", glow: "rgba(20, 184, 166, 0.3)", bg: "from-teal-50 to-emerald-50" },
];

// ========== SUBJECT COLORS ==========
const subjectColors = [
  { gradient: "from-violet-500 to-purple-500", glow: "rgba(139,92,246,0.2)", bg: "from-violet-50 to-purple-50" },
  { gradient: "from-blue-500 to-cyan-500", glow: "rgba(59,130,246,0.2)", bg: "from-blue-50 to-cyan-50" },
  { gradient: "from-emerald-500 to-teal-500", glow: "rgba(16,185,129,0.2)", bg: "from-emerald-50 to-teal-50" },
  { gradient: "from-rose-500 to-pink-500", glow: "rgba(244,63,94,0.2)", bg: "from-rose-50 to-pink-50" },
  { gradient: "from-amber-500 to-orange-500", glow: "rgba(251,146,60,0.2)", bg: "from-amber-50 to-orange-50" },
  { gradient: "from-cyan-500 to-sky-500", glow: "rgba(6,182,212,0.2)", bg: "from-cyan-50 to-sky-50" },
];

// ========== SUBJECT ICONS ==========
const subjectIcons = [
  { icon: Code2, color: "from-violet-100 to-purple-100", textColor: "text-violet-600" },
  { icon: Pill, color: "from-blue-100 to-cyan-100", textColor: "text-blue-600" },
  { icon: MessageSquare, color: "from-emerald-100 to-teal-100", textColor: "text-emerald-600" },
  { icon: HeartPulse, color: "from-rose-100 to-pink-100", textColor: "text-rose-600" },
  { icon: Leaf, color: "from-amber-100 to-orange-100", textColor: "text-amber-600" },
  { icon: Beaker, color: "from-cyan-100 to-sky-100", textColor: "text-cyan-600" },
];

// ========== UNIT COLORS ==========
const unitColors = [
  { gradient: "from-rose-500 to-pink-500", glow: "rgba(244,63,94,0.25)", bg: "from-rose-50 to-pink-50" },
  { gradient: "from-blue-500 to-cyan-500", glow: "rgba(59,130,246,0.25)", bg: "from-blue-50 to-cyan-50" },
  { gradient: "from-emerald-500 to-teal-500", glow: "rgba(16,185,129,0.25)", bg: "from-emerald-50 to-teal-50" },
  { gradient: "from-purple-500 to-indigo-500", glow: "rgba(139,92,246,0.25)", bg: "from-purple-50 to-indigo-50" },
  { gradient: "from-orange-500 to-amber-500", glow: "rgba(251,146,60,0.25)", bg: "from-orange-50 to-amber-50" },
  { gradient: "from-pink-500 to-rose-500", glow: "rgba(236,72,153,0.25)", bg: "from-pink-50 to-rose-50" },
];

const BPharm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ========== STEP NAVIGATION ==========
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePositions, setMousePositions] = useState({});
  
  // ========== API STATES ==========
  const [unitContent, setUnitContent] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState(null);
  const [premiumPrice, setPremiumPrice] = useState(999);

  // ========== GET DATA BASED ON SELECTED CATEGORY ==========
  const getCategoryData = () => {
    if (selectedCategory === "Notes") return NOTES_DATA;
    if (selectedCategory === "Exam Crash Course") return CRASH_DATA;
    if (selectedCategory === "PYQs") return PYQS_DATA;
    return NOTES_DATA;
  };

  const getAvailableSemesters = () => {
    const data = getCategoryData();
    return Object.keys(data).map(Number).sort((a, b) => a - b);
  };

  const getAvailableSubjects = () => {
    const data = getCategoryData();
    if (!selectedSemester) return [];
    if (!data[selectedSemester]) return [];
    return Object.keys(data[selectedSemester]);
  };

  const getUnits = () => {
    const data = getCategoryData();
    if (!selectedCategory || !selectedSemester || !selectedSubject) return [];
    if (!data[selectedSemester]) return [];
    if (!data[selectedSemester][selectedSubject]) return [];
    return data[selectedSemester][selectedSubject].units || [];
  };

  // ========== FETCH UNIT CONTENT ==========
  const fetchUnitContent = async () => {
    if (!selectedCategory || !selectedSemester || !selectedSubject || !selectedUnit) return;
    
    try {
      const res = await axios.get(`${API_BASE}/api/admin/public/content`, {
        params: {
          category: selectedCategory,
          semester: selectedSemester,
          subject: selectedSubject,
          unit: selectedUnit?.id
        }
      });
      const content = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.content)
          ? res.data.content
          : [];

      setUnitContent(content);
    } catch (error) {
      console.error("❌ Failed to fetch unit content:", error);
      setUnitContent([]);
      toast.error("Unable to load content for this unit");
    }
  };

  useEffect(() => {
    if (selectedCategory && selectedSemester && selectedSubject && selectedUnit) {
      fetchUnitContent();
    }
  }, [selectedCategory, selectedSemester, selectedSubject, selectedUnit]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentStep(2);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setUnitContent([]);
  };

  const handleSemesterClick = (semester) => {
    setSelectedSemester(semester);
    setCurrentStep(3);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setUnitContent([]);
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setCurrentStep(4);
    setSelectedUnit(null);
    setUnitContent([]);
  };

  const handleUnitClick = (unit) => {
    setSelectedUnit(unit);
    toast.success(`📚 ${unit.name} selected!`);
  };

  const goBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedCategory(null);
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setSelectedSemester(null);
    } else if (currentStep === 4) {
      setCurrentStep(3);
      setSelectedSubject(null);
      setSelectedUnit(null);
      setUnitContent([]);
    }
  };

  const resetNavigation = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setUnitContent([]);
  };

  // ========== STYLES ==========
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes floatMedium {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-12px) scale(1.02); }
      }
      @keyframes shimmerSlide {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.15); }
        50% { box-shadow: 0 0 60px rgba(99, 102, 241, 0.35); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(60px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-40px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.7) rotate(-5deg); }
        to { opacity: 1; transform: scale(1) rotate(0deg); }
      }
      @keyframes rotateGlow {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes borderPulse {
        0%, 100% { border-color: rgba(99,102,241,0.2); }
        50% { border-color: rgba(99,102,241,0.6); }
      }
      @keyframes pop {
        0% { transform: scale(0.8); opacity: 0; }
        50% { transform: scale(1.05); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      .animate-float-medium { animation: floatMedium 3.5s ease-in-out infinite; }
      .animate-slide-up { animation: slideUp 0.7s cubic-bezier(0.23, 1, 0.32, 1) both; }
      .animate-slide-down { animation: slideDown 0.6s cubic-bezier(0.23, 1, 0.32, 1) both; }
      .animate-scale-in { animation: scaleIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) both; }
      .animate-pulse-glow { animation: pulseGlow 2.5s ease-in-out infinite; }
      .animate-border-pulse { animation: borderPulse 2s ease-in-out infinite; }
      .animate-pop { animation: pop 0.5s cubic-bezier(0.23, 1, 0.32, 1) both; }
      
      .shimmer-bg {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        background-size: 200% 100%;
        animation: shimmerSlide 1.5s ease-in-out infinite;
      }
      
      .glass-effect {
        background: rgba(255,255,255,0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      
      .category-card-1 { animation-delay: 0.1s; }
      .category-card-2 { animation-delay: 0.2s; }
      .category-card-3 { animation-delay: 0.3s; }
      
      .semester-card-1 { animation-delay: 0.05s; }
      .semester-card-2 { animation-delay: 0.1s; }
      .semester-card-3 { animation-delay: 0.15s; }
      .semester-card-4 { animation-delay: 0.2s; }
      .semester-card-5 { animation-delay: 0.25s; }
      .semester-card-6 { animation-delay: 0.3s; }
      .semester-card-7 { animation-delay: 0.35s; }
      .semester-card-8 { animation-delay: 0.4s; }
      
      .subject-card-1 { animation-delay: 0.06s; }
      .subject-card-2 { animation-delay: 0.12s; }
      .subject-card-3 { animation-delay: 0.18s; }
      .subject-card-4 { animation-delay: 0.24s; }
      .subject-card-5 { animation-delay: 0.3s; }
      .subject-card-6 { animation-delay: 0.36s; }
      
      .unit-card-1 { animation-delay: 0.05s; }
      .unit-card-2 { animation-delay: 0.1s; }
      .unit-card-3 { animation-delay: 0.15s; }
      .unit-card-4 { animation-delay: 0.2s; }
      .unit-card-5 { animation-delay: 0.25s; }
      
      @media (max-width: 768px) {
        .semester-grid { grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
        .subject-grid { grid-template-columns: 1fr; }
        .unit-grid { grid-template-columns: 1fr; }
        .hero-title { font-size: 2rem; }
      }
      @media (max-width: 480px) {
        .semester-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
        .unit-grid { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  const handleCardMouseMove = (cardId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePositions(prev => ({ ...prev, [cardId]: { x, y } }));
  };

  const handleCardMouseLeave = (cardId) => {
    setHoveredCard(null);
    setMousePositions(prev => {
      const newState = { ...prev };
      delete newState[cardId];
      return newState;
    });
  };

  // ========== VIEW & DOWNLOAD FUNCTIONS ==========
  const getToken = () => {
    return localStorage.getItem("userToken") || localStorage.getItem("token");
  };

  const handleView = async (item) => {
    if (!item?._id || !/^[a-fA-F0-9]{24}$/.test(String(item._id))) {
      toast.error("This file does not have a valid document ID");
      return;
    }

    setLoadingItemId(item._id);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login first to view");
        setLoadingItemId(null);
        return;
      }
      
      const viewUrl = `${API_BASE}/api/admin/public/download/note/${item._id}`;
      
      const response = await fetch(viewUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load file');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const newWindow = window.open("", "_blank", "noopener,noreferrer");
      if (!newWindow) {
        toast.error("Please allow popups to view files");
        setLoadingItemId(null);
        return;
      }
      
      if (blob.type === "application/pdf") {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${item.title || 'Document'}</title>
              <style>
                body, html { margin: 0; padding: 0; height: 100%; width: 100%; }
                iframe { width: 100%; height: 100%; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${blobUrl}"></iframe>
            </body>
          </html>
        `);
      } else {
        newWindow.location.href = blobUrl;
      }
      newWindow.document.close();
      setLoadingItemId(null);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      
    } catch (error) {
      toast.error(error.message || "Failed to open file");
      setLoadingItemId(null);
    }
  };

  const handleDownload = async (item) => {
    if (!item?._id || !/^[a-fA-F0-9]{24}$/.test(String(item._id))) {
      toast.error("This file does not have a valid document ID");
      return;
    }

    setLoadingItemId(item._id);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login first to download");
        setLoadingItemId(null);
        return;
      }
      
      const downloadUrl = `${API_BASE}/api/admin/public/download/note/${item._id}`;
      
      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.fileName || `${item.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Download started!");
      
    } catch (error) {
      toast.error(error.message || "Download failed. Please try again.");
    } finally {
      setLoadingItemId(null);
    }
  };

  const handlePremiumPurchase = async () => {
    toast.info("💎 Premium purchase flow - Coming soon!");
  };

  // ========== CATEGORY STEP ==========
  const renderCategoryStep = () => {
    return (
      <div className="animate-slide-up">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-100 to-blue-100 mb-4">
            <Sparkles className="text-sky-600" size={16} />
            <span className="text-xs font-['Inter'] font-bold text-sky-700 tracking-wider uppercase">B.Pharm</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Select Your <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Category</span>
          </h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full mt-4"></div>
          <p className="text-gray-500 text-base mt-4 font-['Inter'] font-medium">Choose what you want to study</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const delay = index === 0 ? 'category-card-1' : index === 1 ? 'category-card-2' : 'category-card-3';
            
            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`group relative cursor-pointer animate-slide-up ${delay}`}
                onMouseEnter={() => setHoveredCard(category.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onMouseMove={(e) => handleCardMouseMove(category.id, e)}
              >
                <div 
                  className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl"
                  style={{
                    background: `radial-gradient(circle at ${mousePositions[category.id]?.x || 50}% ${mousePositions[category.id]?.y || 50}%, ${category.glowColor}, transparent 70%)`
                  }}
                ></div>

                <div className={`relative bg-gradient-to-br ${category.bgGradient} rounded-3xl p-7 sm:p-9 transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl border-2 border-white/50 backdrop-blur-sm overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 rounded-3xl" style={{
                      background: `conic-gradient(from 0deg, ${category.glowColor}, transparent, ${category.glowColor}, transparent)`,
                      animation: 'rotateGlow 4s linear infinite'
                    }}></div>
                  </div>

                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-r ${category.gradient} flex items-center justify-center mb-5 shadow-2xl group-hover:scale-110 transition-all duration-500 animate-float-medium relative z-10`}>
                    <Icon className="text-white" size={34} />
                  </div>

                  <div className="absolute top-4 right-4 z-10">
                    <span className={`text-[10px] font-['Inter'] font-bold px-3 py-1 rounded-full bg-gradient-to-r ${category.gradient} text-white shadow-lg`}>
                      {category.badge}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-2xl font-['Space_Grotesk'] font-extrabold text-gray-800 mb-2">
                      {category.label}
                    </h3>
                    <p className="text-sm font-['Inter'] text-gray-600 leading-relaxed mb-3">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-['Inter']">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Award size={14} className="text-amber-500" />
                        {category.stats}
                      </span>
                      <span className="w-px h-4 bg-gray-300"></span>
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <Zap size={14} />
                        Click to Explore
                      </span>
                    </div>
                  </div>

                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${category.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left rounded-b-3xl`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ========== SEMESTER STEP ==========
  const renderSemesterStep = () => {
    const availableSemesters = getAvailableSemesters();
    const categoryLabel = categories.find(c => c.id === selectedCategory)?.label || '';
    const categoryIcon = categories.find(c => c.id === selectedCategory)?.icon || BookOpen;
    const Icon = categoryIcon;
    const allSemesters = [1, 2, 3, 4, 5, 6, 7, 8];
    const hasData = (sem) => availableSemesters.includes(sem);

    const subjectCount = (sem) => {
      const data = getCategoryData();
      if (!data[sem]) return 0;
      return Object.keys(data[sem]).length;
    };

    return (
      <div className="animate-scale-in">
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-gray-700 font-['Inter'] font-semibold text-sm group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
            Back
          </button>
          <div className="flex items-center gap-3 glass-effect rounded-2xl px-5 py-3 shadow-lg border border-white/50">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${categories.find(c => c.id === selectedCategory)?.gradient} flex items-center justify-center shadow-md`}>
              <Icon className="text-white" size={18} />
            </div>
            <span className="font-['Space_Grotesk'] font-bold text-gray-800 text-lg">{categoryLabel}</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-100 to-blue-100 mb-4 shadow-inner">
            <Sparkles className="text-sky-600" size={16} />
            <span className="text-xs font-['Inter'] font-bold text-sky-700 tracking-widest uppercase">Step 2 of 3</span>
            <Sparkles className="text-sky-600" size={16} />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Select Your <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Semester</span>
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full mt-4"></div>
          <p className="text-gray-500 text-base mt-4 font-['Inter'] font-medium flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All semesters are unlocked!
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {allSemesters.map((sem, index) => {
            const isAvailable = hasData(sem);
            const colors = semesterColors[index % semesterColors.length];
            const cardId = `semester-${sem}`;
            const count = subjectCount(sem);
            
            return (
              <div
                key={sem}
                onClick={() => isAvailable && handleSemesterClick(sem)}
                className={`group relative cursor-pointer ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ animationDelay: `${index * 0.06}s` }}
                onMouseEnter={() => setHoveredCard(cardId)}
                onMouseLeave={() => setHoveredCard(null)}
                onMouseMove={(e) => handleCardMouseMove(cardId, e)}
              >
                {isAvailable && (
                  <div 
                    className="absolute -inset-1.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl"
                    style={{
                      background: `radial-gradient(circle at ${mousePositions[cardId]?.x || 50}% ${mousePositions[cardId]?.y || 50}%, ${colors.glow}, transparent 70%)`
                    }}
                  ></div>
                )}

                <div className={`relative bg-gradient-to-br ${isAvailable ? colors.bg : 'from-gray-50 to-gray-100'} rounded-2xl p-6 sm:p-8 text-center transition-all duration-500 ${isAvailable ? 'border-2 border-white/80 hover:-translate-y-3 hover:shadow-2xl animate-border-pulse' : 'border-2 border-gray-200'} overflow-hidden`}>
                  
                  {isAvailable && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  )}

                  {isAvailable && (
                    <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 rounded-2xl" style={{
                        background: `conic-gradient(from 0deg, ${colors.glow}, transparent, ${colors.glow}, transparent)`,
                        animation: 'rotateGlow 4s linear infinite'
                      }}></div>
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className={`text-5xl sm:text-6xl md:text-7xl font-['Space_Grotesk'] font-extrabold ${isAvailable ? `bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent` : 'text-gray-400'} leading-none`}>
                      {sem}
                    </div>
                    
                    <div className={`text-xs sm:text-sm font-['Inter'] font-semibold uppercase tracking-widest mt-2 ${isAvailable ? 'text-gray-500 group-hover:text-gray-700' : 'text-gray-400'}`}>
                      Semester
                    </div>

                    {isAvailable && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-['Inter'] font-bold shadow-lg shadow-emerald-200/50 animate-pop">
                        <CheckCircle size={12} />
                        Available
                      </div>
                    )}

                    {!isAvailable && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-200 text-gray-500 text-[10px] font-['Inter'] font-bold">
                        <Lock size={12} />
                        Coming Soon
                      </div>
                    )}

                    {isAvailable && (
                      <div className={`mt-4 h-0.5 w-12 bg-gradient-to-r ${colors.gradient} mx-auto rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center`}></div>
                    )}

                    {isAvailable && (
                      <div className="mt-3 text-xs font-['Inter'] font-medium text-gray-400">
                        {count} {count === 1 ? 'Subject' : 'Subjects'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-3 glass-effect px-5 py-3 rounded-2xl shadow-lg border border-white/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse"></div>
              <span className="font-['Inter'] font-bold text-gray-700">{availableSemesters.length}</span>
              <span className="font-['Inter'] text-gray-500">Semesters Available</span>
            </div>
          </div>
          <div className="flex items-center gap-3 glass-effect px-5 py-3 rounded-2xl shadow-lg border border-white/50">
            <Sparkles size={18} className="text-emerald-500" />
            <span className="font-['Inter'] font-bold text-emerald-600">All Content Unlocked</span>
            <Sparkles size={18} className="text-emerald-500" />
          </div>
        </div>
      </div>
    );
  };

  // ========== SUBJECT STEP ==========
  const renderSubjectStep = () => {
    const subjects = getAvailableSubjects();
    const categoryLabel = categories.find(c => c.id === selectedCategory)?.label || '';
    const categoryGradient = categories.find(c => c.id === selectedCategory)?.gradient || 'from-purple-500 to-pink-500';

    return (
      <div className="animate-slide-down">
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-gray-700 font-['Inter'] font-semibold text-sm group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
            Back
          </button>
          <div className="flex items-center gap-3 glass-effect rounded-2xl px-5 py-3 shadow-lg border border-white/50 flex-wrap">
            <span className="text-gray-500 text-sm font-['Inter'] font-medium">Category:</span>
            <span className="font-['Space_Grotesk'] font-bold text-gray-800">{categoryLabel}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm font-['Inter'] font-medium">Semester:</span>
            <span className="font-['Space_Grotesk'] font-bold text-gray-800">{selectedSemester}</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-5 shadow-inner">
            <Sparkles className="text-purple-600" size={18} />
            <span className="text-xs font-['Inter'] font-bold text-purple-700 tracking-widest uppercase">Step 3 of 3</span>
            <Trophy className="text-purple-600" size={18} />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Select Your <span className={`bg-gradient-to-r ${categoryGradient} bg-clip-text text-transparent`}>Subject</span>
          </h2>
          <div className={`w-24 h-1.5 bg-gradient-to-r ${categoryGradient} mx-auto rounded-full mt-4`}></div>
          <p className="text-gray-500 text-base mt-4 font-['Inter'] font-medium flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            Choose a subject to continue
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.5s' }}></span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {subjects.map((subject, index) => {
            const colors = subjectColors[index % subjectColors.length];
            const iconData = subjectIcons[index % subjectIcons.length];
            const Icon = iconData.icon;
            const cardId = `subject-${index}`;
            
            return (
              <div
                key={subject}
                onClick={() => handleSubjectClick(subject)}
                className={`group relative cursor-pointer animate-pop`}
                style={{ animationDelay: `${index * 0.06}s` }}
                onMouseEnter={() => setHoveredCard(cardId)}
                onMouseLeave={() => setHoveredCard(null)}
                onMouseMove={(e) => handleCardMouseMove(cardId, e)}
              >
                <div 
                  className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl"
                  style={{
                    background: `radial-gradient(circle at ${mousePositions[cardId]?.x || 50}% ${mousePositions[cardId]?.y || 50}%, ${colors.glow}, transparent 70%)`
                  }}
                ></div>

                <div className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl p-6 transition-all duration-500 border-2 border-white/80 hover:border-transparent hover:shadow-2xl hover:-translate-y-3 overflow-hidden group`}>
                  
                  <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 rounded-2xl" style={{
                      background: `conic-gradient(from 0deg, ${colors.glow}, transparent, ${colors.glow}, transparent)`,
                      animation: 'rotateGlow 4s linear infinite'
                    }}></div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconData.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300 shadow-md`}>
                          <Icon className={`${iconData.textColor}`} size={22} />
                        </div>
                        <div className="text-base sm:text-lg font-['Space_Grotesk'] font-extrabold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                          {subject}
                        </div>
                      </div>
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center text-white text-[10px] font-['Inter'] font-bold shadow-lg`}>
                        {index + 1}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${colors.gradient}`}></div>
                      <span className="text-xs font-['Inter'] font-medium text-gray-500">
                        Click to view units
                      </span>
                      <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${colors.gradient}`}></div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-['Inter'] font-medium text-gray-400 group-hover:text-purple-600 transition-colors duration-300 flex items-center gap-1">
                        Explore Subject
                        <ChevronRight className="group-hover:translate-x-1 transition-transform duration-300" size={14} />
                      </span>
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-lg transform group-hover:scale-110`}>
                        <ArrowRight className="text-white" size={16} />
                      </div>
                    </div>
                  </div>

                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colors.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl`}></div>

                  <div className="absolute top-4 right-4">
                    <div className={`w-2 h-2 rounded-full bg-gray-300 group-hover:bg-gradient-to-r ${colors.gradient} transition-all duration-300 group-hover:scale-150 animate-pulse`}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <FolderOpen className="text-gray-400" size={48} />
            </div>
            <h3 className="text-xl font-['Space_Grotesk'] font-bold text-gray-700">No Subjects Available</h3>
            <p className="font-['Inter'] text-gray-400 mt-2">Subjects for this semester are coming soon!</p>
          </div>
        )}
      </div>
    );
  };

  // ========== UNIT STEP - WITH PREVIEW + DOWNLOAD BUTTONS ==========
  const renderUnitStep = () => {
    const units = getUnits();
    const categoryLabel = categories.find(c => c.id === selectedCategory)?.label || '';

    const getUnitContent = (unit) => {
      if (!isSelectedUnit(unit)) return [];
      return Array.isArray(unitContent) ? unitContent : [];
    };

    const isSelectedUnit = (unit) => {
      return selectedUnit?.id === unit?.id;
    };

    return (
      <div className="animate-slide-up">
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-gray-700 font-['Inter'] font-semibold text-sm group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
            Back
          </button>
          <div className="flex items-center gap-3 glass-effect rounded-2xl px-5 py-3 shadow-lg border border-white/50 flex-wrap">
            <span className="text-gray-500 text-sm font-['Inter'] font-medium">Category:</span>
            <span className="font-['Space_Grotesk'] font-bold text-gray-800">{categoryLabel}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm font-['Inter'] font-medium">Semester:</span>
            <span className="font-['Space_Grotesk'] font-bold text-gray-800">{selectedSemester}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm font-['Inter'] font-medium">Subject:</span>
            <span className="font-['Space_Grotesk'] font-bold text-gray-800 truncate max-w-[120px]">{selectedSubject}</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 mb-5 shadow-inner">
            <Sparkles className="text-emerald-600" size={18} />
            <span className="text-xs font-['Inter'] font-bold text-emerald-700 tracking-widest uppercase">Select Unit</span>
            <Trophy className="text-emerald-600" size={18} />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Select Your <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Unit</span>
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 mx-auto rounded-full mt-4"></div>
          <p className="text-gray-500 text-base mt-4 font-['Inter'] font-medium flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Choose a unit to access content
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.5s' }}></span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {units.map((unit, index) => {
            const colors = unitColors[index % unitColors.length];
            const cardId = `unit-${unit.id}`;
            const isSelected = selectedUnit?.id === unit.id;
            const content = getUnitContent(unit);
            
            return (
              <div
                key={unit.id}
                onClick={() => handleUnitClick(unit)}
                className={`group relative cursor-pointer animate-pop`}
                style={{ animationDelay: `${index * 0.06}s` }}
                onMouseEnter={() => setHoveredCard(cardId)}
                onMouseLeave={() => setHoveredCard(null)}
                onMouseMove={(e) => handleCardMouseMove(cardId, e)}
              >
                <div 
                  className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl"
                  style={{
                    background: `radial-gradient(circle at ${mousePositions[cardId]?.x || 50}% ${mousePositions[cardId]?.y || 50}%, ${colors.glow}, transparent 70%)`
                  }}
                ></div>

                <div className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl p-6 transition-all duration-500 border-2 ${isSelected ? 'border-emerald-500 shadow-2xl scale-105' : 'border-white/80 hover:border-transparent hover:shadow-2xl hover:-translate-y-3'} overflow-hidden group`}>
                  
                  <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-0 rounded-2xl" style={{
                      background: `conic-gradient(from 0deg, ${colors.glow}, transparent, ${colors.glow}, transparent)`,
                      animation: 'rotateGlow 4s linear infinite'
                    }}></div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`text-4xl sm:text-5xl font-['Space_Grotesk'] font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                        {unit.name}
                      </div>
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center text-white text-xs font-['Inter'] font-bold shadow-lg`}>
                        {unit.id || index + 1}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${colors.gradient}`}></div>
                      <span className="text-xs font-['Inter'] font-medium text-gray-500">
                        {unit.topics?.length || 0} {unit.topics?.length === 1 ? 'Topic' : 'Topics'}
                      </span>
                      <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${colors.gradient}`}></div>
                    </div>

                    {unit.topics && unit.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {unit.topics.slice(0, 3).map((topic, i) => (
                          <span 
                            key={i} 
                            className={`text-xs font-['Inter'] font-medium px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm text-gray-700 shadow-sm border border-white/50 group-hover:shadow-md transition-all duration-300`}
                            style={{
                              animation: `pop 0.3s ease ${i * 0.05}s both`
                            }}
                          >
                            {topic}
                          </span>
                        ))}
                        {unit.topics.length > 3 && (
                          <span className="text-xs font-['Inter'] font-medium px-3 py-1.5 rounded-full bg-gray-200/70 text-gray-500">
                            +{unit.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {isSelected && content.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-gray-200/50">
                        <p className="text-xs font-['Inter'] font-medium text-gray-500 mb-3">📄 Content Available</p>
                        <div className="flex gap-2.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(content[0]);
                            }}
                            disabled={loadingItemId === content[0]?._id}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2.5 rounded-xl font-['Inter'] font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50"
                          >
                            <Eye size={16} />
                            {loadingItemId === content[0]?._id ? 'Loading...' : 'Preview'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(content[0]);
                            }}
                            disabled={loadingItemId === content[0]?._id}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-2.5 rounded-xl font-['Inter'] font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50"
                          >
                            <Download size={16} />
                            {loadingItemId === content[0]?._id ? 'Downloading...' : 'Download'}
                          </button>
                        </div>
                      </div>
                    )}

                    {isSelected && content.length === 0 && (
                      <div className="mt-5 pt-4 border-t border-gray-200/50">
                        <p className="text-xs font-['Inter'] text-gray-400">No content available yet</p>
                      </div>
                    )}

                    {!isSelected && (
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xs font-['Inter'] font-medium text-gray-400 group-hover:text-emerald-600 transition-colors duration-300 flex items-center gap-1">
                          Click to select
                          <ChevronRight className="group-hover:translate-x-1 transition-transform duration-300" size={14} />
                        </span>
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-lg transform group-hover:scale-110`}>
                          <ArrowRight className="text-white" size={16} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colors.gradient} transform ${isSelected ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'} transition-transform duration-500 rounded-b-2xl`}></div>

                  <div className="absolute top-4 right-4">
                    <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-gray-300 group-hover:bg-gradient-to-r group-hover:bg-emerald-500'} transition-all duration-300 group-hover:scale-150 animate-pulse`}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {units.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <FolderOpen className="text-gray-400" size={48} />
            </div>
            <h3 className="text-xl font-['Space_Grotesk'] font-bold text-gray-700">No Units Available</h3>
            <p className="font-['Inter'] text-gray-400 mt-2">Units for this subject are coming soon!</p>
          </div>
        )}
      </div>
    );
  };

  // ========== PROGRESS INDICATOR ==========
  const renderProgress = () => {
    const steps = [
      { number: 1, label: "Category", icon: BookOpen },
      { number: 2, label: "Semester", icon: GraduationCap },
      { number: 3, label: "Subject", icon: Book },
      { number: 4, label: "Unit", icon: Layers }
    ];

    return (
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const Icon = step.icon;
          
          return (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-['Inter'] font-bold text-sm transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200' 
                    : isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-200 scale-110 animate-pulse-glow' 
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? <CheckCircle size={20} /> : <Icon size={18} />}
                  {isActive && (
                    <div className="absolute -inset-1 rounded-full border-2 border-blue-400/50 animate-pulse"></div>
                  )}
                </div>
                <span className={`text-xs sm:text-sm font-['Inter'] font-medium hidden sm:inline ${
                  isActive ? 'text-blue-600 font-bold' : isCompleted ? 'text-emerald-600' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-all duration-500 ${
                  isCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff' },
          success: { duration: 3000, style: { background: '#10b981', color: '#fff' } },
          error: { duration: 4000, style: { background: '#ef4444', color: '#fff' } },
        }}
      />

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 flex items-center gap-3 shadow-2xl">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-['Inter'] text-gray-700 font-medium">Loading...</span>
          </div>
        </div>
      )}

      {!isPremium && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-bounce w-[90%] sm:w-auto">
          <button
            onClick={handlePremiumPurchase}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-2xl font-['Inter'] font-bold shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 text-sm sm:text-base w-full justify-center"
          >
            <Crown size={20} className="text-yellow-300" />
            <span>Get Premium - ₹{premiumPrice}</span>
            <Rocket size={20} className="text-yellow-300" />
          </button>
        </div>
      )}

      {isPremium && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-[90%] sm:w-auto">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-['Inter'] font-bold shadow-xl flex items-center gap-3 text-sm sm:text-base">
            <Gem size={18} className="text-yellow-300" />
            Premium Member
            <Shield size={18} className="text-yellow-300" />
          </div>
        </div>
      )}

      <div className="w-screen bg-[#07192d] overflow-hidden relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="relative h-[260px] sm:h-[320px] md:h-[450px] w-full">
          <div 
            className="absolute right-0 top-0 w-[70%] h-full bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${bannerImg})`,
              backgroundPosition: 'center 40%'
            }}
          >
            <div className="absolute inset-0 bg-black/35"></div>
          </div>
          <div className="absolute left-0 top-0 h-full w-[62%] bg-[#04172c]" style={{ clipPath: "polygon(0 0, 78% 0, 58% 100%, 0% 100%)" }}></div>
          <div className="absolute left-[18%] top-0 h-full w-[22%] bg-[#0a2747]/80 backdrop-blur-md" style={{ clipPath: "polygon(35% 0, 100% 0, 65% 100%, 0% 100%)" }}></div>
          <div className="relative z-20 flex items-center h-full px-4 sm:px-6 md:px-20">
            <div className="max-w-[520px]">
              <h1 className="text-white text-3xl sm:text-4xl md:text-7xl font-['Space_Grotesk'] font-extrabold leading-tight mb-3 sm:mb-5">
                Bachelor<br /><span className="text-sky-400">of Pharmacy</span>
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm md:text-lg font-['Inter'] leading-relaxed mb-5 sm:mb-8 max-w-[500px]">
                Complete Notes, Semester-wise PDFs, Practical Videos & Predictive Papers for B.Pharm Students.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-14">
        
        {currentStep > 1 && renderProgress()}

        <div className="step-container">
          {currentStep === 1 && renderCategoryStep()}
          {currentStep === 2 && renderSemesterStep()}
          {currentStep === 3 && renderSubjectStep()}
          {currentStep === 4 && renderUnitStep()}
        </div>

        {currentStep > 1 && (
          <div className="text-center mt-10">
            <button
              onClick={resetNavigation}
              className="text-gray-400 hover:text-gray-600 text-sm font-['Inter'] transition-colors duration-300 group flex items-center gap-2 mx-auto"
            >
              <span className="w-6 h-0.5 bg-gray-300 group-hover:bg-gray-500 transition-colors"></span>
              Start Over
              <span className="w-6 h-0.5 bg-gray-300 group-hover:bg-gray-500 transition-colors"></span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BPharm;