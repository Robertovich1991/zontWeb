import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useHotelAuth } from './HotelAuthContext';
import { Building2, BarChart3, BookOpen, DollarSign, Monitor, LogOut, Menu, X, ChevronRight } from 'lucide-react';

const navItems = [
  { path: '/hotel', icon: BarChart3, label: 'Dashboard', exact: true },
  { path: '/hotel/bookings', icon: BookOpen, label: 'Reservations' },
  { path: '/hotel/revenue', icon: DollarSign, label: 'Revenus' },
];

const HotelLayout = () => {
  const { hotelUser, hotelInfo, logout, isAuthenticated } = useHotelAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  const handleLogout = () => { logout(); navigate('/hotel/login'); };

  return (
    <div className="min-h-screen bg-gray-50 flex" data-testid="hotel-layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-56 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{hotelInfo?.name || 'Hotel'}</p>
              <p className="text-[10px] text-gray-400 truncate">{hotelInfo?.city}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive(item) ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
              data-testid={`hotel-nav-${item.label.toLowerCase()}`}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {isActive(item) && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900 truncate">{hotelUser?.name}</p>
            <p className="text-xs text-gray-400 truncate">{hotelUser?.email}</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition" data-testid="hotel-logout-btn">
            <LogOut className="w-4 h-4" /> Deconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600"><Menu className="w-5 h-5" /></button>
          <p className="text-sm font-bold text-gray-900 truncate">{hotelInfo?.name}</p>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HotelLayout;
