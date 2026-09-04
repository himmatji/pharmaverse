const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    // ================= BASIC INFORMATION =================
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    // ================= COURSE / BRANCH =================
    // Existing system uses "course"
    // New Branch Upload will save branch here as well
    course: {
      type: String,
      required: true,
      trim: true
    },

    branch: {
      type: String,
      default: "",
      trim: true
    },

    // ================= CATEGORY =================
    // Notes, Exam Crash Course, PYQs
    category: {
      type: String,
      default: "Notes",
      trim: true
    },

    // ================= SEMESTER =================
    semester: {
      type: Number,
      default: 1
    },

    // ================= SUBJECT =================
    subject: {
      type: String,
      default: "",
      trim: true
    },

    // ================= UNIT =================
    unit: {
      type: Number,
      default: 1
    },

    // ================= UNITS (Full structure) =================
    // Example:
    // [
    //   {
    //     id: 1,
    //     name: "Unit 1",
    //     topics: ["Topic 1", "Topic 2"]
    //   },
    //   {
    //     id: 2,
    //     name: "Unit 2",
    //     topics: ["Topic 3", "Topic 4"]
    //   }
    // ]
    units: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },

    // ================= CONTENT TYPE =================
    // note / video / paper
    type: {
      type: String,
      default: "note",
      trim: true
    },

    // ================= PREMIUM STATUS =================
    isPremium: {
      type: Boolean,
      default: false
    },

    // ================= FILE INFORMATION =================
    thumbnail: {
      type: String,
      default: ""
    },

    fileName: {
      type: String,
      required: true
    },

    fileType: {
      type: String,
      required: true
    },

    fileSize: {
      type: String,
      required: true
    },

    // Base64 Data URL
    fileData: {
      type: String,
      required: true
    },

    // ================= VIDEO URL (For video type) =================
    videoUrl: {
      type: String,
      default: ""
    },

    // ================= DIFFICULTY (For papers) =================
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Expert'],
      default: 'Medium'
    },

    // ================= STATS =================
    views: {
      type: Number,
      default: 0
    },

    downloadCount: {
      type: Number,
      default: 0
    },

    // ================= PRICE (For paid content) =================
    price: {
      type: Number,
      default: 0
    },

    // ================= PURCHASED BY =================
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // ================= LIFECYCLE =================
    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    strict: true,
    timestamps: true
  }
);

// =========================================================
// INDEXES FOR BETTER PERFORMANCE
// =========================================================
noteSchema.index({ category: 1, semester: 1, subject: 1, unit: 1 });
noteSchema.index({ course: 1, category: 1 });
noteSchema.index({ isPremium: 1 });
noteSchema.index({ createdAt: -1 });

// =========================================================
// VIRTUAL - Get unit name by unit number
// =========================================================
noteSchema.virtual('unitName').get(function() {
  if (this.units && this.units.length > 0) {
    const unit = this.units.find(u => u.id === this.unit);
    return unit ? unit.name : `Unit ${this.unit}`;
  }
  return `Unit ${this.unit}`;
});

// =========================================================
// VIRTUAL - Get unit topics by unit number
// =========================================================
noteSchema.virtual('unitTopics').get(function() {
  if (this.units && this.units.length > 0) {
    const unit = this.units.find(u => u.id === this.unit);
    return unit ? unit.topics || [] : [];
  }
  return [];
});

// =========================================================
// METHOD - Get content preview (without fileData)
// =========================================================
noteSchema.methods.getPreview = function() {
  const obj = this.toObject();
  delete obj.fileData;
  return obj;
};

// =========================================================
// METHOD - Increment views
// =========================================================
noteSchema.methods.incrementViews = async function() {
  this.views = (this.views || 0) + 1;
  return this.save();
};

// =========================================================
// METHOD - Increment downloads
// =========================================================
noteSchema.methods.incrementDownloads = async function() {
  this.downloadCount = (this.downloadCount || 0) + 1;
  return this.save();
};

// =========================================================
// STATIC - Find content by category, semester, subject, unit
// =========================================================
noteSchema.statics.findByUnit = function(category, semester, subject, unit) {
  return this.find({
    category: category,
    semester: semester,
    subject: subject,
    unit: unit
  }).sort({ createdAt: -1 });
};

// =========================================================
// STATIC - Find content by course and category
// =========================================================
noteSchema.statics.findByCourseAndCategory = function(course, category) {
  return this.find({
    course: course,
    category: category
  }).sort({ createdAt: -1 });
};

// =========================================================
// STATIC - Find popular content
// =========================================================
noteSchema.statics.findPopular = function(limit = 10) {
  return this.find({})
    .sort({ views: -1, downloadCount: -1 })
    .limit(limit);
};

// =========================================================
// ✅ FINAL EXPORT
// =========================================================
module.exports = mongoose.model("Note", noteSchema);