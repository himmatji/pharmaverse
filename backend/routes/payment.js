
Loading older messages…
























































const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Payment = require('../models/Payment');
const User = require('../models/User');

const router = express.Router();

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret
});

// Fields used to identify a specific course-content purchase.
// These fields are intentionally stored with the purchase so that access to
// one semester/year/language/category does not unlock unrelated content.
const COURSE_CONTENT_TYPE = 'course-content';

const COURSE_VALUES = new Set([
  'B.Pharm',
  'D.Pharm',
  'M.Pharm',
  'Pharm.D',
  'PharmaD',
  'PhD'
]);

const CATEGORY_VALUES = new Set([
  'notes',
  'exam-crash-course',
  'exam crash course',
  'pyqs',
  'practical',
  'other'
]);

const LANGUAGE_VALUES = new Set([
  'hindi',
  'english',
  'both',
  'other'
]);

const normalizeText = (value) =>
  typeof value === 'string' ? value.trim() : '';

const normalizeComparable = (value) =>
  normalizeText(String(value ?? '')).toLowerCase();

const getCourseContentDetails = (body = {}) => {
  const course = normalizeText(body.course);
  const category = normalizeComparable(body.category);
  const semester = normalizeText(body.semester);
  const year = normalizeText(body.year);
  const language = normalizeComparable(body.language);
  const specialization = normalizeText(body.specialization);

  return {
    course,
    category,
    semester,
    year,
    language,
    specialization,
    contentKey: normalizeText(body.contentKey)
  };
};

const isCourseContentRequest = (body = {}) =>
  body.productType === COURSE_CONTENT_TYPE ||
  Boolean(body.contentKey) ||
  Boolean(body.course && body.category);

const validateCourseContentDetails = (details) => {
  if (!details.course || !COURSE_VALUES.has(details.course)) {
    return 'A valid course is required for course-content purchases';
  }

  if (!details.category || !CATEGORY_VALUES.has(details.category)) {
    return 'A valid category is required (notes, exam-crash-course, pyqs, practical, or other)';
  }

  if (!details.contentKey) {
    return 'contentKey is required for course-content purchases';
  }

  // Semester/year/language/specialization are allowed to be blank when not
  // applicable to a particular course. The client should send the exact
  // values that identify the selected content.
  return null;
};

const makePurchaseMatchKey = (item) => ({
  productType: normalizeComparable(item.productType),
  productId: normalizeComparable(item.productId),
  contentKey: normalizeComparable(item.contentKey),
  course: normalizeComparable(item.course),
  category: normalizeComparable(item.category),
  semester: normalizeComparable(item.semester),
  year: normalizeComparable(item.year),
  language: normalizeComparable(item.language),
  specialization: normalizeComparable(item.specialization)
});

const isSamePurchase = (left, right) => {
  const a = makePurchaseMatchKey(left);
  const b = makePurchaseMatchKey(right);

  return Object.keys(a).every((key) => a[key] === b[key]);
};

const getOrderAmountInPaise = (amount) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return null;
  }

  return Math.round(numericAmount * 100);
};

