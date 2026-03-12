import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { Plus, Trash2, Edit2, X, Users, Loader2, Eye, EyeOff } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const PartnersManager = () => {
  const { user } = useAdminAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', password: '', status: 'active' });

  const token = localStorage.getItem('admin_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/partner/admin/partners`, { headers });
      if (res.ok) setPartners(await res.json());
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId ? `${API}/api/partner/admin/partners/${editId}` : `${API}/api/partner/admin/partners`;
    const method = editId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (res.ok) {
        setShowForm(false); setEditId(null);
        setForm({ name: '', email: '', phone: '', company: '', password: '', status: 'active' });
        fetchPartners();
      }
    } catch {}
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setForm({ name: p.name, email: p.email, phone: p.phone || '', company: p.company || '', password: '', status: p.status });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce partenaire ?')) return;
    await fetch(`${API}/api/partner/admin/partners/${id}`, { method: 'DELETE', headers });
    fetchPartners();
  };

  return (
    <div data-testid="partners-manager">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-bold text-white">Partenaires / Chauffeurs</h1>
          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full">{partners.length}</span>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', email: '', phone: '', company: '', password: '', status: 'active' }); }}
          className="flex items-center gap-2 bg-amber-500 text-slate-950 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-400 transition" data-testid="add-partner-btn">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">{editId ? 'Modifier' : 'Nouveau'} Partenaire</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" data-testid="partner-name" />
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required disabled={!!editId}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50" data-testid="partner-email" />
            <input placeholder="Telephone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" data-testid="partner-phone" />
            <input placeholder="Societe" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" data-testid="partner-company" />
            <div className="relative">
              <input placeholder={editId ? 'Nouveau mot de passe (laisser vide)' : 'Mot de passe'} type={showPw ? 'text' : 'password'}
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required={!editId}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm w-full pr-10" data-testid="partner-password" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-2 text-slate-400">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" data-testid="partner-status">
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 text-sm hover:text-white">Annuler</button>
              <button type="submit" className="bg-amber-500 text-slate-950 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-amber-400" data-testid="partner-submit">{editId ? 'Modifier' : 'Creer'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-amber-400 animate-spin" /></div>
      ) : partners.length === 0 ? (
        <div className="text-center py-12 text-slate-500">Aucun partenaire</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="partners-table">
            <thead><tr className="border-b border-slate-800">
              <th className="text-left py-3 px-3 text-slate-400 font-medium">Nom</th>
              <th className="text-left py-3 px-3 text-slate-400 font-medium">Email</th>
              <th className="text-left py-3 px-3 text-slate-400 font-medium">Societe</th>
              <th className="text-left py-3 px-3 text-slate-400 font-medium">Telephone</th>
              <th className="text-left py-3 px-3 text-slate-400 font-medium">Statut</th>
              <th className="text-right py-3 px-3 text-slate-400 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {partners.map(p => (
                <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                  <td className="py-3 px-3 text-white">{p.name}</td>
                  <td className="py-3 px-3 text-slate-300">{p.email}</td>
                  <td className="py-3 px-3 text-slate-300">{p.company || '-'}</td>
                  <td className="py-3 px-3 text-slate-300">{p.phone || '-'}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {p.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button onClick={() => handleEdit(p)} className="text-slate-400 hover:text-amber-400 mr-2"><Edit2 className="w-4 h-4 inline" /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PartnersManager;
