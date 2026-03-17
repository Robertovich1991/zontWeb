import React, { useState, useEffect } from 'react';
import { useHotelAuth } from './HotelAuthContext';
import { toast } from 'sonner';
import { FileText, Loader2, Check, Clock, Download, CreditCard, TrendingUp } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const statusCfg = {
  pending: { label: 'En attente', cls: 'bg-yellow-50 text-yellow-700', icon: Clock },
  paid: { label: 'Payee', cls: 'bg-emerald-50 text-emerald-700', icon: Check },
};

const HotelInvoices = () => {
  const { authFetch } = useHotelAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/hotel/invoices').then(r => r.ok ? r.json() : [])
      .then(d => setInvoices(d))
      .catch(() => toast.error('Erreur'))
      .finally(() => setLoading(false));
  }, []);

  const totalCommission = invoices.reduce((s, i) => s + (i.commission_amount || 0), 0);
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.commission_amount || 0), 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + (i.commission_amount || 0), 0);

  const handleDownload = (invoiceId) => {
    const token = localStorage.getItem('hotel_token');
    window.open(`${API}/api/hotel/invoices/${invoiceId}/download?token=${token}`, '_blank');
  };

  return (
    <div className="space-y-6" data-testid="hotel-invoices">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facturation</h1>
        <p className="text-gray-500 text-sm mt-1">Historique de vos factures et paiements de commissions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <TrendingUp className="w-5 h-5 text-gray-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalCommission.toLocaleString('fr-FR')} EUR</p>
          <p className="text-xs text-gray-500">Commission totale</p>
        </div>
        <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm">
          <Check className="w-5 h-5 text-emerald-600 mb-2" />
          <p className="text-2xl font-bold text-emerald-600">{paidAmount.toLocaleString('fr-FR')} EUR</p>
          <p className="text-xs text-gray-500">Deja paye</p>
        </div>
        <div className="bg-white border border-yellow-100 rounded-xl p-4 shadow-sm">
          <Clock className="w-5 h-5 text-yellow-600 mb-2" />
          <p className="text-2xl font-bold text-yellow-600">{pendingAmount.toLocaleString('fr-FR')} EUR</p>
          <p className="text-xs text-gray-500">En attente</p>
        </div>
      </div>

      {/* Invoice List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune facture pour le moment</p>
          <p className="text-gray-400 text-sm mt-1">Vos factures apparaitront ici une fois generees</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => {
            const sc = statusCfg[inv.status] || statusCfg.pending;
            const StatusIcon = sc.icon;
            return (
              <div key={inv.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm" data-testid={`hotel-invoice-${inv.id}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-gray-900 font-semibold text-sm">{inv.id}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.cls}`}>
                          <StatusIcon className="w-3 h-3" />{sc.label}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">Periode: <span className="text-gray-700 font-medium">{inv.period}</span></p>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs text-gray-500">
                        <span>{inv.bookings_count} reservation{inv.bookings_count > 1 ? 's' : ''}</span>
                        <span>CA: {inv.total_revenue.toLocaleString('fr-FR')} EUR</span>
                        <span>Taux: {inv.commission_rate}%</span>
                        <span>Echeance: {inv.due_date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <p className="text-xl font-bold text-amber-600">{inv.commission_amount.toLocaleString('fr-FR')} EUR</p>
                    <button onClick={() => handleDownload(inv.id)} data-testid={`download-invoice-${inv.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-xs hover:bg-gray-100 transition">
                      <Download className="w-3 h-3" /> Telecharger
                    </button>
                  </div>
                </div>
                {inv.status === 'paid' && inv.paid_at && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                    <CreditCard className="w-3 h-3" />
                    Paye le {inv.paid_at.slice(0, 10)} par {inv.payment_method || '-'}
                    {inv.payment_reference && <span className="text-gray-400">— Ref: {inv.payment_reference}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HotelInvoices;
