const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature against JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user object (excluding password hash) to request
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized: User no longer exists',
        });
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Token is invalid or expired',
      });
    }
  }

  // If no Bearer token was provided in headers
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No token provided',
    });
  }
};

module.exports = { protect };
