import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Bell,
  Save,
  Search,
  Eye,
  CheckCheck,
  Image as ImageIcon,
  Link as LinkIcon,
  ExternalLink,
  Type,
  Sparkles,
  MessageSquare,
  ImagePlus,
  Layers,
} from "lucide-react";

/* ================= API ================= */
const API_BASE = (
  import.meta.env.VITE_API_URL || "https://api.pharmaverse.co.in"
).replace(/\/+$/, "");
const API = `${API_BASE}/api/admin/notices`;

/* ================= CONSTANTS ================= */
const EMPTY = {
  title: "",
  message: "",
  imageUrl: "",
  linkUrl: "",
  linkText: "Open link",
  noticeType: "text", // text, image, link, mixed
};

const PRIORITY_BORDER = {
  normal: "border-[#18c1b7]",
  important: "border-amber-500",
  urgent: "border-red-500",
};

const PRIORITY_BADGE = {
  normal: "bg-[#18c1b7]/10 text-[#0e8b83] border-[#18c1b7]",
  important: "bg-amber-50 text-amber-700 border-amber-500",
  urgent: "bg-red-50 text-red-700 border-red-500",
};

/* ================= HELPERS ================= */
const safeHttpUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol) ? u.href : "";
  } catch {
    return "";
  }
};

// Humne priority aur target normalize se hata diya hai
const normalize = (n) => ({
  ...n,
  id: n?._id || n?.id,
  message: n?.description ?? n?.message ?? "",
  priority: n?.type === "danger" ? "urgent" : n?.type === "warning" ? "important" : "normal",
  target: n?.target || "all",
  imageUrl: n?.imageUrl || "",
  linkUrl: n?.linkUrl || "",
  linkText: n?.linkText || "Open link",
  readBy: Array.isArray(n?.readBy) ? n.readBy : [],
  createdAt: n?.createdAt || new Date().toISOString(),
  updatedAt: n?.updatedAt || n?.createdAt || new Date().toISOString(),
});

const rowsFrom = (data) => {
  if (Array.isArray(data?.notices)) return data.notices;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.notices)) return data.data.notices;
  if (Array.isArray(data)) return data;
  return [];
};

