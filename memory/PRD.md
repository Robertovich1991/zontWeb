# PRD - Zont Fleet Management & VTC Platform

## Original Problem Statement
Multi-portal platform (Client, Admin, Hotel, Fleet, Driver) integrating an external C# backend (`api.zont.cab`) and internal MongoDB. Features include custom Teltonika GPS integration, fleet planning, multi-language SEO pages, and B2B hotel partnerships.

## User Personas
- **Client**: Books airport/city transfers online
- **Fleet Admin**: Manages drivers, vehicles, planning, GPS tracking
- **Hotel Admin**: Books rides for hotel guests, manages commissions
- **Super Admin**: Oversees all companies, hotels, GPS devices
- **Driver**: Receives and manages ride assignments

## Core Requirements
- Multi-portal authentication (Client, Admin, Hotel, Fleet, Driver, GPS Admin)
- Real-time GPS tracking with custom Teltonika integration
- Fleet planning with Google Sheets import capability
- Multi-language support (FR, EN, RU, HY) with translated URLs
- SEO optimization with proper canonical, hreflang, sitemap
- B2B pages for hotel/business partnerships

## What's Been Implemented

### Welcome Promo Code System (March 2026)
- **Pop-up** sur la page de selection de vehicule demandant l'email du client
- **Code unique** WELCOME-XXXXX genere, valide 1 heure avec compte a rebours
- **Prix reduit de -10%** affiche avec ancien prix barre en vert
- **Prix reduit envoye au C# backend** lors de la reservation
- **Admin menu "Emails Clients"** : liste des emails collectes, codes, statuts (utilise/actif/expire), export CSV
- Pop-up reapparait a chaque recherche tant que l'email n'a pas ete donne
- Fichiers: `promo.py`, `PromoPopup.js`, `CarSelection.js`, `admin/PromoEmails.js`

### Mobile Autocomplete Race Condition Fix V3 (March 2026)
- **Root cause FOUND**: `useCallback([onChange])` in PlacesAutocomplete caused the `place_changed` listener to be removed on every parent re-render (each keystroke), and never re-added because `autocompleteRef.current` guard prevented it
- **Fix**: Replaced `useCallback` + `useEffect([handlePlaceSelect])` with `onChangeRef` pattern — listener created ONCE with empty deps, always calls latest `onChange` via ref
- **Also**: Added `pickupSafeRef`/`dropoffSafeRef` in Home.js and CityTransferPage.js as immune coordinate storage
- **Also**: Added placeId-based geocoding fallback + unclosed parenthesis regex handling
- Applied to `PlacesAutocomplete.js`, `Home.js`, and `CityTransferPage.js`

### TripAdvisor Reviews Section (March 2026)
- Replaced broken TripAdvisor selfserveprop widget with custom `TripAdvisorReviews.js` component
- Displays 6 real TripAdvisor reviews (scraped from tripadvisor.fr) with proper attribution
- Badge "4.5/5 Tripadvisor - 29 avis" in hero section is now clickable, scrolls to reviews section
- Multi-language support (FR/EN/RU)
- Link "Voir les 29 avis sur TripAdvisor" points to actual TripAdvisor page

### Disneyland Paris Transfer Page (March 2026)
- **New page**: `/transfert-disneyland-paris` with 4-language SEO content (EN/FR/RU/HY), booking form with Disneyland pre-filled as destination
- **Popular routes**: 6 routes with prices (Paris 59€, CDG 75€, Orly 90€, Beauvais 175€, Gare du Nord 59€, Gare de Lyon 55€)
- **Added to Home**: Disneyland card in Popular Destinations grid with "dès 49€" pricing
- **Added to sitemap**: 4 URLs (EN/FR/RU/HY) with hreflang tags
- **Updated pricing on airport pages (SEO)**: CDG "dès 59€", Orly "dès 39€", Beauvais "dès 99€" - both in code and CMS MongoDB

### Mobile PageSpeed Optimization (March 2026)
- **Image compression**: Paris CDG driver photo 660KB PNG → 55KB WebP (92% reduction), stored locally at `/public/images/driver-paris.webp`
- **Font cleanup**: Removed IBM Plex Mono & IBM Plex Sans from `index.html` and `tailwind.config.js`. Kept only Inter, Manrope, Noto Sans Armenian loaded async
- **TripAdvisor lazy-load**: Widget script (`jscache.com`) now loads via `IntersectionObserver` only when section scrolls into view
- **Unsplash images**: Reduced `w=` from 1200/600 to 800/400 and `q=` from 80/75 to 70 across all hero/card images
- **Google Maps lazy-load**: Removed from `index.html`. Now loads dynamically via `loadGoogleMaps()` in `PlacesAutocomplete.js` only when a page with autocomplete is rendered (~250KB saved on other pages)
- **Analytics deferred**: PostHog (~196KB), Yandex Metrika (~86KB), Google Analytics — all load after first user interaction (scroll/click/touch) or 4s timeout. No longer render-blocking
- **Cache headers**: ASGI middleware `CacheHeaderMiddleware` in `server.py` sets immutable 1-year cache for JS/CSS/images/fonts, 30-day cache for uploads

