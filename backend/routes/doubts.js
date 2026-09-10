const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Doubt = require("../models/Doubt");
const User = require("../models/User");
const Admin = require("../models/Admin");

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "your_super_secret_key_change_this";

/* =========================================================
   HELPERS
========================================================= */

const getBearerToken = (req) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
};

const getUserFromToken = async (req) => {
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.userId) return null;

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return null;

    return { decoded, user };
  } catch {
    return null;
  }
};

const adminAuth = async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No admin token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Current PharmaVerse admin token format.
    if (decoded.type === "admin" && decoded.adminId) {
      const admin = await Admin.findById(decoded.adminId).select("-password");

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: "Admin not found",
        });
      }

      if (admin.isActive === false) {
        return res.status(403).json({
          success: false,
          message: "Admin account is inactive",
        });
      }

      req.admin = {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        type: "admin",
      };

      return next();
    }

    // Backward-compatible admin tokens carrying email.
    if (decoded.email) {
      const admin = await Admin.findOne({
        email: decoded.email,
        isActive: { $ne: false },
      }).select("-password");

      if (admin) {
        req.admin = {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          type: "admin",
        };

        return next();
      }
    }

    // Backward-compatible role-based admin tokens.
    if (
      decoded.role === "admin" ||
      decoded.role === "super_admin"
    ) {
      const admin = await Admin.findOne({
        role: decoded.role === "super_admin" ? "super_admin" : { $in: ["admin", "super_admin"] },
        isActive: { $ne: false },
      }).select("-password");

      if (admin) {
        req.admin = {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          type: "admin",
        };

        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  } catch (error) {
    console.error("Doubts admin auth error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};

const cleanDoubt = (doubt) => {
  const obj = doubt.toObject ? doubt.toObject() : doubt;

  return {
    ...obj,
    replies: Array.isArray(obj.replies)
      ? obj.replies
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime()
          )
      : [],
  };
};

/* =========================================================
   GET ALL DOUBTS
   Used by user DoubtSection + admin Doubts Management.
========================================================= */

router.get("/", async (req, res) => {
  try {
    const doubts = await Doubt.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      doubts: doubts.map(cleanDoubt),
    });
  } catch (error) {
    console.error("GET doubts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load doubts",
    });
  }
});

/* =========================================================
   POST NEW DOUBT
   User authentication required.
========================================================= */

router.post("/", async (req, res) => {
  try {
    const auth = await getUserFromToken(req);

    if (!auth) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const question = String(req.body?.question || "").trim();

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Please write your doubt",
      });
    }

    if (question.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Doubt must be 500 characters or less",
      });
    }

    const doubt = await Doubt.create({
      userId: auth.user._id,
      userName: auth.user.name || "Anonymous",
      userEmail: auth.user.email || "",
      question,
      replies: [],
    });

    return res.status(201).json({
      success: true,
      message: "Doubt posted successfully",
      doubt: cleanDoubt(doubt),
    });
  } catch (error) {
    console.error("POST doubt error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to post doubt",
    });
  }
});

/* =========================================================
   POST USER REPLY
========================================================= */

router.post("/:doubtId/reply", async (req, res) => {
  try {
    const auth = await getUserFromToken(req);

    if (!auth) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const { doubtId } = req.params;
    const message = String(req.body?.message || "").trim();

    if (!mongoose.Types.ObjectId.isValid(doubtId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doubt ID",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Please write a reply",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Reply must be 2000 characters or less",
      });
    }

    const doubt = await Doubt.findById(doubtId);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: "Doubt not found",
      });
    }

    doubt.replies.push({
      userId: auth.user._id,
      userName: auth.user.name || "Anonymous",
      userEmail: auth.user.email || "",
      message,
      isAdmin: false,
      createdAt: new Date(),
    });

    await doubt.save();

    return res.status(201).json({
      success: true,
      message: "Reply posted successfully",
      doubt: cleanDoubt(doubt),
    });
  } catch (error) {
    console.error("POST user reply error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to post reply",
    });
  }
});

/* =========================================================
   ADMIN REPLY
========================================================= */

router.post("/:doubtId/admin-reply", adminAuth, async (req, res) => {
  try {
    const { doubtId } = req.params;
    const message = String(req.body?.message || "").trim();

    if (!mongoose.Types.ObjectId.isValid(doubtId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doubt ID",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Please write a reply",
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Reply must be 2000 characters or less",
      });
    }

    const doubt = await Doubt.findById(doubtId);

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: "Doubt not found",
      });
    }

    doubt.replies.push({
      userId: req.admin.id,
      userName: req.admin.name || "PharmaVerse Team",
      userEmail: req.admin.email || "",
      message,
      isAdmin: true,
      createdAt: new Date(),
    });

    await doubt.save();

    return res.status(201).json({
      success: true,
      message: "Admin reply posted successfully",
      doubt: cleanDoubt(doubt),
    });
  } catch (error) {
    console.error("POST admin reply error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to post admin reply",
    });
  }
});

/* =========================================================
   ADMIN DELETE DOUBT
========================================================= */

router.delete("/:doubtId", adminAuth, async (req, res) => {
  try {
    const { doubtId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(doubtId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doubt ID",
      });
    }

    const deleted = await Doubt.findByIdAndDelete(doubtId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Doubt not found",
      });
    }

    return res.json({
      success: true,
      message: "Doubt deleted successfully",
      doubtId,
    });
  } catch (error) {
    console.error("DELETE doubt error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete doubt",
    });
  }
});

/* =========================================================
   ADMIN DELETE REPLY
========================================================= */

router.delete(
  "/:doubtId/reply/:replyId",
  adminAuth,
  async (req, res) => {
    try {
      const { doubtId, replyId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(doubtId) ||
        !mongoose.Types.ObjectId.isValid(replyId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid doubt or reply ID",
        });
      }

      const doubt = await Doubt.findById(doubtId);

      if (!doubt) {
        return res.status(404).json({
          success: false,
          message: "Doubt not found",
        });
      }

      const replyExists = doubt.replies.id(replyId);

      if (!replyExists) {
        return res.status(404).json({
          success: false,
          message: "Reply not found",
        });
      }

      doubt.replies.pull(replyId);
      await doubt.save();

      return res.json({
        success: true,
        message: "Reply deleted successfully",
        doubt: cleanDoubt(doubt),
      });
    } catch (error) {
      console.error("DELETE reply error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete reply",
      });
    }
  }
);

/* =========================================================
   HEALTH / TEST
========================================================= */

router.get("/test/health", (req, res) => {
  return res.json({
    success: true,
    message: "Doubts API is working",
    endpoints: {
      get: "GET /api/doubts",
      create: "POST /api/doubts",
      userReply: "POST /api/doubts/:doubtId/reply",
      adminReply: "POST /api/doubts/:doubtId/admin-reply",
      deleteDoubt: "DELETE /api/doubts/:doubtId",
      deleteReply: "DELETE /api/doubts/:doubtId/reply/:replyId",
    },
  });
});

module.exports = router;
