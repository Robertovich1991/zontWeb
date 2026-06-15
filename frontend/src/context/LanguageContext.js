import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // 1. URL prefix takes precedence (for SEO + direct landings from Google).
    //    `/es...` => es, `/fr...` => fr, etc.
    const path = (typeof window !== 'undefined' ? window.location.pathname : '/') || '/';
    const urlLang =
      path === '/es' || path.startsWith('/es/') ? 'es' :
      path === '/fr' || path.startsWith('/fr/') ? 'fr' :
      path === '/ru' || path.startsWith('/ru/') ? 'ru' :
      path === '/hy' || path.startsWith('/hy/') ? 'hy' :
      null;
    if (urlLang) {
      setLanguage(urlLang);
      document.documentElement.lang = urlLang;
      return;
    }
    // 2. Otherwise use localStorage saved choice
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      setLanguage(savedLang);
      document.documentElement.lang = savedLang;
    } else {
      // 3. Final fallback to browser language
      const browserLang = navigator.language.split('-')[0];
      if (['en', 'fr', 'ru', 'hy', 'es'].includes(browserLang)) {
        setLanguage(browserLang);
        document.documentElement.lang = browserLang;
      } else {
        document.documentElement.lang = 'en';
      }
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key) => {
    const keys = key.split('.');
    // Resolve in current language, fallback to English when a key is missing (handy when adding new languages incrementally)
    const resolve = (root) => {
      let value = root;
      for (const k of keys) {
        if (value && typeof value === 'object') value = value[k];
        else return undefined;
      }
      return value;
    };
    const v = resolve(translations[language]);
    if (v !== undefined && v !== null) return v;
    if (language !== 'en') {
      const fallback = resolve(translations.en);
      if (fallback !== undefined && fallback !== null) return fallback;
    }
    return key;
  };

  const value = {
    language,
    changeLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