/* ================= PREVIEW CARD ================= */
function NoticePreview({ notice }) {
  const link = safeHttpUrl(notice?.linkUrl);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <Bell size={17} className="text-[#18c1b7]" />
        <span className="font-semibold text-gray-800">
          {notice?.title || "Notice title"}
        </span>
      </div>
      {notice?.imageUrl && (
        <img
          src={notice.imageUrl}
          alt="Notice attachment"
          className="mb-3 max-h-64 w-full rounded-lg bg-gray-50 object-contain"
        />
      )}
      {notice?.message && (
        <p className="whitespace-pre-wrap break-words text-sm text-gray-600">
          {notice.message}
        </p>
      )}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#18c1b7] px-4 py-2 text-sm font-semibold text-white"
        >
          {notice?.linkText || "Open link"}
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */
function AdminNotice() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState("");
  const toastTimer = useRef(null);
  const mountedRef = useRef(true);

  /* ---------- AUTH ---------- */
  const token = () =>
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("admin_token");

  const headers = () => {
    const t = token();
    if (!t)
      throw new Error("Admin login token nahi mila. Dobara admin login karein.");
    return { headers: { Authorization: `Bearer ${t}` } };
  };

  /* ---------- TOAST ---------- */
  const notify = (message, kind = "success") => {
    setToast({ message, kind });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      if (mountedRef.current) setToast(null);
    }, 3000);
  };

  /* ---------- LOAD ---------- */
  const load = async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    try {
      const res = await axios.get(API, headers());
      if (mountedRef.current) setNotices(rowsFrom(res.data).map(normalize));
    } catch (err) {
      console.error("Load notices:", err, err?.response?.data);
      const msg =
        err?.response?.data?.message || err?.message || "Notices load nahi hue.";
      if (mountedRef.current && !quiet) notify(msg, "danger");
    } finally {
      if (mountedRef.current && !quiet) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- FORM OPEN/CLOSE ---------- */
  const openCreate = () => {
    setForm({ ...EMPTY });
    setImagePreview("");
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (n) => {
    let type = "text";
    if (n.imageUrl && n.linkUrl) type = "mixed";
    else if (n.imageUrl) type = "image";
    else if (n.linkUrl) type = "link";

    setForm({
      title: n.title || "",
      message: n.message || "",
      imageUrl: n.imageUrl || "",
      linkUrl: n.linkUrl || "",
      linkText: n.linkText || "Open link",
      noticeType: type,
    });
    setImagePreview(n.imageUrl || "");
    setEditingId(n.id);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY });
    setImagePreview("");
    setError("");
  };

  /* ---------- IMAGE ---------- */
  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Image 3 MB se chhoti honi chahiye.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      if (!dataUrl.startsWith("data:image/")) {
        setError("Selected file valid image nahi hai.");
        return;
      }
      setForm((c) => ({ ...c, imageUrl: dataUrl }));
      setImagePreview(dataUrl);
      setError("");
    };
    reader.onerror = () => setError("Image read nahi ho paayi. Dobara try karein.");
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setForm((c) => ({ ...c, imageUrl: "" }));
    setImagePreview("");
  };

  /* ---------- SUBMIT ---------- */
  const submit = async (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const message = form.message.trim();
    const rawLink = form.linkUrl.trim();
    const linkUrl = rawLink ? safeHttpUrl(rawLink) : "";

    if (!title) return setError("Title required hai.");
    
    if (form.noticeType === "text" && !message) return setError("Message required hai.");
    if (form.noticeType === "image" && !form.imageUrl) return setError("Image required hai.");
    if (form.noticeType === "link" && !linkUrl) return setError("Valid Link required hai.");
    if (form.noticeType === "mixed" && (!message || !form.imageUrl || !linkUrl)) {
      return setError("Mixed notice ke liye Message, Image aur Link teeno required hain.");
    }

    if (rawLink && !linkUrl)
      return setError("Link valid http:// ya https:// URL hona chahiye.");
    if (form.imageUrl && !form.imageUrl.startsWith("data:image/"))
      return setError("Image data invalid hai. Image dobara select karein.");

    // Payload mein priority aur target fix kar diya gaya hai
    const payload = {
      title,
      description: message,
      type: "info", // Default normal priority
      target: "all", // Default all students
      isActive: true,
      imageUrl: form.imageUrl || "",
      linkUrl,
      linkText: form.linkText.trim() || "Open link",
    };

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await axios.put(`${API}/${editingId}`, payload, headers());
      } else {
        await axios.post(API, payload, headers());
      }

      await load({ quiet: true });
      setShowForm(false);
      setEditingId(null);
      setForm({ ...EMPTY });
      setImagePreview("");
      notify(editingId ? "Notice updated." : "Notice published.");
    } catch (err) {
      console.error("Save notice:", err, err?.response?.data);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Notice save nahi hua.";
      setError(msg);
      notify(msg, "danger");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- DELETE ---------- */
  const removeNotice = async (id) => {
    if (!id) return;
    try {
      await axios.delete(`${API}/${id}`, headers());
      setNotices((p) => p.filter((n) => n.id !== id));
      setDeleteId(null);
      notify("Notice deleted.", "danger");
    } catch (err) {
      console.error("Delete notice:", err, err?.response?.data);
      notify(
        err?.response?.data?.message || err?.message || "Delete failed.",
        "danger"
      );
    }
  };

  /* ---------- FILTERS ---------- */
  const filtered = notices.filter((n) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (n.title || "").toLowerCase().includes(q) ||
      (n.message || "").toLowerCase().includes(q);
    return matchSearch;
  });

  const total = notices.length;

  /* ----- PREMIUM UI CLASSES ----- */
  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-gray-800 transition-all focus:bg-white focus:border-[#18c1b7] focus:outline-none focus:ring-4 focus:ring-[#18c1b7]/10 placeholder:text-gray-400";
  const labelClass = "mb-1.5 block text-sm font-semibold text-gray-700 flex items-center gap-2";

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-[#f8fafc] px-3 pb-10 pt-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              <div className="p-2 bg-[#18c1b7]/10 rounded-xl">
                <Bell className="text-[#18c1b7]" size={24} />
              </div>
              Manage Notices
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Create and send beautiful notices with images and links to students.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <Eye size={16} />
              Preview
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18c1b7] to-[#0fa39a] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#18c1b7]/30 transition hover:-translate-y-0.5"
            >
              <Plus size={18} />
              New Notice
            </button>
          </div>
        </div>

        {/* STATS - Simplified since priority is gone */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-1">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Notices</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{total}</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
            <input
              className={`${inputClass} pl-11`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notices..."
              aria-label="Search notices"
            />
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center text-gray-500 shadow-sm border border-gray-100">
            Loading notices...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center text-gray-500 shadow-sm border border-gray-100">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            No notices found.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`group relative overflow-hidden rounded-2xl border-l-4 ${
                  PRIORITY_BORDER[n.priority] || "border-gray-300"
                } bg-white p-5 shadow-sm transition hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{n.title}</h3>
                    </div>

                    {n.imageUrl && (
                      <img
                        src={n.imageUrl}
                        alt="Notice attachment"
                        className="my-4 max-h-48 rounded-xl object-contain border border-gray-100 bg-gray-50"
                      />
                    )}

                    {n.message && (
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-600">
                        {n.message}
                      </p>
                    )}

                    {safeHttpUrl(n.linkUrl) && (
                      <a
                        href={safeHttpUrl(n.linkUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                      >
                        <LinkIcon size={16} />
                        {n.linkText || "Open link"}
                        <ExternalLink size={14} />
                      </a>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-gray-400">
                      <span className="flex items-center gap-1">
                        <Sparkles size={14} className="text-[#18c1b7]" />
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <CheckCheck size={14} className="text-green-500" />
                        {n.readBy.length} read
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEdit(n)}
                      title="Edit"
                      className="rounded-xl p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(n.id)}
                      title="Delete"
                      className="rounded-xl p-2.5 text-red-600 bg-red-50 hover:bg-red-100 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============ CREATE / EDIT MODAL ============ */}
      {showForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4">
          <button
            type="button"
            aria-label="Close notice form"
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeForm}
          />
          <form
            onSubmit={submit}
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-white shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit Notice" : "Create New Notice"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Select what you want to send.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-6">
              
              {/* NOTICE TYPE SELECTOR */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  1. What do you want to send?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, noticeType: "text" })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      form.noticeType === "text" ? "border-[#18c1b7] bg-[#18c1b7]/5 text-[#0e8b83]" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <MessageSquare size={20} className="mb-1" />
                    <span className="text-xs font-semibold">Message</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, noticeType: "image" })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      form.noticeType === "image" ? "border-[#18c1b7] bg-[#18c1b7]/5 text-[#0e8b83]" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <ImagePlus size={20} className="mb-1" />
                    <span className="text-xs font-semibold">Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, noticeType: "link" })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      form.noticeType === "link" ? "border-[#18c1b7] bg-[#18c1b7]/5 text-[#0e8b83]" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <LinkIcon size={20} className="mb-1" />
                    <span className="text-xs font-semibold">Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, noticeType: "mixed" })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      form.noticeType === "mixed" ? "border-[#18c1b7] bg-[#18c1b7]/5 text-[#0e8b83]" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <Layers size={20} className="mb-1" />
                    <span className="text-xs font-semibold">Mixed</span>
                  </button>
                </div>
              </div>

              <hr className="border-gray-100" />

              {error && (
                <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-100">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* DYNAMIC FIELDS BASED ON TYPE */}
              <div className="space-y-4">
                {/* Title (Always Required) */}
                <div>
                  <label className={labelClass} htmlFor="notice-title">
                    <Type size={16} className="text-gray-400" /> Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="notice-title"
                    className={inputClass}
                    maxLength={120}
                    value={form.title}
                    onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
                    placeholder="e.g. Exam Schedule Update"
                    required
                  />
                </div>

                {/* Message Field */}
                {(form.noticeType === "text" || form.noticeType === "mixed") && (
                  <div>
                    <label className={labelClass} htmlFor="notice-message">
                      <Bell size={16} className="text-gray-400" /> Message
                    </label>
                    <textarea
                      id="notice-message"
                      className={inputClass}
                      rows={4}
                      maxLength={5000}
                      value={form.message}
                      onChange={(e) => setForm((c) => ({ ...c, message: e.target.value }))}
                      placeholder="Write your notice details here..."
                    />
                  </div>
                )}

                {/* Image Field */}
                {(form.noticeType === "image" || form.noticeType === "mixed") && (
                  <div>
                    <label className={`${labelClass} justify-between`} htmlFor="notice-image">
                      <span className="flex items-center gap-2"><ImageIcon size={16} className="text-gray-400" /> Attach Image</span>
                      <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Max 3MB</span>
                    </label>
                    
                    {!imagePreview ? (
                      <div className="mt-1 flex justify-center rounded-xl border-2 border-dashed border-gray-200 bg-slate-50 px-6 py-8 transition hover:bg-slate-100">
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-10 w-10 text-gray-300" />
                          <div className="mt-3 flex text-sm text-gray-600">
                            <label
                              htmlFor="notice-image"
                              className="relative cursor-pointer rounded-md bg-white font-semibold text-[#18c1b7] focus-within:outline-none hover:text-[#0fa39a] px-2 py-1"
                            >
                              <span>Upload a file</span>
                              <input
                                id="notice-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImage}
                                className="sr-only"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative mt-2 inline-block w-full">
                        <img
                          src={imagePreview}
                          alt="Selected notice preview"
                          className="max-h-60 w-full rounded-xl border border-gray-200 object-contain bg-slate-50"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white shadow-md hover:bg-red-600 transition"
                          title="Remove image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Link Fields */}
                {(form.noticeType === "link" || form.noticeType === "mixed") && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="notice-link">
                        <LinkIcon size={16} className="text-gray-400" /> Link URL
                      </label>
                      <input
                        id="notice-link"
                        className={inputClass}
                        type="url"
                        value={form.linkUrl}
                        onChange={(e) => setForm((c) => ({ ...c, linkUrl: e.target.value }))}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="notice-link-text">
                        Button Text
                      </label>
                      <input
                        id="notice-link-text"
                        className={inputClass}
                        maxLength={60}
                        value={form.linkText}
                        onChange={(e) => setForm((c) => ({ ...c, linkText: e.target.value }))}
                        placeholder="e.g. Click Here"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 bg-slate-50 px-6 py-4 flex gap-3 shrink-0 rounded-b-3xl">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                type="submit"
                className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#18c1b7] to-[#0fa39a] px-4 py-3 text-sm font-semibold text-white shadow-md shadow-[#18c1b7]/30 transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <Save size={18} className="mr-2" />
                {saving ? "Saving..." : editingId ? "Update Notice" : "Send Notice"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============ PREVIEW MODAL ============ */}
      {showPreview && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-3 sm:p-4">
          <button
            type="button"
            aria-label="Close preview"
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          />
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">Notification Preview</h2>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>
            {notices.length > 0 ? (
              notices.slice(0, 5).map((n) => (
                <div className="mb-4" key={n.id}>
                  <NoticePreview notice={n} />
                </div>
              ))
            ) : (
              <NoticePreview notice={form} />
            )}
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRM ============ */}
      {deleteId && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close delete dialog"
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delete this notice?</h3>
            <p className="mt-2 text-sm text-gray-500 mb-6">
              This action cannot be undone. The notice will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => removeNotice(deleteId)}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/30 transition hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ TOAST ============ */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[300] flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-medium text-white shadow-xl transition-all ${
            toast.kind === "danger" ? "bg-red-600" : "bg-gray-900"
          }`}
        >
          {toast.kind === "danger" ? <AlertCircle size={18} /> : <CheckCheck size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default AdminNotice;