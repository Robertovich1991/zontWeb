import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Building2, Calendar, MessageSquare, Globe, Eye, Trash2, Check, Clock, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = process.env.REACT_APP_BACKEND_URL;

export default function LeadsManager() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API}/api/leads`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/api/admin/leads/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
        if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Supprimer ce lead ?')) return;
    try {
      const res = await fetch(`${API}/api/admin/leads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== id));
        if (selected?.id === id) setSelected(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = leads.filter(l => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (l.name || '').toLowerCase().includes(s)
        || (l.company || '').toLowerCase().includes(s)
        || (l.email || '').toLowerCase().includes(s)
        || (l.phone || '').toLowerCase().includes(s);
    }
    return true;
  });

  const statusColors = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    contacted: 'bg-amber-50 text-amber-700 border-amber-200',
    converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    lost: 'bg-gray-50 text-gray-500 border-gray-200',
  };
  const statusLabels = { new: 'Nouveau', contacted: 'Contacte', converted: 'Converti', lost: 'Perdu' };

  const formatDate = (ts) => {
    if (!ts) return '-';
    const d = new Date(ts);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const counts = {
    all: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="leads-manager">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Leads B2B</h1>
              <p className="text-xs text-gray-500">{leads.length} demandes recues</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { key: 'all', label: 'Total', color: 'text-gray-900', bg: 'bg-white' },
            { key: 'new', label: 'Nouveaux', color: 'text-blue-600', bg: 'bg-blue-50' },
            { key: 'contacted', label: 'Contactes', color: 'text-amber-600', bg: 'bg-amber-50' },
            { key: 'converted', label: 'Convertis', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={`px-4 py-3 rounded-xl border transition-all text-left ${filter === s.key ? 'border-gray-900 shadow-sm' : 'border-gray-200'} ${s.bg}`}>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{counts[s.key] || 0}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            data-testid="leads-search"
            type="text"
            placeholder="Rechercher par nom, societe, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>

        {/* List + Detail */}
        <div className="flex gap-4">
          {/* List */}
          <div className={`${selected ? 'hidden sm:block sm:w-1/2 lg:w-2/5' : 'w-full'} space-y-2`}>
            {loading ? (
              <div className="text-center py-10 text-gray-400">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-400">Aucun lead trouve</div>
            ) : (
              filtered.map(lead => (
                <div
                  key={lead.id}
                  data-testid={`lead-card-${lead.id}`}
                  onClick={() => setSelected(lead)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${
                    selected?.id === lead.id ? 'border-blue-400 shadow-sm' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{lead.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />{lead.company}
                      </p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColors[lead.status] || statusColors.new}`}>
                      {statusLabels[lead.status] || lead.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>
                    {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3" />{formatDate(lead.timestamp)}
                    {lead.source_page && <><Globe className="w-3 h-3 ml-2" />{lead.source_page}</>}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 sticky top-6 h-fit" data-testid="lead-detail">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-gray-900">{selected.name}</h2>
                <button onClick={() => setSelected(null)} className="sm:hidden text-gray-400 hover:text-gray-600 text-xs">Fermer</button>
              </div>

              <div className="space-y-4">
                <InfoRow icon={Building2} label="Societe" value={selected.company} />
                <InfoRow icon={Mail} label="Email" value={selected.email} link={`mailto:${selected.email}`} />
                <InfoRow icon={Phone} label="Telephone" value={selected.phone || '-'} link={selected.phone ? `tel:${selected.phone}` : null} />
                <InfoRow icon={Globe} label="Page source" value={selected.source_page || '-'} />
                <InfoRow icon={Calendar} label="Date" value={formatDate(selected.timestamp)} />

                {selected.message && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" />Message</p>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">{selected.message}</div>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Changer le statut</p>
                <div className="flex flex-wrap gap-2">
                  {['new', 'contacted', 'converted', 'lost'].map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      data-testid={`status-btn-${s}`}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                        selected.status === s ? statusColors[s] + ' ring-2 ring-offset-1 ring-gray-300' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delete */}
              <div className="mt-4">
                <button
                  onClick={() => deleteLead(selected.id)}
                  data-testid="delete-lead-btn"
                  className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />Supprimer ce lead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, link }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
        {link ? (
          <a href={link} className="text-sm text-blue-600 hover:underline">{value}</a>
        ) : (
          <p className="text-sm text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}
