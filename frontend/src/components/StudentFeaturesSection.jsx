import React from "react";
import { useNavigate } from "react-router-dom";
import doctorImage from "../assets/doctor.jpeg";

const DarkBanner = () => {
  const navigate = useNavigate();

  // Navigation handlers for icons
  const handleIconClick = (type) => {
    switch(type) {
      case 'notes':
        navigate('/bpharm', { state: { scrollTo: 'notes' } });
        break;
      case 'videos':
        navigate('/bpharm', { state: { scrollTo: 'videos' } });
        break;
      case 'papers':
        navigate('/bpharm', { state: { scrollTo: 'papers' } });
        break;
      case 'doubts':
        navigate('/bpharm', { state: { scrollTo: 'notes' } });
        break;
      default:
        navigate('/bpharm');
    }
  };

  return (
    <>
      {/* BANNER SECTION - Responsive height */}
      <div className="relative w-full h-[600px] sm:h-[700px] md:h-screen overflow-hidden bg-black">
        
        {/* MAIN BLACK BACKGROUND */}
        <div className="absolute inset-0 bg-[#050505]"></div>

        {/* DARK STRIPES - Hidden on mobile */}
        <div className="absolute inset-0 overflow-hidden hidden md:block">
          <div className="absolute left-[42%] top-0 w-[120px] h-full bg-white/[0.03] skew-x-[-18deg]"></div>
          <div className="absolute left-[58%] top-0 w-[90px] h-full bg-white/[0.03] skew-x-[-18deg]"></div>
          <div className="absolute right-[8%] top-0 w-[100px] h-full bg-white/[0.03] skew-x-[-18deg]"></div>
        </div>

        {/* LEFT IMAGE SECTION - Hidden on mobile */}
        <div className="absolute left-0 top-0 w-[48%] h-full overflow-hidden hidden lg:block">
          <div className="relative w-full h-full">
            <img
              src={doctorImage}
              alt="doctor banner"
              className="w-full h-full object-cover"
              style={{
                transform: 'translateX(-10%)',
                objectPosition: 'left',
              }}
            />
          </div>

          <div className="absolute inset-0 bg-black/45"></div>
          <div className="absolute -left-40 top-0 w-[280px] h-full bg-gradient-to-b from-[#ff7a00] to-[#5b2200] rotate-[12deg] opacity-90"></div>
          <div className="absolute left-[30px] top-[130px] w-[5px] h-[250px] bg-orange-200/60 rotate-[18deg]"></div>
          <div className="absolute right-[-80px] top-0 w-[180px] h-full bg-gradient-to-b from-[#ff8a1d] to-[#5b2200] skew-x-[-18deg] opacity-90"></div>
          <div className="absolute right-[30px] top-[120px] w-[130px] h-[220px] bg-orange-400/40 skew-x-[-18deg]"></div>
          <div className="absolute right-[75px] top-[120px] w-[4px] h-[180px] bg-white/60 rotate-[18deg]"></div>
        </div>

        {/* RIGHT CONTENT - Full width on mobile */}
        <div className="absolute right-0 top-0 w-full lg:w-[52%] h-full flex items-center">
          <div className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-16 w-full">
            
            {/* Animated PREMIUM - Responsive text */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[92px] leading-[1.1] sm:leading-[1.2] lg:leading-[1] font-black uppercase"
              style={{
                background: "linear-gradient(to bottom, #ffd36b, #ff9f1c, #c56a00)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Arial Black', 'Poppins', sans-serif",
                animation: "slideUp 0.8s ease-out forwards",
                opacity: 0,
              }}
            >
              Premium
            </h1>

            {/* Animated STUDY MATERIALS - Responsive text */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[92px] leading-[1.1] sm:leading-[1.2] lg:leading-[1] font-black uppercase mt-1 sm:mt-2"
              style={{
                background: "linear-gradient(to bottom, #ffe29a, #ffb347, #d97706)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "'Arial Black', 'Poppins', sans-serif",
                animation: "slideUp 0.8s ease-out 0.3s forwards",
                opacity: 0,
              }}
            >
              Study Materials
            </h1>

            {/* Animated paragraph - Responsive */}
            <p
              className="mt-4 sm:mt-6 md:mt-8 text-[#f8d27a] text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl leading-relaxed sm:leading-8 md:leading-10 max-w-[650px] font-light"
              style={{
                animation: "fadeSlideUp 0.8s ease-out 0.6s forwards",
                opacity: 0,
              }}
            >
              specially designed for pharmacy students.
            </p>

            {/* 4 ICONS SECTION - Responsive grid, CLICKABLE */}
            <div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-10 md:mt-12 lg:mt-16 w-full"
              style={{
                animation: "fadeSlideUp 0.8s ease-out 0.9s forwards",
                opacity: 0,
              }}
            >
              {/* Icon 1 - Study Notes */}
              <div 
                onClick={() => handleIconClick('notes')}
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-700/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/30">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-orange-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-orange-300 text-[10px] sm:text-xs md:text-sm mt-2 sm:mt-3 font-medium text-center">Study Notes</span>
                <span className="text-gray-400 text-[8px] sm:text-xs hidden sm:block">Premium Content</span>
              </div>

              {/* Icon 2 - Video Lectures */}
              <div 
                onClick={() => handleIconClick('videos')}
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-700/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/30">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-orange-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-orange-300 text-[10px] sm:text-xs md:text-sm mt-2 sm:mt-3 font-medium text-center">Video Lectures</span>
                <span className="text-gray-400 text-[8px] sm:text-xs hidden sm:block">HD Quality</span>
              </div>

              {/* Icon 3 - Practice Tests */}
              <div 
                onClick={() => handleIconClick('papers')}
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-700/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/30">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-orange-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-orange-300 text-[10px] sm:text-xs md:text-sm mt-2 sm:mt-3 font-medium text-center">Practice Tests</span>
                <span className="text-gray-400 text-[8px] sm:text-xs hidden sm:block">With Solutions</span>
              </div>

              {/* Icon 4 - Doubt Solving */}
              <div 
                onClick={() => handleIconClick('doubts')}
                className="flex flex-col items-center p-2 sm:p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-700/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/30">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-orange-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-orange-300 text-[10px] sm:text-xs md:text-sm mt-2 sm:mt-3 font-medium text-center">Doubt Solving</span>
                <span className="text-gray-400 text-[8px] sm:text-xs hidden sm:block">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Animation keyframes */}
        <style>{`
          @keyframes slideUp {
            0% { opacity: 0; transform: translateY(50px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeSlideUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </>
  );
};

export default DarkBanner;