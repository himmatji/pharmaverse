const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const User = require('../models/User');
const Admin = require('../models/Admin');
const { authMiddleware, isSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// ================= USER SIGNUP =================
router.post('/signup', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!email && !mobile) {
      return res.status(400).json({
        message: "Email or Mobile is required"
      });
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          message: "Email already exists"
        });
      }
    }

    if (mobile) {
      const existingMobile = await User.findOne({ mobile });
      if (existingMobile) {
        return res.status(400).json({
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
      sessionToken
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
        enrolledCourses: user.enrolledCourses,
        purchasedItems: user.purchasedItems,
        downloadHistory: user.downloadHistory,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Server Error'
    });
  }
});

// ================= USER SIGNIN =================
router.post('/signin', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [
        { email: identifier },
        { mobile: identifier }
      ]
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
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
        role: 'user',
        isPremium: user.isPremium || false,
        enrolledCourses: user.enrolledCourses,
        purchasedItems: user.purchasedItems,
        downloadHistory: user.downloadHistory,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Server Error'
    });
  }
});

// ================= USER PROFILE (FIXED - WITH isPremium) =================
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
          role: 'user',
          isPremium: user.isPremium || false,
          enrolledCourses: user.enrolledCourses,
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

// ================= UPDATE USER PROFILE =================
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    if (req.user.type === 'user') {
      const { name, email, mobile } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
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
          enrolledCourses: user.enrolledCourses,
          purchasedItems: user.purchasedItems,
          downloadHistory: user.downloadHistory
        }
      });
    }

    if (req.user.type === 'admin') {
      const { name, email, currentPassword, newPassword } = req.body;
      const admin = await Admin.findById(req.user.id);

      if (!admin) {
        return res.status(404).json({
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
            message: 'Current password is incorrect'
          });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({
            message: 'Password must be at least 6 characters'
          });
        }

        admin.password = newPassword;
      }

      await admin.save();

      return res.json({
        success: true,
        message: 'Admin profile updated successfully',
        admin
      });
    }

    return res.status(403).json({
      message: 'Access denied'
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: 'Server Error'
    });
  }
});

// ================= CHANGE PASSWORD =================
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters'
      });
    }

    if (req.user.type === 'user') {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      const isMatch = await user.comparePassword(currentPassword);

      if (!isMatch) {
        return res.status(401).json({
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
          message: 'Admin not found'
        });
      }

      const isMatch = await admin.comparePassword(currentPassword);

      if (!isMatch) {
        return res.status(401).json({
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
      message: 'Access denied'
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      message: 'Server Error'
    });
  }
});

// ================= VERIFY TOKEN =================
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error'
    });
  }
});

// ================= DELETE DOWNLOAD HISTORY =================
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

    console.log(`✅ Deleted download: ${itemToDelete.productTitle} (${downloadId})`);

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

// ================= DELETE USER ACCOUNT =================
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

module.exports = router;