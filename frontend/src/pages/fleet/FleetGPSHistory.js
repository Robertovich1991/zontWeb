import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFleetAuth } from './FleetAuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Pause, SkipForward, SkipBack, Calendar,
  Gauge, Clock, Navigation, MapPin, Loader2, Route as RouteIcon
} from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

function carIconHtml(color, heading, size = 36) {
  return `<div style="width:${size}px;height:${size}px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.25));transform:rotate(${heading || 0}deg);transition:transform 0.3s ease;">
  <svg viewBox="0 0 36 36" width="${size}" height="${size}">
    <rect x="9" y="3" width="18" height="30" rx="6" fill="${color}" stroke="white" stroke-width="2"/>
    <rect x="12.5" y="7" width="11" height="6" rx="2" fill="rgba(255,255,255,0.5)"/>
    <rect x="12.5" y="23" width="11" height="4" rx="1.5" fill="rgba(255,255,255,0.3)"/>
    <rect x="7" y="9" width="3.5" height="6" rx="1.5" fill="${color}" stroke="white" stroke-width="1"/>
    <rect x="7" y="21" width="3.5" height="6" rx="1.5" fill="${color}" stroke="white" stroke-width="1"/>
    <rect x="25.5" y="9" width="3.5" height="6" rx="1.5" fill="${color}" stroke="white" stroke-width="1"/>
    <rect x="25.5" y="21" width="3.5" height="6" rx="1.5" fill="${color}" stroke="white" stroke-width="1"/>
  </svg></div>`;
}

