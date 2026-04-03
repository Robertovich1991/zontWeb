# PRD - Zont Fleet Management & VTC Platform

## Original Problem Statement
Multi-portal platform (Client, Admin, Hotel, Fleet, Driver) integrating an external C# backend (`api.zont.cab`) and internal MongoDB. Features include custom Teltonika GPS integration, fleet planning, multi-language SEO pages, and B2B hotel partnerships.

## User Personas
- **Client**: Books airport/city transfers online
- **Fleet Admin**: Manages drivers, vehicles, planning, GPS tracking
- **Hotel Admin**: Books rides for hotel guests, manages commissions
- **Super Admin**: Oversees all companies, hotels, GPS devices
- **Driver**: Receives and manages ride assignments
- **Hotel Guest**: Uses lobby kiosk to self-book transfers

## Core Requirements
- Multi-portal authentication (Client, Admin, Hotel, Fleet, Driver, GPS Admin)
- Real-time GPS tracking with custom Teltonika integration
- Fleet planning with Google Sheets import capability
- Multi-language support (FR, EN, RU, HY) with translated URLs
- SEO optimization with proper canonical, hreflang, sitemap
- B2B pages for hotel/business partnerships
- Hotel lobby kiosk for guest self-service booking

## What's Been Implemented

### Hotel Kiosk PWA (April 2026)
- **Full-screen touch-optimized interface** at `/kiosk/{slug}` (demo: `/kiosk/bristol`)
- **6 popular destinations** with real-time prices from C# API (CDG T1/T2, Orly, Gare de Lyon, Gare du Nord, Disneyland)
- **4-step flow**: Destination → Date/Time → Vehicle → Client Info → Confirmation
- **Booking reference** (ZK-XXXXX) stored in MongoDB `kiosk_bookings`
- **Auto-reset** after 45 seconds on confirmation page
- **No auth required** for guests - just name + phone
- Backend: `/app/backend/routes/kiosk.py`
- Frontend: `/app/frontend/src/pages/kiosk/KioskPage.js`
- Testing: 34/34 tests passed (iteration_61)

### Optimized Booking Flow (March 2026)
- **New Flow**: Homepage Search -> Car Selection -> Trip Recap -> Checkout (Passenger Details + Payment)
- **Trip Recap Page** (`/trip-recap`): Google Maps route, vehicle card, 6 premium perks, mobile sticky CTA
- **Unified Checkout** (`/checkout`): Integrated passenger registration + Stripe payment on same page
- Testing: 12/12 tests passed (iteration_60)

### Fleet Auth Fix (April 2026)
- **C# token expiration**: Backend now propagates 401 (instead of silently returning [])
- **Frontend auto-redirect**: Detects 401, shows toast "Session expirée", redirects to login
- Files: `fleet_shared.py`, `FleetAuthContext.js`

### AI-Assisted Booking (March 2026)
- Gemini Flash text parsing (<3s)
- Guided Mode with quick suggestions
- Voice Input (Web Speech API)
- Client-side regex AI autofill for signup

### GPS Tracking
- Custom Teltonika webhook (Wialon removed)
- Light-theme Fleet Geolocation map with real-time SSE
- GPS Super Admin Portal with Trip History replay

### Other
- Recent Searches history on Homepage
- Vehicle image optimization (5MB → 130KB WebP)
- Welcome promo code system
- 17 SEO pages in 4 languages

## Prioritized Backlog

### P1
- Google Sheets Planning Import
- SMS integration for kiosk (payment link to guest phone)

### P2
- Geofences & GPS Alerts
- Editable Company Profile Page
- Partner Ride Cancellation sync (BLOCKED - needs C# API)

### P3
- Hotel Admin Automated Invoicing
- Super Admin Hotel Leaderboard
- APK wrapper for kiosk (TWA)

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
- Demo Kiosk: `/kiosk/bristol` (no auth needed)
