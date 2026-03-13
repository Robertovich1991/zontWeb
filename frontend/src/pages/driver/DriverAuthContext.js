import React, { createContext, useContext, useState, useEffect } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;
const DriverAuthContext = createContext(null);

export const useDriverAuth = () => useContext(DriverAuthContext);

export const DriverAuthProvider = ({ children }) => {
  const [partner, setPartner] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('driver_token');
    const savedPartner = localStorage.getItem('driver_partner');
    if (saved && savedPartner) {
      setToken(saved);
      setPartner(JSON.parse(savedPartner));
      // Verify token
      fetch(`${API}/api/partner/auth/me`, { headers: { Authorization: `Bearer ${saved}` } })
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => { setPartner(data); setLoading(false); })
        .catch(() => { logout(); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API}/api/partner/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erreur de connexion');
    setToken(data.token);
    setPartner(data.partner);
    localStorage.setItem('driver_token', data.token);
    localStorage.setItem('driver_partner', JSON.stringify(data.partner));
    if (data.csharpToken) {
      localStorage.setItem('driver_csharp_token', data.csharpToken);
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setPartner(null);
    localStorage.removeItem('driver_token');
    localStorage.removeItem('driver_partner');
  };

  return (
    <DriverAuthContext.Provider value={{ partner, token, loading, login, logout }}>
      {children}
    </DriverAuthContext.Provider>
  );
};
