import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverAuth } from './DriverAuthContext';
import { Loader2, AlertCircle, Car, UserPlus, LogIn } from 'lucide-react';

const inputClass = "w-full px-4 py-3.5 bg-[#1a2332] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:border-transparent text-sm";

const DriverLogin = () => {
  const { login, register, partner } = useDriverAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  useEffect(() => {
    if (partner) navigate('/driver', { replace: true });
  }, [partner, navigate]);

  const handleLogin = async (e) => {
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!regName || !regEmail || !regPassword) {
      setError('Veuillez remplir les champs obligatoires');
      return;
    }
    if (regPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        company: regCompany,
        password: regPassword,
      });
      navigate('/driver', { replace: true });
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => { setMode(m); setError(''); };

  return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col" data-testid="driver-login-page">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#2ecc71]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-[#2ecc71]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Zont Partner</h1>
            <p className="text-gray-400 text-sm mt-1">Espace chauffeurs et partenaires</p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-[#1a2332] rounded-xl p-1 border border-gray-800 mb-5">
            <button onClick={() => switchMode('login')} data-testid="tab-login"
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${mode === 'login' ? 'bg-[#2ecc71] text-white' : 'text-gray-400 hover:text-white'}`}>
              <LogIn className="w-4 h-4" /> Connexion
            </button>
            <button onClick={() => switchMode('register')} data-testid="tab-register"
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${mode === 'register' ? 'bg-[#2ecc71] text-white' : 'text-gray-400 hover:text-white'}`}>
              <UserPlus className="w-4 h-4" /> Inscription
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2" data-testid="auth-error">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4" data-testid="driver-login-form">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="votre@email.com" className={inputClass} data-testid="driver-email" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Mot de passe</label>
                <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Votre mot de passe" className={inputClass} data-testid="driver-password" />
              </div>
              <button type="submit" disabled={loading} data-testid="driver-login-submit"
                className="w-full bg-[#2ecc71] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#2ecc71]/20 mt-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Connexion...</> : 'Se connecter'}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3" data-testid="driver-register-form">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Nom complet *</label>
                <input type="text" value={regName} onChange={e => { setRegName(e.target.value); setError(''); }}
                  placeholder="Prenom Nom" className={inputClass} data-testid="reg-name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Email *</label>
                <input type="email" value={regEmail} onChange={e => { setRegEmail(e.target.value); setError(''); }}
                  placeholder="votre@email.com" className={inputClass} data-testid="reg-email" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Telephone</label>
                <input type="tel" value={regPhone} onChange={e => { setRegPhone(e.target.value); setError(''); }}
                  placeholder="+33 6 12 34 56 78" className={inputClass} data-testid="reg-phone" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Entreprise</label>
                <input type="text" value={regCompany} onChange={e => { setRegCompany(e.target.value); setError(''); }}
                  placeholder="Nom de votre societe (optionnel)" className={inputClass} data-testid="reg-company" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Mot de passe *</label>
                <input type="password" value={regPassword} onChange={e => { setRegPassword(e.target.value); setError(''); }}
                  placeholder="Minimum 6 caracteres" className={inputClass} data-testid="reg-password" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Confirmer mot de passe *</label>
                <input type="password" value={regConfirm} onChange={e => { setRegConfirm(e.target.value); setError(''); }}
                  placeholder="Confirmez votre mot de passe" className={inputClass} data-testid="reg-confirm" />
              </div>
              <button type="submit" disabled={loading} data-testid="driver-register-submit"
                className="w-full bg-[#2ecc71] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#27ae60] transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#2ecc71]/20 mt-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Inscription...</> : <><UserPlus className="w-4 h-4" /> Creer mon compte</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverLogin;
