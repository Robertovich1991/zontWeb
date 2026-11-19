import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'sonner';
import { Loader2, Link as LinkIcon, CheckCircle, XCircle, Banknote } from 'lucide-react';

const STATUS = {
  pending: { label: 'En attente', cls: 'bg-yellow-50 text-yellow-700' },
  validated: { label: 'Validee', cls: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Annulee', cls: 'bg-red-50 text-red-600' },
  paid: { label: 'Versee', cls: 'bg-blue-50 text-blue-700' },
};

const AdminReferrals = () => {
  const { authFetch } = useAdminAuth();
  const [data, setData] = useState({ referrals: [], totals: {} });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [hotels, setHotels] = useState([]);
  const [hotelFilter, setHotelFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (statusFilter) qs.set('status', statusFilter);
      if (hotelFilter) qs.set('hotel_id', hotelFilter);
      const res = await authFetch(`/api/admin/referrals?${qs.toString()}`);
      if (res.ok) setData(await res.json());
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  }, [authFetch, statusFilter, hotelFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    authFetch('/api/admin/hotels').then(r => r.ok ? r.json() : []).then(d => setHotels(Array.isArray(d) ? d : (d.hotels || []))).catch(() => {});
  }, [authFetch]);

  const act = async (id, action, body) => {
    try {
      const res = await authFetch(`/api/admin/referrals/${id}/${action}`, {
        method: 'POST', body: JSON.stringify(body || {}),
      });
      if (res.ok) { toast.success('Mis a jour'); load(); }
      else toast.error('Action impossible');
    } catch { toast.error('Erreur'); }
  };

  const payout = (id) => {
    const method = window.prompt('Moyen de reglement (virement, especes...)', 'virement');
    if (method === null) return;
    const reference = window.prompt('Reference de reglement (optionnel)', '') || '';
    act(id, 'payout', { method, reference });
  };

  const t = data.totals || {};

  return (
    <div className="space-y-5" data-testid="admin-referrals-page">
      <div className="flex items-center gap-2">
        <LinkIcon className="w-5 h-5 text-emerald-500" />
        <h1 className="text-xl font-bold text-gray-900">Commissions partenaires (liens)</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.keys(STATUS).map(k => (
          <div key={k} className={`rounded-xl p-4 ${STATUS[k].cls}`} data-testid={`referral-total-${k}`}>
            <p className="text-xs opacity-80">{STATUS[k].label}</p>
            <p className="text-xl font-bold">{(t[k]?.commission || 0).toFixed(2)} EUR</p>
            <p className="text-[11px] opacity-70">{t[k]?.count || 0} reservation(s)</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={hotelFilter} onChange={e => setHotelFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" data-testid="referral-hotel-filter">
          <option value="">Tous les hotels</option>
          {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" data-testid="referral-status-filter">
          <option value="">Tous les statuts</option>
          {Object.keys(STATUS).map(k => <option key={k} value={k}>{STATUS[k].label}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
        ) : data.referrals.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Aucune commission partenaire pour ce filtre.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Hotel</th>
                  <th className="text-left px-4 py-3">Trajet</th>
                  <th className="text-left px-4 py-3">Origine</th>
                  <th className="text-right px-4 py-3">Montant</th>
                  <th className="text-right px-4 py-3">Taux</th>
                  <th className="text-right px-4 py-3">Commission</th>
                  <th className="text-center px-4 py-3">Statut</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.referrals.map(r => (
                  <tr key={r.id} data-testid={`referral-row-${r.id}`}>
                    <td className="px-4 py-3 text-gray-900 font-medium">{r.hotel_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="truncate max-w-[220px]">{r.pickup_address} → {r.dropoff_address}</div>
                      <div className="text-[11px] text-gray-400">{r.start_date}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{r.origin === 'partner_link' ? 'Lien partenaire' : r.origin}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{(r.amount || 0).toFixed(2)} EUR</td>
                    <td className="px-4 py-3 text-right text-gray-500">{r.commission_rate}%</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{(r.commission_amount || 0).toFixed(2)} EUR</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${(STATUS[r.status] || {}).cls}`}>{(STATUS[r.status] || {}).label || r.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status !== 'validated' && r.status !== 'paid' && (
                          <button onClick={() => act(r.id, 'validate')} title="Valider" className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600" data-testid={`referral-validate-${r.id}`}><CheckCircle className="w-4 h-4" /></button>
                        )}
                        {r.status !== 'cancelled' && r.status !== 'paid' && (
                          <button onClick={() => act(r.id, 'cancel')} title="Annuler" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" data-testid={`referral-cancel-${r.id}`}><XCircle className="w-4 h-4" /></button>
                        )}
                        {r.status === 'validated' && (
                          <button onClick={() => payout(r.id)} title="Marquer verse" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" data-testid={`referral-payout-${r.id}`}><Banknote className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReferrals;
