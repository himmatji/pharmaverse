import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowRight, Sparkles, CheckCircle } from "lucide-react";

/* ✅ AUTH MODAL IMPORT */
import AuthModal from "./AuthModal";

const InterviewPrep = () => {
  const navigate = useNavigate();

  /* ✅ AUTH MODAL STATE */
  const [showAuthModal, setShowAuthModal] = useState(false);

  /* ✅ CHECK LOGIN */
  const isLoggedIn = () => {
    const token =
      localStorage.getItem("userToken") || localStorage.getItem("token");
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    return !!token && loggedIn;
  };

  /* ✅ HANDLE BUTTON CLICK */
  const handleOpenPDF = () => {
    if (isLoggedIn()) {
      // Login hai → seedha navigate
      navigate("/interview-prep");
    } else {
      // Login nahi hai → pehle AuthModal kholo
      setShowAuthModal(true);
    }
  };

  /* ✅ LOGIN SUCCESS → MODAL BAND → NAVIGATE */
  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    // Poori website update + login state refresh
    window.location.href = "/interview-prep";
  };

  return (
    <>
      {/* ✅ AUTH MODAL */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <section className="w-full bg-gradient-to-b from-white via-sky-50/40 to-white py-14 sm:py-20">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* ========== PREMIUM LIGHT BANNER ========== */}
            <div className="relative w-full rounded-3xl overflow-hidden bg-white border border-sky-100 shadow-[0_20px_60px_-20px_rgba(14,165,233,0.25)]">
              
              {/* Top gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500"></div>

              {/* Soft decorative blobs */}
              <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-100/60 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-100/60 blur-3xl pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-50/50 blur-3xl pointer-events-none"></div>

              {/* Floating dots */}
              <div className="absolute top-10 right-16 w-2 h-2 rounded-full bg-sky-400/50 animate-pulse pointer-events-none"></div>
              <div className="absolute bottom-14 right-28 w-2.5 h-2.5 rounded-full bg-purple-400/40 animate-pulse pointer-events-none" style={{ animationDelay: "1s" }}></div>
              <div className="absolute top-1/2 right-40 w-1.5 h-1.5 rounded-full bg-cyan-400/50 animate-pulse pointer-events-none" style={{ animationDelay: "2s" }}></div>
              <div className="absolute bottom-20 left-16 w-2 h-2 rounded-full bg-purple-300/50 animate-pulse pointer-events-none" style={{ animationDelay: "1.5s" }}></div>

              {/* Content */}
              <div className="relative z-10 px-6 sm:px-10 md:px-16 lg:px-20 py-12 sm:py-16 md:py-20">
                <div className="max-w-4xl mx-auto text-center">
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-50 to-purple-50 border border-sky-200 shadow-sm mb-6">
                    <Sparkles className="text-sky-500" size={14} />
                    <span className="text-xs font-['Inter'] font-bold text-sky-600 tracking-widest uppercase">
                      Interview Preparation
                    </span>
                    <Sparkles className="text-purple-500" size={14} />
                  </div>

                  {/* Title */}
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-[1.1] mb-5">
                    Prepare for Your{" "}
                    <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Job Interview
                    </span>
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 text-base sm:text-lg md:text-xl font-['Inter'] leading-relaxed mb-8 max-w-2xl mx-auto">
                    Complete interview preparation guide — questions, answers & tips all in one PDF. Built for pharmacy students.
                  </p>

                  {/* CTA Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={handleOpenPDF}
                      className="group inline-flex items-center gap-3 px-8 sm:px-10 py-4 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-purple-600 text-white font-['Inter'] font-bold text-base shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                    >
                      <FileText size={20} />
                      <span>Open Interview PDF</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>

                </div>
              </div>

              {/* Bottom gradient accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-sky-400"></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default InterviewPrep;