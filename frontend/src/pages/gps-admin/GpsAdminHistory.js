import React, { useState, useEffect, useRef } from 'react';
import { useGpsAdmin } from './GpsAdminAuthContext';
import { History, Play, Pause, SkipForward, RotateCcw, Gauge, Route, Clock, MapPin } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const GpsAdminHistory = () => {
  const { token } = useGpsAdmin();
  const [devices, setDevices] = useState([]);
  const [selectedImei, setSelectedImei] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);
  const markerRef = useRef(null);
  const markersRef = useRef([]);
  const LRef = useRef(null);
  const playTimerRef = useRef(null);

  const headers = { Authorization: `Bearer ${token}` };

  // Load devices
  useEffect(() => {
    fetch(`${API}/api/gps-admin/devices`, { headers })
      .then(r => r.json())
      .then(d => setDevices(d.devices || []))
      .catch(() => {});
  }, []);

  // Load available dates when device selected
  useEffect(() => {
    if (!selectedImei) return;
    fetch(`${API}/api/gps-admin/history-dates/${selectedImei}`, { headers })
      .then(r => r.json())
      .then(d => {
        setAvailableDates(d.dates || []);
        if (d.dates?.length) setSelectedDate(d.dates[0]);
      })
      .catch(() => {});
  }, [selectedImei]);

  // Load history when date changes
  useEffect(() => {
    if (!selectedImei) return;
    setLoading(true);
    setPlaying(false);
    setPlayIndex(0);
    const url = selectedDate
      ? `${API}/api/gps-admin/history/${selectedImei}?date=${selectedDate}`
      : `${API}/api/gps-admin/history/${selectedImei}`;
    fetch(url, { headers })
      .then(r => r.json())
      .then(d => {
        setPositions(d.positions || []);
        setStats(d.stats || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedImei, selectedDate]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;
    const initMap = async () => {
      if (!document.getElementById('leaflet-css-history')) {
        const l = document.createElement('link');
        l.id = 'leaflet-css-history'; l.rel = 'stylesheet';
        l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(l);
      }
      const L = await import('leaflet');
      if (cancelled || mapInstanceRef.current) return;
      LRef.current = L.default || L;
      const Lf = LRef.current;
      const map = Lf.map(mapRef.current, { zoomControl: true }).setView([48.8566, 2.3522], 12);
      Lf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);
      mapInstanceRef.current = map;
      setMapReady(true);
    };
    initMap();
    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Draw route on map
  useEffect(() => {
    const L = LRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || !mapReady) return;

    // Clean previous
    if (polylineRef.current) { map.removeLayer(polylineRef.current); polylineRef.current = null; }
    if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null; }
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    if (positions.length === 0) return;

    const coords = positions.map(p => [p.lat, p.lng]);
    const polyline = L.polyline(coords, { color: '#2ecc71', weight: 4, opacity: 0.8 }).addTo(map);
    polylineRef.current = polyline;
    map.fitBounds(polyline.getBounds(), { padding: [30, 30] });

    // Start marker
    const startM = L.circleMarker(coords[0], { radius: 8, fillColor: '#2ecc71', fillOpacity: 1, color: '#fff', weight: 2 })
      .bindPopup('Depart').addTo(map);
    markersRef.current.push(startM);

    // End marker
    if (coords.length > 1) {
      const endM = L.circleMarker(coords[coords.length - 1], { radius: 8, fillColor: '#e74c3c', fillOpacity: 1, color: '#fff', weight: 2 })
        .bindPopup('Arrivee').addTo(map);
      markersRef.current.push(endM);
    }

    // Moving marker
    const icon = L.divIcon({
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#3498db;border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>',
      iconSize: [14, 14], className: '',
    });
    const marker = L.marker(coords[0], { icon }).addTo(map);
    markerRef.current = marker;
  }, [positions, mapReady]);

  // Update marker during playback
  useEffect(() => {
    if (markerRef.current && positions[playIndex]) {
      markerRef.current.setLatLng([positions[playIndex].lat, positions[playIndex].lng]);
    }
  }, [playIndex]);

  // Playback timer
  useEffect(() => {
    if (playing && positions.length > 0) {
      playTimerRef.current = setInterval(() => {
        setPlayIndex(prev => {
          if (prev >= positions.length - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, 200);
    }
    return () => clearInterval(playTimerRef.current);
  }, [playing, positions.length]);

  const currentPos = positions[playIndex];

  return (
    <div className="h-full flex flex-col gap-4" data-testid="gps-history-page">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-gray-900">Historique des trajets</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Vehicule</label>
            <select
              value={selectedImei}
              onChange={e => setSelectedImei(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              data-testid="history-vehicle-select"
            >
              <option value="">-- Choisir un vehicule --</option>
              {devices.map(d => (
                <option key={d.imei} value={d.imei}>
                  {d.vehicleName || d.imei} {d.licensePlate ? `(${d.licensePlate})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Date</label>
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              data-testid="history-date-select"
              disabled={!selectedImei}
            >
              {availableDates.length === 0 && <option value="">Aucune donnee</option>}
              {availableDates.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Lecture</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setPlayIndex(0); setPlaying(true); }}
                disabled={positions.length === 0}
                className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-40 transition"
                data-testid="history-play-btn"
                title="Rejouer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPlaying(!playing)}
                disabled={positions.length === 0}
                className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-40 transition"
                data-testid="history-pause-btn"
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setPlayIndex(Math.min(playIndex + 10, positions.length - 1))}
                disabled={positions.length === 0}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-40 transition"
                title="Avancer"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              {positions.length > 0 && (
                <span className="text-xs text-gray-500 ml-1">{playIndex + 1} / {positions.length}</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && stats.points > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Distance</p>
                <p className="text-sm font-bold text-gray-900">{stats.distance_km} km</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Vitesse max</p>
                <p className="text-sm font-bold text-gray-900">{stats.max_speed} km/h</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Points</p>
                <p className="text-sm font-bold text-gray-900">{stats.points}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Periode</p>
                <p className="text-sm font-bold text-gray-900 truncate">{stats.first?.substring(11, 16) || '-'} - {stats.last?.substring(11, 16) || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Current position info */}
        {currentPos && (
          <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 flex flex-wrap gap-4">
            <span>Heure: <strong>{currentPos.timestamp?.substring(11, 19)}</strong></span>
            <span>Vitesse: <strong>{currentPos.speed || 0} km/h</strong></span>
            <span>Lat: <strong>{currentPos.lat?.toFixed(5)}</strong></span>
            <span>Lng: <strong>{currentPos.lng?.toFixed(5)}</strong></span>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[400px] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-[1000]">
            <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              Chargement...
            </div>
          </div>
        )}
        {!selectedImei && !loading && (
          <div className="absolute inset-0 flex items-center justify-center z-[1000]">
            <p className="text-gray-400 text-sm">Selectionnez un vehicule pour voir son historique</p>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" style={{ minHeight: 400 }} data-testid="history-map" />
      </div>
    </div>
  );
};

export default GpsAdminHistory;
