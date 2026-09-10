import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import bannerImg from "../assets/phd.jpg";

import {
  Sparkles,
  Rocket,
  Crown,
  GraduationCap,
  BookOpen,
  Video,
  Brain,
  FileText,
  Clock,
} from "lucide-react";

const PhD = () => {
  const location = useLocation();

  // ========== STYLES ==========
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes floatText {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
      }
      @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes heroFadeIn {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes heroParticleFloat {
        0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
        50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
      }
      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 20px rgba(14, 165, 233, 0.15); }
        50% { box-shadow: 0 0 50px rgba(14, 165, 233, 0.35); }
      }
      @keyframes floatIcon {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-10px) scale(1.03); }
      }
      @keyframes shimmerSlide {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      .animate-float-text { animation: floatText 3s ease-in-out infinite; }
      .animate-gradient { animation: gradientMove 8s ease-in-out infinite; background-size: 200% 200%; }
      .animate-hero-fade { animation: heroFadeIn 1s cubic-bezier(0.23, 1, 0.32, 1) both; }
      .animate-hero-particle { animation: heroParticleFloat 6s ease-in-out infinite; }
      .animate-pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
      .animate-float-icon { animation: floatIcon 4s ease-in-out infinite; }

      .shimmer-bg {
        background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.15), transparent);
        background-size: 200% 100%;
        animation: shimmerSlide 2.5s ease-in-out infinite;
      }

      .glass-effect {
        background: rgba(255,255,255,0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
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
    const state = location.state;
    if (state && state.scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(state.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500);
    }
  }, [location]);

  // ========== COMING SOON SECTIONS ==========
  const comingSoonSections = [
    {
      id: "notes",
      icon: BookOpen,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      border: "border-emerald-200",
      textColor: "text-emerald-600",
      title: "Free Materials",
      subtitle: "Free Notes, Videos & Practice Papers",
      description: "Comprehensive research notes, video lectures and practice papers for PhD scholars.",
    },
    {
      id: "yearwise",
      icon: GraduationCap,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-50 to-purple-50",
      border: "border-violet-200",
      textColor: "text-violet-600",
      title: "Premium PDFs",
      subtitle: "Year-wise Research PDFs",
      description: "Deep-dive research PDFs organised year-wise to support your doctoral journey.",
    },
    {
      id: "videos",
      icon: Video,
      gradient: "from-rose-500 to-pink-600",
      bgGradient: "from-rose-50 to-pink-50",
      border: "border-rose-200",
      textColor: "text-rose-600",
      title: "Premium Videos",
      subtitle: "Research-focused Video Lectures",
      description: "Advanced research methodology and subject-expert video lectures for PhD scholars.",
    },
    {
      id: "papers",
      icon: Brain,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50",
      border: "border-amber-200",
      textColor: "text-amber-600",
      title: "Premium Papers",
      subtitle: "Predictive & Previous Year Papers",
      description: "Predictive papers and previous year question banks curated for PhD research.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-white">
      {/* ========== PREMIUM HERO BANNER ========== */}
      <div className="w-screen bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a3a5c] overflow-hidden relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mt-16 sm:mt-20">
        <div className="relative h-[320px] sm:h-[390px] md:h-[470px] w-full">
          {/* Background Image */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${bannerImg})`,
              backgroundPosition: "center 30%",
              backgroundSize: "cover",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/95 via-[#071426]/45 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/80 via-transparent to-transparent"></div>
          </div>

          {/* Animated Gradient Overlay */}
          <div className="absolute left-0 top-0 h-full w-[55%] bg-gradient-to-r from-[#071426]/90 via-[#0f2847]/45 to-transparent pointer-events-none"></div>

          {/* Animated Floating Particles */}
          <div className="absolute top-16 right-10 w-2 h-2 rounded-full bg-blue-400/40 animate-hero-particle"></div>
          <div className="absolute top-32 right-24 w-3 h-3 rounded-full bg-purple-400/30 animate-hero-particle" style={{ animationDelay: "1s" }}></div>
          <div className="absolute bottom-24 right-16 w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-hero-particle" style={{ animationDelay: "2s" }}></div>
          <div className="absolute top-1/2 right-40 w-2.5 h-2.5 rounded-full bg-sky-400/30 animate-hero-particle" style={{ animationDelay: "3s" }}></div>
          <div className="absolute bottom-32 right-32 w-2 h-2 rounded-full bg-pink-400/30 animate-hero-particle" style={{ animationDelay: "4s" }}></div>

          {/* Content */}
          <div className="relative z-20 flex items-end h-full px-4 sm:px-8 md:px-16 lg:px-24 pb-10 sm:pb-12 md:pb-14 lg:pb-16">
            <div className="max-w-2xl animate-hero-fade">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 mb-4 animate-float-text">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
                <span className="text-xs font-['Inter'] font-semibold text-sky-300 tracking-widest uppercase">
                  PhD Program
                </span>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: "0.5s" }}></span>
              </div>

              {/* Title with Gradient */}
              <h1 className="text-white font-['Space_Grotesk'] font-extrabold leading-[1.1]">
                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl block animate-float-text" style={{ animationDelay: "0.3s" }}>
                  Doctor of
                </span>
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl block bg-gradient-to-r from-sky-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                  Philosophy
                </span>
              </h1>

              {/* Decorative Line */}
              <div className="flex items-center gap-4 mt-4 mb-4">
                <div className="h-1 w-16 bg-gradient-to-r from-sky-400 to-purple-400 rounded-full animate-gradient"></div>
                <div className="h-1 w-8 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full opacity-60 animate-gradient" style={{ animationDelay: "0.5s" }}></div>
                <div className="h-1 w-4 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full opacity-30 animate-gradient" style={{ animationDelay: "1s" }}></div>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm sm:text-base md:text-lg font-['Inter'] font-light leading-relaxed max-w-xl animate-float-text" style={{ animationDelay: "0.6s" }}>
                Complete Research Material, Year-wise PDFs, Research Videos & Predictive Papers for PhD Scholars.
              </p>

              {/* Coming Soon CTA */}
              <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-sky-500/20 to-purple-600/20 backdrop-blur-sm border border-white/20 text-white font-['Inter'] font-semibold text-sm animate-float-text" style={{ animationDelay: "0.9s" }}>
                <Clock size={18} className="text-sky-400 animate-pulse" />
                <span>Launching Soon</span>
                <Rocket size={18} className="text-purple-400" />
              </div>
            </div>
          </div>

          {/* Bottom Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[#f0f7ff] via-[#f0f7ff]/45 to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* ========== COMING SOON SECTIONS (LIGHT MODE) ========== */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-10 sm:py-16">
        {/* Big Coming Soon Header */}
        <div className="text-center mb-12 sm:mb-16 animate-hero-fade">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-100 to-blue-100 mb-4 animate-float-text">
            <Sparkles className="text-sky-600" size={16} />
            <span className="text-xs font-['Inter'] font-bold text-sky-700 tracking-wider uppercase">
              Work in Progress
            </span>
            <Sparkles className="text-sky-600" size={16} />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight">
            Coming{" "}
            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              Soon
            </span>
          </h2>

          <div className="w-24 h-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-purple-500 mx-auto rounded-full mt-4 animate-gradient"></div>

          <p className="text-gray-500 text-base mt-4 font-['Inter'] font-medium max-w-2xl mx-auto">
            We're curating the best research material, PDFs, videos and predictive papers for PhD scholars. Stay tuned!
          </p>
        </div>

        {/* Coming Soon Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {comingSoonSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                id={section.id}
                className={`group relative rounded-3xl p-6 sm:p-7 border-2 ${section.border} bg-gradient-to-br ${section.bgGradient} overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl animate-hero-fade`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 shimmer-bg opacity-50 pointer-events-none"></div>

                {/* Decorative ring */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${section.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-5 shadow-xl animate-float-icon`}>
                    <Icon className="text-white" size={28} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-['Space_Grotesk'] font-extrabold text-gray-800 mb-1">
                    {section.title}
                  </h3>

                  {/* Subtitle */}
                  <p className={`text-xs font-['Inter'] font-bold ${section.textColor} uppercase tracking-wide mb-3`}>
                    {section.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-sm font-['Inter'] text-gray-600 leading-relaxed mb-5">
                    {section.description}
                  </p>

                  {/* Coming Soon Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/60 shadow-md">
                    <Clock size={14} className={`${section.textColor} animate-pulse`} />
                    <span className={`text-xs font-['Inter'] font-bold ${section.textColor}`}>
                      Coming Soon
                    </span>
                    <Sparkles size={12} className={`${section.textColor} animate-pulse`} />
                  </div>
                </div>

                {/* Bottom Accent Bar */}
                <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${section.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left rounded-b-3xl`}></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14 animate-hero-fade" style={{ animationDelay: "0.5s" }}>
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-4 rounded-2xl bg-white border-2 border-sky-100 shadow-lg">
            <div className="flex items-center gap-2">
              <Crown size={20} className="text-amber-500" />
              <span className="text-sm font-['Inter'] font-semibold text-gray-700">
                Want to be notified when it launches?
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-purple-600 text-white text-sm font-['Inter'] font-bold shadow-md">
              <Rocket size={16} />
              <span>Stay Tuned</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhD;