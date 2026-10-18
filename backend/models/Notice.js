
const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 10000
    },

    type: {
      type: String,
      enum: ["info", "warning", "success", "danger"],
      default: "info"
    },

    // Optional notice image: hosted URL or validated image data URL.
    imageUrl: {
      type: String,
      default: "",
      maxlength: 5000000,
      trim: true
    },

    // Only HTTP/HTTPS URLs should be accepted by the admin route.
    linkUrl: {
      type: String,
      default: "",
      maxlength: 2048,
      trim: true
    },

    linkText: {
      type: String,
      default: "Open link",
      maxlength: 120,
      trim: true
    },

    // Target audience: all students or a specific course.
    target: {
      type: String,
      enum: ["all", "bpharm", "dpharm", "mpharm", "pharmd", "phd"],
      default: "all",
      lowercase: true,
      trim: true
    },

    startDate: {
      type: Date,
      default: null
    },

    endDate: {
      type: Date,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    minimize: false,
    versionKey: false
  }
);

// Mongoose-compatible save middleware: do not call next().
noticeSchema.pre("save", function updateNoticeTimestamp() {
  this.updatedAt = new Date();
});

// Update timestamp for findOneAndUpdate operations.
noticeSchema.pre("findOneAndUpdate", function updateNoticeTimestamp() {
  this.set({ updatedAt: new Date() });
});

module.exports =
  mongoose.models.Notice || mongoose.model("Notice", noticeSchema);
