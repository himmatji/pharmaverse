const express = require("express");
const mongoose = require("mongoose");
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
const Payment = require("../models/Payment");
const CoursePrice = require("../models/CoursePrice");

const router = express.Router();
router.use((req, res, next) => {
  console.log("🔥 ADMIN ROUTER HIT:", req.method, req.originalUrl);
  next();
});
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

// ================= ADMIN AUTH MIDDLEWARE =================
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
    
    if (decoded.email) {
      const admin = await Admin.findOne({ email: decoded.email });
      if (admin) {
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
    }
    
    if (decoded.role === 'super_admin' || decoded.role === 'admin') {
      let superAdmin = await Admin.findOne({ role: 'super_admin' });
      
      if (!superAdmin && decoded.email === process.env.ADMIN_EMAIL) {
        superAdmin = new Admin({
          name: 'Super Admin',
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: 'super_admin',
          permissions: { courses: ['B.Pharm', 'D.Pharm', 'M.Pharm', 'Pharm.D', 'PhD'] },
          isActive: true
        });
        await superAdmin.save();
      }
      
      if (superAdmin) {
        req.admin = {
          id: superAdmin._id,
          name: superAdmin.name,
          email: superAdmin.email,
          role: 'super_admin',
          permissions: superAdmin.permissions,
          type: 'admin'
        };
        return next();
      }
    }
    
    return res.status(401).json({ message: "Not authorized" });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

// ================= CHECK PERMISSION =================
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
      if (req.admin.permissions?.courses?.includes(course)) {
        return next();
      }
      return res.status(403).json({ 
        message: `No permission for ${course}`,
        allowedCourses: req.admin.permissions?.courses || []
      });
    }
    
    next();
  };
};