function speedColor(s) {
  if (s > 90) return '#EF4444';
  if (s > 50) return '#F59E0B';
  return '#10B981';
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDuration(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
  return `${m}min`;
}

// ── Map Component ────────────────────────────────────────────────────
const ReplayMap = ({ positions, currentIndex }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routeLayerRef = useRef(null);
  const markerRef = useRef(null);
  const startEndRef = useRef([]);

  useEffect(() => {
    if (!document.getElementById('leaflet-css-replay')) {
      const l = document.createElement('link');
      l.id = 'leaflet-css-replay'; l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(l);
    }
    const init = async () => {
      const L = await import('leaflet');
      if (mapInstance.current) return;
      const map = L.map(mapRef.current, { center: [48.86, 2.35], zoom: 12, zoomControl: false, attributionControl: false });
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
      mapInstance.current = map;
    };
    init();
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, []);

  // Draw route when positions change
  useEffect(() => {
    const draw = async () => {
      const L = await import('leaflet');
      const map = mapInstance.current;
      if (!map || positions.length < 2) return;

      // Clear previous
      if (routeLayerRef.current) { map.removeLayer(routeLayerRef.current); }
      startEndRef.current.forEach(m => map.removeLayer(m));
      startEndRef.current = [];

      // Draw segmented polyline with speed-based colors
      const segments = [];
      for (let i = 0; i < positions.length - 1; i++) {
        const p = positions[i], n = positions[i + 1];
        segments.push(L.polyline([[p.lat, p.lng], [n.lat, n.lng]], {
          color: speedColor(p.speed), weight: 4, opacity: 0.8,
        }));
      }
      const group = L.featureGroup(segments).addTo(map);
      routeLayerRef.current = group;

      // Start/End markers
      const first = positions[0], last = positions[positions.length - 1];
      const startIcon = L.divIcon({ className: '', html: `<div style="width:18px;height:18px;background:#10B981;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
      const endIcon = L.divIcon({ className: '', html: `<div style="width:18px;height:18px;background:#EF4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
      startEndRef.current.push(L.marker([first.lat, first.lng], { icon: startIcon }).addTo(map));
      startEndRef.current.push(L.marker([last.lat, last.lng], { icon: endIcon }).addTo(map));

      map.fitBounds(group.getBounds(), { padding: [60, 60], maxZoom: 15 });
    };
    draw();
  }, [positions]);

  // Update car marker position
  useEffect(() => {
    const move = async () => {
      const L = await import('leaflet');
      const map = mapInstance.current;
      if (!map || !positions[currentIndex]) return;

      const p = positions[currentIndex];
      const icon = L.divIcon({
        className: '', html: carIconHtml('#3B82F6', p.heading, 40),
        iconSize: [40, 40], iconAnchor: [20, 20],
      });

      if (markerRef.current) {
        markerRef.current.setLatLng([p.lat, p.lng]);
        markerRef.current.setIcon(icon);
      } else {
        markerRef.current = L.marker([p.lat, p.lng], { icon, zIndexOffset: 1000 }).addTo(map);
      }
    };
    move();
  }, [positions, currentIndex]);

  return <div ref={mapRef} className="absolute inset-0 z-0" data-testid="replay-map" />;
};

// ── Main Page ────────────────────────────────────────────────────────
const FleetGPSHistory = () => {
  const { authFetch } = useFleetAuth();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [selectedImei, setSelectedImei] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(10);
  const animRef = useRef(null);

  // Load devices
  useEffect(() => {
    const load = async () => {
      try {
        const res = await authFetch('/api/fleet/gps/devices');
        if (res.ok) {
          const data = await res.json();
          const devs = data.devices || [];
          setDevices(devs);
          if (devs.length > 0) setSelectedImei(devs[0].imei);
        }
      } catch {}
      finally { setLoadingDevices(false); }
    };
    load();
  }, [authFetch]);

  // Load history
  const loadHistory = useCallback(async () => {
    if (!selectedImei || !date) return;
    setLoading(true);
    setPlaying(false);
    setCurrentIndex(0);
    try {
      const start = `${date}T00:00:00Z`;
      const end = `${date}T23:59:59Z`;
      const res = await authFetch(`/api/fleet/gps/history/${selectedImei}?start=${start}&end=${end}&limit=50000`);
      if (res.ok) {
        const data = await res.json();
        const valid = (data.history || []).filter(p => p.lat !== 0 && p.lng !== 0);
        setPositions(valid);
        if (valid.length === 0) toast.info('Aucune position pour cette date');
      }
    } catch { toast.error('Erreur chargement historique'); }
    finally { setLoading(false); }
  }, [authFetch, selectedImei, date]);

  useEffect(() => { if (selectedImei && date) loadHistory(); }, [selectedImei, date, loadHistory]);

  // Animation loop
  useEffect(() => {
    if (!playing || positions.length === 0) return;
    const interval = Math.max(20, 200 / speed);
    animRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= positions.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, interval);
    return () => clearInterval(animRef.current);
  }, [playing, speed, positions.length]);

  // Stats
  const stats = useMemo(() => {
    if (positions.length < 2) return { distance: 0, duration: 0, maxSpeed: 0, avgSpeed: 0 };
    let dist = 0, maxSpd = 0, spdSum = 0, spdCount = 0;
    for (let i = 1; i < positions.length; i++) {
      const p = positions[i - 1], c = positions[i];
      dist += haversine(p.lat, p.lng, c.lat, c.lng);
      if (c.speed > maxSpd) maxSpd = c.speed;
      if (c.speed > 0) { spdSum += c.speed; spdCount++; }
    }
    const t0 = new Date(positions[0].timestamp).getTime();
    const t1 = new Date(positions[positions.length - 1].timestamp).getTime();
    return { distance: dist, duration: t1 - t0, maxSpeed: maxSpd, avgSpeed: spdCount > 0 ? spdSum / spdCount : 0 };
  }, [positions]);

  const cur = positions[currentIndex] || null;
  const progress = positions.length > 1 ? (currentIndex / (positions.length - 1)) * 100 : 0;
  const speeds = [1, 2, 5, 10, 25, 50];
  const device = devices.find(d => d.imei === selectedImei);

  return (
    <div className="h-full w-full relative overflow-hidden" style={{ minHeight: '100vh' }} data-testid="gps-history-page">
      <ReplayMap positions={positions} currentIndex={currentIndex} />

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center gap-3 pointer-events-none">
        <button onClick={() => navigate('/fleet/geolocation')} data-testid="history-back-btn"
          className="pointer-events-auto p-2.5 bg-white/95 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200/80 hover:bg-gray-50 transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="pointer-events-auto bg-white/95 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200/80 px-4 py-2.5 flex items-center gap-3">
          <RouteIcon className="w-5 h-5 text-emerald-500" />
          <div>
            <h1 className="text-sm font-bold text-gray-900">Historique GPS</h1>
            <p className="text-[10px] text-gray-400">{device?.vehicleName || selectedImei} {device?.licensePlate ? `- ${device.licensePlate}` : ''}</p>
          </div>
        </div>
      </div>

      {/* Left Panel */}
      <aside className="hidden lg:flex flex-col absolute left-4 top-20 bottom-24 w-[300px] bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden z-[1000]">
        <div className="p-4 border-b border-gray-100 space-y-3">
          {loadingDevices ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-300 mx-auto" />
          ) : (
            <select value={selectedImei} onChange={e => setSelectedImei(e.target.value)} data-testid="device-select"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-emerald-500">
              {devices.map(d => <option key={d.imei} value={d.imei}>{d.vehicleName || d.imei} {d.licensePlate ? `(${d.licensePlate})` : ''}</option>)}
            </select>
          )}
          <div className="relative">
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} data-testid="date-picker"
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-emerald-500" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-1"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
        ) : positions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <MapPin className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Aucune position pour cette date</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase">Distance</p>
                <p className="text-lg font-bold text-gray-900">{stats.distance.toFixed(1)} <span className="text-xs text-gray-400">km</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase">Duree</p>
                <p className="text-lg font-bold text-gray-900">{fmtDuration(stats.duration)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase">Vitesse max</p>
                <p className="text-lg font-bold text-red-500">{Math.round(stats.maxSpeed)} <span className="text-xs text-gray-400">km/h</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase">Moy.</p>
                <p className="text-lg font-bold text-emerald-600">{Math.round(stats.avgSpeed)} <span className="text-xs text-gray-400">km/h</span></p>
              </div>
            </div>

            <div className="text-center text-xs text-gray-400 py-1">
              {positions.length} positions
            </div>

            {/* Current position info */}
            {cur && (
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-[10px] text-blue-400 uppercase mb-1">Position actuelle</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{Math.round(cur.speed)} km/h</p>
                    <p className="text-[10px] text-gray-500 font-mono">{cur.lat.toFixed(5)}, {cur.lng.toFixed(5)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{new Date(cur.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                    <p className="text-[10px] text-gray-400">{cur.satellites} sat</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Bottom Controls */}
      {positions.length > 1 && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/80 p-4" data-testid="replay-controls">
            {/* Timeline */}
            <div className="mb-3">
              <input type="range" min="0" max={positions.length - 1} value={currentIndex}
                onChange={e => { setCurrentIndex(Number(e.target.value)); setPlaying(false); }}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-500" data-testid="replay-timeline" />
              <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-1">
                <span>{positions[0] ? new Date(positions[0].timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                <span>{cur ? new Date(cur.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}</span>
                <span>{positions[positions.length - 1] ? new Date(positions[positions.length - 1].timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Play controls */}
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 50))} data-testid="replay-back"
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button onClick={() => setPlaying(!playing)} data-testid="replay-play"
                  className="p-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-sm">
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button onClick={() => setCurrentIndex(Math.min(positions.length - 1, currentIndex + 50))} data-testid="replay-forward"
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Speed */}
              <div className="flex items-center gap-1">
                {speeds.map(s => (
                  <button key={s} onClick={() => setSpeed(s)} data-testid={`speed-${s}x`}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition ${speed === s ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {s}x
                  </button>
                ))}
              </div>

              {/* Current info */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-gray-400" />
                  <span className="font-bold text-gray-900">{cur ? Math.round(cur.speed) : 0}</span>
                  <span className="text-[10px] text-gray-400">km/h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-gray-400" style={{ transform: `rotate(${cur?.heading || 0}deg)` }} />
                  <span className="text-xs text-gray-500">{cur?.heading || 0}°</span>
                </div>
                <div className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-500 font-mono">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetGPSHistory;
