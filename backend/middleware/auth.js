const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type === 'admin') {
      const admin = await Admin.findById(decoded.adminId).select('-password');
      if (!admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }
      req.user = {
  adminId: admin._id,
  id: admin._id,
  email: admin.email,
  role: admin.role,
  permissions: admin.permissions,
  type: 'admin'
};
    } else {
      const user = await User.findById(decoded.userId).select("-password");

if (!user) {
  return res.status(401).json({
    message: "User not found"
  });
}

// ✅ Check if user logged in from another device
if (decoded.sessionToken !== user.sessionToken) {
  return res.status(401).json({
    message: "Session expired. Please login again."
  });
}

req.user = {
  userId: user._id,
  id: user._id,
  email: user.email,
  mobile: user.mobile,
  role: "user",
  type: "user"
};
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const isSuperAdmin = async (req, res, next) => {
  if (req.user.type !== 'admin' || req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin only' });
  }
  next();
};

const isAdmin = async (req, res, next) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const hasCoursePermission = (course) => {
  return async (req, res, next) => {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    if (req.user.role === 'super_admin') {
      return next();
    }
    
    if (req.user.permissions?.courses?.includes(course)) {
      return next();
    }
    
    return res.status(403).json({ 
      message: `No permission for ${course}`,
      allowedCourses: req.user.permissions?.courses || []
    });
  };
};

module.exports = { authMiddleware, isSuperAdmin, isAdmin, hasCoursePermission };