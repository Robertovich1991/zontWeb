import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverAuth } from './DriverAuthContext';
import { Loader2, AlertCircle, Car } from 'lucide-react';

const DriverLogin = () => {
  const { login, partner } = useDriverAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (partner) navigate('/driver', { replace: true });
  }, [partner, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Veuillez remplir tous les champs'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/driver', { replace: true });
    } catch (err) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col" data-testid="driver-login-page">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#2ecc71]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-[#2ecc71]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Zont Partner</h1>
            <p className="text-gray-400 text-sm mt-1">Espace chauffeurs et partenaires</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2" data-testid="login-error">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="driver-login-form">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="votre@email.com"
                className="w-full px-4 py-3.5 bg-[#1a2332] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent text-sm"
                data-testid="driver-email" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Mot de passe</label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Votre mot de passe"
                className="w-full px-4 py-3.5 bg-[#1a2332] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent text-sm"
                data-testid="driver-password" />
            </div>
            <button type="submit" disabled={loading} data-testid="driver-login-submit"
              className="w-full bg-[#2ecc71] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#2ecc71]/20 mt-6">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Connexion...</> : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-8">
            Contactez l'administrateur pour obtenir vos identifiants
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverLogin;
