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

## What's Been Implemented

### Fleet Management Portal (Phase 1 + Phase 2 - Add Driver)
- Login via C# backend (`/api/Login/company`)
- Dashboard with company stats
- Drivers list (read-only from C#) with search/filter
- **NEW: Add Driver form** - Creates driver via `POST /api/Driver` on C# backend
  - Fields: firstName, lastName, email, phone (with country code selector), gender, password
  - Driver sent for admin approval on C# side
- Vehicles list (read-only from C#)
- Company profile view

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
- `/app/backend/routes/fleet_portal.py` - Fleet portal proxy routes (drivers, vehicles, ref data)
- `/app/frontend/src/pages/fleet/` - Fleet portal frontend
- `/app/frontend/src/pages/fleet/FleetAddDriver.js` - Add driver form
- `/app/frontend/src/pages/fleet/FleetAddVehicle.js` - Add vehicle form with cascade dropdowns
- `/app/frontend/src/pages/fleet/FleetDrivers.js` - Drivers list
- `/app/frontend/src/pages/fleet/FleetVehicles.js` - Vehicles list

- `/app/frontend/src/pages/fleet/FleetBookings.js` - Reservations with dispatch
- `/app/frontend/src/pages/fleet/FleetTrips.js` - Trips history

## Prioritized Backlog

### P1 - Next
- Fleet Portal: Company Profile edit page

### P2 - Upcoming
- Partner Ride Cancellation sync with C# backend

### P3 - Future
- Hotel Admin: Automated monthly invoicing
- Super Admin: Hotel leaderboard

## Technical Debt
- XMLHttpRequest workaround for Stripe.js needs centralization

## Test Credentials
- **Super Admin**: admin@zont.cab / admin123
- **Fleet Admin**: Nandetiri1@gmail.com / 12345678
