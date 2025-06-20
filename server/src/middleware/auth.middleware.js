const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Protect routes - middleware to check if user is authenticated
exports.authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretdevkey');

      // Add user to request object
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check resource ownership
exports.checkOwnership = (model) => async (req, res, next) => {
  try {
    const resource = await model.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user is the owner of the resource
    if (resource.owner && resource.owner.toString() !== req.user.id) {
      // Check if user is a collaborator with required permissions
      if (resource.collaborators) {
        const collaborator = resource.collaborators.find(
          collab => collab.user.toString() === req.user.id
        );

        if (!collaborator || !collaborator.permissions.includes('admin')) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to modify this resource'
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to modify this resource'
        });
      }
    }

    // Add resource to request
    req.resource = resource;
    next();
  } catch (error) {
    next(error);
  }
};