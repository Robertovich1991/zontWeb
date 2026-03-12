import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverAuth } from './DriverAuthContext';
import { ArrowLeft, CreditCard, Loader2, CheckCircle, User, Building, Phone, Mail, Shield, Star } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const DriverProfile = () => {
  const { partner, token, logout } = useDriverAuth();
  const navigate = useNavigate();
  const [cardInfo, setCardInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingCard, setAddingCard] = useState(false);
  const [polling, setPolling] = useState(false);
  const [reviewStats, setReviewStats] = useState(null);
  const [reviews, setReviews] = useState([]);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cardRes, statsRes, reviewsRes] = await Promise.all([
          fetch(`${API}/api/partner/payment/my-card`, { headers }),
          fetch(`${API}/api/partner/reviews/stats/${partner?.id}`, { headers }),
          fetch(`${API}/api/partner/reviews/my`, { headers }),
        ]);
        if (cardRes.ok) setCardInfo(await cardRes.json());
        if (statsRes.ok) setReviewStats(await statsRes.json());
        if (reviewsRes.ok) setReviews(await reviewsRes.json());
      } catch {} finally { setLoading(false); }
    };
    fetchData();

    // Check if returning from Stripe
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      setPolling(true);
      pollStatus(sessionId, 0);
      window.history.replaceState({}, '', '/driver/profile');
    }
  }, []);

  const pollStatus = async (sessionId, attempts) => {
    if (attempts >= 5) { setPolling(false); return; }
    try {
      const res = await fetch(`${API}/api/partner/payment/card-status/${sessionId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.payment_status === 'paid') {
          setCardInfo({ has_card: true, card_added_at: new Date().toISOString() });
          setPolling(false);
          return;
        }
      }
    } catch {}
    setTimeout(() => pollStatus(sessionId, attempts + 1), 2000);
  };

  const handleAddCard = async () => {
    setAddingCard(true);
    try {
      const res = await fetch(`${API}/api/partner/payment/add-card`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin_url: window.location.origin }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      }
    } catch {} finally { setAddingCard(false); }
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
            <CreditCard className="w-4 h-4 text-[#2ecc71]" /> Carte Bancaire
          </h3>

          {loading || polling ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 className="w-5 h-5 text-[#2ecc71] animate-spin" />
              <span className="text-gray-400 text-sm">{polling ? 'Verification du paiement...' : 'Chargement...'}</span>
            </div>
          ) : cardInfo?.has_card ? (
            <div className="space-y-3">
              <div className="bg-[#2ecc71]/10 border border-[#2ecc71]/30 rounded-xl p-4 flex items-center gap-3" data-testid="card-active">
                <CheckCircle className="w-5 h-5 text-[#2ecc71]" />
                <div>
                  <p className="text-white font-medium text-sm">Carte enregistree</p>
                  <p className="text-gray-400 text-xs">
                    Ajoutee le {cardInfo.card_added_at ? new Date(cardInfo.card_added_at).toLocaleDateString('fr-FR') : '-'}
                  </p>
                </div>
              </div>
              <button onClick={handleAddCard} disabled={addingCard}
                className="w-full py-3 bg-gray-700/50 text-gray-300 rounded-xl text-sm hover:bg-gray-700 transition flex items-center justify-center gap-2">
                {addingCard ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Changer de carte
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <p className="text-amber-400 text-sm font-medium mb-1">Aucune carte enregistree</p>
                <p className="text-gray-400 text-xs">Ajoutez une carte bancaire pour etre debite automatiquement apres chaque course effectuee.</p>
              </div>
              <button onClick={handleAddCard} disabled={addingCard} data-testid="add-card-btn"
                className="w-full py-4 bg-[#2ecc71] text-white rounded-xl font-semibold text-sm hover:bg-[#27ae60] transition-all disabled:bg-gray-600 flex items-center justify-center gap-2 shadow-lg shadow-[#2ecc71]/20">
                {addingCard ? <><Loader2 className="w-5 h-5 animate-spin" /> Redirection...</> : <><CreditCard className="w-5 h-5" /> Ajouter une Carte</>}
              </button>
            </div>
          )}
        </div>

        {/* Security info */}
        <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-400 text-xs">Vos donnees de paiement sont securisees par <span className="text-white font-medium">Stripe</span>. Nous ne stockons jamais vos informations bancaires sur nos serveurs.</p>
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
