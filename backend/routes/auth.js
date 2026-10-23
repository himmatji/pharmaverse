const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const User = require('../models/User');
const Admin = require('../models/Admin');
const nodemailer = require("nodemailer");
const { authMiddleware, isSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// =========================================================
// EMAIL TRANSPORTER
// =========================================================
const SMTP_EMAIL = process.env.SMTP_EMAIL || process.env.SMTP_USER;
const SMTP_APP_PASSWORD = process.env.SMTP_APP_PASSWORD || process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_APP_PASSWORD
  }
});

const PASSWORD_RESET_OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const PASSWORD_RESET_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const PASSWORD_RESET_MAX_ATTEMPTS = 5;
const PASSWORD_RESET_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

function hashResetValue(value) {
  return crypto
    .createHash('sha256')
    .update(`${value}:${process.env.JWT_SECRET || ''}`)
    .digest('hex');
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

// =========================================================
// USER SIGNUP
// =========================================================
router.post('/signup', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({
        success: false,
        message: "Email or Mobile is required"
      });
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already exists"
        });
      }
    }

    if (mobile) {
      const existingMobile = await User.findOne({ mobile });
      if (existingMobile) {
        return res.status(400).json({
          success: false,
          message: "Mobile already exists"
        });
      }
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const user = new User({
      name,
      email,
      mobile,
      password,
      sessionToken,
      isPremium: false,
      enrolledCourses: [],
      purchasedItems: [],
      downloadHistory: []
    });

    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        mobile: user.mobile,
        role: 'user',
        type: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: 'user',
        isPremium: user.isPremium || false,
        enrolledCourses: user.enrolledCourses || [],
        purchasedItems: user.purchasedItems || [],
        downloadHistory: user.downloadHistory || [],
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// =========================================================
// USER SIGNIN
// =========================================================
router.post('/signin', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and password are required'
      });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { mobile: identifier }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    user.lastLogin = new Date();
    user.sessionToken = sessionToken;
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        mobile: user.mobile,
        role: 'user',
        type: 'user',
        sessionToken
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: 'user',
        isPremium: user.isPremium || false,
        enrolledCourses: user.enrolledCourses || [],
        purchasedItems: user.purchasedItems || [],
        downloadHistory: user.downloadHistory || [],
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// =========================================================
// FORGOT PASSWORD - SEND 6-DIGIT OTP TO REGISTERED EMAIL
// POST /forgot-password  { email }
// =========================================================
router.post('/forgot-password', async (req, res) => {
  try {
    const email = String(req.body.email || req.body.identifier || '')
      .trim()
      .toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid registered Gmail address.'
      });
    }

    // Do not reveal whether an account exists.
    const genericResponse = {
      success: true,
      message: 'If an account exists for this email, an OTP will be sent shortly.'
    };

    const user = await User.findOne({ email }).select(
      '+passwordResetOtpHash +passwordResetOtpExpires +passwordResetAttempts +passwordResetLastSent +passwordResetTokenHash +passwordResetTokenExpires'
    );

    if (!user) {
      return res.json(genericResponse);
    }

    const now = Date.now();
    if (
      user.passwordResetLastSent &&
      now - new Date(user.passwordResetLastSent).getTime() < PASSWORD_RESET_RESEND_COOLDOWN_MS
    ) {
      return res.json(genericResponse);
    }

    if (!SMTP_EMAIL || !SMTP_APP_PASSWORD) {
      console.error('Password reset email is not configured. Set SMTP_EMAIL and SMTP_APP_PASSWORD.');
      return res.status(503).json({
        success: false,
        message: 'Password reset email service is temporarily unavailable. Please try again later.'
      });
    }

    const otp = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const otpHash = hashResetValue(`${email}:${otp}`);
    const safeName = escapeHtml(user.name || 'User');

    // Save the OTP hash only; never store the plain OTP.
    user.passwordResetOtpHash = otpHash;
    user.passwordResetOtpExpires = new Date(now + PASSWORD_RESET_OTP_TTL_MS);
    user.passwordResetAttempts = 0;
    user.passwordResetLastSent = new Date(now);
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpires = undefined;

    try {
      await transporter.sendMail({
        from: `"PharmaVerse" <${SMTP_EMAIL}>`,
        to: user.email,
        subject: 'Your PharmaVerse password reset OTP',
        text: `Hello ${user.name || 'User'}, your PharmaVerse password reset OTP is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#1f2937">
            <h2 style="color:#2563eb">PharmaVerse Password Reset</h2>
            <p>Hello ${safeName},</p>
            <p>Use this one-time password to reset your PharmaVerse account password:</p>
            <div style="font-size:32px;font-weight:700;letter-spacing:8px;background:#eff6ff;padding:18px;text-align:center;border-radius:10px">${otp}</div>
            <p><strong>This OTP expires in 10 minutes</strong> and can only be used once.</p>
            <p>If you did not request a password reset, you can safely ignore this email.</p>
            <p style="color:#6b7280;font-size:12px">PharmaVerse Team</p>
          </div>
        `
      });
      await user.save();
    } catch (emailError) {
      console.error('Password reset email error:', emailError.message);
      user.passwordResetOtpHash = undefined;
      user.passwordResetOtpExpires = undefined;
      user.passwordResetAttempts = 0;
      user.passwordResetLastSent = undefined;
      user.passwordResetTokenHash = undefined;
      user.passwordResetTokenExpires = undefined;
      try {
        await user.save();
      } catch (cleanupError) {
        console.error('Could not clear failed password reset state:', cleanupError.message);
      }
      return res.status(503).json({
        success: false,
        message: 'Could not send the OTP email. Please check email configuration and try again later.'
      });
    }

    return res.json(genericResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// =========================================================
// VERIFY FORGOT-PASSWORD OTP
// POST /verify-reset-otp { email, otp }
// Returns a short-lived resetToken only after successful OTP verification.
// =========================================================
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address and 6-digit OTP.'
      });
    }

    const user = await User.findOne({ email }).select(
      '+passwordResetOtpHash +passwordResetOtpExpires +passwordResetAttempts +passwordResetTokenHash +passwordResetTokenExpires'
    );

    if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpires) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    if (new Date(user.passwordResetOtpExpires).getTime() <= Date.now()) {
      user.passwordResetOtpHash = undefined;
      user.passwordResetOtpExpires = undefined;
      user.passwordResetAttempts = 0;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    if ((user.passwordResetAttempts || 0) >= PASSWORD_RESET_MAX_ATTEMPTS) {
      user.passwordResetOtpHash = undefined;
      user.passwordResetOtpExpires = undefined;
      user.passwordResetAttempts = 0;
      await user.save();
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      });
    }

    const submittedHash = hashResetValue(`${email}:${otp}`);
    if (submittedHash !== user.passwordResetOtpHash) {
      user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
      if (user.passwordResetAttempts >= PASSWORD_RESET_MAX_ATTEMPTS) {
        user.passwordResetOtpHash = undefined;
        user.passwordResetOtpExpires = undefined;
        user.passwordResetAttempts = 0;
      }
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check it and try again.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpires = undefined;
    user.passwordResetAttempts = 0;
    user.passwordResetTokenHash = hashResetValue(resetToken);
    user.passwordResetTokenExpires = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);
    await user.save();

    return res.json({
      success: true,
      message: 'OTP verified. You can now create a new password.',
      resetToken
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// =========================================================
// RESET PASSWORD AFTER OTP VERIFICATION
// POST /reset-password { email, resetToken, newPassword }
// =========================================================
router.post('/reset-password', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const resetToken = String(req.body.resetToken || '').trim();
    const newPassword = String(req.body.newPassword || '');

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, verified reset token, and new password are required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const user = await User.findOne({ email }).select(
      '+passwordResetTokenHash +passwordResetTokenExpires'
    );

    if (
      !user ||
      !user.passwordResetTokenHash ||
      !user.passwordResetTokenExpires ||
      new Date(user.passwordResetTokenExpires).getTime() <= Date.now() ||
      hashResetValue(resetToken) !== user.passwordResetTokenHash
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset session. Please verify a new OTP.'
      });
    }

    user.password = newPassword;
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpires = undefined;
    user.passwordResetAttempts = 0;
    user.passwordResetLastSent = undefined;
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpires = undefined;
    user.sessionToken = null; // invalidate existing user sessions
    await user.save(); // User.js pre-save hook hashes the password

    return res.json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// =========================================================
// USER PROFILE - FIXED with isPremium
// =========================================================
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    if (req.user.type === 'user') {
      const user = await User.findById(req.user.id).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: 'user',
          isPremium: user.isPremium || false,
          enrolledCourses: user.enrolledCourses || [],
          purchasedItems: user.purchasedItems || [],
          downloadHistory: user.downloadHistory || [],
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      });
    }

    if (req.user.type === 'admin') {
      const admin = await Admin.findById(req.user.id).select('-password');

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      return res.json({
        success: true,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          isActive: admin.isActive,
          createdAt: admin.createdAt,
          lastLogin: admin.lastLogin
        }
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });

  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// =========================================================
