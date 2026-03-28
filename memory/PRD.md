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

### Recent Searches Feature (March 2026)
- **localStorage persistence**: Saves last 3 unique pickup/dropoff searches
- **Auto-load on mount**: useEffect reads from localStorage on page load
- **Click-to-fill**: Clicking a recent search fills pickup & dropoff fields + sets safe coordinate refs
- **Deduplication**: Same pickup/dropoff combo replaces existing entry
- **Multi-language**: Labels translated in EN/FR/RU/HY
- **UI**: Compact buttons below booking form with Clock/ArrowRight/ChevronRight icons
- Files: `Home.js` (state, useEffect, handleRecentClick, UI, save in handleSubmit)

### Welcome Promo Code System (March 2026)
- Pop-up on car selection page showing 10% discount code after 7 seconds
- Code unique WELCOME-XXXXX, valid 1 hour with countdown
- Reduced price sent to C# backend during booking
- Admin menu "Emails Clients": list of collected emails, codes, statuses
- Files: `promo.py`, `PromoPopup.js`, `CarSelection.js`, `admin/PromoEmails.js`

### Mobile Autocomplete Race Condition Fix V3 (March 2026)
- Root cause: `useCallback([onChange])` caused listener detachment on re-renders
- Fix: `onChangeRef` pattern — listener created ONCE, always calls latest `onChange` via ref
- Added `pickupSafeRef`/`dropoffSafeRef` as immune coordinate storage
- Applied to `PlacesAutocomplete.js`, `Home.js`, `CityTransferPage.js`

### AI-Assisted Booking (March 2026)
- Input block above booking form: "Reservez en 10 secondes avec IA"
- User types natural language (e.g. "CDG demain 14h vers Hilton Opera 2 personnes")
- Backend `POST /api/booking/ai-parse` uses Gemini Flash for fast parsing (<3s)
- Extracts: pickup, dropoff, date, time, passengers with confidence score
- If confidence >= 0.8 + no missing fields: auto-fill form + success toast
- If missing fields: triggers **Guided Mode** - ONE question at a time with quick suggestion buttons
- Guided flow: pickup → dropoff → date → time (each fills form live)
- Quick buttons: airports, destinations, today/tomorrow, morning/afternoon/evening
- Custom text input + OK button at each step for flexibility
- **Voice Input**: Mic button in AI input (Web Speech API native, no external API)
- Click mic → speak → speech-to-text → auto-trigger AI parse
- Multi-language (EN/FR/RU/HY), mobile responsive, Enter key support
- Files: `ai_booking.py`, `Home.js`

### Vehicle Image Optimization (March 2026)
- 4 vehicle PNG images from C# API converted to local WebP
- Total reduction: 5024 KB -> 130 KB (98% lighter)
- Fallback to C# proxy for unknown/new vehicle images

### TripAdvisor Reviews (March 2026)
- Custom `TripAdvisorReviews.js` with 6 real scraped reviews
- Badge "4.5/5 Tripadvisor - 29 avis" clickable, scrolls to reviews
- Multi-language support (FR/EN/RU)

### WhatsApp / Phone Contact (March 2026)
- WhatsApp +33 7 83 77 70 27 in Header and Footer
- Links: tel:+33783777027

### SEO & Content (March 2026)
- 17 pages with unique SEO content in 4 languages
- Armenian URLs and translations complete
- Sitemap with 86 URLs and hreflang tags
- Google Analytics + Yandex Metrika

### GPS Tracking
- Custom Teltonika webhook (Wialon removed)
- Light-theme Fleet Geolocation map with real-time SSE
- VPS TCP decoder (Node.js) provided to user
- GPS Super Admin Portal routed in App.js

### Fleet Management
- Bulk CSV import, optimistic UI, date caching
- AI Delay Risk evaluation
- Server-side pagination

### Mobile PageSpeed Optimization (March 2026)
- Image compression (92% reduction)
- Lazy-load for TripAdvisor, Google Maps, Analytics

## Prioritized Backlog

### P0
- (None currently)

### P1
- Google Sheets Planning Import
- Hotel Kiosk PWA

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
