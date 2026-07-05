import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import transferService from '@/services/api';
import { Clock, MapPin, Calendar, CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

// ---------- i18n ----------
const T = {
  en: { title: 'Hourly Ride Booking', sub: 'Book a private chauffeur by the hour — pickup only, no destination. Pay with your saved card.', pickup: 'Pickup location', pickupPh: 'Airport, hotel, address...', carType: 'Choose a car', duration: 'How many hours?', durationHint: h => `Includes ${h * 20} km`, date: 'Date', time: 'Time (5-min steps)', comment: 'Comment (optional)', commentPh: 'Any special request...', terminal: 'Terminal / flight (optional)', terminalPh: 'e.g. Terminal 2E, AF1234', card: 'Payment card', noCards: 'No saved card yet — please add one.', addCard: 'Add card', priceSummary: 'Price', minPrice: 'Minimum', payNow: 'Continue & pay', paying: 'Processing…', successTitle: 'Order registered!', successText: 'Your hourly ride has been booked. Check My trips for details.', myTrips: 'My trips', errorGeneric: 'Something went wrong. Please try again.', errorTime: 'Pickup must be at least 3 hours from now.', errorCar: 'Please select a car category.', errorPickup: 'Please choose a pickup location.', errorCard: 'Please choose a payment card.', loginRequired: 'You must be logged in to book. Please sign in.', loadingCars: 'Loading cars for this address…' },
  fr: { title: 'Réservation à l\'heure', sub: 'Réservez un chauffeur privé à l\'heure — point de départ uniquement, sans destination. Paiement par carte enregistrée.', pickup: 'Lieu de prise en charge', pickupPh: 'Aéroport, hôtel, adresse...', carType: 'Choisir un véhicule', duration: 'Combien d\'heures ?', durationHint: h => `Inclut ${h * 20} km`, date: 'Date', time: 'Heure (par 5 min)', comment: 'Commentaire (optionnel)', commentPh: 'Demande particulière...', terminal: 'Terminal / vol (optionnel)', terminalPh: 'ex. Terminal 2E, AF1234', card: 'Carte bancaire', noCards: 'Aucune carte enregistrée — ajoutez-en une.', addCard: 'Ajouter une carte', priceSummary: 'Prix', minPrice: 'Minimum', payNow: 'Continuer et payer', paying: 'Traitement…', successTitle: 'Réservation enregistrée !', successText: 'Votre course à l\'heure est réservée. Consultez Mes courses.', myTrips: 'Mes courses', errorGeneric: 'Une erreur est survenue. Réessayez.', errorTime: 'La prise en charge doit être au moins 3h dans le futur.', errorCar: 'Sélectionnez un véhicule.', errorPickup: 'Choisissez un lieu de prise en charge.', errorCard: 'Choisissez une carte de paiement.', loginRequired: 'Vous devez être connecté pour réserver.', loadingCars: 'Chargement des véhicules disponibles…' },
  es: { title: 'Reserva por horas', sub: 'Reserva un chófer privado por horas — solo recogida, sin destino. Paga con tu tarjeta guardada.', pickup: 'Lugar de recogida', pickupPh: 'Aeropuerto, hotel, dirección...', carType: 'Elige un vehículo', duration: '¿Cuántas horas?', durationHint: h => `Incluye ${h * 20} km`, date: 'Fecha', time: 'Hora (pasos de 5 min)', comment: 'Comentario (opcional)', commentPh: 'Alguna petición especial...', terminal: 'Terminal / vuelo (opcional)', terminalPh: 'ej. Terminal 2E, AF1234', card: 'Tarjeta de pago', noCards: 'No hay tarjeta guardada — añade una.', addCard: 'Añadir tarjeta', priceSummary: 'Precio', minPrice: 'Mínimo', payNow: 'Continuar y pagar', paying: 'Procesando…', successTitle: '¡Pedido registrado!', successText: 'Tu servicio por horas está reservado. Consulta Mis viajes.', myTrips: 'Mis viajes', errorGeneric: 'Ha ocurrido un error. Inténtalo de nuevo.', errorTime: 'La recogida debe ser al menos 3h en el futuro.', errorCar: 'Selecciona un vehículo.', errorPickup: 'Elige un lugar de recogida.', errorCard: 'Elige una tarjeta.', loginRequired: 'Debes iniciar sesión para reservar.', loadingCars: 'Cargando vehículos disponibles…' },
  ru: { title: 'Почасовая аренда', sub: 'Забронируйте частного водителя на час — только точка подачи, без пункта назначения. Оплата сохранённой картой.', pickup: 'Место подачи', pickupPh: 'Аэропорт, отель, адрес...', carType: 'Выберите автомобиль', duration: 'Сколько часов?', durationHint: h => `Включено ${h * 20} км`, date: 'Дата', time: 'Время (шаг 5 мин)', comment: 'Комментарий (необязательно)', commentPh: 'Особые пожелания...', terminal: 'Терминал / рейс (необязательно)', terminalPh: 'напр. Terminal 2E, AF1234', card: 'Карта оплаты', noCards: 'Нет сохранённых карт — добавьте.', addCard: 'Добавить карту', priceSummary: 'Цена', minPrice: 'Минимум', payNow: 'Продолжить и оплатить', paying: 'Обработка…', successTitle: 'Заказ зарегистрирован!', successText: 'Ваша поездка забронирована. Смотрите Мои поездки.', myTrips: 'Мои поездки', errorGeneric: 'Что-то пошло не так. Попробуйте ещё раз.', errorTime: 'Подача не ранее чем через 3 часа.', errorCar: 'Выберите автомобиль.', errorPickup: 'Укажите место подачи.', errorCard: 'Выберите карту.', loginRequired: 'Войдите в систему для бронирования.', loadingCars: 'Загрузка доступных машин…' },
  hy: { title: 'Ժամային ամրագրում', sub: 'Ամրագրեք մասնավոր վարորդ ժամով — միայն վերցնելու վայր, առանց ուղղության։', pickup: 'Վերցնելու վայրը', pickupPh: 'Օդանավակայան, հյուրանոց, հասցե...', carType: 'Ընտրեք մեքենա', duration: 'Քանի՞ ժամ', durationHint: h => `Ներառված է ${h * 20} կմ`, date: 'Ամսաթիվ', time: 'Ժամ (5 րոպե)', comment: 'Մեկնաբանություն', commentPh: 'Հատուկ պահանջ...', terminal: 'Տերմինալ / թռիչք', terminalPh: 'Terminal 2E, AF1234', card: 'Վճարման քարտ', noCards: 'Չկա պահված քարտ — ավելացրեք։', addCard: 'Ավելացնել քարտ', priceSummary: 'Գին', minPrice: 'Նվազագույն', payNow: 'Շարունակել և վճարել', paying: 'Մշակում…', successTitle: 'Պատվերը ամրագրված է!', successText: 'Ձեր ամրագրումը հաստատված է։', myTrips: 'Իմ ուղևորությունները', errorGeneric: 'Սխալ։ Փորձեք կրկին։', errorTime: 'Առնվազն 3 ժամ առաջ պետք է լինի։', errorCar: 'Ընտրեք մեքենա։', errorPickup: 'Ընտրեք վերցնելու վայրը։', errorCard: 'Ընտրեք քարտ։', loginRequired: 'Մուտք գործեք ամրագրելու համար։', loadingCars: 'Բեռնում…' },
};

const HOURS_OPTIONS = [2, 3, 4, 5, 6];

const HourlyBooking = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = T[language] || T.en;

  // Prefill from URL params (?pickup=&lat=&lng=&date=&time=&hours=)
  const initialPickup = useMemo(() => {
    const addr = searchParams.get('pickup') || '';
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    return {
      address: addr,
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
    };
  }, [searchParams]);
  const initialHours = useMemo(() => {
    const h = parseInt(searchParams.get('hours'), 10);
    return [2, 3, 4, 5, 6].includes(h) ? h : 2;
  }, [searchParams]);

  const [pickup, setPickup] = useState(initialPickup);
  const [cars, setCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [hours, setHours] = useState(initialHours);
  // Default date+time = "now + 4 hours" rounded up to next 5-min
  const initDateTime = useMemo(() => {
    const d = new Date(Date.now() + 4 * 60 * 60 * 1000);
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
    return d;
  }, []);
  const pad = n => String(n).padStart(2, '0');
  const urlDate = searchParams.get('date');
  const urlTime = searchParams.get('time');
  const [date, setDate] = useState(urlDate || `${initDateTime.getFullYear()}-${pad(initDateTime.getMonth() + 1)}-${pad(initDateTime.getDate())}`);
  const [time, setTime] = useState(urlTime || `${pad(initDateTime.getHours())}:${pad(initDateTime.getMinutes())}`);
  const [comment, setComment] = useState('');
  const [terminal, setTerminal] = useState('');
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const token = user?.token;

  // Fetch cars whenever pickup coordinates change
  useEffect(() => {
    if (!pickup.lat || !pickup.lng) return;
    let cancelled = false;
    setLoadingCars(true);
    setCars([]);
    (async () => {
      try {
        const resp = await fetch(`${API}/api/proxy/driver-types`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude: String(pickup.lat), longitude: String(pickup.lng) }),
        });
        const data = await resp.json();
        const list = Array.isArray(data) ? data : data.driverTypes || [];
        // Show all cars — the C# backend flags inactive but we let users see prices anyway
        if (!cancelled) setCars(list);
      } catch (e) {
        if (!cancelled) setCars([]);
      } finally {
        if (!cancelled) setLoadingCars(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pickup.lat, pickup.lng]);

  // Fetch saved cards on mount
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const resp = await fetch(`${API}/api/proxy/client/cards`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await resp.json();
        const list = Array.isArray(data) ? data : data.cards || data.paymentMethods || [];
        setCards(list);
        if (list.length === 1) setSelectedCardId(list[0].id);
      } catch (_) { setCards([]); }
    })();
  }, [token]);

  // Price calculation matching mobile app
  const price = useMemo(() => {
    if (!selectedCar) return 0;
    const perMin = Number(selectedCar.perMinuteForTime || 0);
    const baseFare = Number(selectedCar.baseFare || 0);
    const minP = Number(selectedCar.minimum || selectedCar.minAmount || 0);
    const raw = perMin * hours * 60 + baseFare;
    return Math.max(raw, minP);
  }, [selectedCar, hours]);

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!user || !token) { setErrorMsg(t.loginRequired); return; }
    if (!pickup.lat) { setErrorMsg(t.errorPickup); return; }
    if (!selectedCar) { setErrorMsg(t.errorCar); return; }
    if (!selectedCardId) { setErrorMsg(t.errorCard); return; }

    // Build startDate DD/MM/YYYY HH:mm:ss
    const [y, mo, d] = date.split('-');
    const [hh, mm] = time.split(':');
    const localDT = new Date(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm));
    const nowPlus3h = new Date(Date.now() + 3 * 60 * 60 * 1000);
    if (localDT < nowPlus3h) { setErrorMsg(t.errorTime); return; }
    const startDate = `${pad(localDT.getDate())}/${pad(localDT.getMonth() + 1)}/${localDT.getFullYear()} ${pad(localDT.getHours())}:${pad(localDT.getMinutes())}:00`;
    // C# expects utcOffset in MINUTES (Paris UTC+2 = 120, Yerevan UTC+4 = 240)
    const utcOffset = -localDT.getTimezoneOffset();

    const payload = {
      tripType: 'timing',
      duration: hours * 3600,
      startDate,
      clientPrice: Math.round(price * 100) / 100,
      carType: (selectedCar.tripTypes || selectedCar.carType || '').trim(),
      cardId: selectedCardId,
      utcOffset,
      paymentType: 'card',
      startAddress: pickup.address,
      startPointLatitude: Number(pickup.lat),
      startPointLongitude: Number(pickup.lng),
      additionalComments: comment || '',
      terminal: terminal || '',
    };

    setSubmitting(true);
    try {
      const resp = await fetch(`${API}/api/proxy/booking/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        setSuccessMsg(t.successText);
      } else {
        const body = await resp.json().catch(() => ({}));
        // Surface the real C# error (detail may be object or string)
        const detail = body.detail;
        let msg;
        if (typeof detail === 'string') msg = detail;
        else if (detail && typeof detail === 'object') msg = detail.message || detail.title || detail.error || JSON.stringify(detail);
        else msg = body.message || body.title || t.errorGeneric;
        setErrorMsg(msg);
      }
    } catch (_) {
      setErrorMsg(t.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title={`${t.title} | ZONT Cab`}
        description={t.sub}
        canonical="https://www.zont.cab/hourly-booking"
      />
      <Header />

      <main className="bg-gray-50 min-h-screen pt-24 md:pt-28 pb-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-[#2ecc71]" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900" data-testid="hourly-h1">{t.title}</h1>
          </div>
          <p className="text-gray-600 mb-8">{t.sub}</p>

          {!user && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
              <span className="text-sm text-orange-800">{t.loginRequired}</span>
            </div>
          )}

          {successMsg ? (
            <div className="bg-white rounded-2xl border border-green-200 p-8 text-center">
              <CheckCircle className="w-14 h-14 text-[#2ecc71] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="hourly-success">{t.successTitle}</h2>
              <p className="text-gray-600 mb-6">{successMsg}</p>
              <button onClick={() => navigate('/my-bookings')} className="bg-[#2ecc71] hover:bg-[#27ae60] text-white px-6 py-3 rounded-xl font-bold">
                {t.myTrips}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
              {/* Pickup */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                  <MapPin className="w-4 h-4" /> {t.pickup}
                </label>
                <PlacesAutocomplete
                  value={pickup.address}
                  placeholder={t.pickupPh}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-gray-900 placeholder-gray-400 focus:border-[#2ecc71] focus:outline-none"
                  onChange={({ address, latitude, longitude }) => setPickup({ address: address || '', lat: latitude, lng: longitude })}
                  data-testid="hourly-pickup"
                />
              </div>

              {/* Car type */}
              {pickup.lat && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">{t.carType}</label>
                  {loadingCars ? (
                    <div className="text-sm text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {t.loadingCars}</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cars.map(car => {
                        const key = car.tripTypes || car.carType || car.name;
                        const isSelected = selectedCar && (selectedCar.tripTypes || selectedCar.carType) === (car.tripTypes || car.carType);
                        const perMin = Number(car.perMinuteForTime || 0);
                        const baseFare = Number(car.baseFare || 0);
                        const minP = Number(car.minimum || car.minAmount || 0);
                        const carPrice = Math.max(perMin * hours * 60 + baseFare, minP);
                        const imgUrl = transferService.getVehicleImageUrl(car.imagePath);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedCar(car)}
                            className={`text-left border-2 rounded-xl transition overflow-hidden ${isSelected ? 'border-[#2ecc71] bg-green-50 shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                            data-testid={`car-${key}`}
                          >
                            <div className="w-full h-28 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={car.name || key}
                                  className="max-h-full max-w-full object-contain drop-shadow-sm"
                                  loading="lazy"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="text-gray-300 text-xs">—</div>
                              )}
                            </div>
                            <div className="p-3 flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 text-sm truncate">{car.name || key}</div>
                                <div className="text-[11px] text-gray-500 mt-0.5">{t.minPrice}: {minP}€ · {(perMin * 60).toFixed(0)}€/h</div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-base font-bold text-[#2ecc71] leading-tight">{carPrice.toFixed(0)}€</div>
                                <div className="text-[10px] text-gray-500 uppercase">{hours}h</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">{t.duration}</label>
                <div className="grid grid-cols-5 gap-2">
                  {HOURS_OPTIONS.map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHours(h)}
                      className={`py-3 rounded-xl border-2 font-bold ${hours === h ? 'border-[#2ecc71] bg-green-50 text-[#2ecc71]' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                      data-testid={`hours-${h}`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">{t.durationHint(hours)}</div>
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                    <Calendar className="w-4 h-4" /> {t.date}
                  </label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-gray-900 bg-white focus:border-[#2ecc71] focus:outline-none" data-testid="hourly-date" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">{t.time}</label>
                  <input type="time" value={time} step="300" onChange={e => setTime(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-gray-900 bg-white focus:border-[#2ecc71] focus:outline-none" data-testid="hourly-time" />
                </div>
              </div>

              {/* Comment + Terminal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" value={comment} onChange={e => setComment(e.target.value)} placeholder={t.commentPh} className="border-2 border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-[#2ecc71] focus:outline-none" data-testid="hourly-comment" />
                <input type="text" value={terminal} onChange={e => setTerminal(e.target.value)} placeholder={t.terminalPh} className="border-2 border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 bg-white placeholder-gray-400 focus:border-[#2ecc71] focus:outline-none" data-testid="hourly-terminal" />
              </div>

              {/* Card */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                  <CreditCard className="w-4 h-4" /> {t.card}
                </label>
                {cards.length === 0 ? (
                  <div className="text-sm text-gray-600 border border-orange-200 bg-orange-50 rounded-xl p-3">
                    {t.noCards} <button onClick={() => navigate('/my-account')} className="ml-2 underline">{t.addCard}</button>
                  </div>
                ) : (
                  <select value={selectedCardId} onChange={e => setSelectedCardId(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-gray-900 bg-white focus:border-[#2ecc71] focus:outline-none" data-testid="hourly-card-select">
                    <option value="">—</option>
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>{c.brand?.toUpperCase() || 'Card'} •••• {c.last4}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Price */}
              {selectedCar && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-gray-700 font-medium">{t.priceSummary}</span>
                  <span className="text-2xl font-bold text-gray-900" data-testid="hourly-price">{price.toFixed(2)} €</span>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 flex items-start gap-2" data-testid="hourly-error">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" /> <span className="text-sm">{errorMsg}</span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !user}
                className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-testid="hourly-submit"
              >
                {submitting ? (<><Loader2 className="w-5 h-5 animate-spin" /> {t.paying}</>) : t.payNow}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default HourlyBooking;