// UPDATE USER PROFILE
// =========================================================
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    if (req.user.type === 'user') {
      const { name, email, mobile } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({
          email,
          _id: { $ne: user._id }
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use'
          });
        }
      }

      if (mobile && mobile !== user.mobile) {
        const existingMobile = await User.findOne({
          mobile,
          _id: { $ne: user._id }
        });

        if (existingMobile) {
          return res.status(400).json({
            success: false,
            message: 'Mobile already in use'
          });
        }
      }

      if (name) user.name = name;
      if (email) user.email = email;
      if (mobile) user.mobile = mobile;

      await user.save();

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          isPremium: user.isPremium || false,
          enrolledCourses: user.enrolledCourses || [],
          purchasedItems: user.purchasedItems || [],
          downloadHistory: user.downloadHistory || []
        }
      });
    }

    if (req.user.type === 'admin') {
      const { name, email, currentPassword, newPassword } = req.body;
      const admin = await Admin.findById(req.user.id);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      if (email && email !== admin.email) {
        const existingAdmin = await Admin.findOne({
          email,
          _id: { $ne: admin._id }
        });

        if (existingAdmin) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use'
          });
        }
      }

      if (name) admin.name = name;
      if (email) admin.email = email;

      if (currentPassword && newPassword) {
        const isMatch = await admin.comparePassword(currentPassword);

        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: 'Current password is incorrect'
          });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters'
          });
        }

        admin.password = newPassword;
      }

      await admin.save();

      return res.json({
        success: true,
        message: 'Admin profile updated successfully',
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        }
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// =========================================================
// CHANGE PASSWORD
// =========================================================
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    if (req.user.type === 'user') {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const isMatch = await user.comparePassword(currentPassword);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      user.password = newPassword;
      await user.save();

      return res.json({
        success: true,
        message: 'Password changed successfully'
      });
    }

    if (req.user.type === 'admin') {
      const admin = await Admin.findById(req.user.id);

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      const isMatch = await admin.comparePassword(currentPassword);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      admin.password = newPassword;
      await admin.save();

      return res.json({
        success: true,
        message: 'Password changed successfully'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// =========================================================
// VERIFY TOKEN
// =========================================================
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    if (req.user.type === 'user') {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: 'user',
          isPremium: user.isPremium || false,
          enrolledCourses: user.enrolledCourses || [],
          purchasedItems: user.purchasedItems || [],
          downloadHistory: user.downloadHistory || []
        }
      });
    }

    if (req.user.type === 'admin') {
      const admin = await Admin.findById(req.user.id).select('-password');
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      return res.json({
        success: true,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid user type'
    });

  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// =========================================================
// DELETE DOWNLOAD HISTORY
// =========================================================
router.delete('/download-history/:downloadId', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Only users can delete download history'
      });
    }

    const { downloadId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const itemToDelete = user.downloadHistory.find(
      item => item._id && item._id.toString() === downloadId
    );

    if (!itemToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Download record not found'
      });
    }

    user.downloadHistory = user.downloadHistory.filter(
      item => !(item._id && item._id.toString() === downloadId)
    );

    await user.save();

    res.json({
      success: true,
      message: 'Download record deleted successfully',
      downloadHistory: user.downloadHistory
    });

  } catch (error) {
    console.error("Delete download error:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// =========================================================
// DELETE USER ACCOUNT
// =========================================================
router.delete("/delete-account", authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== "user") {
      return res.status(403).json({
        success: false,
        message: "Only users can delete their account"
      });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password"
      });
    }

    await User.findByIdAndDelete(user._id);

    return res.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("Delete account error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

// =========================================================
// GET ALL USERS (Admin Only)
// =========================================================
router.get('/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'admin' && req.user.type !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// =========================================================
// TOGGLE USER PREMIUM STATUS (Admin Only)
// =========================================================
router.put('/toggle-premium/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.user.type !== 'admin' && req.user.type !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { userId } = req.params;
    const { isPremium } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isPremium = isPremium;
    await user.save();

    res.json({
      success: true,
      message: `User premium status updated to ${isPremium}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium
      }
    });

  } catch (error) {
    console.error("Toggle premium error:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// =========================================================
// ADMIN SIGNIN (Separate from user signin)
// =========================================================
router.post('/admin/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const admin = await Admin.findOne({
      email,
      isActive: true
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
        role: admin.role,
        type: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });

  } catch (error) {
    console.error("Admin signin error:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// =========================================================
// LOGOUT
// =========================================================
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    if (req.user.type === 'user') {
      const user = await User.findById(req.user.id);
      if (user) {
        user.sessionToken = null;
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// =========================================================
// TEST ROUTE
// =========================================================
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth router is working',
    routes: [
      'POST /signup',
      'POST /signin',
      'POST /forgot-password',
      'POST /verify-reset-otp',
      'POST /reset-password',
      'GET /profile',
      'PUT /update-profile',
      'PUT /change-password',
      'GET /verify',
      'DELETE /download-history/:downloadId',
      'DELETE /delete-account',
      'GET /users',
      'PUT /toggle-premium/:userId',
      'POST /admin/signin',
      'POST /logout'
    ]
  });
});

module.exports = router;