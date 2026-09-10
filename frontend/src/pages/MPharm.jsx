import { useState, useEffect, useRef } from "react";
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
  Beaker,
  Mail,
  Send,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.pharmaverse.co.in";
const SUPPORT_EMAIL = "pharmaversehelpline@gmail.com";

// ========== BRANCHES (M.Pharm specializations) ==========
const branches = [
  {
    id: "Pharmaceutics",
    label: "Pharmaceutics",
    icon: FlaskRound,
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    bgGradient: "from-blue-50 via-indigo-50 to-purple-50",
    glowColor: "rgba(99, 102, 241, 0.3)",
    description: "Drug delivery, formulation & modern pharmaceutics",
    stats: "4 Semesters",
    badge: "💊 Core",
  },
  {
    id: "Pharmacology",
    label: "Pharmacology",
    icon: HeartPulse,
    gradient: "from-rose-500 via-pink-500 to-purple-500",
    bgGradient: "from-rose-50 via-pink-50 to-purple-50",
    glowColor: "rgba(244, 63, 94, 0.3)",
    description: "Drug action, screening & molecular pharmacology",
    stats: "4 Semesters",
    badge: "🔬 Research",
  },
  {
    id: "Pharmaceutical Chemistry",
    label: "Pharmaceutical Chemistry",
    icon: Beaker,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    bgGradient: "from-emerald-50 via-teal-50 to-cyan-50",
    glowColor: "rgba(16, 185, 129, 0.3)",
    description: "Organic, medicinal & analytical chemistry",
    stats: "4 Semesters",
    badge: "⚗️ Chemistry",
  },
  {
    id: "Pharmacognosy",
    label: "Pharmacognosy",
    icon: Leaf,
    gradient: "from-amber-500 via-orange-500 to-yellow-500",
    bgGradient: "from-amber-50 via-orange-50 to-yellow-50",
    glowColor: "rgba(251, 146, 60, 0.3)",
    description: "Natural products, phytochemistry & herbal drugs",
    stats: "4 Semesters",
    badge: "🌿 Herbal",
  },
  {
    id: "Regulatory Affairs",
    label: "Regulatory Affairs",
    icon: Shield,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    bgGradient: "from-violet-50 via-purple-50 to-fuchsia-50",
    glowColor: "rgba(139, 92, 246, 0.3)",
    description: "Drug regulations, documentation & compliance",
    stats: "4 Semesters",
    badge: "📋 Regulatory",
  },
];

// ========== CATEGORIES ==========
const categories = [
  {
    id: "Notes",
    label: "Notes",
    icon: BookOpen,
    gradient: "from-blue-600 via-indigo-600 to-purple-600",
    bgGradient: "from-blue-50 via-indigo-50 to-purple-50",
    glowColor: "rgba(99, 102, 241, 0.3)",
    description: "Click below to view notes",
    stats: "500+ PDFs",
    badge: "Most Popular",
  },
  {
    id: "Exam Crash Course",
    label: "Exam Crash Course",
    icon: Rocket,
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    bgGradient: "from-orange-50 via-amber-50 to-yellow-50",
    glowColor: "rgba(251, 146, 60, 0.3)",
    description: "Click below to view Exam Crash Course",
    stats: "4 Semesters",
    badge: "🔥 Crash",
  },
  {
    id: "PYQs",
    label: "PYQs",
    icon: Brain,
    gradient: "from-rose-500 via-pink-500 to-purple-500",
    bgGradient: "from-rose-50 via-pink-50 to-purple-50",
    glowColor: "rgba(244, 63, 94, 0.3)",
    description: "Click below to view PYQs",
    stats: "1000+ Questions",
    badge: "📝 Exam",
  },
];

// ========== M.PHARM SUBJECTS BY BRANCH + SEMESTER ==========
const MPHARM_SUBJECTS = {
  "Pharmaceutical Chemistry": {
    1: [
      "Modern Pharmaceutical Analytical Techniques",
      "Advanced Organic Chemistry-I",
      "Advanced Medicinal Chemistry",
      "Chemistry of Natural Products",
    ],
    2: [
      "Advanced Spectral Analysis",
      "Advanced Organic Chemistry-II",
      "Computer Aided Drug Design",
      "Pharmaceutical Process Chemistry",
    ],
    3: ["Research Methodology & Biostatistics", "Research Work"],
    4: ["Research Work"],
  },
  Pharmacognosy: {
    1: [
      "Modern Pharmaceutical Analytical Techniques",
      "Advanced Pharmacognosy-I",
      "Phytochemistry",
      "Industrial Pharmacognostical Technology",
    ],
    2: [
      "Medicinal Biotechnology",
      "Advanced Pharmacognosy-II",
      "Indian System of Medicine",
      "Herbal Cosmetics",
    ],
    3: ["Research Methodology & Biostatistics", "Research Work"],
    4: ["Research Work"],
  },
  Pharmaceutics: {
    1: [
      "Modern Pharmaceutical Analytical Techniques",
      "Drug Delivery System",
      "Modern Pharmaceutics",
      "Regulatory Affair",
    ],
    2: [
      "Molecular Pharmaceutics (Nano Tech and Targeted DDS)",
      "Advanced Biopharmaceutics & Pharmacokinetics",
      "Computer Aided Drug Delivery System",
      "Cosmetic and Cosmeceuticals",
    ],
    3: ["Research Methodology & Biostatistics", "Research Work"],
    4: ["Research Work"],
  },
  Pharmacology: {
    1: [
      "Modern Pharmaceutical Analytical Techniques",
      "Advanced Pharmacology-I",
      "Pharmacological and Toxicological Screening Methods-I",
      "Cellular and Molecular Pharmacology",
    ],
    2: [
      "Advanced Pharmacology-II",
      "Pharmacological and Toxicological Screening Methods-II",
      "Principles of Drug Discovery",
      "Experimental Pharmacology Practical-II",
    ],
    3: ["Research Methodology & Biostatistics", "Research Work"],
    4: ["Research Work"],
  },
  "Regulatory Affairs": {
    1: [
      "Good Regulatory Practices",
      "Documentation and Regulatory Writing",
      "Clinical Research Regulations",
      "Regulations and Legislation for Drugs & Cosmetics, Medical Devices, Biologicals & Herbals, and Food & Nutraceuticals in India and Intellectual Property Rights",
    ],
    2: [
      "Regulatory Aspects of Drugs & Cosmetics",
      "Regulatory Aspects of Herbal & Biologicals",
      "Regulatory Aspects of Medical Devices",
      "Regulatory Aspects of Food & Nutraceuticals",
    ],
    3: ["Research Methodology & Biostatistics", "Research Work"],
    4: ["Research Work"],
  },
};

