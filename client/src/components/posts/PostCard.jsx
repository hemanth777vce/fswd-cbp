import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatRelativeTime } from '../../utils/dateUtils';
import LikeButton from './LikeButton';
import ModalConfirm from '../common/ModalConfirm';
import axiosInstance from '../../api/axiosInstance';

const PostCard = ({ post, onPostDeleted, onLikeChange }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine if the currently logged-in user is the author
  const authorId = typeof post.author === 'object' && post.author !== null
    ? post.author._id
    : post.author;
  const authorName = typeof post.author === 'object' && post.author !== null
    ? post.author.name
    : 'Unknown User';

  const isAuthor = user && authorId && user._id?.toString() === authorId.toString();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/posts/${post._id}`);
      setIsModalOpen(false);
      if (onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch (err) {
      console.error('Failed to delete post:', err.message);
      alert(err.response?.data?.message || 'Could not delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow p-4 sm:p-5 mb-4">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(authorName)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {authorName}
              </h4>
              <p className="text-xs text-slate-400">
                {formatRelativeTime(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Delete Button (Only rendered for post author) */}
          {isAuthor && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors"
              title="Delete your post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Post Content */}
        <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-wrap mb-4">
          {post.content}
        </p>

        {/* Post Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <LikeButton
            postId={post._id}
            initialLikes={post.likes || []}
            onLikeChange={onLikeChange}
          />
        </div>
      </article>

      {/* Delete Confirmation Modal */}
      <ModalConfirm
        isOpen={isModalOpen}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action is permanent and cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default PostCard;
