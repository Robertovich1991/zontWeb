import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { MULTI_LANG_URLS } from './pageUrlMaps';

// Derives the page language from the URL (e.g. /fr/privacy -> fr) and keeps
// the global language context in sync. On the base EN URL, users with a
// non-EN preference are redirected to their language URL when it exists.
export const useLangRouting = (pageKey) => {
  const { language, changeLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const map = MULTI_LANG_URLS[pageKey];
  const clean = location.pathname.replace(/\/$/, '') || '/';
  const entry = Object.entries(map).find(([, p]) => p === clean);
  const urlLang = entry ? entry[0] : 'en';

  // URL-driven sync: only when the pathname changes, never when the user
  // changes the language (avoids fighting the header language switcher).
  useEffect(() => {
    if (urlLang !== 'en' && language !== urlLang) changeLanguage(urlLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clean]);

  // Preference-driven redirect: on the base EN URL, users whose language
  // preference has a dedicated URL are sent to it.
  useEffect(() => {
    if (urlLang === 'en' && language !== 'en' && map[language]) {
      navigate(map[language], { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clean, language]);

  return urlLang;
};
