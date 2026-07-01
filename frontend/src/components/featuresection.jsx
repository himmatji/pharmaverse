import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import videoFile from "../assets/teacher-video.mp4";
import {
  ScrollText,
  Clapperboard,
  FileSpreadsheet,
  BellRing,
  Sparkles,
  ArrowRight,
  Star,
  Users,
  Award,
  Gem,
  TrendingUp,
  BookOpen,
  Video,
  FileText,
  Newspaper,
  ChevronRight,
  Zap,
  Shield,
  Clock,
} from "lucide-react";

const FeatureSection = () => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleNavigate = function(path, state) {
    navigate(path, { state });
  };

  // Featured Data - UPDATED
  const featuredData = [
    {
      icon: ScrollText,
      title: "Latest Notes",
      desc: "Get beautifully organized handwritten notes for every pharmacy subject.",
      navigateTo: "/bpharm",
      scrollTo: "notes",
      badge: "NEW",
      emoji: "📚",
      stat: "50+ Notes",
      color: "from-amber-400 to-orange-500",
      lightBg: "bg-amber-50",
      borderLight: "border-amber-200",
      textColor: "text-amber-600",
    },
    {
      icon: Clapperboard,
      title: "Trending Practical Videos",
      desc: "Watch high-quality practical demonstrations and visual learning content.",
      navigateTo: "/bpharm",
      scrollTo: "videos",
      badge: "HOT",
      emoji: "🎬",
      stat: "100+ Videos",
      color: "from-purple-400 to-pink-500",
      lightBg: "bg-purple-50",
      borderLight: "border-purple-200",
      textColor: "text-purple-600",
    },
    {
      icon: FileSpreadsheet,
      title: "Predictive Exam Question Paper",
      desc: "Prepare smarter with important exam-focused question papers and predictive questions.",
      navigateTo: "/bpharm",
      scrollTo: "papers",
      badge: "POPULAR",
      emoji: "📝",
      stat: "200+ Papers",
      color: "from-emerald-400 to-teal-500",
      lightBg: "bg-emerald-50",
      borderLight: "border-emerald-200",
      textColor: "text-emerald-600",
    },
    {
      icon: BellRing,
      title: "Exam Crash Course",
      desc: "Quick revision and crash course materials for exam preparation.",
      navigateTo: "/bpharm",
      scrollTo: "notes",
      badge: "UPDATES",
      emoji: "⚡",
      stat: "Daily Updates",
      color: "from-cyan-400 to-blue-500",
      lightBg: "bg-cyan-50",
      borderLight: "border-cyan-200",
      textColor: "text-cyan-600",
    },
  ];

  // Badge colors
  const badgeColors = {
    "NEW": "bg-gradient-to-r from-amber-400 to-orange-500",
    "HOT": "bg-gradient-to-r from-purple-400 to-pink-500",
    "POPULAR": "bg-gradient-to-r from-emerald-400 to-teal-500",
    "UPDATES": "bg-gradient-to-r from-cyan-400 to-blue-500",
  };

  // Create particles
  const particles = [];
  for (let i = 0; i < 15; i++) {
    particles.push({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 5,
    });
  }

  return (
    <section className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/50 py-20 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Premium Light Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl"></div>
        
        {/* Premium Dot Pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>
        
        {/* Floating Particles - Light */}
        {particles.map(function(particle) {
          return (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full opacity-20"
              style={{
                left: particle.left + '%',
                top: particle.top + '%',
                animationDelay: particle.delay + 's',
                animationDuration: particle.duration + 's',
                animationName: 'floatLight',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
              }}
            />
          );
        })}
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        
        {/* Premium Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-100/80 to-orange-100/80 backdrop-blur-sm px-6 py-2.5 rounded-full border border-amber-200/50 shadow-lg shadow-amber-100/50 mb-6">
            <Gem className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-600 uppercase tracking-[0.2em]">
              Premium Pharmacy Resources
            </span>
            <Gem className="w-4 h-4 text-amber-500" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 bg-clip-text text-transparent">
              Everything You
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent inline-flex items-center gap-3">
              Need to Succeed
              <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
            </span>
          </h2>
          
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mt-6 rounded-full"></div>
          
          <p className="text-slate-600 mt-6 text-base sm:text-lg md:text-xl font-light max-w-3xl mx-auto px-4 leading-relaxed">
            Access premium study materials, video lectures, exam papers, and stay updated with the latest pharmacy news — all in one place.
          </p>
          
          {/* Premium Stats - FULL WIDTH */}
          <div className="w-full mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
              <div className="flex items-center justify-center gap-3 bg-white shadow-lg shadow-slate-200/50 px-3 py-3 rounded-full border border-slate-100 hover:shadow-xl hover:shadow-slate-200/70 transition-all duration-300 hover:-translate-y-0.5 w-full">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">10K+ Students</span>
              </div>
              
              <div className="flex items-center justify-center gap-3 bg-white shadow-lg shadow-slate-200/50 px-3 py-3 rounded-full border border-slate-100 hover:shadow-xl hover:shadow-slate-200/70 transition-all duration-300 hover:-translate-y-0.5 w-full">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                </div>
                <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">4.9 Rating</span>
              </div>
              
              <div className="flex items-center justify-center gap-3 bg-white shadow-lg shadow-slate-200/50 px-3 py-3 rounded-full border border-slate-100 hover:shadow-xl hover:shadow-slate-200/70 transition-all duration-300 hover:-translate-y-0.5 w-full">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">Premium Content</span>
              </div>
              
              <div className="flex items-center justify-center gap-3 bg-white shadow-lg shadow-slate-200/50 px-3 py-3 rounded-full border border-slate-100 hover:shadow-xl hover:shadow-slate-200/70 transition-all duration-300 hover:-translate-y-0.5 w-full">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">Verified Resources</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left - Premium Cards */}
          <div className="space-y-5">
            {featuredData.map(function(item, index) {
              const Icon = item.icon;
              const badgeColor = badgeColors[item.badge] || "bg-gradient-to-r from-amber-400 to-orange-500";
              
              return (
                <div
                  key={index}
                  className="group relative cursor-pointer"
                  onMouseEnter={function() { setHoveredIndex(index); }}
                  onMouseLeave={function() { setHoveredIndex(null); }}
                  onClick={function() { handleNavigate(item.navigateTo, { scrollTo: item.scrollTo }); }}
                >
                  {/* Premium Card Glow */}
                  <div className={"absolute -inset-1 bg-gradient-to-r " + item.color + " rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl"}></div>
                  
                  {/* Card */}
                  <div className={"relative bg-white rounded-2xl p-6 border " + item.borderLight + " shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-1"}>
                    
                    <div className="flex items-start gap-5">
                      {/* Premium Icon */}
                      <div className="relative flex-shrink-0">
                        <div className={"w-16 h-16 rounded-2xl bg-gradient-to-br " + item.color + " flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-5deg] group-hover:shadow-xl"}>
                          <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                        </div>
                        <div className={"absolute -inset-2 rounded-2xl bg-gradient-to-r " + item.color + " opacity-0 blur-lg group-hover:opacity-20 transition-opacity duration-500"}></div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-bold text-slate-800 group-hover:text-amber-600 transition-colors duration-300">
                            {item.title}
                          </h3>
                          <span className={"text-[10px] font-bold px-3 py-1 rounded-full " + badgeColor + " text-white shadow-md"}>
                            {item.badge}
                          </span>
                        </div>
                        
                        <p className="text-slate-600 text-sm leading-relaxed mt-1.5">
                          {item.desc}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                          <span className="text-xs text-slate-500 flex items-center gap-1.5">
                            <span className="text-lg">{item.emoji}</span>
                            <span className="font-medium">{item.stat}</span>
                          </span>
                          <span className="text-amber-500 text-sm font-semibold flex items-center gap-1 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            Explore
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Premium Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 rounded-b-2xl"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right - Premium Video */}
          <div className="flex flex-col gap-6">
            
            {/* Premium Video Card - No Play Button */}
            <div className="relative group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 via-purple-400/20 to-amber-400/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className="relative">
                <video
                  src={videoFile}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-video object-cover"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/5 to-transparent"></div>
                
                {/* Video Info */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-slate-700 shadow-lg">
                      <Users className="w-3 h-3" />
                      10K+ views
                    </span>
                    <span className="flex items-center gap-1.5 text-xs bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-slate-700 shadow-lg">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      4.9
                    </span>
                  </div>
                  
                </div>

                {/* Premium Video Badge */}
                <div className="absolute top-4 left-4 text-xs bg-gradient-to-r from-amber-400 to-orange-500 backdrop-blur-sm px-3 py-1 rounded-full text-white font-semibold shadow-lg">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Premium
                </div>
              </div>
            </div>

            {/* Premium Quick Actions - Updated */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={function() { handleNavigate('/bpharm', { scrollTo: 'notes' }); }}
                className="group relative overflow-hidden bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <BookOpen className="w-4 h-4" />
                <span>Explore Notes</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={function() { handleNavigate('/bpharm', { scrollTo: 'videos' }); }}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Video className="w-4 h-4" />
                <span>Watch Videos</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={function() { handleNavigate('/bpharm', { scrollTo: 'papers' }); }}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <FileText className="w-4 h-4" />
                <span>Predictive Papers</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={function() { handleNavigate('/bpharm', { scrollTo: 'notes' }); }}
                className="group relative overflow-hidden bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-2xl hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Zap className="w-4 h-4" />
                <span>Crash Course</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Premium Trust Badge */}
            <div className="flex items-center justify-center gap-6 bg-white shadow-lg shadow-slate-200/50 rounded-xl px-6 py-3 border border-slate-100">
              <span className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-medium">Trusted by 10,000+ Students</span>
              </span>
              <span className="w-px h-6 bg-slate-200"></span>
              <span className="flex items-center gap-1 text-xs text-slate-600">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="font-medium">98% Satisfaction</span>
              </span>
              <span className="w-px h-6 bg-slate-200"></span>
              <span className="flex items-center gap-1 text-xs text-slate-600">
                <Zap className="w-3 h-3 text-amber-500" />
                <span className="font-medium">Free Access</span>
              </span>
            </div>

          </div>
        </div>

        {/* Premium Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-block bg-gradient-to-r from-amber-100/50 to-orange-100/50 backdrop-blur-sm px-8 py-4 rounded-2xl border border-amber-200/50 shadow-lg shadow-amber-100/30">
            <p className="text-slate-700 text-sm font-medium">
              🚀 Join thousands of pharmacy students achieving their dreams
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;