import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  FlaskConical, 
  Microscope, 
  Syringe, 
  Atom,
  ArrowRight,
  Clock,
  Users
} from "lucide-react";

const quickAccessData = [
  {
    id: "bpharm",
    title: "B.Pharm",
    fullForm: "Bachelor of Pharmacy",
    icon: GraduationCap,
    color: "from-blue-600 to-blue-400",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    duration: "4 Years",
    resources: 85,
    path: "/bpharm",
  },
  {
    id: "dpharm",
    title: "D.Pharm",
    fullForm: "Diploma in Pharmacy",
    icon: FlaskConical,
    color: "from-green-600 to-green-400",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    duration: "2 Years",
    resources: 75,
    path: "/dpharm",
  },
  {
    id: "mpharm",
    title: "M.Pharm",
    fullForm: "Master of Pharmacy",
    icon: Microscope,
    color: "from-purple-600 to-purple-400",
    bgColor: "bg-purple-50",
    textColor: "text-purple-600",
    duration: "2 Years",
    resources: 65,
    path: "/mpharm",
  },
  {
    id: "pharmd",
    title: "Pharm.D",
    fullForm: "Doctor of Pharmacy",
    icon: Syringe,
    color: "from-red-600 to-red-400",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    duration: "6 Years",
    resources: 70,
    path: "/pharmd",
  },
  {
    id: "phd",
    title: "PhD",
    fullForm: "Doctor of Pharmaceutical",
    icon: Atom,
    color: "from-orange-600 to-orange-400",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
    duration: "3-5 Years",
    resources: 90,
    path: "/phd",
  },
];

const QuickAccessSection = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle card click navigation - page top se start hoga
  const handleCardClick = (path) => {
    navigate(path);
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
      });
    }, 0);
  };

  // Handle button click navigation
  const handleButtonClick = (e, path) => {
    e.stopPropagation();
    navigate(path);
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant"
      });
    }, 0);
  };

  return (
    <section ref={sectionRef} className="w-full bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative">
      
      {/* Section Header - Responsive */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-4 mb-3 sm:mb-4">
          Choose Your <span className="bg-gradient-to-r from-[#d4a017] to-amber-600 bg-clip-text text-transparent">Pharmacy Path</span>
        </h2>
        <p className="text-gray-800 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-semibold leading-relaxed px-4">
          Explore courses, study materials, and resources tailored for your pharmacy journey
        </p>
      </div>

      {/* Cards Grid - Responsive */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
          {quickAccessData.map((item, index) => {
            const Icon = item.icon;
            const isCardVisible = isVisible;
            
            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item.path)}
                className={`group relative bg-white rounded-2xl border-2 border-gray-100 
                  hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden
                  flex flex-col ${isCardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                  transitionProperty: "all",
                  transitionDuration: "500ms",
                }}
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Card Content - Responsive Padding */}
                <div className="p-4 sm:p-5 md:p-6 flex flex-col items-center text-center flex-1">
                  {/* Icon Circle - Responsive */}
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${item.bgColor} 
                    flex items-center justify-center mb-3 sm:mb-4 md:mb-5 group-hover:scale-110 transition-transform duration-300
                    shadow-md group-hover:shadow-xl`}>
                    <Icon size={32} className={`sm:w-[38px] sm:h-[38px] md:w-[42px] md:h-[42px] ${item.textColor}`} strokeWidth={1.8} />
                  </div>

                  {/* Title - Responsive */}
                  <h3 className={`text-xl sm:text-2xl font-extrabold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}>
                    {item.title}
                  </h3>
                  
                  {/* Full Form - Responsive */}
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-2 sm:mb-3 px-2">
                    {item.fullForm}
                  </p>

                  {/* Button - Responsive */}
                  <button 
                    onClick={(e) => handleButtonClick(e, item.path)}
                    className="mt-2 sm:mt-3 w-full py-2 sm:py-2.5 bg-gray-50 group-hover:bg-gradient-to-r 
                    group-hover:from-[#d4a017] group-hover:to-amber-600 rounded-xl 
                    font-semibold text-xs sm:text-sm text-gray-600 group-hover:text-white 
                    transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2"
                  >
                    Explore Program
                    <ArrowRight size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Bottom Border Animation */}
                <div className={`h-1 bg-gradient-to-r ${item.color} transform transition-transform duration-300 ${
                  hoveredCard === item.id ? "scale-x-100" : "scale-x-0"
                }`} />
              </div>
            );
          })}
        </div>

        
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .grid {
            gap: 1rem;
          }
        }
      `}</style>
    </section>
  );
};

export default QuickAccessSection;