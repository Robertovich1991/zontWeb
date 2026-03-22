# PRD - Zont Fleet & Hotel Kiosk Management System

## Original Problem Statement
Multi-portal VTC platform (ZONT.cab) with Fleet GPS tracking, Hotel Kiosk, Driver PWA, Super Admin.

## Core Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI + Leaflet (dark CartoDB tiles)
- **Backend**: FastAPI (Python) + MongoDB
- **GPS**: Teltonika FMB/FMC via external VPS TCP decoder -> Webhook -> MongoDB
- **Fonts**: Manrope (headings), IBM Plex Sans (body), IBM Plex Mono (telemetry)

## What's Been Implemented

### Fleet GPS Tracking (March 2026)
- **Backend**: 12 API endpoints (webhook, devices CRUD, positions, history, SSE, stats)
- **VPS Decoder**: Node.js Teltonika Codec8/Codec8E TCP decoder with simulator
- **Frontend Map**: Premium dispatch UI (Wialon/Uber/Blacklane style)
  - Glassmorphic floating panels (bg-zinc-950/65 backdrop-blur-2xl)
  - Bento grid telemetry (speed, heading, satellites, ignition)
  - Minimal dot markers with pulse animations (emerald=moving, amber=stopped, zinc=offline)
  - Pill-shaped status filters with active state
  - IBM Plex Mono for all telemetry data
  - Manrope headings, dark #09090B background
  - Auto-refresh 8s, mobile responsive with bottom sheet
- **Wialon**: Completely removed (backend + frontend)

### Fleet Management Portal
- Planning Module (24h timeline, source filters, conflict detection)
- Driver Profiles, Vehicles CRUD, Company Bookings CRUD
- Optimized C# proxy with caching/pooling

### Hotel & Admin
- Hotel Admin portal, Super Admin panel, SEO pages

## Key Files
- `/app/frontend/src/pages/fleet/FleetGeolocation.js` - GPS map (premium design)
- `/app/backend/routes/fleet_gps.py` - GPS backend
- `/app/backend/vps-teltonika/` - VPS TCP decoder kit

## Prioritized Backlog
- **P0**: AI-assisted booking creation
- **P1**: Google Sheets Import, Hotel Kiosk, Company Profile, GPS History/Replay
- **P2**: Teltonika webhook (ready), Partner cancellation (blocked)
- **P3**: Hotel invoicing, Hotel leaderboard, GPS dispatch

## Test Credentials
- Fleet: Nandetiri1@gmail.com / 12345678
- Super Admin: admin@zont.cab / admin123
- Hotel: admin@bristol.fr / hotel123
- GPS Key: 3iIYkCw2PAWGzDtmv6RAsfRpejFUu0n_4shfkQb-XSg
