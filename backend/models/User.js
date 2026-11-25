
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/*
 * PharmaVerse User model.
 * Backward-compatible: keeps existing authentication, password reset,
 * session fields, and legacy purchase fields.
 */

const purchasedItemSchema = new mongoose.Schema({
  productType: {
    type: String,
    enum: [
      'paid-pdf',
      'practical-video',
      'predictive-paper',
      'premium_course',
      'paper',
      'video',
      'course-content',
      'interview-material'
    ]
  },

  // Supports ObjectId and String identifiers used by existing products.
  productId: {
    type: mongoose.Schema.Types.Mixed
  },

  productTitle: {
    type: String,
    trim: true
  },

  amount: {
    type: Number,
    min: 0
  },

  // Optional metadata for precise course/category/semester/year access.
  course: {
    type: String,
    enum: ['B.Pharm', 'D.Pharm', 'M.Pharm', 'PharmaD', 'Pharm.D', 'PhD']
  },

  category: {
    type: String,
    trim: true
  },

  semester: {
    type: Number,
    min: 1,
    max: 12
  },

  year: {
    type: Number,
    min: 1,
    max: 10
  },

  language: {
    type: String,
    enum: ['Hindi', 'English', 'Both', 'Other']
  },

  specialization: {
    type: String,
    trim: true
  },

  // Backend-generated stable key.
  contentKey: {
    type: String,
    trim: true
  },

  // Course-content access expiry.
  expiresAt: {
    type: Date,
    default: undefined
  },

  razorpayOrderId: {
    type: String,
    trim: true
  },

  razorpayPaymentId: {
    type: String,
    trim: true
  },

  purchasedAt: {
    type: Date,
    default: Date.now
  }

}, { _id: true });


/*
 * DOWNLOAD HISTORY
 * purchaseId links a download to its exact purchase.
 * contentKey identifies the exact course content scope.
 * Both fields are optional for backward compatibility.
 */

const downloadHistorySchema = new mongoose.Schema({

  productType: {
    type: String,
    enum: [
      'paid-pdf',
      'practical-video',
      'predictive-paper',
      'note',
      'free-material',
      'paper',
      'video'
    ]
  },

  // Supports ObjectId and String identifiers.
  productId: {
    type: mongoose.Schema.Types.Mixed
  },

  productTitle: {
    type: String
  },

  // Exact purchase linked to this download.
  purchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  // Exact course content scope.
  contentKey: {
    type: String,
    default: ''
  },

  downloadedAt: {
    type: Date,
    default: Date.now
  }

}, { _id: true });


const userSchema = new mongoose.Schema({

  // BASIC INFORMATION
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },

  mobile: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },


  // PASSWORD
  password: {
    type: String,
    required: true,
    minlength: 8
  },


  // PROFILE
  profilePicture: {
    type: String,
    default: ''
  },


  // ENROLLED COURSES
  enrolledCourses: [{
    type: String,
    enum: ['B.Pharm', 'D.Pharm', 'M.Pharm', 'PharmaD', 'Pharm.D', 'PhD']
  }],


  // LEGACY GLOBAL PREMIUM FLAG
  isPremium: {
    type: Boolean,
    default: false
  },


  // PURCHASED ITEMS
  purchasedItems: {
    type: [purchasedItemSchema],
    default: []
  },


  // DOWNLOAD HISTORY
  downloadHistory: {
    type: [downloadHistorySchema],
    default: []
  },


  // LOGIN AND SESSION MANAGEMENT
  lastLogin: {
    type: Date,
    default: Date.now
  },

  sessionToken: {
    type: String,
    default: null
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },


  // PASSWORD RESET OTP
  passwordResetOtpHash: {
    type: String,
    default: undefined,
    select: false
  },

  passwordResetOtpExpires: {
    type: Date,
    default: undefined,
    select: false
  },

  passwordResetAttempts: {
    type: Number,
    default: 0,
    select: false
  },

  passwordResetLastSent: {
    type: Date,
    default: undefined,
    select: false
  },


  // TEMPORARY PASSWORD RESET TOKEN
  passwordResetTokenHash: {
    type: String,
    default: undefined,
    select: false
  },

  passwordResetTokenExpires: {
    type: Date,
    default: undefined,
    select: false
  }

});


// HASH PASSWORD BEFORE SAVING
userSchema.pre('save', async function () {

  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );

});


// COMPARE PASSWORD
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};


module.exports = mongoose.model('User', userSchema);
