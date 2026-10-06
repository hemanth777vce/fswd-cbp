const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get user profile details & summary stats
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate user post count
    const postCount = await Post.countDocuments({ author: req.params.id });

    // Calculate total likes received across all posts authored by this user
    const userPosts = await Post.find({ author: req.params.id }).select('likes');
    const totalLikesReceived = userPosts.reduce(
      (acc, post) => acc + (post.likes ? post.likes.length : 0),
      0
    );

    return res.status(200).json({
      success: true,
      user,
      postCount,
      totalLikesReceived,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts created by a specific user
// @route   GET /api/users/:id/posts
// @access  Private
const getUserPosts = async (req, res, next) => {
  try {
    // Verify user exists first
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .populate('author', 'name email');

    return res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  getUserPosts,
};
