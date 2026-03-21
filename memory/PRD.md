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
- **In-Memory Cache**: 30-second TTL cache for C# API responses, avoids redundant calls on navigation
- **Parallel Data Fetching**: All C# API calls + MongoDB queries run via `asyncio.gather` instead of sequential
- **Reduced Auction Scan**: Range reduced from 35 to ~18 IDs, cached individually
- **MongoDB Indexes**: Compound indexes on `fleet_reservations`, `driver_rest_days`, `driver_forfaits`
- **Centralized Logic** (`fleet_shared.py`): Auth helpers, date parsing, scan logic, format functions shared across all fleet routes
- **Results**: Planning day 4.3s→1.7s (-60%), Planning week 16.7s→1.1s (-93%), Bookings 16s→1s (-93%)

## What's Been Implemented

### Fleet Management Portal
- Login via C# backend (`/api/Login/company`)
- Dashboard with company stats
- **Driver Profile** - Click on a driver to see their profile with:
  - Driver info (name, phone, email, status, rating)
  - Monthly ride history with month selector (prev/next navigation)
  - Per-ride forfait input field with save button
  - Summary cards: total rides, total price, total forfait for the month
  - Rides table with date, time, type, source, addresses, client, price, forfait
- Vehicles list + Add Vehicle form (cascade Year/Make/Model)
- Vehicle-Driver assignment/un-assignment
- "Reservations Zont" - view bookings from C# backend
- "Mes Reservations" - company's own bookings (MongoDB `fleet_reservations`)
  - CRUD for Transfer, Dispo, Excursion types
  - Fields: clientName, passengerName, flightNumber, passengers, etc.
  - Assign/unassign drivers, send to Zont, cancel
  - Date range and text search filters
