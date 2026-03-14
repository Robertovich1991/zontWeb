import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import { User, Mail, Phone, CreditCard, Calendar, Car, MapPin, Navigation, Loader2, AlertCircle, ChevronRight, Shield } from 'lucide-react';

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

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
};

const MyAccount = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/'); return; }
    const token = localStorage.getItem('auth_token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API}/api/proxy/client/profile`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/api/proxy/booking/upcoming`, { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([prof, bk]) => {
      setProfile(prof);
      setBookings(Array.isArray(bk) ? bk : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <Header />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="w-8 h-8 text-[#c8a951] animate-spin" />
        </div>
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
              <p className="text-gray-400 text-sm">{profile?.email || user?.email || ''}</p>
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
                <div className="flex items-center gap-4 p-4 bg-[#0f1419] rounded-xl">
                  <User className="w-5 h-5 text-[#c8a951]" />
                  <div>
                    <p className="text-xs text-gray-500">Nom complet</p>
                    <p className="text-white font-medium">{profile ? `${profile.firstName} ${profile.lastName}`.trim() : '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-[#0f1419] rounded-xl">
                  <Mail className="w-5 h-5 text-[#c8a951]" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-white font-medium">{profile?.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-[#0f1419] rounded-xl">
                  <Phone className="w-5 h-5 text-[#c8a951]" />
                  <div>
                    <p className="text-xs text-gray-500">Telephone</p>
                    <p className="text-white font-medium">{profile?.phoneNumber || '-'}</p>
                  </div>
                </div>
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
                return (
                  <div key={b.id || i} className="bg-[#1a2332] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition" data-testid={`booking-${i}`}>
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
                      {(b.clientPrice || b.price) && (
                        <span className="ml-auto text-[#c8a951] font-bold text-sm">{b.clientPrice || b.price} EUR</span>
                      )}
                    </div>
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
              <h2 className="text-white font-semibold mb-4">Carte bancaire</h2>
              {profile?.defaultCardId ? (
                <div className="bg-[#0f1419] border border-gray-700 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Carte enregistree</p>
                    <p className="text-gray-500 text-xs">ID: {profile.defaultCardId.slice(-8)}</p>
                  </div>
                  <div className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs border border-green-500/30">
                    Active
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm mb-4">Aucune carte enregistree</p>
                  <p className="text-gray-500 text-xs">Votre carte sera enregistree lors de votre premiere reservation.</p>
                </div>
              )}
            </div>
            <div className="bg-[#1a2332] rounded-xl p-4 border border-gray-800">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-400 text-xs">Vos donnees de paiement sont securisees par <span className="text-white font-medium">Stripe</span>. Nous ne stockons jamais vos informations bancaires.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;
