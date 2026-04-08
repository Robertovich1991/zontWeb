import React, { useState, useEffect, useCallback } from 'react';
import { useDriverAuth } from './DriverAuthContext';
import { Calendar, Clock, MapPin, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function DriverHistory() {
  const { authFetch } = useDriverAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await authFetch('/api/driver/missions?tab=history');
      const data = await res.json();
      setMissions(data.missions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: '#1A1D29' }}>
          <Clock className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400 font-medium">Aucun historique</p>
        <p className="text-gray-600 text-sm mt-1">Vos missions terminees apparaitront ici</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
        Historique ({missions.length})
      </h2>
      {missions.map((m) => {
        const isCompleted = m.status === 'Completed';
        const isCancelled = m.status?.includes('Cancelled');
        return (
          <div
            key={m.id}
            data-testid={`history-card-${m.id}`}
            className="rounded-xl px-4 py-3"
            style={{ background: '#1A1D29', border: '1px solid #262A36' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : isCancelled ? (
                  <XCircle className="w-4 h-4 text-red-400" />
                ) : null}
                <span className={`text-xs font-medium ${isCompleted ? 'text-emerald-400' : isCancelled ? 'text-red-400' : 'text-gray-400'}`}>
                  {isCompleted ? 'Terminee' : isCancelled ? 'Annulee' : m.status}
                </span>
                <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded-full ${
                  m.source === 'zont' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {m.source === 'zont' ? 'Zont' : 'Societe'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Calendar className="w-3 h-3" />
                <span>{m.date}</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 mb-1">
              <div className="mt-1 w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <p className="text-gray-300 text-sm truncate">{m.startAddress || '-'}</p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="mt-1 w-2 h-2 rounded-full bg-red-400 shrink-0" />
              <p className="text-gray-300 text-sm truncate">{m.endAddress || '-'}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
