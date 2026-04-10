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
- Fleet bookings filtered to show only ApprovedByAdmin with future dates
- Fleet bookings display currentPrice (offer price) not totalAmount (client price)
- Reviews: 1-to-1 page mapping for SEO, Product JSON-LD (not LocalBusiness for reviews)
- Google tracking: hardcoded GA4 + Google Ads (bypasses broken GTM)
- Schema.org reviews use `Product` type (not `LocalBusiness`) to comply with Google self-review policy
- PlacesAutocomplete shows place name + address (not just postal address) for clarity

## What's Been Implemented

### Session Apr 10, 2026 (Latest)
- **Google Structured Data Audit & Fix**: 
  - Split JSON-LD into 2 blocks: `LocalBusiness` (business info only) + `Product` (with reviews/aggregateRating)
  - Fixed self-review policy violation (LocalBusiness with own reviews = no stars in Google)
  - Converted all schema values from strings to proper numbers (ratingValue, reviewCount, bestRating)
  - Replaced placeholder phone (+33600000000) with real number (+33783777027) across all pages
- **Client Review Collection System**:
  - Public form at `/review` (EN) and `/avis` (FR) — 4 languages supported
  - Backend `POST /api/reviews/submit` — status "pending", admin must approve
  - Auto-translation of reviews via LLM
  - Source tracking (`source: "client_link"`) to distinguish client-submitted vs admin-created
  - Admin can approve, assign to pages, moderate
- **PlacesAutocomplete UX Fix**:
  - Fixed "Roissy-en-France" confusion — now shows "Paris Charles de Gaulle Airport, 95700 Roissy-en-France"
  - Applies to all named places (airports, hotels, stations) across the entire site
- **PhoneInput 149 Countries + Auto-detect**: Validated — 149 countries, IP auto-detection via api.country.is

### Session Apr 9, 2026
- Leads B2B Manager, Reservations C# Manager, Android Download Button
- Fleet Bookings Price Fix, Fleet Bookings Filter
- Driver Portal (Zont Driver)

### Previous Sessions
- Complete Wialon removal + Custom GPS webhook system
- GPS Super Admin Portal, Reviews system with LLM auto-translation
- Google Ads/GA4 hardcoded tracking, Car selection UI optimization

## Prioritized Backlog

### P0 (Critical)
- None currently

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

## Credentials
- GPS Admin: gps@zont.cab / gpsadmin123
- Fleet Admin: Nandetiri1@gmail.com / 12345678
- Hotel Admin: admin@bristol.fr / hotel123
- Super Admin: admin@zont.cab / admin123
- Test Client: garikgalstyan@gmail.com / 12345678

## Key Files
- `/app/frontend/src/components/PlacesAutocomplete.js` — Google Places with name+address display
- `/app/frontend/src/components/PhoneInput.js` — 149 countries + IP auto-detect
- `/app/frontend/src/components/CityTransferPage.js` — City pages with dual JSON-LD
- `/app/frontend/src/pages/ReviewForm.js` — Public review collection form
- `/app/backend/routes/reviews.py` — Reviews API with schema.org + public submit
- `/app/backend/routes/driver_portal.py` — Driver portal backend
- `/app/backend/routes/fleet_portal.py` — Fleet portal with booking filters
