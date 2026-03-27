import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { Mail, Tag, Clock, CheckCircle, XCircle, Download, Search } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const PromoEmailsManager = () => {
  const { token } = useAdminAuth();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API}/api/promo/admin/emails`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      setEmails(data.emails || []);
    } catch {
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = emails.filter(e =>
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.code?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: emails.length,
    used: emails.filter(e => e.used).length,
    active: emails.filter(e => !e.used && new Date(e.expires_at) > new Date()).length,
    expired: emails.filter(e => !e.used && new Date(e.expires_at) <= new Date()).length,
  };

  const exportCSV = () => {
    const header = 'Email,Code,Reduction,Cree le,Expire le,Utilise,Utilise le\n';
    const rows = emails.map(e =>
      `${e.email},${e.code},${e.discount}%,${e.created_at},${e.expires_at},${e.used ? 'Oui' : 'Non'},${e.used_at || ''}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'promo_emails.csv';
    a.click();
  };

  return (
    <div data-testid="promo-emails-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Emails Clients</h1>
          <p className="text-gray-500 text-sm">Codes promo Welcome -10% generes</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors" data-testid="export-csv-btn">
          <Download className="w-4 h-4" /> Exporter CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total emails', value: stats.total, icon: Mail, color: 'blue' },
          { label: 'Codes utilises', value: stats.used, icon: CheckCircle, color: 'emerald' },
          { label: 'Codes actifs', value: stats.active, icon: Tag, color: 'amber' },
          { label: 'Codes expires', value: stats.expired, icon: XCircle, color: 'gray' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={`w-4 h-4 text-${s.color}-500`} />
              <span className="text-gray-500 text-xs">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par email ou code..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:border-emerald-500 focus:outline-none"
          data-testid="promo-search-input"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Aucun email collecte</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Code</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Reduction</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const isExpired = !item.used && new Date(item.expires_at) <= new Date();
                  const isUsed = item.used;
                  return (
                    <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50" data-testid={`promo-row-${i}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.email}</td>
                      <td className="px-4 py-3 font-mono text-gray-600 text-xs">{item.code}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">-{item.discount}%</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isUsed ? (
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">Utilise</span>
                        ) : isExpired ? (
                          <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">Expire</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">Actif</span>
                        )}
                      </td>
                    </tr>
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

export default PromoEmailsManager;
