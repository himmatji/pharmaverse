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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle card click navigation - page top se start hoga
  const handleCardClick = (path) => {
    // Pehle navigate karo
    navigate(path);
    // Fir page ko top par scroll karo
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant" // "smooth" bhi use kar sakte ho agar animation chahiye
      });
    }, 0);
  };

  // Handle button click navigation
  const handleButtonClick = (e, path) => {
    e.stopPropagation(); // Prevent event bubbling to card
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
    <section ref={sectionRef} className="w-full bg-gradient-to-b from-gray-50 to-white py-20 px-6 relative">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-4">
          Choose Your <span className="bg-gradient-to-r from-[#d4a017] to-amber-600 bg-clip-text text-transparent">Pharmacy Path</span>
        </h2>
        <p className="text-gray-800 text-lg max-w-2xl mx-auto font-['Poppins'] font-semibold leading-relaxed">
          Explore courses, study materials, and resources tailored for your pharmacy journey
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {quickAccessData.map((item, index) => {
            const Icon = item.icon;
            const isCardVisible = isVisible;
            
            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item.path)}
                className={`group relative bg-white rounded-2xl border-2 border-gray-100 
                  hover:border-${item.color.split("-")[1]}-300 shadow-lg hover:shadow-2xl 
                  transition-all duration-300 cursor-pointer overflow-hidden
                  flex flex-col ${isCardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{
                  transitionDelay: `${index * 100}ms`,
                  transitionProperty: "all",
                  transitionDuration: "500ms",
                }}
                onMouseEnter={() => setHoveredCard(item.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Card Content */}
                <div className="p-6 flex flex-col items-center text-center flex-1">
                  {/* Icon Circle */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.bgColor} 
                    flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300
                    shadow-md group-hover:shadow-xl`}>
                    <Icon size={42} className={item.textColor} strokeWidth={1.8} />
                  </div>

                  {/* Title */}
                  <h3 className={`text-2xl font-extrabold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}>
                    {item.title}
                  </h3>
                  
                  {/* Full Form */}
                  <p className="text-xs text-gray-500 font-medium mb-3">
                    {item.fullForm}
                  </p>

                 

                  {/* Button */}
                  <button 
                    onClick={(e) => handleButtonClick(e, item.path)}
                    className="mt-3 w-full py-2.5 bg-gray-50 group-hover:bg-gradient-to-r 
                    group-hover:from-[#d4a017] group-hover:to-amber-600 rounded-xl 
                    font-semibold text-sm text-gray-600 group-hover:text-white 
                    transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Explore Program
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
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

        {/* View All Button */}
        <div className="text-center mt-12">
          <button 
            onClick={() => {
              navigate("/courses");
              setTimeout(() => {
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
              }, 0);
            }}
            className="group bg-gradient-to-r from-[#d4a017] to-amber-600 text-white px-8 py-3 rounded-full 
            font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105
            flex items-center gap-2 mx-auto"
          >
            View All Programs
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default QuickAccessSection;