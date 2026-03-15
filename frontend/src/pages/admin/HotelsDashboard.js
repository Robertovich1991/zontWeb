import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'sonner';
import { Building2, Wifi, WifiOff, Car, TrendingUp, CreditCard, Calendar, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const HotelsDashboard = () => {
  const { authFetch } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch('/api/admin/hotels/dashboard').then(r => r.ok ? r.json() : null),
      authFetch('/api/admin/hotels').then(r => r.ok ? r.json() : []),
    ]).then(([s, h]) => { setStats(s); setHotels(h); })
    .catch(() => toast.error('Erreur chargement'))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  if (!stats) return <div className="text-slate-400 text-center py-20">Erreur de chargement</div>;

  const cards = [
    { label: 'Hotels', value: stats.total_hotels, sub: `${stats.active_hotels} actifs`, icon: Building2, color: 'text-emerald-400 bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Bornes', value: stats.total_kiosks, sub: `${stats.kiosks_online} en ligne`, icon: Wifi, color: 'text-cyan-400 bg-cyan-500/10', border: 'border-cyan-500/20' },
    { label: 'Reservations mois', value: stats.bookings_month, sub: `${stats.bookings_today} aujourd'hui`, icon: Car, color: 'text-blue-400 bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'CA Total', value: `${stats.total_revenue.toLocaleString()} EUR`, sub: `${stats.total_bookings} courses`, icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Comm. Hotels', value: `${stats.total_hotel_commissions.toLocaleString()} EUR`, icon: Building2, color: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Revenus Zont', value: `${stats.total_zont_commissions.toLocaleString()} EUR`, icon: CreditCard, color: 'text-purple-400 bg-purple-500/10', border: 'border-purple-500/20' },
  ];

  // Simple bar chart data
  const maxRev = Math.max(...(stats.monthly_revenue?.map(m => m.revenue) || [1]));

  return (
    <div className="space-y-6" data-testid="hotels-dashboard">
      <div>
        <h1 className="text-2xl font-semibold text-white">Dashboard Hotels</h1>
        <p className="text-slate-400 text-sm mt-1">Vue d'ensemble du programme Hotel Kiosk</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`bg-slate-900/50 border ${c.border} rounded-xl p-4`} data-testid={`dash-stat-${c.label}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center`}>
                <c.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-white">{c.value}</p>
            <p className="text-xs text-slate-400 mt-1">{c.label}</p>
            {c.sub && <p className="text-xs text-slate-500 mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {stats.monthly_revenue?.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Revenus mensuels</h2>
          <div className="flex items-end gap-3 h-40">
            {stats.monthly_revenue.map(m => (
              <div key={m._id} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-emerald-400 font-medium">{Math.round(m.revenue)} EUR</span>
                <div className="w-full bg-emerald-500/20 rounded-t-lg relative overflow-hidden" style={{ height: `${(m.revenue / maxRev) * 100}%`, minHeight: '8px' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/40 to-emerald-500/10" />
                </div>
                <span className="text-xs text-slate-500">{m._id}</span>
                <span className="text-[10px] text-slate-600">{m.count} res.</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Hotels Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Classement Hotels</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left py-2 px-3">#</th>
                <th className="text-left py-2 px-3">Hotel</th>
                <th className="text-left py-2 px-3 hidden md:table-cell">Ville</th>
                <th className="text-center py-2 px-3">Reservations</th>
                <th className="text-right py-2 px-3">CA</th>
                <th className="text-center py-2 px-3 hidden lg:table-cell">Commission</th>
                <th className="text-right py-2 px-3 hidden lg:table-cell">Rev. Hotel</th>
                <th className="text-right py-2 px-3">Rev. Zont</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {[...hotels].sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0)).map((h, i) => (
                <tr key={h.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 text-slate-500 font-mono">{i + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-white font-medium truncate">{h.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 hidden md:table-cell">{h.city}</td>
                  <td className="py-2.5 px-3 text-center text-white">{h.total_bookings}</td>
                  <td className="py-2.5 px-3 text-right text-white font-medium">{h.total_revenue?.toLocaleString()} EUR</td>
                  <td className="py-2.5 px-3 text-center hidden lg:table-cell">
                    <span className="text-amber-400">{h.commission_rate}%</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-emerald-400">{h.zont_commission_rate}%</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-400 hidden lg:table-cell">{h.hotel_commission_total?.toLocaleString()} EUR</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 font-medium">{h.zont_commission_total?.toLocaleString()} EUR</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HotelsDashboard;
