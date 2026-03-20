import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFleetAuth } from './FleetAuthContext';
import { MapPin, Settings, RefreshCw, Wifi, WifiOff, Clock, Gauge, ChevronRight, X, Check, Trash2, Loader2, Eye, EyeOff, LogIn, LogOut, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// ── Map Component ──
const VehicleMap = ({ vehicles, selectedId, onSelect }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const initMap = async () => {
      const L = await import('leaflet');
      if (mapInstanceRef.current) return;
      const map = L.map(mapRef.current, { center: [48.8566, 2.3522], zoom: 11, zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap', maxZoom: 19,
      }).addTo(map);
      mapInstanceRef.current = map;
    };
    initMap();
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  useEffect(() => {
    const updateMarkers = async () => {
      const L = await import('leaflet');
      const map = mapInstanceRef.current;
      if (!map) return;
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];
      const valid = vehicles.filter(v => v.lat && v.lon && (v.lat !== 0 || v.lon !== 0));
      if (valid.length === 0) return;
      valid.forEach(v => {
        const sel = v.id === selectedId;
        const color = v.status === 'online' ? '#10b981' : v.status === 'idle' ? '#f59e0b' : '#6b7280';
        const sz = sel ? 16 : 10;
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:${sz}px;height:${sz}px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);${sel ? 'transform:scale(1.5);z-index:999;' : ''}"></div>`,
          iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2],
        });
        const marker = L.marker([v.lat, v.lon], { icon }).addTo(map)
          .bindPopup(`<b>${v.name}</b><br/>Vitesse: ${v.speed} km/h<br/>Statut: ${v.status}`);
        marker.on('click', () => onSelect(v.id));
        markersRef.current.push(marker);
      });
      if (!selectedId && valid.length > 0) {
        map.fitBounds(L.latLngBounds(valid.map(v => [v.lat, v.lon])), { padding: [40, 40], maxZoom: 14 });
      }
      if (selectedId) {
        const s = valid.find(v => v.id === selectedId);
        if (s) map.setView([s.lat, s.lon], 15, { animate: true });
      }
    };
    updateMarkers();
  }, [vehicles, selectedId, onSelect]);

  return <div ref={mapRef} className="w-full h-full rounded-xl" style={{ minHeight: 400 }} />;
};

