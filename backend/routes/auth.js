const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { authMiddleware, isSuperAdmin, isAdmin } = require('../middleware/auth');

const router = express.Router();

// ================= USER SIGNUP =================
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: 'user',
        type: 'user'
      },
      process.env.JWT_SECRET || 'your_super_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
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
    console.log(error);
    res.status(500).json({
      message: 'Server Error'
    });
  }
});

// ================= USER SIGNIN =================
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

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

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: 'user',
        type: 'user'
      },
      process.env.JWT_SECRET || 'your_super_secret_key',
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
        enrolledCourses: user.enrolledCourses || [],
        purchasedItems: user.purchasedItems || [],
        downloadHistory: user.downloadHistory || [],
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

// ================= USER PROFILE =================
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

// ================= ADMIN LOGIN =================
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email, isActive: true });

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
      process.env.JWT_SECRET || 'your_super_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        type: 'admin'
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// ================= GET ALL USERS (ADMIN ONLY) =================
router.get('/users', authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'user',
        isPremium: user.isPremium || false,
        enrolledCourses: user.enrolledCourses || [],
        downloadHistory: user.downloadHistory || [],
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }))
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// ================= DELETE USER (ADMIN ONLY) =================
router.delete('/users/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await User.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// ================= GET ALL SUB-ADMINS (SUPER ADMIN ONLY) =================
router.get('/subadmins', authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const subadmins = await Admin.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      subAdmins: subadmins.map(admin => ({
        _id: admin._id,
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin
      }))
    });
  } catch (error) {
    console.error("Get subadmins error:", error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// ================= REGISTER SUB-ADMIN (SUPER ADMIN ONLY) =================
router.post('/register-subadmin', authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;

    console.log("📝 Registering sub-admin:", { name, email, permissions });

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Sub-admin already exists with this email'
      });
    }

    // Create sub-admin - role will be 'admin'
    const subadmin = new Admin({
      name,
      email,
      password,
      role: 'admin',
      permissions: { courses: permissions || [] },
      isActive: true,
    });

    await subadmin.save();
    console.log("✅ Sub-admin created successfully:", subadmin.email);

    res.status(201).json({
      success: true,
      message: 'Sub-admin created successfully',
      subadmin: {
        _id: subadmin._id,
        id: subadmin._id,
        name: subadmin.name,
        email: subadmin.email,
        role: subadmin.role,
        permissions: subadmin.permissions,
        isActive: subadmin.isActive,
        createdAt: subadmin.createdAt
      }
    });

  } catch (error) {
    console.error("Register subadmin error:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
});

// ================= UPDATE SUB-ADMIN (SUPER ADMIN ONLY) =================
router.put('/subadmin/:id', authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions, isActive, password } = req.body;

    const subadmin = await Admin.findById(id);

    if (!subadmin) {
      return res.status(404).json({
        success: false,
        message: 'Sub-admin not found'
      });
    }

    if (subadmin.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify super admin'
      });
    }

    if (name) subadmin.name = name;
    if (permissions) subadmin.permissions = { courses: permissions };
    if (isActive !== undefined) subadmin.isActive = isActive;
    
    if (password && password.length > 0) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters'
        });
      }
      subadmin.password = password;  // Let pre-save hook handle hashing
    }

    await subadmin.save();

    res.json({
      success: true,
      message: 'Sub-admin updated successfully',
      subadmin: {
        _id: subadmin._id,
        id: subadmin._id,
        name: subadmin.name,
        email: subadmin.email,
        role: subadmin.role,
        permissions: subadmin.permissions,
        isActive: subadmin.isActive
      }
    });

  } catch (error) {
    console.error("Update subadmin error:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
});

// ================= DELETE SUB-ADMIN (SUPER ADMIN ONLY) =================
router.delete('/subadmin/:id', authMiddleware, isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const subadmin = await Admin.findById(id);

    if (!subadmin) {
      return res.status(404).json({
        success: false,
        message: 'Sub-admin not found'
      });
    }

    if (subadmin.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete super admin'
      });
    }

    await Admin.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Sub-admin deleted successfully'
    });

  } catch (error) {
    console.error("Delete subadmin error:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error'
    });
  }
});

// ================= UPDATE USER PROFILE =================
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    if (req.user.type === 'user') {
      const { name, email } = req.body;
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

      if (name) user.name = name;
      if (email) user.email = email;

      await user.save();

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
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

module.exports = router;