import axios from 'axios';

// Base Axios instance. In development Vite proxies /api to http://localhost:5000
const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devpulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Uniform error formatting
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401 and token is invalid/expired, clean storage
    if (error.response && error.response.status === 401) {
      const isAuthRoute =
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/register');

      if (!isAuthRoute) {
        localStorage.removeItem('devpulse_token');
        localStorage.removeItem('devpulse_user');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
