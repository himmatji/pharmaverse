import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Video,
  BookOpen,
  CreditCard,
  Users,
  Bell,
  Settings,
  LogOut,
  FolderOpen,
  User,
  Menu,
  X,
  GitBranch,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Pill,
  Microscope,
  FlaskRound,
  HeartPulse
} from "lucide-react";

const AdminSidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);

  // Check if screen is mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobileOpen) return;

    const handleClickOutside = (e) => {
      const sidebar = document.getElementById("mobile-sidebar");
      const toggleBtn = document.getElementById("mobile-toggle-btn");
      if (sidebar && !sidebar.contains(e.target) && toggleBtn && !toggleBtn.contains(e.target)) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen]);

  // Close sidebar when tab changes on mobile
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [activeTab]);

  // Branch options
  const branches = [
    { id: "bpharm", label: "B.Pharm", icon: <GraduationCap size={18} />, color: "from-blue-500 to-cyan-500" },
    { id: "dpharm", label: "D.Pharm", icon: <Pill size={18} />, color: "from-emerald-500 to-teal-500" },
    { id: "mpharm", label: "M.Pharm", icon: <Microscope size={18} />, color: "from-purple-500 to-indigo-500" },
    { id: "phd", label: "PhD", icon: <FlaskRound size={18} />, color: "from-rose-500 to-pink-500" },
    { id: "pharmd", label: "Pharm.D", icon: <HeartPulse size={18} />, color: "from-orange-500 to-amber-500" },
  ];

  // ========== MENU ITEMS - NO UPLOAD OPTION ==========
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={22} /> },
    { id: "branch", label: "Branch", icon: <GitBranch size={22} />, isDropdown: true },
    // Upload option REMOVED from here
    { id: "materials", label: "Free Materials", icon: <FolderOpen size={22} /> },
    { id: "paid", label: "Paid PDFs", icon: <CreditCard size={22} /> },
    { id: "videos", label: "Videos", icon: <Video size={22} /> },
    { id: "papers", label: "Papers", icon: <BookOpen size={22} /> },
    { id: "users", label: "Users", icon: <Users size={22} /> },
    { id: "profile", label: "Profile", icon: <User size={22} /> },
    { id: "notice", label: "Notice", icon: <Bell size={22} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("admin");
    if (onLogout) {
      onLogout();
    } else {
      window.location.href = "/login";
    }
  };

  const toggleSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleBranch = () => {
    setIsBranchOpen(!isBranchOpen);
  };

  const handleBranchClick = (branchId) => {
    // Set active tab to branch
    setActiveTab(`branch-${branchId}`);
    // Close branch dropdown
    setIsBranchOpen(false);
  };

  // ========== SIDEBAR CONTENT (Reusable) ==========
  const SidebarContent = () => (
    <>
      {/* MENU */}
      <div className="flex flex-col gap-1 flex-1">
        {menuItems.map((item) => {
          // If it's a branch item, render dropdown
          if (item.isDropdown) {
            return (
              <div key={item.id} className="mb-1">
                <button
                  onClick={toggleBranch}
                  className={`
                    flex items-center justify-between gap-4
                    px-5 py-3.5
                    text-[15px]
                    font-semibold
                    w-full
                    transition-all
                    duration-300
                    text-left
                    rounded-xl
                    ${activeTab === item.id || activeTab?.startsWith("branch-")
                      ? "bg-sky-600 text-white shadow-md"
                      : "text-sky-900 hover:bg-white hover:text-sky-700"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {isBranchOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>

                {/* Branch Submenu */}
                {isBranchOpen && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-sky-300 pl-3">
                    {branches.map((branch) => {
                      const isActive = activeTab === `branch-${branch.id}`;
                      return (
                        <button
                          key={branch.id}
                          onClick={() => handleBranchClick(branch.id)}
                          className={`
                            flex items-center gap-3
                            px-4 py-2.5
                            text-[13px]
                            font-medium
                            w-full
                            transition-all
                            duration-300
                            text-left
                            rounded-lg
                            ${isActive
                              ? `bg-gradient-to-r ${branch.color} text-white shadow-md`
                              : "text-sky-800 hover:bg-white hover:text-sky-700"
                            }
                          `}
                        >
                          <span className={isActive ? "text-white" : "text-sky-500"}>
                            {branch.icon}
                          </span>
                          <span>{branch.label}</span>
                          {isActive && (
                            <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white">
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Normal menu item
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                flex items-center gap-4
                px-5 py-3.5
                text-[15px]
                font-semibold
                w-full
                transition-all
                duration-300
                text-left
                rounded-xl
                ${activeTab === item.id
                  ? "bg-sky-600 text-white shadow-md"
                  : "text-sky-900 hover:bg-white hover:text-sky-700"
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        className="
          w-full
          py-4
          mt-6
          bg-gradient-to-r
          from-sky-500
          via-sky-700
          to-black
          text-white
          text-[17px]
          font-bold
          shadow-lg
          transition-all
          duration-300
          hover:scale-105
          hover:shadow-2xl
          hover:from-sky-400
          hover:via-sky-600
          hover:to-gray-900
          rounded-xl
          border
          border-sky-400/30
        "
      >
        Logout
      </button>
    </>
  );

  return (
    <>
      {/* ========== MOBILE TOGGLE BUTTON ========== */}
      <button
        id="mobile-toggle-btn"
        onClick={toggleSidebar}
        className="lg:hidden fixed top-20 left-4 z-50 p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* ========== MOBILE SIDEBAR (Overlay) ========== */}
      <div
        className={`
          lg:hidden fixed inset-0 z-40 transition-all duration-300
          ${isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        ></div>

        {/* Sidebar */}
        <div
          id="mobile-sidebar"
          className={`
            absolute top-0 left-0 h-full w-[280px] bg-gradient-to-b from-sky-50 to-sky-100 shadow-2xl
            transition-transform duration-300 ease-out
            px-4 py-6
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Logo */}
            <div className="mb-6 pb-4 border-b border-sky-200">
              <h1 className="text-xl font-bold text-sky-800">⚕️ PharmaVerse</h1>
              <p className="text-xs text-sky-600">Admin Panel</p>
            </div>
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* ========== DESKTOP SIDEBAR ========== */}
      <div
        className="
          hidden lg:block
          fixed
          left-0
          top-16
          h-[calc(100vh-64px)]
          w-[250px]
          bg-sky-100
          shadow-xl
          px-4
          py-6
          z-40
          border-r
          border-sky-200
          flex
          flex-col
        "
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default AdminSidebar;