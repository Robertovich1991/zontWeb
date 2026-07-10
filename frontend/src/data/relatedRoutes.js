// Related-routes registry — used by CityTransferPage to render an internal SEO linking block.
// For each pageId we declare:
//   • urls: localized URL for each language (en/fr/ru/hy/es)
//   • labels: localized human-readable link labels per language
//   • related: array of related pageIds (rendered in the "Related routes" block)
//
// Design goals:
//   - Every language gets internal HTML <a href> links to same-language pages (crucial for Google indexation of RU/HY/ES variants).
//   - Cross-linking topology: Paris airports ↔ Disneyland ↔ Gares. European cities cross-link with each other + Paris.

export const CITY_ROUTES = {
  cdg: {
    urls: { en: '/cdg-airport-transfer', fr: '/transfert-aeroport-cdg', ru: '/taksi-iz-aeroporta-cdg', hy: '/cdg-odanavakayani-transfer', es: '/es/traslado-aeropuerto-charles-de-gaulle' },
    labels: { en: 'Paris CDG Airport', fr: 'Paris CDG (Roissy)', ru: 'Париж CDG (Шарль-де-Голль)', hy: 'Փարիզ CDG', es: 'París CDG (Charles de Gaulle)' },
    related: ['orly', 'beauvais', 'disneyland', 'paris-airport', 'paris-train', 'gare-de-lyon', 'nice'],
  },
  orly: {
    urls: { en: '/orly-airport-transfer', fr: '/transfert-aeroport-orly', ru: '/taksi-iz-aeroporta-orli', hy: '/orli-odanavakayani-transfer', es: '/es/traslado-aeropuerto-orly' },
    labels: { en: 'Paris Orly Airport', fr: 'Paris Orly', ru: 'Париж Орли', hy: 'Փարիզ Orly', es: 'París Orly' },
    related: ['cdg', 'beauvais', 'disneyland', 'paris-airport', 'gare-de-lyon', 'gare-du-nord', 'nice'],
  },
  beauvais: {
    urls: { en: '/beauvais-airport-transfer', fr: '/transfert-aeroport-beauvais', ru: '/taksi-iz-aeroporta-bove', hy: '/bove-odanavakayani-transfer', es: '/es/traslado-aeropuerto-beauvais' },
    labels: { en: 'Paris Beauvais Airport', fr: 'Paris Beauvais', ru: 'Париж Бове', hy: 'Փարիզ Beauvais', es: 'París Beauvais' },
    related: ['cdg', 'orly', 'disneyland', 'paris-airport', 'gare-du-nord', 'nice'],
  },
  disneyland: {
    urls: { en: '/disneyland-paris-transfer', fr: '/transfert-disneyland-paris', ru: '/transfer-disneyland-parizh', hy: '/disneylend-pariz-transfer', es: '/es/traslado-disneyland-paris' },
    labels: { en: 'Disneyland Paris', fr: 'Disneyland Paris', ru: 'Диснейленд Париж', hy: 'Disneyland Փարիզ', es: 'Disneyland París' },
    related: ['cdg', 'orly', 'beauvais', 'paris-airport', 'gare-de-lyon', 'nice', 'monaco'],
  },
  'paris-airport': {
    urls: { en: '/paris-airport-transfer', fr: '/transfert-aeroport-paris', ru: '/transfer-aeroport-parizh', hy: '/pariz-odanavakayani-transfer', es: '/es/traslado-aeropuerto-paris' },
    labels: { en: 'Paris Airports', fr: 'Aéroports de Paris', ru: 'Аэропорты Парижа', hy: 'Փարիզի օդանավակայաններ', es: 'Aeropuertos de París' },
    related: ['cdg', 'orly', 'beauvais', 'disneyland', 'paris-train', 'nice', 'rome'],
  },
  'paris-train': {
    urls: { en: '/paris-train-station-transfer', fr: '/transfert-gare-paris', ru: '/transfer-vokzal-parizh', hy: '/pariz-kayarani-transfer', es: '/es/traslado-estaciones-tren-paris' },
    labels: { en: 'Paris Train Stations', fr: 'Gares de Paris', ru: 'Вокзалы Парижа', hy: 'Փարիզի կայարաններ', es: 'Estaciones de tren de París' },
    related: ['gare-de-lyon', 'gare-du-nord', 'gare-montparnasse', 'gare-saint-lazare', 'gare-est', 'cdg', 'disneyland'],
  },
  'gare-de-lyon': {
    urls: { en: '/gare-de-lyon-transfer', fr: '/transfert-gare-de-lyon', ru: '/transfer-gar-de-lion', hy: '/gar-de-lion-transfer', es: '/es/traslado-estacion-gare-de-lyon-paris' },
    labels: { en: 'Gare de Lyon', fr: 'Gare de Lyon', ru: 'Вокзал де Лион', hy: 'Gare de Lyon', es: 'Estación Gare de Lyon' },
    related: ['gare-du-nord', 'gare-montparnasse', 'gare-saint-lazare', 'gare-est', 'paris-train', 'cdg', 'disneyland'],
  },
  'gare-du-nord': {
    urls: { en: '/gare-du-nord-transfer', fr: '/transfert-gare-du-nord', ru: '/transfer-gar-dyu-nor', hy: '/gar-dyu-nor-transfer', es: '/es/traslado-estacion-gare-du-nord-paris' },
    labels: { en: 'Gare du Nord', fr: 'Gare du Nord', ru: 'Вокзал дю Нор', hy: 'Gare du Nord', es: 'Estación Gare du Nord' },
    related: ['gare-de-lyon', 'gare-montparnasse', 'gare-saint-lazare', 'gare-est', 'paris-train', 'cdg', 'orly'],
  },
  'gare-montparnasse': {
    urls: { en: '/gare-montparnasse-transfer', fr: '/transfert-gare-montparnasse', ru: '/transfer-gar-monparnas', hy: '/gar-monparnas-transfer', es: '/es/traslado-estacion-gare-montparnasse-paris' },
    labels: { en: 'Gare Montparnasse', fr: 'Gare Montparnasse', ru: 'Вокзал Монпарнас', hy: 'Gare Montparnasse', es: 'Estación Gare Montparnasse' },
    related: ['gare-de-lyon', 'gare-du-nord', 'gare-saint-lazare', 'gare-est', 'paris-train', 'orly', 'disneyland'],
  },
  'gare-saint-lazare': {
    urls: { en: '/gare-saint-lazare-transfer', fr: '/transfert-gare-saint-lazare', ru: '/transfer-gar-sen-lazar', hy: '/gar-sen-lazar-transfer', es: '/es/traslado-estacion-gare-saint-lazare-paris' },
    labels: { en: 'Gare Saint-Lazare', fr: 'Gare Saint-Lazare', ru: 'Вокзал Сен-Лазар', hy: 'Gare Saint-Lazare', es: 'Estación Gare Saint-Lazare' },
    related: ['gare-de-lyon', 'gare-du-nord', 'gare-montparnasse', 'gare-est', 'paris-train', 'cdg', 'disneyland'],
  },
  'gare-est': {
    urls: { en: '/gare-austerlitz-transfer', fr: '/transfert-gare-austerlitz', ru: '/transfer-gar-osterlits', hy: '/gar-osterlits-transfer', es: '/es/traslado-estacion-gare-austerlitz-paris' },
    labels: { en: 'Gare d\'Austerlitz', fr: 'Gare d\'Austerlitz', ru: 'Вокзал Аустерлиц', hy: 'Gare d\'Austerlitz', es: 'Estación Gare d\'Austerlitz' },
    related: ['gare-de-lyon', 'gare-du-nord', 'gare-montparnasse', 'gare-saint-lazare', 'paris-train', 'cdg', 'disneyland'],
  },
  nice: {
    urls: { en: '/nice-airport-transfer', fr: '/transfert-aeroport-nice', ru: '/taksi-iz-aeroporta-nitstsa', hy: '/nis-odanavakayani-transfer', es: '/es/traslado-aeropuerto-niza' },
    labels: { en: 'Nice Airport', fr: 'Nice Aéroport', ru: 'Ницца Аэропорт', hy: 'Նիս օդանավակայան', es: 'Aeropuerto de Niza' },
    related: ['cannes', 'monaco', 'milan', 'rome', 'barcelona', 'cdg', 'paris-airport'],
  },
  cannes: {
    urls: { en: '/cannes-airport-transfer', fr: '/transfert-aeroport-cannes', ru: '/taksi-iz-aeroporta-kanny', hy: '/kann-odanavakayani-transfer', es: '/es/traslado-aeropuerto-cannes' },
    labels: { en: 'Cannes Transfer', fr: 'Cannes', ru: 'Канны', hy: 'Կան', es: 'Cannes' },
    related: ['nice', 'monaco', 'milan', 'rome', 'barcelona', 'cdg', 'paris-airport'],
  },
  monaco: {
    urls: { en: '/monaco-airport-transfer', fr: '/transfert-aeroport-monaco', ru: '/taksi-iz-aeroporta-monako', hy: '/monako-odanavakayani-transfer', es: '/es/traslado-aeropuerto-monaco' },
    labels: { en: 'Monaco Transfer', fr: 'Monaco', ru: 'Монако', hy: 'Մոնակո', es: 'Mónaco' },
    related: ['nice', 'cannes', 'milan', 'rome', 'barcelona', 'cdg', 'paris-airport'],
  },
  milan: {
    urls: { en: '/milan-airport-transfer', fr: '/transfert-aeroport-milan', ru: '/taksi-iz-aeroporta-milan', hy: '/milan-odanavakayani-transfer', es: '/es/traslado-aeropuerto-milan' },
    labels: { en: 'Milan Airport', fr: 'Milan Aéroport', ru: 'Милан Аэропорт', hy: 'Միլան օդանավակայան', es: 'Aeropuerto de Milán' },
    related: ['rome', 'nice', 'monaco', 'barcelona', 'munich', 'cdg', 'paris-airport'],
  },
  rome: {
    urls: { en: '/rome-airport-transfer', fr: '/transfert-aeroport-rome', ru: '/taksi-iz-aeroporta-rim', hy: '/hrom-odanavakayani-transfer', es: '/es/traslado-aeropuerto-roma' },
    labels: { en: 'Rome Airport', fr: 'Rome Aéroport', ru: 'Рим Аэропорт', hy: 'Հռոմ օդանավակայան', es: 'Aeropuerto de Roma' },
    related: ['milan', 'nice', 'monaco', 'barcelona', 'berlin', 'cdg', 'paris-airport'],
  },
  barcelona: {
    urls: { en: '/barcelona-airport-transfer', fr: '/transfert-aeroport-barcelone', ru: '/taksi-iz-aeroporta-barselona', hy: '/barselona-odanavakayani-transfer', es: '/es/traslado-aeropuerto-barcelona' },
    labels: { en: 'Barcelona Airport', fr: 'Barcelone Aéroport', ru: 'Барселона Аэропорт', hy: 'Բարսելոնա օդանավակայան', es: 'Aeropuerto de Barcelona' },
    related: ['alicante', 'nice', 'monaco', 'milan', 'rome', 'cdg', 'paris-airport'],
  },
  alicante: {
    urls: { en: '/alicante-airport-transfer', fr: '/transfert-aeroport-alicante', ru: '/taksi-iz-aeroporta-alikante', hy: '/alikante-odanavakayani-transfer', es: '/es/traslado-aeropuerto-alicante' },
    labels: { en: 'Alicante Airport', fr: 'Alicante Aéroport', ru: 'Аликанте Аэропорт', hy: 'Ալիկանտե օդանավակայան', es: 'Aeropuerto de Alicante' },
    related: ['barcelona', 'nice', 'monaco', 'milan', 'rome', 'cdg', 'paris-airport'],
  },
  berlin: {
    urls: { en: '/berlin-airport-transfer', fr: '/transfert-aeroport-berlin', ru: '/taksi-iz-aeroporta-berlin', hy: '/berlin-odanavakayani-transfer', es: '/es/traslado-aeropuerto-berlin' },
    labels: { en: 'Berlin Airport', fr: 'Berlin Aéroport', ru: 'Берлин Аэропорт', hy: 'Բեռլին օդանավակայան', es: 'Aeropuerto de Berlín' },
    related: ['munich', 'milan', 'rome', 'barcelona', 'cdg', 'paris-airport'],
  },
  munich: {
    urls: { en: '/munich-airport-transfer', fr: '/transfert-aeroport-munich', ru: '/taksi-iz-aeroporta-munhen', hy: '/myunkhen-odanavakayani-transfer', es: '/es/traslado-aeropuerto-munich' },
    labels: { en: 'Munich Airport', fr: 'Munich Aéroport', ru: 'Мюнхен Аэропорт', hy: 'Մյունխեն օդանավակայան', es: 'Aeropuerto de Múnich' },
    related: ['berlin', 'milan', 'rome', 'barcelona', 'cdg', 'paris-airport'],
  },
  yerevan: {
    urls: { en: '/yerevan-airport-transfer', fr: '/transfert-aeroport-erevan', ru: '/taksi-iz-aeroporta-erevan', hy: '/erevan-odanavakayani-transfer', es: '/es/traslado-aeropuerto-erevan-zvartnots' },
    labels: { en: 'Yerevan Airport', fr: 'Erevan Aéroport', ru: 'Ереван Аэропорт (Звартноц)', hy: 'Երևան Զվարթնոց', es: 'Aeropuerto de Ereván (Zvartnots)' },
    related: ['cdg', 'orly', 'paris-airport', 'nice', 'monaco', 'rome'],
  },
};

