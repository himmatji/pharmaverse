const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  enrolledCourses: [{
    type: String,
    enum: ['B.Pharm', 'D.Pharm', 'M.Pharm', 'PharmaD', 'PhD']
  }],
  
  // 🔥🔥🔥 MOST IMPORTANT: PREMIUM FIELD 🔥🔥🔥
  isPremium: {
    type: Boolean,
    default: false
  },
  
  // 🔥 PURCHASED ITEMS (PAYMENT KE BAAD)
  purchasedItems: [{
    productType: {
      type: String,
      enum: ['paid-pdf', 'practical-video', 'predictive-paper', 'premium_course', 'paper', 'video']
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId
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

  // DOWNLOAD HISTORY (JAB BHI USER DOWNLOAD KARE)
  downloadHistory: [{
    productType: {
      type: String,
      enum: ['paid-pdf', 'practical-video', 'predictive-paper', 'note', 'free-material', 'paper', 'video']
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId
    },
    productTitle: {
      type: String
    },
    downloadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);