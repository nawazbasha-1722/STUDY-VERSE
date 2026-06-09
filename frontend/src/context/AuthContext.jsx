import { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token exists on load and fetch user info
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await API.get('/auth/me');
        if (response.data?.success) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      if (response.data?.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: 'Invalid server response' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/register', {
        name,
        email,
        password,
        role,
      });
      if (response.data?.success) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true, message: response.data.message };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    try {
      const response = await API.put('/auth/profile', profileData);
      if (response.data?.success) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, message: 'Profile update failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed',
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
