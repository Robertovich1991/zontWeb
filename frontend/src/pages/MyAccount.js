import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Header from '../components/layout/Header';
import { toast } from 'sonner';
import { User, Mail, Phone, CreditCard, Calendar, Car, Navigation, Loader2, Shield, Plus, Trash2, X, CheckCircle, XCircle, PhoneCall } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK || 'pk_live_lX3FXPqGIJLP5NgXomcdpcWO');

const cardStyle = {
  style: {
    base: { color: '#ffffff', fontSize: '16px', '::placeholder': { color: '#6b7280' }, iconColor: '#c8a951' },
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

const brandLabels = { visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express', discover: 'Discover' };

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
      const { error, setupIntent } = await stripe.confirmCardSetup(setup.data.clientSecret, { payment_method: { card: elements.getElement(CardElement) } });
      if (error) { toast.error(error.message); setLoading(false); return; }
      toast.success('Carte ajoutee avec succes !');
      onDone();
    } catch (err) { toast.error(err.message || 'Erreur'); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleAdd} className="space-y-4 mt-4">
      <div className="bg-[#0f1419] border border-gray-700 rounded-xl p-4">
        <CardElement options={cardStyle} onChange={e => setComplete(e.complete)} />
      </div>
      <p className="text-xs text-gray-500">Verification 0 EUR — aucun debit lors de l'ajout</p>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-gray-700/50 text-gray-300 rounded-xl text-sm hover:bg-gray-700 transition flex items-center justify-center gap-2">
          <X className="w-4 h-4" /> Annuler
        </button>
        <button type="submit" disabled={loading || !complete} data-testid="confirm-add-card"
          className="flex-1 py-3 bg-[#c8a951] text-black rounded-xl text-sm font-semibold hover:bg-[#d4b85c] transition disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verification...</> : <><CheckCircle className="w-4 h-4" /> Ajouter</>}
        </button>
      </div>
    </form>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try { return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return dateStr; }
};

const statusLabels = {
  0: { label: 'Nouvelle', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  1: { label: 'En cours', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  2: { label: 'Acceptee', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
  3: { label: 'Terminee', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  4: { label: 'Annulee', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
  New: { label: 'Nouvelle', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  Accepted: { label: 'Acceptee', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
  Completed: { label: 'Terminee', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  Cancelled: { label: 'Annulee', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
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
    const now = new Date();
    const diffMs = rideDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 24;
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
        toast.error(res.data?.detail || 'Impossible d\'annuler cette reservation');
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

  const handleCardAdded = () => {
    setShowAddCard(false);
    fetchCards();
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]"><Header />
        <div className="flex items-center justify-center pt-40"><Loader2 className="w-8 h-8 text-[#c8a951] animate-spin" /></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'bookings', label: 'Reservations', icon: Car },
    { id: 'payment', label: 'Paiement', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1a]" data-testid="my-account-page">
      <Header />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
        {/* Account Header */}
        <div className="bg-gradient-to-r from-[#1a2332] to-[#1e2a3a] rounded-2xl p-6 border border-gray-800 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#c8a951] rounded-xl flex items-center justify-center text-black font-bold text-2xl">
              {profile?.firstName?.charAt(0) || user?.firstName?.charAt(0) || 'C'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {profile ? `${profile.firstName} ${profile.lastName}`.trim() : user?.name || 'Client'}
              </h1>
              <p className="text-gray-400 text-sm">{profile?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-[#1a2332] p-1.5 rounded-xl border border-gray-800">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} data-testid={`tab-${tab.id}`}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-[#c8a951] text-black' : 'text-gray-400 hover:text-white'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4" data-testid="profile-section">
            <div className="bg-[#1a2332] rounded-xl p-6 border border-gray-800">
              <h2 className="text-white font-semibold mb-4">Informations personnelles</h2>
              <div className="space-y-4">
                {[
                  { icon: User, label: 'Nom complet', value: profile ? `${profile.firstName} ${profile.lastName}`.trim() : '-' },
                  { icon: Mail, label: 'Email', value: profile?.email || '-' },
                  { icon: Phone, label: 'Telephone', value: profile?.phoneNumber || '-' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 p-4 bg-[#0f1419] rounded-xl">
                    <Icon className="w-5 h-5 text-[#c8a951]" />
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-white font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleLogout} data-testid="logout-btn"
              className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition border border-red-500/20">
              Se deconnecter
            </button>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4" data-testid="bookings-section">
            {bookings.length === 0 ? (
              <div className="bg-[#1a2332] border border-gray-800 rounded-xl p-10 text-center">
                <Navigation className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h2 className="text-white font-semibold text-lg mb-2">Aucune reservation</h2>
                <p className="text-gray-400 text-sm mb-6">Vous n'avez pas encore de courses a venir.</p>
                <button onClick={() => navigate('/')} className="px-6 py-3 bg-[#c8a951] text-black rounded-xl font-semibold hover:bg-[#d4b85c] transition">
                  Reserver une course
                </button>
              </div>
            ) : (
              bookings.map((b, i) => {
                const st = statusLabels[b.status ?? b.auctionStatus] || { label: 'En cours', color: 'bg-gray-500/10 text-gray-400 border-gray-500/30' };
                const isCancelled = (b.status === 4 || b.status === 'Cancelled' || b.auctionStatus === 4 || b.auctionStatus === 'Cancelled');
                const bookingId = b.id || b.auctionId;
                const canCancel = !isCancelled && canCancelBooking(b);
                const isLessThan24h = !isCancelled && !canCancel;
                return (
                  <div key={b.id || i} className="bg-[#1a2332] border border-gray-800 rounded-xl p-5" data-testid={`booking-${i}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2"><Car className="w-5 h-5 text-[#c8a951]" /><span className="text-white font-semibold text-sm">{b.carType || b.tripType || 'VTC'}</span></div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${st.color}`}>{st.label}</span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-start gap-2"><div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" /><p className="text-gray-300 text-sm">{b.startAddress || b.fromAddress || 'Depart'}</p></div>
                      <div className="flex items-start gap-2"><div className="w-2 h-2 bg-red-400 rounded-full mt-1.5 flex-shrink-0" /><p className="text-gray-300 text-sm">{b.endAddress || b.destination || 'Arrivee'}</p></div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <Calendar className="w-3.5 h-3.5" /><span>{formatDate(b.startDate || b.date)}</span>
                      {(b.clientPrice || b.price) && <span className="ml-auto text-[#c8a951] font-bold text-sm">{b.clientPrice || b.price} EUR</span>}
                    </div>

                    {/* Cancel section */}
                    {!isCancelled && (
                      canCancel ? (
                        <button onClick={() => handleCancelBooking(b)} disabled={cancellingBooking === bookingId}
                          data-testid={`cancel-booking-${i}`}
                          className="w-full py-2.5 bg-red-500/10 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/20 transition border border-red-500/20 flex items-center justify-center gap-2">
                          {cancellingBooking === bookingId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                          Annuler la reservation
                        </button>
                      ) : isLessThan24h && (
                        <div className="w-full py-2.5 bg-yellow-500/10 text-yellow-400 rounded-xl text-xs border border-yellow-500/20 flex items-center justify-center gap-2"
                          data-testid={`cancel-contact-${i}`}>
                          <PhoneCall className="w-3.5 h-3.5" />
                          Moins de 24h — contactez le service client pour annuler
                        </div>
                      )
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-4" data-testid="payment-section">
            <div className="bg-[#1a2332] rounded-xl p-6 border border-gray-800">
              <h2 className="text-white font-semibold mb-4">Mes cartes bancaires</h2>

              {cards.length > 0 ? (
                <div className="space-y-3">
                  {cards.map(card => (
                    <div key={card.id} className="bg-[#0f1419] border border-gray-700 rounded-xl p-4 flex items-center gap-4" data-testid={`card-${card.last4}`}>
                      <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold">{card.brand === 'visa' ? 'VISA' : card.brand === 'mastercard' ? 'MC' : 'CARD'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{brandLabels[card.brand] || card.brand} **** {card.last4}</p>
                        <p className="text-gray-500 text-xs">Expire {card.exp_month}/{card.exp_year}</p>
                      </div>
                      <button onClick={() => handleDeleteCard(card.id)} disabled={deletingCard === card.id}
                        className="text-gray-500 hover:text-red-400 transition p-2" data-testid={`delete-card-${card.last4}`}>
                        {deletingCard === card.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Aucune carte enregistree</p>
                </div>
              )}

              {/* Add card */}
              {showAddCard ? (
                <Elements stripe={stripePromise}>
                  <AddCardInline token={token} onDone={handleCardAdded} onCancel={() => setShowAddCard(false)} />
                </Elements>
              ) : (
                <button onClick={() => setShowAddCard(true)} data-testid="add-card-btn"
                  className="w-full mt-4 py-3.5 bg-[#c8a951] text-black rounded-xl font-semibold text-sm hover:bg-[#d4b85c] transition flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Ajouter une carte
                </button>
              )}
            </div>

            <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-400 text-xs">Vos donnees de paiement sont securisees par <span className="text-white font-medium">Stripe</span>. Verification a 0 EUR — aucun debit lors de l'ajout.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;
