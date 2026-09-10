import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  MessageSquare,
  Trash2,
  Loader2,
  Send,
  Mail,
  Clock,
  Crown,
  Shield,
  RefreshCw,
  Sparkles,
  User,
  MessageCircle,
  CheckCheck,
  Lock,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.pharmaverse.co.in";

const AdminDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [replying, setReplying] = useState(null);

  const token = localStorage.getItem("adminToken");

  /* FETCH */
  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/doubts`);
      setDoubts(Array.isArray(res?.data?.doubts) ? res.data.doubts : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load doubts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  /* DELETE DOUBT */
  const handleDeleteDoubt = async (doubtId) => {
    if (!window.confirm("Delete this doubt and all replies?")) return;
    try {
      await axios.delete(`${API_BASE}/api/doubts/${doubtId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Doubt deleted");
      fetchDoubts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  /* DELETE REPLY */
  const handleDeleteReply = async (doubtId, replyId) => {
    if (!window.confirm("Delete this reply?")) return;
    try {
      await axios.delete(`${API_BASE}/api/doubts/${doubtId}/reply/${replyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Reply deleted");
      fetchDoubts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete reply");
    }
  };

  /* ADMIN REPLY */
  const handleAdminReply = async (doubtId) => {
    const msg = (replyText[doubtId] || "").trim();
    if (!msg) {
      toast.error("Write something first");
      return;
    }

    setReplying(doubtId);
    try {
      await axios.post(
        `${API_BASE}/api/doubts/${doubtId}/admin-reply`,
        { message: msg },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Admin reply posted");
      setReplyText((prev) => ({ ...prev, [doubtId]: "" }));
      fetchDoubts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reply");
    } finally {
      setReplying(null);
    }
  };

  const formatTime = (date) => new Date(date).toLocaleString();

  return (
    <div className="relative min-h-screen p-4 sm:p-6 overflow-hidden">
      {/* ============ LUXURY BACKGROUND ============ */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a3a5c]"></div>

      {/* Glow blobs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 rounded-full bg-sky-500/20 blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-500/20 blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[150px] -z-10 pointer-events-none"></div>

      {/* Floating dots */}
      <div className="fixed top-32 right-20 w-2 h-2 rounded-full bg-sky-400/60 animate-pulse -z-10"></div>
      <div
        className="fixed bottom-40 left-32 w-2.5 h-2.5 rounded-full bg-purple-400/50 animate-pulse -z-10"
        style={{ animationDelay: "1s" }}
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

      {/* ============ LUXURY HEADER ============ */}
      <div className="mb-8">
        <div className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_80px_-20px_rgba(14,165,233,0.4)] overflow-hidden">
          {/* Top shine */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/80 to-transparent"></div>

          {/* Corner glows */}
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-sky-400/20 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-purple-400/20 blur-3xl"></div>

          <div className="relative z-10 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Crown icon */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-purple-500 flex items-center justify-center shadow-lg shadow-sky-500/50">
                    <MessageSquare className="text-white" size={26} />
                  </div>
                  {/* Small crown badge */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/50 border-2 border-[#0f2847]">
                    <Crown size={11} className="text-white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl sm:text-3xl font-['Space_Grotesk'] font-extrabold text-white">
                      Doubts Lounge
                    </h2>
                    <Sparkles size={18} className="text-amber-300 animate-pulse" />
                  </div>
                  <p className="text-xs sm:text-sm font-['Inter'] text-sky-200/70">
                    Premium student support dashboard
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Stats badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500/20 to-purple-500/20 backdrop-blur-md border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-sm font-['Inter'] font-bold text-white">
                    {doubts.length}
                  </span>
                  <span className="text-xs font-['Inter'] text-sky-200/70">
                    {doubts.length === 1 ? "doubt" : "doubts"}
                  </span>
                </div>

                {/* Refresh button */}
                <button
                  onClick={fetchDoubts}
                  className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 text-white font-['Inter'] font-bold text-sm shadow-[0_10px_40px_-10px_rgba(56,189,248,0.8)] hover:shadow-[0_15px_50px_-10px_rgba(56,189,248,1)] transition-all duration-300 hover:scale-[1.03] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <RefreshCw size={14} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Bottom shine */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent"></div>
        </div>
      </div>

      {/* ============ CONTENT ============ */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500/20 to-purple-500/20 backdrop-blur-md border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-[0_20px_60px_-20px_rgba(14,165,233,0.6)]">
            <Loader2 size={40} className="text-sky-400 animate-spin" />
          </div>
          <p className="font-['Inter'] text-sky-200/70 text-sm">
            Loading premium doubts...
          </p>
        </div>
      ) : doubts.length === 0 ? (
        <div className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_80px_-20px_rgba(14,165,233,0.4)] overflow-hidden text-center py-20">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/80 to-transparent"></div>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400/20 to-purple-500/20 backdrop-blur-md border border-white/10 flex items-center justify-center mx-auto mb-5 shadow-lg">
            <MessageSquare size={40} className="text-sky-300" />
          </div>
          <h3 className="text-2xl font-['Space_Grotesk'] font-bold text-white mb-2">
            No Doubts Yet
          </h3>
          <p className="font-['Inter'] text-sky-200/60 text-sm max-w-md mx-auto">
            Students haven't asked anything yet. Premium lounge is empty.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {doubts.map((doubt) => (
            <div
              key={doubt._id}
              className="group relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden hover:border-sky-400/30 hover:bg-white/[0.07] transition-all duration-500 shadow-[0_20px_60px_-20px_rgba(14,165,233,0.2)]"
            >
              {/* Top shine */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent"></div>

              {/* Left vertical gold accent */}
              <div className="absolute left-0 top-6 bottom-6 w-0.5 bg-gradient-to-b from-transparent via-amber-400/60 to-transparent"></div>

              <div className="p-6 sm:p-7 pl-7 sm:pl-8">
                {/* ========== DOUBT HEADER ========== */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Avatar with online dot */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-purple-500 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-sky-500/40">
                        {(doubt.userName || "A").charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0f2847] animate-pulse"></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name row */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-['Inter'] font-bold text-white text-[15px]">
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

                      {/* Question bubble */}
                      <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] border border-white/10 px-4 py-3 backdrop-blur-sm">
                        <p className="text-sky-50 font-['Inter'] text-[15px] leading-relaxed whitespace-pre-wrap">
                          {doubt.question}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteDoubt(doubt._id)}
                    className="group/del relative p-2.5 rounded-2xl bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 hover:border-red-400/40 hover:text-red-200 transition-all shrink-0"
                    title="Delete doubt"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* ========== REPLIES ========== */}
                {doubt.replies && doubt.replies.length > 0 && (
                  <div className="ml-4 sm:ml-16 pl-5 border-l-2 border-sky-400/20 space-y-3 mt-4">
                    {doubt.replies.map((reply) => (
                      <div
                        key={reply._id}
                        className={`flex items-start justify-between gap-3 rounded-2xl p-3.5 backdrop-blur-sm ${
                          reply.isAdmin
                            ? "bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-400/30 shadow-lg shadow-amber-500/10"
                            : "bg-white/[0.04] border border-white/10"
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Reply avatar */}
                          <div className="relative shrink-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                                reply.isAdmin
                                  ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/50"
                                  : "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/40"
                              }`}
                            >
                              {reply.isAdmin ? (
                                <Crown size={14} />
                              ) : (
                                (reply.userName || "A").charAt(0).toUpperCase()
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

                            <p className="text-sky-50/90 font-['Inter'] text-sm leading-relaxed whitespace-pre-wrap">
                              {reply.message}
                            </p>
                          </div>
                        </div>

                        {/* Delete reply */}
                        <button
                          onClick={() => handleDeleteReply(doubt._id, reply._id)}
                          className="p-2 rounded-xl bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 hover:border-red-400/40 hover:text-red-200 transition-all shrink-0"
                          title="Delete reply"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ========== ADMIN REPLY INPUT ========== */}
                <div className="mt-5 pt-5 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown size={14} className="text-amber-300" />
                    <span className="text-[11px] font-['Inter'] font-bold text-amber-200/90 uppercase tracking-widest">
                      Reply as PharmaVerse Team
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      value={replyText[doubt._id] || ""}
                      onChange={(e) =>
                        setReplyText((prev) => ({ ...prev, [doubt._id]: e.target.value }))
                      }
                      placeholder="Write a premium reply..."
                      className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md text-white placeholder-white/40 font-['Inter'] text-sm outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/20 transition-all"
                    />
                    <button
                      onClick={() => handleAdminReply(doubt._id)}
                      disabled={replying === doubt._id}
                      className="group/send relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-white font-['Inter'] font-bold text-sm shadow-[0_10px_40px_-10px_rgba(251,146,60,0.9)] hover:shadow-[0_15px_50px_-10px_rgba(251,146,60,1)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/send:translate-x-full transition-transform duration-1000"></div>
                      {replying === doubt._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      Reply
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom shine */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDoubts;