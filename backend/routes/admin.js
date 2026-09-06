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
   MULTER - MEMORY STORAGE
========================================================= */

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024
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
    try {
      console.log(
        "\n================================="
      );

      console.log(
        "📤 ADMIN UPLOAD REQUEST"
      );

      console.log(
        "================================="
      );

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

      console.log(
        "📄 File Name:",
        file.originalname
      );

      console.log(
        "📦 File Size:",
        file.size
      );

      console.log(
        "📁 Mime Type:",
        file.mimetype
      );

      console.log(
        "📂 Category:",
        category
      );

      console.log(
        "📚 Semester:",
        semester
      );

      console.log(
        "📖 Subject:",
        subject
      );

      console.log(
        "📌 Unit:",
        unit
      );

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

      /* =====================================================
         IMPORTANT UNIT FIX
         ===================================================== */

      const semesterNumber =
        Number.parseInt(
          semester,
          10
        );

      const unitNumber =
        Number.parseInt(
          unit,
          10
        );

      if (
        !Number.isInteger(
          semesterNumber
        ) ||
        semesterNumber <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid semester. Please select a valid semester."
        });
      }

      if (
        !Number.isInteger(
          unitNumber
        ) ||
        unitNumber <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid unit. Please select Unit 1, Unit 2, etc."
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
          semesterNumber,

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
          (
            file.size /
            1024 /
            1024
          ).toFixed(2) +
          " MB",

        fileData,

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
        new Model(
          contentData
        );

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
   PUBLIC NOTES - GET ALL NOTES FOR A SUBJECT
   ✅ FIXED: Now properly returns all documents with unit > 0
   ========================================================= */

router.get("/public/notes", async (req, res) => {
  try {
    console.log("\n=================================");
    console.log("📚 PUBLIC NOTES REQUEST");
    console.log("=================================");

    const {
      course,
      category,
      semester,
      subject,
      unit,
      branch
    } = req.query;

    console.log("Course:", course);
    console.log("Category:", category);
    console.log("Semester:", semester);
    console.log("Subject:", subject);
    console.log("Unit:", unit);
    console.log("Branch:", branch);

    if (mongoose.connection.readyState !== 1) {
      console.error("❌ MongoDB is not connected");
      return res.status(500).json({
        success: false,
        message: "Database not connected"
      });
    }

    const query = {};

    // Build query based on provided filters
    if (category && category !== "") {
      query.category = {
        $regex: `^${String(category).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i"
      };
    }

    if (semester !== undefined && semester !== "") {
      const semesterNumber = Number.parseInt(semester, 10);
      if (!Number.isInteger(semesterNumber) || semesterNumber <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid semester"
        });
      }
      query.semester = semesterNumber;
    }

    if (subject && subject !== "") {
      query.subject = {
        $regex: `^${String(subject).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i"
      };
    }

    // ✅ Only add unit filter if specific unit is requested
    if (unit !== undefined && unit !== "") {
      const unitNumber = Number.parseInt(unit, 10);
      if (Number.isInteger(unitNumber) && unitNumber > 0) {
        query.unit = unitNumber;
      }
    }

    // Course/Branch filter
    const selectedCourse = branch || course;
    if (selectedCourse && selectedCourse !== "") {
      query.$or = [
        {
          course: {
            $regex: `^${String(selectedCourse).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i"
          }
        },
        {
          branch: {
            $regex: `^${String(selectedCourse).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            $options: "i"
          }
        }
      ];
    }

    console.log("🔎 MongoDB Query:", JSON.stringify(query, null, 2));

    // Fetch all notes matching the query
    const notes = await Note.find(query)
      .select("-fileData")
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Filter: Only keep documents with valid unit > 0
    const filteredNotes = notes.filter(note => {
      const unitVal = Number(note.unit);
      return Number.isInteger(unitVal) && unitVal > 0;
    });

    console.log(`📄 Total Documents Found: ${notes.length}`);
    console.log(`📄 Valid Documents (unit > 0): ${filteredNotes.length}`);
    
    // Log each document's unit for debugging
    filteredNotes.forEach((note, index) => {
      console.log(`📄 Document ${index + 1}: Unit = ${note.unit}, Title = ${note.title || 'Untitled'}`);
    });
    
    console.log("=================================\n");

    return res.json({
      success: true,
      data: filteredNotes,
      count: filteredNotes.length,
      total: notes.length
    });

  } catch (error) {
    console.error("\n❌ PUBLIC NOTES ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
      error: error.message
    });
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
      console.log(
        "\n================================="
      );

      console.log(
        "📚 PUBLIC UNITS REQUEST"
      );

      console.log(
        "================================="
      );

      const {
        category,
        semester,
        subject,
        branch,
        course
      } = req.query;

      console.log(
        "Category:",
        category
      );

      console.log(
        "Semester:",
        semester
      );

      console.log(
        "Subject:",
        subject
      );

      console.log(
        "Branch:",
        branch
      );

      console.log(
        "Course:",
        course
      );

      if (
        mongoose.connection.readyState !==
        1
      ) {
        console.error(
          "❌ MongoDB is not connected"
        );

        return res.status(500).json({
          success: false,
          message: "Database not connected"
        });
      }

      const query = {};

      if (
        category !== undefined &&
        category !== ""
      ) {
        query.category = {
          $regex:
            `^${String(category).replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            )}$`,
          $options: "i"
        };
      }

      if (
        semester !== undefined &&
        semester !== ""
      ) {
        const semesterNumber =
          Number.parseInt(
            semester,
            10
          );

        if (
          !Number.isInteger(
            semesterNumber
          )
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid semester"
          });
        }

        query.semester =
          semesterNumber;
      }

      if (
        subject !== undefined &&
        subject !== ""
      ) {
        query.subject = {
          $regex:
            `^${String(subject).replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            )}$`,
          $options: "i"
        };
      }

      const selectedCourse =
        branch ||
        course;

      if (
        selectedCourse !== undefined &&
        selectedCourse !== ""
      ) {
        query.$or = [
          {
            course: {
              $regex:
                `^${String(
                  selectedCourse
                ).replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                )}$`,
              $options: "i"
            }
          },
          {
            branch: {
              $regex:
                `^${String(
                  selectedCourse
                ).replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                )}$`,
              $options: "i"
            }
          }
        ];
      }

      console.log(
        "🔎 Mongo Query:",
        JSON.stringify(
          query,
          null,
          2
        )
      );

      const notes =
        await Note.find(
          query
        )
          .select(
            "_id unit"
          )
          .lean();

      console.log(
        "📄 Documents Found:",
        notes.length
      );

      const unitsSet =
        new Set();

      for (
        const note of notes
      ) {
        const unitNumber =
          Number(
            note.unit
          );

        if (
          Number.isInteger(
            unitNumber
          ) &&
          unitNumber > 0
        ) {
          unitsSet.add(
            unitNumber
          );
        }
      }

      const sortedUnits =
        Array.from(
          unitsSet
        )
          .sort(
            (a, b) =>
              a - b
          )
          .map(
            (unitNumber) => ({
              id:
                unitNumber,

              unit:
                unitNumber,

              name:
                `Unit ${unitNumber}`,

              title:
                `Unit ${unitNumber}`
            })
          );

      console.log(
        "📚 Units:",
        sortedUnits
      );

      console.log(
        "=================================\n"
      );

      return res.json({
        success: true,

        data:
          sortedUnits,

        count:
          sortedUnits.length
      });

    } catch (error) {
      console.error(
        "\n❌ PUBLIC UNITS ERROR:"
      );

      console.error(
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to fetch units",

        error:
          error.message
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
   NOTICES
========================================================= */

router.get(
  "/notices",
  adminAuth,
  async (req, res) => {
    try {
      const notices =
        await Notice.find()
          .sort({
            createdAt: -1
          });

      return res.json({
        success: true,
        data: notices
      });

    } catch (error) {
      console.error(
        "Notices error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch notices"
      });
    }
  }
);

router.post(
  "/notices",
  adminAuth,
  async (req, res) => {
    try {
      const {
        title,
        message,
        course,
        active
      } = req.body;

      if (
        !title ||
        !message
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title and message are required"
        });
      }

      const notice =
        new Notice({
          title,
          message,
          course:
            course || "",
          active:
            active !== false,
          createdAt:
            new Date()
        });

      await notice.save();

      return res.status(201).json({
        success: true,
        data: notice
      });

    } catch (error) {
      console.error(
        "Create notice error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to create notice"
      });
    }
  }
);

router.delete(
  "/notices/:id",
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
          message: "Invalid notice ID"
        });
      }

      await Notice.findByIdAndDelete(id);

      return res.json({
        success: true,
        message:
          "Notice deleted successfully"
      });

    } catch (error) {
      console.error(
        "Delete notice error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete notice"
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