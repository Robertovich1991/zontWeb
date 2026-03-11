import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Save, X, GripVertical } from 'lucide-react';
import { MultiLangInput, TextInput } from './components/FormFields';

const ICONS = ['shield', 'check', 'clock', 'star', 'plane', 'headphones', 'lock', 'credit-card', 'map-pin', 'heart', 'thumbs-up', 'zap'];

const TrustBlocks = () => {
  const { authFetch } = useAdminAuth();
  const [blocks, setBlocks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBlocks = async () => {
    setLoading(true);
    const res = await authFetch('/api/admin/cms/trust-blocks');
    setBlocks(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadBlocks(); }, []);

  const handleSave = async () => {
    const method = editing.id ? 'PUT' : 'POST';
    const url = editing.id ? `/api/admin/cms/trust-blocks/${editing.id}` : '/api/admin/cms/trust-blocks';
    await authFetch(url, { method, body: JSON.stringify(editing) });
    setEditing(null);
    loadBlocks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ?')) return;
    await authFetch(`/api/admin/cms/trust-blocks/${id}`, { method: 'DELETE' });
    loadBlocks();
  };

  const toggleActive = async (id) => {
    await authFetch(`/api/admin/cms/trust-blocks/${id}/toggle`, { method: 'PATCH' });
    loadBlocks();
  };

  if (editing) {
    return (
      <div className="space-y-4" data-testid="trust-block-editor">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">{editing.id ? 'Modifier le bloc' : 'Nouveau bloc'}</h1>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg transition"><X className="w-4 h-4 inline mr-1" />Annuler</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition" data-testid="save-trust-block-btn"><Save className="w-4 h-4 inline mr-1" />Enregistrer</button>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <MultiLangInput label="Titre" value={editing.title} onChange={v => setEditing(e => ({ ...e, title: v }))} />
          <MultiLangInput label="Texte" value={editing.text} onChange={v => setEditing(e => ({ ...e, text: v }))} textarea rows={3} />
          <div>
            <label className="block text-slate-300 text-sm mb-2">Icone</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button key={icon} onClick={() => setEditing(e => ({ ...e, icon }))} className={`px-3 py-1.5 text-xs rounded-lg border transition ${editing.icon === icon ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>{icon}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Ordre d'affichage" value={editing.order} onChange={v => setEditing(e => ({ ...e, order: parseInt(v) || 0 }))} type="number" />
            <div>
              <label className="block text-slate-300 text-sm mb-1.5">Actif</label>
              <button onClick={() => setEditing(e => ({ ...e, active: !e.active }))} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${editing.active ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {editing.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}{editing.active ? 'Actif' : 'Inactif'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="trust-blocks-manager">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Blocs de confiance</h1><p className="text-slate-400 text-sm mt-1">Prix fixes, paiement securise, chauffeurs verifies...</p></div>
        <button onClick={() => setEditing({ title: {}, text: {}, icon: 'shield', active: true, order: blocks.length })} className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition flex items-center gap-2" data-testid="create-trust-block-btn">
          <Plus className="w-4 h-4" />Nouveau bloc
        </button>
      </div>
      <div className="space-y-2">
        {loading ? <p className="text-slate-500">Chargement...</p>
          : blocks.length === 0 ? <p className="text-slate-500 text-center py-8">Aucun bloc</p>
          : blocks.map(b => (
            <div key={b.id} className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition">
              <GripVertical className="w-4 h-4 text-slate-600 shrink-0" />
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${b.active ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>{b.icon?.slice(0, 2)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${b.active ? 'text-white' : 'text-slate-500'}`}>{b.title?.fr || b.title?.en || 'Sans titre'}</p>
                <p className="text-slate-500 text-xs truncate">{b.text?.fr || b.text?.en || ''}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${b.active ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-500'}`}>{b.active ? 'Actif' : 'Inactif'}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleActive(b.id)} className="p-1.5 text-slate-400 hover:text-amber-400 rounded transition">{b.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}</button>
                <button onClick={() => setEditing(b)} className="p-1.5 text-slate-400 hover:text-blue-400 rounded transition"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TrustBlocks;