// ================= AUTH MIDDLEWARE =================
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }

    const user = await User.findById(userId);

    if (!user || user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // If the JWT contains a sessionToken, enforce the latest-login session.
    // Legacy tokens without this claim continue to work.
    if (
      decoded.sessionToken &&
      user.sessionToken &&
      decoded.sessionToken !== user.sessionToken
    ) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Payment Auth Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// ================= CREATE ORDER =================
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway is not configured'
      });
    }

    const {
      productType,
      productId,
      productTitle
    } = req.body;

    if (
      typeof productType !== 'string' ||
      !productType.trim() ||
      productId === undefined ||
      productId === null ||
      String(productId).trim() === ''
    ) {
      return res.status(400).json({
        success: false,
        message: 'productType and productId are required'
      });
    }

    const courseContent = isCourseContentRequest(req.body);
    const courseDetails = getCourseContentDetails(req.body);

    if (courseContent) {
      const validationError = validateCourseContentDetails(courseDetails);
      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError
        });
      }
    }

    // Never trust the browser's amount for course-content purchases.
    // The admin-managed CoursePrice.contentPrices entry is the price source.
    // Legacy product types retain the previous amount-based contract.
    let amount;

    if (courseContent) {
      const CoursePrice = require('../models/CoursePrice');
      const pricingDoc = await CoursePrice.findOne({});

      const matchingPrice = pricingDoc?.contentPrices?.find((entry) => {
        return (
          entry.isActive !== false &&
          normalizeComparable(entry.course) === normalizeComparable(courseDetails.course) &&
          normalizeComparable(entry.category) === normalizeComparable(courseDetails.category) &&
          normalizeComparable(entry.semester) === normalizeComparable(courseDetails.semester) &&
          normalizeComparable(entry.year) === normalizeComparable(courseDetails.year) &&
          normalizeComparable(entry.language) === normalizeComparable(courseDetails.language) &&
          normalizeComparable(entry.specialization) === normalizeComparable(courseDetails.specialization) &&
          normalizeComparable(entry.contentKey) === normalizeComparable(courseDetails.contentKey)
        );
      });

      if (!matchingPrice) {
        return res.status(404).json({
          success: false,
          message: 'Pricing was not found for this exact content'
        });
      }

      if (matchingPrice.accessType === 'free' || Number(matchingPrice.price) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'This content is free; no payment order is required'
        });
      }

      const basePrice = Number(matchingPrice.price);
      const discount = Number(matchingPrice.discount || 0);

      if (
        !Number.isFinite(basePrice) ||
        basePrice <= 0 ||
        !Number.isFinite(discount) ||
        discount < 0 ||
        discount > 100
      ) {
        return res.status(400).json({
          success: false,
          message: 'Configured content price is invalid'
        });
      }

      amount = Math.round(basePrice * (1 - discount / 100) * 100) / 100;

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Final content price must be greater than zero'
        });
      }
    } else {
      const numericAmount = Number(req.body.amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'A valid positive amount is required'
        });
      }
      amount = Math.round(numericAmount * 100) / 100;
    }

    const options = {
      amount: getOrderAmountInPaise(amount),
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      notes: {
        productType: productType.trim(),
        productId: String(productId),
        userId: req.user._id.toString(),
        ...(courseContent ? {
          contentKey: courseDetails.contentKey,
          course: courseDetails.course,
          category: courseDetails.category,
          semester: courseDetails.semester,
          year: courseDetails.year,
          language: courseDetails.language,
          specialization: courseDetails.specialization
        } : {})
      }
    };

    const order = await razorpay.orders.create(options);

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      amount,
      productType: productType.trim(),
      productId,
      productTitle: normalizeText(productTitle) || 'Premium Content',
      status: 'created'
    });

    // Extra details are added only when the existing Payment schema supports
    // them; strict:false schemas can persist them automatically. For strict
    // schemas, extend Payment schema separately before relying on these fields.
    if (courseContent) {
      payment.set('course', courseDetails.course);
      payment.set('category', courseDetails.category);
      payment.set('semester', courseDetails.semester);
      payment.set('year', courseDetails.year);
      payment.set('language', courseDetails.language);
      payment.set('specialization', courseDetails.specialization);
      payment.set('contentKey', courseDetails.contentKey);
    }

    await payment.save();

    return res.json({
      success: true,
      orderId: order.id,
      amount,
      currency: 'INR',
      key: razorpayKeyId,
      productType: productType.trim(),
      productId: String(productId),
      ...(courseContent ? courseDetails : {})
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
});

// ================= VERIFY PAYMENT =================
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    if (!razorpayKeySecret) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway is not configured'
      });
    }

    const {
      orderId,
      paymentId,
      signature,
      productType,
      productId
    } = req.body;

    if (
      typeof orderId !== 'string' ||
      typeof paymentId !== 'string' ||
      typeof signature !== 'string' ||
      !orderId ||
      !paymentId ||
      !signature
    ) {
      return res.status(400).json({
        success: false,
        message: 'orderId, paymentId and signature are required'
      });
    }

    const paymentRecord = await Payment.findOne({
      orderId,
      userId: req.user._id
    });

    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        message: 'Payment order was not found for this user'
      });
    }

    // A retry for the same verified payment is allowed so a previously failed
    // user-purchase save can be repaired. A different payment ID cannot replace
    // the payment already recorded for this order.
    if (
      paymentRecord.status === 'success' &&
      paymentRecord.paymentId &&
      paymentRecord.paymentId !== paymentId
    ) {
      return res.status(409).json({
        success: false,
        message: 'This order has already been verified with another payment'
      });
    }

    // Verify Razorpay signature using the order stored for this user.
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${paymentRecord.orderId}|${paymentId}`)
      .digest('hex');

    const supplied = Buffer.from(signature, 'utf8');
    const expected = Buffer.from(expectedSignature, 'utf8');

    if (
      supplied.length !== expected.length ||
      !crypto.timingSafeEqual(supplied, expected)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Ensure the submitted product identity agrees with the saved order.
    if (
      productType &&
      String(productType) !== String(paymentRecord.productType)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Product type does not match the payment order'
      });
    }

    if (
      productId !== undefined &&
      String(productId) !== String(paymentRecord.productId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Product ID does not match the payment order'
      });
    }

    const courseContent = paymentRecord.productType === COURSE_CONTENT_TYPE ||
      Boolean(paymentRecord.get('contentKey'));

    if (paymentRecord.productType === 'premium_course') {
      req.user.isPremium = true;

      if (!Array.isArray(req.user.purchasedItems)) {
        req.user.purchasedItems = [];
      }

      const alreadyPremiumPurchase = req.user.purchasedItems.some(
        (item) => item.productType === 'premium_course' &&
          String(item.productId) === String(paymentRecord.productId)
      );

      if (!alreadyPremiumPurchase) {
        req.user.purchasedItems.push({
          productType: 'premium_course',
          productId: String(paymentRecord.productId),
          productTitle: paymentRecord.productTitle || 'B.Pharm Premium Course - Complete Access',
          amount: paymentRecord.amount,
          purchasedAt: new Date(),
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId
        });
      }

      // Save access first. If this fails, the order remains retryable.
      await req.user.save();

      paymentRecord.paymentId = paymentId;
      paymentRecord.signature = signature;
      paymentRecord.status = 'success';
      await paymentRecord.save();

      return res.json({
        success: true,
        message: 'Premium course activated successfully',
        hasAccess: true,
        alreadyVerified: false
      });
    }

    const purchase = {
      productType: courseContent ? COURSE_CONTENT_TYPE : paymentRecord.productType,
      productId: paymentRecord.productId,
      productTitle: paymentRecord.productTitle || 'Premium Content',
      amount: paymentRecord.amount,
      purchasedAt: new Date(),
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId
    };

    if (courseContent) {
      purchase.course = paymentRecord.get('course') || '';
      purchase.category = paymentRecord.get('category') || '';
      purchase.semester = paymentRecord.get('semester') || '';
      purchase.year = paymentRecord.get('year') || '';
      purchase.language = paymentRecord.get('language') || '';
      purchase.specialization = paymentRecord.get('specialization') || '';
      purchase.contentKey = paymentRecord.get('contentKey') || '';
    }

    const alreadyPurchased = req.user.purchasedItems?.some((item) => {
      if (courseContent) {
        return isSamePurchase(item, purchase);
      }

      return (
        item.productType === purchase.productType &&
        String(item.productId) === String(purchase.productId)
      );
    });

    if (!Array.isArray(req.user.purchasedItems)) {
      req.user.purchasedItems = [];
    }

    if (!alreadyPurchased) {
      req.user.purchasedItems.unshift(purchase);
      // Save the access record before marking the payment order successful.
      // A retry is safe because purchases are checked for duplicates above.
      await req.user.save();
    }

    paymentRecord.paymentId = paymentId;
    paymentRecord.signature = signature;
    paymentRecord.status = 'success';
    await paymentRecord.save();

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      hasAccess: true,
      productType: purchase.productType,
      productId: String(purchase.productId),
      ...(courseContent ? {
        contentKey: purchase.contentKey,
        course: purchase.course,
        category: purchase.category,
        semester: purchase.semester,
        year: purchase.year,
        language: purchase.language,
        specialization: purchase.specialization
      } : {})
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Verification failed'
    });
  }
});

// ================= CHECK ACCESS =================
// Legacy item checks remain compatible. Scoped course-content purchases do NOT
// grant access through the global isPremium flag; they require an exact match.
router.get('/check-access/:type/:id', authenticateToken, async (req, res) => {
  try {
    const { type, id } = req.params;
    const contentKey = normalizeText(req.query.contentKey);
    const course = normalizeText(req.query.course);
    const category = normalizeComparable(req.query.category);
    const semester = normalizeText(req.query.semester);
    const year = normalizeText(req.query.year);
    const language = normalizeComparable(req.query.language);
    const specialization = normalizeText(req.query.specialization);

    const isScopedCourseContent =
      type === COURSE_CONTENT_TYPE ||
      Boolean(contentKey) ||
      Boolean(course && category);

    // Keep the old premium shortcut for non-scoped legacy items only.
    if (!isScopedCourseContent && req.user.isPremium === true) {
      return res.json({
        success: true,
        hasAccess: true,
        isPremium: true
      });
    }

    // Check if exact content is configured as free in admin pricing.
    if (isScopedCourseContent) {
      const CoursePrice = require('../models/CoursePrice');
      const pricingDoc = await CoursePrice.findOne({});

      const freeEntry = pricingDoc?.contentPrices?.find((entry) => (
        entry.isActive !== false &&
        entry.accessType === 'free' &&
        normalizeComparable(entry.course) === normalizeComparable(course) &&
        normalizeComparable(entry.category) === category &&
        normalizeComparable(entry.semester) === normalizeComparable(semester) &&
        normalizeComparable(entry.year) === normalizeComparable(year) &&
        normalizeComparable(entry.language) === normalizeComparable(language) &&
        normalizeComparable(entry.specialization) === normalizeComparable(specialization) &&
        normalizeComparable(entry.contentKey) === normalizeComparable(contentKey)
      ));

      if (freeEntry) {
        return res.json({
          success: true,
          hasAccess: true,
          isPremium: false,
          accessType: 'free'
        });
      }
    }

    const hasAccess = req.user.purchasedItems?.some((item) => {
      if (isScopedCourseContent) {
        return (
          item.productType === COURSE_CONTENT_TYPE &&
          normalizeComparable(item.productId) === normalizeComparable(id) &&
          normalizeComparable(item.contentKey) === normalizeComparable(contentKey) &&
          normalizeComparable(item.course) === normalizeComparable(course) &&
          normalizeComparable(item.category) === category &&
          normalizeComparable(item.semester) === normalizeComparable(semester) &&
          normalizeComparable(item.year) === normalizeComparable(year) &&
          normalizeComparable(item.language) === normalizeComparable(language) &&
          normalizeComparable(item.specialization) === normalizeComparable(specialization)
        );
      }

      return (
        item.productType === type &&
        String(item.productId) === String(id)
      );
    });

    return res.json({
      success: true,
      hasAccess: Boolean(hasAccess),
      isPremium: !isScopedCourseContent && Boolean(req.user.isPremium),
      accessType: hasAccess ? 'purchased' : 'locked'
    });
  } catch (error) {
    console.error('Check Access Error:', error);
    return res.status(500).json({
      success: false,
      hasAccess: false,
      isPremium: false,
      message: 'Failed to check content access'
    });
  }
});

// ================= GET USER STATUS =================
router.get('/user-status', authenticateToken, async (req, res) => {
  try {
    return res.json({
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
    console.error('User status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user status'
    });
  }
});

module.exports = router;


