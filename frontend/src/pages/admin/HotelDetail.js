import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Users, CreditCard, Car, Wifi, WifiOff, Calendar, TrendingUp, Loader2, Pencil } from 'lucide-react';

const HotelDetail = ({ hotelId, onBack }) => {
  const { authFetch } = useAdminAuth();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`/api/admin/hotels/${hotelId}`);
        if (res.ok) setHotel(await res.json());
        else toast.error('Hotel introuvable');
      } catch { toast.error('Erreur'); }
      finally { setLoading(false); }
    })();
  }, [hotelId]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  if (!hotel) return <div className="text-slate-400 text-center py-20">Hotel introuvable</div>;

  const statCards = [
    { label: 'Reservations', value: hotel.total_bookings, icon: Car, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'CA Total', value: `${hotel.total_revenue?.toLocaleString()} EUR`, icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Comm. Hotel', value: `${hotel.hotel_commission_total?.toLocaleString()} EUR`, icon: Building2, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Comm. Zont', value: `${hotel.zont_commission_total?.toLocaleString()} EUR`, icon: CreditCard, color: 'text-purple-400 bg-purple-500/10' },
  ];

  const statusColors = { pending: 'text-yellow-400', confirmed: 'text-blue-400', assigned: 'text-cyan-400', completed: 'text-emerald-400', cancelled: 'text-red-400' };

  return (
    <div className="space-y-6" data-testid="hotel-detail">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition" data-testid="hotel-detail-back">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Building2 className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">{hotel.name}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{hotel.city}, {hotel.country}</span>
              {hotel.hotel_group && <span className="text-slate-600">|</span>}
              {hotel.hotel_group && <span>{hotel.hotel_group}</span>}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${hotel.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {hotel.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4" data-testid={`stat-${s.label}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center`}><s.icon className="w-4 h-4" /></div>
            </div>
            <p className="text-xl font-semibold text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Info + Commission */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Contact</h2>
          <div className="space-y-3">
            {[
              { icon: Users, label: hotel.contact_name, sub: hotel.contact_role },
              { icon: Phone, label: hotel.contact_phone },
              { icon: Mail, label: hotel.contact_email },
              { icon: MapPin, label: `${hotel.address}, ${hotel.postal_code} ${hotel.city}` },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <item.icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <div>
                  <p className="text-white">{item.label || '-'}</p>
                  {item.sub && <p className="text-slate-500 text-xs">{item.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Commission</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Taux hotel</span>
              <span className="text-amber-400 font-bold text-lg">{hotel.commission_rate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Taux Zont</span>
              <span className="text-emerald-400 font-bold text-lg">{hotel.zont_commission_rate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Part chauffeur</span>
              <span className="text-white font-bold text-lg">{(100 - hotel.commission_rate - hotel.zont_commission_rate).toFixed(1)}%</span>
            </div>
            <hr className="border-slate-700" />
            <p className="text-xs text-slate-500">Chambres: {hotel.rooms} | Bornes prevues: {hotel.kiosks_planned}</p>
          </div>
        </div>
      </div>

      {/* Kiosks */}
      {hotel.kiosks?.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Bornes tactiles</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {hotel.kiosks.map(k => (
              <div key={k.id} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3">
                {k.status === 'online' ? <Wifi className="w-5 h-5 text-emerald-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{k.name}</p>
                  <p className="text-slate-500 text-xs">{k.location}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${k.status === 'online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {k.status === 'online' ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Reservations recentes</h2>
        {hotel.recent_bookings?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-wider">
                  <th className="text-left py-2 px-3">ID</th>
                  <th className="text-left py-2 px-3">Client</th>
                  <th className="text-left py-2 px-3 hidden md:table-cell">Service</th>
                  <th className="text-right py-2 px-3">Prix</th>
                  <th className="text-right py-2 px-3 hidden lg:table-cell">Comm. Hotel</th>
                  <th className="text-center py-2 px-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {hotel.recent_bookings.map(b => {
                  const hComm = round(b.total_price * hotel.commission_rate / 100);
                  return (
                    <tr key={b.id} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-slate-400 font-mono text-xs">{b.id}</td>
                      <td className="py-2 px-3 text-white">{b.client_name}</td>
                      <td className="py-2 px-3 text-slate-300 hidden md:table-cell">{b.service_type}</td>
                      <td className="py-2 px-3 text-right text-white font-medium">{b.total_price} EUR</td>
                      <td className="py-2 px-3 text-right text-amber-400 hidden lg:table-cell">{hComm} EUR</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-xs font-medium ${statusColors[b.status] || 'text-slate-400'}`}>{b.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-500 text-sm text-center py-6">Aucune reservation</p>
        )}
      </div>
    </div>
  );
};

const round = (n) => Math.round(n * 100) / 100;

export default HotelDetail;
