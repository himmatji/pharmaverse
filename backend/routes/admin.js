const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Note = require("../models/Note");
const Video = require("../models/Video");
const PaidPDF = require("../models/PaidPDF");
const Paper = require("../models/Paper");
const FreeMaterial = require("../models/FreeMaterial");
const Notice = require("../models/Notice");
const { authMiddleware, isAdmin, hasCoursePermission } = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

// ================= 1. PEHLE ADMIN AUTH MIDDLEWARE DEFINE KARO =================
const adminAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type === 'admin') {
      const admin = await Admin.findById(decoded.adminId).select('-password');
      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }
      req.admin = {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        type: 'admin'
      };
      return next();
    }
    
    return res.status(401).json({ message: "Not authorized" });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// ================= 2. CHECK PERMISSION MIDDLEWARE =================
const checkPermission = (courseField = 'course') => {
  return async (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    if (req.admin.role === 'super_admin') {
      return next();
    }
    
    if (req.method === 'POST' || req.method === 'PUT') {
      const course = req.body[courseField];
      
      if (!course) {
        return res.status(400).json({ 
          success: false,
          message: "Course is required" 
        });
      }
      
      const allowedCourses = req.admin.permissions?.courses || [];
      
      if (allowedCourses.includes(course)) {
        return next();
      }
      
      return res.status(403).json({ 
        success: false,
        message: `No permission for ${course}. You can only manage: ${allowedCourses.join(', ')}`
      });
    }
    
    next();
  };
};

// ================= 3. ADMIN LOGIN ROUTE =================
router.post("/login", async (req, res) => {
  console.log("\n========================================");
  console.log("🔐 ADMIN LOGIN REQUEST RECEIVED");
  console.log("========================================");
  console.log("📧 Email:", req.body?.email);
  console.log("🔑 Password provided:", req.body?.password ? "✅ Yes" : "❌ No");
  console.log("========================================\n");
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log("❌ Validation failed: Missing email or password");
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }
    
    let admin = await Admin.findOne({ email });
    console.log("📦 Database search result:", admin ? "✅ Admin found" : "❌ Admin not found");
    
    if (!admin && email === process.env.ADMIN_EMAIL) {
      console.log("🆕 Creating super admin for first time...");
      
      admin = new Admin({
        name: "Super Admin",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'super_admin',
        permissions: { courses: ['B.Pharm', 'D.Pharm', 'M.Pharm', 'Pharm.D', 'PhD'] },
        isActive: true
      });
      
      await admin.save();
      console.log("✅ Super admin created successfully!");
    }
    
    if (!admin) {
      console.log("❌ Login failed: Admin not found");
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }
    
    if (admin.isActive === false) {
      console.log("❌ Login failed: Admin account is inactive");
      return res.status(403).json({ 
        success: false, 
        message: "Account is disabled. Please contact support." 
      });
    }
    
    const isPasswordValid = await admin.comparePassword(password);
    console.log("🔐 Password validation:", isPasswordValid ? "✅ Valid" : "❌ Invalid");
    
    if (!isPasswordValid) {
      console.log("❌ Login failed: Wrong password");
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }
    
    admin.lastLogin = new Date();
    await admin.save();
    
    const token = jwt.sign(
      { 
        adminId: admin._id, 
        email: admin.email, 
        role: admin.role, 
        type: 'admin' 
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    console.log("✅ LOGIN SUCCESSFUL!");
    console.log(`👤 Admin: ${admin.name} (${admin.role})`);
    console.log("========================================\n");
    
    res.json({
      success: true,
      token: token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions || { courses: [] },
        type: 'admin',
        isActive: admin.isActive
      }
    });
    
  } catch (error) {
    console.log("\n🔥🔥🔥 LOGIN ERROR 🔥🔥🔥");
    console.log("Error:", error.message);
    console.log("Stack:", error.stack);
    console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥\n");
    
    res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ================= 4. TEST ROUTE =================
router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Admin API is working!",
    timestamp: new Date().toISOString()
  });
});

