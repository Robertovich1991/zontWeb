import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, X, Save } from 'lucide-react';
import { MultiLangInput, TextInput, SelectInput, ImageUpload, StatusBadge, TypeBadge } from './components/FormFields';

const PAGE_TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'city', label: 'Ville' }, { value: 'airport', label: 'Aeroport' },
  { value: 'station', label: 'Gare' }, { value: 'country', label: 'Pays' },
  { value: 'region', label: 'Region / Zone' }, { value: 'homepage', label: 'Homepage' },
  { value: 'help', label: 'Aide / FAQ' }, { value: 'landing', label: 'Landing page' },
];

const emptyPage = {
  internal_name: '', page_type: 'city', slug: {}, hero_image: '', status: 'draft', priority: 0, related_pages: [],
  seo: { title: {}, meta_description: {}, h1: {}, h2: {}, canonical: '', noindex: false, og_title: {}, og_description: {}, og_image: '' },
  intro: {}, main_content: {}, blocks: [], faq: [], cta_text: {},
};

const PagesManager = () => {
  const { authFetch, uploadFile } = useAdminAuth();
  const [pages, setPages] = useState([]);
  const [filter, setFilter] = useState({ type: '', status: '', search: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('general');

  const loadPages = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.type) params.set('page_type', filter.type);
    if (filter.status) params.set('status', filter.status);
    if (filter.search) params.set('search', filter.search);
    const res = await authFetch(`/api/admin/pages?${params}`);
    setPages(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadPages(); }, [filter.type, filter.status]);

  const handleSave = async () => {
    const method = editing.id ? 'PUT' : 'POST';
    const url = editing.id ? `/api/admin/pages/${editing.id}` : '/api/admin/pages';
    await authFetch(url, { method, body: JSON.stringify(editing) });
    setEditing(null);
    loadPages();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette page ?')) return;
    await authFetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
    loadPages();
  };

  const toggleStatus = async (id) => {
    await authFetch(`/api/admin/pages/${id}/status`, { method: 'PATCH' });
    loadPages();
  };

  const updateField = (path, value) => {
    setEditing(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  if (editing) {
    return (
      <div className="space-y-4" data-testid="page-editor">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">{editing.id ? 'Modifier la page' : 'Nouvelle page'}</h1>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg transition"><X className="w-4 h-4 inline mr-1" />Annuler</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition" data-testid="save-page-btn"><Save className="w-4 h-4 inline mr-1" />Enregistrer</button>
          </div>
        </div>
        <div className="flex gap-1 border-b border-slate-800 pb-2">
          {['general', 'seo', 'contenu', 'faq'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm rounded-lg transition ${tab === t ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:text-white'}`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          {tab === 'general' && <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput label="Nom interne" value={editing.internal_name} onChange={v => updateField('internal_name', v)} required />
              <SelectInput label="Type de page" value={editing.page_type} onChange={v => updateField('page_type', v)} options={PAGE_TYPES.filter(t => t.value)} />
            </div>
            <MultiLangInput label="Slug / URL" value={editing.slug} onChange={v => updateField('slug', v)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput label="Statut" value={editing.status} onChange={v => updateField('status', v)} options={[{ value: 'draft', label: 'Brouillon' }, { value: 'published', label: 'Publie' }]} />
              <TextInput label="Priorite" value={editing.priority} onChange={v => updateField('priority', parseInt(v) || 0)} type="number" />
            </div>
            <ImageUpload label="Image hero" value={editing.hero_image} onChange={v => updateField('hero_image', v)} uploadFile={uploadFile} />
          </>}
          {tab === 'seo' && <>
            <MultiLangInput label="Title SEO" value={editing.seo?.title} onChange={v => updateField('seo.title', v)} />
            <MultiLangInput label="Meta description" value={editing.seo?.meta_description} onChange={v => updateField('seo.meta_description', v)} textarea rows={2} />
            <MultiLangInput label="H1" value={editing.seo?.h1} onChange={v => updateField('seo.h1', v)} />
            <MultiLangInput label="H2 / Sous-titre" value={editing.seo?.h2} onChange={v => updateField('seo.h2', v)} />
            <TextInput label="Canonical URL" value={editing.seo?.canonical} onChange={v => updateField('seo.canonical', v)} />
            <MultiLangInput label="OG Title" value={editing.seo?.og_title} onChange={v => updateField('seo.og_title', v)} />
            <MultiLangInput label="OG Description" value={editing.seo?.og_description} onChange={v => updateField('seo.og_description', v)} textarea rows={2} />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={editing.seo?.noindex || false} onChange={e => updateField('seo.noindex', e.target.checked)} className="rounded" />
              <span className="text-slate-300 text-sm">noindex (ne pas indexer)</span>
            </div>
          </>}
          {tab === 'contenu' && <>
            <MultiLangInput label="Texte d'introduction" value={editing.intro} onChange={v => updateField('intro', v)} textarea rows={3} />
            <MultiLangInput label="Contenu principal" value={editing.main_content} onChange={v => updateField('main_content', v)} textarea rows={8} />
            <MultiLangInput label="Texte CTA" value={editing.cta_text} onChange={v => updateField('cta_text', v)} />
          </>}
          {tab === 'faq' && <>
            {(editing.faq || []).map((item, idx) => (
              <div key={idx} className="border border-slate-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-amber-400 text-sm font-medium">FAQ #{idx + 1}</span>
                  <button onClick={() => updateField('faq', editing.faq.filter((_, i) => i !== idx))} className="text-red-400 text-xs hover:text-red-300">Supprimer</button>
                </div>
                <MultiLangInput label="Question" value={item.question} onChange={v => { const f = [...editing.faq]; f[idx] = { ...f[idx], question: v }; updateField('faq', f); }} />
                <MultiLangInput label="Reponse" value={item.answer} onChange={v => { const f = [...editing.faq]; f[idx] = { ...f[idx], answer: v }; updateField('faq', f); }} textarea rows={3} />
              </div>
            ))}
            <button onClick={() => updateField('faq', [...(editing.faq || []), { question: {}, answer: {} }])} className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"><Plus className="w-4 h-4" />Ajouter une FAQ</button>
          </>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="pages-manager">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Pages SEO</h1>
        <button onClick={() => setEditing({ ...emptyPage })} className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition flex items-center gap-2" data-testid="create-page-btn">
          <Plus className="w-4 h-4" />Nouvelle page
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={filter.search} onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} onKeyDown={e => e.key === 'Enter' && loadPages()} placeholder="Rechercher..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500" />
        </div>
        <select value={filter.type} onChange={e => setFilter(f => ({ ...f, type: e.target.value }))} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
          {PAGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">Tous statuts</option><option value="published">Publie</option><option value="draft">Brouillon</option>
        </select>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-slate-800 text-left">
            <th className="px-4 py-3 text-slate-400 text-xs font-medium">Nom</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium hidden md:table-cell">Type</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium hidden md:table-cell">Slug (FR)</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium">Statut</th>
            <th className="px-4 py-3 text-slate-400 text-xs font-medium text-right">Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Chargement...</td></tr>
              : pages.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Aucune page</td></tr>
              : pages.map(p => (
                <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                  <td className="px-4 py-3 text-white text-sm">{p.internal_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell"><TypeBadge type={p.page_type} /></td>
                  <td className="px-4 py-3 text-slate-400 text-sm hidden md:table-cell">{p.slug?.fr || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleStatus(p.id)} className="p-1.5 text-slate-400 hover:text-amber-400 rounded transition" title="Toggle statut">{p.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                      <button onClick={() => { setEditing(p); setTab('general'); }} className="p-1.5 text-slate-400 hover:text-blue-400 rounded transition" title="Modifier"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded transition" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
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

export default PagesManager;
