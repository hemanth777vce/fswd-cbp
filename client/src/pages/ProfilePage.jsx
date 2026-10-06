import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import PostCard from '../components/posts/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Mail, Calendar, MessageSquare, Heart, AlertCircle, RefreshCw } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfileAndPosts = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);

    try {
      // Parallel requests for profile stats and user posts
      const [profileRes, postsRes] = await Promise.all([
        axiosInstance.get(`/users/${user._id}`),
        axiosInstance.get(`/users/${user._id}/posts`),
      ]);

      setProfileData(profileRes.data);
      setUserPosts(postsRes.data.posts || []);
    } catch (err) {
      console.error('Failed to load profile data:', err.message);
      setError('Could not load profile information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPosts();
  }, [user?._id]);

  const handlePostDeleted = (deletedPostId) => {
    setUserPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
    // Also decrement post count in profile stats
    setProfileData((prev) => (prev ? { ...prev, postCount: Math.max(0, prev.postCount - 1) } : prev));
  };

  const handleLikeChange = (postId, isLiked, likesCount, updatedLikes) => {
    setUserPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, likes: updatedLikes } : p))
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 shadow-xs">
          <LoadingSpinner message="Loading user profile and timeline..." />
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-xs">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-rose-800 mb-4">{error}</p>
          <button
            onClick={fetchProfileAndPosts}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <>
          {/* User Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
              {/* Initials Avatar */}
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-sky-500/20 shrink-0">
                {getInitials(user?.name)}
              </div>

              {/* User Identity Details */}
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {user?.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-2 gap-x-4 mt-2 text-xs font-medium text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Joined {formatDate(user?.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Statistics Badges */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                <div className="flex items-center justify-center space-x-1.5 text-sky-600 mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Posts
                  </span>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {profileData?.postCount ?? 0}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                <div className="flex items-center justify-center space-x-1.5 text-rose-500 mb-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Likes Received
                  </span>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {profileData?.totalLikesReceived ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* User's Authored Posts Timeline */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 px-1">
              My Activity & Posts ({userPosts.length})
            </h3>

            {userPosts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 text-center">
                <p className="text-sm text-slate-500">
                  You haven't published any updates yet. Head back to the Feed to share your first post!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostDeleted={handlePostDeleted}
                    onLikeChange={handleLikeChange}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
