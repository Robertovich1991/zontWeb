# PRD - Zont.cab Multi-Portal Platform

## Original Problem Statement
Multi-portal platform (Client, Admin, Hotel, Fleet, Driver) integrating external C# backend (api.zont.cab) and internal MongoDB.

## Core Portals
- **Client Portal** — Booking, checkout, payment (Stripe)
- **Admin Portal** — Super admin for managing pages, hotels, rides, reviews
- **Hotel Portal** — Hotel-specific dashboard, bookings, revenue
- **Fleet Portal** — Company management: drivers, vehicles, bookings, planning, GPS
- **Driver Portal** — Chauffeur app: Zont offers + company missions

## Architecture
- React Frontend + FastAPI Backend + MongoDB
- C# Backend proxy (api.zont.cab) for core business logic
- Custom GPS system (Teltonika TCP decoder on VPS -> webhook)

## Key Technical Decisions
- DO NOT use BaseHTTPMiddleware (corrupts JSON streaming)
### Session Jun 01, 2026 — Kiosk Hourly Disposal Vehicles Fix (P0)
- **Bug**: Kiosk "Location voiture à l'heure" (Disposal excursions screen) showed empty vehicle list at Step 2 because clicking a disposal destination (Paris 4h / Versailles 5h / Fontainebleau 8h / Mont-Saint-Michel 12h) only set `selectedDest` locally without calling pricing API → `selectedDest.vehicles` was always undefined.
- **Fix**: `KioskPage.js` disposal buttons now call existing `POST /api/kiosk/{slug}/custom-price` with proper lat/lng for each disposal destination → populates `vehicles[]` with 4 categories (Shuttle 8p, Luxury Sedan, Luxury Van, Standard Car) returned from C# `/api/PreorderDistance/driverTypesTwo`.
- Added full-screen loading overlay during pricing fetch + auto-error handling.
- **Tested**: Versailles 5h flow → 4 vehicles rendered with images & prices (81€, 108€, 123€, 69€).
- **Note for user**: Prices shown are *transfer/round-trip distance* baseline from C# (no dedicated hourly endpoint exists in C# Swagger). If you provide a fixed hourly rate table per vehicle, we can replace these later.


- Schema.org reviews use `Product` type (not `LocalBusiness`) for Google compliance
- PlacesAutocomplete shows place name + address for clarity
- AuthModal checks `isOpen` prop before rendering

## What's Been Implemented

### Session Feb 20, 2026 (Latest) — Driver at Disposal SEO page
- **New service page**: "Driver at Disposal / Chauffeur mis à disposition / Водитель в распоряжение / Վարորդ տրամադրությամբ"
- Main listing page at 4 multilingual URLs:
  - `/driver-at-disposal` (EN), `/chauffeur-mis-a-disposition` (FR), `/voditel-s-avtomobilem` (RU), `/varorde-tramadrutyamb` (HY)
- 4 dedicated SEO vehicle sub-pages, each with H1, hero image, 4h/8h/12h pricing strip, 3 long-form SEO paragraphs, vehicle-specific FAQ, related vehicles:
  - Mercedes S-Class (Flagship VIP/diplomatic)
  - Mercedes E-Class (Business reference sedan)
  - Mercedes V-Class (7-seat luxury van)
  - Renault Trafic (8-seat eco minibus)
- **SEO**: per-page title, meta description, canonical, hreflang (4 langs), Schema.org Service+Product+AggregateRating JSON-LD
- **Pricing**: placeholder "On request / Sur demande / По запросу / Ըստ պահանջի" for 4h/8h/12h — user will provide later
- **Images**: 4 optimized WebP (134-173 KB each, originally 2+ MB PNG) with SEO-friendly filenames in `/app/frontend/public/images/`:
  - `mercedes-classe-s-chauffeur-prive-paris.webp`
  - `mercedes-classe-e-chauffeur-prive-paris.webp`
  - `mercedes-classe-v-chauffeur-prive-paris.webp`
  - `renault-trafic-minibus-chauffeur-paris.webp`
- **Navigation**: Added gold-highlighted "Chauffeur mis à disposition" link at top of Services dropdown (Header desktop + mobile) and Footer
- **Test status**: 18/18 acceptance items pass (iteration 67), 0 issues found

### Session Apr 22, 2026
- **Checkout 2-Step Flow**: Split card addition and payment into visible steps
  - Step 1: "Add your card" → 3D Secure (0€) → Green banner "Card verified ✓"
  - Step 2: Button changes to "Pay X€" → booking created + payment charged
  - Saved cards skip step 1 and pay immediately (no change)
  - Labels added in EN/FR/RU
- **Yandex Metrica Webvisor Fix**: Moved Yandex Metrika from deferred loading (4s timeout) to immediate loading in `<head>` so Webvisor captures styles correctly
- **MyBookings Cancel Button**: Added "Annuler" button on each booking card
- **Auth Redirect Fix**: MyBookings + MyAccount now wait for `authLoading` before redirecting to homepage
- **XHR Conversion (Complete)**: All authService functions in api.js converted to XMLHttpRequest to avoid Stripe.js fetch() interception

