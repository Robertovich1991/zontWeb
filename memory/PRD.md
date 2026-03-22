# PRD - Zont Fleet & Hotel Kiosk Management System

## Original Problem Statement
Build a multi-portal VTC platform (ZONT.cab) including:
- Client-facing booking site
- Driver PWA
- Super Admin panel
- Hotel Admin panel
- Fleet Management portal with GPS tracking

## Core Architecture
- **Frontend**: React (CRA) with Tailwind CSS, Shadcn/UI, Leaflet
- **Backend**: FastAPI (Python)
- **Database**: MongoDB + External C# backend (api.zont.cab)
- **GPS**: Teltonika FMB/FMC via external VPS TCP decoder -> Webhook -> MongoDB

## What's Been Implemented

### Fleet GPS Tracking (March 2026)
- **Backend**: 12 API endpoints for GPS data (webhook, devices CRUD, positions, history, SSE stream, stats)
- **VPS Decoder**: Node.js Teltonika Codec8/Codec8E TCP decoder with test simulator
- **Frontend Map**: Professional dark-theme fleet map page (Leaflet + CartoDB dark tiles)
  - Full-screen layout with left sidebar vehicle list
  - Real-time vehicle markers (green=moving, amber=stopped, grey=offline)
  - Right detail panel: vehicle name, driver, IMEI, position, speed, heading, satellites, ignition, last update
  - Status filters (All/Moving/Stopped/Offline) + search bar
  - Add device modal (IMEI, vehicle name, plate, driver)
  - Auto-refresh every 8 seconds
  - Mobile responsive with bottom sheet
- **Wialon removed**: All Wialon code/routes/integrations completely deleted

### Fleet Management Portal
- Planning Module (24h timeline, source filters, conflict detection)
- Driver Profiles with forfait management
- Vehicles CRUD + Driver assignment
- Company Bookings CRUD (MongoDB fleet_reservations)
- Zont Bookings view (C# backend proxy)
- Performance optimized backend (fleet_shared.py caching/pooling)

### Hotel & Admin
- Hotel Admin portal (dashboard, commissions, invoices)
- Super Admin panel
- SEO pages

## Key Files
- `/app/backend/routes/fleet_gps.py` - GPS backend
- `/app/backend/vps-teltonika/` - VPS TCP decoder kit
- `/app/frontend/src/pages/fleet/FleetGeolocation.js` - GPS map page
- `/app/frontend/src/pages/fleet/FleetLayout.js` - Fleet layout (full-screen support)
- `/app/backend/routes/fleet_shared.py` - C# API client with caching

## Prioritized Backlog

### P0 - Next
- AI-assisted booking creation (parse text/email to pre-fill booking form)

### P1 - Upcoming
- Google Sheets Planning Import (CSV upload)
- Android Hotel Kiosk App (/kiosk/quick-book)
- Fleet Company Profile edit page
- GPS History/Replay (trip playback on map)
- GPS Geofences & Alerts

### P2 - Blocked
- Partner Ride Cancellation sync (waiting for C# API)

### P3 - Future
- Hotel Admin: Automated monthly invoicing
- Super Admin: Hotel leaderboard
- GPS Dispatch integration (assign from map)

## Test Credentials
- **Fleet Admin**: Nandetiri1@gmail.com / 12345678
- **Super Admin**: admin@zont.cab / admin123
- **Hotel Admin**: admin@bristol.fr / hotel123
- **GPS Webhook Key**: 3iIYkCw2PAWGzDtmv6RAsfRpejFUu0n_4shfkQb-XSg

## Key DB Schema
- `gps_devices`: {id, companyId, imei, vehicleName, licensePlate, driverId, driverName}
- `gps_positions`: {imei, lat, lng, speed, heading, altitude, satellites, ignition, timestamp, updatedAt}
- `gps_history`: {imei, timestamp, lat, lng, speed, heading, altitude, satellites, ignition, receivedAt} (30-day TTL)
