import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, X, Save, MapPin } from 'lucide-react';
import { MultiLangInput, TextInput, SelectInput, ImageUpload, StatusBadge, TypeBadge } from './components/FormFields';

const PLACE_TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'city', label: 'Ville' }, { value: 'airport', label: 'Aeroport' },
  { value: 'station', label: 'Gare' }, { value: 'country', label: 'Pays' },
  { value: 'region', label: 'Region / Zone' },
];

const emptyPlace = {
  name: {}, place_type: 'city', country: '', parent_city_id: '', airport_code: '',
  description_short: {}, description_seo: {}, price_from: null, associated_destinations: [],
  keywords: [], image: '', status: 'active',
};

const PlacesManager = () => {
  const { authFetch, uploadFile } = useAdminAuth();
  const [places, setPlaces] = useState([]);
  const [filter, setFilter] = useState({ type: '', search: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keywordsInput, setKeywordsInput] = useState('');

  const loadPlaces = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.type) params.set('place_type', filter.type);
    if (filter.search) params.set('search', filter.search);
    const res = await authFetch(`/api/admin/places?${params}`);
    setPlaces(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadPlaces(); }, [filter.type]);

  const handleSave = async () => {
    const method = editing.id ? 'PUT' : 'POST';
    const url = editing.id ? `/api/admin/places/${editing.id}` : '/api/admin/places';
    await authFetch(url, { method, body: JSON.stringify(editing) });
    setEditing(null);
    loadPlaces();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce lieu ?')) return;
    await authFetch(`/api/admin/places/${id}`, { method: 'DELETE' });
    loadPlaces();
  };

  const toggleStatus = async (id) => {
    await authFetch(`/api/admin/places/${id}/status`, { method: 'PATCH' });
    loadPlaces();
  };

  const updateField = (key, value) => setEditing(prev => ({ ...prev, [key]: value }));

  if (editing) {
    return (
      <div className="space-y-4" data-testid="place-editor">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">{editing.id ? 'Modifier le lieu' : 'Nouveau lieu'}</h1>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg transition"><X className="w-4 h-4 inline mr-1" />Annuler</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition" data-testid="save-place-btn"><Save className="w-4 h-4 inline mr-1" />Enregistrer</button>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <MultiLangInput label="Nom" value={editing.name} onChange={v => updateField('name', v)} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectInput label="Type" value={editing.place_type} onChange={v => updateField('place_type', v)} options={PLACE_TYPES.filter(t => t.value)} />
            <TextInput label="Pays" value={editing.country} onChange={v => updateField('country', v)} />
            <TextInput label="Code aeroport" value={editing.airport_code} onChange={v => updateField('airport_code', v)} placeholder="CDG, ORY..." />
          </div>
          <MultiLangInput label="Description courte" value={editing.description_short} onChange={v => updateField('description_short', v)} textarea rows={2} />
          <MultiLangInput label="Description SEO longue" value={editing.description_seo} onChange={v => updateField('description_seo', v)} textarea rows={4} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput label="Prix a partir de (EUR)" value={editing.price_from} onChange={v => updateField('price_from', v ? parseFloat(v) : null)} type="number" />
            <SelectInput label="Statut" value={editing.status} onChange={v => updateField('status', v)} options={[{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }]} />
          </div>
          <div>
            <label className="block text-slate-300 text-sm mb-1.5">Mots-cles</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {(editing.keywords || []).map((k, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-full px-2.5 py-1 text-xs text-slate-300">
                  {k}<button type="button" onClick={() => updateField('keywords', editing.keywords.filter((_, j) => j !== i))} className="text-slate-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={keywordsInput} onChange={e => setKeywordsInput(e.target.value)} placeholder="Ajouter un mot-cle"
                onKeyDown={e => { if (e.key === 'Enter' && keywordsInput.trim()) { e.preventDefault(); updateField('keywords', [...(editing.keywords || []), keywordsInput.trim()]); setKeywordsInput(''); } }}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500" />
            </div>
          </div>
          <ImageUpload label="Image" value={editing.image} onChange={v => updateField('image', v)} uploadFile={uploadFile} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="places-manager">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Lieux / Destinations</h1>
        <button onClick={() => { setEditing({ ...emptyPlace }); setKeywordsInput(''); }} className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition flex items-center gap-2" data-testid="create-place-btn">
          <Plus className="w-4 h-4" />Nouveau lieu
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} onKeyDown={e => e.key === 'Enter' && loadPlaces()} placeholder="Rechercher..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500" />
        </div>
        <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
          {PLACE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-800 text-left">
            <th className="px-4 py-3 text-slate-400 text-xs font-medium">Nom</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium hidden md:table-cell">Type</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium hidden md:table-cell">Pays</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium hidden md:table-cell">Prix</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium">Statut</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium text-right">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chargement...</td></tr>
              : places.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Aucun lieu</td></tr>
              : places.map(p => (
                <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-500 shrink-0" /><span className="text-white text-sm">{p.name?.fr || p.name?.en || '-'}</span></div>
                    {p.airport_code && <span className="text-slate-500 text-xs ml-6">{p.airport_code}</span>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell"><TypeBadge type={p.place_type} /></td>
                  <td className="px-4 py-3 text-slate-400 text-sm hidden md:table-cell">{p.country || '-'}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm hidden md:table-cell">{p.price_from ? `${p.price_from} EUR` : '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleStatus(p.id)} className="p-1.5 text-slate-400 hover:text-amber-400 rounded transition">{p.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}</button>
                      <button onClick={() => { setEditing(p); setKeywordsInput(''); }} className="p-1.5 text-slate-400 hover:text-blue-400 rounded transition"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlacesManager;
