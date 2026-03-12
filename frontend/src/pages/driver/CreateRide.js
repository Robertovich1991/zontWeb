import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverAuth } from './DriverAuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, MapPin, Car, DollarSign, User, Plane, Calendar, Navigation, Clock, Route } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const AddressInput = ({ label, placeholder, value, onChange, testId }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google?.maps?.places || !inputRef.current) return;
    if (autocompleteRef.current) return;
    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
    });
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (place?.formatted_address) {
        onChange({
          address: place.formatted_address,
          lat: place.geometry?.location?.lat() || null,
          lng: place.geometry?.location?.lng() || null,
        });
      }
    });
    autocompleteRef.current = ac;
  }, []);

  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        ref={inputRef}
        defaultValue={value}
        onChange={(e) => onChange({ address: e.target.value, lat: null, lng: null })}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 bg-[#1a2332] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent text-sm"
        data-testid={testId}
      />
    </div>
  );
};

const CreateRide = () => {
  const { token } = useDriverAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [form, setForm] = useState({
    pickup_address: '', pickup_lat: null, pickup_lng: null,
    dropoff_address: '', dropoff_lat: null, dropoff_lng: null,
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
        if (res.ok) setCategories(await res.json());
      } catch {} finally { setLoadingCat(false); }
    };
    fetchCategories();
  }, [token]);

  const calculateRoute = useCallback(async (pickup, dropoff) => {
    if (!pickup || !dropoff) return;
    setCalculatingRoute(true);
    try {
      const res = await fetch(`${API}/api/partner/calculate-route`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: pickup, destination: dropoff }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          setRouteInfo(data);
        }
      }
    } catch {} finally { setCalculatingRoute(false); }
  }, [token]);

  const handlePickupChange = (data) => {
    setForm(prev => ({ ...prev, pickup_address: data.address, pickup_lat: data.lat, pickup_lng: data.lng }));
    if (data.address && form.dropoff_address) calculateRoute(data.address, form.dropoff_address);
  };

  const handleDropoffChange = (data) => {
    setForm(prev => ({ ...prev, dropoff_address: data.address, dropoff_lat: data.lat, dropoff_lng: data.lng }));
    if (form.pickup_address && data.address) calculateRoute(form.pickup_address, data.address);
  };

  const handleCategoryChange = (e) => {
    const id = e.target.value;
    const cat = categories.find(c => String(c.id) === id);
    setForm(prev => ({ ...prev, vehicle_category_id: id, vehicle_category_name: cat?.name || id }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pickup_address || !form.dropoff_address || !form.proposed_price) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    if (!selectedCard) {
      toast.error('Veuillez selectionner une carte de paiement');
      return;
    }
    // Date validation - block past dates
    if (form.pickup_datetime) {
      const pickupDate = new Date(form.pickup_datetime);
      if (pickupDate <= new Date()) {
        toast.error('La date de prise en charge est passee. Veuillez choisir une date future.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        proposed_price: parseFloat(form.proposed_price),
        notes: form.notes + (routeInfo ? ` | Distance: ${routeInfo.distance}, Duree: ${routeInfo.duration}` : ''),
      };
      const res = await fetch(`${API}/api/partner/rides`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Course proposee avec succes !');
        navigate('/driver');
      } else {
        toast.error(rideResp.data.detail || 'Erreur lors de la creation');
      }
    } catch (err) {
      toast.error(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col" data-testid="create-ride-page">
      <header className="bg-[#1a2332] border-b border-gray-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigate('/driver')} className="text-gray-400 hover:text-white transition" data-testid="back-btn">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Proposer une Course</h1>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 pb-24">
        {/* Addresses */}
        <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800 space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-[#2ecc71]" /> Trajet</h3>
          <AddressInput label="Adresse de depart *" placeholder="Ex: Aeroport CDG, Terminal 2"
            value={form.pickup_address} onChange={handlePickupChange} testId="pickup-address" />
          <AddressInput label="Adresse d'arrivee *" placeholder="Ex: 15 Rue de Rivoli, Paris"
            value={form.dropoff_address} onChange={handleDropoffChange} testId="dropoff-address" />

          {/* Route Info */}
          {calculatingRoute && (
            <div className="flex items-center gap-2 text-[#2ecc71] text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Calcul de l'itineraire...
            </div>
          )}
          {routeInfo && !calculatingRoute && (
            <div className="bg-[#2ecc71]/10 border border-[#2ecc71]/30 rounded-xl p-3 space-y-2" data-testid="route-info">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#2ecc71]" />
                  <span className="text-white font-semibold text-sm">{routeInfo.distance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2ecc71]" />
                  <span className="text-white font-semibold text-sm">{routeInfo.duration}</span>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                <div className="flex items-start gap-2 mb-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1 flex-shrink-0" />
                  <span>{routeInfo.start_address}</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1 flex-shrink-0" />
                  <span>{routeInfo.end_address}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Route info */}
        {calculatingRoute && <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Calcul de l'itineraire...</div>}
        {routeInfo && (
          <div className="bg-[#1a2332] border border-[#2ecc71]/30 rounded-xl p-3 flex gap-4" data-testid="route-info">
            <div className="flex items-center gap-1.5 text-sm"><Route className="w-4 h-4 text-[#2ecc71]" /> <span className="text-white">{routeInfo.distance}</span></div>
            <div className="flex items-center gap-1.5 text-sm"><Clock className="w-4 h-4 text-blue-400" /> <span className="text-white">{routeInfo.duration}</span></div>
          </div>
        )}

        {/* Vehicle & Price */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#2ecc71]"><Car className="w-4 h-4" /> <span className="text-sm font-medium">Vehicule & Prix</span></div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Categorie de vehicule *</label>
            {loadingCat ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-3"><Loader2 className="w-4 h-4 animate-spin" /> Chargement...</div>
            ) : (
              <select value={form.vehicle_category_id} onChange={handleCategoryChange} required
                className={`${inputCls} appearance-none`} data-testid="vehicle-category">
                <option value="">Selectionner une categorie</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name || `Cat ${cat.id}`}</option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Prix propose * ({form.currency})</label>
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

        {/* Date/Time */}
        <div>
          <div className="flex items-center gap-2 text-[#2ecc71] mb-2"><Calendar className="w-4 h-4" /> <span className="text-sm font-medium">Date & Heure</span></div>
          <input type="datetime-local" value={form.pickup_datetime}
            onChange={(e) => setForm(prev => ({ ...prev, pickup_datetime: e.target.value }))}
            className="w-full px-4 py-3.5 bg-[#1a2332] border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
            data-testid="datetime-input" />
        </div>

        {/* Passenger Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#2ecc71]"><User className="w-4 h-4" /> <span className="text-sm font-medium">Passager</span></div>
          <input value={form.passenger_name} onChange={(e) => setForm(prev => ({ ...prev, passenger_name: e.target.value }))}
            placeholder="Nom du passager" data-testid="passenger-name"
            className="w-full px-4 py-3.5 bg-[#1a2332] border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" />
          <input value={form.passenger_phone} onChange={(e) => setForm(prev => ({ ...prev, passenger_phone: e.target.value }))}
            placeholder="Tel passager" data-testid="passenger-phone"
            className="w-full px-4 py-3.5 bg-[#1a2332] border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" />
        </div>

        {/* Flight number */}
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-2"><Plane className="w-4 h-4" /> <span className="text-sm">N. de vol (optionnel)</span></div>
          <input value={form.flight_number} onChange={(e) => setForm(prev => ({ ...prev, flight_number: e.target.value }))}
            placeholder="Ex: AF1234" data-testid="flight-input"
            className="w-full px-4 py-3.5 bg-[#1a2332] border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" />
        </div>

        {/* Card Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#2ecc71]"><CreditCard className="w-4 h-4" /> <span className="text-sm font-medium">Carte de paiement</span></div>

          {loadingCards ? (
            <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Chargement des cartes...</div>
          ) : savedCards.length === 0 ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <p className="text-amber-400 text-sm font-medium mb-2">Aucune carte enregistree</p>
              <p className="text-gray-400 text-xs mb-3">Ajoutez une carte dans votre profil pour pouvoir proposer des courses.</p>
              <button type="button" onClick={() => navigate('/driver/profile')}
                className="w-full py-3 bg-[#2ecc71] text-white rounded-xl text-sm font-semibold hover:bg-[#27ae60] transition flex items-center justify-center gap-2"
                data-testid="go-to-profile-btn">
                <Plus className="w-4 h-4" /> Ajouter une carte
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {savedCards.map(card => (
                <label key={card.pm_id}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${selectedCard === card.pm_id ? 'bg-[#2ecc71]/10 border-[#2ecc71]/50' : 'bg-[#1a2332] border-gray-700 hover:border-gray-600'}`}
                  data-testid={`card-option-${card.id}`}>
                  <input type="radio" name="card" value={card.pm_id} checked={selectedCard === card.pm_id}
                    onChange={() => setSelectedCard(card.pm_id)} className="sr-only" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCard === card.pm_id ? 'border-[#2ecc71]' : 'border-gray-600'}`}>
                    {selectedCard === card.pm_id && <CheckCircle className="w-4 h-4 text-[#2ecc71]" />}
                  </div>
                  <div className="w-10 h-7 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">{card.brand === 'visa' ? 'VISA' : card.brand === 'mastercard' ? 'MC' : 'CARD'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{brandLabels[card.brand] || 'Carte'}</p>
                    <p className="text-gray-500 text-xs">Ajoutee le {new Date(card.added_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </label>
              ))}
              <button type="button" onClick={() => navigate('/driver/profile')}
                className="w-full py-2.5 text-[#2ecc71] text-xs font-medium flex items-center justify-center gap-1 hover:underline">
                <Plus className="w-3 h-3" /> Ajouter une autre carte
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Shield className="w-3 h-3" />
            <span>Paiement securise via Stripe - Debite a l'acceptation par un chauffeur</span>
          </div>
        </div>

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0f1923] border-t border-gray-800">
          <button type="submit" disabled={loading || !selectedCard}
            className="w-full bg-[#2ecc71] text-white py-4 rounded-xl font-bold text-base hover:bg-[#27ae60] disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="submit-ride-btn">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</> : <>Proposer - {form.proposed_price || '0'} EUR</>}
          </button>
        </div>
      </div>

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
