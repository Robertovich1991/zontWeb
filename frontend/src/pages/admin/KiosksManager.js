import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'sonner';
import { Wifi, WifiOff, Plus, Loader2, Building2, MapPin, Trash2, ToggleLeft, ToggleRight, Monitor, Calendar, Hash } from 'lucide-react';

const KiosksManager = () => {
  const { authFetch } = useAdminAuth();
  const [kiosks, setKiosks] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ hotel_id: '', name: '', location: '' });
  const [saving, setSaving] = useState(false);
  const [filterHotel, setFilterHotel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchData = async () => {
    try {
      const [kRes, hRes] = await Promise.all([
        authFetch('/api/admin/hotels/kiosks/all'),
        authFetch('/api/admin/hotels'),
      ]);
      if (kRes.ok) setKiosks(await kRes.json());
      if (hRes.ok) setHotels(await hRes.json());
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.hotel_id) { toast.error('Selectionnez un hotel'); return; }
    setSaving(true);
    try {
      const res = await authFetch('/api/admin/hotels/kiosks/create', { method: 'POST', body: JSON.stringify(form) });
      if (res.ok) { toast.success('Borne creee'); setShowForm(false); setForm({ hotel_id: '', name: '', location: '' }); fetchData(); }
      else { const err = await res.json().catch(() => ({})); toast.error(err.detail || 'Erreur'); }
    } catch { toast.error('Erreur'); }
    finally { setSaving(false); }
  };

  const handleToggleStatus = async (kiosk) => {
    const newStatus = kiosk.status === 'online' ? 'offline' : 'online';
    try {
      const res = await authFetch(`/api/admin/hotels/kiosks/${kiosk.id}/status`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
      if (res.ok) { toast.success(`Borne ${newStatus === 'online' ? 'en ligne' : 'hors ligne'}`); fetchData(); }
    } catch { toast.error('Erreur'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette borne ?')) return;
    try {
      const res = await authFetch(`/api/admin/hotels/kiosks/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Borne supprimee'); fetchData(); }
    } catch { toast.error('Erreur'); }
  };

  const filtered = kiosks.filter(k =>
    (!filterHotel || k.hotel_id === filterHotel) &&
    (!filterStatus || k.status === filterStatus)
  );

  const onlineCount = kiosks.filter(k => k.status === 'online').length;
  const offlineCount = kiosks.filter(k => k.status === 'offline').length;

  return (
    <div className="min-h-screen bg-gray-50 -m-4 lg:-m-6 p-4 lg:p-6 space-y-6" data-testid="kiosks-manager">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bornes Tactiles</h1>
          <p className="text-gray-500 text-sm mt-1">{kiosks.length} borne{kiosks.length > 1 ? 's' : ''} — <span className="text-emerald-600">{onlineCount} en ligne</span> · <span className="text-red-500">{offlineCount} hors ligne</span></p>
        </div>
        <button onClick={() => setShowForm(!showForm)} data-testid="create-kiosk-btn"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition shadow-sm">
          <Plus className="w-4 h-4" /> Ajouter une borne
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
          <Monitor className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{kiosks.length}</p>
          <p className="text-xs text-gray-500">Total bornes</p>
        </div>
        <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm text-center">
          <Wifi className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-emerald-600">{onlineCount}</p>
          <p className="text-xs text-gray-500">En ligne</p>
        </div>
        <div className="bg-white border border-red-100 rounded-xl p-4 shadow-sm text-center">
          <WifiOff className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-500">{offlineCount}</p>
          <p className="text-xs text-gray-500">Hors ligne</p>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4" data-testid="kiosk-form">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Nouvelle borne</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Hotel <span className="text-red-500">*</span></label>
              <select value={form.hotel_id} onChange={e => setForm(p => ({ ...p, hotel_id: e.target.value }))} data-testid="kiosk-hotel-select"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-emerald-500 focus:outline-none">
                <option value="">Choisir un hotel</option>
                {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom de la borne</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Borne Lobby"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-emerald-500 focus:outline-none" data-testid="kiosk-name-input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Emplacement</label>
              <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Ex: Hall principal"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-emerald-500 focus:outline-none" data-testid="kiosk-location-input" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={saving} data-testid="kiosk-submit-btn"
              className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Creer
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={filterHotel} onChange={e => setFilterHotel(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:border-emerald-500 focus:outline-none" data-testid="kiosk-filter-hotel">
          <option value="">Tous les hotels</option>
          {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:border-emerald-500 focus:outline-none" data-testid="kiosk-filter-status">
          <option value="">Tous statuts</option>
          <option value="online">En ligne</option>
          <option value="offline">Hors ligne</option>
        </select>
      </div>

      {/* Kiosks List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune borne trouvee</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(k => (
            <div key={k.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition" data-testid={`kiosk-card-${k.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {k.status === 'online' ? <Wifi className="w-5 h-5 text-emerald-500" /> : <WifiOff className="w-5 h-5 text-red-400" />}
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${k.status === 'online' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {k.status === 'online' ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleToggleStatus(k)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition" title={k.status === 'online' ? 'Mettre hors ligne' : 'Mettre en ligne'}>
                    {k.status === 'online' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(k.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition" title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-900 font-semibold text-sm mb-1">{k.name}</p>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-1.5"><Building2 className="w-3 h-3" />{k.hotel_name || 'Inconnu'}</div>
                {k.location && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{k.location}</div>}
                <div className="flex items-center gap-1.5"><Hash className="w-3 h-3" />{k.id}</div>
                {k.installed_at && <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />Installe le {new Date(k.installed_at).toLocaleDateString('fr-FR')}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KiosksManager;
