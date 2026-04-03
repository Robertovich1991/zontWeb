# PRD - Zont.cab Multi-Portal Platform

## Original Problem Statement
Multi-portal VTC/taxi platform (Client, Admin, Hotel, Fleet, Driver, GPS Admin) integrating an external C# backend (`api.zont.cab`) and internal MongoDB. Custom Teltonika GPS integration replacing Wialon. SEO landing pages for airports and train stations.

## Core Architecture
- **Frontend:** React (CRA) + Tailwind + Shadcn/UI
- **Backend:** FastAPI + MongoDB
- **External:** C# API (`api.zont.cab`), Custom TCP GPS Gateway (VPS), Google Maps, Stripe, Gemini Flash (Emergent LLM Key)

## What's Been Implemented

### Portals
- Client booking portal with AI auto-fill (Gemini Flash text/voice)
- Admin dashboard
- Hotel portal + Hotel Kiosk PWA (`/kiosk/[hotel_slug]`)
- Fleet management portal with custom GPS geolocation
- Driver portal
- GPS Super Admin portal

### Key Features (Completed)
- Premium Checkout flow with TripRecap page
- Inline passenger registration in Checkout
- Fleet Driver Sync bug fix (401 auto-logout)
- Custom GPS Webhook + Teltonika TCP decoder (VPS zip)
- GPS Route History replay
- Real-time SSE GPS streaming with Leaflet maps (light theme)

### SEO Landing Pages (Completed)
- **Airports:** CDG, Orly, Beauvais (with "Meet your driver" photo+text sections, WebP images)
- **Train Stations:** Gare de Lyon, Gare du Nord, Montparnasse, Saint-Lazare, Austerlitz (with driver photos)
- **Services:** VTC 7 Places (updated with "Taxi / VTC" SEO + family photo + IDF cities list), VTC 8 Places
- **Cities:** Paris, Nice, Cannes, Monaco, Rome, Milan, Munich, Berlin, Barcelona, Alicante, Yerevan, Disneyland

### Latest Changes (Feb 2026)
- **VTC 7 Places page:** Added "Taxi" keyword alongside "VTC" in all 4 languages (FR, EN, RU, HY). Added family photo (WebP 111KB) with Île-de-France cities list in meetDriver-style block. CityTransferPage updated with `heroImage` and `description4` support.

## Prioritized Backlog

### P0 (Critical)
- None currently

### P1 (High)
- Google Sheets / CSV Planning Import for fleet reservations
- AI-assisted Booking Creation (paste text → LLM extracts details)

### P2 (Medium)
- Geofences & GPS Alerts (zones, speeding)
- Editable Company Profile Page for fleet companies
- Trip History & Route Replay enhancements
- Add "Taxi" keyword to VTC 8 Places page (pending user request)

### P3 (Low)
- Hotel Admin - Automated Monthly Invoicing
- Super Admin - Hotel Leaderboard

### Blocked
- Partner Ride Cancellation (waiting for C# team API endpoint)

### Refactoring
- Extract AI booking logic from `Home.js` (~1000 lines) into `<AIBookingWidget />` component

## Key Files
- `/app/frontend/src/pages/services/VTC7Places.js` - VTC 7 seats SEO page
- `/app/frontend/src/pages/services/VTC8Places.js` - VTC 8 seats SEO page
- `/app/frontend/src/components/CityTransferPage.js` - Shared landing page component
- `/app/frontend/src/pages/kiosk/KioskPage.js` - Hotel Kiosk PWA
- `/app/backend/routes/kiosk.py` - Kiosk API
- `/app/backend/routes/fleet_gps.py` - Custom GPS Webhook
- `/app/backend/routes/gps_admin.py` - GPS Admin endpoints

## Credentials
- GPS Admin: `gps@zont.cab` / `gpsadmin123`
- Fleet Admin: `Nandetiri1@gmail.com` / `12345678`
- Hotel Admin: `admin@bristol.fr` / `hotel123`
- Super Admin: `admin@zont.cab` / `admin123`

## Critical Notes
- LANGUAGE: Always respond in French
- THEME: Light theme (white/emerald/gray) - no dark mode for GPS map
- IMAGE OPTIMIZATION: Always convert PNGs to WebP before adding
- Do NOT use BaseHTTPMiddleware in FastAPI
- TCP Gateway runs on external VPS, NOT on Emergent
