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

### Fleet Management Portal
- Login via C# backend (`/api/Login/company`)
- Dashboard with company stats
- Drivers list with search/filter + Add Driver form
- Vehicles list + Add Vehicle form (cascade Year/Make/Model)
- Vehicle-Driver assignment/un-assignment
- "Reservations Zont" - view bookings from C# backend
- "Mes Reservations" - company's own bookings (MongoDB `fleet_reservations`)
  - CRUD for Transfer, Dispo, Excursion types
  - Fields: clientName, passengerName, flightNumber, passengers, etc.
  - Assign/unassign drivers, send to Zont, cancel
  - Date range and text search filters
- **Planning Module** - Timeline view (Day/Week) of driver schedules
  - Shows bookings from both Zont (C#) and company (MongoDB)
  - Conflict detection for double-booking
  - **Unassigned missions panel** - Shows bookings without driver
  - **Direct assignment from Planning** - Assign drivers to missions directly from timeline view
  - **Force assignment** - Override conflict check when driver is available earlier than planned
  - **Unassign/Reassign from timeline** - Click on assigned event to unassign or reassign to another driver
  - Conflict check before assignment/reassignment with force option

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
- `/app/frontend/src/pages/fleet/FleetPlanning.js` - Planning page with unassigned panel
- `/app/frontend/src/pages/fleet/FleetMyBookings.js` - My Bookings list
- `/app/frontend/src/pages/fleet/FleetCreateBooking.js` - Booking creation form
- `/app/frontend/src/pages/fleet/FleetVehicles.js` - Vehicles with driver assignment

## Prioritized Backlog

### P0 - Next
- AI-assisted booking creation (parse free text/email to pre-fill booking form)

### P1 - Upcoming
- Fleet Portal: Company Profile edit page
- Vehicle duplication fix (ID 9 and 10 in C# backend)

### P2 - Blocked
- Partner Ride Cancellation sync with C# backend (waiting for API endpoint)

### P3 - Future
- Hotel Admin: Automated monthly invoicing
- Super Admin: Hotel leaderboard

## Technical Debt
- XMLHttpRequest workaround for Stripe.js needs centralization

## Test Credentials
- **Super Admin**: admin@zont.cab / admin123
- **Fleet Admin**: Nandetiri1@gmail.com / 12345678

## Key DB Schema
- `fleet_reservations`: {id, companyId, type, date, time, status, driver: {id, name}, clientName, flightNumber, passengerName, passengers, pickupAddress, dropoffAddress, price, comment, hours, vehicleModel, tourName, guideName, sentToZont, createdAt}

## Key API Endpoints
- `POST /api/fleet/auth/login` - Fleet login (username, password)
- `GET /api/fleet/planning` - Planning data with drivers, events, and unassigned bookings
- `POST /api/fleet/planning/check-conflict` - Check driver availability
- `GET, POST /api/fleet/my-bookings` - CRUD company bookings
- `PUT /api/fleet/my-bookings/{id}/assign` - Assign driver to booking
- `PUT /api/fleet/my-bookings/{id}/unassign` - Remove driver from booking
- `POST /api/fleet/vehicles/assign-driver` - Assign driver to vehicle
