import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFleetAuth } from './FleetAuthContext';
import { toast } from 'sonner';
import { Plus, Search, Loader2, MapPin, Clock, User, Send, ChevronDown, ChevronUp, RefreshCw, Plane, Timer, Mountain, XCircle, UserPlus } from 'lucide-react';

const TYPE_CONFIG = {
  transfer: { label: 'Transfer', cls: 'bg-blue-50 text-blue-700', icon: Plane },
  dispo: { label: 'Dispo', cls: 'bg-emerald-50 text-emerald-700', icon: Timer },
  excursion: { label: 'Excursion', cls: 'bg-amber-50 text-amber-700', icon: Mountain },
};
const STATUS_CONFIG = {
  new: { label: 'Nouvelle', cls: 'bg-gray-100 text-gray-600' },
  assigned: { label: 'Affectee', cls: 'bg-blue-50 text-blue-700' },
  sent_to_zont: { label: 'Envoyee Zont', cls: 'bg-purple-50 text-purple-700' },
  in_progress: { label: 'En cours', cls: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Terminee', cls: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Annulee', cls: 'bg-red-50 text-red-600' },
};

const getType = (t) => TYPE_CONFIG[t] || { label: t, cls: 'bg-gray-100 text-gray-600', icon: Plane };
const getStatus = (s) => STATUS_CONFIG[s] || { label: s, cls: 'bg-gray-100 text-gray-600' };

