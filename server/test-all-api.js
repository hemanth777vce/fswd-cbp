// Comprehensive Automated Test Suite for Phase 3: Posts, Likes, Profile & Authorization
const dotenv = require('dotenv');
dotenv.config();

const API_BASE = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 Starting Phase 3: Posts, Likes & Auth Verification');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (description, condition, details = '') => {
    if (condition) {
      console.log(`✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${description} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  try {
    // 1. Register User A
    const userAEmail = `user_a_${Date.now()}@example.com`;
    const regARes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice Developer', email: userAEmail, password: 'password123' }),
    });
    const regAData = await regARes.json();
    const tokenA = regAData.token;
    const userAId = regAData.user._id;
    assert('User A registered successfully with JWT', regARes.status === 201 && !!tokenA);

    // 2. Register User B
    const userBEmail = `user_b_${Date.now()}@example.com`;
    const regBRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob Engineer', email: userBEmail, password: 'password123' }),
    });
    const regBData = await regBRes.json();
    const tokenB = regBData.token;
    const userBId = regBData.user._id;
    assert('User B registered successfully with JWT', regBRes.status === 201 && !!tokenB);

    // 3. User A creates a valid post
    const postContent = 'Excited to build DevPulse with the MERN stack!';
    const createPostRes = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ content: postContent }),
    });
    const createPostData = await createPostRes.json();
    assert(
      'User A creates a valid post (201 Created)',
      createPostRes.status === 201 &&
        createPostData.success === true &&
        createPostData.post.content === postContent &&
        createPostData.post.author.name === 'Alice Developer'
    );
    const postId = createPostData.post._id;

    // 4. Reject empty post
    const emptyPostRes = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ content: '   ' }),
    });
    const emptyPostData = await emptyPostRes.json();
    assert(
      'Reject empty post with 400 Bad Request',
      emptyPostRes.status === 400 && emptyPostData.success === false
    );

    // 5. Reject post exceeding 280 characters
    const longContent = 'A'.repeat(281);
    const longPostRes = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ content: longContent }),
    });
    const longPostData = await longPostRes.json();
    assert(
      'Reject post > 280 characters with 400 Bad Request',
      longPostRes.status === 400 && longPostData.success === false
    );

    // 6. Retrieve chronological feed
    const feedRes = await fetch(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const feedData = await feedRes.json();
    assert(
      'Retrieve feed (200 OK) with populated author details',
      feedRes.status === 200 &&
        Array.isArray(feedData.posts) &&
        feedData.posts.some((p) => p._id === postId && p.author.name === 'Alice Developer')
    );

    // 7. User B likes User A's post
    const like1Res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const like1Data = await like1Res.json();
    assert(
      "User B likes User A's post (likesCount increments to 1, isLiked: true)",
      like1Res.status === 200 && like1Data.isLiked === true && like1Data.likesCount === 1
    );

    // 8. User B unlikes post (toggle mechanism)
    const unlikeRes = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const unlikeData = await unlikeRes.json();
    assert(
      'User B toggles like off (likesCount decrements to 0, isLiked: false)',
      unlikeRes.status === 200 && unlikeData.isLiked === false && unlikeData.likesCount === 0
    );

    // 9. User B re-likes post
    const like2Res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const like2Data = await like2Res.json();
    assert(
      'User B re-likes post (likesCount = 1)',
      like2Res.status === 200 && like2Data.isLiked === true && like2Data.likesCount === 1
    );

    // 10. User A also likes post
    const like3Res = await fetch(`${API_BASE}/posts/${postId}/like`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const like3Data = await like3Res.json();
    assert(
      'User A also likes post (total likesCount = 2)',
      like3Res.status === 200 && like3Data.likesCount === 2
    );

    // 11. Inspect User A profile
    const profileRes = await fetch(`${API_BASE}/users/${userAId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const profileData = await profileRes.json();
    assert(
      'User A profile reports correct postCount (1) and totalLikesReceived (2)',
      profileRes.status === 200 &&
        profileData.postCount === 1 &&
        profileData.totalLikesReceived === 2
    );

    // 12. Inspect User A posts endpoint
    const userPostsRes = await fetch(`${API_BASE}/users/${userAId}/posts`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const userPostsData = await userPostsRes.json();
    assert(
      'User A posts endpoint returns authored posts',
      userPostsRes.status === 200 && userPostsData.count === 1 && userPostsData.posts[0]._id === postId
    );

    // 13. SECURITY VERIFICATION: User B attempts to DELETE User A's post
    const unauthorizedDeleteRes = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const unauthorizedDeleteData = await unauthorizedDeleteRes.json();
    assert(
      "SECURITY: User B cannot delete User A's post (HTTP 403 Forbidden enforced)",
      unauthorizedDeleteRes.status === 403 && unauthorizedDeleteData.success === false
    );

    // 14. User A deletes their OWN post
    const authorizedDeleteRes = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const authorizedDeleteData = await authorizedDeleteRes.json();
    assert(
      'User A successfully deletes own post (HTTP 200 OK)',
      authorizedDeleteRes.status === 200 && authorizedDeleteData.success === true
    );

    // 15. Verify post is gone from feed
    const verifyFeedRes = await fetch(`${API_BASE}/posts`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const verifyFeedData = await verifyFeedRes.json();
    assert(
      'Post is permanently deleted from feed',
      verifyFeedRes.status === 200 && !verifyFeedData.posts.some((p) => p._id === postId)
    );

    // 16. Attempt to delete already deleted post
    const deleteAgainRes = await fetch(`${API_BASE}/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(
      'Attempting to delete non-existent post returns 404 Not Found',
      deleteAgainRes.status === 404
    );

  } catch (err) {
    console.error('Fatal test runner error:', err.message);
    failed++;
  }

  console.log('\n------------------------------------------------------');
  console.log(`Total Passed: ${passed} | Total Failed: ${failed}`);
  console.log('------------------------------------------------------\n');

  process.exit(failed > 0 ? 1 : 0);
};

runTests();
