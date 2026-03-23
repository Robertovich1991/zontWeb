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

### AI Delay Risk Module (March 2026)
- **Backend**: GET /api/fleet/planning/delay-risk?date=YYYY-MM-DD
- **Scoring**: +40 overlap, +25 ETA>margin, +20 GPS inactive >10min, +15 no driver, +10 margin <10min
- **Google Distance Matrix**: Real-time traffic ETA calculation
- **Adaptive Caching**: >=60min→30min TTL, 20-60min→10min TTL, <20min→5min TTL
- **Frontend**: Risk badges (green/amber/red) on events, colored ring borders, risk summary counter
- **Tooltip**: Reasons, ETA with traffic, distance, margin, GPS status
- **Sound + Push Alerts**: Two-tone alert sound + browser notification when score escalates to red (at_risk)
- **Alert Toggle**: Persistent on/off button in header (localStorage), speaker icon
- **Visual Flash**: Risk summary bar pulses red + ping animation on escalation
- **Auto-refresh**: Every 30 seconds in day and week views
- **Status**: on_time (0-39), tight (40-69), at_risk (70-100)
- **Testing**: 100% backend (16/16) + 100% frontend E2E (iteration_44)

### GPS Route Replay / Trip History (March 2026)
- **Backend**: GET /api/fleet/gps/history/{imei}, GET /api/fleet/gps/history-days/{imei}
- **Frontend**: FleetGPSHistory.js - Leaflet map with speed-based route coloring, replay animation
- **Features**: Device selector, date picker, polyline, start/end markers, replay controls (1x-50x)
- **Testing**: 100% (iteration_43)

### GPS Real-Time WebSocket System (March 2026)
- WebSocket backend broadcasting, SVG car icons with heading rotation
- Bi-directional Ping/Pong for K8s proxy keep-alive
- Testing: 100% (iterations 41, 42)

### GPS Admin Portal (March 2026)
- 14 API endpoints, Login, Dashboard, Devices, Companies, Global Map
- Testing: 100% (iteration_41)

### Fleet GPS Tracking (March 2026)
- Teltonika Codec8/8E TCP decoder (Node.js VPS kit)
- Webhook + SSE + WebSocket endpoints, Wialon completely removed

### Fleet Management Portal
- Planning Module, Driver Profiles, Vehicles CRUD, Company Bookings
- Optimized C# proxy with caching/pooling

### Hotel & Admin
- Hotel Admin portal, Super Admin panel, SEO pages

## Key Files
- `/app/backend/routes/fleet_planning.py` - Planning + AI Delay Risk endpoint
- `/app/frontend/src/pages/fleet/FleetPlanning.js` - Planning with risk badges/tooltips
- `/app/frontend/src/pages/fleet/FleetGeolocation.js` - Live GPS map (WebSocket)
- `/app/frontend/src/pages/fleet/FleetGPSHistory.js` - GPS Route Replay
- `/app/backend/routes/fleet_gps.py` - GPS backend (WebSocket + webhook + history)
- `/app/backend/routes/gps_admin.py` - GPS Admin backend

## DB Collections (GPS)
- `gps_devices`: {imei, companyId, vehicleName, licensePlate, driverName}
- `gps_positions`: {imei, lat, lng, speed, heading, ignition, timestamp}
- `gps_history`: {imei, lat, lng, speed, heading, altitude, satellites, ignition, timestamp}
- `fleet_reservations`: {id, companyId, type, date, time, driver, pickupAddress, dropoffAddress, price}

## Prioritized Backlog
- **P0**: AI-assisted booking creation (LLM - paste email text → extract booking details)
- **P1**: Google Sheets / CSV Planning Import
- **P1**: Hotel Kiosk App (tablet interface)
- **P2**: Geofences & GPS Alerts (zones, speed alerts)
- **P2**: Editable Company Profile Page
- **P2**: Partner ride cancellation (BLOCKED - waiting C# team API)
- **P3**: Hotel automated invoicing
- **P3**: Hotel leaderboard

## Test Credentials
- GPS Admin: gps@zont.cab / gpsadmin123
- Fleet: Nandetiri1@gmail.com / 12345678
- Super Admin: admin@zont.cab / admin123
- Hotel: admin@bristol.fr / hotel123
