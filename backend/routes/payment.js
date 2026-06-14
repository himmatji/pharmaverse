const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');

const router = express.Router();

// ================= RAZORPAY INSTANCE =================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ================= AUTH MIDDLEWARE =================
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const jwt = require('jsonwebtoken');

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.id ||
      decoded.userId ||
      decoded._id
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// ================= CREATE ORDER =================
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const {
      amount,
      productType,
      productId,
      productTitle
    } = req.body;

    if (!amount || !productId || !productType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
      notes: {
        productType: productType,
        productId: productId,
        userId: req.user._id.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    // Save payment
    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      amount: amount,
      productType,
      productId,
      productTitle,
      status: 'created'
    });

    await payment.save();

    console.log('✅ ORDER CREATED:', order.id);

    res.json({
      success: true,
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order: ' + error.message
    });
  }
});

// ================= VERIFY PAYMENT =================
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const {
      orderId,
      paymentId,
      signature,
      productType,
      productId
    } = req.body;

    // Verify signature
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Update payment
    const paymentData = await Payment.findOneAndUpdate(
      { orderId: orderId },
      {
        paymentId: paymentId,
        signature: signature,
        status: 'success'
      },
      { new: true }
    );

    // ========== 🔥 PREMIUM COURSE LOGIC 🔥 ==========
    if (productType === 'premium_course') {
      // Set user as premium member
      req.user.isPremium = true;
      await req.user.save();
      
      console.log('✅ USER UPGRADED TO PREMIUM:', req.user.email);
      
      // Also add to purchased items for tracking
      if (!req.user.purchasedItems) {
        req.user.purchasedItems = [];
      }
      
      const alreadyPurchased = req.user.purchasedItems.find(
        (item) => item.productType === 'premium_course'
      );
      
      if (!alreadyPurchased) {
        req.user.purchasedItems.push({
          productType: 'premium_course',
          productId: productId,
          productTitle: 'B.Pharm Premium Course - Complete Access',
          amount: paymentData?.amount || 999,
          purchasedAt: new Date()
        });
        await req.user.save();
      }
      
      return res.json({
        success: true,
        message: 'Premium course activated successfully! All content unlocked.'
      });
    }
    
    // ========== REGULAR ITEM PURCHASE LOGIC ==========
    if (!req.user.purchasedItems) {
      req.user.purchasedItems = [];
    }

    // Avoid duplicate
    const alreadyPurchased = req.user.purchasedItems.find(
      (item) =>
        item.productId?.toString() === productId &&
        item.productType === productType
    );

    if (!alreadyPurchased) {
      req.user.purchasedItems.unshift({
        productType: productType,
        productId: productId,
        productTitle: paymentData?.productTitle || 'Premium Content',
        amount: paymentData?.amount || 0,
        purchasedAt: new Date()
      });

      await req.user.save();
      console.log('✅ PURCHASE SAVED:', productType);
    }

    res.json({
      success: true,
      message: 'Payment verified successfully'
    });

  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification failed: ' + error.message
    });
  }
});

// ================= CHECK ACCESS (UPDATED FOR PREMIUM) =================
router.get('/check-access/:type/:id', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    
    // 🔥 PREMIUM USERS HAVE ACCESS TO EVERYTHING 🔥
    if (req.user.isPremium === true) {
      return res.json({
        success: true,
        hasAccess: true,
        isPremium: true
      });
    }
    
    // Check individual purchase for non-premium users
    const hasAccess = req.user.purchasedItems?.some(
      (item) =>
        item.productType === type &&
        item.productId?.toString() === id
    );

    res.json({
      success: true,
      hasAccess: hasAccess || false,
      isPremium: false
    });

  } catch (error) {
    console.error('Check Access Error:', error);
    res.json({
      success: false,
      hasAccess: false,
      isPremium: false
    });
  }
});

// ================= GET USER STATUS (UPDATED) =================
router.get('/user-status', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      isPremium: req.user.isPremium || false,
      purchasedItems: req.user.purchasedItems || [],
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isPremium: req.user.isPremium || false
      }
    });
  } catch (error) {
    console.error ('User status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user status'
    });
  }
});

module.exports = router;