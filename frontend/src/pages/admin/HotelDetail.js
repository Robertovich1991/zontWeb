import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Users, CreditCard, Car, Wifi, WifiOff, Calendar, TrendingUp, Loader2 } from 'lucide-react';

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
  if (!hotel) return <div className="text-gray-400 text-center py-20">Hotel introuvable</div>;

  const statCards = [
    { label: 'Reservations', value: hotel.total_bookings, icon: Car, color: 'text-blue-600 bg-blue-50', border: 'border-blue-100' },
    { label: 'CA Total', value: `${hotel.total_revenue?.toLocaleString()} EUR`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Comm. Hotel', value: `${hotel.hotel_commission_total?.toLocaleString()} EUR`, icon: Building2, color: 'text-amber-600 bg-amber-50', border: 'border-amber-100' },
    { label: 'Comm. Zont', value: `${hotel.zont_commission_total?.toLocaleString()} EUR`, icon: CreditCard, color: 'text-purple-600 bg-purple-50', border: 'border-purple-100' },
  ];

  const statusColors = { pending: 'text-yellow-600', confirmed: 'text-blue-600', assigned: 'text-cyan-600', completed: 'text-emerald-600', cancelled: 'text-red-500' };

  return (
    <div className="min-h-screen bg-gray-50 -m-4 lg:-m-6 p-4 lg:p-6 space-y-6" data-testid="hotel-detail">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition" data-testid="hotel-detail-back">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-7 h-7 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{hotel.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{hotel.city}, {hotel.country}</span>
            {hotel.hotel_group && <><span className="text-gray-300">|</span><span>{hotel.hotel_group}</span></>}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${hotel.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {hotel.status === 'active' ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className={`bg-white border ${s.border} rounded-xl p-4 shadow-sm`} data-testid={`stat-${s.label}`}>
            <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-2`}><s.icon className="w-4 h-4" /></div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Info + Commission */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Contact</h2>
          <div className="space-y-3">
            {[
              { icon: Users, label: hotel.contact_name, sub: hotel.contact_role },
              { icon: Phone, label: hotel.contact_phone },
              { icon: Mail, label: hotel.contact_email },
              { icon: MapPin, label: `${hotel.address}, ${hotel.postal_code} ${hotel.city}` },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <item.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-900">{item.label || '-'}</p>
                  {item.sub && <p className="text-gray-400 text-xs">{item.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Commission</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Taux hotel</span>
              <span className="text-amber-600 font-bold text-lg">{hotel.commission_rate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Taux Zont</span>
              <span className="text-emerald-600 font-bold text-lg">{hotel.zont_commission_rate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Part chauffeur</span>
              <span className="text-gray-900 font-bold text-lg">{(100 - hotel.commission_rate - hotel.zont_commission_rate).toFixed(1)}%</span>
            </div>
            <hr className="border-gray-100" />
            <p className="text-xs text-gray-400">Chambres: {hotel.rooms} | Bornes prevues: {hotel.kiosks_planned}</p>
          </div>
        </div>
      </div>

      {/* Kiosks */}
      {hotel.kiosks?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Bornes tactiles</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {hotel.kiosks.map(k => (
              <div key={k.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                {k.status === 'online' ? <Wifi className="w-5 h-5 text-emerald-500" /> : <WifiOff className="w-5 h-5 text-red-400" />}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-sm font-medium truncate">{k.name}</p>
                  <p className="text-gray-400 text-xs">{k.location}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${k.status === 'online' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                  {k.status === 'online' ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Reservations recentes</h2>
        {hotel.recent_bookings?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left py-2 px-3">ID</th>
                  <th className="text-left py-2 px-3">Client</th>
                  <th className="text-left py-2 px-3 hidden md:table-cell">Service</th>
                  <th className="text-right py-2 px-3">Prix</th>
                  <th className="text-right py-2 px-3 hidden lg:table-cell">Comm. Hotel</th>
                  <th className="text-center py-2 px-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {hotel.recent_bookings.map(b => {
                  const hComm = round(b.total_price * hotel.commission_rate / 100);
                  return (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-400 font-mono text-xs">{b.id}</td>
                      <td className="py-2 px-3 text-gray-900">{b.client_name}</td>
                      <td className="py-2 px-3 text-gray-600 hidden md:table-cell">{b.service_type}</td>
                      <td className="py-2 px-3 text-right text-gray-900 font-medium">{b.total_price} EUR</td>
                      <td className="py-2 px-3 text-right text-amber-600 hidden lg:table-cell">{hComm} EUR</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-xs font-medium ${statusColors[b.status] || 'text-gray-400'}`}>{b.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-6">Aucune reservation</p>
        )}
      </div>
    </div>
  );
};

const round = (n) => Math.round(n * 100) / 100;

export default HotelDetail;
