import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

import bannerImg from "../assets/pharmacy-lab student.jpeg";
import LockedContent from "./LockedContent"; // ✅ LOCKED CONTENT ADDED


import {
  BookOpen, FileText, Video, Brain, Download, GraduationCap, PlayCircle,
  Lock, Eye, Crown, Sparkles, Rocket, ArrowLeft, CheckCircle, Book, Layers,
  FolderOpen, Zap, Award, Target, Gem, Shield, Trophy, ArrowRight, HeartPulse,
  Microscope, Pill, FlaskRound, Users, Stethoscope, ChevronRight, Code2,
  MessageSquare, Atom, Leaf, Beaker
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.pharmaverse.co.in";

// ========== CATEGORIES ==========
const categories = [
  { id: "Notes", label: "Notes", icon: BookOpen, gradient: "from-blue-600 via-indigo-600 to-purple-600", bgGradient: "from-blue-50 via-indigo-50 to-purple-50", glowColor: "rgba(99, 102, 241, 0.3)", description: "Click below to view notes by Imperfect Pharmacy", stats: "500+ PDFs", badge: "Most Popular" },
  { id: "Exam Crash Course", label: "Exam Crash Course", icon: Rocket, gradient: "from-orange-500 via-amber-500 to-yellow-500", bgGradient: "from-orange-50 via-amber-50 to-yellow-50", glowColor: "rgba(251, 146, 60, 0.3)", description: "Click below to view Exam Crash Course by Imperfect Pharmacy", stats: "8 Semesters", badge: "🔥 Crash" },
  { id: "PYQs", label: "PYQs", icon: Brain, gradient: "from-rose-500 via-pink-500 to-purple-500", bgGradient: "from-rose-50 via-pink-50 to-purple-50", glowColor: "rgba(244, 63, 94, 0.3)", description: "Click below to view PYQs by Imperfect Pharmacy", stats: "1000+ Questions", badge: "📝 Exam" }
];

// ========== COLORS ==========
const semesterColors = [
  { gradient: "from-rose-500 to-pink-500", glow: "rgba(244, 63, 94, 0.5)", bg: "from-rose-50 to-pink-50", border: "border-rose-200", shadow: "shadow-rose-200/50", darkBg: "from-rose-600 to-pink-600", lightBg: "from-rose-100 to-pink-100" },
  { gradient: "from-blue-500 to-cyan-500", glow: "rgba(59, 130, 246, 0.5)", bg: "from-blue-50 to-cyan-50", border: "border-blue-200", shadow: "shadow-blue-200/50", darkBg: "from-blue-600 to-cyan-600", lightBg: "from-blue-100 to-cyan-100" },
  { gradient: "from-emerald-500 to-teal-500", glow: "rgba(16, 185, 129, 0.5)", bg: "from-emerald-50 to-teal-50", border: "border-emerald-200", shadow: "shadow-emerald-200/50", darkBg: "from-emerald-600 to-teal-600", lightBg: "from-emerald-100 to-teal-100" },
  { gradient: "from-purple-500 to-indigo-500", glow: "rgba(139, 92, 246, 0.5)", bg: "from-purple-50 to-indigo-50", border: "border-purple-200", shadow: "shadow-purple-200/50", darkBg: "from-purple-600 to-indigo-600", lightBg: "from-purple-100 to-indigo-100" },
  { gradient: "from-orange-500 to-amber-500", glow: "rgba(251, 146, 60, 0.5)", bg: "from-orange-50 to-amber-50", border: "border-orange-200", shadow: "shadow-orange-200/50", darkBg: "from-orange-600 to-amber-600", lightBg: "from-orange-100 to-amber-100" },
  { gradient: "from-pink-500 to-rose-500", glow: "rgba(236, 72, 153, 0.5)", bg: "from-pink-50 to-rose-50", border: "border-pink-200", shadow: "shadow-pink-200/50", darkBg: "from-pink-600 to-rose-600", lightBg: "from-pink-100 to-rose-100" },
  { gradient: "from-cyan-500 to-blue-500", glow: "rgba(6, 182, 212, 0.5)", bg: "from-cyan-50 to-blue-50", border: "border-cyan-200", shadow: "shadow-cyan-200/50", darkBg: "from-cyan-600 to-blue-600", lightBg: "from-cyan-100 to-blue-100" },
  { gradient: "from-teal-500 to-emerald-500", glow: "rgba(20, 184, 166, 0.5)", bg: "from-teal-50 to-emerald-50", border: "border-teal-200", shadow: "shadow-teal-200/50", darkBg: "from-teal-600 to-emerald-600", lightBg: "from-teal-100 to-emerald-100" },
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
  8: ["Ethical Considerations and Translational Applications of AI in Pharmacy", "Clinical Pharmacotherapeutics", "Industrial Pharmacy and Facility Design", "Pharmaceutical Management", "Sterile Dosage Forms and Novel Drug Delivery System", "Pharmaceutical Packaging", "Supply Chain Management", "Industrial Safety and Waste Management", "Traditional Healing Practices of India", "Futuristic Pharma through AR/VR: Pharma 4.0", "Herbal Cosmetics for Industry Perspective"]
};

// ✅ Content key builder (Admin panel se match hona chahiye)
const buildContentKey = (category, semester) => {
  const categorySlug = String(category || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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

  // ✅ Store access status per semester (e.g. { 1: true, 2: false })
  const [unlockedSems, setUnlockedSems] = useState({});

  const contentRequestIdRef = useRef(0);
  const contentAbortControllerRef = useRef(null);

  const getAvailableSubjects = () => {
    const semester = Number(selectedSemester);
    return Array.isArray(BPHARM_SUBJECTS[semester]) ? BPHARM_SUBJECTS[semester] : [];
  };

  // ✅ Check Access for all semesters dynamically
  useEffect(() => {
    if (currentStep === 2 && selectedCategory) {
      const checkAccess = async () => {
        const token = localStorage.getItem("userToken") || localStorage.getItem("token");
        if (!token) return;

        const sems = [1, 2, 3, 4, 5, 6, 7, 8];
        const newUnlocked = {};

        await Promise.all(sems.map(async (sem) => {
          const contentKey = buildContentKey(selectedCategory, sem);
          try {
            const response = await axios.get(
              `${API_BASE}/api/payment/check-access/course-content/${encodeURIComponent(contentKey)}`,
              {
                headers: { Authorization: `Bearer ${token}` },
                params: { course: "B.Pharm", category: selectedCategory, semester: String(sem), year: "", language: "", specialization: "", contentKey }
              }
            );
            newUnlocked[sem] = response.data?.hasAccess === true;
          } catch (err) {
            newUnlocked[sem] = false;
          }
        }));

        setUnlockedSems(newUnlocked);
      };

      checkAccess();
    }
  }, [currentStep, selectedCategory]);

  // ========== FETCH NOTES ==========
  const fetchUnitContent = async () => {
    if (!selectedCategory || !selectedSemester || !selectedSubject) {
      setUnitContent([]); setUnits([]); return;
    }

    const requestId = ++contentRequestIdRef.current;
    if (contentAbortControllerRef.current) contentAbortControllerRef.current.abort();
    setUnitContent([]); setUnits([]);

    const controller = new AbortController();
    contentAbortControllerRef.current = controller;

    try {
      const res = await axios.get(`${API_BASE}/api/admin/public/notes`, {
        params: { course: "B.Pharm", category: selectedCategory, semester: selectedSemester, subject: selectedSubject },
        signal: controller.signal
      });

      if (requestId !== contentRequestIdRef.current) return;

      const rawContent = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      setUnitContent(rawContent);

      const unitMap = new Map();
      rawContent.forEach((item) => {
        const unitValue = Number(item?.unit);
        if (Number.isInteger(unitValue) && unitValue > 0) {
          if (!unitMap.has(unitValue)) unitMap.set(unitValue, { id: unitValue, name: `Unit ${unitValue}`, topics: [] });
        }
      });

      setUnits(Array.from(unitMap.values()).sort((a, b) => a.id - b.id));
    } catch (error) {
      if (error?.name === "CanceledError") return;
      if (requestId !== contentRequestIdRef.current) return;
      setUnitContent([]); setUnits([]);
    } finally {
      if (requestId === contentRequestIdRef.current) contentAbortControllerRef.current = null;
    }
  };

  useEffect(() => {
    if (selectedCategory && selectedSemester && selectedSubject) fetchUnitContent();
    else { setUnits([]); setUnitContent([]); }
  }, [selectedCategory, selectedSemester, selectedSubject]);

  // ========== HANDLERS ==========
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentStep(2);
    setSelectedSemester(null); setSelectedSubject(null);
    setUnits([]); setUnitContent([]);
    setUnlockedSems({}); // reset locks
  };

  const handleSemesterClick = (semester) => {
    if (!unlockedSems[semester]) {
      toast.error("🔒 Semester Locked! Please complete payment to unlock.");
      return;
    }
    setSelectedSemester(semester);
    setCurrentStep(3);
    setSelectedSubject(null); setUnits([]); setUnitContent([]);
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setCurrentStep(4);
    setUnits([]); setUnitContent([]);
  };

  const goBack = () => {
    if (currentStep === 2) { setCurrentStep(1); setSelectedCategory(null); }
    else if (currentStep === 3) { setCurrentStep(2); setSelectedSemester(null); }
    else if (currentStep === 4) { setCurrentStep(3); setSelectedSubject(null); setUnits([]); setUnitContent([]); }
  };

  const resetNavigation = () => {
    setCurrentStep(1); setSelectedCategory(null); setSelectedSemester(null); setSelectedSubject(null);
    setUnits([]); setUnitContent([]); setUnlockedSems({});
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

  useEffect(() => { window.history.scrollRestoration = "manual"; window.scrollTo(0, 0); }, []);

  const handleCardMouseMove = (cardId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePositions(prev => ({ ...prev, [cardId]: { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 } }));
  };

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

  // ========== RENDER CATEGORY STEP ==========
  const renderCategoryStep = () => (
    <div className="animate-slide-up">
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-100 to-blue-100 mb-4 animate-float-text">
          <Sparkles className="text-sky-600" size={16} />
          <span className="text-xs font-['Inter'] font-bold text-sky-700 tracking-wider uppercase">Step 1 of 4</span>
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
            <div key={category.id} onClick={() => handleCategoryClick(category.id)} className={`group relative cursor-pointer animate-slide-up`} style={{ animationDelay: `${index * 0.1}s` }} onMouseEnter={() => setHoveredCard(category.id)} onMouseLeave={() => setHoveredCard(null)} onMouseMove={(e) => handleCardMouseMove(category.id, e)}>
              <div className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl" style={{ background: `radial-gradient(circle at ${mousePositions[category.id]?.x || 50}% ${mousePositions[category.id]?.y || 50}%, ${category.glowColor}, transparent 70%)` }}></div>
              <div className={`relative bg-gradient-to-br ${category.bgGradient} rounded-3xl p-7 sm:p-9 transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-2xl border-2 border-white/50 backdrop-blur-sm overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-r ${category.gradient} flex items-center justify-center mb-5 shadow-2xl group-hover:scale-110 transition-all duration-500 animate-float-medium relative z-10`}><Icon className="text-white" size={34} /></div>
                <div className="absolute top-4 right-4 z-10"><span className={`text-[10px] font-['Inter'] font-bold px-3 py-1 rounded-full bg-gradient-to-r ${category.gradient} text-white shadow-lg`}>{category.badge}</span></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-['Space_Grotesk'] font-extrabold text-gray-800 mb-2">{category.label}</h3>
                  <p className="text-sm font-['Inter'] text-gray-600 leading-relaxed mb-3">{category.description}</p>
                  <div className="flex items-center gap-3 text-xs font-['Inter']">
                    <span className="flex items-center gap-1 text-gray-500"><Award size={14} className="text-amber-500" />{category.stats}</span>
                    <span className="w-px h-4 bg-gray-300"></span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium group-hover:gap-2 transition-all duration-300"><Zap size={14} />Click to Explore</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ========== RENDER SEMESTER STEP (WITH LOCKED CONTENT LOGIC) ==========
  const renderSemesterStep = () => {
    const categoryLabel = categories.find(c => c.id === selectedCategory)?.label || '';
    const categoryIcon = categories.find(c => c.id === selectedCategory)?.icon || BookOpen;
    const Icon = categoryIcon;
    const allSemesters = [1, 2, 3, 4, 5, 6, 7, 8];

    return (
      <div className="animate-scale-in">
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <button onClick={goBack} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-gray-700 font-['Inter'] font-semibold text-sm group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />Back
          </button>
          <div className="flex items-center gap-3 glass-effect rounded-2xl px-5 py-3 shadow-lg border border-white/50">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${categories.find(c => c.id === selectedCategory)?.gradient} flex items-center justify-center shadow-md`}>
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
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Pay to unlock your semester content
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {allSemesters.map((sem, index) => {
            const colors = semesterColors[index % semesterColors.length];
            const cardId = `semester-${sem}`;
            const delayClass = `semester-card-${index + 1}`;
            
            const isUnlocked = unlockedSems[sem] === true;

            // ✅ Product object for locked payment
            const contentKey = buildContentKey(selectedCategory, sem);
            const lockProduct = {
              type: "course-content",
              id: contentKey,
              title: `B.Pharm ${selectedCategory} - Semester ${sem}`,
              course: "B.Pharm",
              category: selectedCategory,
              semester: String(sem),
              year: "",
              language: "",
              specialization: "",
              contentKey: contentKey,
            };

            return (
              <div key={sem} className={`group relative ${!isUnlocked ? 'cursor-pointer' : 'cursor-default'}`}>
                
                {/* 🚨 IF LOCKED -> Show LockedContent Wrapper */}
                {!isUnlocked ? (
                  <LockedContent 
                    product={lockProduct}
                    previewContent={
                      <div className={`relative rounded-2xl p-4 sm:p-6 text-center overflow-hidden grayscale-[30%] bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-xl ${colors.shadow}`}>
                         <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center rounded-2xl">
                            <Lock size={32} className="text-gray-700 mb-2 drop-shadow-md" />
                         </div>
                         <div className="relative z-10 flex flex-col items-center justify-center h-full pt-2 opacity-50">
                            <div className={`text-4xl sm:text-5xl font-['Space_Grotesk'] font-extrabold text-gray-600 leading-none`}>{sem}</div>
                            <div className="text-[10px] sm:text-xs font-['Inter'] font-semibold uppercase tracking-widest mt-2 text-gray-600">Semester</div>
                            <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-300 text-gray-700 text-[10px] font-['Inter'] font-bold shadow-sm">
                              <Lock size={12} />Locked
                            </div>
                         </div>
                      </div>
                    }
                  >
                    {/* Ye content sirf pay karne ke baad dikhega */}
                    <div 
                      onClick={() => handleSemesterClick(sem)}
                      className={`relative rounded-2xl p-4 sm:p-6 text-center transition-all duration-500 overflow-hidden premium-card bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-xl ${colors.shadow}`}
                    >
                      <div className="glow-ring" style={{ '--x': `50%`, '--y': `50%` }}></div>
                      <div className="shine-overlay"></div>
                      <div className="relative z-10 flex flex-col items-center justify-center h-full pt-2">
                        <div className={`text-4xl sm:text-5xl font-['Space_Grotesk'] font-extrabold gradient-text bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent leading-none number-glow`}>{sem}</div>
                        <div className={`text-[10px] sm:text-xs font-['Inter'] font-semibold uppercase tracking-widest mt-2 text-gray-600`}>Semester</div>
                        <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-['Inter'] font-bold shadow-lg shadow-emerald-200/50 status-pulse">
                          <CheckCircle size={12} />Open
                        </div>
                        <div className="mt-3 text-xs font-['Inter'] font-medium text-gray-500">{BPHARM_SUBJECTS[sem]?.length || 0} Subjects</div>
                      </div>
                    </div>
                  </LockedContent>
                ) : (
                  // ✅ IF ALREADY UNLOCKED -> Show normal card
                  <div
                    onClick={() => handleSemesterClick(sem)}
                    className={`relative rounded-2xl p-4 sm:p-6 text-center transition-all duration-500 overflow-hidden premium-card ${delayClass} bg-gradient-to-br ${colors.bg} border-2 ${colors.border} shadow-xl ${colors.shadow}`}
                    style={{ boxShadow: `0 8px 32px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.05)` }}
                  >
                    <div className="glow-ring" style={{ '--x': `50%`, '--y': `50%` }}></div>
                    <div className="shine-overlay"></div>
                    <div className="absolute top-2 right-2 sparkle-dot"><Sparkles size={12} className="text-white opacity-70" /></div>
                    <div className="absolute inset-[2px] rounded-[14px] bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col items-center justify-center h-full pt-2">
                      <div className={`text-4xl sm:text-5xl font-['Space_Grotesk'] font-extrabold gradient-text bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent leading-none number-glow`}>{sem}</div>
                      <div className={`text-[10px] sm:text-xs font-['Inter'] font-semibold uppercase tracking-widest mt-2 text-gray-600`}>Semester</div>
                      <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-['Inter'] font-bold shadow-lg shadow-emerald-200/50 status-pulse">
                        <CheckCircle size={12} />Open
                      </div>
                      <div className="mt-3 text-xs font-['Inter'] font-medium text-gray-500">{BPHARM_SUBJECTS[sem]?.length || 0} Subjects</div>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ========== RENDER SUBJECT STEP ==========
  const renderSubjectStep = () => {
    const subjects = getAvailableSubjects();
    const categoryLabel = categories.find(c => c.id === selectedCategory)?.label || '';
    const categoryGradient = categories.find(c => c.id === selectedCategory)?.gradient || 'from-purple-500 to-pink-500';

    return (
      <div className="animate-slide-down">
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
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-5 shadow-inner animate-float-text">
            <Sparkles className="text-purple-600" size={18} />
            <span className="text-xs font-['Inter'] font-bold text-purple-700 tracking-widest uppercase">Step 3 of 4</span>
            <Trophy className="text-purple-600" size={18} />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Select Your <span className={`bg-gradient-to-r ${categoryGradient} bg-clip-text text-transparent animate-gradient`}>Subject</span>
          </h2>
          <div className={`w-24 h-1.5 bg-gradient-to-r ${categoryGradient} mx-auto rounded-full mt-4 animate-gradient`}></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto pb-24">
          {subjects.map((subject, index) => {
            const colors = subjectColors[index % subjectColors.length];
            const iconData = subjectIcons[index % subjectIcons.length];
            const Icon = iconData.icon;
            const cardId = `subject-${index}`;
            
            return (
              <div key={subject} onClick={() => handleSubjectClick(subject)} className={`group relative cursor-pointer animate-pop`} style={{ animationDelay: `${index * 0.06}s` }} onMouseEnter={() => setHoveredCard(cardId)} onMouseLeave={() => setHoveredCard(null)} onMouseMove={(e) => handleCardMouseMove(cardId, e)}>
                <div className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl" style={{ background: `radial-gradient(circle at ${mousePositions[cardId]?.x || 50}% ${mousePositions[cardId]?.y || 50}%, ${colors.glow}, transparent 70%)` }}></div>
                <div className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl p-6 transition-all duration-500 border-2 border-white/80 hover:border-transparent hover:shadow-2xl hover:-translate-y-3 overflow-hidden group`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${iconData.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300 shadow-md`}>
                          <Icon className={`${iconData.textColor}`} size={22} />
                        </div>
                        <div className="text-base sm:text-lg font-['Space_Grotesk'] font-extrabold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">{subject}</div>
                      </div>
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center text-white text-[10px] font-['Inter'] font-bold shadow-lg animate-pulse`}>{index + 1}</div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-['Inter'] font-medium text-gray-400 group-hover:text-purple-600 transition-colors duration-300 flex items-center gap-1">
                        Explore Subject<ChevronRight className="group-hover:translate-x-1 transition-transform duration-300" size={14} />
                      </span>
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center shadow-lg transform group-hover:scale-110`}>
                        <ArrowRight className="text-white" size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ========== RENDER UNIT STEP ==========
  const renderUnitStep = () => {
    const categoryLabel = categories.find(c => c.id === selectedCategory)?.label || '';

    return (
      <div className="animate-slide-up">
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
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm font-['Inter'] font-medium">Subject:</span>
            <span className="font-['Space_Grotesk'] font-bold text-gray-800 truncate max-w-[120px]">{selectedSubject}</span>
          </div>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 mb-5 shadow-inner animate-float-text">
            <Sparkles className="text-emerald-600" size={18} />
            <span className="text-xs font-['Inter'] font-bold text-emerald-700 tracking-widest uppercase">Step 4 of 4</span>
            <Trophy className="text-emerald-600" size={18} />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Select Your <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">Unit</span>
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 mx-auto rounded-full mt-4 animate-gradient"></div>
        </div>

        {units.length === 0 ? (
          <div className="text-center py-16 pb-24">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4 shadow-inner animate-pulse">
              <FolderOpen className="text-gray-400" size={48} />
            </div>
            <h3 className="text-xl font-['Space_Grotesk'] font-bold text-gray-700">No Units Available</h3>
            <p className="font-['Inter'] text-gray-400 mt-2">Admin hasn't uploaded any content for this subject yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto pb-24">
            {units.map((unit, index) => {
              const colors = unitColors[index % unitColors.length];
              const cardId = `unit-${unit.id}`;
              
              const content = unitContent.filter((item) => {
                const itemUnit = Number(item?.unit);
                const unitId = Number(unit?.id);
                return Number.isInteger(itemUnit) && itemUnit > 0 && Number.isInteger(unitId) && itemUnit === unitId;
              });
              
              return (
                <div key={unit.id} className={`group relative cursor-pointer animate-pop`} style={{ animationDelay: `${index * 0.06}s` }} onMouseEnter={() => setHoveredCard(cardId)} onMouseLeave={() => setHoveredCard(null)} onMouseMove={(e) => handleCardMouseMove(cardId, e)}>
                  <div className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl p-6 transition-all duration-500 border-2 border-white/80 hover:border-transparent hover:shadow-2xl hover:-translate-y-3 overflow-hidden group`}>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`text-4xl sm:text-5xl font-['Space_Grotesk'] font-extrabold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>{unit.name}</div>
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center text-white text-xs font-['Inter'] font-bold shadow-lg animate-pulse`}>{unit.id || index + 1}</div>
                      </div>
                      
                      {content.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-gray-200/50">
                          <div className="space-y-3">
                            {content.map((item) => (
                              <div key={item._id} className="rounded-xl bg-white/80 border border-gray-200 p-3 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText size={16} className="text-blue-600 shrink-0 animate-pulse" />
                                  <span className="text-sm font-['Inter'] font-semibold text-gray-800 truncate">{item.title || item.fileName || "Document"}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={(e) => { e.stopPropagation(); handleView(item); }} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg font-['Inter'] font-semibold text-xs flex items-center justify-center gap-1.5 hover:shadow-lg hover:scale-105 transition-all duration-300">
                                    <Eye size={14} />Preview
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDownload(item); }} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-2 rounded-lg font-['Inter'] font-semibold text-xs flex items-center justify-center gap-1.5 hover:shadow-lg hover:scale-105 transition-all duration-300">
                                    <Download size={14} />Download
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
                <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-['Inter'] font-bold text-sm transition-all duration-500 ${isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200' : isActive ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-200 scale-110 animate-pulse-glow' : 'bg-gray-200 text-gray-500'}`}>
                  {isCompleted ? <CheckCircle size={20} /> : <Icon size={18} />}
                  {isActive && (<div className="absolute -inset-1 rounded-full border-2 border-blue-400/50 animate-pulse"></div>)}
                </div>
                <span className={`text-xs sm:text-sm font-['Inter'] font-medium hidden sm:inline ${isActive ? 'text-blue-600 font-bold animate-pulse' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>{step.label}</span>
              </div>
              {index < steps.length - 1 && (<div className={`w-8 sm:w-12 h-0.5 mx-1 sm:mx-2 transition-all duration-500 ${isCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-400 animate-gradient' : 'bg-gray-200'}`}></div>)}
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
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#363636', color: '#fff' }, success: { duration: 3000, style: { background: '#10b981', color: '#fff' } }, error: { duration: 4000, style: { background: '#ef4444', color: '#fff' } } }} />

      {/* HEADER BANNER */}
      <div className="w-screen bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a3a5c] overflow-hidden relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-16 sm:mt-20">
        <div className="relative h-[320px] sm:h-[390px] md:h-[470px] w-full">
          <div className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bannerImg})`, backgroundPosition: 'center 8%', backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/90 via-[#071426]/38 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/70 via-transparent to-transparent"></div>
          </div>
          <div className="relative z-20 flex items-end h-full px-4 sm:px-8 md:px-16 lg:px-24 pb-10 sm:pb-12 md:pb-14 lg:pb-16">
            <div className="max-w-2xl animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 mb-4 animate-float-text">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="text-xs font-['Inter'] font-semibold text-blue-300 tracking-widest uppercase">B.Pharm Program</span>
              </div>
              <h1 className="text-white font-['Space_Grotesk'] font-extrabold leading-[1.1]">
                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl block animate-float-text">Bachelor of</span>
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl block bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">Pharmacy</span>
              </h1>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg font-['Inter'] font-light leading-relaxed max-w-xl animate-float-text">
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
          <div className="text-center mt-10 pb-20">
            <button onClick={resetNavigation} className="text-gray-400 hover:text-gray-600 text-sm font-['Inter'] transition-colors duration-300 group flex items-center gap-2 mx-auto">
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