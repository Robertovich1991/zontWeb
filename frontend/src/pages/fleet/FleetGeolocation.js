import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFleetAuth } from './FleetAuthContext';
import {
  Search, RefreshCw, Wifi, WifiOff, Clock, X, Plus, Loader2,
  Navigation, Satellite, Power, MapPin, Car, Radio, ChevronUp, Gauge, Zap
} from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;
const WS_URL = API.replace(/^http/, 'ws');

// ── Statuses ─────────────────────────────────────────────────────────
const STATUS = {
  moving:   { color: '#10B981', bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', label: 'En mouvement' },
  stopped:  { color: '#F59E0B', bg: 'bg-amber-500',   text: 'text-amber-600',   light: 'bg-amber-50',   label: "A l'arret" },
  offline:  { color: '#EF4444', bg: 'bg-red-500',     text: 'text-red-500',     light: 'bg-red-50',     label: 'Hors ligne' },
  gps_lost: { color: '#374151', bg: 'bg-gray-700',    text: 'text-gray-600',    light: 'bg-gray-100',   label: 'GPS perdu' },
};

function getStatus(v) {
  if (!v.lat || !v.lng) return 'gps_lost';
  if (!v.timestamp) return 'gps_lost';
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
  return `${Math.floor(s / 86400)}j`;
}

// ── Car SVG Icon ─────────────────────────────────────────────────────
function carIconHtml(color, heading, selected) {
  const s = selected ? 44 : 34;
  return `<div style="width:${s}px;height:${s}px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.25));transform:rotate(${heading || 0}deg);transition:transform 0.8s cubic-bezier(.4,0,.2,1);">
  <svg viewBox="0 0 36 36" width="${s}" height="${s}">
    <rect x="9" y="3" width="18" height="30" rx="6" fill="${color}" stroke="white" stroke-width="2"/>
    <rect x="12.5" y="7" width="11" height="6" rx="2" fill="rgba(255,255,255,0.5)"/>
    <rect x="12.5" y="23" width="11" height="4" rx="1.5" fill="rgba(255,255,255,0.3)"/>
    <rect x="7" y="9" width="3.5" height="6" rx="1.5" fill="${color}" stroke="white" stroke-width="1"/>
    <rect x="7" y="21" width="3.5" height="6" rx="1.5" fill="${color}" stroke="white" stroke-width="1"/>
    <rect x="25.5" y="9" width="3.5" height="6" rx="1.5" fill="${color}" stroke="white" stroke-width="1"/>
    <rect x="25.5" y="21" width="3.5" height="6" rx="1.5" fill="${color}" stroke="white" stroke-width="1"/>
    ${selected ? `<rect x="5" y="0" width="26" height="36" rx="9" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.4" stroke-dasharray="3,2"/>` : ''}
  </svg></div>`;
}

// ── Smooth marker animation ──────────────────────────────────────────
function animateMarker(marker, from, to, duration = 1000) {
  const [fLat, fLng] = from;
  const [tLat, tLng] = to;
  if (Math.abs(fLat - tLat) < 0.000001 && Math.abs(fLng - tLng) < 0.000001) return;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = t * (2 - t);
    marker.setLatLng([fLat + (tLat - fLat) * ease, fLng + (tLng - fLng) * ease]);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const PAGE_CSS = `
  .gps-page *::-webkit-scrollbar { width: 5px; }
  .gps-page *::-webkit-scrollbar-track { background: transparent; }
  .gps-page *::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
`;

// ── Map Component ────────────────────────────────────────────────────
const FleetMap = ({ vehicles, selectedImei, onSelect }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const prevPosRef = useRef({});
  const fitDone = useRef(false);

  useEffect(() => {
    if (!document.getElementById('leaflet-css-v4')) {
      const l = document.createElement('link');
      l.id = 'leaflet-css-v4'; l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(l);
    }
    const init = async () => {
      const L = await import('leaflet');
      if (mapInstance.current) return;
      const map = L.map(mapRef.current, {
        center: [48.86, 2.35], zoom: 10,
        zoomControl: false, attributionControl: false,
      });
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
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

      // Remove old markers
      Object.keys(markersRef.current).forEach(imei => {
        if (!activeImeis.has(imei)) {
          map.removeLayer(markersRef.current[imei]);
          delete markersRef.current[imei];
          delete prevPosRef.current[imei];
        }
      });

      valid.forEach(v => {
        const st = getStatus(v);
        const cfg = STATUS[st];
        const sel = v.imei === selectedImei;
        const s = sel ? 44 : 34;

        const icon = L.divIcon({
          className: '',
          html: carIconHtml(cfg.color, v.heading, sel),
          iconSize: [s, s],
          iconAnchor: [s / 2, s / 2],
        });

        if (markersRef.current[v.imei]) {
          const marker = markersRef.current[v.imei];
          const prev = prevPosRef.current[v.imei];
          marker.setIcon(icon);
          if (prev && (prev[0] !== v.lat || prev[1] !== v.lng)) {
            animateMarker(marker, prev, [v.lat, v.lng], 1000);
          }
        } else {
          const m = L.marker([v.lat, v.lng], { icon }).addTo(map);
          m.on('click', () => onSelect(v.imei));
          markersRef.current[v.imei] = m;
        }
        prevPosRef.current[v.imei] = [v.lat, v.lng];
      });

      // Initial fit
      if (!fitDone.current && valid.length > 0) {
        map.fitBounds(L.latLngBounds(valid.map(v => [v.lat, v.lng])), { padding: [80, 80], maxZoom: 13 });
        fitDone.current = true;
      }

      // Fly to selected
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

  const inputCls = 'w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition';

  return (
    <div className="fixed inset-0 bg-black/40 z-[2000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100" onClick={e => e.stopPropagation()} data-testid="add-device-modal">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Nouveau traceur GPS</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">IMEI du traceur</label>
            <input value={imei} onChange={e => setImei(e.target.value)} placeholder="350424063817592" className={`${inputCls} font-mono`} data-testid="device-imei-input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Vehicule</label>
            <input value={vehicleName} onChange={e => setVehicleName(e.target.value)} placeholder="Mercedes Classe V" className={inputCls} data-testid="device-vehicle-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Plaque</label>
              <input value={licensePlate} onChange={e => setLicensePlate(e.target.value)} placeholder="AB-123-CD" className={`${inputCls} font-mono`} data-testid="device-plate-input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Chauffeur</label>
              <input value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="Jean Dupont" className={inputCls} data-testid="device-driver-input" />
            </div>
          </div>
          <button type="submit" disabled={saving} data-testid="device-submit-btn"
            className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Detail Panel ─────────────────────────────────────────────────────
const DetailContent = ({ vehicle, onClose }) => {
  if (!vehicle) return null;
  const st = getStatus(vehicle);
  const cfg = STATUS[st];

  return (
    <>
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full ${cfg.light}`}>
            <div className={`w-2 h-2 rounded-full ${cfg.bg}`} />
            <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition" data-testid="detail-close-btn">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <h3 className="text-lg font-bold text-gray-900 truncate">{vehicle.vehicleName || 'Vehicule'}</h3>
        {vehicle.licensePlate && <p className="text-sm text-gray-400 font-mono mt-0.5">{vehicle.licensePlate}</p>}
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center"><Car className="w-4 h-4 text-emerald-600" /></div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Chauffeur</p>
            <p className="text-sm text-gray-900 font-medium">{vehicle.driverName || 'Non assigne'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><Radio className="w-4 h-4 text-gray-500" /></div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">IMEI</p>
            <p className="text-sm text-gray-900 font-mono">{vehicle.imei}</p>
          </div>
        </div>
        {vehicle.lat && vehicle.lng && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><MapPin className="w-4 h-4 text-blue-500" /></div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Position</p>
              <p className="text-sm text-gray-900 font-mono">{vehicle.lat.toFixed(6)}, {vehicle.lng.toFixed(6)}</p>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Vitesse</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{vehicle.speed ?? 0}</span>
              <span className="text-xs text-gray-400">km/h</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Cap</p>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-gray-400" style={{ transform: `rotate(${vehicle.heading || 0}deg)` }} />
              <span className="text-2xl font-bold text-gray-900">{vehicle.heading ?? 0}<span className="text-xs text-gray-400 ml-0.5">deg</span></span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Satellites</p>
            <span className="text-2xl font-bold text-gray-900">{vehicle.satellites ?? 0}</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Contact</p>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${vehicle.ignition ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              <span className="text-2xl font-bold text-gray-900">{vehicle.ignition ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2 text-gray-400">
          <Clock className="w-4 h-4 shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider">Derniere MAJ</p>
            <p className="text-sm text-gray-600 font-mono">{vehicle.timestamp ? new Date(vehicle.timestamp).toLocaleString('fr-FR') : '--'}</p>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Main Page ────────────────────────────────────────────────────────
const FleetGeolocation = () => {
  const { token, authFetch } = useFleetAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImei, setSelectedImei] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const vehiclesRef = useRef([]);
  const wsRef = useRef(null);
  const pollRef = useRef(null);
  const reconnectRef = useRef(null);
  const pingRef = useRef(null);

  // WebSocket + polling fallback
  useEffect(() => {
    if (!token) return;
    let closed = false;

    function updateVehicles(data) {
      vehiclesRef.current = data;
      setVehicles([...data]);
      setLoading(false);
    }

    function handleWsMessage(msg) {
      if (msg.type === 'initial') {
        updateVehicles(msg.data);
      } else if (msg.type === 'position_update') {
        const upd = msg.data;
        const idx = vehiclesRef.current.findIndex(v => v.imei === upd.imei);
        if (idx >= 0) {
          vehiclesRef.current[idx] = { ...vehiclesRef.current[idx], ...upd };
        } else {
          vehiclesRef.current.push(upd);
        }
        setVehicles([...vehiclesRef.current]);
      }
    }

    async function poll() {
      try {
        const res = await authFetch('/api/fleet/gps/positions');
        if (res.ok) updateVehicles((await res.json()).positions || []);
      } catch {}
    }

    function startPolling() {
      if (pollRef.current) return;
      poll();
      pollRef.current = setInterval(poll, 3000);
    }

    function stopPolling() {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }

    function connectWS() {
      if (closed) return;
      try {
        const ws = new WebSocket(`${WS_URL}/api/fleet/gps/ws?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
          if (closed) { ws.close(); return; }
          setWsConnected(true);
          stopPolling();
          pingRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) ws.send('ping');
          }, 25000);
        };

        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === 'ping') {
              ws.send('pong');
              return;
            }
            handleWsMessage(msg);
          } catch {}
        };

        ws.onclose = () => {
          if (closed) return;
          setWsConnected(false);
          if (pingRef.current) { clearInterval(pingRef.current); pingRef.current = null; }
          startPolling();
          reconnectRef.current = setTimeout(connectWS, 5000);
        };

        ws.onerror = () => ws.close();
      } catch {
        startPolling();
      }
    }

    connectWS();

    return () => {
      closed = true;
      if (wsRef.current) wsRef.current.close();
      stopPolling();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (pingRef.current) clearInterval(pingRef.current);
    };
  }, [token, authFetch]);

  const enriched = useMemo(() => vehicles.map(v => ({ ...v, _st: getStatus(v) })), [vehicles]);
  const filtered = useMemo(() => {
    return enriched.filter(v => {
      if (statusFilter !== 'all' && v._st !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (v.vehicleName || '').toLowerCase().includes(q) || (v.driverName || '').toLowerCase().includes(q)
          || (v.licensePlate || '').toLowerCase().includes(q) || (v.imei || '').includes(q);
      }
      return true;
    });
  }, [enriched, search, statusFilter]);

  const selected = useMemo(() => enriched.find(v => v.imei === selectedImei) || null, [enriched, selectedImei]);
  const stats = useMemo(() => {
    const s = { moving: 0, stopped: 0, offline: 0, gps_lost: 0 };
    enriched.forEach(v => { s[v._st]++; });
    return s;
  }, [enriched]);

  const manualRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/fleet/gps/positions');
      if (res.ok) {
        const data = (await res.json()).positions || [];
        vehiclesRef.current = data;
        setVehicles([...data]);
      }
    } catch {} finally { setLoading(false); }
  }, [authFetch]);

  const filters = [
    { key: 'all', label: `Tous ${enriched.length}` },
    { key: 'moving', label: `${stats.moving}`, icon: Wifi, cls: 'text-emerald-600' },
    { key: 'stopped', label: `${stats.stopped}`, icon: Clock, cls: 'text-amber-500' },
    { key: 'offline', label: `${stats.offline}`, icon: WifiOff, cls: 'text-red-500' },
    { key: 'gps_lost', label: `${stats.gps_lost}`, icon: MapPin, cls: 'text-gray-500' },
  ];

  return (
    <div className="gps-page h-full w-full bg-gray-100 relative overflow-hidden" data-testid="fleet-gps-page" style={{ minHeight: '100vh' }}>
      <style>{PAGE_CSS}</style>
      <FleetMap vehicles={filtered} selectedImei={selectedImei} onSelect={setSelectedImei} />

      {/* Left Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col absolute left-4 top-4 bottom-4 w-[350px] bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden z-[1000]" data-testid="gps-sidebar">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 font-bold text-sm">Fleet GPS</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} style={wsConnected ? { animation: 'pulse 2s infinite' } : {}} />
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                    {wsConnected ? 'Live' : 'Polling 3s'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button onClick={manualRefresh} disabled={loading} data-testid="gps-refresh-btn"
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setShowAddDevice(true)} data-testid="gps-add-device-btn"
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            {filters.map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)} data-testid={`filter-${f.key}`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition border
                  ${statusFilter === f.key ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-transparent'}`}>
                {f.icon && <f.icon className={`w-3 h-3 ${f.cls || ''}`} />}
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
              data-testid="gps-search-input" />
          </div>
        </div>

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto" data-testid="gps-vehicle-list">
          {loading && vehicles.length === 0 ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-gray-100">
                <MapPin className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium">{vehicles.length === 0 ? 'Aucun appareil' : 'Aucun resultat'}</p>
              {vehicles.length === 0 && (
                <button onClick={() => setShowAddDevice(true)} className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 transition">+ Ajouter un traceur</button>
              )}
            </div>
          ) : (
            filtered.map(v => {
              const cfg = STATUS[v._st];
              const sel = v.imei === selectedImei;
              return (
                <button key={v.imei} onClick={() => setSelectedImei(sel ? null : v.imei)}
                  data-testid={`vehicle-card-${v.imei}`}
                  className={`group w-full text-left px-4 py-3 transition-all border-b border-gray-100 hover:bg-emerald-50/50
                    ${sel ? 'bg-emerald-50 border-l-[3px]' : 'border-l-[3px] border-l-transparent'}`}
                  style={sel ? { borderLeftColor: cfg.color } : {}}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <div className="w-3 h-3 rounded-sm" style={{ background: cfg.color }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 truncate">{v.vehicleName || v.imei}</span>
                    </div>
                    <span className={`text-xs font-bold tabular-nums shrink-0 ${v.speed > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>
                      {v.speed ?? 0} <span className="text-[10px] font-normal">km/h</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 pl-5">
                    {v.driverName && <span className="truncate">{v.driverName}</span>}
                    {v.licensePlate && <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500">{v.licensePlate}</span>}
                    <span className="ml-auto shrink-0 font-mono">{fmtAge(v.timestamp)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{enriched.length} appareils</span>
          <span className="text-[10px] flex items-center gap-1.5">
            <Zap className={`w-3 h-3 ${wsConnected ? 'text-emerald-500' : 'text-amber-400'}`} />
            <span className={`uppercase tracking-wider ${wsConnected ? 'text-emerald-500' : 'text-amber-400'}`}>
              {wsConnected ? 'WebSocket' : 'Polling'}
            </span>
          </span>
        </div>
      </aside>

      {/* Right Detail Panel (desktop) */}
      {selected && (
        <aside className="hidden lg:flex flex-col absolute right-4 top-4 bottom-4 w-[360px] bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden z-[1000]" data-testid="vehicle-detail-panel">
          <DetailContent vehicle={selected} onClose={() => setSelectedImei(null)} />
        </aside>
      )}

      {/* Mobile Bottom Sheet */}
      <div className={`lg:hidden fixed left-0 right-0 bottom-0 z-[1000] transition-all duration-300 ease-out ${mobileExpanded ? 'top-[30vh]' : 'top-[calc(100vh-170px)]'}`}>
        <div className="bg-white/95 backdrop-blur-lg rounded-t-2xl shadow-xl border-t border-gray-200 h-full flex flex-col" data-testid="gps-mobile-sheet">
          <button onClick={() => setMobileExpanded(!mobileExpanded)} className="w-full pt-3 pb-2 flex flex-col items-center gap-1.5">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
            <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${mobileExpanded ? 'rotate-180' : ''}`} />
          </button>
          <div className="px-4 pb-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 outline-none" />
            </div>
            <button onClick={() => setShowAddDevice(true)} className="p-2.5 bg-emerald-500 rounded-lg text-white"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="px-4 pb-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium"><Wifi className="w-3 h-3" />{stats.moving}</span>
            <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium"><Clock className="w-3 h-3" />{stats.stopped}</span>
            <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium"><WifiOff className="w-3 h-3" />{stats.offline}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(v => {
              const cfg = STATUS[v._st];
              return (
                <button key={v.imei} onClick={() => { setSelectedImei(v.imei === selectedImei ? null : v.imei); setMobileExpanded(false); }}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-emerald-50/50 ${v.imei === selectedImei ? 'bg-emerald-50' : ''}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: cfg.color }} />
                    <span className="text-xs font-semibold text-gray-900 truncate flex-1">{v.vehicleName || v.imei}</span>
                    <span className={`text-[10px] font-bold ${v.speed > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>{v.speed ?? 0}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{fmtAge(v.timestamp)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile detail overlay */}
      {selected && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-[2000] flex items-end" onClick={() => setSelectedImei(null)}>
          <div className="w-full bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3" />
            <DetailContent vehicle={selected} onClose={() => setSelectedImei(null)} />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && vehicles.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-10 text-center pointer-events-auto max-w-sm shadow-lg border border-gray-200/80">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Navigation className="w-7 h-7 text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Geolocalisation GPS</h2>
            <p className="text-sm text-gray-400 mb-6">Ajoutez vos traceurs Teltonika pour le suivi en temps reel.</p>
            <button onClick={() => setShowAddDevice(true)} data-testid="empty-add-device-btn"
              className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" /> Ajouter un traceur
            </button>
          </div>
        </div>
      )}

      <AddDeviceModal open={showAddDevice} onClose={() => setShowAddDevice(false)} authFetch={authFetch} onAdded={manualRefresh} />
    </div>
  );
};

export default FleetGeolocation;
