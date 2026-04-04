import React, { useState, useEffect, useCallback } from 'react';
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
  CreditCard, MapPin, Calendar, Shield, CheckCircle,
  Loader2, User, ChevronLeft, Car, Plus, Trash2, X,
  ArrowRight, Mail, RefreshCw
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const STRIPE_PK = 'pk_live_lX3FXPqGIJLP5NgXomcdpcWO';
const stripePromise = loadStripe(STRIPE_PK);
const API = process.env.REACT_APP_BACKEND_URL;

const labels = {
  en: {
    title: 'Complete Your Booking',
    from: 'Pick-up', to: 'Drop-off', dateTime: 'Date & Time',
    total: 'Total', vatNote: 'All prices include VAT, fees and tolls.',
    payment: 'Payment', payBtn: 'Confirm & Pay', processing: 'Payment in progress...',
    noData: 'No booking data found', goBack: 'Start a new booking',
    trustItems: ['Secure payment', 'Fixed price guaranteed', 'Free cancellation 24h'],
    cardNote: 'Your card will be saved via Stripe, then charged for this ride.',
    step1: 'Account', step2: 'Verify', step3: 'Payment',
    cardError: 'Please check your card details.',
    bookingSuccess: 'Booking confirmed!', bookingError: 'Booking failed.',
    pastDateError: 'Date has passed.', passengerTitle: 'Passenger Details',
    firstName: 'First Name', lastName: 'Last Name', email: 'Email', phone: 'Phone',
    password: 'Password', passwordHint: 'To manage your booking',
    loggedAs: 'Logged in as',
    alreadyAccount: 'Already have an account?', signIn: 'Sign in',
    noAccount: 'New here?', signUp: 'Create account',
    loginError: 'Invalid credentials', orSimilar: 'or similar',
    savedCards: 'Saved Cards', addNewCard: 'Add a new card',
    addCardFirst: 'Add your card to proceed',
    cardAdded: 'Card added!', expires: 'Exp.', selectedCard: 'Selected',
    continueBtn: 'Continue', registeringMsg: 'Creating account...',
    loggingInMsg: 'Signing in...',
    verifyTitle: 'Verify your email',
    verifyDesc: 'We sent a verification link to',
    verifyAction: 'Click the link in the email, then press the button below.',
    verifyBtn: 'I verified my email',
    verifyChecking: 'Checking...',
    verifyResend: 'Resend email',
    verifyResent: 'Email resent!',
    verifyFailed: 'Email not yet verified. Check your inbox.',
    verifySuccess: 'Email verified!',
  },
  fr: {
    title: 'Finalisez Votre Reservation',
    from: 'Depart', to: 'Arrivee', dateTime: 'Date & Heure',
    total: 'Total', vatNote: 'Tous les prix incluent TVA, frais et peages.',
    payment: 'Paiement', payBtn: 'Confirmer & Payer', processing: 'Paiement en cours...',
    noData: 'Aucune reservation trouvee', goBack: 'Nouvelle recherche',
    trustItems: ['Paiement securise', 'Prix fixe garanti', 'Annulation gratuite 24h'],
    cardNote: 'Votre carte sera enregistree via Stripe, puis debitee pour cette course.',
    step1: 'Compte', step2: 'Verification', step3: 'Paiement',
    cardError: 'Veuillez verifier vos informations de carte.',
    bookingSuccess: 'Reservation confirmee !', bookingError: 'Erreur. Reessayez.',
    pastDateError: 'La date est passee.', passengerTitle: 'Informations Passager',
    firstName: 'Prenom', lastName: 'Nom', email: 'Email', phone: 'Telephone',
    password: 'Mot de passe', passwordHint: 'Pour gerer votre reservation',
    loggedAs: 'Connecte en tant que',
    alreadyAccount: 'Deja un compte ?', signIn: 'Se connecter',
    noAccount: 'Nouveau ?', signUp: 'Creer un compte',
    loginError: 'Identifiants incorrects', orSimilar: 'ou similaire',
    savedCards: 'Cartes enregistrees', addNewCard: 'Ajouter une carte',
    addCardFirst: 'Ajoutez votre carte pour continuer',
    cardAdded: 'Carte ajoutee !', expires: 'Exp.', selectedCard: 'Selectionnee',
    continueBtn: 'Continuer', registeringMsg: 'Creation du compte...',
    loggingInMsg: 'Connexion...',
    verifyTitle: 'Verifiez votre email',
    verifyDesc: 'Nous avons envoye un lien de verification a',
    verifyAction: 'Cliquez sur le lien dans l\'email, puis appuyez ci-dessous.',
    verifyBtn: 'J\'ai verifie mon email',
    verifyChecking: 'Verification...',
    verifyResend: 'Renvoyer l\'email',
    verifyResent: 'Email renvoye !',
    verifyFailed: 'Email pas encore verifie. Verifiez votre boite.',
    verifySuccess: 'Email verifie !',
  },
  ru: {
    title: 'Завершите Бронирование', from: 'Откуда', to: 'Куда', dateTime: 'Дата и Время',
    total: 'Итого', vatNote: 'Все цены включают НДС.', payment: 'Оплата',
    payBtn: 'Подтвердить', processing: 'Оплата...', noData: 'Не найдено', goBack: 'Поиск',
    trustItems: ['Безопасно', 'Фикс. цена', 'Отмена 24ч'],
    cardNote: 'Карта сохранена через Stripe.', step1: 'Аккаунт', step2: 'Проверка', step3: 'Оплата',
    cardError: 'Проверьте карту.', bookingSuccess: 'Забронировано!', bookingError: 'Ошибка.',
    pastDateError: 'Дата прошла.', passengerTitle: 'Пассажир',
    firstName: 'Имя', lastName: 'Фамилия', email: 'Email', phone: 'Телефон',
    password: 'Пароль', passwordHint: 'Для управления', loggedAs: 'Вы:',
    alreadyAccount: 'Есть аккаунт?', signIn: 'Войти', noAccount: 'Новый?', signUp: 'Создать',
    loginError: 'Ошибка', orSimilar: 'или аналог', savedCards: 'Карты', addNewCard: 'Добавить',
    addCardFirst: 'Добавьте карту', cardAdded: 'Добавлено!', expires: 'До',
    selectedCard: 'Выбрано', continueBtn: 'Далее', registeringMsg: 'Создание...',
    loggingInMsg: 'Вход...', verifyTitle: 'Подтвердите email',
    verifyDesc: 'Мы отправили ссылку на', verifyAction: 'Нажмите ссылку в письме.',
    verifyBtn: 'Я подтвердил', verifyChecking: 'Проверка...', verifyResend: 'Повторить',
    verifyResent: 'Отправлено!', verifyFailed: 'Не подтверждено.', verifySuccess: 'Подтверждено!',
  },
  hy: {
    title: 'Delays', from: 'Delays', to: 'Delays', dateTime: 'Delays', total: 'Delays',
    vatNote: 'Delays.', payment: 'Delays', payBtn: 'Delays', processing: 'Delays...',
    noData: 'Delays', goBack: 'Delays', trustItems: ['Delays', 'Delays', 'Delays'],
    cardNote: 'Delays.', step1: 'Delays', step2: 'Delays', step3: 'Delays',
    cardError: 'Delays.', bookingSuccess: 'Delays!', bookingError: 'Delays.', pastDateError: 'Delays.',
    passengerTitle: 'Delays', firstName: 'Delays', lastName: 'Delays', email: 'Email',
    phone: 'Delays', password: 'Delays', passwordHint: 'Delays', loggedAs: 'Delays',
    alreadyAccount: 'Delays?', signIn: 'Delays', noAccount: 'Delays?', signUp: 'Delays',
    loginError: 'Delays', orSimilar: 'Delays', savedCards: 'Delays', addNewCard: 'Delays',
    addCardFirst: 'Delays', cardAdded: 'Delays!', expires: 'Delays', selectedCard: 'Delays',
    continueBtn: 'Delays', registeringMsg: 'Delays...', loggingInMsg: 'Delays...',
    verifyTitle: 'Delays', verifyDesc: 'Delays', verifyAction: 'Delays.',
    verifyBtn: 'Delays', verifyChecking: 'Delays...', verifyResend: 'Delays',
    verifyResent: 'Delays!', verifyFailed: 'Delays.', verifySuccess: 'Delays!',
  },
};

