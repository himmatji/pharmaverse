const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const Notice = require("../models/Notice");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;

const NOTICE_TARGETS = new Set([
  "all",
  "bpharm",
  "dpharm",
  "mpharm",
  "pharmd",
  "phd"
]);

/*
 * Backward-compatible schema support:
 * Older Notice.js versions may not define imageUrl, linkUrl, linkText, or target.
 * Define missing paths here so this route can read them from MongoDB.
 * It is still recommended to keep these fields in models/Notice.js as well.
 */
function ensureNoticeSchemaFields() {
  const schema = Notice && Notice.schema;
  if (!schema) return;

  if (!schema.path("imageUrl")) {
    schema.add({
      imageUrl: {
        type: String,
        default: "",
        maxlength: 5000000
      }
    });
  }

  if (!schema.path("linkUrl")) {
    schema.add({
      linkUrl: {
        type: String,
        default: "",
        maxlength: 2048
      }
    });
  }

  if (!schema.path("linkText")) {
    schema.add({
      linkText: {
        type: String,
        default: "",
        maxlength: 120
      }
    });
  }

  if (!schema.path("target")) {
    schema.add({
      target: {
        type: String,
        enum: Array.from(NOTICE_TARGETS),
        default: "all"
      }
    });
  }
}

ensureNoticeSchemaFields();

function normalizeTarget(value) {
  const target = String(value || "all")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  return NOTICE_TARGETS.has(target) ? target : "all";
}

function normalizeUserCourseValues(user) {
  const values = [];

  const addValue = (value) => {
    if (Array.isArray(value)) {
      value.forEach(addValue);
      return;
    }

    if (value && typeof value === "object") {
      if (value.name) addValue(value.name);
      if (value.course) addValue(value.course);
      if (value.branch) addValue(value.branch);
      if (value.program) addValue(value.program);
      return;
    }

    if (typeof value === "string" && value.trim()) {
      values.push(
        value
          .trim()
          .toLowerCase()
          .replace(/[^a-z]/g, "")
      );
    }
  };

  if (!user) return values;

  addValue(user.course);
  addValue(user.branch);
  addValue(user.program);
  addValue(user.degree);
  addValue(user.courseName);
  addValue(user.branchName);
  addValue(user.enrolledCourses);

  return [...new Set(values)];
}

function userCanSeeTarget(notice, user) {
  const target = normalizeTarget(notice.target);
  if (target === "all") return true;

  const userValues = normalizeUserCourseValues(user);

  // If the user model does not contain a recognizable course/branch value,
  // keep targeted notices hidden rather than showing them to the wrong users.
  return userValues.includes(target);
}

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

    // Load the full user document so course/branch fields can be used for
    // target-specific notices without assuming one exact User schema layout.
    const user = await User.findById(userId);

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
    return next();
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

function formatNotice(notice, userId) {
  const readBy = Array.isArray(notice.readBy) ? notice.readBy : [];
  const isRead = readBy.some(
    (readUserId) => String(readUserId) === String(userId)
  );

  return {
    _id: notice._id,
    title: notice.title || "",
    description: notice.description || "",
    type: notice.type || "info",
    imageUrl: notice.imageUrl || "",
    linkUrl: notice.linkUrl || "",
    linkText: notice.linkText || "",
    target: normalizeTarget(notice.target),
    startDate: notice.startDate || null,
    endDate: notice.endDate || null,
    createdAt: notice.createdAt || null,
    isRead
  };
}

// GET /api/notifications
// Returns active notices, including optional image/link fields and unread count.
router.get("/", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const notices = await Notice.find(visibleNoticeFilter())
      .select(
        "title description type imageUrl linkUrl linkText target startDate endDate isActive createdAt readBy"
      )
      .sort({ createdAt: -1 })
      .lean();

    const formattedNotices = notices
      .filter((notice) => userCanSeeTarget(notice, req.user))
      .map((notice) => formatNotice(notice, userId));

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

    const notice = await Notice.findOne({
      _id: id,
      ...visibleNoticeFilter()
    }).lean();

    if (!notice || !userCanSeeTarget(notice, req.user)) {
      return res.status(404).json({
        success: false,
        message: "Notice not found or no longer available."
      });
    }

    await Notice.updateOne(
      { _id: id },
      { $addToSet: { readBy: userId } }
    );

    const unreadNotices = await Notice.find(visibleNoticeFilter())
      .select("readBy target")
      .lean();

    const unreadCount = unreadNotices.filter((item) => {
      if (!userCanSeeTarget(item, req.user)) return false;

      return !(item.readBy || []).some(
        (readUserId) => String(readUserId) === String(userId)
      );
    }).length;

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