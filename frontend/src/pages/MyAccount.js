import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Header from '../components/layout/Header';
import { toast } from 'sonner';
import { User, Mail, Phone, CreditCard, Calendar, Car, Navigation, Loader2, Shield, Plus, Trash2, X, CheckCircle, XCircle, PhoneCall, MapPin, Clock, LogOut, ChevronRight } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK || 'pk_live_lX3FXPqGIJLP5NgXomcdpcWO');

const FONT = "font-['Manrope',sans-serif]";

const cardStyle = {
  style: {
    base: { color: '#f8fafc', fontSize: '16px', fontFamily: 'Manrope, sans-serif', '::placeholder': { color: '#64748b' }, iconColor: '#c8a951' },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
};

// XHR wrapper to avoid Stripe.js body stream conflict
const xhr = (method, url, headers, body) => {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open(method, url);
    Object.entries(headers).forEach(([k, v]) => x.setRequestHeader(k, v));
    x.onload = () => {
      let data; try { data = JSON.parse(x.responseText); } catch { data = {}; }
      resolve({ ok: x.status >= 200 && x.status < 300, data });
    };
    x.onerror = () => reject(new Error('Erreur reseau'));
    x.send(body || null);
  });
};

const brandConfig = {
  visa: { label: 'VISA', gradient: 'from-blue-700 to-blue-900' },
  mastercard: { label: 'MC', gradient: 'from-red-700 to-orange-800' },
  amex: { label: 'AMEX', gradient: 'from-slate-600 to-slate-800' },
  discover: { label: 'DISC', gradient: 'from-orange-600 to-orange-800' },
};

const AddCardInline = ({ token, onDone, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !complete) return;
    setLoading(true);
    try {
      const setup = await xhr('GET', `${API}/api/proxy/client/add-card`, { Authorization: `Bearer ${token}` });
      if (!setup.ok || !setup.data.clientSecret) { toast.error('Erreur SetupIntent'); setLoading(false); return; }
      const { error } = await stripe.confirmCardSetup(setup.data.clientSecret, { payment_method: { card: elements.getElement(CardElement) } });
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success('Carte ajoutee avec succes');
      onDone();
    } catch (err) { toast.error(err.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleAdd} className="space-y-4 mt-6 animate-fadeIn">
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-3">Informations de la carte</p>
        <CardElement options={cardStyle} onChange={e => setComplete(e.complete)} />
      </div>
      <p className="text-xs text-slate-500 pl-1">Verification a 0 EUR — aucun debit lors de l'ajout</p>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 backdrop-blur-xl bg-white/5 border border-white/10 text-slate-300 rounded-full text-sm font-medium hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2">
          <X className="w-4 h-4" strokeWidth={1.5} /> Annuler
        </button>
        <button type="submit" disabled={loading || !complete} data-testid="confirm-add-card"
          className="flex-1 py-3 bg-[#c8a951] text-[#0a0f1a] rounded-full text-sm font-semibold hover:bg-[#e0c065] transition-colors duration-300 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verification...</> : <><CheckCircle className="w-4 h-4" strokeWidth={1.5} /> Confirmer</>}
        </button>
      </div>
    </form>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // Try parsing "DD/MM/YYYY" or "DD-MM-YYYY" formats
      const parts = dateStr.split(/[\/\-\.]/);
      if (parts.length === 3) {
        const parsed = new Date(parts[2], parts[1] - 1, parts[0]);
        if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
        }
      }
      return dateStr;
    }
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return { day: '--', month: '--', time: '' };
  try {
    let d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      const parts = dateStr.split(/[\/\-\.]/);
      if (parts.length === 3) d = new Date(parts[2], parts[1] - 1, parts[0]);
    }
    if (isNaN(d.getTime())) return { day: '--', month: '--', time: '' };
    return {
      day: d.getDate().toString().padStart(2, '0'),
      month: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
      time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
  } catch { return { day: '--', month: '--', time: '' }; }
};

