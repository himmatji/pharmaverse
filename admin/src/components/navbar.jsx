    import { useState, useEffect } from "react";
    import { User, Search } from "lucide-react";
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
        return;
        }

        const filtered = allData.filter((item) =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setResults(filtered);

    }, [searchTerm, notes, videos, paidPDFs, papers]);

    return (
        <>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-sky-100 shadow-lg">
            {/* ^^^ Keep z-50 for navbar */}
            <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                {/* LEFT LOGO */}
                <div className="flex items-center">
                <img
                    src={logo}
                    alt="PharmaVerse Logo"
                    className="w-28 h-28 object-contain"
                />
                </div>

                {/* LEFT SEARCH + ADMIN */}
                <div className="flex items-center gap-3 relative">
                {/* SEARCH BAR */}
                <div className="relative">
                    <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-52 pl-9 pr-3 py-2 rounded-full border border-gray-300 bg-white shadow-sm outline-none focus:ring-2 focus:ring-sky-400 text-sm"
                    />

                    {/* SEARCH RESULTS */}
                    {results.length > 0 && (
                    <div className="absolute top-12 left-0 w-72 bg-white shadow-2xl rounded-2xl max-h-80 overflow-y-auto z-50 border border-gray-200">
                        {results.map((item, index) => (
                        <div
                            key={index}
                            className="px-4 py-3 border-b hover:bg-sky-50 transition cursor-pointer"
                        >
                            <h3 className="font-semibold text-gray-800 text-sm">
                            {item.title}
                            </h3>
                            <p className="text-xs text-gray-500">
                            {item.course}
                            </p>
                        </div>
                        ))}
                    </div>
                    )}
                </div>

                {/* ADMIN NAME */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md border border-gray-200">
                    <User size={18} className="text-sky-700" />
                    <span className="text-sky-900 text-sm font-semibold capitalize">
                    {adminName}
                    </span>
                </div>
                </div>
            </div>
            </div>
        </nav>

        {/* SPACER */}
        <div className="h-16"></div>
        </>
    );
    };

    export default AdminNavbar;