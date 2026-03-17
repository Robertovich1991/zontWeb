import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { CreditCard, Loader2, Check, Clock, RefreshCw, DollarSign, FileText, Building2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const statusCfg = {
  pending: { label: 'En attente', cls: 'bg-yellow-50 text-yellow-700' },
  paid: { label: 'Payee', cls: 'bg-emerald-50 text-emerald-700' },
};

const HotelPayments = () => {
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [payForm, setPayForm] = useState({ method: 'virement', reference: '' });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHotel, setFilterHotel] = useState('');

  const token = localStorage.getItem('admin_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, sumRes] = await Promise.all([
        fetch(`${API}/api/admin/hotels/invoices`, { headers }),
        fetch(`${API}/api/admin/hotels/invoices/summary`, { headers }),
      ]);
      if (invRes.ok) setInvoices(await invRes.json());
      if (sumRes.ok) setSummary(await sumRes.json());
    } catch { toast.error('Erreur'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const now = new Date();
      const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const res = await fetch(`${API}/api/admin/hotels/invoices/generate`, {
        method: 'POST', headers, body: JSON.stringify({ period }),
      });
      const data = await res.json();
      if (res.ok) { toast.success(data.message); fetchData(); }
      else toast.error(data.detail || 'Erreur');
    } catch { toast.error('Erreur'); }
    finally { setGenerating(false); }
  };

  const handlePay = async (invoiceId) => {
    try {
      const res = await fetch(`${API}/api/admin/hotels/invoices/${invoiceId}/pay`, {
        method: 'PUT', headers,
        body: JSON.stringify({ payment_method: payForm.method, payment_reference: payForm.reference }),
      });
      if (res.ok) { toast.success('Facture payee'); setPayingId(null); setPayForm({ method: 'virement', reference: '' }); fetchData(); }
      else { const d = await res.json(); toast.error(d.detail || 'Erreur'); }
    } catch { toast.error('Erreur'); }
  };

  const hotels = [...new Set(invoices.map(i => i.hotel_name))].sort();
  const filtered = invoices.filter(i => {
    if (filterStatus && i.status !== filterStatus) return false;
    if (filterHotel && i.hotel_name !== filterHotel) return false;
    return true;
  });

  return (
    <div className="space-y-6" data-testid="hotel-payments">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paiements Hotels</h1>
          <p className="text-gray-500 text-sm mt-1">Gestion des commissions et facturation</p>
        </div>
        <button onClick={handleGenerate} disabled={generating} data-testid="generate-invoices-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50 shadow-sm">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Generer factures du mois
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <FileText className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{summary.total_invoices}</p>
            <p className="text-xs text-gray-500">Total factures</p>
          </div>
          <div className="bg-white border border-yellow-100 rounded-xl p-4 shadow-sm">
            <Clock className="w-5 h-5 text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{summary.pending_amount.toLocaleString('fr-FR')} EUR</p>
            <p className="text-xs text-gray-500">{summary.pending_count} en attente</p>
          </div>
          <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm">
            <Check className="w-5 h-5 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-emerald-600">{summary.paid_amount.toLocaleString('fr-FR')} EUR</p>
            <p className="text-xs text-gray-500">{summary.paid_count} payee(s)</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <DollarSign className="w-5 h-5 text-gray-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{(summary.pending_amount + summary.paid_amount).toLocaleString('fr-FR')} EUR</p>
            <p className="text-xs text-gray-500">Commissions totales</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-3">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} data-testid="payment-filter-status"
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
          <option value="">Tous statuts</option>
          <option value="pending">En attente</option>
          <option value="paid">Payee</option>
        </select>
        <select value={filterHotel} onChange={e => setFilterHotel(e.target.value)} data-testid="payment-filter-hotel"
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">
          <option value="">Tous les hotels</option>
          {hotels.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <button onClick={fetchData} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-100">
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune facture</p>
          <p className="text-gray-400 text-sm mt-1">Cliquez "Generer factures du mois" pour creer</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="invoices-table">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="text-left px-4 py-3">Facture</th>
                  <th className="text-left px-4 py-3">Hotel</th>
                  <th className="text-center px-4 py-3">Periode</th>
                  <th className="text-center px-4 py-3">Res.</th>
                  <th className="text-right px-4 py-3">CA</th>
                  <th className="text-right px-4 py-3">Commission</th>
                  <th className="text-center px-4 py-3">Echeance</th>
                  <th className="text-center px-4 py-3">Statut</th>
                  <th className="text-center px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(inv => {
                  const sc = statusCfg[inv.status] || statusCfg.pending;
                  return (
                    <React.Fragment key={inv.id}>
                      <tr className="hover:bg-gray-50" data-testid={`invoice-row-${inv.id}`}>
                        <td className="px-4 py-3 text-gray-900 font-mono text-xs">{inv.id}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" /><span className="text-gray-900 text-sm">{inv.hotel_name}</span></div></td>
                        <td className="px-4 py-3 text-center text-gray-700">{inv.period}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{inv.bookings_count}</td>
                        <td className="px-4 py-3 text-right text-gray-900 font-medium">{inv.total_revenue.toLocaleString('fr-FR')} EUR</td>
                        <td className="px-4 py-3 text-right text-amber-600 font-semibold">{inv.commission_amount.toLocaleString('fr-FR')} EUR</td>
                        <td className="px-4 py-3 text-center text-gray-500 text-xs">{inv.due_date}</td>
                        <td className="px-4 py-3 text-center"><span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.cls}`}>{sc.label}</span></td>
                        <td className="px-4 py-3 text-center">
                          {inv.status === 'pending' ? (
                            <button onClick={() => setPayingId(payingId === inv.id ? null : inv.id)}
                              className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100" data-testid={`pay-btn-${inv.id}`}>
                              <CreditCard className="w-3 h-3 inline mr-1" />Payer
                            </button>
                          ) : <span className="text-gray-400 text-xs">{inv.paid_at?.slice(0, 10)}</span>}
                        </td>
                      </tr>
                      {payingId === inv.id && (
                        <tr className="bg-emerald-50/50">
                          <td colSpan={9} className="px-4 py-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <select value={payForm.method} onChange={e => setPayForm(p => ({ ...p, method: e.target.value }))}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white" data-testid="pay-method-select">
                                <option value="virement">Virement bancaire</option>
                                <option value="cheque">Cheque</option>
                                <option value="especes">Especes</option>
                              </select>
                              <input type="text" placeholder="Reference paiement..." value={payForm.reference}
                                onChange={e => setPayForm(p => ({ ...p, reference: e.target.value }))}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white flex-1 min-w-[150px]" data-testid="pay-reference-input" />
                              <button onClick={() => handlePay(inv.id)}
                                className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600" data-testid="confirm-pay-btn">
                                <Check className="w-3 h-3 inline mr-1" />Confirmer
                              </button>
                              <button onClick={() => setPayingId(null)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">Annuler</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelPayments;
