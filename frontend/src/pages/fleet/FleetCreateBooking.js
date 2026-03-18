import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFleetAuth } from './FleetAuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Plane, Clock, MapPin } from 'lucide-react';

const TABS = [
  { key: 'transfer', label: 'Transfer', color: 'bg-blue-500' },
  { key: 'dispo', label: 'Dispo', color: 'bg-emerald-500' },
  { key: 'excursion', label: 'Excursion', color: 'bg-amber-500' },
];

const FleetCreateBooking = () => {
  const { authFetch } = useFleetAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('transfer');
  const [form, setForm] = useState({
    date: '', time: '', passengers: 1, passengerName: '', clientName: '', flightNumber: '',
    pickupAddress: '', dropoffAddress: '',
    hours: 1, vehicleModel: '',
    tourName: '', guideName: '',
    price: '', comment: '',
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const inputCls = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date || !form.time) { toast.error('Date et heure requises'); return; }
    if (tab === 'transfer' && (!form.pickupAddress || !form.dropoffAddress)) { toast.error('Adresses requises'); return; }
    if (tab === 'dispo' && !form.hours) { toast.error("Nombre d'heures requis"); return; }
    if (tab === 'excursion' && !form.pickupAddress) { toast.error('Adresse de prise en charge requise'); return; }

    setLoading(true);
    try {
      const payload = {
        type: tab, date: form.date, time: form.time,
        price: parseFloat(form.price) || 0, comment: form.comment,
      };
      if (tab === 'transfer') {
        payload.passengers = parseInt(form.passengers) || 1;
        payload.passengerName = form.passengerName;
        payload.clientName = form.clientName;
        payload.flightNumber = form.flightNumber;
        payload.pickupAddress = form.pickupAddress;
        payload.dropoffAddress = form.dropoffAddress;
      } else if (tab === 'dispo') {
        payload.hours = parseInt(form.hours) || 1;
        payload.vehicleModel = form.vehicleModel;
        payload.clientName = form.clientName;
        payload.flightNumber = form.flightNumber;
      } else {
        payload.hours = parseInt(form.hours) || 1;
        payload.vehicleModel = form.vehicleModel;
        payload.pickupAddress = form.pickupAddress;
        payload.tourName = form.tourName;
        payload.guideName = form.guideName;
        payload.clientName = form.clientName;
      }

      const res = await authFetch('/api/fleet/my-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Reservation creee !');
        navigate('/fleet/my-bookings');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Erreur');
      }
    } catch { toast.error('Erreur de connexion'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-testid="fleet-create-booking">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/fleet/my-bookings')} data-testid="back-to-my-bookings-btn"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle reservation</h1>
          <p className="text-gray-500 text-sm mt-0.5">Planifiez une course pour votre flotte</p>
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm" data-testid="booking-type-tabs">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} data-testid={`tab-${t.key}`}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${tab === t.key ? `${t.color} text-white shadow-sm` : 'text-gray-500 hover:bg-gray-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5" data-testid="create-booking-form">
        {/* Common: Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
            <input type="date" value={form.date} onChange={set('date')} data-testid="booking-date" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Heure *</label>
            <input type="time" value={form.time} onChange={set('time')} data-testid="booking-time" className={inputCls} />
          </div>
        </div>

        {/* Common: Client name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du client</label>
          <input type="text" value={form.clientName} onChange={set('clientName')} data-testid="booking-client-name" className={inputCls} placeholder="Ex: M. Dupont" />
        </div>

        {/* Flight number for Transfer & Dispo */}
        {(tab === 'transfer' || tab === 'dispo') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Numero de vol</label>
            <input type="text" value={form.flightNumber} onChange={set('flightNumber')} data-testid="booking-flight" className={inputCls} placeholder="Ex: AF123" />
          </div>
        )}

        {/* TRANSFER fields */}
        {tab === 'transfer' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du passager</label>
                <input type="text" value={form.passengerName} onChange={set('passengerName')} data-testid="booking-passenger-name" className={inputCls} placeholder="Ex: M. Dupont" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre de personnes</label>
                <input type="number" min="1" value={form.passengers} onChange={set('passengers')} data-testid="booking-passengers" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse prise en charge *</label>
              <input type="text" value={form.pickupAddress} onChange={set('pickupAddress')} data-testid="booking-pickup" className={inputCls} placeholder="Ex: Aeroport CDG, Terminal 2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse de depose *</label>
              <input type="text" value={form.dropoffAddress} onChange={set('dropoffAddress')} data-testid="booking-dropoff" className={inputCls} placeholder="Ex: 15 Rue de Rivoli, Paris" />
            </div>
          </>
        )}

        {/* DISPO fields */}
        {tab === 'dispo' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre d'heures *</label>
                <input type="number" min="1" value={form.hours} onChange={set('hours')} data-testid="booking-hours" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Modele voiture</label>
                <input type="text" value={form.vehicleModel} onChange={set('vehicleModel')} data-testid="booking-vehicle" className={inputCls} placeholder="Ex: Mercedes Classe S" />
              </div>
            </div>
          </>
        )}

        {/* EXCURSION fields */}
        {tab === 'excursion' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse prise en charge *</label>
              <input type="text" value={form.pickupAddress} onChange={set('pickupAddress')} data-testid="booking-pickup" className={inputCls} placeholder="Ex: Hotel Le Bristol, Paris" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre d'heures</label>
                <input type="number" min="1" value={form.hours} onChange={set('hours')} data-testid="booking-hours" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Modele voiture</label>
                <input type="text" value={form.vehicleModel} onChange={set('vehicleModel')} data-testid="booking-vehicle" className={inputCls} placeholder="Ex: Mercedes V-Class" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du tour</label>
                <input type="text" value={form.tourName} onChange={set('tourName')} data-testid="booking-tour" className={inputCls} placeholder="Ex: Versailles" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du guide</label>
                <input type="text" value={form.guideName} onChange={set('guideName')} data-testid="booking-guide" className={inputCls} placeholder="Ex: Jean Martin" />
              </div>
            </div>
          </>
        )}

        {/* Common: Price & Comment */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prix (EUR)</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} data-testid="booking-price" className={inputCls} placeholder="0.00" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Commentaire</label>
          <textarea value={form.comment} onChange={set('comment')} rows={3} data-testid="booking-comment"
            className={inputCls + " resize-none"} placeholder="Instructions particulieres..." />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate('/fleet/my-bookings')} data-testid="cancel-create-btn"
            className="px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition">
            Annuler
          </button>
          <button type="submit" disabled={loading} data-testid="submit-booking-btn"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plane className="w-4 h-4" />}
            {loading ? 'Creation...' : 'Creer la reservation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FleetCreateBooking;
