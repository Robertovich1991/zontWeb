// Centralised registry of multi-language URLs for SEO.
// Each entry maps an internal "page key" to per-language URLs.
// Used by:
//  - Header language switcher (redirects on lang change when on a translated page)
//  - Page components (derive the right language from the current path)
//  - SEO components (canonical + hreflang)

export const MULTI_LANG_URLS = {
  home: {
    en: '/',
    fr: '/fr',
    ru: '/ru',
    hy: '/hy',
    es: '/es',
  },
  disposal: {
    en: '/driver-at-disposal',
    fr: '/chauffeur-mis-a-disposition',
    ru: '/voditel-s-avtomobilem',
    hy: '/varorde-tramadrutyamb',
    es: '/es/chofer-privado-a-disposicion',
  },
  hotels: {
    en: '/hotel-booking-kiosk',
    fr: '/borne-reservation-hotel',
    ru: '/terminal-bronirovaniya-otel',
    hy: '/hyuranots-kropak',
  },
  partners: {
    en: '/b2b-airport-transfers',
    fr: '/b2b-transferts-aeroport',
    ru: '/b2b-transfery-iz-aeroporta',
    hy: '/b2b-odanavakayani-transfer',
  },
  mice: {
    en: '/mice-transportation-paris',
    fr: '/transport-mice-paris',
    ru: '/mice-transport-parij',
  },
};

// Vehicle sub-slug maps for the disposal pages (used to build full sub-paths).
export const DISPOSAL_VEHICLE_SLUGS = {
  'mercedes-s-class': {
    en: 'mercedes-s-class',
    fr: 'mercedes-classe-s',
    ru: 'mercedes-s-class',
    hy: 'mercedes-s-class',
    es: 'mercedes-clase-s',
  },
  'mercedes-e-class': {
    en: 'mercedes-e-class',
    fr: 'mercedes-classe-e',
    ru: 'mercedes-e-class',
    hy: 'mercedes-e-class',
    es: 'mercedes-clase-e',
  },
  'mercedes-v-class': {
    en: 'mercedes-v-class',
    fr: 'mercedes-classe-v',
    ru: 'mercedes-v-class',
    hy: 'mercedes-v-class',
    es: 'mercedes-clase-v',
  },
  'renault-trafic': {
    en: 'renault-trafic',
    fr: 'renault-trafic',
    ru: 'renault-trafic',
    hy: 'renault-trafic',
    es: 'renault-trafic',
  },
};

// Given a pathname, find which page-key + language it corresponds to.
// Returns { pageKey, language, vehicleId } or null.
export const matchPathToLanguage = (pathname) => {
  if (!pathname) return null;
  const clean = pathname.replace(/\/$/, '') || '/';

  // 0) home pages (per language)
  for (const [lang, path] of Object.entries(MULTI_LANG_URLS.home)) {
    if (clean === path || (path === '/' && clean === '')) return { pageKey: 'home', language: lang };
  }

  // 1) disposal main pages
  for (const [lang, path] of Object.entries(MULTI_LANG_URLS.disposal)) {
    if (clean === path) return { pageKey: 'disposal', language: lang };
  }

  // 2) disposal vehicle sub-pages (e.g. /chauffeur-mis-a-disposition/mercedes-classe-v)
  for (const [lang, basePath] of Object.entries(MULTI_LANG_URLS.disposal)) {
    if (clean.startsWith(basePath + '/')) {
      const slug = clean.slice(basePath.length + 1);
      for (const [vehicleId, slugMap] of Object.entries(DISPOSAL_VEHICLE_SLUGS)) {
        if (slugMap[lang] === slug) {
          return { pageKey: 'disposalVehicle', language: lang, vehicleId };
        }
      }
    }
  }

  // 3) hotels
  for (const [lang, path] of Object.entries(MULTI_LANG_URLS.hotels)) {
    if (clean === path) return { pageKey: 'hotels', language: lang };
  }
  // legacy /hotels — default to FR (since this is the most-used in the business)
  if (clean === '/hotels') return { pageKey: 'hotels', language: 'fr' };

  // 4) partners (B2B airport transfers)
  for (const [lang, path] of Object.entries(MULTI_LANG_URLS.partners)) {
    if (clean === path) return { pageKey: 'partners', language: lang };
  }
  // legacy /partners — default to FR
  if (clean === '/partners') return { pageKey: 'partners', language: 'fr' };

  return null;
};

// Build the equivalent URL for a target language given the current pathname.
// Used by the language switcher to keep the user on the same page in the new lang.
export const buildTranslatedUrl = (pathname, targetLang) => {
  const match = matchPathToLanguage(pathname);
  if (!match) return null;
  const { pageKey, vehicleId } = match;

  if (pageKey === 'home') {
    return MULTI_LANG_URLS.home[targetLang] || MULTI_LANG_URLS.home.en;
  }
  if (pageKey === 'disposal') {
    return MULTI_LANG_URLS.disposal[targetLang] || MULTI_LANG_URLS.disposal.en;
  }
  if (pageKey === 'disposalVehicle' && vehicleId) {
    const base = MULTI_LANG_URLS.disposal[targetLang] || MULTI_LANG_URLS.disposal.en;
    const slug = DISPOSAL_VEHICLE_SLUGS[vehicleId][targetLang] || DISPOSAL_VEHICLE_SLUGS[vehicleId].en;
    return `${base}/${slug}`;
  }
  if (pageKey === 'hotels') {
    return MULTI_LANG_URLS.hotels[targetLang] || MULTI_LANG_URLS.hotels.en;
  }
  if (pageKey === 'partners') {
    return MULTI_LANG_URLS.partners[targetLang] || MULTI_LANG_URLS.partners.en;
  }
  return null;
};
