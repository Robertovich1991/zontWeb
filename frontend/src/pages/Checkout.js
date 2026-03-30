import React, { useState } from 'react';
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
import {
  CreditCard, MapPin, Calendar, Clock, Shield, CheckCircle,
  Loader2, User, Mail, Lock, Phone, ChevronLeft, ArrowRight, Car
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
    payment: 'Payment', payBtn: 'Confirm & Pay',
    processing: 'Processing...',
    noData: 'No booking data found', goBack: 'Start a new booking',
    trustItems: ['Secure payment', 'Fixed price guaranteed', 'Free cancellation 24h'],
    step1: 'Vehicle', step2: 'Summary', step3: 'Payment',
    cardError: 'Please check your card details.',
    bookingSuccess: 'Booking confirmed! Your ride has been reserved.',
    bookingError: 'Booking failed. Please try again.',
    pastDateError: 'The booking date has passed. Please choose a future date.',
    passengerTitle: 'Passenger Details',
    firstName: 'First Name', lastName: 'Last Name',
    email: 'Email', phone: 'Phone',
    password: 'Password', passwordHint: 'To manage your booking',
    loggedAs: 'Logged in as',
    alreadyAccount: 'Already have an account?', signIn: 'Sign in',
    noAccount: 'New here?', signUp: 'Create account',
    loginError: 'Invalid credentials',
    orSimilar: 'or similar',
  },
  fr: {
    title: 'Finalisez Votre Reservation',
    summary: 'Resume du Trajet',
    from: 'Depart', to: 'Arrivee',
    dateTime: 'Date & Heure', vehicle: 'Vehicule',
    total: 'Total', vatNote: 'Tous les prix incluent TVA, frais et peages.',
    payment: 'Paiement', payBtn: 'Confirmer & Payer',
    processing: 'Traitement en cours...',
    noData: 'Aucune reservation trouvee', goBack: 'Nouvelle recherche',
    trustItems: ['Paiement securise', 'Prix fixe garanti', 'Annulation gratuite 24h'],
    step1: 'Vehicule', step2: 'Resume', step3: 'Paiement',
    cardError: 'Veuillez verifier vos informations de carte.',
    bookingSuccess: 'Reservation confirmee ! Votre course a ete reservee.',
    bookingError: 'Erreur lors de la reservation. Veuillez reessayer.',
    pastDateError: 'La date de reservation est passee. Veuillez choisir une date future.',
    passengerTitle: 'Informations Passager',
    firstName: 'Prenom', lastName: 'Nom',
    email: 'Email', phone: 'Telephone',
    password: 'Mot de passe', passwordHint: 'Pour gerer votre reservation',
    loggedAs: 'Connecte en tant que',
    alreadyAccount: 'Deja un compte ?', signIn: 'Se connecter',
    noAccount: 'Nouveau ?', signUp: 'Creer un compte',
    loginError: 'Identifiants incorrects',
    orSimilar: 'ou similaire',
  },
  ru: {
    title: 'Завершите Бронирование',
    summary: 'Информация о Поездке',
    from: 'Откуда', to: 'Куда',
    dateTime: 'Дата и Время', vehicle: 'Автомобиль',
    total: 'Итого', vatNote: 'Все цены включают НДС и сборы.',
    payment: 'Оплата', payBtn: 'Подтвердить и Оплатить',
    processing: 'Обработка...',
    noData: 'Данные не найдены', goBack: 'Новый поиск',
    trustItems: ['Безопасный платеж', 'Фикс. цена', 'Бесплатная отмена 24ч'],
    step1: 'Авто', step2: 'Детали', step3: 'Оплата',
    cardError: 'Проверьте данные карты.',
    bookingSuccess: 'Бронирование подтверждено!',
    bookingError: 'Ошибка. Попробуйте снова.',
    pastDateError: 'Дата прошла.',
    passengerTitle: 'Данные Пассажира',
    firstName: 'Имя', lastName: 'Фамилия',
    email: 'Email', phone: 'Телефон',
    password: 'Пароль', passwordHint: 'Для управления бронированием',
    loggedAs: 'Вы вошли как',
    alreadyAccount: 'Уже есть аккаунт?', signIn: 'Войти',
    noAccount: 'Новый?', signUp: 'Создать аккаунт',
    loginError: 'Неверные данные',
    orSimilar: 'или аналог',
  },
  hy: {
    title: ' Delays',
    summary: 'Delays',
    from: 'Delays', to: 'Delays',
    dateTime: 'Delays', vehicle: 'Delays',
    total: 'Delays', vatNote: 'Delays.',
    payment: 'Delays', payBtn: 'Delays',
    processing: 'Delays...',
    noData: 'Delays', goBack: 'Delays',
    trustItems: ['Delays', 'Delays', 'Delays'],
    step1: 'Delays', step2: 'Delays', step3: 'Delays',
    cardError: 'Delays.',
    bookingSuccess: 'Delays!',
    bookingError: 'Delays.',
    pastDateError: 'Delays.',
    passengerTitle: 'Delays',
    firstName: 'Delays', lastName: 'Delays',
    email: 'Email', phone: 'Delays',
    password: 'Delays', passwordHint: 'Delays',
    loggedAs: 'Delays',
    alreadyAccount: 'Delays?', signIn: 'Delays',
    noAccount: 'Delays?', signUp: 'Delays',
    loginError: 'Delays',
    orSimilar: 'Delays',
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
  if (!date || !time) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year} ${time}:00`;
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

      // Step 2: Get SetupIntent for 3DS
      const token = localStorage.getItem('auth_token');
      const setupResp = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/proxy/booking/setup-intent`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const setupData = await setupResp.json();
      if (!setupResp.ok || !setupData.clientSecret) {
        toast.error(setupData?.detail || c.bookingError);
        setLoading(false);
        return;
      }

      // Step 3: Confirm card setup with 3DS
      const { error: setupError, setupIntent } = await stripe.confirmCardSetup(
        setupData.clientSecret,
        { payment_method: { card: elements.getElement(CardElement) } }
      );
      if (setupError) {
        toast.error(setupError.message || c.cardError);
        setLoading(false);
        return;
      }

      // Step 4: Submit booking
      const bookingPayload = {
        startPointLatitude: searchData.pickupCoords.latitude,
        startPointLongitude: searchData.pickupCoords.longitude,
        clientPrice: selectedCar.price,
        startDate: formatDateForApi(searchData.date, searchData.time),
        startAddress: searchData.pickup,
        endAddress: searchData.dropoff || '',
        destination: searchData.dropoff || '',
        tripType: searchData.tripType === 'hourly' ? 'Hourly' : 'Transfer',
        carType: selectedCar.tripType || '',
        distance: selectedCar.distance ? Math.round(selectedCar.distance) : 0,
        duration: selectedCar.duration ? Math.round(selectedCar.duration) : 0,
        cardId: setupIntent.payment_method,
        utcOffset: new Date().getTimezoneOffset() * -1,
      };

      const result = await transferService.submitBooking(bookingPayload);
      completeBooking({ ...bookingPayload, result });
      toast.success(c.bookingSuccess);
      setTimeout(() => navigate('/booking-confirmation'), 1500);
    } catch (err) {
      const msg = err?.response?.data?.detail;
      if (typeof msg === 'object') {
        const apiErrors = {};
        for (const [key, val] of Object.entries(msg)) {
          const v = Array.isArray(val) ? val[0] : val;
          if (key.includes('Email') || key.includes('UserName')) apiErrors.email = v;
          else if (key.includes('Phone')) apiErrors.phone = v;
          else if (key.includes('Password')) apiErrors.password = v;
          else apiErrors.general = v;
        }
        setErrors(apiErrors);
        toast.error(Object.values(apiErrors)[0] || c.bookingError);
      } else {
        toast.error(typeof msg === 'string' ? msg : (err.message || c.bookingError));
      }
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = transferService.getVehicleImageUrl(selectedCar.imagePath);

  return (
    <form onSubmit={handleSubmit} data-testid="checkout-form" className="space-y-5">
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
        <div className="bg-[#0f1a28] rounded-lg p-4 border border-white/5">
          <CardElement options={cardStyle} onChange={(e) => setCardComplete(e.complete)} />
        </div>
        <div className="flex items-center gap-2 mt-3 text-gray-400 text-xs">
          <Shield className="w-3.5 h-3.5" />
          <span>{c.trustItems[0]} - Stripe</span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !stripe || !cardComplete}
        className="w-full bg-[#2ecc71] text-white py-4 rounded-xl font-bold text-base hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
        data-testid="checkout-pay-btn"
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> {c.processing}</>
        ) : (
          <>{c.payBtn} - {selectedCar.price}&euro;</>
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
            Retour au resume
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
