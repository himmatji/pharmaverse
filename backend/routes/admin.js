const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");

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

const {
  authMiddleware,
  isAdmin,
  hasCoursePermission
} = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "your_super_secret_key";

/* =========================================================
   MULTER - memoryStorage (NO uploads folder)
========================================================= */
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB (increased from 10MB)
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
      const admin = await Admin.findById(decoded.adminId).select(
        "-password"
      );

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
    console.error("❌ Admin Auth Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

/* =========================================================
   COURSE PERMISSION
========================================================= */
const checkPermission = (courseField = "course") => {
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
        const course = req.body?.[courseField];

        const allowedCourses =
          req.admin.permissions?.courses || [];

        if (allowedCourses.includes(course)) {
          return next();
        }

        return res.status(403).json({
          success: false,
          message: `No permission for ${course}`,
          allowedCourses
        });
      }

      next();

    } catch (error) {
      console.error("Permission error:", error);

      return res.status(500).json({
        success: false,
        message: "Permission check failed"
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

      const {
        branch,
        category,
        semester,
        subject,
        unit,
        units,
        title,
        description,
        isPremium,
        type
      } = req.body;

      console.log("📄 File Name:", file.originalname);
      console.log("📦 File Size:", file.size);
      console.log("📁 Mime Type:", file.mimetype);
      console.log("📂 Category:", category);
      console.log("📚 Semester:", semester);
      console.log("📖 Subject:", subject);
      console.log("📌 Unit:", unit);

      const base64Data =
        file.buffer.toString("base64");

      const fileData =
        `data:${file.mimetype};base64,${base64Data}`;

      let parsedUnits = [];

      try {
        parsedUnits = units
          ? JSON.parse(units)
          : [];
      } catch (e) {
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
        title:
          title ||
          `${subject} - ${category}`,

        description:
          description ||
          `${category} for ${subject}`,

        course:
          branch || "B.Pharm",

        branch:
          branch || "B.Pharm",

        category,

        semester:
          parseInt(semester) || 1,

        subject,

        unit:
          parseInt(unit) || 1,

        units:
          parsedUnits,

        fileName:
          file.originalname,

        fileType:
          file.mimetype,

        fileSize:
          (file.size / 1024 / 1024).toFixed(2) +
          " MB",

        fileData,

        isPremium:
          isPremium === "true" ||
          isPremium === true,

        thumbnail:
          req.body.thumbnail || "",

        downloadCount: 0,

        viewCount: 0,

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

      console.log(
        "=================================\n"
      );

      return res.status(201).json({
        success: true,
        message:
          "File uploaded successfully",

        data: {
          id: newContent._id,
          title: newContent.title,
          category: newContent.category,
          semester: newContent.semester,
          subject: newContent.subject,
          unit: newContent.unit,
          fileName: newContent.fileName,
          fileSize: newContent.fileSize,
          isPremium: newContent.isPremium
        }
      });

    } catch (error) {
      console.error(
        "❌ UPLOAD ERROR:",
        error
      );

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
   MULTER ERROR HANDLER
========================================================= */
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("❌ Multer Error:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "File too large. Maximum allowed size is 50MB."
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next(err);
});

/* =========================================================
   ADMIN LOGIN
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

    let admin = await Admin.findOne({
      email,
      isActive: true
    });

    if (
      !admin &&
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      admin = await Admin.findOne({
        role: "super_admin"
      });

      if (!admin) {
        admin = new Admin({
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

        await admin.save();
      }
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    let isMatch = false;

    if (
      admin.email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      isMatch = true;
    } else {
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
   DASHBOARD STATS
========================================================= */
router.get("/stats", adminAuth, async (req, res) => {
  try {
    let totalNotes = await Note.countDocuments();
    let totalVideos = await Video.countDocuments();
    let totalUsers = await User.countDocuments();
    let totalPaidPDFs = await PaidPDF.countDocuments();
    let totalPapers = await Paper.countDocuments();

    if (req.admin.role !== "super_admin") {
      const allowedCourses =
        req.admin.permissions?.courses || [];

      totalNotes = await Note.countDocuments({
        course: { $in: allowedCourses }
      });

      totalVideos = await Video.countDocuments({
        course: { $in: allowedCourses }
      });

      totalPaidPDFs = await PaidPDF.countDocuments({
        course: { $in: allowedCourses }
      });

      totalPapers = await Paper.countDocuments({
        course: { $in: allowedCourses }
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
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
});

/* =========================================================
   COURSE PRICES
========================================================= */
router.get("/course-prices", adminAuth, async (req, res) => {
  try {
    let prices = await CoursePrice.findOne();

    if (!prices) {
      const defaultPrices = {
        BPharm: {
          price: 99,
          discount: 0
        },

        DPharm: {
          price: 79,
          discount: 0
        },

        MPharm: {
          price: 149,
          discount: 0
        },

        PharmD: {
          price: 129,
          discount: 0
        },

        PhD: {
          price: 199,
          discount: 0
        }
      };

      prices = new CoursePrice({
        prices: defaultPrices
      });

      await prices.save();

      return res.json({
        "B.Pharm": defaultPrices.BPharm,
        "D.Pharm": defaultPrices.DPharm,
        "M.Pharm": defaultPrices.MPharm,
        "Pharm.D": defaultPrices.PharmD,
        "PhD": defaultPrices.PhD
      });
    }

    const p = prices.prices;

    res.json({
      "B.Pharm":
        p?.get
          ? p.get("BPharm")
          : p?.BPharm,

      "D.Pharm":
        p?.get
          ? p.get("DPharm")
          : p?.DPharm,

      "M.Pharm":
        p?.get
          ? p.get("MPharm")
          : p?.MPharm,

      "Pharm.D":
        p?.get
          ? p.get("PharmD")
          : p?.PharmD,

      "PhD":
        p?.get
          ? p.get("PhD")
          : p?.PhD
    });

  } catch (error) {
    console.error(
      "Error fetching course prices:",
      error
    );

    res.status(500).json({
      error: error.message
    });
  }
});

router.put("/course-prices", adminAuth, async (req, res) => {
  try {
    const { prices } = req.body;

    if (!prices) {
      return res.status(400).json({
        error: "Prices data is required"
      });
    }

    const formattedPrices = {
      BPharm:
        prices.BPharm ||
        prices["B.Pharm"] || {
          price: 99,
          discount: 0
        },

      DPharm:
        prices.DPharm ||
        prices["D.Pharm"] || {
          price: 79,
          discount: 0
        },

      MPharm:
        prices.MPharm ||
        prices["M.Pharm"] || {
          price: 149,
          discount: 0
        },

      PharmD:
        prices.PharmD ||
        prices["Pharm.D"] || {
          price: 129,
          discount: 0
        },

      PhD:
        prices.PhD || {
          price: 199,
          discount: 0
        }
    };

    let coursePrices =
      await CoursePrice.findOne();

    if (!coursePrices) {
      coursePrices =
        new CoursePrice({
          prices: formattedPrices
        });
    } else {
      coursePrices.prices =
        formattedPrices;
    }

    coursePrices.updatedAt =
      new Date();

    coursePrices.updatedBy =
      req.admin.id;

    await coursePrices.save();

    res.json({
      success: true,
      message:
        "Prices updated successfully",
      data:
        coursePrices.prices
    });

  } catch (error) {
    console.error(
      "Error updating course prices:",
      error
    );

    res.status(500).json({
      error: error.message
    });
  }
});

/* =========================================================
   NOTES CRUD
========================================================= */
router.get("/notes", adminAuth, async (req, res) => {
  try {
    let notes =
      await Note.find()
        .sort({
          createdAt: -1
        });

    if (
      req.admin.role !==
      "super_admin"
    ) {
      const allowedCourses =
        req.admin.permissions?.courses ||
        [];

      notes = notes.filter(
        (note) =>
          allowedCourses.includes(
            note.course
          )
      );
    }

    res.json(notes);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
});

router.post(
  "/notes",
  adminAuth,
  checkPermission("course"),
  async (req, res) => {
    try {
      const note =
        new Note(req.body);

      await note.save();

      res.status(201).json({
        success: true,
        message: "Note Added",
        note
      });

    } catch (error) {
      console.error(
        "Add note error:",
        error
      );

      res.status(500).json({
        message: "Server Error",
        error: error.message
      });
    }
  }
);

router.delete(
  "/notes/:id",
  adminAuth,
  async (req, res) => {
    try {
      const note =
        await Note.findById(
          req.params.id
        );

      if (!note) {
        return res.status(404).json({
          message:
            "Note not found"
        });
      }

      if (
        req.admin.role !==
        "super_admin"
      ) {
        const allowedCourses =
          req.admin.permissions?.courses ||
          [];

        if (
          !allowedCourses.includes(
            note.course
          )
        ) {
          return res.status(403).json({
            message:
              "No permission"
          });
        }
      }

      await Note.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
        message:
          "Note Deleted"
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Server Error"
      });
    }
  }
);

/* =========================================================
   VIDEOS CRUD
========================================================= */
router.get(
  "/videos",
  adminAuth,
  async (req, res) => {
    try {
      let videos =
        await Video.find()
          .sort({
            createdAt: -1
          });

      if (
        req.admin.role !==
        "super_admin"
      ) {
        const allowedCourses =
          req.admin.permissions?.courses ||
          [];

        videos =
          videos.filter(
            (video) =>
              allowedCourses.includes(
                video.course
              )
          );
      }

      res.json(videos);

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Server Error"
      });
    }
  }
);

router.post(
  "/videos",
  adminAuth,
  checkPermission("course"),
  async (req, res) => {
    try {
      const video =
        new Video(req.body);

      await video.save();

      res.status(201).json({
        success: true,
        message:
          "Video Added",
        video
      });

    } catch (error) {
      console.error(
        "Add video error:",
        error
      );

      res.status(500).json({
        message:
          "Server Error",
        error:
          error.message
      });
    }
  }
);

router.delete(
  "/videos/:id",
  adminAuth,
  async (req, res) => {
    try {
      const video =
        await Video.findById(
          req.params.id
        );

      if (!video) {
        return res.status(404).json({
          message:
            "Video not found"
        });
      }

      if (
        req.admin.role !==
        "super_admin"
      ) {
        const allowedCourses =
          req.admin.permissions?.courses ||
          [];

        if (
          !allowedCourses.includes(
            video.course
          )
        ) {
          return res.status(403).json({
            message:
              "No permission"
          });
        }
      }

      await Video.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
        message:
          "Video Deleted"
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Server Error"
      });
    }
  }
);

/* =========================================================
   PAID PDFS CRUD
========================================================= */
router.get(
  "/paid-pdfs",
  adminAuth,
  async (req, res) => {
    try {
      let paidPDFs =
        await PaidPDF.find()
          .sort({
            createdAt: -1
          });

      if (
        req.admin.role !==
        "super_admin"
      ) {
        const allowedCourses =
          req.admin.permissions?.courses ||
          [];

        paidPDFs =
          paidPDFs.filter(
            (pdf) =>
              allowedCourses.includes(
                pdf.course
              )
          );
      }

      res.json(paidPDFs);

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Server Error"
      });
    }
  }
);

