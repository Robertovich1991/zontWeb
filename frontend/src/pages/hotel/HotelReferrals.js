import React, { useState, useEffect } from 'react';
import { useHotelAuth } from './HotelAuthContext';
import { Loader2, Link as LinkIcon } from 'lucide-react';

const STATUS = {
  pending: { label: 'En attente', cls: 'bg-yellow-50 text-yellow-700' },
  validated: { label: 'Validee', cls: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Annulee', cls: 'bg-red-50 text-red-600' },
  paid: { label: 'Versee', cls: 'bg-blue-50 text-blue-700' },
};

const HotelReferrals = () => {
  const { authFetch } = useHotelAuth();
  const [data, setData] = useState({ referrals: [], totals: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/hotel/referrals')
      .then(r => r.ok ? r.json() : { referrals: [], totals: {} })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authFetch]);

  const t = data.totals || {};

  return (
    <div className="space-y-5" data-testid="hotel-referrals-page">
      <div className="flex items-center gap-2">
        <LinkIcon className="w-5 h-5 text-emerald-500" />
        <h1 className="text-xl font-bold text-gray-900">Reservations via mon lien</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.keys(STATUS).map(k => (
          <div key={k} className={`rounded-xl p-4 ${STATUS[k].cls}`} data-testid={`hotel-referral-total-${k}`}>
            <p className="text-xs opacity-80">{STATUS[k].label}</p>
            <p className="text-xl font-bold">{(t[k]?.commission || 0).toFixed(2)} EUR</p>
            <p className="text-[11px] opacity-70">{t[k]?.count || 0} reservation(s)</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
        ) : data.referrals.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Aucune reservation via votre lien pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Reference</th>
                  <th className="text-left px-4 py-3">Trajet</th>
                  <th className="text-left px-4 py-3">Origine</th>
                  <th className="text-right px-4 py-3">Montant</th>
                  <th className="text-right px-4 py-3">Commission</th>
                  <th className="text-center px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.referrals.map(r => (
                  <tr key={r.id} data-testid={`hotel-referral-row-${r.id}`}>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{r.csharp_auction_id ? `#${r.csharp_auction_id}` : r.id}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="truncate max-w-[220px]">{r.pickup_address} → {r.dropoff_address}</div>
                      <div className="text-[11px] text-gray-400">{r.start_date}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{r.origin === 'partner_link' ? 'Lien partenaire' : r.origin}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{(r.amount || 0).toFixed(2)} EUR</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{(r.commission_amount || 0).toFixed(2)} EUR</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${(STATUS[r.status] || {}).cls}`}>{(STATUS[r.status] || {}).label || r.status}</span>
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

export default HotelReferrals;
