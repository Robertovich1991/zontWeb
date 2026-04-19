import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import { MapPin, Calendar, Car, Clock, Loader2, AlertCircle, Navigation, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

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

const MyBookings = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth check to finish
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    const fetchBookings = () => {
      const token = localStorage.getItem('auth_token');
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${API}/api/proxy/booking/upcoming`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            setBookings(Array.isArray(data) ? data : []);
          } catch { setBookings([]); }
        } else if (xhr.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
        } else {
          setError('Impossible de charger vos reservations');
        }
        setLoading(false);
      };
      xhr.onerror = () => { setError('Erreur de connexion'); setLoading(false); };
      xhr.send();
    };
    fetchBookings();
  }, [isAuthenticated, authLoading, navigate]);

  const handleCancelBooking = (bookingId) => {
    if (!bookingId) return;
    if (!window.confirm('Voulez-vous vraiment annuler cette reservation ?')) return;
    setCancellingId(bookingId);
    const token = localStorage.getItem('auth_token');
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `${API}/api/proxy/booking/cancel/${bookingId}`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setBookings(prev => prev.filter(b => (b.id || b.auctionId) !== bookingId));
        toast.success('Reservation annulee avec succes');
      } else {
        let errMsg = 'Impossible d\'annuler cette reservation';
        try {
          const data = JSON.parse(xhr.responseText);
          if (typeof data?.detail === 'string') errMsg = data.detail;
        } catch {}
        toast.error(errMsg);
      }
      setCancellingId(null);
    };
    xhr.onerror = () => { toast.error('Erreur de connexion'); setCancellingId(null); };
    xhr.send();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

  const getStatus = (booking) => {
    const s = booking.status ?? booking.auctionStatus;
    return statusLabels[s] || { label: String(s), color: 'bg-gray-500/10 text-gray-400 border-gray-500/30' };
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a]" data-testid="my-bookings-page">
      <Header />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Mes Reservations</h1>
          <button onClick={() => navigate('/')} data-testid="new-booking-btn"
            className="px-4 py-2 bg-[#c8a951] text-black rounded-lg text-sm font-semibold hover:bg-[#d4b85c] transition">
            Nouvelle reservation
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#c8a951] animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-400">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-[#1a2332] border border-gray-800 rounded-xl p-10 text-center" data-testid="no-bookings">
            <Navigation className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-white font-semibold text-lg mb-2">Aucune reservation</h2>
            <p className="text-gray-400 text-sm mb-6">Vous n'avez pas encore de courses a venir.</p>
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-[#c8a951] text-black rounded-xl font-semibold hover:bg-[#d4b85c] transition">
              Reserver une course
            </button>
          </div>
        ) : (
          <div className="space-y-4" data-testid="bookings-list">
            {bookings.map((b, i) => {
              const st = getStatus(b);
              return (
                <div key={b.id || i} className="bg-[#1a2332] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition" data-testid={`booking-card-${i}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-[#c8a951]" />
                      <span className="text-white font-semibold text-sm">{b.carType || b.tripType || 'VTC'}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${st.color}`}>{st.label}</span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">{b.startAddress || b.fromAddress || 'Depart'}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                      <p className="text-gray-300 text-sm">{b.endAddress || b.destination || 'Arrivee'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(b.startDate || b.date)}</span>
                    </div>
                    {(b.distance || b.km) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{b.distance || b.km} km</span>
                      </div>
                    )}
                    {(b.clientPrice || b.price) && (
                      <span className="text-[#c8a951] font-bold text-sm">{b.clientPrice || b.price} EUR</span>
                    )}
                    {/* Cancel button — only for non-cancelled, non-completed bookings */}
                    {st.label !== 'Annulee' && st.label !== 'Terminee' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCancelBooking(b.id || b.auctionId); }}
                        disabled={cancellingId === (b.id || b.auctionId)}
                        className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                        data-testid={`cancel-booking-${i}`}
                      >
                        {cancellingId === (b.id || b.auctionId) ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
