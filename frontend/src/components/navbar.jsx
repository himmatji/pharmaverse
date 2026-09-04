import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  ChevronDown,
  Menu,
  X,
  LogOut,
  UserCircle,
  Trash2,
  ChevronRight,
} from "lucide-react";
import logo from "../assets/logo.png";
import axios from "axios";
import AuthModal from "./AuthModal";

const API_URL = "https://api.pharmaverse.co.in/api/auth";

const Navbar = () => {
  const [activeBanner, setActiveBanner] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubmenuPath, setOpenSubmenuPath] = useState([]);

  const [submenuPositions, setSubmenuPositions] = useState({});

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const userMenuRef = useRef(null);
  const userDropdownTimeoutRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const submenuTimeoutRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  /* =========================================================
     AUTH
  ========================================================= */

  useEffect(() => {
    const checkAuth = () => {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("userToken");

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

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  /* =========================================================
     USER OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");

    setIsLoggedIn(false);
    setUser(null);
    setShowUserMenu(false);

    navigate("/");

    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  /* =========================================================
     DELETE ACCOUNT
  ========================================================= */

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password");
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("userToken");

      const response = await axios.delete(
        `${API_URL}/delete-account`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            password: deletePassword,
          },
        }
      );

      if (response.data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("userToken");
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");

        setShowDeleteModal(false);
        setDeletePassword("");
        setIsLoggedIn(false);
        setUser(null);

        navigate("/");

        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      setDeleteError(
        error.response?.data?.message ||
          "Failed to delete account"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  /* =========================================================
     USER MENU
  ========================================================= */

  const handleUserMouseEnter = () => {
    if (userDropdownTimeoutRef.current) {
      clearTimeout(userDropdownTimeoutRef.current);
    }

    setShowUserMenu(true);
  };

  const handleUserMouseLeave = () => {
    userDropdownTimeoutRef.current = setTimeout(() => {
      setShowUserMenu(false);
    }, 300);
  };

  const handleDropdownMouseEnter = () => {
    if (userDropdownTimeoutRef.current) {
      clearTimeout(userDropdownTimeoutRef.current);
    }

    setShowUserMenu(true);
  };

  const handleDropdownMouseLeave = () => {
    userDropdownTimeoutRef.current = setTimeout(() => {
      setShowUserMenu(false);
    }, 300);
  };

  /* =========================================================
     SEARCH DATA
  ========================================================= */

  const searchableData = [
    {
      title: "B.Pharm Sem 1 - Pharmaceutics Notes",
      path: "/bpharm",
      sectionId: "notes",
      category: "B.Pharm",
      type: "Notes",
    },
    {
      title: "B.Pharm Sem 1 - Semester PDF",
      path: "/bpharm",
      sectionId: "semester",
      category: "B.Pharm",
      type: "Semester PDFs",
    },

    {
      title: "D.Pharm Hindi Notes",
      path: "/dpharm",
      sectionId: "hindi-notes",
      category: "D.Pharm",
      type: "Hindi Notes",
    },
    {
      title: "D.Pharm English Notes",
      path: "/dpharm",
      sectionId: "english-notes",
      category: "D.Pharm",
      type: "English Notes",
    },
    {
      title: "D.Pharm Exam Crash Course",
      path: "/dpharm",
      sectionId: "exam-crash-course",
      category: "D.Pharm",
      type: "Exam Crash Course",
    },
    {
      title: "D.Pharm PYQs",
      path: "/dpharm",
      sectionId: "pyqs",
      category: "D.Pharm",
      type: "PYQs",
    },

    {
      title: "M.Pharm Sem 1 - Notes",
      path: "/mpharm",
      sectionId: "notes",
      category: "M.Pharm",
      type: "Notes",
    },
    {
      title: "M.Pharm Sem 1 - Semester PDF",
      path: "/mpharm",
      sectionId: "semester",
      category: "M.Pharm",
      type: "Semester PDFs",
    },
    {
      title: "Pharm.D Notes",
      path: "/pharmd",
      sectionId: "notes",
      category: "Pharm.D",
      type: "Notes",
    },
    {
      title: "Pharm.D 1st Year PDFs",
      path: "/pharmd",
      sectionId: "yearwise",
      year: 1,
      category: "Pharm.D",
      type: "Year-wise PDFs",
    },
    {
      title: "PhD Notes",
      path: "/phd",
      sectionId: "notes",
      category: "PhD",
      type: "Notes",
    },
    {
      title: "PhD Semester 1 PDFs",
      path: "/phd",
      sectionId: "yearwise",
      year: 1,
      category: "PhD",
      type: "Semester PDFs",
    },
  ];

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const lowerQuery = query.toLowerCase();

    const results = searchableData.filter(
      (item) =>
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
        type: result.type,
        subject: result.subject,
      },
    });
  };

  const handleHomeClick = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchDropdown(false);
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    setOpenSubmenuPath([]);
    setSubmenuPositions({});

    navigate("/", {
      state: {
        scrollTo: null,
      },
    });

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }, 0);
  };

  /* =========================================================
     SEARCH OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================================================
     BANNER
  ========================================================= */

  useEffect(() => {
    const handleBannerChange = (event) => {
      setActiveBanner(event.detail.activeBanner);
    };

    window.addEventListener("bannerChange", handleBannerChange);

    return () => {
      window.removeEventListener(
        "bannerChange",
        handleBannerChange
      );
    };
  }, []);

  /* =========================================================
     LOCATION CHANGE
  ========================================================= */

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    setOpenSubmenuPath([]);
    setSubmenuPositions({});
    setShowSearchDropdown(false);
    setSearchQuery("");
    setShowUserMenu(false);
  }, [location]);

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }

      if (userDropdownTimeoutRef.current) {
        clearTimeout(userDropdownTimeoutRef.current);
      }

      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current);
      }
    };
  }, []);

  /* =========================================================
     MAIN DROPDOWN
  ========================================================= */

  const handleMouseEnter = (index) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    setOpenDropdown(index);
    setOpenSubmenuPath([]);
    setSubmenuPositions({});
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
      setOpenSubmenuPath([]);
      setSubmenuPositions({});
    }, 300);
  };

  const handleDropdownContainerMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
  };

  /* =========================================================
     B.PHARM SUBJECTS
  ========================================================= */

  const bpharmSemesterSubjects = [
    {
      semester: 1,
      subjects: [
        "Basics of Python Programming for Pharmaceutical Sciences",
        "General Pharmacy",
        "Healthcare Psychology and Communication Skills",
        "Human Anatomy, Physiology and Pathophysiology I",
        "Introduction to Pharmacognosy",
        "Pharmaceutical Inorganic and Analytical Chemistry",
      ],
    },
    {
      semester: 2,
      subjects: [
        "Applied Biostatistics and Data Analytics for Pharmaceutical Sciences",
        "Biochemistry",
        "Human Anatomy, Physiology and Pathophysiology II",
        "Pharmaceutical Organic Chemistry",
        "Pharmacognosy and Phytochemistry",
        "Physical Pharmaceutics",
      ],
    },
    {
      semester: 3,
      subjects: [
        "Introduction to Machine Learning in Pharmaceutical Sciences",
        "Environmental Sciences",
        "Ethics and Universal Human Values",
        "General Pharmacology",
        "Heterocyclic Compounds and Stereochemistry",
        "Pharmaceutical Dosage Forms I",
        "Pharmaceutical Engineering",
        "Pharmaceutical Microbiology",
      ],
    },
    {
      semester: 4,
      subjects: [
        "Herbal Drug Technology",
        "Medicinal Chemistry",
        "Pharmaceutical Biotechnology",
        "Social Pharmacy and Public Health",
        "Systemic Pharmacology I",
      ],
    },
    {
      semester: 5,
      subjects: [
        "Biomedicinal Chemistry",
        "Industrial Pharmacognosy",
        "Innovation and Startup Ecosystem",
        "Pharmaceutical Dosage Form II",
        "Pharmaceutical Quality Assurance",
        "Systemic Pharmacology II",
      ],
    },
    {
      semester: 6,
      subjects: [
        "Advanced Pharmacognosy",
        "Biopharmaceutics and Pharmacokinetics",
        "Intellectual Property Rights",
        "AI Applications in Pharmaceutical Sciences",
        "Pharmaceutical Analysis",
        "Pharmaceutical Jurisprudence",
        "Green Chemistry",
        "Materiovigilance and Hemovigilance",
        "Scientific Writing",
        "Drug Store and Business Management",
        "Career Building in Cultivation of Medicinal Plants",
        "Active Pharmaceutical Ingredients and Excipient Sciences",
      ],
    },
    {
      semester: 7,
      subjects: [
        "Biostatistics Research Methodology",
        "Cosmetics and Cosmeceuticals",
        "AI in Clinical Applications",
        "Modern Analytical Techniques",
        "Pharmacovigilance",
        "Pharmacy Practice",
        "Regulatory Affairs",
        "Current Good Manufacturing Practices (cGMP)",
        "Pharmaceutical Automation",
        "Modern Techniques in Cellular Biology",
        "Medical Devices",
        "Transformation of Food Waste into Medicinal Products",
        "Biosimilars, Vaccines & Macromolecules",
      ],
    },
    {
      semester: 8,
      subjects: [
        "Ethical Considerations and Translational Applications of AI in Pharmacy",
        "Clinical Pharmacotherapeutics",
        "Industrial Pharmacy and Facility Design",
        "Pharmaceutical Management",
        "Sterile Dosage Forms and Novel Drug Delivery System",
        "Pharmaceutical Packaging",
        "Supply Chain Management",
        "Industrial Safety and Waste Management",
        "Traditional Healing Practices of India",
        "Futuristic Pharma through AR/VR: Pharma 4.0",
        "Herbal Cosmetics for Industry Perspective",
      ],
    },
  ];

  const createBPharmCategory = (
    categoryName,
    sectionId
  ) => ({
    name: categoryName,
    hasSubmenu: true,

    submenuItems: bpharmSemesterSubjects.map(
      (semesterData) => ({
        name: `Semester ${semesterData.semester}`,
        hasSubmenu: true,
        semesterNumber: semesterData.semester,

        submenuItems: semesterData.subjects.map(
          (subject) => ({
            name: subject,
            path: "/bpharm",
            sectionId,
            semester: semesterData.semester,
            subject,
            contentType: categoryName,
          })
        ),
      })
    ),
  });

  /* =========================================================
     D.PHARM SUBJECTS
  ========================================================= */

  const dpharmFirstYearSubjects = [
    "Pharmaceutics",
    "Pharmaceutical Chemistry",
    "Pharmacognosy",
    "Human Anatomy & Physiology",
    "Social Pharmacy",
  ];

  const dpharmSecondYearSubjects = [
    "Pharmacology",
    "Community Pharmacy & Management",
    "Biochemistry & Clinical Pathology",
    "Pharmacotherapeutics",
    "Hospital & Clinical Pharmacy",
    "Pharmacy Law & Ethics",
  ];

  /* =========================================================
     D.PHARM YEAR ITEMS
  ========================================================= */

  const createDPharmYearItems = (
    categoryName,
    language,
    sectionId
  ) => [
    {
      name: "First Year",
      hasSubmenu: true,
      year: 1,

      submenuItems: dpharmFirstYearSubjects.map(
        (subject) => ({
          name: subject,
          path: "/dpharm",
          sectionId,
          year: 1,
          language,
          subject,
          contentType: categoryName,
        })
      ),
    },

    {
      name: "Second Year",
      hasSubmenu: true,
      year: 2,

      submenuItems: dpharmSecondYearSubjects.map(
        (subject) => ({
          name: subject,
          path: "/dpharm",
          sectionId,
          year: 2,
          language,
          subject,
          contentType: categoryName,
        })
      ),
    },
  ];

  /* =========================================================
     D.PHARM LANGUAGE
  ========================================================= */

  const createDPharmLanguageItems = (
    categoryName,
    sectionId
  ) => [
    {
      name: "Hindi Notes",
      hasSubmenu: true,

      submenuItems: createDPharmYearItems(
        categoryName,
        "Hindi",
        sectionId
      ),
    },

    {
      name: "English Notes",
      hasSubmenu: true,

      submenuItems: createDPharmYearItems(
        categoryName,
        "English",
        sectionId
      ),
    },
  ];

  /* =========================================================
     D.PHARM PYQS
  ========================================================= */

  const createDPharmPYQItems = () => [
    {
      name: "First Year",
      hasSubmenu: true,
      year: 1,

      submenuItems: dpharmFirstYearSubjects.map(
        (subject) => ({
          name: subject,
          path: "/dpharm",
          sectionId: "pyqs",
          year: 1,
          subject,
          contentType: "PYQs",
        })
      ),
    },

    {
      name: "Second Year",
      hasSubmenu: true,
      year: 2,

      submenuItems: dpharmSecondYearSubjects.map(
        (subject) => ({
          name: subject,
          path: "/dpharm",
          sectionId: "pyqs",
          year: 2,
          subject,
          contentType: "PYQs",
        })
      ),
    },
  ];

  /* =========================================================
     COURSE DROPDOWN ITEMS
  ========================================================= */

  const courseDropdownItems = [
    /* ================= B.PHARM ================= */

    {
      name: "B.Pharm",

      items: [
        createBPharmCategory(
          "Notes",
          "notes"
        ),

        createBPharmCategory(
          "Exam Crash Course",
          "exam-crash-course"
        ),

        createBPharmCategory(
          "PYQs",
          "pyqs"
        ),
      ],
    },

    /* ================= D.PHARM ================= */

    {
      name: "D.Pharm",

      items: [
        {
          name: "Notes",
          hasSubmenu: true,

          submenuItems:
            createDPharmLanguageItems(
              "Notes",
              "notes"
            ),
        },

        {
          name: "Exam Crash Course",
          hasSubmenu: true,

          submenuItems:
            createDPharmLanguageItems(
              "Exam Crash Course",
              "exam-crash-course"
            ),
        },

        {
          name: "PYQs",
          hasSubmenu: true,

          submenuItems:
            createDPharmPYQItems(),
        },
      ],
    },

    /* ================= M.PHARM ================= */

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
            {
              name: "Semester 1",
              path: "/mpharm",
              sectionId: "semester",
              semester: 1,
            },
            {
              name: "Semester 2",
              path: "/mpharm",
              sectionId: "semester",
              semester: 2,
            },
            {
              name: "Semester 3",
              path: "/mpharm",
              sectionId: "semester",
              semester: 3,
            },
            {
              name: "Semester 4",
              path: "/mpharm",
              sectionId: "semester",
              semester: 4,
            },
          ],
        },
      ],
    },

    /* ================= PHARM.D ================= */

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
          name: "Year-wise PDFs",
          hasSubmenu: true,

          submenuItems: [
            {
              name: "1st Year",
              path: "/pharmd",
              sectionId: "yearwise",
              year: 1,
            },
            {
              name: "2nd Year",
              path: "/pharmd",
              sectionId: "yearwise",
              year: 2,
            },
            {
              name: "3rd Year",
              path: "/pharmd",
              sectionId: "yearwise",
              year: 3,
            },
            {
              name: "4th Year",
              path: "/pharmd",
              sectionId: "yearwise",
              year: 4,
            },
            {
              name: "5th Year",
              path: "/pharmd",
              sectionId: "yearwise",
              year: 5,
            },
            {
              name: "6th Year",
              path: "/pharmd",
              sectionId: "yearwise",
              year: 6,
            },
          ],
        },
      ],
    },

    /* ================= PHD ================= */

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
            {
              name: "Semester 1",
              path: "/phd",
              sectionId: "yearwise",
              year: 1,
            },
            {
              name: "Semester 2",
              path: "/phd",
              sectionId: "yearwise",
              year: 2,
            },
            {
              name: "Semester 3",
              path: "/phd",
              sectionId: "yearwise",
              year: 3,
            },
            {
              name: "Semester 4",
              path: "/phd",
              sectionId: "yearwise",
              year: 4,
            },
            {
              name: "Semester 5",
              path: "/phd",
              sectionId: "yearwise",
              year: 5,
            },
            {
              name: "Semester 6",
              path: "/phd",
              sectionId: "yearwise",
              year: 6,
            },
          ],
        },
      ],
    },
  ];

  const navItems = [
    {
      name: "Home",
      path: "/",
      isLink: true,
      isHome: true,
    },

    ...courseDropdownItems.map((course) => ({
      name: course.name,
      isDropdown: true,
      dropdownItems: course.items,
    })),
  ];

  /* =========================================================
     SUBMENU PATH
  ========================================================= */

  const isSubmenuPathOpen = (path) => {
    if (!path || path.length === 0) {
      return false;
    }

    if (openSubmenuPath.length < path.length) {
      return false;
    }

    return path.every(
      (value, index) =>
        openSubmenuPath[index] === value
    );
  };

  /* =========================================================
     B.PHARM SEM 6-8 POSITION
     SEM 1-5 UNCHANGED
  ========================================================= */

  const getSubjectSubmenuStyle = (
    parentItem
  ) => {
    const semester =
      parentItem.semesterNumber;

    if (semester === 6) {
      return {
        top: "-185px",
      };
    }

    if (semester === 7) {
      return {
        top: "-235px",
      };
    }

    if (semester === 8) {
      return {
        top: "-285px",
      };
    }

    return {
      top: "0px",
    };
  };

  /* =========================================================
     SMART SUBMENU POSITIONING

     IMPORTANT:
     Agar submenu right side se viewport ke bahar ja raha
     hai to automatically LEFT side open hoga.

     Isi se D.Pharm subjects cut nahi honge.
  ========================================================= */

  const calculateSubmenuPosition = (
    element,
    path
  ) => {
    if (!element) return;

    const rect = element.getBoundingClientRect();

    const submenuWidth = 256;
    const gap = 6;
    const viewportWidth = window.innerWidth;

    const spaceOnRight =
      viewportWidth - rect.right - gap;

    const spaceOnLeft =
      rect.left - gap;

    let direction = "right";

    if (
      spaceOnRight < submenuWidth &&
      spaceOnLeft >= submenuWidth
    ) {
      direction = "left";
    }

    setSubmenuPositions((previous) => ({
      ...previous,
      [path.join("-")]: direction,
    }));
  };

  /* =========================================================
     DESKTOP RECURSIVE MENU
  ========================================================= */

  const renderDesktopDropdownItems = (
    items,
    parentPath = []
  ) => {
    return items.map((subItem, idx) => {
      const currentPath = [
        ...parentPath,
        idx,
      ];

      const pathKey = currentPath.join("-");

      const submenuIsOpen =
        isSubmenuPathOpen(currentPath);

      if (subItem.hasSubmenu) {
        const isSemesterSubjectMenu =
          Boolean(subItem.semesterNumber);

        const smartDirection =
          submenuPositions[pathKey] || "right";

        let submenuStyle = {};

        /*
          B.Pharm Sem 6-8:
          Existing upward positioning preserved.
        */

        if (
          isSemesterSubjectMenu &&
          subItem.semesterNumber >= 6
        ) {
          submenuStyle = {
            ...getSubjectSubmenuStyle(
              subItem
            ),
          };
        }

        /*
          D.Pharm / deepest subject menu:
          If right side doesn't have enough room,
          open on LEFT side.
        */

        if (
          !isSemesterSubjectMenu &&
          parentPath.length >= 2
        ) {
          if (smartDirection === "left") {
            submenuStyle.left = "auto";
            submenuStyle.right = "100%";
            submenuStyle.marginRight = "6px";
            submenuStyle.marginLeft = "0px";
          } else {
            submenuStyle.left = "100%";
            submenuStyle.right = "auto";
            submenuStyle.marginLeft = "6px";
            submenuStyle.marginRight = "0px";
          }
        }

        return (
          <div
            key={`${pathKey}-${subItem.name}`}
            className="relative"
            onMouseEnter={(event) => {
              if (submenuTimeoutRef.current) {
                clearTimeout(
                  submenuTimeoutRef.current
                );
              }

              calculateSubmenuPosition(
                event.currentTarget,
                currentPath
              );

              setOpenSubmenuPath(
                currentPath
              );
            }}
            onMouseLeave={() => {
              submenuTimeoutRef.current =
                setTimeout(() => {
                  setOpenSubmenuPath(
                    (previousPath) => {
                      if (
                        currentPath.length ===
                        1
                      ) {
                        return [];
                      }

                      return previousPath.slice(
                        0,
                        currentPath.length - 1
                      );
                    }
                  );
                }, 250);
            }}
          >
            <div
              className="
                flex
                items-center
                justify-between
                px-4
                py-2
                text-gray-700
                hover:bg-[#e9f9f7]
                hover:text-[#18c1b7]
                transition
                cursor-pointer
                text-sm
                whitespace-nowrap
              "
            >
              <span>{subItem.name}</span>

              <ChevronRight
                size={14}
                className="shrink-0 ml-3"
              />
            </div>

            {submenuIsOpen && (
              <div
                className="
                  absolute
                  w-56
                  xl:w-64
                  bg-white
                  rounded-lg
                  shadow-xl
                  border
                  border-gray-100
                  py-2
                  z-[100]
                "
                style={{
                  left:
                    submenuStyle.left ??
                    "100%",

                  right:
                    submenuStyle.right ??
                    "auto",

                  marginLeft:
                    submenuStyle.marginLeft ??
                    "6px",

                  marginRight:
                    submenuStyle.marginRight ??
                    "0px",

                  top:
                    submenuStyle.top ??
                    "0px",
                }}
                onMouseEnter={() => {
                  if (
                    submenuTimeoutRef.current
                  ) {
                    clearTimeout(
                      submenuTimeoutRef.current
                    );
                  }

                  setOpenSubmenuPath(
                    currentPath
                  );
                }}
                onMouseLeave={() => {
                  submenuTimeoutRef.current =
                    setTimeout(() => {
                      setOpenSubmenuPath(
                        (previousPath) =>
                          previousPath.slice(
                            0,
                            Math.max(
                              0,
                              currentPath.length -
                                1
                            )
                          )
                      );
                    }, 250);
                }}
              >
                <div
                  className={
                    isSemesterSubjectMenu &&
                    subItem.semesterNumber >= 6
                      ? "overflow-visible"
                      : parentPath.length >= 2
                      ? "max-h-[420px] overflow-y-auto"
                      : ""
                  }
                >
                  {renderDesktopDropdownItems(
                    subItem.submenuItems,
                    currentPath
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }

      return (
        <Link
          key={`${pathKey}-${subItem.name}`}
          to={subItem.path}
          state={{
            scrollTo:
              subItem.sectionId,
            semester:
              subItem.semester,
            year: subItem.year,
            language:
              subItem.language,
            subject:
              subItem.subject,
            contentType:
              subItem.contentType,
          }}
          className="
            block
            px-4
            py-2
            text-gray-700
            hover:bg-[#e9f9f7]
            hover:text-[#18c1b7]
            transition
            text-sm
            leading-5
          "
          onClick={() => {
            setOpenDropdown(null);
            setOpenSubmenuPath([]);
            setSubmenuPositions({});
          }}
        >
          {subItem.name}
        </Link>
      );
    });
  };

  /* =========================================================
     MOBILE RECURSIVE MENU
  ========================================================= */

  const renderMobileItems = (
    items,
    parentPath = []
  ) => {
    return items.map((subItem, idx) => {
      const currentPath = [
        ...parentPath,
        idx,
      ];

      const submenuIsOpen =
        isSubmenuPathOpen(currentPath);

      if (subItem.hasSubmenu) {
        return (
          <div
            key={`${currentPath.join(
              "-"
            )}-${subItem.name}`}
          >
            <button
              onClick={() => {
                if (submenuIsOpen) {
                  setOpenSubmenuPath(
                    openSubmenuPath.slice(
                      0,
                      currentPath.length - 1
                    )
                  );
                } else {
                  setOpenSubmenuPath(
                    currentPath
                  );
                }
              }}
              className={`
                flex
                items-center
                justify-between
                w-full
                py-1.5
                sm:py-2
                px-2
                rounded
                transition
                text-xs
                sm:text-sm

                ${
                  activeBanner === 1
                    ? "text-gray-600 hover:text-[#18c1b7]"
                    : "text-gray-200 hover:text-white"
                }
              `}
            >
              <span>{subItem.name}</span>

              <ChevronRight
                size={14}
                className={`
                  transform
                  transition-transform
                  duration-200

                  ${
                    submenuIsOpen
                      ? "rotate-90"
                      : ""
                  }
                `}
              />
            </button>

            {submenuIsOpen && (
              <div
                className="
                  ml-3
                  sm:ml-4
                  mt-1
                  space-y-1
                  border-l
                  border-gray-300
                  pl-2
                  sm:pl-3
                "
              >
                {renderMobileItems(
                  subItem.submenuItems,
                  currentPath
                )}
              </div>
            )}
          </div>
        );
      }

      return (
        <Link
          key={`${currentPath.join(
            "-"
          )}-${subItem.name}`}
          to={subItem.path}
          state={{
            scrollTo:
              subItem.sectionId,
            semester:
              subItem.semester,
            year: subItem.year,
            language:
              subItem.language,
            subject:
              subItem.subject,
            contentType:
              subItem.contentType,
          }}
          onClick={() => {
            setMobileMenuOpen(false);
            setOpenDropdown(null);
            setOpenSubmenuPath([]);
          }}
          className={`
            block
            py-1.5
            sm:py-2
            px-2
            rounded
            transition
            text-xs
            sm:text-sm

            ${
              activeBanner === 1
                ? "text-gray-600 hover:text-[#18c1b7]"
                : "text-gray-200 hover:text-white"
            }
          `}
        >
          {subItem.name}
        </Link>
      );
    });
  };

  /* =========================================================
     DISPLAY NAME
  ========================================================= */

  const getDisplayName = () => {
    if (!user) return "";

    return (
      user.name?.split(" ")[0] ||
      user.email?.split("@")[0]
    );
  };

  /* =========================================================
     RETURN
  ========================================================= */

  return (
    <>
      <style>{`
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }

          100% {
            background-position: 0% 50%;
          }
        }

        .mobile-menu-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .mobile-menu-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .mobile-menu-scroll::-webkit-scrollbar-thumb {
          background: #18c1b7;
          border-radius: 4px;
        }
      `}</style>

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav
        className={`
          fixed
          top-0
          left-0
          right-0
          z-50
          w-full
          px-3
          sm:px-4
          md:px-6
          py-1
          transition-all
          duration-300
          shadow-md

          ${
            activeBanner === 1
              ? "bg-[#e9f9f7]"
              : "bg-gradient-to-r from-[#063b47] via-[#0b5c60] to-[#1aa19d]"
          }
        `}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* LOGO */}

          <Link
            to="/"
            onClick={handleHomeClick}
            className="flex items-center shrink-0"
          >
            <img
              src={logo}
              alt="PharmaVerse Logo"
              className="
                w-14
                xs:w-16
                sm:w-20
                md:w-24
                lg:w-28
                xl:w-32
                h-auto
                object-contain
              "
            />
          </Link>

          {/* DESKTOP NAVIGATION */}

          <ul
            className="
              hidden
              lg:flex
              items-center
              justify-center
              gap-3
              xl:gap-5
              2xl:gap-7
              text-[12px]
              xl:text-[14px]
              2xl:text-[15px]
              font-semibold
            "
          >
            {navItems.map(
              (item, index) => (
                <li
                  key={index}
                  className="relative"
                  onMouseEnter={() => {
                    if (item.isDropdown) {
                      handleMouseEnter(index);
                    }
                  }}
                  onMouseLeave={() => {
                    if (item.isDropdown) {
                      handleMouseLeave();
                    }
                  }}
                >
                  {item.isLink ? (
                    item.isHome ? (
                      <button
                        onClick={handleHomeClick}
                        className={`
                          cursor-pointer
                          transition-colors
                          duration-200
                          hover:text-[#18c1b7]
                          whitespace-nowrap

                          ${
                            location.pathname ===
                            item.path
                              ? "text-[#18c1b7]"
                              : ""
                          }

                          ${
                            activeBanner === 1
                              ? "text-black"
                              : "text-white"
                          }
                        `}
                      >
                        {item.name}
                      </button>
                    ) : (
                      <Link
                        to={item.path}
                        state={{
                          scrollTo: null,
                        }}
                        className={`
                          cursor-pointer
                          transition-colors
                          duration-200
                          hover:text-[#18c1b7]
                          whitespace-nowrap

                          ${
                            location.pathname ===
                            item.path
                              ? "text-[#18c1b7]"
                              : ""
                          }

                          ${
                            activeBanner === 1
                              ? "text-black"
                              : "text-white"
                          }
                        `}
                      >
                        {item.name}
                      </Link>
                    )
                  ) : (
                    <div
                      className={`
                        flex
                        items-center
                        gap-1
                        cursor-pointer
                        transition-colors
                        duration-200
                        hover:text-[#18c1b7]
                        whitespace-nowrap

                        ${
                          activeBanner === 1
                            ? "text-black"
                            : "text-white"
                        }
                      `}
                    >
                      {item.name}

                      <ChevronDown
                        size={14}
                        className={`
                          transition-transform
                          duration-200

                          ${
                            openDropdown ===
                            index
                              ? "rotate-180"
                              : ""
                          }
                        `}
                      />
                    </div>
                  )}

                  {/* MAIN DROPDOWN */}

                  {item.isDropdown &&
                    openDropdown === index && (
                      <div
                        className="
                          absolute
                          top-6
                          left-0
                          mt-2
                          w-56
                          xl:w-64
                          bg-white
                          rounded-lg
                          shadow-xl
                          border
                          border-gray-100
                          py-2
                          z-50
                          overflow-visible
                        "
                        onMouseEnter={
                          handleDropdownContainerMouseEnter
                        }
                        onMouseLeave={
                          handleMouseLeave
                        }
                      >
                        {renderDesktopDropdownItems(
                          item.dropdownItems
                        )}
                      </div>
                    )}
                </li>
              )
            )}
          </ul>

          {/* RIGHT SECTION */}

          <div
            className="
              flex
              items-center
              justify-end
              gap-2
              xs:gap-3
              sm:gap-4
            "
          >
            {/* SEARCH */}

            <div
              ref={searchRef}
              className="relative hidden md:block"
            >
              <div
                className="p-[2px] rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #2563eb, #ef4444, #2563eb)",
                  backgroundSize: "200% 200%",
                  animation:
                    "gradientMove 3s linear infinite",
                }}
              >
                <div
                  className="
                    flex
                    items-center
                    bg-white
                    rounded-full
                    px-3
                    lg:px-4
                    py-[5px]
                    lg:py-[7px]
                    w-[160px]
                    lg:w-[200px]
                    xl:w-[220px]
                  "
                >
                  <input
                    type="text"
                    placeholder="Search notes, videos..."
                    className="
                      bg-transparent
                      outline-none
                      text-[12px]
                      lg:text-[13px]
                      w-full
                      text-gray-700
                      placeholder:text-gray-400
                    "
                    value={searchQuery}
                    onChange={(e) =>
                      handleSearch(
                        e.target.value
                      )
                    }
                    onFocus={() =>
                      searchQuery.trim() !== "" &&
                      setShowSearchDropdown(true)
                    }
                  />

                  <Search
                    size={16}
                    className="
                      lg:w-[18px]
                      lg:h-[18px]
                      text-gray-500
                      cursor-pointer
                      hover:text-[#18c1b7]
                      shrink-0
                    "
                  />
                </div>
              </div>

              {showSearchDropdown &&
                searchResults.length > 0 && (
                  <div
                    className="
                      absolute
                      top-full
                      left-0
                      mt-2
                      w-[280px]
                      lg:w-[320px]
                      xl:w-[350px]
                      bg-white
                      rounded-xl
                      shadow-2xl
                      border
                      border-gray-100
                      py-2
                      z-50
                      max-h-[400px]
                      overflow-y-auto
                    "
                  >
                    {searchResults.map(
                      (result, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            handleResultClick(
                              result
                            )
                          }
                          className="
                            w-full
                            text-left
                            px-4
                            py-3
                            hover:bg-[#e9f9f7]
                            transition-colors
                            border-b
                            border-gray-50
                            last:border-0
                          "
                        >
                          <div className="font-semibold text-gray-800 text-sm">
                            {result.title}
                          </div>

                          <div className="flex gap-2 mt-1">
                            <span className="text-xs text-[#18c1b7] font-medium">
                              {result.category}
                            </span>

                            <span className="text-xs text-gray-400">
                              •
                            </span>

                            <span className="text-xs text-gray-500">
                              {result.type}
                            </span>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}

              {showSearchDropdown &&
                searchQuery.trim() !== "" &&
                searchResults.length === 0 && (
                  <div
                    className="
                      absolute
                      top-full
                      left-0
                      mt-2
                      w-[280px]
                      lg:w-[320px]
                      xl:w-[350px]
                      bg-white
                      rounded-xl
                      shadow-2xl
                      border
                      border-gray-100
                      py-4
                      z-50
                      text-center
                    "
                  >
                    <p className="text-gray-500 text-sm">
                      No results found for "
                      {searchQuery}"
                    </p>
                  </div>
                )}
            </div>

            {/* USER */}

            <div
              className="relative"
              ref={userMenuRef}
            >
              {isLoggedIn && user ? (
                <div
                  className="relative"
                  onMouseEnter={
                    handleUserMouseEnter
                  }
                  onMouseLeave={
                    handleUserMouseLeave
                  }
                >
                  <button
                    className={`
                      flex
                      items-center
                      gap-1
                      xs:gap-2
                      px-2
                      xs:px-3
                      sm:px-4
                      py-1
                      xs:py-1.5
                      sm:py-2
                      rounded-full
                      transition-all
                      duration-200
                      text-xs
                      xs:text-sm

                      ${
                        activeBanner === 1
                          ? "bg-[#18c1b7] text-white hover:bg-[#0fa39a]"
                          : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                      }
                    `}
                  >
                    <UserCircle
                      size={16}
                      className="
                        xs:w-[18px]
                        xs:h-[18px]
                        sm:w-[20px]
                        sm:h-[20px]
                      "
                    />

                    <span
                      className="
                        hidden
                        xs:inline
                        font-medium
                        truncate
                        max-w-[60px]
                        sm:max-w-[100px]
                      "
                    >
                      {getDisplayName()}
                    </span>

                    <ChevronDown
                      size={12}
                      className={`
                        xs:w-[14px]
                        xs:h-[14px]
                        sm:w-[16px]
                        sm:h-[16px]
                        transition-transform
                        duration-200

                        ${
                          showUserMenu
                            ? "rotate-180"
                            : ""
                        }
                      `}
                    />
                  </button>

                  {showUserMenu && (
                    <div
                      className="
                        absolute
                        right-0
                        mt-2
                        w-48
                        sm:w-56
                        bg-white
                        rounded-2xl
                        shadow-2xl
                        border
                        border-gray-100
                        py-2
                        z-50
                      "
                      onMouseEnter={
                        handleDropdownMouseEnter
                      }
                      onMouseLeave={
                        handleDropdownMouseLeave
                      }
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {user.name}
                        </p>

                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate("/profile");
                          }}
                          className="
                            w-full
                            flex
                            items-center
                            gap-3
                            px-4
                            py-2.5
                            text-gray-700
                            hover:bg-purple-50
                            hover:text-purple-600
                            transition-colors
                            text-sm
                          "
                        >
                          <UserCircle
                            size={16}
                            className="sm:w-[18px] sm:h-[18px]"
                          />
                          <span>Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowDeleteModal(true);
                          }}
                          className="
                            w-full
                            flex
                            items-center
                            gap-3
                            px-4
                            py-2.5
                            text-red-600
                            hover:bg-red-50
                            transition-colors
                            text-sm
                          "
                        >
                          <Trash2
                            size={16}
                            className="sm:w-[18px] sm:h-[18px]"
                          />
                          <span>Delete Account</span>
                        </button>

                        <button
                          onClick={handleLogout}
                          className="
                            w-full
                            flex
                            items-center
                            gap-3
                            px-4
                            py-2.5
                            text-gray-700
                            hover:bg-gray-100
                            transition-colors
                            border-t
                            border-gray-100
                            mt-1
                            text-sm
                          "
                        >
                          <LogOut
                            size={16}
                            className="sm:w-[18px] sm:h-[18px]"
                          />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() =>
                    setShowLoginModal(true)
                  }
                  className={`
                    flex
                    items-center
                    gap-1
                    xs:gap-2
                    px-2
                    xs:px-3
                    sm:px-4
                    py-1
                    xs:py-1.5
                    sm:py-2
                    rounded-full
                    transition-all
                    duration-200
                    text-xs
                    xs:text-sm

                    ${
                      activeBanner === 1
                        ? "bg-[#18c1b7] text-white hover:bg-[#0fa39a]"
                        : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                    }
                  `}
                >
                  <User
                    size={16}
                    className="xs:w-[18px] xs:h-[18px] sm:w-[20px] sm:h-[20px]"
                  />

                  <span className="hidden xs:inline font-medium">
                    Login
                  </span>
                </button>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}

            <button
              onClick={() =>
                setMobileMenuOpen(
                  !mobileMenuOpen
                )
              }
              className="
                lg:hidden
                flex
                items-center
                justify-center
                w-8
                xs:w-9
                sm:w-10
                h-8
                xs:h-9
                sm:h-10
                rounded-full
                transition-all
                duration-200
              "
            >
              {mobileMenuOpen ? (
                <X
                  size={20}
                  className={`
                    xs:w-[22px]
                    xs:h-[22px]
                    sm:w-[24px]
                    sm:h-[24px]

                    ${
                      activeBanner === 1
                        ? "text-black"
                        : "text-white"
                    }
                  `}
                />
              ) : (
                <Menu
                  size={20}
                  className={`
                    xs:w-[22px]
                    xs:h-[22px]
                    sm:w-[24px]
                    sm:h-[24px]

                    ${
                      activeBanner === 1
                        ? "text-black"
                        : "text-white"
                    }
                  `}
                />
              )}
            </button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}

        {mobileMenuOpen && (
          <div
            className="
              lg:hidden
              mt-2
              sm:mt-4
              pb-4
              border-t
              border-gray-200/20
              max-h-[70vh]
              sm:max-h-[75vh]
              md:max-h-[80vh]
              overflow-y-auto
              mobile-menu-scroll
            "
          >
            <div className="flex flex-col space-y-1 sm:space-y-2 pt-2 sm:pt-4">

              {/* MOBILE SEARCH */}

              <div className="md:hidden px-2 sm:px-3 pb-3 sm:pb-4">
                <div className="relative">
                  <div
                    className="p-[2px] rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #2563eb, #ef4444, #2563eb)",
                      backgroundSize: "200% 200%",
                      animation:
                        "gradientMove 3s linear infinite",
                    }}
                  >
                    <div className="flex items-center bg-white rounded-full px-3 py-2 w-full">
                      <input
                        type="text"
                        placeholder="Search notes, videos..."
                        className="
                          bg-transparent
                          outline-none
                          text-sm
                          w-full
                          text-gray-700
                          placeholder:text-gray-400
                        "
                        value={searchQuery}
                        onChange={(e) =>
                          handleSearch(
                            e.target.value
                          )
                        }
                        onFocus={() =>
                          searchQuery.trim() !== "" &&
                          setShowSearchDropdown(true)
                        }
                      />

                      <Search
                        size={18}
                        className="
                          text-gray-500
                          cursor-pointer
                          hover:text-[#18c1b7]
                          shrink-0
                        "
                      />
                    </div>
                  </div>

                  {showSearchDropdown &&
                    searchResults.length > 0 && (
                      <div
                        className="
                          absolute
                          top-full
                          left-0
                          mt-2
                          w-full
                          bg-white
                          rounded-xl
                          shadow-2xl
                          border
                          border-gray-100
                          py-2
                          z-50
                          max-h-[50vh]
                          overflow-y-auto
                        "
                      >
                        {searchResults.map(
                          (result, idx) => (
                            <button
                              key={idx}
                              onClick={() =>
                                handleResultClick(
                                  result
                                )
                              }
                              className="
                                w-full
                                text-left
                                px-4
                                py-3
                                hover:bg-[#e9f9f7]
                                transition-colors
                                border-b
                                border-gray-50
                                last:border-0
                              "
                            >
                              <div className="font-semibold text-gray-800 text-sm">
                                {result.title}
                              </div>

                              <div className="flex gap-2 mt-1">
                                <span className="text-xs text-[#18c1b7] font-medium">
                                  {result.category}
                                </span>

                                <span className="text-xs text-gray-400">
                                  •
                                </span>

                                <span className="text-xs text-gray-500">
                                  {result.type}
                                </span>
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    )}
                </div>
              </div>

              {/* HOME */}

              <button
                onClick={handleHomeClick}
                className={`
                  block
                  w-full
                  text-left
                  py-1.5
                  sm:py-2
                  px-2
                  sm:px-3
                  rounded-lg
                  transition
                  text-sm
                  sm:text-base

                  ${
                    location.pathname === "/"
                      ? "bg-[#18c1b7]/10 text-[#18c1b7] font-semibold"
                      : activeBanner === 1
                      ? "text-black hover:bg-gray-100"
                      : "text-white hover:bg-white/10"
                  }
                `}
              >
                Home
              </button>

              {/* COURSES */}

              {courseDropdownItems.map(
                (course, idx) => (
                  <div key={idx}>
                    <button
                      onClick={() => {
                        if (
                          openDropdown === idx
                        ) {
                          setOpenDropdown(null);
                          setOpenSubmenuPath([]);
                        } else {
                          setOpenDropdown(idx);
                          setOpenSubmenuPath([]);
                        }
                      }}
                      className={`
                        flex
                        items-center
                        justify-between
                        w-full
                        py-1.5
                        sm:py-2
                        px-2
                        sm:px-3
                        rounded-lg
                        transition
                        text-sm
                        sm:text-base

                        ${
                          activeBanner === 1
                            ? "text-black hover:bg-gray-100"
                            : "text-white hover:bg-white/10"
                        }
                      `}
                    >
                      {course.name}

                      <ChevronDown
                        size={16}
                        className={`
                          transform
                          transition-transform
                          duration-200

                          ${
                            openDropdown === idx
                              ? "rotate-180"
                              : ""
                          }
                        `}
                      />
                    </button>

                    {openDropdown === idx && (
                      <div
                        className="
                          ml-3
                          sm:ml-4
                          mt-1
                          sm:mt-2
                          space-y-1
                          sm:space-y-2
                          border-l-2
                          border-[#18c1b7]
                          pl-2
                          sm:pl-3
                        "
                      >
                        {renderMobileItems(
                          course.items
                        )}
                      </div>
                    )}
                  </div>
                )
              )}

              {/* MOBILE USER */}

              {isLoggedIn && user ? (
                <div className="pt-3 px-2 sm:px-3 border-t border-gray-200/20 mt-2">

                  <div className="bg-white/10 rounded-xl p-3 mb-2">
                    <p className="font-semibold text-sm sm:text-base">
                      {user.name}
                    </p>

                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      navigate("/profile");
                      setMobileMenuOpen(false);
                    }}
                    className="
                      block
                      w-full
                      text-left
                      py-1.5
                      sm:py-2
                      px-2
                      sm:px-3
                      rounded-lg
                      text-sm
                      sm:text-base
                      hover:bg-white/10
                      transition
                    "
                  >
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="
                      block
                      w-full
                      text-left
                      py-1.5
                      sm:py-2
                      px-2
                      sm:px-3
                      rounded-lg
                      text-sm
                      sm:text-base
                      text-red-400
                      hover:bg-red-500/10
                      transition
                    "
                  >
                    Delete Account
                  </button>

                  <button
                    onClick={handleLogout}
                    className="
                      block
                      w-full
                      text-left
                      py-1.5
                      sm:py-2
                      px-2
                      sm:px-3
                      rounded-lg
                      text-sm
                      sm:text-base
                      hover:bg-white/10
                      transition
                    "
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    flex
                    items-center
                    justify-center
                    gap-2
                    mx-2
                    sm:mx-3
                    mt-2
                    py-1.5
                    sm:py-2
                    rounded-full
                    transition
                    text-sm
                    sm:text-base

                    ${
                      activeBanner === 1
                        ? "bg-[#18c1b7] text-white hover:bg-[#0fa39a]"
                        : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                    }
                  `}
                >
                  <User
                    size={18}
                    className="sm:w-[20px] sm:h-[20px]"
                  />

                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* AUTH MODAL */}

      <AuthModal
        isOpen={showLoginModal}
        onClose={() =>
          setShowLoginModal(false)
        }
        onLoginSuccess={() => {
          setShowLoginModal(false);
          window.location.reload();
        }}
      />

      {/* DELETE ACCOUNT MODAL */}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4">

          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setShowDeleteModal(false);
              setDeletePassword("");
              setDeleteError("");
            }}
          ></div>

          <div className="relative bg-white rounded-2xl w-full max-w-[90%] sm:max-w-md p-4 sm:p-6 mx-2 sm:mx-4">

            <h3 className="text-lg sm:text-xl font-bold text-red-600 mb-2">
              Delete Account
            </h3>

            <p className="text-gray-600 text-sm sm:text-base mb-4">
              Are you sure? This action cannot be undone.
            </p>

            <input
              type="password"
              placeholder="Enter your password to confirm"
              value={deletePassword}
              onChange={(e) =>
                setDeletePassword(
                  e.target.value
                )
              }
              className="
                w-full
                border
                border-gray-300
                rounded-xl
                px-4
                py-2
                mb-3
                focus:outline-none
                focus:border-red-500
                text-sm
              "
            />

            {deleteError && (
              <p className="text-red-500 text-xs sm:text-sm mb-3">
                {deleteError}
              </p>
            )}

            <div className="flex gap-2 sm:gap-3">

              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeleteError("");
                }}
                className="
                  flex-1
                  px-3
                  sm:px-4
                  py-2
                  border
                  border-gray-300
                  rounded-xl
                  hover:bg-gray-50
                  transition
                  text-sm
                "
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="
                  flex-1
                  px-3
                  sm:px-4
                  py-2
                  bg-red-600
                  text-white
                  rounded-xl
                  hover:bg-red-700
                  transition
                  disabled:opacity-50
                  text-sm
                "
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete Account"}
              </button>

            </div>
          </div>
        </div>
      )}

      <div className="h-0"></div>
    </>
  );
};

export default Navbar;