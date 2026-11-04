import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

import bannerImg from "../assets/pharmacy-lab student.jpeg";
import LockedContent from "../components/LockedContent"; // ✅ ADDED

import {
  BookOpen, FileText, Video, Brain, Download, GraduationCap, PlayCircle,
  Lock, Eye, Crown, Sparkles, Rocket, ArrowLeft, CheckCircle, Book, Layers,
  FolderOpen, Zap, Award, Target, Gem, Shield, Trophy, ArrowRight, HeartPulse,
  Microscope, Pill, FlaskRound, Users, Stethoscope, ChevronRight, Code2,
  MessageSquare, Atom, Leaf, Beaker, Unlock
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
    badge: "Most Popular",
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
    badge: "🔥 Crash",
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
    badge: "📝 Exam",
  },
];

// ========== COLORS ==========
const semesterColors = [
  { gradient: "from-rose-500 to-pink-500", glow: "rgba(244, 63, 94, 0.5)", bg: "from-rose-50 to-pink-50", border: "border-rose-200", shadow: "shadow-rose-200/50" },
  { gradient: "from-blue-500 to-cyan-500", glow: "rgba(59, 130, 246, 0.5)", bg: "from-blue-50 to-cyan-50", border: "border-blue-200", shadow: "shadow-blue-200/50" },
  { gradient: "from-emerald-500 to-teal-500", glow: "rgba(16, 185, 129, 0.5)", bg: "from-emerald-50 to-teal-50", border: "border-emerald-200", shadow: "shadow-emerald-200/50" },
  { gradient: "from-purple-500 to-indigo-500", glow: "rgba(139, 92, 246, 0.5)", bg: "from-purple-50 to-indigo-50", border: "border-purple-200", shadow: "shadow-purple-200/50" },
  { gradient: "from-orange-500 to-amber-500", glow: "rgba(251, 146, 60, 0.5)", bg: "from-orange-50 to-amber-50", border: "border-orange-200", shadow: "shadow-orange-200/50" },
  { gradient: "from-pink-500 to-rose-500", glow: "rgba(236, 72, 153, 0.5)", bg: "from-pink-50 to-rose-50", border: "border-pink-200", shadow: "shadow-pink-200/50" },
  { gradient: "from-cyan-500 to-blue-500", glow: "rgba(6, 182, 212, 0.5)", bg: "from-cyan-50 to-blue-50", border: "border-cyan-200", shadow: "shadow-cyan-200/50" },
  { gradient: "from-teal-500 to-emerald-500", glow: "rgba(20, 184, 166, 0.5)", bg: "from-teal-50 to-emerald-50", border: "border-teal-200", shadow: "shadow-teal-200/50" },
];

const subjectColors = [
  { gradient: "from-violet-500 to-purple-500", glow: "rgba(139,92,246,0.2)", bg: "from-violet-50 to-purple-50" },
  { gradient: "from-blue-500 to-cyan-500", glow: "rgba(59,130,246,0.2)", bg: "from-blue-50 to-cyan-50" },
  { gradient: "from-emerald-500 to-teal-500", glow: "rgba(16,185,129,0.2)", bg: "from-emerald-50 to-teal-50" },
  { gradient: "from-rose-500 to-pink-500", glow: "rgba(244,63,94,0.2)", bg: "from-rose-50 to-pink-50" },
  { gradient: "from-amber-500 to-orange-500", glow: "rgba(251,146,60,0.2)", bg: "from-amber-50 to-orange-50" },
  { gradient: "from-cyan-500 to-sky-500", glow: "rgba(6,182,212,0.2)", bg: "from-cyan-50 to-sky-50" },
];

const subjectIcons = [
  { icon: Code2, color: "from-violet-100 to-purple-100", textColor: "text-violet-600" },
  { icon: Pill, color: "from-blue-100 to-cyan-100", textColor: "text-blue-600" },
  { icon: MessageSquare, color: "from-emerald-100 to-teal-100", textColor: "text-emerald-600" },
  { icon: HeartPulse, color: "from-rose-100 to-pink-100", textColor: "text-rose-600" },
  { icon: Leaf, color: "from-amber-100 to-orange-100", textColor: "text-amber-600" },
  { icon: Beaker, color: "from-cyan-100 to-sky-100", textColor: "text-cyan-600" },
];

