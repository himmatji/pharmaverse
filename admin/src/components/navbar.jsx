import { useState, useEffect, useRef } from "react";
import { User, Search, X } from "lucide-react";
import logo from "../assets/logo.png";

const AdminNavbar = ({
  notes = [],
  videos = [],
  paidPDFs = [],
  papers = [],
}) => {

  const [adminName, setAdminName] = useState("Lala");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // ADMIN NAME
  useEffect(() => {
    const admin = localStorage.getItem("admin");

    if (admin) {
      try {
        const adminData = JSON.parse(admin);
        setAdminName(
          adminData.username ||
          adminData.name ||
          (adminData.email
            ? adminData.email.split("@")[0]
            : "Lala")
        );
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // SEARCH FUNCTION
  useEffect(() => {
    const allData = [
      ...notes,
      ...videos,
      ...paidPDFs,
      ...papers,
    ];

    if (searchTerm.trim() === "") {
      setResults([]);
      setShowResults(false);
      return;
    }

    const filtered = allData.filter((item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setResults(filtered.slice(0, 8));
    setShowResults(true);
  }, [searchTerm, notes, videos, paidPDFs, papers]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearSearch = () => {
    setSearchTerm("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-sky-100 shadow-lg">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* LEFT LOGO - Responsive */}
            <div className="flex items-center">
              <img
                src={logo}
                alt="PharmaVerse Logo"
                className="w-20 sm:w-24 md:w-28 h-auto object-contain"
              />
            </div>

            {/* RIGHT SECTION - Search + Admin */}
            <div className="flex items-center gap-2 sm:gap-3 relative">
              
              {/* SEARCH BAR - Responsive */}
              <div ref={searchRef} className="relative">
                <Search
                  size={14}
                  className="sm:w-4 sm:h-4 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => searchTerm.trim() !== "" && setShowResults(true)}
                  className="w-36 sm:w-44 md:w-52 pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-full border border-gray-300 bg-white shadow-sm outline-none focus:ring-2 focus:ring-sky-400 text-xs sm:text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} className="sm:w-3.5 sm:h-3.5" />
                  </button>
                )}

                {/* SEARCH RESULTS - Responsive */}
                {showResults && results.length > 0 && (
                  <div className="absolute top-10 sm:top-12 left-0 right-0 sm:left-auto sm:right-0 w-full sm:w-80 bg-white shadow-2xl rounded-xl sm:rounded-2xl max-h-64 sm:max-h-80 overflow-y-auto z-50 border border-gray-200">
                    {results.map((item, index) => (
                      <div
                        key={index}
                        className="px-3 sm:px-4 py-2 sm:py-3 border-b last:border-b-0 hover:bg-sky-50 transition cursor-pointer"
                      >
                        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm line-clamp-1">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {item.course}
                          </p>
                          {item.semester && (
                            <span className="text-[8px] sm:text-[10px] bg-sky-100 text-sky-700 px-1.5 sm:px-2 py-0.5 rounded-full">
                              Sem {item.semester}
                            </span>
                          )}
                          {item.year && (
                            <span className="text-[8px] sm:text-[10px] bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 rounded-full">
                              {item.year}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Results Found */}
                {showResults && searchTerm.trim() !== "" && results.length === 0 && (
                  <div className="absolute top-10 sm:top-12 left-0 right-0 sm:left-auto sm:right-0 w-full sm:w-80 bg-white shadow-2xl rounded-xl sm:rounded-2xl p-4 text-center z-50 border border-gray-200">
                    <p className="text-gray-500 text-xs sm:text-sm">No results found for "{searchTerm}"</p>
                  </div>
                )}
              </div>

              {/* ADMIN NAME - Responsive */}
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full shadow-md border border-gray-200">
                <User size={14} className="sm:w-4 sm:h-4 text-sky-700" />
                <span className="text-sky-900 text-[11px] sm:text-xs md:text-sm font-semibold capitalize truncate max-w-[80px] sm:max-w-[100px]">
                  {adminName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* SPACER - Responsive */}
      <div className="h-14 sm:h-16"></div>
    </>
  );
};

export default AdminNavbar;