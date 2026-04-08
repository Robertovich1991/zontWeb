# PRD - Zont.cab Multi-Portal Platform

## Original Problem Statement
Multi-portal VTC/taxi platform (Client, Admin, Hotel, Fleet, Driver, GPS Admin) integrating an external C# backend (`api.zont.cab`) and internal MongoDB. Custom Teltonika GPS integration replacing Wialon. SEO landing pages for airports and train stations.

## Core Architecture
- **Frontend:** React (CRA) + Tailwind + Shadcn/UI
- **Backend:** FastAPI + MongoDB
- **External:** C# API (`api.zont.cab`), Custom TCP GPS Gateway (VPS), Google Maps, Stripe (managed by C#), Gemini Flash (Emergent LLM Key)

## What's Been Implemented

### Portals
- Client booking portal with AI auto-fill (Gemini Flash text/voice)
- Admin dashboard
- Hotel portal + Hotel Kiosk PWA (`/kiosk/[hotel_slug]`)
- Fleet management portal with custom GPS geolocation
- Driver portal
- GPS Super Admin portal

### Key Features (Completed)
- **Checkout flow with card management** (Feb 2026): 2-step flow — register/login first, then add card via C# SetupIntent, select saved card, and submit booking with cardId. Supports add/delete/select multiple cards.
- Premium TripRecap page before checkout
- Inline passenger registration in Checkout
- Fleet Driver Sync bug fix (401 auto-logout)
- Custom GPS Webhook + Teltonika TCP decoder (VPS zip)
- GPS Route History replay
- Real-time SSE GPS streaming with Leaflet maps (light theme)
- Google Tag Manager (GTM) with dataLayer push for taxi_reservation events

### SEO Landing Pages (Completed)
- **Paris Main Page:** Refocused on "Taxi & VTC Paris - Chauffeur Prive, Transfert & Mise a Disposition"
- **Airports:** CDG, Orly, Beauvais
- **Train Stations:** Gare de Lyon, Gare du Nord, Montparnasse, Saint-Lazare, Austerlitz
- **Services:** VTC 7 Places (with "Taxi / VTC" SEO), VTC 8 Places
- **Cities:** Nice, Cannes, Monaco, Rome, Milan, Munich, Berlin, Barcelona, Alicante, Yerevan, Disneyland

### Latest Changes (Feb 2026)
- **Checkout Payment Fix:** Restored SetupIntent flow via C# proxy. Removed broken `direct_payment.py`. Added card management (list/add/delete/select) inside checkout. 2-step UX: auth first, then card+pay.
- **Code Cleanup:** Removed unused `direct_payment.py` and its server.py import.

## Prioritized Backlog

### P0 (Critical)
- None currently

### Recent Fix (Apr 2026)
- Fleet Bookings page now shows `currentPrice` (offer/company price) instead of `totalAmount` (client price) to match driver Android app behavior
- Fleet Bookings filtered to only show company-relevant statuses (ApprovedByAdmin, Took, Confirmed, Started, Completed) — hides internal "New" reservations

### P1 (High)
- Google Sheets / CSV Planning Import for fleet reservations
- AI-assisted Booking Creation (paste text -> LLM extracts details)

### P2 (Medium)
- Geofences & GPS Alerts (zones, speeding)
- Editable Company Profile Page for fleet companies
- Trip History & Route Replay enhancements

### P3 (Low)
- Hotel Admin - Automated Monthly Invoicing
- Super Admin - Hotel Leaderboard

### Blocked
- Partner Ride Cancellation (waiting for C# team API endpoint)

### Refactoring
- Extract AI booking logic from `Home.js` (~1000 lines) into `<AIBookingWidget />` component

## Key Files
- `/app/frontend/src/pages/Checkout.js` - 2-step checkout with card management
- `/app/frontend/src/pages/MyAccount.js` - Account page with card management
- `/app/backend/routes/csharp_proxy.py` - Proxy to C# backend for payments/bookings
- `/app/frontend/src/services/api.js` - Frontend API service layer
- `/app/frontend/src/pages/ParisAirportTransfer.js` - Paris main SEO page
- `/app/frontend/src/pages/kiosk/KioskPage.js` - Hotel Kiosk PWA
- `/app/backend/routes/fleet_gps.py` - Custom GPS Webhook

## Important: CMS Override
CityTransferPage fetches CMS data from MongoDB (`cms_pages` collection) that overrides static content. When changing page titles, BOTH the React file AND the MongoDB CMS record must be updated.

## Credentials
- GPS Admin: `gps@zont.cab` / `gpsadmin123`
- Fleet Admin: `Nandetiri1@gmail.com` / `12345678`
- Hotel Admin: `admin@bristol.fr` / `hotel123`
- Super Admin: `admin@zont.cab` / `admin123`
- Test Client: `testclient@zont.cab` / `test1234`

## Critical Notes
- LANGUAGE: Always respond in French
- THEME: Light theme (white/emerald/gray) for GPS map — no dark mode
- IMAGE OPTIMIZATION: Always convert PNGs to WebP before adding
- Do NOT use BaseHTTPMiddleware in FastAPI
- TCP Gateway runs on external VPS, NOT on Emergent
- CMS in MongoDB can override page content — always check and update both
- Stripe is managed by C# backend — do NOT try to create PaymentIntents locally (key is expired)
- The `direct_payment.py` was removed — all payments go through C# proxy
