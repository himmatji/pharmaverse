const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Notice = require("../models/Notice");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;

async function userAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first."
      });
    }

    if (!JWT_SECRET) {
      console.error("JWT_SECRET/JWT_SECRET_KEY is not configured.");
      return res.status(500).json({
        success: false,
        message: "Authentication is not configured on the server."
      });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(401).json({
        success: false,
        message: "Invalid login session."
      });
    }

    const user = await User.findById(userId).select("_id isActive");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again."
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again."
      });
    }

    console.error("Notification authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not authenticate notification request."
    });
  }
}

function visibleNoticeFilter(now = new Date()) {
  return {
    isActive: { $ne: false },
    $and: [
      {
        $or: [
          { startDate: null },
          { startDate: { $exists: false } },
          { startDate: { $lte: now } }
        ]
      },
      {
        $or: [
          { endDate: null },
          { endDate: { $exists: false } },
          { endDate: { $gte: now } }
        ]
      }
    ]
  };
}

// GET /api/notifications
router.get("/", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const notices = await Notice.find(visibleNoticeFilter())
      .select("title description type startDate endDate isActive createdAt readBy")
      .sort({ createdAt: -1 })
      .lean();

    const formattedNotices = notices.map((notice) => {
      const isRead = (notice.readBy || []).some(
        (readUserId) => String(readUserId) === String(userId)
      );

      return {
        _id: notice._id,
        title: notice.title,
        description: notice.description || "",
        type: notice.type || "info",
        startDate: notice.startDate || null,
        endDate: notice.endDate || null,
        createdAt: notice.createdAt,
        isRead
      };
    });

    return res.status(200).json({
      success: true,
      notices: formattedNotices,
      unreadCount: formattedNotices.filter((notice) => !notice.isRead).length
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications."
    });
  }
});

// POST /api/notifications/:id/read
router.post("/:id/read", userAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice ID."
      });
    }

    const userId = req.user._id;
    const notice = await Notice.findOneAndUpdate(
      {
        _id: id,
        ...visibleNoticeFilter(),
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } },
      { new: true }
    );

    if (!notice) {
      const existing = await Notice.findOne({
        _id: id,
        ...visibleNoticeFilter()
      }).select("_id readBy");

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Notice not found or no longer available."
        });
      }

      const alreadyRead = (existing.readBy || []).some(
        (readUserId) => String(readUserId) === String(userId)
      );

      if (!alreadyRead) {
        return res.status(500).json({
          success: false,
          message: "Could not mark notice as read."
        });
      }
    }

    const unreadCount = await Notice.countDocuments({
      ...visibleNoticeFilter(),
      readBy: { $ne: userId }
    });

    return res.status(200).json({
      success: true,
      message: "Notice marked as read.",
      noticeId: id,
      unreadCount
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notice as read."
    });
  }
});

module.exports = router;
