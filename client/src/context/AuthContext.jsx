import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('devpulse_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and verify authentication on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('devpulse_token');
      if (storedToken) {
        try {
          const res = await axiosInstance.get('/auth/me');
          setUser(res.data.user);
          setToken(storedToken);
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('devpulse_token');
          localStorage.removeItem('devpulse_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('devpulse_token', receivedToken);
      localStorage.setItem('devpulse_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await axiosInstance.post('/auth/register', { name, email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('devpulse_token', receivedToken);
      localStorage.setItem('devpulse_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('devpulse_token');
    localStorage.removeItem('devpulse_user');
    setUser(null);
    setToken(null);
    setError(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    error,
    login,
    register,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