router.post(
  "/paid-pdfs",
  adminAuth,
  checkPermission("course"),
  async (req, res) => {
    try {
      const paidPDF =
        new PaidPDF(req.body);

      await paidPDF.save();

      res.status(201).json({
        success: true,
        message:
          "PDF Added",
        paidPDF
      });

    } catch (error) {
      console.error(
        "Paid PDF error:",
        error
      );

      res.status(500).json({
        message:
          "Server Error",
        error:
          error.message
      });
    }
  }
);

router.delete(
  "/paid-pdfs/:id",
  adminAuth,
  async (req, res) => {
    try {
      const pdf =
        await PaidPDF.findById(
          req.params.id
        );

      if (!pdf) {
        return res.status(404).json({
          message:
            "PDF not found"
        });
      }

      if (
        req.admin.role !==
        "super_admin"
      ) {
        const allowedCourses =
          req.admin.permissions?.courses ||
          [];

        if (
          !allowedCourses.includes(
            pdf.course
          )
        ) {
          return res.status(403).json({
            message:
              "No permission"
          });
        }
      }

      await PaidPDF.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
        message:
          "PDF Deleted"
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Server Error"
      });
    }
  }
);

/* =========================================================
   PAPERS CRUD
========================================================= */
router.get(
  "/papers",
  adminAuth,
  async (req, res) => {
    try {
      let papers =
        await Paper.find()
          .sort({
            createdAt: -1
          });

      if (
        req.admin.role !==
        "super_admin"
      ) {
        const allowedCourses =
          req.admin.permissions?.courses ||
          [];

        papers =
          papers.filter(
            (paper) =>
              allowedCourses.includes(
                paper.course
              )
          );
      }

      res.json(papers);

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Server Error"
      });
    }
  }
);

