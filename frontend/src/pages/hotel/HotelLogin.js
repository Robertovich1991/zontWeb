import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useHotelAuth } from './HotelAuthContext';
import { Building2, Loader2, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

const HotelLogin = () => {
  const { login, isAuthenticated } = useHotelAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/hotel" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Connexion reussie');
      navigate('/hotel');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col lg:flex-row" data-testid="hotel-login-page">
      {/* Image - banner on mobile, left panel on desktop */}
      <div className="h-48 sm:h-56 lg:h-auto lg:w-1/2 relative overflow-hidden">
        <img src="https://customer-assets.emergentagent.com/job_ef3426f2-dc72-4376-a61e-52efe878088e/artifacts/l4cdj4wc_1000136154.jpg"
          alt="Hotel Transfer" loading="lazy" className="w-full h-full object-cover object-bottom lg:object-center" />
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 lg:py-0">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Espace Hotel</h1>
            <p className="text-gray-400 text-sm mt-1">Connectez-vous pour acceder a votre tableau de bord</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-sm space-y-4" data-testid="hotel-login-form">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@hotel.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  data-testid="hotel-login-email" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  data-testid="hotel-login-password" />
              </div>
            </div>
            <button type="submit" disabled={loading} data-testid="hotel-login-submit"
              className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Se connecter
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">Powered by <span className="font-semibold text-gray-300">Zont.cab</span> Hotel Kiosk</p>
        </div>
      </div>
    </div>
  );
};

export default HotelLogin;
