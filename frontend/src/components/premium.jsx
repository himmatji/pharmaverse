import React from "react";

const Premium = () => {
  // Card data
  const cards = [
    {
      id: 1,
      title: "Pharmacy Notes",
      description: "Complete study material for B.Pharm & D.Pharm students",
      icon: (
        <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: "from-orange-500/20 to-orange-700/20",
      link: "#"
    },
    {
      id: 2,
      title: "Video Lectures",
      description: "HD quality lectures by expert faculty",
      icon: (
        <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-red-500/20 to-red-700/20",
      link: "#"
    },
    {
      id: 3,
      title: "Practice Papers",
      description: "Previous year papers with solutions",
      icon: (
        <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "from-blue-500/20 to-blue-700/20",
      link: "#"
    },
    {
      id: 4,
      title: "Doubt Session",
      description: "24/7 doubt solving support",
      icon: (
        <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-green-500/20 to-green-700/20",
      link: "#"
    },
    {
      id: 5,
      title: "Crash Course",
      description: "Quick revision for exams",
      icon: (
        <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "from-purple-500/20 to-purple-700/20",
      link: "#"
    },
    {
      id: 6,
      title: "E-Books",
      description: "Digital books for all subjects",
      icon: (
        <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "from-yellow-500/20 to-yellow-700/20",
      link: "#"
    }
  ];

  return (
    <div className="bg-gradient-to-b from-black to-[#0a0a0a] py-16 md:py-24 min-h-screen">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Explore Our
            </span>
          </h2>
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Premium Features
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-700 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 transition-all duration-500 hover:scale-105 cursor-pointer"
              style={{
                animation: `fadeSlideUp 0.6s ease-out ${index * 0.1}s forwards`,
                opacity: 0,
              }}
            >
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Card Content */}
              <div className="relative z-10">
                {/* Icon Circle */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors duration-300">
                  {card.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-4">
                  {card.description}
                </p>
                
                {/* Learn More Link */}
                <a
                  href={card.link}
                  className="inline-flex items-center text-orange-400 hover:text-orange-300 transition-colors duration-300 group/link"
                >
                  <span className="text-sm font-medium">Learn More</span>
                  <svg className="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 md:mt-16">
          <button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-semibold rounded-full hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/30">
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