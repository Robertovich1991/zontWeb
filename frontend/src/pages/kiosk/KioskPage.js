import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transferService } from '@/services/api';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import PhoneInput from '@/components/PhoneInput';
import {
  Plane, TrainFront, Castle, MapPin, Clock, Users, Briefcase,
  ChevronRight, ChevronLeft, CheckCircle, Phone, User, Loader2,
  Calendar, ArrowRight, RotateCcw, Car, Search, Euro, Zap, ShieldCheck, Sparkles,
  CreditCard, Check, X, ChevronUp, ChevronDown, AlertCircle
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
    paymentAccepted: 'Paiement accepté !', confirmationSoon: 'Vous allez recevoir une confirmation par email ou SMS.',
    searchOther: 'Rechercher une autre destination...', calcPrice: 'Calcul du prix en cours...',
    booking: 'Reservation en cours...', date: 'Date', time: 'Heure',
    hours: 'Heures', minutes: 'Minutes', min3h: 'Reservation possible au minimum 3 h a l\'avance',
    invalidEmail: 'Veuillez saisir un email valide',
    stillHereTitle: 'Etes-vous toujours la ?',
    stillHereSub: 'Sans reponse de votre part, votre reservation sera effacee dans',
    stillHereSeconds: 'secondes',
    stillHereStay: 'Continuer ma reservation',
    stillHereLeave: 'Quitter',
    disposalBannerTitle: 'Chauffeur prive a disposition',
    disposalBannerSub: 'Paris 4h • Versailles 5h • Fontainebleau 8h • Mont-Saint-Michel 12h',
    disposalCta: 'Decouvrir les excursions',
    disposalTitle: 'Excursions avec chauffeur prive',
    disposalSub: 'Choisissez votre destination et votre duree. Tarif fixe, tout inclus.',
    disposalParis: 'Visite de Paris',
    disposalParisSub: '4 heures • Tour Eiffel, Louvre, Champs-Elysees',
    disposalVersailles: 'Chateau de Versailles',
    disposalVersaillesSub: '5 heures • Aller-retour + temps de visite',
    disposalFontainebleau: 'Chateau de Fontainebleau',
    disposalFontainebleauSub: '8 heures • Foret + chateau royal',
    disposalMSM: 'Mont-Saint-Michel',
    disposalMSMSub: '12 heures • Journee complete depuis Paris',
    hourlyTitle: 'Chauffeur a l\'heure — duree libre',
    hourlySub: 'Choisissez la duree, votre vehicule, c\'est tout. Le chauffeur est a votre disposition partout en region parisienne.',
    hourlyCta: 'Reserver a l\'heure',
    hourlyPickDuration: 'Combien d\'heures ?',
    hourlyMin: 'minimum 3 heures',
    hourlyHours: 'heures',
    hourlyHour: 'heure',
    hourlyContinue: 'Voir les vehicules',
    hourlyTollsNotice: 'Les peages et routes payantes sont a la charge du client.',
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
    paymentAccepted: 'Payment accepted!', confirmationSoon: 'You will receive a confirmation by email or SMS shortly.',
    searchOther: 'Search another destination...', calcPrice: 'Calculating price...',
    booking: 'Booking in progress...', date: 'Date', time: 'Time',
    hours: 'Hours', minutes: 'Minutes', min3h: 'Booking available at least 3 hours in advance',
    invalidEmail: 'Please enter a valid email',
    stillHereTitle: 'Are you still there?',
    stillHereSub: 'Without a response your booking will be cleared in',
    stillHereSeconds: 'seconds',
    stillHereStay: 'Continue my booking',
    stillHereLeave: 'Leave',
    disposalBannerTitle: 'Private chauffeur at disposal',
    disposalBannerSub: 'Paris 4h • Versailles 5h • Fontainebleau 8h • Mont-Saint-Michel 12h',
    disposalCta: 'Discover the excursions',
    disposalTitle: 'Private chauffeur excursions',
    disposalSub: 'Pick your destination and duration. Fixed price, all included.',
    disposalParis: 'Paris City Tour',
    disposalParisSub: '4 hours • Eiffel Tower, Louvre, Champs-Elysees',
    disposalVersailles: 'Palace of Versailles',
    disposalVersaillesSub: '5 hours • Round-trip + visiting time',
    disposalFontainebleau: 'Fontainebleau Castle',
    disposalFontainebleauSub: '8 hours • Forest + royal castle',
    disposalMSM: 'Mont-Saint-Michel',
    disposalMSMSub: '12 hours • Full day from Paris',
    hourlyTitle: 'Chauffeur by the hour — free duration',
    hourlySub: 'Pick the duration and your vehicle. The driver is at your disposal anywhere in the Paris region.',
    hourlyCta: 'Book by the hour',
    hourlyPickDuration: 'How many hours?',
    hourlyMin: 'minimum 3 hours',
    hourlyHours: 'hours',
    hourlyHour: 'hour',
    hourlyContinue: 'View vehicles',
    hourlyTollsNotice: 'Toll roads and motorway fees are paid by the client.',
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
    paymentAccepted: 'Оплата принята!', confirmationSoon: 'Вы скоро получите подтверждение по email или SMS.',
    searchOther: 'Поиск другого направления...', calcPrice: 'Расчёт цены...',
    booking: 'Бронирование...', date: 'Дата', time: 'Время',
    hours: 'Часы', minutes: 'Минуты', min3h: 'Бронирование минимум за 3 часа',
    invalidEmail: 'Введите действительный email',
    stillHereTitle: 'Вы ещё здесь?',
    stillHereSub: 'Без ответа ваше бронирование будет удалено через',
    stillHereSeconds: 'секунд',
    stillHereStay: 'Продолжить бронирование',
    stillHereLeave: 'Выйти',
    disposalBannerTitle: 'Личный водитель в распоряжение',
    disposalBannerSub: 'Париж 4ч • Версаль 5ч • Фонтенбло 8ч • Мон-Сен-Мишель 12ч',
    disposalCta: 'Открыть экскурсии',
    disposalTitle: 'Экскурсии с личным водителем',
    disposalSub: 'Выберите направление и длительность. Фиксированная цена, всё включено.',
    disposalParis: 'Тур по Парижу',
    disposalParisSub: '4 часа • Эйфелева башня, Лувр, Елисейские поля',
    disposalVersailles: 'Версальский дворец',
    disposalVersaillesSub: '5 часов • Туда-обратно + время на осмотр',
    disposalFontainebleau: 'Замок Фонтенбло',
    disposalFontainebleauSub: '8 часов • Лес + королевский замок',
    disposalMSM: 'Мон-Сен-Мишель',
    disposalMSMSub: '12 часов • Полный день из Парижа',
    hourlyTitle: 'Водитель по часам — свободная длительность',
    hourlySub: 'Выберите длительность и автомобиль. Водитель в вашем распоряжении по всему Парижскому региону.',
    hourlyCta: 'Заказать по часам',
    hourlyPickDuration: 'Сколько часов?',
    hourlyMin: 'минимум 3 часа',
    hourlyHours: 'часов',
    hourlyHour: 'час',
    hourlyContinue: 'Посмотреть автомобили',
    hourlyTollsNotice: 'Платные дороги и трассы оплачиваются клиентом.',
  },
};

/* ──── ATTRACT SCREEN — Premium Image Idle ──── */
const KIOSK_FALLBACK_IMG = '/images/kiosk-idle-screen.webp';