- **Planning Module** - Timeline view (Day/Week/Month) of driver schedules
  - Shows bookings from both Zont (C#) and company (MongoDB)
  - Conflict detection for double-booking
  - **Unassigned missions panel** - Shows bookings without driver from both Zont and company sources
  - **Source filter (Tout/Societe/Zont)** - Segmented control in header to filter events and unassigned missions by source
  - **Direct assignment from Planning** - Assign drivers to missions directly from timeline view
  - **Force assignment** - Override conflict check when driver is available earlier than planned
  - **Unassign/Reassign from timeline** - Click on assigned event to unassign or reassign to another driver
  - Conflict check before assignment/reassignment with force option
  - **Rest Day management** - Toggle rest days in month view
  - **Month calendar view** - Full month view with event counts per day per driver

### Fleet GPS Tracking (March 2026 - NEW)
- **Teltonika GPS Integration Backend** - Complete webhook-based system for receiving decoded GPS data from external VPS
  - `POST /api/fleet/gps/webhook` - Receive GPS data from VPS (X-GPS-API-Key auth)
  - `POST /api/fleet/gps/webhook/batch` - Batch receive for multiple devices
  - `POST /api/fleet/gps/devices` - Register GPS device (IMEI + vehicle/driver link)
  - `GET /api/fleet/gps/devices` - List devices with latest position enrichment
  - `PUT /api/fleet/gps/devices/{imei}` - Update device metadata
  - `DELETE /api/fleet/gps/devices/{imei}` - Remove device
  - `GET /api/fleet/gps/positions` - Latest positions for all company vehicles
  - `GET /api/fleet/gps/positions/{imei}` - Latest position for specific vehicle
  - `GET /api/fleet/gps/history/{imei}?start=...&end=...` - Position history with date range
  - `GET /api/fleet/gps/stats` - GPS system stats (devices, online/offline, total positions)
  - `GET /api/fleet/gps/webhook-info` - VPS setup info (webhook URL, masked API key, format)
  - `GET /api/fleet/gps/stream` - SSE (Server-Sent Events) for real-time position updates
- **MongoDB Collections**: `gps_devices`, `gps_positions` (upsert per IMEI), `gps_history` (30-day TTL)
- **MongoDB Indexes**: Unique on IMEI+companyId, TTL on history receivedAt

### Hotel Kiosk System
- Commission/invoicing modules
- Hotel Admin portal with invoice viewing/downloading
- Super Admin hotel management

### SEO Pages
- VTC 7 Places, VTC 8 Places with Google Places Autocomplete

### UI/UX
- Light theme for Super Admin
- PhoneInput component with country code search
- Responsive layouts across all portals

## Key Files
- `/app/backend/routes/fleet_portal.py` - Fleet portal proxy routes
- `/app/backend/routes/fleet_my_bookings.py` - Company bookings CRUD (MongoDB)
- `/app/backend/routes/fleet_planning.py` - Planning module endpoints
- `/app/backend/routes/fleet_gps.py` - GPS tracking backend (webhook, devices, positions, history, SSE)
- `/app/backend/routes/fleet_shared.py` - Shared C# API client with caching
- `/app/backend/routes/fleet_wialon.py` - Wialon GPS integration
- `/app/frontend/src/pages/fleet/FleetPlanning.js` - Planning page with unassigned panel
- `/app/frontend/src/pages/fleet/FleetMyBookings.js` - My Bookings list
- `/app/frontend/src/pages/fleet/FleetCreateBooking.js` - Booking creation form
- `/app/frontend/src/pages/fleet/FleetVehicles.js` - Vehicles with driver assignment

## Prioritized Backlog

### P0 - Next
- AI-assisted booking creation (parse free text/email to pre-fill booking form)
- Frontend GPS Map page (connect to backend SSE stream for real-time tracking)

### P1 - Upcoming
- Google Sheets Planning Import (CSV upload to fleet_reservations)
- Android Hotel Kiosk App (simplified /kiosk/quick-book interface)
- Fleet Portal: Company Profile edit page

### P2 - Blocked
- Partner Ride Cancellation sync with C# backend (waiting for API endpoint)

### P3 - Future
- Hotel Admin: Automated monthly invoicing
- Super Admin: Hotel leaderboard
- Wialon History playback
- Teltonika GPS Webhook Integration (endpoint ready, VPS decoder pending)

## Technical Debt
- `FleetPlanning.js` is very large, could be split into sub-components
- XMLHttpRequest workaround for Stripe.js needs centralization

## Test Credentials
- **Super Admin**: admin@zont.cab / admin123
- **Fleet Admin**: Nandetiri1@gmail.com / 12345678
- **Hotel Admin**: admin@bristol.fr / hotel123
- **GPS Webhook Key**: 3iIYkCw2PAWGzDtmv6RAsfRpejFUu0n_4shfkQb-XSg (header: X-GPS-API-Key)

## Key DB Schema
- `fleet_reservations`: {id, companyId, type, date, time, status, driver: {id, name}, clientName, flightNumber, passengerName, passengers, pickupAddress, dropoffAddress, price, comment, hours, vehicleModel, tourName, guideName, sentToZont, createdAt}
- `gps_devices`: {id, companyId, imei, vehicleName, licensePlate, driverId, driverName, createdAt, updatedAt}
- `gps_positions`: {imei, lat, lng, speed, heading, altitude, satellites, ignition, timestamp, updatedAt}
- `gps_history`: {imei, timestamp, lat, lng, speed, heading, altitude, satellites, ignition, receivedAt}

## Key API Endpoints
- `POST /api/fleet/auth/login` - Fleet login (username, password)
- `GET /api/fleet/planning` - Planning data with drivers, events, and unassigned bookings
- `POST /api/fleet/planning/check-conflict` - Check driver availability
- `GET, POST /api/fleet/my-bookings` - CRUD company bookings
- `PUT /api/fleet/my-bookings/{id}/assign` - Assign driver to booking
- `PUT /api/fleet/my-bookings/{id}/unassign` - Remove driver from booking
- `POST /api/fleet/vehicles/assign-driver` - Assign driver to vehicle
- `POST /api/fleet/gps/webhook` - Receive GPS data from VPS
- `POST /api/fleet/gps/webhook/batch` - Batch GPS webhook
- `GET /api/fleet/gps/devices` - List GPS devices
- `GET /api/fleet/gps/positions` - Latest GPS positions
- `GET /api/fleet/gps/stream` - SSE real-time GPS stream
