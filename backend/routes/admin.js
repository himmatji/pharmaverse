const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const User = require("../models/User");
const Admin = require("../models/Admin");
const Note = require("../models/Note");
const Video = require("../models/Video");
const PaidPDF = require("../models/PaidPDF");
const Paper = require("../models/Paper");
const FreeMaterial = require("../models/FreeMaterial");
const Notice = require("../models/Notice");
const Payment = require("../models/Payment");
const CoursePrice = require("../models/CoursePrice");
const InterviewMaterial = require("../models/InterviewMaterial");

// Notice media/link/target fields are added at runtime for backward compatibility
// with older Notice.js schemas. Keep Notice.js in sync with these fields.
if (!Notice.schema.path("imageUrl")) {
  Notice.schema.add({ imageUrl: { type: String, default: "", maxlength: 5000000 } });
}
if (!Notice.schema.path("linkUrl")) {
  Notice.schema.add({ linkUrl: { type: String, default: "", maxlength: 2048 } });
}
if (!Notice.schema.path("linkText")) {
  Notice.schema.add({ linkText: { type: String, default: "Open link", maxlength: 60 } });
}
if (!Notice.schema.path("target")) {
  Notice.schema.add({
    target: {
      type: String,
      enum: ["all", "bpharm", "dpharm", "mpharm", "pharmd", "phd"],
      default: "all"
    }
  });
}

const normalizeNoticeTarget = (value) => {
  const target = String(value || "all").trim().toLowerCase();
  return ["all", "bpharm", "dpharm", "mpharm", "pharmd", "phd"].includes(target)
    ? target
    : null;
};

const normalizeNoticeImage = (value) => {
  if (value == null || value === "") return "";
  if (typeof value !== "string") return null;

  const imageValue = value.trim();
  if (!imageValue) return "";

  // Support externally hosted images using HTTP/HTTPS URLs.
  // Never allow javascript:, file:, or other unsafe URL schemes.
  if (/^https?:\/\//i.test(imageValue)) {
    try {
      const parsedUrl = new URL(imageValue);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) return null;
      if (imageValue.length > 2048) return null;
      return parsedUrl.href;
    } catch (_error) {
      return null;
    }
  }

  // Backward compatibility: admin form can send a Base64 data URL.
  const dataUrlPattern = /^data:image\/(?:png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=\r\n]+$/i;
  if (!dataUrlPattern.test(imageValue)) return null;
  if (imageValue.length > 4500000) return null;

  return imageValue;
};

