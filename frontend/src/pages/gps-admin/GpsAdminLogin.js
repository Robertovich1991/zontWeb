import React, { useState } from 'react';
import { useGpsAdmin } from './GpsAdminAuthContext';
import { Navigate } from 'react-router-dom';
import { Navigation, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const GpsAdminLogin = () => {
  const { isAuthenticated, login } = useGpsAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/gps-admin/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <Navigation className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">GPS Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion des traceurs & societes</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="gps@zont.cab" required
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              data-testid="gps-admin-email-input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none pr-10"
                data-testid="gps-admin-password-input" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} data-testid="gps-admin-login-btn"
            className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium text-sm hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default GpsAdminLogin;
