# PRD - Zont Fleet & Hotel Kiosk Management System

## Original Problem Statement
Multi-portal VTC platform (ZONT.cab) with Fleet GPS tracking, Hotel Kiosk, Driver PWA, Super Admin.
External C# backend (api.zont.cab) + internal MongoDB. Custom Teltonika GPS integration replacing Wialon.

## Core Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI + Leaflet (light CartoDB tiles)
- **Backend**: FastAPI (Python) + MongoDB
- **GPS**: Teltonika FMB/FMC via external VPS TCP decoder -> Webhook -> MongoDB -> WebSocket broadcast
- **External**: C# backend (api.zont.cab) via proxy

## Portals
1. **Client Portal** - Public booking interface
2. **Admin Portal** - /admin - Super admin CMS, SEO, hotels, partners
3. **Hotel Portal** - /hotel - Hotel-specific bookings, revenue, invoices
4. **Fleet Portal** - /fleet - Company fleet management, drivers, vehicles, planning, GPS
5. **Driver PWA** - /driver - Mobile driver interface
6. **GPS Admin Portal** - /gps-admin - Global GPS device & company management

## What's Been Implemented

### GPS Real-Time WebSocket System (March 2026)
- **WebSocket Backend**: GPSConnectionManager class in fleet_gps.py, broadcasts position_update on webhook receipt
- **Fleet WS Endpoint**: /api/fleet/gps/ws?token=xxx (C# JWT token, company-specific filtering)
- **Admin WS Endpoint**: /api/gps-admin/ws?token=xxx (PyJWT, global view)
- **Frontend**: Both maps use WebSocket primary with polling fallback (3s interval)
- **Car SVG Icons**: Top-down car shape with heading rotation, 4 status colors
- **Statuses**: Moving (green, speed>2), Stopped (amber), Offline (red, >10min), GPS Lost (gray)
- **Smooth Animation**: requestAnimationFrame interpolation between positions
- **Vehicle Detail**: Full telemetry panel (speed, heading, satellites, ignition, timestamp, coordinates)
- **Company Filter**: GPS Admin map has dropdown to filter by company/unassigned
- **Testing**: 100% backend (10/10) + 100% frontend E2E (iteration_42)

### GPS Admin Portal (March 2026)
- **Backend**: 14 API endpoints (auth, companies CRUD, devices CRUD, assign/unassign, positions, stats)
- **Frontend**: Login, Dashboard, Devices, Companies, Global Map
- **Testing**: 100% pass (iteration_41)

### Fleet GPS Tracking (March 2026)
- Teltonika Codec8/8E TCP decoder (Node.js VPS kit)
- Webhook + SSE + WebSocket endpoints
- Wialon completely removed

### Fleet Management Portal
- Planning Module, Driver Profiles, Vehicles CRUD, Company Bookings
- Optimized C# proxy with caching/pooling

### Hotel & Admin
- Hotel Admin portal, Super Admin panel, SEO pages

## Key Files
- `/app/frontend/src/pages/fleet/FleetGeolocation.js` - Fleet GPS map (WebSocket + car icons)
- `/app/frontend/src/pages/gps-admin/GpsAdminMap.js` - GPS Admin global map
- `/app/frontend/src/pages/gps-admin/*` - GPS Admin Portal (7 files)
- `/app/backend/routes/fleet_gps.py` - GPS backend (WebSocket + webhook + SSE)
- `/app/backend/routes/gps_admin.py` - GPS Admin backend (WebSocket + CRUD)
- `/app/backend/vps-teltonika/` - VPS TCP decoder kit

## DB Collections (GPS)
- `gps_admin_users`: {id, email, passwordHash, name}
- `gps_companies`: {id, name, companyId, contactEmail, phone, active, maxDevices}
- `gps_devices`: {id, imei, companyId, companyName, vehicleName, licensePlate, driverName}
- `gps_positions`: {imei, lat, lng, speed, heading, ignition, timestamp}

## Prioritized Backlog
- **P0**: AI-assisted booking creation (LLM integration needed)
- **P1**: Google Sheets Planning Import, Hotel Kiosk, Trip History/Route Replay
- **P2**: Geofences & GPS Alerts, Editable Company Profile, Partner cancellation (blocked C# team)
- **P3**: Hotel automated invoicing, Hotel leaderboard

## Test Credentials
- GPS Admin: gps@zont.cab / gpsadmin123
- Fleet: Nandetiri1@gmail.com / 12345678
- Super Admin: admin@zont.cab / admin123
- Hotel: admin@bristol.fr / hotel123
