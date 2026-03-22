import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFleetAuth } from './FleetAuthContext';
import {
  Search, RefreshCw, Wifi, WifiOff, Clock, Gauge, ChevronRight, X,
  Plus, Loader2, Navigation, Satellite, Power, MapPin, Car, Filter,
  Radio, Settings, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;
const MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;

// ── Status helpers ───────────────────────────────────────────────────
const STATUS_CONFIG = {
  moving:  { color: '#22c55e', pulse: '#22c55e40', label: 'En mouvement', dot: 'bg-green-500' },
  stopped: { color: '#f59e0b', pulse: '#f59e0b40', label: 'A l\'arret',   dot: 'bg-amber-500' },
  offline: { color: '#64748b', pulse: '#64748b40', label: 'Hors ligne',   dot: 'bg-slate-500' },
};

function getVehicleStatus(v) {
  if (!v.lat || !v.lng || !v.timestamp) return 'offline';
  const age = (Date.now() - new Date(v.timestamp).getTime()) / 1000;
  if (age > 600) return 'offline'; // >10min
  if (v.speed > 2) return 'moving';
  return 'stopped';
}

function formatAge(ts) {
  if (!ts) return '--';
  const sec = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (sec < 0) return 'maintenant';
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}min`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}j`;
}

// ── Map Component (Leaflet dark tiles) ───────────────────────────────
const FleetMap = ({ vehicles, selectedImei, onSelect }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const initialFitDone = useRef(false);

  useEffect(() => {
    if (!document.getElementById('leaflet-css-dark')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-dark';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const init = async () => {
      const L = await import('leaflet');
      if (mapInstance.current) return;
      const map = L.map(mapRef.current, {
        center: [43.7, 7.27], zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);
      mapInstance.current = map;
    };
    init();
    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []);

  useEffect(() => {
    const update = async () => {
      const L = await import('leaflet');
      const map = mapInstance.current;
      if (!map) return;

      const valid = vehicles.filter(v => v.lat && v.lng);
      const activeImeis = new Set(valid.map(v => v.imei));

      // Remove markers for vehicles no longer in list
      Object.keys(markersRef.current).forEach(imei => {
        if (!activeImeis.has(imei)) {
          map.removeLayer(markersRef.current[imei]);
          delete markersRef.current[imei];
        }
      });

      valid.forEach(v => {
        const status = getVehicleStatus(v);
        const cfg = STATUS_CONFIG[status];
        const sel = v.imei === selectedImei;
        const sz = sel ? 42 : 32;
        const rotation = v.heading || 0;

        const iconHtml = `
          <div style="width:${sz}px;height:${sz}px;position:relative;transition:all 0.3s ease;">
            ${status === 'moving' ? `<div style="position:absolute;inset:-6px;border-radius:50%;background:${cfg.pulse};animation:pulse-ring 2s infinite;"></div>` : ''}
            <div style="width:100%;height:100%;background:${sel ? '#3b82f6' : '#1e293b'};border:2px solid ${cfg.color};border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.4);transform:rotate(${rotation}deg);transition:transform 0.5s ease;">
              <svg width="${sz * 0.5}" height="${sz * 0.5}" viewBox="0 0 24 24" fill="none" stroke="${cfg.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L4 12l2 1 1 7h10l1-7 2-1z"/>
              </svg>
            </div>
          </div>`;

        const icon = L.divIcon({
          className: '',
          html: iconHtml,
          iconSize: [sz, sz],
          iconAnchor: [sz / 2, sz / 2],
        });

        if (markersRef.current[v.imei]) {
          markersRef.current[v.imei].setLatLng([v.lat, v.lng]);
          markersRef.current[v.imei].setIcon(icon);
        } else {
          const marker = L.marker([v.lat, v.lng], { icon }).addTo(map);
          marker.on('click', () => onSelect(v.imei));
          markersRef.current[v.imei] = marker;
        }
      });

      // Initial fit
      if (!initialFitDone.current && valid.length > 0) {
        const bounds = L.latLngBounds(valid.map(v => [v.lat, v.lng]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
        initialFitDone.current = true;
      }

      // Fly to selected
      if (selectedImei) {
        const sv = valid.find(v => v.imei === selectedImei);
        if (sv) map.flyTo([sv.lat, sv.lng], 15, { duration: 0.8 });
      }
    };
    update();
  }, [vehicles, selectedImei, onSelect]);

  return <div ref={mapRef} className="w-full h-full" data-testid="fleet-gps-map" />;
};

// ── Add Device Modal ─────────────────────────────────────────────────
const AddDeviceModal = ({ open, onClose, authFetch, onAdded }) => {
  const [imei, setImei] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imei.trim()) return toast.error('IMEI requis');
    setSaving(true);
    try {
      const res = await authFetch('/api/fleet/gps/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imei: imei.trim(), vehicleName, licensePlate, driverName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur');
      toast.success(`Appareil ${imei} enregistre`);
      onAdded(data.device);
      setImei(''); setVehicleName(''); setLicensePlate(''); setDriverName('');
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1e293b] rounded-2xl w-full max-w-md border border-slate-700/50 shadow-2xl" onClick={e => e.stopPropagation()} data-testid="add-device-modal">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-base font-semibold text-white">Ajouter un traceur GPS</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-700/50 rounded-lg transition"><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">IMEI du traceur *</label>
            <input value={imei} onChange={e => setImei(e.target.value)} placeholder="350424063817592"
              className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-600/50 rounded-xl text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
              data-testid="device-imei-input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Nom du vehicule</label>
            <input value={vehicleName} onChange={e => setVehicleName(e.target.value)} placeholder="Mercedes Classe V"
              className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-600/50 rounded-xl text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              data-testid="device-vehicle-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Plaque</label>
              <input value={licensePlate} onChange={e => setLicensePlate(e.target.value)} placeholder="AB-123-CD"
                className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-600/50 rounded-xl text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                data-testid="device-plate-input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Chauffeur</label>
              <input value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="Jean Dupont"
                className="w-full px-3 py-2.5 bg-slate-800/60 border border-slate-600/50 rounded-xl text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                data-testid="device-driver-input" />
            </div>
          </div>
          <button type="submit" disabled={saving} data-testid="device-submit-btn"
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Enregistrer l'appareil
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Vehicle Detail Panel ─────────────────────────────────────────────
const VehicleDetail = ({ vehicle, onClose }) => {
  if (!vehicle) return null;
  const status = getVehicleStatus(vehicle);
  const cfg = STATUS_CONFIG[status];

  const content = (
    <>
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} style={status === 'moving' ? { animation: 'pulse-dot 2s infinite' } : {}} />
            <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-700/50 rounded-lg transition" data-testid="detail-close-btn">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <h3 className="text-lg font-bold text-white truncate">{vehicle.vehicleName || 'Vehicule'}</h3>
        {vehicle.licensePlate && <p className="text-sm text-slate-400 font-mono mt-0.5">{vehicle.licensePlate}</p>}
      </div>

      {/* Info Grid */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Driver */}
        <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Car className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Chauffeur</span>
          </div>
          <p className="text-sm text-white font-medium">{vehicle.driverName || 'Non assigne'}</p>
        </div>

        {/* IMEI */}
        <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Radio className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">IMEI</span>
          </div>
          <p className="text-sm text-white font-mono">{vehicle.imei}</p>
        </div>

        {/* Position */}
        {vehicle.lat && vehicle.lng && (
          <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Position</span>
            </div>
            <p className="text-sm text-white font-mono">{vehicle.lat.toFixed(6)}, {vehicle.lng.toFixed(6)}</p>
          </div>
        )}

        {/* Live Data Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30 text-center">
            <Gauge className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{vehicle.speed ?? 0}</p>
            <p className="text-[10px] text-slate-500 uppercase">km/h</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30 text-center">
            <Navigation className="w-4 h-4 text-orange-400 mx-auto mb-1" style={{ transform: `rotate(${vehicle.heading || 0}deg)` }} />
            <p className="text-lg font-bold text-white">{vehicle.heading ?? 0}°</p>
            <p className="text-[10px] text-slate-500 uppercase">Cap</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30 text-center">
            <Satellite className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{vehicle.satellites ?? 0}</p>
            <p className="text-[10px] text-slate-500 uppercase">Satellites</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30 text-center">
            <Power className={`w-4 h-4 mx-auto mb-1 ${vehicle.ignition ? 'text-green-400' : 'text-slate-500'}`} />
            <p className="text-lg font-bold text-white">{vehicle.ignition ? 'ON' : 'OFF'}</p>
            <p className="text-[10px] text-slate-500 uppercase">Contact</p>
          </div>
        </div>

        {/* Last Update */}
        <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/30 flex items-center gap-3">
          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Derniere mise a jour</p>
            <p className="text-sm text-white">{vehicle.timestamp ? new Date(vehicle.timestamp).toLocaleString('fr-FR') : '--'}</p>
          </div>
        </div>
      </div>
    </>
  );

  return content;
};

// ── Main Page ────────────────────────────────────────────────────────
const FleetGeolocation = () => {
  const { authFetch } = useFleetAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImei, setSelectedImei] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const sseRef = useRef(null);
  const pollRef = useRef(null);

  // Fetch positions via REST (initial + fallback)
  const fetchPositions = useCallback(async () => {
    try {
      const res = await authFetch('/api/fleet/gps/positions');
      if (!res.ok) return;
      const data = await res.json();
      setVehicles(data.positions || []);
    } catch (err) {
      console.error('GPS fetch error:', err);
    } finally { setLoading(false); }
  }, [authFetch]);

  // SSE real-time stream
  useEffect(() => {
    const token = localStorage.getItem('fleet_token');
    if (!token) return;

    const connectSSE = () => {
      const url = `${API}/api/fleet/gps/stream`;
      const evtSource = new EventSource(url, {
        // EventSource doesn't support custom headers natively
        // We'll use polling as primary and SSE as enhancement
      });

      // Since EventSource can't send auth headers, fall back to polling
      // But try SSE for real-time updates (the backend checks auth via query if needed)
    };

    // Use polling as the primary real-time mechanism
    fetchPositions();
    pollRef.current = setInterval(fetchPositions, 8000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (sseRef.current) sseRef.current.close();
    };
  }, [fetchPositions]);

  // Compute filtered vehicles
  const enrichedVehicles = useMemo(() => {
    return vehicles.map(v => ({
      ...v,
      _status: getVehicleStatus(v),
    }));
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return enrichedVehicles.filter(v => {
      if (statusFilter !== 'all' && v._status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (v.vehicleName || '').toLowerCase().includes(q) ||
          (v.driverName || '').toLowerCase().includes(q) ||
          (v.licensePlate || '').toLowerCase().includes(q) ||
          (v.imei || '').includes(q)
        );
      }
      return true;
    });
  }, [enrichedVehicles, search, statusFilter]);

  const selectedVehicle = useMemo(() => {
    return enrichedVehicles.find(v => v.imei === selectedImei) || null;
  }, [enrichedVehicles, selectedImei]);

  // Stats
  const stats = useMemo(() => {
    const s = { moving: 0, stopped: 0, offline: 0 };
    enrichedVehicles.forEach(v => { s[v._status] = (s[v._status] || 0) + 1; });
    return s;
  }, [enrichedVehicles]);

  const handleDeviceAdded = () => {
    fetchPositions();
  };

  return (
    <div className="h-full w-full bg-[#0f172a] flex relative overflow-hidden" data-testid="fleet-gps-page" style={{ minHeight: 'calc(100vh - 0px)' }}>
      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* ── Left Sidebar ── */}
      <div className="w-[340px] bg-[#1e293b]/90 backdrop-blur-xl border-r border-slate-700/40 flex flex-col z-10 shrink-0 hidden lg:flex" data-testid="gps-sidebar">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-700/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-sm">Fleet GPS</h1>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-slate-400">Temps reel</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={fetchPositions} disabled={loading} data-testid="gps-refresh-btn"
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setShowAddDevice(true)} data-testid="gps-add-device-btn"
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-2 mb-3">
            {[
              { key: 'all', label: 'Tous', count: enrichedVehicles.length, color: 'text-white bg-slate-600/50' },
              { key: 'moving', label: null, count: stats.moving, color: 'text-green-400 bg-green-500/10', icon: Wifi },
              { key: 'stopped', label: null, count: stats.stopped, color: 'text-amber-400 bg-amber-500/10', icon: Clock },
              { key: 'offline', label: null, count: stats.offline, color: 'text-slate-400 bg-slate-500/10', icon: WifiOff },
            ].map(s => (
              <button key={s.key} onClick={() => setStatusFilter(s.key)} data-testid={`filter-${s.key}`}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === s.key ? 'ring-1 ring-blue-500 bg-blue-500/10 text-blue-400' : s.color + ' hover:opacity-80'}`}>
                {s.icon && <s.icon className="w-3 h-3" />}
                {s.label && <span>{s.label}</span>}
                <span className="font-bold">{s.count}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher vehicule, chauffeur, plaque..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-800/60 border border-slate-600/40 rounded-xl text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              data-testid="gps-search-input" />
          </div>
        </div>

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto" data-testid="gps-vehicle-list">
          {loading && vehicles.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-slate-800/60 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-7 h-7 text-slate-600" />
              </div>
              <p className="text-sm text-slate-400 font-medium">
                {vehicles.length === 0 ? 'Aucun appareil GPS' : 'Aucun resultat'}
              </p>
              {vehicles.length === 0 && (
                <button onClick={() => setShowAddDevice(true)} className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition">
                  + Ajouter un traceur
                </button>
              )}
            </div>
          ) : (
            filteredVehicles.map(v => {
              const cfg = STATUS_CONFIG[v._status];
              const sel = v.imei === selectedImei;
              return (
                <button key={v.imei} onClick={() => setSelectedImei(sel ? null : v.imei)}
                  data-testid={`vehicle-card-${v.imei}`}
                  className={`w-full text-left px-4 py-3.5 transition border-b border-slate-700/20 hover:bg-slate-700/30 ${sel ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : ''}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`}
                        style={v._status === 'moving' ? { animation: 'pulse-dot 2s infinite' } : {}} />
                      <span className="text-sm font-semibold text-white truncate">
                        {v.vehicleName || v.imei}
                      </span>
                    </div>
                    {v.speed > 0 && (
                      <span className="text-xs font-bold text-green-400 shrink-0">{v.speed} km/h</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    {v.driverName && (
                      <span className="truncate">{v.driverName}</span>
                    )}
                    {v.licensePlate && (
                      <span className="bg-slate-800/60 px-1.5 py-0.5 rounded font-mono text-slate-400">{v.licensePlate}</span>
                    )}
                    <span className="ml-auto shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatAge(v.timestamp)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-700/40 flex items-center justify-between">
          <span className="text-[10px] text-slate-600">{enrichedVehicles.length} appareils</span>
          <span className="text-[10px] text-slate-600 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Rafraichissement 8s
          </span>
        </div>
      </div>

      {/* ── Map Area ── */}
      <div className="flex-1 relative">
        <FleetMap vehicles={filteredVehicles} selectedImei={selectedImei} onSelect={setSelectedImei} />

        {/* Mobile Bottom Sheet (vehicles) */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-[#1e293b]/95 backdrop-blur-xl border-t border-slate-700/50 rounded-t-2xl z-20 max-h-[40vh] flex flex-col" data-testid="gps-mobile-sheet">
          <div className="px-4 pt-3 pb-2 flex items-center gap-2">
            <div className="w-8 h-1 bg-slate-600 rounded-full mx-auto" />
          </div>
          <div className="px-4 pb-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                className="w-full pl-8 pr-3 py-2 bg-slate-800/60 border border-slate-600/40 rounded-lg text-xs text-white placeholder-slate-500 outline-none" />
            </div>
            <button onClick={() => setShowAddDevice(true)} className="p-2 bg-blue-600 rounded-lg text-white"><Plus className="w-4 h-4" /></button>
            <button onClick={fetchPositions} className="p-2 bg-slate-700/50 rounded-lg text-slate-400"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
          {/* Stats */}
          <div className="px-4 pb-2 flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-green-400"><Wifi className="w-3 h-3" />{stats.moving}</span>
            <span className="flex items-center gap-1 text-[10px] text-amber-400"><Clock className="w-3 h-3" />{stats.stopped}</span>
            <span className="flex items-center gap-1 text-[10px] text-slate-400"><WifiOff className="w-3 h-3" />{stats.offline}</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-700/20">
            {filteredVehicles.map(v => {
              const cfg = STATUS_CONFIG[v._status];
              return (
                <button key={v.imei} onClick={() => setSelectedImei(v.imei === selectedImei ? null : v.imei)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-slate-700/30 ${v.imei === selectedImei ? 'bg-blue-600/10' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className="text-xs font-medium text-white truncate flex-1">{v.vehicleName || v.imei}</span>
                    {v.speed > 0 && <span className="text-[10px] text-green-400">{v.speed} km/h</span>}
                    <span className="text-[10px] text-slate-500">{formatAge(v.timestamp)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vehicle Detail Panel (desktop) */}
        {selectedVehicle && (
          <div className="hidden lg:flex absolute right-4 top-4 bottom-4 w-80 bg-[#1e293b]/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl z-[1000] flex-col overflow-hidden" data-testid="vehicle-detail-panel">
            <VehicleDetail vehicle={selectedVehicle} onClose={() => setSelectedImei(null)} />
          </div>
        )}

        {/* Mobile Detail Panel */}
        {selectedVehicle && (
          <div className="lg:hidden fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setSelectedImei(null)}>
            <div className="w-full bg-[#1e293b] rounded-t-2xl max-h-[80vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="w-8 h-1 bg-slate-600 rounded-full mx-auto mt-3" />
              <VehicleDetail vehicle={selectedVehicle} onClose={() => setSelectedImei(null)} />
            </div>
          </div>
        )}

        {/* Empty state overlay */}
        {!loading && vehicles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="bg-[#1e293b]/90 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 text-center pointer-events-auto max-w-sm">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Geolocalisation GPS</h2>
              <p className="text-sm text-slate-400 mb-5">
                Ajoutez vos traceurs Teltonika pour suivre vos vehicules en temps reel.
              </p>
              <button onClick={() => setShowAddDevice(true)} data-testid="empty-add-device-btn"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition flex items-center gap-2 mx-auto">
                <Plus className="w-4 h-4" /> Ajouter un traceur
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Device Modal */}
      <AddDeviceModal open={showAddDevice} onClose={() => setShowAddDevice(false)} authFetch={authFetch} onAdded={handleDeviceAdded} />
    </div>
  );
};

export default FleetGeolocation;