// Localized section title shown above the internal-linking block
export const RELATED_TITLES = {
  en: 'Related transfers',
  fr: 'Autres transferts populaires',
  ru: 'Похожие маршруты',
  hy: 'Նմանատիպ երթուղիներ',
  es: 'Otros traslados populares',
};

/**
 * Return up to `limit` related route entries for a given pageId + language.
 * Each entry: { pageId, url, label }.
 * Falls back to English URL/label if the requested language is not localized for a given route.
 */
export function getRelatedRoutes(pageId, language, limit = 8) {
  const entry = CITY_ROUTES[pageId];
  if (!entry || !Array.isArray(entry.related)) return [];
  const out = [];
  for (const relId of entry.related) {
    const rel = CITY_ROUTES[relId];
    if (!rel) continue;
    const url = rel.urls[language] || rel.urls.en;
    const label = rel.labels[language] || rel.labels.en;
    if (!url || !label) continue;
    out.push({ pageId: relId, url, label });
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Best-effort pageId resolver used when a page didn't pass an explicit `pageId` prop.
 * Falls back to matching seoUrls.en against the CITY_ROUTES registry.
 */
export function resolvePageId(explicitPageId, seoUrls) {
  if (explicitPageId && CITY_ROUTES[explicitPageId]) return explicitPageId;
  if (!seoUrls || !seoUrls.en) return null;
  for (const [id, entry] of Object.entries(CITY_ROUTES)) {
    if (entry.urls.en === seoUrls.en) return id;
  }
  return null;
}
