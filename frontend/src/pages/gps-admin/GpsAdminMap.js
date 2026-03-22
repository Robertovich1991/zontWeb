import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGpsAdmin } from './GpsAdminAuthContext';
import { Search, RefreshCw, Wifi, WifiOff, Clock, Loader2, Navigation, MapPin, Building2 } from 'lucide-react';

const STATUS = {
  moving:  { color: '#10B981', bg: 'bg-emerald-500', label: 'En mouvement' },
  stopped: { color: '#F59E0B', bg: 'bg-amber-500',   label: 'Arret' },
  offline: { color: '#9CA3AF', bg: 'bg-gray-400',     label: 'Hors ligne' },
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
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}j`;
}

const PAGE_CSS = `@keyframes gps-ping { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(2.5); opacity: 0; } }`;

const MapView = ({ vehicles, selectedImei, onSelect }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const fitDone = useRef(false);

  useEffect(() => {
    if (!document.getElementById('leaflet-css-admin')) {
      const l = document.createElement('link');
      l.id = 'leaflet-css-admin'; l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(l);
    }
    const init = async () => {
      const L = await import('leaflet');
      if (mapInstance.current) return;
      const map = L.map(mapRef.current, { center: [43.7, 7.27], zoom: 10, zoomControl: false, attributionControl: false });
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
        if (!activeImeis.has(imei)) { map.removeLayer(markersRef.current[imei]); delete markersRef.current[imei]; }
      });
      valid.forEach(v => {
        const st = getStatus(v);
        const cfg = STATUS[st];
        const sel = v.imei === selectedImei;
        const sz = sel ? 20 : 14;
        const iconHtml = `
          <div style="position:relative;width:${sz*2.5}px;height:${sz*2.5}px;display:flex;align-items:center;justify-content:center;">
            ${st==='moving'?`<div style="position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:${cfg.color};animation:gps-ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>`:''}
            <div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${cfg.color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.25)${sel?',0 0 0 3px '+cfg.color+'40':''};transition:all 0.3s;"></div>
          </div>`;
        const icon = L.divIcon({ className: '', html: iconHtml, iconSize: [sz*2.5, sz*2.5], iconAnchor: [sz*1.25, sz*1.25] });
        if (markersRef.current[v.imei]) {
          markersRef.current[v.imei].setLatLng([v.lat, v.lng]).setIcon(icon);
        } else {
          const m = L.marker([v.lat, v.lng], { icon }).addTo(map);
          m.on('click', () => onSelect(v.imei));
          markersRef.current[v.imei] = m;
        }
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

const GpsAdminMap = () => {
  const { authFetch } = useGpsAdmin();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImei, setSelectedImei] = useState(null);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const pollRef = useRef(null);

  const fetch_ = useCallback(async () => {
    try {
      const res = await authFetch('/api/gps-admin/positions');
      if (res.ok) setVehicles((await res.json()).positions || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => {
    fetch_();
    pollRef.current = setInterval(fetch_, 8000);
    return () => clearInterval(pollRef.current);
  }, [fetch_]);

  const enriched = useMemo(() => vehicles.map(v => ({ ...v, _st: getStatus(v) })), [vehicles]);
  const companyNames = useMemo(() => [...new Set(enriched.map(v => v.companyName).filter(Boolean))], [enriched]);

  const filtered = useMemo(() => enriched.filter(v => {
    if (companyFilter !== 'all' && v.companyName !== companyFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (v.vehicleName||'').toLowerCase().includes(q) || (v.driverName||'').toLowerCase().includes(q)
        || (v.imei||'').includes(q) || (v.companyName||'').toLowerCase().includes(q);
    }
    return true;
  }), [enriched, search, companyFilter]);

  const selected = useMemo(() => enriched.find(v => v.imei === selectedImei) || null, [enriched, selectedImei]);
  const stats = useMemo(() => { const s = { moving: 0, stopped: 0, offline: 0 }; enriched.forEach(v => s[v._st]++); return s; }, [enriched]);

  return (
    <div className="h-full w-full relative overflow-hidden" style={{ minHeight: '100vh' }} data-testid="gps-admin-map-page">
      <style>{PAGE_CSS}</style>
      <MapView vehicles={filtered} selectedImei={selectedImei} onSelect={setSelectedImei} />

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col absolute left-4 top-4 bottom-4 w-[350px] bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden z-[1000]">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center"><Navigation className="w-5 h-5 text-white" /></div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">Carte globale</h1>
                <p className="text-[10px] text-gray-400">Tous les vehicules</p>
              </div>
            </div>
            <button onClick={fetch_} disabled={loading} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-2 mb-3">
            <span className="flex items-center gap-1 text-xs text-emerald-600"><Wifi className="w-3 h-3" />{stats.moving}</span>
            <span className="flex items-center gap-1 text-xs text-amber-500"><Clock className="w-3 h-3" />{stats.stopped}</span>
            <span className="flex items-center gap-1 text-xs text-gray-400"><WifiOff className="w-3 h-3" />{stats.offline}</span>
          </div>

          {/* Company filter */}
          <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 mb-3 outline-none focus:border-emerald-500">
            <option value="all">Toutes les societes ({enriched.length})</option>
            {companyNames.map(n => <option key={n} value={n}>{n}</option>)}
            <option value="">Non assigne</option>
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
                className={`w-full text-left px-4 py-3.5 border-b border-gray-100 hover:bg-emerald-50/50 transition-all ${sel ? 'bg-emerald-50 border-l-[3px]' : 'border-l-[3px] border-l-transparent'}`}
                style={sel ? { borderLeftColor: cfg.color } : {}}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.bg}`} />
                    <span className="text-sm font-semibold text-gray-900 truncate">{v.vehicleName || v.imei}</span>
                  </div>
                  {v.speed > 0 && <span className="text-xs font-semibold text-emerald-600 shrink-0">{v.speed} km/h</span>}
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
      </aside>

      {/* Detail popup */}
      {selected && (
        <div className="hidden lg:block absolute right-4 top-4 w-72 bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/80 z-[1000] p-5">
          <h3 className="text-base font-bold text-gray-900 mb-1">{selected.vehicleName || selected.imei}</h3>
          {selected.licensePlate && <p className="text-xs text-gray-400 font-mono mb-3">{selected.licensePlate}</p>}
          {selected.companyName && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-3"><Building2 className="w-3 h-3" />{selected.companyName}</span>}
          <div className="space-y-2 text-sm">
            {selected.driverName && <p className="text-gray-600">Chauffeur: <span className="text-gray-900">{selected.driverName}</span></p>}
            <p className="text-gray-600 font-mono text-xs">IMEI: {selected.imei}</p>
            {selected.lat && <p className="text-gray-600 font-mono text-xs">{selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}</p>}
            <div className="flex gap-4 mt-2 pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-500">Vitesse: <strong className="text-gray-900">{selected.speed ?? 0}</strong> km/h</span>
              <span className="text-gray-500">Contact: <strong className={selected.ignition ? 'text-emerald-600' : 'text-gray-400'}>{selected.ignition ? 'ON' : 'OFF'}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GpsAdminMap;
