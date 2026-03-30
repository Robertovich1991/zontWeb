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

### Optimized Booking Flow (March 2026)
- **New Flow**: Homepage Search -> Car Selection -> Trip Recap -> Checkout (Passenger Details + Payment)
- **Trip Recap Page** (`/trip-recap`): Google Maps route display, selected vehicle card, 6 premium perks (waiting time, name sign, water, flight tracking, fixed price, free cancellation), mobile sticky CTA
- **Unified Checkout** (`/checkout`): Integrated passenger registration (signup/signin toggle) + Stripe payment on same page. No separate auth modal.
- **Removed Auth Modal from CarSelection**: Clicking "Select" now navigates to `/trip-recap` instead of opening popup
- **Design Analysis**: Used design agent to identify optimal conversion flow based on "Commitment and Consistency" principle
- Files: `TripRecap.js` (NEW), `Checkout.js` (rewritten), `CarSelection.js` (modified), `App.js` (route added)
- Testing: 12/12 tests passed (iteration_60)

### Recent Searches Feature (March 2026)
- **localStorage persistence**: Saves last 3 unique pickup/dropoff searches
- **Auto-load on mount**: useEffect reads from localStorage on page load
- **Click-to-fill**: Clicking a recent search fills pickup & dropoff fields + sets safe coordinate refs
- Files: `Home.js`

### Welcome Promo Code System (March 2026)
- Pop-up on car selection page showing 10% discount code after 7 seconds
- Code unique WELCOME-XXXXX, valid 1 hour with countdown
- Files: `promo.py`, `PromoPopup.js`, `CarSelection.js`, `admin/PromoEmails.js`

### AI-Assisted Booking (March 2026)
- Input block above booking form: "Reservez en 10 secondes avec IA"
- Backend `POST /api/booking/ai-parse` uses Gemini Flash for fast parsing (<3s)
- **Guided Mode**: ONE question at a time with quick suggestion buttons
- **Voice Input**: Mic button (Web Speech API native)
- Files: `ai_booking.py`, `Home.js`

### Vehicle Image Optimization (March 2026)
- 4 vehicle PNG images from C# API converted to local WebP (98% lighter)

### GPS Tracking
- Custom Teltonika webhook (Wialon removed)
- Light-theme Fleet Geolocation map with real-time SSE
- VPS TCP decoder (Node.js) provided to user
- GPS Super Admin Portal with Trip History replay

### Fleet Management
- Bulk CSV import, optimistic UI, date caching
- AI Delay Risk evaluation
- Server-side pagination

### SEO & Content (March 2026)
- 17 pages with unique SEO content in 4 languages
- Sitemap with 86 URLs and hreflang tags

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

## Technical Architecture
- Frontend: React (CRA) with Shadcn/UI
- Backend: FastAPI + MongoDB
- External: C# API (`api.zont.cab`), Google Maps, Teltonika GPS, Stripe
- Deployment: Emergent Platform with custom domain `www.zont.cab`

## Key Credentials
- GPS Admin: `gps@zont.cab` / `gpsadmin123`
- Fleet Admin: `Nandetiri1@gmail.com` / `12345678`
- Hotel Admin: `admin@bristol.fr` / `hotel123`
- Super Admin: `admin@zont.cab` / `admin123`
