const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  paymentId: {
    type: String,
    default: undefined
  },

  signature: {
    type: String,
    default: undefined
  },

  amount: {
    type: Number,
    required: true,
    min: 0
  },

  currency: {
    type: String,
    default: 'INR',
    trim: true,
    uppercase: true
  },

  status: {
    type: String,
    enum: ['created', 'pending', 'success', 'failed'],
    default: 'created',
    index: true
  },

  productType: {
    type: String,
    enum: [
      'paid-pdf',
      'practical-video',
      'predictive-paper',
      'premium_course',
      'note',
      'paper',
      'video',
      'course-content'
    ],
    required: true,
    trim: true
  },

  productId: {
    type: String,
    required: true,
    trim: true
  },

  productTitle: {
    type: String,
    default: 'Premium Content',
    trim: true
  },

  // Scoped course-content purchase details.
  // Leave these fields empty for legacy products that do not use them.
  course: {
    type: String,
    enum: ['B.Pharm', 'D.Pharm', 'M.Pharm', 'Pharm.D', 'PharmaD', 'PhD', ''],
    default: ''
  },

  category: {
    type: String,
    default: '',
    trim: true
  },

  semester: {
    type: String,
    default: '',
    trim: true
  },

  year: {
    type: String,
    default: '',
    trim: true
  },

  language: {
    type: String,
    enum: ['Hindi', 'English', 'Both', 'Other', 'hindi', 'english', 'both', 'other', ''],
    default: ''
  },

  specialization: {
    type: String,
    default: '',
    trim: true
  },

  contentKey: {
    type: String,
    default: '',
    trim: true
  },

  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  minimize: false
});

paymentSchema.pre('save', function () {
  this.updatedAt = new Date();
});

paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ userId: 1, contentKey: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);