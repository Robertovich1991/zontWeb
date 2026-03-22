import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFleetAuth } from './FleetAuthContext';
import {
  Search, RefreshCw, Wifi, WifiOff, Clock, Gauge, X,
  Plus, Loader2, Navigation, Satellite, Power, MapPin, Car,
  Radio, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

// ── Status helpers ───────────────────────────────────────────────────
const STATUS = {
  moving:  { color: '#10B981', bg: 'bg-emerald-500', ring: 'ring-emerald-500/30', label: 'En mouvement', glow: '0 0 12px rgba(16,185,129,0.5)' },
  stopped: { color: '#F59E0B', bg: 'bg-amber-500',   ring: 'ring-amber-500/30',   label: 'Arret',         glow: '0 0 12px rgba(245,158,11,0.5)' },
  offline: { color: '#52525B', bg: 'bg-zinc-600',     ring: 'ring-zinc-500/30',     label: 'Hors ligne',    glow: 'none' },
};

function getStatus(v) {
  if (!v.lat || !v.lng || !v.timestamp) return 'offline';
  const age = (Date.now() - new Date(v.timestamp).getTime()) / 1000;
  if (age > 600) return 'offline';
  if (v.speed > 2) return 'moving';
  return 'stopped';
}

function fmtAge(ts) {
  if (!ts) return '--';
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 0) return 'now';
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

// ── CSS ──────────────────────────────────────────────────────────────
const GLASS = 'bg-zinc-950/65 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]';

const PAGE_CSS = `
  @keyframes gps-ping { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(2.5); opacity: 0; } }
  @keyframes gps-pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  .gps-page *::-webkit-scrollbar { width: 4px; }
  .gps-page *::-webkit-scrollbar-track { background: transparent; }
  .gps-page *::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
  .gps-page *::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
`;

// ── Map ──────────────────────────────────────────────────────────────
const FleetMap = ({ vehicles, selectedImei, onSelect }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const fitDone = useRef(false);

  useEffect(() => {
    if (!document.getElementById('leaflet-css-v2')) {
      const l = document.createElement('link');
      l.id = 'leaflet-css-v2'; l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(l);
    }
    const init = async () => {
      const L = await import('leaflet');
      if (mapInstance.current) return;
      const map = L.map(mapRef.current, {
        center: [43.7, 7.27], zoom: 10,
        zoomControl: false, attributionControl: false,
      });
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19, subdomains: 'abcd',
      }).addTo(map);
      mapInstance.current = map;
    };
    init();
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, []);

  useEffect(() => {
    const update = async () => {
      const L = await import('leaflet');
      const map = mapInstance.current;
      if (!map) return;

      const valid = vehicles.filter(v => v.lat && v.lng);
      const activeImeis = new Set(valid.map(v => v.imei));
      Object.keys(markersRef.current).forEach(imei => {
        if (!activeImeis.has(imei)) { map.removeLayer(markersRef.current[imei]); delete markersRef.current[imei]; }
      });

      valid.forEach(v => {
        const st = getStatus(v);
        const cfg = STATUS[st];
        const sel = v.imei === selectedImei;
        const sz = sel ? 20 : 14;
        const rot = v.heading || 0;

        // Premium minimal marker: dot with optional ping
        const iconHtml = `
          <div style="position:relative;width:${sz * 2.5}px;height:${sz * 2.5}px;display:flex;align-items:center;justify-content:center;">
            ${st === 'moving' ? `<div style="position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:${cfg.color};animation:gps-ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
            <div style="position:relative;width:${sz}px;height:${sz}px;border-radius:50%;background:${cfg.color};border:2px solid ${sel ? '#fff' : 'rgba(0,0,0,0.6)'};box-shadow:${sel ? '0 0 20px ' + cfg.color : cfg.glow};transition:all 0.3s ease;">
              ${sel ? `<svg style="position:absolute;top:-${sz * 0.3}px;left:50%;transform:translateX(-50%) rotate(${rot}deg);width:${sz * 0.8}px;height:${sz * 0.8}px;" viewBox="0 0 24 24" fill="${cfg.color}" stroke="rgba(0,0,0,0.4)" stroke-width="1"><polygon points="12,2 4,20 12,16 20,20"/></svg>` : ''}
            </div>
          </div>`;

        const icon = L.divIcon({ className: '', html: iconHtml, iconSize: [sz * 2.5, sz * 2.5], iconAnchor: [sz * 1.25, sz * 1.25] });
        if (markersRef.current[v.imei]) {
          markersRef.current[v.imei].setLatLng([v.lat, v.lng]);
          markersRef.current[v.imei].setIcon(icon);
        } else {
          const m = L.marker([v.lat, v.lng], { icon }).addTo(map);
          m.on('click', () => onSelect(v.imei));
          markersRef.current[v.imei] = m;
        }
      });

      if (!fitDone.current && valid.length > 0) {
        const bounds = L.latLngBounds(valid.map(v => [v.lat, v.lng]));
        map.fitBounds(bounds, { padding: [80, 80], maxZoom: 13 });
        fitDone.current = true;
      }
      if (selectedImei) {
        const sv = valid.find(v => v.imei === selectedImei);
        if (sv) map.flyTo([sv.lat, sv.lng], 15, { duration: 0.8 });
      }
    };
    update();
  }, [vehicles, selectedImei, onSelect]);

  return <div ref={mapRef} className="absolute inset-0 z-0" data-testid="fleet-gps-map" />;
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imei: imei.trim(), vehicleName, licensePlate, driverName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erreur');
      toast.success('Appareil enregistre');
      onAdded(data.device);
      setImei(''); setVehicleName(''); setLicensePlate(''); setDriverName('');
      onClose();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const inputCls = 'w-full px-4 py-3 bg-zinc-900 border border-white/[0.08] rounded-xl text-sm text-white placeholder-zinc-600 focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:outline-none font-sans transition-colors duration-200';

  return (
    <div className="fixed inset-0 bg-black/70 z-[2000] flex items-center justify-center p-4" onClick={onClose}>
      <div className={`${GLASS} rounded-3xl w-full max-w-md`} onClick={e => e.stopPropagation()} data-testid="add-device-modal">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <h3 className="text-base font-heading font-bold text-white tracking-tight">Nouveau traceur GPS</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors duration-200"><X className="w-4 h-4 text-zinc-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] font-medium text-zinc-500 mb-2 uppercase tracking-[0.2em]">IMEI du traceur</label>
            <input value={imei} onChange={e => setImei(e.target.value)} placeholder="350424063817592" className={`${inputCls} font-mono`} data-testid="device-imei-input" />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-zinc-500 mb-2 uppercase tracking-[0.2em]">Vehicule</label>
            <input value={vehicleName} onChange={e => setVehicleName(e.target.value)} placeholder="Mercedes Classe V" className={inputCls} data-testid="device-vehicle-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-2 uppercase tracking-[0.2em]">Plaque</label>
              <input value={licensePlate} onChange={e => setLicensePlate(e.target.value)} placeholder="AB-123-CD" className={`${inputCls} font-mono`} data-testid="device-plate-input" />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-2 uppercase tracking-[0.2em]">Chauffeur</label>
              <input value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="Jean Dupont" className={inputCls} data-testid="device-driver-input" />
            </div>
          </div>
          <button type="submit" disabled={saving} data-testid="device-submit-btn"
            className="w-full py-3 bg-white text-zinc-950 rounded-xl font-heading font-bold text-sm hover:bg-zinc-200 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Detail Panel Content ─────────────────────────────────────────────
const DetailContent = ({ vehicle, onClose }) => {
  if (!vehicle) return null;
  const st = getStatus(vehicle);
  const cfg = STATUS[st];

  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${cfg.bg}`} />
              {st === 'moving' && <div className={`absolute inset-0 w-3 h-3 rounded-full ${cfg.bg} animate-ping opacity-50`} />}
            </div>
            <span className="text-xs font-medium uppercase tracking-[0.15em]" style={{ color: cfg.color }}>{cfg.label}</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors duration-200" data-testid="detail-close-btn">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
        <h3 className="text-xl font-heading font-bold text-white tracking-tight truncate">{vehicle.vehicleName || 'Vehicule'}</h3>
        {vehicle.licensePlate && <p className="text-sm text-zinc-500 font-mono mt-1">{vehicle.licensePlate}</p>}
      </div>

      {/* Telemetry Bento Grid */}
      <div className="flex-1 overflow-y-auto">
        {/* Driver & IMEI */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <Car className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Chauffeur</p>
              <p className="text-sm text-white font-medium">{vehicle.driverName || 'Non assigne'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <Radio className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">IMEI</p>
              <p className="text-sm text-white font-mono">{vehicle.imei}</p>
            </div>
          </div>
          {vehicle.lat && vehicle.lng && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <MapPin className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Position</p>
                <p className="text-sm text-white font-mono">{vehicle.lat.toFixed(6)}, {vehicle.lng.toFixed(6)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bento Grid Telemetry */}
        <div className="mx-6 rounded-2xl overflow-hidden border border-white/[0.08]">
          <div className="grid grid-cols-2 gap-[1px] bg-white/[0.06]">
            {/* Speed */}
            <div className="bg-zinc-950/80 p-5 flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-2">Vitesse</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono font-semibold text-white">{vehicle.speed ?? 0}</span>
                <span className="text-xs text-zinc-500">km/h</span>
              </div>
            </div>
            {/* Heading */}
            <div className="bg-zinc-950/80 p-5 flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-2">Cap</span>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-zinc-400" style={{ transform: `rotate(${vehicle.heading || 0}deg)` }} />
                <span className="text-2xl font-mono font-semibold text-white">{vehicle.heading ?? 0}</span>
                <span className="text-xs text-zinc-500">deg</span>
              </div>
            </div>
            {/* Satellites */}
            <div className="bg-zinc-950/80 p-5 flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-2">Satellites</span>
              <span className="text-2xl font-mono font-semibold text-white">{vehicle.satellites ?? 0}</span>
            </div>
            {/* Ignition */}
            <div className="bg-zinc-950/80 p-5 flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] mb-2">Contact</span>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${vehicle.ignition ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                <span className="text-2xl font-mono font-semibold text-white">{vehicle.ignition ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Last Update */}
        <div className="p-6">
          <div className="flex items-center gap-3 text-zinc-500">
            <Clock className="w-4 h-4 shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em]">Derniere MAJ</p>
              <p className="text-sm text-zinc-300 font-mono">{vehicle.timestamp ? new Date(vehicle.timestamp).toLocaleString('fr-FR') : '--'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
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
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const pollRef = useRef(null);

  const fetchPositions = useCallback(async () => {
    try {
      const res = await authFetch('/api/fleet/gps/positions');
      if (!res.ok) return;
      const data = await res.json();
      setVehicles(data.positions || []);
    } catch (err) { console.error('GPS fetch:', err); }
    finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => {
    fetchPositions();
    pollRef.current = setInterval(fetchPositions, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchPositions]);

  const enriched = useMemo(() => vehicles.map(v => ({ ...v, _st: getStatus(v) })), [vehicles]);

  const filtered = useMemo(() => {
    return enriched.filter(v => {
      if (statusFilter !== 'all' && v._st !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (v.vehicleName||'').toLowerCase().includes(q) || (v.driverName||'').toLowerCase().includes(q)
          || (v.licensePlate||'').toLowerCase().includes(q) || (v.imei||'').includes(q);
      }
      return true;
    });
  }, [enriched, search, statusFilter]);

  const selected = useMemo(() => enriched.find(v => v.imei === selectedImei) || null, [enriched, selectedImei]);

  const stats = useMemo(() => {
    const s = { moving: 0, stopped: 0, offline: 0 };
    enriched.forEach(v => { s[v._st]++; });
    return s;
  }, [enriched]);

  const filterBtns = [
    { key: 'all', label: `Tous ${enriched.length}`, icon: null },
    { key: 'moving', label: `${stats.moving}`, icon: Wifi, color: 'text-emerald-400' },
    { key: 'stopped', label: `${stats.stopped}`, icon: Clock, color: 'text-amber-400' },
    { key: 'offline', label: `${stats.offline}`, icon: WifiOff, color: 'text-zinc-500' },
  ];

  return (
    <div className="gps-page h-full w-full bg-[#09090B] relative overflow-hidden font-sans" data-testid="fleet-gps-page" style={{ minHeight: '100vh' }}>
      <style>{PAGE_CSS}</style>

      {/* ── Full screen map ── */}
      <FleetMap vehicles={filtered} selectedImei={selectedImei} onSelect={setSelectedImei} />

      {/* ── Left Sidebar (floating, desktop only) ── */}
      <aside className={`${GLASS} hidden lg:flex flex-col absolute left-4 top-4 bottom-4 w-[360px] rounded-3xl overflow-hidden z-[1000]`} data-testid="gps-sidebar">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <Navigation className="w-5 h-5 text-zinc-950" />
              </div>
              <div>
                <h1 className="text-white font-heading font-bold text-sm tracking-tight">Fleet GPS</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" style={{ animation: 'gps-pulse 2s infinite' }} />
                  <span className="text-[10px] text-zinc-500 uppercase tracking-[0.15em]">Live</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={fetchPositions} disabled={loading} data-testid="gps-refresh-btn"
                className="p-2.5 rounded-xl hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-colors duration-200">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setShowAddDevice(true)} data-testid="gps-add-device-btn"
                className="p-2.5 rounded-xl hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-colors duration-200">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 mb-4">
            {filterBtns.map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)} data-testid={`filter-${f.key}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200
                  ${statusFilter === f.key
                    ? 'bg-white/[0.12] text-white border border-white/[0.15]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] border border-transparent'
                  }`}>
                {f.icon && <f.icon className={`w-3 h-3 ${f.color || ''}`} />}
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-white/[0.06] rounded-xl text-sm text-white placeholder-zinc-600 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:outline-none transition-colors duration-200"
              data-testid="gps-search-input" />
          </div>
        </div>

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto" data-testid="gps-vehicle-list">
          {loading && vehicles.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-14 h-14 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/[0.06]">
                <MapPin className="w-6 h-6 text-zinc-700" />
              </div>
              <p className="text-sm text-zinc-500 font-medium">{vehicles.length === 0 ? 'Aucun appareil' : 'Aucun resultat'}</p>
              {vehicles.length === 0 && (
                <button onClick={() => setShowAddDevice(true)} className="mt-3 text-xs text-white/60 hover:text-white transition-colors duration-200">
                  + Ajouter un traceur
                </button>
              )}
            </div>
          ) : (
            filtered.map(v => {
              const cfg = STATUS[v._st];
              const sel = v.imei === selectedImei;
              return (
                <button key={v.imei} onClick={() => setSelectedImei(sel ? null : v.imei)}
                  data-testid={`vehicle-card-${v.imei}`}
                  className={`group w-full text-left px-5 py-4 transition-all duration-200 border-b border-white/[0.04] hover:bg-white/[0.04] hover:translate-x-1
                    ${sel ? 'bg-white/[0.06] border-l-2' : 'border-l-2 border-l-transparent'}`}
                  style={sel ? { borderLeftColor: cfg.color } : {}}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${cfg.bg}`} />
                        {v._st === 'moving' && <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${cfg.bg} opacity-50`} style={{ animation: 'gps-ping 2s infinite' }} />}
                      </div>
                      <span className="text-sm font-heading font-semibold text-white truncate tracking-tight">{v.vehicleName || v.imei}</span>
                    </div>
                    {v.speed > 0 && (
                      <span className="text-xs font-mono font-semibold text-emerald-400 shrink-0 tabular-nums">{v.speed} <span className="text-emerald-400/50 text-[10px]">km/h</span></span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-600 pl-5">
                    {v.driverName && <span className="truncate">{v.driverName}</span>}
                    {v.licensePlate && <span className="bg-white/[0.04] px-1.5 py-0.5 rounded font-mono text-zinc-500">{v.licensePlate}</span>}
                    <span className="ml-auto shrink-0 flex items-center gap-1 font-mono">
                      {fmtAge(v.timestamp)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-[10px] text-zinc-600 uppercase tracking-[0.15em]">{enriched.length} appareils</span>
          <span className="text-[10px] text-zinc-600 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" style={{ animation: 'gps-pulse 2s infinite' }} />
            <span className="uppercase tracking-[0.15em]">8s refresh</span>
          </span>
        </div>
      </aside>

      {/* ── Right Detail Panel (desktop) ── */}
      {selected && (
        <aside className={`${GLASS} hidden lg:flex flex-col absolute right-4 top-4 bottom-4 w-[380px] rounded-3xl overflow-hidden z-[1000]`} data-testid="vehicle-detail-panel">
          <DetailContent vehicle={selected} onClose={() => setSelectedImei(null)} />
        </aside>
      )}

      {/* ── Mobile Bottom Sheet ── */}
      <div className={`lg:hidden fixed left-0 right-0 bottom-0 z-[1000] transition-all duration-300 ease-out ${mobileExpanded ? 'top-[30vh]' : 'top-[calc(100vh-180px)]'}`}>
        <div className={`${GLASS} rounded-t-3xl h-full flex flex-col`} data-testid="gps-mobile-sheet">
          {/* Drag handle */}
          <button onClick={() => setMobileExpanded(!mobileExpanded)} className="w-full pt-3 pb-2 flex flex-col items-center gap-2">
            <div className="w-10 h-1 bg-zinc-700 rounded-full" />
            <ChevronUp className={`w-4 h-4 text-zinc-600 transition-transform duration-300 ${mobileExpanded ? 'rotate-180' : ''}`} />
          </button>
          {/* Search + actions */}
          <div className="px-4 pb-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                className="w-full pl-8 pr-3 py-2.5 bg-zinc-900 border border-white/[0.06] rounded-xl text-xs text-white placeholder-zinc-600 outline-none" />
            </div>
            <button onClick={() => setShowAddDevice(true)} className="p-2.5 bg-white rounded-xl text-zinc-950"><Plus className="w-4 h-4" /></button>
            <button onClick={fetchPositions} className="p-2.5 bg-zinc-900 border border-white/[0.06] rounded-xl text-zinc-500"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
          </div>
          {/* Stats bar */}
          <div className="px-4 pb-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono"><Wifi className="w-3 h-3" />{stats.moving}</span>
            <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono"><Clock className="w-3 h-3" />{stats.stopped}</span>
            <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono"><WifiOff className="w-3 h-3" />{stats.offline}</span>
          </div>
          {/* Vehicle list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map(v => {
              const cfg = STATUS[v._st];
              return (
                <button key={v.imei} onClick={() => { setSelectedImei(v.imei === selectedImei ? null : v.imei); setMobileExpanded(false); }}
                  className={`w-full text-left px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.04] ${v.imei === selectedImei ? 'bg-white/[0.06]' : ''}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.bg}`} />
                    <span className="text-xs font-heading font-semibold text-white truncate flex-1">{v.vehicleName || v.imei}</span>
                    {v.speed > 0 && <span className="text-[10px] font-mono text-emerald-400">{v.speed}</span>}
                    <span className="text-[10px] text-zinc-600 font-mono">{fmtAge(v.timestamp)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile detail overlay */}
      {selected && (
        <div className="lg:hidden fixed inset-0 bg-black/70 z-[2000] flex items-end" onClick={() => setSelectedImei(null)}>
          <div className={`${GLASS} w-full rounded-t-3xl max-h-[80vh] overflow-y-auto flex flex-col`} onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mt-3" />
            <DetailContent vehicle={selected} onClose={() => setSelectedImei(null)} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && vehicles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
          <div className={`${GLASS} rounded-3xl p-10 text-center pointer-events-auto max-w-sm`}>
            <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/[0.06]">
              <Navigation className="w-7 h-7 text-zinc-600" />
            </div>
            <h2 className="text-lg font-heading font-bold text-white tracking-tight mb-2">Geolocalisation GPS</h2>
            <p className="text-sm text-zinc-500 mb-6">Ajoutez vos traceurs Teltonika pour le suivi en temps reel.</p>
            <button onClick={() => setShowAddDevice(true)} data-testid="empty-add-device-btn"
              className="px-6 py-3 bg-white text-zinc-950 rounded-xl font-heading font-bold text-sm hover:bg-zinc-200 transition-colors duration-200 flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" /> Ajouter un traceur
            </button>
          </div>
        </div>
      )}

      <AddDeviceModal open={showAddDevice} onClose={() => setShowAddDevice(false)} authFetch={authFetch} onAdded={() => fetchPositions()} />
    </div>
  );
};

export default FleetGeolocation;
