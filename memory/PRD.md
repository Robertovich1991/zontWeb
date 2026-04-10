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
- Schema.org reviews use `Product` type (not `LocalBusiness`) for Google compliance
- PlacesAutocomplete shows place name + address for clarity
- AuthModal checks `isOpen` prop before rendering

## What's Been Implemented

### Session Apr 10, 2026 (Latest)
- **Google Structured Data Fix**: Split LocalBusiness/Product, string→number, real phone
- **Client Review Collection**: Public form `/review` + `/avis`, 4 languages, auto-translate, pending status
- **PlacesAutocomplete UX Fix**: Shows "CDG Airport, 95700 Roissy" instead of just postal code
- **Prefilled Field Fix**: Default pickup/dropoff no longer locks user - can clear and retype
- **AuthModal Fix**: Added `if (!isOpen) return null;` guard
- **Error Message Enhancement**: Login error banner more prominent
- **French Accents Overhaul**: 200+ accent corrections across 12 files (Home, Checkout, CarSelection, TripRecap, AuthModal, CityTransferPage, BecomeClient, Countries, Partners, BookingConfirmation, B2BPage)
- **PhoneInput Validation**: 149 countries + IP auto-detect confirmed working

### Previous Sessions
- Fleet Admin pricing fix, Driver Portal, Leads Manager, Reservations Manager
- Android download button, GPS Super Admin Portal
- Complete Wialon removal + Custom GPS webhook system
- Reviews system with LLM auto-translation, Google Ads/GA4 tracking

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

## Credentials
- Super Admin: admin@zont.cab / admin123
- Fleet Admin: Nandetiri1@gmail.com / 12345678
- Hotel Admin: admin@bristol.fr / hotel123
- GPS Admin: gps@zont.cab / gpsadmin123
- Test Client: garikgalstyan@gmail.com / 12345678
