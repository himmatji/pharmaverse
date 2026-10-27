





















































const mongoose = require("mongoose");

/*
 * PharmaVerse CoursePrice model
 *
 * Backward-compatible:
 * - Keeps the legacy `prices` Map for existing dashboard/API compatibility.
 * - Adds `contentPrices` for course/category/semester/year/language/specialization pricing.
 * - Uses an array of subdocuments rather than a Map so keys can safely contain
 *   values such as "B.Pharm" without MongoDB/Mongoose Map-key restrictions.
 *
 * NOTE:
 * Payment routes and Admin APIs must be updated to read/write contentPrices
 * and enforce access based on the exact content scope before this feature is live.
 */

const PriceSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      default: 99,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const ContentPriceSchema = new mongoose.Schema(
  {
    // Course names deliberately stored as strings, not Map keys.
    course: {
      type: String,
      required: true,
      enum: ["B.Pharm", "D.Pharm", "M.Pharm", "Pharm.D", "PharmaD", "PhD"],
      trim: true,
    },

    // Examples: Notes, Exam Crash Course, PYQs.
    category: {
      type: String,
      required: true,
      trim: true,
    },

    // Semester for B.Pharm/M.Pharm; year for D.Pharm/Pharm.D.
    semester: {
      type: Number,
      min: 1,
      max: 12,
      default: undefined,
    },

    year: {
      type: Number,
      min: 1,
      max: 10,
      default: undefined,
    },

    // D.Pharm can distinguish Hindi and English; other courses may omit it.
    language: {
      type: String,
      enum: ["", "Hindi", "English", "Both", "Other", "hindi", "english", "both", "other"],
      default: "",
      set: (value) => (value == null ? "" : value),
    },

    // Required when the course/category is specialization-specific, e.g. M.Pharm.
    specialization: {
      type: String,
      trim: true,
      default: undefined,
    },

    // "free" items open without payment; "paid" items require a verified purchase.
    accessType: {
      type: String,
      enum: ["free", "paid"],
      default: "paid",
      required: true,
    },

    price: {
      type: Number,
      default: 99,
      min: 0,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Stable identifier to be generated/validated by the backend.
    contentKey: {
      type: String,
      trim: true,
      required: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { _id: true }
);

const CoursePriceSchema = new mongoose.Schema({
  // LEGACY COURSE-WIDE PRICES: kept for compatibility with existing code.
  // Keys must not contain "." (e.g. use BPharm, not B.Pharm).
  prices: {
    type: Map,
    of: PriceSchema,
    default: () =>
      new Map([
        ["BPharm", { price: 99, discount: 0 }],
        ["DPharm", { price: 79, discount: 0 }],
        ["MPharm", { price: 149, discount: 0 }],
        ["PharmD", { price: 129, discount: 0 }],
        ["PhD", { price: 199, discount: 0 }],
      ]),
  },

  // NEW: exact content-scope pricing entries.
  contentPrices: {
    type: [ContentPriceSchema],
    default: [],
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
});

// Auto update timestamp. Mongoose 8+ middleware does not use next() here.
CoursePriceSchema.pre("save", function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model("CoursePrice", CoursePriceSchema);


