import React, { useState, useEffect, useCallback } from 'react';
import { useFleetAuth } from './FleetAuthContext';
import { toast } from 'sonner';
import { Route as RouteIcon, Search, Loader2, MapPin, User, Clock, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const STATUS_MAP = {
  Started: { label: 'En cours', cls: 'bg-amber-50 text-amber-700' },
  Completed: { label: 'Terminee', cls: 'bg-emerald-50 text-emerald-700' },
  Cancelled: { label: 'Annulee', cls: 'bg-red-50 text-red-600' },
};

const getStatus = (s) => STATUS_MAP[s] || { label: s || 'Inconnu', cls: 'bg-gray-100 text-gray-600' };

const FleetTrips = () => {
  const { authFetch } = useFleetAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/fleet/trips?count=50&pageNumber=1');
      const data = res.ok ? await res.json() : [];
      setTrips(Array.isArray(data) ? data : []);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const filtered = trips.filter(t => {
    const q = search.toLowerCase();
    return !q ||
      (t.startAddress || '').toLowerCase().includes(q) ||
      (t.endAddress || '').toLowerCase().includes(q) ||
      (t.driver?.firstName || '').toLowerCase().includes(q) ||
      (t.driver?.lastName || '').toLowerCase().includes(q) ||
      (t.creator?.firstName || '').toLowerCase().includes(q);
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;

  return (
    <div className="space-y-5" data-testid="fleet-trips">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 text-sm mt-1">{trips.length} course{trips.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchTrips} data-testid="refresh-trips-btn"
          className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par adresse, chauffeur, client..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-emerald-500" data-testid="trip-search" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <RouteIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{search ? 'Aucun resultat' : 'Aucune course'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => {
            const st = getStatus(t.status);
            const isExpanded = expandedId === t.id;
            return (
              <div key={t.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" data-testid={`trip-${t.id}`}>
                <div className="p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50/50 transition" onClick={() => setExpandedId(isExpanded ? null : t.id)}>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                    <RouteIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                      <span className="text-xs text-gray-400">{t.carType}</span>
                      <span className="text-xs text-gray-400">#{t.id}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-sm text-gray-700 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="truncate">{t.startAddress || 'Adresse inconnue'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span className="truncate">{t.endAddress || 'Destination inconnue'}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Clock className="w-3 h-3" /> {t.startDate}
                    </div>
                    <p className="text-gray-900 font-semibold">{t.totalAmount?.toFixed(2)} EUR</p>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 mt-1 ml-auto" /> : <ChevronDown className="w-4 h-4 text-gray-400 mt-1 ml-auto" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50" data-testid={`trip-detail-${t.id}`}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400 text-xs block">Chauffeur</span>
                        <span className="text-gray-900 font-medium">
                          {t.driver ? `${t.driver.firstName} ${t.driver.lastName}` : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs block">Client</span>
                        <span className="text-gray-900 font-medium">
                          {t.creator ? `${t.creator.firstName} ${t.creator.lastName}` : '-'}
                        </span>
                        {t.creator?.phone && <span className="text-gray-500 text-xs block">{t.creator.phone}</span>}
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs block">Distance</span>
                        <span className="text-gray-900">{t.totalKM ? `${t.totalKM} km` : '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs block">Duree</span>
                        <span className="text-gray-900">{t.totalTime ? `${t.totalTime} min` : '-'}</span>
                      </div>
                    </div>
                    {t.endDate && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-400 text-xs">Termine le :</span> <span className="text-gray-700">{t.endDate}</span>
                      </div>
                    )}
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

export default FleetTrips;
