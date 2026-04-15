import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { transferService } from '@/services/api';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import {
  Plane, TrainFront, Star, MapPin, Clock, Users, Briefcase,
  ChevronRight, ChevronLeft, CheckCircle, Phone, User, Loader2,
  Calendar, ArrowRight, RotateCcw, Car, Search
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ICON_MAP = { plane: Plane, train: TrainFront, star: Star };

/* ────────────────────────────────────────────────────────────
   ATTRACT SCREEN — Animated idle screensaver
   ──────────────────────────────────────────────────────────── */
const AttractScreen = ({ hotelName, onTap }) => (
  <div
    className="fixed inset-0 z-50 bg-[#060b14] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
    onClick={onTap}
    onTouchStart={onTap}
    data-testid="kiosk-attract-screen"
  >
    {/* Animated background particles */}
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 20 }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: `${6 + (i % 5) * 4}px`,
            height: `${6 + (i % 5) * 4}px`,
            background: i % 3 === 0 ? '#2ecc71' : i % 3 === 1 ? '#3498db' : '#1abc9c',
            left: `${(i * 17) % 100}%`,
            top: `${(i * 23) % 100}%`,
            animation: `kioskFloat ${8 + (i % 5) * 3}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}
    </div>

    {/* Pulsing ring */}
    <div className="relative mb-10">
      <div className="w-32 h-32 rounded-full bg-[#2ecc71]/5 flex items-center justify-center animate-pulse">
        <div className="w-24 h-24 rounded-full bg-[#2ecc71]/10 flex items-center justify-center">
          <Car className="w-14 h-14 text-[#2ecc71]" style={{ animation: 'kioskCarBounce 3s ease-in-out infinite' }} />
        </div>
      </div>
      <div className="absolute inset-0 rounded-full border-2 border-[#2ecc71]/20" style={{ animation: 'kioskRingPulse 3s ease-out infinite' }} />
      <div className="absolute inset-0 rounded-full border border-[#2ecc71]/10" style={{ animation: 'kioskRingPulse 3s ease-out infinite 1.5s' }} />
    </div>

    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight text-center" style={{ animation: 'kioskFadeIn 2s ease-out' }}>
      Zont Transfer
    </h1>

    {hotelName && (
      <p className="text-lg text-[#2ecc71] font-medium mb-8" style={{ animation: 'kioskFadeIn 2s ease-out 0.5s both' }}>
        {hotelName}
      </p>
    )}

    <div className="flex items-center gap-3 text-gray-400 mb-12" style={{ animation: 'kioskFadeIn 2s ease-out 1s both' }}>
      <div className="flex gap-6 text-sm">
        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#2ecc71]" />Prix fixes</span>
        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#2ecc71]" />24h/24</span>
        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#2ecc71]" />Meet & Greet</span>
      </div>
    </div>

    {/* Tap indicator */}
    <div className="flex flex-col items-center gap-3" style={{ animation: 'kioskTapPulse 2s ease-in-out infinite' }}>
      <div className="w-16 h-16 rounded-full border-2 border-[#2ecc71]/50 flex items-center justify-center bg-[#2ecc71]/5">
        <div className="w-3 h-3 rounded-full bg-[#2ecc71]" />
      </div>
      <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Touchez pour reserver</p>
    </div>

    {/* CSS Animations */}
    <style>{`
      @keyframes kioskFloat {
        0%, 100% { transform: translateY(0) translateX(0) scale(1); }
        33% { transform: translateY(-40px) translateX(20px) scale(1.2); }
        66% { transform: translateY(20px) translateX(-15px) scale(0.8); }
      }
      @keyframes kioskCarBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @keyframes kioskRingPulse {
        0% { transform: scale(1); opacity: 0.4; }
        100% { transform: scale(2.5); opacity: 0; }
      }
      @keyframes kioskFadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes kioskTapPulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
      }
    `}</style>
  </div>
);

/* ────────────────────────────────────────────────────────────
   SUB-COMPONENTS
   ──────────────────────────────────────────────────────────── */

const StepIndicator = ({ current, total }) => (
  <div className="flex items-center gap-2 justify-center" data-testid="kiosk-steps">
    {Array.from({ length: total }, (_, i) => (
      <React.Fragment key={i}>
        {i > 0 && <div className={`w-6 h-0.5 ${i <= current ? 'bg-[#2ecc71]' : 'bg-gray-700'}`} />}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
          i < current ? 'bg-[#2ecc71] text-white' :
          i === current ? 'bg-[#2ecc71]/20 border-2 border-[#2ecc71] text-[#2ecc71]' :
          'bg-gray-800 text-gray-600 border border-gray-700'
        }`}>
          {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
        </div>
      </React.Fragment>
    ))}
  </div>
);

