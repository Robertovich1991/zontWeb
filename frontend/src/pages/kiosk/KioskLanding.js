import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, LogIn, Building2, Mail, Lock, MapPin } from 'lucide-react';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';

const API = process.env.REACT_APP_BACKEND_URL;

const fmtErr = (d, fallback) => {
  if (!d) return fallback;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return d.map(e => (e && e.msg) ? e.msg : '').filter(Boolean).join(' ') || fallback;
  return d.msg || fallback;
};

const KioskLanding = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState({ lat: null, lng: null });

  const inputCls = "w-full pl-11 pr-4 py-3.5 bg-[#111827] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2ecc71] text-base";

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/api/hotel/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(fmtErr(d.detail, 'Connexion echouee'));
      if (!d.kiosk_slug) throw new Error("Ce compte n'a pas de borne associee. Inscrivez-vous ou contactez l'administrateur.");
      navigate(`/kiosk/${d.kiosk_slug}`);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!hotelName.trim() || !email.trim() || !password.trim()) { setError('Tous les champs sont requis'); return; }
    if (!coords.lat || !coords.lng) { setError("Selectionnez l'adresse dans la liste pour recuperer la position GPS"); return; }
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API}/api/hotel/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, hotelName: hotelName.trim(), address, lat: coords.lat, lng: coords.lng }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(fmtErr(d.detail, 'Inscription echouee'));
      navigate(`/kiosk/${d.kiosk_slug}`);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] flex flex-col items-center justify-center px-5 py-10" data-testid="kiosk-landing">
      <div className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">ZONT <span className="text-[#2ecc71]">Kiosk</span></h1>
        <p className="text-gray-400 mt-2 text-base">Bornes de reservation pour hotels</p>
      </div>

      <div className="w-full max-w-md bg-[#0f1830] border border-white/[0.07] rounded-3xl p-7 shadow-2xl">
        <div className="grid grid-cols-2 gap-2 mb-7 bg-[#111827] p-1.5 rounded-xl">
          <button onClick={() => { setMode('login'); setError(''); }} data-testid="tab-login"
            className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${mode === 'login' ? 'bg-[#2ecc71] text-white' : 'text-gray-400 hover:text-white'}`}>Connexion</button>
          <button onClick={() => { setMode('register'); setError(''); }} data-testid="tab-register"
            className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${mode === 'register' ? 'bg-[#2ecc71] text-white' : 'text-gray-400 hover:text-white'}`}>Inscription</button>
        </div>

        {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm" data-testid="kiosk-auth-error">{error}</div>}

        <div className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="relative">
                <Building2 className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input value={hotelName} onChange={e => setHotelName(e.target.value)} placeholder="Nom de l'hotel (ex: Novotel Paris)" className={inputCls} data-testid="reg-hotel-name" />
              </div>
              <div className="relative">
                <MapPin className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
                <PlacesAutocomplete
                  value={address}
                  onChange={(v) => { setAddress(v.address || ''); setCoords({ lat: v.latitude, lng: v.longitude }); }}
                  placeholder="Adresse de l'hotel"
                  className={inputCls}
                  data-testid="reg-address"
                />
              </div>
            </>
          )}
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className={inputCls} data-testid="auth-email" />
          </div>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" className={inputCls} data-testid="auth-password"
              onKeyDown={e => { if (e.key === 'Enter') (mode === 'login' ? handleLogin() : handleRegister()); }} />
          </div>

          <button
            onClick={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading}
            className="w-full bg-[#2ecc71] text-white py-3.5 rounded-xl font-bold text-base hover:bg-[#27ae60] transition-colors disabled:bg-gray-700 disabled:text-gray-500 flex items-center justify-center gap-2 mt-2"
            data-testid={mode === 'login' ? 'submit-login' : 'submit-register'}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            {mode === 'login' ? 'Se connecter' : 'Creer ma borne'}
          </button>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">
          {mode === 'login'
            ? "Connectez-vous pour acceder a la borne de votre hotel."
            : "Une borne active est creee instantanement : /kiosk/votre-hotel"}
        </p>
      </div>
    </div>
  );
};

export default KioskLanding;