const cardElementStyle = {
  style: {
    base: { color: '#ffffff', fontFamily: 'system-ui, sans-serif', fontSize: '16px', '::placeholder': { color: '#6b7280' } },
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
  return countryCode + (cleaned.startsWith('0') ? cleaned.slice(1) : cleaned);
};

const xhrReq = (method, url, headers, body) => {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open(method, url);
    if (headers) Object.entries(headers).forEach(([k, v]) => x.setRequestHeader(k, v));
    x.onload = () => {
      let data; try { data = JSON.parse(x.responseText); } catch { data = {}; }
      resolve({ ok: x.status >= 200 && x.status < 300, status: x.status, data });
    };
    x.onerror = () => reject(new Error('Network error'));
    x.send(body || null);
  });
};

const brandIcons = { visa: { label: 'VISA', bg: 'bg-blue-600' }, mastercard: { label: 'MC', bg: 'bg-red-600' }, amex: { label: 'AMEX', bg: 'bg-gray-600' } };

// Check JWT for NotVerified role
const isTokenVerified = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return !roleArray.includes('NotVerified');
  } catch { return false; }
};

/* ─── Card Manager ─── */
const CardManager = ({ selectedCardId, onSelectCard, onCardsLoaded, c }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const token = localStorage.getItem('auth_token');

  const fetchCards = useCallback(async () => {
    if (!token) { setLoadingCards(false); return; }
    try {
      const res = await xhrReq('GET', `${API}/api/proxy/client/cards`, { Authorization: `Bearer ${token}` });
      const list = (res.ok && Array.isArray(res.data)) ? res.data : [];
      setCards(list); onCardsLoaded(list);
      if (list.length > 0 && !selectedCardId) onSelectCard(list[0].id);
      if (list.length === 0) setShowAddForm(true);
    } catch { setCards([]); onCardsLoaded([]); setShowAddForm(true); }
    finally { setLoadingCards(false); }
  }, [token]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !cardComplete) return;
    setAddingCard(true);
    try {
      const setupRes = await xhrReq('GET', `${API}/api/proxy/client/add-card`, { Authorization: `Bearer ${token}` });
      if (!setupRes.ok || !setupRes.data?.clientSecret) { toast.error('Erreur SetupIntent.'); setAddingCard(false); return; }
      const { error } = await stripe.confirmCardSetup(setupRes.data.clientSecret, { payment_method: { card: elements.getElement(CardElement) } });
      if (error) { toast.error(error.message || c.cardError); setAddingCard(false); return; }
      toast.success(c.cardAdded);
      setShowAddForm(false); setCardComplete(false);
      await fetchCards();
    } catch (err) { toast.error(err.message || c.bookingError); }
    finally { setAddingCard(false); }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Supprimer cette carte ?')) return;
    setDeletingId(cardId);
    try {
      const res = await xhrReq('DELETE', `${API}/api/proxy/client/cards/${cardId}`, { Authorization: `Bearer ${token}` });
      if (res.ok) { toast.success('Carte supprimee'); if (selectedCardId === cardId) onSelectCard(null); await fetchCards(); }
      else toast.error('Impossible de supprimer');
    } catch { toast.error('Erreur reseau'); }
    finally { setDeletingId(null); }
  };

  if (loadingCards) return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#2ecc71]" /></div>;

  return (
    <div className="space-y-3" data-testid="card-manager">
      {cards.length > 0 && (
        <div className="space-y-2" data-testid="saved-cards-list">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{c.savedCards}</p>
          {cards.map((card) => {
            const brand = brandIcons[card.brand] || { label: card.brand?.toUpperCase() || '?', bg: 'bg-gray-600' };
            const sel = selectedCardId === card.id;
            return (
              <div key={card.id} data-testid={`card-${card.last4}`}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${sel ? 'border-[#2ecc71] bg-[#2ecc71]/10' : 'border-white/10 bg-[#0f1a28] hover:border-white/20'}`}
                onClick={() => onSelectCard(card.id)}>
                <div className={`${brand.bg} px-2 py-1 rounded text-[10px] font-bold text-white`}>{brand.label}</div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">**** **** **** {card.last4}</p>
                  <p className="text-xs text-gray-500">{c.expires} {card.exp_month}/{card.exp_year}</p>
                </div>
                {sel && <span className="text-xs text-[#2ecc71] font-medium flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> {c.selectedCard}</span>}
                <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }}
                  disabled={deletingId === card.id} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  data-testid={`delete-card-${card.last4}`}>
                  {deletingId === card.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {!showAddForm ? (
        <button type="button" onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/20 rounded-lg text-sm text-gray-400 hover:text-[#2ecc71] hover:border-[#2ecc71]/40 transition-all"
          data-testid="add-new-card-btn"><Plus className="w-4 h-4" /> {c.addNewCard}</button>
      ) : (
        <div className="border border-white/10 rounded-lg p-4 bg-[#0f1a28] space-y-3" data-testid="add-card-form">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{c.addNewCard}</p>
            {cards.length > 0 && <button type="button" onClick={() => { setShowAddForm(false); setCardComplete(false); }} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>}
          </div>
          <div className="bg-[#1a2332] rounded-lg p-4 border border-white/5">
            <CardElement options={cardElementStyle} onChange={(e) => setCardComplete(e.complete)} />
          </div>
          <p className="text-[11px] text-gray-500">Verification 0 EUR — aucun debit</p>
          <button type="button" onClick={handleAddCard} disabled={addingCard || !cardComplete || !stripe}
            className="w-full py-2.5 bg-[#2ecc71] text-white rounded-lg text-sm font-semibold hover:bg-[#27ae60] transition-all disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="confirm-add-card-btn">
            {addingCard ? <><Loader2 className="w-4 h-4 animate-spin" /> Verification...</> : <><CreditCard className="w-4 h-4" /> {c.addNewCard}</>}
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 text-gray-500 text-xs"><Shield className="w-3.5 h-3.5" /><span>{c.trustItems[0]} - Stripe</span></div>
    </div>
  );
};

/* ─── Checkout Form (3 steps: Auth → Verify → Pay) ─── */
const CheckoutForm = ({ searchData, selectedCar, c, isAuthenticated, user, onLoginDirect }) => {
  const navigate = useNavigate();
  const { completeBooking } = useBooking();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Step tracking: 'auth' | 'verify' | 'payment'
  const [step, setStep] = useState(() => {
    if (isAuthenticated && isTokenVerified()) return 'payment';
    if (isAuthenticated) return 'verify';
    return 'auth';
  });

  const [authMode, setAuthMode] = useState('signup');
  const [phoneCountry, setPhoneCountry] = useState('+33');
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const inputCls = (field) =>
    `w-full px-4 py-3 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm ${errors[field] ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-[#2ecc71]'}`;

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
    else if (authMode === 'signup' && form.password.length < 6) errs.password = 'Min. 6 caracteres';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* Step 1: Register/Login */
  const handleAuth = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const formatted = formatPhone(form.phone, phoneCountry);
        await authService.register({
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, phoneNumber: formatted,
          password: form.password, gender: 'male',
        });
        const loginResult = await authService.login({ email: form.email, password: form.password });
        onLoginDirect(loginResult.user);
        try { await authService.sendVerificationEmail(form.email); } catch {}
        // New signup → always need verification
        setStep('verify');
      } else {
        const loginResult = await authService.login({ email: form.email, password: form.password });
        onLoginDirect(loginResult.user);
        // Existing user — check if already verified
        if (isTokenVerified()) {
          setStep('payment');
        } else {
          // Send verification email for unverified existing user
          try { await authService.sendVerificationEmail(form.email); } catch {}
          setStep('verify');
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.detail;
      if (typeof msg === 'object' && msg !== null) {
        const apiErrors = {};
        for (const [key, val] of Object.entries(msg)) {
          const v = Array.isArray(val) ? val[0] : val;
          if (key.includes('Email') || key.includes('UserName')) apiErrors.email = v;
          else if (key.includes('Phone')) apiErrors.phone = v;
          else if (key.includes('Password')) apiErrors.password = v;
          else apiErrors.general = v;
        }
        setErrors(apiErrors);
        toast.error(Object.values(apiErrors)[0] || c.loginError);
      } else {
        toast.error(typeof msg === 'string' ? msg : (err.message || c.loginError));
      }
    } finally { setAuthLoading(false); }
  };

  /* Step 2: Check verification */
  const handleCheckVerification = async () => {
    setVerifyLoading(true);
    try {
      // Re-login to get fresh token
      const loginResult = await authService.login({ email: form.email, password: form.password });
      onLoginDirect(loginResult.user);
      if (isTokenVerified()) {
        toast.success(c.verifySuccess);
        setStep('payment');
      } else {
        toast.error(c.verifyFailed);
      }
    } catch {
      toast.error(c.loginError);
    } finally { setVerifyLoading(false); }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await authService.sendVerificationEmail(form.email);
      toast.success(c.verifyResent);
    } catch {}
    finally { setResending(false); }
  };

  /* Step 3: Submit Booking */
  const handlePay = async (e) => {
    e.preventDefault();
    if (!selectedCardId) { toast.error(c.addCardFirst); return; }
    if (searchData.date && searchData.time) {
      const bookingDate = new Date(`${searchData.date}T${searchData.time}`);
      if (bookingDate <= new Date()) { toast.error(c.pastDateError); return; }
    }
    setLoading(true);
    try {
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
        cardId: selectedCardId,
        utcOffset: new Date().getTimezoneOffset() * -1,
      };

      const result = await transferService.submitBooking(bookingPayload);

      if (result?.requiresAction && result?.clientSecret) {
        const stripeInstance = await stripePromise;
        const { error: confirmErr } = await stripeInstance.confirmCardPayment(result.clientSecret);
        if (confirmErr) { toast.error(confirmErr.message || 'Erreur 3D Secure'); setLoading(false); return; }
      }

      completeBooking({ ...bookingPayload, result });
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'taxi_reservation', value: parseFloat(selectedCar.price) || 0,
        currency: 'EUR', transaction_id: result?.id || result?.data?.id || `ZNT-${Date.now()}`
      });
      toast.success(c.bookingSuccess);
      setTimeout(() => navigate('/booking-confirmation'), 1500);
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.message || c.bookingError, { duration: 6000 });
    } finally { setLoading(false); }
  };

  // Determine active step index for stepper
  const stepIdx = step === 'auth' ? 0 : step === 'verify' ? 1 : 2;

  return (
    <div className="space-y-5">
      {/* ─── Step 1: Auth ─── */}
      {step === 'auth' && (
        <form onSubmit={handleAuth} data-testid="checkout-auth-form" className="space-y-5">
          <div className="bg-[#1e2d3d] border border-white/10 rounded-xl p-5" data-testid="passenger-details-section">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#2ecc71]" /> {c.passengerTitle}
              </h2>
              <button type="button" onClick={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setErrors({}); }}
                className="text-xs text-[#2ecc71] hover:text-[#27ae60]" data-testid="toggle-auth-mode">
                {authMode === 'signup' ? c.alreadyAccount : c.noAccount}
              </button>
            </div>
            {authMode === 'signup' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">{c.firstName} *</label>
                    <input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder={c.firstName} className={inputCls('firstName')} data-testid="passenger-firstname" />
                    {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>}</div>
                  <div><label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">{c.lastName} *</label>
                    <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder={c.lastName} className={inputCls('lastName')} data-testid="passenger-lastname" />
                    {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>}</div>
                </div>
                <div><label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">{c.email} *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@exemple.com" className={inputCls('email')} data-testid="passenger-email" />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}</div>
                <div><label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">{c.phone} *</label>
                  <PhoneInput value={form.phone} onChange={(e) => { setForm(prev => ({ ...prev, phone: e.target.value })); if (errors.phone) setErrors(prev => ({ ...prev, phone: null })); }}
                    onCountryChange={setPhoneCountry} error={errors.phone} darkMode={true} />
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}</div>
                <div><label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">{c.password} * <span className="text-gray-500 font-normal normal-case">({c.passwordHint})</span></label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Minimum 6 caracteres" className={inputCls('password')} data-testid="passenger-password" />
                  {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}</div>
              </div>
            ) : (
              <div className="space-y-3">
                <div><label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">{c.email} *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@exemple.com" className={inputCls('email')} data-testid="signin-email" />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}</div>
                <div><label className="block text-xs font-semibold text-gray-400 mb-1 uppercase">{c.password} *</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Votre mot de passe" className={inputCls('password')} data-testid="signin-password" />
                  {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}</div>
              </div>
            )}
            {errors.general && <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{errors.general}</div>}
          </div>
          <button type="submit" disabled={authLoading}
            className="w-full bg-[#2ecc71] text-white py-4 rounded-xl font-bold text-base hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
            data-testid="checkout-continue-btn">
            {authLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> {authMode === 'signup' ? c.registeringMsg : c.loggingInMsg}</> : <>{c.continueBtn} <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>
      )}

      {/* ─── Step 2: Email Verification ─── */}
      {step === 'verify' && (
        <div className="space-y-5" data-testid="checkout-verify-section">
          <div className="bg-[#1e2d3d] border border-white/10 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-[#2ecc71]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#2ecc71]" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">{c.verifyTitle}</h2>
            <p className="text-sm text-gray-400 mb-1">{c.verifyDesc}</p>
            <p className="text-sm text-[#2ecc71] font-semibold mb-4" data-testid="verify-email-display">{form.email}</p>
            <p className="text-xs text-gray-500 mb-6">{c.verifyAction}</p>

            <button onClick={handleCheckVerification} disabled={verifyLoading}
              className="w-full bg-[#2ecc71] text-white py-3.5 rounded-xl font-bold text-base hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 mb-3"
              data-testid="checkout-verify-btn">
              {verifyLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> {c.verifyChecking}</> : <><CheckCircle className="w-5 h-5" /> {c.verifyBtn}</>}
            </button>

            <button onClick={handleResendEmail} disabled={resending}
              className="text-sm text-gray-400 hover:text-[#2ecc71] transition-colors flex items-center justify-center gap-1.5 mx-auto"
              data-testid="checkout-resend-btn">
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              {resending ? '...' : c.verifyResend}
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3: Card + Pay ─── */}
      {step === 'payment' && (
        <div className="space-y-5" data-testid="checkout-payment-section">
          <div className="bg-[#1e2d3d] border border-white/10 rounded-xl p-4 flex items-center gap-3" data-testid="logged-user-info">
            <div className="w-10 h-10 bg-[#2ecc71]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-[#2ecc71]" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{c.loggedAs}</p>
              <p className="text-sm text-white font-medium">{user?.name || user?.firstName || form.firstName || 'Utilisateur'}</p>
            </div>
            <CheckCircle className="w-5 h-5 text-[#2ecc71] ml-auto" />
          </div>

          <div className="bg-[#1e2d3d] border border-white/10 rounded-xl p-5" data-testid="payment-section">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#2ecc71]" /> {c.payment}
            </h2>
            <CardManager selectedCardId={selectedCardId} onSelectCard={setSelectedCardId} onCardsLoaded={() => {}} c={c} />
          </div>

          <button onClick={handlePay} disabled={loading || !selectedCardId}
            className="w-full bg-[#2ecc71] text-white py-4 rounded-xl font-bold text-base hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
            data-testid="checkout-pay-btn">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {c.processing}</> : <>{c.payBtn} - {selectedCar.price}&euro;</>}
          </button>
        </div>
      )}
    </div>
  );
};

