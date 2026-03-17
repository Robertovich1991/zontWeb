import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFleetAuth } from './FleetAuthContext';
import { toast } from 'sonner';
import PhoneInput from '../../components/PhoneInput';
import { ArrowLeft, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';

const FleetAddDriver = () => {
  const { authFetch } = useFleetAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [countryCode, setCountryCode] = useState('+33');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    password: '',
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.gender || !form.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = form.phone ? `${countryCode}${form.phone.replace(/^0+/, '')}` : '';
      const res = await authFetch('/api/fleet/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: fullPhone,
          gender: form.gender,
          password: form.password,
        }),
      });

      if (res.ok) {
        toast.success('Chauffeur ajoute avec succes ! En attente de validation.');
        navigate('/fleet/drivers');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Erreur lors de la creation');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="fleet-add-driver">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/fleet/drivers')} data-testid="back-to-drivers-btn"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajouter un chauffeur</h1>
          <p className="text-gray-500 text-sm mt-0.5">Les informations seront envoyees pour validation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5" data-testid="add-driver-form">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prenom *</label>
            <input type="text" value={form.firstName} onChange={set('firstName')} data-testid="driver-firstname"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Jean" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label>
            <input type="text" value={form.lastName} onChange={set('lastName')} data-testid="driver-lastname"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Dupont" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
          <input type="email" value={form.email} onChange={set('email')} data-testid="driver-email"
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="chauffeur@email.com" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Telephone</label>
          <PhoneInput
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            onCountryChange={setCountryCode}
            darkMode={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Genre *</label>
          <select value={form.gender} onChange={set('gender')} data-testid="driver-gender"
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
            <option value="">Selectionnez...</option>
            <option value="Male">Homme</option>
            <option value="Female">Femme</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe *</label>
          <div className="relative">
            <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')} data-testid="driver-password"
              className="w-full px-3 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Mot de passe du chauffeur" />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-amber-800 text-xs">Les informations du chauffeur seront envoyees pour validation par l'administrateur avant activation du compte.</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate('/fleet/drivers')} data-testid="cancel-add-driver-btn"
            className="px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">
            Annuler
          </button>
          <button type="submit" disabled={loading} data-testid="submit-add-driver-btn"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {loading ? 'Envoi...' : 'Ajouter le chauffeur'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FleetAddDriver;
