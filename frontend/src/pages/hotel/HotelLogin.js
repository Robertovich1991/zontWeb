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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" data-testid="hotel-login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Espace Hotel</h1>
          <p className="text-gray-500 text-sm mt-1">Connectez-vous pour acceder a votre tableau de bord</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4" data-testid="hotel-login-form">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@hotel.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                data-testid="hotel-login-email" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                data-testid="hotel-login-password" />
            </div>
          </div>
          <button type="submit" disabled={loading} data-testid="hotel-login-submit"
            className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Se connecter
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">Powered by <span className="font-semibold text-gray-600">Zont.cab</span> Hotel Kiosk</p>
      </div>
    </div>
  );
};

export default HotelLogin;
