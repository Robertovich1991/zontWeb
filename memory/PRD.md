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

### Mobile PageSpeed Optimization (March 2026)
- **Image compression**: Paris CDG driver photo 660KB PNG → 55KB WebP (92% reduction), stored locally at `/public/images/driver-paris.webp`
- **Font cleanup**: Removed IBM Plex Mono & IBM Plex Sans from `index.html` and `tailwind.config.js`. Kept only Inter, Manrope, Noto Sans Armenian loaded async
- **TripAdvisor lazy-load**: Widget script (`jscache.com`) now loads via `IntersectionObserver` only when section scrolls into view
- **Unsplash images**: Reduced `w=` from 1200/600 to 800/400 and `q=` from 80/75 to 70 across all hero/card images
- **Google Maps lazy-load**: Removed from `index.html`. Now loads dynamically via `loadGoogleMaps()` in `PlacesAutocomplete.js` only when a page with autocomplete is rendered (~250KB saved on other pages)
- **Analytics deferred**: PostHog (~196KB), Yandex Metrika (~86KB), Google Analytics — all load after first user interaction (scroll/click/touch) or 4s timeout. No longer render-blocking
- **Cache headers**: ASGI middleware `CacheHeaderMiddleware` in `server.py` sets immutable 1-year cache for JS/CSS/images/fonts, 30-day cache for uploads

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
