const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getUserPosts,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// All user routes require a valid JWT
router.get('/:id', protect, getUserProfile);
router.get('/:id/posts', protect, getUserPosts);

module.exports = router;
