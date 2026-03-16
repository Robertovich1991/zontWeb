import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { Plus, Edit2, Trash2, Save, X, HelpCircle } from 'lucide-react';
import { MultiLangInput, TextInput } from './components/FormFields';

const FaqManager = () => {
  const { authFetch } = useAdminAuth();
  const [faqs, setFaqs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadFaqs = async () => {
    setLoading(true);
    const res = await authFetch('/api/admin/cms/faqs');
    setFaqs(await res.json());
    setLoading(false);
  };

  useEffect(() => { loadFaqs(); }, []);

  const handleSave = async () => {
    const method = editing.id ? 'PUT' : 'POST';
    const url = editing.id ? `/api/admin/cms/faqs/${editing.id}` : '/api/admin/cms/faqs';
    await authFetch(url, { method, body: JSON.stringify(editing) });
    setEditing(null);
    loadFaqs();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette FAQ ?')) return;
    await authFetch(`/api/admin/cms/faqs/${id}`, { method: 'DELETE' });
    loadFaqs();
  };

  if (editing) {
    return (
      <div className="space-y-4" data-testid="faq-editor">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{editing.id ? 'Modifier la FAQ' : 'Nouvelle FAQ'}</h1>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg transition"><X className="w-4 h-4 inline mr-1" />Annuler</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition" data-testid="save-faq-btn"><Save className="w-4 h-4 inline mr-1" />Enregistrer</button>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <MultiLangInput label="Question" value={editing.question} onChange={v => setEditing(e => ({ ...e, question: v }))} />
          <MultiLangInput label="Reponse" value={editing.answer} onChange={v => setEditing(e => ({ ...e, answer: v }))} textarea rows={4} />
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Ordre" value={editing.order} onChange={v => setEditing(e => ({ ...e, order: parseInt(v) || 0 }))} type="number" />
            <TextInput label="Page associee (ID)" value={editing.page_id || ''} onChange={v => setEditing(e => ({ ...e, page_id: v || null }))} placeholder="Laisser vide = global" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={editing.active !== false} onChange={e => setEditing(prev => ({ ...prev, active: e.target.checked }))} className="rounded" />
            <span className="text-gray-600 text-sm">Actif</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="faq-manager">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-gray-900">FAQ</h1><p className="text-gray-500 text-sm mt-1">Questions frequentes globales et par page</p></div>
        <button onClick={() => setEditing({ question: {}, answer: {}, order: faqs.length, active: true, page_id: null })} className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition flex items-center gap-2" data-testid="create-faq-btn"><Plus className="w-4 h-4" />Nouvelle FAQ</button>
      </div>
      <div className="space-y-2">
        {loading ? <p className="text-gray-400">Chargement...</p>
          : faqs.length === 0 ? <p className="text-gray-400 text-center py-8">Aucune FAQ</p>
          : faqs.map(f => (
            <div key={f.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-200 transition">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{f.question?.fr || f.question?.en || 'Sans question'}</p>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{f.answer?.fr || f.answer?.en || ''}</p>
                  <div className="flex gap-2 mt-2">
                    {f.page_id && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Page: {f.page_id.slice(0, 8)}...</span>}
                    <span className={`text-xs px-2 py-0.5 rounded ${f.active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>{f.active !== false ? 'Actif' : 'Inactif'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditing(f)} className="p-1.5 text-gray-500 hover:text-blue-400 rounded transition"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(f.id)} className="p-1.5 text-gray-500 hover:text-red-400 rounded transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default FaqManager;
