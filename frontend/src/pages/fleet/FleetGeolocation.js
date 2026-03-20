import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFleetAuth } from './FleetAuthContext';
import { MapPin, Settings, RefreshCw, Wifi, WifiOff, Clock, Gauge, ChevronRight, X, Check, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

// ── Map component (loaded dynamically to avoid SSR issues) ──
const VehicleMap = ({ vehicles, selectedId, onSelect }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Initialize map
    const initMap = async () => {
      const L = await import('leaflet');
      if (mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [48.8566, 2.3522], // Paris default
        zoom: 11,
        zoomControl: true,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);
      mapInstanceRef.current = map;
    };
    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const updateMarkers = async () => {
      const L = await import('leaflet');
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear old markers
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];

      const validVehicles = vehicles.filter(v => v.lat && v.lon && (v.lat !== 0 || v.lon !== 0));
      if (validVehicles.length === 0) return;

      validVehicles.forEach(v => {
        const isSelected = v.id === selectedId;
        const color = v.status === 'online' ? '#10b981' : v.status === 'idle' ? '#f59e0b' : '#6b7280';
        const size = isSelected ? 16 : 10;

        const icon = L.divIcon({
          className: '',
          html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);${isSelected ? 'transform:scale(1.5);z-index:999;' : ''}"></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([v.lat, v.lon], { icon })
          .addTo(map)
          .bindPopup(`<b>${v.name}</b><br/>Vitesse: ${v.speed} km/h<br/>Statut: ${v.status}`);
        marker.on('click', () => onSelect(v.id));
        markersRef.current.push(marker);
      });

      // Fit bounds if not selected
      if (!selectedId && validVehicles.length > 0) {
        const bounds = L.latLngBounds(validVehicles.map(v => [v.lat, v.lon]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }

      // Zoom to selected
      if (selectedId) {
        const sel = validVehicles.find(v => v.id === selectedId);
        if (sel) map.setView([sel.lat, sel.lon], 15, { animate: true });
      }
    };
    updateMarkers();
  }, [vehicles, selectedId, onSelect]);

  return <div ref={mapRef} className="w-full h-full rounded-xl" style={{ minHeight: 400 }} />;
};

// ── Settings Modal ──
const WialonSettings = ({ open, onClose, authFetch, onSaved }) => {
  const [token, setToken] = useState('');
  const [host, setHost] = useState('hst-api.wialon.com');
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open) {
      authFetch(`${API}/api/fleet/wialon/config`).then(r => r.json()).then(setConfig).catch(() => {});
    }
  }, [open, authFetch]);

  const handleSave = async () => {
    if (!token.trim()) return toast.error('Entrez votre token Wialon');
    setSaving(true);
    try {
      const resp = await authFetch(`${API}/api/fleet/wialon/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), host: host.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail || 'Erreur');
      toast.success('Configuration sauvegardee');
      setToken('');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await authFetch(`${API}/api/fleet/wialon/config`, { method: 'DELETE' });
      toast.success('Configuration supprimee');
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()} data-testid="wialon-settings-modal">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Configuration Wialon</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        {config?.configured && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 text-emerald-700 font-medium">
              <Check className="w-4 h-4" /> Connecte
            </div>
            <p className="text-emerald-600 mt-1">Host: {config.host}</p>
            <p className="text-emerald-600">Token: {config.tokenMasked}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Token Wialon (72 caracteres)</label>
          <input type="text" value={token} onChange={e => setToken(e.target.value)}
            placeholder="Collez votre token ici..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            data-testid="wialon-token-input" />
          <p className="text-xs text-gray-400 mt-1">Obtenez-le depuis votre compte Wialon (Parametres &gt; Tokens)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Serveur Wialon</label>
          <input type="text" value={host} onChange={e => setHost(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            data-testid="wialon-host-input" />
        </div>

        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} data-testid="wialon-save-btn"
            className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {config?.configured ? 'Mettre a jour' : 'Connecter'}
          </button>
          {config?.configured && (
            <button onClick={handleDelete} disabled={deleting}
              className="px-4 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50 flex items-center gap-1">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──
const FleetGeolocation = () => {
  const { authFetch } = useFleetAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await authFetch(`${API}/api/fleet/wialon/vehicles`);
      const data = await resp.json();
      if (!resp.ok) {
        if (resp.status === 400) {
          setConfigured(false);
          return;
        }
        throw new Error(data.detail || 'Erreur');
      }
      setVehicles(data.vehicles || []);
      setConfigured(true);
    } catch (err) {
      if (err.message?.includes('non configure')) {
        setConfigured(false);
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    // Check config first
    authFetch(`${API}/api/fleet/wialon/config`)
      .then(r => r.json())
      .then(data => {
        setConfigured(data.configured);
        if (data.configured) fetchVehicles();
      })
      .catch(() => setConfigured(false));
  }, [authFetch, fetchVehicles]);

  useEffect(() => {
    if (autoRefresh && configured) {
      intervalRef.current = setInterval(fetchVehicles, 30000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, configured, fetchVehicles]);

  const formatAge = (seconds) => {
    if (seconds < 60) return 'A l\'instant';
    if (seconds < 3600) return `il y a ${Math.round(seconds / 60)} min`;
    if (seconds < 86400) return `il y a ${Math.round(seconds / 3600)}h`;
    return `il y a ${Math.round(seconds / 86400)}j`;
  };

  const statusBadge = (status) => {
    const cfg = {
      online: { bg: 'bg-emerald-100 text-emerald-700', label: 'En ligne' },
      idle: { bg: 'bg-amber-100 text-amber-700', label: 'Inactif' },
      offline: { bg: 'bg-gray-100 text-gray-500', label: 'Hors ligne' },
    }[status] || { bg: 'bg-gray-100 text-gray-500', label: status };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg}`}>{cfg.label}</span>;
  };

  const onlineCount = vehicles.filter(v => v.status === 'online').length;
  const idleCount = vehicles.filter(v => v.status === 'idle').length;
  const offlineCount = vehicles.filter(v => v.status === 'offline').length;

  // Not configured state
  if (configured === false) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-20 text-center" data-testid="wialon-not-configured">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Geolocalisation des vehicules</h2>
        <p className="text-gray-500 mb-6">Connectez votre compte Wialon pour suivre vos vehicules en temps reel sur la carte.</p>
        <button onClick={() => setShowSettings(true)} data-testid="wialon-setup-btn"
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition flex items-center gap-2 mx-auto">
          <Settings className="w-5 h-5" /> Configurer Wialon
        </button>
        <WialonSettings open={showSettings} onClose={() => setShowSettings(false)} authFetch={authFetch}
          onSaved={() => { setConfigured(true); fetchVehicles(); }} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4" data-testid="fleet-geolocation-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Geolocalisation</h1>
          <p className="text-sm text-gray-500">{vehicles.length} vehicules trouves</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stats pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
              <Wifi className="w-3 h-3" /> {onlineCount}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full">
              <Clock className="w-3 h-3" /> {idleCount}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
              <WifiOff className="w-3 h-3" /> {offlineCount}
            </span>
          </div>
          <button onClick={() => setAutoRefresh(!autoRefresh)} data-testid="wialon-auto-refresh"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${autoRefresh ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Auto {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button onClick={fetchVehicles} disabled={loading} data-testid="wialon-refresh-btn"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowSettings(true)} data-testid="wialon-settings-btn"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100vh - 180px)' }}>
        {/* Map */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm min-h-[400px]">
          {vehicles.length > 0 ? (
            <VehicleMap vehicles={vehicles} selectedId={selectedId} onSelect={setSelectedId} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <p>Aucun vehicule avec position GPS</p>}
            </div>
          )}
        </div>

        {/* Vehicle list */}
        <div className="w-full lg:w-80 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">Vehicules ({vehicles.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {vehicles.map(v => (
              <button key={v.id} onClick={() => setSelectedId(v.id === selectedId ? null : v.id)}
                data-testid={`wialon-vehicle-${v.id}`}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${v.id === selectedId ? 'bg-emerald-50 border-l-2 border-emerald-500' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">{v.name}</span>
                  {statusBadge(v.status)}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3 h-3" /> {v.speed} km/h
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatAge(v.ageSeconds)}
                  </span>
                  {v.id === selectedId && <ChevronRight className="w-3 h-3 ml-auto text-emerald-500" />}
                </div>
              </button>
            ))}
            {vehicles.length === 0 && !loading && (
              <div className="p-6 text-center text-sm text-gray-400">Aucun vehicule</div>
            )}
          </div>
        </div>
      </div>

      <WialonSettings open={showSettings} onClose={() => setShowSettings(false)} authFetch={authFetch}
        onSaved={() => fetchVehicles()} />
    </div>
  );
};

export default FleetGeolocation;
