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
} from "lucide-react";

const AdminSidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={22} />,
    },
    {
      id: "materials",
      label: "Free Materials",
      icon: <FolderOpen size={22} />,
    },
    {
      id: "paid",
      label: "Paid PDFs",
      icon: <CreditCard size={22} />,
    },
    {
      id: "videos",
      label: "Videos",
      icon: <Video size={22} />,
    },
    {
      id: "papers",
      label: "Papers",
      icon: <BookOpen size={22} />,
    },
    {
      id: "users",
      label: "Users",
      icon: <Users size={22} />,
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User size={22} />,
    },
    {
      id: "notice",
      label: "Notice",
      icon: <Bell size={22} />,
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

  return (
    <div
      className="
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
      {/* MENU */}
      <div className="flex flex-col gap-2 flex-1">
        {menuItems.map((item) => (
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
              ${
                activeTab === item.id
                  ? "bg-sky-600 text-white shadow-md"
                  : "text-sky-900 hover:bg-white hover:text-sky-700"
              }
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
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
    </div>
  );
};

export default AdminSidebar;