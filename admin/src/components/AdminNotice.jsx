

import React, { useState, useEffect, useRef } from "react";

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

} from "lucide-react";

/* =========================================================

   API HELPERS

========================================================= */

const ADMIN_API_BASE = (

  import.meta.env.VITE_API_URL || "https://api.pharmaverse.co.in"

).replace(/\/$/, "");

const ADMIN_NOTICES_API = `${ADMIN_API_BASE}/api/admin/notices`;

const getAdminToken = () =>

  localStorage.getItem("adminToken") ||

  localStorage.getItem("token") ||

  localStorage.getItem("admin_token");

const adminHeaders = () => {

  const token = getAdminToken();

  if (!token) throw new Error("Admin login token nahi mila. Dobara admin login karein.");

  return { headers: { Authorization: `Bearer ${token}` } };

};

const normalizeNotice = (notice) => ({

  ...notice,

  id: notice?._id || notice?.id,

  message: notice?.description ?? notice?.message ?? "",

  priority: notice?.type === "danger" ? "urgent" : notice?.type === "warning" ? "important" : "normal",

  target: notice?.target || "all",

  readBy: Array.isArray(notice?.readBy) ? notice.readBy : [],

  createdAt: notice?.createdAt || new Date().toISOString(),

  updatedAt: notice?.updatedAt || notice?.createdAt || new Date().toISOString(),

});

const getNoticeRows = (data) => {

  if (Array.isArray(data?.notices)) return data.notices;

  if (Array.isArray(data?.data)) return data.data;

  if (Array.isArray(data?.data?.notices)) return data.data.notices;

  return [];

};

const toApiPayload = (form) => ({

  title: form.title.trim(),

  description: form.message.trim(),

  type: form.priority === "urgent" ? "danger" : form.priority === "important" ? "warning" : "info",

  isActive: true,

});

/* =========================================================

   CONSTANTS

========================================================= */

const EMPTY_FORM = {

  title: "",

  message: "",

  priority: "normal",

  target: "all",

};

const PRIORITY_OPTIONS = [

  { value: "normal", label: "Normal", color: "bg-[#18c1b7]/10 text-[#0e8b83] border-[#18c1b7]" },

  { value: "important", label: "Important", color: "bg-amber-50 text-amber-700 border-amber-500" },

  { value: "urgent", label: "Urgent", color: "bg-red-50 text-red-700 border-red-500" },

];

const TARGET_OPTIONS = [

  { value: "all", label: "All Students" },

  { value: "bpharm", label: "B.Pharm" },

  { value: "dpharm", label: "D.Pharm" },

  { value: "mpharm", label: "M.Pharm" },

  { value: "pharmd", label: "Pharm.D" },

  { value: "phd", label: "PhD" },

];

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

/* =========================================================

   HELPERS

========================================================= */

const timeAgo = (iso) => {

  const diff = Date.now() - new Date(iso).getTime();

  const m = Math.floor(diff / 60000);

  if (m < 1) return "just now";

  if (m < 60) return `${m}m ago`;

  const h = Math.floor(m / 60);

  if (h < 24) return `${h}h ago`;

  const d = Math.floor(h / 24);

  if (d < 30) return `${d}d ago`;

  return new Date(iso).toLocaleDateString();

};

/* =========================================================

   MAIN COMPONENT

========================================================= */

