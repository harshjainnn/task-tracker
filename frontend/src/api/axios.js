import axios from 'axios';

// Pull API address from Vite environment variables. Keep empty for same-origin deployments.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Create customizable Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout limit
});

/**
 * Request Interceptor
 * Automatically injects active JWT tokens into incoming request headers
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Centralized interceptor to intercept unauthenticated errors (e.g. status 401)
 * to perform token revocation or redirecting loops.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the token is invalid or expired, clear local storage
    if (error.response && error.response.status === 401) {
      console.warn('[HTTP Client] Authentication token invalid or expired. Purging cache.');
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_profile');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default api;
