import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { LayoutDashboard, FileText, MapPin, Home, Shield, HelpCircle, Search, LogOut, Menu, X, ChevronRight } from 'lucide-react';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/pages', icon: FileText, label: 'Pages SEO' },
  { path: '/admin/places', icon: MapPin, label: 'Lieux / Destinations' },
  { path: '/admin/homepage', icon: Home, label: 'Homepage' },
  { path: '/admin/trust-blocks', icon: Shield, label: 'Blocs de confiance' },
  { path: '/admin/faqs', icon: HelpCircle, label: 'FAQ' },
  { path: '/admin/seo', icon: Search, label: 'SEO Overview' },
];

const AdminLayout = () => {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <div className="min-h-screen bg-slate-950 flex" data-testid="admin-layout">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-slate-950 font-bold text-sm">Z</div>
            <span className="text-white font-semibold">Zont CMS</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" data-testid="admin-sidebar-nav">
          {navItems.map(item => (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive(item) ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {isActive(item) && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-white">{user?.name?.[0] || 'A'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{user?.name}</p>
              <p className="text-slate-500 text-xs truncate">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg text-sm transition" data-testid="admin-logout-btn">
            <LogOut className="w-4 h-4" /><span>Deconnexion</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur border-b border-slate-800 px-4 lg:px-6 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-white font-medium text-sm">{navItems.find(n => isActive(n))?.label || 'Admin'}</h2>
        </header>
        <div className="p-4 lg:p-6"><Outlet /></div>
      </main>
    </div>
  );
};

export default AdminLayout;
