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
- Reviews: 1-to-1 page mapping for SEO, LocalBusiness JSON-LD
- Google tracking: hardcoded GA4 + Google Ads (bypasses broken GTM)

## What's Been Implemented

### Session Apr 9, 2026 (Latest)
- **PhoneInput 149 Countries + Auto-detect**: Expanded country list from 55 to 149 countries with IP-based auto-detection via `api.country.is`. Country names dynamically translated in 4 languages (FR/EN/RU/HY). Search by name, code, or ISO. Validated and tested.
- **Leads B2B Manager**: `/admin/leads` page with search, status management
- **Reservations C# Manager**: `/admin/reservations` page showing ALL C# bookings
- **Android Download Button**: Google Play Store button on CarSelection, Android-only
- **Fleet Bookings Price Fix**: Shows currentPrice instead of totalAmount
- **Fleet Bookings Filter**: Only ApprovedByAdmin + future date visible
- **Driver Portal (Zont Driver)**: Complete portal with dual auth, missions, history, profile

### Previous Sessions
- Complete Wialon removal + Custom GPS webhook system
- GPS Super Admin Portal (/gps-admin/*) for managing 1000+ companies
- Reviews system with LLM auto-translation (FR, EN, RU, HY)
- Google Ads/GA4 hardcoded tracking
- Car selection UI optimization
- Node.js Teltonika TCP decoder for VPS

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
- C# Driver: nandetiri1@gmail.com / 12345678
- Fleet Admin: Nandetiri1@gmail.com / 12345678
- Hotel Admin: admin@bristol.fr / hotel123
- Super Admin: admin@zont.cab / admin123
- Test Client: garikgalstyan@gmail.com / 12345678

## Key Files
- `/app/frontend/src/components/PhoneInput.js` — 149 countries + IP auto-detect
- `/app/backend/routes/driver_portal.py` — Driver portal backend
- `/app/frontend/src/pages/driver/*` — Driver portal frontend
- `/app/backend/routes/fleet_portal.py` — Fleet portal with booking filters
- `/app/backend/routes/fleet_shared.py` — Shared C# proxy logic
- `/app/backend/routes/gps_admin.py` — GPS Super Admin backend
- `/app/frontend/src/pages/gps-admin/*` — GPS Super Admin frontend
