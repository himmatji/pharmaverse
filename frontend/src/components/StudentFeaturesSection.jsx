import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import doctorImage from "../assets/doctor.jpeg";
import { 
  BookOpen, 
  Video, 
  FileText, 
  MessageCircle, 
  Send, 
  User,
  Clock,
  CheckCircle,
  ExternalLink
} from "lucide-react";

const DarkBanner = () => {
  const navigate = useNavigate();
  const [showDoubtModal, setShowDoubtModal] = useState(false);
  const [doubtText, setDoubtText] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      user: "Rahul Kumar",
      text: "Sir, can you explain the mechanism of action of beta-blockers?",
      time: "2 hours ago",
      replies: 3
    },
    {
      id: 2,
      user: "Priya Sharma",
      text: "What is the difference between generic and branded drugs?",
      time: "5 hours ago",
      replies: 5
    },
    {
      id: 3,
      user: "Amit Singh",
      text: "Please provide more examples of pharmacokinetic interactions.",
      time: "1 day ago",
      replies: 2
    }
  ]);

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
        setShowDoubtModal(true);
        break;
      default:
        navigate('/bpharm');
    }
  };

  const handleSubmitDoubt = () => {
    if (doubtText.trim()) {
      const newComment = {
        id: comments.length + 1,
        user: "Student",
        text: doubtText,
        time: "Just now",
        replies: 0
      };
      setComments([newComment, ...comments]);
      setDoubtText("");
    }
  };

  // Custom Telegram Icon (SVG)
  const TelegramIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );

  return (
    <>
      {/* BANNER SECTION - Increased height for better visibility */}
      <div className="relative w-full min-h-[700px] sm:min-h-[800px] md:min-h-screen overflow-hidden bg-black">
        
        {/* MAIN BLACK BACKGROUND */}
        <div className="absolute inset-0 bg-[#050505]"></div>

        {/* DARK STRIPES */}
        <div className="absolute inset-0 overflow-hidden hidden md:block">
          <div className="absolute left-[42%] top-0 w-[120px] h-full bg-white/[0.03] skew-x-[-18deg]"></div>
          <div className="absolute left-[58%] top-0 w-[90px] h-full bg-white/[0.03] skew-x-[-18deg]"></div>
          <div className="absolute right-[8%] top-0 w-[100px] h-full bg-white/[0.03] skew-x-[-18deg]"></div>
        </div>

        {/* LEFT IMAGE SECTION */}
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

        {/* RIGHT CONTENT - Added padding to prevent cutting */}
        <div className="absolute right-0 top-0 w-full lg:w-[52%] h-full flex items-center">
          <div className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full py-8 sm:py-10">
            
            {/* Premium Study Material Heading - Adjusted size to prevent cutting */}
            <div className="mb-2 sm:mb-3">
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] leading-[1.1] font-black uppercase"
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

              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] leading-[1.1] font-black uppercase mt-0"
                style={{
                  background: "linear-gradient(to bottom, #ffe29a, #ffb347, #d97706)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "'Arial Black', 'Poppins', sans-serif",
                  animation: "slideUp 0.8s ease-out 0.3s forwards",
                  opacity: 0,
                }}
              >
                Study Material
              </h1>
            </div>

            <p
              className="mt-2 sm:mt-3 md:mt-4 text-[#f8d27a] text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-relaxed max-w-[650px] font-light"
              style={{
                animation: "fadeSlideUp 0.8s ease-out 0.6s forwards",
                opacity: 0,
              }}
            >
              specially designed for pharmacy students.
            </p>

            {/* 4 ICONS SECTION */}
            <div 
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-5 sm:mt-6 md:mt-8 w-full"
              style={{
                animation: "fadeSlideUp 0.8s ease-out 0.9s forwards",
                opacity: 0,
              }}
            >
              {/* Icon 1 - Study Notes */}
              <div 
                onClick={() => handleIconClick('notes')}
                className="flex flex-col items-center p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-700/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/30">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-orange-300 text-[10px] sm:text-xs md:text-sm mt-1.5 sm:mt-2 font-medium text-center">Study Notes</span>
                <span className="text-gray-400 text-[8px] sm:text-[10px] hidden sm:block">Premium Content</span>
              </div>

              {/* Icon 2 - Video Lectures (Coming Soon) */}
              <div className="flex flex-col items-center p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-default group relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-700/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/30">
                  <Video className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-orange-300 text-[10px] sm:text-xs md:text-sm mt-1.5 sm:mt-2 font-medium text-center">Video Lectures</span>
                <span className="text-emerald-400 text-[8px] sm:text-[10px] font-semibold">Coming Soon ✨</span>
              </div>

              {/* Icon 3 - Exam Crash Course */}
              <div 
                onClick={() => handleIconClick('papers')}
                className="flex flex-col items-center p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-700/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/30">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-orange-300 text-[10px] sm:text-xs md:text-sm mt-1.5 sm:mt-2 font-medium text-center">Exam Crash Course</span>
                <span className="text-gray-400 text-[8px] sm:text-[10px] hidden sm:block">Quick Revision</span>
              </div>

              {/* Icon 4 - Doubt Section */}
              <div 
                onClick={() => handleIconClick('doubts')}
                className="flex flex-col items-center p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-700/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-orange-500/30">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-orange-300 text-[10px] sm:text-xs md:text-sm mt-1.5 sm:mt-2 font-medium text-center">Doubt Section</span>
                <span className="text-gray-400 text-[8px] sm:text-[10px] hidden sm:block">Ask Questions</span>
              </div>
            </div>

            {/* E-Book Section - Adjusted padding and margin */}
            <div 
              className="mt-4 sm:mt-5 md:mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-500/10 to-orange-700/10 backdrop-blur-sm rounded-xl p-3 sm:p-3.5 md:p-4 border border-orange-500/20"
              style={{
                animation: "fadeSlideUp 0.8s ease-out 1.2s forwards",
                opacity: 0,
              }}
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <TelegramIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs sm:text-sm font-semibold truncate">📚 E-Book & Resources</p>
                  <p className="text-gray-400 text-[10px] sm:text-xs truncate">Join Telegram for free PDFs & study materials</p>
                </div>
              </div>
              <a
                href="https://t.me/pharmacyebookbypharmaverse"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/50 flex-shrink-0 w-full sm:w-auto justify-center"
              >
                <TelegramIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Join Now</span>
                <ExternalLink className="w-3 h-3" />
              </a>
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

      {/* DOUBT SECTION MODAL */}
      {showDoubtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0d0d0d] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-orange-500/20 shadow-2xl shadow-orange-500/10">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500/10 to-orange-700/10 backdrop-blur-sm border-b border-orange-500/20 p-4 sm:p-6 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Doubt Section</h2>
                  <p className="text-gray-400 text-xs sm:text-sm">Ask your questions here</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDoubtModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              
              {/* Comment Input */}
              <div className="mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        value={doubtText}
                        onChange={(e) => setDoubtText(e.target.value)}
                        placeholder="Add a doubt..."
                        className="w-full bg-transparent border-b border-gray-700 focus:border-orange-400 text-white placeholder-gray-500 focus:outline-none transition-colors resize-none py-2 px-1 text-sm"
                        rows="2"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => setDoubtText("")}
                        className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitDoubt}
                        className="px-6 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-full transition-colors"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-sm text-gray-400 border-b border-gray-800 pb-2">
                  <span className="font-semibold text-white">{comments.length}</span>
                  <span>Comments</span>
                </div>
                
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {comment.user.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium text-sm">{comment.user}</span>
                        <span className="text-gray-500 text-xs">{comment.time}</span>
                      </div>
                      <p className="text-gray-300 text-sm mt-0.5">{comment.text}</p>
                      <div className="flex items-center gap-4 mt-1.5">
                        <button className="text-gray-500 text-xs hover:text-gray-300 transition-colors flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          Reply ({comment.replies})
                        </button>
                        <button className="text-gray-500 text-xs hover:text-gray-300 transition-colors flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* E-Book Telegram Section inside Modal */}
              <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/5 to-orange-700/5 rounded-xl border border-orange-500/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <TelegramIcon className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">📚 E-Book Resources</p>
                      <p className="text-gray-400 text-xs">Get free PDFs & study materials</p>
                    </div>
                  </div>
                  <a
                    href="https://t.me/PharmaVerse_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/50 w-full sm:w-auto justify-center"
                  >
                    <TelegramIcon className="w-4 h-4" />
                    Join Telegram
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        /* Custom Scrollbar */
        .max-h-\[90vh\]::-webkit-scrollbar {
          width: 6px;
        }
        .max-h-\[90vh\]::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .max-h-\[90vh\]::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f59e0b, #ea580c);
          border-radius: 10px;
        }
      `}</style>
    </>
  );
};

export default DarkBanner;