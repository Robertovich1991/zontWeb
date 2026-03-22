import React, { createContext, useContext, useState, useCallback } from 'react';

const GpsAdminCtx = createContext(null);
const API = process.env.REACT_APP_BACKEND_URL;

export const useGpsAdmin = () => useContext(GpsAdminCtx);

export const GpsAdminProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('gps_admin_token'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gps_admin_user')); } catch { return null; }
  });

  const isAuthenticated = !!token;

  const login = async (email, password) => {
    const res = await fetch(`${API}/api/gps-admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erreur de connexion');
    localStorage.setItem('gps_admin_token', data.token);
    localStorage.setItem('gps_admin_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('gps_admin_token');
    localStorage.removeItem('gps_admin_user');
    setToken(null);
    setUser(null);
  };

  const authFetch = useCallback(async (path, options = {}) => {
    return fetch(`${API}${path}`, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  }, [token]);

  return (
    <GpsAdminCtx.Provider value={{ token, user, isAuthenticated, login, logout, authFetch }}>
      {children}
    </GpsAdminCtx.Provider>
  );
};
