import React from "react";
import { useNavigate } from "react-router-dom";

const Premium = () => {
  const navigate = useNavigate();

  // Card data with navigation paths
  const cards = [
    {
      id: 1,
      title: "Pharmacy Notes",
      description: "Complete study material for B.Pharm & D.Pharm students",
      icon: (
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: "from-orange-500/20 to-orange-700/20",
      path: "/bpharm",
      sectionId: "notes"
    },
    {
      id: 2,
      title: "Video Lectures",
      description: "HD quality lectures by expert faculty",
      icon: (
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-red-500/20 to-red-700/20",
      path: "/bpharm",
      sectionId: "videos"
    },
    {
      id: 3,
      title: "Practice Papers",
      description: "Previous year papers with solutions",
      icon: (
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "from-blue-500/20 to-blue-700/20",
      path: "/bpharm",
      sectionId: "papers"
    },
    {
      id: 4,
      title: "Doubt Session",
      description: "24/7 doubt solving support",
      icon: (
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-green-500/20 to-green-700/20",
      path: "/bpharm",
      sectionId: "notes"
    },
    {
      id: 5,
      title: "Crash Course",
      description: "Quick revision for exams",
      icon: (
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "from-purple-500/20 to-purple-700/20",
      path: "/bpharm",
      sectionId: "videos"
    },
    {
      id: 6,
      title: "E-Books",
      description: "Digital books for all subjects",
      icon: (
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "from-yellow-500/20 to-yellow-700/20",
      path: "/bpharm",
      sectionId: "semester"
    }
  ];

  const handleCardClick = (card) => {
    if (card.path) {
      navigate(card.path, { state: { scrollTo: card.sectionId } });
    }
  };

  const handleViewAll = () => {
    navigate("/bpharm", { state: { scrollTo: "notes" } });
  };

  return (
    // Laptop: Dark background, Phone: Light background
    <div className="bg-gradient-to-b from-black to-[#0a0a0a] sm:from-gray-50 sm:to-white py-12 sm:py-16 md:py-24 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Section Header - Responsive */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white sm:text-gray-800 mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Explore Our
            </span>
          </h2>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white sm:text-gray-800">
            Premium Features
          </h2>
          <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-700 mx-auto mt-4 sm:mt-6 rounded-full"></div>
          <p className="text-gray-400 sm:text-gray-600 mt-3 sm:mt-4 text-sm sm:text-base">
            Everything you need to excel in your pharmacy exams
          </p>
        </div>

        {/* Cards Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {cards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="group relative bg-white/5 sm:bg-white backdrop-blur-sm sm:backdrop-blur-none rounded-2xl p-5 sm:p-6 md:p-8 transition-all duration-500 hover:scale-105 cursor-pointer shadow-lg hover:shadow-2xl border border-white/10 sm:border-gray-100"
              style={{
                animation: `fadeSlideUp 0.6s ease-out ${index * 0.1}s forwards`,
                opacity: 0,
              }}
            >
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Card Content */}
              <div className="relative z-10">
                {/* Icon Circle - Responsive */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                  {card.icon}
                </div>
                
                {/* Title - Responsive */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white sm:text-gray-800 mb-1 sm:mb-2 group-hover:text-orange-400 transition-colors duration-300">
                  {card.title}
                </h3>
                
                {/* Description - Responsive */}
                <p className="text-gray-400 sm:text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed mb-3 sm:mb-4">
                  {card.description}
                </p>
                
                {/* Learn More Link */}
                <div className="inline-flex items-center text-orange-400 hover:text-orange-300 transition-colors duration-300 group/link">
                  <span className="text-xs sm:text-sm font-medium">Learn More</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button - Responsive */}
        <div className="text-center mt-10 sm:mt-12 md:mt-16">
          <button 
            onClick={handleViewAll}
            className="px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-semibold rounded-full hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30 text-sm sm:text-base md:text-lg"
          >
            View All Materials →
          </button>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeSlideUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Premium;