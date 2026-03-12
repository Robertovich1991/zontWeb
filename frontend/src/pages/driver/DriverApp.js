import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DriverAuthProvider, useDriverAuth } from './DriverAuthContext';
import DriverLogin from './DriverLogin';
import DriverDashboard from './DriverDashboard';
import CreateRide from './CreateRide';
import RideDetail from './RideDetail';
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
      <Route path="/" element={<DriverGuard><DriverDashboard /></DriverGuard>} />
      <Route path="/new-ride" element={<DriverGuard><CreateRide /></DriverGuard>} />
      <Route path="/ride/:id" element={<DriverGuard><RideDetail /></DriverGuard>} />
      <Route path="/profile" element={<DriverGuard><DriverProfile /></DriverGuard>} />
      <Route path="*" element={<Navigate to="/driver" replace />} />
    </Routes>
  </DriverAuthProvider>
);

export default DriverApp;
