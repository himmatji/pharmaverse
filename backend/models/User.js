
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    enum: ['B.Pharm', 'D.Pharm', 'M.Pharm', 'PharmaD', 'PhD']
  }],

  // PREMIUM USER
  isPremium: {
    type: Boolean,
    default: false
  },

  // PURCHASED ITEMS
  purchasedItems: [{
    productType: {
      type: String,
      enum: [
        'paid-pdf',
        'practical-video',
        'predictive-paper',
        'premium_course',
        'paper',
        'video'
      ]
    },

    // Supports ObjectId and String identifiers
    productId: {
      type: mongoose.Schema.Types.Mixed
    },

    productTitle: {
      type: String
    },

    amount: {
      type: Number
    },

    purchasedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // DOWNLOAD HISTORY
  downloadHistory: [{
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

    // Supports ObjectId and String identifiers
    productId: {
      type: mongoose.Schema.Types.Mixed
    },

    productTitle: {
      type: String
    },

    downloadedAt: {
      type: Date,
      default: Date.now
    }
  }],

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
  this.password = await bcrypt.hash(this.password, salt);
});

// COMPARE PASSWORD
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