// ================= 5. AB SAARE ROUTES JO adminAuth USE KARTE HAIN =================
router.get("/stats", adminAuth, async (req, res) => {
  try {
    let totalNotes = await Note.countDocuments();
    let totalVideos = await Video.countDocuments();
    let totalUsers = await User.countDocuments();
    let totalPaidPDFs = await PaidPDF.countDocuments();
    let totalPapers = await Paper.countDocuments();
    
    if (req.admin.role !== 'super_admin') {
      const allowedCourses = req.admin.permissions?.courses || [];
      totalNotes = await Note.countDocuments({ course: { $in: allowedCourses } });
      totalVideos = await Video.countDocuments({ course: { $in: allowedCourses } });
      totalPaidPDFs = await PaidPDF.countDocuments({ course: { $in: allowedCourses } });
      totalPapers = await Paper.countDocuments({ course: { $in: allowedCourses } });
    }
    
    res.json({ totalNotes, totalVideos, totalUsers, totalPaidPDFs, totalPapers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ================= NOTES CRUD =================
router.get("/notes", adminAuth, async (req, res) => {
  try {
    let notes = await Note.find().sort({ createdAt: -1 });
    if (req.admin.role !== 'super_admin') {
      const allowedCourses = req.admin.permissions?.courses || [];
      notes = notes.filter(note => allowedCourses.includes(note.course));
    }
    res.json(notes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/notes", adminAuth, checkPermission('course'), async (req, res) => {
  try {
    const note = new Note(req.body);
    await note.save();
    res.status(201).json({ success: true, message: "Note Added", note });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/notes/:id", adminAuth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    
    if (req.admin.role !== 'super_admin') {
      const allowedCourses = req.admin.permissions?.courses || [];
      if (!allowedCourses.includes(note.course)) {
        return res.status(403).json({ message: "No permission" });
      }
    }
    
    await Note.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Note Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ================= VIDEOS CRUD =================
router.get("/videos", adminAuth, async (req, res) => {
  try {
    let videos = await Video.find().sort({ createdAt: -1 });
    if (req.admin.role !== 'super_admin') {
      const allowedCourses = req.admin.permissions?.courses || [];
      videos = videos.filter(video => allowedCourses.includes(video.course));
    }
    res.json(videos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/videos", adminAuth, checkPermission('course'), async (req, res) => {
  try {
    const video = new Video(req.body);
    await video.save();
    res.status(201).json({ success: true, message: "Video Added", video });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/videos/:id", adminAuth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });
    
    if (req.admin.role !== 'super_admin') {
      const allowedCourses = req.admin.permissions?.courses || [];
      if (!allowedCourses.includes(video.course)) {
        return res.status(403).json({ message: "No permission" });
      }
    }
    
    await Video.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Video Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ================= PAID PDFS CRUD =================
router.get("/paid-pdfs", adminAuth, async (req, res) => {
  try {
    let paidPDFs = await PaidPDF.find().sort({ createdAt: -1 });
    if (req.admin.role !== 'super_admin') {
      const allowedCourses = req.admin.permissions?.courses || [];
      paidPDFs = paidPDFs.filter(pdf => allowedCourses.includes(pdf.course));
    }
    res.json(paidPDFs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/paid-pdfs", adminAuth, checkPermission('course'), async (req, res) => {
  try {
    const paidPDF = new PaidPDF(req.body);
    await paidPDF.save();
    res.status(201).json({ success: true, message: "PDF Added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/paid-pdfs/:id", adminAuth, async (req, res) => {
  try {
    const pdf = await PaidPDF.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: "PDF not found" });
    
    if (req.admin.role !== 'super_admin') {
      const allowedCourses = req.admin.permissions?.courses || [];
      if (!allowedCourses.includes(pdf.course)) {
        return res.status(403).json({ message: "No permission" });
      }
    }
    
    await PaidPDF.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "PDF Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ================= PAPERS CRUD =================
router.get("/papers", adminAuth, async (req, res) => {
  try {
    let papers = await Paper.find().sort({ createdAt: -1 });
    if (req.admin.role !== 'super_admin') {
      const allowedCourses = req.admin.permissions?.courses || [];
      papers = papers.filter(paper => allowedCourses.includes(paper.course));
    }
    res.json(papers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/papers", adminAuth, checkPermission('course'), async (req, res) => {
  try {
    const paper = new Paper(req.body);
    await paper.save();
    res.status(201).json({ success: true, message: "Paper Added" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/papers/:id", adminAuth, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ message: "Paper not found" });
    
    if (req.admin.role !== 'super_admin') {
      const allowedCourses = req.admin.permissions?.courses || [];
      if (!allowedCourses.includes(paper.course)) {
        return res.status(403).json({ message: "No permission" });
      }
    }
    
    await Paper.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Paper Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ================= NOTICES CRUD =================
router.get("/notices", adminAuth, async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json({ success: true, notices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/notices", adminAuth, async (req, res) => {
  try {
    const notice = new Notice(req.body);
    await notice.save();
    res.status(201).json({ success: true, notice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/notices/:id", adminAuth, async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.json({ success: true, notice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/notices/:id", adminAuth, async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }
    res.json({ success: true, message: "Notice deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ================= PUBLIC ROUTES (No auth required) =================
router.get("/public/notes", async (req, res) => {
  try {
    const { course } = req.query;
    let filter = {};
    if (course) filter.course = course;
    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/public/videos", async (req, res) => {
  try {
    const { course } = req.query;
    let filter = { isPremium: true };
    if (course) filter.course = course;
    const videos = await Video.find(filter).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/public/free-videos", async (req, res) => {
  try {
    const { course } = req.query;
    let filter = { isPremium: false };
    if (course) filter.course = course;
    const videos = await Video.find(filter).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/public/paid-pdfs", async (req, res) => {
  try {
    const { course } = req.query;
    let filter = {};
    if (course) filter.course = course;
    const pdfs = await PaidPDF.find(filter).sort({ createdAt: -1 });
    res.json(pdfs);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/public/papers", async (req, res) => {
  try {
    const { course } = req.query;
    let filter = {};
    if (course) filter.course = course;
    const papers = await Paper.find(filter).sort({ createdAt: -1 });
    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;