// ================= ADMIN LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let admin = await Admin.findOne({ email, isActive: true });
    
    if (!admin && email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      admin = await Admin.findOne({ role: 'super_admin' });
      
      if (!admin) {
        admin = new Admin({
          name: "Super Admin",
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          role: 'super_admin',
          permissions: { courses: ['B.Pharm', 'D.Pharm', 'M.Pharm', 'Pharm.D', 'PhD'] },
          isActive: true
        });
        await admin.save();
      }
    }
    
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    let isMatch = false;

    if (admin.email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
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
      { adminId: admin._id, email: admin.email, role: admin.role, type: 'admin' },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        type: 'admin'
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ================= DASHBOARD STATS =================
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

// ================= COURSE PRICES CRUD =================
// GET - Fetch course prices
router.get("/course-prices", adminAuth, async (req, res) => {
  try {
    let prices = await CoursePrice.findOne();
    if (!prices) {
      const defaultPrices = {
        "BPharm": { price: 99, discount: 0 },
        "DPharm": { price: 79, discount: 0 },
        "MPharm": { price: 149, discount: 0 },
        "PharmD": { price: 129, discount: 0 },
        "PhD": { price: 199, discount: 0 }
      };
      prices = new CoursePrice({ prices: defaultPrices });
      await prices.save();
      return res.json(defaultPrices);
    }
    const p = prices.prices;

res.json({
  "B.Pharm": p.get ? p.get("BPharm") : p.BPharm,
  "D.Pharm": p.get ? p.get("DPharm") : p.DPharm,
  "M.Pharm": p.get ? p.get("MPharm") : p.MPharm,
  "Pharm.D": p.get ? p.get("PharmD") : p.PharmD,
  "PhD": p.get ? p.get("PhD") : p.PhD,
});
  } catch (error) {
    console.error('Error fetching course prices:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Update course prices
router.put("/course-prices", adminAuth, async (req, res) => {
  try {
    const { prices } = req.body;
    if (!prices) {
      return res.status(400).json({ error: 'Prices data is required' });
    }

    const formattedPrices = {
  BPharm: prices.BPharm || prices["B.Pharm"] || { price: 99, discount: 0 },
  DPharm: prices.DPharm || prices["D.Pharm"] || { price: 79, discount: 0 },
  MPharm: prices.MPharm || prices["M.Pharm"] || { price: 149, discount: 0 },
  PharmD: prices.PharmD || prices["Pharm.D"] || { price: 129, discount: 0 },
  PhD: prices.PhD || prices["PhD"] || { price: 199, discount: 0 },
};

let coursePrices = await CoursePrice.findOne();

if (!coursePrices) {
  coursePrices = new CoursePrice({
    prices: formattedPrices,
  });
} else {
  coursePrices.prices = formattedPrices;
}
    coursePrices.updatedAt = new Date();
    coursePrices.updatedBy = req.admin.id;
    await coursePrices.save();

    res.json({ 
      success: true, 
      message: 'Prices updated successfully', 
      data: coursePrices.prices 
    });
  } catch (error) {
    console.error('Error updating course prices:', error);
    res.status(500).json({ error: error.message });
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
    console.log("========== PAID PDF ==========");
    console.log(req.body);
    const paidPDF = new PaidPDF(req.body);
    await paidPDF.save();
    res.status(201).json({ success: true, message: "PDF Added" });
  } catch (error) {
    console.log("ERROR =", error);
    console.log("BODY =", req.body);
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
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

// ================= DASHBOARD ANALYTICS =================
router.get("/popular-content", adminAuth, async (req, res) => {
  try {
    let popularNotes = await Note.find().sort({ views: -1, createdAt: -1 }).limit(5);
    let popularVideos = await Video.find().sort({ views: -1, createdAt: -1 }).limit(5);
    let popularPDFs = await PaidPDF.find().sort({ views: -1, createdAt: -1 }).limit(5);
    let popularPapers = await Paper.find().sort({ views: -1, createdAt: -1 }).limit(5);
    
    let allContent = [...popularNotes, ...popularVideos, ...popularPDFs, ...popularPapers];
    allContent.sort((a, b) => (b.views || 0) - (a.views || 0));
    allContent = allContent.slice(0, 10);
    
    if (req.admin.role !== 'super_admin') {
      const allowedCourses = req.admin.permissions?.courses || [];
      allContent = allContent.filter(item => allowedCourses.includes(item.course));
    }
    
    res.json({ success: true, notes: allContent });
  } catch (error) {
    console.error(error);
    res.json({ success: true, notes: [] });
  }
});

router.get("/recent-activity", adminAuth, async (req, res) => {
  try {
    const activities = [];
    
    let recentNotes = await Note.find().sort({ createdAt: -1 }).limit(3);
    let recentVideos = await Video.find().sort({ createdAt: -1 }).limit(3);
    let recentPDFs = await PaidPDF.find().sort({ createdAt: -1 }).limit(3);
    let recentPapers = await Paper.find().sort({ createdAt: -1 }).limit(3);
    
    if (req.admin.role !== 'super_admin') {
      const allowedCourses = req.admin.permissions?.courses || [];
      recentNotes = recentNotes.filter(n => allowedCourses.includes(n.course));
      recentVideos = recentVideos.filter(v => allowedCourses.includes(v.course));
      recentPDFs = recentPDFs.filter(p => allowedCourses.includes(p.course));
      recentPapers = recentPapers.filter(p => allowedCourses.includes(p.course));
    }
    
    recentNotes.forEach(note => {
      activities.push({ type: "note", title: note.title, message: "New Note Added", time: note.createdAt });
    });
    recentVideos.forEach(video => {
      activities.push({ type: "video", title: video.title, message: "New Video Added", time: video.createdAt });
    });
    recentPDFs.forEach(pdf => {
      activities.push({ type: "pdf", title: pdf.title, message: "New Paid PDF Added", time: pdf.createdAt });
    });
    recentPapers.forEach(paper => {
      activities.push({ type: "paper", title: paper.title, message: "New Paper Added", time: paper.createdAt });
    });
    
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    res.json({ success: true, activities: activities.slice(0, 10) });
  } catch (error) {
    console.error(error);
    res.json({ success: true, activities: [] });
  }
});

router.get("/revenue-stats", adminAuth, async (req, res) => {
  try {
    const isSuperAdmin = req.admin.role === 'super_admin';
    const allowedCourses = req.admin.permissions?.courses || [];
    
    let filter = {};
    if (!isSuperAdmin && allowedCourses.length > 0) {
      filter = { course: { $in: allowedCourses } };
    }
    
    const [notes, videos, paidPDFs, papers, users] = await Promise.all([
      Note.find(filter),
      Video.find(filter),
      PaidPDF.find(filter),
      Paper.find(filter),
      User.find()
    ]);
    
    const totalDownloads = 
      notes.reduce((sum, item) => sum + (item.downloadCount || 0), 0) +
      videos.reduce((sum, item) => sum + (item.downloadCount || 0), 0) +
      paidPDFs.reduce((sum, item) => sum + (item.downloadCount || 0), 0) +
      papers.reduce((sum, item) => sum + (item.downloadCount || 0), 0);
    
    const revenueResult = await Payment.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = users.filter(user => user.lastLogin && new Date(user.lastLogin) >= thirtyDaysAgo).length;
    
    console.log(`📊 Stats: Downloads=${totalDownloads}, Revenue=${totalRevenue}, ActiveUsers=${activeUsers}`);
    
    res.json({
      success: true,
      totalRevenue: totalRevenue,
      totalDownloads: totalDownloads,
      activeUsers: activeUsers,
      revenueGrowth: 12.5,
      downloadGrowth: totalDownloads > 0 ? 8.3 : 0
    });
  } catch (error) {
    console.error("Revenue stats error:", error);
    res.json({ success: true, monthlyRevenue: 0, totalDownloads: 0, activeUsers: 0 });
  }
});

router.get("/weekly-performance", adminAuth, async (req, res) => {
  try {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyData = days.map(day => ({ 
      day, 
      views: Math.floor(Math.random() * 100),
      downloads: Math.floor(Math.random() * 50),
      revenue: Math.floor(Math.random() * 5000)
    }));
    res.json({ success: true, data: weeklyData });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

router.get("/conversion-rate", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const usersWithPurchases = await PaidPDF.distinct("purchasedBy");
    const conversionRate = totalUsers > 0 ? (usersWithPurchases.length / totalUsers) * 100 : 0;
    res.json({ success: true, conversionRate: Math.round(conversionRate), growth: 5 });
  } catch (error) {
    res.json({ success: true, conversionRate: 0, growth: 0 });
  }
});

router.get("/top-performers", adminAuth, async (req, res) => {
  try {
    const notes = await Note.find().sort({ downloadCount: -1, views: -1 }).limit(5);
    const videos = await Video.find().sort({ views: -1 }).limit(5);
    const pdfs = await PaidPDF.find().sort({ downloadCount: -1 }).limit(5);
    const papers = await Paper.find().sort({ downloadCount: -1 }).limit(5);
    
    let allPerformers = [...notes, ...videos, ...pdfs, ...papers];
    allPerformers.sort((a, b) => (b.downloadCount || b.views || 0) - (a.downloadCount || a.views || 0));
    allPerformers = allPerformers.slice(0, 10);
    
    res.json({ success: true, performers: allPerformers });
  } catch (error) {
    console.error(error);
    res.json({ success: true, performers: [] });
  }
});

router.post("/increment-download", adminAuth, async (req, res) => {
  try {
    const { contentId, contentType } = req.body;
    
    if (!contentId || !contentType) {
      return res.status(400).json({ message: "contentId and contentType required" });
    }
    
    let Model;
    switch(contentType) {
      case 'note':
        Model = Note;
        break;
      case 'video':
        Model = Video;
        break;
      case 'paid-pdf':
        Model = PaidPDF;
        break;
      case 'paper':
        Model = Paper;
        break;
      default:
        return res.status(400).json({ message: "Invalid content type" });
    }
    
    const content = await Model.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    
    content.downloadCount = (content.downloadCount || 0) + 1;
    await content.save();
    
    console.log(`✅ Download counted: ${contentType} - ${content.title} (Total: ${content.downloadCount})`);
    
    res.json({ 
      success: true, 
      message: "Download counted",
      downloadCount: content.downloadCount 
    });
  } catch (error) {
    console.error("Increment download error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= PUBLIC API =================
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

// ================= PUBLIC DOWNLOAD FOR USERS =================
router.get("/public/download/:type/:id", authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    
    console.log("========== PUBLIC DOWNLOAD REQUEST ==========");
    console.log("1. Type:", type);
    console.log("2. ID:", id);
    
    let Model;

    if (type === 'note') {
      Model = Note;
    } else if (type === 'video' || type === 'practical-video') {
      Model = Video;
    } else if (type === 'paid-pdf') {
      Model = PaidPDF;
    } else if (type === 'paper' || type === 'predictive-paper') {
      Model = Paper;
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }

    const content = await Model.findById(id);
    if (!content) return res.status(404).json({ message: "Content not found" });
    
    content.downloadCount = (content.downloadCount || 0) + 1;
    await content.save();
    console.log("3. Download count updated to:", content.downloadCount);
    
    const token = req.headers.authorization?.split(' ')[1];
    console.log("4. Token present?", token ? "YES" : "NO");
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("5. Decoded token:", decoded);
        
        const userId = decoded.userId || decoded.id || decoded._id;
        console.log("6. User ID:", userId);
        
        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            if (!user.downloadHistory) user.downloadHistory = [];
            
            user.downloadHistory.push({
              productId: content._id,
              productTitle: content.title,
              productType: type,
              downloadedAt: new Date()
            });
            await user.save();
            
            console.log(`✅ Download history saved for user: ${userId} - ${content.title}`);
            console.log(`📊 Total downloads in history: ${user.downloadHistory.length}`);
          } else {
            console.log("❌ User not found with ID:", userId);
          }
        } else {
          console.log("❌ No userId found in token");
        }
      } catch (err) {
        console.log("❌ Token verification failed:", err.message);
      }
    } else {
      console.log("⚠️ No token provided - download history not saved");
    }
    
    console.log(`📥 Download: ${type} - ${content.title} (Total: ${content.downloadCount})`);
    console.log("=====================================\n");
    
    if (content.fileData) {
      const base64Data = content.fileData.split(',')[1] || content.fileData;
      const fileBuffer = Buffer.from(base64Data, 'base64');
      
      const fileType = content.fileType || 'application/octet-stream';
      const isViewable =
        fileType.startsWith("image/") ||
        fileType.startsWith("video/") ||
        fileType === "application/pdf";
      const disposition = isViewable ? "inline" : "attachment";
      
      res.setHeader('Content-Type', fileType);
      res.setHeader('Content-Disposition', `${disposition}; filename="${content.title}"`);
      res.send(fileBuffer);
    } else if (content.videoUrl) {
      res.json({ downloadUrl: content.videoUrl });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= ADMIN DOWNLOAD =================
router.get("/download/:type/:id", adminAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    
    let Model;

    if (type === 'note') {
      Model = Note;
    } else if (type === 'video' || type === 'practical-video') {
      Model = Video;
    } else if (type === 'paid-pdf') {
      Model = PaidPDF;
    } else if (type === 'paper' || type === 'predictive-paper') {
      Model = Paper;
    } else {
      return res.status(400).json({ message: "Invalid type" });
    }
    
    const content = await Model.findById(id);
    if (!content) return res.status(404).json({ message: "Content not found" });
    
    content.downloadCount = (content.downloadCount || 0) + 1;
    await content.save();
    
    console.log(`📥 Admin Download: ${type} - ${content.title} (Total: ${content.downloadCount})`);
    
    if (content.fileData) {
      const base64Data = content.fileData.split(',')[1] || content.fileData;
      const fileBuffer = Buffer.from(base64Data, 'base64');
      
      const fileType = content.fileType || 'application/octet-stream';
      const isViewable =
        fileType.startsWith("image/") ||
        fileType.startsWith("video/") ||
        fileType === "application/pdf";
      const disposition = isViewable ? "inline" : "attachment";
      res.setHeader('Content-Type', fileType);
      res.setHeader('Content-Disposition', `${disposition}; filename="${content.title}"`);
      res.send(fileBuffer);
    } else if (content.videoUrl) {
      res.json({ downloadUrl: content.videoUrl });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ CORRECT PUBLIC PRICE ROUTE - Uses CoursePrice collection
router.get("/public-price", async (req, res) => {
  try {
    const coursePrices = await CoursePrice.findOne();

    if (!coursePrices) {
      return res.json({
        "B.Pharm": { price: 99, discount: 0 },
        "D.Pharm": { price: 79, discount: 0 },
        "M.Pharm": { price: 149, discount: 0 },
        "Pharm.D": { price: 129, discount: 0 },
        "PhD": { price: 199, discount: 0 }
      });
    }

    const p = coursePrices.prices;

    res.json({
      "B.Pharm": p.get("BPharm"),
      "D.Pharm": p.get("DPharm"),
      "M.Pharm": p.get("MPharm"),
      "Pharm.D": p.get("PharmD"),
      "PhD": p.get("PhD")
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ================= SUB ADMINS =================
router.get("/subadmins", adminAuth, async (req, res) => {
  try {
    const subAdmins = await Admin.find({ role: "sub_admin" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ success: true, subAdmins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/subadmins/:id", adminAuth, async (req, res) => {
  try {
    const { name, email, permissions, isActive } = req.body;
    const updatedAdmin = await Admin.findOneAndUpdate(
      { _id: req.params.id, role: "sub_admin" },
      { name, email, permissions: { courses: Array.isArray(permissions) ? permissions : [] }, isActive },
      { new: true, runValidators: true }
    ).select("-password");
    if (!updatedAdmin) {
      return res.status(404).json({ success: false, message: "Sub Admin not found" });
    }
    res.json({ success: true, message: "Sub Admin updated successfully", admin: updatedAdmin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/subadmins/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await Admin.findOneAndDelete({ _id: req.params.id, role: "sub_admin" });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Sub Admin not found" });
    }
    res.json({ success: true, message: "Sub Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/register-subadmin", adminAuth, async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Admin already exists" });
    }
    const admin = new Admin({
      name,
      email,
      password,
      role: "sub_admin",
      permissions: { courses: Array.isArray(permissions) ? permissions : [] },
      createdBy: req.admin.id
    });
    await admin.save();
    res.status(201).json({ success: true, message: "Sub Admin created successfully", admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= USERS =================
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid User ID" });
    }
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= DELETE USER ACCOUNT (Self) =================
router.delete("/delete-user-account", authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only users can delete their account"
      });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password"
      });
    }

    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

// ================= DELETE ADMIN ACCOUNT (Self) =================
router.delete("/delete-admin-account", adminAuth, async (req, res) => {
  try {
    const adminId = req.admin.id;
    
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        message: "Admin not found" 
      });
    }

    if (admin.role === 'super_admin') {
      const superAdminCount = await Admin.countDocuments({ role: 'super_admin' });
      if (superAdminCount === 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last super admin account. Please create another super admin first."
        });
      }
    }

    await Admin.findByIdAndDelete(adminId);
    
    res.json({
      success: true,
      message: "Admin account deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting admin account:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting admin account",
      error: error.message
    });
  }
});

// ================= ADMIN PROFILE =================
router.get("/profile", adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    res.json({ success: true, admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.put("/update-profile", adminAuth, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (currentPassword && newPassword) {
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Current password is incorrect" });
      }
      admin.password = newPassword;
    }
    await admin.save();
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;