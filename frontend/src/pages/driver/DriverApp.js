import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DriverAuthProvider, useDriverAuth } from './DriverAuthContext';
import DriverLogin from './DriverLogin';
import DriverLayout from './DriverLayout';
import DriverMissions from './DriverMissions';
import DriverHistory from './DriverHistory';
import DriverProfile from './DriverProfile';

const DriverGuard = ({ children }) => {
  const { driver, loading } = useDriverAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F1117' }}>
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!driver) return <Navigate to="/driver/login" replace />;
  return children;
};

const DriverApp = () => (
  <DriverAuthProvider>
    <Routes>
      <Route path="/login" element={<DriverLogin />} />
      <Route path="/" element={<DriverGuard><DriverLayout /></DriverGuard>}>
        <Route index element={<Navigate to="/driver/missions" replace />} />
        <Route path="missions" element={<DriverMissions />} />
        <Route path="history" element={<DriverHistory />} />
        <Route path="profile" element={<DriverProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/driver/missions" replace />} />
    </Routes>
  </DriverAuthProvider>
);

export default DriverApp;
