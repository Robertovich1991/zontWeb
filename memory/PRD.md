# PRD - Zont Fleet & Hotel Kiosk Management System

## Original Problem Statement
Multi-portal VTC platform (ZONT.cab) with Fleet GPS tracking, Hotel Kiosk, Driver PWA, Super Admin.
External C# backend (api.zont.cab) + internal MongoDB. Custom Teltonika GPS integration replacing Wialon.

## Core Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI + Leaflet (light CartoDB tiles)
- **Backend**: FastAPI (Python) + MongoDB
- **GPS**: Teltonika FMB/FMC via external VPS TCP decoder -> Webhook -> MongoDB
- **External**: C# backend (api.zont.cab) via proxy

## Portals
1. **Client Portal** - Public booking interface
2. **Admin Portal** - /admin - Super admin CMS, SEO, hotels, partners
3. **Hotel Portal** - /hotel - Hotel-specific bookings, revenue, invoices
4. **Fleet Portal** - /fleet - Company fleet management, drivers, vehicles, planning, GPS
5. **Driver PWA** - /driver - Mobile driver interface
6. **GPS Admin Portal** - /gps-admin - Global GPS device & company management

## What's Been Implemented

### GPS Admin Portal (March 2026)
- **Backend**: 14 API endpoints (auth, companies CRUD, devices CRUD, assign/unassign, positions, stats)
- **Frontend**: Login, Dashboard (6 stat cards), Devices (table + CRUD modals), Companies (cards + CRUD), Global Map (Leaflet + sidebar)
- **Auth**: Separate JWT auth context (gps_admin_users collection)
- **Routes**: /gps-admin/login, /gps-admin/dashboard, /gps-admin/devices, /gps-admin/companies, /gps-admin/map
- **Testing**: 100% pass rate (20/20 backend, all frontend E2E)

### Fleet GPS Tracking (March 2026)
- **Backend**: 12 API endpoints (webhook, devices CRUD, positions, history, SSE, stats)
- **VPS Decoder**: Node.js Teltonika Codec8/Codec8E TCP decoder with simulator
- **Frontend Map**: Light theme dispatch UI with Bento grid telemetry
- **Wialon**: Completely removed (backend + frontend)

### Fleet Management Portal
- Planning Module (24h timeline, source filters, conflict detection)
- Driver Profiles, Vehicles CRUD, Company Bookings CRUD
- Optimized C# proxy with caching/pooling

### Hotel & Admin
- Hotel Admin portal, Super Admin panel, SEO pages

## Key Files
- `/app/frontend/src/pages/gps-admin/*` - GPS Admin Portal (7 files)
- `/app/frontend/src/pages/fleet/FleetGeolocation.js` - Fleet GPS map
- `/app/backend/routes/gps_admin.py` - GPS Admin backend
- `/app/backend/routes/fleet_gps.py` - Fleet GPS backend
- `/app/backend/vps-teltonika/` - VPS TCP decoder kit

## DB Collections (GPS)
- `gps_admin_users`: {id, email, passwordHash, name}
- `gps_companies`: {id, name, companyId, contactEmail, phone, active, maxDevices}
- `gps_devices`: {id, imei, companyId, companyName, vehicleName, licensePlate, driverName}
- `gps_positions`: {imei, lat, lng, speed, heading, ignition, timestamp}

## Prioritized Backlog
- **P0**: AI-assisted booking creation (LLM integration needed)
- **P1**: Google Sheets Planning Import, Hotel Kiosk, Trip History/Route Replay
- **P2**: Geofences & GPS Alerts, Editable Company Profile, Partner cancellation (blocked by C# team)
- **P3**: Hotel automated invoicing, Hotel leaderboard

## Test Credentials
- GPS Admin: gps@zont.cab / gpsadmin123
- Fleet: Nandetiri1@gmail.com / 12345678
- Super Admin: admin@zont.cab / admin123
- Hotel: admin@bristol.fr / hotel123
