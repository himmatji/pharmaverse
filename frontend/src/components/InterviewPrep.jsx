import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FileText, ArrowRight, Sparkles, CheckCircle } from "lucide-react";

/* AUTH MODAL IMPORT */
import AuthModal from "./AuthModal";

const API_BASE = (
  import.meta.env.VITE_API_URL || "https://api.pharmaverse.co.in"
).replace(/\/$/, "");

const InterviewPrep = () => {
  const navigate = useNavigate();

  /* AUTH MODAL STATE */
  const [showAuthModal, setShowAuthModal] = useState(false);

  /* LIVE INTERVIEW MATERIAL PRICE */
  const [interviewPrice, setInterviewPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchInterviewPrice = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/admin/public-price`,
          { timeout: 12000 }
        );

        // Interview Material is a separate object in CoursePrice.
        // Expected response: response.data.interviewMaterial
        const item = response?.data?.interviewMaterial;

        if (!mounted) return;

        if (
          item &&
          item.isActive !== false &&
          Number.isFinite(Number(item.price)) &&
          Number.isFinite(Number(item.discount))
        ) {
          const price = Math.max(0, Number(item.price));
          const discount = Math.min(100, Math.max(0, Number(item.discount)));
          const calculatedFinal =
            Math.round(price * (1 - discount / 100) * 100) / 100;

          const suppliedFinal = Number(item.finalPrice);
          const finalPrice =
            Number.isFinite(suppliedFinal) && suppliedFinal >= 0
              ? suppliedFinal
              : calculatedFinal;

          setInterviewPrice({
            price,
            discount,
            finalPrice,
            accessType: String(item.accessType || "paid").toLowerCase(),
          });
        } else {
          setInterviewPrice(null);
        }
      } catch (error) {
        console.error("Interview Material price fetch error:", error);
        if (mounted) setInterviewPrice(null);
      } finally {
        if (mounted) setPriceLoading(false);
      }
    };

    fetchInterviewPrice();

    return () => {
      mounted = false;
    };
  }, []);

  const isFree =
    interviewPrice &&
    (interviewPrice.accessType === "free" || interviewPrice.finalPrice <= 0);

  const showDiscount =
    interviewPrice &&
    !isFree &&
    interviewPrice.discount > 0 &&
    interviewPrice.price > interviewPrice.finalPrice;

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);

  /* CHECK LOGIN */
  const isLoggedIn = () => {
    const token =
      localStorage.getItem("userToken") || localStorage.getItem("token");
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    return !!token && loggedIn;
  };

  /* HANDLE BUTTON CLICK */
  const handleOpenPDF = () => {
    if (isLoggedIn()) {
      navigate("/interview-prep");
    } else {
      setShowAuthModal(true);
    }
  };

  /* LOGIN SUCCESS */
  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    window.location.href = "/interview-prep";
  };

  return (
    <>
      {/* AUTH MODAL */}
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

                  {/* LIVE PRICE + DISCOUNT — added without changing existing banner UI */}
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm">
                    {priceLoading ? (
                      <span className="text-gray-500">Loading price...</span>
                    ) : !interviewPrice ? (
                      <span className="text-gray-500">Price currently unavailable</span>
                    ) : isFree ? (
                      <span className="rounded-full bg-emerald-50 px-4 py-2 font-bold text-emerald-700">
                        FREE ACCESS
                      </span>
                    ) : (
                      <>
                        {showDiscount && (
                          <span className="text-gray-500 line-through">
                            {formatPrice(interviewPrice.price)}
                          </span>
                        )}
                        <span className="text-xl font-extrabold text-gray-900">
                          {formatPrice(interviewPrice.finalPrice)}
                        </span>
                        {showDiscount && (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-700">
                            {interviewPrice.discount}% OFF
                          </span>
                        )}
                      </>
                    )}
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
