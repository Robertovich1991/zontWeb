import React, { useState, useEffect, useCallback } from 'react';
import { Car, Loader2, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-400', icon: Clock },
  accepted: { label: 'Acceptee', color: 'bg-green-500/10 text-green-400', icon: CheckCircle },
  rejected: { label: 'Refusee', color: 'bg-red-500/10 text-red-400', icon: XCircle },
  completed: { label: 'Terminee', color: 'bg-blue-500/10 text-blue-400', icon: CheckCircle },
  cancelled: { label: 'Annulee', color: 'bg-slate-500/10 text-slate-400', icon: AlertCircle },
};

const RidesManager = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');

  const token = localStorage.getItem('admin_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchRides = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/partner/admin/rides`, { headers });
      if (res.ok) setRides(await res.json());
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRides(); }, [fetchRides]);

  const updateStatus = async (rideId, status) => {
    await fetch(`${API}/api/partner/admin/rides/${rideId}`, {
      method: 'PUT', headers, body: JSON.stringify({ status }),
    });
    fetchRides();
  };

  const updateNotes = async (rideId, notes) => {
    await fetch(`${API}/api/partner/admin/rides/${rideId}`, {
      method: 'PUT', headers, body: JSON.stringify({ admin_notes: notes }),
    });
  };

  const filtered = filter === 'all' ? rides : rides.filter(r => r.status === filter);

  return (
    <div data-testid="rides-manager">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Car className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-bold text-white">Courses Partenaires</h1>
          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full">{rides.length}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'accepted', 'rejected', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
              {f === 'all' ? 'Toutes' : statusConfig[f]?.label || f}
              {f === 'pending' && rides.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-1 bg-yellow-500 text-slate-950 rounded-full px-1.5 text-xs">{rides.filter(r => r.status === 'pending').length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-amber-400 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">Aucune course</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ride => {
            const sc = statusConfig[ride.status] || statusConfig.pending;
            const StatusIcon = sc.icon;
            const expanded = expandedId === ride.id;
            return (
              <div key={ride.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden" data-testid={`ride-${ride.id}`}>
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/50 transition" onClick={() => setExpandedId(expanded ? null : ride.id)}>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${sc.color}`}>
                      <StatusIcon className="w-3 h-3" />{sc.label}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-sm font-medium truncate">{ride.pickup_address} → {ride.dropoff_address}</div>
                      <div className="text-slate-500 text-xs mt-0.5">Par {ride.partner_name} {ride.partner_company ? `(${ride.partner_company})` : ''} - {new Date(ride.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold text-sm">{ride.proposed_price} {ride.currency}</span>
                    <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded">{ride.vehicle_category_name}</span>
                    {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
                {expanded && (
                  <div className="border-t border-slate-800 p-4 bg-slate-900/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-slate-500">Depart:</span> <span className="text-white ml-1">{ride.pickup_address}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Arrivee:</span> <span className="text-white ml-1">{ride.dropoff_address}</span>
                      </div>
                      {ride.passenger_name && <div><span className="text-slate-500">Passager:</span> <span className="text-white ml-1">{ride.passenger_name}</span></div>}
                      {ride.passenger_phone && <div><span className="text-slate-500">Tel passager:</span> <span className="text-white ml-1">{ride.passenger_phone}</span></div>}
                      {ride.pickup_datetime && <div><span className="text-slate-500">Date/Heure:</span> <span className="text-white ml-1">{ride.pickup_datetime}</span></div>}
                      {ride.flight_number && <div><span className="text-slate-500">Vol:</span> <span className="text-white ml-1">{ride.flight_number}</span></div>}
                      {ride.notes && <div className="md:col-span-2"><span className="text-slate-500">Notes:</span> <span className="text-white ml-1">{ride.notes}</span></div>}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['pending', 'accepted', 'rejected', 'completed', 'cancelled'].map(s => (
                        <button key={s} onClick={() => updateStatus(ride.id, s)} disabled={ride.status === s}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${ride.status === s ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                          {statusConfig[s]?.label || s}
                        </button>
                      ))}
                    </div>
                    <textarea placeholder="Notes admin..." defaultValue={ride.admin_notes || ''}
                      onBlur={(e) => updateNotes(ride.id, e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm resize-none" rows={2} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RidesManager;
