import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFleetAuth } from './FleetAuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Car, Loader2 } from 'lucide-react';

const FleetAddVehicle = () => {
  const { authFetch } = useFleetAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [years, setYears] = useState([]);
  const [makers, setMakers] = useState([]);
  const [models, setModels] = useState([]);
  const [types, setTypes] = useState([]);
  const [loadingRef, setLoadingRef] = useState(false);

  const [form, setForm] = useState({
    number: '', vim: '', color: '',
    year: '', makeId: '', maker: '', modelId: '', model: '', type: '', isVTC: false,
  });

  useEffect(() => {
    authFetch('/api/fleet/vehicles/ref/years').then(r => r.ok ? r.json() : []).then(d => setYears(Array.isArray(d) ? d.sort((a, b) => b - a) : []));
    authFetch('/api/fleet/vehicles/ref/types').then(r => r.ok ? r.json() : []).then(d => setTypes(Array.isArray(d) ? d : []));
  }, []);

  const onYearChange = async (year) => {
    setForm(f => ({ ...f, year, makeId: '', maker: '', modelId: '', model: '', type: '' }));
    setMakers([]); setModels([]);
    if (!year) return;
    setLoadingRef(true);
    const res = await authFetch(`/api/fleet/vehicles/ref/makers/${year}`);
    const data = res.ok ? await res.json() : [];
    setMakers(Array.isArray(data) ? data : []);
    setLoadingRef(false);
  };

  const onMakerChange = async (makerId, makerName) => {
    setForm(f => ({ ...f, makeId: makerId, maker: makerName, modelId: '', model: '', type: '' }));
    setModels([]);
    if (!makerName || !form.year) return;
    setLoadingRef(true);
    const res = await authFetch(`/api/fleet/vehicles/ref/models/${form.year}/${encodeURIComponent(makerName)}`);
    const data = res.ok ? await res.json() : [];
    setModels(Array.isArray(data) ? data : []);
    setLoadingRef(false);
  };

  const onModelChange = (modelObj) => {
    if (!modelObj) { setForm(f => ({ ...f, modelId: '', model: '', type: '', isVTC: false })); return; }
    setForm(f => ({ ...f, modelId: modelObj.id, model: modelObj.model, type: modelObj.type || '', isVTC: modelObj.isVTC || false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.number || !form.vim || !form.color || !form.year || !form.makeId || !form.model || !form.type) {
      toast.error('Veuillez remplir tous les champs obligatoires'); return;
    }
    setLoading(true);
    try {
      const res = await authFetch('/api/fleet/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vim: form.vim, color: form.color, number: form.number,
          vehicleMakeModelId: form.modelId || 0,
          year: parseInt(form.year), makeId: parseInt(form.makeId), maker: form.maker,
          model: form.model, type: form.type, isVTC: form.isVTC,
        }),
      });
      if (res.ok) {
        toast.success('Vehicule ajoute avec succes !');
        navigate('/fleet/vehicles');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Erreur lors de la creation');
      }
    } catch { toast.error('Erreur de connexion'); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";
  const selectCls = inputCls;

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="fleet-add-vehicle">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/fleet/vehicles')} data-testid="back-to-vehicles-btn"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajouter un vehicule</h1>
          <p className="text-gray-500 text-sm mt-0.5">Enregistrez un nouveau vehicule dans votre flotte</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5" data-testid="add-vehicle-form">
        <div className="pb-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Identification</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Immatriculation *</label>
            <input type="text" value={form.number} onChange={e => setForm({...form, number: e.target.value})} data-testid="vehicle-plate"
              className={inputCls} placeholder="AA-123-BB" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Numero VIN *</label>
            <input type="text" value={form.vim} onChange={e => setForm({...form, vim: e.target.value})} data-testid="vehicle-vin"
              className={inputCls} placeholder="WBA3A5G59DNP12345" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Couleur *</label>
          <input type="text" value={form.color} onChange={e => setForm({...form, color: e.target.value})} data-testid="vehicle-color"
            className={inputCls} placeholder="Noir" />
        </div>

        <div className="pt-3 pb-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Modele du vehicule</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Annee *</label>
            <select value={form.year} onChange={e => onYearChange(e.target.value)} data-testid="vehicle-year" className={selectCls}>
              <option value="">Selectionnez...</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Marque * {loadingRef && <Loader2 className="w-3 h-3 inline animate-spin" />}</label>
            <select value={form.makeId} onChange={e => {
              const m = makers.find(mk => String(mk.id) === e.target.value);
              onMakerChange(e.target.value, m ? (m.maker || m.make || '') : '');
            }} data-testid="vehicle-make" className={selectCls} disabled={!form.year}>
              <option value="">Selectionnez...</option>
              {makers.map(m => <option key={m.id} value={m.id}>{(m.maker || m.make || '').trim()}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Modele *</label>
            <select value={form.modelId} onChange={e => {
              const m = models.find(md => String(md.id) === e.target.value);
              onModelChange(m || null);
            }} data-testid="vehicle-model" className={selectCls} disabled={!form.makeId}>
              <option value="">Selectionnez...</option>
              {models.map(m => <option key={m.id} value={m.id}>{m.model} - {(m.type || '').trim()}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Categorie *</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} data-testid="vehicle-type" className={selectCls}>
              <option value="">Selectionnez...</option>
              {types.map(t => <option key={t} value={t}>{t.trim()}</option>)}
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer" data-testid="vehicle-vtc-label">
              <input type="checkbox" checked={form.isVTC} onChange={e => setForm({...form, isVTC: e.target.checked})} data-testid="vehicle-vtc"
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              <span className="text-sm text-gray-700">Vehicule VTC</span>
            </label>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-amber-800 text-xs">Le vehicule sera enregistre et soumis a validation par l'administrateur.</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate('/fleet/vehicles')} data-testid="cancel-add-vehicle-btn"
            className="px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">
            Annuler
          </button>
          <button type="submit" disabled={loading} data-testid="submit-add-vehicle-btn"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Car className="w-4 h-4" />}
            {loading ? 'Envoi...' : 'Ajouter le vehicule'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FleetAddVehicle;