const normalizeNoticeLink = (value) => {
  if (value == null || String(value).trim() === "") return "";
  try {
    const url = new URL(String(value).trim());
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch (_error) {
    return null;
  }
};

const normalizeNoticeActive = (value) => {
  if (value === undefined || value === null) return true;
  if (value === false || value === 0 || value === "false" || value === "0") return false;
  if (value === true || value === 1 || value === "true" || value === "1") return true;
  return Boolean(value);
};

/*
 * D.Pharm safety:
 * D.Pharm content is identified by Year + Language.
 * Add these paths at runtime too, so an older Note.js schema
 * cannot silently drop the new fields.
 */
if (!Note.schema.path("year")) {
  Note.schema.add({
    year: { type: String, default: "" }
  });
}

if (!Note.schema.path("language")) {
  Note.schema.add({
    language: { type: String, default: "" }
  });
}

// M.Pharm specialization is stored in branch and mirrored in mpharmBranch
// so both old/new admin clients can read it safely.
if (!Note.schema.path("mpharmBranch")) {
  Note.schema.add({
    mpharmBranch: { type: String, default: "" }
  });
}

// Direct Exam Crash Course / PYQs files are stored on disk so files
// larger than MongoDB's BSON document limit can be uploaded safely.
if (!Note.schema.path("isDirectFile")) {
  Note.schema.add({
    isDirectFile: { type: Boolean, default: false }
  });
}

if (!Note.schema.path("filePath")) {
  Note.schema.add({
    filePath: { type: String, default: "" }
  });
}

const DIRECT_UPLOAD_DIR =
  process.env.DIRECT_UPLOAD_DIR ||
  path.join(process.cwd(), "uploads", "direct-files");

fs.mkdirSync(DIRECT_UPLOAD_DIR, { recursive: true });

const DIRECT_MAX_FILE_SIZE =
  5 * 1024 * 1024 * 1024; // 5 GB

const normalizeDPharmYear = (value) => {
  const raw = String(value ?? "").trim();

  if (raw === "1" || /^1st\s*year$/i.test(raw)) {
    return "1st Year";
  }

  if (raw === "2" || /^2nd\s*year$/i.test(raw)) {
    return "2nd Year";
  }

  return raw;
};

const normalizePharmDYear = (value) => {
  const raw = String(value ?? "").trim();

  const match = raw.match(/^(?:year\s*)?([1-6])(?:st|nd|rd|th)?(?:\s*year)?$/i);
  if (match) return `${match[1]}${Number(match[1]) === 1 ? "st" : Number(match[1]) === 2 ? "nd" : Number(match[1]) === 3 ? "rd" : "th"} Year`;

  const spaced = raw.match(/^([1-6])\s*year$/i);
  if (spaced) {
    const n = Number(spaced[1]);
    return `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} Year`;
  }

  return raw;
};

const pharmDYearNumber = (value) => {
  const normalized = normalizePharmDYear(value);
  const match = normalized.match(/^([1-6])/);
  return match ? Number(match[1]) : null;
};

const {
  authMiddleware,
  isAdmin,
  hasCoursePermission
} = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "your_super_secret_key";

/* =========================================================
   MULTER - MEMORY STORAGE
========================================================= */

// Disk storage keeps large uploads out of Node.js RAM.
// Notes are still limited to 50MB and are converted to the existing
// Base64 format for backward compatibility. Direct Crash/PYQs files
// are moved to DIRECT_UPLOAD_DIR and are never Base64 encoded.
const tempStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DIRECT_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeName =
      `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage: tempStorage,
  limits: {
    fileSize: DIRECT_MAX_FILE_SIZE
  }
});

/* =========================================================
   INTERVIEW MATERIAL UPLOAD
   ========================================================= */

const interviewUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 300 * 1024 * 1024
  }
});

/* =========================================================
   ADMIN AUTH MIDDLEWARE
========================================================= */

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authorization header"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type === "admin") {
      const admin = await Admin.findById(
        decoded.adminId
      ).select("-password");

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Admin not found"
        });
      }

      if (admin.isActive === false) {
        return res.status(403).json({
          success: false,
          message: "Admin account is inactive"
        });
      }

      req.admin = {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        type: "admin"
      };

      return next();
    }

    if (decoded.email) {
      const admin = await Admin.findOne({
        email: decoded.email,
        isActive: true
      }).select("-password");

      if (admin) {
        req.admin = {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          type: "admin"
        };

        return next();
      }
    }

    if (
      decoded.role === "super_admin" ||
      decoded.role === "admin"
    ) {
      let superAdmin = await Admin.findOne({
        role: "super_admin"
      }).select("-password");

      if (
        !superAdmin &&
        decoded.email === process.env.ADMIN_EMAIL
      ) {
        superAdmin = new Admin({
          name: "Super Admin",
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: "super_admin",
          permissions: {
            courses: [
              "B.Pharm",
              "D.Pharm",
              "M.Pharm",
              "Pharm.D",
              "PhD"
            ]
          },
          isActive: true
        });

        await superAdmin.save();
      }

      if (superAdmin) {
        req.admin = {
          id: superAdmin._id,
          name: superAdmin.name,
          email: superAdmin.email,
          role: "super_admin",
          permissions: superAdmin.permissions,
          type: "admin"
        };

        return next();
      }
    }

    return res.status(401).json({
      success: false,
      message: "Not authorized"
    });

  } catch (error) {
    console.error(
      "❌ Admin Auth Error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

/* =========================================================
   COURSE PERMISSION
========================================================= */

const checkPermission = (
  courseField = "course"
) => {
  return async (req, res, next) => {
    try {
      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated"
        });
      }

      if (req.admin.role === "super_admin") {
        return next();
      }

      if (
        req.method === "POST" ||
        req.method === "PUT" ||
        req.method === "PATCH"
      ) {
        const course =
          req.body?.[courseField];

        const allowedCourses =
          req.admin.permissions?.courses || [];

        if (
          allowedCourses.includes(course)
        ) {
          return next();
        }

        return res.status(403).json({
          success: false,
          message:
            `No permission for ${course}`,
          allowedCourses
        });
      }

      next();

    } catch (error) {
      console.error(
        "Permission error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Permission check failed"
      });
    }
  };
};

/* =========================================================
   UPLOAD ROUTE
========================================================= */

router.post(
  "/upload",
  adminAuth,
  upload.single("file"),
  async (req, res) => {
    let tempFilePath = "";

    try {
      console.log("\n=================================");
      console.log("📤 ADMIN UPLOAD REQUEST");
      console.log("=================================");

      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      tempFilePath = file.path;

      const {
        course,
        branch,
        category,
        semester,
        year,
        subject,
        unit,
        units,
        title,
        description,
        isPremium,
        type,
        language,
        isDirectFile
      } = req.body;

      const normalizedCategory = String(category || "").trim();
      const cleanTitle = String(title || "").trim();
      const cleanDescription = String(description || "").trim();

      // Every upload category requires manually entered title and description.
      // Remove the multer temp file on validation failure to avoid orphan files.
      if (!cleanTitle || !cleanDescription) {
        try {
          if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (cleanupError) {
          console.error("Upload temp-file cleanup failed:", cleanupError.message);
        }
        return res.status(400).json({
          success: false,
          message: !cleanTitle
            ? "Title is required"
            : "Description is required"
        });
      }

      const directCategory =
        normalizedCategory === "Exam Crash Course" ||
        normalizedCategory === "PYQs";

      const normalizedCourse = String(course || branch || "").trim();
      const courseKey = normalizedCourse.toLowerCase();

      // M.Pharm has two distinct values:
      // branch is the course label ("M.Pharm"), while mpharmBranch is
      // the selected specialization (e.g. "Pharmaceutics").
      // Support older admin forms that send the specialization in branch.
      const rawBranch = String(branch || "").trim();
      const normalizedMPharmBranch =
        courseKey === "m.pharm"
          ? String(
              req.body.mpharmBranch ||
              (rawBranch && rawBranch.toLowerCase() !== "m.pharm" ? rawBranch : "")
            ).trim()
          : "";
      const normalizedBranch =
        courseKey === "m.pharm"
          ? "M.Pharm"
          : String(branch || course || "").trim();

      const isDPharm = courseKey === "d.pharm";
      const isPharmD = courseKey === "pharm.d";

      // Direct upload means ONLY title + description + file.
      // No semester, year, subject, unit, language or specialization
      // is required for Crash Course / PYQs.
      if (directCategory || String(isDirectFile).toLowerCase() === "true") {
        if (!normalizedCourse) {
          return res.status(400).json({
            success: false,
            message: "Course is required"
          });
        }

        if (courseKey === "m.pharm" && !normalizedMPharmBranch) {
          return res.status(400).json({
            success: false,
            message: "M.Pharm specialization/branch is required"
          });
        }

        // Move the uploaded temp file to a permanent, deterministic
        // directory. Never read the whole file into memory.
        const ext = path.extname(file.originalname || "");
        const permanentName =
          `${new mongoose.Types.ObjectId().toString()}-${Date.now()}${ext}`;
        const permanentPath =
          path.join(DIRECT_UPLOAD_DIR, permanentName);

        fs.renameSync(tempFilePath, permanentPath);
        // Keep this path so the catch block can remove the physical file
        // if MongoDB validation/save fails after the move.
        tempFilePath = permanentPath;

        const parsedSemester = Number.parseInt(semester, 10);
        const directData = {
          title: cleanTitle,
          description: cleanDescription,
          course: normalizedCourse,
          branch: normalizedBranch || normalizedCourse,
          mpharmBranch: normalizedMPharmBranch,
          category: normalizedCategory,
          language: isDPharm
            ? String(language || "").trim().toLowerCase()
            : "",
          semester:
            Number.isInteger(parsedSemester) && parsedSemester > 0
              ? parsedSemester
              : 1,
          year: isDPharm
            ? normalizeDPharmYear(year || semester)
            : isPharmD
              ? normalizePharmDYear(year || semester)
              : String(year || "").trim(),
          subject: String(subject || "").trim(),
          // Crash Course / PYQs intentionally do not require a unit.
          unit: 1,
          units: [],
          type: String(type || "note").trim() || "note",
          fileName: file.originalname,
          fileType: file.mimetype || "application/octet-stream",
          fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          // The original file is stored at filePath, not as Base64.
          fileData: "",
          filePath: permanentPath,
          isDirectFile: true,
          isPremium:
            isPremium === "true" || isPremium === true,
          thumbnail: req.body.thumbnail || "",
          downloadCount: 0,
          views: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const directContent = await Note.create(directData);

        console.log("✅ DIRECT FILE SAVED:", directContent._id);
        console.log("📦 Size:", file.size);
        console.log("📁 Path:", permanentPath);

        return res.status(201).json({
          success: true,
          message: "Direct file uploaded successfully",
          data: {
            id: directContent._id,
            _id: directContent._id,
            title: directContent.title,
            description: directContent.description,
            course: directContent.course,
            category: directContent.category,
            fileName: directContent.fileName,
            fileSize: directContent.fileSize,
            isPremium: directContent.isPremium,
            isDirectFile: true
          }
        });
      }

      // =========================
      // EXISTING NOTES FLOW
      // =========================
      if (courseKey === "m.pharm" && !normalizedMPharmBranch) {
        return res.status(400).json({
          success: false,
          message: "M.Pharm specialization/branch is required"
        });
      }

      const normalizedLanguage = language
        ? String(language).trim().toLowerCase()
        : "";

      const normalizedYear = isDPharm
        ? normalizeDPharmYear(year || semester)
        : isPharmD
        ? normalizePharmDYear(year || semester)
        : "";

      const needsLanguage =
        isDPharm &&
        normalizedCategory === "Notes";

      if (
        needsLanguage &&
        !["hindi", "english"].includes(normalizedLanguage)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Language is required for D.Pharm Notes"
        });
      }

      if (
        isDPharm &&
        !["1st Year", "2nd Year"].includes(normalizedYear)
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid D.Pharm Year is required"
        });
      }

      if (isPharmD && !pharmDYearNumber(normalizedYear)) {
        return res.status(400).json({
          success: false,
          message:
            "Valid Pharm.D Year is required (1st Year to 5th Year)"
        });
      }

      if (!type || type !== "note") {
        return res.status(400).json({
          success: false,
          message:
            "Invalid file type for Notes. Use 'note'."
        });
      }

      const semesterNumber = Number.parseInt(semester, 10);
      const unitNumber = Number.parseInt(unit, 10);

      if (!isDPharm && !isPharmD) {
        if (!Number.isInteger(semesterNumber) || semesterNumber <= 0) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid semester. Please select a valid semester."
          });
        }
      }

      if (!Number.isInteger(unitNumber) || unitNumber <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid unit. Please select Unit 1, Unit 2, etc."
        });
      }

      const base64Data =
        fs.readFileSync(tempFilePath).toString("base64");

      const fileData =
        `data:${file.mimetype};base64,${base64Data}`;

      let parsedUnits = [];

      try {
        parsedUnits = units
          ? JSON.parse(units)
          : [];
      } catch (_e) {
        parsedUnits = [];
      }

      let Model;
      let collectionName;

      if (type === "note") {
        Model = Note;
        collectionName = "notes";
      } else if (type === "video") {
        Model = Video;
        collectionName = "videos";
      } else if (type === "paper") {
        Model = Paper;
        collectionName = "papers";
      } else {
        return res.status(400).json({
          success: false,
          message:
            "Invalid file type. Use 'note', 'video', or 'paper'"
        });
      }

      const contentData = {
        title: cleanTitle,
        description: cleanDescription,

        course:
          normalizedCourse || "B.Pharm",

        branch:
          normalizedBranch || "B.Pharm",

        mpharmBranch: normalizedMPharmBranch,

        category: normalizedCategory,

        language:
          isDPharm && needsLanguage
            ? normalizedLanguage
            : (normalizedLanguage || undefined),

        semester:
          isDPharm ? 1 : semesterNumber,

        year:
          (isDPharm || isPharmD)
            ? normalizedYear
            : "",

        subject,

        unit:
          unitNumber,

        units:
          parsedUnits,

        fileName:
          file.originalname,

        fileType:
          file.mimetype,

        fileSize:
          `${(file.size / 1024 / 1024).toFixed(2)} MB`,

        fileData,

        filePath: "",

        isDirectFile: false,

        isPremium:
          isPremium === "true" ||
          isPremium === true,

        thumbnail:
          req.body.thumbnail || "",

        downloadCount:
          0,

        viewCount:
          0,

        createdAt:
          new Date(),

        updatedAt:
          new Date()
      };

      const newContent =
        new Model(contentData);

      await newContent.save();

      console.log(
        "✅ File uploaded and saved to database"
      );

      console.log(
        "✅ Collection:",
        collectionName
      );

      console.log(
        "✅ Document ID:",
        newContent._id
      );

      return res.status(201).json({
        success: true,

        message:
          "File uploaded successfully",

        data: {
          id:
            newContent._id,

          title:
            newContent.title,

          category:
            newContent.category,

          semester:
            newContent.semester,

          subject:
            newContent.subject,

          unit:
            newContent.unit,

          fileName:
            newContent.fileName,

          fileSize:
            newContent.fileSize,

          isPremium:
            newContent.isPremium
        }
      });

    } catch (error) {
      console.error(
        "❌ UPLOAD ERROR:",
        error
      );

      // If database save failed after a direct file was moved,
      // remove the orphaned physical file.
      if (tempFilePath) {
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
        } catch (_e) {}
      }

      return res.status(500).json({
        success: false,
        message:
          "Upload failed: " +
          error.message
      });
    }
  }
);


/* =========================================================
   ADMIN LOGIN ROUTE
========================================================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    let admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        admin = new Admin({
          name: "Super Admin",
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: "super_admin",
          permissions: {
            courses: ["B.Pharm", "D.Pharm", "M.Pharm", "Pharm.D", "PhD"]
          },
          isActive: true
        });
        await admin.save();
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }
    }

    if (admin.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Admin account is inactive"
      });
    }

    let isMatch = false;

    if (admin.email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      isMatch = true;
    } else if (admin.comparePassword) {
      isMatch = await admin.comparePassword(password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        role: admin.role,
        type: "admin"
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        type: "admin"
      }
    });

  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});


/* =========================================================
   SUB-ADMIN MANAGEMENT
   Super-admin only. Uses Admin model's existing password
   hashing hook; never returns password hashes to the client.
========================================================= */

const VALID_ADMIN_COURSES = [
  "B.Pharm",
  "D.Pharm",
  "M.Pharm",
  "Pharm.D",
  "PhD"
];

const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Only the super admin can manage sub-admins"
    });
  }
  return next();
};

const normalizeAdminCourses = (body = {}) => {
  const rawCourses =
    body.courses ??
    body.selectedCourses ??
    body.permissions?.courses ??
    [];

  if (!Array.isArray(rawCourses)) {
    return { error: "Courses must be an array" };
  }

  const courses = [...new Set(rawCourses.map((course) => String(course).trim()))];

  const invalidCourses = courses.filter(
    (course) => !VALID_ADMIN_COURSES.includes(course)
  );

  if (invalidCourses.length) {
    return {
      error: `Invalid course permission(s): ${invalidCourses.join(", ")}`
    };
  }

  return { courses };
};

const publicSubAdmin = (admin) => ({
  _id: admin._id,
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  permissions: {
    courses: admin.permissions?.courses || []
  },
  isActive: admin.isActive !== false,
  createdAt: admin.createdAt,
  lastLogin: admin.lastLogin
});

// GET /api/admin/subadmins
router.get(
  "/subadmins",
  adminAuth,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const admins = await Admin.find({ role: "sub_admin" })
        .select("-password")
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        subAdmins: admins.map(publicSubAdmin),
        count: admins.length
      });
    } catch (error) {
      console.error("Fetch sub-admins error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch sub-admins"
      });
    }
  }
);

// POST /api/admin/register-subadmin
router.post(
  "/register-subadmin",
  adminAuth,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const name = String(req.body?.name || "").trim();
      const email = String(req.body?.email || "").trim().toLowerCase();
      const password = String(req.body?.password || "");
      const normalized = normalizeAdminCourses(req.body || {});

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email and password are required"
        });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address"
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long"
        });
      }

      if (normalized.error) {
        return res.status(400).json({
          success: false,
          message: normalized.error
        });
      }

      const existing = await Admin.findOne({ email }).select("_id");
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "An admin with this email already exists"
        });
      }

      const subAdmin = new Admin({
        name,
        email,
        password,
        role: "sub_admin",
        permissions: { courses: normalized.courses },
        createdBy: req.admin.id,
        isActive: req.body?.isActive === undefined
          ? true
          : req.body.isActive !== false && req.body.isActive !== "false"
      });

      // Admin.js hashes the password in its pre-save hook.
      await subAdmin.save();

      return res.status(201).json({
        success: true,
        message: "Sub-admin created successfully",
        subAdmin: publicSubAdmin(subAdmin)
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "An admin with this email already exists"
        });
      }

      console.error("Register sub-admin error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create sub-admin"
      });
    }
  }
);

// PUT /api/admin/subadmins/:id
router.put(
  "/subadmins/:id",
  adminAuth,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid sub-admin ID"
        });
      }

      const subAdmin = await Admin.findOne({
        _id: id,
        role: "sub_admin"
      }).select("+password");

      if (!subAdmin) {
        return res.status(404).json({
          success: false,
          message: "Sub-admin not found"
        });
      }

      const body = req.body || {};

      if (body.name !== undefined) {
        const name = String(body.name).trim();
        if (!name) {
          return res.status(400).json({
            success: false,
            message: "Name cannot be empty"
          });
        }
        subAdmin.name = name;
      }

      if (body.email !== undefined) {
        const email = String(body.email).trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid email address"
          });
        }

        const duplicate = await Admin.findOne({
          email,
          _id: { $ne: subAdmin._id }
        }).select("_id");

        if (duplicate) {
          return res.status(409).json({
            success: false,
            message: "An admin with this email already exists"
          });
        }
        subAdmin.email = email;
      }

      if (body.password !== undefined && String(body.password) !== "") {
        const password = String(body.password);
        if (password.length < 8) {
          return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long"
          });
        }
        subAdmin.password = password;
      }

      if (
        body.courses !== undefined ||
        body.selectedCourses !== undefined ||
        body.permissions?.courses !== undefined
      ) {
        const normalized = normalizeAdminCourses(body);
        if (normalized.error) {
          return res.status(400).json({
            success: false,
            message: normalized.error
          });
        }
        subAdmin.permissions = { courses: normalized.courses };
      }

      if (body.isActive !== undefined) {
        if (typeof body.isActive === "boolean") {
          subAdmin.isActive = body.isActive;
        } else if (body.isActive === "true" || body.isActive === 1) {
          subAdmin.isActive = true;
        } else if (body.isActive === "false" || body.isActive === 0) {
          subAdmin.isActive = false;
        } else {
          return res.status(400).json({
            success: false,
            message: "isActive must be true or false"
          });
        }
      }

      await subAdmin.save();

      return res.json({
        success: true,
        message: "Sub-admin updated successfully",
        subAdmin: publicSubAdmin(subAdmin)
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "An admin with this email already exists"
        });
      }

      console.error("Update sub-admin error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update sub-admin"
      });
    }
  }
);

// DELETE /api/admin/subadmins/:id
router.delete(
  "/subadmins/:id",
  adminAuth,
  requireSuperAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid sub-admin ID"
        });
      }

      const subAdmin = await Admin.findOneAndDelete({
        _id: id,
        role: "sub_admin"
      });

      if (!subAdmin) {
        return res.status(404).json({
          success: false,
          message: "Sub-admin not found"
        });
      }

      return res.json({
        success: true,
        message: "Sub-admin deleted successfully",
        id: subAdmin._id
      });
    } catch (error) {
      console.error("Delete sub-admin error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete sub-admin"
      });
    }
  }
);


/* =========================================================
   DASHBOARD STATS
========================================================= */

router.get(
  "/stats",
  adminAuth,
  async (req, res) => {
    try {
      let totalNotes =
        await Note.countDocuments();

      let totalVideos =
        await Video.countDocuments();

      let totalUsers =
        await User.countDocuments();

      let totalPaidPDFs =
        await PaidPDF.countDocuments();

      let totalPapers =
        await Paper.countDocuments();

      if (
        req.admin.role !==
        "super_admin"
      ) {
        const allowedCourses =
          req.admin.permissions
            ?.courses || [];

        totalNotes =
          await Note.countDocuments({
            course: {
              $in:
                allowedCourses
            }
          });

        totalVideos =
          await Video.countDocuments({
            course: {
              $in:
                allowedCourses
            }
          });

        totalPaidPDFs =
          await PaidPDF.countDocuments({
            course: {
              $in:
                allowedCourses
            }
          });

        totalPapers =
          await Paper.countDocuments({
            course: {
              $in:
                allowedCourses
            }
          });
      }

      res.json({
        totalNotes,
        totalVideos,
        totalUsers,
        totalPaidPDFs,
        totalPapers
      });

    } catch (error) {
      console.error(
        error
      );

      res.status(500).json({
        message:
          "Server Error"
      });
    }
  }
);

/* =========================================================
   ADMIN DASHBOARD ANALYTICS
========================================================= */

router.get(
  "/popular-content",
  adminAuth,
  async (req, res) => {
    try {
      const [
        notes,
        videos,
        paidPDFs,
        papers
      ] = await Promise.all([
        Note.find()
          .select(
            "_id title course viewCount createdAt"
          )
          .sort({
            viewCount: -1
          })
          .limit(10)
          .lean(),

        Video.find()
          .select(
            "_id title course viewCount createdAt"
          )
          .sort({
            viewCount: -1
          })
          .limit(10)
          .lean(),

        PaidPDF.find()
          .select(
            "_id title course viewCount createdAt"
          )
          .sort({
            viewCount: -1
          })
          .limit(10)
          .lean(),

        Paper.find()
          .select(
            "_id title course viewCount createdAt"
          )
          .sort({
            viewCount: -1
          })
          .limit(10)
          .lean()
      ]);

      const combined =
        [
          ...notes,
          ...videos,
          ...paidPDFs,
          ...papers
        ]
          .map(item => ({
            ...item,

            views:
              Number(
                item.viewCount ||
                item.views ||
                0
              )
          }))
          .sort(
            (a, b) =>
              b.views -
              a.views
          )
          .slice(
            0,
            10
          );

      return res.json({
        success:
          true,

        notes:
          combined
      });

    } catch (error) {
      console.error(
        "Popular content error:",
        error
      );

      return res.json({
        success:
          true,

        notes:
          []
      });
    }
  }
);

router.get(
  "/recent-activity",
  adminAuth,
  async (req, res) => {
    try {
      const [
        notes,
        videos,
        paidPDFs,
        papers,
        users
      ] = await Promise.all([
        Note.find()
          .select(
            "title createdAt"
          )
          .sort({
            createdAt: -1
          })
          .limit(10)
          .lean(),

        Video.find()
          .select(
            "title createdAt"
          )
          .sort({
            createdAt: -1
          })
          .limit(10)
          .lean(),

        PaidPDF.find()
          .select(
            "title createdAt"
          )
          .sort({
            createdAt: -1
          })
          .limit(10)
          .lean(),

        Paper.find()
          .select(
            "title createdAt"
          )
          .sort({
            createdAt: -1
          })
          .limit(10)
          .lean(),

        User.find()
          .select(
            "name createdAt"
          )
          .sort({
            createdAt: -1
          })
          .limit(10)
          .lean()
      ]);

      const activities = [
        ...notes.map(
          x => ({
            message:
              `New note: ${
                x.title ||
                "Untitled"
              }`,

            time:
              x.createdAt
          })
        ),

        ...videos.map(
          x => ({
            message:
              `New video: ${
                x.title ||
                "Untitled"
              }`,

            time:
              x.createdAt
          })
        ),

        ...paidPDFs.map(
          x => ({
            message:
              `New paid PDF: ${
                x.title ||
                "Untitled"
              }`,

            time:
              x.createdAt
          })
        ),

        ...papers.map(
          x => ({
            message:
              `New paper: ${
                x.title ||
                "Untitled"
              }`,

            time:
              x.createdAt
          })
        ),

        ...users.map(
          x => ({
            message:
              `New user: ${
                x.name ||
                "User"
              }`,

            time:
              x.createdAt
          })
        )
      ]
        .sort(
          (a, b) =>
            new Date(
              b.time || 0
            ) -
            new Date(
              a.time || 0
            )
        )
        .slice(
          0,
          20
        );

      return res.json({
        success:
          true,

        activities
      });

    } catch (error) {
      console.error(
        "Recent activity error:",
        error
      );

      return res.json({
        success:
          true,

        activities:
          []
      });
    }
  }
);

router.get(
  "/revenue-stats",
  adminAuth,
  async (req, res) => {
    try {
      const totalDownloads =
        await Promise.all([
          Note.aggregate([
            {
              $group: {
                _id: null,

                total: {
                  $sum: {
                    $ifNull: [
                      "$downloadCount",
                      0
                    ]
                  }
                }
              }
            }
          ]),

          Video.aggregate([
            {
              $group: {
                _id: null,

                total: {
                  $sum: {
                    $ifNull: [
                      "$downloadCount",
                      0
                    ]
                  }
                }
              }
            }
          ]),

          PaidPDF.aggregate([
            {
              $group: {
                _id: null,

                total: {
                  $sum: {
                    $ifNull: [
                      "$downloadCount",
                      0
                    ]
                  }
                }
              }
            }
          ]),

          Paper.aggregate([
            {
              $group: {
                _id: null,

                total: {
                  $sum: {
                    $ifNull: [
                      "$downloadCount",
                      0
                    ]
                  }
                }
              }
            }
          ])
        ]);

      const downloads =
        totalDownloads.reduce(
          (
            sum,
            result
          ) =>
            sum +
            Number(
              result?.[0]?.total ||
              0
            ),

          0
        );

      return res.json({
        success:
          true,

        totalRevenue:
          0,

        totalDownloads:
          downloads,

        activeUsers:
          await User.countDocuments({
            isActive: {
              $ne: false
            }
          }),

        revenueGrowth:
          0,

        downloadGrowth:
          0
      });

    } catch (error) {
      console.error(
        "Revenue stats error:",
        error
      );

      return res.json({
        success:
          true,

        totalRevenue:
          0,

        totalDownloads:
          0,

        activeUsers:
          0,

        revenueGrowth:
          0,

        downloadGrowth:
          0
      });
    }
  }
);

router.get(
  "/weekly-performance",
  adminAuth,
  async (req, res) => {
    try {
      const days = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
      ];

      const now =
        new Date();

      const data = [];

      for (
        let i = 6;
        i >= 0;
        i--
      ) {
        const date =
          new Date(now);

        date.setHours(
          0,
          0,
          0,
          0
        );

        date.setDate(
          date.getDate() -
          i
        );

        const next =
          new Date(date);

        next.setDate(
          next.getDate() +
          1
        );

        const [
          views,
          downloads
        ] = await Promise.all([
          Promise.all([
            Note.aggregate([
              {
                $match: {
                  createdAt: {
                    $gte:
                      date,

                    $lt:
                      next
                  }
                }
              },

              {
                $group: {
                  _id:
                    null,

                  total: {
                    $sum: {
                      $ifNull: [
                        "$viewCount",
                        0
                      ]
                    }
                  }
                }
              }
            ]),

            Video.aggregate([
              {
                $match: {
                  createdAt: {
                    $gte:
                      date,

                    $lt:
                      next
                  }
                }
              },

              {
                $group: {
                  _id:
                    null,

                  total: {
                    $sum: {
                      $ifNull: [
                        "$viewCount",
                        0
                      ]
                    }
                  }
                }
              }
            ])
          ]),

          Promise.all([
            Note.aggregate([
              {
                $match: {
                  createdAt: {
                    $gte:
                      date,

                    $lt:
                      next
                  }
                }
              },

              {
                $group: {
                  _id:
                    null,

                  total: {
                    $sum: {
                      $ifNull: [
                        "$downloadCount",
                        0
                      ]
                    }
                  }
                }
              }
            ]),

            Video.aggregate([
              {
                $match: {
                  createdAt: {
                    $gte:
                      date,

                    $lt:
                      next
                  }
                }
              },

              {
                $group: {
                  _id:
                    null,

                  total: {
                    $sum: {
                      $ifNull: [
                        "$downloadCount",
                        0
                      ]
                    }
                  }
                }
              }
            ])
          ])
        ]);

        data.push({
          day:
            days[
              date.getDay()
            ],

          views:
            Number(
              views[0]?.[0]
                ?.total || 0
            ) +
            Number(
              views[1]?.[0]
                ?.total || 0
            ),

          downloads:
            Number(
              downloads[0]?.[0]
                ?.total || 0
            ) +
            Number(
              downloads[1]?.[0]
                ?.total || 0
            ),

          revenue:
            0
        });
      }

      return res.json({
        success:
          true,

        data
      });

    } catch (error) {
      console.error(
        "Weekly performance error:",
        error
      );

      return res.json({
        success:
          true,

        data:
          [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun"
          ].map(
            day => ({
              day,
              views: 0,
              downloads: 0,
              revenue: 0
            })
          )
      });
    }
  }
);

/* =========================================================
   ✅ FIXED: PUBLIC NOTES - GET ALL NOTES FOR A SUBJECT
   Now properly returns all documents with unit > 0
   ========================================================= */

router.get("/public/notes", async (req, res) => {
  try {
    const {
      course,
      category,
      semester,
      year,
      subject,
      unit,
      branch,
      mpharmBranch,
      language
    } = req.query;

    const normalizedLanguage = String(language || "").trim().toLowerCase();
    const normalizedYear = normalizeDPharmYear(year);
    const selectedCourse = String(course || branch || "").trim();
    const selectedCourseKey = selectedCourse.toLowerCase();
    const isDPharm = selectedCourseKey === "d.pharm";
    const isPharmD = selectedCourseKey === "pharm.d";
    const isMPharm = selectedCourseKey === "m.pharm";

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: "Database not connected" });
    }

    const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const exactRegex = (value) => ({ $regex: `^${escapeRegex(value)}$`, $options: "i" });
    const query = {};

    if (category && String(category).trim()) query.category = exactRegex(category.trim());

    if (isDPharm) {
      if (!["1st Year", "2nd Year"].includes(normalizedYear)) {
        return res.status(400).json({ success: false, message: "Valid D.Pharm Year is required" });
      }
      const yearNumber = Number(normalizedYear[0]);
      const yearValues = yearNumber === 1 ? ["1st Year", "1", "Year 1", 1] : ["2nd Year", "2", "Year 2", 2];
      query.$and = query.$and || [];
      query.$and.push({ $or: [{ year: { $in: yearValues } }, { semester: yearNumber }] });
    } else if (isPharmD) {
      const normalizedPharmD = normalizePharmDYear(year || semester);
      const pharmDNumber = pharmDYearNumber(normalizedPharmD);
      if (!pharmDNumber) {
        return res.status(400).json({ success: false, message: "Valid Pharm.D Year is required (1st Year to 6th Year)" });
      }
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { year: { $in: [normalizedPharmD, String(pharmDNumber), `${pharmDNumber} Year`, `Year ${pharmDNumber}`, pharmDNumber] } },
          { semester: pharmDNumber }
        ]
      });
    } else if (semester !== undefined && semester !== "") {
      const semesterNumber = Number.parseInt(semester, 10);
      if (!Number.isInteger(semesterNumber) || semesterNumber <= 0) {
        return res.status(400).json({ success: false, message: "Invalid semester" });
      }
      query.semester = semesterNumber;
    }

    if (subject && String(subject).trim()) query.subject = exactRegex(subject.trim());

    if (unit !== undefined && unit !== "") {
      const unitNumber = Number.parseInt(unit, 10);
      if (!Number.isInteger(unitNumber) || unitNumber <= 0) {
        return res.status(400).json({ success: false, message: "Invalid unit" });
      }
      query.unit = unitNumber;
    }

    if (course && String(course).trim()) query.course = exactRegex(course.trim());

    // M.Pharm uploads use course="M.Pharm", branch="M.Pharm" and
    // mpharmBranch=<specialization>. Older records may keep the specialization
    // in branch and have no mpharmBranch. Support both formats without mixing branches.
    if (isMPharm && mpharmBranch && String(mpharmBranch).trim()) {
      const specialization = String(mpharmBranch).trim();
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { mpharmBranch: exactRegex(specialization) },
          {
            $and: [
              { $or: [{ mpharmBranch: "" }, { mpharmBranch: { $exists: false } }, { mpharmBranch: null }] },
              { branch: exactRegex(specialization) }
            ]
          }
        ]
      });
    } else if (branch && String(branch).trim()) {
      query.branch = exactRegex(branch.trim());
    }

    const needsLanguage = isDPharm && ["Notes", "Exam Crash Course"].includes(String(category || "").trim());
    if (needsLanguage) {
      if (!["hindi", "english"].includes(normalizedLanguage)) {
        return res.status(400).json({ success: false, message: "Language is required for D.Pharm Notes and Exam Crash Course" });
      }
      query.language = exactRegex(normalizedLanguage);
    } else if (normalizedLanguage) {
      query.language = exactRegex(normalizedLanguage);
    }

    console.log("📚 PUBLIC NOTES QUERY:", JSON.stringify(query, null, 2));

    const notes = await Note.collection
      .find(query, { projection: { fileData: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    // Only records with valid positive unit numbers can create unit cards.
    const validNotes = notes.filter((note) => Number.isInteger(Number(note.unit)) && Number(note.unit) > 0);

    console.log(`📄 Public notes found: ${notes.length}; valid unit records: ${validNotes.length}`);
    return res.json({ success: true, data: validNotes, count: validNotes.length, total: notes.length });
  } catch (error) {
    console.error("❌ PUBLIC NOTES ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch notes", error: error.message });
  }
});

/* =========================================================
   PUBLIC NOTES DOWNLOAD
========================================================= */

router.get(
  "/public/notes/:id/download",
  async (req, res) => {
    try {
      const {
        id
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid note ID"
        });
      }

      const note =
        await Note.findById(id);

      if (!note) {
        return res.status(404).json({
          success: false,
          message: "Note not found"
        });
      }

      if (!note.fileData) {
        return res.status(404).json({
          success: false,
          message: "File data not found"
        });
      }

      const matches =
        note.fileData.match(
          /^data:(.+);base64,(.+)$/
        );

      if (!matches) {
        return res.status(500).json({
          success: false,
          message: "Invalid file data"
        });
      }

      const mimeType =
        matches[1];

      const base64 =
        matches[2];

      const buffer =
        Buffer.from(
          base64,
          "base64"
        );

      const fileName =
        note.fileName ||
        note.title ||
        "download";

      res.setHeader(
        "Content-Type",
        mimeType
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      res.setHeader(
        "Content-Length",
        buffer.length
      );

      await Note.findByIdAndUpdate(
        id,
        {
          $inc: {
            downloadCount: 1
          }
        }
      );

      return res.send(
        buffer
      );

    } catch (error) {
      console.error(
        "❌ Download error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Download failed"
      });
    }
  }
);

/* =========================================================
   PUBLIC NOTE VIEW COUNT
========================================================= */

router.post(
  "/public/notes/:id/view",
  async (req, res) => {
    try {
      const {
        id
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid note ID"
        });
      }

      await Note.findByIdAndUpdate(
        id,
        {
          $inc: {
            viewCount: 1
          }
        }
      );

      return res.json({
        success: true
      });

    } catch (error) {
      console.error(
        "View count error:",
        error
      );

      return res.status(500).json({
        success: false
      });
    }
  }
);

/* =========================================================
   PUBLIC UNITS
========================================================= */

router.get(
  "/public/units",
  async (req, res) => {
    try {
      console.log("\n=================================");
      console.log("📚 PUBLIC UNITS REQUEST");
      console.log("=================================");

      const {
        category,
        semester,
        subject,
        branch,
        course,
        year,
        language
      } = req.query;

      const normalizedLanguage = language
        ? String(language).trim().toLowerCase()
        : "";

      const normalizedYear = normalizeDPharmYear(year);

      console.log("Category:", category);
      console.log("Semester:", semester);
      console.log("Subject:", subject);
      console.log("Branch:", branch);
      console.log("Course:", course);
      console.log("Language:", normalizedLanguage);

      if (mongoose.connection.readyState !== 1) {
        console.error("❌ MongoDB is not connected");
        return res.status(500).json({
          success: false,
          message: "Database not connected"
        });
      }

      const query = {};

      if (category !== undefined && category !== "") {
        query.category = {
          $regex: `^${String(category).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`,
          $options: "i"
        };
      }

      const selectedCourse = course || branch;

      const selectedCourseKey =
        String(selectedCourse || "").trim().toLowerCase();

      const isDPharm = selectedCourseKey === "d.pharm";
      const isPharmD = selectedCourseKey === "pharm.d";

      if (isDPharm) {
        if (!["1st Year", "2nd Year"].includes(normalizedYear)) {
          return res.status(400).json({
            success: false,
            message: "Valid D.Pharm Year is required"
          });
        }

        // D.Pharm legacy-safe year matching. Older records may have year
        // as Number/String or may only have semester=1/2.
        const yearValues = normalizedYear === "1st Year"
          ? ["1st Year", "1", "Year 1", 1]
          : ["2nd Year", "2", "Year 2", 2];

        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { year: { $in: yearValues } },
            { semester: Number(normalizedYear[0]) }
          ]
        });
      } else if (isPharmD) {
        const requestedYear = year || semester;
        const normalizedPharmD = normalizePharmDYear(requestedYear);
        const pharmDNumber = pharmDYearNumber(normalizedPharmD);

        if (!pharmDNumber) {
          return res.status(400).json({
            success: false,
            message: "Valid Pharm.D Year is required (1st Year to 6th Year)"
          });
        }

        const yearValues = [
          normalizedPharmD,
          String(pharmDNumber),
          `${pharmDNumber} Year`,
          `Year ${pharmDNumber}`,
          pharmDNumber
        ];

        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { year: { $in: yearValues } },
            { semester: pharmDNumber }
          ]
        });
      } else if (semester !== undefined && semester !== "") {
        const semesterNumber = Number.parseInt(semester, 10);

        if (!Number.isInteger(semesterNumber) || semesterNumber <= 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid semester"
          });
        }

        query.semester = semesterNumber;
      }

      if (subject !== undefined && subject !== "") {
        query.subject = {
          $regex: `^${String(subject).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}$`,
          $options: "i"
        };
      }

      // STRICT course + branch separation.
      // Never use course OR branch here: that can mix M.Pharm branches.
      if (course && String(course).trim() !== "") {
        const escapedCourse = String(course).replace(
          /[.*+?^${}()|[\\]\\]/g,
          "\\$&"
        );

        query.course = {
          $regex: `^${escapedCourse}$`,
          $options: "i"
        };
      }

      if (branch && String(branch).trim() !== "") {
        const escapedBranch = String(branch).replace(
          /[.*+?^${}()|[\\]\\]/g,
          "\\$&"
        );

        query.branch = {
          $regex: `^${escapedBranch}$`,
          $options: "i"
        };
      }

      const needsLanguage =
        isDPharm &&
        ["Notes", "Exam Crash Course"].includes(
          String(category || "").trim()
        );

      if (needsLanguage) {
        if (!["hindi", "english"].includes(normalizedLanguage)) {
          return res.status(400).json({
            success: false,
            message:
              "Language is required for D.Pharm Notes and Exam Crash Course"
          });
        }

        // Case-insensitive language match so old "English"/"Hindi"
      // records work exactly like new lowercase records.
      query.language = {
        $regex: `^${normalizedLanguage}$`,
        $options: "i"
      };
      } else if (normalizedLanguage) {
        // Case-insensitive language match so old "English"/"Hindi"
      // records work exactly like new lowercase records.
      query.language = {
        $regex: `^${normalizedLanguage}$`,
        $options: "i"
      };
      }

      console.log(
        "🔎 Mongo Query:",
        JSON.stringify(query, null, 2)
      );

      const notes = await Note.collection
        .find(query, { projection: { _id: 1, unit: 1, units: 1, language: 1 } })
        .toArray();

      console.log("📄 Documents Found:", notes.length);

      const unitsSet = new Set();

      for (const note of notes) {
        const unitNumber = Number(note?.unit);

        if (Number.isInteger(unitNumber) && unitNumber > 0) {
          unitsSet.add(unitNumber);
        }

        if (Array.isArray(note?.units)) {
          note.units.forEach((u) => {
            const id = Number(u?.id);

            if (Number.isInteger(id) && id > 0) {
              unitsSet.add(id);
            }
          });
        }
      }

      const sortedUnits = Array.from(unitsSet)
        .sort((a, b) => a - b)
        .map((unitNumber) => ({
          id: unitNumber,
          unit: unitNumber,
          name: `Unit ${unitNumber}`,
          title: `Unit ${unitNumber}`
        }));

      console.log("📚 Units:", sortedUnits);
      console.log("=================================\n");

      return res.json({
        success: true,
        data: sortedUnits,
        count: sortedUnits.length
      });
    } catch (error) {
      console.error("\n❌ PUBLIC UNITS ERROR:");
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch units",
        error: error.message
      });
    }
  }
);

/* =========================================================
   PUBLIC VIDEOS
========================================================= */

router.get(
  "/public/videos",
  async (req, res) => {
    try {
      const {
        course,
        category,
        semester,
        subject,
        unit
      } = req.query;

      const filter = {};

      if (course) {
        filter.course =
          course;
      }

      if (category) {
        filter.category =
          category;
      }

      if (
        semester !== undefined &&
        semester !== ""
      ) {
        filter.semester =
          Number(semester);
      }

      if (subject) {
        filter.subject =
          subject;
      }

      if (
        unit !== undefined &&
        unit !== ""
      ) {
        filter.unit =
          Number(unit);
      }

      const videos =
        await Video.find(
          filter
        )
          .select(
            "-fileData"
          )
          .sort({
            createdAt: -1
          });

      return res.json(
        videos
      );

    } catch (error) {
      console.error(
        "Public videos error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch videos"
      });
    }
  }
);

/* =========================================================
   PUBLIC VIDEO FILE
========================================================= */

router.get(
  "/public/videos/:id/file",
  async (req, res) => {
    try {
      const {
        id
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid video ID"
        });
      }

      const video =
        await Video.findById(
          id
        );

      if (!video) {
        return res.status(404).json({
          success: false,
          message: "Video not found"
        });
      }

      if (!video.fileData) {
        return res.status(404).json({
          success: false,
          message: "Video file not found"
        });
      }

      const matches =
        video.fileData.match(
          /^data:(.+);base64,(.+)$/
        );

      if (!matches) {
        return res.status(500).json({
          success: false,
          message: "Invalid video data"
        });
      }

      const mimeType =
        matches[1];

      const buffer =
        Buffer.from(
          matches[2],
          "base64"
        );

      res.setHeader(
        "Content-Type",
        mimeType
      );

      res.setHeader(
        "Content-Length",
        buffer.length
      );

      return res.send(
        buffer
      );

    } catch (error) {
      console.error(
        "Public video file error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to load video"
      });
    }
  }
);

/* =========================================================
   PUBLIC PAPERS
========================================================= */

router.get(
  "/public/papers",
  async (req, res) => {
    try {
      const {
        course,
        category,
        semester,
        subject,
        unit
      } = req.query;

      const filter = {};

      if (course) {
        filter.course =
          course;
      }

      if (category) {
        filter.category =
          category;
      }

      if (
        semester !== undefined &&
        semester !== ""
      ) {
        filter.semester =
          Number(semester);
      }

      if (subject) {
        filter.subject =
          subject;
      }

      if (
        unit !== undefined &&
        unit !== ""
      ) {
        filter.unit =
          Number(unit);
      }

      const papers =
        await Paper.find(
          filter
        )
          .select(
            "-fileData"
          )
          .sort({
            createdAt: -1
          });

      return res.json(
        papers
      );

    } catch (error) {
      console.error(
        "Public papers error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch papers"
      });
    }
  }
);

/* =========================================================
   PUBLIC PAID PDFS
========================================================= */

router.get(
  "/public/paid-pdfs",
  async (req, res) => {
    try {
      const {
        course,
        category,
        semester,
        subject,
        unit
      } = req.query;

      const filter = {};

      if (course) {
        filter.course =
          course;
      }

      if (category) {
        filter.category =
          category;
      }

      if (
        semester !== undefined &&
        semester !== ""
      ) {
        filter.semester =
          Number(semester);
      }

      if (subject) {
        filter.subject =
          subject;
      }

      if (
        unit !== undefined &&
        unit !== ""
      ) {
        filter.unit =
          Number(unit);
      }

      const pdfs =
        await PaidPDF.find(
          filter
        )
          .select(
            "-fileData"
          )
          .sort({
            createdAt: -1
          });

      return res.json(
        pdfs
      );

    } catch (error) {
      console.error(
        "Public paid PDFs error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch paid PDFs"
      });
    }
  }
);

/* =========================================================
   PUBLIC FREE MATERIAL
========================================================= */

router.get(
  "/public/free-material",
  async (req, res) => {
    try {
      const {
        course,
        category,
        semester,
        subject,
        unit
      } = req.query;

      const filter = {};

      if (course) {
        filter.course =
          course;
      }

      if (category) {
        filter.category =
          category;
      }

      if (
        semester !== undefined &&
        semester !== ""
      ) {
        filter.semester =
          Number(semester);
      }

      if (subject) {
        filter.subject =
          subject;
      }

      if (
        unit !== undefined &&
        unit !== ""
      ) {
        filter.unit =
          Number(unit);
      }

      const materials =
        await FreeMaterial.find(
          filter
        )
          .select(
            "-fileData"
          )
          .sort({
            createdAt: -1
          });

      return res.json(
        materials
      );

    } catch (error) {
      console.error(
        "Public free material error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch free material"
      });
    }
  }
);

/* =========================================================
   ADMIN GET ALL NOTES
========================================================= */

router.get(
  "/notes",
  adminAuth,
  async (req, res) => {
    try {
      const {
        course,
        category,
        semester,
        subject,
        unit
      } = req.query;

      const filter = {};

      if (course) {
        filter.course =
          course;
      }

      if (category) {
        filter.category =
          category;
      }

      if (
        semester !== undefined &&
        semester !== ""
      ) {
        filter.semester =
          Number(semester);
      }

      if (subject) {
        filter.subject =
          subject;
      }

      if (
        unit !== undefined &&
        unit !== ""
      ) {
        filter.unit =
          Number(unit);
      }

      if (
        req.admin.role !==
        "super_admin"
      ) {
        const allowedCourses =
          req.admin.permissions
            ?.courses || [];

        filter.course = {
          $in:
            allowedCourses
        };
      }

      const notes =
        await Note.find(
          filter
        )
          .select(
            "-fileData"
          )
          .sort({
            createdAt: -1
          });

      return res.json({
        success: true,

        data:
          notes
      });

    } catch (error) {
      console.error(
        "Admin notes error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch notes"
      });
    }
  }
);

/* =========================================================
   GET SINGLE NOTE
========================================================= */

router.get(
  "/notes/:id",
  adminAuth,
  async (req, res) => {
    try {
      const {
        id
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid note ID"
        });
      }

      const note =
        await Note.findById(
          id
        ).select(
          "-fileData"
        );

      if (!note) {
        return res.status(404).json({
          success: false,
          message: "Note not found"
        });
      }

      return res.json({
        success: true,

        data:
          note
      });

    } catch (error) {
      console.error(
        "Get note error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch note"
      });
    }
  }
);

/* =========================================================
   DELETE NOTE
========================================================= */

router.delete(
  "/notes/:id",
  adminAuth,
  async (req, res) => {
    try {
      const {
        id
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid note ID"
        });
      }

      const note =
        await Note.findById(
          id
        );

      if (!note) {
        return res.status(404).json({
          success: false,
          message: "Note not found"
        });
      }

      if (
        req.admin.role !==
        "super_admin"
      ) {
        const allowedCourses =
          req.admin.permissions
            ?.courses || [];

        if (
          !allowedCourses.includes(
            note.course
          )
        ) {
          return res.status(403).json({
            success: false,

            message:
              "You do not have permission to delete this note"
          });
        }
      }

      // Remove the physical file for direct Crash/PYQs uploads.
      if (
        note.isDirectFile &&
        note.filePath
      ) {
        try {
          const resolvedPath = path.resolve(note.filePath);
          const allowedRoot = path.resolve(DIRECT_UPLOAD_DIR);

          if (
            resolvedPath.startsWith(
              `${allowedRoot}${path.sep}`
            ) &&
            fs.existsSync(resolvedPath)
          ) {
            fs.unlinkSync(resolvedPath);
          }
        } catch (fileDeleteError) {
          console.error(
            "Direct file cleanup error:",
            fileDeleteError
          );
        }
      }

      await Note.findByIdAndDelete(
        id
      );

      return res.json({
        success: true,

        message:
          "Note deleted successfully"
      });

    } catch (error) {
      console.error(
        "Delete note error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to delete note"
      });
    }
  }
);

/* =========================================================
   ADMIN GET VIDEOS
========================================================= */

router.get(
  "/videos",
  adminAuth,
  async (req, res) => {
    try {
      const {
        course,
        category,
        semester,
        subject,
        unit
      } = req.query;

      const filter = {};

      if (course) {
        filter.course =
          course;
      }

      if (category) {
        filter.category =
          category;
      }

      if (
        semester !== undefined &&
        semester !== ""
      ) {
        filter.semester =
          Number(semester);
      }

      if (subject) {
        filter.subject =
          subject;
      }

      if (
        unit !== undefined &&
        unit !== ""
      ) {
        filter.unit =
          Number(unit);
      }

      const videos =
        await Video.find(
          filter
        )
          .select(
            "-fileData"
          )
          .sort({
            createdAt: -1
          });

      return res.json({
        success: true,

        data:
          videos
      });

    } catch (error) {
      console.error(
        "Admin videos error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch videos"
      });
    }
  }
);

/* =========================================================
   DELETE VIDEO
========================================================= */

router.delete(
  "/videos/:id",
  adminAuth,
  async (req, res) => {
    try {
      const {
        id
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid video ID"
        });
      }

      const video =
        await Video.findById(id);

      if (!video) {
        return res.status(404).json({
          success: false,
          message: "Video not found"
        });
      }

      await Video.findByIdAndDelete(id);

      return res.json({
        success: true,
        message:
          "Video deleted successfully"
      });

    } catch (error) {
      console.error(
        "Delete video error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete video"
      });
    }
  }
);

/* =========================================================
   ADMIN GET PAPERS
========================================================= */

router.get(
  "/papers",
  adminAuth,
  async (req, res) => {
    try {
      const {
        course,
        category,
        semester,
        subject,
        unit
      } = req.query;

      const filter = {};

      if (course) {
        filter.course = course;
      }

      if (category) {
        filter.category = category;
      }

      if (
        semester !== undefined &&
        semester !== ""
      ) {
        filter.semester =
          Number(semester);
      }

      if (subject) {
        filter.subject = subject;
      }

      if (
        unit !== undefined &&
        unit !== ""
      ) {
        filter.unit =
          Number(unit);
      }

      const papers =
        await Paper.find(filter)
          .select("-fileData")
          .sort({
            createdAt: -1
          });

      return res.json({
        success: true,
        data: papers
      });

    } catch (error) {
      console.error(
        "Admin papers error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch papers"
      });
    }
  }
);

/* =========================================================
   DELETE PAPER
========================================================= */

router.delete(
  "/papers/:id",
  adminAuth,
  async (req, res) => {
    try {
      const {
        id
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid paper ID"
        });
      }

      const paper =
        await Paper.findById(id);

      if (!paper) {
        return res.status(404).json({
          success: false,
          message: "Paper not found"
        });
      }

      await Paper.findByIdAndDelete(id);

      return res.json({
        success: true,
        message:
          "Paper deleted successfully"
      });

    } catch (error) {
      console.error(
        "Delete paper error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete paper"
      });
    }
  }
);

/* =========================================================
   ADMIN USERS
========================================================= */

router.get(
  "/users",
  adminAuth,
  async (req, res) => {
    try {
      const users =
        await User.find()
          .select("-password")
          .sort({
            createdAt: -1
          });

      return res.json({
        success: true,
        data: users
      });

    } catch (error) {
      console.error(
        "Users fetch error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch users"
      });
    }
  }
);

/* =========================================================
   UPDATE USER
========================================================= */

router.put(
  "/users/:id",
  adminAuth,
  async (req, res) => {
    try {
      const {
        id
      } = req.params;

      const {
        name,
        email,
        isActive
      } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID"
        });
      }

      const updateData = {};

      if (
        name !== undefined
      ) {
        updateData.name = name;
      }

      if (
        email !== undefined
      ) {
        updateData.email = email;
      }

      if (
        isActive !== undefined
      ) {
        updateData.isActive =
          isActive;
      }

      const user =
        await User.findByIdAndUpdate(
          id,
          updateData,
          {
            new: true
          }
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      return res.json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error(
        "Update user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update user"
      });
    }
  }
);

/* =========================================================
   DELETE USER
========================================================= */

router.delete(
  "/users/:id",
  adminAuth,
  async (req, res) => {
    try {
      const {
        id
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID"
        });
      }

      const user =
        await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      await User.findByIdAndDelete(id);

      return res.json({
        success: true,
        message:
          "User deleted successfully"
      });

    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete user"
      });
    }
  }
);

/* =========================================================
   ADMIN PAID PDFs
========================================================= */

// Dashboard: list paid PDFs without sending large Base64 file data.
router.get("/paid-pdfs", adminAuth, async (req, res) => {
  try {
    const filter = {};
    if (req.admin?.role !== "super_admin") {
      filter.course = { $in: req.admin?.permissions?.courses || [] };
    }

    const paidPDFs = await PaidPDF.find(filter)
      .select("-fileData")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(paidPDFs);
  } catch (error) {
    console.error("Admin paid PDFs GET error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch paid PDFs"
    });
  }
});

/* =========================================================
   ADMIN COURSE PRICES
========================================================= */

const DEFAULT_COURSE_PRICES = {
  BPharm: { price: 99, discount: 0 },
  DPharm: { price: 79, discount: 0 },
  MPharm: { price: 149, discount: 0 },
  PharmD: { price: 129, discount: 0 },
  PhD: { price: 199, discount: 0 }
};

const COURSE_PRICE_ALIASES = {
  BPharm: ["BPharm", "B.Pharm"],
  DPharm: ["DPharm", "D.Pharm"],
  MPharm: ["MPharm", "M.Pharm"],
  PharmD: ["PharmD", "Pharm.D"],
  PhD: ["PhD"]
};

const normalizeCoursePrices = (source = {}) => {
  const result = {};
  for (const [key, aliases] of Object.entries(COURSE_PRICE_ALIASES)) {
    let value;
    for (const alias of aliases) {
      if (source && source[alias] !== undefined) {
        value = source[alias];
        break;
      }
    }
    if (value && typeof value === "object") {
      const price = Number(value.price);
      const discount = Number(value.discount ?? 0);
      result[key] = {
        price: Number.isFinite(price) && price >= 0
          ? price
          : DEFAULT_COURSE_PRICES[key].price,
        discount: Number.isFinite(discount) && discount >= 0 && discount <= 100
          ? discount
          : DEFAULT_COURSE_PRICES[key].discount
      };
    } else {
      result[key] = { ...DEFAULT_COURSE_PRICES[key] };
    }
  }
  return result;
};

router.get("/course-prices", adminAuth, async (req, res) => {
  try {
    let record = await CoursePrice.findOne().lean();
    const stored = record?.prices;
    const storedObject = stored instanceof Map
      ? Object.fromEntries(stored)
      : (stored || {});
    const normalized = normalizeCoursePrices(storedObject);

    return res.json({
      success: true,
      prices: normalized,
      data: normalized,
      coursePrices: {
        "B.Pharm": normalized.BPharm,
        "D.Pharm": normalized.DPharm,
        "M.Pharm": normalized.MPharm,
        "Pharm.D": normalized.PharmD,
        PhD: normalized.PhD
      }
    });
  } catch (error) {
    console.error("Admin course prices GET error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course prices"
    });
  }
});

router.put("/course-prices", adminAuth, async (req, res) => {
  try {
    const input = req.body?.prices || req.body?.coursePrices || req.body;
    const normalized = normalizeCoursePrices(input);

    let record = await CoursePrice.findOne();
    if (!record) record = new CoursePrice();

    // Mongoose Map schema uses the internal keys below.
    if (record.prices && typeof record.prices.set === "function") {
      for (const [key, value] of Object.entries(normalized)) {
        record.prices.set(key, value);
      }
    } else {
      record.prices = normalized;
    }

    await record.save();

    return res.json({
      success: true,
      message: "Course prices updated successfully",
      prices: normalized,
      data: normalized
    });
  } catch (error) {
    console.error("Admin course prices PUT error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update course prices"
    });
  }
});

/* =========================================================
   NOTICES
========================================================= */

// Notice API uses the existing Notice model fields:
// title, description, type, startDate, endDate, isActive, createdBy, readBy.
// The API accepts legacy AdminNotice fields (message, priority, active) too.

router.get(
  "/notices",
  adminAuth,
  async (req, res) => {
    try {
      // Include readBy so the admin UI can show the actual read count.
      const notices = await Notice.find()
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        notices,
        data: notices
      });
    } catch (error) {
      console.error("Admin fetch notices error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notices"
      });
    }
  }
);

router.post(
  "/notices",
  adminAuth,
  async (req, res) => {
    try {
      const title = String(req.body.title || "").trim();
      const description = String(req.body.description ?? req.body.message ?? "").trim();
      const typeMap = { normal: "info", important: "warning", urgent: "danger" };
      const requestedType = req.body.type || req.body.priority || "info";
      const type = typeMap[requestedType] || requestedType;
      const activeInput = req.body.isActive ?? req.body.active ?? true;
      const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
      const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
      const target = normalizeNoticeTarget(req.body.target);
      const imageUrl = normalizeNoticeImage(req.body.imageUrl);
      const linkUrl = normalizeNoticeLink(req.body.linkUrl);
      const linkText = String(req.body.linkText || "Open link").trim().slice(0, 60) || "Open link";

      if (!title) {
        return res.status(400).json({ success: false, message: "Notice title is required" });
      }
      if (title.length > 120) {
        return res.status(400).json({ success: false, message: "Notice title cannot exceed 120 characters" });
      }
      if (description.length > 5000) {
        return res.status(400).json({ success: false, message: "Notice message cannot exceed 5000 characters" });
      }
      if (!["info", "warning", "success", "danger"].includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid notice type" });
      }
      if (target === null) {
        return res.status(400).json({ success: false, message: "Invalid notice target" });
      }
      if (req.body.imageUrl && imageUrl === null) {
        return res.status(400).json({ success: false, message: "Invalid image. Select a supported image up to 3 MB." });
      }
      if (String(req.body.linkUrl || "").trim() && linkUrl === null) {
        return res.status(400).json({ success: false, message: "Link must be a valid http:// or https:// URL" });
      }
      if (startDate && Number.isNaN(startDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid start date" });
      }
      if (endDate && Number.isNaN(endDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid end date" });
      }
      if (startDate && endDate && endDate < startDate) {
        return res.status(400).json({ success: false, message: "End date cannot be before start date" });
      }

      const notice = await Notice.create({
        title,
        description,
        type,
        startDate,
        endDate,
        isActive: normalizeNoticeActive(activeInput),
        imageUrl: imageUrl || "",
        linkUrl: linkUrl || "",
        linkText,
        target,
        createdBy: req.admin?.id || req.admin?._id || undefined
      });

      return res.status(201).json({
        success: true,
        message: "Notice published successfully",
        notice,
        data: notice
      });
    } catch (error) {
      console.error("Admin create notice error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to publish notice",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
);

router.put(
  "/notices/:id",
  adminAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid notice ID" });
      }

      const title = String(req.body.title || "").trim();
      const description = String(req.body.description ?? req.body.message ?? "").trim();
      const typeMap = { normal: "info", important: "warning", urgent: "danger" };
      const requestedType = req.body.type || req.body.priority || "info";
      const type = typeMap[requestedType] || requestedType;
      const activeInput = req.body.isActive ?? req.body.active ?? true;
      const startDate = req.body.startDate ? new Date(req.body.startDate) : null;
      const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
      const target = normalizeNoticeTarget(req.body.target);
      const imageWasProvided = Object.prototype.hasOwnProperty.call(req.body, "imageUrl");
      const imageUrl = imageWasProvided ? normalizeNoticeImage(req.body.imageUrl) : undefined;
      const linkUrl = normalizeNoticeLink(req.body.linkUrl);
      const linkText = String(req.body.linkText || "Open link").trim().slice(0, 60) || "Open link";

      if (!title) {
        return res.status(400).json({ success: false, message: "Notice title is required" });
      }
      if (title.length > 120) {
        return res.status(400).json({ success: false, message: "Notice title cannot exceed 120 characters" });
      }
      if (description.length > 5000) {
        return res.status(400).json({ success: false, message: "Notice message cannot exceed 5000 characters" });
      }
      if (!["info", "warning", "success", "danger"].includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid notice type" });
      }
      if (target === null) {
        return res.status(400).json({ success: false, message: "Invalid notice target" });
      }
      if (imageWasProvided && String(req.body.imageUrl || "").trim() && imageUrl === null) {
        return res.status(400).json({ success: false, message: "Invalid image. Use a valid HTTP/HTTPS image URL or a supported Base64 image up to 3 MB." });
      }
      if (String(req.body.linkUrl || "").trim() && linkUrl === null) {
        return res.status(400).json({ success: false, message: "Link must be a valid http:// or https:// URL" });
      }
      if (startDate && Number.isNaN(startDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid start date" });
      }
      if (endDate && Number.isNaN(endDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid end date" });
      }
      if (startDate && endDate && endDate < startDate) {
        return res.status(400).json({ success: false, message: "End date cannot be before start date" });
      }

      // Preserve the existing image when an edit request omits imageUrl or
      // sends an empty string. A new image replaces it only when supplied.
      const updateFields = {
        title,
        description,
        type,
        startDate,
        endDate,
        isActive: normalizeNoticeActive(activeInput),
        linkUrl: linkUrl || "",
        linkText,
        target,
        updatedAt: new Date()
      };

      if (imageWasProvided && String(req.body.imageUrl || "").trim()) {
        updateFields.imageUrl = imageUrl;
      }

      const notice = await Notice.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!notice) {
        return res.status(404).json({ success: false, message: "Notice not found" });
      }

      return res.json({
        success: true,
        message: "Notice updated successfully",
        notice,
        data: notice
      });
    } catch (error) {
      console.error("Admin update notice error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update notice",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  }
);

router.delete(
  "/notices/:id",
  adminAuth,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid notice ID"
        });
      }

      const deleted = await Notice.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Notice not found"
        });
      }

      return res.json({
        success: true,
        message: "Notice deleted successfully"
      });
    } catch (error) {
      console.error("Admin delete notice error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete notice"
      });
    }
  }
);

/* =========================================================
   PAYMENT LIST
========================================================= */

router.get(
  "/payments",
  adminAuth,
  async (req, res) => {
    try {
      const payments =
        await Payment.find()
          .sort({
            createdAt: -1
          });

      return res.json({
        success: true,
        data: payments
      });

    } catch (error) {
      console.error(
        "Payments error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch payments"
      });
    }
  }
);

/* =========================================================
   PAYMENT BY ID
========================================================= */

router.get(
  "/payments/:id",
  adminAuth,
  async (req, res) => {
    try {
      const {
        id
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment ID"
        });
      }

      const payment =
        await Payment.findById(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message:
            "Payment not found"
        });
      }

      return res.json({
        success: true,
        data: payment
      });

    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch payment"
      });
    }
  }
);

/* =========================================================
   HEALTH CHECK
========================================================= */

router.get(
  "/health",
  async (req, res) => {
    try {
      return res.json({
        success: true,

        status: "ok",

        database:
          mongoose.connection.readyState ===
          1
            ? "connected"
            : "disconnected",

        timestamp:
          new Date().toISOString()
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        status: "error"
      });
    }
  }
);

/* =========================================================
   CONTENT MODEL HELPER
========================================================= */

const getContentModel = (
  type
) => {
  const normalized =
    String(type || "")
      .toLowerCase()
      .trim();

  if (
    normalized === "note" ||
    normalized === "notes"
  ) {
    return Note;
  }

  if (
    normalized === "video" ||
    normalized === "videos"
  ) {
    return Video;
  }

  if (
    normalized === "paper" ||
    normalized === "papers"
  ) {
    return Paper;
  }

  if (
    normalized === "paidpdf" ||
    normalized === "paid-pdf" ||
    normalized === "paid-pdfs" ||
    normalized === "pdf"
  ) {
    return PaidPDF;
  }

  return null;
};

/* =========================================================
   PUBLIC DIRECT FILES
   Exam Crash Course + PYQs
   NO semester / subject / unit / year / language
========================================================= */

router.get(
  "/public/direct-files",
  async (req, res) => {
    try {
      const course = String(req.query.course || "").trim();
      const category = String(req.query.category || "").trim();

      if (!course) {
        return res.status(400).json({
          success: false,
          message: "Course is required"
        });
      }

      if (
        !["Exam Crash Course", "PYQs"].includes(category)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Category must be Exam Crash Course or PYQs"
        });
      }

      const items = await Note.find({
        course: {
          $regex:
            `^${course.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i"
        },
        category: {
          $regex:
            `^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          $options: "i"
        },
        isDirectFile: true
      })
        .select(
          "-fileData -filePath"
        )
        .sort({
          createdAt: -1
        })
        .lean();

      return res.json({
        success: true,
        data: items,
        count: items.length
      });
    } catch (error) {
      console.error(
        "Public direct files error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch direct files"
      });
    }
  }
);

/* =========================================================
   SEND STORED FILE
========================================================= */

const sendStoredFile = async (
  req,
  res,
  disposition
) => {
  try {
    const {
      type,
      id
    } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid document ID"
      });
    }

    const Model =
      getContentModel(type);

    if (!Model) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid content type"
      });
    }

    const item =
      await Model.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message:
          "File not found"
      });
    }

    const safeFileName =
      String(
        item.fileName ||
        "document.pdf"
      )
        .replace(
          /[\r\n"]/g,
          ""
        )
        .trim() ||
      "document.pdf";

    // Large direct files are stored on disk.
    if (
      item.isDirectFile &&
      item.filePath
    ) {
      const resolvedPath = path.resolve(
        item.filePath
      );
      const allowedRoot = path.resolve(
        DIRECT_UPLOAD_DIR
      );

      if (
        !resolvedPath.startsWith(
          `${allowedRoot}${path.sep}`
        )
      ) {
        return res.status(403).json({
          success: false,
          message: "Invalid file location"
        });
      }

      if (!fs.existsSync(resolvedPath)) {
        return res.status(404).json({
          success: false,
          message: "Physical file not found"
        });
      }

      const stat =
        fs.statSync(resolvedPath);

      res.setHeader(
        "Content-Type",
        item.fileType ||
          "application/octet-stream"
      );

      res.setHeader(
        "Content-Length",
        stat.size
      );

      res.setHeader(
        "Content-Disposition",
        `${disposition}; filename="${safeFileName}"`
      );

      if (
        disposition === "attachment" &&
        typeof item.incrementDownloads ===
          "function"
      ) {
        item
          .incrementDownloads()
          .catch(() => {});
      }

      return fs.createReadStream(
        resolvedPath
      ).pipe(res);
    }

    // Legacy Notes / existing small files remain unchanged.
    if (
      !item.fileData
    ) {
      return res.status(404).json({
        success: false,
        message:
          "File data not found"
      });
    }

    const rawData =
      String(item.fileData);

    const match =
      rawData.match(
        /^data:([^;]+);base64,(.+)$/
      );

    if (!match) {
      return res.status(500).json({
        success: false,
        message:
          "Stored file data is invalid"
      });
    }

    const mimeType =
      match[1] ||
      item.fileType ||
      "application/pdf";

    const buffer =
      Buffer.from(
        match[2],
        "base64"
      );

    res.setHeader(
      "Content-Type",
      mimeType
    );

    res.setHeader(
      "Content-Length",
      buffer.length
    );

    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${safeFileName}"`
    );

    if (
      disposition === "attachment" &&
      typeof item.incrementDownloads ===
        "function"
    ) {
      item
        .incrementDownloads()
        .catch(() => {});
    }

    return res.end(buffer);

  } catch (error) {
    console.error(
      "Public file error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load file"
    });
  }
};