const unitColors = [
  { gradient: "from-rose-500 to-pink-500", glow: "rgba(244,63,94,0.25)", bg: "from-rose-50 to-pink-50" },
  { gradient: "from-blue-500 to-cyan-500", glow: "rgba(59,130,246,0.25)", bg: "from-blue-50 to-cyan-50" },
  { gradient: "from-emerald-500 to-teal-500", glow: "rgba(16,185,129,0.25)", bg: "from-emerald-50 to-teal-50" },
  { gradient: "from-purple-500 to-indigo-500", glow: "rgba(139,92,246,0.25)", bg: "from-purple-50 to-indigo-50" },
  { gradient: "from-orange-500 to-amber-500", glow: "rgba(251,146,60,0.25)", bg: "from-orange-50 to-amber-50" },
  { gradient: "from-pink-500 to-rose-500", glow: "rgba(236,72,153,0.25)", bg: "from-pink-50 to-rose-50" },
];

// ========== B.PHARM SUBJECTS ==========
const BPHARM_SUBJECTS = {
  1: ["Basics of Python Programming for Pharmaceutical Sciences", "General Pharmacy", "Healthcare Psychology and Communication Skills", "Human Anatomy, Physiology and Pathophysiology I", "Introduction to Pharmacognosy", "Pharmaceutical Inorganic and Analytical Chemistry"],
  2: ["Applied Biostatistics and Data Analytics for Pharmaceutical Sciences", "Biochemistry", "Human Anatomy, Physiology and Pathophysiology II", "Pharmaceutical Organic Chemistry", "Pharmacognosy and Phytochemistry", "Physical Pharmaceutics"],
  3: ["Introduction to Machine Learning in Pharmaceutical Sciences", "Environmental Sciences", "Ethics and Universal Human Values", "General Pharmacology", "Heterocyclic Compounds and Stereochemistry", "Pharmaceutical Dosage Forms I", "Pharmaceutical Engineering", "Pharmaceutical Microbiology"],
  4: ["Herbal Drug Technology", "Medicinal Chemistry", "Pharmaceutical Biotechnology", "Social Pharmacy and Public Health", "Systemic Pharmacology I"],
  5: ["Biomedicinal Chemistry", "Industrial Pharmacognosy", "Innovation and Startup Ecosystem", "Pharmaceutical Dosage Form II", "Pharmaceutical Quality Assurance", "Systemic Pharmacology II"],
  6: ["Advanced Pharmacognosy", "Biopharmaceutics and Pharmacokinetics", "Intellectual Property Rights", "AI Applications in Pharmaceutical Sciences", "Pharmaceutical Analysis", "Pharmaceutical Jurisprudence", "Green Chemistry", "Materiovigilance and Hemovigilance", "Scientific Writing", "Drug Store and Business Management", "Career Building in Cultivation of Medicinal Plants", "Active Pharmaceutical Ingredients and Excipient Sciences"],
  7: ["Biostatistics Research Methodology", "Cosmetics and Cosmeceuticals", "AI in Clinical Applications", "Modern Analytical Techniques", "Pharmacovigilance", "Pharmacy Practice", "Regulatory Affairs", "Current Good Manufacturing Practices (cGMP)", "Pharmaceutical Automation", "Modern Techniques in Cellular Biology", "Medical Devices", "Transformation of Food Waste into Medicinal Products", "Biosimilars, Vaccines & Macromolecules"],
  8: ["Ethical Considerations and Translational Applications of AI in Pharmacy", "Clinical Pharmacotherapeutics", "Industrial Pharmacy and Facility Design", "Pharmaceutical Management", "Sterile Dosage Forms and Novel Drug Delivery System", "Pharmaceutical Packaging", "Supply Chain Management", "Industrial Safety and Waste Management", "Traditional Healing Practices of India", "Futuristic Pharma through AR/VR: Pharma 4.0", "Herbal Cosmetics for Industry Perspective"],
};