router.post(
  "/papers",
  adminAuth,
  checkPermission("course"),
  async (req, res) => {
    try {
      const paper =
        new Paper(req.body);

      await paper.save();

      res.status(201).json({
        success: true,
        message:
          "Paper Added",
        paper
      });

    } catch (error) {
      console.error(
        "Add paper error:",
        error
      );

      res.status(500).json({
        message:
          "Server Error",
        error:
          error.message
      });
    }
  }
);

router.delete(
  "/papers/:id",
  adminAuth,
  async (req, res) => {
    try {
      const paper =
        await Paper.findById(
          req.params.id
        );

      if (!paper) {
        return res.status(404).json({
          message:
            "Paper not found"
        });
      }

      if (
        req.admin.role !==
        "super_admin"
      ) {
        const allowedCourses =
          req.admin.permissions?.courses ||
          [];

        if (
          !allowedCourses.includes(
            paper.course
          )
        ) {
          return res.status(403).json({
            message:
              "No permission"
          });
        }
      }

      await Paper.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
        message:
          "Paper Deleted"
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Server Error"
      });
    }
  }
);

/* =========================================================
   PUBLIC ROUTES
========================================================= */

router.get("/public/notes", async (req, res) => {
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
      filter.semester = Number(semester);
    }

    if (subject) {
      filter.subject = subject;
    }

    if (
      unit !== undefined &&
      unit !== ""
    ) {
      filter.unit = Number(unit);
    }

    const notes =
      await Note.find(filter)
        .select("-fileData")
        .sort({
          createdAt: -1
        });

    res.json(notes);

  } catch (error) {
    console.error(
      "Public notes error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load notes"
    });
  }
});

