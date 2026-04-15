import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/api';
import { toast } from 'sonner';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.token) {
      // Validate token against C# backend
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${process.env.REACT_APP_BACKEND_URL}/api/proxy/client/profile`);
      xhr.setRequestHeader('Authorization', `Bearer ${currentUser.token}`);
      xhr.onload = () => {
        if (xhr.status === 401) {
          // Token expired — clear session and notify user
          authService.logout();
          setUser(null);
          toast.error('Session expirée. Veuillez vous reconnecter.', { duration: 5000 });
        } else {
          setUser(currentUser);
        }
        setLoading(false);
      };
      xhr.onerror = () => {
        // Network error — keep user logged in (offline tolerance)
        setUser(currentUser);
        setLoading(false);
      };
      xhr.send();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  };

  const loginDirect = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    loginDirect,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
