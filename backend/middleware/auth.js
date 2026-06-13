const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

/**
 * Main Authentication Middleware
 * Verifies JWT token and attaches user/admin data to req.user
 */
const authMiddleware = async (req, res, next) => {
  // Get token from multiple possible locations
  let token = req.headers.authorization?.split(' ')[1];
  
  // Also check for token in cookies or query params (for file downloads)
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }
  
  if (!token && req.query?.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No token provided. Please login first.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired. Please login again.' 
      });
    }
    
    if (decoded.type === 'admin') {
      const admin = await Admin.findById(decoded.adminId).select('-password');
      if (!admin) {
        return res.status(401).json({ 
          success: false,
          message: 'Admin not found' 
        });
      }
      
      // Check if admin is active
      if (admin.status === 'inactive') {
        return res.status(403).json({ 
          success: false,
          message: 'Admin account is disabled. Please contact support.' 
        });
      }
      
      req.user = {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions || { courses: [] },
        type: 'admin',
        status: admin.status
      };
    } else {
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not found' 
        });
      }
      
      // Check if user is active
      if (user.status === 'inactive') {
        return res.status(403).json({ 
          success: false,
          message: 'Account is disabled. Please contact support.' 
        });
      }
      
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: 'user',
        type: 'user',
        isPremium: user.isPremium || false,
        purchasedItems: user.purchasedItems || [],
        status: user.status
      };
    }
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. Please login again.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired. Please login again.' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: 'Authentication failed. Please login again.' 
    });
  }
};

/**
 * Super Admin only middleware
 * Only users with super_admin role can access
 */
const isSuperAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    });
  }
  
  if (req.user.type !== 'admin' || req.user.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Super admin access only. You do not have permission.' 
    });
  }
  next();
};

/**
 * Admin only middleware
 * Any admin (including super admin) can access
 */
const isAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    });
  }
  
  if (req.user.type !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Admin access required. You do not have permission.' 
    });
  }
  next();
};

/**
 * Course-specific permission middleware
 * Checks if admin has permission for specific course
 * Super admins have access to all courses
 */
const hasCoursePermission = (course) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
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
    
    // Check if admin has permission for this specific course
    const allowedCourses = req.user.permissions?.courses || [];
    
    if (allowedCourses.includes(course) || allowedCourses.includes('all')) {
      return next();
    }
    
    return res.status(403).json({ 
      success: false,
      message: `No permission for ${course}. You only have access to: ${allowedCourses.join(', ') || 'none'}`,
      allowedCourses: allowedCourses
    });
  };
};

/**
 * Check if user is premium
 */
const isPremiumUser = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
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
      message: 'Premium subscription required to access this content' 
    });
  }
  next();
};

/**
 * Optional auth - doesn't require authentication but attaches user if available
 */
const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type === 'admin') {
      const admin = await Admin.findById(decoded.adminId).select('-password');
      if (admin) {
        req.user = {
          id: admin._id,
          email: admin.email,
          role: admin.role,
          type: 'admin'
        };
      }
    } else {
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = {
          id: user._id,
          email: user.email,
          role: 'user',
          type: 'user',
          isPremium: user.isPremium || false
        };
      }
    }
  } catch (error) {
    // Invalid token - continue without user
    req.user = null;
  }
  next();
};

module.exports = { 
  authMiddleware, 
  isSuperAdmin, 
  isAdmin, 
  hasCoursePermission,
  isPremiumUser,
  optionalAuth
};