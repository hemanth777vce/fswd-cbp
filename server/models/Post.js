const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Post content cannot be empty'],
      trim: true,
      minlength: [1, 'Content must contain at least 1 character'],
      maxlength: [280, 'Content cannot exceed 280 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post must have an author'],
      index: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for chronological feed retrieval
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
