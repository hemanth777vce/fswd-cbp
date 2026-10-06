import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import CreatePost from '../components/posts/CreatePost';
import PostCard from '../components/posts/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { MessageSquareDashed, RefreshCw, AlertCircle } from 'lucide-react';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/posts');
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error('Failed to load feed:', err.message);
      setError('Could not load community feed. Please verify the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // Handler when a new post is created
  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  // Handler when a post is deleted
  const handlePostDeleted = (deletedPostId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== deletedPostId));
  };

  // Handler to sync likes array across the list if needed
  const handleLikeChange = (postId, isLiked, likesCount, updatedLikes) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            likes: updatedLikes,
          };
        }
        return post;
      })
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Create Post Component */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Feed Status and Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
            <LoadingSpinner message="Fetching community updates..." />
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center shadow-xs">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-rose-800 mb-4">{error}</p>
            <button
              onClick={fetchFeed}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : posts.length === 0 ? (
          /* Empty State Display */
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center shadow-xs">
            <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquareDashed className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              No posts in the feed yet
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Be the first to share an update, question, or milestone with the DevPulse network!
            </p>
          </div>
        ) : (
          /* Chronological Feed of PostCards */
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onLikeChange={handleLikeChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
