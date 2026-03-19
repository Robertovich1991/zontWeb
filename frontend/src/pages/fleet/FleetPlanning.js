import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFleetAuth } from './FleetAuthContext';
import { toast } from 'sonner';
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, MapPin, Clock, User, Filter, X, Plane, Timer, Mountain, UserPlus, AlertTriangle, CheckCircle, UserMinus, RefreshCw, BedDouble } from 'lucide-react';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
const HOUR_WIDTH = 120;
const ROW_HEIGHT = 80;

const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const MONTHS_FR = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

const TYPE_CONFIG = {
  transfer: { label: 'Transfer', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: Plane },
  dispo: { label: 'Dispo', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Timer },
  excursion: { label: 'Excursion', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Mountain },
};

const getType = (t) => TYPE_CONFIG[t] || { label: t, cls: 'bg-gray-100 text-gray-600 border-gray-200', icon: Plane };

const formatDate = (d) => {
  const dt = new Date(d + 'T00:00:00');
  return `${DAYS_FR[dt.getDay()]} ${dt.getDate()}/${dt.getMonth() + 1}`;
};

const FleetPlanning = () => {
  const { authFetch } = useFleetAuth();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('day');
  const [currentDate, setCurrentDate] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  });
  const [planning, setPlanning] = useState(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [driverFilter, setDriverFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const timelineRef = useRef(null);

  // Assignment state (unassigned panel)
  const [assigningBookingId, setAssigningBookingId] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);

  // Event action state (click on assigned event)
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reassignMode, setReassignMode] = useState(false);
  const [reassignDriverId, setReassignDriverId] = useState('');
  const [reassignConflict, setReassignConflict] = useState(null);

  const fetchPlanning = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/fleet/planning?date=${currentDate}&view=${view}`);
      if (res.ok) setPlanning(await res.json());
      else toast.error('Erreur de chargement');
    } catch { toast.error('Erreur de connexion'); }
    finally { setLoading(false); }
  }, [authFetch, currentDate, view]);

  useEffect(() => { fetchPlanning(); }, [fetchPlanning]);

  useEffect(() => {
    if (view === 'day' && timelineRef.current && !loading) {
      const now = new Date();
      const scrollX = Math.max(0, (now.getHours() - 6) * HOUR_WIDTH - 200);
      timelineRef.current.scrollLeft = scrollX;
    }
  }, [view, loading]);

  const formatLocalDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const goToday = () => setCurrentDate(formatLocalDate(new Date()));
  const goPrev = () => {
    const d = new Date(currentDate + 'T12:00:00');
    if (view === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else {
      d.setDate(d.getDate() - (view === 'week' ? 7 : 1));
    }
    setCurrentDate(formatLocalDate(d));
  };
  const goNext = () => {
    const d = new Date(currentDate + 'T12:00:00');
    if (view === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else {
      d.setDate(d.getDate() + (view === 'week' ? 7 : 1));
    }
    setCurrentDate(formatLocalDate(d));
  };

  const getStatusColor = (s) => {
    if (s === 'available') return 'bg-emerald-400';
    if (s === 'busy') return 'bg-amber-400';
    return 'bg-gray-300';
  };
  const getStatusLabel = (s) => {
    if (s === 'available') return 'Disponible';
    if (s === 'busy') return 'Occupe';
    return 'Hors ligne';
  };

  const getEventStyle = (event) => {
    const start = new Date(event.startTime);
    const end = event.endTime ? new Date(event.endTime) : new Date(start.getTime() + 90 * 60000);
    const startH = start.getHours() + start.getMinutes() / 60;
    const endH = end.getHours() + end.getMinutes() / 60;
    const left = Math.max(0, (startH - 6) * HOUR_WIDTH);
    const width = Math.max(HOUR_WIDTH * 0.5, (endH - startH) * HOUR_WIDTH);
    return { left: `${left}px`, width: `${width}px` };
  };

  const getWeekDays = () => {
    if (!planning) return [];
    const start = new Date(planning.dateStart + 'T12:00:00');
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(formatLocalDate(d));
    }
    return days;
  };

  const getMonthDays = () => {
    if (!planning) return [];
    const start = new Date(planning.dateStart + 'T12:00:00');
    const end = new Date(planning.dateEnd + 'T12:00:00');
    const days = [];
    const d = new Date(start);
    while (d <= end) {
      days.push(formatLocalDate(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  };

  const getEventDuration = (event) => {
    const start = new Date(event.startTime);
    const end = event.endTime ? new Date(event.endTime) : new Date(start.getTime() + 90 * 60000);
    const mins = Math.round((end - start) / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h${m > 0 ? m.toString().padStart(2, '0') : ''}` : `${m}min`;
  };

  // Assignment handlers
  const handleStartAssign = (bookingId) => {
    setAssigningBookingId(bookingId);
    setSelectedDriverId('');
    setConflictInfo(null);
  };

  const handleCancelAssign = () => {
    setAssigningBookingId(null);
    setSelectedDriverId('');
    setConflictInfo(null);
  };

  // Extract booking ID from event ID (e.g., "company-uuid" → "uuid")
  const getBookingIdFromEvent = (event) => {
    if (!event || event.source !== 'company') return null;
    return event.id.replace('company-', '');
  };

  const handleEventClick = (event) => {
    if (event.source !== 'company') return; // Only company bookings can be managed
    setSelectedEvent(event);
    setReassignMode(false);
    setReassignDriverId('');
    setReassignConflict(null);
    setHoveredEvent(null);
  };

  const handleCloseEventActions = () => {
    setSelectedEvent(null);
    setReassignMode(false);
    setReassignDriverId('');
    setReassignConflict(null);
  };

  const handleUnassign = async () => {
    const bookingId = getBookingIdFromEvent(selectedEvent);
    if (!bookingId) return;
    setAssignLoading(true);
    try {
      const res = await authFetch(`/api/fleet/my-bookings/${bookingId}/unassign`, { method: 'PUT' });
      if (res.ok) {
        toast.success('Chauffeur retire - mission remise en attente');
        handleCloseEventActions();
        fetchPlanning();
      } else {
        toast.error('Erreur lors du retrait');
      }
    } catch { toast.error('Erreur de connexion'); }
    finally { setAssignLoading(false); }
  };

  const handleReassign = async (force = false) => {
    if (!reassignDriverId) { toast.error('Selectionnez un chauffeur'); return; }
    const bookingId = getBookingIdFromEvent(selectedEvent);
    if (!bookingId) return;
    setAssignLoading(true);
    if (!force) setReassignConflict(null);

    try {
      // Check conflict (skip if forcing)
      if (!force && selectedEvent.startTime && selectedEvent.endTime) {
        const conflictRes = await authFetch('/api/fleet/planning/check-conflict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            driverId: reassignDriverId,
            startTime: selectedEvent.startTime,
            endTime: selectedEvent.endTime,
            excludeBookingId: selectedEvent.id,
          }),
        });
        if (conflictRes.ok) {
          const conflictData = await conflictRes.json();
          if (conflictData.conflict) {
            setReassignConflict(conflictData.message);
            setAssignLoading(false);
            return;
          }
        }
      }

      const driver = drivers.find(d => d.id === reassignDriverId);
      const driverName = `${driver?.firstName || ''} ${driver?.lastName || ''}`.trim();
      const res = await authFetch(`/api/fleet/my-bookings/${bookingId}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: reassignDriverId, driverName }),
      });
      if (res.ok) {
        toast.success(`Mission reassignee a ${driverName}`);
        handleCloseEventActions();
        fetchPlanning();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Erreur');
      }
    } catch { toast.error('Erreur de connexion'); }
    finally { setAssignLoading(false); }
  };

  const handleCheckAndAssign = async (booking, force = false) => {
    if (!selectedDriverId) {
      toast.error('Selectionnez un chauffeur');
      return;
    }
    setAssignLoading(true);
    if (!force) setConflictInfo(null);

    try {
      // Check conflict first (skip if forcing)
      if (!force && booking.startTime && booking.endTime) {
        const conflictRes = await authFetch('/api/fleet/planning/check-conflict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            driverId: selectedDriverId,
            startTime: booking.startTime,
            endTime: booking.endTime,
          }),
        });
        if (conflictRes.ok) {
          const conflictData = await conflictRes.json();
          if (conflictData.conflict) {
            setConflictInfo(conflictData.message);
            setAssignLoading(false);
            return;
          }
        }
      }

      // Assign driver
      const driver = drivers.find(d => d.id === selectedDriverId);
      const driverName = `${driver?.firstName || ''} ${driver?.lastName || ''}`.trim();
      const res = await authFetch(`/api/fleet/my-bookings/${booking.id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: selectedDriverId, driverName }),
      });
      if (res.ok) {
        toast.success(`Mission affectee a ${driverName}`);
        handleCancelAssign();
        fetchPlanning();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Erreur d\'affectation');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setAssignLoading(false);
    }
  };

  // Rest day handlers
  const [restDayLoading, setRestDayLoading] = useState(null);

  const handleToggleRestDay = async (driverId, date) => {
    const driver = planning?.drivers?.find(d => d.id === driverId);
    if (!driver) return;
    const isRest = (driver.restDays || []).includes(date);
    setRestDayLoading(`${driverId}-${date}`);
    try {
      if (isRest) {
        const res = await authFetch(`/api/fleet/planning/rest-day?driverId=${driverId}&date=${date}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Jour de repos retire');
          fetchPlanning();
        } else toast.error('Erreur');
      } else {
        const res = await authFetch('/api/fleet/planning/rest-day', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driverId, date }),
        });
        if (res.ok) {
          toast.success('Jour de repos ajoute');
          fetchPlanning();
        } else toast.error('Erreur');
      }
    } catch { toast.error('Erreur de connexion'); }
    finally { setRestDayLoading(null); }
  };

  const drivers = planning?.drivers || [];
  const unassignedRaw = planning?.unassigned || [];

  // Filter unassigned bookings by source
  const unassigned = sourceFilter === 'all'
    ? unassignedRaw
    : unassignedRaw.filter(b => b.source === (sourceFilter === 'societe' ? 'company' : sourceFilter));

  // Filter drivers and their events by source
  const filteredDrivers = drivers
    .filter(d => driverFilter === 'all' || d.id === driverFilter)
    .map(d => {
      if (sourceFilter === 'all') return d;
      const sourceKey = sourceFilter === 'societe' ? 'company' : sourceFilter;
      return { ...d, events: d.events.filter(e => e.source === sourceKey) };
    });

  if (loading && !planning) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4" data-testid="fleet-planning">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Planning Chauffeurs</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={goToday} data-testid="planning-today-btn"
            className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            Aujourd'hui
          </button>
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setView('day')} data-testid="planning-day-btn"
              className={`px-4 py-2 text-sm font-medium transition ${view === 'day' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              Jour
            </button>
            <button onClick={() => setView('week')} data-testid="planning-week-btn"
              className={`px-4 py-2 text-sm font-medium transition ${view === 'week' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              Semaine
            </button>
            <button onClick={() => setView('month')} data-testid="planning-month-btn"
              className={`px-4 py-2 text-sm font-medium transition ${view === 'month' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              Mois
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={goPrev} className="p-2 hover:bg-gray-100 rounded-lg transition" data-testid="planning-prev">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[130px] text-center" data-testid="planning-date-label">
              {view === 'day'
                ? formatDate(currentDate)
                : view === 'month'
                ? `${MONTHS_FR[new Date(currentDate + 'T12:00:00').getMonth()]} ${new Date(currentDate + 'T12:00:00').getFullYear()}`
                : `${formatDate(planning?.dateStart || currentDate)} - ${formatDate(planning?.dateEnd || currentDate)}`
              }
            </span>
            <button onClick={goNext} className="p-2 hover:bg-gray-100 rounded-lg transition" data-testid="planning-next">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          {/* Source filter - segmented control */}
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden" data-testid="planning-source-switcher">
            {[
              { key: 'all', label: 'Tout' },
              { key: 'societe', label: 'Societe' },
              { key: 'zont', label: 'Zont' },
            ].map(s => (
              <button key={s.key} onClick={() => setSourceFilter(s.key)} data-testid={`source-filter-${s.key}`}
                className={`px-3 py-2 text-sm font-medium transition ${sourceFilter === s.key
                  ? s.key === 'zont' ? 'bg-emerald-600 text-white' : s.key === 'societe' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                  : 'text-gray-600 hover:bg-gray-50'}`}>
                {s.label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowFilters(!showFilters)} data-testid="planning-filter-toggle"
            className={`p-2 rounded-lg transition ${showFilters ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-gray-100 text-gray-500'}`}>
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3" data-testid="planning-filters">
          <select value={driverFilter} onChange={e => setDriverFilter(e.target.value)} data-testid="planning-driver-filter"
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
            <option value="all">Tous les chauffeurs</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
          </select>
          {driverFilter !== 'all' && (
            <button onClick={() => setDriverFilter('all')}
              className="px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded-lg">Effacer</button>
          )}
          <div className="flex items-center gap-4 ml-auto text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Zont</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Societe</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Disponible</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Occupe</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-300 inline-block" /> Hors ligne</span>
          </div>
        </div>
      )}

      {/* Unassigned Bookings Panel */}
      {unassigned.length > 0 && (
        <div className="bg-white border-2 border-dashed border-amber-300 rounded-xl shadow-sm overflow-hidden" data-testid="unassigned-panel">
          <div className="bg-amber-50 px-4 py-3 flex items-center justify-between border-b border-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                Missions non affectees ({unassigned.length})
              </span>
              {unassigned.length > 0 && (
                <span className="flex items-center gap-2 ml-2 text-[10px]">
                  {unassigned.filter(b => b.source === 'company').length > 0 && (
                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                      {unassigned.filter(b => b.source === 'company').length} Societe
                    </span>
                  )}
                  {unassigned.filter(b => b.source === 'zont').length > 0 && (
                    <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                      {unassigned.filter(b => b.source === 'zont').length} Zont
                    </span>
                  )}
                </span>
              )}
            </div>
            <span className="text-xs text-amber-600">Affectez un chauffeur pour planifier</span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
            {unassigned.map(b => {
              const tp = getType(b.type);
              const TypeIcon = tp.icon;
              const isAssigning = assigningBookingId === b.id;
              return (
                <div key={b.id} className="p-3 hover:bg-gray-50/50 transition" data-testid={`unassigned-booking-${b.id}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tp.cls}`}>
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tp.cls}`}>{tp.label}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${b.source === 'zont' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                          {b.source === 'zont' ? 'ZONT' : 'SOCIETE'}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" /> {b.date} {b.time}
                        </span>
                        {b.price > 0 && <span className="text-xs font-semibold text-gray-700">{b.price.toFixed(2)} EUR</span>}
                      </div>
                      {b.pickupAddress && (
                        <div className="flex items-start gap-1 text-xs text-gray-600 mb-0.5">
                          <MapPin className="w-3 h-3 text-blue-500 shrink-0 mt-0.5" />
                          <span className="truncate">{b.pickupAddress}</span>
                        </div>
                      )}
                      {b.dropoffAddress && (
                        <div className="flex items-start gap-1 text-xs text-gray-500 mb-0.5">
                          <MapPin className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                          <span className="truncate">{b.dropoffAddress}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {b.clientName && <span className="flex items-center gap-1"><User className="w-3 h-3" />{b.clientName}</span>}
                        {b.flightNumber && <span className="flex items-center gap-1"><Plane className="w-3 h-3" />{b.flightNumber}</span>}
                        {b.passengers > 0 && <span>{b.passengers} pax</span>}
                        {b.hours > 0 && <span>{b.hours}h</span>}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {!isAssigning ? (
                        <button
                          onClick={() => handleStartAssign(b.id)}
                          data-testid={`assign-planning-btn-${b.id}`}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Affecter
                        </button>
                      ) : (
                        <div className="flex flex-col gap-1.5 items-end" data-testid={`assign-planning-form-${b.id}`}>
                          <select
                            value={selectedDriverId}
                            onChange={e => { setSelectedDriverId(e.target.value); setConflictInfo(null); }}
                            data-testid={`assign-planning-select-${b.id}`}
                            className="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm text-gray-900 font-medium min-w-[180px]"
                          >
                            <option value="" className="text-gray-400">Chauffeur...</option>
                            {drivers.filter(d => d.isActivated).map(d => (
                              <option key={d.id} value={d.id} className="text-gray-900">{d.firstName} {d.lastName}</option>
                            ))}
                          </select>
                          {conflictInfo && (
                            <div className="flex flex-col gap-1 items-end" data-testid={`assign-conflict-${b.id}`}>
                              <div className="flex items-center gap-1 text-xs text-amber-600 max-w-[220px]">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span>{conflictInfo}</span>
                              </div>
                              <button
                                onClick={() => handleCheckAndAssign(b, true)}
                                disabled={assignLoading}
                                data-testid={`assign-force-btn-${b.id}`}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium disabled:opacity-50 flex items-center gap-1"
                              >
                                {assignLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />}
                                Forcer l'affectation
                              </button>
                            </div>
                          )}
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleCheckAndAssign(b)}
                              disabled={assignLoading || !selectedDriverId}
                              data-testid={`assign-planning-confirm-${b.id}`}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium disabled:opacity-50 flex items-center gap-1"
                            >
                              {assignLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                              OK
                            </button>
                            <button
                              onClick={handleCancelAssign}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Planning Grid */}
      {filteredDrivers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucun chauffeur a afficher</p>
        </div>
      ) : view === 'day' ? (
        /* DAY VIEW */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" data-testid="planning-day-view">
          <div className="flex">
            {/* Driver column (fixed) */}
            <div className="shrink-0 w-[200px] border-r border-gray-200 z-10 bg-white">
              <div className="h-[44px] border-b border-gray-200 bg-gray-50 px-3 flex items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase">Chauffeur</span>
              </div>
              {filteredDrivers.map(d => (
                <div key={d.id} className="flex items-center gap-3 px-3 border-b border-gray-100" style={{ height: ROW_HEIGHT }}>
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
                    {d.firstName?.[0]}{d.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{d.firstName} {d.lastName}</p>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(d.status)}`} />
                      <span className="text-xs text-gray-500">{getStatusLabel(d.status)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline (scrollable) */}
            <div className="flex-1 overflow-x-auto" ref={timelineRef}>
              <div style={{ minWidth: HOURS.length * HOUR_WIDTH }}>
                {/* Hours header */}
                <div className="h-[44px] border-b border-gray-200 bg-gray-50 flex">
                  {HOURS.map(h => (
                    <div key={h} className="border-r border-gray-100 flex items-center justify-center" style={{ width: HOUR_WIDTH }}>
                      <span className="text-xs font-medium text-gray-500">{String(h).padStart(2, '0')}:00</span>
                    </div>
                  ))}
                </div>
                {/* Driver rows */}
                {filteredDrivers.map(d => (
                  <div key={d.id} className="relative border-b border-gray-100 flex" style={{ height: ROW_HEIGHT }} data-testid={`planning-row-${d.id}`}>
                    {HOURS.map(h => (
                      <div key={h} className="border-r border-gray-50 shrink-0" style={{ width: HOUR_WIDTH, height: '100%' }}>
                        {h === new Date().getHours() && currentDate === new Date().toISOString().split('T')[0] && (
                          <div className="absolute top-0 bottom-0 w-px bg-red-400 z-20"
                            style={{ left: `${(new Date().getHours() - 6 + new Date().getMinutes() / 60) * HOUR_WIDTH}px` }} />
                        )}
                      </div>
                    ))}
                    {d.events.map(e => {
                      const style = getEventStyle(e);
                      const isZont = e.source === 'zont';
                      const isSelected = selectedEvent?.id === e.id;
                      return (
                        <div key={e.id}
                          className={`absolute top-2 bottom-2 rounded-lg px-2.5 py-1 cursor-pointer overflow-hidden transition-shadow hover:shadow-lg hover:z-30 ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-blue-300 z-40' : ''} ${isZont ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}
                          style={style}
                          onClick={() => handleEventClick(e)}
                          onMouseEnter={() => !selectedEvent && setHoveredEvent(e)}
                          onMouseLeave={() => setHoveredEvent(null)}
                          data-testid={`event-${e.id}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold whitespace-nowrap">
                              {new Date(e.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              {' - '}
                              {e.endTime ? new Date(e.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            <span className="text-[9px] font-bold opacity-80 uppercase shrink-0">{isZont ? 'ZONT' : 'SOCIETE'}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 opacity-70 shrink-0" />
                            <span className="text-[10px] truncate opacity-90">
                              {e.pickupAddress ? (e.dropoffAddress ? `${e.pickupAddress.split(',')[0]} → ${e.dropoffAddress.split(',')[0]}` : e.pickupAddress.split(',')[0]) : e.type}
                            </span>
                          </div>
                          <span className="text-[9px] opacity-70">{getEventDuration(e)}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : view === 'week' ? (
        /* WEEK VIEW */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" data-testid="planning-week-view">
          <div className="flex">
            <div className="shrink-0 w-[180px] border-r border-gray-200 z-10 bg-white">
              <div className="h-[44px] border-b border-gray-200 bg-gray-50 px-3 flex items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase">Chauffeur</span>
              </div>
              {filteredDrivers.map(d => (
                <div key={d.id} className="flex items-center gap-2 px-3 border-b border-gray-100" style={{ height: ROW_HEIGHT }}>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[10px] font-bold shrink-0">
                    {d.firstName?.[0]}{d.lastName?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{d.firstName} {d.lastName}</p>
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(d.status)}`} />
                      <span className="text-[10px] text-gray-500">{getStatusLabel(d.status)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="h-[44px] border-b border-gray-200 bg-gray-50 flex">
                  {getWeekDays().map(day => {
                    const isToday = day === formatLocalDate(new Date());
                    return (
                      <div key={day} className={`flex-1 flex items-center justify-center border-r border-gray-100 ${isToday ? 'bg-emerald-50' : ''}`}>
                        <span className={`text-xs font-medium ${isToday ? 'text-emerald-700 font-bold' : 'text-gray-500'}`}>{formatDate(day)}</span>
                      </div>
                    );
                  })}
                </div>
                {filteredDrivers.map(d => (
                  <div key={d.id} className="flex border-b border-gray-100" style={{ height: ROW_HEIGHT }}>
                    {getWeekDays().map(day => {
                      const dayEvents = d.events.filter(e => e.startTime.startsWith(day));
                      return (
                        <div key={day} className="flex-1 border-r border-gray-50 p-1 overflow-hidden relative">
                          {dayEvents.map(e => {
                            const isZont = e.source === 'zont';
                            const isSelected = selectedEvent?.id === e.id;
                            return (
                              <div key={e.id}
                                className={`mb-0.5 rounded px-1.5 py-0.5 cursor-pointer text-white text-[9px] truncate ${isSelected ? 'ring-2 ring-offset-1 ring-blue-300' : ''} ${isZont ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                onClick={() => handleEventClick(e)}
                                onMouseEnter={() => !selectedEvent && setHoveredEvent(e)}
                                onMouseLeave={() => setHoveredEvent(null)}
                                data-testid={`week-event-${e.id}`}
                              >
                                <span className="font-bold">
                                  {new Date(e.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {' '}{e.pickupAddress?.split(',')[0] || e.type}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* MONTH VIEW */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" data-testid="planning-month-view">
          {filteredDrivers.map(d => {
            const monthDays = getMonthDays();
            const weeks = [];
            let week = [];
            if (monthDays.length > 0) {
              const firstDow = new Date(monthDays[0] + 'T12:00:00').getDay();
              const startPad = firstDow === 0 ? 6 : firstDow - 1;
              for (let i = 0; i < startPad; i++) week.push(null);
            }
            monthDays.forEach(day => {
              week.push(day);
              if (week.length === 7) { weeks.push(week); week = []; }
            });
            if (week.length > 0) {
              while (week.length < 7) week.push(null);
              weeks.push(week);
            }

            return (
              <div key={d.id} className="border-b border-gray-200 last:border-b-0" data-testid={`month-driver-${d.id}`}>
                <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-bold">
                    {d.firstName?.[0]}{d.lastName?.[0]}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{d.firstName} {d.lastName}</span>
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(d.status)}`} />
                  <span className="text-xs text-gray-400 ml-auto">{d.events.length} course{d.events.length !== 1 ? 's' : ''}</span>
                </div>
                <div>
                  {/* Day headers */}
                  <div className="grid grid-cols-7 border-b border-gray-100">
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                      <div key={day} className="text-center py-1.5 text-[10px] font-semibold text-gray-400 uppercase">{day}</div>
                    ))}
                  </div>
                  {/* Weeks */}
                  {weeks.map((w, wi) => (
                    <div key={wi} className="grid grid-cols-7 border-b border-gray-50">
                      {w.map((day, di) => {
                        if (!day) return <div key={di} className="min-h-[60px] bg-gray-50/50 border-r border-gray-50" />;
                        const dayNum = parseInt(day.split('-')[2]);
                        const isToday = day === formatLocalDate(new Date());
                        const dayEvents = d.events.filter(e => e.startTime.startsWith(day));
                        const isRestDay = (d.restDays || []).includes(day);
                        const isLoadingRest = restDayLoading === `${d.id}-${day}`;
                        return (
                          <div key={di}
                            className={`min-h-[60px] border-r border-gray-50 p-1 relative group cursor-pointer ${isRestDay ? 'bg-red-50' : isToday ? 'bg-emerald-50/50' : 'hover:bg-gray-50/80'}`}
                            onClick={(e) => {
                              if (e.target.closest('[data-event-block]')) return;
                              handleToggleRestDay(d.id, day);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-medium ${isRestDay ? 'text-red-500 font-bold' : isToday ? 'text-emerald-700 font-bold' : 'text-gray-400'}`}>
                                {dayNum}
                              </span>
                              {isLoadingRest && <Loader2 className="w-2.5 h-2.5 text-gray-400 animate-spin" />}
                            </div>
                            {isRestDay && (
                              <div className="flex items-center gap-0.5 bg-red-100 text-red-600 rounded px-1 py-0.5 text-[8px] font-semibold mb-0.5" data-testid={`rest-day-${d.id}-${day}`}>
                                <BedDouble className="w-2.5 h-2.5" /> Repos
                              </div>
                            )}
                            {dayEvents.slice(0, isRestDay ? 2 : 3).map(e => {
                              const isZont = e.source === 'zont';
                              return (
                                <div key={e.id} data-event-block="true"
                                  className={`mb-0.5 rounded px-1 py-0.5 cursor-pointer text-white text-[8px] truncate ${isZont ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                  onClick={() => handleEventClick(e)}
                                  onMouseEnter={() => !selectedEvent && setHoveredEvent(e)}
                                  onMouseLeave={() => setHoveredEvent(null)}
                                >
                                  <span className="font-bold">
                                    {new Date(e.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {' '}{e.pickupAddress?.split(',')[0]?.substring(0, 15) || e.type}
                                </div>
                              );
                            })}
                            {dayEvents.length > (isRestDay ? 2 : 3) && (
                              <div className="text-[8px] text-gray-400 text-center">+{dayEvents.length - (isRestDay ? 2 : 3)}</div>
                            )}
                            {!isRestDay && dayEvents.length === 0 && (
                              <div className="hidden group-hover:flex items-center justify-center absolute inset-0 top-4">
                                <span className="text-[8px] text-gray-300">cliquez = repos</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hover tooltip (only when no event selected) */}
      {hoveredEvent && !selectedEvent && (
        <div className="fixed bottom-20 right-4 bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50 w-[300px]" data-testid="event-tooltip">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${hoveredEvent.source === 'zont' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
              {hoveredEvent.source === 'zont' ? 'ZONT' : 'SOCIETE'}
            </span>
            <span className="text-xs text-gray-500">{hoveredEvent.type}</span>
            <span className="text-xs text-gray-400 ml-auto">{getEventDuration(hoveredEvent)}</span>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-700">
                {new Date(hoveredEvent.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                {hoveredEvent.endTime && ` → ${new Date(hoveredEvent.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </div>
            {hoveredEvent.pickupAddress && (
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
                <span className="text-gray-700">{hoveredEvent.pickupAddress}</span>
              </div>
            )}
            {hoveredEvent.dropoffAddress && (
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400 mt-0.5" />
                <span className="text-gray-700">{hoveredEvent.dropoffAddress}</span>
              </div>
            )}
            {hoveredEvent.clientName && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-700">{hoveredEvent.clientName}</span>
              </div>
            )}
            {hoveredEvent.price > 0 && <p className="text-gray-900 font-semibold text-right">{hoveredEvent.price.toFixed(2)} EUR</p>}
          </div>
          {hoveredEvent.source === 'company' && (
            <p className="text-[10px] text-gray-400 mt-2 text-center">Cliquez pour gerer cette mission</p>
          )}
        </div>
      )}

      {/* Event Action Panel (click on assigned company event) */}
      {selectedEvent && (
        <div className="fixed bottom-20 right-4 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 w-[340px] overflow-hidden" data-testid="event-action-panel">
          {/* Header */}
          <div className={`px-4 py-3 flex items-center justify-between ${selectedEvent.source === 'zont' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
            <div className="flex items-center gap-2 text-white">
              <span className="text-xs font-bold uppercase">{selectedEvent.source === 'zont' ? 'ZONT' : 'SOCIETE'}</span>
              <span className="text-xs opacity-80">{selectedEvent.type}</span>
            </div>
            <button onClick={handleCloseEventActions} className="text-white/70 hover:text-white transition" data-testid="close-event-panel">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Details */}
          <div className="p-4 space-y-2 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-700">
                {new Date(selectedEvent.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                {selectedEvent.endTime && ` → ${new Date(selectedEvent.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
              </span>
              <span className="text-xs text-gray-400 ml-auto">{getEventDuration(selectedEvent)}</span>
            </div>
            {selectedEvent.pickupAddress && (
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
                <span className="text-gray-700 text-xs">{selectedEvent.pickupAddress}</span>
              </div>
            )}
            {selectedEvent.dropoffAddress && (
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-400 mt-0.5" />
                <span className="text-gray-700 text-xs">{selectedEvent.dropoffAddress}</span>
              </div>
            )}
            {selectedEvent.clientName && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-700 text-xs">{selectedEvent.clientName}</span>
              </div>
            )}
            {selectedEvent.price > 0 && <p className="text-gray-900 font-semibold">{selectedEvent.price.toFixed(2)} EUR</p>}
          </div>

          {/* Actions - only for company bookings */}
          {selectedEvent.source === 'company' && (
            <div className="border-t border-gray-100 p-4 space-y-3">
              {!reassignMode ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleUnassign}
                    disabled={assignLoading}
                    data-testid="event-unassign-btn"
                    className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {assignLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                    Desaffecter
                  </button>
                  <button
                    onClick={() => setReassignMode(true)}
                    data-testid="event-reassign-btn"
                    className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reaffecter
                  </button>
                </div>
              ) : (
                <div className="space-y-2" data-testid="event-reassign-form">
                  <p className="text-xs text-gray-500 font-medium">Choisir un nouveau chauffeur :</p>
                  <select
                    value={reassignDriverId}
                    onChange={e => { setReassignDriverId(e.target.value); setReassignConflict(null); }}
                    data-testid="event-reassign-select"
                    className="w-full px-3 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-sm text-gray-900 font-medium"
                  >
                    <option value="" className="text-gray-400">Selectionner un chauffeur...</option>
                    {drivers.filter(d => d.isActivated).map(d => (
                      <option key={d.id} value={d.id} className="text-gray-900">{d.firstName} {d.lastName}</option>
                    ))}
                  </select>
                  {reassignConflict && (
                    <div data-testid="event-reassign-conflict">
                      <div className="flex items-center gap-1 text-xs text-amber-600 mb-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{reassignConflict}</span>
                      </div>
                      <button
                        onClick={() => handleReassign(true)}
                        disabled={assignLoading}
                        data-testid="event-reassign-force-btn"
                        className="w-full px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {assignLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />}
                        Forcer la reaffectation
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReassign(false)}
                      disabled={assignLoading || !reassignDriverId}
                      data-testid="event-reassign-confirm"
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {assignLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Confirmer
                    </button>
                    <button
                      onClick={() => { setReassignMode(false); setReassignDriverId(''); setReassignConflict(null); }}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium"
                    >
                      Retour
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info for Zont events */}
          {selectedEvent.source === 'zont' && (
            <div className="border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-400 text-center">Les reservations Zont se gerent depuis le reseau Zont</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FleetPlanning;
