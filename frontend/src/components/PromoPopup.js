import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { X, Gift, Clock, Tag, Check } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const labels = {
  fr: {
    title: 'Bienvenue !',
    subtitle: 'Obtenez -10% sur votre transfert',
    placeholder: 'Votre adresse email',
    cta: 'Appliquer ma reduction',
    loading: 'Application...',
    bannerText: 'Code {code} applique',
    bannerExpiry: 'Expire dans',
    expired: 'Code expire',
    error: 'Email invalide',
    hint: 'Entrez votre email pour recevoir votre code de bienvenue',
  },
  en: {
    title: 'Welcome!',
    subtitle: 'Get -10% on your transfer',
    placeholder: 'Your email address',
    cta: 'Apply my discount',
    loading: 'Applying...',
    bannerText: 'Code {code} applied',
    bannerExpiry: 'Expires in',
    expired: 'Code expired',
    error: 'Invalid email',
    hint: 'Enter your email to get your welcome code',
  },
  ru: {
    title: 'Dobro pozhalovat!',
    subtitle: 'Poluchite -10% na transfer',
    placeholder: 'Vash email',
    cta: 'Primenit skidku',
    loading: 'Primenenie...',
    bannerText: 'Kod {code} primenen',
    bannerExpiry: 'Istekaet cherez',
    expired: 'Kod istek',
    error: 'Nevernyj email',
    hint: 'Vvedite email dlya polucheniya koda',
  },
};

const formatTime = (seconds) => {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ─── Popup: asks for email, generates code, applies discount ───
export const PromoPopup = ({ open, onClose, onApply }) => {
  const { language } = useLanguage();
  const c = labels[language] || labels.en;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError(c.error);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resp = await fetch(`${API}/api/promo/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await resp.json();
      if (data.error) {
        setError(data.error);
      } else {
        // Store in localStorage so popup doesn't show again
        localStorage.setItem('promo_code', data.code);
        localStorage.setItem('promo_expires', data.expires_at);
        localStorage.setItem('promo_discount', String(data.discount));
        localStorage.setItem('promo_email', email.trim());
        onApply(data.code, data.discount, data.expires_at);
        onClose();
      }
    } catch {
      setError('Erreur reseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" data-testid="promo-popup-overlay">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" data-testid="promo-popup">
        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10" data-testid="promo-close-btn">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-5 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-0.5">{c.title}</h3>
          <p className="text-emerald-100 text-base font-semibold">{c.subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5">
          <p className="text-gray-500 text-xs text-center mb-3">{c.hint}</p>
          <div className="mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={c.placeholder}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none transition-colors text-sm"
              data-testid="promo-email-input"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            data-testid="promo-apply-btn"
          >
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{c.loading}</>
            ) : (
              <><Tag className="w-5 h-5" />{c.cta}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Banner: shows applied code + countdown ───
export const PromoBanner = ({ code, expiresAt, discount, onExpired }) => {
  const { language } = useLanguage();
  const c = labels[language] || labels.en;
  const [remaining, setRemaining] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const calcRemaining = () => {
      const exp = new Date(expiresAt).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((exp - now) / 1000));
    };

    setRemaining(calcRemaining());
    timerRef.current = setInterval(() => {
      const r = calcRemaining();
      setRemaining(r);
      if (r <= 0) {
        clearInterval(timerRef.current);
        if (onExpired) onExpired();
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [expiresAt, onExpired]);

  if (remaining <= 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-red-600 text-sm font-medium" data-testid="promo-expired-banner">
        <Clock className="w-4 h-4" />
        {c.expired}
      </div>
    );
  }

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1" data-testid="promo-active-banner">
      <div className="flex items-center gap-2">
        <Check className="w-4 h-4 text-emerald-600" />
        <span className="text-emerald-700 text-sm font-semibold">{c.bannerText.replace('{code}', code)}</span>
        <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>
      </div>
      <div className="flex items-center gap-1.5 text-emerald-600">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">{c.bannerExpiry}: <b className="text-emerald-700 font-mono">{formatTime(remaining)}</b></span>
      </div>
    </div>
  );
};
