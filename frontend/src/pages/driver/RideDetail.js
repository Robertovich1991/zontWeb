import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDriverAuth } from './DriverAuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, MapPin, Clock, CheckCircle, XCircle, AlertCircle, User, Phone, Plane, FileText, Car, Navigation, DollarSign, Calendar, Star, Send } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', icon: Clock, desc: 'Votre course est en attente de validation par l\'admin.' },
  accepted: { label: 'Acceptee', color: 'bg-green-500/10 text-green-400 border-green-500/30', icon: CheckCircle, desc: 'Votre course a ete acceptee ! Un chauffeur sera assigne.' },
  rejected: { label: 'Refusee', color: 'bg-red-500/10 text-red-400 border-red-500/30', icon: XCircle, desc: 'Votre course a ete refusee. Contactez l\'admin pour plus d\'infos.' },
  completed: { label: 'Terminee', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: CheckCircle, desc: 'Course terminee avec succes.' },
  cancelled: { label: 'Annulee', color: 'bg-gray-500/10 text-gray-400 border-gray-500/30', icon: AlertCircle, desc: 'Cette course a ete annulee.' },
};

const StarRating = ({ rating, setRating, readOnly }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <button key={i} type="button" disabled={readOnly}
        onClick={() => !readOnly && setRating(i)}
        className={`transition-transform ${!readOnly ? 'hover:scale-110 active:scale-95 cursor-pointer' : ''}`}
        data-testid={`star-${i}`}>
        <Star className={`w-8 h-8 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} transition-colors`} />
      </button>
    ))}
  </div>
);

