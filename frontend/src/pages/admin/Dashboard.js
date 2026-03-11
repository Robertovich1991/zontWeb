import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { FileText, MapPin, Shield, HelpCircle, Users, TrendingUp, Eye, PenTool } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { authFetch } = useAdminAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    authFetch('/api/admin/cms/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="text-slate-400">Chargement...</div>;

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Vue d'ensemble du contenu</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Pages" value={stats.pages.total} sub={`${stats.pages.published} publiees, ${stats.pages.draft} brouillons`} color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={MapPin} label="Lieux" value={stats.places.total} sub={`${stats.places.active} actifs`} color="bg-green-500/10 text-green-400" />
        <StatCard icon={Shield} label="Blocs confiance" value={stats.trust_blocks} color="bg-amber-500/10 text-amber-400" />
        <StatCard icon={HelpCircle} label="FAQ" value={stats.faqs} color="bg-purple-500/10 text-purple-400" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-amber-400" />Leads B2B</h3>
          <p className="text-3xl font-bold text-white">{stats.leads}</p>
          <p className="text-slate-400 text-sm mt-1">demandes recues</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" />Actions rapides</h3>
          <div className="space-y-2">
            <a href="/admin/pages" className="flex items-center gap-2 text-slate-300 hover:text-amber-400 text-sm transition"><PenTool className="w-3.5 h-3.5" />Creer une page</a>
            <a href="/admin/places" className="flex items-center gap-2 text-slate-300 hover:text-amber-400 text-sm transition"><MapPin className="w-3.5 h-3.5" />Ajouter un lieu</a>
            <a href="/admin/seo" className="flex items-center gap-2 text-slate-300 hover:text-amber-400 text-sm transition"><Eye className="w-3.5 h-3.5" />Voir le SEO</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
