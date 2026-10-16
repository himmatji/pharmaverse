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
    course: {
      type: String,
      required: true,
      trim: true
    },

    branch: { type: String, default: "", trim: true },
    mpharmBranch: { type: String, default: "", trim: true },

    // ================= CATEGORY =================
    category: { type: String, default: "Notes", trim: true },

    // ================= SEMESTER / YEAR =================
    semester: { type: Number, default: 1 },
    year: { type: String, default: "", trim: true },
    language: { type: String, default: "", trim: true, lowercase: true },

    // ================= SUBJECT / UNIT =================
    subject: { type: String, default: "", trim: true },
    unit: { type: Number, default: 1 },
    units: { type: mongoose.Schema.Types.Mixed, default: [] },

    // ================= CONTENT TYPE =================
    type: { type: String, default: "note", trim: true },
    isPremium: { type: Boolean, default: false },

    // ================= FILE INFORMATION =================
    thumbnail: { type: String, default: "" },
    fileName: { type: String, required: true, trim: true },
    fileType: { type: String, required: true, trim: true },
    fileSize: { type: String, required: true },
    fileData: {
      type: String,
      required: function () { return this.isDirectFile !== true; },
      default: ""
    },
    isDirectFile: { type: Boolean, default: false },
    filePath: { type: String, default: "" },

    // ================= VIDEO URL =================
    videoUrl: { type: String, default: "" },

    // ================= DIFFICULTY =================
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Expert"],
      default: "Medium"
    },

    // ================= STATS =================
    views: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },

    // ================= PRICE =================
    price: { type: Number, default: 0 },
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // ================= LIFECYCLE =================
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    strict: true,
    timestamps: true
  }
);

// ================= INDEXES =================
noteSchema.index({ category: 1, semester: 1, subject: 1, unit: 1 });
noteSchema.index({ course: 1, category: 1 });
noteSchema.index({ course: 1, category: 1, isDirectFile: 1, semester: 1, subject: 1 });
noteSchema.index({ isPremium: 1 });
noteSchema.index({ createdAt: -1 });

// ================= VIRTUAL: UNIT NAME =================
noteSchema.virtual("unitName").get(function () {
  if (this.units && this.units.length > 0) {
    const unit = this.units.find((item) => Number(item.id) === Number(this.unit));
    return unit ? unit.name : `Unit ${this.unit}`;
  }
  return `Unit ${this.unit}`;
});

// ================= VIRTUAL: UNIT TOPICS =================
noteSchema.virtual("unitTopics").get(function () {
  if (this.units && this.units.length > 0) {
    const unit = this.units.find((item) => Number(item.id) === Number(this.unit));
    return unit ? unit.topics || [] : [];
  }
  return [];
});

// ================= PREVIEW WITHOUT FILE DATA =================
noteSchema.methods.getPreview = function () {
  const obj = this.toObject();
  delete obj.fileData;
  delete obj.filePath;
  return obj;
};

// ================= INCREMENT VIEWS =================
noteSchema.methods.incrementViews = async function () {
  this.views = (this.views || 0) + 1;
  return this.save();
};

// ================= INCREMENT DOWNLOADS =================
noteSchema.methods.incrementDownloads = async function () {
  this.downloadCount = (this.downloadCount || 0) + 1;
  return this.save();
};

// ================= FIND BY UNIT =================
noteSchema.statics.findByUnit = function (category, semester, subject, unit) {
  return this.find({ category, semester, subject, unit }).sort({ createdAt: -1 });
};

// ================= FIND BY COURSE AND CATEGORY =================
noteSchema.statics.findByCourseAndCategory = function (course, category) {
  return this.find({ course, category }).sort({ createdAt: -1 });
};

// ================= FIND POPULAR CONTENT =================
noteSchema.statics.findPopular = function (limit = 10) {
  return this.find({}).sort({ views: -1, downloadCount: -1 }).limit(limit);
};

module.exports = mongoose.model("Note", noteSchema);
