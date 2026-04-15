import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { transferService, authService } from '@/services/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';
import PhoneInput from '@/components/PhoneInput';
import { toast } from 'sonner';
import { trackInitiateCheckout } from '@/utils/fbPixel';
import {
  CreditCard, MapPin, Calendar, Clock, Shield, CheckCircle,
  Loader2, User, Mail, Lock, Phone, ChevronLeft, ArrowRight, Car, Trash2
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const STRIPE_PK = 'pk_live_lX3FXPqGIJLP5NgXomcdpcWO';
const stripePromise = loadStripe(STRIPE_PK);

const labels = {
  en: {
    title: 'Complete Your Booking',
    summary: 'Trip Summary',
    from: 'Pick-up', to: 'Drop-off',
    dateTime: 'Date & Time', vehicle: 'Vehicle',
    total: 'Total', vatNote: 'All prices include VAT, fees and tolls.',
    payment: 'Card Details', payBtn: 'Add your card',
    payBtnSaved: 'Pay the reservation',
    processing: 'Verification...',
    noData: 'No booking data found', goBack: 'Start a new booking',
    trustItems: ['Secure payment', 'Fixed price guaranteed', 'Free cancellation 24h'],
    cardNote: 'Your card will be charged immediately upon booking confirmation.',
    secureNote: '3D Secure verification will show 0\u20AC — this is normal. It only validates your card.',
    cardExplain: 'Once your card is verified, the amount will be charged and your booking confirmed instantly.',
    step1: 'Vehicle', step2: 'Summary', step3: 'Booking',
    cardError: 'Please check your card details.',
    bookingSuccess: 'Booking confirmed! Your ride has been reserved.',
    bookingError: 'Booking failed. Please try again.',
    pastDateError: 'The booking date has passed. Please choose a future date.',
    savedCards: 'Your saved cards',
    useThisCard: 'Use this card',
    addNewCard: 'Use a new card',
    expires: 'Exp',
    selectedCard: 'Selected',
    deleteCard: 'Delete',
    passengerTitle: 'Passenger Details',
    firstName: 'First Name', lastName: 'Last Name',
    email: 'Email', phone: 'Phone',
    password: 'Password', passwordHint: 'To manage your booking',
    loggedAs: 'Logged in as',
    alreadyAccount: 'Already have an account?', signIn: 'Sign in',
    noAccount: 'New here?', signUp: 'Create account',
    loginError: 'Invalid credentials',
    orSimilar: 'or similar',
    amountCharged: 'Amount to be charged',
    afterConfirmation: 'charged upon booking confirmation',
  },
  fr: {
    title: 'Finalisez Votre Réservation',
    summary: 'Résumé du Trajet',
    from: 'Départ', to: 'Arrivée',
    dateTime: 'Date & Heure', vehicle: 'Véhicule',
    total: 'Total', vatNote: 'Tous les prix incluent TVA, frais et péages.',
    payment: 'Carte bancaire', payBtn: 'Ajouter votre carte',
    payBtnSaved: 'Payer la réservation',
    processing: 'Vérification en cours...',
    noData: 'Aucune réservation trouvée', goBack: 'Nouvelle recherche',
    trustItems: ['Paiement sécurisé', 'Prix fixe garanti', 'Annulation gratuite 24h'],
    cardNote: 'Votre carte sera débitée dès la confirmation de la réservation.',
    secureNote: 'La vérification 3D Secure affichera 0\u20AC \u2014 c\'est normal. Elle sert uniquement à valider votre carte.',
    cardExplain: 'Une fois votre carte vérifiée, le montant sera débité et votre réservation confirmée immédiatement.',
    step1: 'Véhicule', step2: 'Résumé', step3: 'Réservation',
    cardError: 'Veuillez vérifier vos informations de carte.',
    bookingSuccess: 'Réservation confirmée ! Votre course a été réservée.',
    bookingError: 'Erreur lors de la réservation. Veuillez réessayer.',
    pastDateError: 'La date de réservation est passée. Veuillez choisir une date future.',
    savedCards: 'Vos cartes enregistrées',
    useThisCard: 'Utiliser cette carte',
    addNewCard: 'Utiliser une nouvelle carte',
    expires: 'Exp',
    selectedCard: 'Sélectionnée',
    deleteCard: 'Supprimer',
    passengerTitle: 'Informations Passager',
    firstName: 'Prénom', lastName: 'Nom',
    email: 'Email', phone: 'Téléphone',
    password: 'Mot de passe', passwordHint: 'Pour gérer votre réservation',
    loggedAs: 'Connecté en tant que',
    alreadyAccount: 'Déjà un compte ?', signIn: 'Se connecter',
    noAccount: 'Nouveau ?', signUp: 'Créer un compte',
    loginError: 'Identifiants incorrects',
    orSimilar: 'ou similaire',
    amountCharged: 'Montant a debiter',
    afterConfirmation: 'debite des la confirmation',
  },
  ru: {
    title: 'Завершите Бронирование',
    summary: 'Информация о Поездке',
    from: 'Откуда', to: 'Куда',
    dateTime: 'Дата и Время', vehicle: 'Автомобиль',
    total: 'Итого', vatNote: 'Все цены включают НДС и сборы.',
    payment: 'Банковская карта', payBtn: 'Забронировать',
    payBtnSaved: 'Оплатить бронирование',
    processing: 'Обработка...',
    noData: 'Данные не найдены', goBack: 'Новый поиск',
    trustItems: ['Безопасный платеж', 'Фикс. цена', 'Бесплатная отмена 24ч'],
    cardNote: 'Средства будут списаны сразу после подтверждения бронирования.',
    secureNote: '3D Secure покажет 0\u20AC \u2014 это нормально. Проверка карты.',
    cardExplain: 'После проверки карты сумма будет списана и бронирование подтверждено.',
    step1: 'Авто', step2: 'Детали', step3: 'Бронирование',
    cardError: 'Проверьте данные карты.',
    bookingSuccess: 'Бронирование подтверждено!',
    bookingError: 'Ошибка. Попробуйте снова.',
    pastDateError: 'Дата прошла.',
    savedCards: 'Сохранённые карты',
    useThisCard: 'Использовать',
    addNewCard: 'Новая карта',
    expires: 'До',
    selectedCard: 'Выбрана',
    deleteCard: 'Удалить',
    passengerTitle: 'Данные Пассажира',
    firstName: 'Имя', lastName: 'Фамилия',
    email: 'Email', phone: 'Телефон',
    password: 'Пароль', passwordHint: 'Для управления бронированием',
    loggedAs: 'Вы вошли как',
    alreadyAccount: 'Уже есть аккаунт?', signIn: 'Войти',
    noAccount: 'Новый?', signUp: 'Создать аккаунт',
    loginError: 'Неверные данные',
    orSimilar: 'или аналог',
    amountCharged: 'Сумма к оплате',
    afterConfirmation: 'списание при подтверждении',
  },
  hy: {
    title: 'Ամրագրdelays',
    summary: 'delays',
    from: 'delays', to: 'delays',
    dateTime: 'delays', vehicle: 'delays',
    total: 'delays', vatNote: 'delays.',
    payment: 'delays', payBtn: 'delays',
    payBtnSaved: 'delays',
    processing: 'delays...',
    noData: 'delays', goBack: 'delays',
    trustItems: ['delays', 'delays', 'delays'],
    cardNote: 'delays.',
    secureNote: 'delays.',
    cardExplain: 'delays.',
    step1: 'delays', step2: 'delays', step3: 'delays',
    cardError: 'delays.',
    bookingSuccess: 'delays!',
    bookingError: 'delays.',
    pastDateError: 'delays.',
    passengerTitle: 'delays',
    firstName: 'delays', lastName: 'delays',
    email: 'Email', phone: 'delays',
    password: 'delays', passwordHint: 'delays',
    loggedAs: 'delays',
    alreadyAccount: 'delays?', signIn: 'delays',
    noAccount: 'delays?', signUp: 'delays',
    loginError: 'delays',
    orSimilar: 'delays',
    amountCharged: 'delays',
    afterConfirmation: 'delays',
  },
};

const cardStyle = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      '::placeholder': { color: '#6b7280' },
    },
    invalid: { color: '#ef4444' },
  },
};

