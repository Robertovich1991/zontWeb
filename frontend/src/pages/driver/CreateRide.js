import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverAuth } from './DriverAuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, MapPin, Car, DollarSign, User, Phone, Plane, FileText, Calendar } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const CreateRide = () => {
  const { token } = useDriverAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [form, setForm] = useState({
    pickup_address: '', dropoff_address: '',
    vehicle_category_id: '', vehicle_category_name: '',
    proposed_price: '', currency: 'EUR',
    passenger_name: '', passenger_phone: '',
    pickup_datetime: '', notes: '', flight_number: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API}/api/partner/vehicle-categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch {} finally { setLoadingCat(false); }
    };
    fetchCategories();
  }, [token]);

  const handleCategoryChange = (e) => {
    const id = e.target.value;
    const cat = categories.find(c => String(c.id) === id);
    setForm({ ...form, vehicle_category_id: id, vehicle_category_name: cat?.name || cat?.type || id });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pickup_address || !form.dropoff_address || !form.vehicle_category_id || !form.proposed_price) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/partner/rides`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, proposed_price: parseFloat(form.proposed_price) }),
      });
      if (res.ok) {
        toast.success('Course proposee avec succes !');
        navigate('/driver');
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Erreur lors de la creation');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-4 py-3.5 bg-[#1a2332] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent text-sm';

  return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col" data-testid="create-ride-page">
      {/* Header */}
      <header className="bg-[#1a2332] border-b border-gray-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigate('/driver')} className="text-gray-400 hover:text-white transition" data-testid="back-btn">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white font-semibold text-sm">Proposer une Course</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-5 space-y-4 pb-24" data-testid="create-ride-form">
        {/* Addresses */}
        <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800 space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-[#2ecc71]" /> Trajet</h3>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Adresse de depart *</label>
            <input value={form.pickup_address} onChange={e => setForm({...form, pickup_address: e.target.value})}
              placeholder="Ex: Aeroport CDG, Terminal 2" className={inputCls} required data-testid="pickup-address" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Adresse d'arrivee *</label>
            <input value={form.dropoff_address} onChange={e => setForm({...form, dropoff_address: e.target.value})}
              placeholder="Ex: 15 Rue de Rivoli, Paris" className={inputCls} required data-testid="dropoff-address" />
          </div>
        </div>

        {/* Vehicle & Price */}
        <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800 space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Car className="w-4 h-4 text-[#2ecc71]" /> Vehicule & Prix</h3>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Categorie de vehicule *</label>
            {loadingCat ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-3"><Loader2 className="w-4 h-4 animate-spin" /> Chargement...</div>
            ) : (
              <select value={form.vehicle_category_id} onChange={handleCategoryChange} required
                className={`${inputCls} appearance-none`} data-testid="vehicle-category">
                <option value="">Selectionner une categorie</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name || cat.type || `Cat ${cat.id}`}</option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Prix propose * (EUR)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <input type="number" step="0.01" min="1" value={form.proposed_price}
                  onChange={e => setForm({...form, proposed_price: e.target.value})}
                  placeholder="0.00" className={`${inputCls} pl-10`} required data-testid="proposed-price" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Devise</label>
              <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}
                className={`${inputCls} appearance-none`} data-testid="currency">
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="AMD">AMD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Passenger & Details */}
        <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800 space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><User className="w-4 h-4 text-[#2ecc71]" /> Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nom du passager</label>
              <input value={form.passenger_name} onChange={e => setForm({...form, passenger_name: e.target.value})}
                placeholder="Nom" className={inputCls} data-testid="passenger-name" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tel passager</label>
              <input value={form.passenger_phone} onChange={e => setForm({...form, passenger_phone: e.target.value})}
                placeholder="+33..." className={inputCls} data-testid="passenger-phone" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date/Heure</label>
              <input type="datetime-local" value={form.pickup_datetime}
                onChange={e => setForm({...form, pickup_datetime: e.target.value})}
                className={inputCls} data-testid="pickup-datetime" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">N de vol</label>
              <input value={form.flight_number} onChange={e => setForm({...form, flight_number: e.target.value})}
                placeholder="AF1234" className={inputCls} data-testid="flight-number" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="Instructions supplementaires..." className={`${inputCls} resize-none`} rows={3} data-testid="notes" />
          </div>
        </div>
      </form>

      {/* Fixed bottom submit */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0f1419] border-t border-gray-800 px-4 py-4 z-30">
        <button onClick={handleSubmit} disabled={loading} data-testid="submit-ride"
          className="w-full bg-[#2ecc71] text-white py-4 rounded-xl font-semibold text-sm hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#2ecc71]/20">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...</> : 'Proposer la Course'}
        </button>
      </div>
    </div>
  );
};

export default CreateRide;