// ========== SEMESTER COLORS ==========
const semesterColors = [
  { gradient: "from-rose-500 to-pink-500", glow: "rgba(244, 63, 94, 0.5)", bg: "from-rose-50 to-pink-50", border: "border-rose-200", shadow: "shadow-rose-200/50" },
  { gradient: "from-blue-500 to-cyan-500", glow: "rgba(59, 130, 246, 0.5)", bg: "from-blue-50 to-cyan-50", border: "border-blue-200", shadow: "shadow-blue-200/50" },
  { gradient: "from-emerald-500 to-teal-500", glow: "rgba(16, 185, 129, 0.5)", bg: "from-emerald-50 to-teal-50", border: "border-emerald-200", shadow: "shadow-emerald-200/50" },
  { gradient: "from-purple-500 to-indigo-500", glow: "rgba(139, 92, 246, 0.5)", bg: "from-purple-50 to-indigo-50", border: "border-purple-200", shadow: "shadow-purple-200/50" },
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

const MPharm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ========== STEP NAVIGATION ==========
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePositions, setMousePositions] = useState({});

  // ========== API STATES ==========
  const [units, setUnits] = useState([]);
  const [unitContent, setUnitContent] = useState([]);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [contentError, setContentError] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [premiumPrice, setPremiumPrice] = useState(999);

  // ========== REQUEST CONTROL ==========
  const contentRequestIdRef = useRef(0);
  const contentAbortControllerRef = useRef(null);
  const contentCacheRef = useRef(new Map());

  // ========== HELPERS ==========
  const isResearchWork = (subject) =>
    String(subject || "").trim().toLowerCase() === "research work";

  const getAvailableSubjects = () => {
    const branchData = MPHARM_SUBJECTS[selectedBranch];
    if (!branchData) return [];
    const semester = Number(selectedSemester);
    return Array.isArray(branchData[semester]) ? branchData[semester] : [];
  };

  // ========== FETCH ALL CONTENT FOR THE SELECTED SUBJECT ==========
  const fetchUnitContent = async () => {
    if (!selectedBranch || !selectedCategory || !selectedSemester || !selectedSubject) {
      setUnitContent([]);
      setUnits([]);
      setIsContentLoading(false);
      setContentError("");
      return;
    }

    if (isResearchWork(selectedSubject)) {
      setUnitContent([]);
      setUnits([]);
      setIsContentLoading(false);
      setContentError("");
      return;
    }

    const cacheKey = [
      "M.Pharm",
      String(selectedBranch).trim(),
      String(selectedCategory).trim(),
      String(selectedSemester).trim(),
      String(selectedSubject).trim(),
    ].join("||");

    const requestId = ++contentRequestIdRef.current;

    if (contentAbortControllerRef.current) {
      contentAbortControllerRef.current.abort();
      contentAbortControllerRef.current = null;
    }

    const cached = contentCacheRef.current.get(cacheKey);
    if (cached) {
      setUnitContent(cached.content);
      setUnits(cached.units);
    } else {
      setUnitContent([]);
      setUnits([]);
    }

    setIsContentLoading(true);
    setContentError("");

    const controller = new AbortController();
    contentAbortControllerRef.current = controller;

    const buildUnits = (rawContent) => {
      const unitMap = new Map();

      rawContent.forEach((item) => {
        const unitValue = Number(item?.unit);
        if (!Number.isInteger(unitValue) || unitValue <= 0) return;

        if (!unitMap.has(unitValue)) {
          unitMap.set(unitValue, {
            id: unitValue,
            name: `Unit ${unitValue}`,
            topics: [],
          });
        }

        const topic =
          item?.topic ?? item?.topicName ?? item?.chapter ?? item?.chapterName;

        if (topic && !unitMap.get(unitValue).topics.includes(String(topic))) {
          unitMap.get(unitValue).topics.push(String(topic));
        }
      });

      return Array.from(unitMap.values()).sort((a, b) => a.id - b.id);
    };

    const getRawContent = (data) => {
      if (Array.isArray(data)) return data;
      const candidates = [data?.data, data?.notes, data?.documents, data?.results, data?.items];
      for (const value of candidates) {
        if (Array.isArray(value)) return value;
      }
      return [];
    };

    try {
      let res;

      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          res = await axios.get(`${API_BASE}/api/admin/public/notes`, {
            params: {
              course: "M.Pharm",
              branch: selectedBranch,
              category: selectedCategory,
              semester: selectedSemester,
              subject: selectedSubject,
            },
            signal: controller.signal,
            timeout: 12000,
            headers: {
              Accept: "application/json",
              "Cache-Control": "no-cache",
            },
          });
          break;
        } catch (error) {
          if (
            error?.code === "ERR_CANCELED" ||
            error?.name === "CanceledError" ||
            controller.signal.aborted
          ) {
            return;
          }

          if (attempt === 2) throw error;
          await new Promise((resolve) => setTimeout(resolve, 350));
        }
      }

      if (requestId !== contentRequestIdRef.current) return;

      const rawContent = getRawContent(res?.data)
        .filter(Boolean)
        .filter((item) => {
          const itemSemester = item?.semester;
          const itemSubject = item?.subject;
          const itemCategory = item?.category;
          const itemBranch = item?.branch;

          const semesterMatches =
            itemSemester == null ||
            String(itemSemester).trim() === String(selectedSemester).trim();

          const subjectMatches =
            itemSubject == null ||
            String(itemSubject).trim() === String(selectedSubject).trim();

          const categoryMatches =
            itemCategory == null ||
            String(itemCategory).trim() === String(selectedCategory).trim();

          const branchMatches =
            itemBranch == null ||
            String(itemBranch).trim() === String(selectedBranch).trim();

          return semesterMatches && subjectMatches && categoryMatches && branchMatches;
        });

      const derivedUnits = buildUnits(rawContent);

      contentCacheRef.current.set(cacheKey, {
        content: rawContent,
        units: derivedUnits,
        timestamp: Date.now(),
      });

      setUnitContent(rawContent);
      setUnits(derivedUnits);
      setContentError("");
    } catch (error) {
      if (
        error?.code === "ERR_CANCELED" ||
        error?.name === "CanceledError" ||
        controller.signal.aborted
      ) {
        return;
      }

      if (requestId !== contentRequestIdRef.current) return;

      console.error("Failed to fetch subject content:", error);
      setContentError(
        error?.response?.data?.message ||
          "Content load nahi ho paaya. Please try again."
      );

      if (!cached) {
        setUnitContent([]);
        setUnits([]);
      }
    } finally {
      if (requestId === contentRequestIdRef.current) {
        setIsContentLoading(false);
        contentAbortControllerRef.current = null;
      }
    }
  };

  useEffect(() => {
    fetchUnitContent();

    return () => {
      if (contentAbortControllerRef.current) {
        contentAbortControllerRef.current.abort();
        contentAbortControllerRef.current = null;
      }
    };
  }, [selectedBranch, selectedCategory, selectedSemester, selectedSubject]);

  // ========== HANDLERS ==========
  const handleBranchClick = (branchId) => {
    setSelectedBranch(branchId);
    setCurrentStep(2);
    setSelectedCategory(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setUnits([]);
    setUnitContent([]);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentStep(3);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setUnits([]);
    setUnitContent([]);
  };

  const handleSemesterClick = (semester) => {
    setSelectedSemester(semester);
    setCurrentStep(4);
    setSelectedSubject(null);
    setUnits([]);
    setUnitContent([]);
  };

  const handleSubjectClick = (subject) => {
    // Research Work → open Gmail compose with prefilled To, Subject, Body
    // User apni Gmail ID se mail bhejega, but To = pharmaversehelpline@gmail.com
    if (isResearchWork(subject)) {
      const mailSubject = `M.Pharm ${selectedBranch} – Research Work Guidance (Semester ${selectedSemester})`;

      const mailBody =
        `Respected Pharmaverse Team,\n\n` +
        `I am an M.Pharm (${selectedBranch}) student from Semester ${selectedSemester}.\n` +
        `I need guidance and support for my Research Work.\n\n` +
        `Please share the required details, guidelines and next steps.\n\n` +
        `Course: M.Pharm\n` +
        `Branch: ${selectedBranch}\n` +
        `Semester: ${selectedSemester}\n` +
        `Subject: ${subject}\n\n` +
        `Thank you.\n`;

      const gmailUrl =
        `https://mail.google.com/mail/?view=cm&fs=1` +
        `&to=${encodeURIComponent(SUPPORT_EMAIL)}` +
        `&su=${encodeURIComponent(mailSubject)}` +
        `&body=${encodeURIComponent(mailBody)}`;

      const win = window.open(gmailUrl, "_blank", "noopener,noreferrer");
      if (!win) {
        toast.error("Please allow popups to open Gmail");
      } else {
        toast.success("Gmail opened — get guidance & support!");
      }
      return;
    }

    setSelectedSubject(subject);
    setCurrentStep(5);
    setUnits([]);
    setUnitContent([]);
  };

  const goBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setSelectedBranch(null);
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setSelectedCategory(null);
    } else if (currentStep === 4) {
      setCurrentStep(3);
      setSelectedSemester(null);
    } else if (currentStep === 5) {
      setCurrentStep(4);
      setSelectedSubject(null);
      setUnits([]);
      setUnitContent([]);
    }
  };

  const resetNavigation = () => {
    setCurrentStep(1);
    setSelectedBranch(null);
    setSelectedCategory(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setUnits([]);
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
      @keyframes premiumFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      @keyframes premiumShine {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes premiumPulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
      }
      @keyframes premiumBorderFlow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes premiumSparkle {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
        50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
      }
      @keyframes premiumNumberPop {
        0% { transform: scale(1); }
        50% { transform: scale(1.1) rotate(-3deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      @keyframes floatText {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
      }
      @keyframes pulseRing {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.3); opacity: 0; }
      }
      @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .premium-card {
        animation: premiumFloat 4s ease-in-out infinite;
        transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      }
      .premium-card::before {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 16px;
        padding: 2px;
        background: linear-gradient(90deg,
          rgba(99,102,241,0.3),
          rgba(168,85,247,0.3),
          rgba(236,72,153,0.3),
          rgba(99,102,241,0.3)
        );
        background-size: 300% 100%;
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        animation: premiumBorderFlow 6s ease-in-out infinite;
        opacity: 0.7;
        pointer-events: none;
      }
      .premium-card .glow-ring {
        position: absolute;
        inset: -4px;
        border-radius: 18px;
        background: radial-gradient(circle at var(--x, 50%) var(--y, 50%),
          rgba(255,255,255,0.15) 0%,
          transparent 60%
        );
        opacity: 0.6;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .premium-card .shine-overlay {
        position: absolute;
        inset: 0;
        border-radius: 14px;
        background: linear-gradient(
          135deg,
          rgba(255,255,255,0.4) 0%,
          rgba(255,255,255,0) 40%,
          rgba(255,255,255,0) 60%,
          rgba(255,255,255,0.2) 100%
        );
        background-size: 300% 100%;
        animation: premiumShine 8s ease-in-out infinite;
        pointer-events: none;
      }
      .premium-card .sparkle-dot { animation: premiumSparkle 3s ease-in-out infinite; }
      .premium-card .number-glow { animation: premiumNumberPop 3s ease-in-out infinite; }
      .premium-card .status-pulse { animation: premiumPulse 2s ease-in-out infinite; }
      .premium-card:hover {
        transform: translateY(-12px) scale(1.02);
        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      }
      .premium-card:hover .glow-ring { opacity: 1; }
      .premium-card .gradient-text {
        background-size: 200% auto;
        animation: premiumShine 4s ease-in-out infinite;
      }

      .branch-card-1 { animation-delay: 0.1s; }
      .branch-card-2 { animation-delay: 0.2s; }
      .branch-card-3 { animation-delay: 0.3s; }
      .branch-card-4 { animation-delay: 0.4s; }
      .branch-card-5 { animation-delay: 0.5s; }

      .category-card-1 { animation-delay: 0.1s; }
      .category-card-2 { animation-delay: 0.2s; }
      .category-card-3 { animation-delay: 0.3s; }

      .semester-card-1 { animation-delay: 0s; }
      .semester-card-2 { animation-delay: 0.3s; }
      .semester-card-3 { animation-delay: 0.6s; }
      .semester-card-4 { animation-delay: 0.9s; }

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

      .animate-float-medium { animation: floatMedium 3.5s ease-in-out infinite; }
      .animate-slide-up { animation: slideUp 0.7s cubic-bezier(0.23, 1, 0.32, 1) both; }
      .animate-slide-down { animation: slideDown 0.6s cubic-bezier(0.23, 1, 0.32, 1) both; }
      .animate-scale-in { animation: scaleIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) both; }
      .animate-pulse-glow { animation: pulseGlow 2.5s ease-in-out infinite; }
      .animate-border-pulse { animation: borderPulse 2s ease-in-out infinite; }
      .animate-pop { animation: pop 0.5s cubic-bezier(0.23, 1, 0.32, 1) both; }
      .animate-float-text { animation: floatText 3s ease-in-out infinite; }
      .animate-gradient { animation: gradientMove 8s ease-in-out infinite; background-size: 200% 200%; }

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

      .pulse-ring { animation: pulseRing 2s ease-out infinite; }

      @media (max-width: 768px) {
        .semester-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
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
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    return () => {
      contentRequestIdRef.current += 1;
      if (contentAbortControllerRef.current) {
        contentAbortControllerRef.current.abort();
        contentAbortControllerRef.current = null;
      }
    };
  }, []);

  const handleCardMouseMove = (cardId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePositions((prev) => ({ ...prev, [cardId]: { x, y } }));
  };

  const handleCardMouseLeave = (cardId) => {
    setHoveredCard(null);
    setMousePositions((prev) => {
      const newState = { ...prev };
      delete newState[cardId];
      return newState;
    });
  };

  // ========== VIEW & DOWNLOAD ==========
  const handleView = (item) => {
    if (!item?._id || !/^[a-fA-F0-9]{24}$/.test(String(item._id))) {
      toast.error("Invalid document ID");
      return;
    }

    const previewUrl = `${API_BASE}/api/admin/public/preview/note/${item._id}`;
    const win = window.open(previewUrl, "_blank", "noopener,noreferrer");
    if (!win) toast.error("Please allow popups to preview the PDF");
  };

  const handleDownload = (item) => {
    if (!item?._id || !/^[a-fA-F0-9]{24}$/.test(String(item._id))) {
      toast.error("Invalid document ID");
      return;
    }

    const downloadUrl = `${API_BASE}/api/admin/public/download/note/${item._id}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Download started!");
  };

  const handlePremiumPurchase = async () => {
    toast.info("💎 Premium purchase flow - Coming soon!");
  };

  // ========== RENDER BRANCH STEP ==========
  const renderBranchStep = () => {
    return (
      <div className="animate-slide-up">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-100 to-blue-100 mb-4 animate-float-text">
            <Sparkles className="text-sky-600" size={16} />
            <span className="text-xs font-['Inter'] font-bold text-sky-700 tracking-wider uppercase">
              M.Pharm
            </span>
            <Sparkles className="text-sky-600" size={16} />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Select Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              Branch
            </span>
          </h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full mt-4 animate-gradient"></div>
          <p className="text-gray-500 text-base mt-4 font-['Inter'] font-medium">
            Choose your specialization to continue
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {branches.map((branch, index) => {
            const Icon = branch.icon;
            const delayClass = `branch-card-${index + 1}`;

            return (
              <div
                key={branch.id}
                onClick={() => handleBranchClick(branch.id)}
                className={`group relative cursor-pointer animate-slide-up ${delayClass}`}
                onMouseEnter={() => setHoveredCard(branch.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onMouseMove={(e) => handleCardMouseMove(branch.id, e)}
              >
                <div
                  className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl"
                  style={{
                    background: `radial-gradient(circle at ${mousePositions[branch.id]?.x || 50}% ${mousePositions[branch.id]?.y || 50}%, ${branch.glowColor}, transparent 70%)`,
                  }}
                ></div>

                <div
                  className={`relative bg-gradient-to-br ${branch.bgGradient} rounded-3xl p-7 sm:p-8 transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl border-2 border-white/50 backdrop-blur-sm overflow-hidden h-full`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  <div className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        background: `conic-gradient(from 0deg, ${branch.glowColor}, transparent, ${branch.glowColor}, transparent)`,
                        animation: "rotateGlow 4s linear infinite",
                      }}
                    ></div>
                  </div>

                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${branch.gradient} flex items-center justify-center mb-5 shadow-2xl group-hover:scale-110 transition-all duration-500 animate-float-medium relative z-10`}
                  >
                    <Icon className="text-white" size={34} />
                  </div>

                  <div className="absolute top-4 right-4 z-10">
                    <span
                      className={`text-[10px] font-['Inter'] font-bold px-3 py-1 rounded-full bg-gradient-to-r ${branch.gradient} text-white shadow-lg animate-pulse`}
                    >
                      {branch.badge}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-xl sm:text-2xl font-['Space_Grotesk'] font-extrabold text-gray-800 mb-2">
                      {branch.label}
                    </h3>
                    <p className="text-sm font-['Inter'] text-gray-600 leading-relaxed mb-3">
                      {branch.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-['Inter']">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Award size={14} className="text-amber-500" />
                        {branch.stats}
                      </span>
                      <span className="w-px h-4 bg-gray-300"></span>
                      <span className="flex items-center gap-1 text-emerald-600 font-medium group-hover:gap-2 transition-all duration-300">
                        <Zap size={14} />
                        Click to Explore
                      </span>
                    </div>
                  </div>

                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${branch.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left rounded-b-3xl`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ========== RENDER CATEGORY STEP ==========
  const renderCategoryStep = () => {
    const branchLabel =
      branches.find((b) => b.id === selectedBranch)?.label || "";
    const branchIcon = branches.find((b) => b.id === selectedBranch)?.icon || BookOpen;
    const Icon = branchIcon;
    const branchGradient =
      branches.find((b) => b.id === selectedBranch)?.gradient ||
      "from-purple-500 to-pink-500";

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
          <div className="flex items-center gap-3 glass-effect rounded-2xl px-5 py-3 shadow-lg border border-white/50">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-r ${branchGradient} flex items-center justify-center shadow-md animate-pulse`}
            >
              <Icon className="text-white" size={18} />
            </div>
            <span className="font-['Space_Grotesk'] font-bold text-gray-800 text-lg">
              {branchLabel}
            </span>
          </div>
        </div>

        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-4 animate-float-text">
            <Sparkles className="text-purple-600" size={16} />
            <span className="text-xs font-['Inter'] font-bold text-purple-700 tracking-wider uppercase">
              Step 2 of 4
            </span>
            <Sparkles className="text-purple-600" size={16} />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Select Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              Category
            </span>
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full mt-4 animate-gradient"></div>
          <p className="text-gray-500 text-base mt-4 font-['Inter'] font-medium">
            Choose what you want to study
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {categories.map((category, index) => {
            const CatIcon = category.icon;
            const delay = `category-card-${index + 1}`;

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
                    background: `radial-gradient(circle at ${mousePositions[category.id]?.x || 50}% ${mousePositions[category.id]?.y || 50}%, ${category.glowColor}, transparent 70%)`,
                  }}
                ></div>

                <div
                  className={`relative bg-gradient-to-br ${category.bgGradient} rounded-3xl p-7 sm:p-9 transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl border-2 border-white/50 backdrop-blur-sm overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  <div className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div
                      className="absolute inset-0 rounded-3xl"
                      style={{
                        background: `conic-gradient(from 0deg, ${category.glowColor}, transparent, ${category.glowColor}, transparent)`,
                        animation: "rotateGlow 4s linear infinite",
                      }}
                    ></div>
                  </div>

                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-r ${category.gradient} flex items-center justify-center mb-5 shadow-2xl group-hover:scale-110 transition-all duration-500 animate-float-medium relative z-10`}
                  >
                    <CatIcon className="text-white" size={34} />
                  </div>

                  <div className="absolute top-4 right-4 z-10">
                    <span
                      className={`text-[10px] font-['Inter'] font-bold px-3 py-1 rounded-full bg-gradient-to-r ${category.gradient} text-white shadow-lg animate-pulse`}
                    >
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
                      <span className="flex items-center gap-1 text-emerald-600 font-medium group-hover:gap-2 transition-all duration-300">
                        <Zap size={14} />
                        Click to Explore
                      </span>
                    </div>
                  </div>

                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${category.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left rounded-b-3xl`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ========== RENDER SEMESTER STEP ==========
  const renderSemesterStep = () => {
    const branchLabel =
      branches.find((b) => b.id === selectedBranch)?.label || "";
    const categoryLabel =
      categories.find((c) => c.id === selectedCategory)?.label || "";
    const branchData = MPHARM_SUBJECTS[selectedBranch] || {};
    const allSemesters = [1, 2, 3, 4];
    const hasData = (sem) => Array.isArray(branchData[sem]) && branchData[sem].length > 0;

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
          <div className="flex items-center gap-3 glass-effect rounded-2xl px-5 py-3 shadow-lg border border-white/50 flex-wrap">
            <span className="text-gray-500 text-sm font-['Inter'] font-medium">Branch:</span>
            <span className="font-['Space_Grotesk'] font-bold text-gray-800">{branchLabel}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm font-['Inter'] font-medium">Category:</span>
            <span className="font-['Space_Grotesk'] font-bold text-gray-800">{categoryLabel}</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-100 to-blue-100 mb-4 shadow-inner animate-float-text">
            <Sparkles className="text-sky-600" size={16} />
            <span className="text-xs font-['Inter'] font-bold text-sky-700 tracking-widest uppercase">
              Step 3 of 4
            </span>
            <Sparkles className="text-sky-600" size={16} />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Select Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              Semester
            </span>
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full mt-4 animate-gradient"></div>
          <p className="text-gray-500 text-base mt-4 font-['Inter'] font-medium flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All semesters are unlocked!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6 max-w-4xl mx-auto">
          {allSemesters.map((sem, index) => {
            const isAvailable = hasData(sem);
            const colors = semesterColors[index % semesterColors.length];
            const cardId = `semester-${sem}`;
            const delayClass = `semester-card-${index + 1}`;

            return (
              <div
                key={sem}
                onClick={() => isAvailable && handleSemesterClick(sem)}
                className={`group relative cursor-pointer ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isAvailable && (
                  <div
                    className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl"
                    style={{
                      background: `radial-gradient(circle at ${mousePositions[cardId]?.x || 50}% ${mousePositions[cardId]?.y || 50}%, ${colors.glow}, transparent 68%)`,
                    }}
                  ></div>
                )}

                <div
                  className={`relative rounded-2xl p-5 sm:p-6 text-center transition-all duration-500 overflow-hidden premium-card ${delayClass}
                    ${
                      isAvailable
                        ? `bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-xl ${colors.shadow}`
                        : "bg-gray-100 border-2 border-gray-200"
                    }`}
                  style={
                    isAvailable
                      ? {
                          boxShadow: `0 8px 32px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)`,
                        }
                      : undefined
                  }
                >
                  {isAvailable && (
                    <>
                      <div
                        className="glow-ring"
                        style={{
                          "--x": `${mousePositions[cardId]?.x || 50}%`,
                          "--y": `${mousePositions[cardId]?.y || 50}%`,
                        }}
                      ></div>
                      <div className="shine-overlay"></div>
                      <div className="absolute -inset-0.5 rounded-2xl opacity-30 group-hover:opacity-80 transition-opacity duration-700">
                        <div
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: `conic-gradient(from 0deg, ${colors.glow}, transparent, ${colors.glow}, transparent)`,
                            animation: "rotateGlow 4s linear infinite",
                          }}
                        ></div>
                      </div>
                      <div className="absolute top-2 right-2 sparkle-dot">
                        <Sparkles size={12} className="text-white opacity-70" />
                      </div>
                      <div className="absolute bottom-2 left-2 sparkle-dot" style={{ animationDelay: "1.5s" }}>
                        <Sparkles size={8} className="text-white opacity-50" />
                      </div>
                      <div className="absolute inset-[2px] rounded-[14px] bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>
                      <div className="absolute top-1/4 right-1 w-2 h-2 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: "1s" }}></div>
                      <div className="absolute bottom-1/4 left-1 w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: "2s" }}></div>
                    </>
                  )}

                  <div className="relative z-10">
                    <div
                      className={`text-4xl sm:text-5xl font-['Space_Grotesk'] font-extrabold ${
                        isAvailable
                          ? `gradient-text bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`
                          : "text-gray-400"
                      } leading-none number-glow`}
                    >
                      {sem}
                    </div>
                    <div
                      className={`text-[10px] sm:text-xs font-['Inter'] font-semibold uppercase tracking-widest mt-1.5 ${
                        isAvailable ? "text-gray-500 group-hover:text-gray-700" : "text-gray-400"
                      }`}
                    >
                      Semester
                    </div>

                    {isAvailable && (
                      <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] sm:text-[10px] font-['Inter'] font-bold shadow-lg shadow-emerald-200/50 status-pulse">
                        <CheckCircle size={11} className="sm:size-3" />
                        Open
                      </div>
                    )}

                    {!isAvailable && (
                      <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-200 text-gray-500 text-[9px] sm:text-[10px] font-['Inter'] font-bold">
                        <Lock size={11} className="sm:size-3" />
                        Locked
                      </div>
                    )}

                    {isAvailable && (
                      <>
                        <div
                          className={`mt-3 h-0.5 w-10 sm:w-12 bg-gradient-to-r ${colors.gradient} mx-auto rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center`}
                        ></div>
                        <div className="mt-2 text-[10px] sm:text-xs font-['Inter'] font-medium text-gray-400">
                          {branchData[sem]?.length || 0} Subjects
                        </div>
                        <div className="mt-1 flex items-center justify-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div>
                          <span className="text-[8px] sm:text-[9px] font-['Inter'] font-medium text-emerald-500">
                            Available
                          </span>
                          <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center items-center gap-4 text-sm flex-wrap">
          <div
            className="flex items-center gap-3 glass-effect px-4 py-2.5 rounded-2xl shadow-lg border border-white/50 animate-float-text"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse"></div>
              <span className="font-['Inter'] font-bold text-gray-700">4</span>
              <span className="font-['Inter'] text-gray-500">Semesters Available</span>
            </div>
          </div>
          <div
            className="flex items-center gap-3 glass-effect px-4 py-2.5 rounded-2xl shadow-lg border border-white/50 animate-float-text"
            style={{ animationDelay: "1s" }}
          >
            <Sparkles size={16} className="text-emerald-500" />
            <span className="font-['Inter'] font-bold text-emerald-600">All Unlocked</span>
            <Sparkles size={16} className="text-emerald-500" />
          </div>
          <div
            className="flex items-center gap-3 glass-effect px-4 py-2.5 rounded-2xl shadow-lg border border-white/50 animate-float-text"
            style={{ animationDelay: "1.5s" }}
          >
            <Gem size={16} className="text-purple-500" />
            <span className="font-['Inter'] font-bold text-purple-600">Premium Content</span>
          </div>
        </div>
      </div>
    );
  };

  // ========== RENDER SUBJECT STEP ==========
  const renderSubjectStep = () => {
    const subjects = getAvailableSubjects();
    const categoryLabel =
      categories.find((c) => c.id === selectedCategory)?.label || "";
    const categoryGradient =
      categories.find((c) => c.id === selectedCategory)?.gradient ||
      "from-purple-500 to-pink-500";

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
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-5 shadow-inner animate-float-text">
            <Sparkles className="text-purple-600" size={18} />
            <span className="text-xs font-['Inter'] font-bold text-purple-700 tracking-widest uppercase">
              Step 4 of 4
            </span>
            <Trophy className="text-purple-600" size={18} />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Select Your{" "}
            <span className={`bg-gradient-to-r ${categoryGradient} bg-clip-text text-transparent animate-gradient`}>
              Subject
            </span>
          </h2>
          <div className={`w-24 h-1.5 bg-gradient-to-r ${categoryGradient} mx-auto rounded-full mt-4 animate-gradient`}></div>
          <p className="text-gray-500 text-base mt-4 font-['Inter'] font-medium flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            Choose a subject to continue
            <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: "0.5s" }}></span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {subjects.map((subject, index) => {
            const colors = subjectColors[index % subjectColors.length];
            const iconData = subjectIcons[index % subjectIcons.length];
            const SIcon = iconData.icon;
            const cardId = `subject-${index}`;
            const research = isResearchWork(subject);

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
                    background: `radial-gradient(circle at ${mousePositions[cardId]?.x || 50}% ${mousePositions[cardId]?.y || 50}%, ${colors.glow}, transparent 70%)`,
                  }}
                ></div>

                <div
                  className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl p-6 transition-all duration-500 border-2 border-white/80 hover:border-transparent hover:shadow-2xl hover:-translate-y-3 overflow-hidden`}
                >
                  <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: `conic-gradient(from 0deg, ${colors.glow}, transparent, ${colors.glow}, transparent)`,
                        animation: "rotateGlow 4s linear infinite",
                      }}
                    ></div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconData.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300 shadow-md`}
                        >
                          {research ? (
                            <Mail className={`${iconData.textColor}`} size={22} />
                          ) : (
                            <SIcon className={`${iconData.textColor}`} size={22} />
                          )}
                        </div>
                        <div className="text-base sm:text-lg font-['Space_Grotesk'] font-extrabold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                          {subject}
                        </div>
                      </div>
                      <div
                        className={`w-7 h-7 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center text-white text-[10px] font-['Inter'] font-bold shadow-lg animate-pulse flex-shrink-0`}
                      >
                        {index + 1}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${colors.gradient}`}></div>
                      <span className="text-xs font-['Inter'] font-medium text-gray-500">
                        {research ? "Get guidance & support via email" : "Click to view units"}
                      </span>
                      <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${colors.gradient}`}></div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-['Inter'] font-medium text-gray-400 group-hover:text-purple-600 transition-colors duration-300 flex items-center gap-1">
                        {research ? "Contact Support" : "Explore Subject"}
                        <ChevronRight className="group-hover:translate-x-1 transition-transform duration-300" size={14} />
                      </span>
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-lg transform group-hover:scale-110`}
                      >
                        {research ? (
                          <Send className="text-white" size={16} />
                        ) : (
                          <ArrowRight className="text-white" size={16} />
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colors.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl`}
                  ></div>

                  <div className="absolute top-4 right-4">
                    <div
                      className={`w-2 h-2 rounded-full bg-gray-300 group-hover:bg-gradient-to-r ${colors.gradient} transition-all duration-300 group-hover:scale-150 animate-pulse`}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4 shadow-inner animate-pulse">
              <FolderOpen className="text-gray-400" size={48} />
            </div>
            <h3 className="text-xl font-['Space_Grotesk'] font-bold text-gray-700">No Subjects Available</h3>
            <p className="font-['Inter'] text-gray-400 mt-2">Subjects for this semester are coming soon!</p>
          </div>
        )}
      </div>
    );
  };

  // ========== RENDER UNIT STEP ==========
  const renderUnitStep = () => {
    const categoryLabel =
      categories.find((c) => c.id === selectedCategory)?.label || "";

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
            <span className="font-['Space_Grotesk'] font-bold text-gray-800 truncate max-w-[120px]">
              {selectedSubject}
            </span>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 mb-5 shadow-inner animate-float-text">
            <Sparkles className="text-emerald-600" size={18} />
            <span className="text-xs font-['Inter'] font-bold text-emerald-700 tracking-widest uppercase">
              Select Unit
            </span>
            <Trophy className="text-emerald-600" size={18} />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Select Your{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
              Unit
            </span>
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 mx-auto rounded-full mt-4 animate-gradient"></div>
          <p className="text-gray-500 text-base mt-4 font-['Inter'] font-medium flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {units.length > 0 ? `${units.length} Units Available` : "No units available yet"}
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: "0.5s" }}></span>
          </p>
        </div>

        {isContentLoading && units.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-50 to-cyan-50 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-['Space_Grotesk'] font-bold text-gray-700">Loading Units...</h3>
            <p className="font-['Inter'] text-gray-400 mt-2">Content database se fast fetch ho raha hai...</p>
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4 shadow-inner animate-pulse">
              <FolderOpen className="text-gray-400" size={48} />
            </div>
            <h3 className="text-xl font-['Space_Grotesk'] font-bold text-gray-700">
              {contentError ? "Content Load Failed" : "No Units Available"}
            </h3>
            <p className="font-['Inter'] text-gray-400 mt-2">
              {contentError || "Admin hasn't uploaded any content for this subject yet."}
            </p>
            {contentError && (
              <button
                type="button"
                onClick={fetchUnitContent}
                className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-['Inter'] font-semibold text-sm shadow-lg hover:scale-105 transition-all"
              >
                Retry
              </button>
            )}
            {!contentError && (
              <p className="font-['Inter'] text-gray-400 text-sm mt-1">
                Units will appear here once content is uploaded.
              </p>
            )}
          </div>
        ) : (
          <>
            {isContentLoading && (
              <div className="col-span-full flex items-center justify-center gap-2 mb-2 text-xs font-['Inter'] text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Updating latest content...
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
              {units.map((unit, index) => {
                const colors = unitColors[index % unitColors.length];
                const cardId = `unit-${unit.id}`;

                const content = unitContent.filter((item) => {
                  const itemUnit = Number(item?.unit);
                  const unitId = Number(unit?.id);
                  return (
                    Number.isInteger(itemUnit) &&
                    itemUnit > 0 &&
                    Number.isInteger(unitId) &&
                    itemUnit === unitId
                  );
                });

                return (
                  <div
                    key={unit.id}
                    className={`group relative cursor-pointer animate-pop`}
                    style={{ animationDelay: `${index * 0.06}s` }}
                    onMouseEnter={() => setHoveredCard(cardId)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onMouseMove={(e) => handleCardMouseMove(cardId, e)}
                  >
                    <div
                      className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl"
                      style={{
                        background: `radial-gradient(circle at ${mousePositions[cardId]?.x || 50}% ${mousePositions[cardId]?.y || 50}%, ${colors.glow}, transparent 70%)`,
                      }}
                    ></div>

                    <div
                      className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl p-6 transition-all duration-500 border-2 border-white/80 hover:border-transparent hover:shadow-2xl hover:-translate-y-3 overflow-hidden`}
                    >
                      <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <div
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: `conic-gradient(from 0deg, ${colors.glow}, transparent, ${colors.glow}, transparent)`,
                            animation: "rotateGlow 4s linear infinite",
                          }}
                        ></div>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`text-4xl sm:text-5xl font-['Space_Grotesk'] font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}
                          >
                            {unit.name}
                          </div>
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center text-white text-xs font-['Inter'] font-bold shadow-lg animate-pulse`}
                          >
                            {unit.id || index + 1}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${colors.gradient}`}></div>
                          <span className="text-xs font-['Inter'] font-medium text-gray-500">
                            {unit.topics?.length || 0}{" "}
                            {unit.topics?.length === 1 ? "Topic" : "Topics"} • {content.length}{" "}
                            {content.length === 1 ? "Document" : "Documents"}
                          </span>
                          <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${colors.gradient}`}></div>
                        </div>

                        {unit.topics && unit.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {unit.topics.slice(0, 3).map((topic, i) => (
                              <span
                                key={i}
                                className={`text-xs font-['Inter'] font-medium px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-sm text-gray-700 shadow-sm border border-white/50 group-hover:shadow-md transition-all duration-300`}
                                style={{ animation: `pop 0.3s ease ${i * 0.05}s both` }}
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

                        {content.length > 0 && (
                          <div className="mt-5 pt-4 border-t border-gray-200/50">
                            <p className="text-xs font-['Inter'] font-medium text-gray-500 mb-3 animate-float-text">
                              📄 {content.length} {content.length === 1 ? "Document" : "Documents"} Available
                            </p>

                            <div className="space-y-3">
                              {content.map((item) => (
                                <div
                                  key={item._id}
                                  className="rounded-xl bg-white/80 border border-gray-200 p-3 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileText size={16} className="text-blue-600 shrink-0 animate-pulse" />
                                    <span className="text-sm font-['Inter'] font-semibold text-gray-800 truncate">
                                      {item.title || item.fileName || "Document"}
                                    </span>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleView(item);
                                      }}
                                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg font-['Inter'] font-semibold text-xs flex items-center justify-center gap-1.5 hover:shadow-lg hover:scale-105 transition-all duration-300"
                                    >
                                      <Eye size={14} />
                                      Preview
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(item);
                                      }}
                                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-2 rounded-lg font-['Inter'] font-semibold text-xs flex items-center justify-center gap-1.5 hover:shadow-lg hover:scale-105 transition-all duration-300"
                                    >
                                      <Download size={14} />
                                      Download
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {content.length === 0 && (
                          <div className="mt-5 pt-4 border-t border-gray-200/50">
                            <p className="text-xs font-['Inter'] text-gray-400">
                              No documents uploaded yet for this unit
                            </p>
                          </div>
                        )}
                      </div>

                      <div
                        className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colors.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl`}
                      ></div>

                      <div className="absolute top-4 right-4">
                        <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-emerald-500 transition-all duration-300 group-hover:scale-150 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  // ========== PROGRESS INDICATOR ==========
  const renderProgress = () => {
    const steps = [
      { number: 1, label: "Branch", icon: FlaskRound },
      { number: 2, label: "Category", icon: BookOpen },
      { number: 3, label: "Semester", icon: GraduationCap },
      { number: 4, label: "Subject", icon: Book },
      { number: 5, label: "Unit", icon: Layers },
    ];

    return (
      <div className="flex items-center justify-center gap-1 sm:gap-4 mb-8 sm:mb-12 flex-wrap">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const PIcon = step.icon;

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`relative w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-['Inter'] font-bold text-sm transition-all duration-500 ${
                    isCompleted
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200"
                      : isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-200 scale-110 animate-pulse-glow"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle size={20} /> : <PIcon size={18} />}
                  {isActive && (
                    <div className="absolute -inset-1 rounded-full border-2 border-blue-400/50 animate-pulse"></div>
                  )}
                </div>
                <span
                  className={`text-xs sm:text-sm font-['Inter'] font-medium hidden md:inline ${
                    isActive
                      ? "text-blue-600 font-bold animate-pulse"
                      : isCompleted
                      ? "text-emerald-600"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-5 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-all duration-500 ${
                    isCompleted
                      ? "bg-gradient-to-r from-emerald-400 to-teal-400 animate-gradient"
                      : "bg-gray-200"
                  }`}
                ></div>
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
          style: { background: "#363636", color: "#fff" },
          success: { duration: 3000, style: { background: "#10b981", color: "#fff" } },
          error: { duration: 4000, style: { background: "#ef4444", color: "#fff" } },
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
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl font-['Inter'] font-bold shadow-xl flex items-center gap-3 text-sm sm:text-base animate-float-text">
            <Gem size={18} className="text-yellow-300" />
            Premium Member
            <Shield size={18} className="text-yellow-300" />
          </div>
        </div>
      )}

      {/* HEADER / HERO */}
      <div className="w-screen bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a3a5c] overflow-hidden relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-16 sm:mt-20">
        <div className="relative h-[320px] sm:h-[390px] md:h-[470px] w-full">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${bannerImg})`,
              backgroundPosition: "center 8%",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/90 via-[#071426]/38 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/70 via-transparent to-transparent"></div>
          </div>

          <div className="absolute left-0 top-0 h-full w-[48%] bg-gradient-to-r from-[#071426]/78 via-[#0f2847]/38 to-transparent pointer-events-none"></div>

          <div className="absolute top-20 right-10 w-2 h-2 rounded-full bg-blue-400/30 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
          <div className="absolute top-40 right-20 w-3 h-3 rounded-full bg-purple-400/20 animate-pulse" style={{ animationDelay: "1.2s" }}></div>
          <div className="absolute bottom-20 right-30 w-1.5 h-1.5 rounded-full bg-cyan-400/20 animate-pulse" style={{ animationDelay: "2s" }}></div>

          <div className="relative z-20 flex items-end h-full px-4 sm:px-8 md:px-16 lg:px-24 pb-10 sm:pb-12 md:pb-14 lg:pb-16">
            <div className="max-w-2xl animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 mb-4 animate-float-text">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="text-xs font-['Inter'] font-semibold text-blue-300 tracking-widest uppercase">
                  M.Pharm Program
                </span>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: "0.5s" }}></span>
              </div>

              <h1 className="text-white font-['Space_Grotesk'] font-extrabold leading-[1.1]">
                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl block animate-float-text" style={{ animationDelay: "0.3s" }}>
                  Master of
                </span>
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl block bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                  Pharmacy
                </span>
              </h1>

              <div className="flex items-center gap-4 mt-4 mb-4">
                <div className="h-1 w-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-gradient"></div>
                <div className="h-1 w-8 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full opacity-60 animate-gradient" style={{ animationDelay: "0.5s" }}></div>
                <div className="h-1 w-4 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-30 animate-gradient" style={{ animationDelay: "1s" }}></div>
              </div>

              <p className="text-gray-300 text-sm sm:text-base md:text-lg font-['Inter'] font-light leading-relaxed max-w-xl animate-float-text" style={{ animationDelay: "0.6s" }}>
                Complete Notes, Semester-wise PDFs, Research Guidance & Predictive Papers for M.Pharm Students.
              </p>

              <button
                onClick={() =>
                  document.getElementById("content-start")?.scrollIntoView({ behavior: "smooth" })
                }
                className="mt-6 group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-['Inter'] font-semibold text-sm hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 animate-float-text"
                style={{ animationDelay: "0.9s" }}
              >
                <span>Explore Content</span>
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[#f0f7ff] via-[#f0f7ff]/45 to-transparent pointer-events-none"></div>
        </div>
      </div>

      <div id="content-start"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-14">
        {currentStep > 1 && renderProgress()}

        <div className="step-container">
          {currentStep === 1 && renderBranchStep()}
          {currentStep === 2 && renderCategoryStep()}
          {currentStep === 3 && renderSemesterStep()}
          {currentStep === 4 && renderSubjectStep()}
          {currentStep === 5 && renderUnitStep()}
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

export default MPharm;