// ── Login Modal ──
const WialonLogin = ({ open, onClose, authFetch, onConnected }) => {
  const [tab, setTab] = useState('token'); // 'token' | 'password'
  const [host, setHost] = useState('hst-api.wialon.com');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [wialonToken, setWialonToken] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (open) {
      authFetch('/api/fleet/wialon/config').then(async r => {
        const data = await r.json();
        setConfig(data);
        if (data.configured) {
          setHost(data.host || 'hst-api.wialon.com');
          setTab(data.authMode || 'token');
        }
      }).catch(() => {});
      setStatus('idle');
      setErrorMsg('');
    }
  }, [open, authFetch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('connecting');
    setErrorMsg('');

    try {
      let resp;
      if (tab === 'token') {
        if (!wialonToken.trim()) return (setStatus('idle'), toast.error('Collez votre token Wialon'));
        resp = await authFetch('/api/fleet/wialon/login-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            host: host.trim().replace('https://', '').replace('http://', '').replace(/\/$/, ''),
            token: wialonToken.trim(),
          }),
        });
      } else {
        if (!username.trim() || !password.trim()) return (setStatus('idle'), toast.error('Remplissez tous les champs'));
        resp = await authFetch('/api/fleet/wialon/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            host: host.trim().replace('https://', '').replace('http://', '').replace(/\/$/, ''),
            username: username.trim(),
            password: password,
            remember,
          }),
        });
      }

      const text = await resp.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { detail: text || 'Erreur inconnue' }; }
      if (!resp.ok) throw new Error(data.detail || 'Connexion echouee');

      setStatus('success');
      toast.success(data.message || 'Connexion Wialon reussie');
      setTimeout(() => { onConnected(data.vehicles || []); onClose(); }, 1200);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
      toast.error(err.message);
    }
  };

  const handleDisconnect = async () => {
    try {
      await authFetch('/api/fleet/wialon/config', { method: 'DELETE' });
      toast.success('Deconnexion effectuee');
      setConfig(null);
      setUsername(''); setPassword(''); setWialonToken('');
      setStatus('idle');
      onConnected([]);
    } catch (err) {
      toast.error('Erreur de deconnexion');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()} data-testid="wialon-login-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Connexion Wialon</h3>
              <p className="text-xs text-gray-400">Suivi GPS en temps reel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition"><X className="w-4 h-4 text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Connected status */}
          {config?.configured && status !== 'success' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-emerald-700">Connecte ({config.authMode === 'token' ? 'Token' : 'Login'})</span>
                </div>
                <button onClick={handleDisconnect} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                  <LogOut className="w-3 h-3" /> Deconnecter
                </button>
              </div>
              <p className="text-xs text-emerald-600 mt-1">Utilisateur: {config.wialonUser || config.username}</p>
              <p className="text-xs text-emerald-600">Serveur: {config.host}</p>
            </div>
          )}

          {/* Success state */}
          {status === 'success' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-emerald-700">Connexion Wialon reussie</p>
              <p className="text-xs text-emerald-500 mt-1">Chargement des vehicules...</p>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          {/* Auth mode tabs */}
          {status !== 'success' && (
            <>
              <div className="flex bg-gray-100 rounded-lg p-0.5" data-testid="wialon-auth-tabs">
                <button onClick={() => setTab('token')} data-testid="wialon-tab-token"
                  className={`flex-1 py-2 text-xs font-medium rounded-md transition ${tab === 'token' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                  Token (recommande)
                </button>
                <button onClick={() => setTab('password')} data-testid="wialon-tab-password"
                  className={`flex-1 py-2 text-xs font-medium rounded-md transition ${tab === 'password' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                  Login / Mot de passe
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Serveur Wialon</label>
                  <input type="text" value={host} onChange={e => setHost(e.target.value)}
                    placeholder="hst-api.wialon.com"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    data-testid="wialon-host-input" />
                </div>

                {tab === 'token' ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Token d'acces Wialon</label>
                    <textarea value={wialonToken} onChange={e => setWialonToken(e.target.value)}
                      placeholder="Collez votre token ici (72 caracteres)..."
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono resize-none"
                      data-testid="wialon-token-input" />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Wialon Hosting &gt; Nom d'utilisateur &gt; Parametres &gt; Tokens &gt; Creer un token
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Nom d'utilisateur</label>
                      <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                        placeholder="Votre identifiant Wialon" autoComplete="username"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        data-testid="wialon-username-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Mot de passe</label>
                      <div className="relative">
                        <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                          placeholder="Votre mot de passe Wialon" autoComplete="current-password"
                          className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          data-testid="wialon-password-input" />
                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                      <span className="text-xs text-gray-500">Memoriser la connexion</span>
                    </label>
                  </>
                )}

                <button type="submit" disabled={status === 'connecting'} data-testid="wialon-connect-btn"
                  className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-medium text-sm hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {status === 'connecting' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Connexion en cours...</>
                  ) : (
                    <><LogIn className="w-4 h-4" /> Se connecter</>
                  )}
                </button>
              </form>
            </>
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
  const [configured, setConfigured] = useState(null); // null=loading, false, true
  const [config, setConfig] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await authFetch('/api/fleet/wialon/vehicles');
      const text = await resp.text();
      let data;
      try { data = JSON.parse(text); } catch { data = {}; }
      if (!resp.ok) {
        if (resp.status === 400) { setConfigured(false); return; }
        throw new Error(data.detail || 'Erreur');
      }
      setVehicles(data.vehicles || []);
      setConfigured(true);
    } catch (err) {
      if (err.message?.includes('non configure') || err.message?.includes('Reconnectez')) {
        setConfigured(false);
      } else {
        toast.error(err.message);
      }
    } finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => {
    authFetch('/api/fleet/wialon/config').then(async r => {
      const data = await r.json();
      setConfig(data);
      setConfigured(data.configured);
      if (data.configured) fetchVehicles();
    }).catch(() => setConfigured(false));
  }, [authFetch, fetchVehicles]);

  useEffect(() => {
    if (autoRefresh && configured) {
      intervalRef.current = setInterval(fetchVehicles, 30000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, configured, fetchVehicles]);

  const handleConnected = (newVehicles) => {
    if (newVehicles.length > 0) {
      setVehicles(newVehicles);
      setConfigured(true);
    }
    // Refresh config
    authFetch('/api/fleet/wialon/config').then(async r => {
      const data = await r.json();
      setConfig(data);
      setConfigured(data.configured);
      if (data.configured && newVehicles.length === 0) fetchVehicles();
    }).catch(() => {});
  };

  const formatAge = (seconds) => {
    if (seconds < 60) return "A l'instant";
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

  // Not configured
  if (configured === false) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-20 text-center" data-testid="wialon-not-configured">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Geolocalisation des vehicules</h2>
        <p className="text-gray-500 mb-6 text-sm">Connectez votre compte Wialon pour suivre vos vehicules en temps reel.</p>
        <button onClick={() => setShowLogin(true)} data-testid="wialon-setup-btn"
          className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition flex items-center gap-2 mx-auto">
          <LogIn className="w-5 h-5" /> Se connecter a Wialon
        </button>
        <WialonLogin open={showLogin} onClose={() => setShowLogin(false)} authFetch={authFetch} onConnected={handleConnected} />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4" data-testid="fleet-geolocation-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Geolocalisation</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-xs text-gray-500">
              Wialon: {config?.wialonUser || config?.username || 'Connecte'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
          <button onClick={() => setShowLogin(true)} data-testid="wialon-settings-btn"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Reconfigurer Wialon">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map + List */}
      <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm min-h-[400px]">
          {vehicles.length > 0 ? (
            <VehicleMap vehicles={vehicles} selectedId={selectedId} onSelect={setSelectedId} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                <div className="text-center">
                  <MapPin className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Aucun vehicule avec position GPS</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Vehicules ({vehicles.length})</span>
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
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
                  <span className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {v.speed} km/h</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatAge(v.ageSeconds)}</span>
                  {v.id === selectedId && <ChevronRight className="w-3 h-3 ml-auto text-emerald-500" />}
                </div>
              </button>
            ))}
            {vehicles.length === 0 && !loading && (
              <div className="p-6 text-center text-sm text-gray-400">
                <p>Aucun vehicule trouve</p>
                <p className="text-xs mt-1">Verifiez votre compte Wialon</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <WialonLogin open={showLogin} onClose={() => setShowLogin(false)} authFetch={authFetch} onConnected={handleConnected} />
    </div>
  );
};

export default FleetGeolocation;