/* =========================================================
   PUBLIC PREVIEW
========================================================= */

router.get(
  "/public/preview/:type/:id",
  async (req, res, next) => {
    // IMPORTANT:
    // interview-pdf has its own dedicated route below.
    // Skip the generic route so it does not return
    // "Invalid content type".
    if (req.params.type === "interview-pdf") {
      return next();
    }

    return sendStoredFile(
      req,
      res,
      "inline"
    );
  }
);

/* =========================================================
   PUBLIC DOWNLOAD
========================================================= */

router.get(
  "/public/download/:type/:id",
  async (req, res, next) => {
    // IMPORTANT:
    // interview-pdf has its own dedicated route below.
    // Skip the generic route so it does not return
    // "Invalid content type".
    if (req.params.type === "interview-pdf") {
      return next();
    }

    return sendStoredFile(
      req,
      res,
      "attachment"
    );
  }
);

/* =========================================================
   PUBLIC PRICE
========================================================= */

router.get(
  "/public-price",
  async (req, res) => {
    try {
      const coursePrices =
        await CoursePrice.findOne();

      if (!coursePrices) {
        return res.json({
          "B.Pharm": {
            price: 99,
            discount: 0
          },

          "D.Pharm": {
            price: 79,
            discount: 0
          },

          "M.Pharm": {
            price: 149,
            discount: 0
          },

          "Pharm.D": {
            price: 129,
            discount: 0
          },

          "PhD": {
            price: 199,
            discount: 0
          }
        });
      }

      const p =
        coursePrices.prices;

      const getPrice = (
        key
      ) => {
        if (!p) {
          return null;
        }

        if (
          typeof p.get ===
          "function"
        ) {
          return p.get(key);
        }

        return p[key];
      };

      return res.json({
        "B.Pharm":
          getPrice("BPharm"),

        "D.Pharm":
          getPrice("DPharm"),

        "M.Pharm":
          getPrice("MPharm"),

        "Pharm.D":
          getPrice("PharmD"),

        "PhD":
          getPrice("PhD")
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message:
          error.message
      });
    }
  }
);

