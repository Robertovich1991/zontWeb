import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'sonner';
import { Building2, Wifi, WifiOff, Car, TrendingUp, CreditCard, Calendar, Loader2 } from 'lucide-react';

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
  if (!stats) return <div className="text-gray-400 text-center py-20">Erreur de chargement</div>;

  const cards = [
    { label: 'Hotels', value: stats.total_hotels, sub: `${stats.active_hotels} actifs`, icon: Building2, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Bornes', value: stats.total_kiosks, sub: `${stats.kiosks_online} en ligne`, icon: Wifi, color: 'text-cyan-600 bg-cyan-50', border: 'border-cyan-100' },
    { label: 'Reservations mois', value: stats.bookings_month, sub: `${stats.bookings_today} aujourd'hui`, icon: Car, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
    { label: 'CA Total', value: `${stats.total_revenue.toLocaleString()} EUR`, sub: `${stats.total_bookings} courses`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Comm. Hotels', value: `${stats.total_hotel_commissions.toLocaleString()} EUR`, icon: Building2, color: 'text-amber-600 bg-amber-50', border: 'border-amber-100' },
    { label: 'Revenus Zont', value: `${stats.total_zont_commissions.toLocaleString()} EUR`, icon: CreditCard, color: 'text-purple-600 bg-purple-50', border: 'border-purple-100' },
  ];

  const maxRev = Math.max(...(stats.monthly_revenue?.map(m => m.revenue) || [1]));

  return (
    <div className="min-h-screen bg-gray-50 -m-4 lg:-m-6 p-4 lg:p-6 space-y-6" data-testid="hotels-dashboard">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Hotels</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble du programme Hotel Kiosk</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`bg-white border ${c.border} rounded-xl p-4 shadow-sm`} data-testid={`dash-stat-${c.label}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center`}>
                <c.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
            {c.sub && <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      {stats.monthly_revenue?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Revenus mensuels</h2>
          <div className="flex items-end gap-3 h-40">
            {stats.monthly_revenue.map(m => (
              <div key={m._id} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-emerald-600 font-semibold">{Math.round(m.revenue)} EUR</span>
                <div className="w-full bg-emerald-100 rounded-t-lg relative overflow-hidden" style={{ height: `${(m.revenue / maxRev) * 100}%`, minHeight: '8px' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-400 to-emerald-200" />
                </div>
                <span className="text-xs text-gray-500 font-medium">{m._id}</span>
                <span className="text-[10px] text-gray-400">{m.count} res.</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Hotels Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Classement Hotels</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
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
            <tbody className="divide-y divide-gray-50">
              {[...hotels].sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0)).map((h, i) => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="py-2.5 px-3 text-gray-400 font-mono">{i + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-gray-900 font-medium truncate">{h.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600 hidden md:table-cell">{h.city}</td>
                  <td className="py-2.5 px-3 text-center text-gray-900 font-medium">{h.total_bookings}</td>
                  <td className="py-2.5 px-3 text-right text-gray-900 font-medium">{h.total_revenue?.toLocaleString()} EUR</td>
                  <td className="py-2.5 px-3 text-center hidden lg:table-cell">
                    <span className="text-amber-600">{h.commission_rate}%</span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className="text-emerald-600">{h.zont_commission_rate}%</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-600 hidden lg:table-cell">{h.hotel_commission_total?.toLocaleString()} EUR</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">{h.zont_commission_total?.toLocaleString()} EUR</td>
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
