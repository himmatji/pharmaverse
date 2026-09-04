import { useState, useEffect, useRef } from "react";
import { User, Search, Bell, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const AdminNavbar = ({
  notes = [],
  videos = [],
  paidPDFs = [],
  papers = [],
}) => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Lala");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ ADMIN NAME - runs only once
  useEffect(() => {
    const admin = localStorage.getItem("admin");

    if (admin) {
      try {
        const adminData = JSON.parse(admin);
        setAdminName(
          adminData.username ||
          adminData.name ||
          (adminData.email ? adminData.email.split("@")[0] : "Lala")
        );
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // ✅ SEARCH - runs only when searchTerm changes
  // ✅ FIXED: Using useMemo or ref to avoid infinite loop
  useEffect(() => {
    // If searchTerm is empty, clear results
    if (searchTerm.trim() === "") {
      setResults([]);
      return;
    }

    // Search in all data
    const allData = [...notes, ...videos, ...paidPDFs, ...papers];

    const filtered = allData.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setResults(filtered);
  }, [searchTerm]); // ✅ ONLY searchTerm as dependency

  // ✅ Click outside dropdown - runs only once
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("admin");
    navigate("/login");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-sky-100 shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img src={logo} alt="PharmaVerse Logo" className="w-28 h-28 object-contain" />
            </div>

            <div className="flex items-center gap-3 relative">
              {/* SEARCH BAR */}
              <div className="relative hidden sm:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-52 pl-9 pr-3 py-2 rounded-full border border-gray-300 bg-white shadow-sm outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                />
                {results.length > 0 && (
                  <div className="absolute top-12 left-0 w-72 bg-white shadow-2xl rounded-2xl max-h-80 overflow-y-auto z-50 border border-gray-200">
                    {results.map((item, index) => (
                      <div key={index} className="px-4 py-3 border-b hover:bg-sky-50 transition cursor-pointer">
                        <h3 className="font-semibold text-gray-800 text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-500">{item.course}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* NOTIFICATION */}
              <button className="relative text-sky-700 hover:text-sky-900 transition">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* ADMIN DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-gray-200 hover:shadow-lg transition"
                >
                  <User size={18} className="text-sky-700" />
                  <span className="text-sky-900 text-sm font-semibold capitalize hidden sm:inline">
                    {adminName}
                  </span>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-800 text-sm">{adminName}</p>
                      <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                    <button
                      onClick={() => { setShowDropdown(false); navigate("/admin/profile"); }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition text-sm flex items-center gap-2"
                    >
                      <User size={14} /> Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition text-sm flex items-center gap-2"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>

              {/* MOBILE MENU */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="sm:hidden text-sky-700 hover:text-sky-900 transition">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed top-16 left-0 right-0 bg-sky-100 border-b border-sky-200 px-4 py-3 z-40">
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-full border border-gray-300 bg-white shadow-sm outline-none focus:ring-2 focus:ring-sky-400 text-sm"
            />
          </div>
          <button onClick={() => { setMobileMenuOpen(false); navigate("/admin/profile"); }} className="w-full text-left text-sky-700 hover:text-sky-900 py-2 flex items-center gap-2">
            <User size={18} /> Profile
          </button>
          <button onClick={handleLogout} className="w-full text-left text-red-600 hover:text-red-700 py-2 flex items-center gap-2">
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}

      <div className="h-16"></div>
    </>
  );
};


export default AdminNavbar;