import React from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useDriverAuth } from './DriverAuthContext';
import { CalendarCheck, Clock, User, Loader2 } from 'lucide-react';

export default function DriverLayout() {
  const { driver, loading } = useDriverAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F1117' }}>
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!driver) return <Navigate to="/driver/login" replace />;

  const tabs = [
    { to: '/driver/missions', icon: CalendarCheck, label: 'Missions' },
    { to: '/driver/history', icon: Clock, label: 'Historique' },
    { to: '/driver/profile', icon: User, label: 'Profil' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0F1117' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#262A36' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.18l6 3.75v7.14l-6 3.75-6-3.75V7.93l6-3.75z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">Zont Driver</span>
        </div>
        <div className="flex items-center gap-2">
          {driver?.driverType === 'csharp' && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">ZONT</span>
          )}
          <span className="text-gray-400 text-xs">{driver?.firstName}</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 border-t flex" style={{ background: '#13151E', borderColor: '#262A36' }}>
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={`driver-tab-${label.toLowerCase()}`}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors ${isActive ? 'text-emerald-400' : 'text-gray-500'}`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
