import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

/**
 * Custom hook to easily consume the Authentication Session Context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be consumed within an AuthProvider');
  }
  return context;
};

/**
 * Provider Component wrapping standard browser nodes
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token'));
  const [loading, setLoading] = useState(true);

  /**
   * API Action: Log Out
   */
  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_profile');
    setToken(null);
    setUser(null);
  };

  // Hydrate auth status upon initial page boot
  useEffect(() => {
    const hydrateAuth = async () => {
      const storedToken = localStorage.getItem('jwt_token');
      
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        // Fetch fresh profile details from secure API
        const response = await api.get('/api/auth/me');
        if (response.data && response.data.success) {
          setUser(response.data.user);
          setToken(storedToken);
        } else {
          // Clear compromised storage
          logout();
        }
      } catch (error) {
        console.error('[Auth Hydrator] Failed to fetch current user profile:', error.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    hydrateAuth();
  }, []);

  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, []);

  /**
   * API Action: Authentication Sign In
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      if (response.data && response.data.success) {
        const { token: apiToken, user: apiUser } = response.data;
        
        localStorage.setItem('jwt_token', apiToken);
        localStorage.setItem('user_profile', JSON.stringify(apiUser));
        
        setToken(apiToken);
        setUser(apiUser);
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      console.error('[Auth Service] Login error:', error);
      const msg = error.response?.data?.message || 'Connection failed. Please verify credentials.';
      return { success: false, message: msg };
    }
  };

  /**
   * API Action: Authentication Sign Up
   */
  const signup = async (name, email, password, role = 'MEMBER') => {
    try {
      const response = await api.post('/api/auth/signup', { name, email, password, role });
      
      if (response.data && response.data.success) {
        const { token: apiToken, user: apiUser } = response.data;
        
        localStorage.setItem('jwt_token', apiToken);
        localStorage.setItem('user_profile', JSON.stringify(apiUser));
        
        setToken(apiToken);
        setUser(apiUser);
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error) {
      console.error('[Auth Service] Signup error:', error);
      const msg = error.response?.data?.message || 'Registration failed. Verify parameters.';
      return { success: false, message: msg };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
