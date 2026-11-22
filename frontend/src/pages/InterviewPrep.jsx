import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  FileText,
  Download,
  Eye,
  Sparkles,
  Loader2,
  Search,
  BookOpen,
  Lock,
  Unlock,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL || "https://api.pharmaverse.co.in";

/* =========================
   INTERVIEW BANNER IMAGE
========================= */

const interviewBanner =
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1800&q=85";

/* =========================
   INTERVIEW PREP PAGE
========================= */

const InterviewPrep = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [buying, setBuying] = useState(false);

  const INTERVIEW_PRODUCT_TYPE = "interview-material";
  const INTERVIEW_PRODUCT_ID = "all-interview-material";

  const getUserToken = () => {
    const keys = ["token", "userToken", "authToken", "accessToken"];
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) return value;
    }
    return "";
  };

  const getAuthHeaders = () => {
    const token = getUserToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const checkInterviewAccess = async () => {
    const token = getUserToken();
    if (!token) {
      setHasAccess(false);
      setAccessLoading(false);
      return false;
    }

    try {
      const res = await axios.get(
        `${API_BASE}/api/payment/check-access/${INTERVIEW_PRODUCT_TYPE}/${INTERVIEW_PRODUCT_ID}`,
        { headers: getAuthHeaders(), timeout: 12000 }
      );
      const allowed = Boolean(res?.data?.hasAccess);
      setHasAccess(allowed);
      return allowed;
    } catch (err) {
      console.error("Interview material access check error:", err);
      setHasAccess(false);
      return false;
    } finally {
      setAccessLoading(false);
    }
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const existing = document.querySelector('script[data-razorpay="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(true), { once: true });
        existing.addEventListener("error", () => resolve(false), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.dataset.razorpay = "true";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleBuyInterviewMaterial = async () => {
    if (!getUserToken()) {
      toast.error("Interview Material kharidne ke liye pehle login karo.");
      return;
    }

    setBuying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error("Payment gateway load nahi ho paaya. Dobara try karo.");
      }

      const orderRes = await axios.post(
        `${API_BASE}/api/payment/create-order`,
        {
          productType: INTERVIEW_PRODUCT_TYPE,
          productId: INTERVIEW_PRODUCT_ID,
          productTitle: "Complete Interview Material Access",
        },
        { headers: getAuthHeaders(), timeout: 20000 }
      );

      const order = orderRes?.data;
      if (!order?.orderId || !order?.key) {
        throw new Error(order?.message || "Payment order create nahi hua.");
      }

      const options = {
        key: order.key,
        amount: Math.round(Number(order.amount) * 100),
        currency: order.currency || "INR",
        name: "PharmaVerse",
        description: "All Interview Material PDFs - Lifetime Access",
        order_id: order.orderId,
        prefill: {},
        theme: { color: "#0ea5e9" },
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${API_BASE}/api/payment/verify-payment`,
              {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                productType: INTERVIEW_PRODUCT_TYPE,
                productId: INTERVIEW_PRODUCT_ID,
              },
              { headers: getAuthHeaders(), timeout: 20000 }
            );

            if (verifyRes?.data?.success) {
              setHasAccess(true);
              toast.success("Payment successful! All Interview Material unlocked.");
            } else {
              toast.error(verifyRes?.data?.message || "Payment verification pending.");
            }
          } catch (verifyError) {
            console.error("Interview material payment verification error:", verifyError);
            toast.error(
              verifyError?.response?.data?.message ||
              "Payment received, lekin verification pending hai. Please retry after login."
            );
          } finally {
            setBuying(false);
          }
        },
        modal: {
          ondismiss: () => setBuying(false),
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", (response) => {
        toast.error(response?.error?.description || "Payment failed. Please try again.");
        setBuying(false);
      });
      checkout.open();
    } catch (err) {
      console.error("Interview material purchase error:", err);
      toast.error(err?.response?.data?.message || err.message || "Payment start nahi ho paaya.");
      setBuying(false);
    }
  };

  const fetchProtectedFile = async (item, mode) => {
    if (!item?._id) {
      toast.error("Invalid document");
      return;
    }
    if (!getUserToken()) {
      toast.error("PDF access ke liye pehle login karo.");
      return;
    }

    const previewWindow = mode === "preview"
      ? window.open("about:blank", "_blank")
      : null;
    if (mode === "preview" && !previewWindow) {
      toast.error("Please allow popups to preview the PDF");
      return;
    }

    setLoadingItemId(item._id);
    try {
      const endpoint = mode === "preview" ? "preview" : "download";
      const response = await axios.get(
        `${API_BASE}/api/admin/public/${endpoint}/interview-pdf/${item._id}`,
        {
          headers: getAuthHeaders(),
          responseType: "blob",
          timeout: 60000,
        }
      );
      const contentType = response.headers?.["content-type"] || "application/pdf";
      const blob = new Blob([response.data], { type: contentType });
      const objectUrl = URL.createObjectURL(blob);

      if (mode === "preview") {
        previewWindow.location.href = objectUrl;
        previewWindow.opener = null;
        toast.success("PDF opened");
      } else {
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = item.fileName || `${item.title || "interview-material"}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Download started!");
      }
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (err) {
      if (previewWindow && !previewWindow.closed) previewWindow.close();
      console.error(`Interview material ${mode} error:`, err);
      const status = err?.response?.status;
      if (status === 401) {
        toast.error("Session expire ho gaya. Dobara login karo.");
      } else if (status === 403) {
        toast.error("Pehle Interview Material ka payment complete karo.");
      } else {
        toast.error(err?.response?.data?.message || "File open nahi ho paayi.");
      }
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleView = (item) => fetchProtectedFile(item, "preview");
  const handleDownload = (item) => fetchProtectedFile(item, "download");

  /* =========================
     FETCH INTERVIEW PDFs
  ========================= */

  useEffect(() => {
    const fetchPdfs = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await axios.get(
          `${API_BASE}/api/admin/public/interview-pdfs`,
          {
            timeout: 12000,
          }
        );

        const data = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data?.pdfs)
          ? res.data.pdfs
          : [];

        setPdfs(data);
      } catch (err) {
        console.error("Interview PDFs fetch error:", err);

        setError(
          err?.response?.data?.message ||
            "PDFs load nahi ho paayi. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPdfs();
    checkInterviewAccess();
  }, []);

  /* =========================
     FILTER PDFs
  ========================= */

  const filteredPdfs = pdfs.filter((pdf) => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return true;

    return (
      String(pdf.title || "")
        .toLowerCase()
        .includes(q) ||
      String(pdf.subtitle || pdf.description || "")
        .toLowerCase()
        .includes(q)
    );
  });

  /* =========================
     PAGE
  ========================= */

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-sky-50/40 to-white">
      <div className={`min-h-screen ${
        !accessLoading && !hasAccess ? "blur-[5px] pointer-events-none select-none" : ""
      }`}>

      {/* =========================
          TOASTER
      ========================= */}

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,

          style: {
            background: "#363636",
            color: "#fff",
          },

          success: {
            duration: 3000,

            style: {
              background: "#10b981",
              color: "#fff",
            },
          },

          error: {
            duration: 4000,

            style: {
              background: "#ef4444",
              color: "#fff",
            },
          },
        }}
      />

      {/* =========================
          PREMIUM BANNER
          NAVBAR KE JUST NICHE
      ========================= */}

      <div className="w-screen bg-gradient-to-br from-[#071426] via-[#0f2847] to-[#163b57] overflow-hidden relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">

        <div className="relative h-[340px] sm:h-[420px] md:h-[500px] w-full overflow-hidden">

          {/* =========================
              INTERVIEW BACKGROUND IMAGE
              — niche ki side shift ki
          ========================= */}

          <div
  className="absolute inset-0 w-full h-full bg-cover bg-no-repeat"
  style={{
    backgroundImage: `url(${interviewBanner})`,
   backgroundPosition: "center 30%",  // ✅ faces visible
    backgroundSize: "cover",
  }}
/>

          {/* =========================
              IMAGE DARK OVERLAY
          ========================= */}

          <div className="absolute inset-0 bg-gradient-to-r from-[#061326]/95 via-[#071426]/65 via-55% to-[#071426]/20" />

          {/* =========================
              BOTTOM DARK OVERLAY
          ========================= */}

          <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/90 via-[#071426]/15 to-transparent" />

          {/* =========================
              SOFT BLUE OVERLAY
          ========================= */}

          <div className="absolute inset-0 bg-[#0b3150]/15 mix-blend-multiply" />

          {/* =========================
              LEFT DARK AREA
          ========================= */}

          <div className="absolute left-0 top-0 h-full w-[58%] bg-gradient-to-r from-[#071426]/75 via-[#0f2847]/35 to-transparent pointer-events-none" />

          {/* =========================
              FLOATING PARTICLES
          ========================= */}

          <div className="absolute top-16 right-10 w-2 h-2 rounded-full bg-blue-400/40 animate-pulse" />

          <div
            className="absolute top-32 right-24 w-3 h-3 rounded-full bg-purple-400/30 animate-pulse"
            style={{
              animationDelay: "1s",
            }}
          />

          <div
            className="absolute bottom-24 right-16 w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-pulse"
            style={{
              animationDelay: "2s",
            }}
          />

          <div
            className="absolute top-1/2 right-40 w-2.5 h-2.5 rounded-full bg-sky-400/30 animate-pulse"
            style={{
              animationDelay: "3s",
            }}
          />

          {/* =========================
              HERO CONTENT
          ========================= */}

          <div className="relative z-20 flex items-end h-full px-4 sm:px-8 md:px-16 lg:px-24 pb-10 sm:pb-12 md:pb-16">

            <div className="max-w-3xl">

              {/* =========================
                  BADGE
              ========================= */}

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 mb-4">

                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />

                <span className="text-xs font-['Inter'] font-semibold text-sky-300 tracking-widest uppercase">
                  Interview Preparation
                </span>

                <span
                  className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"
                  style={{
                    animationDelay: "0.5s",
                  }}
                />

              </div>

              {/* =========================
                  MAIN HEADING
              ========================= */}

              <h1 className="text-white font-['Space_Grotesk'] font-extrabold leading-[1.1] mb-3">

                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl block">
                  Crack Your
                </span>

                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl block bg-gradient-to-r from-sky-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Interview
                </span>

              </h1>

              {/* =========================
                  DECORATIVE LINES
              ========================= */}

              <div className="flex items-center gap-3 mt-4 mb-4">

                <div className="h-1 w-16 bg-gradient-to-r from-sky-400 to-purple-400 rounded-full" />

                <div className="h-1 w-8 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full opacity-60" />

                <div className="h-1 w-4 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full opacity-30" />

              </div>

              {/* =========================
                  DESCRIPTION
              ========================= */}

              <p className="text-gray-300 text-sm sm:text-base md:text-lg font-['Inter'] font-light leading-relaxed max-w-2xl">
                Handpicked interview questions, model answers, tips &
                guidance — everything you need to walk into your interview
                with confidence.
              </p>

            </div>

          </div>

          {/* =========================
              BOTTOM FADE
          ========================= */}

          <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[#f0f7ff] via-[#f0f7ff]/45 to-transparent pointer-events-none" />

        </div>

      </div>

      {/* =========================
          MAIN SECTION
      ========================= */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16">

        {/* =========================
            SECTION HEADING
        ========================= */}

        <div className="text-center mb-10 sm:mb-14">

          {/* LABEL */}

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-100 to-purple-100 mb-4">

            <BookOpen
              className="text-sky-600"
              size={16}
            />

            <span className="text-xs font-['Inter'] font-bold text-sky-700 tracking-widest uppercase">
              Study Material
            </span>

            <Sparkles
              className="text-purple-600"
              size={16}
            />

          </div>

          {/* HEADING */}

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-['Space_Grotesk'] font-extrabold text-gray-900 leading-tight mb-4">

            Interview{" "}

            <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Preparation PDFs
            </span>

          </h2>

          {/* LINE */}

          <div className="w-24 h-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-purple-500 mx-auto rounded-full mb-4" />

          {/* DESCRIPTION */}

          <p className="text-gray-500 text-sm sm:text-base font-['Inter'] max-w-2xl mx-auto">
            Browse all interview preparation PDFs uploaded by our team.
          </p>

        </div>

        {/* =========================
            SEARCH
        ========================= */}

        {!loading && pdfs.length > 0 && (
          <div className="max-w-xl mx-auto mb-10">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search PDFs by title or topic..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-800 font-['Inter'] text-sm outline-none transition-all focus:border-sky-400 focus:ring-4 focus:ring-sky-50"
              />

            </div>

          </div>
        )}

        {/* =========================
            LOADING
        ========================= */}

        {loading && (
          <div className="text-center py-20">

            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-50 to-purple-50 flex items-center justify-center mx-auto mb-5 shadow-lg">

              <Loader2
                size={36}
                className="text-sky-500 animate-spin"
              />

            </div>

            <h3 className="text-xl font-['Space_Grotesk'] font-bold text-gray-700">
              Loading PDFs...
            </h3>

            <p className="font-['Inter'] text-gray-400 mt-2 text-sm">
              Fetching interview preparation materials...
            </p>

          </div>
        )}

        {/* =========================
            ERROR
        ========================= */}

        {!loading && error && (
          <div className="text-center py-16">

            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mx-auto mb-4 shadow-inner">

              <FileText
                className="text-rose-400"
                size={44}
              />

            </div>

            <h3 className="text-xl font-['Space_Grotesk'] font-bold text-gray-700">
              Failed to Load PDFs
            </h3>

            <p className="font-['Inter'] text-gray-400 mt-2 text-sm max-w-md mx-auto">
              {error}
            </p>

          </div>
        )}

        {/* =========================
            NO RESULTS
        ========================= */}

        {!loading &&
          !error &&
          filteredPdfs.length === 0 && (
            <div className="text-center py-20">

              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4 shadow-inner">

                <FileText
                  className="text-gray-400"
                  size={44}
                />

              </div>

              <h3 className="text-xl font-['Space_Grotesk'] font-bold text-gray-700">

                {pdfs.length === 0
                  ? "No PDFs Available Yet"
                  : "No Results Found"}

              </h3>

              <p className="font-['Inter'] text-gray-400 mt-2 text-sm max-w-md mx-auto">

                {pdfs.length === 0
                  ? "Admin hasn't uploaded any interview preparation PDFs yet. Please check back soon."
                  : "Try searching with a different keyword."}

              </p>

            </div>
          )}

        {/* =========================
            PDF CARDS
        ========================= */}

        {!loading &&
          !error &&
          filteredPdfs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {filteredPdfs.map((item, index) => (

                <div
                  key={item._id || index}
                  className="group relative bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >

                  {/* TOP LINE */}

                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500" />

                  <div className="p-6 sm:p-7">

                    {/* ICON */}

                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300">

                      <FileText
                        className="text-white"
                        size={26}
                      />

                    </div>

                    {/* TITLE */}

                    <h3 className="text-lg sm:text-xl font-['Space_Grotesk'] font-extrabold text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {item.title || "Untitled PDF"}
                    </h3>

                    {/* DESCRIPTION */}

                    {(item.subtitle ||
                      item.description) && (
                      <p className="text-sm font-['Inter'] text-gray-500 leading-relaxed mb-5 line-clamp-3">
                        {item.subtitle ||
                          item.description}
                      </p>
                    )}

                    {/* FILE INFO */}

                    {item.fileSize && (
                      <div className="flex items-center gap-2 mb-4">

                        <span className="text-xs font-['Inter'] font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                          📄 {item.fileSize}
                        </span>

                        {item.pages && (
                          <span className="text-xs font-['Inter'] font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                            {item.pages} pages
                          </span>
                        )}

                      </div>
                    )}

                    {/* PAYMENT-LOCKED ACTIONS */}
                    {hasAccess ? (
                      <div className="flex gap-2.5 mt-5">
                        <button
                          onClick={() => handleView(item)}
                          disabled={loadingItemId === item._id}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-['Inter'] font-semibold text-xs sm:text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          {loadingItemId === item._id ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                          Preview
                        </button>
                        <button
                          onClick={() => handleDownload(item)}
                          disabled={loadingItemId === item._id}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-purple-600 text-white font-['Inter'] font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-[1.03] transition-all disabled:opacity-50"
                        >
                          <Download size={15} />
                          Download
                        </button>
                      </div>
                    ) : (
                      <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-3 text-amber-700 font-['Inter'] text-xs sm:text-sm font-semibold">
                        <Lock size={15} /> Pay once to unlock Preview & Download
                      </div>
                    )}

                  </div>

                  {/* BOTTOM HOVER LINE */}

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                </div>

              ))}

            </div>
          )}

      </div>
      </div>

      {!accessLoading && !hasAccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/35 backdrop-blur-md px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/95 p-7 sm:p-9 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-purple-600 shadow-lg shadow-sky-200">
              <Lock className="text-white" size={30} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-['Space_Grotesk'] font-extrabold text-slate-900">
              Unlock Interview Material
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600 font-['Inter']">
              Ek baar payment karke saare Interview Preparation PDFs ka access unlock karein.
            </p>
            <button
              type="button"
              onClick={handleBuyInterviewMaterial}
              disabled={buying}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-purple-600 px-6 py-4 text-base font-['Inter'] font-bold text-white shadow-lg shadow-sky-200 transition-all hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {buying ? <Loader2 size={20} className="animate-spin" /> : <Unlock size={20} />}
              {buying ? "Please wait..." : "Unlock All PDFs"}
            </button>
            <p className="mt-3 text-xs text-slate-400">
              Secure one-time payment · All PDFs unlock after verification
            </p>
          </div>
        </div>
      )}

    </div>
  );
};


export default InterviewPrep;