const statusLabels = {
  0: { label: 'Nouvelle', color: 'bg-blue-500/15 text-blue-300 border-blue-500/20' },
  1: { label: 'En cours', color: 'bg-amber-500/15 text-amber-300 border-amber-500/20' },
  2: { label: 'Acceptee', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
  3: { label: 'Terminee', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
  4: { label: 'Annulee', color: 'bg-red-500/15 text-red-300 border-red-500/20' },
  New: { label: 'Nouvelle', color: 'bg-blue-500/15 text-blue-300 border-blue-500/20' },
  Accepted: { label: 'Acceptee', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
  Completed: { label: 'Terminee', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
  Cancelled: { label: 'Annulee', color: 'bg-red-500/15 text-red-300 border-red-500/20' },
};

const MyAccount = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showAddCard, setShowAddCard] = useState(false);
  const [deletingCard, setDeletingCard] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const fetchCards = async () => {
    try {
      const res = await xhr('GET', `${API}/api/proxy/client/cards`, { Authorization: `Bearer ${token}` });
      if (res.ok && Array.isArray(res.data)) setCards(res.data);
    } catch {}
  };

  const fetchBookings = async () => {
    try {
      const res = await xhr('GET', `${API}/api/proxy/booking/upcoming`, { Authorization: `Bearer ${token}` });
      if (res.ok && Array.isArray(res.data)) setBookings(res.data);
    } catch {}
  };

  const canCancelBooking = (booking) => {
    const dateStr = booking.startDate || booking.date;
    if (!dateStr) return false;
    const rideDate = new Date(dateStr);
    if (isNaN(rideDate.getTime())) return false;
    const now = new Date();
    return (rideDate.getTime() - now.getTime()) / (1000 * 60 * 60) > 24;
  };

  const isLessThan24h = (booking) => {
    const dateStr = booking.startDate || booking.date;
    if (!dateStr) return false;
    const rideDate = new Date(dateStr);
    if (isNaN(rideDate.getTime())) return false;
    const now = new Date();
    const diff = (rideDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diff > 0 && diff <= 24;
  };

  const handleCancelBooking = async (booking) => {
    const bookingId = booking.id || booking.auctionId;
    if (!bookingId) { toast.error('ID de reservation introuvable'); return; }
    if (!canCancelBooking(booking)) {
      toast.error('Annulation impossible moins de 24h avant le depart. Veuillez contacter notre service client.', { duration: 6000 });
      return;
    }
    if (!window.confirm('Etes-vous sur de vouloir annuler cette reservation ?')) return;
    setCancellingBooking(bookingId);
    try {
      const res = await xhr('DELETE', `${API}/api/proxy/booking/cancel/${bookingId}`, { Authorization: `Bearer ${token}` });
      if (res.ok) {
        toast.success('Reservation annulee avec succes');
        fetchBookings();
      } else {
        toast.error(res.data?.detail || "Impossible d'annuler cette reservation");
      }
    } catch { toast.error('Erreur reseau'); }
    finally { setCancellingBooking(null); }
  };

  useEffect(() => {
    if (!isAuthenticated) { navigate('/'); return; }
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      xhr('GET', `${API}/api/proxy/client/profile`, h),
      xhr('GET', `${API}/api/proxy/booking/upcoming`, h),
      xhr('GET', `${API}/api/proxy/client/cards`, h),
    ]).then(([profRes, bkRes, cdsRes]) => {
      setProfile(profRes.ok ? profRes.data : null);
      setBookings(bkRes.ok && Array.isArray(bkRes.data) ? bkRes.data : []);
      setCards(cdsRes.ok && Array.isArray(cdsRes.data) ? cdsRes.data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Supprimer cette carte ?')) return;
    setDeletingCard(cardId);
    try {
      const res = await xhr('DELETE', `${API}/api/proxy/client/cards/${cardId}`, { Authorization: `Bearer ${token}` });
      if (res.ok) {
        setCards(prev => prev.filter(c => c.id !== cardId));
        toast.success('Carte supprimee');
      } else {
        toast.error('Impossible de supprimer cette carte');
      }
    } catch { toast.error('Erreur'); }
    finally { setDeletingCard(null); }
  };

  const handleCardAdded = () => { setShowAddCard(false); fetchCards(); };
  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className={`min-h-screen bg-[#0a0f1a] ${FONT}`}><Header />
        <div className="flex items-center justify-center pt-40">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#c8a951]/30 border-t-[#c8a951] animate-spin" />
            <p className="text-sm text-slate-500 tracking-wide">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  const firstName = profile?.firstName || user?.firstName || '';
  const lastName = profile?.lastName || user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Client';
  const email = profile?.email || '';
  const phone = profile?.phoneNumber || '';
  const initial = firstName?.charAt(0) || fullName?.charAt(0) || 'C';

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'bookings', label: 'Reservations', icon: Car },
    { id: 'payment', label: 'Paiement', icon: CreditCard },
  ];

  return (
    <div className={`min-h-screen bg-[#0a0f1a] ${FONT}`} data-testid="my-account-page">
      <Header />

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">

        {/* Profile Header */}
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#c8a951]/5 to-transparent rounded-3xl" />
          <div className="relative flex flex-col items-center py-10">
            <div className="relative mb-5">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c8a951] to-[#a08640] flex items-center justify-center text-[#0a0f1a] text-3xl font-light shadow-[0_0_30px_rgba(200,169,81,0.2)]">
                {initial}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-[3px] border-[#0a0f1a] flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-2xl font-light text-white tracking-tight mb-1">{fullName}</h1>
            {email && <p className="text-sm text-slate-400">{email.toLowerCase()}</p>}
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c8a951]/10 border border-[#c8a951]/20">
              <Shield className="w-3.5 h-3.5 text-[#c8a951]" strokeWidth={1.5} />
              <span className="text-xs font-medium text-[#c8a951] tracking-wide">Client verifie</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 mb-8 backdrop-blur-xl bg-[#1a2332]/50 border border-white/5 rounded-full">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} data-testid={`tab-${tab.id}`}
              className={`flex-1 py-3 rounded-full text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-2
                ${activeTab === tab.id
                  ? 'bg-[#c8a951] text-[#0a0f1a] shadow-lg shadow-[#c8a951]/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <tab.icon className="w-4 h-4" strokeWidth={1.5} /> {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Profile Tab ─── */}
        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fadeIn" data-testid="profile-section">
            <div className="backdrop-blur-xl bg-[#1a2332]/60 border border-white/5 rounded-2xl p-6 shadow-2xl">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-500 mb-5">Informations personnelles</p>
              <div className="space-y-4">
                {[
                  { icon: User, label: 'Nom complet', value: fullName },
                  { icon: Mail, label: 'Email', value: email || '-' },
                  { icon: Phone, label: 'Telephone', value: phone || '-' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/5 hover:border-[#c8a951]/20 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-xl bg-[#c8a951]/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4.5 h-4.5 text-[#c8a951]" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-slate-500">{label}</p>
                      <p className="text-white font-medium text-sm truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleLogout} data-testid="logout-btn"
              className="w-full py-3.5 backdrop-blur-xl bg-red-500/8 text-red-400 rounded-full text-sm font-medium hover:bg-red-500/15 transition-colors duration-300 border border-red-500/15 flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" strokeWidth={1.5} /> Se deconnecter
            </button>
          </div>
        )}

        {/* ─── Bookings Tab ─── */}
        {activeTab === 'bookings' && (
          <div className="space-y-4 animate-fadeIn" data-testid="bookings-section">
            {bookings.length === 0 ? (
              <div className="backdrop-blur-xl bg-[#1a2332]/60 border border-white/5 rounded-2xl p-12 text-center shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Navigation className="w-7 h-7 text-slate-600" strokeWidth={1.5} />
                </div>
                <h2 className="text-white font-medium text-lg mb-2">Aucune reservation</h2>
                <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">Vous n'avez pas encore de courses a venir.</p>
                <button onClick={() => navigate('/')}
                  className="px-8 py-3.5 bg-[#c8a951] text-[#0a0f1a] rounded-full font-semibold text-sm hover:bg-[#e0c065] transition-colors duration-300 shadow-lg shadow-[#c8a951]/20">
                  Reserver une course
                </button>
              </div>
            ) : (
              bookings.map((b, i) => {
                const st = statusLabels[b.status ?? b.auctionStatus] || { label: 'En cours', color: 'bg-slate-500/15 text-slate-300 border-slate-500/20' };
                const isCancelled = [4, 'Cancelled'].includes(b.status) || [4, 'Cancelled'].includes(b.auctionStatus);
                const bookingId = b.id || b.auctionId;
                const dateInfo = formatDateShort(b.startDate || b.date);
                const canCancel = !isCancelled && canCancelBooking(b);
                const showContact = !isCancelled && isLessThan24h(b);

                return (
                  <div key={b.id || i}
                    className="group backdrop-blur-xl bg-[#1a2332]/60 border border-white/5 rounded-2xl p-5 shadow-2xl hover:border-[#c8a951]/20 transition-colors duration-300"
                    data-testid={`booking-${i}`}
                    style={{ animationDelay: `${i * 80}ms` }}>

                    <div className="flex gap-4">
                      {/* Date block */}
                      <div className="flex flex-col items-center justify-center w-16 h-16 bg-white/5 rounded-xl border border-white/5 flex-shrink-0">
                        <span className="text-xl font-semibold text-white leading-none">{dateInfo.day}</span>
                        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#c8a951] mt-0.5">{dateInfo.month}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium text-sm">{b.carType || b.tripType || 'VTC'}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${st.color}`}>{st.label}</span>
                        </div>

                        <div className="space-y-1.5 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0" />
                            <p className="text-slate-300 text-xs truncate">{b.startAddress || b.fromAddress || 'Depart'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                            <p className="text-slate-300 text-xs truncate">{b.endAddress || b.destination || 'Arrivee'}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          {dateInfo.time && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Clock className="w-3 h-3" strokeWidth={1.5} />
                              <span className="text-xs">{dateInfo.time}</span>
                            </div>
                          )}
                          {(b.clientPrice || b.price) && (
                            <span className="text-lg font-light text-[#c8a951]">{b.clientPrice || b.price} EUR</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cancel section */}
                    {!isCancelled && (canCancel || showContact) && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        {canCancel ? (
                          <button onClick={() => handleCancelBooking(b)} disabled={cancellingBooking === bookingId}
                            data-testid={`cancel-booking-${i}`}
                            className="w-full py-2.5 bg-red-500/8 text-red-400 rounded-full text-xs font-medium hover:bg-red-500/15 transition-colors duration-300 border border-red-500/15 flex items-center justify-center gap-2">
                            {cancellingBooking === bookingId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />}
                            Annuler la reservation
                          </button>
                        ) : (
                          <div className="w-full py-2.5 bg-amber-500/8 text-amber-400 rounded-xl text-xs border border-amber-500/15 flex items-center justify-center gap-2"
                            data-testid={`cancel-contact-${i}`}>
                            <PhoneCall className="w-3.5 h-3.5" strokeWidth={1.5} />
                            Moins de 24h — contactez le service client pour annuler
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── Payment Tab ─── */}
        {activeTab === 'payment' && (
          <div className="space-y-5 animate-fadeIn" data-testid="payment-section">

            {/* Cards list */}
            <div className="backdrop-blur-xl bg-[#1a2332]/60 border border-white/5 rounded-2xl p-6 shadow-2xl">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-500 mb-5">Mes cartes bancaires</p>

              {cards.length > 0 ? (
                <div className="space-y-3">
                  {cards.map(card => {
                    const brand = brandConfig[card.brand] || { label: 'CARD', gradient: 'from-slate-600 to-slate-800' };
                    return (
                      <div key={card.id}
                        className="relative overflow-hidden bg-gradient-to-br from-[#1a2332] to-[#0f1419] border border-white/10 rounded-2xl p-5 group hover:border-[#c8a951]/30 transition-colors duration-300"
                        data-testid={`card-${card.last4}`}>
                        {/* Decorative chip */}
                        <div className="absolute top-5 right-5 w-10 h-7 bg-gradient-to-tr from-[#e0c065] to-[#c8a951] rounded-md opacity-60" />

                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-8 bg-gradient-to-br ${brand.gradient} rounded-lg flex items-center justify-center shadow-lg`}>
                            <span className="text-white text-[9px] font-bold tracking-wider">{brand.label}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm tracking-wide font-mono">**** **** **** {card.last4}</p>
                            <p className="text-slate-500 text-xs mt-0.5">Expire {card.exp_month?.toString().padStart(2, '0')}/{card.exp_year}</p>
                          </div>
                          <button onClick={() => handleDeleteCard(card.id)} disabled={deletingCard === card.id}
                            className="p-2.5 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-300"
                            data-testid={`delete-card-${card.last4}`}>
                            {deletingCard === card.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" strokeWidth={1.5} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
                  </div>
                  <p className="text-slate-400 text-sm">Aucune carte enregistree</p>
                </div>
              )}

              {/* Add card */}
              {showAddCard ? (
                <Elements stripe={stripePromise}>
                  <AddCardInline token={token} onDone={handleCardAdded} onCancel={() => setShowAddCard(false)} />
                </Elements>
              ) : (
                <button onClick={() => setShowAddCard(true)} data-testid="add-card-btn"
                  className="w-full mt-5 py-3.5 bg-[#c8a951] text-[#0a0f1a] rounded-full font-semibold text-sm hover:bg-[#e0c065] transition-colors duration-300 shadow-lg shadow-[#c8a951]/20 flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" strokeWidth={2} /> Ajouter une carte
                </button>
              )}
            </div>

            {/* Security notice */}
            <div className="backdrop-blur-xl bg-[#1a2332]/40 border border-white/5 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-slate-500 text-xs leading-relaxed">Vos donnees de paiement sont securisees par <span className="text-white font-medium">Stripe</span>. Verification a 0 EUR — aucun debit lors de l'ajout.</p>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MyAccount;
