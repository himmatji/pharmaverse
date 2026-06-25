import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import bannerImg from "../assets/pharmacy-lab student.jpeg";

import {
  BookOpen,
  FileText,
  Video,
  Brain,
  Download,
  GraduationCap,
  PlayCircle,
  Lock,
  Eye,
  Crown,
  Sparkles,
  Rocket,
  ChevronDown,
  ChevronRight
} from "lucide-react";

const BPharm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePositions, setMousePositions] = useState({});
  
  // For semester cards - which semester is open (SINGLE CLICK OPEN)
  const [openSemester, setOpenSemester] = useState({});

  const [notes, setNotes] = useState([]);
  const [premiumVideos, setPremiumVideos] = useState([]);
  const [freeVideos, setFreeVideos] = useState([]);
  const [paidPDFs, setPaidPDFs] = useState([]);
  const [premiumPapers, setPremiumPapers] = useState([]);
  const [freePapers, setFreePapers] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState(null);
  const [premiumPrice, setPremiumPrice] = useState(999);

  // Group data by semester
  const [pdfsBySemester, setPdfsBySemester] = useState({});
  const [videosBySemester, setVideosBySemester] = useState({});
  const [papersBySemester, setPapersBySemester] = useState({});

  // Scroll to top on page load
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // Handle scroll from navbar navigation
  useEffect(() => {
    const state = location.state;
    
    if (state && state.scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(state.scrollTo);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 500);
    }
  }, [location]);

  // Add Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handleCardMouseMove = (cardId, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePositions(prev => ({ ...prev, [cardId]: { x, y } }));
  };

  const handleCardMouseLeave = (cardId) => {
    setHoveredCard(null);
    setMousePositions(prev => {
      const newState = { ...prev };
      delete newState[cardId];
      return newState;
    });
  };

  // Single click toggle - turant open/close hoga
  const handleSemesterClick = (semester, type) => {
    setOpenSemester(prev => ({
      ...prev,
      [`${type}-${semester}`]: !prev[`${type}-${semester}`]
    }));
  };

  // ========== API CALLS ==========
  const fetchNotes = async () => {
    try {
      const res = await axios.get("https://api.pharmaverse.co.in/api/admin/public/notes?course=B.Pharm");
      setNotes(res.data);
    } catch (error) { console.log(error); }
  };

  const fetchPremiumVideos = async () => {
    try {
      const res = await axios.get("https://api.pharmaverse.co.in/api/admin/public/videos?course=B.Pharm");
      const premiumOnly = res.data.filter(video => video.isPremium === true);
      setPremiumVideos(premiumOnly);
      
      const grouped = {};
      premiumOnly.forEach(video => {
        const sem = video.semester || 1;
        if (!grouped[sem]) grouped[sem] = [];
        grouped[sem].push(video);
      });
      setVideosBySemester(grouped);
    } catch (error) { console.log(error); }
  };

  const fetchFreeVideos = async () => {
    try {
      const res = await axios.get("https://api.pharmaverse.co.in/api/admin/public/free-videos?course=B.Pharm");
      const freeOnly = res.data.filter(video => video.isPremium === false);
      setFreeVideos(freeOnly);
    } catch (error) { 
      console.log(error);
      try {
        const allRes = await axios.get("https://api.pharmaverse.co.in/api/admin/public/videos?course=B.Pharm");
        const freeOnly = allRes.data.filter(video => video.isPremium === false);
        setFreeVideos(freeOnly);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const fetchPaidPDFs = async () => {
    try {
      const res = await axios.get("https://api.pharmaverse.co.in/api/admin/public/paid-pdfs?course=B.Pharm");
      setPaidPDFs(res.data);
      
      const grouped = {};
      res.data.forEach(pdf => {
        const sem = pdf.semester || 1;
        if (!grouped[sem]) grouped[sem] = [];
        grouped[sem].push(pdf);
      });
      setPdfsBySemester(grouped);
    } catch (error) { console.log(error); }
  };

  const fetchPapers = async () => {
    try {
      const res = await axios.get("https://api.pharmaverse.co.in/api/admin/public/papers?course=B.Pharm");
      setFreePapers(res.data.filter((paper) => paper.isPremium === false));
      const premiumPapersData = res.data.filter((paper) => paper.isPremium === true);
      setPremiumPapers(premiumPapersData);
      
      const grouped = {};
      premiumPapersData.forEach(paper => {
        const sem = paper.semester || 1;
        if (!grouped[sem]) grouped[sem] = [];
        grouped[sem].push(paper);
      });
      setPapersBySemester(grouped);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserStatus = async () => {
    try {
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("https://api.pharmaverse.co.in/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        setIsPremium(userData.isPremium || false);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Failed to fetch user status:", error);
    }
  };

  const fetchPremiumPrice = async () => {
    try {
      const res = await axios.get("https://api.pharmaverse.co.in/api/admin/public-price");
      setPremiumPrice(res.data.price);
    } catch (error) {
      console.log("Price fetch error:", error);
      const savedPrice = localStorage.getItem("premium_price");
      if (savedPrice) {
        setPremiumPrice(parseInt(savedPrice));
      }
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchFreeVideos();
    fetchPremiumVideos();
    fetchPaidPDFs();
    fetchPapers();
    fetchUserStatus();
    fetchPremiumPrice();
  }, []);

  // =============================================
  // ========== FIXED handleView ==========
  // Mobile/Tablet par PDF open karne ka solution
  // =============================================
  const handleView = async (item, type) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");
      
      if (!token) {
        alert("Please login first to view");
        setLoading(false);
        return;
      }
      
      let viewUrl;
      if (type === "note") {
        viewUrl = `https://api.pharmaverse.co.in/api/admin/public/download/note/${item._id}`;
      } else if (type === "paid-pdf") {
        viewUrl = `https://api.pharmaverse.co.in/api/admin/public/download/paid-pdf/${item._id}`;
      } else if (type === "free-paper" || type === "premium-paper") {
        viewUrl = `https://api.pharmaverse.co.in/api/admin/public/download/paper/${item._id}`;
      } else {
        throw new Error("Invalid file type");
      }
      
      const response = await fetch(viewUrl, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load file');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // ========== MOBILE / TABLET DETECTION ==========
      const isMobileOrTablet = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent) || window.innerWidth < 1024;
      
      if (isMobileOrTablet) {
        // Mobile/Tablet: Direct download or Google Docs Viewer
        if (blob.type === "application/pdf") {
          // Try Google Docs Viewer (best for mobile)
          const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(blobUrl)}&embedded=true`;
          
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>${item.title || 'Document'}</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body, html { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }
                    iframe { width: 100%; height: 100%; border: none; }
                  </style>
                </head>
                <body>
                  <iframe src="${googleViewerUrl}"></iframe>
                </body>
              </html>
            `);
            newWindow.document.close();
          } else {
            // Popup blocked - download karo
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = item.fileName || `${item.title}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert("📄 PDF downloaded! Please check your downloads folder.");
          }
        } else {
          // Non-PDF files: download karo
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = item.fileName || `${item.title}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
        setLoading(false);
        return;
      }
      
      // ========== DESKTOP / LAPTOP - Original code ==========
      const newWindow = window.open();
      if (!newWindow) {
        alert("Please allow popups to view files");
        setLoading(false);
        return;
      }
      
      if (blob.type === "application/pdf") {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${item.title || 'Document'}</title>
              <style>
                body, html { margin: 0; padding: 0; height: 100%; width: 100%; }
                iframe { width: 100%; height: 100%; border: none; }
              </style>
            </head>
            <body>
              <iframe src="${blobUrl}"></iframe>
            </body>
          </html>
        `);
      } else {
        newWindow.location.href = blobUrl;
      }
      newWindow.document.close();
      
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (error) {
      console.error("View error:", error);
      alert(error.message || "Failed to open file");
    } finally {
      setLoading(false);
    }
  };

  const updateLocalStorageAfterPurchase = async () => {
    try {
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");
      if (!token) return false;
      
      const response = await axios.get("https://api.pharmaverse.co.in/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setIsPremium(response.data.user.isPremium || false);
        setUser(response.data.user);
        return true;
      }
    } catch (error) {
      console.error("Failed to update localStorage:", error);
      return false;
    }
  };

  const handleDownload = async (item, type) => {
    const isPremiumContent = type === "paid-pdf" || type === "premium-paper" || type === "premium-video";
    
    if (isPremiumContent && !isPremium) {
      handlePremiumPurchase();
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");
      
      if (!token) {
        alert("Please login first to download");
        setLoading(false);
        return;
      }
      
      let downloadUrl;
      if (type === "note") {
        downloadUrl = `https://api.pharmaverse.co.in/api/admin/public/download/note/${item._id}`;
      } else if (type === "paid-pdf") {
        downloadUrl = `https://api.pharmaverse.co.in/api/admin/public/download/paid-pdf/${item._id}`;
      } else if (type === "free-paper") {
        downloadUrl = `https://api.pharmaverse.co.in/api/admin/public/download/paper/${item._id}`;
      } else if (type === "premium-paper") {
        downloadUrl = `https://api.pharmaverse.co.in/api/admin/public/download/paper/${item._id}`;
      } else {
        throw new Error("Invalid file type");
      }
      
      const response = await fetch(downloadUrl, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.fileName || `${item.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert("✅ Download started!");
      
    } catch (error) {
      console.error("Download error:", error);
      alert(error.message || "Download failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWatchVideo = (video, isFreeVideo = false) => {
    if (!isFreeVideo && !isPremium) {
      handlePremiumPurchase();
      return;
    }
    if (video.videoUrl) {
      window.open(video.videoUrl, "_blank");
    } else {
      alert("Video URL not available");
    }
  };

  const handleFreeVideoDownload = async (video) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");
      
      if (!token) {
        alert("Please login first to download");
        setLoading(false);
        return;
      }
      
      if (video.videoUrl) {
        window.open(video.videoUrl, "_blank");
        alert("Opening video in new tab!");
      } else {
        alert("Video URL not available");
      }
    } catch (error) {
      console.error("Free video error:", error);
      alert("Failed to open video");
    } finally {
      setLoading(false);
    }
  };

  const handlePremiumPurchase = async () => {
    try {
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        navigate('/login');
        return;
      }

      const amount = premiumPrice;

      const orderResponse = await axios.post(
        "https://api.pharmaverse.co.in/api/payment/create-order",
        {
          amount: amount,
          productType: "premium_course",
          productId: "bpharm_premium",
          productTitle: `B.Pharm Premium Course - Complete Access (₹${amount})`
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = orderResponse.data;

      const options = {
        key: data.key,
        amount: data.amount * 100,
        currency: "INR",
        name: "PharmaVerse",
        description: "B.Pharm Premium Course - Full Access",
        order_id: data.orderId,

        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(
              "https://api.pharmaverse.co.in/api/payment/verify-payment",
              {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                productType: "premium_course",
                productId: "bpharm_premium"
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

            if (verifyResponse.data.success) {
              alert("✅ Payment Successful! All content is now unlocked!");
              await updateLocalStorageAfterPurchase();
              window.location.reload();
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed");
          }
        },

        prefill: {
          name: user?.name || JSON.parse(localStorage.getItem("user"))?.name || "",
          email: user?.email || JSON.parse(localStorage.getItem("user"))?.email || "",
        },

        theme: {
          color: "#0ea5e9",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();

    } catch (error) {
      console.log("Payment Error:", error);
      alert("Payment Failed: " + (error.response?.data?.message || error.message));
    }
  };

  const tabs = [
    { id: "notes", label: "Free Materials", icon: BookOpen },
    { id: "semester", label: "Premium PDFs", icon: GraduationCap },
    { id: "videos", label: "Premium Videos", icon: Video },
    { id: "papers", label: "Premium Papers", icon: Brain },
  ];

  // Render Functions
  const renderFreeCard = (item, type, icon, index) => {
    const Icon = icon;
    const cardId = `${type}-${item._id}`;
    const mousePos = mousePositions[cardId] || { x: 50, y: 50 };
    
    return (
      <div
        key={cardId}
        className="group relative"
        style={{
          animation: `cinematicReveal 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.08}s both`
        }}
        onMouseEnter={() => setHoveredCard(cardId)}
        onMouseLeave={() => handleCardMouseLeave(cardId)}
        onMouseMove={(e) => handleCardMouseMove(cardId, e)}
      >
        <div 
          className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, #10b981, #059669, #34d399)`
          }}
        ></div>
        
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative h-48 overflow-hidden">
            {item.thumbnail ? (
              <>
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center">
                <Icon className="text-white/30 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" size={56} />
              </div>
            )}
            
            <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 z-10 backdrop-blur-sm">
              <Sparkles size={10} className="animate-pulse" />
              <span className="tracking-wide">FREE ACCESS</span>
              <Sparkles size={10} className="animate-pulse" />
            </div>
            
            <div className="absolute -bottom-5 left-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Icon className="text-white" size={22} />
              </div>
            </div>
          </div>
          
          <div className="p-5 pt-7">
            <h3 className="font-['Space_Grotesk'] font-bold text-xl text-gray-900 mb-2 line-clamp-1">{item.title}</h3>
            
            {type === "free-paper" && (
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">Semester {item.semester || "All"}</span>
              </div>
            )}
            
            <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2">
              {item.description || "Comprehensive study material designed for B.Pharm students."}
            </p>
            
            <div className="flex gap-2.5">
              <button
                onClick={() => handleView(item, type)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:bg-gray-200 hover:scale-105"
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={() => handleDownload(item, type)}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>
          
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
        </div>
      </div>
    );
  };

  const renderPremiumCard = (item, type, icon, index) => {
    const Icon = icon;
    const isLocked = !isPremium;
    const cardId = `${type}-${item._id}`;
    const mousePos = mousePositions[cardId] || { x: 50, y: 50 };
    
    return (
      <div
        key={cardId}
        className="group relative"
        style={{
          animation: `cinematicReveal 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.08}s both`
        }}
        onMouseEnter={() => setHoveredCard(cardId)}
        onMouseLeave={() => handleCardMouseLeave(cardId)}
        onMouseMove={(e) => handleCardMouseMove(cardId, e)}
      >
        <div 
          className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, #8b5cf6, #7c3aed, #a78bfa)`
          }}
        ></div>
        
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <div className="relative h-48 overflow-hidden">
            {item.thumbnail ? (
              <>
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-500 via-purple-600 to-pink-500 flex items-center justify-center">
                <Icon className="text-white/30 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500" size={56} />
              </div>
            )}
            
            {!isLocked && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 z-10 backdrop-blur-sm">
                <Crown size={10} className="text-yellow-300" />
                <span>PREMIUM</span>
              </div>
            )}
            
            {isLocked && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-20">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl">
                    <Lock size={32} className="text-white" />
                  </div>
                  <p className="text-white font-bold text-sm">Premium Content</p>
                  <p className="text-white/60 text-xs mt-1">Unlock with Premium</p>
                </div>
              </div>
            )}
            
            <div className="absolute -bottom-5 left-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${isLocked ? 'opacity-50' : ''}`}>
                {isLocked ? <Lock className="text-white" size={20} /> : <Icon className="text-white" size={22} />}
              </div>
            </div>
          </div>
          
          <div className="p-5 pt-7">
            <h3 className="font-['Space_Grotesk'] font-bold text-xl text-gray-900 mb-2 line-clamp-1">{item.title}</h3>
            
            {type === "paid-pdf" && (
              <div className="mb-3">
                <span className="text-xs font-medium bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg">Semester {item.semester}</span>
              </div>
            )}
            
            <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2">
              {item.description || "Premium study material for B.Pharm excellence."}
            </p>
            
            <div className="flex gap-2.5">
              {isLocked ? (
                <button
                  onClick={handlePremiumPurchase}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                >
                  <Rocket size={16} />
                  Unlock Now - ₹{premiumPrice}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleView(item, type)}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 hover:scale-105"
                  >
                    <Eye size={16} />
                    Preview
                  </button>
                  <button
                    onClick={() => handleDownload(item, type)}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
        </div>
      </div>
    );
  };

  const renderFreeVideoCard = (video, index) => {
    const cardId = `free-video-${video._id}`;
    const mousePos = mousePositions[cardId] || { x: 50, y: 50 };
    
    return (
      <div
        key={cardId}
        className="group relative"
        style={{
          animation: `cinematicReveal 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.08}s both`
        }}
        onMouseEnter={() => setHoveredCard(cardId)}
        onMouseLeave={() => handleCardMouseLeave(cardId)}
        onMouseMove={(e) => handleCardMouseMove(cardId, e)}
      >
        <div 
          className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, #10b981, #059669, #34d399)`
          }}
        ></div>
        
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
          <div 
            className="relative h-52 overflow-hidden cursor-pointer"
            onClick={() => handleWatchVideo(video, true)}
          >
            {video.thumbnail ? (
              <>
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center">
                <Video className="text-white/30 group-hover:scale-125 transition-all duration-500" size={56} />
              </div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/50 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                <PlayCircle size={36} className="text-white ml-0.5" />
              </div>
            </div>
            
            <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
              FREE ACCESS
            </div>
          </div>
          
          <div className="p-5">
            <h3 className="font-['Space_Grotesk'] font-bold text-xl text-gray-900 mb-2 line-clamp-1">{video.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2">{video.description || "Free video lecture series."}</p>
            
            <div className="flex gap-2.5">
              <button onClick={() => handleWatchVideo(video, true)} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:scale-105">
                <PlayCircle size={16} /> Watch Now
              </button>
              <button onClick={() => handleFreeVideoDownload(video)} disabled={loading} className="flex-1 bg-gray-100 text-gray-700 px-3 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 hover:scale-105 disabled:opacity-50">
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPremiumVideoCard = (video, index) => {
    const isLocked = !isPremium;
    const cardId = `premium-video-${video._id}`;
    const mousePos = mousePositions[cardId] || { x: 50, y: 50 };
    
    return (
      <div
        key={cardId}
        className="group relative"
        style={{
          animation: `cinematicReveal 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${index * 0.08}s both`
        }}
        onMouseEnter={() => setHoveredCard(cardId)}
        onMouseLeave={() => handleCardMouseLeave(cardId)}
        onMouseMove={(e) => handleCardMouseMove(cardId, e)}
      >
        <div 
          className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, #f43f5e, #ec4899, #d946ef)`
          }}
        ></div>
        
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
          <div 
            className="relative h-52 overflow-hidden cursor-pointer"
            onClick={() => {
              if (isLocked) handlePremiumPurchase();
              else handleWatchVideo(video, false);
            }}
          >
            {video.thumbnail ? (
              <>
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 flex items-center justify-center">
                <Video className="text-white/30 group-hover:scale-125 transition-all duration-500" size={56} />
              </div>
            )}
            
            {!isLocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/50 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                  <PlayCircle size={36} className="text-white ml-0.5" />
                </div>
              </div>
            )}
            
            {!isLocked && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                <Crown size={10} className="text-yellow-300" /> PREMIUM
              </div>
            )}
            
            {isLocked && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-20">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 flex items-center justify-center shadow-2xl">
                    <Lock size={32} className="text-white" />
                  </div>
                  <p className="text-white font-bold text-sm">Premium Video</p>
                  <p className="text-white/60 text-xs mt-1">Unlock with Premium</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-5">
            <h3 className="font-['Space_Grotesk'] font-bold text-xl text-gray-900 mb-2 line-clamp-1">{video.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2">{video.description || "Premium video lecture."}</p>
            
            <div className="flex gap-2.5">
              {isLocked ? (
                <button onClick={handlePremiumPurchase} className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white px-3 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-105">
                  <Rocket size={16} /> Unlock - ₹{premiumPrice}
                </button>
              ) : (
                <>
                  <button onClick={() => handleWatchVideo(video, false)} className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white px-3 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:scale-105">
                    <PlayCircle size={16} /> Watch
                  </button>
                  <button onClick={() => handleDownload(video, "premium-video")} disabled={loading} className="flex-1 bg-gray-100 text-gray-700 px-3 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 hover:scale-105 disabled:opacity-50">
                    <Download size={16} /> Download
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== SEMESTER CARDS SECTION - SINGLE CLICK OPEN ==========
  const renderSemesterSection = (title, data, type, renderCard, icon, semesters = [1,2,3,4,5,6,7,8]) => {
    const hasData = semesters.some(sem => data[sem] && data[sem].length > 0);
    
    if (!hasData) return null;
    
    const activeSemesters = semesters.filter(sem => data[sem] && data[sem].length > 0);
    
    return (
      <div className="mb-12">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {activeSemesters.map(sem => {
            const items = data[sem] || [];
            const isOpen = openSemester[`${type}-${sem}`] === true;
            
            return (
              <div
                key={sem}
                onClick={() => handleSemesterClick(sem, type)}
                className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isOpen ? 'scale-105' : ''
                }`}
              >
                <div className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 ${
                  isOpen 
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-2xl' 
                    : 'bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-xl text-gray-700'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className={`text-3xl sm:text-4xl font-bold mb-1 sm:mb-2 ${
                    isOpen ? 'text-white' : 'text-purple-600 group-hover:text-purple-700'
                  }`}>
                    {sem}
                  </div>
                  
                  <div className={`text-[10px] sm:text-xs font-medium ${
                    isOpen ? 'text-purple-200' : 'text-gray-500'
                  }`}>
                    Semester
                  </div>
                  
                  <div className={`mt-2 sm:mt-3 inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                    isOpen 
                      ? 'bg-white/20 text-white' 
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    <FileText size={10} />
                    <span>{items.length} PDFs</span>
                  </div>
                  
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600 transform transition-transform duration-300 ${
                    isOpen ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></div>
                </div>
              </div>
            );
          })}
        </div>
        
        {activeSemesters.map(sem => {
          const items = data[sem] || [];
          const isOpen = openSemester[`${type}-${sem}`] === true;
          
          if (!isOpen || items.length === 0) return null;
          
          return (
            <div key={`content-${sem}`} className="mt-6 animate-fadeIn">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  {sem}
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-800">Semester {sem} PDFs</h4>
                <span className="text-xs sm:text-sm text-gray-500">({items.length} items)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {items.map((item, idx) => renderCard(item, type, idx))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Add CSS animations
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes cinematicReveal {
      0% {
        opacity: 0;
        transform: translateY(40px) scale(0.96);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out forwards;
    }
    
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }
      .hero-subtitle {
        font-size: 0.875rem;
      }
      .tab-button {
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
      }
      .tab-icon {
        width: 2rem;
        height: 2rem;
      }
    }
    
    @media (max-width: 640px) {
      .section-title {
        font-size: 1.75rem;
      }
      .card-title {
        font-size: 1rem;
      }
      .premium-button {
        font-size: 0.75rem;
        padding: 0.5rem 1rem;
      }
    }
    
    @media (max-width: 640px) {
      .grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  `;
  document.head.appendChild(styleSheet);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-white">
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-4 sm:p-6 flex items-center gap-3 shadow-xl">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700 font-medium text-sm sm:text-base">Processing...</span>
          </div>
        </div>
      )}

      {/* Premium Banner */}
      {!isPremium && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-bounce w-[90%] sm:w-auto">
          <button
            onClick={handlePremiumPurchase}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 sm:gap-3 text-sm sm:text-base w-full justify-center"
          >
            <Crown size={18} className="sm:w-6 sm:h-6 text-yellow-300" />
            <span>Get Premium - ₹{premiumPrice}</span>
            <Crown size={18} className="sm:w-6 sm:h-6 text-yellow-300" />
          </button>
        </div>
      )}

      {isPremium && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-[90%] sm:w-auto">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold shadow-xl flex items-center gap-2 text-sm sm:text-base">
            <Crown size={16} className="sm:w-5 sm:h-5 text-yellow-300" />
            Premium Member
            <Crown size={16} className="sm:w-5 sm:h-5 text-yellow-300" />
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="w-screen bg-[#07192d] overflow-hidden relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <div className="relative h-[300px] sm:h-[360px] md:h-[520px] w-full">
          <div 
            className="absolute right-0 top-0 w-[70%] h-full bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${bannerImg})`,
              backgroundPosition: 'center 40%'
            }}
          >
            <div className="absolute inset-0 bg-black/35"></div>
          </div>
          <div className="absolute left-0 top-0 h-full w-[62%] bg-[#04172c]" style={{ clipPath: "polygon(0 0, 78% 0, 58% 100%, 0% 100%)" }}></div>
          <div className="absolute left-[18%] top-0 h-full w-[22%] bg-[#0a2747]/80 backdrop-blur-md" style={{ clipPath: "polygon(35% 0, 100% 0, 65% 100%, 0% 100%)" }}></div>
          <div className="relative z-20 flex items-center h-full px-4 sm:px-6 md:px-20">
            <div className="max-w-[520px]">
              <h1 className="text-white text-3xl sm:text-4xl md:text-7xl font-extrabold leading-tight mb-3 sm:mb-5">
                Bachelor<br /><span className="text-sky-400">of Pharmacy</span>
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm md:text-lg leading-relaxed mb-5 sm:mb-8 max-w-[500px]">
                Complete Notes, Semester-wise PDFs, Practical Videos & Predictive Papers for B.Pharm Students.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="w-full bg-white">
        <div className="w-full min-h-[120px] sm:min-h-[150px] bg-gradient-to-b from-[#f3fbff] via-white to-[#f8fcff] border-b border-sky-100 flex items-center justify-center">
          <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-6">
            <div className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-2 sm:gap-5 overflow-x-auto pb-3 sm:pb-0 hide-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => { setActiveTab(tab.id); document.getElementById(tab.id)?.scrollIntoView({ behavior: "smooth" }); }} 
                    className={`group flex items-center gap-2 sm:gap-3 px-3 sm:px-8 py-2 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 border whitespace-nowrap ${
                      isActive 
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white border-transparent shadow-lg scale-105" 
                        : "bg-white text-gray-700 border-sky-100 hover:shadow-md hover:scale-105"
                    }`}
                  >
                    <div className={`w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive ? "bg-white/20" : "bg-sky-100 text-sky-600 group-hover:bg-sky-200"
                    }`}>
                      <Icon size={14} className="sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xs sm:text-[15px] md:text-base font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-14">
        
        {/* NOTES SECTION - Free Materials */}
        <div id="notes" className="mb-16 sm:mb-24 scroll-mt-20">
          <div className="text-center mb-8 sm:mb-14">
            <p className="text-sky-600 font-semibold tracking-[2px] sm:tracking-[3px] uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Study Material</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">Free Materials</h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-sky-400 to-blue-500 mx-auto rounded-full mt-3 sm:mt-4"></div>
          </div>
          
          {notes.length > 0 && (
            <>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 flex items-center gap-2">
                <span>📚</span> Free Notes & PDFs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {notes.map((note, idx) => renderFreeCard(note, "note", FileText, idx))}
              </div>
            </>
          )}

          {freeVideos.length > 0 && (
            <>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 flex items-center gap-2">
                <span>🎬</span> Free Video Lectures
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
                {freeVideos.map((video, idx) => renderFreeVideoCard(video, idx))}
              </div>
            </>
          )}

          {freePapers.length > 0 && (
            <>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 flex items-center gap-2">
                <span>📝</span> Free Practice Papers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {freePapers.map((paper, idx) => renderFreeCard(paper, "free-paper", Brain, idx))}
              </div>
            </>
          )}

          {notes.length === 0 && freeVideos.length === 0 && freePapers.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">No free content available yet.</div>
          )}
        </div>

        {/* SEMESTER SECTION - Premium PDFs */}
        <div id="semester" className="mb-16 sm:mb-24 scroll-mt-20">
          <div className="text-center mb-8 sm:mb-14">
            <p className="text-sky-600 font-semibold tracking-[2px] sm:tracking-[3px] uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Premium Content</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">Premium Semester PDFs</h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-sky-400 to-blue-500 mx-auto rounded-full mt-3 sm:mt-4"></div>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">Click on any semester card to view its PDFs</p>
          </div>
          
          {Object.keys(pdfsBySemester).length > 0 ? (
            renderSemesterSection(
              "Semester-wise PDFs", 
              pdfsBySemester, 
              "paid-pdf", 
              (item, type, idx) => renderPremiumCard(item, "paid-pdf", Lock, idx),
              <GraduationCap size={20} className="sm:w-6 sm:h-6 text-purple-600" />
            )
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">No premium PDFs available yet.</div>
          )}
        </div>

        {/* VIDEOS SECTION - Premium Videos */}
        <div id="videos" className="mb-16 sm:mb-24 scroll-mt-20">
          <div className="text-center mb-8 sm:mb-14">
            <p className="text-sky-600 font-semibold tracking-[2px] sm:tracking-[4px] uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Learning Resources</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">Premium Videos</h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-sky-400 to-blue-500 mx-auto rounded-full mt-3 sm:mt-4"></div>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">Click on any semester to view its videos</p>
          </div>
          
          {Object.keys(videosBySemester).length > 0 ? (
            renderSemesterSection(
              "Semester-wise Videos", 
              videosBySemester, 
              "premium-video", 
              (item, type, idx) => renderPremiumVideoCard(item, idx),
              <Video size={20} className="sm:w-6 sm:h-6 text-rose-600" />
            )
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">No premium videos available yet.</div>
          )}
        </div>

        {/* PAPERS SECTION - Premium Papers */}
        <div id="papers" className="mb-16 sm:mb-24 scroll-mt-20">
          <div className="text-center mb-8 sm:mb-14">
            <p className="text-sky-600 font-semibold tracking-[2px] sm:tracking-[4px] uppercase mb-2 sm:mb-3 text-xs sm:text-sm">Exam Preparation</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900">Premium Papers</h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-sky-400 to-blue-500 mx-auto rounded-full mt-3 sm:mt-4"></div>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">Click on any semester to view its papers</p>
          </div>
          
          {Object.keys(papersBySemester).length > 0 ? (
            renderSemesterSection(
              "Semester-wise Papers", 
              papersBySemester, 
              "premium-paper", 
              (item, type, idx) => renderPremiumCard(item, "premium-paper", Brain, idx),
              <Brain size={20} className="sm:w-6 sm:h-6 text-amber-600" />
            )
          ) : (
            <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">No premium papers available yet.</div>
          )}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default BPharm;