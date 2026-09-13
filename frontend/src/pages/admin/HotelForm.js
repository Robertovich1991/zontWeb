import React, { useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, CreditCard, KeyRound, Copy, RefreshCw, ExternalLink } from 'lucide-react';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';

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
  const [readerId, setReaderId] = useState(hotel?.stripe_terminal_reader_id || '');
  const [readerSaving, setReaderSaving] = useState(false);
  const [extranetPwd, setExtranetPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const isEdit = !!hotel?.id;
  const kioskSlug = hotel?.kiosk_slug;
  const extranetUrl = `${window.location.origin}/hotel/login`;
  const loginEmail = hotel?.contact_email || form.contact_email || '';

  const genPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz';
    let p = '';
    for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setExtranetPwd(p);
  };

  const savePassword = async () => {
    if (extranetPwd.trim().length < 6) { toast.error('Mot de passe : 6 caractères minimum'); return; }
    setPwdSaving(true);
    try {
      const res = await authFetch(`/api/admin/hotels/${hotel.id}/set-password`, {
        method: 'POST', body: JSON.stringify({ password: extranetPwd.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.detail || 'Erreur');
      toast.success('Mot de passe extranet enregistré');
    } catch (e) { toast.error(e.message || 'Erreur'); }
    finally { setPwdSaving(false); }
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copié`)).catch(() => toast.error('Copie impossible'));
  };
  const copyCredentials = () => {
    if (!extranetPwd.trim()) { toast.error('Définissez d\'abord un mot de passe'); return; }
    const txt = `Accès extranet ZONT\nLien : ${extranetUrl}\nEmail : ${loginEmail}\nMot de passe : ${extranetPwd.trim()}`;
    copy(txt, 'Identifiants');
  };

  const saveReader = async () => {
    if (!readerId.trim()) { toast.error('Saisissez le Reader ID Stripe (tmr_...)'); return; }
    setReaderSaving(true);
    try {
      const res = await authFetch(`/api/admin/kiosk/${kioskSlug}/reader`, {
        method: 'PUT', body: JSON.stringify({ readerId: readerId.trim() }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.detail || 'Erreur');
      if (d.warning) toast.warning(d.warning);
      else toast.success('Terminal Stripe rattaché à l\'hôtel');
    } catch (e) { toast.error(e.message || 'Erreur'); }
    finally { setReaderSaving(false); }
  };

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
        {/* Localisation GPS (nécessaire pour la borne / tarifs) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm" data-testid="hotel-location-section">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Localisation (GPS)</h2>
          <p className="text-xs text-gray-500 mb-3">Recherchez l'adresse de l'hôtel : ses <b>coordonnées GPS</b> servent à calculer les tarifs des trajets sur la borne. Indispensable pour activer la borne.</p>
          <PlacesAutocomplete
            value={form.address}
            onChange={(p) => setForm(prev => ({ ...prev, address: p.address, lat: p.latitude, lng: p.longitude }))}
            placeholder="Rechercher l'adresse de l'hôtel…"
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
          <p className="text-xs mt-2" data-testid="hotel-coords">
            {form.lat != null && form.lng != null
              ? <span className="text-emerald-600">✓ Coordonnées : {Number(form.lat).toFixed(5)}, {Number(form.lng).toFixed(5)}</span>
              : <span className="text-amber-600">⚠ Aucune coordonnée — sélectionnez une adresse pour activer la tarification</span>}
          </p>
        </div>

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

        {/* Accès Extranet hôtel */}
        {isEdit && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm" data-testid="hotel-extranet-section">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2"><KeyRound className="w-4 h-4 text-emerald-600" /> Accès Extranet hôtel</h2>
            <p className="text-xs text-gray-500 mb-4">Définissez un mot de passe et communiquez ces 3 informations à l'hôtel pour qu'il consulte ses commissions, réservations et factures.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Lien de l'extranet</label>
                <div className="flex gap-2 mt-1">
                  <input readOnly value={extranetUrl} className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm" data-testid="extranet-url" />
                  <button type="button" onClick={() => copy(extranetUrl, 'Lien')} className="px-3 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50" data-testid="extranet-copy-link"><Copy className="w-4 h-4" /></button>
                  <a href={extranetUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center"><ExternalLink className="w-4 h-4" /></a>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Email de connexion</label>
                <input readOnly value={loginEmail} placeholder="Renseignez l'email du contact ci-dessus" className="w-full mt-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm" data-testid="extranet-email" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Mot de passe</label>
                <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <input value={extranetPwd} onChange={e => setExtranetPwd(e.target.value)} placeholder="Saisir ou générer un mot de passe" className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none" data-testid="extranet-password" />
                  <button type="button" onClick={genPassword} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-50" data-testid="extranet-generate"><RefreshCw className="w-4 h-4" /> Générer</button>
                  <button type="button" onClick={savePassword} disabled={pwdSaving} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50" data-testid="extranet-save-password">{pwdSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} Enregistrer</button>
                </div>
              </div>
              <button type="button" onClick={copyCredentials} className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium" data-testid="extranet-copy-credentials"><Copy className="w-4 h-4" /> Copier les identifiants (lien + email + mot de passe)</button>
            </div>
          </div>
        )}

        {/* Terminal de paiement Stripe (niveau hôtel) */}
        {isEdit && kioskSlug && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm" data-testid="hotel-reader-section">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-600" /> Terminal de paiement Stripe</h2>
            <p className="text-xs text-gray-500 mb-4">Collez ici le <b>Reader ID</b> du terminal créé dans votre dashboard Stripe (ex. <code>tmr_xxx</code>). La borne s'y connectera automatiquement pour encaisser les paiements par carte.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={readerId}
                onChange={e => setReaderId(e.target.value)}
                placeholder="tmr_xxxxxxxxxxxxx"
                className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                data-testid="hotel-reader-id"
              />
              <button type="button" onClick={saveReader} disabled={readerSaving}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50" data-testid="hotel-reader-save">
                {readerSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />} Rattacher le terminal
              </button>
            </div>
          </div>
        )}

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
