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
    <section className="w-full overflow-hidden relative h-screen">

      {/* ================= FIRST BANNER (B.PHARM) ================= */}

      <div
        className={`absolute top-0 left-0 w-full h-screen bg-gradient-to-br from-[#e9f9f7] via-white to-[#f0fdfa] px-12 py-8 flex items-center justify-between overflow-hidden
        transition-all duration-[1400ms]
        ease-[cubic-bezier(0.22,1,0.36,1)]
        transform-gpu
        will-change-transform
        ${
          activeBanner === 1
            ? "translate-x-0 opacity-100 z-20"
            : "-translate-x-full opacity-0 z-10"
        }`}
      >

        {/* LEFT CONTENT - Premium Typography with SUPER ANIMATION */}

        <div className="max-w-[600px] z-10">

          

          {/* Main Heading with SLIDE IN + TYPEWRITER EFFECT */}
          <div className="overflow-hidden">
            <h1 className="text-[76px] leading-[84px] font-black font-['Inter'] text-[#0A1E2E] mb-6 tracking-tight animate-[slideInLeft_0.8s_ease-out]">
              Learn Pharmacy <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Smarter, Not Harder!
              </span>
            </h1>
          </div>

          {/* Description with FADE IN + SLIGHT DELAY */}
          <p className="text-xl leading-relaxed mb-10 font-semibold text-gray-600 max-w-[540px] animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
            Notes, Videos, MCQs, PYQs & more — All in one place
            for <span className="font-extrabold text-gray-800">B.Pharm & D.Pharm</span> students.
          </p>

          {/* Buttons - Side by Side (Download Left, Watch Right) */}
          <div className="flex items-center gap-5 flex-wrap animate-[fadeInUp_0.8s_ease-out_0.4s_both]">

            <button 
              onClick={handleBPharmNotes}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center gap-2"
            >
              <BookOpen size={20} />
              Download Notes
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={handleBPharmVideos}
              className="group bg-white border-2 border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <Video size={20} />
              Watch Practical Videos
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

          </div>

         

        </div>

        {/* CENTER IMAGE with BOUNCE IN ANIMATION */}

        <div className="flex-1 flex justify-start ml-[-40px] animate-[scaleIn_0.8s_ease-out_0.3s_both]">

          <img
            src={bannerPic}
            alt="Banner"
            className="w-[600px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
          />

        </div>

        {/* RIGHT STATS CARD - Premium Design */}

        <div
          className={`absolute right-12 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm shadow-2xl w-[270px] p-6 rounded-3xl border border-white/50 transition-all duration-1000
          ${
            showCard
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-40"
          }`}
        >

          {/* ITEM 1 */}

          <div
            className={`flex items-center gap-4 pb-5 border-b border-gray-100 transition-all duration-700
            ${
              show1
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-20"
            }`}
          >

            <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center rounded-2xl shadow-inner">
              <GraduationCap className="text-teal-600" size={28} />
            </div>

            <div>

              <h2 className="text-[38px] font-black text-gray-800 leading-none tracking-tight">
                50K+
              </h2>

              <p className="text-gray-500 mt-1 font-semibold">
                Students
              </p>

            </div>
          </div>

          {/* ITEM 2 */}

          <div
            className={`flex items-center gap-4 py-5 border-b border-gray-100 transition-all duration-700
            ${
              show2
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-20"
            }`}
          >

            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center rounded-2xl shadow-inner">
              <FileText className="text-blue-600" size={28} />
            </div>

            <div>

              <h2 className="text-[38px] font-black text-gray-800 leading-none tracking-tight">
                8K+
              </h2>

              <p className="text-gray-500 mt-1 font-semibold">
                Notes
              </p>

            </div>
          </div>

          {/* ITEM 3 */}

          <div
            className={`flex items-center gap-4 pt-5 transition-all duration-700
            ${
              show3
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-20"
            }`}
          >

            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center rounded-2xl shadow-inner">
              <PlayCircle className="text-purple-600" size={28} />
            </div>

            <div>

              <h2 className="text-[38px] font-black text-gray-800 leading-none tracking-tight">
                1000+
              </h2>

              <p className="text-gray-500 mt-1 font-semibold">
                Videos
              </p>

            </div>
          </div>

        </div>
      </div>

      {/* ================= SECOND BANNER (D.PHARM) ================= */}

      <div
        className={`absolute top-0 left-0 w-full h-screen bg-gradient-to-br from-[#063b47] via-[#0b5c60] to-[#1aa19d] px-16 pt-4 pb-0 flex items-center justify-between overflow-hidden
        transition-all duration-[1400ms]
        ease-[cubic-bezier(0.22,1,0.36,1)]
        transform-gpu
        will-change-transform
        ${
          activeBanner === 2
            ? "translate-x-0 opacity-100 z-20"
            : "-translate-x-full opacity-0 z-10"
        }`}
      >

        {/* LEFT CONTENT - Premium Typography with SUPER ANIMATION */}

        <div className="max-w-[620px] text-white z-10">


          {/* Main Heading with SLIDE IN + GRADIENT TEXT */}
          <div className="overflow-hidden">
            <h1 className="text-[72px] leading-[80px] font-black font-['Inter'] mb-6 tracking-tight animate-[slideInLeft_0.8s_ease-out]">
              Smarter AI <br />
              Healthcare Starts <br />
              With <span className="text-[#d9ff63] inline-block animate-bounce-subtle">PharmaVerse</span>
            </h1>
          </div>

          {/* Description with FADE IN */}
          <p className="text-xl leading-relaxed text-[#d7f9f5] mb-8 max-w-[560px] font-medium animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
            PharmaVerse is an AI-powered medical learning platform
            built to transform pharmacy education into smart,
            actionable learning insights.
          </p>

          {/* Buttons - Side by Side (Download Left, Watch Right) */}
          <div className="flex items-center gap-5 flex-wrap animate-[fadeInUp_0.8s_ease-out_0.4s_both]">

            <button 
              onClick={handleDPharmNotes}
              className="group bg-[#d9ff63] text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-2"
            >
              <BookOpen size={20} />
              Download Notes
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={handleDPharmVideos}
              className="group bg-white/10 border border-white/30 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <Video size={20} />
              Watch Practical Videos
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

          </div>

         

        </div>

        {/* RIGHT IMAGE - Made larger and moved lower */}

        <div className="relative flex-1 flex items-end justify-center h-full pb-8 animate-[scaleIn_0.8s_ease-out_0.3s_both]">

         <img
          src={students}
          alt="Students"
          className="w-[180%] object-contain relative z-10 ml-[180px] mb-[-35px] drop-shadow-2xl hover:scale-105 transition-transform duration-500"
        />

        </div>
      </div>

      {/* GLOBAL ANIMATIONS */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-60px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
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