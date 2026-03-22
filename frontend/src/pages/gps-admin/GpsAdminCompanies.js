import React, { useState, useEffect, useCallback } from 'react';
import { useGpsAdmin } from './GpsAdminAuthContext';
import { Plus, Search, Loader2, X, Pencil, Trash2, Building2, Router } from 'lucide-react';
import { toast } from 'sonner';

const GpsAdminCompanies = () => {
  const { authFetch } = useGpsAdmin();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCompany, setEditCompany] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await authFetch('/api/gps-admin/companies');
      if (res.ok) setCompanies((await res.json()).companies || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => { load(); }, [load]);

  const filtered = companies.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.name||'').toLowerCase().includes(q) || (c.companyId||'').toLowerCase().includes(q) || (c.contactEmail||'').toLowerCase().includes(q);
  });

  const handleDelete = async (company) => {
    if (!window.confirm(`Supprimer "${company.name}" ? Les appareils seront desassignes.`)) return;
    try {
      const res = await authFetch(`/api/gps-admin/companies/${company.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).detail);
      toast.success('Societe supprimee');
      load();
    } catch (e) { toast.error(e.message); }
  };

  const handleToggle = async (company) => {
    try {
      const res = await authFetch(`/api/gps-admin/companies/${company.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !company.active }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      toast.success(company.active ? 'Desactive' : 'Active');
      load();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div data-testid="gps-admin-companies">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-900">Societes partenaires</h1>
        <button onClick={() => setShowForm(true)} data-testid="add-company-btn"
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
          data-testid="companies-search" />
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center h-40"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
            {companies.length === 0 ? 'Aucune societe' : 'Aucun resultat'}
          </div>
        ) : (
          filtered.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5" data-testid={`company-card-${c.companyId}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{c.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">ID: {c.companyId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleToggle(c)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition ${c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                    {c.active ? 'Actif' : 'Inactif'}
                  </button>
                  <button onClick={() => { setEditCompany(c); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                {c.contactEmail && <span>{c.contactEmail}</span>}
                {c.phone && <span>{c.phone}</span>}
                <span className="flex items-center gap-1"><Router className="w-3 h-3" />{c.deviceCount || 0}/{c.maxDevices} appareils</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <CompanyFormModal company={editCompany} authFetch={authFetch}
          onClose={() => { setShowForm(false); setEditCompany(null); }} onSaved={load} />
      )}
    </div>
  );
};

const CompanyFormModal = ({ company, authFetch, onClose, onSaved }) => {
  const isEdit = !!company;
  const [name, setName] = useState(company?.name || '');
  const [companyId, setCompanyId] = useState(company?.companyId || '');
  const [email, setEmail] = useState(company?.contactEmail || '');
  const [phone, setPhone] = useState(company?.phone || '');
  const [maxDevices, setMaxDevices] = useState(company?.maxDevices || 50);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEdit ? `/api/gps-admin/companies/${company.id}` : '/api/gps-admin/companies';
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit
        ? { name, contactEmail: email, phone, maxDevices }
        : { name, companyId, contactEmail: email, phone, maxDevices };
      const res = await authFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error((await res.json()).detail);
      toast.success(isEdit ? 'Modifie' : 'Societe creee');
      onSaved(); onClose();
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const inputCls = 'w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none';

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-gray-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">{isEdit ? 'Modifier societe' : 'Nouvelle societe'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom de la societe</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Transport Express" className={inputCls} required />
          </div>
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Company ID (C# backend)</label>
              <input value={companyId} onChange={e => setCompanyId(e.target.value)} placeholder="ID de la societe dans le systeme Zont" className={`${inputCls} font-mono`} required />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@..." className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Telephone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+33..." className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Max appareils</label>
            <input type="number" value={maxDevices} onChange={e => setMaxDevices(parseInt(e.target.value) || 50)} className={inputCls} min={1} />
          </div>
          <button type="submit" disabled={saving}
            className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
            {isEdit ? 'Enregistrer' : 'Creer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GpsAdminCompanies;