/* =========================================================
   ADMIN PROFILE
========================================================= */

router.get(
  "/profile",
  adminAuth,
  async (req, res) => {
    try {
      const admin =
        await Admin.findById(
          req.admin.id
        ).select(
          "-password"
        );

      if (!admin) {
        return res.status(404).json({
          success: false,
          message:
            "Admin not found"
        });
      }

      return res.json({
        success: true,
        admin
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Server Error"
      });
    }
  }
);

/* =========================================================
   UPDATE ADMIN PROFILE
========================================================= */

router.put(
  "/update-profile",
  adminAuth,
  async (req, res) => {
    try {
      const {
        name,
        email,
        currentPassword,
        newPassword
      } = req.body;

      const admin =
        await Admin.findById(
          req.admin.id
        );

      if (!admin) {
        return res.status(404).json({
          success: false,
          message:
            "Admin not found"
        });
      }

      if (name) {
        admin.name = name;
      }

      if (email) {
        admin.email = email;
      }

      if (
        currentPassword &&
        newPassword
      ) {
        const isMatch =
          await admin.comparePassword(
            currentPassword
          );

        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message:
              "Current password is incorrect"
          });
        }

        admin.password =
          newPassword;
      }

      await admin.save();

      return res.json({
        success: true,

        message:
          "Profile updated successfully",

        user: {
          id:
            admin._id,

          name:
            admin.name,

          email:
            admin.email,

          role:
            admin.role
        }
      });

    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message
      });
    }
  }
);

