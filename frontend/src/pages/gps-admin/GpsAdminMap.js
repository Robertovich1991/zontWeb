import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGpsAdmin } from './GpsAdminAuthContext';
import { Search, RefreshCw, Wifi, WifiOff, Clock, Loader2, Navigation, MapPin, Building2, Zap, X, Gauge } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const WS_URL = API.replace(/^http/, 'ws');

const STATUS = {
  moving:   { color: '#10B981', bg: 'bg-emerald-500', label: 'En mouvement' },
  stopped:  { color: '#F59E0B', bg: 'bg-amber-500',   label: "A l'arret" },
  offline:  { color: '#EF4444', bg: 'bg-red-500',     label: 'Hors ligne' },
  gps_lost: { color: '#374151', bg: 'bg-gray-700',    label: 'GPS perdu' },
};

function getStatus(v) {
  if (!v.lat || !v.lng) return 'gps_lost';
  if (!v.timestamp) return 'gps_lost';
  const age = (Date.now() - new Date(v.timestamp).getTime()) / 1000;
  if (v.speed > 2 && age < 120) return 'moving';
  if (v.ignition === false || v.speed <= 2) {
    if (age > 3600) return 'offline';
    return 'stopped';
  }
  if (age > 600) return 'offline';
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

// ── Map ──────────────────────────────────────────────────────────────
const MapView = ({ vehicles, selectedImei, onSelect }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const prevPosRef = useRef({});
  const fitDone = useRef(false);

  useEffect(() => {
    if (!document.getElementById('leaflet-css-admin2')) {
      const l = document.createElement('link');
      l.id = 'leaflet-css-admin2'; l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(l);
    }
    const init = async () => {
      const L = await import('leaflet');
      if (mapInstance.current) return;
      const map = L.map(mapRef.current, { center: [48.86, 2.35], zoom: 6, zoomControl: false, attributionControl: false });
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
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
        if (!activeImeis.has(imei)) { map.removeLayer(markersRef.current[imei]); delete markersRef.current[imei]; delete prevPosRef.current[imei]; }
      });

      valid.forEach(v => {
        const st = getStatus(v);
        const cfg = STATUS[st];
        const sel = v.imei === selectedImei;
        const s = sel ? 44 : 34;
        const icon = L.divIcon({ className: '', html: carIconHtml(cfg.color, v.heading, sel), iconSize: [s, s], iconAnchor: [s / 2, s / 2] });

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

      if (!fitDone.current && valid.length > 0) {
        map.fitBounds(L.latLngBounds(valid.map(v => [v.lat, v.lng])), { padding: [80, 80], maxZoom: 13 });
        fitDone.current = true;
      }
      if (selectedImei) {
        const sv = valid.find(v => v.imei === selectedImei);
        if (sv) map.flyTo([sv.lat, sv.lng], 15, { duration: 0.8 });
      }
    };
    update();
  }, [vehicles, selectedImei, onSelect]);

  return <div ref={mapRef} className="absolute inset-0 z-0" data-testid="gps-admin-map" />;
};

// ── Main ─────────────────────────────────────────────────────────────
const GpsAdminMap = () => {
  const { token, authFetch } = useGpsAdmin();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImei, setSelectedImei] = useState(null);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
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
        const res = await authFetch('/api/gps-admin/positions');
        if (res.ok) updateVehicles((await res.json()).positions || []);
      } catch (err) { console.error('GPS poll error:', err); }
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
        const ws = new WebSocket(`${WS_URL}/api/gps-admin/ws?token=${token}`);
        wsRef.current = ws;
        ws.onopen = () => {
          if (closed) { ws.close(); return; }
          setWsConnected(true);
          stopPolling();
          pingRef.current = setInterval(() => { if (ws.readyState === WebSocket.OPEN) ws.send('ping'); }, 25000);
        };
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === 'ping') {
              ws.send('pong');
              return;
            }
            handleWsMessage(msg);
          } catch (err) { console.error('WS message parse error:', err); }
        };
        ws.onclose = () => {
          if (closed) return;
          setWsConnected(false);
          if (pingRef.current) { clearInterval(pingRef.current); pingRef.current = null; }
          startPolling();
          reconnectRef.current = setTimeout(connectWS, 5000);
        };
        ws.onerror = () => ws.close();
      } catch (err) { console.error('WS connect error:', err); startPolling(); }
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
  const companyNames = useMemo(() => [...new Set(enriched.map(v => v.companyName).filter(Boolean))], [enriched]);

  const filtered = useMemo(() => enriched.filter(v => {
    if (companyFilter !== 'all') {
      if (companyFilter === '_unassigned') { if (v.companyName) return false; }
      else if (v.companyName !== companyFilter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (v.vehicleName || '').toLowerCase().includes(q) || (v.driverName || '').toLowerCase().includes(q)
        || (v.imei || '').includes(q) || (v.companyName || '').toLowerCase().includes(q);
    }
    return true;
  }), [enriched, search, companyFilter]);

  const selected = useMemo(() => enriched.find(v => v.imei === selectedImei) || null, [enriched, selectedImei]);
  const stats = useMemo(() => { const s = { moving: 0, stopped: 0, offline: 0, gps_lost: 0 }; enriched.forEach(v => s[v._st]++); return s; }, [enriched]);

  const manualRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/gps-admin/positions');
      if (res.ok) { const d = (await res.json()).positions || []; vehiclesRef.current = d; setVehicles([...d]); }
    } catch (err) { console.error('Manual refresh error:', err); } finally { setLoading(false); }
  }, [authFetch]);

  return (
    <div className="h-full w-full relative overflow-hidden" style={{ minHeight: '100vh' }} data-testid="gps-admin-map-page">
      <MapView vehicles={filtered} selectedImei={selectedImei} onSelect={setSelectedImei} />

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col absolute left-4 top-4 bottom-4 w-[350px] bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden z-[1000]">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center"><Navigation className="w-5 h-5 text-white" /></div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">Carte globale</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">{wsConnected ? 'Live' : 'Polling'}</span>
                </div>
              </div>
            </div>
            <button onClick={manualRefresh} disabled={loading} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mb-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-600 font-medium"><Wifi className="w-3 h-3" />{stats.moving}</span>
            <span className="flex items-center gap-1 text-amber-500 font-medium"><Clock className="w-3 h-3" />{stats.stopped}</span>
            <span className="flex items-center gap-1 text-red-500 font-medium"><WifiOff className="w-3 h-3" />{stats.offline}</span>
            <span className="flex items-center gap-1 text-gray-400 font-medium"><MapPin className="w-3 h-3" />{stats.gps_lost}</span>
          </div>

          {/* Company filter */}
          <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 mb-3 outline-none focus:border-emerald-500" data-testid="company-filter">
            <option value="all">Toutes les societes ({enriched.length})</option>
            {companyNames.map(n => <option key={n} value={n}>{n}</option>)}
            <option value="_unassigned">Non assigne</option>
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:border-emerald-500 outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && vehicles.length === 0 ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
          ) : filtered.map(v => {
            const cfg = STATUS[v._st];
            const sel = v.imei === selectedImei;
            return (
              <button key={v.imei} onClick={() => setSelectedImei(sel ? null : v.imei)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-emerald-50/50 transition-all ${sel ? 'bg-emerald-50 border-l-[3px]' : 'border-l-[3px] border-l-transparent'}`}
                style={sel ? { borderLeftColor: cfg.color } : {}}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: cfg.color }} />
                    <span className="text-sm font-semibold text-gray-900 truncate">{v.vehicleName || v.imei}</span>
                  </div>
                  <span className={`text-xs font-bold tabular-nums shrink-0 ${v.speed > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>
                    {v.speed ?? 0} <span className="text-[10px] font-normal">km/h</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 pl-5">
                  {v.companyName && <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[10px] font-medium">{v.companyName}</span>}
                  {v.driverName && <span className="truncate">{v.driverName}</span>}
                  <span className="ml-auto font-mono">{fmtAge(v.timestamp)}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{enriched.length} vehicules</span>
          <span className="text-[10px] flex items-center gap-1.5">
            <Zap className={`w-3 h-3 ${wsConnected ? 'text-emerald-500' : 'text-amber-400'}`} />
            <span className={`uppercase tracking-wider ${wsConnected ? 'text-emerald-500' : 'text-amber-400'}`}>
              {wsConnected ? 'WebSocket' : 'Polling'}
            </span>
          </span>
        </div>
      </aside>

      {/* Detail popup */}
      {selected && (
        <div className="hidden lg:block absolute right-4 top-4 w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/80 z-[1000] overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">{selected.vehicleName || selected.imei}</h3>
              {selected.licensePlate && <p className="text-xs text-gray-400 font-mono">{selected.licensePlate}</p>}
            </div>
            <button onClick={() => setSelectedImei(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="p-4 space-y-3">
            {selected.companyName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                <Building2 className="w-3 h-3" />{selected.companyName}
              </span>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase mb-0.5">Vitesse</p>
                <p className="text-lg font-bold text-gray-900">{selected.speed ?? 0} <span className="text-xs text-gray-400">km/h</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase mb-0.5">Contact</p>
                <p className={`text-lg font-bold ${selected.ignition ? 'text-emerald-600' : 'text-gray-400'}`}>{selected.ignition ? 'ON' : 'OFF'}</p>
              </div>
            </div>
            {selected.driverName && <p className="text-sm text-gray-600">Chauffeur: <strong className="text-gray-900">{selected.driverName}</strong></p>}
            <p className="text-xs text-gray-400 font-mono">IMEI: {selected.imei}</p>
            {selected.lat && <p className="text-xs text-gray-400 font-mono">{selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}</p>}
            <p className="text-xs text-gray-400">MAJ: {selected.timestamp ? new Date(selected.timestamp).toLocaleString('fr-FR') : '--'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GpsAdminMap;