const AttractScreen = ({ hotelName, onTap }) => {
  const [tapping, setTapping] = useState(false);
  const [images, setImages] = useState([]);
  const [idx, setIdx] = useState(0);

  // Load blog hero images for the animated idle slideshow (falls back to the static visual
  // when the blog has no images — e.g. on preview).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API}/api/blog-articles?language=fr&limit=50`);
        const d = await r.json();
        const arr = Array.isArray(d) ? d : (d.articles || []);
        const urls = [...new Set(arr.map(a => a.hero_image_url).filter(Boolean))];
        if (!cancelled && urls.length) {
          urls.forEach(u => { const im = new Image(); im.src = u; }); // preload for smooth fades
          setImages(urls);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  // Advance the slideshow every 6s
  useEffect(() => {
    if (images.length < 2) return;
    const iv = setInterval(() => setIdx(i => (i + 1) % images.length), 6000);
    return () => clearInterval(iv);
  }, [images]);

  const handleTap = (e) => {
    if (tapping) return;
    setTapping(true);
    setTimeout(() => onTap(e), 350);
  };

  const hasSlides = images.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black select-none overflow-hidden cursor-pointer"
      onClick={handleTap}
      onTouchStart={handleTap}
      data-testid="kiosk-attract-screen"
    >
      {hasSlides ? (
        <>
          {images.map((src, i) => (
            <div
              key={src}
              className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
              style={{ opacity: i === idx ? 1 : 0 }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                style={{ animation: i === idx ? 'kenburns 7s ease-out forwards' : 'none' }}
                draggable={false}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/55 pointer-events-none" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={KIOSK_FALLBACK_IMG}
            alt="ZONT — Your private driver is ready"
            className="max-w-full max-h-full w-auto h-auto object-contain"
            draggable={false}
          />
        </div>
      )}

      {/* Branding + CTA overlay (shown over the slideshow for readability) */}
      {hasSlides && (
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 pointer-events-none z-10 text-center px-8" data-testid="kiosk-attract-overlay">
          <div className="w-16 h-16 bg-[#2ecc71]/15 rounded-2xl flex items-center justify-center border border-[#2ecc71]/30 mb-5 backdrop-blur-sm">
            <span className="text-[#2ecc71] font-black text-3xl">Z</span>
          </div>
          <h1 className="text-white font-black text-4xl lg:text-5xl mb-2 drop-shadow-lg">ZONT Transfer</h1>
          <p className="text-white/80 text-lg lg:text-xl mb-8 drop-shadow">Votre chauffeur privé · Prix fixes · 24h/24</p>
          <div className="inline-flex items-center gap-3 bg-[#2ecc71] text-white px-10 py-4 rounded-full font-bold text-xl shadow-2xl" style={{ animation: 'pulseTap 2s ease-in-out infinite' }}>
            Touchez l'écran pour commencer
          </div>
        </div>
      )}

      {/* Tap flash overlay */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 z-20 ${tapping ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(46,204,113,0.45) 0%, transparent 50%)' }}
      />

      {hotelName && (
        <p className="absolute top-4 left-6 text-xs text-[#2ecc71]/80 font-medium uppercase tracking-widest z-20 drop-shadow">
          {hotelName}
        </p>
      )}

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes kenburns { from{transform:scale(1)} to{transform:scale(1.12)} }
        @keyframes pulseTap { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:0.88} }
      `}</style>
    </div>
  );
};

/* (Concierge eye component removed — replaced by full-image idle screen) */

/* ──── MAIN KIOSK ──── */
const KioskPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  // Optional per-borne identifier: /kiosk/:slug?device=TERM-001 (or device id)
  const deviceId = (typeof window !== 'undefined') ? new URLSearchParams(window.location.search).get('device') : null;
  const [showUnbind, setShowUnbind] = useState(false);
  const unbindTimerRef = useRef(null);
  const [hotel, setHotel] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAttract, setShowAttract] = useState(true);
  const [lang, setLang] = useState('fr');
  const langTouchedRef = useRef(false);
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
  const [clientEmail, setClientEmail] = useState('');
  const [clientCountryCode, setClientCountryCode] = useState('+33');
  const [booking, setBooking] = useState(null);
  const [searchId, setSearchId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [customPricing, setCustomPricing] = useState(false);
  const [customHours, setCustomHours] = useState(4); // free hourly duration
  const [showIdlePrompt, setShowIdlePrompt] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState(15);
  // Stripe Terminal (physical card reader) state
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [terminalStatus, setTerminalStatus] = useState(null); // 'waiting_card' | 'processing' | 'paid' | 'cancelled' | 'error'
  const [terminalError, setTerminalError] = useState(null);
  // Refs to avoid stale closure inside resetKiosk
  const paymentIntentIdRef = useRef(null);
  const terminalStatusRef = useRef(null);
  useEffect(() => { paymentIntentIdRef.current = paymentIntentId; }, [paymentIntentId]);
  useEffect(() => { terminalStatusRef.current = terminalStatus; }, [terminalStatus]);
  const idlePromptTimerRef = useRef(null);
  const idleCountdownIntervalRef = useRef(null);
  const lastLoggedSearchRef = useRef(null);

  const resetKiosk = useCallback(() => {
    // Cancel any pending terminal payment to avoid TPE staying on "Tap or insert" after the kiosk resets
    const pi = paymentIntentIdRef.current;
    const status = terminalStatusRef.current;
    if (pi && status !== 'paid' && status !== 'cancelled') {
      // Use keepalive so the request survives the unmount/reset
      fetch(`${API}/api/stripe-terminal/cancel-payment/${pi}`, { method: 'POST', keepalive: true }).catch(() => {});
    }
    setStep(0); setSelectedDest(null); setDate(''); setTime('');
    setSelectedVehicle(null); setClientName(''); setClientPhone(''); setClientEmail(''); setClientCountryCode('+33');
    setBooking(null); setSubmitting(false); setCustomPricing(false);
    setCustomHours(4);
    setShowIdlePrompt(false);
    setPaymentIntentId(null); setTerminalStatus(null); setTerminalError(null);
    setSearchId(null); lastLoggedSearchRef.current = null;
  }, []);

  const clearIdlePrompt = useCallback(() => {
    if (idlePromptTimerRef.current) { clearTimeout(idlePromptTimerRef.current); idlePromptTimerRef.current = null; }
    if (idleCountdownIntervalRef.current) { clearInterval(idleCountdownIntervalRef.current); idleCountdownIntervalRef.current = null; }
    setShowIdlePrompt(false);
    setIdleCountdown(15);
  }, []);

  const showIdlePromptRef = useRef(false);
  const showAttractRef = useRef(true);
  const stepRef = useRef(0);
  useEffect(() => { showIdlePromptRef.current = showIdlePrompt; }, [showIdlePrompt]);
  useEffect(() => {
    showAttractRef.current = showAttract;
    // When leaving the attract screen, re-arm the idle timer
    if (!showAttract) resetIdleTimerRef.current && resetIdleTimerRef.current();
  }, [showAttract]);
  useEffect(() => { stepRef.current = step; }, [step]);

  const resetIdleTimerRef = useRef(null);

  // Idle timer: after 60s of inactivity show "Still here?" prompt with 15s countdown
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (showAttractRef.current || showIdlePromptRef.current || stepRef.current === 4) return;
    idleTimerRef.current = setTimeout(() => {
      setShowIdlePrompt(true);
      setIdleCountdown(15);
      idleCountdownIntervalRef.current = setInterval(() => {
        setIdleCountdown((c) => {
          if (c <= 1) {
            clearInterval(idleCountdownIntervalRef.current);
            idleCountdownIntervalRef.current = null;
            setShowIdlePrompt(false);
            resetKiosk();
            setShowAttract(true);
            return 15;
          }
          return c - 1;
        });
      }, 1000);
    }, 60000);
  }, [resetKiosk]);

  useEffect(() => { resetIdleTimerRef.current = resetIdleTimer; }, [resetIdleTimer]);

  useEffect(() => {
    const events = ['click', 'touchstart', 'mousemove', 'keydown'];
    const h = () => { if (!showIdlePromptRef.current) resetIdleTimer(); };
    events.forEach(e => document.addEventListener(e, h, { passive: true }));
    resetIdleTimer();
    return () => {
      events.forEach(e => document.removeEventListener(e, h));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (idlePromptTimerRef.current) clearTimeout(idlePromptTimerRef.current);
      if (idleCountdownIntervalRef.current) clearInterval(idleCountdownIntervalRef.current);
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    if (step !== 1) return;
    // Only seed the default once — never overwrite a time the client has already chosen.
    // resetKiosk() clears date/time between sessions, so a fresh booking recomputes it.
    if (date && time) return;
    const now = new Date(); now.setHours(now.getHours() + 3);
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
    setDate(`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`);
    setTime(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`);
  }, [step, date, time]);

  const stepTime = (field, dir) => {
    let [h, m] = (time || '00:00').split(':').map(Number);
    if (isNaN(h)) h = 0; if (isNaN(m)) m = 0;
    if (field === 'h') {
      h = (h + dir + 24) % 24;
    } else {
      m += dir * 15;
      if (m >= 60) { m -= 60; h = (h + 1) % 24; }
      if (m < 0) { m += 60; h = (h - 1 + 24) % 24; }
    }
    setTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  // Kiosk rule: bookings must be at least 3 hours ahead of the departure time.
  const dateTimeValid = (() => {
    if (!date || !time) return false;
    const sel = new Date(`${date}T${time}`).getTime();
    if (isNaN(sel)) return false;
    return sel >= Date.now() + 3 * 60 * 60 * 1000 - 60 * 1000; // 1-min tolerance
  })();

  useEffect(() => {
    // Auto-reset the payment screen after 90s of inactivity (e.g. customer walked away)
    // resetKiosk() will also cancel the pending Stripe Terminal PaymentIntent so the TPE goes back to idle
    if (step === 4 && booking && terminalStatus !== 'paid') {
      const t2 = setTimeout(() => { resetKiosk(); setShowAttract(true); }, 90000);
      return () => clearTimeout(t2);
    }
  }, [step, booking, terminalStatus, resetKiosk]);

  // After a successful payment: show the confirmation for 5s, then return to the main screen.
  useEffect(() => {
    if (terminalStatus !== 'paid') return;
    const t = setTimeout(() => { resetKiosk(); setShowAttract(true); }, 5000);
    return () => clearTimeout(t);
  }, [terminalStatus, resetKiosk]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API}/api/kiosk/${slug}/prices`, { method: 'POST' })
      .then(r => { if (!r.ok) throw new Error('Hotel not found'); return r.json(); })
      .then(data => {
        setHotel(data.hotel);
        // Borne default language (client can still switch manually via the FR/EN/RU toggle)
        const dl = data.hotel?.default_language;
        if (dl && LANGS[dl] && !langTouchedRef.current) setLang(dl);
        setDestinations(data.destinations || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  // Persist the borne binding on the tablet: once opened on /kiosk/:slug it stays
  // associated to this hotel (and device) across reboots — until an admin unbinds it.
  useEffect(() => {
    if (!slug) return;
    localStorage.setItem('kiosk_bound_slug', slug);
    if (deviceId) localStorage.setItem('kiosk_bound_device', deviceId);
  }, [slug, deviceId]);

  const unbindBorne = useCallback(() => {
    localStorage.removeItem('kiosk_bound_slug');
    localStorage.removeItem('kiosk_bound_device');
    navigate('/kiosk', { replace: true });
  }, [navigate]);

  const startUnbindHold = useCallback(() => {
    if (unbindTimerRef.current) clearTimeout(unbindTimerRef.current);
    unbindTimerRef.current = setTimeout(() => setShowUnbind(true), 2500);
  }, []);
  const cancelUnbindHold = useCallback(() => {
    if (unbindTimerRef.current) { clearTimeout(unbindTimerRef.current); unbindTimerRef.current = null; }
  }, []);

  // Search history: log the searched destination + shown price (no personal data)
  const logSearch = useCallback(async (dest) => {
    if (!dest) return;
    try {
      const prices = (dest.vehicles || []).map(v => v.maxAmount).filter(n => typeof n === 'number');
      const minPrice = prices.length ? Math.min(...prices) : (dest.maxAmount ?? null);
      const r = await fetch(`${API}/api/kiosk/search-log`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelSlug: slug, deviceId: deviceId || undefined, fromAddress: hotel?.address, destinationName: dest.name, destinationAddress: dest.address, price: minPrice }),
      });
      const d = await r.json();
      setSearchId(d.searchId);
    } catch {}
  }, [slug, deviceId, hotel]);

  // Log a search as soon as the client reaches the date/time step with a chosen
  // destination + computed prices — i.e. the moment the 3 vehicle prices are shown.
  // This captures ALL searches, including those abandoned WITHOUT pressing any
  // vehicle category. Deduped per destination so going back/forward won't re-log.
  useEffect(() => {
    if (step === 1 && selectedDest) {
      const sig = `${selectedDest.name}|${selectedDest.address}|${selectedDest.lat},${selectedDest.lng}`;
      if (lastLoggedSearchRef.current !== sig) {
        lastLoggedSearchRef.current = sig;
        logSearch(selectedDest);
      }
    }
  }, [step, selectedDest, logSearch]);

  // Borne heartbeat: report this device is online (last connection) every 60s
  useEffect(() => {
    if (!deviceId) return;
    const beat = () => fetch(`${API}/api/kiosk/heartbeat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }), keepalive: true,
    }).catch(() => {});
    beat();
    const iv = setInterval(beat, 60000);
    return () => clearInterval(iv);
  }, [deviceId]);


  // PWA "Add to Home Screen": dynamic manifest + iOS meta tags per kiosk slug
  useEffect(() => {
    if (!slug) return;
    const apiBase = process.env.REACT_APP_BACKEND_URL || '';

    // Replace the default site manifest with the kiosk-specific one
    let manifestLink = document.querySelector('link[rel="manifest"]');
    const originalManifest = manifestLink ? manifestLink.getAttribute('href') : null;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.setAttribute('href', `${apiBase}/api/kiosk/${slug}/manifest.json`);

    // iOS PWA meta tags (Apple ignores the web manifest, uses these instead)
    const metas = [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Zont Kiosk' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'theme-color', content: '#0b1120' },
    ];
    const addedMetas = [];
    metas.forEach(({ name, content }) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
        addedMetas.push(el);
      }
      el.setAttribute('content', content);
    });

    // iOS apple-touch-icon
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    const originalIconHref = appleIcon ? appleIcon.getAttribute('href') : null;
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.setAttribute('href', '/icon-512.png');

    return () => {
      // Restore original manifest when leaving the kiosk page
      if (manifestLink && originalManifest) manifestLink.setAttribute('href', originalManifest);
      if (appleIcon && originalIconHref) appleIcon.setAttribute('href', originalIconHref);
      addedMetas.forEach(el => el.remove());
    };
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
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim());
    if (!clientName.trim() || !clientPhone.trim() || !emailOk) return;
    setSubmitting(true);
    // Combine country code + local number, stripping any leading 0 / + characters from the local part
    const localNumber = clientPhone.trim().replace(/[^\d]/g, '').replace(/^0+/, '');
    const fullPhone = `${clientCountryCode}${localNumber}`;
    try {
      const resp = await fetch(`${API}/api/kiosk/book`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelSlug: slug, deviceId: deviceId || undefined, searchId: searchId || undefined, clientName: clientName.trim(), clientPhone: fullPhone, clientEmail: clientEmail.trim(), destination: selectedDest.name, destinationAddress: selectedDest.address, destLat: selectedDest.lat, destLng: selectedDest.lng, date, time, vehicleType: selectedVehicle.tripType, price: selectedVehicle.maxAmount, passengers: 1, utcOffset: new Date().getTimezoneOffset() * -1 }),
      });
      if (!resp.ok) throw new Error();
      const data = await resp.json();
      setBooking(data);
      setStep(4);

      // Push payment to the physical Stripe Terminal reader
      try {
        const pay = await fetch(`${API}/api/stripe-terminal/create-payment`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingReference: data.reference }),
        });
        const payData = await pay.json();
        if (pay.ok && payData.payment_intent_id) {
          setPaymentIntentId(payData.payment_intent_id);
          setTerminalStatus('waiting_card');
        } else {
          setTerminalStatus('error');
          setTerminalError(payData.detail || 'Terminal indisponible');
        }
      } catch (e) {
        setTerminalStatus('error');
        setTerminalError('Terminal de paiement injoignable');
      }
    } catch { setError('Booking error'); setTimeout(() => setError(null), 3000); }
    finally { setSubmitting(false); }
  };

  // Poll Stripe Terminal payment status every 2 seconds
  useEffect(() => {
    if (!paymentIntentId || terminalStatus === 'paid' || terminalStatus === 'error' || terminalStatus === 'cancelled') return;
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`${API}/api/stripe-terminal/payment-status/${paymentIntentId}`);
        const data = await r.json();
        setTerminalStatus(data.status);
        if (data.last_payment_error) setTerminalError(data.last_payment_error);
        if (data.status === 'paid' || data.status === 'cancelled') {
          clearInterval(interval);
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [paymentIntentId, terminalStatus]);

  // QR fallback: when the guest pays by scanning the QR on their phone (Stripe Checkout),
  // the physical terminal poll no longer runs. Poll the booking status (which verifies the
  // Stripe session server-side and dispatches to C#) so the kiosk detects the payment.
  useEffect(() => {
    if (!booking?.reference || !booking?.qrCode) return;
    if (terminalStatus !== 'error' && terminalStatus !== 'cancelled') return;
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`${API}/api/kiosk/booking-status/${booking.reference}`);
        const d = await r.json();
        if (['paid', 'dispatched', 'paid_dispatch_failed'].includes(d.status)) {
          setTerminalStatus('paid');
          clearInterval(interval);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [booking, terminalStatus]);

  // Phone success redirect: when the QR payment completes, Stripe opens
  // /kiosk/:slug?paid=REF on the guest's phone. Trigger the server-side confirm+dispatch.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paidRef = params.get('paid');
    if (paidRef) {
      fetch(`${API}/api/kiosk/booking-status/${paidRef}`).catch(() => {});
    }
  }, []);

  // Cancel pending Stripe Terminal payment when the kiosk page is closed / navigated away / refreshed.
  // Without this, the physical TPE keeps showing the amount and "Tap or insert" forever
  // until the customer or staff manually clears it on the terminal device.
  useEffect(() => {
    const cancelOnExit = () => {
      const pi = paymentIntentIdRef.current;
      const status = terminalStatusRef.current;
      if (pi && status !== 'paid' && status !== 'cancelled') {
        // keepalive lets the browser dispatch the request even as the page unloads
        try {
          fetch(`${API}/api/stripe-terminal/cancel-payment/${pi}`, { method: 'POST', keepalive: true });
        } catch (e) { /* swallow */ }
      }
    };
    const onVisibility = () => { if (document.visibilityState === 'hidden') cancelOnExit(); };
    window.addEventListener('beforeunload', cancelOnExit);
    window.addEventListener('pagehide', cancelOnExit);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('beforeunload', cancelOnExit);
      window.removeEventListener('pagehide', cancelOnExit);
      document.removeEventListener('visibilitychange', onVisibility);
      // Also cancel on React unmount (e.g. user navigates to another route inside the SPA)
      cancelOnExit();
    };
  }, []);

  const handleCancelTerminalPayment = async () => {
    if (!paymentIntentId) return;
    try {
      await fetch(`${API}/api/stripe-terminal/cancel-payment/${paymentIntentId}`, { method: 'POST' });
    } catch {}
    setTerminalStatus('cancelled');
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

      {/* Idle Prompt — "Still here?" modal with auto-countdown */}
      {showIdlePrompt && !showAttract && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-6" data-testid="kiosk-idle-prompt">
          <div className="bg-[#111827] border-2 border-[#c8a951]/60 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl" style={{ animation: 'fadeUp 0.4s ease-out' }}>
            <div className="w-16 h-16 mx-auto mb-5 bg-[#c8a951]/15 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-[#c8a951]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Manrope', sans-serif" }}>
              {t.stillHereTitle}
            </h3>
            <p className="text-gray-400 text-sm mb-2">{t.stillHereSub}</p>
            <p className="text-[#c8a951] font-black text-5xl mb-6 tabular-nums" data-testid="kiosk-idle-countdown">
              {idleCountdown}<span className="text-lg text-gray-500 font-normal ml-2">{t.stillHereSeconds}</span>
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { clearIdlePrompt(); resetIdleTimer(); }}
                className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white py-4 rounded-xl font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                data-testid="kiosk-idle-continue"
              >
                <CheckCircle className="w-5 h-5" />{t.stillHereStay}
              </button>
              <button
                onClick={() => { clearIdlePrompt(); resetKiosk(); setShowAttract(true); }}
                className="w-full bg-transparent border border-white/15 hover:border-white/30 text-gray-300 hover:text-white py-3 rounded-xl font-medium text-sm transition-all"
                data-testid="kiosk-idle-leave"
              >
                {t.stillHereLeave}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          {step > 0 && step < 4 && (
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-base lg:text-lg px-5 py-3 rounded-full border border-white/20 transition-all shadow-lg"
              data-testid="kiosk-back"
            >
              <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7" />{t.back}
            </button>
          )}
          {step === 4 && (
            <button
              onClick={resetKiosk}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-base lg:text-lg px-5 py-3 rounded-full border border-white/20 transition-all shadow-lg"
              data-testid="kiosk-new"
            >
              <RotateCcw className="w-6 h-6 lg:w-7 lg:h-7" />{t.newBooking}
            </button>
          )}
          <div
            className="flex items-center gap-3 select-none cursor-default"
            onPointerDown={startUnbindHold}
            onPointerUp={cancelUnbindHold}
            onPointerLeave={cancelUnbindHold}
            data-testid="kiosk-brand"
            title="Maintenez 2,5s pour déconnecter la borne (admin)"
          >
            <div className="w-10 h-10 bg-[#2ecc71]/10 rounded-lg flex items-center justify-center border border-[#2ecc71]/20">
              <span className="text-[#2ecc71] font-black text-lg">Z</span>
            </div>
            <div>
              <p className="text-white font-bold leading-tight">Zont Transfer</p>
              <p className="text-xs text-gray-500">{hotel?.name || ''}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#111827] border border-white/10 rounded-full p-1" data-testid="kiosk-lang-switcher">
            {['fr','en','ru'].map(l => (
              <button
                key={l}
                onClick={() => { langTouchedRef.current = true; setLang(l); }}
                className={`px-4 py-2 rounded-full text-base font-bold transition-all ${lang === l ? 'bg-[#2ecc71] text-white shadow' : 'text-gray-400 hover:text-white'}`}
                data-testid={`kiosk-lang-${l}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Admin: unbind borne confirmation (triggered by 2.5s long-press on the logo) */}
      {showUnbind && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-6" onClick={() => setShowUnbind(false)} data-testid="kiosk-unbind-modal">
          <div className="bg-[#0f1830] border border-white/10 rounded-3xl p-8 max-w-md w-full text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-2">Déconnecter cette borne ?</h3>
            <p className="text-gray-400 text-sm mb-7">L'hôtel associé (<span className="text-[#2ecc71]">{hotel?.name || slug}</span>) sera oublié sur cette tablette. Il faudra ressaisir les identifiants pour reconfigurer la borne.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowUnbind(false)} className="flex-1 py-3.5 rounded-xl border border-white/15 text-gray-300 hover:text-white hover:border-white/30 font-semibold transition-all" data-testid="kiosk-unbind-cancel">Annuler</button>
              <button onClick={unbindBorne} className="flex-1 py-3.5 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-bold transition-all" data-testid="kiosk-unbind-confirm">Déconnecter</button>
            </div>
          </div>
        </div>
      )}

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

            {/* Address search bar — type any destination directly from the home screen */}
            <div className="max-w-3xl mx-auto mb-10" data-testid="home-search-bar">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[#2ecc71] pointer-events-none z-10" />
                <PlacesAutocomplete
                  value=""
                  onChange={handleCustomDest}
                  placeholder={t.searchOther}
                  className="w-full pl-14 pr-5 py-5 bg-[#111827] border-2 border-white/10 rounded-2xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-[#2ecc71] shadow-lg"
                />
              </div>
              {customPricing && <p className="text-center text-sm text-gray-400 mt-3 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t.calcPrice}</p>}
            </div>

            {/* 4 Category Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-10">
              {[
                { icon: Plane, title: t.airports, sub: t.airportsSub, action: () => { if (airportDests.length === 1) { setSelectedDest(airportDests[0]); setStep(1); } else { setSelectedDest(null); setStep(0.5); } }, cat: 'airports' },
                { icon: TrainFront, title: t.stations, sub: t.stationsSub, action: () => { if (stationDests.length === 1) { setSelectedDest(stationDests[0]); setStep(1); } else { setSelectedDest(null); setStep(0.6); } }, cat: 'stations' },
                { icon: Castle, title: t.disney, sub: t.disneySub, action: () => { const d = disneyDests[0] || destinations.find(dd => dd.name?.toLowerCase().includes('disney')); if (d) { setSelectedDest(d); setStep(1); } }, cat: 'disney' },
                { icon: MapPin, title: t.other, sub: t.otherSub, action: () => setStep(0.7), cat: 'other' },
              ].map((c, i) => (
                <button key={i} onClick={c.action} className="group bg-[#111827]/80 border-2 border-[#2ecc71]/15 hover:border-[#2ecc71]/50 rounded-3xl p-8 text-center transition-all hover:bg-[#2ecc71]/5 active:scale-[0.98]" data-testid={`cat-${c.cat}`}>
                  <div className="w-24 h-24 mx-auto mb-5 bg-[#2ecc71]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#2ecc71]/20 transition-colors">
                    <c.icon className="w-12 h-12 text-[#2ecc71]" />
                  </div>
                  <h3 className="text-white font-bold text-xl lg:text-2xl mb-2" style={{ fontFamily: "'Manrope', sans-serif" }}>{c.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{c.sub}</p>
                  <ChevronRight className="w-6 h-6 text-gray-600 mx-auto mt-4 group-hover:text-[#2ecc71] transition-colors" />
                </button>
              ))}
            </div>

            {/* Popular Destinations */}
            <div className="max-w-6xl mx-auto mb-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-sm text-gray-500 uppercase tracking-widest font-semibold">{t.popular}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(destinations.some(d => d.highlighted) ? destinations.filter(d => d.highlighted) : destinations).slice(0, 4).map((d, i) => (
                  <button key={i} onClick={() => { setSelectedDest(d); setStep(1); }} className="bg-[#111827]/60 border border-white/[0.06] hover:border-[#2ecc71]/40 rounded-2xl px-5 py-4 flex items-center gap-4 transition-all text-left group" data-testid={`pop-dest-${i}`}>
                    <div className="w-14 h-14 bg-[#2ecc71]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      {d.icon === 'plane' ? <Plane className="w-7 h-7 text-[#2ecc71]" /> : d.icon === 'train' ? <TrainFront className="w-7 h-7 text-[#2ecc71]" /> : <MapPin className="w-7 h-7 text-[#2ecc71]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-base lg:text-lg font-semibold truncate">{d.name}</p>
                      <p className="text-gray-500 text-xs truncate">{d.address?.split(',').slice(0,2).join(',')}</p>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-600 flex-shrink-0 group-hover:text-[#2ecc71] group-hover:translate-x-1 transition-all" />
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

            {/* Driver at Disposal banner */}
            <button
              onClick={() => setStep(0.8)}
              className="block w-full max-w-5xl mx-auto mt-5 group relative overflow-hidden rounded-2xl border border-[#c8a951]/40 hover:border-[#c8a951] bg-gradient-to-r from-[#111827] to-[#1a2332] transition-all active:scale-[0.99]"
              data-testid="kiosk-disposal-banner"
            >
              <div className="grid grid-cols-[1fr_1.4fr] items-stretch min-h-[180px]">
                <div className="relative overflow-hidden">
                  <img
                    src="/images/chauffeur-prive-chateau-versailles-renault-trafic.webp"
                    alt="Chauffeur prive Versailles Fontainebleau Mont Saint Michel"
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111827]/40" />
                </div>
                <div className="p-5 lg:p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-[#c8a951]" />
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#c8a951] font-bold">4h • 5h • 8h • 12h</span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 leading-tight">{t.disposalBannerTitle}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">{t.disposalBannerSub}</p>
                  <span className="inline-flex items-center gap-2 text-[#c8a951] font-bold text-sm uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                    {t.disposalCta}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Step 0.8: Disposal excursions */}
        {step === 0.8 && (
          <div style={{ animation: 'fadeUp 0.3s ease-out' }} data-testid="kiosk-disposal-screen">
            <button
              onClick={() => setStep(0)}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#c8a951] mb-4 transition-colors"
              data-testid="kiosk-disposal-back"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> {t.back}
            </button>
            <h2 className="text-2xl lg:text-3xl font-bold text-center mb-2">{t.disposalTitle}</h2>
            <p className="text-center text-gray-400 text-sm mb-8 max-w-2xl mx-auto">{t.disposalSub}</p>

            {customPricing && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" data-testid="kiosk-disposal-loading">
                <div className="bg-[#111827] border border-[#c8a951]/30 rounded-2xl p-8 flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-[#c8a951] animate-spin" />
                  <p className="text-white font-medium">{t.calcPrice}</p>
                </div>
              </div>
            )}

            {/* HOURLY FREE — premium card at the top */}
            <button
              onClick={() => { setCustomHours(4); setStep(0.85); }}
              className="block w-full max-w-5xl mx-auto mb-5 group relative overflow-hidden rounded-2xl border-2 border-[#c8a951]/50 hover:border-[#c8a951] bg-gradient-to-r from-[#1a1f2e] via-[#1a2332] to-[#2a1f1a] transition-all active:scale-[0.99] text-left"
              data-testid="kiosk-hourly-free-cta"
            >
              <div className="absolute top-3 right-3 z-10">
                <span className="bg-[#c8a951] text-[#0b1120] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  ★ {lang === 'fr' ? 'Sur-mesure' : lang === 'ru' ? 'На заказ' : 'Custom'}
                </span>
              </div>
              <div className="p-5 lg:p-6 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#c8a951]/15 border border-[#c8a951]/30 flex items-center justify-center flex-shrink-0 group-hover:bg-[#c8a951]/25 transition-colors">
                  <Clock className="w-8 h-8 text-[#c8a951]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg lg:text-xl font-bold text-white mb-1.5 leading-tight">{t.hourlyTitle}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{t.hourlySub}</p>
                </div>
                <ChevronRight className="w-6 h-6 text-[#c8a951] flex-shrink-0 group-hover:translate-x-1 transition-transform hidden sm:block" />
              </div>
            </button>

            {/* Separator */}
            <div className="flex items-center gap-3 max-w-5xl mx-auto mb-4">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">{lang === 'fr' ? 'Ou forfaits prets-a-partir' : lang === 'ru' ? 'Или готовые пакеты' : 'Or ready-to-go packages'}</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
              {[
                { id: 'disposal-paris', name: t.disposalParis, sub: t.disposalParisSub, hours: 4, address: 'Paris, Ile-de-France, France', lat: 48.8566, lng: 2.3522 },
                { id: 'disposal-versailles', name: t.disposalVersailles, sub: t.disposalVersaillesSub, hours: 5, address: 'Chateau de Versailles, France', lat: 48.8049, lng: 2.1204 },
                { id: 'disposal-fontainebleau', name: t.disposalFontainebleau, sub: t.disposalFontainebleauSub, hours: 8, address: 'Chateau de Fontainebleau, France', lat: 48.4021, lng: 2.7000 },
                { id: 'disposal-msm', name: t.disposalMSM, sub: t.disposalMSMSub, hours: 12, address: 'Mont-Saint-Michel, Normandie, France', lat: 48.6361, lng: -1.5115 },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={async () => {
                    setCustomPricing(true);
                    try {
                      // Use authoritative hourly pricing for fixed disposal packages too
                      const resp = await fetch(`${API}/api/kiosk/${slug}/hourly-price`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ hours: d.hours }),
                      });
                      if (!resp.ok) throw new Error('pricing-failed');
                      const data = await resp.json();
                      setSelectedDest({
                        ...data,
                        name: `${d.name} (${d.hours}h)`,
                        address: d.address,
                        custom: true,
                        hours: d.hours,
                        isHourly: true,
                      });
                      setStep(1);
                    } catch {
                      setError('Pricing error');
                      setTimeout(() => setError(null), 3000);
                    } finally {
                      setCustomPricing(false);
                    }
                  }}
                  className="bg-[#111827]/80 border border-white/[0.06] hover:border-[#c8a951]/40 rounded-xl p-5 text-left transition-all active:scale-[0.98] flex items-start gap-4 group"
                  data-testid={`disposal-${d.id}`}
                >
                  <div className="w-12 h-12 bg-[#c8a951]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#c8a951]/20 transition-colors">
                    <Clock className="w-6 h-6 text-[#c8a951]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="text-white font-bold text-base">{d.name}</p>
                      <span className="text-[#c8a951] font-bold text-sm whitespace-nowrap">{d.hours}h</span>
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed">{d.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 0.85: Hourly Free — choose custom duration */}
        {step === 0.85 && (
          <div className="max-w-2xl mx-auto" style={{ animation: 'fadeUp 0.3s ease-out' }} data-testid="kiosk-hourly-screen">
            <button
              onClick={() => setStep(0.8)}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#c8a951] mb-6 transition-colors"
              data-testid="kiosk-hourly-back"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> {t.back}
            </button>

            {customPricing && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" data-testid="kiosk-hourly-loading">
                <div className="bg-[#111827] border border-[#c8a951]/30 rounded-2xl p-8 flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-[#c8a951] animate-spin" />
                  <p className="text-white font-medium">{t.calcPrice}</p>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#c8a951]/15 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-[#c8a951]" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">{t.hourlyPickDuration}</h2>
              <p className="text-gray-500 text-sm">{t.hourlyMin}</p>
            </div>

            {/* Big number with - / + */}
            <div className="bg-[#111827]/60 border border-white/[0.06] rounded-2xl p-6 mb-6 flex items-center justify-between gap-6 max-w-md mx-auto">
              <button
                onClick={() => setCustomHours(Math.max(3, customHours - 1))}
                disabled={customHours <= 3}
                className="w-14 h-14 rounded-xl bg-[#c8a951]/10 border border-[#c8a951]/30 hover:bg-[#c8a951]/20 text-[#c8a951] font-black text-2xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                data-testid="kiosk-hourly-minus"
              >
                −
              </button>
              <div className="text-center flex-1">
                <p className="text-6xl font-black text-white tabular-nums leading-none" data-testid="kiosk-hourly-value">{customHours}</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-2">
                  {customHours > 1 ? t.hourlyHours : t.hourlyHour}
                </p>
              </div>
              <button
                onClick={() => setCustomHours(Math.min(12, customHours + 1))}
                disabled={customHours >= 12}
                className="w-14 h-14 rounded-xl bg-[#c8a951]/10 border border-[#c8a951]/30 hover:bg-[#c8a951]/20 text-[#c8a951] font-black text-2xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                data-testid="kiosk-hourly-plus"
              >
                +
              </button>
            </div>

            {/* Quick-pick chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              {[3, 4, 6, 8, 10, 12].map(h => (
                <button
                  key={h}
                  onClick={() => setCustomHours(h)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${customHours === h ? 'bg-[#c8a951] text-[#0b1120]' : 'bg-[#111827] border border-white/10 text-gray-400 hover:text-white hover:border-[#c8a951]/40'}`}
                  data-testid={`kiosk-hourly-chip-${h}`}
                >
                  {h}h
                </button>
              ))}
            </div>

            {/* Toll-roads notice */}
            <div className="bg-[#c8a951]/8 border border-[#c8a951]/25 rounded-xl px-4 py-3 mb-6 flex items-start gap-3 max-w-md mx-auto" data-testid="kiosk-hourly-tolls-notice">
              <ShieldCheck className="w-5 h-5 text-[#c8a951] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-300 leading-relaxed">
                <span className="text-[#c8a951] font-bold">
                  {lang === 'fr' ? 'Bon a savoir : ' : lang === 'ru' ? 'Важно: ' : 'Good to know: '}
                </span>
                {t.hourlyTollsNotice}
              </p>
            </div>

            <button
              onClick={async () => {
                setCustomPricing(true);
                try {
                  // Authoritative hourly pricing from C# TripsPrice admin grid
                  const resp = await fetch(`${API}/api/kiosk/${slug}/hourly-price`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hours: customHours }),
                  });
                  if (!resp.ok) throw new Error('pricing-failed');
                  const data = await resp.json();
                  setSelectedDest({
                    ...data,
                    custom: true,
                    isHourly: true,
                    isHourlyFree: true,
                    hours: customHours,
                  });
                  setStep(1);
                } catch {
                  setError('Pricing error');
                  setTimeout(() => setError(null), 3000);
                } finally {
                  setCustomPricing(false);
                }
              }}
              className="w-full bg-[#c8a951] hover:bg-[#b89841] text-[#0b1120] py-4 rounded-xl font-black text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 max-w-md mx-auto"
              data-testid="kiosk-hourly-continue"
            >
              {t.hourlyContinue} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 0.5: Airport list */}
        {step === 0.5 && (
          <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-10">{t.airports}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {airportDests.map((d, i) => (
                <button key={i} onClick={() => { setSelectedDest(d); setStep(1); }} className="bg-[#111827]/80 border-2 border-white/[0.08] hover:border-[#2ecc71]/50 rounded-2xl p-7 text-left transition-all active:scale-[0.98]">
                  <Plane className="w-10 h-10 text-[#2ecc71] mb-4" />
                  <p className="text-white font-bold text-xl lg:text-2xl mb-2">{d.name}</p>
                  <p className="text-gray-400 text-sm">{d.address?.split(',').slice(0,2).join(',')}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 0.6: Station list */}
        {step === 0.6 && (
          <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-10">{t.stations}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {stationDests.map((d, i) => (
                <button key={i} onClick={() => { setSelectedDest(d); setStep(1); }} className="bg-[#111827]/80 border-2 border-white/[0.08] hover:border-[#2ecc71]/50 rounded-2xl p-7 text-left transition-all active:scale-[0.98]">
                  <TrainFront className="w-10 h-10 text-[#2ecc71] mb-4" />
                  <p className="text-white font-bold text-xl lg:text-2xl mb-2">{d.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{d.address?.split(',').slice(0,2).join(',')}</p>
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
          <div className="max-w-2xl mx-auto" style={{ animation: 'fadeUp 0.3s ease-out' }}>
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-3">{t.when}</h2>
            <p className="text-gray-400 text-center text-lg mb-10">{t.towards} <span className="text-[#2ecc71] font-medium">{selectedDest?.name}</span></p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide font-semibold">{t.date}</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-6 py-5 bg-[#111827] border-2 border-white/10 rounded-2xl text-white text-2xl focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="kiosk-date" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide font-semibold">{t.time}</label>
                <div className="flex items-stretch justify-center gap-3 sm:gap-4" data-testid="kiosk-time-picker">
                  {[['h', t.hours, (time || '00:00').split(':')[0]], ['m', t.minutes, (time || '00:00').split(':')[1]]].map(([field, label, val], idx) => (
                    <React.Fragment key={field}>
                      {idx === 1 && <div className="flex items-center text-5xl sm:text-6xl font-bold text-gray-600 pt-6">:</div>}
                      <div className="flex-1 max-w-[200px] bg-[#111827] border-2 border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col items-center">
                        <span className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide font-semibold mb-2">{label}</span>
                        <button onClick={() => stepTime(field, 1)} className="w-full py-3 sm:py-4 rounded-xl bg-white/5 hover:bg-[#2ecc71]/20 active:bg-[#2ecc71]/40 transition-colors flex items-center justify-center" data-testid={`kiosk-${field === 'h' ? 'hour' : 'minute'}-up`}>
                          <ChevronUp className="w-9 h-9 sm:w-10 sm:h-10 text-[#2ecc71]" />
                        </button>
                        <span className="text-5xl sm:text-6xl font-bold my-2 sm:my-3 tabular-nums select-none" data-testid={`kiosk-${field === 'h' ? 'hour' : 'minute'}-value`}>{val}</span>
                        <button onClick={() => stepTime(field, -1)} className="w-full py-3 sm:py-4 rounded-xl bg-white/5 hover:bg-[#2ecc71]/20 active:bg-[#2ecc71]/40 transition-colors flex items-center justify-center" data-testid={`kiosk-${field === 'h' ? 'hour' : 'minute'}-down`}>
                          <ChevronDown className="w-9 h-9 sm:w-10 sm:h-10 text-[#2ecc71]" />
                        </button>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              {!dateTimeValid && (
                <div className="flex items-center justify-center gap-2 text-amber-400 text-base sm:text-lg font-medium" data-testid="kiosk-min3h-warning">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {t.min3h}
                </div>
              )}
              <button onClick={() => { if (dateTimeValid) { setStep(2); } }} disabled={!dateTimeValid} className="w-full bg-[#2ecc71] text-white py-5 rounded-2xl font-bold text-xl hover:bg-[#27ae60] transition-all disabled:bg-gray-700 disabled:text-gray-500 flex items-center justify-center gap-3 mt-4" data-testid="kiosk-next">
                {t.continue} <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle */}
        {step === 2 && (
          <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-8">{t.chooseVehicle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 max-w-[1600px] mx-auto">
              {[...(selectedDest?.vehicles || [])].sort((a, b) => (a.maxAmount || 0) - (b.maxAmount || 0)).map((v, i) => {
                const imgUrl = transferService.getVehicleImageUrl(v.imagePath);
                return (
                  <button
                    key={i}
                    onClick={() => { setSelectedVehicle(v); setStep(3); }}
                    className="group relative bg-gradient-to-b from-[#111827]/90 to-[#0b1120]/90 border-2 border-white/[0.08] hover:border-[#2ecc71] rounded-3xl px-6 pt-5 pb-6 text-center transition-all active:scale-[0.98] shadow-xl hover:shadow-2xl hover:shadow-[#2ecc71]/20 hover:-translate-y-1"
                    data-testid={`vehicle-${i}`}
                  >
                    {/* Soft green glow behind the car (depth on dark bg) */}
                    <div className="absolute inset-x-6 top-4 h-44 lg:h-56 xl:h-72 bg-[radial-gradient(ellipse_at_center,rgba(46,204,113,0.12),transparent_70%)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {/* Vehicle image — much larger for 21" kiosk */}
                    <div className="relative h-44 lg:h-56 xl:h-72 flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-105">
                      {imgUrl
                        ? <img src={imgUrl} alt={v.tripType} className="max-h-full max-w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                        : <Car className="w-40 h-40 lg:w-52 lg:h-52 text-gray-700" />}
                    </div>
                    <h4 className="text-white font-bold text-xl lg:text-2xl xl:text-3xl mb-3 leading-tight">{v.tripType}</h4>
                    <div className="flex items-center justify-center gap-6 text-sm lg:text-base text-gray-400 mb-4">
                      <span className="flex items-center gap-1.5"><Users className="w-5 h-5 lg:w-6 lg:h-6 text-[#2ecc71]/70" />{v.passenger}</span>
                      <span className="flex items-center gap-1.5"><Briefcase className="w-5 h-5 lg:w-6 lg:h-6 text-[#2ecc71]/70" />{v.luggage}</span>
                    </div>
                    <div className="border-t border-white/[0.06] pt-4">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">{t.from}</p>
                      <p className="text-[#2ecc71] font-black text-5xl lg:text-6xl xl:text-7xl leading-none">{v.maxAmount}<span className="text-2xl">&euro;</span></p>
                    </div>
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
              <p className="text-[#2ecc71] font-bold text-2xl">{selectedVehicle?.maxAmount}<span className="text-sm">&euro;</span></p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide font-semibold">{t.name} *</label>
                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Jean Dupont" className="w-full px-5 py-4 bg-[#111827] border border-white/10 rounded-xl text-white text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="kiosk-name" autoFocus />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide font-semibold">{t.phone} *</label>
                <PhoneInput
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  onCountryChange={(code) => setClientCountryCode(code)}
                  priorityCountries={['FR', 'US', 'GB', 'ES', 'BR']}
                  size="large"
                  darkMode={true}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide font-semibold">Email *</label>
                <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="email@exemple.com" className="w-full px-5 py-4 bg-[#111827] border border-white/10 rounded-xl text-white text-lg placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2ecc71]" data-testid="kiosk-email" />
                {clientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim()) && (
                  <p className="text-amber-400 text-sm mt-1.5" data-testid="kiosk-email-error">{t.invalidEmail}</p>
                )}
              </div>
              <button onClick={handleSubmitBooking} disabled={submitting || !clientName.trim() || !clientPhone.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())} className="w-full bg-[#2ecc71] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#27ae60] transition-all disabled:bg-gray-700 disabled:text-gray-500 flex items-center justify-center gap-2 mt-2" data-testid="kiosk-confirm">
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />{t.booking}</> : <><CheckCircle className="w-5 h-5" />{t.confirm}</>}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Stripe Terminal payment + Confirmation — 2-column with recap+map */}
        {step === 4 && booking && (
          <div className="max-w-[1400px] mx-auto" style={{ animation: 'fadeUp 0.5s ease-out' }}>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-start">

              {/* === LEFT — Booking recap with map + route === */}
              <div className="bg-gradient-to-b from-[#111827]/90 to-[#0b1120]/90 border border-white/[0.08] rounded-3xl p-6 lg:p-8 shadow-xl" data-testid="payment-recap-panel">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs uppercase tracking-[0.25em] text-[#2ecc71] font-bold">{lang === 'fr' ? 'Recapitulatif' : lang === 'ru' ? 'Сводка' : lang === 'hy' ? 'Ամփոփում' : 'Booking summary'}</h3>
                  <span className="text-[10px] uppercase tracking-wider text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1 rounded-full">{t.ref}: <span className="font-mono">{booking.reference}</span></span>
                </div>

                {/* Route summary - pickup → destination */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="relative flex flex-col items-center pt-1">
                      <div className="w-3 h-3 rounded-full bg-[#2ecc71] ring-4 ring-[#2ecc71]/20" />
                      <div className="w-0.5 h-10 bg-gradient-to-b from-[#2ecc71] to-[#2ecc71]/30" />
                      <div className="w-3 h-3 rounded-sm bg-[#c8a951] ring-4 ring-[#c8a951]/20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">{lang === 'fr' ? 'Depart' : lang === 'ru' ? 'Откуда' : 'Pickup'}</p>
                        <p className="text-white text-lg lg:text-xl font-bold truncate">{hotel?.name}</p>
                        <p className="text-gray-500 text-xs truncate">{hotel?.address}</p>
                      </div>
                      <div className="mt-7">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">{lang === 'fr' ? 'Destination' : lang === 'ru' ? 'Куда' : 'Drop-off'}</p>
                        <p className="text-white text-lg lg:text-xl font-bold truncate">{selectedDest?.name}</p>
                        <p className="text-gray-500 text-xs truncate">{selectedDest?.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Static Google Map showing both points */}
                {hotel?.lat && selectedDest?.lat && (
                  <div className="rounded-2xl overflow-hidden border border-white/10 mb-5" data-testid="payment-recap-map">
                    <img
                      src={`https://maps.googleapis.com/maps/api/staticmap?size=640x260&scale=2&maptype=roadmap&style=feature:all|element:geometry|color:0x1a2332&style=feature:all|element:labels.text.fill|color:0x8a9bb8&style=feature:all|element:labels.text.stroke|color:0x0b1120&style=feature:road|element:geometry|color:0x2a3447&style=feature:water|element:geometry|color:0x0d2236&style=feature:poi|element:labels|visibility:off&markers=color:0x2ecc71%7Clabel:A%7C${hotel.lat},${hotel.lng}&markers=color:0xc8a951%7Clabel:B%7C${selectedDest.lat},${selectedDest.lng}&path=color:0x2ecc71BB|weight:4|${hotel.lat},${hotel.lng}|${selectedDest.lat},${selectedDest.lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`}
                      alt="Itineraire"
                      className="w-full h-auto block"
                    />
                  </div>
                )}

                {/* Vehicle + date/time + price */}
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 bg-[#0b1120]/60 border border-white/[0.06] rounded-2xl p-4">
                  <div className="w-24 h-16 flex items-center justify-center">
                    {selectedVehicle?.imagePath
                      ? <img src={transferService.getVehicleImageUrl(selectedVehicle.imagePath)} alt={selectedVehicle.tripType} className="max-h-full max-w-full object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.5)]" />
                      : <Car className="w-12 h-12 text-gray-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-base lg:text-lg truncate">{selectedVehicle?.tripType}</p>
                    <p className="text-gray-500 text-xs flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{time}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{clientName}</span>
                    </p>
                  </div>
                  <p className="text-[#2ecc71] font-black text-3xl lg:text-4xl leading-none">{selectedVehicle?.maxAmount}<span className="text-lg">&euro;</span></p>
                </div>
              </div>

              {/* === RIGHT — Terminal payment status === */}
              <div className="text-center">
                {!terminalStatus && (
                  <div data-testid="terminal-initializing">
                    <Loader2 className="w-20 h-20 text-[#2ecc71] animate-spin mx-auto mb-6" />
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">{lang === 'fr' ? 'Connexion au terminal…' : lang === 'ru' ? 'Подключение к терминалу…' : lang === 'hy' ? 'Միանում է տերմինալին…' : 'Connecting to terminal…'}</h3>
                    <p className="text-gray-400">{lang === 'fr' ? 'Veuillez patienter quelques instants' : lang === 'ru' ? 'Пожалуйста, подождите' : 'Please wait a moment'}</p>
                  </div>
                )}

                {terminalStatus === 'waiting_card' && (
                  <div data-testid="terminal-waiting-card">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-[#2ecc71]/10 border-4 border-[#2ecc71]/40 flex items-center justify-center" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
                      <CreditCard className="w-16 h-16 text-[#2ecc71]" />
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-bold text-white mb-2">Présentez votre carte</h3>
                    <p className="text-gray-300 text-lg mb-1">sur le terminal de paiement</p>
                    <p className="text-[#2ecc71] font-black text-6xl lg:text-7xl mt-4">{selectedVehicle?.maxAmount}&euro;</p>
                    <p className="text-gray-500 text-sm mt-4">Sans contact, insertion ou Apple Pay</p>
                    {/* Accepted card brands */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-6" data-testid="accepted-card-brands">
                      <span className="bg-white text-[#1a1f71] font-black px-3 py-1.5 rounded text-sm tracking-wide" style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>VISA</span>
                      <span className="bg-white text-[#eb001b] font-black px-3 py-1.5 rounded text-sm tracking-wide" style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>Mastercard</span>
                      <span className="bg-white text-[#006fcf] font-black px-3 py-1.5 rounded text-sm tracking-wide" style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>AMEX</span>
                      <span className="bg-white text-[#0e3a8a] font-black px-3 py-1.5 rounded text-sm tracking-wide" style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>CB</span>
                      <span className="bg-black border border-white/40 text-white font-bold px-3 py-1.5 rounded text-sm" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Apple Pay</span>
                      <span className="bg-white text-black font-bold px-3 py-1.5 rounded text-sm">Google Pay</span>
                    </div>
                    <button onClick={handleCancelTerminalPayment} className="mt-6 text-gray-500 text-sm underline hover:text-gray-300" data-testid="cancel-terminal-payment">
                      Annuler le paiement
                    </button>
                  </div>
                )}

                {terminalStatus === 'processing' && (
                  <div data-testid="terminal-processing">
                    <Loader2 className="w-20 h-20 text-[#2ecc71] animate-spin mx-auto mb-6" />
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">Traitement du paiement…</h3>
                    <p className="text-gray-400">Veuillez patienter</p>
                  </div>
                )}

                {terminalStatus === 'paid' && (
                  <div data-testid="terminal-paid">
                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-[#2ecc71] flex items-center justify-center" style={{ animation: 'fadeUp 0.4s ease-out' }}>
                      <Check className="w-20 h-20 text-white" strokeWidth={3} />
                    </div>
                    <h3 className="text-4xl lg:text-5xl font-black text-[#2ecc71] mb-2">{t.paymentAccepted}</h3>
                    <p className="text-white text-lg lg:text-xl">{t.confirmationSoon}</p>
                    <p className="text-[#2ecc71] font-bold text-3xl lg:text-4xl mt-4">{selectedVehicle?.maxAmount}&euro;</p>
                    <button onClick={resetKiosk} className="mt-8 bg-[#111827] border border-white/10 text-white px-8 py-3 rounded-xl hover:bg-white/[0.05] transition-colors">
                      <RotateCcw className="w-4 h-4 inline mr-2" />{t.newBooking}
                    </button>
                  </div>
                )}

                {(terminalStatus === 'error' || terminalStatus === 'cancelled') && (
                  <div data-testid="terminal-error">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                      <X className="w-14 h-14 text-red-400" strokeWidth={3} />
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                      {terminalStatus === 'cancelled' ? 'Paiement annulé' : 'Erreur de paiement'}
                    </h3>
                    {terminalError && <p className="text-red-400 text-sm mt-2">{terminalError}</p>}
                    {/* Fallback: show QR if terminal failed */}
                    {booking.qrCode && (
                      <div className="mt-6">
                        <p className="text-gray-300 text-sm mb-3">Vous pouvez payer en scannant ce QR code :</p>
                        <div className="bg-white border border-[#2ecc71]/20 rounded-2xl p-4 inline-block">
                          <img src={booking.qrCode} alt="QR Payment" className="w-48 h-48 mx-auto block" data-testid="payment-qr-fallback" />
                        </div>
                      </div>
                    )}
                    <button onClick={resetKiosk} className="mt-6 bg-[#111827] border border-white/10 text-white px-8 py-3 rounded-xl hover:bg-white/[0.05] transition-colors">
                      <RotateCcw className="w-4 h-4 inline mr-2" />{t.newBooking}
                    </button>
                  </div>
                )}
              </div>
            </div>
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