const formatDateForApi = (date, time) => {
  if (!date || !time) {
    console.warn('[ZONT] formatDateForApi: missing date or time', { date, time });
    return '';
  }
  // date is always YYYY-MM-DD from <input type="date">
  // time is always HH:MM from <input type="time">
  let year, month, day;
  if (date.includes('-')) {
    [year, month, day] = date.split('-');
  } else if (date.includes('/')) {
    // Fallback: DD/MM/YYYY or MM/DD/YYYY
    const parts = date.split('/');
    if (parts[2] && parts[2].length === 4) {
      day = parts[0]; month = parts[1]; year = parts[2];
    } else {
      day = parts[1]; month = parts[0]; year = parts[2];
    }
  } else {
    console.warn('[ZONT] formatDateForApi: unknown date format', date);
    return '';
  }
  // Ensure 24h time format (strip any AM/PM just in case)
  let cleanTime = time.replace(/\s*(AM|PM)\s*/i, '').trim();
  if (time.toUpperCase().includes('PM')) {
    const [h, m] = cleanTime.split(':');
    const hNum = parseInt(h, 10);
    cleanTime = `${hNum < 12 ? hNum + 12 : hNum}:${m}`;
  } else if (time.toUpperCase().includes('AM')) {
    const [h, m] = cleanTime.split(':');
    const hNum = parseInt(h, 10);
    cleanTime = `${hNum === 12 ? 0 : hNum}:${m}`;
  }
  const result = `${day}/${month}/${year} ${cleanTime}:00`;
  console.log('[ZONT] formatDateForApi:', { date, time, result });
  return result;
};

