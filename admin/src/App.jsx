import { useState, useEffect } from "react";
import axios from "axios";
import './index.css'   


const API_URL = "/api/admin";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [stats, setStats] = useState({ totalNotes: 0, totalVideos: 0, totalUsers: 0 });
  const [notes, setNotes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "note" or "video"
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "", course: "B.Pharm", semester: "1", pdfUrl: "",
    videoUrl: "", thumbnail: "", duration: "", channel: "Pharma Learning", description: ""
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) setIsLoggedIn(true);
  }, []);

  if (!isLoggedIn) {
    return <Login onLogin={setIsLoggedIn} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">PharmaVerse</h1>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>
        <nav className="mt-6">
          <button onClick={() => setCurrentPage("dashboard")} className={`w-full flex items-center gap-3 px-6 py-3 transition ${currentPage === "dashboard" ? "bg-purple-600" : "hover:bg-gray-700"}`}>
            <span>📊</span> Dashboard
          </button>
          <button onClick={() => { setCurrentPage("notes"); fetchNotes(); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${currentPage === "notes" ? "bg-purple-600" : "hover:bg-gray-700"}`}>
            <span>📄</span> Manage Notes
          </button>
          <button onClick={() => { setCurrentPage("videos"); fetchVideos(); }} className={`w-full flex items-center gap-3 px-6 py-3 transition ${currentPage === "videos" ? "bg-purple-600" : "hover:bg-gray-700"}`}>
            <span>🎬</span> Manage Videos
          </button>
          <button onClick={() => { localStorage.removeItem("adminToken"); setIsLoggedIn(false); }} className="w-full flex items-center gap-3 px-6 py-3 mt-10 hover:bg-gray-700 transition">
            <span>🚪</span> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {currentPage === "dashboard" && <Dashboard stats={stats} setStats={setStats} />}
        {currentPage === "notes" && (
          <NotesManager 
            notes={notes} setNotes={setNotes}
            showModal={showModal} setShowModal={setShowModal}
            modalType={modalType} setModalType={setModalType}
            editingItem={editingItem} setEditingItem={setEditingItem}
            formData={formData} setFormData={setFormData}
          />
        )}
        {currentPage === "videos" && (
          <VideosManager 
            videos={videos} setVideos={setVideos}
            showModal={showModal} setShowModal={setShowModal}
            modalType={modalType} setModalType={setModalType}
            editingItem={editingItem} setEditingItem={setEditingItem}
            formData={formData} setFormData={setFormData}
            thumbnailPreview={thumbnailPreview} setThumbnailPreview={setThumbnailPreview}
          />
        )}
      </div>
    </div>
  );
}

// Login Component
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        onLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-gray-500 mt-2">Login to manage content</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:scale-[1.02] transition disabled:opacity-50">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Demo: admin@pharmaverse.com / Admin@123</p>
        </div>
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ stats, setStats }) {
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(`${API_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } });
        setStats(res.data);
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div><p className="text-gray-500 text-sm">Total Notes</p><p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalNotes}</p></div>
            <div className="bg-blue-100 p-3 rounded-full"><span className="text-blue-600 text-xl">📄</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div><p className="text-gray-500 text-sm">Total Videos</p><p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalVideos}</p></div>
            <div className="bg-green-100 p-3 rounded-full"><span className="text-green-600 text-xl">🎬</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div><p className="text-gray-500 text-sm">Total Users</p><p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p></div>
            <div className="bg-purple-100 p-3 rounded-full"><span className="text-purple-600 text-xl">👥</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notes Manager
