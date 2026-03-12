import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDriverAuth } from './DriverAuthContext';
import { Plus, LogOut, Car, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-400', icon: Clock },
  accepted: { label: 'Acceptee', color: 'bg-green-500/10 text-green-400', icon: CheckCircle },
  rejected: { label: 'Refusee', color: 'bg-red-500/10 text-red-400', icon: XCircle },
  completed: { label: 'Terminee', color: 'bg-blue-500/10 text-blue-400', icon: CheckCircle },
  cancelled: { label: 'Annulee', color: 'bg-gray-500/10 text-gray-400', icon: AlertCircle },
};

const DriverDashboard = () => {
  const { partner, token, logout } = useDriverAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRides = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/partner/rides`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setRides(await res.json());
    } catch {} finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchRides(); }, [fetchRides]);

  const pending = rides.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col" data-testid="driver-dashboard">
      {/* Header */}
      <header className="bg-[#1a2332] border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2ecc71] rounded-lg flex items-center justify-center text-white font-bold text-sm">Z</div>
          <div>
            <p className="text-white text-sm font-semibold">{partner?.name}</p>
            <p className="text-gray-500 text-xs">{partner?.company || 'Partenaire'}</p>
          </div>
        </div>
        <button onClick={logout} className="text-gray-400 hover:text-red-400 transition" data-testid="driver-logout">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Stats */}
      <div className="px-4 pt-5 pb-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1a2332] rounded-xl p-3 text-center border border-gray-800">
            <p className="text-2xl font-bold text-white">{rides.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total</p>
          </div>
          <div className="bg-[#1a2332] rounded-xl p-3 text-center border border-yellow-500/20">
            <p className="text-2xl font-bold text-yellow-400">{pending}</p>
            <p className="text-xs text-gray-400 mt-0.5">En attente</p>
          </div>
          <div className="bg-[#1a2332] rounded-xl p-3 text-center border border-green-500/20">
            <p className="text-2xl font-bold text-green-400">{rides.filter(r => r.status === 'accepted').length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Acceptees</p>
          </div>
        </div>
      </div>

      {/* New Ride CTA */}
      <div className="px-4 py-3">
        <Link to="/driver/new-ride" className="flex items-center justify-center gap-2 bg-[#2ecc71] text-white py-4 rounded-xl font-semibold text-sm hover:bg-[#27ae60] transition-all shadow-lg shadow-[#2ecc71]/20 w-full" data-testid="new-ride-btn">
          <Plus className="w-5 h-5" /> Proposer une Course
        </Link>
      </div>

      {/* Rides List */}
      <div className="px-4 pb-6 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Mes Courses</h2>
          <button onClick={fetchRides} className="text-gray-400 hover:text-[#2ecc71] transition" data-testid="refresh-rides">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading && rides.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#2ecc71] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Aucune course pour le moment</p>
            <p className="text-gray-500 text-xs mt-1">Proposez votre premiere course</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rides.map(ride => {
              const sc = statusConfig[ride.status] || statusConfig.pending;
              const StatusIcon = sc.icon;
              return (
                <div key={ride.id} className="bg-[#1a2332] rounded-xl p-4 border border-gray-800" data-testid={`ride-card-${ride.id}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${sc.color}`}>
                      <StatusIcon className="w-3 h-3" />{sc.label}
                    </div>
                    <span className="text-[#2ecc71] font-bold text-sm">{ride.proposed_price} {ride.currency}</span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                      <span className="text-white">{ride.pickup_address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                      <span className="text-white">{ride.dropoff_address}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-800">
                    <span className="text-xs text-gray-500">{ride.vehicle_category_name}</span>
                    <span className="text-xs text-gray-500">{new Date(ride.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {ride.admin_notes && (
                    <div className="mt-2 p-2 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                      <p className="text-xs text-amber-400">Note admin: {ride.admin_notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
