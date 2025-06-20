const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  updateDetails, 
  updatePassword, 
  logout 
} = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.put('/update-details', authMiddleware, updateDetails);
router.put('/update-password', authMiddleware, updatePassword);
router.get('/logout', authMiddleware, logout);

module.exports = router;