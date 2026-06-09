import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Search, User, ChevronDown, Menu, X, 
  LogOut, UserCircle, Trash2, ChevronRight
} from "lucide-react";
import logo from "../assets/logo.png";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

const Navbar = () => {
  const [activeBanner, setActiveBanner] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const userMenuRef = useRef(null);
  const userDropdownTimeoutRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const closeTimeoutRef = useRef(null);
  const submenuTimeoutRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Check user login status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      
      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };
    
    checkAuth();
    
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setUser(null);
    setShowUserMenu(false);
    navigate("/");
    setTimeout(() => window.location.reload(), 100);
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password");
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password: deletePassword }
      });

      if (response.data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
        setShowDeleteModal(false);
        setDeletePassword("");
        setIsLoggedIn(false);
        setUser(null);
        navigate("/");
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  // User dropdown handlers
  const handleUserMouseEnter = () => {
    if (userDropdownTimeoutRef.current) clearTimeout(userDropdownTimeoutRef.current);
    setShowUserMenu(true);
  };

  const handleUserMouseLeave = () => {
    userDropdownTimeoutRef.current = setTimeout(() => {
      setShowUserMenu(false);
    }, 300);
  };

  const handleDropdownMouseEnter = () => {
    if (userDropdownTimeoutRef.current) clearTimeout(userDropdownTimeoutRef.current);
    setShowUserMenu(true);
  };

  const handleDropdownMouseLeave = () => {
    userDropdownTimeoutRef.current = setTimeout(() => {
      setShowUserMenu(false);
    }, 300);
  };

  // Search Data
  const searchableData = [
    { title: "B.Pharm Sem 1 - Pharmaceutics Notes", path: "/bpharm", sectionId: "notes", category: "B.Pharm", type: "Notes" },
    { title: "B.Pharm Sem 1 - Semester PDF", path: "/bpharm", sectionId: "semester", category: "B.Pharm", type: "Semester PDFs" },
    { title: "D.Pharm Hindi Notes", path: "/dpharm", sectionId: "hindi-notes", category: "D.Pharm", type: "Hindi Notes" },
    { title: "D.Pharm English Notes", path: "/dpharm", sectionId: "english-notes", category: "D.Pharm", type: "English Notes" },
    { title: "D.Pharm Free Videos", path: "/dpharm", sectionId: "free-videos", category: "D.Pharm", type: "Free Videos" },
    { title: "D.Pharm Free Papers", path: "/dpharm", sectionId: "free-papers", category: "D.Pharm", type: "Free Papers" },
    { title: "D.Pharm Hindi PDFs", path: "/dpharm", sectionId: "hindi-pdfs", category: "D.Pharm", type: "Hindi Premium PDFs" },
    { title: "D.Pharm English PDFs", path: "/dpharm", sectionId: "english-pdfs", category: "D.Pharm", type: "English Premium PDFs" },
    { title: "D.Pharm 1st Year PDFs", path: "/dpharm", sectionId: "yearwise-pdfs", year: 1, category: "D.Pharm", type: "Year-wise PDFs" },
    { title: "D.Pharm 2nd Year PDFs", path: "/dpharm", sectionId: "yearwise-pdfs", year: 2, category: "D.Pharm", type: "Year-wise PDFs" },
    { title: "D.Pharm Premium Videos", path: "/dpharm", sectionId: "premium-videos", category: "D.Pharm", type: "Premium Videos" },
    { title: "D.Pharm Premium Papers", path: "/dpharm", sectionId: "premium-papers", category: "D.Pharm", type: "Premium Papers" },
    { title: "M.Pharm Sem 1 - Notes", path: "/mpharm", sectionId: "notes", category: "M.Pharm", type: "Notes" },
    { title: "M.Pharm Sem 1 - Semester PDF", path: "/mpharm", sectionId: "semester", category: "M.Pharm", type: "Semester PDFs" },
    { title: "Pharm.D Sem 1 - Notes", path: "/pharmd", sectionId: "notes", category: "Pharm.D", type: "Notes" },
    { title: "Pharm.D Sem 1 - Semester PDF", path: "/pharmd", sectionId: "semester", category: "Pharm.D", type: "Semester PDFs" },
    { title: "PhD Sem 1 - Notes", path: "/phd", sectionId: "notes", category: "PhD", type: "Notes" },
    { title: "PhD Sem 1 - Semester PDF", path: "/phd", sectionId: "semester", category: "PhD", type: "Semester PDFs" },
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = searchableData.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery)
    );
    
    setSearchResults(results.slice(0, 8));
    setShowSearchDropdown(true);
  };

  const handleResultClick = (result) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchDropdown(false);
    navigate(result.path, { 
      state: { 
        scrollTo: result.sectionId,
        semester: result.semester,
        year: result.year,
        language: result.language,
        type: result.type
      } 
    });
  };

  const handleHomeClick = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchDropdown(false);
    setMobileMenuOpen(false);
    navigate("/", { state: { scrollTo: null } });
    setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 0);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleBannerChange = (event) => {
      setActiveBanner(event.detail.activeBanner);
    };
    window.addEventListener("bannerChange", handleBannerChange);
    return () => window.removeEventListener("bannerChange", handleBannerChange);
  }, []);

  // Close everything on location change
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    setOpenSubmenu(null);
    setShowSearchDropdown(false);
    setSearchQuery("");
    setShowUserMenu(false);
  }, [location]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (userDropdownTimeoutRef.current) clearTimeout(userDropdownTimeoutRef.current);
      if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current);
    };
  }, []);

  // Main dropdown handlers
  const handleMouseEnter = (index) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpenDropdown(index);
    setOpenSubmenu(null);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
      setOpenSubmenu(null);
    }, 300);
  };

  const handleDropdownContainerMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  };

  // Submenu handlers
  const handleSubmenuMouseEnter = (submenuIndex) => {
    if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current);
    setOpenSubmenu(submenuIndex);
  };

  const handleSubmenuMouseLeave = () => {
    submenuTimeoutRef.current = setTimeout(() => {
      setOpenSubmenu(null);
    }, 300);
  };

  const handleSubmenuContainerMouseEnter = (submenuIndex) => {
    if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current);
    setOpenSubmenu(submenuIndex);
  };

  const handleSubmenuContainerMouseLeave = () => {
    submenuTimeoutRef.current = setTimeout(() => {
      setOpenSubmenu(null);
    }, 300);
  };

  const getDisplayName = () => {
    if (!user) return "";
    return user.name?.split(" ")[0] || user.email?.split("@")[0];
  };

  // ========== COURSE DROPDOWN ITEMS - 100% FINAL ==========
  const courseDropdownItems = [
    {
      name: "B.Pharm",
      items: [
        { 
          name: "Notes", 
          path: "/bpharm",
          sectionId: "notes",
          hasSubmenu: false,
        },
        { 
          name: "Free Videos", 
          path: "/bpharm",
          sectionId: "notes",
          hasSubmenu: false,
        },
        { 
          name: "Free Papers", 
          path: "/bpharm",
          sectionId: "notes",
          hasSubmenu: false,
        },
        { 
          name: "Semester PDFs", 
          hasSubmenu: true,
          submenuItems: [
            { name: "Semester 1", path: "/bpharm", sectionId: "semester", semester: 1 },
            { name: "Semester 2", path: "/bpharm", sectionId: "semester", semester: 2 },
            { name: "Semester 3", path: "/bpharm", sectionId: "semester", semester: 3 },
            { name: "Semester 4", path: "/bpharm", sectionId: "semester", semester: 4 },
            { name: "Semester 5", path: "/bpharm", sectionId: "semester", semester: 5 },
            { name: "Semester 6", path: "/bpharm", sectionId: "semester", semester: 6 },
            { name: "Semester 7", path: "/bpharm", sectionId: "semester", semester: 7 },
            { name: "Semester 8", path: "/bpharm", sectionId: "semester", semester: 8 },
          ]
        },
      ]
    },
    {
      name: "D.Pharm",
      items: [
        { 
          name: "Notes", 
          hasSubmenu: true,
          submenuItems: [
            { name: "Hindi Notes", path: "/dpharm", sectionId: "hindi-notes" },
            { name: "English Notes", path: "/dpharm", sectionId: "english-notes" },
          ]
        },
        { 
          name: "Free Videos", 
          path: "/dpharm",
          sectionId: "free-videos",
          hasSubmenu: false,
        },
        { 
          name: "Free Papers", 
          path: "/dpharm",
          sectionId: "free-papers",
          hasSubmenu: false,
        },
        { 
          name: "Premium PDFs", 
          hasSubmenu: true,
          submenuItems: [
            { name: "Hindi Medium PDFs", path: "/dpharm", sectionId: "hindi-pdfs" },
            { name: "English Medium PDFs", path: "/dpharm", sectionId: "english-pdfs" },
          ]
        },
        { 
          name: "Year-wise PDFs", 
          hasSubmenu: true,
          submenuItems: [
            { name: "1st Year", path: "/dpharm", sectionId: "yearwise-pdfs", year: 1 },
            { name: "2nd Year", path: "/dpharm", sectionId: "yearwise-pdfs", year: 2 },
          ]
        },
        { 
          name: "Premium Videos", 
          path: "/dpharm",
          sectionId: "premium-videos",
          hasSubmenu: false,
        },
        { 
          name: "Premium Papers", 
          path: "/dpharm",
          sectionId: "premium-papers",
          hasSubmenu: false,
        },
      ]
    },
    {
      name: "M.Pharm",
      items: [
        { 
          name: "Notes", 
          path: "/mpharm",
          sectionId: "notes",
          hasSubmenu: false,
        },
        { 
          name: "Free Videos", 
          path: "/mpharm",
          sectionId: "notes",
          hasSubmenu: false,
        },
        { 
          name: "Free Papers", 
          path: "/mpharm",
          sectionId: "notes",
          hasSubmenu: false,
        },
        { 
          name: "Semester PDFs", 
          hasSubmenu: true,
          submenuItems: [
            { name: "Semester 1", path: "/mpharm", sectionId: "semester", semester: 1 },
            { name: "Semester 2", path: "/mpharm", sectionId: "semester", semester: 2 },
            { name: "Semester 3", path: "/mpharm", sectionId: "semester", semester: 3 },
            { name: "Semester 4", path: "/mpharm", sectionId: "semester", semester: 4 },
          ]
        },
      ]
    },
    {
      name: "Pharm.D",
      items: [
        { 
          name: "Notes", 
          path: "/pharmd",
          sectionId: "notes",
          hasSubmenu: false,
        },
        { 
          name: "Free Videos", 
          path: "/pharmd",
          sectionId: "notes",
          hasSubmenu: false,
        },
        { 
          name: "Free Papers", 
          path: "/pharmd",
          sectionId: "notes",
          hasSubmenu: false,
        },
        { 
          name: "Semester PDFs", 
          hasSubmenu: true,
          submenuItems: [
            { name: "Semester 1", path: "/pharmd", sectionId: "semester", semester: 1 },
            { name: "Semester 2", path: "/pharmd", sectionId: "semester", semester: 2 },
            { name: "Semester 3", path: "/pharmd", sectionId: "semester", semester: 3 },
            { name: "Semester 4", path: "/pharmd", sectionId: "semester", semester: 4 },
            { name: "Semester 5", path: "/pharmd", sectionId: "semester", semester: 5 },
            { name: "Semester 6", path: "/pharmd", sectionId: "semester", semester: 6 },
            { name: "Semester 7", path: "/pharmd", sectionId: "semester", semester: 7 },
            { name: "Semester 8", path: "/pharmd", sectionId: "semester", semester: 8 },
          ]
        },
      ]
    },
    {
      name: "PhD",
      items: [
        { 
          name: "Notes", 
          path: "/phd",
          sectionId: "notes",
          hasSubmenu: false,
        },
        { 
          name: "Free Videos", 
          path: "/phd",
          sectionId: "notes",
          hasSubmenu: false,
        },
        { 
          name: "Free Papers", 
          path: "/phd",
          sectionId: "notes",
          hasSubmenu: false,
        },
        { 
          name: "Semester PDFs", 
          hasSubmenu: true,
          submenuItems: [
            { name: "Semester 1", path: "/phd", sectionId: "semester", semester: 1 },
            { name: "Semester 2", path: "/phd", sectionId: "semester", semester: 2 },
            { name: "Semester 3", path: "/phd", sectionId: "semester", semester: 3 },
            { name: "Semester 4", path: "/phd", sectionId: "semester", semester: 4 },
            { name: "Semester 5", path: "/phd", sectionId: "semester", semester: 5 },
            { name: "Semester 6", path: "/phd", sectionId: "semester", semester: 6 },
          ]
        },
      ]
    },
  ];

  const navItems = [
    { name: "Home", path: "/", isLink: true, isHome: true },
    ...courseDropdownItems.map(course => ({
      name: course.name,
      isDropdown: true,
      dropdownItems: course.items
    })),
  ];

  return (
    <>
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 py-1 transition-all duration-300 shadow-md
        ${
          activeBanner === 1
            ? "bg-[#e9f9f7]"
            : "bg-gradient-to-r from-[#063b47] via-[#0b5c60] to-[#1aa19d]"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" onClick={handleHomeClick} className="flex items-center shrink-0">
            <img src={logo} alt="PharmaVerse Logo" className="w-24 sm:w-28 h-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center justify-center gap-5 xl:gap-7 text-[14px] xl:text-[15px] font-semibold">
            {navItems.map((item, index) => (
              <li
                key={index}
                className="relative"
                onMouseEnter={() => { if (item.isDropdown) handleMouseEnter(index); }}
                onMouseLeave={() => { if (item.isDropdown) handleMouseLeave(); }}
              >
                {item.isLink ? (
                  item.isHome ? (
                    <button 
                      onClick={handleHomeClick} 
                      className={`cursor-pointer transition-colors duration-200 hover:text-[#18c1b7] ${
                        location.pathname === item.path ? "text-[#18c1b7]" : ""
                      } ${activeBanner === 1 ? "text-black" : "text-white"}`}
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link 
                      to={item.path} 
                      state={{ scrollTo: null }} 
                      className={`cursor-pointer transition-colors duration-200 hover:text-[#18c1b7] ${
                        location.pathname === item.path ? "text-[#18c1b7]" : ""
                      } ${activeBanner === 1 ? "text-black" : "text-white"}`}
                    >
                      {item.name}
                    </Link>
                  )
                ) : (
                  <div className={`flex items-center gap-1 cursor-pointer transition-colors duration-200 hover:text-[#18c1b7] ${
                    activeBanner === 1 ? "text-black" : "text-white"
                  }`}>
                    {item.name} <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown === index ? "rotate-180" : ""}`} />
                  </div>
                )}
                
                {/* Dropdown Menu */}
                {item.isDropdown && openDropdown === index && (
                  <div 
                    className="absolute top-6 left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50"
                    onMouseEnter={handleDropdownContainerMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    {item.dropdownItems.map((subItem, idx) => (
                      <div key={idx} className="relative">
                        {subItem.hasSubmenu ? (
                          <div
                            className="relative"
                            onMouseEnter={() => handleSubmenuMouseEnter(idx)}
                            onMouseLeave={handleSubmenuMouseLeave}
                          >
                            <div className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-[#e9f9f7] hover:text-[#18c1b7] transition cursor-pointer">
                              <span>{subItem.name}</span>
                              <ChevronRight size={14} />
                            </div>
                            
                            {openSubmenu === idx && (
                              <div 
                                className="absolute left-full top-0 ml-1 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 max-h-[400px] overflow-y-auto"
                                onMouseEnter={() => handleSubmenuContainerMouseEnter(idx)}
                                onMouseLeave={handleSubmenuContainerMouseLeave}
                              >
                                {subItem.submenuItems.map((subSubItem, subIdx) => (
                                  <Link
                                    key={subIdx}
                                    to={subSubItem.path}
                                    state={{ 
                                      scrollTo: subSubItem.sectionId,
                                      semester: subSubItem.semester,
                                      year: subSubItem.year,
                                      language: subSubItem.language
                                    }}
                                    className="block px-4 py-2 text-gray-700 hover:bg-[#e9f9f7] hover:text-[#18c1b7] transition text-sm"
                                    onClick={() => { 
                                      setOpenDropdown(null); 
                                      setOpenSubmenu(null); 
                                    }}
                                  >
                                    {subSubItem.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            to={subItem.path}
                            state={{ scrollTo: subItem.sectionId }}
                            className="block px-4 py-2 text-gray-700 hover:bg-[#e9f9f7] hover:text-[#18c1b7] transition"
                            onClick={() => { setOpenDropdown(null); }}
                          >
                            {subItem.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Right Section - Search & User */}
          <div className="hidden md:flex items-center justify-end gap-4">
            {/* Search Bar */}
            <div ref={searchRef} className="relative">
              <div className="p-[2px] rounded-full" style={{ background: "linear-gradient(90deg, #2563eb, #ef4444, #2563eb)", backgroundSize: "200% 200%", animation: "gradientMove 3s linear infinite" }}>
                <div className="flex items-center bg-white rounded-full px-4 py-[7px] w-[200px] xl:w-[220px]">
                  <input 
                    type="text" 
                    placeholder="Search notes, videos, papers..." 
                    className="bg-transparent outline-none text-[13px] w-full text-gray-700" 
                    value={searchQuery} 
                    onChange={(e) => handleSearch(e.target.value)} 
                    onFocus={() => searchQuery.trim() !== "" && setShowSearchDropdown(true)} 
                  />
                  <Search size={18} className="text-gray-500 cursor-pointer hover:text-[#18c1b7]" />
                </div>
              </div>

              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-[300px] xl:w-[350px] bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 max-h-[400px] overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleResultClick(result)} 
                      className="w-full text-left px-4 py-3 hover:bg-[#e9f9f7] transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="font-semibold text-gray-800 text-sm">{result.title}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-[#18c1b7] font-medium">{result.category}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{result.type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showSearchDropdown && searchQuery.trim() !== "" && searchResults.length === 0 && (
                <div className="absolute top-full left-0 mt-2 w-[300px] xl:w-[350px] bg-white rounded-xl shadow-2xl border border-gray-100 py-4 z-50 text-center">
                  <p className="text-gray-500 text-sm">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* User Section */}
            <div className="relative" ref={userMenuRef}>
              {isLoggedIn && user ? (
                <div
                  className="relative"
                  onMouseEnter={handleUserMouseEnter}
                  onMouseLeave={handleUserMouseLeave}
                >
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                      activeBanner === 1
                        ? "bg-[#18c1b7] text-white hover:bg-[#0fa39a]"
                        : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                    }`}
                  >
                    <UserCircle size={18} />
                    <span className="text-sm font-medium">{getDisplayName()}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
                  </button>

                  {showUserMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate("/profile");
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        >
                          <UserCircle size={18} />
                          <span className="text-sm">Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowDeleteModal(true);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={18} />
                          <span className="text-sm">Delete Account</span>
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-100 mt-1"
                        >
                          <LogOut size={18} />
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate("/")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                    activeBanner === 1
                      ? "bg-[#18c1b7] text-white hover:bg-[#0fa39a]"
                      : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                  }`}
                >
                  <User size={18} />
                  <span className="text-sm font-medium">Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200"
          >
            {mobileMenuOpen ? (
              <X size={24} className={activeBanner === 1 ? "text-black" : "text-white"} />
            ) : (
              <Menu size={24} className={activeBanner === 1 ? "text-black" : "text-white"} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200/20 max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col space-y-2 pt-4">
              <button 
                onClick={handleHomeClick} 
                className={`block w-full text-left py-2 px-3 rounded-lg transition ${
                  location.pathname === "/" 
                    ? "bg-[#18c1b7]/10 text-[#18c1b7] font-semibold" 
                    : activeBanner === 1 ? "text-black hover:bg-gray-100" : "text-white hover:bg-white/10"
                }`}
              >
                Home
              </button>

              {courseDropdownItems.map((course, idx) => (
                <div key={idx}>
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)} 
                    className={`flex items-center justify-between w-full py-2 px-3 rounded-lg transition ${
                      activeBanner === 1 ? "text-black hover:bg-gray-100" : "text-white hover:bg-white/10"
                    }`}
                  >
                    {course.name}
                    <ChevronDown size={16} className={`transform transition-transform duration-200 ${openDropdown === idx ? "rotate-180" : ""}`} />
                  </button>
                  
                  {openDropdown === idx && (
                    <div className="ml-4 mt-2 space-y-2 border-l-2 border-[#18c1b7] pl-3">
                      {course.items.map((subItem, subIdx) => (
                        <div key={subIdx}>
                          {subItem.hasSubmenu ? (
                            <>
                              <button
                                onClick={() => setOpenSubmenu(openSubmenu === subIdx ? null : subIdx)}
                                className={`flex items-center justify-between w-full py-2 px-2 rounded transition text-sm ${
                                  activeBanner === 1 ? "text-gray-600 hover:text-[#18c1b7]" : "text-gray-200 hover:text-white"
                                }`}
                              >
                                {subItem.name}
                                <ChevronRight size={14} className={`transform transition-transform duration-200 ${openSubmenu === subIdx ? "rotate-90" : ""}`} />
                              </button>
                              
                              {openSubmenu === subIdx && (
                                <div className="ml-4 mt-1 space-y-1 border-l border-gray-300 pl-3">
                                  {subItem.submenuItems.map((subSubItem, subSubIdx) => (
                                    <Link
                                      key={subSubIdx}
                                      to={subSubItem.path}
                                      state={{ 
                                        scrollTo: subSubItem.sectionId,
                                        semester: subSubItem.semester,
                                        year: subSubItem.year,
                                        language: subSubItem.language
                                      }}
                                      onClick={() => { setMobileMenuOpen(false); setOpenDropdown(null); setOpenSubmenu(null); }}
                                      className="block py-1.5 px-2 rounded text-xs text-gray-500 hover:text-[#18c1b7] transition"
                                    >
                                      {subSubItem.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <Link
                              to={subItem.path}
                              state={{ scrollTo: subItem.sectionId }}
                              onClick={() => { setMobileMenuOpen(false); setOpenDropdown(null); }}
                              className={`block py-2 px-2 rounded transition text-sm ${
                                activeBanner === 1 ? "text-gray-600 hover:text-[#18c1b7]" : "text-gray-200 hover:text-white"
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoggedIn && user ? (
                <div className="pt-3 px-3 border-t border-gray-200/20 mt-2">
                  <div className="bg-white/10 rounded-xl p-3 mb-2">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }} 
                    className="block w-full text-left py-2 px-3 rounded-lg text-sm hover:bg-white/10 transition"
                  >
                    Profile
                  </button>
                  <button 
                    onClick={() => { setShowDeleteModal(true); setMobileMenuOpen(false); }} 
                    className="block w-full text-left py-2 px-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
                  >
                    Delete Account
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="block w-full text-left py-2 px-3 rounded-lg text-sm hover:bg-white/10 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => navigate("/")} 
                  className={`flex items-center justify-center gap-2 mx-3 mt-2 py-2 rounded-full transition ${
                    activeBanner === 1
                      ? "bg-[#18c1b7] text-white hover:bg-[#0fa39a]"
                      : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                  }`}
                >
                  <User size={18} /> Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
            onClick={() => { setShowDeleteModal(false); setDeletePassword(""); setDeleteError(""); }}
          ></div>
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 mx-4">
            <h3 className="text-xl font-bold text-red-600 mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-4">Are you sure? This action cannot be undone.</p>
            
            <input 
              type="password" 
              placeholder="Enter your password to confirm" 
              value={deletePassword} 
              onChange={(e) => setDeletePassword(e.target.value)} 
              className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-3 focus:outline-none focus:border-red-500" 
            />
            
            {deleteError && <p className="text-red-500 text-sm mb-3">{deleteError}</p>}
            
            <div className="flex gap-3">
              <button 
                onClick={() => { setShowDeleteModal(false); setDeletePassword(""); setDeleteError(""); }} 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount} 
                disabled={deleteLoading} 
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-[68px] sm:h-[72px]"></div>
    </>
  );
};

export default Navbar;