import React, { useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

const fields = [
  { section: 'Informations generales', items: [
    { key: 'name', label: 'Nom de l\'hotel', required: true },
    { key: 'hotel_group', label: 'Groupe hotelier' },
    { key: 'address', label: 'Adresse' },
    { key: 'city', label: 'Ville', required: true },
    { key: 'postal_code', label: 'Code postal' },
    { key: 'country', label: 'Pays' },
    { key: 'rooms', label: 'Nombre de chambres', type: 'number' },
  ]},
  { section: 'Contact principal', items: [
    { key: 'contact_name', label: 'Nom du contact' },
    { key: 'contact_role', label: 'Fonction' },
    { key: 'contact_phone', label: 'Telephone' },
    { key: 'contact_email', label: 'Email' },
  ]},
  { section: 'Commission et configuration', items: [
    { key: 'commission_rate', label: 'Commission hotel (%)', type: 'number', step: '0.5' },
    { key: 'zont_commission_rate', label: 'Commission Zont (%)', type: 'number', step: '0.5' },
    { key: 'status', label: 'Statut', type: 'select', options: [{ value: 'active', label: 'Actif' }, { value: 'inactive', label: 'Inactif' }] },
    { key: 'kiosks_planned', label: 'Bornes prevues', type: 'number' },
    { key: 'notes', label: 'Notes internes', type: 'textarea' },
  ]},
];

const defaults = { name: '', hotel_group: '', address: '', city: '', postal_code: '', country: 'France', rooms: 0, contact_name: '', contact_role: '', contact_phone: '', contact_email: '', commission_rate: 15, zont_commission_rate: 10, status: 'active', kiosks_planned: 0, notes: '' };

const HotelForm = ({ hotel, onSave, onCancel }) => {
  const { authFetch } = useAdminAuth();
  const [form, setForm] = useState(hotel ? { ...defaults, ...hotel } : { ...defaults });
  const [saving, setSaving] = useState(false);
  const isEdit = !!hotel?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Le nom est requis'); return; }
    if (!form.city.trim()) { toast.error('La ville est requise'); return; }
    setSaving(true);
    try {
      const url = isEdit ? `/api/admin/hotels/${hotel.id}` : '/api/admin/hotels';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await authFetch(url, { method, body: JSON.stringify(form) });
      if (res.ok) { toast.success(isEdit ? 'Hotel modifie' : 'Hotel cree'); onSave(); }
      else { const err = await res.json().catch(() => ({})); toast.error(err.detail || 'Erreur'); }
    } catch { toast.error('Erreur reseau'); }
    finally { setSaving(false); }
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-gray-50 -m-4 lg:-m-6 p-4 lg:p-6 max-w-3xl" data-testid="hotel-form">
      <button onClick={onCancel} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-6 transition" data-testid="hotel-form-back">
        <ArrowLeft className="w-4 h-4" /> Retour a la liste
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Modifier l\'hotel' : 'Creer un hotel'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map(section => (
          <div key={section.section} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">{section.section}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.items.map(f => (
                <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  {f.type === 'select' ? (
                    <select value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      data-testid={`hotel-field-${f.key}`}>
                      {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea value={form[f.key]} onChange={e => set(f.key, e.target.value)} rows={3}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                      data-testid={`hotel-field-${f.key}`} />
                  ) : (
                    <input type={f.type || 'text'} step={f.step} value={form[f.key]} onChange={e => set(f.key, f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      data-testid={`hotel-field-${f.key}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Commission preview */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">Apercu commission (pour 100 EUR)</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-amber-600">{form.commission_rate} EUR</p>
              <p className="text-xs text-gray-500 mt-1">Hotel</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{form.zont_commission_rate} EUR</p>
              <p className="text-xs text-gray-500 mt-1">Zont</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{(100 - form.commission_rate - form.zont_commission_rate).toFixed(1)} EUR</p>
              <p className="text-xs text-gray-500 mt-1">Chauffeur</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition shadow-sm">Annuler</button>
          <button type="submit" disabled={saving} data-testid="hotel-form-submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition shadow-sm disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Enregistrer' : 'Creer l\'hotel'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelForm;