const FleetMyBookings = () => {
  const { authFetch } = useFleetAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, dRes] = await Promise.all([
        authFetch('/api/fleet/my-bookings'),
        authFetch('/api/fleet/drivers'),
      ]);
      setBookings(bRes.ok ? await bRes.json() : []);
      setDrivers((dRes.ok ? await dRes.json() : []).filter(d => d.isActivated));
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (b.pickupAddress || '').toLowerCase().includes(q) ||
      (b.dropoffAddress || '').toLowerCase().includes(q) ||
      (b.tourName || '').toLowerCase().includes(q) ||
      (b.driver?.name || '').toLowerCase().includes(q);
    return matchSearch &&
      (typeFilter === 'all' || b.type === typeFilter) &&
      (statusFilter === 'all' || b.status === statusFilter);
  });

  const handleAssign = async (id) => {
    if (!selectedDriverId) { toast.error('Selectionnez un chauffeur'); return; }
    const driver = drivers.find(d => d.id === selectedDriverId);
    setActionLoading(true);
    try {
      const res = await authFetch(`/api/fleet/my-bookings/${id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: selectedDriverId, driverName: `${driver?.firstName || ''} ${driver?.lastName || ''}`.trim() }),
      });
      if (res.ok) { toast.success('Chauffeur affecte !'); setAssigningId(null); setSelectedDriverId(''); fetchData(); }
      else { const err = await res.json().catch(() => ({})); toast.error(err.detail || 'Erreur'); }
    } catch { toast.error('Erreur'); } finally { setActionLoading(false); }
  };

  const handleUnassign = async (id) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`/api/fleet/my-bookings/${id}/unassign`, { method: 'PUT' });
      if (res.ok) { toast.success('Chauffeur retire'); fetchData(); }
      else { toast.error('Erreur'); }
    } catch { toast.error('Erreur'); } finally { setActionLoading(false); }
  };

  const handleSendToZont = async (id) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`/api/fleet/my-bookings/${id}/send-to-zont`, { method: 'PUT' });
      if (res.ok) { toast.success('Envoye vers Zont pour trouver un chauffeur !'); fetchData(); }
      else { toast.error('Erreur'); }
    } catch { toast.error('Erreur'); } finally { setActionLoading(false); }
  };

  const handleCancel = async (id) => {
    setActionLoading(true);
    try {
      const res = await authFetch(`/api/fleet/my-bookings/${id}/cancel`, { method: 'PUT' });
      if (res.ok) { toast.success('Reservation annulee'); fetchData(); }
      else { toast.error('Erreur'); }
    } catch { toast.error('Erreur'); } finally { setActionLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  return (
    <div className="space-y-5" data-testid="fleet-my-bookings">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Reservations</h1>
          <p className="text-gray-500 text-sm mt-1">{bookings.length} reservation{bookings.length > 1 ? 's' : ''} dans votre planning</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} data-testid="refresh-my-bookings-btn"
            className="px-3 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm transition">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/fleet/my-bookings/new')} data-testid="new-booking-btn"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvelle reservation
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500" data-testid="my-booking-search" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} data-testid="my-booking-type-filter"
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
          <option value="all">Tous types</option>
          <option value="transfer">Transfer</option>
          <option value="dispo">Dispo</option>
          <option value="excursion">Excursion</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} data-testid="my-booking-status-filter"
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
          <option value="all">Tous statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{search || typeFilter !== 'all' || statusFilter !== 'all' ? 'Aucun resultat' : 'Aucune reservation'}</p>
          <button onClick={() => navigate('/fleet/my-bookings/new')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
            Creer votre premiere reservation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const tp = getType(b.type);
            const st = getStatus(b.status);
            const TypeIcon = tp.icon;
            const isExpanded = expandedId === b.id;
            const isAssigning = assigningId === b.id;

            return (
              <div key={b.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" data-testid={`my-booking-${b.id}`}>
                <div className="p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50/50 transition" onClick={() => setExpandedId(isExpanded ? null : b.id)}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${tp.cls}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tp.cls}`}>{tp.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                      {b.sentToZont && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">Zont</span>}
                    </div>
                    {b.pickupAddress && (
                      <div className="flex items-start gap-1.5 text-sm text-gray-700 mb-0.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <span className="truncate">{b.pickupAddress}</span>
                      </div>
                    )}
                    {b.dropoffAddress && (
                      <div className="flex items-start gap-1.5 text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span className="truncate">{b.dropoffAddress}</span>
                      </div>
                    )}
                    {b.type === 'dispo' && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{b.hours}h - {b.vehicleModel || 'Vehicule non specifie'}</span>
                      </div>
                    )}
                    {b.type === 'excursion' && b.tourName && (
                      <div className="text-sm text-gray-600 mt-0.5">Tour: {b.tourName}</div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Clock className="w-3 h-3" /> {b.date} {b.time}
                    </div>
                    {b.price > 0 && <p className="text-gray-900 font-semibold">{b.price.toFixed(2)} EUR</p>}
                    {b.driver && <p className="text-xs text-blue-600 mt-1"><User className="w-3 h-3 inline" /> {b.driver.name}</p>}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 mt-1 ml-auto" /> : <ChevronDown className="w-4 h-4 text-gray-400 mt-1 ml-auto" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-3" data-testid={`my-booking-detail-${b.id}`}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      {b.type === 'transfer' && (
                        <div><span className="text-gray-400 text-xs block">Passagers</span><span className="text-gray-900">{b.passengers}</span></div>
                      )}
                      {(b.type === 'dispo' || b.type === 'excursion') && (
                        <>
                          <div><span className="text-gray-400 text-xs block">Heures</span><span className="text-gray-900">{b.hours}h</span></div>
                          <div><span className="text-gray-400 text-xs block">Vehicule</span><span className="text-gray-900">{b.vehicleModel || '-'}</span></div>
                        </>
                      )}
                      {b.type === 'excursion' && (
                        <>
                          <div><span className="text-gray-400 text-xs block">Tour</span><span className="text-gray-900">{b.tourName || '-'}</span></div>
                          <div><span className="text-gray-400 text-xs block">Guide</span><span className="text-gray-900">{b.guideName || '-'}</span></div>
                        </>
                      )}
                      <div>
                        <span className="text-gray-400 text-xs block">Chauffeur</span>
                        <span className="text-gray-900">{b.driver ? b.driver.name : <span className="text-amber-600 italic">Non affecte</span>}</span>
                      </div>
                    </div>
                    {b.comment && <div className="text-sm"><span className="text-gray-400 text-xs">Note:</span> <span className="text-gray-700">{b.comment}</span></div>}

                    {/* Actions */}
                    {b.status !== 'cancelled' && b.status !== 'completed' && (
                      <div className="border-t border-gray-200 pt-3 flex flex-wrap gap-2">
                        {/* Assign/Change driver */}
                        {!isAssigning ? (
                          <button onClick={(e) => { e.stopPropagation(); setAssigningId(b.id); setSelectedDriverId(''); }}
                            data-testid={`assign-my-btn-${b.id}`}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5">
                            <UserPlus className="w-3.5 h-3.5" /> {b.driver ? 'Changer chauffeur' : 'Affecter chauffeur'}
                          </button>
                        ) : (
                          <div className="flex items-end gap-2 flex-wrap w-full" data-testid={`assign-my-form-${b.id}`}>
                            <select value={selectedDriverId} onChange={e => setSelectedDriverId(e.target.value)}
                              data-testid={`assign-my-select-${b.id}`}
                              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm min-w-[180px]">
                              <option value="">Chauffeur...</option>
                              {drivers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                            </select>
                            <button onClick={(e) => { e.stopPropagation(); handleAssign(b.id); }} disabled={actionLoading}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium disabled:opacity-50">
                              {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirmer'}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setAssigningId(null); }} className="px-2 py-1.5 text-gray-500 text-xs">Annuler</button>
                          </div>
                        )}
                        {/* Unassign */}
                        {b.driver && b.status === 'assigned' && (
                          <button onClick={(e) => { e.stopPropagation(); handleUnassign(b.id); }} disabled={actionLoading}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition">
                            Retirer chauffeur
                          </button>
                        )}
                        {/* Send to Zont */}
                        {!b.sentToZont && (b.status === 'new' || (b.status === 'assigned' && !b.driver)) && (
                          <button onClick={(e) => { e.stopPropagation(); handleSendToZont(b.id); }} disabled={actionLoading}
                            data-testid={`send-zont-btn-${b.id}`}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5" /> Envoyer vers Zont
                          </button>
                        )}
                        {/* Cancel */}
                        <button onClick={(e) => { e.stopPropagation(); handleCancel(b.id); }} disabled={actionLoading}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" /> Annuler
                        </button>
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

export default FleetMyBookings;
