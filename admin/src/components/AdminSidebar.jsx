import { useState, useEffect } from "react";
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
  X
} from "lucide-react";

const AdminSidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && isMobileOpen && !e.target.closest('.admin-sidebar')) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, isMobileOpen]);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} className="sm:w-5 sm:h-5" />,
    },
    {
      id: "materials",
      label: "Free Materials",
      icon: <FolderOpen size={20} className="sm:w-5 sm:h-5" />,
    },
    {
      id: "paid",
      label: "Paid PDFs",
      icon: <CreditCard size={20} className="sm:w-5 sm:h-5" />,
    },
    {
      id: "videos",
      label: "Videos",
      icon: <Video size={20} className="sm:w-5 sm:h-5" />,
    },
    {
      id: "papers",
      label: "Papers",
      icon: <BookOpen size={20} className="sm:w-5 sm:h-5" />,
    },
    {
      id: "users",
      label: "Users",
      icon: <Users size={20} className="sm:w-5 sm:h-5" />,
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User size={20} className="sm:w-5 sm:h-5" />,
    },
    {
      id: "notice",
      label: "Notice",
      icon: <Bell size={20} className="sm:w-5 sm:h-5" />,
    },
  ];

  // LOGOUT
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

  // Mobile menu toggle button
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-sky-600 rounded-lg shadow-lg hover:bg-sky-700 transition-all duration-300"
    >
      {isMobileOpen ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}
    </button>
  );

  // Sidebar content
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header - Mobile title */}
      <div className="lg:hidden px-4 pb-4 mb-2 border-b border-sky-200">
        <h2 className="text-xl font-bold text-sky-800">Admin Panel</h2>
        <p className="text-xs text-sky-600 mt-1">Menu</p>
      </div>

      {/* MENU */}
      <div className="flex flex-col gap-1.5 sm:gap-2 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (isMobile) setIsMobileOpen(false);
            }}
            className={`
              flex items-center gap-3 sm:gap-4
              px-3 sm:px-4 md:px-5
              py-2.5 sm:py-3 md:py-3.5
              text-[13px] sm:text-[14px] md:text-[15px]
              font-semibold
              w-full
              transition-all
              duration-300
              text-left
              rounded-lg sm:rounded-xl
              ${
                activeTab === item.id
                  ? "bg-sky-600 text-white shadow-md"
                  : "text-sky-800 hover:bg-white/60 hover:text-sky-700"
              }
            `}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>

      {/* LOGOUT BUTTON - Responsive */}
      <button
        onClick={handleLogout}
        className="
          w-full
          py-3 sm:py-3.5 md:py-4
          mt-4 sm:mt-5 md:mt-6
          bg-gradient-to-r
          from-sky-500
          via-sky-700
          to-black
          text-white
          text-[14px] sm:text-[15px] md:text-[17px]
          font-bold
          shadow-lg
          transition-all
          duration-300
          hover:scale-[1.02]
          hover:shadow-2xl
          hover:from-sky-400
          hover:via-sky-600
          hover:to-gray-900
          rounded-lg sm:rounded-xl
          border
          border-sky-400/30
          flex
          items-center
          justify-center
          gap-2
        "
      >
        <LogOut size={18} className="sm:w-5 sm:h-5" />
        <span>Logout</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <MobileMenuButton />

      {/* Sidebar */}
      <div
        className={`
          admin-sidebar
          fixed
          left-0
          top-16
          h-[calc(100vh-64px)]
          w-[240px] sm:w-[250px] md:w-[260px]
          bg-gradient-to-b from-sky-100 to-sky-50
          shadow-xl
          px-3 sm:px-4 md:px-5
          py-4 sm:py-5 md:py-6
          z-40
          border-r
          border-sky-200
          flex
          flex-col
          transition-transform
          duration-300
          ease-in-out
          ${isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        `}
      >
        <SidebarContent />
      </div>

      {/* Overlay for mobile */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;