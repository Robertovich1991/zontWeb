import React, { useState, useCallback } from 'react';
import { Plane, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

const STATUS_CONFIG = {
  'on-time':   { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle, label: 'A l\'heure' },
  'landed':    { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle, label: 'Atterri' },
  'delayed':   { color: 'text-orange-600',  bg: 'bg-orange-50 border-orange-200',   icon: AlertTriangle, label: 'Retarde' },
  'en-route':  { color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200',       icon: Plane, label: 'En vol' },
  'cancelled': { color: 'text-red-600',     bg: 'bg-red-50 border-red-200',         icon: XCircle, label: 'Annule' },
  'scheduled': { color: 'text-gray-600',    bg: 'bg-gray-50 border-gray-200',       icon: Clock, label: 'Programme' },
  'unknown':   { color: 'text-gray-400',    bg: 'bg-gray-50 border-gray-200',       icon: Clock, label: 'Inconnu' },
};

const API = process.env.REACT_APP_BACKEND_URL;

const FlightBadge = ({ flightNumber, compact = false }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!flightNumber || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/flight-status?flight=${encodeURIComponent(flightNumber)}`);
      if (res.status === 404) { setError('Vol non trouve'); return; }
      if (res.status === 429) { setError('Quota API depasse'); return; }
      if (!res.ok) throw new Error('API error');
      setData(await res.json());
    } catch {
      setError('Erreur');
    } finally {
      setLoading(false);
    }
  }, [flightNumber, loading]);

  if (!flightNumber) return null;

  const cfg = data ? (STATUS_CONFIG[data.status] || STATUS_CONFIG.unknown) : null;
  const StatusIcon = cfg?.icon || Clock;

  // Compact badge for planning grid
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1">
        {!data && !loading && (
          <button
            onClick={(e) => { e.stopPropagation(); fetchStatus(); }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
            data-testid={`flight-badge-${flightNumber}`}
            title="Verifier le statut du vol"
          >
            <Plane className="w-3 h-3" />{flightNumber}
          </button>
        )}
        {loading && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500">
            <Loader2 className="w-3 h-3 animate-spin" />{flightNumber}
          </span>
        )}
        {data && !loading && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowDetail(!showDetail); }}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold ${cfg.bg} ${cfg.color} transition`}
            data-testid={`flight-status-${flightNumber}`}
          >
            <StatusIcon className="w-3 h-3" />
            {flightNumber}
            {data.delayMinutes > 0 && ` +${data.delayMinutes}min`}
          </button>
        )}
        {error && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-400">
            <Plane className="w-3 h-3" />{flightNumber}
          </span>
        )}
      </span>
    );
  }

  // Full detail card for booking detail view
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white" data-testid={`flight-detail-${flightNumber}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-sm text-gray-900">{flightNumber}</span>
          {data && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color}`}>
              <StatusIcon className="w-3 h-3 inline mr-0.5" />{cfg.label}
              {data.delayMinutes > 0 && ` +${data.delayMinutes}min`}
            </span>
          )}
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="p-1 rounded hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
          title={data?.fromCache ? 'Donnees en cache — Cliquer pour rafraichir' : 'Verifier le statut'}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>

      {!data && !loading && !error && (
        <button
          onClick={fetchStatus}
          className="w-full text-center py-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition"
        >
          Cliquer pour verifier le statut du vol
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500 py-1">{error}</p>
      )}

      {data && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <div>
            <span className="text-gray-400 block">Depart</span>
            <span className="text-gray-800 font-medium">{data.departureAirport} ({data.departureIata})</span>
          </div>
          <div>
            <span className="text-gray-400 block">Arrivee</span>
            <span className="text-gray-800 font-medium">{data.arrivalAirport} ({data.arrivalIata})</span>
          </div>
          <div>
            <span className="text-gray-400 block">Heure prevue</span>
            <span className="text-gray-800">{data.scheduledArrival ? new Date(data.scheduledArrival).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Retard</span>
            <span className={`font-semibold ${data.delayMinutes > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
              {data.delayMinutes > 0 ? `+${data.delayMinutes} min` : 'Aucun'}
            </span>
          </div>
          {data.terminal && (
            <div>
              <span className="text-gray-400 block">Terminal</span>
              <span className="text-gray-800 font-medium">{data.terminal}</span>
            </div>
          )}
          {data.gate && (
            <div>
              <span className="text-gray-400 block">Porte</span>
              <span className="text-gray-800 font-medium">{data.gate}</span>
            </div>
          )}
          {data.baggage && (
            <div>
              <span className="text-gray-400 block">Tapis bagage</span>
              <span className="text-gray-800 font-medium">{data.baggage}</span>
            </div>
          )}
          <div>
            <span className="text-gray-400 block">Mis a jour</span>
            <span className="text-gray-500 text-[10px]">
              {data.fromCache && '(cache) '}{new Date(data.cachedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightBadge;
