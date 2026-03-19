import React, { useState, useEffect, useCallback } from 'react';
import { useFleetAuth } from './FleetAuthContext';
import { toast } from 'sonner';
import { CalendarClock, Search, Loader2, MapPin, User, Clock, ChevronDown, ChevronUp, Send, RefreshCw } from 'lucide-react';

const STATUS_MAP = {
  ApprovedByAdmin: { label: 'En attente', cls: 'bg-purple-50 text-purple-700' },
  Took: { label: 'Acceptee', cls: 'bg-emerald-50 text-emerald-700' },
  New: { label: 'Nouvelle', cls: 'bg-blue-50 text-blue-700' },
  Confirmed: { label: 'Confirmee', cls: 'bg-emerald-50 text-emerald-700' },
  Started: { label: 'En cours', cls: 'bg-amber-50 text-amber-700' },
  Completed: { label: 'Terminee', cls: 'bg-gray-100 text-gray-600' },
  Cancelled: { label: 'Annulee', cls: 'bg-red-50 text-red-600' },
  CancelledByDriver: { label: 'Annulee (chauffeur)', cls: 'bg-red-50 text-red-600' },
  CancelledByClient: { label: 'Annulee (client)', cls: 'bg-red-50 text-red-600' },
};

const getStatus = (s) => STATUS_MAP[s] || { label: s || 'Inconnu', cls: 'bg-gray-100 text-gray-600' };

const FleetBookings = () => {
  const { authFetch } = useFleetAuth();
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [dispatchingId, setDispatchingId] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [dispatching, setDispatching] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, dRes] = await Promise.all([
        authFetch('/api/fleet/bookings?count=50&pageNumber=1'),
        authFetch('/api/fleet/drivers'),
      ]);
      const bData = bRes.ok ? await bRes.json() : [];
      const dData = dRes.ok ? await dRes.json() : [];
      setBookings(Array.isArray(bData) ? bData : []);
      setDrivers(Array.isArray(dData) ? dData : []);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (b.startAddress || '').toLowerCase().includes(q) ||
      (b.endAddress || '').toLowerCase().includes(q) ||
      (b.client?.firstName || '').toLowerCase().includes(q) ||
      (b.client?.lastName || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDispatch = async (auctionId) => {
    if (!selectedDriverId) { toast.error('Selectionnez un chauffeur'); return; }
    setDispatching(true);
    try {
      const res = await authFetch('/api/fleet/bookings/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: selectedDriverId, auctionId }),
      });
      if (res.ok) {
        toast.success('Chauffeur affecte avec succes !');
        setDispatchingId(null);
        setSelectedDriverId('');
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Erreur lors de l\'affectation');
      }
    } catch { toast.error('Erreur de connexion'); }
    finally { setDispatching(false); }
  };

  const activeDrivers = drivers.filter(d => d.isActivated);
  const statuses = [...new Set(bookings.map(b => b.status))];

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;

  return (
    <div className="space-y-5" data-testid="fleet-bookings">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-500 text-sm mt-1">{bookings.length} reservation{bookings.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={fetchData} data-testid="refresh-bookings-btn"
          className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Actualiser
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par adresse, client..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-emerald-500" data-testid="booking-search" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} data-testid="booking-status-filter"
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
          <option value="all">Tous les statuts</option>
          {statuses.map(s => <option key={s} value={s}>{getStatus(s).label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <CalendarClock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{search || statusFilter !== 'all' ? 'Aucun resultat' : 'Aucune reservation'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const st = getStatus(b.status);
            const isExpanded = expandedId === b.id;
            const isDispatching = dispatchingId === b.id;
            return (
              <div key={b.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" data-testid={`booking-${b.id}`}>
                <div className="p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50/50 transition" onClick={() => setExpandedId(isExpanded ? null : b.id)}>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <CalendarClock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                      <span className="text-xs text-gray-400">{b.carType}</span>
                      <span className="text-xs text-gray-400">#{b.id}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-sm text-gray-700 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="truncate">{b.startAddress || 'Adresse inconnue'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span className="truncate">{b.endAddress || 'Destination inconnue'}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Clock className="w-3 h-3" /> {b.startDate}
                    </div>
                    <p className="text-gray-900 font-semibold">{b.totalAmount?.toFixed(2)} EUR</p>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 mt-1 ml-auto" /> : <ChevronDown className="w-4 h-4 text-gray-400 mt-1 ml-auto" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-3" data-testid={`booking-detail-${b.id}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400 text-xs block">Client</span>
                        <span className="text-gray-900 font-medium">
                          {b.client ? `${b.client.firstName} ${b.client.lastName}` : 'Non renseigne'}
                        </span>
                        {b.client?.phone && <span className="text-gray-500 text-xs block">{b.client.phone}</span>}
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs block">Chauffeur affecte</span>
                        <span className="text-gray-900 font-medium">
                          {b.driver ? `${b.driver.firstName} ${b.driver.lastName}` : <span className="text-amber-600 italic">Non affecte</span>}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-xs block">Type de course</span>
                        <span className="text-gray-900">{b.tripType || '-'}</span>
                      </div>
                    </div>
                    {b.additionalComments && (
                      <div className="text-sm"><span className="text-gray-400 text-xs">Commentaires :</span> <span className="text-gray-700">{b.additionalComments}</span></div>
                    )}

                    {!b.driver && (
                      <div className="border-t border-gray-200 pt-3 mt-2">
                        {!isDispatching ? (
                          <button onClick={(e) => { e.stopPropagation(); setDispatchingId(b.id); }} data-testid={`dispatch-btn-${b.id}`}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2">
                            <Send className="w-4 h-4" /> Affecter un chauffeur
                          </button>
                        ) : (
                          <div className="flex items-end gap-3 flex-wrap" data-testid={`dispatch-form-${b.id}`}>
                            <div className="flex-1 min-w-[200px]">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Chauffeur</label>
                              <select value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)} data-testid={`dispatch-driver-select-${b.id}`}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-emerald-500">
                                <option value="">Selectionnez un chauffeur...</option>
                                {activeDrivers.map(d => (
                                  <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                                ))}
                              </select>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleDispatch(b.id); }} disabled={dispatching} data-testid={`confirm-dispatch-btn-${b.id}`}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50">
                              {dispatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              Confirmer
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setDispatchingId(null); setSelectedDriverId(''); }}
                              className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm">
                              Annuler
                            </button>
                          </div>
                        )}
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

export default FleetBookings;
