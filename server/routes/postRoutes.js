const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  deletePost,
  toggleLikePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// All post routes require a valid JWT
router.route('/')
  .get(protect, getPosts)
  .post(protect, createPost);

router.route('/:id')
  .delete(protect, deletePost);

router.route('/:id/like')
  .put(protect, toggleLikePost);

module.exports = router;