function NotesManager({ notes, setNotes, showModal, setShowModal, modalType, setModalType, editingItem, setEditingItem, formData, setFormData }) {
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_URL}/notes`, { headers: { Authorization: `Bearer ${token}` } });
      setNotes(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.delete(`${API_URL}/notes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchNotes();
      } catch (e) { console.error(e); }
    }
  };

  const handleEdit = (note) => {
    setEditingItem(note);
    setFormData(note);
    setModalType("note");
    setShowModal(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Notes</h1>
        <button onClick={() => { setEditingItem(null); setFormData({ title: "", course: "B.Pharm", semester: "1", pdfUrl: "", description: "" }); setModalType("note"); setShowModal(true); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2">
          <span>➕</span> Add New Note
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {notes.map((note) => (
              <tr key={note._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{note.title}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{note.course}</span></td>
                <td className="px-6 py-4">Semester {note.semester}</td>
                <td className="px-6 py-4 flex gap-3">
                  <button onClick={() => handleEdit(note)} className="text-blue-600 hover:text-blue-800"><span>✏️</span></button>
                  <button onClick={() => handleDelete(note._id)} className="text-red-600 hover:text-red-800"><span>🗑️</span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && modalType === "note" && (
        <NoteModal onClose={() => { setShowModal(false); setEditingItem(null); }} fetchNotes={() => { fetchNotes(); }} editingItem={editingItem} formData={formData} setFormData={setFormData} />
      )}
    </div>
  );
}

// Note Modal
function NoteModal({ onClose, fetchNotes, editingItem, formData, setFormData }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      if (editingItem) {
        await axios.put(`${API_URL}/notes/${editingItem._id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_URL}/notes`, formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchNotes();
      onClose();
    } catch (e) { console.error(e); alert("Error saving note"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">{editingItem ? "Edit Note" : "Add New Note"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
          <select value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>B.Pharm</option><option>D.Pharm</option><option>M.Pharm</option><option>PharmD</option><option>PhD</option>
          </select>
          <input type="text" placeholder="Semester/Year" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
          <input type="url" placeholder="PDF URL" value={formData.pdfUrl} onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
          <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" rows="3" />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">{editingItem ? "Update" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Videos Manager
function VideosManager({ videos, setVideos, showModal, setShowModal, modalType, setModalType, editingItem, setEditingItem, formData, setFormData, thumbnailPreview, setThumbnailPreview }) {
  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_URL}/videos`, { headers: { Authorization: `Bearer ${token}` } });
      setVideos(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this video?")) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.delete(`${API_URL}/videos/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchVideos();
      } catch (e) { console.error(e); }
    }
  };

  const handleEdit = (video) => {
    setEditingItem(video);
    setFormData(video);
    setThumbnailPreview(video.thumbnail);
    setModalType("video");
    setShowModal(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Videos</h1>
        <button onClick={() => { setEditingItem(null); setFormData({ title: "", course: "B.Pharm", semester: "1", videoUrl: "", thumbnail: "", duration: "", channel: "Pharma Learning", description: "" }); setThumbnailPreview(null); setModalType("video"); setShowModal(true); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2">
          <span>➕</span> Add New Video
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thumbnail</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {videos.map((video) => (
              <tr key={video._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {video.thumbnail ? <img src={video.thumbnail} alt={video.title} className="w-16 h-12 object-cover rounded" /> : <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center"><span>🎬</span></div>}
                </td>
                <td className="px-6 py-4 font-medium">{video.title}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{video.course}</span></td>
                <td className="px-6 py-4">{video.duration}</td>
                <td className="px-6 py-4 flex gap-3">
                  <button onClick={() => handleEdit(video)} className="text-blue-600 hover:text-blue-800"><span>✏️</span></button>
                  <button onClick={() => handleDelete(video._id)} className="text-red-600 hover:text-red-800"><span>🗑️</span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && modalType === "video" && (
        <VideoModal onClose={() => { setShowModal(false); setEditingItem(null); }} fetchVideos={() => { fetchVideos(); }} editingItem={editingItem} formData={formData} setFormData={setFormData} thumbnailPreview={thumbnailPreview} setThumbnailPreview={setThumbnailPreview} />
      )}
    </div>
  );
}

// Video Modal
function VideoModal({ onClose, fetchVideos, editingItem, formData, setFormData, thumbnailPreview, setThumbnailPreview }) {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) { alert("Please upload an image file"); return; }
      if (file.size > 5 * 1024 * 1024) { alert("Image size should be less than 5MB"); return; }
      const reader = new FileReader();
      reader.onloadend = () => { setThumbnailPreview(reader.result); setFormData({ ...formData, thumbnail: reader.result }); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      if (editingItem) {
        await axios.put(`${API_URL}/videos/${editingItem._id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_URL}/videos`, formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchVideos();
      onClose();
    } catch (e) { console.error(e); alert("Error saving video"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 my-8">
        <h2 className="text-2xl font-bold mb-4">{editingItem ? "Edit Video" : "Add New Video"}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full" />
            {thumbnailPreview && <img src={thumbnailPreview} alt="Preview" className="mt-2 w-32 h-24 object-cover rounded shadow" />}
          </div>
          <input type="text" placeholder="Video Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
          <select value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option>B.Pharm</option><option>D.Pharm</option><option>M.Pharm</option><option>PharmD</option><option>PhD</option>
          </select>
          <input type="text" placeholder="Semester/Year" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
          <input type="url" placeholder="YouTube Video URL" value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
          <input type="text" placeholder="Duration (e.g., 25:30)" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
          <input type="text" placeholder="Channel Name" value={formData.channel} onChange={(e) => setFormData({ ...formData, channel: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" rows="3" />
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">{editingItem ? "Update" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;