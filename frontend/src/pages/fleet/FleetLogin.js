import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useFleetAuth } from './FleetAuthContext';
import { Loader2, Mail, Lock, Truck } from 'lucide-react';
import { toast } from 'sonner';

const FleetLogin = () => {
  const { login, isAuthenticated } = useFleetAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/fleet" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Connexion reussie');
      navigate('/fleet');
    } catch (err) {
      toast.error(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" data-testid="fleet-login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mb-4">
            <Truck className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Espace Societe</h1>
          <p className="text-gray-500 mt-2">Connectez-vous pour gerer votre flotte</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5 shadow-sm">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-sm"
                placeholder="email@societe.fr" data-testid="fleet-login-email" />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-sm"
                placeholder="Mot de passe" data-testid="fleet-login-password" />
            </div>
          </div>
          <button type="submit" disabled={loading} data-testid="fleet-login-submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Se connecter
          </button>
        </form>
        <p className="text-center text-gray-400 text-xs mt-6">fleet.zont.cab — Plateforme Societe</p>
      </div>
    </div>
  );
};

export default FleetLogin;
