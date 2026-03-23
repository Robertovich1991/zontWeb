# PRD - Zont Fleet Management Platform

## Original Problem Statement
Multi-portal platform (Client, Admin, Hotel, Fleet, Driver) integrating an external C# backend (`api.zont.cab`) and internal MongoDB. Custom Teltonika GPS integration replacing Wialon. GPS Super Admin portal for managing 1000+ fleet companies.

## Core Architecture
- **Backend:** FastAPI + MongoDB + C# proxy (`fleet_shared.py`)
- **Frontend:** React + Tailwind + Leaflet maps
- **GPS:** Custom TCP decoder (Node.js on external VPS) → Webhook → MongoDB
- **Theme:** Light (white bg, emerald accents, gray borders)

## What's Been Implemented

### Phase 1 - Core Platform (Complete)
- Multi-portal auth (Fleet, Admin, Hotel, Driver)
- Fleet reservations CRUD with driver assignment
- Zont C# API integration with caching/connection pooling
- Hotel booking portal + Admin management dashboard

### Phase 2 - GPS System (Complete)
- Custom Teltonika webhook (POST /api/fleet/gps/webhook)
- Real-time WebSocket tracking with ping/pong keep-alive
- Unified Live Map + History Replay in FleetGeolocation.js
- Light-themed Leaflet map with Bento-grid telemetry panels
- **Mobile: Full history controls** (toggle, vehicle selector, date, playback, stats)
- **Mobile: Vehicle detail panel** (status, IMEI, position, speed, satellites, contact)

### Phase 3 - Planning Intelligence (Complete)
- AI Delay Risk module using Google Distance Matrix
- Risk scoring for **all events of the day** (not just 2h window)
- Visual badges (Green/Orange/Red) on timeline event blocks
- Audio/visual alerts for Red status transitions

### Phase 4 - Google Sheets Import (Complete - March 2026)
- Public CSV export parsing (bypasses Google API key restrictions)
- Bulk import: **2947 missions** imported, 19 drivers auto-created
- Duplicate detection, driver name normalization

### Phase 5 - Performance Optimization (Complete - March 2026)
- **Mes Reservations**: Server-side pagination (2959 records, 60 pages)
- **Planning cache frontend**: Navigation instantanée entre dates visitées (~0.15s)
- **Pre-fetching**: Jours adjacents chargés en arrière-plan
- **Optimistic UI updates**: Assign/unassign/rest-day sans rechargement API
- **Collapsible unassigned panel**: Ne bloque plus la timeline
- **MongoDB indexes**: Compound indexes pour fleet_reservations + local_drivers
- **Backend projection**: Champs minimaux renvoyés par l'API

## Key API Endpoints
- POST /api/fleet/auth/login
- GET /api/fleet/planning?date=YYYY-MM-DD&view=day|week|month
- GET /api/fleet/planning/delay-risk?date=YYYY-MM-DD
- GET /api/fleet/my-bookings?page=1&limit=50&search=&dateFrom=&dateTo=
- POST /api/fleet/planning/sheet/bulk-import
- POST /api/fleet/gps/webhook
- WS /api/fleet/gps/stream

## Test Credentials
- Fleet: Nandetiri1@gmail.com / 12345678
- GPS Admin: gps@zont.cab / gpsadmin123
- Hotel: admin@bristol.fr / hotel123
- Super Admin: admin@zont.cab / admin123

## Pending Issues
- Partner Ride Cancellation local-only (BLOCKED - awaiting C# team API)

## Backlog (Prioritized)
- **P0:** AI-assisted Booking Creation (paste text → LLM extracts details)
- **P1:** Android Hotel Kiosk App / Web-view
- **P2:** Geofences & GPS Alerts
- **P2:** Editable Company Profile Page
- **P3:** Hotel Automated Invoicing
- **P3:** Super Admin Hotel Leaderboard
