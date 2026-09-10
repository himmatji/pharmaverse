import { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Send,
  Loader2,
  Sparkles,
  Clock,
  User,
  Mail,
  MessageSquare,
  Crown,
  Shield,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.pharmaverse.co.in";

const DoubtSection = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});

  const chatEndRef = useRef(null);

  const token = localStorage.getItem("userToken") || localStorage.getItem("token");
  const isLoggedIn = !!token && localStorage.getItem("isLoggedIn") === "true";
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  /* FETCH DOUBTS */
  const fetchDoubts = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/doubts`);
      setDoubts(Array.isArray(res?.data?.doubts) ? res.data.doubts : []);
    } catch (err) {
      console.error(err);
      if (!silent) setDoubts([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
    const interval = setInterval(() => fetchDoubts(true), 30000);
    return () => clearInterval(interval);
  }, []);

  /* POST DOUBT */
  const handlePostDoubt = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login first to ask");
      return;
    }
    if (!question.trim()) {
      toast.error("Please write your doubt");
      return;
    }

    setPosting(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/doubts`,
        { question: question.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Doubt posted!");
        setQuestion("");
        await fetchDoubts();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  /* POST REPLY */
  const handlePostReply = async (doubtId) => {
    if (!isLoggedIn) {
      toast.error("Please login first");
      return;
    }
    if (!replyText.trim()) {
      toast.error("Please write a reply");
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/doubts/${doubtId}/reply`,
        { message: replyText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Reply sent!");
        setReplyText("");
        setReplyingTo(null);
        await fetchDoubts();
      }
    } catch (err) {
      toast.error("Failed to reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    if (days < 30) return `${Math.floor(days / 7)}w`;
    return d.toLocaleDateString();
  };

  const toggleReplies = (id) => {
    setExpandedReplies((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="relative w-full py-14 sm:py-20 overflow-hidden">
      {/* LUXURY BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a3a5c]"></div>

      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-sky-500/20 blur-[120px]"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-500/20 blur-[120px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[150px]"></div>

      <div className="absolute top-20 right-20 w-2 h-2 rounded-full bg-sky-400/60 animate-pulse"></div>
      <div
        className="absolute bottom-32 left-24 w-3 h-3 rounded-full bg-purple-400/50 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 right-32 w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(15, 40, 71, 0.95)",
            color: "#fff",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(56, 189, 248, 0.2)",
          },
          success: {
            duration: 3000,
            style: {
              background: "rgba(16, 185, 129, 0.95)",
              color: "#fff",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "rgba(239, 68, 68, 0.95)",
              color: "#fff",
            },
          },
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* LUXURY HEADER */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-500/20 to-purple-500/20 backdrop-blur-md border border-white/10 mb-5">
            <Crown className="text-amber-300" size={14} />
            <span className="text-xs font-['Inter'] font-bold text-sky-200 tracking-widest uppercase">
              Premium Doubt Lounge
            </span>
            <Crown className="text-amber-300" size={14} />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-['Space_Grotesk'] font-extrabold leading-[1.1] mb-4">
            <span className="text-white">Ask Your</span>{" "}
            <span className="bg-gradient-to-r from-sky-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Doubts
            </span>
          </h2>

          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-1 w-16 bg-gradient-to-r from-sky-400 to-purple-400 rounded-full"></div>
            <div className="h-1 w-8 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full opacity-60"></div>
            <div className="h-1 w-4 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full opacity-30"></div>
          </div>

          <p className="text-gray-300 text-sm sm:text-base font-['Inter'] font-light max-w-2xl mx-auto leading-relaxed">
            Get personalized answers from PharmaVerse experts & top scholars.
          </p>
        </div>

        {/* LUXURY ASK FORM */}
        <div className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_80px_-20px_rgba(14,165,233,0.4)] overflow-hidden mb-10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/80 to-transparent"></div>
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-sky-400/20 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-purple-400/20 blur-3xl"></div>

          <div className="relative z-10 p-6 sm:p-8">
            {isLoggedIn ? (
              <form onSubmit={handlePostDoubt} className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-purple-500 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-lg shadow-sky-500/50">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-['Space_Grotesk'] font-bold text-white">
                      Compose your doubt
                    </h3>
                    <p className="text-xs font-['Inter'] text-sky-200/70">
                      Posting as{" "}
                      <span className="font-semibold text-sky-300">
                        {user?.name || "You"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your doubt here..."
                    maxLength={500}
                    className="flex-1 px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-white placeholder-white/40 font-['Inter'] text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
                  />

                  <button
                    type="submit"
                    disabled={posting}
                    className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 text-white font-['Inter'] font-bold text-sm shadow-[0_10px_40px_-10px_rgba(56,189,248,0.8)] hover:shadow-[0_15px_50px_-10px_rgba(56,189,248,1)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                    {posting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    )}
                    {posting ? "Posting..." : "Send"}
                  </button>
                </div>

                <p className="text-xs font-['Inter'] text-sky-200/60 flex items-center gap-1.5">
                  <Shield size={11} className="text-emerald-400" />
                  Verified answers from PharmaVerse team. Spam removed.
                </p>
              </form>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400/30 to-purple-500/30 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/30">
                  <Lock size={28} className="text-sky-300" />
                </div>
                <h3 className="text-lg font-['Space_Grotesk'] font-bold text-white mb-2">
                  Members Only
                </h3>
                <p className="text-sky-200/70 font-['Inter'] text-sm mb-5 max-w-md mx-auto">
                  Login to join the discussion and ask your doubts.
                </p>
                <a
                  href="/login"
                  className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 text-white font-['Inter'] font-bold text-sm shadow-[0_10px_40px_-10px_rgba(56,189,248,0.8)] hover:scale-[1.03] transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Sparkles size={16} />
                  Login to Ask
                </a>
              </div>
            )}
          </div>
        </div>

        {/* DOUBTS LIST — LUXURY CHAT */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500/20 to-purple-500/20 backdrop-blur-md border border-white/10 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Loader2 size={32} className="text-sky-400 animate-spin" />
            </div>
            <p className="font-['Inter'] text-sky-200/60 text-sm">Loading doubts...</p>
          </div>
        ) : doubts.length === 0 ? (
          <div className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_80px_-20px_rgba(14,165,233,0.4)] overflow-hidden text-center py-16">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/80 to-transparent"></div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400/20 to-purple-500/20 backdrop-blur-md border border-white/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={36} className="text-sky-300" />
            </div>
            <h3 className="text-xl font-['Space_Grotesk'] font-bold text-white mb-2">
              No Doubts Yet
            </h3>
            <p className="font-['Inter'] text-sky-200/60 text-sm max-w-md mx-auto">
              Be the first one to start a conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {doubts.map((doubt) => {
              const showReplies = expandedReplies[doubt._id] !== false;
              return (
                <div
                  key={doubt._id}
                  className="group relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden hover:border-sky-400/30 hover:bg-white/[0.07] transition-all duration-500 shadow-[0_20px_60px_-20px_rgba(14,165,233,0.2)]"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent"></div>

                  <div className="p-5 sm:p-6">
                    {/* USER MESSAGE */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-400 to-purple-500 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-sky-500/40">
                          {(doubt.userName || "A").charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0f2847]"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-['Inter'] font-bold text-white text-sm">
                            {doubt.userName || "Anonymous"}
                          </span>

                          {doubt.userEmail && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-['Inter'] text-sky-200/70 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                              <Mail size={9} />
                              {doubt.userEmail}
                            </span>
                          )}

                          <span className="text-[10px] font-['Inter'] text-sky-200/50 flex items-center gap-1">
                            <Clock size={10} />
                            {formatTime(doubt.createdAt)}
                          </span>
                        </div>

                        <div className="mt-2 rounded-2xl rounded-tl-sm bg-white/[0.06] border border-white/10 px-4 py-3 backdrop-blur-sm">
                          <p className="text-sky-50 font-['Inter'] text-[15px] leading-relaxed whitespace-pre-wrap">
                            {doubt.question}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          {isLoggedIn && (
                            <button
                              onClick={() => {
                                setReplyingTo(
                                  replyingTo === doubt._id ? null : doubt._id
                                );
                                setReplyText("");
                              }}
                              className="inline-flex items-center gap-1.5 text-sky-300/70 hover:text-sky-300 font-['Inter'] font-semibold text-xs transition-colors"
                            >
                              <Send size={12} />
                              Reply
                            </button>
                          )}

                          {doubt.replies && doubt.replies.length > 0 && (
                            <button
                              onClick={() => toggleReplies(doubt._id)}
                              className="inline-flex items-center gap-1.5 text-sky-300/70 hover:text-sky-300 font-['Inter'] text-xs transition-colors"
                            >
                              {showReplies ? (
                                <ChevronUp size={12} />
                              ) : (
                                <ChevronDown size={12} />
                              )}
                              {doubt.replies.length}{" "}
                              {doubt.replies.length === 1 ? "reply" : "replies"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* REPLIES THREAD */}
                    {showReplies &&
                      doubt.replies &&
                      doubt.replies.length > 0 && (
                        <div className="mt-4 ml-4 sm:ml-14 space-y-3">
                          {doubt.replies.map((reply) => (
                            <div
                              key={reply._id}
                              className="flex items-start gap-3"
                            >
                              <div className="relative shrink-0">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                                    reply.isAdmin
                                      ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/40"
                                      : "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/30"
                                  }`}
                                >
                                  {reply.isAdmin ? (
                                    <Crown size={14} />
                                  ) : (
                                    (reply.userName || "A")
                                      .charAt(0)
                                      .toUpperCase()
                                  )}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="font-['Inter'] font-bold text-white text-xs">
                                    {reply.userName || "Anonymous"}
                                  </span>

                                  {reply.isAdmin && (
                                    <span className="inline-flex items-center gap-1 text-[9px] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full font-['Inter'] font-bold uppercase tracking-wide shadow-md shadow-amber-500/30">
                                      <Crown size={8} />
                                      Team
                                    </span>
                                  )}

                                  {reply.userEmail && !reply.isAdmin && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-['Inter'] text-sky-200/60">
                                      <Mail size={9} />
                                      {reply.userEmail}
                                    </span>
                                  )}

                                  <span className="text-[10px] font-['Inter'] text-sky-200/50">
                                    {formatTime(reply.createdAt)}
                                  </span>
                                </div>

                                <div
                                  className={`inline-block rounded-2xl rounded-tl-sm px-4 py-2.5 backdrop-blur-sm border ${
                                    reply.isAdmin
                                      ? "bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-amber-400/30"
                                      : "bg-white/[0.06] border-white/10"
                                  }`}
                                >
                                  <p className="text-sky-50 font-['Inter'] text-sm leading-relaxed whitespace-pre-wrap">
                                    {reply.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* REPLY INPUT */}
                    {isLoggedIn && replyingTo === doubt._id && (
                      <div className="mt-4 ml-4 sm:ml-14 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg shadow-emerald-500/40">
                          {(user?.name || "U").charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your reply..."
                            className="flex-1 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-white placeholder-white/40 font-['Inter'] text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20"
                            autoFocus
                          />
                          <button
                            onClick={() => handlePostReply(doubt._id)}
                            disabled={submittingReply}
                            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 to-purple-500 text-white font-['Inter'] font-semibold text-sm shadow-lg shadow-sky-500/40 hover:scale-105 transition-all disabled:opacity-50"
                          >
                            {submittingReply ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Send size={14} />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                            className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white/70 font-['Inter'] font-semibold text-sm hover:bg-white/15 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"></div>
                </div>
              );
            })}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
    </section>
  );
};

export default DoubtSection;