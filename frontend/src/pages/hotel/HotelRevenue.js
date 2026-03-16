import React, { useState, useEffect } from 'react';
import { useHotelAuth } from './HotelAuthContext';
import { toast } from 'sonner';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, Loader2, Calendar, CreditCard, Car } from 'lucide-react';

const HotelRevenue = () => {
  const { authFetch } = useHotelAuth();
  const [data, setData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch('/api/hotel/dashboard').then(r => r.ok ? r.json() : null),
      authFetch('/api/hotel/bookings').then(r => r.ok ? r.json() : []),
    ]).then(([d, b]) => { setData(d); setBookings(b); })
    .catch(() => toast.error('Erreur'))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  if (!data) return <div className="text-gray-400 text-center py-20">Erreur</div>;

  const EvIcon = data.evolution_percent > 0 ? ArrowUpRight : data.evolution_percent < 0 ? ArrowDownRight : Minus;
  const evColor = data.evolution_percent > 0 ? 'text-emerald-600 bg-emerald-50' : data.evolution_percent < 0 ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-gray-50';

  // Monthly breakdown from bookings
  const monthlyMap = {};
  bookings.filter(b => ['completed', 'confirmed', 'assigned'].includes(b.status)).forEach(b => {
    const month = (b.created_at || '').substring(0, 7);
    if (!month) return;
    if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, commission: 0, count: 0 };
    monthlyMap[month].revenue += b.total_price || 0;
    monthlyMap[month].commission += b.hotel_commission || 0;
    monthlyMap[month].count++;
  });
  const monthlyBreakdown = Object.entries(monthlyMap).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12);

  const maxRev = Math.max(...(data.monthly_chart?.map(m => m.revenue) || [1]));

  return (
    <div className="space-y-6" data-testid="hotel-revenue">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenus</h1>
        <p className="text-gray-500 text-sm mt-1">Suivi de vos commissions et revenus mensuels</p>
      </div>

      {/* Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm">
          <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{data.total_revenue.toLocaleString()} EUR</p>
          <p className="text-xs text-gray-500">CA total genere</p>
        </div>
        <div className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm">
          <CreditCard className="w-5 h-5 text-amber-600 mb-2" />
          <p className="text-2xl font-bold text-amber-600">{data.total_commission.toLocaleString()} EUR</p>
          <p className="text-xs text-gray-500">Commission totale ({data.commission_rate}%)</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <Car className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{data.total_bookings}</p>
          <p className="text-xs text-gray-500">Reservations totales</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-bold ${evColor} mb-2`}>
            <EvIcon className="w-4 h-4" />{data.evolution_percent}%
          </div>
          <p className="text-xs text-gray-500">Evolution vs mois precedent</p>
          <p className="text-xs text-gray-400 mt-0.5">Mois en cours: {data.month_revenue.toLocaleString()} EUR</p>
        </div>
      </div>

      {/* Current vs Previous Month */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Comparaison mensuelle</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Mois en cours</p>
            <p className="text-3xl font-bold text-gray-900">{data.month_revenue.toLocaleString()} EUR</p>
            <p className="text-lg font-semibold text-amber-600 mt-1">{data.month_commission.toLocaleString()} EUR comm.</p>
            <p className="text-xs text-gray-400 mt-1">{data.bookings_month} reservations</p>
          </div>
          <div className="text-center border-l border-gray-100">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Mois precedent</p>
            <p className="text-3xl font-bold text-gray-400">{data.prev_month_revenue.toLocaleString()} EUR</p>
            <p className="text-lg font-semibold text-amber-400 mt-1">{Math.round(data.prev_month_revenue * data.commission_rate / 100).toLocaleString()} EUR comm.</p>
            <p className="text-xs text-gray-400 mt-1">{data.bookings_prev_month} reservations</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      {data.monthly_chart?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Evolution des revenus</h2>
          <div className="flex items-end gap-3 h-40">
            {data.monthly_chart.map(m => {
              const comm = Math.round(m.revenue * data.commission_rate / 100);
              return (
                <div key={m._id} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-amber-600 font-semibold">{comm} EUR</span>
                  <span className="text-[10px] text-emerald-600">{Math.round(m.revenue)} EUR</span>
                  <div className="w-full bg-emerald-100 rounded-t-lg overflow-hidden" style={{ height: `${(m.revenue / maxRev) * 100}%`, minHeight: '6px' }}>
                    <div className="w-full h-full bg-gradient-to-t from-emerald-400 to-emerald-200" />
                  </div>
                  <span className="text-[10px] text-gray-500">{m._id}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Breakdown Table */}
      {monthlyBreakdown.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Detail par mois</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="text-left py-2 px-3">Mois</th>
                <th className="text-center py-2 px-3">Reservations</th>
                <th className="text-right py-2 px-3">CA</th>
                <th className="text-right py-2 px-3">Votre commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {monthlyBreakdown.map(([month, d]) => (
                <tr key={month} className="hover:bg-gray-50">
                  <td className="py-2.5 px-3 text-gray-900 font-medium">{month}</td>
                  <td className="py-2.5 px-3 text-center text-gray-600">{d.count}</td>
                  <td className="py-2.5 px-3 text-right text-gray-900 font-medium">{Math.round(d.revenue).toLocaleString()} EUR</td>
                  <td className="py-2.5 px-3 text-right text-amber-600 font-semibold">{Math.round(d.commission).toLocaleString()} EUR</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HotelRevenue;
