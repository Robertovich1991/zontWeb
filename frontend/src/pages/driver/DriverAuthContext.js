import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DriverAuthContext = createContext(null);
const API = process.env.REACT_APP_BACKEND_URL;

export const useDriverAuth = () => useContext(DriverAuthContext);

export const DriverAuthProvider = ({ children }) => {
  const [driver, setDriver] = useState(null);
  const [token, setToken] = useState(null);
  const [driverType, setDriverType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('driver_session');
    if (stored) {
      try {
        const s = JSON.parse(stored);
        setToken(s.token);
        setDriverType(s.driverType);
        setDriver(s.driver);
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await fetch(`${API}/api/driver/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Identifiants incorrects');
    }
    const data = await res.json();
    const session = {
      token: data.accessToken,
      driverType: data.driverType,
      driver: data.driver,
    };
    localStorage.setItem('driver_session', JSON.stringify(session));
    setToken(data.accessToken);
    setDriverType(data.driverType);
    setDriver(data.driver);
  };

  const logout = () => {
    localStorage.removeItem('driver_session');
    setToken(null);
    setDriverType(null);
    setDriver(null);
  };

  const authFetch = useCallback(async (path, options = {}) => {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'X-Driver-Type': driverType || 'csharp',
      },
    });
    if (res.status === 401) {
      logout();
      throw new Error('Session expiree');
    }
    return res;
  }, [token, driverType]);

  return (
    <DriverAuthContext.Provider value={{ driver, token, driverType, loading, login, logout, authFetch }}>
      {children}
    </DriverAuthContext.Provider>
  );
};
