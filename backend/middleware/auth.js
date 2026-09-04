const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

// =========================================================
// MAIN AUTH MIDDLEWARE - Supports both User & Admin
// =========================================================
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'No authorization header provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ========== ADMIN TOKEN ==========
    if (decoded.type === 'admin' || decoded.type === 'super_admin') {
      const admin = await Admin.findById(decoded.adminId || decoded.id).select('-password');
      
      if (!admin) {
        return res.status(401).json({ 
          success: false,
          message: 'Admin not found' 
        });
      }

      if (admin.isActive === false) {
        return res.status(403).json({ 
          success: false,
          message: 'Admin account is inactive' 
        });
      }

      req.user = {
        id: admin._id,
        adminId: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        type: 'admin',
        isActive: admin.isActive
      };

      return next();
    }

    // ========== USER TOKEN ==========
    if (decoded.type === 'user') {
      const user = await User.findById(decoded.userId || decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: "User not found" 
        });
      }

      // ✅ Check if user logged in from another device
      if (decoded.sessionToken && user.sessionToken && decoded.sessionToken !== user.sessionToken) {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please login again."
        });
      }

      req.user = {
        id: user._id,
        userId: user._id,
        email: user.email,
        mobile: user.mobile,
        name: user.name,
        role: "user",
        type: "user",
        isPremium: user.isPremium || false,
        enrolledCourses: user.enrolledCourses || [],
        purchasedItems: user.purchasedItems || [],
        sessionToken: user.sessionToken
      };

      return next();
    }

    // ========== FALLBACK - Try to find user or admin ==========
    if (decoded.userId) {
      const user = await User.findById(decoded.userId).select("-password");
      if (user) {
        req.user = {
          id: user._id,
          userId: user._id,
          email: user.email,
          mobile: user.mobile,
          name: user.name,
          role: "user",
          type: "user",
          isPremium: user.isPremium || false,
          enrolledCourses: user.enrolledCourses || [],
          purchasedItems: user.purchasedItems || []
        };
        return next();
      }
    }

    if (decoded.adminId) {
      const admin = await Admin.findById(decoded.adminId).select('-password');
      if (admin) {
        req.user = {
          id: admin._id,
          adminId: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions,
          type: 'admin',
          isActive: admin.isActive
        };
        return next();
      }
    }

    return res.status(401).json({ 
      success: false,
      message: 'Invalid token - User not found' 
    });

  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired. Please login again.' 
      });
    }

    return res.status(401).json({ 
      success: false,
      message: 'Authentication failed: ' + error.message 
    });
  }
};

// =========================================================
// SUPER ADMIN ONLY
// =========================================================
const isSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }

    if (req.user.type !== 'admin' || req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Super admin access required' 
      });
    }

    next();
  } catch (error) {
    console.error("isSuperAdmin Error:", error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};

// =========================================================
// ADMIN ONLY (Any Admin)
// =========================================================
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }

    if (req.user.type !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    next();
  } catch (error) {
    console.error("isAdmin Error:", error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};

// =========================================================
// COURSE PERMISSION CHECK
// =========================================================
const hasCoursePermission = (course) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authenticated' 
        });
      }

      if (req.user.type !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Admin access required' 
        });
      }

      // Super admin has access to all courses
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Check if admin has permission for this course
      const allowedCourses = req.user.permissions?.courses || [];
      
      // If no specific course is provided, check if admin has any permissions
      if (!course) {
        if (allowedCourses.length > 0) {
          return next();
        }
        return res.status(403).json({ 
          success: false,
          message: 'No course permissions assigned' 
        });
      }

      if (allowedCourses.includes(course)) {
        return next();
      }

      return res.status(403).json({ 
        success: false,
        message: `No permission for ${course}`,
        allowedCourses: allowedCourses
      });

    } catch (error) {
      console.error("hasCoursePermission Error:", error);
      res.status(500).json({ 
        success: false,
        message: 'Server Error' 
      });
    }
  };
};

// =========================================================
// CHECK IF USER IS PREMIUM
// =========================================================
const isPremiumUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authenticated' 
      });
    }

    if (req.user.type !== 'user') {
      return res.status(403).json({ 
        success: false,
        message: 'User access required' 
      });
    }

    if (!req.user.isPremium) {
      return res.status(403).json({ 
        success: false,
        message: 'Premium membership required' 
      });
    }

    next();
  } catch (error) {
    console.error("isPremiumUser Error:", error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};

// =========================================================
// CHECK IF USER IS LOGGED IN (For public routes with optional auth)
// =========================================================
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type === 'user') {
      const user = await User.findById(decoded.userId || decoded.id).select("-password");
      if (user) {
        req.user = {
          id: user._id,
          userId: user._id,
          email: user.email,
          name: user.name,
          role: "user",
          type: "user",
          isPremium: user.isPremium || false
        };
      }
    } else if (decoded.type === 'admin') {
      const admin = await Admin.findById(decoded.adminId || decoded.id).select('-password');
      if (admin) {
        req.user = {
          id: admin._id,
          adminId: admin._id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions: admin.permissions,
          type: 'admin'
        };
      }
    }

    next();
  } catch (error) {
    // If token is invalid, just set user to null and continue
    req.user = null;
    next();
  }
};

// =========================================================
// RATE LIMIT PER USER (Optional)
// =========================================================
const userRateLimit = (maxRequests = 100, windowMs = 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(userId)) {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId).filter(time => time > windowStart);
    userRequests.push(now);
    requests.set(userId, userRequests);

    if (userRequests.length > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }

    next();
  };
};


module.exports = {
  authMiddleware,
  isSuperAdmin,
  isAdmin,
  hasCoursePermission,
  isPremiumUser,
  optionalAuth,
  userRateLimit
};