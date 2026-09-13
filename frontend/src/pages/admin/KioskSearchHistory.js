import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Search, TrendingUp, MapPin, CheckCircle2, XCircle } from 'lucide-react';

const StatusPill = ({ s }) => s === 'booked'
  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3" />Réservé</span>
  : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><XCircle className="w-3 h-3" />Non réservé</span>;

const KioskSearchHistory = ({ slug, hotelName, onBack }) => {
  const { authFetch } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ items: [], top: [], total: 0, not_booked_total: 0 });
  const [status, setStatus] = useState('not_booked');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (status !== 'all') p.set('status', status);
      if (dateFrom) p.set('date_from', dateFrom);
      if (dateTo) p.set('date_to', dateTo);
      const res = await authFetch(`/api/admin/kiosk/${slug}/searches?${p.toString()}`);
      if (res.status === 404) { setData({ items: [], top: [], total: 0, not_booked_total: 0 }); return; }
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch { toast.error('Erreur de chargement de l\'historique'); }
    finally { setLoading(false); }
  }, [authFetch, slug, status, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 -m-4 lg:-m-6 p-4 lg:p-6 space-y-6" data-testid="kiosk-search-history">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800" data-testid="search-history-back">
        <ArrowLeft className="w-4 h-4" /> Retour à la gestion des hôtels
      </button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center"><Search className="w-5 h-5 text-emerald-600" /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="search-history-title">Historique des recherches — {hotelName}</h1>
          <p className="text-gray-500 text-sm">Destinations recherchées sur la borne. Total : {data.total} · Non réservées : <b className="text-amber-600">{data.not_booked_total}</b></p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap items-end gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1" data-testid="search-status-filter">
          {[['not_booked', 'Non réservées'], ['booked', 'Réservées'], ['all', 'Toutes']].map(([v, l]) => (
            <button key={v} onClick={() => setStatus(v)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${status === v ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-800'}`} data-testid={`status-${v}`}>{l}</button>
          ))}
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Du</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" data-testid="search-date-from" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Au</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900" data-testid="search-date-to" />
        </div>
        {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-sm text-gray-500 hover:text-gray-800 underline">Effacer dates</button>}
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top destinations */}
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm p-4" data-testid="search-top">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-600" /> Les plus recherchées</h2>
            {data.top.length === 0 && <p className="text-gray-400 text-sm">Aucune donnée.</p>}
            <div className="space-y-2">
              {data.top.map((t, i) => (
                <div key={i} className="flex items-center justify-between gap-2 py-2 border-b border-gray-50 last:border-0" data-testid={`top-row-${i}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <span className="text-sm text-gray-800 truncate">{t.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-amber-600">{t.not_booked} non rés.</span>
                    <span className="text-sm font-bold text-gray-900">{t.count}×</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search list */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden" data-testid="search-list">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Destination</th>
                  <th className="text-right px-4 py-3 font-medium">Prix</th>
                  <th className="text-right px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Aucune recherche pour ce filtre.</td></tr>}
                {data.items.map((s, i) => (
                  <tr key={i} data-testid={`search-row-${i}`}>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(s.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /><span className="text-gray-900 font-medium">{s.destination_name}</span></div>
                      {s.destination_address && <p className="text-xs text-gray-400 truncate max-w-xs">{s.destination_address}</p>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">{s.price != null ? `${s.price} €` : '—'}</td>
                    <td className="px-4 py-3 text-right"><StatusPill s={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default KioskSearchHistory;
