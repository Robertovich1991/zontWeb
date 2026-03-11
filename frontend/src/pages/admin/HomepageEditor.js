import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { MultiLangInput, TextInput } from './components/FormFields';

const HomepageEditor = () => {
  const { authFetch } = useAdminAuth();
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    authFetch('/api/admin/cms/homepage').then(r => r.json()).then(setConfig);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await authFetch('/api/admin/cms/homepage', { method: 'PUT', body: JSON.stringify(config) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

  if (!config) return <div className="text-slate-400">Chargement...</div>;

  return (
    <div className="space-y-6" data-testid="homepage-editor">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Configuration Homepage</h1>
          <p className="text-slate-400 text-sm mt-1">Gerez les contenus de la page d'accueil</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-50" data-testid="save-homepage-btn">
          <Save className="w-4 h-4" />{saving ? 'Enregistrement...' : saved ? 'Enregistre !' : 'Enregistrer'}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-medium">Section Hero</h3>
        <MultiLangInput label="Titre principal" value={config.title} onChange={v => update('title', v)} />
        <MultiLangInput label="Sous-titre" value={config.subtitle} onChange={v => update('subtitle', v)} textarea rows={2} />
        <MultiLangInput label="Badge avis" value={config.review_badge} onChange={v => update('review_badge', v)} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Statistiques</h3>
          <button onClick={() => update('stats', [...(config.stats || []), { value: '', label: {} }])} className="text-amber-400 text-sm flex items-center gap-1"><Plus className="w-4 h-4" />Ajouter</button>
        </div>
        {(config.stats || []).map((stat, i) => (
          <div key={i} className="flex items-start gap-3 border border-slate-700 rounded-lg p-3">
            <div className="flex-1 space-y-2">
              <TextInput label="Valeur" value={stat.value} onChange={v => { const s = [...config.stats]; s[i] = { ...s[i], value: v }; update('stats', s); }} placeholder="50K+" />
              <MultiLangInput label="Label" value={stat.label} onChange={v => { const s = [...config.stats]; s[i] = { ...s[i], label: v }; update('stats', s); }} />
            </div>
            <button onClick={() => update('stats', config.stats.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 mt-6"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Blocs Avantages</h3>
          <button onClick={() => update('advantages', [...(config.advantages || []), { title: {}, text: {}, icon: '' }])} className="text-amber-400 text-sm flex items-center gap-1"><Plus className="w-4 h-4" />Ajouter</button>
        </div>
        {(config.advantages || []).map((adv, i) => (
          <div key={i} className="border border-slate-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 text-sm font-medium">Avantage #{i + 1}</span>
              <button onClick={() => update('advantages', config.advantages.filter((_, j) => j !== i))} className="text-red-400 text-xs hover:text-red-300">Supprimer</button>
            </div>
            <TextInput label="Icone (lucide)" value={adv.icon} onChange={v => { const a = [...config.advantages]; a[i] = { ...a[i], icon: v }; update('advantages', a); }} placeholder="shield, clock, star..." />
            <MultiLangInput label="Titre" value={adv.title} onChange={v => { const a = [...config.advantages]; a[i] = { ...a[i], title: v }; update('advantages', a); }} />
            <MultiLangInput label="Texte" value={adv.text} onChange={v => { const a = [...config.advantages]; a[i] = { ...a[i], text: v }; update('advantages', a); }} textarea rows={2} />
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-medium">CTA (Call to Action)</h3>
        <MultiLangInput label="Titre CTA" value={config.cta_title} onChange={v => update('cta_title', v)} />
        <MultiLangInput label="Texte du bouton" value={config.cta_button} onChange={v => update('cta_button', v)} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-white font-medium">Ordre des sections</h3>
        <p className="text-slate-400 text-sm">Glissez pour rearanger les sections</p>
        <div className="space-y-1">
          {(config.sections_order || []).map((section, i) => (
            <div key={section} className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
              <GripVertical className="w-4 h-4 text-slate-500" />
              <span className="text-white text-sm">{section}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomepageEditor;