/* =========================================================
   INTERVIEW MATERIALS
   ========================================================= */

// Admin: list uploaded interview materials
router.get(
  "/interview-materials",
  adminAuth,
  async (req, res) => {
    try {
      const materials = await InterviewMaterial.find()
        .select("-fileData")
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        data: materials,
        count: materials.length
      });
    } catch (error) {
      console.error("Interview materials GET error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch interview materials",
        error: error.message
      });
    }
  }
);

// Admin: upload interview material
router.post(
  "/interview-materials",
  adminAuth,
  interviewUpload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const title = String(
        req.body?.title || req.file.originalname || "Interview Material"
      ).trim();

      const description = String(req.body?.description || "").trim();

      const fileData =
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

      const material = await InterviewMaterial.create({
        title,
        description,
        fileName: req.file.originalname,
        fileType: req.file.mimetype || "application/octet-stream",
        fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
        fileData,
        downloadCount: 0,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return res.status(201).json({
        success: true,
        message: "Interview material uploaded successfully",
        data: {
          _id: material._id,
          id: material._id,
          title: material.title,
          description: material.description,
          fileName: material.fileName,
          fileType: material.fileType,
          fileSize: material.fileSize,
          createdAt: material.createdAt
        }
      });
    } catch (error) {
      console.error("Interview material upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Interview material upload failed",
        error: error.message
      });
    }
  }
);

