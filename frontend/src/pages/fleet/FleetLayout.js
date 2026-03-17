import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useFleetAuth } from './FleetAuthContext';
import { LayoutDashboard, Users, Car, User, LogOut, Menu, X, ChevronRight, Truck } from 'lucide-react';

const navItems = [
  { path: '/fleet', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/fleet/drivers', icon: Users, label: 'Chauffeurs' },
  { path: '/fleet/vehicles', icon: Car, label: 'Vehicules' },
  { path: '/fleet/profile', icon: User, label: 'Mon profil' },
];

const FleetLayout = () => {
  const { company, logout, isAuthenticated } = useFleetAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/fleet/login" replace />;

  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <div className="min-h-screen bg-gray-50 flex" data-testid="fleet-layout">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-100">
          <Link to="/fleet" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-gray-900 font-semibold text-sm block">Zont Fleet</span>
              <span className="text-gray-400 text-[10px]">{company?.companyName || 'Societe'}</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" data-testid="fleet-sidebar-nav">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive(item) ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {isActive(item) && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-medium">
              {company?.firstName?.[0] || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm truncate">{company?.firstName} {company?.lastName}</p>
              <p className="text-gray-400 text-xs truncate">{company?.companyName}</p>
            </div>
          </div>
          <button onClick={logout} data-testid="fleet-logout-btn"
            className="flex items-center gap-2 w-full px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg text-sm transition">
            <LogOut className="w-4 h-4" /><span>Deconnexion</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-900">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-gray-900 font-medium text-sm">{navItems.find(n => isActive(n))?.label || 'Fleet'}</h2>
        </header>
        <div className="p-4 lg:p-6"><Outlet /></div>
      </main>
    </div>
  );
};

export default FleetLayout;
