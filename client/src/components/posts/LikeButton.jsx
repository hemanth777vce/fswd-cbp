import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../hooks/useAuth';

const LikeButton = ({ postId, initialLikes = [], onLikeChange }) => {
  const { user } = useAuth();

  // Determine if currently logged-in user has liked this post
  const isInitiallyLiked = user && initialLikes.some((id) => {
    const likeId = typeof id === 'object' && id !== null ? id._id : id;
    return likeId?.toString() === user._id?.toString();
  });

  const [isLiked, setIsLiked] = useState(isInitiallyLiked);
  const [likesCount, setLikesCount] = useState(initialLikes.length);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleLike = async (e) => {
    e.stopPropagation();
    if (isUpdating) return;

    // Optimistic UI update
    const nextIsLiked = !isLiked;
    const nextCount = nextIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

    setIsLiked(nextIsLiked);
    setLikesCount(nextCount);
    setIsUpdating(true);

    try {
      const res = await axiosInstance.put(`/posts/${postId}/like`);
      // Reconcile with exact database response
      setIsLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);

      if (onLikeChange) {
        onLikeChange(postId, res.data.isLiked, res.data.likesCount, res.data.likes);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error.message);
      // Revert optimistic update on network/server failure
      setIsLiked(isLiked);
      setLikesCount(likesCount);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleLike}
      disabled={isUpdating}
      className={`group flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all select-none ${
        isLiked
          ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
          : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
      }`}
      title={isLiked ? 'Unlike post' : 'Like post'}
    >
      <Heart
        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
          isLiked
            ? 'fill-rose-500 text-rose-500 animate-bounce-short'
            : 'text-slate-400 group-hover:text-rose-500'
        }`}
      />
      <span className={isLiked ? 'font-bold text-rose-600' : 'text-slate-600'}>
        {likesCount}
      </span>
    </button>
  );
};

export default LikeButton;
