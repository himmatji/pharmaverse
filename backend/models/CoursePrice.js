const mongoose = require('mongoose');

const CoursePriceSchema = new mongoose.Schema({
  prices: {
    type: Map,
    of: new mongoose.Schema({
      price: { 
        type: Number, 
        default: 99,
        min: 0
      },
      discount: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 100
      }
    }),
    default: {
      "BPharm": { price: 99, discount: 0 },
      "DPharm": { price: 79, discount: 0 },
      "MPharm": { price: 149, discount: 0 },
      "PharmD": { price: 129, discount: 0 },
      "PhD": { price: 199, discount: 0 }
    }
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

// Update timestamp on save
CoursePriceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('CoursePrice', CoursePriceSchema);