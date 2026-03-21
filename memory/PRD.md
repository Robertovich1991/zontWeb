# PRD - Zont Fleet & Hotel Kiosk Management System

## Original Problem Statement
Build a "Hotel Kiosk" management system that has evolved into a multi-portal platform including:
- Client-facing booking site
- Driver PWA
- Super Admin panel
- Hotel Admin panel
- Fleet Management portal (for partner transportation companies)

## Core Architecture
- **Frontend**: React (CRA) with Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (for hotel/admin data), C# external backend (api.zont.cab) for fleet/driver data
- **Integrations**: Stripe (payments), Google Maps (Places, Directions), C# backend (api.zont.cab)

## Performance Optimizations (March 2026)
- **Shared HTTP Client** (`fleet_shared.py`): Connection pooling with `httpx.AsyncClient` (max 20 connections, 10 keepalive)
- **In-Memory Cache**: 30-second TTL cache for C# API responses
- **Parallel Data Fetching**: All C# API calls + MongoDB queries run via `asyncio.gather`
- **MongoDB Indexes**: Compound indexes on `fleet_reservations`, `driver_rest_days`, `driver_forfaits`, GPS collections
- **Results**: Planning day 4.3s to 1.7s (-60%), Planning week 16.7s to 1.1s (-93%), Bookings 16s to 1s (-93%)

## What's Been Implemented

### Fleet Management Portal
- Login via C# backend (`/api/Login/company`)
- Dashboard with company stats
- Driver Profile with monthly ride history, forfait management
- Vehicles CRUD + Driver assignment
- "Reservations Zont" - C# backend bookings view
- "Mes Reservations" - Company bookings CRUD (MongoDB)
- Planning Module - Day/Week/Month timeline with source filters, conflict detection, direct assignment

### Fleet GPS Tracking (March 2026)
- **Backend Webhook System** (`fleet_gps.py`): Complete API for receiving GPS data from external VPS
  - Webhook endpoints (single + batch) secured by X-GPS-API-Key
  - Device CRUD (IMEI to vehicle/driver linking)
  - Real-time positions, history with date range, stats
  - SSE stream for future frontend map
  - MongoDB: gps_devices, gps_positions (upsert), gps_history (30-day TTL)
- **VPS TCP Decoder** (`vps-teltonika/`): Node.js Teltonika Codec8/Codec8E decoder
  - TCP server on port 5055
  - IMEI handshake + AVL data parsing
  - Batch forwarding to webhook
  - Test simulator, systemd service, install script
  - Tested end-to-end: Simulator -> Decoder -> Webhook -> MongoDB

### Hotel Kiosk System
- Commission/invoicing modules
- Hotel Admin portal with invoice viewing/downloading
- Super Admin hotel management

### SEO Pages
- VTC 7 Places, VTC 8 Places with Google Places Autocomplete

## Key Files
- `/app/backend/routes/fleet_gps.py` - GPS tracking backend
- `/app/backend/vps-teltonika/teltonika-decoder.js` - VPS TCP decoder
- `/app/backend/vps-teltonika/test-simulator.js` - FMB920 simulator
- `/app/backend/routes/fleet_shared.py` - Shared C# API client
- `/app/backend/routes/fleet_planning.py` - Planning endpoints
- `/app/backend/server.py` - Main entry point

## Prioritized Backlog

### P0 - Next
- Frontend GPS Map page (connect to SSE stream for real-time tracking)
- AI-assisted booking creation (parse free text/email to pre-fill form)

### P1 - Upcoming
- Google Sheets Planning Import (CSV upload)
- Android Hotel Kiosk App (simplified /kiosk/quick-book)
- Fleet Portal: Company Profile edit page

### P2 - Blocked
- Partner Ride Cancellation sync with C# backend (waiting for API endpoint)

### P3 - Future
- Hotel Admin: Automated monthly invoicing
- Super Admin: Hotel leaderboard
- Wialon History playback

## Test Credentials
- **Super Admin**: admin@zont.cab / admin123
- **Fleet Admin**: Nandetiri1@gmail.com / 12345678
- **Hotel Admin**: admin@bristol.fr / hotel123
- **GPS Webhook Key**: 3iIYkCw2PAWGzDtmv6RAsfRpejFUu0n_4shfkQb-XSg (header: X-GPS-API-Key)

## Key DB Schema
- `fleet_reservations`: {id, companyId, type, date, time, status, driver, clientName, etc.}
- `gps_devices`: {id, companyId, imei, vehicleName, licensePlate, driverId, driverName}
- `gps_positions`: {imei, lat, lng, speed, heading, altitude, satellites, ignition, timestamp, updatedAt}
- `gps_history`: {imei, timestamp, lat, lng, speed, heading, altitude, satellites, ignition, receivedAt}

## Key API Endpoints
- `POST /api/fleet/auth/login` - Fleet login
- `GET /api/fleet/planning` - Planning data
- `POST /api/fleet/gps/webhook` - Receive GPS data from VPS
- `POST /api/fleet/gps/webhook/batch` - Batch GPS webhook
- `GET /api/fleet/gps/devices` - List GPS devices
- `GET /api/fleet/gps/positions` - Latest GPS positions
- `GET /api/fleet/gps/stream` - SSE real-time GPS stream
- `GET /api/fleet/gps/history/{imei}` - Position history