const DestinationCard = ({ dest, onClick }) => {
  const Icon = ICON_MAP[dest.icon] || MapPin;
  return (
    <button
      onClick={() => onClick(dest)}
      className="group bg-white/[0.04] hover:bg-[#2ecc71]/10 border border-white/10 hover:border-[#2ecc71]/40 rounded-2xl p-5 text-left transition-all active:scale-[0.98]"
      data-testid={`dest-${dest.name.replace(/\s/g, '-').toLowerCase()}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 bg-[#2ecc71]/10 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-[#2ecc71]" />
        </div>
        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#2ecc71] transition-colors mt-1" />
      </div>
      <h3 className="text-white font-bold text-lg mb-1">{dest.name}</h3>
      <p className="text-gray-500 text-sm truncate mb-3">{dest.address}</p>
      {dest.cheapest > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide">A partir de</span>
          <span className="text-2xl font-extrabold text-[#2ecc71]">{dest.cheapest}<span className="text-sm font-normal ml-0.5">&euro;</span></span>
        </div>
      )}
      {dest.vehicles?.[0]?.duration > 0 && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>~{dest.vehicles[0].duration} min</span>
        </div>
      )}
    </button>
  );
};

const VehicleCard = ({ vehicle, selected, onClick }) => {
  const imageUrl = transferService.getVehicleImageUrl(vehicle.imagePath);
  const isActive = selected?.tripType === vehicle.tripType;
  return (
    <button
      onClick={() => onClick(vehicle)}
      className={`bg-white/[0.04] border rounded-2xl p-4 text-left transition-all active:scale-[0.98] ${
        isActive ? 'border-[#2ecc71] bg-[#2ecc71]/5 ring-1 ring-[#2ecc71]/30' : 'border-white/10 hover:border-white/20'
      }`}
      data-testid={`vehicle-${vehicle.tripType.replace(/\s/g, '-').toLowerCase()}`}
    >
      <div className="flex items-center justify-center h-24 mb-3">
        {imageUrl ? (
          <img src={imageUrl} alt={vehicle.tripType} className="max-h-full max-w-full object-contain" />
        ) : (
          <Car className="w-12 h-12 text-gray-600" />
        )}
      </div>
      <h4 className="text-white font-bold text-base mb-1">{vehicle.tripType}</h4>
      {vehicle.description && <p className="text-xs text-gray-500 mb-2">{vehicle.description}</p>}
      <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{vehicle.passenger}</span>
        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{vehicle.luggage}</span>
      </div>
      <div className="text-2xl font-extrabold text-[#2ecc71]">
        {vehicle.minAmount}<span className="text-sm font-normal ml-0.5">&euro;</span>
      </div>
    </button>
  );
};


/* ────────────────────────────────────────────────────────────
   MAIN KIOSK COMPONENT
   ──────────────────────────────────────────────────────────── */

const KioskPage = () => {
  const { slug } = useParams();
  const [hotel, setHotel] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Attract screen (screensaver)
  const [showAttract, setShowAttract] = useState(true);
  const idleTimerRef = useRef(null);
  const IDLE_TIMEOUT = 60000; // 60s inactivity → show attract

  // Flow state
  const [step, setStep] = useState(0); // 0=destinations, 1=datetime, 2=vehicle, 3=info, 4=confirm
  const [selectedDest, setSelectedDest] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [booking, setBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Custom destination search
  const [customDest, setCustomDest] = useState(null);
  const [customPricing, setCustomPricing] = useState(false);

  const resetKiosk = useCallback(() => {
    setStep(0);
    setSelectedDest(null);
    setDate('');
    setTime('');
    setSelectedVehicle(null);
    setClientName('');
    setClientPhone('');
    setBooking(null);
    setSubmitting(false);
    setCustomDest(null);
    setCustomPricing(false);
  }, []);

  // Idle timer — show attract screen after inactivity
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    // Don't set idle timer if on confirmation step or attract is already showing
    if (showAttract) return;
    idleTimerRef.current = setTimeout(() => {
      resetKiosk();
      setShowAttract(true);
    }, IDLE_TIMEOUT);
  }, [showAttract, resetKiosk]);

  useEffect(() => {
    const events = ['click', 'touchstart', 'mousemove', 'keydown'];
    const handler = () => resetIdleTimer();
    events.forEach(e => document.addEventListener(e, handler, { passive: true }));
    resetIdleTimer();
    return () => {
      events.forEach(e => document.removeEventListener(e, handler));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // Set default date/time
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    setDate(`${y}-${m}-${d}`);
    setTime(`${h}:00`);
  }, [step]);

  // Auto-reset after 45 seconds on confirmation
  useEffect(() => {
    if (step === 4 && booking) {
      const t = setTimeout(() => { resetKiosk(); setShowAttract(true); }, 45000);
      return () => clearTimeout(t);
    }
  }, [step, booking, resetKiosk]);

  // Load hotel + prices
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API}/api/kiosk/${slug}/prices`, { method: 'POST' })
      .then(r => { if (!r.ok) throw new Error('Hotel not found'); return r.json(); })
      .then(data => {
        setHotel(data.hotel);
        setDestinations(data.destinations || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleDismissAttract = () => {
    setShowAttract(false);
    resetIdleTimer();
  };

  const handleSelectDest = (dest) => {
    setSelectedDest(dest);
    setStep(1);
  };

  const handleCustomDestSelect = async (place) => {
    if (!place.latitude || !place.longitude) return;
    setCustomDest(place);
    setCustomPricing(true);
    try {
      const resp = await fetch(`${API}/api/kiosk/${slug}/custom-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationLat: place.latitude,
          destinationLng: place.longitude,
          destinationAddress: place.address,
          destinationName: place.address.split(',')[0],
        }),
      });
      if (!resp.ok) throw new Error('Pricing failed');
      const data = await resp.json();
      setSelectedDest(data);
      setStep(1);
    } catch {
      setError('Impossible de calculer le prix pour cette destination.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setCustomPricing(false);
    }
  };

  const handleDateTimeNext = () => {
    if (date && time) setStep(2);
  };

  const handleSelectVehicle = (v) => {
    setSelectedVehicle(v);
    setStep(3);
  };

  const handleSubmitBooking = async () => {
    if (!clientName.trim() || !clientPhone.trim()) return;
    setSubmitting(true);
    try {
      const resp = await fetch(`${API}/api/kiosk/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelSlug: slug,
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          destination: selectedDest.name,
          destinationAddress: selectedDest.address,
          date,
          time,
          vehicleType: selectedVehicle.tripType,
          price: selectedVehicle.minAmount,
          passengers: 1,
        }),
      });
      if (!resp.ok) throw new Error('Booking failed');
      const data = await resp.json();
      setBooking(data);

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'taxi_reservation',
        'value': parseFloat(selectedVehicle.minAmount) || 0,
        'currency': 'EUR',
        'transaction_id': data?.id || data?.bookingId || `KIOSK-${Date.now()}`
      });

      setStep(4);
    } catch {
      setError('Erreur lors de la reservation. Veuillez reessayer.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Loading / Error ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060b14] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#2ecc71] animate-spin" />
      </div>
    );
  }

  if (error && !hotel) {
    return (
      <div className="min-h-screen bg-[#060b14] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-[#2ecc71] text-white px-6 py-3 rounded-xl">Reessayer</button>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-[#060b14] flex flex-col text-white select-none" data-testid="kiosk-page">

      {/* Attract screensaver */}
      {showAttract && <AttractScreen hotelName={hotel?.name} onTap={handleDismissAttract} />}

      {/* Header */}
      <header className="bg-[#0a1020] border-b border-white/[0.06] px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2ecc71]/10 rounded-xl flex items-center justify-center">
            <Car className="w-5 h-5 text-[#2ecc71]" />
          </div>
          <div>
            <p className="text-lg font-bold text-white leading-tight">Zont Transfer</p>
            <p className="text-xs text-gray-500">{hotel?.name || ''}</p>
          </div>
        </div>
        {step > 0 && step < 4 && (
          <StepIndicator current={step} total={4} />
        )}
        {step > 0 && step < 4 && (
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
            data-testid="kiosk-back"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour
          </button>
        )}
        {step === 4 && (
          <button onClick={() => { resetKiosk(); }} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm" data-testid="kiosk-new-booking">
            <RotateCcw className="w-4 h-4" />
            Nouvelle reservation
          </button>
        )}
      </header>

      {/* Error banner */}
      {error && hotel && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 text-center text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Content with fade-in animation */}
      <main className="flex-1 overflow-auto px-4 sm:px-6 lg:px-10 py-6" style={{ animation: 'kioskContentIn 0.4s ease-out' }}>

        {/* Step 0: Destinations + Google search */}
        {step === 0 && (
          <div data-testid="kiosk-step-destinations" style={{ animation: 'kioskSlideUp 0.4s ease-out' }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                Ou souhaitez-vous aller ?
              </h1>
              <p className="text-gray-500 text-base">
                Depart : <span className="text-[#2ecc71] font-medium">{hotel?.name}</span>
              </p>
            </div>

            {/* Google Places search bar */}
            <div className="max-w-2xl mx-auto mb-8" data-testid="kiosk-custom-search">
              <div className="relative">
                <PlacesAutocomplete
                  value={customDest?.address || ''}
                  onChange={handleCustomDestSelect}
                  placeholder="Rechercher une autre destination..."
                  className="w-full px-5 py-4 pl-12 bg-white/[0.06] border border-white/10 rounded-2xl text-white text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                  icon={
                    customPricing
                      ? <Loader2 className="w-5 h-5 text-[#2ecc71] animate-spin mt-1" />
                      : <Search className="w-5 h-5 text-gray-500 mt-1" />
                  }
                  data-testid="kiosk-places-input"
                />
              </div>
              {customPricing && (
                <p className="text-center text-sm text-gray-500 mt-3 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calcul du prix en cours...
                </p>
              )}
            </div>

            {/* Separator */}
            <div className="max-w-2xl mx-auto flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-gray-600 uppercase tracking-widest font-semibold">Destinations populaires</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Pre-configured destinations grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {destinations.map((dest, i) => (
                <DestinationCard key={i} dest={dest} onClick={handleSelectDest} />
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div className="max-w-lg mx-auto" data-testid="kiosk-step-datetime" style={{ animation: 'kioskSlideUp 0.4s ease-out' }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-white mb-2">Quand partez-vous ?</h1>
              <p className="text-gray-500">
                Vers <span className="text-[#2ecc71] font-medium">{selectedDest?.name}</span>
              </p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide font-semibold">
                  <Calendar className="w-4 h-4 inline mr-1.5" />Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-5 py-4 bg-white/[0.06] border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                  data-testid="kiosk-date"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide font-semibold">
                  <Clock className="w-4 h-4 inline mr-1.5" />Heure
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-5 py-4 bg-white/[0.06] border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent"
                  data-testid="kiosk-time"
                />
              </div>
              <button
                onClick={handleDateTimeNext}
                disabled={!date || !time}
                className="w-full bg-[#2ecc71] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#27ae60] transition-all disabled:bg-gray-700 disabled:text-gray-500 flex items-center justify-center gap-2 mt-4"
                data-testid="kiosk-datetime-next"
              >
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle selection */}
        {step === 2 && (
          <div data-testid="kiosk-step-vehicle" style={{ animation: 'kioskSlideUp 0.4s ease-out' }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-white mb-2">Choisissez votre vehicule</h1>
              <p className="text-gray-500">
                {hotel?.name} &rarr; {selectedDest?.name} &bull; {date} a {time}
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {(selectedDest?.vehicles || []).map((v, i) => (
                <VehicleCard key={i} vehicle={v} selected={selectedVehicle} onClick={handleSelectVehicle} />
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Client Info */}
        {step === 3 && (
          <div className="max-w-lg mx-auto" data-testid="kiosk-step-info" style={{ animation: 'kioskSlideUp 0.4s ease-out' }}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-white mb-2">Vos coordonnees</h1>
              <p className="text-gray-500">Pour que votre chauffeur puisse vous contacter</p>
            </div>

            {/* Recap mini */}
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-500">Vers</p>
                  <p className="text-white font-semibold">{selectedDest?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">{date} a {time}</p>
                  <p className="text-white font-semibold">{selectedVehicle?.tripType}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">Prix</p>
                  <p className="text-2xl font-extrabold text-[#2ecc71]">{selectedVehicle?.minAmount}&euro;</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide font-semibold">
                  <User className="w-4 h-4 inline mr-1.5" />Nom complet *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full px-5 py-4 bg-white/[0.06] border border-white/10 rounded-xl text-white text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
                  data-testid="kiosk-name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide font-semibold">
                  <Phone className="w-4 h-4 inline mr-1.5" />Telephone *
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full px-5 py-4 bg-white/[0.06] border border-white/10 rounded-xl text-white text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
                  data-testid="kiosk-phone"
                />
              </div>
              <button
                onClick={handleSubmitBooking}
                disabled={submitting || !clientName.trim() || !clientPhone.trim()}
                className="w-full bg-[#2ecc71] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#27ae60] transition-all disabled:bg-gray-700 disabled:text-gray-500 flex items-center justify-center gap-2 mt-4"
                data-testid="kiosk-confirm-btn"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Reservation en cours...</>
                ) : (
                  <>Confirmer la reservation <CheckCircle className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && booking && (
          <div className="max-w-lg mx-auto text-center" data-testid="kiosk-step-confirm" style={{ animation: 'kioskSlideUp 0.5s ease-out' }}>
            <div className="w-24 h-24 bg-[#2ecc71]/10 rounded-full flex items-center justify-center mx-auto mb-6" style={{ animation: 'kioskConfirmPop 0.6s ease-out' }}>
              <CheckCircle className="w-14 h-14 text-[#2ecc71]" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Reservation confirmee !</h1>
            <p className="text-gray-400 mb-6">Votre chauffeur viendra vous chercher a la reception</p>

            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-6 text-left">
              <div className="text-center mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Reference</p>
                <p className="text-3xl font-mono font-extrabold text-[#2ecc71] tracking-wider" data-testid="kiosk-reference">
                  {booking.reference}
                </p>
              </div>
              <div className="border-t border-white/10 pt-4 mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Destination</span>
                  <span className="text-white font-medium">{selectedDest?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date & Heure</span>
                  <span className="text-white font-medium">{date} a {time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicule</span>
                  <span className="text-white font-medium">{selectedVehicle?.tripType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Passager</span>
                  <span className="text-white font-medium">{clientName}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3">
                  <span className="text-gray-500 font-bold">Total</span>
                  <span className="text-2xl font-extrabold text-[#2ecc71]">{selectedVehicle?.minAmount}&euro;</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-xs">Cette page se reinitialise automatiquement dans 45 secondes</p>

            <button
              onClick={() => { resetKiosk(); }}
              className="mt-6 bg-white/[0.06] border border-white/10 text-white px-8 py-3 rounded-xl hover:bg-white/[0.1] transition-colors"
              data-testid="kiosk-new-booking-btn"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Nouvelle reservation
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0a1020] border-t border-white/[0.06] px-6 py-3 text-center text-xs text-gray-600 flex-shrink-0">
        Zont Transfer &bull; Prix fixes, pas de surprises &bull; Service 24h/24
      </footer>

      {/* Global kiosk animations */}
      <style>{`
        @keyframes kioskSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes kioskContentIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes kioskConfirmPop {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default KioskPage;
