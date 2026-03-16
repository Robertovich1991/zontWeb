import React, { createContext, useContext, useState, useCallback } from 'react';

const HotelAuthContext = createContext(null);
const API = process.env.REACT_APP_BACKEND_URL;

export const useHotelAuth = () => useContext(HotelAuthContext);

export const HotelAuthProvider = ({ children }) => {
  const [hotelUser, setHotelUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hotel_user')); } catch { return null; }
  });
  const [hotelInfo, setHotelInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hotel_info')); } catch { return null; }
  });

  const login = async (email, password) => {
    const res = await fetch(`${API}/api/hotel/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Erreur de connexion');
    localStorage.setItem('hotel_token', data.token);
    localStorage.setItem('hotel_user', JSON.stringify(data.user));
    localStorage.setItem('hotel_info', JSON.stringify(data.hotel));
    setHotelUser(data.user);
    setHotelInfo(data.hotel);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('hotel_token');
    localStorage.removeItem('hotel_user');
    localStorage.removeItem('hotel_info');
    setHotelUser(null);
    setHotelInfo(null);
  };

  const authFetch = useCallback(async (url, opts = {}) => {
    const token = localStorage.getItem('hotel_token');
    return fetch(`${API}${url}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
    });
  }, []);

  const isAuthenticated = !!hotelUser;

  return (
    <HotelAuthContext.Provider value={{ hotelUser, hotelInfo, isAuthenticated, login, logout, authFetch }}>
      {children}
    </HotelAuthContext.Provider>
  );
};