### Session Apr 19, 2026
- **Checkout "body stream already read" Bug Fix (P0)**: Fixed JS error blocking card addition for existing users
  - Root cause: Stripe.js intercepts native `fetch()` and consumes the Response body stream before application code reads it
  - Fix: Converted all `fetch()` calls in `Checkout.js` to `XMLHttpRequest` (not intercepted by Stripe.js), matching the established pattern in `api.js` `submitBooking`
  - Affected: setup-intent (card creation), saved cards fetch, card deletion

### Session Apr 11, 2026
- **Facebook Conversions API (Server-Side)**: Complete backend integration using Meta Graph API v21.0
  - `fb_conversions.py` module with SHA256 PII hashing, async fire-and-forget sends
  - `POST /api/fb/track` endpoint for frontend→server event mirroring
  - Auto Purchase tracking on successful booking (in `proxy_create_booking`)
  - Auto Lead tracking on B2B lead creation
  - Frontend `fbPixel.js` updated with event_id deduplication + fbp/fbc cookie extraction
  - 6 events tracked: PageView, Search, ViewContent, InitiateCheckout, Purchase, Lead
  - All events verified as received by Facebook (`events_received: 1`)

### Session Apr 10, 2026
- **Google Structured Data Fix**: Split LocalBusiness/Product, string→number, real phone
- **Client Review Collection**: Public form `/review` + `/avis`, 4 languages, auto-translate, pending status
- **PlacesAutocomplete UX Fix**: Shows "CDG Airport, 95700 Roissy" instead of just postal code
- **Prefilled Field Fix**: Default pickup/dropoff no longer locks user - can clear and retype
- **AuthModal Fix**: Added `if (!isOpen) return null;` guard
- **Error Message Enhancement**: Login error banner more prominent
- **French Accents Overhaul**: 200+ accent corrections across 12 files
- **PhoneInput Validation**: 149 countries + IP auto-detect confirmed working
- **Facebook Pixel (Frontend)**: Meta Pixel installed with React event tracking
- **Saved Credit Cards**: Selection + pay on Checkout page

### Previous Sessions
- Fleet Admin pricing fix, Driver Portal, Leads Manager, Reservations Manager
- Android download button, GPS Super Admin Portal
- Complete Wialon removal + Custom GPS webhook system
- Reviews system with LLM auto-translation, Google Ads/GA4 tracking
- 2026-02-09: Fixed Google Search Console "missing highPrice/lowPrice" warnings in Product structured data on city transfer pages (CityTransferPage.js) — now filters numeric prices, adds availability, falls back to default tier when vehiclesPrices is empty/undefined
- 2026-02-09: **Stripe Terminal physique (Reader S700) opérationnel** — Registered at Bristol Lobby (slug: `bristol`) | Reader ID: `tmr_GiSbzAmuecR6pP` | Location ID: `tml_GiSbzA31RMBRID` | Bug fix: `address.line2` was sent as empty string causing Stripe 400 — now omitted if not provided | E2E flow validated: booking → push payment → reader prompt → tap card → `paid` in DB (canal `terminal`)

## Prioritized Backlog

### P1 (High)
- Google Sheets/CSV Planning Import
- Hotel Kiosk App (Web-view for tablets)
- AI-assisted Booking Creation (LLM text parsing)

### P2 (Medium)
- Geofences & GPS Alerts
- Editable Company Profile Page
- Trip History & Route Replay

### P3 (Low)
- Hotel Admin Automated Invoicing
- Super Admin Hotel Leaderboard

### Blocked
- Partner Ride Cancellation (waiting for C# team endpoint)
- SEO Redirections for old URLs (waiting for user confirmation on approach)

## Latest Changes (Feb 2026)
- **Routes ES réorganisées** : `/es` est maintenant la **Home espagnole** (auparavant c'était la page Paris transfer). Nouvelle URL `/es/traslado-aeropuerto-paris` créée pour le contenu Paris airport transfer en espagnol. URL detection ajoutée dans `LanguageContext` (URL `/es*` → langue 'es' automatique pour bots Google + visiteurs directs). Home.js enrichie avec `homeContent.es`, `nameEs/urlEs` sur popularDest, `homeSeoUrls.es`, et fallback CMS-vers-hardcoded quand la langue ES manque dans les blocs CMS. Sitemap mis à jour.
- **Spanish localization fixes (preview only — needs redeploy)** : Disposal CTA block, TripAdvisor reviews (6 reviews + headings + CTA), Footer service labels — all 3 blocks were stuck in EN/FR on `/es`, now fully translated to Spanish.
- **Blog Webhook + Native Blog Pages** (DONE): Updated `POST /api/webhooks/blog` to accept the new flat CMS payload. Built React routes `/blog`, `/blog/:slug`, `/es/blog`, `/es/blog/:slug` reading from `/api/blog-articles` + `/api/blog-articles/{slug}`. Article pages inject `jsonLd` and `faqJsonLd` for SEO. Added dynamic `/api/sitemap-blog.xml`. 12/12 backend tests pass.

## Credentials
- Super Admin: admin@zont.cab / admin123
- Fleet Admin: Nandetiri1@gmail.com / 12345678
- Hotel Admin: admin@bristol.fr / hotel123
- GPS Admin: gps@zont.cab / gpsadmin123
- Test Client: garikgalstyan@gmail.com / 12345678