// Admin: delete interview material
router.delete(
  "/interview-materials/:id",
  adminAuth,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid interview material ID"
        });
      }

      const deleted = await InterviewMaterial.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Interview material not found"
        });
      }

      return res.json({
        success: true,
        message: "Interview material deleted successfully"
      });
    } catch (error) {
      console.error("Interview material delete error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete interview material",
        error: error.message
      });
    }
  }
);

// Public: list interview materials
router.get(
  "/public/interview-pdfs",
  async (req, res) => {
    try {
      const materials = await InterviewMaterial.find()
        .select("-fileData")
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        data: materials,
        count: materials.length
      });
    } catch (error) {
      console.error("Public interview materials error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch interview materials",
        error: error.message
      });
    }
  }
);

// Public: preview interview material
router.get(
  "/public/preview/interview-pdf/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid interview material ID"
        });
      }

      const material = await InterviewMaterial.findById(id);

      if (!material || !material.fileData) {
        return res.status(404).json({
          success: false,
          message: "Interview material file not found"
        });
      }

      const match = String(material.fileData).match(
        /^data:([^;]+);base64,(.+)$/
      );

      if (!match) {
        return res.status(500).json({
          success: false,
          message: "Invalid stored interview material"
        });
      }

      const mimeType =
        match[1] ||
        material.fileType ||
        "application/octet-stream";

      const buffer = Buffer.from(match[2], "base64");

      const safeFileName =
        String(material.fileName || "interview-material")
          .replace(/[\r\n"]/g, "")
          .trim() || "interview-material";

      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Length", buffer.length);
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${safeFileName}"`
      );

      await InterviewMaterial.findByIdAndUpdate(
        id,
        { $inc: { viewCount: 1 } }
      );

      return res.end(buffer);
    } catch (error) {
      console.error("Interview material preview error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to preview interview material",
        error: error.message
      });
    }
  }
);

