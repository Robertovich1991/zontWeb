import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverAuth } from './DriverAuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, CreditCard, Loader2, CheckCircle, User, Building, Phone, Mail, Shield, Star, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK || 'pk_live_lX3FXPqGIJLP5NgXomcdpcWO');

const cardStyle = {
  style: {
    base: { color: '#ffffff', fontSize: '16px', '::placeholder': { color: '#6b7280' }, iconColor: '#2ecc71' },
    invalid: { color: '#ef4444', iconColor: '#ef4444' },
  },
};

// XHR wrapper to avoid Stripe.js body stream conflict
const xhrRequest = (method, url, headers, body) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.onload = () => {
      let data;
      try { data = JSON.parse(xhr.responseText); } catch { data = {}; }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, data });
    };
    xhr.onerror = () => reject(new Error('Erreur reseau'));
    xhr.send(body || null);
  });
};

const AddCardForm = ({ token, onCardAdded, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardBrand, setCardBrand] = useState('unknown');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !cardComplete) return;
    setLoading(true);
    try {
      // Step 1: Get SetupIntent from C#
      const setupResp = await xhrRequest('POST', `${API}/api/partner/cards/setup-intent`, {
        Authorization: `Bearer ${token}`,
      });
      if (!setupResp.ok || !setupResp.data.clientSecret) {
        toast.error(setupResp.data?.detail || 'Erreur: reconnectez-vous');
        setLoading(false);
        return;
      }

      // Step 2: Confirm card with 3DS
      const { error, setupIntent } = await stripe.confirmCardSetup(
        setupResp.data.clientSecret,
        { payment_method: { card: elements.getElement(CardElement) } }
      );
      if (error) {
        toast.error(error.message || 'Erreur de carte');
        setLoading(false);
        return;
      }

      // Step 3: Save card in our DB
      const saveResp = await xhrRequest('POST', `${API}/api/partner/cards/save`, {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }, JSON.stringify({ pm_id: setupIntent.payment_method, brand: cardBrand }));

      if (saveResp.ok) {
        toast.success('Carte ajoutee avec succes !');
        onCardAdded(saveResp.data);
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (err) {
      toast.error(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-[#0f1419] border border-gray-700 rounded-xl p-4">
        <CardElement options={cardStyle} onChange={e => { setCardComplete(e.complete); if (e.brand) setCardBrand(e.brand); }} />
      </div>
      <p className="text-xs text-gray-500">Verification 0 EUR - Aucun debit lors de l'ajout</p>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 bg-gray-700/50 text-gray-300 rounded-xl text-sm hover:bg-gray-700 transition flex items-center justify-center gap-2">
          <X className="w-4 h-4" /> Annuler
        </button>
        <button type="submit" disabled={loading || !cardComplete} data-testid="confirm-add-card"
          className="flex-1 py-3 bg-[#2ecc71] text-white rounded-xl text-sm font-semibold hover:bg-[#27ae60] transition disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#2ecc71]/20">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verification...</> : <><CheckCircle className="w-4 h-4" /> Ajouter</>}
        </button>
      </div>
    </form>
  );
};

const brandIcons = {
  visa: 'VISA', mastercard: 'MC', amex: 'AMEX', discover: 'DISC', unknown: 'CARD'
};

const DriverProfile = () => {
  const { partner, token, logout } = useDriverAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingCard, setDeletingCard] = useState(null);
  const [reviewStats, setReviewStats] = useState(null);
  const [reviews, setReviews] = useState([]);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cardsRes, statsRes, reviewsRes] = await Promise.all([
          fetch(`${API}/api/partner/cards`, { headers }),
          fetch(`${API}/api/partner/reviews/stats/${partner?.id}`, { headers }),
          fetch(`${API}/api/partner/reviews/my`, { headers }),
        ]);
        if (cardsRes.ok) setCards(await cardsRes.json());
        if (statsRes.ok) setReviewStats(await statsRes.json());
        if (reviewsRes.ok) setReviews(await reviewsRes.json());
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleDeleteCard = async (cardId) => {
    setDeletingCard(cardId);
    try {
      const res = await fetch(`${API}/api/partner/cards/${cardId}`, { method: 'DELETE', headers });
      if (res.ok) {
        setCards(prev => prev.filter(c => c.id !== cardId));
        toast.success('Carte supprimee');
      }
    } catch {} finally { setDeletingCard(null); }
  };

  const handleCardAdded = (card) => {
    setCards(prev => [...prev, card]);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col" data-testid="driver-profile-page">
      <header className="bg-[#1a2332] border-b border-gray-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigate('/driver')} className="text-gray-400 hover:text-white transition" data-testid="back-btn">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white font-semibold text-sm">Mon Profil</h1>
      </header>

      <div className="flex-1 px-4 py-5 space-y-4">
        {/* Partner Info */}
        <div className="bg-[#1a2332] rounded-xl p-5 border border-gray-800" data-testid="profile-info">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-[#2ecc71] rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {partner?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{partner?.name}</h2>
              <p className="text-gray-400 text-sm">{partner?.company || 'Partenaire'}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-300">{partner?.email}</span>
            </div>
            {partner?.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-300">{partner?.phone}</span>
              </div>
            )}
            {partner?.company && (
              <div className="flex items-center gap-3 text-sm">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-gray-300">{partner?.company}</span>
              </div>
            )}
          </div>
        </div>

        {/* Review Stats */}
        <div className="bg-[#1a2332] rounded-xl p-5 border border-gray-800" data-testid="review-stats">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-yellow-400" /> Mes Avis
          </h3>
          {reviewStats && reviewStats.total_reviews > 0 ? (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{reviewStats.average_rating}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${i <= Math.round(reviewStats.average_rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{reviewStats.total_reviews} avis</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5,4,3,2,1].map(i => {
                    const count = reviewStats.ratings?.[String(i)] || 0;
                    const pct = reviewStats.total_reviews > 0 ? (count / reviewStats.total_reviews) * 100 : 0;
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400 w-3">{i}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                          <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{width: `${pct}%`}} />
                        </div>
                        <span className="text-gray-500 w-5 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {reviews.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {reviews.slice(0, 10).map(r => (
                    <div key={r.id} className="bg-[#0f1419] rounded-lg p-3 border border-gray-800">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                        {[...Array(5 - r.rating)].map((_, i) => <Star key={`e${i}`} className="w-3 h-3 text-gray-600" />)}
                        <span className="text-gray-500 text-xs ml-2">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {r.comment && <p className="text-gray-300 text-xs italic">"{r.comment}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">Aucun avis pour le moment</p>
          )}
        </div>

        {/* Card Management */}
        <div className="bg-[#1a2332] rounded-xl p-5 border border-gray-800" data-testid="card-management">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-[#2ecc71]" /> Mes Cartes Bancaires
          </h3>

          {loading ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 className="w-5 h-5 text-[#2ecc71] animate-spin" />
              <span className="text-gray-400 text-sm">Chargement...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Saved cards list */}
              {cards.map(card => (
                <div key={card.id} className="bg-[#0f1419] border border-gray-700 rounded-xl p-4 flex items-center justify-between" data-testid={`card-${card.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">{brandIcons[card.brand] || 'CARD'}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium capitalize">{card.brand || 'Carte'}</p>
                      <p className="text-gray-500 text-xs">Ajoutee le {new Date(card.added_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteCard(card.id)} disabled={deletingCard === card.id}
                    className="text-gray-500 hover:text-red-400 transition p-2" data-testid={`delete-card-${card.id}`}>
                    {deletingCard === card.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}

              {/* Add card form or button */}
              {showAddForm ? (
                <Elements stripe={stripePromise}>
                  <AddCardForm token={token} onCardAdded={handleCardAdded} onCancel={() => setShowAddForm(false)} />
                </Elements>
              ) : (
                <button onClick={() => setShowAddForm(true)} data-testid="add-card-btn"
                  className="w-full py-3.5 bg-[#2ecc71] text-white rounded-xl font-semibold text-sm hover:bg-[#27ae60] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#2ecc71]/20">
                  <Plus className="w-4 h-4" /> Ajouter une Carte
                </button>
              )}
            </div>
          )}
        </div>

        {/* Security info */}
        <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-400 text-xs">Vos donnees de paiement sont securisees par <span className="text-white font-medium">Stripe</span>. Verification a 0 EUR - aucun debit lors de l'ajout. Le debit se fait uniquement lors de l'acceptation d'une course par un chauffeur.</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button onClick={() => { logout(); navigate('/driver/login'); }} data-testid="profile-logout"
          className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition">
          Se deconnecter
        </button>
      </div>
    </div>
  );
};

export default DriverProfile;