### Google Sign-In Integration (March 2026)
- **Frontend**: Google Identity Services (GIS) loaded dynamically in AuthModal. "Continue with Google" button on both Sign-in and Sign-up tabs
- **Backend**: Proxy endpoint `/api/proxy/auth/google-login` forwards Google ID token to `api.zont.cab/api/Client/googleLogin`
- **Auth Context**: Added `loginDirect()` method for Google auth (sets user state directly, localStorage already set by authService)
- **Same account**: Client connected via Google on the website has the same account as on the mobile app (C# backend manages both)

### Flight Tracking (March 2026)
- **Backend**: `GET /api/flight-status?flight=AF123` — appelle Aviationstack, cache MongoDB 60min
- **Frontend**: FlightBadge component (compact + detail) intégré dans FleetMyBookings + FleetPlanning
- **Extraction auto** du numéro de vol depuis le texte pickup C# (regex: 2 lettres + chiffres)
- **Couleurs**: vert (à l'heure/atterri), orange (retardé), bleu (en vol), rouge (annulé), gris (inconnu)
- **Cache**: TTL 60min, stale fallback si quota dépassé
- **Quota**: Plan gratuit 100 req/mois, appel uniquement sur clic manuel

### SEO & Content (March 2026)
- Domain canonicalization: `www.zont.cab` as primary domain
- JS redirect from `zont.cab` to `www.zont.cab` in index.html
- All sitemap URLs use `https://www.zont.cab`
- All canonical/hreflang tags use `https://www.zont.cab`
- Google Analytics (G-MNN6VJZYDP) added
- Yandex.Metrika (91814401) added with Webvisor
- Language-URL synchronization: changing language navigates to translated URL
- Auto-detect language from URL on page load
- PWA manifest + favicons
- **17 pages enriched with unique SEO content** (3 paragraphs × 4 languages each: EN, FR, RU, HY):
  - Paris, CDG, Orly, Beauvais, Gares, Nice, Monaco, Cannes
  - Berlin, Munich, Rome, Milan, Alicante, Barcelona, Yerevan
  - VTC 7 Places, VTC 8 Places
- **Armenian (HY) translations complete** for all 17 pages (title, subtitle, descriptions, UI labels)
- **Armenian SEO URLs** added for all 17 pages (e.g., `/pariz-odanavakayani-transfer`, `/erevan-odanavakayani-transfer`) with routes in App.js and auto-language-detection from URL
- **Home page language URLs**: `/` (EN), `/fr` (FR), `/ru` (RU), `/hy` (HY) with bidirectional sync
- **Sitemap.xml** rebuilt with 86 URLs, hreflang tags for 4 languages, Armenian URLs included
- **TripAdvisor Widget** intégré sur Home + toutes les pages de transfert, avec version FR/EN/RU adaptée à la langue

### Fleet Management
- Bulk CSV import from Google Sheets (~3000 missions)
- Optimistic UI updates for planning
- Frontend date caching + background pre-fetching
- Collapsible "Unassigned missions" panel
- AI Delay Risk evaluation (full day, Google Distance Matrix)
- Server-side pagination for "Mes Reservations"

### GPS Tracking
- Custom Teltonika webhook
- Light-theme Fleet Geolocation map with real-time SSE
- Mobile UI parity
- VPS TCP decoder (Node.js) provided to user

### GPS Super Admin Portal
- Backend routes + Frontend pages routed in App.js

## Prioritized Backlog

### P0
- AI-assisted Booking Creation (paste text -> LLM extracts booking details)

### P1
- Hotel Kiosk PWA (`/kiosk` route, tablet-optimized)
- Google Sheets Planning Import (direct API integration)

### P2
- Geofences & GPS Alerts
- Editable Company Profile Page
- Partner Ride Cancellation sync (BLOCKED - needs C# API)

### P3
- Hotel Admin Automated Invoicing
- Super Admin Hotel Leaderboard
- Trip History & Route Replay

## Technical Architecture
- Frontend: React (CRA) with Shadcn/UI
- Backend: FastAPI + MongoDB
- External: C# API (`api.zont.cab`), Google Maps, Teltonika GPS
- Deployment: Emergent Platform with custom domain `www.zont.cab`

## Key Credentials
- GPS Admin: `gps@zont.cab` / `gpsadmin123`
- Fleet Admin: `Nandetiri1@gmail.com` / `12345678`
- Hotel Admin: `admin@bristol.fr` / `hotel123`
- Super Admin: `admin@zont.cab` / `admin123`