// Public: download interview material
router.get(
  "/public/download/interview-pdf/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid interview material ID"
        });
      }

      const material = await InterviewMaterial.findById(id);

      if (!material || !material.fileData) {
        return res.status(404).json({
          success: false,
          message: "Interview material file not found"
        });
      }

      const match = String(material.fileData).match(
        /^data:([^;]+);base64,(.+)$/
      );

      if (!match) {
        return res.status(500).json({
          success: false,
          message: "Invalid stored interview material"
        });
      }

      const mimeType =
        match[1] ||
        material.fileType ||
        "application/octet-stream";

      const buffer = Buffer.from(match[2], "base64");

      const safeFileName =
        String(material.fileName || "interview-material")
          .replace(/[\r\n"]/g, "")
          .trim() || "interview-material";

      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Length", buffer.length);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeFileName}"`
      );

      await InterviewMaterial.findByIdAndUpdate(
        id,
        { $inc: { downloadCount: 1 } }
      );

      return res.end(buffer);
    } catch (error) {
      console.error("Interview material download error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to download interview material",
        error: error.message
      });
    }
  }
);

/* =========================================================
   TEST ROUTE
========================================================= */

router.get(
  "/test",
  (req, res) => {
    return res.json({
      success: true,

      message:
        "Admin router is working",

      uploadRoute:
        "/api/admin/upload",

      publicNotesRoute:
        "/api/admin/public/notes",

      publicUnitsRoute:
        "/api/admin/public/units",

      publicContentRoute:
        "/api/admin/public/content",

      publicPreviewRoute:
        "/api/admin/public/preview/:type/:id",

      publicDownloadRoute:
        "/api/admin/public/download/:type/:id",

      interviewMaterialsRoute:
        "/api/admin/interview-materials",

      publicInterviewMaterialsRoute:
        "/api/admin/public/interview-pdfs",

      publicInterviewPreviewRoute:
        "/api/admin/public/preview/interview-pdf/:id",

      publicInterviewDownloadRoute:
        "/api/admin/public/download/interview-pdf/:id",


      routes: [
        "POST /upload",
        "POST /login",
        "GET /stats",
        "GET /course-prices",
        "PUT /course-prices",
        "GET /notes",
        "POST /notes",
        "DELETE /notes/:id",
        "GET /videos",
        "POST /videos",
        "DELETE /videos/:id",
        "GET /papers",
        "POST /papers",
        "DELETE /papers/:id",
        "GET /users",
        "DELETE /users/:id",
        "GET /profile",
        "PUT /update-profile",
        "GET /public/notes",
        "GET /public/units",
        "GET /public/content",
        "GET /public/videos",
        "GET /public/free-videos",
        "GET /public/paid-pdfs",
        "GET /public/papers",
        "GET /public/direct-files",
        "GET /public/preview/:type/:id",
        "GET /public/download/:type/:id",
        "GET /interview-materials",
        "POST /interview-materials",
        "DELETE /interview-materials/:id",
        "GET /public/interview-pdfs",
        "GET /public/preview/interview-pdf/:id",
        "GET /public/download/interview-pdf/:id",

        "GET /public-price"
      ]
    });
  }
);

/* =========================================================
   FINAL EXPORT
========================================================= */

module.exports = router;