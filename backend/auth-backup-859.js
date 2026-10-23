const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const User = require('../models/User');
const Admin = require('../models/Admin');
const { authMiddleware, isSuperAdmin } = require('../middleware/auth');

const router = express.Router();

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