const RideDetail = () => {
  const { id } = useParams();
  const { token } = useDriverAuth();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rideRes, reviewRes] = await Promise.all([
          fetch(`${API}/api/partner/rides/${id}`, { headers }),
          fetch(`${API}/api/partner/rides/${id}/review`, { headers }),
        ]);
        if (rideRes.ok) {
          const rideData = await rideRes.json();
          setRide(rideData);
          if (rideData.pickup_address && rideData.dropoff_address) {
            const routeRes = await fetch(`${API}/api/partner/calculate-route`, {
              method: 'POST',
              headers: { ...headers, 'Content-Type': 'application/json' },
              body: JSON.stringify({ origin: rideData.pickup_address, destination: rideData.dropoff_address }),
            });
            if (routeRes.ok) {
              const rd = await routeRes.json();
              if (rd.status === 'ok') setRouteInfo(rd);
            }
          }
        }
        if (reviewRes.ok) setExistingReview(await reviewRes.json());
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [id, token]);

  const handleSubmitReview = async () => {
    if (reviewRating === 0) { toast.error('Veuillez choisir une note'); return; }
    if (reviewRating < 5 && !reviewComment.trim()) {
      toast.error('Un commentaire est obligatoire pour une note inferieure a 5 etoiles');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API}/api/partner/rides/${id}/review`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      if (res.ok) {
        const review = await res.json();
        setExistingReview(review);
        setRide(prev => ({ ...prev, reviewed: true, review_rating: reviewRating }));
        toast.success('Avis envoye ! Merci.');
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Erreur lors de l\'envoi');
      }
    } catch {
      toast.error('Erreur de connexion');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#2ecc71] animate-spin" />
    </div>
  );

  if (!ride) return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col items-center justify-center p-4">
      <p className="text-gray-400">Course introuvable</p>
      <button onClick={() => navigate('/driver')} className="mt-4 text-[#2ecc71] text-sm">Retour</button>
    </div>
  );

  const sc = statusConfig[ride.status] || statusConfig.pending;
  const StatusIcon = sc.icon;
  const showReviewForm = ride.status === 'completed' && !existingReview;
  const commentRequired = reviewRating > 0 && reviewRating < 5;

  return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col" data-testid="ride-detail-page">
      <header className="bg-[#1a2332] border-b border-gray-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigate('/driver')} className="text-gray-400 hover:text-white transition" data-testid="back-btn">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white font-semibold text-sm">Detail de la Course</h1>
      </header>

      <div className="flex-1 px-4 py-5 space-y-4">
        {/* Status Banner */}
        <div className={`rounded-xl p-4 border ${sc.color}`} data-testid="ride-status">
          <div className="flex items-center gap-3 mb-2">
            <StatusIcon className="w-5 h-5" />
            <span className="font-bold text-sm">{sc.label}</span>
          </div>
          <p className="text-xs opacity-80">{sc.desc}</p>
        </div>

        {/* Route */}
        <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800 space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2ecc71]" /> Itineraire
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center mt-1">
                <div className="w-3 h-3 bg-green-400 rounded-full" />
                <div className="w-0.5 h-8 bg-gray-700 my-1" />
                <div className="w-3 h-3 bg-red-400 rounded-full" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Depart</p>
                  <p className="text-white text-sm">{ride.pickup_address}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Arrivee</p>
                  <p className="text-white text-sm">{ride.dropoff_address}</p>
                </div>
              </div>
            </div>
            {routeInfo && (
              <div className="bg-[#0f1419] rounded-lg p-3 flex items-center gap-4" data-testid="route-info">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#2ecc71]" />
                  <span className="text-white font-semibold text-sm">{routeInfo.distance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2ecc71]" />
                  <span className="text-white font-semibold text-sm">{routeInfo.duration}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle & Price */}
        <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
            <Car className="w-4 h-4 text-[#2ecc71]" /> Vehicule & Prix
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0f1419] rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Categorie</p>
              <p className="text-white font-medium text-sm">{ride.vehicle_category_name}</p>
            </div>
            <div className="bg-[#0f1419] rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Prix propose</p>
              <p className="text-[#2ecc71] font-bold text-lg">{ride.proposed_price} {ride.currency}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        {(ride.passenger_name || ride.passenger_phone || ride.pickup_datetime || ride.flight_number) && (
          <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-[#2ecc71]" /> Details
            </h3>
            <div className="space-y-2.5">
              {ride.passenger_name && (
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">{ride.passenger_name}</span>
                </div>
              )}
              {ride.passenger_phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">{ride.passenger_phone}</span>
                </div>
              )}
              {ride.pickup_datetime && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">{new Date(ride.pickup_datetime).toLocaleString('fr-FR')}</span>
                </div>
              )}
              {ride.flight_number && (
                <div className="flex items-center gap-3 text-sm">
                  <Plane className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-300">{ride.flight_number}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {ride.notes && (
          <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-[#2ecc71]" /> Notes
            </h3>
            <p className="text-gray-300 text-sm">{ride.notes}</p>
          </div>
        )}

        {/* Admin Notes */}
        {ride.admin_notes && (
          <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
            <h3 className="text-amber-400 font-semibold text-sm mb-2">Note de l'admin</h3>
            <p className="text-gray-300 text-sm">{ride.admin_notes}</p>
          </div>
        )}

        {/* REVIEW FORM - for completed rides without review */}
        {showReviewForm && (
          <div className="bg-[#1a2332] rounded-xl p-5 border-2 border-[#2ecc71]/30" data-testid="review-form">
            <h3 className="text-white font-semibold text-base flex items-center gap-2 mb-1">
              <Star className="w-5 h-5 text-yellow-400" /> Noter le Chauffeur
            </h3>
            <p className="text-gray-400 text-xs mb-4">Votre avis est obligatoire pour chaque course terminee</p>

            <div className="flex justify-center mb-4">
              <StarRating rating={reviewRating} setRating={setReviewRating} readOnly={false} />
            </div>

            {reviewRating > 0 && (
              <div className="text-center mb-4">
                <span className={`text-sm font-semibold ${reviewRating === 5 ? 'text-green-400' : reviewRating >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {reviewRating === 5 ? 'Excellent !' : reviewRating === 4 ? 'Bien' : reviewRating === 3 ? 'Correct' : reviewRating === 2 ? 'Insuffisant' : 'Tres mauvais'}
                </span>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-1.5">
                Commentaire {commentRequired ? <span className="text-red-400">* obligatoire</span> : <span className="text-gray-500">(optionnel)</span>}
              </label>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder={commentRequired ? 'Expliquez votre note (obligatoire)...' : 'Ajoutez un commentaire (optionnel)...'}
                className={`w-full px-4 py-3 bg-[#0f1419] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent text-sm resize-none ${
                  commentRequired && !reviewComment.trim() ? 'border-red-500/50' : 'border-gray-700'
                }`}
                rows={3}
                data-testid="review-comment"
              />
              {commentRequired && !reviewComment.trim() && (
                <p className="text-xs text-red-400 mt-1">Un commentaire est obligatoire pour une note de {reviewRating}/5</p>
              )}
            </div>

            <button onClick={handleSubmitReview} disabled={submittingReview || reviewRating === 0}
              data-testid="submit-review"
              className="w-full py-3.5 bg-[#2ecc71] text-white rounded-xl font-semibold text-sm hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#2ecc71]/20">
              {submittingReview ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi...</> : <><Send className="w-4 h-4" /> Envoyer l'Avis</>}
            </button>
          </div>
        )}

        {/* EXISTING REVIEW - already submitted */}
        {existingReview && (
          <div className="bg-[#1a2332] rounded-xl p-5 border border-gray-800" data-testid="existing-review">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-400" /> Votre Avis
            </h3>
            <div className="flex justify-center mb-3">
              <StarRating rating={existingReview.rating} setRating={() => {}} readOnly={true} />
            </div>
            {existingReview.comment && (
              <p className="text-gray-300 text-sm text-center italic">"{existingReview.comment}"</p>
            )}
            <p className="text-gray-500 text-xs text-center mt-3">
              {new Date(existingReview.created_at).toLocaleString('fr-FR')}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="text-center py-2">
          <p className="text-xs text-gray-600">Cree le {new Date(ride.created_at).toLocaleString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
};

export default RideDetail;
