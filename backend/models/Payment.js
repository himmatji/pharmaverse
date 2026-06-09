const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  orderId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  paymentId: { 
    type: String 
  },
  signature: { 
    type: String 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'INR' 
  },
  status: { 
    type: String, 
    enum: ['created', 'pending', 'success', 'failed'], 
    default: 'created' 
  },
  productType: { 
    type: String, 
    enum: ['paid-pdf', 'practical-video', 'predictive-paper', 'premium_course', 'note', 'paper', 'video'],  // 🔥 ADD premium_course
    required: true 
  },
  productId: { 
    type: String,  
    required: true 
  },
  productTitle: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Payment', paymentSchema);