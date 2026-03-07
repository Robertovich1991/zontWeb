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
    // Get language from localStorage or browser
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (['en', 'fr', 'ru'].includes(browserLang)) {
        setLanguage(browserLang);
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
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return value || key;
  };

  const value = {
    language,
    changeLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