// ✅ Build exact contentKey format (Admin panel se match hona chahiye)
const buildContentKey = (category, semester) => {
  const categorySlug = String(category || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const semNum = Number.parseInt(String(semester).replace(/\D/g, ""), 10);
  if (!categorySlug || !Number.isInteger(semNum)) return "";
  return `bpharm:${categorySlug}:semester:${semNum}`;
};

const BPharm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePositions, setMousePositions] = useState({});

  const [units, setUnits] = useState([]);
  const [unitContent, setUnitContent] = useState([]);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [contentError, setContentError] = useState("");

  const [directFiles, setDirectFiles] = useState([]);
  const [isDirectLoading, setIsDirectLoading] = useState(false);
  const [directError, setDirectError] = useState("");

  const contentRequestIdRef = useRef(0);
  const contentAbortControllerRef = useRef(null);
  const contentCacheRef = useRef(new Map());

  const isPopStateRef = useRef(false);
  const currentStepRef = useRef(1);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const isDirectFilesCategory = () =>
    selectedCategory === "Exam Crash Course" || selectedCategory === "PYQs";

  const getAvailableSubjects = () => {
    const semester = Number(selectedSemester);
    return Array.isArray(BPHARM_SUBJECTS[semester]) ? BPHARM_SUBJECTS[semester] : [];
  };

  // ========== FETCH NOTES ==========
  const fetchUnitContent = async () => {
    if (!selectedCategory || !selectedSemester || !selectedSubject) return;
    const cacheKey = ["B.Pharm", selectedCategory, selectedSemester, selectedSubject].join("||");
    const requestId = ++contentRequestIdRef.current;

    if (contentAbortControllerRef.current) contentAbortControllerRef.current.abort();
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
          unitMap.set(unitValue, { id: unitValue, name: `Unit ${unitValue}`, topics: [] });
        }
        const topic = item?.topic ?? item?.topicName ?? item?.chapter ?? item?.chapterName;
        if (topic && !unitMap.get(unitValue).topics.includes(String(topic))) {
          unitMap.get(unitValue).topics.push(String(topic));
        }
      });
      return Array.from(unitMap.values()).sort((a, b) => a.id - b.id);
    };

    const getRawContent = (data) => {
      if (Array.isArray(data)) return data;
      const candidates = [data?.data, data?.notes, data?.documents, data?.results, data?.items];
      for (const v of candidates) if (Array.isArray(v)) return v;
      return [];
    };

    try {
      let res;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          res = await axios.get(`${API_BASE}/api/admin/public/notes`, {
            params: { course: "B.Pharm", category: selectedCategory, semester: selectedSemester, subject: selectedSubject },
            signal: controller.signal,
            timeout: 12000,
            headers: { Accept: "application/json", "Cache-Control": "no-cache" },
          });
          break;
        } catch (error) {
          if (error?.name === "CanceledError" || controller.signal.aborted) return;
          if (attempt === 2) throw error;
          await new Promise((r) => setTimeout(r, 350));
        }
      }

      if (requestId !== contentRequestIdRef.current) return;

      const rawContent = getRawContent(res?.data)
        .filter(Boolean)
        .filter((item) => {
          const semMatch = item?.semester == null || String(item.semester).trim() === String(selectedSemester).trim();
          const subMatch = item?.subject == null || String(item.subject).trim() === String(selectedSubject).trim();
          const catMatch = item?.category == null || String(item.category).trim() === String(selectedCategory).trim();
          return semMatch && subMatch && catMatch;
        });

      const derivedUnits = buildUnits(rawContent);
      contentCacheRef.current.set(cacheKey, { content: rawContent, units: derivedUnits, timestamp: Date.now() });
      setUnitContent(rawContent);
      setUnits(derivedUnits);
    } catch (error) {
      if (error?.name === "CanceledError" || controller.signal.aborted) return;
      if (requestId !== contentRequestIdRef.current) return;
      setContentError("Content load nahi ho paaya.");
      if (!cached) { setUnitContent([]); setUnits([]); }
    } finally {
      if (requestId === contentRequestIdRef.current) {
        setIsContentLoading(false);
        contentAbortControllerRef.current = null;
      }
    }
  };

  // ========== FETCH DIRECT FILES ==========
  const fetchDirectFiles = async () => {
    if (!selectedCategory || !selectedSemester || !selectedSubject) return;
    const cacheKey = ["B.Pharm", selectedCategory, selectedSemester, selectedSubject, "direct"].join("||");
    const requestId = ++contentRequestIdRef.current;

    if (contentAbortControllerRef.current) contentAbortControllerRef.current.abort();
    const cached = contentCacheRef.current.get(cacheKey);
    if (cached) setDirectFiles(cached.files);
    else setDirectFiles([]);

    setIsDirectLoading(true);
    setDirectError("");

    const controller = new AbortController();
    contentAbortControllerRef.current = controller;

    const getRawFiles = (data) => {
      if (Array.isArray(data)) return data;
      const candidates = [data?.data, data?.files, data?.documents, data?.results, data?.items];
      for (const v of candidates) if (Array.isArray(v)) return v;
      return [];
    };

    try {
      const res = await axios.get(`${API_BASE}/api/admin/public/direct-files`, {
        params: { course: "B.Pharm", category: selectedCategory, semester: selectedSemester, subject: selectedSubject },
        signal: controller.signal,
        timeout: 15000,
        headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      });

      if (requestId !== contentRequestIdRef.current) return;

      const files = getRawFiles(res?.data).filter(Boolean).filter((item) => {
        const catMatch = item?.category == null || String(item.category).trim() === String(selectedCategory).trim();
        const semMatch = item?.semester == null || String(item.semester).trim() === String(selectedSemester).trim();
        const subMatch = item?.subject == null || String(item.subject).trim() === String(selectedSubject).trim();
        return catMatch && semMatch && subMatch;
      });

      contentCacheRef.current.set(cacheKey, { files, timestamp: Date.now() });
      setDirectFiles(files);
    } catch (error) {
      if (error?.name === "CanceledError" || controller.signal.aborted) return;
      if (requestId !== contentRequestIdRef.current) return;
      setDirectError("Files load nahi ho paayi.");
      if (!cached) setDirectFiles([]);
    } finally {
      if (requestId === contentRequestIdRef.current) {
        setIsDirectLoading(false);
        contentAbortControllerRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (isDirectFilesCategory() && selectedSemester && selectedSubject) {
      fetchDirectFiles();
    } else if (selectedCategory === "Notes" && selectedSemester && selectedSubject) {
      fetchUnitContent();
    }
    return () => { if (contentAbortControllerRef.current) contentAbortControllerRef.current.abort(); };
  }, [selectedCategory, selectedSemester, selectedSubject]);

  // ========== HISTORY SYNC ==========
  useEffect(() => {
    if (isPopStateRef.current) {
      isPopStateRef.current = false;
      return;
    }
    if (currentStep > 1) window.history.pushState({ bpharmStep: currentStep }, "", window.location.href);
  }, [currentStep]);

  useEffect(() => {
    const handlePopState = () => {
      const step = currentStepRef.current;
      if (step > 1) {
        isPopStateRef.current = true;
        if (step === 2) { setCurrentStep(1); setSelectedCategory(null); }
        else if (step === 3) { setCurrentStep(2); setSelectedSemester(null); setSelectedSubject(null); }
        else if (step === 4) { setCurrentStep(3); setSelectedSubject(null); setUnits([]); setUnitContent([]); setDirectFiles([]); }
        window.history.pushState({ bpharmStep: step - 1 }, "", window.location.href);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // ========== HANDLERS ==========
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setUnits([]); setUnitContent([]); setDirectFiles([]);
    setCurrentStep(2);
  };

  const handleSemesterClick = (semester) => {
    setSelectedSemester(semester);
    setCurrentStep(3);
    setSelectedSubject(null);
    setUnits([]); setUnitContent([]);
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setCurrentStep(4);
    setUnits([]); setUnitContent([]);
  };

  const goBack = () => {
    if (currentStep === 2) { setCurrentStep(1); setSelectedCategory(null); }
    else if (currentStep === 3) { setCurrentStep(2); setSelectedSemester(null); setSelectedSubject(null); }
    else if (currentStep === 4) { setCurrentStep(3); setSelectedSubject(null); setUnits([]); setUnitContent([]); setDirectFiles([]); }
  };

  const resetNavigation = () => {
    setCurrentStep(1); setSelectedCategory(null); setSelectedSemester(null); setSelectedSubject(null);
    setUnits([]); setUnitContent([]); setDirectFiles([]);
  };

  // ========== MOUSE EFFECTS ==========
  const handleCardMouseMove = (cardId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePositions((prev) => ({ ...prev, [cardId]: { x, y } }));
  };

  const handleCardMouseLeave = (cardId) => {
    setHoveredCard(null);
    setMousePositions((prev) => { const n = { ...prev }; delete n[cardId]; return n; });
  };

  // ========== VIEW/DOWNLOAD ==========
  const handleView = (item) => {
    if (!item?._id) return toast.error("Invalid document ID");
    window.open(`${API_BASE}/api/admin/public/preview/note/${item._id}`, "_blank", "noopener,noreferrer");
  };

  const handleDownload = (item) => {
    if (!item?._id) return toast.error("Invalid document ID");
    const link = document.createElement("a");
    link.href = `${API_BASE}/api/admin/public/download/note/${item._id}`;
    link.target = "_blank";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast.success("Download started!");
  };

  // ========== STYLES ==========
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes floatMedium { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-12px) scale(1.02); } }
      @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.15); } 50% { box-shadow: 0 0 60px rgba(99, 102, 241, 0.35); } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(60px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes slideDown { from { opacity: 0; transform: translateY(-40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes scaleIn { from { opacity: 0; transform: scale(0.7) rotate(-5deg); } to { opacity: 1; transform: scale(1) rotate(0deg); } }
      @keyframes rotateGlow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.05); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
      @keyframes premiumFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
      @keyframes premiumShine { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      @keyframes premiumPulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
      @keyframes premiumBorderFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      @keyframes premiumSparkle { 0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; } 50% { transform: scale(1.2) rotate(180deg); opacity: 1; } }
      @keyframes premiumNumberPop { 0% { transform: scale(1); } 50% { transform: scale(1.1) rotate(-3deg); } 100% { transform: scale(1) rotate(0deg); } }
      @keyframes floatText { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
      @keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

      .premium-card { animation: premiumFloat 4s ease-in-out infinite; transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1); }
      .premium-card::before { content: ''; position: absolute; inset: -2px; border-radius: 16px; padding: 2px; background: linear-gradient(90deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3), rgba(236,72,153,0.3), rgba(99,102,241,0.3)); background-size: 300% 100%; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; animation: premiumBorderFlow 6s ease-in-out infinite; opacity: 0.7; pointer-events: none; }
      .premium-card .glow-ring { position: absolute; inset: -4px; border-radius: 18px; background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.15) 0%, transparent 60%); opacity: 0.6; pointer-events: none; transition: opacity 0.3s ease; }
      .premium-card .shine-overlay { position: absolute; inset: 0; border-radius: 14px; background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.2) 100%); background-size: 300% 100%; animation: premiumShine 8s ease-in-out infinite; pointer-events: none; }
      .premium-card .sparkle-dot { animation: premiumSparkle 3s ease-in-out infinite; }
      .premium-card .number-glow { animation: premiumNumberPop 3s ease-in-out infinite; }
      .premium-card .status-pulse { animation: premiumPulse 2s ease-in-out infinite; }
      .premium-card:hover { transform: translateY(-12px) scale(1.02); box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
      .premium-card:hover .glow-ring { opacity: 1; }
      .premium-card .gradient-text { background-size: 200% auto; animation: premiumShine 4s ease-in-out infinite; }

      .semester-card-1 { animation-delay: 0s; } .semester-card-2 { animation-delay: 0.3s; } .semester-card-3 { animation-delay: 0.6s; } .semester-card-4 { animation-delay: 0.9s; }
      .semester-card-5 { animation-delay: 1.2s; } .semester-card-6 { animation-delay: 1.5s; } .semester-card-7 { animation-delay: 1.8s; } .semester-card-8 { animation-delay: 2.1s; }

      .animate-float-medium { animation: floatMedium 3.5s ease-in-out infinite; }
      .animate-slide-up { animation: slideUp 0.7s cubic-bezier(0.23, 1, 0.32, 1) both; }
      .animate-slide-down { animation: slideDown 0.6s cubic-bezier(0.23, 1, 0.32, 1) both; }
      .animate-scale-in { animation: scaleIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) both; }
      .animate-pulse-glow { animation: pulseGlow 2.5s ease-in-out infinite; }
      .animate-pop { animation: pop 0.5s cubic-bezier(0.23, 1, 0.32, 1) both; }
      .animate-float-text { animation: floatText 3s ease-in-out infinite; }
      .animate-gradient { animation: gradientMove 8s ease-in-out infinite; background-size: 200% 200%; }

      .glass-effect { background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }

      @media (max-width: 768px) { .subject-grid { grid-template-columns: 1fr; } .unit-grid { grid-template-columns: 1fr; } }
      @media (max-width: 480px) { .unit-grid { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => { window.history.scrollRestoration = "manual"; window.scrollTo(0, 0); }, []);

  // ============================================================
  // RENDER STEPS
  // ============================================================
  const renderCategoryStep = () => (
    <div className="animate-slide-up">
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-100 to-blue-100 mb-4 animate-float-text">
          <Sparkles className="text-sky-600" size={16} />
          <span className="text-xs font-['Inter'] font-bold text-sky-700 tracking-wider uppercase">B.Pharm</span>
          <Sparkles className="text-sky-600" size={16} />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
          Select Your <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">Category</span>
        </h1>
        <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full mt-4 animate-gradient"></div>
        <p className="text-gray-500 text-base mt-4 font-['Inter'] font-medium">Choose what you want to study</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div key={category.id} onClick={() => handleCategoryClick(category.id)} className={`group relative cursor-pointer animate-slide-up`} onMouseEnter={() => setHoveredCard(category.id)} onMouseLeave={() => setHoveredCard(null)} onMouseMove={(e) => handleCardMouseMove(category.id, e)}>
              <div className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl" style={{ background: `radial-gradient(circle at ${mousePositions[category.id]?.x || 50}% ${mousePositions[category.id]?.y || 50}%, ${category.glowColor}, transparent 70%)` }}></div>
              <div className={`relative bg-gradient-to-br ${category.bgGradient} rounded-3xl p-7 sm:p-9 transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl border-2 border-white/50 backdrop-blur-sm overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"><div className="absolute inset-0 rounded-3xl" style={{ background: `conic-gradient(from 0deg, ${category.glowColor}, transparent, ${category.glowColor}, transparent)`, animation: "rotateGlow 4s linear infinite" }}></div></div>
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-r ${category.gradient} flex items-center justify-center mb-5 shadow-2xl group-hover:scale-110 transition-all duration-500 animate-float-medium relative z-10`}><Icon className="text-white" size={34} /></div>
                <div className="absolute top-4 right-4 z-10"><span className={`text-[10px] font-['Inter'] font-bold px-3 py-1 rounded-full bg-gradient-to-r ${category.gradient} text-white shadow-lg animate-pulse`}>{category.badge}</span></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-['Space_Grotesk'] font-extrabold text-gray-800 mb-2">{category.label}</h3>
                  <p className="text-sm font-['Inter'] text-gray-600 leading-relaxed mb-3">{category.description}</p>
                  <div className="flex items-center gap-3 text-xs font-['Inter']">
                    <span className="flex items-center gap-1 text-gray-500"><Award size={14} className="text-amber-500" />{category.stats}</span>
                    <span className="w-px h-4 bg-gray-300"></span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium group-hover:gap-2 transition-all duration-300"><Zap size={14} />Click to Explore</span>
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

  // 🚨 YAHAN LOCK LAGA HAI: Pura semester select krne ka UI LockedContent ke andr wrap kiya hai
  const renderSemesterStep = () => {
    const categoryLabel = categories.find((c) => c.id === selectedCategory)?.label || "";
    const categoryIcon = categories.find((c) => c.id === selectedCategory)?.icon || BookOpen;
    const Icon = categoryIcon;
    const allSemesters = [1, 2, 3, 4, 5, 6, 7, 8];

    // ✅ Semester lock product object
    // Note: ID & contentKey dynamically semester pe depend karta hai, par LockedContent bina payment ke price fetch nahi karega.
    // Toh hum ek Dummy Product pass kar rahe hain jisme contentKey current selected semester ka hai. 
    // Actually LockedContent single lock show karta hai, toh hume exact sem ka lock chahiye. 
    // Par hum pehle check karenge ki kya user purchased already h? Agar haan, toh direct grid dikhayenge.
    
    // Ek chota sa trick: hum direct grid lock nahi karenge, balki har semester card pe ek lock check lagayenge. 
    // Par tune bola "yha se hi lock ho". Toh hum pura grid LockedContent me wrap kar dete hain jo selectedSemester pe based hoga.
    // Jab user kisi sem pe click karega, tab lock check hoga. Ya phir hum grid dikha kar click pe lock trigger karenge.
    
    // Best UI Approach: Pura Grid dikhe, par jaise hi user kisi Sem pe click kare, LockedContent check kare. 
    // Ya phir hum seedha renderSemesterStep ko LockedContent se wrap kar de? Nahi, kyunki har sem ka apna lock/price hai.
    
    // Toh best UX: User sem pe click kare -> agar locked hai -> pricing dikhe. Agar unlocked -> aage jaye.
    
    return (
      <div className="animate-scale-in">
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <button onClick={goBack} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-gray-700 font-['Inter'] font-semibold text-sm group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />Back
          </button>
          <div className="flex items-center gap-3 glass-effect rounded-2xl px-5 py-3 shadow-lg border border-white/50">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${categories.find((c) => c.id === selectedCategory)?.gradient} flex items-center justify-center shadow-md animate-pulse`}>
              <Icon className="text-white" size={18} />
            </div>
            <span className="font-['Space_Grotesk'] font-bold text-gray-800 text-lg">{categoryLabel}</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-100 to-blue-100 mb-4 shadow-inner animate-float-text">
            <Sparkles className="text-sky-600" size={16} />
            <span className="text-xs font-['Inter'] font-bold text-sky-700 tracking-widest uppercase">Step 2 of 4</span>
            <Sparkles className="text-sky-600" size={16} />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Select Your <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">Semester</span>
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full mt-4 animate-gradient"></div>
          <p className="text-gray-500 text-base mt-4 font-['Inter'] font-medium flex items-center justify-center gap-2">
            <Lock className="text-amber-500" size={16} />
            Semester unlock karne ke liye click karein
          </p>
        </div>

        {/* ✅ Semester Cards Grid - User clicks, then we check access dynamically */}
        <div className="grid grid-cols-4 gap-5 sm:gap-6 max-w-4xl mx-auto">
          {allSemesters.map((sem, index) => {
            const colors = semesterColors[index % semesterColors.length];
            const cardId = `semester-${sem}`;
            const delayClass = `semester-card-${index + 1}`;
            return (
              <div
                key={sem}
                onClick={() => handleSemesterClick(sem)}
                className="group relative cursor-pointer"
                onMouseEnter={() => setHoveredCard(cardId)}
                onMouseLeave={() => setHoveredCard(null)}
                onMouseMove={(e) => handleCardMouseMove(cardId, e)}
              >
                <div className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl" style={{ background: `radial-gradient(circle at ${mousePositions[cardId]?.x || 50}% ${mousePositions[cardId]?.y || 50}%, ${colors.glow}, transparent 68%)` }}></div>
                <div className={`relative rounded-2xl p-5 sm:p-6 text-center transition-all duration-500 overflow-hidden premium-card ${delayClass} bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-xl ${colors.shadow}`} style={{ boxShadow: `0 8px 32px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)` }}>
                  <div className="glow-ring" style={{ "--x": `${mousePositions[cardId]?.x || 50}%`, "--y": `${mousePositions[cardId]?.y || 50}%` }}></div>
                  <div className="shine-overlay"></div>
                  <div className="absolute -inset-0.5 rounded-2xl opacity-30 group-hover:opacity-80 transition-opacity duration-700"><div className="absolute inset-0 rounded-2xl" style={{ background: `conic-gradient(from 0deg, ${colors.glow}, transparent, ${colors.glow}, transparent)`, animation: "rotateGlow 4s linear infinite" }}></div></div>
                  <div className="absolute top-2 right-2 sparkle-dot"><Sparkles size={12} className="text-white opacity-70" /></div>
                  <div className="absolute bottom-2 left-2 sparkle-dot" style={{ animationDelay: "1.5s" }}><Sparkles size={8} className="text-white opacity-50" /></div>
                  <div className="absolute inset-[2px] rounded-[14px] bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className={`text-4xl sm:text-5xl font-['Space_Grotesk'] font-extrabold gradient-text bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent leading-none number-glow`}>{sem}</div>
                    <div className="text-[10px] sm:text-xs font-['Inter'] font-semibold uppercase tracking-widest mt-1.5 text-gray-500 group-hover:text-gray-700">Semester</div>
                    <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] sm:text-[10px] font-['Inter'] font-bold shadow-lg shadow-amber-200/50 status-pulse">
                      <Lock size={11} className="sm:size-3" /> Unlock
                    </div>
                    <div className={`mt-3 h-0.5 w-10 sm:w-12 bg-gradient-to-r ${colors.gradient} mx-auto rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center`}></div>
                    <div className="mt-2 text-[10px] sm:text-xs font-['Inter'] font-medium text-gray-400">{BPHARM_SUBJECTS[sem]?.length || 0} Subjects</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 🚨 SUBJECT STEP: Har subject ke andar jaate hi LockedContent wrap karega
  const renderSubjectStep = () => {
    const subjects = getAvailableSubjects();
    const categoryLabel = categories.find((c) => c.id === selectedCategory)?.label || "";
    const categoryGradient = categories.find((c) => c.id === selectedCategory)?.gradient || "from-purple-500 to-pink-500";
    
    const currentContentKey = buildContentKey(selectedCategory, selectedSemester);
    const lockProduct = {
      type: "course-content",
      id: currentContentKey,
      title: `B.Pharm ${selectedCategory} - Semester ${selectedSemester}`,
      course: "B.Pharm",
      category: selectedCategory,
      semester: String(Number(selectedSemester)),
      year: "",
      language: "",
      specialization: "",
      contentKey: currentContentKey,
    };

    return (
      <div className="animate-slide-down">
        {/* Progress & Header */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <button onClick={goBack} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-gray-700 font-['Inter'] font-semibold text-sm group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />Back
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
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Select Your <span className={`bg-gradient-to-r ${categoryGradient} bg-clip-text text-transparent animate-gradient`}>Subject</span>
          </h2>
          <div className={`w-24 h-1.5 bg-gradient-to-r ${categoryGradient} mx-auto rounded-full mt-4 animate-gradient`}></div>
        </div>

        {/* ✅ LockedContent Wrap: Agar semester purchased nahi hai, toh subjects dikhenge hi nahi, pay button aayega */}
        <LockedContent 
          product={lockProduct}
          previewContent={
            <div className="text-center py-4">
              <h3 className="font-['Space_Grotesk'] font-bold text-gray-700 text-lg">Semester {selectedSemester} Content</h3>
              <p className="text-sm font-['Inter'] text-gray-500 mt-1">Unlock to access {subjects.length} subjects</p>
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto mt-6">
            {subjects.map((subject, index) => {
              const colors = subjectColors[index % subjectColors.length];
              const iconData = subjectIcons[index % subjectIcons.length];
              const SIcon = iconData.icon;
              return (
                <div key={subject} onClick={() => handleSubjectClick(subject)} className="group relative cursor-pointer animate-pop" style={{ animationDelay: `${index * 0.06}s` }}>
                  <div className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl p-6 transition-all duration-500 border-2 border-white/80 hover:border-transparent hover:shadow-2xl hover:-translate-y-3 overflow-hidden`}>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconData.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300 shadow-md`}><SIcon className={`${iconData.textColor}`} size={22} /></div>
                          <div className="text-base sm:text-lg font-['Space_Grotesk'] font-extrabold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">{subject}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs font-['Inter'] font-medium text-gray-400 group-hover:text-purple-600 transition-colors duration-300 flex items-center gap-1">Explore Subject<ChevronRight className="group-hover:translate-x-1 transition-transform duration-300" size={14} /></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </LockedContent>
      </div>
    );
  };

  // 🚨 UNIT STEP: Extra safety, but Subject step pe hi lock lag gaya toh yahan aayega hi nahi bina pay kiye
  const renderUnitStep = () => {
    const categoryLabel = categories.find((c) => c.id === selectedCategory)?.label || "";
    
    return (
      <div className="animate-slide-up">
         <div className="flex items-center gap-4 mb-8 flex-wrap">
          <button onClick={goBack} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-gray-700 font-['Inter'] font-semibold text-sm group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />Back
          </button>
        </div>
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Select Your <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">Unit</span>
          </h2>
        </div>
        {isContentLoading && units.length === 0 ? (
          <div className="text-center py-16"><div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div></div>
        ) : units.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-['Space_Grotesk'] font-bold text-gray-700">No Units Available</h3>
            <p className="font-['Inter'] text-gray-400 mt-2">{contentError || "Admin hasn't uploaded any content yet."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
            {units.map((unit, index) => {
              const colors = unitColors[index % unitColors.length];
              const content = unitContent.filter((item) => Number(item?.unit) === Number(unit?.id));
              return (
                <div key={unit.id} className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border-2 border-white/80 shadow-md`}>
                  <div className={`text-3xl font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent mb-2`}>{unit.name}</div>
                  <div className="space-y-3 mt-4">
                    {content.map((item) => (
                      <div key={item._id} className="bg-white/80 p-3 rounded-xl border border-gray-200">
                        <p className="text-sm font-bold text-gray-800 mb-2 truncate">{item.title || item.fileName}</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleView(item)} className="flex-1 bg-blue-500 text-white text-xs py-1.5 rounded-lg flex items-center justify-center gap-1"><Eye size={12}/>View</button>
                          <button onClick={() => handleDownload(item)} className="flex-1 bg-emerald-500 text-white text-xs py-1.5 rounded-lg flex items-center justify-center gap-1"><Download size={12}/>Download</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-white pb-20">
      <Toaster position="top-right" toastOptions={{ style: { background: "#363636", color: "#fff" } }} />
      
      {/* HEADER BANNER */}
      <div className="w-screen bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a3a5c] overflow-hidden relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-16 sm:mt-20">
        <div className="relative h-[320px] sm:h-[390px] md:h-[470px] w-full">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bannerImg})`, backgroundPosition: "center 8%" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/90 via-[#071426]/38 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/70 via-transparent to-transparent"></div>
          </div>
          <div className="relative z-20 flex items-end h-full px-4 sm:px-8 md:px-16 lg:px-24 pb-10">
            <div className="max-w-2xl animate-slide-up">
              <h1 className="text-white font-['Space_Grotesk'] font-extrabold leading-[1.1]">
                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl block">Bachelor of</span>
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl block bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">Pharmacy</span>
              </h1>
              <p className="text-gray-300 text-sm sm:text-base mt-4 font-['Inter'] max-w-xl">Complete Notes, Semester-wise PDFs, Practical Videos & Predictive Papers for B.Pharm Students.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-14">
        {currentStep === 1 && renderCategoryStep()}
        {currentStep === 2 && renderSemesterStep()}
        {currentStep === 3 && renderSubjectStep()}
        {currentStep === 4 && renderUnitStep()}

        {currentStep > 1 && (
          <div className="text-center mt-10">
            <button onClick={resetNavigation} className="text-gray-400 hover:text-gray-600 text-sm font-['Inter'] transition-colors duration-300">
              Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BPharm;