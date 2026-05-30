import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { LayoutDashboard, FileText, MapPin, Home, Shield, HelpCircle, Search, LogOut, Menu, X, ChevronRight, Users, Car, Building2, BarChart3, Monitor, BookOpen, CreditCard, Mail, Star, Inbox } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/leads', icon: Inbox, label: 'Messages B2B', badgeKey: 'newLeads' },
  { path: '/admin/promo-emails', icon: Mail, label: 'Emails Clients' },
  { path: '/admin/reviews', icon: Star, label: 'Avis Clients' },
  { path: '/admin/partners', icon: Users, label: 'Partenaires' },
  { path: '/admin/rides', icon: Car, label: 'Courses Partenaires' },
  { type: 'divider', label: 'Hotel Kiosk' },
  { path: '/admin/hotels-dashboard', icon: BarChart3, label: 'Dashboard Hotels' },
  { path: '/admin/hotels', icon: Building2, label: 'Gestion Hotels' },
  { path: '/admin/hotel-kiosks', icon: Monitor, label: 'Bornes Tactiles' },
  { path: '/admin/hotel-bookings', icon: BookOpen, label: 'Reservations Hotels' },
  { path: '/admin/hotel-payments', icon: CreditCard, label: 'Paiements Hotels' },
  { type: 'divider', label: 'CMS' },
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
  const [badges, setBadges] = useState({ newLeads: 0 });

  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  // Fetch new leads count periodically (every 60s) for sidebar badge
  useEffect(() => {
    let mounted = true;
    const fetchBadges = async () => {
      try {
        const res = await fetch(`${API}/api/leads`);
        if (!res.ok || !mounted) return;
        const leads = await res.json();
        const newCount = leads.filter(l => l.status === 'new').length;
        if (mounted) setBadges(b => ({ ...b, newLeads: newCount }));
      } catch (_) { /* ignore */ }
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 60000);
    return () => { mounted = false; clearInterval(interval); };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex" data-testid="admin-layout">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-100">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">Z</div>
            <span className="text-gray-900 font-semibold">Zont CMS</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" data-testid="admin-sidebar-nav">
          {navItems.map((item, i) => item.type === 'divider' ? (
            <div key={`div-${i}`} className="pt-4 pb-1 px-3"><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{item.label}</p></div>
          ) : (
            <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive(item) ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
              {item.badgeKey && badges[item.badgeKey] > 0 && (
                <span data-testid={`badge-${item.badgeKey}`} className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {badges[item.badgeKey]}
                </span>
              )}
              {isActive(item) && !item.badgeKey && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-medium">{user?.name?.[0] || 'A'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm truncate">{user?.name}</p>
              <p className="text-gray-400 text-xs truncate">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg text-sm transition" data-testid="admin-logout-btn">
            <LogOut className="w-4 h-4" /><span>Deconnexion</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-900">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-gray-900 font-medium text-sm">{navItems.find(n => isActive(n))?.label || 'Admin'}</h2>
        </header>
        <div className="p-4 lg:p-6"><Outlet /></div>
      </main>
    </div>
  );
};

export default AdminLayout;
