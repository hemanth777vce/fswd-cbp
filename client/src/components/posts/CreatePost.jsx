import React, { useState } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../hooks/useAuth';

const MAX_CHAR_COUNT = 280;

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHAR_COUNT;
  const isValid = content.trim().length > 0 && !isOverLimit;

  // Visual warning colors for character counter
  const getCounterColor = () => {
    if (isOverLimit) return 'text-rose-600 font-bold';
    if (charCount >= 250) return 'text-amber-500 font-semibold';
    return 'text-slate-400';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await axiosInstance.post('/posts', { content: content.trim() });
      setContent('');
      if (onPostCreated) {
        onPostCreated(res.data.post);
      }
    } catch (err) {
      console.error('Error creating post:', err.message);
      setError(err.response?.data?.message || 'Failed to publish post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 mb-6 transition-all focus-within:shadow-md focus-within:border-sky-300">
      {error && (
        <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          {/* User Avatar Circle */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
            {getInitials(user?.name)}
          </div>

          {/* Text Area */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening? Share a project update or quick thought..."
              rows={3}
              className="w-full resize-none border-0 p-0 text-slate-800 placeholder-slate-400 focus:ring-0 text-sm sm:text-base leading-relaxed bg-transparent"
              disabled={isSubmitting}
            />

            {/* Bottom Bar: Character Counter & Post Button */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
              <div className={`text-xs ${getCounterColor()} transition-colors`}>
                {charCount} / {MAX_CHAR_COUNT}
              </div>

              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-sky-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
