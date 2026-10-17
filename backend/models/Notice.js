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

    // Optional notice image. Supports hosted URLs or validated data URLs
    // when the admin route is configured to accept base64 image uploads.
    imageUrl: {
      type: String,
      default: "",
      maxlength: 5000000,
      trim: true
    },

    // Only http/https links should be accepted by the admin route.
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

    // Target audience for notices: everyone or a specific course/branch.
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

noticeSchema.pre("save", function updateNoticeTimestamp(next) {
  this.updatedAt = new Date();
  next();
});

noticeSchema.pre("findOneAndUpdate", function updateNoticeTimestamp() {
  this.set({ updatedAt: new Date() });
});

module.exports =
  mongoose.models.Notice || mongoose.model("Notice", noticeSchema);