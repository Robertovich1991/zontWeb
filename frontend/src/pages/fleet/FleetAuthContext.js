import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';

const FleetAuthContext = createContext(null);
const API = process.env.REACT_APP_BACKEND_URL;

export const useFleetAuth = () => useContext(FleetAuthContext);

export const FleetAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('fleet_token'));
  const [company, setCompany] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fleet_company')); } catch { return null; }
  });

  const isAuthenticated = !!token;

  const login = async (username, password) => {
    const res = await fetch(`${API}/api/fleet/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erreur de connexion');
    localStorage.setItem('fleet_token', data.accessToken);
    localStorage.setItem('fleet_company', JSON.stringify(data.company));
    setToken(data.accessToken);
    setCompany(data.company);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('fleet_token');
    localStorage.removeItem('fleet_company');
    setToken(null);
    setCompany(null);
  };

  const authFetch = useCallback(async (path, options = {}) => {
    const resp = await fetch(`${API}${path}`, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });

    // If C# token expired → force re-login
    if (resp.status === 401) {
      toast.error('Session expiree. Reconnexion necessaire.');
      localStorage.removeItem('fleet_token');
      localStorage.removeItem('fleet_company');
      setToken(null);
      setCompany(null);
      // Small delay to let toast show before redirect
      setTimeout(() => { window.location.href = '/fleet/login'; }, 1500);
      return resp;
    }

    return resp;
  }, [token]);

  return (
    <FleetAuthContext.Provider value={{ token, company, isAuthenticated, login, logout, authFetch }}>
      {children}
    </FleetAuthContext.Provider>
  );
};
