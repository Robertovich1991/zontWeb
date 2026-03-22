import React, { useState } from 'react';
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useGpsAdmin } from './GpsAdminAuthContext';
import { Navigation, LayoutDashboard, Router, Building2, Map, LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/gps-admin/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/gps-admin/devices',   label: 'Appareils',   icon: Router },
  { to: '/gps-admin/companies', label: 'Societes',    icon: Building2 },
  { to: '/gps-admin/map',       label: 'Carte globale', icon: Map },
];

const GpsAdminLayout = () => {
  const { isAuthenticated, user, logout } = useGpsAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMap = location.pathname === '/gps-admin/map';

  if (!isAuthenticated) return <Navigate to="/gps-admin/login" replace />;

  const sidebar = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">GPS Admin</p>
            <p className="text-[10px] text-gray-400">{user?.name || 'Admin'}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`
            }>
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <button onClick={logout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 w-full transition">
          <LogOut className="w-4 h-4" /> Deconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-56 shrink-0">{sidebar}</div>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-56">{sidebar}</div>
          <div className="flex-1 bg-black/30" onClick={() => setSidebarOpen(false)} />
        </div>
      )}
      <main className="flex-1 min-w-0 flex flex-col">
        {!isMap && (
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500"><Menu className="w-5 h-5" /></button>
            <h2 className="text-gray-900 font-medium text-sm">{navItems.find(n => location.pathname.startsWith(n.to))?.label || 'GPS Admin'}</h2>
          </header>
        )}
        {isMap ? (
          <div className="flex-1 relative">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden fixed top-3 left-3 z-40 p-2 bg-white rounded-lg text-gray-500 shadow-md"><Menu className="w-5 h-5" /></button>
            <Outlet />
          </div>
        ) : (
          <div className="p-4 lg:p-6 flex-1"><Outlet /></div>
        )}
      </main>
    </div>
  );
};

export default GpsAdminLayout;
