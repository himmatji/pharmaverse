const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Notice = require("../models/Notice");
const User = require("../models/User");

// Verify logged-in user
const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first."
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || process.env.JWT_SECRET_KEY
    );

    const userId = decoded.userId || decoded.id || decoded._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid login session."
      });
    }

    const user = await User.findById(userId).select("_id");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Notification authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Session expired. Please login again."
    });
  }
};

// Check whether a notice is currently visible
const isNoticeVisible = (notice) => {
  const now = new Date();

  if (notice.isActive === false) {
    return false;
  }

  if (notice.startDate && new Date(notice.startDate) > now) {
    return false;
  }

  if (notice.endDate && new Date(notice.endDate) < now) {
    return false;
  }

  return true;
};

// GET /api/notifications
// Fetch notices and unread count for the logged-in user
router.get("/", userAuth, async (req, res) => {
  try {
    const notices = await Notice.find({
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: null },
            { startDate: { $exists: false } },
            { startDate: { $lte: new Date() } }
          ]
        },
        {
          $or: [
            { endDate: null },
            { endDate: { $exists: false } },
            { endDate: { $gte: new Date() } }
          ]
        }
      ]
    }).sort({ createdAt: -1 });

    const visibleNotices = notices.filter(isNoticeVisible);

    const formattedNotices = visibleNotices.map((notice) => {
      const isRead = (notice.readBy || []).some(
        (id) => id.toString() === req.user._id.toString()
      );

      return {
        _id: notice._id,
        title: notice.title,
        description: notice.description || "",
        type: notice.type || "info",
        startDate: notice.startDate,
        endDate: notice.endDate,
        createdAt: notice.createdAt,
        isRead
      };
    });

    const unreadCount = formattedNotices.filter(
      (notice) => !notice.isRead
    ).length;

    return res.status(200).json({
      success: true,
      notices: formattedNotices,
      unreadCount
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
// Mark a notice as read for the logged-in user
router.post("/:id/read", userAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice ID."
      });
    }

    const notice = await Notice.findOneAndUpdate(
      {
        _id: id,
        isActive: true
      },
      {
        $addToSet: {
          readBy: req.user._id
        }
      },
      {
        new: true
      }
    );

    if (!notice || !isNoticeVisible(notice)) {
      return res.status(404).json({
        success: false,
        message: "Notice not found or no longer available."
      });
    }

    const unreadCount = await Notice.countDocuments({
      isActive: true,
      _id: { $ne: notice._id },
      readBy: { $ne: req.user._id }
    });

    return res.status(200).json({
      success: true,
      message: "Notice marked as read.",
      noticeId: notice._id,
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