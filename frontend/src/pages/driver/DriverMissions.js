import React, { useState, useEffect, useCallback } from 'react';
import { useDriverAuth } from './DriverAuthContext';
import { MapPin, Clock, Calendar, User, Navigation, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function DriverMissions() {
  const { authFetch, driverType } = useDriverAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  const fetchMissions = useCallback(async () => {
    try {
      const res = await authFetch('/api/driver/missions?tab=scheduled');
      const data = await res.json();
      setMissions(data.missions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchMissions(); }, [fetchMissions]);

  const handleAccept = async (auctionId) => {
    setAccepting(auctionId);
    try {
      const res = await authFetch(`/api/driver/missions/${auctionId}/accept`, { method: 'POST' });
      if (res.ok) {
        fetchMissions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAccepting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const zontMissions = missions.filter(m => m.source === 'zont');
  const companyMissions = missions.filter(m => m.source === 'company');

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Stats bar */}
      <div className="flex gap-3">
        <div className="flex-1 px-3 py-2.5 rounded-xl" style={{ background: '#1A1D29' }}>
          <p className="text-gray-500 text-[10px] uppercase tracking-wider">A venir</p>
          <p className="text-white text-lg font-bold">{missions.length}</p>
        </div>
        {driverType === 'csharp' && (
          <div className="flex-1 px-3 py-2.5 rounded-xl" style={{ background: '#1A1D29' }}>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider">Offres Zont</p>
            <p className="text-emerald-400 text-lg font-bold">{zontMissions.filter(m => !m.driverAssigned).length}</p>
          </div>
        )}
        <div className="flex-1 px-3 py-2.5 rounded-xl" style={{ background: '#1A1D29' }}>
          <p className="text-gray-500 text-[10px] uppercase tracking-wider">Societe</p>
          <p className="text-white text-lg font-bold">{companyMissions.length}</p>
        </div>
      </div>

      {/* Zont Offers Section */}
      {driverType === 'csharp' && zontMissions.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
            Offres Zont ({zontMissions.length})
          </h2>
          <div className="space-y-3">
            {zontMissions.map((m) => (
              <MissionCard key={m.id} mission={m} showPrice onAccept={handleAccept} accepting={accepting} />
            ))}
          </div>
        </div>
      )}

      {/* Company Missions Section */}
      {companyMissions.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
            Missions societe ({companyMissions.length})
          </h2>
          <div className="space-y-3">
            {companyMissions.map((m) => (
              <MissionCard key={m.id} mission={m} showPrice={false} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {missions.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: '#1A1D29' }}>
            <Calendar className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400 font-medium">Aucune mission</p>
          <p className="text-gray-600 text-sm mt-1">Pas de missions programmees</p>
        </div>
      )}
    </div>
  );
}

function MissionCard({ mission, showPrice, onAccept, accepting }) {
  const [expanded, setExpanded] = useState(false);
  const m = mission;
  const isZont = m.source === 'zont';
  const isOffer = isZont && !m.driverAssigned;
  const dateStr = formatDate(m.date);

  return (
    <div
      data-testid={`mission-card-${m.id}`}
      className="rounded-xl overflow-hidden transition-all"
      style={{ background: '#1A1D29', border: `1px solid ${isOffer ? '#10B98133' : '#262A36'}` }}
    >
      {/* Card Header */}
      <div className="px-4 pt-3 pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
              isZont ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {isZont ? 'Zont' : 'Societe'}
            </span>
            {m.isMyMission && (
              <span className="text-[10px] font-medium text-amber-400">
                <CheckCircle2 className="w-3 h-3 inline mr-0.5" />Assignee
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Calendar className="w-3 h-3" />
            <span className="text-xs">{dateStr}</span>
            <Clock className="w-3 h-3 ml-1" />
            <span className="text-xs">{m.time}</span>
          </div>
        </div>

        {/* Route */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-2.5">
            <div className="mt-1 w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <p className="text-white text-sm leading-tight truncate">{m.startAddress || '-'}</p>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0" />
            <p className="text-white text-sm leading-tight truncate">{m.endAddress || '-'}</p>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-3 pt-1 border-t" style={{ borderColor: '#262A36' }}>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Client</span>
              <p className="text-white mt-0.5">{m.clientName || '-'}</p>
            </div>
            {m.carType && (
              <div>
                <span className="text-gray-500">Vehicule</span>
                <p className="text-white mt-0.5">{m.carType}</p>
              </div>
            )}
            {showPrice && m.currentPrice > 0 && (
              <div>
                <span className="text-gray-500">Prix</span>
                <p className="text-emerald-400 font-semibold mt-0.5">{m.currentPrice.toFixed(2)} EUR</p>
              </div>
            )}
            {m.isFixedPrice !== undefined && isZont && (
              <div>
                <span className="text-gray-500">Type prix</span>
                <p className="text-white mt-0.5">{m.isFixedPrice ? 'Fixe' : 'Variable'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Accept Button for Zont offers */}
      {isOffer && onAccept && (
        <div className="px-4 pb-3">
          <button
            data-testid={`accept-mission-${m.auctionId}`}
            onClick={() => onAccept(m.auctionId)}
            disabled={accepting === m.auctionId}
            className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: '#10B981' }}
          >
            {accepting === m.auctionId ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span className="text-white">Accepter l'offre</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}