const AdminNotice = () => {

  /* ---------- STATE ---------- */

  const [notices, setNotices] = useState([]);

  const [form, setForm] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState(null);

  const [showFormModal, setShowFormModal] = useState(false);

  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [formError, setFormError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [filterPriority, setFilterPriority] = useState("all");

  const [filterTarget, setFilterTarget] = useState("all");

  const [toast, setToast] = useState(null);

  const toastTimerRef = useRef(null);

  /* ---------- LOAD FROM BACKEND ---------- */

  const fetchNotices = async () => {

    try {

      const response = await axios.get(ADMIN_NOTICES_API, adminHeaders());

      setNotices(getNoticeRows(response.data).map(normalizeNotice));

    } catch (error) {

      console.error("Failed to load notices:", error);

      showToast(error.response?.data?.message || error.message || "Notices load nahi ho sake.", "danger");

    }

  };

  useEffect(() => {

    fetchNotices();

    return () => {

      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    };

  }, []);

  /* ---------- AUTO CLEAR TOAST ---------- */

  useEffect(() => {

    if (!toast) return;

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    toastTimerRef.current = setTimeout(() => setToast(null), 2500);

    return () => {

      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    };

  }, [toast]);

  const showToast = (message, type = "success") => {

    setToast({ message, type });

  };

  /* ---------- CRUD ---------- */

  const handleOpenCreate = () => {

    setForm(EMPTY_FORM);

    setEditingId(null);

    setFormError("");

    setShowFormModal(true);

  };

  const handleOpenEdit = (notice) => {

    setForm({

      title: notice.title,

      message: notice.message,

      priority: notice.priority,

      target: notice.target,

    });

    setEditingId(notice.id);

    setFormError("");

    setShowFormModal(true);

  };

  const handleCloseForm = () => {

    setShowFormModal(false);

    setForm(EMPTY_FORM);

    setEditingId(null);

    setFormError("");

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Read the submitted fields directly; names are set on both controls.
    const submittedForm = e.currentTarget;
    const formData = new FormData(submittedForm);
    const title = String(formData.get("title") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!title || !message) {
      const validationMessage = "Title and message are required";
      setFormError(validationMessage);
      showToast(validationMessage, "danger");
      return;
    }

    const payload = {
      title,
      description: message,
      type:
        form.priority === "urgent"
          ? "danger"
          : form.priority === "important"
            ? "warning"
            : "info",
      isActive: true,
    };

    try {
      setFormError("");

      if (editingId) {
        await axios.put(
          `${ADMIN_NOTICES_API}/${editingId}`,
          payload,
          adminHeaders()
        );
        showToast("Notice updated successfully");
      } else {
        await axios.post(ADMIN_NOTICES_API, payload, adminHeaders());
        showToast("Notice created successfully");
      }

      await fetchNotices();
      handleCloseForm();
    } catch (error) {
      console.error("Failed to save notice:", error);
      console.error("NOTICE API ERROR:", error.response?.data);
      console.error("NOTICE STATUS:", error.response?.status);
      console.error("NOTICE PAYLOAD:", payload);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (typeof error.response?.data === "string" ? error.response.data : null) ||
        error.message ||
        "Notice save nahi hua. Backend/API aur admin login check karein.";

      setFormError(errorMessage);
      showToast(errorMessage, "danger");
    }
  };

  const handleDelete = async (id) => {

    try {

      await axios.delete(`${ADMIN_NOTICES_API}/${id}`, adminHeaders());

      setNotices((current) => current.filter((n) => n.id !== id));

      setConfirmDeleteId(null);

      showToast("Notice deleted", "danger");

    } catch (error) {

      console.error("Failed to delete notice:", error);

      setConfirmDeleteId(null);

      showToast(

        error.response?.data?.message || error.message || "Notice delete nahi hua",

        "danger"

      );

    }

  };

  /* ---------- FILTERS ---------- */

  const filteredNotices = notices.filter((n) => {

    const q = searchQuery.trim().toLowerCase();

    const matchSearch =

      !q ||

      n.title.toLowerCase().includes(q) ||

      n.message.toLowerCase().includes(q);

    const matchPriority =

      filterPriority === "all" || n.priority === filterPriority;

    const matchTarget =

      filterTarget === "all" || n.target === filterTarget;

    return matchSearch && matchPriority && matchTarget;

  });

  /* ---------- STATS ---------- */

  const total = notices.length;

  const urgent = notices.filter((n) => n.priority === "urgent").length;

  const important = notices.filter((n) => n.priority === "important").length;

  /* ---------- RENDER ---------- */

  return (

    <div className="min-h-screen bg-gray-50 pt-24 pb-10 px-3 sm:px-6">

      <div className="max-w-6xl mx-auto">

        {/* ============ HEADER ============ */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">

              <Bell className="text-[#18c1b7]" /> Manage Notices

            </h1>

            <p className="text-sm text-gray-500 mt-1">

              Create, edit, delete and send notices to students

            </p>

          </div>

          <div className="flex items-center gap-2">

            <button

              onClick={() => setShowPreviewModal(true)}

              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white border border-gray-200 hover:border-[#18c1b7] text-gray-700 rounded-xl font-medium text-sm shadow-sm"

            >

              <Eye size={16} /> Preview

            </button>

            <button

              onClick={handleOpenCreate}

              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-[#18c1b7] hover:bg-[#0fa39a] text-white rounded-xl font-medium text-sm shadow-md"

            >

              <Plus size={18} /> New Notice

            </button>

          </div>

        </div>

        {/* ============ STATS ============ */}

        <div className="grid grid-cols-3 gap-3 mb-6">

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-[#18c1b7]">

            <p className="text-xs text-gray-500 font-medium">Total Notices</p>

            <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{total}</p>

          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-amber-500">

            <p className="text-xs text-gray-500 font-medium">Important</p>

            <p className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">{important}</p>

          </div>

          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 border-l-4 border-red-500">

            <p className="text-xs text-gray-500 font-medium">Urgent</p>

            <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">{urgent}</p>

          </div>

        </div>

        {/* ============ FILTERS ============ */}

        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-5 flex flex-col sm:flex-row gap-3">

          <div className="flex-1 relative">

            <Search

              size={16}

              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"

            />

            <input

              type="text"

              placeholder="Search notices..."

              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

              className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[#18c1b7] text-sm"

            />

          </div>

          <select

            value={filterPriority}

            onChange={(e) => setFilterPriority(e.target.value)}

            className="border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#18c1b7] text-sm"

          >

            <option value="all">All Priority</option>

            <option value="normal">Normal</option>

            <option value="important">Important</option>

            <option value="urgent">Urgent</option>

          </select>

          <select

            value={filterTarget}

            onChange={(e) => setFilterTarget(e.target.value)}

            className="border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#18c1b7] text-sm"

          >

            <option value="all">All Courses</option>

            {TARGET_OPTIONS.map((t) => (

              <option key={t.value} value={t.value}>

                {t.label}

              </option>

            ))}

          </select>

        </div>

        {/* ============ LIST ============ */}

        {filteredNotices.length === 0 ? (

          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">

            <Bell size={48} className="mx-auto text-gray-300 mb-3" />

            <p className="text-gray-500">

              {notices.length === 0

                ? "No notices created yet"

                : "No notices match your filters"}

            </p>

            <p className="text-gray-400 text-sm mt-1">

              {notices.length === 0

                ? 'Click "New Notice" to add one'

                : "Try changing the filters"}

            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {filteredNotices.map((n) => {

              const readCount = n.readBy?.length || 0;

              return (

                <div

                  key={n.id}

                  className={`bg-white rounded-xl shadow-sm p-4 sm:p-5 border-l-4 ${PRIORITY_BORDER[n.priority] || "border-gray-300"} hover:shadow-md transition`}

                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex-1 min-w-0">

                      <div className="flex flex-wrap items-center gap-2 mb-1">

                        <h3 className="font-semibold text-gray-800">

                          {n.title}

                        </h3>

                        <span

                          className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase ${PRIORITY_BADGE[n.priority]}`}

                        >

                          {n.priority}

                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium uppercase">

                          {n.target === "all"

                            ? "All"

                            : n.target}

                        </span>

                      </div>

                      <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">

                        {n.message}

                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-gray-400">

                        <span>Created {timeAgo(n.createdAt)}</span>

                        {n.updatedAt !== n.createdAt && (

                          <>

                            <span>•</span>

                            <span>Edited {timeAgo(n.updatedAt)}</span>

                          </>

                        )}

                        <span>•</span>

                        <span className="flex items-center gap-1">

                          <CheckCheck size={12} />

                          {readCount} read

                        </span>

                      </div>

                    </div>

                    <div className="flex items-center gap-1 shrink-0">

                      <button

                        onClick={() => handleOpenEdit(n)}

                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"

                        title="Edit"

                      >

                        <Pencil size={16} />

                      </button>

                      <button

                        onClick={() => setConfirmDeleteId(n.id)}

                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"

                        title="Delete"

                      >

                        <Trash2 size={16} />

                      </button>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>

      {/* =====================================================

          CREATE / EDIT MODAL

      ====================================================== */}

      {showFormModal && (

        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4">

          <div

            className="absolute inset-0 bg-black/60 backdrop-blur-sm"

            onClick={handleCloseForm}

          />

          <form

            onSubmit={handleSubmit}

            className="relative bg-white rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"

          >

            <div className="flex items-center justify-between mb-4">

              <h3 className="text-lg font-bold text-gray-800">

                {editingId ? "Edit Notice" : "Create New Notice"}

              </h3>

              <button

                type="button"

                onClick={handleCloseForm}

                className="text-gray-400 hover:text-gray-600"

              >

                <X size={20} />

              </button>

            </div>

            {formError && (

              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">

                <AlertCircle size={16} /> {formError}

              </div>

            )}

            {/* Title */}

            <label className="block text-sm font-medium text-gray-700 mb-1">

              Title <span className="text-red-500">*</span>

            </label>

            <input
              name="title"
              type="text"
              value={form.title}

              onChange={(e) =>

                setForm({ ...form, title: e.target.value })

              }

              placeholder="e.g., New Notes Uploaded"

              maxLength={120}

              className="w-full border border-gray-300 rounded-xl px-3 py-2 mb-3 focus:outline-none focus:border-[#18c1b7] text-sm"

            />

            {/* Message */}

            <label className="block text-sm font-medium text-gray-700 mb-1">

              Message <span className="text-red-500">*</span>

            </label>

            <textarea
              name="message"
              value={form.message}

              onChange={(e) =>

                setForm({ ...form, message: e.target.value })

              }

              placeholder="Write the notice details..."

              rows={5}

              maxLength={1000}

              className="w-full border border-gray-300 rounded-xl px-3 py-2 mb-1 focus:outline-none focus:border-[#18c1b7] text-sm resize-none"

            />

            <p className="text-[11px] text-gray-400 text-right mb-3">

              {form.message.length}/1000

            </p>

            {/* Priority + Target */}

            <div className="grid grid-cols-2 gap-3 mb-4">

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">

                  Priority

                </label>

                <select

                  value={form.priority}

                  onChange={(e) =>

                    setForm({ ...form, priority: e.target.value })

                  }

                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#18c1b7] text-sm"

                >

                  {PRIORITY_OPTIONS.map((p) => (

                    <option key={p.value} value={p.value}>

                      {p.label}

                    </option>

                  ))}

                </select>

              </div>

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">

                  Send To

                </label>

                <select

                  value={form.target}

                  onChange={(e) =>

                    setForm({ ...form, target: e.target.value })

                  }

                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#18c1b7] text-sm"

                >

                  {TARGET_OPTIONS.map((t) => (

                    <option key={t.value} value={t.value}>

                      {t.label}

                    </option>

                  ))}

                </select>

              </div>

            </div>

            {/* Actions */}

            <div className="flex gap-3">

              <button

                type="button"

                onClick={handleCloseForm}

                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm"

              >

                Cancel

              </button>

              <button

                type="submit"

                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#18c1b7] hover:bg-[#0fa39a] text-white rounded-xl text-sm font-medium"

              >

                <Save size={16} />

                {editingId ? "Update Notice" : "Send Notice"}

              </button>

            </div>

          </form>

        </div>

      )}

      {/* =====================================================

          PREVIEW MODAL (Student's View Simulation)

      ====================================================== */}

      {showPreviewModal && (

        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4">

          <div

            className="absolute inset-0 bg-black/60 backdrop-blur-sm"

            onClick={() => setShowPreviewModal(false)}

          />

          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#f8fdfc]">

              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">

                <Eye size={16} className="text-[#18c1b7]" /> Student's Bell Preview

              </h3>

              <button

                onClick={() => setShowPreviewModal(false)}

                className="text-gray-400 hover:text-gray-600"

              >

                <X size={18} />

              </button>

            </div>

            <div className="max-h-[70vh] overflow-y-auto">

              {notices.length === 0 ? (

                <div className="py-10 text-center">

                  <Bell size={32} className="mx-auto text-gray-300 mb-2" />

                  <p className="text-gray-400 text-sm">

                    No notices to preview

                  </p>

                </div>

              ) : (

                notices.slice(0, 6).map((n) => (

                  <div

                    key={n.id}

                    className={`px-4 py-3 border-b border-gray-50 last:border-0 border-l-4 ${PRIORITY_BORDER[n.priority]}`}

                  >

                    <p className="text-sm font-semibold text-gray-800">

                      {n.title}

                    </p>

                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">

                      {n.message}

                    </p>

                    <div className="flex items-center gap-2 mt-1.5">

                      <span className="text-[10px] text-gray-400">

                        {timeAgo(n.createdAt)}

                      </span>

                      <span className="text-[10px] text-gray-400">•</span>

                      <span className="text-[10px] text-[#18c1b7] font-medium uppercase">

                        {n.target === "all" ? "All" : n.target}

                      </span>

                    </div>

                  </div>

                ))

              )}

            </div>

            <div className="border-t border-gray-100 px-4 py-2 bg-[#f8fdfc]">

              <p className="text-[11px] text-gray-500 text-center">

                This is how it appears on the student's bell icon

              </p>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================

          DELETE CONFIRM MODAL

      ====================================================== */}

      {confirmDeleteId && (

        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">

          <div

            className="absolute inset-0 bg-black/70 backdrop-blur-sm"

            onClick={() => setConfirmDeleteId(null)}

          />

          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">

            <div className="flex items-center gap-3 mb-3">

              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">

                <Trash2 size={20} className="text-red-600" />

              </div>

              <h3 className="text-lg font-bold text-gray-800">

                Delete Notice?

              </h3>

            </div>

            <p className="text-gray-600 text-sm mb-5">

              This action cannot be undone. The notice will be removed from

              all students' bells.

            </p>

            <div className="flex gap-3">

              <button

                onClick={() => setConfirmDeleteId(null)}

                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm"

              >

                Cancel

              </button>

              <button

                onClick={() => handleDelete(confirmDeleteId)}

                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium"

              >

                Yes, Delete

              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================

          TOAST

      ====================================================== */}

      {toast && (

        <div

          className={`fixed bottom-6 right-6 z-[400] px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-medium flex items-center gap-2 transition-all ${

            toast.type === "danger" ? "bg-red-600" : "bg-[#18c1b7]"

          }`}

        >

          {toast.type === "danger" ? (

            <Trash2 size={16} />

          ) : (

            <CheckCheck size={16} />

          )}

          {toast.message}

        </div>

      )}

    </div>

  );

};

export default AdminNotice;