/* =========================================================
   PUBLIC CONTENT
   Compatibility route for frontend
========================================================= */

router.get(
  "/public/content",
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

      const notes =
        await Note.find(filter)
          .select("-fileData")
          .sort({
            createdAt: -1
          });

      res.json({
        success: true,
        content: notes,
        notes: notes
      });

    } catch (error) {
      console.error(
        "Public content error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load content"
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
        course
      } = req.query;

      const filter = {
        isPremium: true
      };

      if (course) {
        filter.course = course;
      }

      const videos =
        await Video.find(filter)
          .sort({
            createdAt: -1
          });

      res.json(videos);

    } catch (error) {
      console.error(
        "Public videos error:",
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
   PUBLIC FREE VIDEOS
========================================================= */

router.get(
  "/public/free-videos",
  async (req, res) => {
    try {
      const {
        course
      } = req.query;

      const filter = {
        isPremium: false
      };

      if (course) {
        filter.course = course;
      }

      const videos =
        await Video.find(filter)
          .sort({
            createdAt: -1
          });

      res.json(videos);

    } catch (error) {
      console.error(
        "Public free videos error:",
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
   PUBLIC PAID PDFS
========================================================= */

router.get(
  "/public/paid-pdfs",
  async (req, res) => {
    try {
      const {
        course
      } = req.query;

      const filter = {};

      if (course) {
        filter.course = course;
      }

      const pdfs =
        await PaidPDF.find(filter)
          .sort({
            createdAt: -1
          });

      res.json(pdfs);

    } catch (error) {
      console.error(
        "Public paid PDFs error:",
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
   PUBLIC PAPERS
========================================================= */

router.get(
  "/public/papers",
  async (req, res) => {
    try {
      const {
        course
      } = req.query;

      const filter = {};

      if (course) {
        filter.course = course;
      }

      const papers =
        await Paper.find(filter)
          .sort({
            createdAt: -1
          });

      res.json(papers);

    } catch (error) {
      console.error(
        "Public papers error:",
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
   PUBLIC FILE MODEL
========================================================= */

const getContentModel = (
  type
) => {
  const normalizedType =
    String(type || "")
      .toLowerCase();

  if (
    normalizedType === "note" ||
    normalizedType === "notes"
  ) {
    return Note;
  }

  if (
    normalizedType === "video" ||
    normalizedType === "videos"
  ) {
    return Video;
  }

  if (
    normalizedType === "paper" ||
    normalizedType === "papers"
  ) {
    return Paper;
  }

  return null;
};

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

    /* -------------------------
       VALID OBJECT ID
    ------------------------- */
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

    /* -------------------------
       MODEL
    ------------------------- */
    const Model =
      getContentModel(type);

    if (!Model) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid content type"
      });
    }

    /* -------------------------
       FIND DOCUMENT
    ------------------------- */
    const item =
      await Model.findById(id);

    if (
      !item ||
      !item.fileData
    ) {
      return res.status(404).json({
        success: false,
        message:
          "File not found"
      });
    }

    /* -------------------------
       BASE64 DATA
    ------------------------- */
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

    /* -------------------------
       MIME TYPE
    ------------------------- */
    const mimeType =
      match[1] ||
      item.fileType ||
      "application/pdf";

    /* -------------------------
       BUFFER
    ------------------------- */
    const buffer =
      Buffer.from(
        match[2],
        "base64"
      );

    /* -------------------------
       SAFE FILE NAME
    ------------------------- */
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

    /* -------------------------
       HEADERS
    ------------------------- */
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

    /* -------------------------
       DOWNLOAD COUNT
    ------------------------- */
    if (
      disposition === "attachment" &&
      typeof item.incrementDownloads ===
        "function"
    ) {
      item
        .incrementDownloads()
        .catch(() => {});
    }

    /* -------------------------
       SEND FILE
    ------------------------- */
    return res.end(
      buffer
    );

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
  async (req, res) => {
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
  async (req, res) => {
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

      res.json({
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
      console.error(
        error
      );

      res.status(500).json({
        message:
          error.message
      });
    }
  }
);

/* =========================================================
   USERS
========================================================= */

router.get(
  "/users",
  adminAuth,
  async (req, res) => {
    try {
      const users =
        await User.find({})
          .select("-password")
          .sort({
            createdAt: -1
          });

      res.json({
        success: true,
        users
      });

    } catch (error) {
      console.error(
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message
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
          message:
            "Invalid User ID"
        });
      }

      const deletedUser =
        await User.findByIdAndDelete(
          id
        );

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message:
            "User not found"
        });
      }

      res.json({
        success: true,
        message:
          "User deleted successfully"
      });

    } catch (error) {
      console.error(
        error
      );

      res.status(500).json({
        success: false,
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
        )
        .select("-password");

      if (!admin) {
        return res.status(404).json({
          success: false,
          message:
            "Admin not found"
        });
      }

      res.json({
        success: true,
        admin
      });

    } catch (error) {
      console.error(
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server Error"
      });
    }
  }
);

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

      res.json({
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

      res.status(500).json({
        success: false,
        message:
          error.message
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
    res.json({
      success: true,
      message:
        "Admin router is working",
      uploadRoute:
        "/api/admin/upload",
      publicNotesRoute:
        "/api/admin/public/notes",
      publicContentRoute:
        "/api/admin/public/content",
      publicPreviewRoute:
        "/api/admin/public/preview/:type/:id",
      publicDownloadRoute:
        "/api/admin/public/download/:type/:id",
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
        "GET /paid-pdfs",
        "POST /paid-pdfs",
        "DELETE /paid-pdfs/:id",
        "GET /papers",
        "POST /papers",
        "DELETE /papers/:id",
        "GET /users",
        "DELETE /users/:id",
        "GET /profile",
        "PUT /update-profile",
        "GET /public/notes",
        "GET /public/content",
        "GET /public/videos",
        "GET /public/free-videos",
        "GET /public/paid-pdfs",
        "GET /public/papers",
        "GET /public/preview/:type/:id",
        "GET /public/download/:type/:id",
        "GET /public-price"
      ]
    });
  }
);

/* =========================================================
   FINAL EXPORT
========================================================= */

module.exports = router;