const mongoose = require("mongoose");

/*
 * PharmaVerse CoursePrice model
 *
 * Supports:
 * 1. Legacy course-wide prices through `prices` (kept for compatibility).
 * 2. Exact content pricing through `contentPrices`.
 * 3. Separate complete Interview Material pricing.
 *
 * Course content is identified by:
 * course + category + semester + year + language + specialization + contentKey
 *
 * `contentKey` must be generated consistently by the backend/admin API.
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
    course: {
      type: String,
      required: true,
      enum: ["B.Pharm", "D.Pharm", "M.Pharm", "Pharm.D", "PharmaD", "PhD"],
      trim: true,
    },

    // Expected values include: notes, exam-crash-course, pyqs, practical, other.
    category: {
      type: String,
      required: true,
      trim: true,
    },

    // Semester-based courses use semester; year-based courses use year.
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

    language: {
      type: String,
      enum: ["", "Hindi", "English", "Both", "Other", "hindi", "english", "both", "other"],
      default: "",
      set: (value) => (value == null ? "" : String(value).trim()),
    },

    specialization: {
      type: String,
      trim: true,
      default: "",
    },

    accessType: {
      type: String,
      enum: ["free", "paid"],
      default: "paid",
      required: true,
      lowercase: true,
      trim: true,
    },

    price: {
      type: Number,
      default: 99,
      min: 0,
      required: true,
    },

    // Decimal discounts such as 4.5 are supported.
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

    // Must match the contentKey used by payment.js and the frontend.
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

// Computed value for code that explicitly uses subdocument virtuals.
// Payment routes still calculate the payable amount independently on the server.
ContentPriceSchema.virtual("finalPrice").get(function () {
  const price = Number(this.price);
  const discount = Number(this.discount ?? 0);

  if (
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isFinite(discount) ||
    discount < 0 ||
    discount > 100
  ) {
    return null;
  }

  return Math.round(price * (1 - discount / 100) * 100) / 100;
});

const InterviewMaterialPriceSchema = new mongoose.Schema(
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

    accessType: {
      type: String,
      enum: ["free", "paid"],
      default: "paid",
      required: true,
      lowercase: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
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
  { _id: false }
);

InterviewMaterialPriceSchema.virtual("finalPrice").get(function () {
  const price = Number(this.price);
  const discount = Number(this.discount ?? 0);

  if (
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isFinite(discount) ||
    discount < 0 ||
    discount > 100
  ) {
    return null;
  }

  return Math.round(price * (1 - discount / 100) * 100) / 100;
});

const CoursePriceSchema = new mongoose.Schema({
  // Legacy course-wide pricing retained for existing APIs.
  // MongoDB Map keys cannot contain ".", so use BPharm rather than B.Pharm.
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

  // Admin-managed exact course/category/semester/year pricing.
  contentPrices: {
    type: [ContentPriceSchema],
    default: [],
  },

  // Separate one-time pricing for complete Interview Material access.
  interviewMaterial: {
    type: InterviewMaterialPriceSchema,
    default: () => ({
      price: 99,
      discount: 0,
      accessType: "paid",
      isActive: true,
    }),
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

// Useful for locating a content pricing entry by its stable key.
// Not unique: legacy/admin data may contain duplicate entries, which should
// be cleaned by the admin API rather than causing index-build failures.
CoursePriceSchema.index({ "contentPrices.contentKey": 1 });

CoursePriceSchema.pre("save", function () {
  this.updatedAt = new Date();

  if (Array.isArray(this.contentPrices)) {
    const now = new Date();

    this.contentPrices.forEach((entry) => {
      if (entry.isModified && entry.isModified()) {
        entry.updatedAt = now;
      }
    });
  }
});

module.exports = mongoose.model("CoursePrice", CoursePriceSchema);
