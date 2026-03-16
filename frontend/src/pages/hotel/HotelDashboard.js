import React, { useState, useEffect } from 'react';
import { useHotelAuth } from './HotelAuthContext';
import { toast } from 'sonner';
import { Car, TrendingUp, CreditCard, Calendar, Wifi, WifiOff, Loader2, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const HotelDashboard = () => {
  const { authFetch } = useHotelAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/hotel/dashboard').then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => toast.error('Erreur'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  if (!data) return <div className="text-gray-400 text-center py-20">Erreur de chargement</div>;

  const EvIcon = data.evolution_percent > 0 ? ArrowUpRight : data.evolution_percent < 0 ? ArrowDownRight : Minus;
  const evColor = data.evolution_percent > 0 ? 'text-emerald-600' : data.evolution_percent < 0 ? 'text-red-500' : 'text-gray-400';

  const cards = [
    { label: "Reservations aujourd'hui", value: data.bookings_today, icon: Calendar, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
    { label: 'Reservations ce mois', value: data.bookings_month, icon: Car, color: 'text-cyan-600 bg-cyan-50', border: 'border-cyan-100', sub: `${data.bookings_prev_month} le mois dernier` },
    { label: 'CA genere', value: `${data.total_revenue.toLocaleString()} EUR`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Commission totale', value: `${data.total_commission.toLocaleString()} EUR`, icon: CreditCard, color: 'text-amber-600 bg-amber-50', border: 'border-amber-100', sub: `Taux: ${data.commission_rate}%` },
  ];

  const maxRev = Math.max(...(data.monthly_chart?.map(m => m.revenue) || [1]));

  return (
    <div className="space-y-6" data-testid="hotel-dashboard">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bonjour, {data.hotel_name}</h1>
        <p className="text-gray-500 text-sm mt-1">Tableau de bord de votre hotel — {data.hotel_city}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`bg-white border ${c.border} rounded-xl p-4 shadow-sm`}>
            <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center mb-2`}><c.icon className="w-4.5 h-4.5" /></div>
            <p className="text-xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
            {c.sub && <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Monthly Revenue Highlight */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Revenu mensuel</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{data.month_revenue.toLocaleString()} EUR</p>
            <p className="text-xs text-gray-500 mt-1">CA ce mois</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">{data.month_commission.toLocaleString()} EUR</p>
            <p className="text-xs text-gray-500 mt-1">Votre commission</p>
          </div>
          <div className="text-center">
            <div className={`flex items-center justify-center gap-1 ${evColor}`}>
              <EvIcon className="w-5 h-5" />
              <span className="text-2xl font-bold">{data.evolution_percent}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs mois precedent</p>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      {data.monthly_chart?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Evolution des revenus</h2>
          <div className="flex items-end gap-3 h-36">
            {data.monthly_chart.map(m => (
              <div key={m._id} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-emerald-600 font-semibold">{Math.round(m.revenue)} EUR</span>
                <div className="w-full bg-emerald-100 rounded-t-lg overflow-hidden" style={{ height: `${(m.revenue / maxRev) * 100}%`, minHeight: '6px' }}>
                  <div className="w-full h-full bg-gradient-to-t from-emerald-400 to-emerald-200" />
                </div>
                <span className="text-[10px] text-gray-500">{m._id}</span>
                <span className="text-[9px] text-gray-400">{m.count} res.</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kiosks */}
      {data.kiosks?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Vos bornes tactiles</h2>
          <div className="space-y-3">
            {data.kiosks.map(k => (
              <div key={k.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                {k.status === 'online' ? <Wifi className="w-5 h-5 text-emerald-500" /> : <WifiOff className="w-5 h-5 text-red-400" />}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-sm font-medium">{k.name}</p>
                  <p className="text-gray-400 text-xs">{k.location}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${k.status === 'online' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {k.status === 'online' ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDashboard;