const formatPhone = (phone, countryCode) => {
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (!cleaned) return '';
  const num = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  return countryCode + num;
};

const UnifiedCheckoutForm = ({ searchData, selectedCar, c, isAuthenticated, user, onLoginDirect }) => {
  const navigate = useNavigate();
  const { completeBooking } = useBooking();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [deletingCard, setDeletingCard] = useState(null);

  // Fetch saved cards when authenticated
  // Uses XHR instead of fetch to avoid Stripe.js intercepting the body stream
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${process.env.REACT_APP_BACKEND_URL}/api/proxy/client/cards`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              const cards = Array.isArray(data) ? data : (data?.data || []);
              setSavedCards(cards);
              if (cards.length > 0) {
                setSelectedSavedCard(cards[0].id);
                setUseNewCard(false);
              } else {
                setUseNewCard(true);
              }
            } catch { setUseNewCard(true); }
          } else {
            setUseNewCard(true);
          }
        };
        xhr.onerror = () => setUseNewCard(true);
        xhr.send();
      }
    }
  }, [isAuthenticated]);

  // Uses XHR instead of fetch to avoid Stripe.js body stream interception
  const handleDeleteCard = async (cardId) => {
    setDeletingCard(cardId);
    try {
      const token = localStorage.getItem('auth_token');
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('DELETE', `${process.env.REACT_APP_BACKEND_URL}/api/proxy/client/cards/${cardId}`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setSavedCards(prev => prev.filter(c2 => c2.id !== cardId));
            if (selectedSavedCard === cardId) {
              const remaining = savedCards.filter(c2 => c2.id !== cardId);
              if (remaining.length > 0) {
                setSelectedSavedCard(remaining[0].id);
              } else {
                setSelectedSavedCard(null);
                setUseNewCard(true);
              }
            }
            toast.success(c.deleteCard + ' OK');
            resolve();
          } else {
            reject();
          }
        };
        xhr.onerror = () => reject();
        xhr.send();
      });
    } catch {}
    setDeletingCard(null);
  };

  // Auth mode: 'signup' or 'signin'
  const [authMode, setAuthMode] = useState('signup');
  const [phoneCountry, setPhoneCountry] = useState('+33');
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const inputCls = (field) =>
    `w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm ${
      errors[field] ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-[#2ecc71]'
    }`;

  const validateForm = () => {
    const errs = {};
    if (authMode === 'signup') {
      if (!form.firstName.trim()) errs.firstName = 'Requis';
      if (!form.lastName.trim()) errs.lastName = 'Requis';
      if (!form.phone.trim()) errs.phone = 'Requis';
    }
    if (!form.email.trim()) errs.email = 'Requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Email invalide';
    if (!form.password) errs.password = 'Requis';
    else if (authMode === 'signup' && form.password.length < 6) errs.password = 'Minimum 6 caracteres';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // Date validation
    if (searchData.date && searchData.time) {
      const bookingDate = new Date(`${searchData.date}T${searchData.time}`);
      if (bookingDate <= new Date()) {
        toast.error(c.pastDateError);
        return;
      }
    }

    // If not authenticated, validate and register/login first
    if (!isAuthenticated) {
      if (!validateForm()) return;
    }

    setLoading(true);
    try {
      // Step 1: Register or Login if needed
      if (!isAuthenticated) {
        if (authMode === 'signup') {
          const formatted = formatPhone(form.phone, phoneCountry);
          await authService.register({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phoneNumber: formatted,
            password: form.password,
            gender: 'male',
          });
          // Auto-login after registration
          const loginResult = await authService.login({ email: form.email, password: form.password });
          onLoginDirect(loginResult.user);
        } else {
          // Sign in mode
          const loginResult = await authService.login({ email: form.email, password: form.password });
          onLoginDirect(loginResult.user);
        }
        // Send verification email silently
        try { await authService.sendVerificationEmail(form.email); } catch {}
      }

      // Step 2: Get cardId — either from saved card or new SetupIntent
      let cardId;
      if (selectedSavedCard && !useNewCard) {
        // Use saved card directly
        cardId = selectedSavedCard;
      } else {
        // Create SetupIntent for new card + 3DS verification
        // Uses XHR instead of fetch to avoid Stripe.js body stream interception
        const token = localStorage.getItem('auth_token');
        const setupData = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${process.env.REACT_APP_BACKEND_URL}/api/proxy/booking/setup-intent`);
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.onload = () => {
            try {
              const parsed = JSON.parse(xhr.responseText);
              if (xhr.status === 401) {
                // Token expired — force re-login
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                window.location.reload();
                reject(new Error('Session expired'));
                return;
              }
              resolve(parsed);
            }
            catch { reject(new Error('Invalid setup-intent response')); }
          };
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send();
        });
        if (!setupData.clientSecret) {
          const detail = setupData?.detail;
          let errMsg = c.bookingError;
          if (typeof detail === 'string' && detail.trim()) {
            errMsg = detail;
          } else if (typeof detail === 'object' && detail) {
            errMsg = detail.message || detail.error || detail.title || c.bookingError;
          }
          toast.error(errMsg);
          setLoading(false);
          return;
        }

        // Confirm card setup with 3DS
        const { error: setupError, setupIntent } = await stripe.confirmCardSetup(
          setupData.clientSecret,
          { payment_method: { card: elements.getElement(CardElement) } }
        );
        if (setupError) {
          toast.error(setupError.message || c.cardError);
          setLoading(false);
          return;
        }
        cardId = setupIntent.payment_method;
      }

      // Step 4: Submit booking
      // C# expects tripType="distance" and destination as "lat,lng" coordinates
      const dropoffCoords = searchData.dropoffCoords;
      const destinationStr = dropoffCoords
        ? `${dropoffCoords.latitude},${dropoffCoords.longitude}`
        : searchData.dropoff || '';
      const bookingPayload = {
        startPointLatitude: searchData.pickupCoords.latitude,
        startPointLongitude: searchData.pickupCoords.longitude,
        clientPrice: selectedCar.price,
        startDate: formatDateForApi(searchData.date, searchData.time),
        startAddress: searchData.pickup,
        endAddress: searchData.dropoff || '',
        destination: destinationStr,
        tripType: 'distance',
        carType: selectedCar.tripType || '',
        distance: selectedCar.distance ? Math.round(selectedCar.distance) : 0,
        duration: selectedCar.duration ? Math.round(selectedCar.duration) : 0,
        cardId: cardId,
        utcOffset: new Date().getTimezoneOffset() * -1,
        endPointLatitude: dropoffCoords?.latitude,
        endPointLongitude: dropoffCoords?.longitude,
        email: form.email,
      };

      const result = await transferService.submitBooking(bookingPayload);
      completeBooking({ ...bookingPayload, result });

      // GTM dataLayer: fire taxi_reservation event on successful booking
      window.dataLayer = window.dataLayer || [];
      const conversionData = {
        'event': 'taxi_reservation',
        'value': parseFloat(selectedCar.price) || 0,
        'currency': 'EUR',
        'transaction_id': result?.id || result?.bookingId || `ZNT-${Date.now()}`
      };
      window.dataLayer.push(conversionData);

      // Google Ads Conversion tracking (direct)
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-1014783804/enucCIu7xZUcELy-8eMD',
          'value': parseFloat(selectedCar.price) || 0,
          'currency': 'EUR',
          'transaction_id': result?.id || result?.bookingId || `ZNT-${Date.now()}`
        });
      }
      console.log('[ZONT] Conversion fired:', JSON.stringify(conversionData));

      toast.success(c.bookingSuccess);
      setTimeout(() => navigate('/booking-confirmation'), 1500);
    } catch (err) {
      console.error('Checkout booking error:', err);
      const msg = err?.response?.data?.detail;
      if (typeof msg === 'object' && msg !== null) {
        const apiErrors = {};
        for (const [key, val] of Object.entries(msg)) {
          const v = Array.isArray(val) ? val[0] : (typeof val === 'string' ? val : JSON.stringify(val));
          if (key.includes('Email') || key.includes('UserName')) apiErrors.email = v;
          else if (key.includes('Phone')) apiErrors.phone = v;
          else if (key.includes('Password')) apiErrors.password = v;
          else apiErrors.general = v;
        }
        setErrors(apiErrors);
        const firstErr = Object.values(apiErrors)[0];
        toast.error(typeof firstErr === 'string' ? firstErr : c.bookingError);
      } else {
        // Show the actual error message from the C# API
        const errorText = typeof msg === 'string' ? msg : (err.message || c.bookingError);
        toast.error(errorText, { duration: 6000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = transferService.getVehicleImageUrl(selectedCar.imagePath);

  return (
    <form onSubmit={handleSubmit} data-testid="checkout-form" className="space-y-4">
      {/* Passenger Details (only if not authenticated) */}
      {!isAuthenticated && (
        <div className="bg-[#1e2d3d] border border-white/10 rounded-xl p-5" data-testid="passenger-details-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#2ecc71]" />
              {c.passengerTitle}
            </h2>
            <button
              type="button"
              onClick={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setErrors({}); }}
              className="text-xs text-[#2ecc71] hover:text-[#27ae60] transition-colors"
              data-testid="toggle-auth-mode"
            >
              {authMode === 'signup' ? c.alreadyAccount : c.noAccount}
            </button>
          </div>

          {authMode === 'signup' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">{c.firstName} *</label>
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                    placeholder={c.firstName} className={inputCls('firstName')} data-testid="passenger-firstname" />
                  {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">{c.lastName} *</label>
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                    placeholder={c.lastName} className={inputCls('lastName')} data-testid="passenger-lastname" />
                  {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">{c.email} *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="email@exemple.com" className={inputCls('email')} data-testid="passenger-email" />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">{c.phone} *</label>
                <PhoneInput
                  value={form.phone}
                  onChange={(e) => { setForm(prev => ({ ...prev, phone: e.target.value })); if (errors.phone) setErrors(prev => ({ ...prev, phone: null })); }}
                  onCountryChange={setPhoneCountry}
                  error={errors.phone}
                  darkMode={true}
                />
                {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                  {c.password} * <span className="text-gray-500 font-normal normal-case">({c.passwordHint})</span>
                </label>
                <input type="password" name="password" value={form.password} onChange={handleChange}
                  placeholder="Minimum 6 caracteres" className={inputCls('password')} data-testid="passenger-password" />
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">{c.email} *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="email@exemple.com" className={inputCls('email')} data-testid="signin-email" />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">{c.password} *</label>
                <input type="password" name="password" value={form.password} onChange={handleChange}
                  placeholder="Votre mot de passe" className={inputCls('password')} data-testid="signin-password" />
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
              </div>
            </div>
          )}

          {errors.general && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {errors.general}
            </div>
          )}
        </div>
      )}

      {/* Logged-in user info */}
      {isAuthenticated && user && (
        <div className="bg-[#1e2d3d] border border-white/10 rounded-xl p-4 flex items-center gap-3" data-testid="logged-user-info">
          <div className="w-10 h-10 bg-[#2ecc71]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-[#2ecc71]" />
          </div>
          <div>
            <p className="text-xs text-gray-400">{c.loggedAs}</p>
            <p className="text-sm text-white font-medium">{user.name || user.firstName || 'Utilisateur'}</p>
          </div>
          <CheckCircle className="w-5 h-5 text-[#2ecc71] ml-auto" />
        </div>
      )}

      {/* Payment */}
      <div className="bg-[#1e2d3d] border border-white/10 rounded-xl p-5" data-testid="payment-section">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#2ecc71]" />
          {c.payment}
        </h2>

        {/* Saved Cards */}
        {savedCards.length > 0 && (
          <div className="space-y-2.5 mb-4" data-testid="saved-cards-section">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{c.savedCards}</p>
            {savedCards.map((card) => (
              <div
                key={card.id}
                onClick={() => { setSelectedSavedCard(card.id); setUseNewCard(false); }}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedSavedCard === card.id && !useNewCard
                    ? 'border-[#2ecc71] bg-[#2ecc71]/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
                data-testid={`saved-card-${card.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                    selectedSavedCard === card.id && !useNewCard ? 'border-[#2ecc71]' : 'border-gray-500'
                  }`}>
                    {selectedSavedCard === card.id && !useNewCard && (
                      <div className="w-2 h-2 rounded-full bg-[#2ecc71]" />
                    )}
                  </div>
                  <span className="text-white text-sm font-medium">
                    {card.brand?.toUpperCase()} **** {card.last4}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {c.expires} {card.exp_month}/{card.exp_year}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }}
                  disabled={deletingCard === card.id}
                  className="text-gray-500 hover:text-red-400 transition p-1"
                  data-testid={`delete-card-${card.id}`}
                >
                  {deletingCard === card.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
            {/* Add new card option */}
            <div
              onClick={() => { setUseNewCard(true); setSelectedSavedCard(null); }}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                useNewCard ? 'border-[#2ecc71] bg-[#2ecc71]/10' : 'border-white/10 hover:border-white/20'
              }`}
              data-testid="use-new-card-btn"
            >
              <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                useNewCard ? 'border-[#2ecc71]' : 'border-gray-500'
              }`}>
                {useNewCard && <div className="w-2 h-2 rounded-full bg-[#2ecc71]" />}
              </div>
              <span className="text-gray-300 text-sm">+ {c.addNewCard}</span>
            </div>
          </div>
        )}

        {/* New Card form (always shown if no saved cards, or when "new card" selected) */}
        {(useNewCard || savedCards.length === 0) && (
          <>
            <div className="bg-[#0f1a28] rounded-lg p-4 border border-white/5">
              <CardElement options={cardStyle} onChange={(e) => setCardComplete(e.complete)} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>{c.trustItems[0]} - Stripe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 48 32" className="h-5 w-auto"><rect width="48" height="32" rx="4" fill="#1A1F71"/><path d="M19.5 21.5h-3.2l2-12.3h3.2l-2 12.3zm13.1-12-3 8.4-.4-1.8-1.1-5.7s-.1-.9-1.3-.9h-5l-.1.3s1.4.3 3 1.3l2.5 9.7h3.3l5.1-11.3h-3zm-6.3 12.3L24 13.5s-.2-.9-1.3-.9h-5l-.1.3s2.2.5 4.3 2.4l3.4 6.5zm-14.4-4.6l1.6-4.5.9 4.5h-2.5zm3.5 4.6h3l-2.6-12.3h-2.6c-1 0-1.2.8-1.2.8l-4.5 11.5h3.1l.6-1.7h3.8l.4 1.7z" fill="#fff"/></svg>
                <svg viewBox="0 0 48 32" className="h-5 w-auto"><rect width="48" height="32" rx="4" fill="#252525"/><circle cx="19" cy="16" r="9" fill="#EB001B"/><circle cx="29" cy="16" r="9" fill="#F79E1B"/><path d="M24 9.3a9 9 0 013 6.7 9 9 0 01-3 6.7 9 9 0 01-3-6.7 9 9 0 013-6.7z" fill="#FF5F00"/></svg>
              </div>
            </div>
            <p className="text-[11px] text-blue-300/70 mt-1.5">
              <Shield className="w-3 h-3 inline mr-1 -mt-0.5" />
              {c.secureNote}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">{c.cardNote}</p>
          </>
        )}
      </div>

      {/* Amount + Submit — compact on mobile */}
      <div className="bg-[#1e2d3d] border border-[#2ecc71]/30 rounded-xl p-3 flex items-center justify-between" data-testid="amount-summary">
        <div>
          <p className="text-sm text-gray-400">{c.amountCharged}</p>
          <p className="text-[11px] text-gray-500">{c.afterConfirmation}</p>
        </div>
        <p className="text-2xl font-extrabold text-[#2ecc71]">{selectedCar.price}&euro;</p>
      </div>

      <p className="text-[11px] text-gray-400 text-center leading-relaxed px-2" data-testid="card-explain">
        {c.cardExplain}
      </p>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !stripe || ((useNewCard || savedCards.length === 0) && !cardComplete) || (savedCards.length > 0 && !useNewCard && !selectedSavedCard)}
        className="w-full bg-[#2ecc71] text-white py-4 rounded-xl font-bold text-base hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
        data-testid="checkout-pay-btn"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> {c.processing}</>
        ) : (
          <><CreditCard className="w-5 h-5" /> {selectedSavedCard && !useNewCard ? c.payBtnSaved : c.payBtn}</>
        )}
      </button>
    </form>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { searchData, selectedCar } = useBooking();
  const { isAuthenticated, user, loginDirect } = useAuth();
  const { language } = useLanguage();
  const c = labels[language] || labels.en;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (searchData?.price) trackInitiateCheckout({ price: searchData.price, vehicle: searchData.vehicleName });
  }, []);

  if (!searchData || !selectedCar) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="checkout-empty">
        <SEO title={`${c.title} - Zont`} noindex />
        <Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-[#2ecc71]" />
            </div>
            <p className="text-white text-xl mb-4">{c.noData}</p>
            <button onClick={() => navigate('/')} className="bg-[#2ecc71] text-white px-6 py-3 rounded-lg hover:bg-[#27ae60]" data-testid="checkout-go-back">
              {c.goBack}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const imageUrl = transferService.getVehicleImageUrl(selectedCar.imagePath);
  const tripType = (selectedCar.tripType || '').trim();

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="checkout-page">
      <SEO title={`${c.title} - Zont`} noindex />
      <Header />

      <main className="flex-1 pt-16">
        {/* Steps */}
        <div className="bg-[#0f1419] border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-3.5">
            <div className="flex items-center justify-center gap-2 sm:gap-6">
              {[c.step1, c.step2, c.step3].map((step, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="w-8 sm:w-12 h-px bg-gray-700" />}
                  <div className={`flex items-center gap-1.5 ${i === 2 ? 'text-[#2ecc71]' : 'text-gray-500'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      i < 2 ? 'bg-[#2ecc71]/20 text-[#2ecc71]' : 'bg-[#2ecc71] text-white'
                    }`}>
                      {i < 2 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="text-xs font-medium hidden sm:inline">{step}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Back link */}
          <button
            onClick={() => navigate('/trip-recap')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-5"
            data-testid="checkout-back"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour au résumé
          </button>

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-6" data-testid="checkout-title">
            {c.title}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Trip Summary (sticky on desktop) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="lg:sticky lg:top-20">
                {/* Vehicle mini-card */}
                <div className="bg-[#1e2d3d] border border-white/10 rounded-xl overflow-hidden mb-4" data-testid="checkout-vehicle-card">
                  <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 flex items-center justify-center p-3">
                    {imageUrl ? (
                      <img src={imageUrl} alt={tripType} className="max-w-[200px] h-auto object-contain" loading="eager" />
                    ) : (
                      <Car className="w-12 h-12 text-gray-500" />
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{tripType}</h3>
                      {selectedCar.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{selectedCar.description} {c.orSimilar}</p>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#2ecc71] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">{c.from}</p>
                          <p className="text-white text-sm font-medium" data-testid="checkout-pickup">{searchData.pickup}</p>
                        </div>
                      </div>
                      {searchData.dropoff && (
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">{c.to}</p>
                            <p className="text-white text-sm font-medium" data-testid="checkout-dropoff">{searchData.dropoff}</p>
                          </div>
                        </div>
                      )}
                      {searchData.date && (
                        <div className="flex items-start gap-2.5">
                          <Calendar className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">{c.dateTime}</p>
                            <p className="text-white text-sm font-medium">{searchData.date} - {searchData.time}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-white">{c.total}</p>
                        <div className="text-right">
                          {selectedCar.originalPrice && selectedCar.originalPrice !== selectedCar.price && (
                            <p className="text-sm text-gray-500 line-through">{selectedCar.originalPrice}&euro;</p>
                          )}
                          <p className="text-2xl font-extrabold text-[#2ecc71]" data-testid="checkout-price">{selectedCar.price}&euro;</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{c.vatNote}</p>
                    </div>
                  </div>
                </div>

                {/* Trust items */}
                <div className="hidden lg:flex flex-col gap-2">
                  {c.trustItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#2ecc71]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Unified Auth + Payment Form */}
            <div className="lg:col-span-3">
              <Elements stripe={stripePromise}>
                <UnifiedCheckoutForm
                  searchData={searchData}
                  selectedCar={selectedCar}
                  c={c}
                  isAuthenticated={isAuthenticated}
                  user={user}
                  onLoginDirect={loginDirect}
                />
              </Elements>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
