const Post = require('../models/Post');

// @desc    Get all posts (chronological feed)
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
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

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot be empty',
      });
    }

    if (content.trim().length > 280) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot exceed 280 characters',
      });
    }

    const newPost = await Post.create({
      content: content.trim(),
      author: req.user._id,
      likes: [],
    });

    // Populate author details before returning
    const populatedPost = await newPost.populate('author', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post (author only)
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Security Authorization Check: Verify logged-in user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only delete your own posts',
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      deletedPostId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like / unlike on a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const userId = req.user._id;
    const isAlreadyLiked = post.likes.some(
      (likeId) => likeId.toString() === userId.toString()
    );

    let updatedPost;
    let isLiked;

    if (isAlreadyLiked) {
      // Unlike post using atomic $pull
      updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { $pull: { likes: userId } },
        { new: true }
      ).populate('author', 'name email');
      isLiked = false;
    } else {
      // Like post using atomic $addToSet (prevents duplicate likes)
      updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { likes: userId } },
        { new: true }
      ).populate('author', 'name email');
      isLiked = true;
    }

    return res.status(200).json({
      success: true,
      isLiked,
      likesCount: updatedPost.likes.length,
      likes: updatedPost.likes,
      post: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  createPost,
  deletePost,
  toggleLikePost,
};
