// Centralised registry of multi-language URLs for SEO.
// Each entry maps an internal "page key" to per-language URLs.
// Used by:
//  - Header language switcher (redirects on lang change when on a translated page)
//  - Page components (derive the right language from the current path)
//  - SEO components (canonical + hreflang)

export const MULTI_LANG_URLS = {
  disposal: {
    en: '/driver-at-disposal',
    fr: '/chauffeur-mis-a-disposition',
    ru: '/voditel-s-avtomobilem',
    hy: '/varorde-tramadrutyamb',
  },
  hotels: {
    en: '/hotel-booking-kiosk',
    fr: '/borne-reservation-hotel',
    ru: '/terminal-bronirovaniya-otel',
    hy: '/hyuranots-kropak',
  },
};

// Vehicle sub-slug maps for the disposal pages (used to build full sub-paths).
export const DISPOSAL_VEHICLE_SLUGS = {
  'mercedes-s-class': {
    en: 'mercedes-s-class',
    fr: 'mercedes-classe-s',
    ru: 'mercedes-s-class',
    hy: 'mercedes-s-class',
  },
  'mercedes-e-class': {
    en: 'mercedes-e-class',
    fr: 'mercedes-classe-e',
    ru: 'mercedes-e-class',
    hy: 'mercedes-e-class',
  },
  'mercedes-v-class': {
    en: 'mercedes-v-class',
    fr: 'mercedes-classe-v',
    ru: 'mercedes-v-class',
    hy: 'mercedes-v-class',
  },
  'renault-trafic': {
    en: 'renault-trafic',
    fr: 'renault-trafic',
    ru: 'renault-trafic',
    hy: 'renault-trafic',
  },
};

// Given a pathname, find which page-key + language it corresponds to.
// Returns { pageKey, language, vehicleId } or null.
export const matchPathToLanguage = (pathname) => {
  if (!pathname) return null;
  const clean = pathname.replace(/\/$/, '') || '/';

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

  return null;
};

// Build the equivalent URL for a target language given the current pathname.
// Used by the language switcher to keep the user on the same page in the new lang.
export const buildTranslatedUrl = (pathname, targetLang) => {
  const match = matchPathToLanguage(pathname);
  if (!match) return null;
  const { pageKey, vehicleId } = match;

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
  return null;
};
