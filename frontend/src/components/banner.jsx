import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  PlayCircle,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Video,
  BookOpen,
} from "lucide-react";

import bannerPic from "../assets/banner-pic.png";
import students from "../assets/students.png";

const Banner = () => {
  const navigate = useNavigate();
  const [activeBanner, setActiveBanner] = useState(1);

  const [showCard, setShowCard] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);

  // BANNER EVENT
  const dispatchBannerChange = (bannerId) => {
    const event = new CustomEvent("bannerChange", {
      detail: { activeBanner: bannerId },
    });
    window.dispatchEvent(event);
  };

  // AUTO SLIDER
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((prev) => {
        const newBanner = prev === 1 ? 2 : 1;
        dispatchBannerChange(newBanner);
        return newBanner;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // INITIAL EVENT
  useEffect(() => {
    dispatchBannerChange(1);
  }, []);

  // FIRST BANNER CARD ANIMATION
  useEffect(() => {
    if (activeBanner === 1) {
      setShowCard(false);
      setShow1(false);
      setShow2(false);
      setShow3(false);
      setTimeout(() => setShowCard(true), 200);
      setTimeout(() => setShow1(true), 600);
      setTimeout(() => setShow2(true), 1000);
      setTimeout(() => setShow3(true), 1400);
    }
  }, [activeBanner]);

  // Navigation Handlers for B.Pharm
  const handleBPharmNotes = () => {
    navigate('/bpharm', { state: { scrollTo: 'notes' } });
  };

  const handleBPharmVideos = () => {
    navigate('/bpharm', { state: { scrollTo: 'videos' } });
  };

  // Navigation Handlers for D.Pharm
  const handleDPharmNotes = () => {
    navigate('/dpharm', { state: { scrollTo: 'notes' } });
  };

  const handleDPharmVideos = () => {
    navigate('/dpharm', { state: { scrollTo: 'videos' } });
  };

  return (
    <section className="w-full overflow-hidden relative min-h-[550px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[700px]">

      {/* ================= FIRST BANNER (B.PHARM) ================= */}
      <div
        className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#e9f9f7] via-white to-[#f0fdfa] px-4 sm:px-8 md:px-12 py-8 sm:py-12 md:py-16 flex flex-col lg:flex-row items-center justify-center overflow-y-auto lg:overflow-hidden
        transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu will-change-transform
        ${activeBanner === 1 ? "translate-x-0 opacity-100 z-20" : "-translate-x-full opacity-0 z-10"}`}
      >

        {/* LEFT CONTENT */}
        <div className="w-full lg:w-1/2 max-w-[600px] z-10 text-center lg:text-left px-4 lg:px-0 mb-8 lg:mb-0">
          <div className="overflow-hidden">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[68px] xl:text-[76px] lg:leading-[1.2] font-black font-['Inter'] text-[#0A1E2E] mb-4 sm:mb-6 tracking-tight">
              Learn Pharmacy <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Smarter, Not Harder!
              </span>
            </h1>
          </div>

          <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8 md:mb-10 font-semibold text-gray-600 max-w-[540px] mx-auto lg:mx-0">
            Notes, Videos, MCQs, PYQs & more — All in one place
            for <span className="font-extrabold text-gray-800">B.Pharm & D.Pharm</span> students.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-5 flex-wrap">
            <button 
              onClick={handleBPharmNotes}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2"
            >
              <BookOpen size={18} className="sm:w-5 sm:h-5" />
              Download Notes
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={handleBPharmVideos}
              className="group bg-white border-2 border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <Video size={18} className="sm:w-5 sm:h-5" />
              Watch Practical Videos
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE - Image + Stats Card side by side */}
        <div className="w-full lg:w-1/2 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 mt-6 lg:mt-0">
          
          {/* IMAGE */}
          <div className="flex justify-center">
            <img
              src={bannerPic}
              alt="Banner"
              className="w-[250px] sm:w-[300px] md:w-[380px] lg:w-[400px] xl:w-[450px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* STATS CARD */}
          <div
            className={`bg-white/95 backdrop-blur-sm shadow-2xl w-[240px] sm:w-[260px] p-5 rounded-3xl border border-white/50 transition-all duration-1000
            ${showCard ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}
          >
            <div
              className={`flex items-center gap-4 pb-4 border-b border-gray-100 transition-all duration-700
              ${show1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center rounded-2xl shadow-inner">
                <GraduationCap className="text-teal-600" size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-800 leading-none tracking-tight">50K+</h2>
                <p className="text-gray-500 mt-1 font-semibold text-sm">Students</p>
              </div>
            </div>

            <div
              className={`flex items-center gap-4 py-4 border-b border-gray-100 transition-all duration-700
              ${show2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center rounded-2xl shadow-inner">
                <FileText className="text-blue-600" size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-800 leading-none tracking-tight">8K+</h2>
                <p className="text-gray-500 mt-1 font-semibold text-sm">Notes</p>
              </div>
            </div>

            <div
              className={`flex items-center gap-4 pt-4 transition-all duration-700
              ${show3 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-20"}`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center rounded-2xl shadow-inner">
                <PlayCircle className="text-purple-600" size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-800 leading-none tracking-tight">1000+</h2>
                <p className="text-gray-500 mt-1 font-semibold text-sm">Videos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SECOND BANNER (D.PHARM) - IMAGE AUR BADA ================= */}
      <div
        className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#063b47] via-[#0b5c60] to-[#1aa19d] px-4 sm:px-8 md:px-16 py-8 sm:py-12 md:py-16 flex flex-col lg:flex-row items-center justify-center overflow-y-auto lg:overflow-hidden
        transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu will-change-transform
        ${activeBanner === 2 ? "translate-x-0 opacity-100 z-20" : "-translate-x-full opacity-0 z-10"}`}
      >

        {/* LEFT CONTENT */}
        <div className="w-full lg:w-1/2 max-w-[620px] text-white z-10 text-center lg:text-left px-4 lg:px-0 mb-8 lg:mb-0">
          <div className="overflow-hidden">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] xl:text-[72px] lg:leading-[1.2] font-black font-['Inter'] mb-4 sm:mb-6 tracking-tight">
              Smarter AI <br />
              Healthcare Starts <br />
              With <span className="text-[#d9ff63] inline-block animate-bounce-subtle">PharmaVerse</span>
            </h1>
          </div>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-[#d7f9f5] mb-6 sm:mb-8 max-w-[560px] mx-auto lg:mx-0 font-medium">
            PharmaVerse is an AI-powered medical learning platform
            built to transform pharmacy education into smart,
            actionable learning insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-5 flex-wrap">
            <button 
              onClick={handleDPharmNotes}
              className="group bg-[#d9ff63] text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base md:text-lg hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-2"
            >
              <BookOpen size={18} className="sm:w-5 sm:h-5" />
              Download Notes
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={handleDPharmVideos}
              className="group bg-white/10 border border-white/30 backdrop-blur-md text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base md:text-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <Video size={18} className="sm:w-5 sm:h-5" />
              Watch Practical Videos
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE - AUR BADA */}
        <div className="w-full lg:w-1/2 flex justify-center mt-6 lg:mt-0">
          <img
            src={students}
            alt="Students"
            className="w-[380px] sm:w-[480px] md:w-[580px] lg:w-[700px] xl:w-[800px] 2xl:w-[900px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>

      {/* GLOBAL ANIMATIONS */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Banner;