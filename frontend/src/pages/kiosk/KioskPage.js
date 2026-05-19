import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { transferService } from '@/services/api';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import {
  Plane, TrainFront, Castle, MapPin, Clock, Users, Briefcase,
  ChevronRight, ChevronLeft, CheckCircle, Phone, User, Loader2,
  Calendar, ArrowRight, RotateCcw, Car, Search, Euro, Zap, ShieldCheck, Sparkles
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const LANGS = {
  fr: {
    heroTitle: 'Reservez votre chauffeur prive',
    heroSub: 'Prix fixe, prise en charge devant l\'hotel, service 24h/24',
    airports: 'Aeroports', airportsSub: 'Transferts vers tous les aeroports',
    stations: 'Gares', stationsSub: 'Transferts vers toutes les gares',
    disney: 'Disneyland Paris', disneySub: 'Transfert direct vers la magie',
    other: 'Autre destination', otherSub: 'Ou que vous alliez, nous vous conduisons',
    popular: 'Destinations populaires', from: 'A PARTIR DE',
    fixedPrice: 'Prix fixes', fixedPriceSub: 'Tarifs connus a l\'avance',
    noSurprise: 'Pas de surprise', noSurpriseSub: 'Aucun frais cache',
    h24: 'Service 24h/24', h24Sub: 'A votre service, jour et nuit',
    fastBook: 'Reservation rapide', fastBookSub: 'Simple, rapide et securisee',
    when: 'Quand partez-vous ?', towards: 'Vers', chooseVehicle: 'Choisissez votre vehicule',
    yourInfo: 'Vos coordonnees', driverContact: 'Pour que votre chauffeur puisse vous contacter',
    name: 'Nom complet', phone: 'Telephone', confirm: 'Confirmer la reservation',
    confirmed: 'Reservation confirmee !', driverWill: 'Votre chauffeur viendra vous chercher a la reception',
    ref: 'Reference', dest: 'Destination', dateTime: 'Date & Heure', vehicle: 'Vehicule',
    passenger: 'Passager', total: 'Total', autoReset: 'Cette page se reinitialise automatiquement',
    newBooking: 'Nouvelle reservation', back: 'Retour', continue: 'Continuer',
    searchOther: 'Rechercher une autre destination...', calcPrice: 'Calcul du prix en cours...',
    booking: 'Reservation en cours...', date: 'Date', time: 'Heure',
  },
  en: {
    heroTitle: 'Book your private chauffeur',
    heroSub: 'Fixed price, hotel pick-up, 24/7 service',
    airports: 'Airports', airportsSub: 'Transfers to all airports',
    stations: 'Train Stations', stationsSub: 'Transfers to all stations',
    disney: 'Disneyland Paris', disneySub: 'Direct transfer to the magic',
    other: 'Other destination', otherSub: 'Wherever you go, we drive you',
    popular: 'Popular destinations', from: 'FROM',
    fixedPrice: 'Fixed prices', fixedPriceSub: 'Known rates in advance',
    noSurprise: 'No surprises', noSurpriseSub: 'No hidden fees',
    h24: '24/7 Service', h24Sub: 'At your service, day and night',
    fastBook: 'Fast booking', fastBookSub: 'Simple, fast and secure',
    when: 'When do you depart?', towards: 'To', chooseVehicle: 'Choose your vehicle',
    yourInfo: 'Your details', driverContact: 'So your driver can contact you',
    name: 'Full name', phone: 'Phone', confirm: 'Confirm booking',
    confirmed: 'Booking confirmed!', driverWill: 'Your driver will meet you at reception',
    ref: 'Reference', dest: 'Destination', dateTime: 'Date & Time', vehicle: 'Vehicle',
    passenger: 'Passenger', total: 'Total', autoReset: 'This page resets automatically',
    newBooking: 'New booking', back: 'Back', continue: 'Continue',
    searchOther: 'Search another destination...', calcPrice: 'Calculating price...',
    booking: 'Booking in progress...', date: 'Date', time: 'Time',
  },
  ru: {
    heroTitle: 'Закажите личного водителя',
    heroSub: 'Фиксированная цена, подача у отеля, сервис 24/7',
    airports: 'Аэропорты', airportsSub: 'Трансферы во все аэропорты',
    stations: 'Вокзалы', stationsSub: 'Трансферы на все вокзалы',
    disney: 'Диснейленд Париж', disneySub: 'Прямой трансфер в мир магии',
    other: 'Другое направление', otherSub: 'Куда бы вы ни ехали',
    popular: 'Популярные направления', from: 'ОТ',
    fixedPrice: 'Фикс. цены', fixedPriceSub: 'Тарифы известны заранее',
    noSurprise: 'Без сюрпризов', noSurpriseSub: 'Никаких скрытых платежей',
    h24: 'Сервис 24/7', h24Sub: 'К вашим услугам круглосуточно',
    fastBook: 'Быстрое бронирование', fastBookSub: 'Просто, быстро, безопасно',
    when: 'Когда вы выезжаете?', towards: 'В', chooseVehicle: 'Выберите автомобиль',
    yourInfo: 'Ваши данные', driverContact: 'Чтобы водитель мог связаться с вами',
    name: 'Полное имя', phone: 'Телефон', confirm: 'Подтвердить бронирование',
    confirmed: 'Бронирование подтверждено!', driverWill: 'Водитель встретит вас на ресепшн',
    ref: 'Номер', dest: 'Направление', dateTime: 'Дата и время', vehicle: 'Автомобиль',
    passenger: 'Пассажир', total: 'Итого', autoReset: 'Страница обновится автоматически',
    newBooking: 'Новое бронирование', back: 'Назад', continue: 'Продолжить',
    searchOther: 'Поиск другого направления...', calcPrice: 'Расчёт цены...',
    booking: 'Бронирование...', date: 'Дата', time: 'Время',
  },
};

/* ──── ATTRACT SCREEN ──── */
const AttractScreen = ({ hotelName, onTap }) => (
  <div className="fixed inset-0 z-50 bg-[#0b1120] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden" onClick={onTap} onTouchStart={onTap} data-testid="kiosk-attract-screen">
    <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(46,204,113,0.3) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
    <div className="relative mb-10">
      <div className="w-28 h-28 rounded-full bg-[#2ecc71]/5 flex items-center justify-center" style={{ animation: 'kioskPulse 3s ease-in-out infinite' }}>
        <div className="w-20 h-20 rounded-full bg-[#2ecc71]/10 flex items-center justify-center">
          <Car className="w-12 h-12 text-[#2ecc71]" style={{ animation: 'kioskCarBounce 3s ease-in-out infinite' }} />
        </div>
      </div>
    </div>
    <h1 className="text-5xl lg:text-6xl font-black text-white mb-3 tracking-tight">Zont Transfer</h1>
    {hotelName && <p className="text-lg text-[#2ecc71] font-medium mb-10">{hotelName}</p>}
    <div className="flex flex-col items-center gap-3" style={{ animation: 'kioskTapPulse 2s ease-in-out infinite' }}>
      <div className="w-16 h-16 rounded-full border-2 border-[#2ecc71]/40 flex items-center justify-center bg-[#2ecc71]/5">
        <div className="w-3 h-3 rounded-full bg-[#2ecc71]" />
      </div>
      <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Touchez pour reserver</p>
    </div>
    <style>{`
      @keyframes kioskPulse { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.05);opacity:1} }
      @keyframes kioskCarBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      @keyframes kioskTapPulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
      @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    `}</style>
  </div>
);

/* ──── MAIN KIOSK ──── */
const KioskPage = () => {
  const { slug } = useParams();
  const [hotel, setHotel] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAttract, setShowAttract] = useState(true);
  const [lang, setLang] = useState('fr');
  const t = LANGS[lang] || LANGS.fr;
  const idleTimerRef = useRef(null);

  // Flow
  const [step, setStep] = useState(0);
  const [selectedDest, setSelectedDest] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [booking, setBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [customPricing, setCustomPricing] = useState(false);

  const resetKiosk = useCallback(() => {
    setStep(0); setSelectedDest(null); setDate(''); setTime('');
    setSelectedVehicle(null); setClientName(''); setClientPhone('');
    setBooking(null); setSubmitting(false); setCustomPricing(false);
  }, []);

  // Idle timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (showAttract) return;
    idleTimerRef.current = setTimeout(() => { resetKiosk(); setShowAttract(true); }, 90000);
  }, [showAttract, resetKiosk]);

  useEffect(() => {
    const events = ['click', 'touchstart', 'mousemove', 'keydown'];
    const h = () => resetIdleTimer();
    events.forEach(e => document.addEventListener(e, h, { passive: true }));
    resetIdleTimer();
    return () => { events.forEach(e => document.removeEventListener(e, h)); if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [resetIdleTimer]);

  useEffect(() => {
    const now = new Date(); now.setHours(now.getHours() + 2);
    setDate(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`);
    setTime(`${String(now.getHours()).padStart(2,'0')}:00`);
  }, [step]);

  useEffect(() => {
    if (step === 4 && booking) { const t2 = setTimeout(() => { resetKiosk(); setShowAttract(true); }, 45000); return () => clearTimeout(t2); }
  }, [step, booking, resetKiosk]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API}/api/kiosk/${slug}/prices`, { method: 'POST' })
      .then(r => { if (!r.ok) throw new Error('Hotel not found'); return r.json(); })
      .then(data => { setHotel(data.hotel); setDestinations(data.destinations || []); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCustomDest = async (place) => {
    if (!place.latitude || !place.longitude) return;
    setCustomPricing(true);
    try {
      const resp = await fetch(`${API}/api/kiosk/${slug}/custom-price`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationLat: place.latitude, destinationLng: place.longitude, destinationAddress: place.address, destinationName: place.address.split(',')[0] }),
      });
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      setSelectedDest(data); setStep(1);
    } catch { setError('Pricing error'); setTimeout(() => setError(null), 3000); }
    finally { setCustomPricing(false); }
  };

  const handleSubmitBooking = async () => {
    if (!clientName.trim() || !clientPhone.trim()) return;
    setSubmitting(true);
    try {
      const resp = await fetch(`${API}/api/kiosk/book`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelSlug: slug, clientName: clientName.trim(), clientPhone: clientPhone.trim(), destination: selectedDest.name, destinationAddress: selectedDest.address, date, time, vehicleType: selectedVehicle.tripType, price: selectedVehicle.minAmount, passengers: 1 }),
      });
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      setBooking(data); setStep(4);
    } catch { setError('Booking error'); setTimeout(() => setError(null), 3000); }
    finally { setSubmitting(false); }
  };

  // Group destinations by category
  const airportDests = destinations.filter(d => d.icon === 'plane');
  const stationDests = destinations.filter(d => d.icon === 'train');
  const disneyDests = destinations.filter(d => d.name?.toLowerCase().includes('disney'));
  const otherDests = destinations.filter(d => d.icon !== 'plane' && d.icon !== 'train' && !d.name?.toLowerCase().includes('disney'));

  if (loading) return <div className="min-h-screen bg-[#0b1120] flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#2ecc71] animate-spin" /></div>;
  if (error && !hotel) return <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-[#0b1120] flex flex-col text-white select-none" data-testid="kiosk-page">
      {showAttract && <AttractScreen hotelName={hotel?.name} onTap={() => { setShowAttract(false); resetIdleTimer(); }} />}

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2ecc71]/10 rounded-lg flex items-center justify-center border border-[#2ecc71]/20">
            <span className="text-[#2ecc71] font-black text-lg">Z</span>
          </div>
          <div>
            <p className="text-white font-bold leading-tight">Zont Transfer</p>
            <p className="text-xs text-gray-500">{hotel?.name || ''}</p>
          </div>
        </div>
        {step > 0 && step < 4 && (
          <button onClick={() => setStep(Math.max(0, step - 1))} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm" data-testid="kiosk-back">
            <ChevronLeft className="w-4 h-4" />{t.back}
          </button>
        )}
        {step === 4 && (
          <button onClick={resetKiosk} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm" data-testid="kiosk-new">
            <RotateCcw className="w-4 h-4" />{t.newBooking}
          </button>
        )}
        <div className="flex items-center gap-1 text-sm">
          {['fr','en','ru'].map(l => (
            <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded ${lang === l ? 'text-[#2ecc71] font-bold' : 'text-gray-500 hover:text-white'}`}>{l.toUpperCase()}</button>
          ))}
        </div>
      </header>

      {error && hotel && <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-2 text-center text-red-400 text-sm">{error}</div>}

      <main className="flex-1 overflow-auto px-4 sm:px-6 lg:px-10 py-6">

        {/* Step 0: Home — matching the design image */}
        {step === 0 && (
          <div style={{ animation: 'fadeUp 0.4s ease-out' }}>
            {/* Hero */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c8a951]" />
                <Sparkles className="w-5 h-5 text-[#c8a951]" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c8a951]" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight" style={{ fontFamily: "'Manrope', sans-serif" }}>
                {t.heroTitle}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base">{t.heroSub}</p>
            </div>

            {/* 4 Category Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-8">
              {[
                { icon: Plane, title: t.airports, sub: t.airportsSub, action: () => { if (airportDests.length === 1) { setSelectedDest(airportDests[0]); setStep(1); } else { setSelectedDest(null); setStep(0.5); } }, cat: 'airports' },
                { icon: TrainFront, title: t.stations, sub: t.stationsSub, action: () => { if (stationDests.length === 1) { setSelectedDest(stationDests[0]); setStep(1); } else { setSelectedDest(null); setStep(0.6); } }, cat: 'stations' },
                { icon: Castle, title: t.disney, sub: t.disneySub, action: () => { const d = disneyDests[0] || destinations.find(dd => dd.name?.toLowerCase().includes('disney')); if (d) { setSelectedDest(d); setStep(1); } }, cat: 'disney' },
                { icon: MapPin, title: t.other, sub: t.otherSub, action: () => setStep(0.7), cat: 'other' },
              ].map((c, i) => (
                <button key={i} onClick={c.action} className="group bg-[#111827]/80 border border-[#2ecc71]/10 hover:border-[#2ecc71]/40 rounded-2xl p-5 text-center transition-all hover:bg-[#2ecc71]/5 active:scale-[0.98]" data-testid={`cat-${c.cat}`}>
                  <div className="w-14 h-14 mx-auto mb-3 bg-[#2ecc71]/10 rounded-xl flex items-center justify-center group-hover:bg-[#2ecc71]/20 transition-colors">
                    <c.icon className="w-7 h-7 text-[#2ecc71]" />
                  </div>
                  <h3 className="text-white font-bold text-base mb-1" style={{ fontFamily: "'Manrope', sans-serif" }}>{c.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{c.sub}</p>
                  <ChevronRight className="w-4 h-4 text-gray-600 mx-auto mt-3 group-hover:text-[#2ecc71] transition-colors" />
                </button>
              ))}
            </div>

            {/* Popular Destinations */}
            <div className="max-w-5xl mx-auto mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{t.popular}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {destinations.slice(0, 4).map((d, i) => (
                  <button key={i} onClick={() => { setSelectedDest(d); setStep(1); }} className="bg-[#111827]/60 border border-white/[0.06] hover:border-[#2ecc71]/30 rounded-xl px-4 py-3 flex items-center gap-3 transition-all text-left group" data-testid={`pop-dest-${i}`}>
                    <div className="w-9 h-9 bg-[#2ecc71]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {d.icon === 'plane' ? <Plane className="w-4 h-4 text-[#2ecc71]" /> : d.icon === 'train' ? <TrainFront className="w-4 h-4 text-[#2ecc71]" /> : <MapPin className="w-4 h-4 text-[#2ecc71]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{d.name}</p>
                      <p className="text-gray-500 text-xs truncate">{d.address?.split(',').slice(0,2).join(',')}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-gray-600 uppercase">{t.from}</p>
                      <p className="text-[#2ecc71] font-bold text-lg">{d.cheapest}<span className="text-xs">&euro;</span></p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Bar */}
            <div className="max-w-5xl mx-auto">
              <div className="bg-[#111827]/60 border border-white/[0.06] rounded-xl px-4 py-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Euro, title: t.fixedPrice, sub: t.fixedPriceSub },
                  { icon: ShieldCheck, title: t.noSurprise, sub: t.noSurpriseSub },
                  { icon: Clock, title: t.h24, sub: t.h24Sub },
                  { icon: Zap, title: t.fastBook, sub: t.fastBookSub },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#2ecc71]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <b.icon className="w-4.5 h-4.5 text-[#2ecc71]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{b.title}</p>
                      <p className="text-gray-500 text-[11px]">{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 0.5: Airport list */}
        {step === 0.5 && (
          <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
            <h2 className="text-2xl font-bold text-center mb-6">{t.airports}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {airportDests.map((d, i) => (
                <button key={i} onClick={() => { setSelectedDest(d); setStep(1); }} className="bg-[#111827]/80 border border-white/[0.06] hover:border-[#2ecc71]/40 rounded-xl p-5 text-left transition-all">
                  <Plane className="w-6 h-6 text-[#2ecc71] mb-2" />
                  <p className="text-white font-bold">{d.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{d.address?.split(',').slice(0,2).join(',')}</p>
                  {d.cheapest > 0 && <p className="text-[#2ecc71] font-bold text-xl mt-2">{d.cheapest}<span className="text-sm">&euro;</span></p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 0.6: Station list */}
        {step === 0.6 && (
          <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
            <h2 className="text-2xl font-bold text-center mb-6">{t.stations}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {stationDests.map((d, i) => (
                <button key={i} onClick={() => { setSelectedDest(d); setStep(1); }} className="bg-[#111827]/80 border border-white/[0.06] hover:border-[#2ecc71]/40 rounded-xl p-5 text-left transition-all">
                  <TrainFront className="w-6 h-6 text-[#2ecc71] mb-2" />
                  <p className="text-white font-bold">{d.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{d.address?.split(',').slice(0,2).join(',')}</p>
                  {d.cheapest > 0 && <p className="text-[#2ecc71] font-bold text-xl mt-2">{d.cheapest}<span className="text-sm">&euro;</span></p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 0.7: Custom search */}
        {step === 0.7 && (
          <div className="max-w-2xl mx-auto" style={{ animation: 'fadeUp 0.3s ease-out' }}>
            <h2 className="text-2xl font-bold text-center mb-6">{t.other}</h2>
            <PlacesAutocomplete
              value=""
              onChange={handleCustomDest}
              placeholder={t.searchOther}
              className="w-full px-5 py-4 bg-[#111827] border border-white/10 rounded-xl text-white text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]"
            />
            {customPricing && <p className="text-center text-sm text-gray-500 mt-4 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t.calcPrice}</p>}
          </div>
        )}

        {/* Step 1: Date/Time */}
        {step === 1 && (
          <div className="max-w-lg mx-auto" style={{ animation: 'fadeUp 0.3s ease-out' }}>
            <h2 className="text-2xl font-bold text-center mb-2">{t.when}</h2>
            <p className="text-gray-500 text-center mb-6">{t.towards} <span className="text-[#2ecc71] font-medium">{selectedDest?.name}</span></p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide font-semibold">{t.date}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-5 py-4 bg-[#111827] border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="kiosk-date" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide font-semibold">{t.time}</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-5 py-4 bg-[#111827] border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="kiosk-time" />
              </div>
              <button onClick={() => { if (date && time) setStep(2); }} disabled={!date || !time} className="w-full bg-[#2ecc71] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#27ae60] transition-all disabled:bg-gray-700 disabled:text-gray-500 flex items-center justify-center gap-2 mt-2" data-testid="kiosk-next">
                {t.continue} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle */}
        {step === 2 && (
          <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
            <h2 className="text-2xl font-bold text-center mb-6">{t.chooseVehicle}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {(selectedDest?.vehicles || []).map((v, i) => {
                const imgUrl = transferService.getVehicleImageUrl(v.imagePath);
                return (
                  <button key={i} onClick={() => { setSelectedVehicle(v); setStep(3); }} className="bg-[#111827]/80 border border-white/[0.06] hover:border-[#2ecc71]/40 rounded-xl p-4 text-left transition-all active:scale-[0.98]" data-testid={`vehicle-${i}`}>
                    <div className="h-24 flex items-center justify-center mb-3">
                      {imgUrl ? <img src={imgUrl} alt={v.tripType} className="max-h-full max-w-full object-contain" /> : <Car className="w-12 h-12 text-gray-600" />}
                    </div>
                    <h4 className="text-white font-bold mb-1">{v.tripType}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{v.passenger}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{v.luggage}</span>
                    </div>
                    <p className="text-[#2ecc71] font-bold text-2xl">{v.minAmount}<span className="text-sm">&euro;</span></p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Client Info */}
        {step === 3 && (
          <div className="max-w-lg mx-auto" style={{ animation: 'fadeUp 0.3s ease-out' }}>
            <h2 className="text-2xl font-bold text-center mb-2">{t.yourInfo}</h2>
            <p className="text-gray-500 text-center mb-6">{t.driverContact}</p>
            <div className="bg-[#111827]/60 border border-white/[0.06] rounded-xl p-4 mb-5 flex items-center justify-between text-sm">
              <div><p className="text-gray-500">{t.towards}</p><p className="text-white font-semibold">{selectedDest?.name}</p></div>
              <div><p className="text-gray-500">{date} {time}</p><p className="text-white font-semibold">{selectedVehicle?.tripType}</p></div>
              <p className="text-[#2ecc71] font-bold text-2xl">{selectedVehicle?.minAmount}<span className="text-sm">&euro;</span></p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide font-semibold">{t.name} *</label>
                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Jean Dupont" className="w-full px-5 py-4 bg-[#111827] border border-white/10 rounded-xl text-white text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="kiosk-name" autoFocus />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide font-semibold">{t.phone} *</label>
                <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+33 6 12 34 56 78" className="w-full px-5 py-4 bg-[#111827] border border-white/10 rounded-xl text-white text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="kiosk-phone" />
              </div>
              <button onClick={handleSubmitBooking} disabled={submitting || !clientName.trim() || !clientPhone.trim()} className="w-full bg-[#2ecc71] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#27ae60] transition-all disabled:bg-gray-700 disabled:text-gray-500 flex items-center justify-center gap-2 mt-2" data-testid="kiosk-confirm">
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />{t.booking}</> : <><CheckCircle className="w-5 h-5" />{t.confirm}</>}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && booking && (
          <div className="max-w-lg mx-auto text-center" style={{ animation: 'fadeUp 0.5s ease-out' }}>
            <div className="w-20 h-20 bg-[#2ecc71]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-12 h-12 text-[#2ecc71]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t.confirmed}</h2>
            <p className="text-gray-400 mb-6">{t.driverWill}</p>
            <div className="bg-[#111827]/60 border border-white/[0.06] rounded-xl p-5 text-left mb-6">
              <div className="text-center mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{t.ref}</p>
                <p className="text-3xl font-mono font-bold text-[#2ecc71] tracking-wider" data-testid="kiosk-reference">{booking.reference}</p>
              </div>
              <div className="border-t border-white/10 pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">{t.dest}</span><span className="text-white font-medium">{selectedDest?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t.dateTime}</span><span className="text-white font-medium">{date} {time}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t.vehicle}</span><span className="text-white font-medium">{selectedVehicle?.tripType}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{t.passenger}</span><span className="text-white font-medium">{clientName}</span></div>
                <div className="flex justify-between border-t border-white/10 pt-2"><span className="text-gray-500 font-bold">{t.total}</span><span className="text-[#2ecc71] font-bold text-xl">{selectedVehicle?.minAmount}&euro;</span></div>
              </div>
            </div>
            <p className="text-gray-600 text-xs">{t.autoReset}</p>
            <button onClick={resetKiosk} className="mt-4 bg-[#111827] border border-white/10 text-white px-8 py-3 rounded-xl hover:bg-white/[0.05] transition-colors">
              <RotateCcw className="w-4 h-4 inline mr-2" />{t.newBooking}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-3 text-center text-xs text-gray-600 flex-shrink-0">
        Zont Transfer &bull; Prix fixes, pas de surprises &bull; Service 24h/24
      </footer>
    </div>
  );
};

export default KioskPage;