/* ─── Page ─── */
const Checkout = () => {
  const navigate = useNavigate();
  const { searchData, selectedCar } = useBooking();
  const { isAuthenticated, user, loginDirect } = useAuth();
  const { language } = useLanguage();
  const c = labels[language] || labels.en;

  // Determine active step
  const currentStep = !isAuthenticated ? 0 : !isTokenVerified() ? 1 : 2;

  if (!searchData || !selectedCar) {
    return (
      <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="checkout-empty">
        <SEO title={`${c.title} - Zont`} noindex /><Header />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6"><Car className="w-10 h-10 text-[#2ecc71]" /></div>
            <p className="text-white text-xl mb-4">{c.noData}</p>
            <button onClick={() => navigate('/')} className="bg-[#2ecc71] text-white px-6 py-3 rounded-lg hover:bg-[#27ae60]" data-testid="checkout-go-back">{c.goBack}</button>
          </div>
        </main><Footer />
      </div>
    );
  }

  const imageUrl = transferService.getVehicleImageUrl(selectedCar.imagePath);
  const tripType = (selectedCar.tripType || '').trim();

  return (
    <div className="min-h-screen flex flex-col bg-[#1a2332]" data-testid="checkout-page">
      <SEO title={`${c.title} - Zont`} noindex /><Header />
      <main className="flex-1 pt-16">
        {/* Steps */}
        <div className="bg-[#0f1419] border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-3.5">
            <div className="flex items-center justify-center gap-2 sm:gap-6">
              {[c.step1, c.step2, c.step3].map((stepLabel, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="w-8 sm:w-12 h-px bg-gray-700" />}
                  <div className={`flex items-center gap-1.5 ${i === currentStep ? 'text-[#2ecc71]' : i < currentStep ? 'text-[#2ecc71]/60' : 'text-gray-500'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      i < currentStep ? 'bg-[#2ecc71]/20 text-[#2ecc71]' : i === currentStep ? 'bg-[#2ecc71] text-white' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="text-xs font-medium hidden sm:inline">{stepLabel}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-5" data-testid="checkout-back">
            <ChevronLeft className="w-4 h-4" /> Retour
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-6" data-testid="checkout-title">{c.title}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Summary */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-20">
                <div className="bg-[#1e2d3d] border border-white/10 rounded-xl overflow-hidden mb-4" data-testid="checkout-vehicle-card">
                  <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 flex items-center justify-center p-3">
                    {imageUrl ? <img src={imageUrl} alt={tripType} className="max-w-[200px] h-auto object-contain" /> : <Car className="w-12 h-12 text-gray-500" />}
                  </div>
                  <div className="p-4 space-y-3">
                    <div><h3 className="text-base font-bold text-white">{tripType}</h3>
                      {selectedCar.description && <p className="text-xs text-gray-400 mt-0.5">{selectedCar.description} {c.orSimilar}</p>}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 text-[#2ecc71] mt-0.5 flex-shrink-0" /><div><p className="text-xs text-gray-500">{c.from}</p><p className="text-white text-sm font-medium" data-testid="checkout-pickup">{searchData.pickup}</p></div></div>
                      {searchData.dropoff && <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /><div><p className="text-xs text-gray-500">{c.to}</p><p className="text-white text-sm font-medium" data-testid="checkout-dropoff">{searchData.dropoff}</p></div></div>}
                      {searchData.date && <div className="flex items-start gap-2.5"><Calendar className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" /><div><p className="text-xs text-gray-500">{c.dateTime}</p><p className="text-white text-sm font-medium">{searchData.date} - {searchData.time}</p></div></div>}
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-white">{c.total}</p>
                        <p className="text-2xl font-extrabold text-[#2ecc71]" data-testid="checkout-price">{selectedCar.price}&euro;</p>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{c.vatNote}</p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex flex-col gap-2">
                  {c.trustItems.map((item, i) => <div key={i} className="flex items-center gap-2 text-gray-400 text-sm"><CheckCircle className="w-4 h-4 text-[#2ecc71]" /><span>{item}</span></div>)}
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <Elements stripe={stripePromise}>
                <CheckoutForm searchData={searchData} selectedCar={selectedCar} c={c} isAuthenticated={isAuthenticated} user={user} onLoginDirect={loginDirect} />
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
