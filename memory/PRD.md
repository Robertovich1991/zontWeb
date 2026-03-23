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
- Hotel booking portal
- Admin management dashboard

### Phase 2 - GPS System (Complete)
- Custom Teltonika webhook (POST /api/fleet/gps/webhook)
- Real-time WebSocket tracking with ping/pong keep-alive
- Unified Live Map + History Replay in FleetGeolocation.js
- Light-themed Leaflet map with Bento-grid telemetry panels
- Node.js TCP decoder for external VPS (provided as zip)

### Phase 3 - Planning Intelligence (Complete)
- AI Delay Risk module using Google Distance Matrix
- Risk scoring (0-100) with visual badges (Green/Orange/Red)
- Audio/visual alerts for Red status transitions
- GPS status: Ignition-based "A l'arret" vs "Hors ligne" logic

### Phase 4 - Google Sheets Import (Complete - March 2026)
- Public CSV export parsing (bypasses Google API key restrictions)
- Preview endpoint with date/driver/type extraction
- Bulk import: 2947 missions imported, 19 drivers auto-created
- Duplicate detection via sheetRef
- Driver name normalization (filters notes/cancelled entries)
- Temporary local drivers for sheet-imported names

### Phase 5 - UX Improvements (Complete - March 2026)
- **Mes Reservations pagination:** Server-side with page/limit/search/dateFrom/dateTo params (50/page, 60 pages for 2959 records)
- **Planning collapsible panel:** "Missions non affectees" now starts collapsed, click to expand/collapse. Timeline always visible.

## Key API Endpoints
- POST /api/fleet/auth/login
- GET /api/fleet/planning?date=YYYY-MM-DD&view=day
- GET /api/fleet/planning/delay-risk
- GET /api/fleet/my-bookings?page=1&limit=50&search=&dateFrom=&dateTo=
- POST /api/fleet/planning/sheet/preview
- POST /api/fleet/planning/sheet/bulk-import
- POST /api/fleet/gps/webhook
- WS /api/fleet/gps/stream

## Key DB Collections
- `fleet_reservations` - Bookings (2959 total, 2947 imported from sheet)
- `local_drivers` - Temporary drivers from sheet import (19 created)
- `gps_devices` - IMEI to vehicle mapping
- `gps_positions` - GPS telemetry data
- `admin_users` - Admin credentials

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
- **P1:** Trip History Route Replay improvements
- **P2:** Geofences & GPS Alerts
- **P2:** Editable Company Profile Page
- **P3:** Hotel Automated Invoicing
- **P3:** Super Admin Hotel Leaderboard
