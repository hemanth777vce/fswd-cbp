// Automated Test Suite for Phase 2: Authentication & JWT Endpoints
const dotenv = require('dotenv');
dotenv.config();

const API_BASE = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('\n=============================================');
  console.log('🧪 Starting Phase 2: Auth & JWT Verification');
  console.log('=============================================\n');

  let passed = 0;
  let failed = 0;
  let savedToken = null;

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
    // 1. Health check
    const healthRes = await fetch(`${API_BASE}/health`);
    const healthData = await healthRes.json();
    assert('Health Check endpoint is active', healthRes.status === 200 && healthData.success === true);

    // 2. Register valid user
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: uniqueEmail,
        password: 'securepassword123',
      }),
    });
    const regData = await regRes.json();
    assert(
      'Register valid user returns 201 Created and JWT token',
      regRes.status === 201 && regData.success === true && !!regData.token && regData.user.email === uniqueEmail
    );
    assert(
      'Register response does not expose password hash',
      regData.user.password === undefined
    );
    savedToken = regData.token;

    // 3. Register duplicate email
    const dupRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Jane',
        email: uniqueEmail,
        password: 'anotherpassword',
      }),
    });
    const dupData = await dupRes.json();
    assert(
      'Register duplicate email is rejected with 400 Bad Request',
      dupRes.status === 400 && dupData.success === false
    );

    // 4. Register with missing fields
    const missingRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Missing Fields',
      }),
    });
    const missingData = await missingRes.json();
    assert(
      'Register with missing fields is rejected with 400 Bad Request',
      missingRes.status === 400 && missingData.success === false
    );

    // 5. Register with short password (< 6 chars)
    const shortPassRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Pass',
        email: `short_${Date.now()}@example.com`,
        password: '123',
      }),
    });
    const shortPassData = await shortPassRes.json();
    assert(
      'Register with password < 6 characters is rejected with 400',
      shortPassRes.status === 400 && shortPassData.success === false
    );

    // 6. Login valid credentials
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'securepassword123',
      }),
    });
    const loginData = await loginRes.json();
    assert(
      'Login valid credentials returns 200 OK and valid JWT token',
      loginRes.status === 200 && loginData.success === true && !!loginData.token
    );
    assert(
      'Login response does not expose password hash',
      loginData.user.password === undefined
    );

    // 7. Login invalid password
    const badPassRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'wrongpassword',
      }),
    });
    const badPassData = await badPassRes.json();
    assert(
      'Login with incorrect password returns 401 Unauthorized',
      badPassRes.status === 401 && badPassData.success === false
    );

    // 8. Login non-existent email
    const nonExistRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'does_not_exist_999@example.com',
        password: 'somepassword123',
      }),
    });
    const nonExistData = await nonExistRes.json();
    assert(
      'Login with non-existent email returns 401 Unauthorized',
      nonExistRes.status === 401 && nonExistData.success === false
    );

    // 9. Access protected route (/api/auth/me) without token
    const noTokenRes = await fetch(`${API_BASE}/auth/me`);
    const noTokenData = await noTokenRes.json();
    assert(
      'Access /api/auth/me without token returns 401 Unauthorized',
      noTokenRes.status === 401 && noTokenData.success === false
    );

    // 10. Access protected route with invalid/tampered token
    const badTokenRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: 'Bearer this_is_a_completely_fake_token_12345' },
    });
    const badTokenData = await badTokenRes.json();
    assert(
      'Access /api/auth/me with invalid token returns 401 Unauthorized',
      badTokenRes.status === 401 && badTokenData.success === false
    );

    // 11. Access protected route with valid Bearer token
    const validMeRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    });
    const validMeData = await validMeRes.json();
    assert(
      'Access /api/auth/me with valid Bearer token returns 200 OK and current user profile',
      validMeRes.status === 200 && validMeData.success === true && validMeData.user.email === uniqueEmail
    );
    assert(
      'Protected profile route does not leak password hash',
      validMeData.user.password === undefined
    );

  } catch (err) {
    console.error('Fatal test runner error:', err.message);
    failed++;
  }

  console.log('\n---------------------------------------------');
  console.log(`Total Passed: ${passed} | Total Failed: ${failed}`);
  console.log('---------------------------------------------\n');

  process.exit(failed > 0 ? 1 : 0);
};

runTests();
