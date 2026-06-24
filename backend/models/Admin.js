const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
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

  role: {
    type: String,
    enum: ['super_admin', 'sub_admin'],
    default: 'super_admin'
  },

  permissions: {
    courses: {
      type: [String],
      default: []
    }
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },

  lastLogin: {
    type: Date,
    default: Date.now
  },

  isActive: {
    type: Boolean,
    default: true
  },

  // 🔥 PREMIUM COURSE PRICE
  premiumPrice: {
    type: Number,
    default: 999
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

adminSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);