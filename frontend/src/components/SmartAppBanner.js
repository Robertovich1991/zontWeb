import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Download } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

// Routes where the banner must never appear (portals not for end-customers)
const EXCLUDED_PREFIXES = ['/admin', '/fleet', '/hotel', '/kiosk', '/driver', '/gps-admin', '/super-admin'];

const APP_STORE_URL = 'https://apps.apple.com/am/app/zont-cab/id1468482270';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.zont.rider';
const STORAGE_KEY = 'zont_app_banner_dismissed_at';
const DISMISS_DAYS = 30;

const detectDevice = () => {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent || navigator.vendor || '';
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
  return 'desktop';
};

const TEXTS = {
  fr: {
    title: 'Telechargez l\'application Zont',
    subtitle: 'Plus rapide, notifications en temps reel et reservations en 2 clics',
    feature1: 'Reservation 2x plus rapide',
    feature2: 'Notifications chauffeur live',
    feature3: 'Historique & favoris',
    cta: 'Telecharger l\'application',
    later: 'Plus tard',
    ratingLabel: 'Note moyenne',
    downloads: '50 000+ telechargements',
  },
  en: {
    title: 'Download the Zont app',
    subtitle: 'Faster booking, live driver updates, one-tap rebook',
    feature1: '2x faster booking',
    feature2: 'Live driver notifications',
    feature3: 'History & favorites',
    cta: 'Download the app',
    later: 'Not now',
    ratingLabel: 'Average rating',
    downloads: '50,000+ downloads',
  },
  ru: {
    title: 'Скачайте приложение Zont',
    subtitle: 'Быстрее, уведомления в реальном времени и заказ в 2 клика',
    feature1: 'Бронирование в 2 раза быстрее',
    feature2: 'Уведомления водителя в реальном времени',
    feature3: 'История и избранное',
    cta: 'Скачать приложение',
    later: 'Позже',
    ratingLabel: 'Средняя оценка',
    downloads: '50 000+ загрузок',
  },
  hy: {
    title: 'Ներբեռնեք Zont հավելվածը',
    subtitle: 'Ավելի արագ, ուղիղ ծանուցումներ և ամրագրում 2 կտտոցով',
    feature1: 'Ամրագրումն 2 անգամ ավելի արագ',
    feature2: 'Վարորդի ուղիղ ծանուցումներ',
    feature3: 'Պատմություն և սիրելիներ',
    cta: 'Ներբեռնել հավելվածը',
    later: 'Ավելի ուշ',
    ratingLabel: 'Միջին գնահատական',
    downloads: '50 000+ ներբեռնում',
  },
};

const SmartAppBanner = () => {
  const { lang } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState('desktop');

  useEffect(() => {
    // Skip on excluded internal portals
    if (EXCLUDED_PREFIXES.some(p => location.pathname.startsWith(p))) return;

    // Only show on mobile devices
    const d = detectDevice();
    if (d === 'desktop') return;

    // Respect previous dismissal (30 days)
    try {
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      if (dismissedAt) {
        const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / 86400000;
        if (daysSince < DISMISS_DAYS) return;
      }
    } catch (e) { /* ignore localStorage errors (private mode) */ }

    setDevice(d);
    // Delay opening to avoid competing with first paint
    const t = setTimeout(() => setOpen(true), 2500);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, Date.now().toString()); } catch (e) {}
    setOpen(false);
  };

  const handleDownload = () => {
    try { localStorage.setItem(STORAGE_KEY, Date.now().toString()); } catch (e) {}
    const url = device === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  if (!open) return null;
  const t = TEXTS[lang] || TEXTS.fr;
  const storeName = device === 'ios' ? 'App Store' : 'Google Play';

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" data-testid="smart-app-banner-overlay" onClick={dismiss}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)' }}
        data-testid="smart-app-banner-modal"
      >
        {/* Header with brand */}
        <div className="relative bg-gradient-to-br from-[#0b1120] via-[#1a2540] to-[#0b1120] px-6 pt-6 pb-8 text-center">
          <button onClick={dismiss} aria-label="Close" data-testid="smart-app-banner-close" className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl mb-3" style={{ boxShadow: '0 10px 40px rgba(46,204,113,0.35)' }}>
            <img src="/icons/icon-192.png" alt="Zont" className="w-14 h-14 rounded-2xl" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-3xl font-black text-[#2ecc71]" style={{ fontFamily: 'Arial Black' }}>Z</span>
          </div>
          <h2 className="text-white text-2xl font-bold leading-tight" data-testid="smart-app-banner-title">{t.title}</h2>
          <p className="text-gray-300 text-sm mt-1.5">{t.subtitle}</p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="text-yellow-400 font-bold text-sm">★ 4.5</span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-gray-400 text-xs">{t.downloads}</span>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 py-5 space-y-2.5">
          {[t.feature1, t.feature2, t.feature3].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#2ecc71]/15 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-gray-800 text-sm font-medium">{f}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="px-6 pb-6 space-y-2">
          <button onClick={handleDownload} data-testid="smart-app-banner-download" className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#2ecc71]/30">
            <Download className="w-5 h-5" />
            {t.cta} ({storeName})
          </button>
          <button onClick={dismiss} data-testid="smart-app-banner-later" className="w-full text-gray-500 hover:text-gray-700 font-medium py-2.5 text-sm transition-colors">
            {t.later}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SmartAppBanner;
