# Zont.cab - React Migration PRD

## Original Problem Statement
Migration of the Angular website zont.cab to a React frontend with a C# backend, including multilingual support (FR, EN, RU, HY). The project includes a full mobile-first redesign, SEO implementation, B2B lead generation, and a comprehensive CMS.

## Architecture
- **Frontend**: React + Tailwind CSS + i18next (multilingual)
- **Backend**: FastAPI (Python) as CMS + proxy to C# backend at api.zont.cab
- **Database**: MongoDB (CMS data), C# backend (operational data)
- **External APIs**: Google Maps Places API, api.zont.cab (C# backend), Stripe
- **Toast Library**: `sonner` (standardized across entire project)

## What's Been Implemented

### Phase 1 - CMS & Content (Complete)
- Admin Panel (login, dashboard, CRUD for pages/places/trust-blocks/FAQs/homepage)
- CMS data seeding with real website content
- Public-facing pages dynamically connected to CMS

### Phase 2 - UI/UX Redesign (Complete)
- Professional redesign of Car Selection page (Blacklane-inspired)
- Become Driver page overhaul with company registration form
- Full Armenian (hy) translations fix

### Phase 3 - C# API Integration (Complete)
- Backend proxy routes (`/api/proxy/*`) forwarding to `api.zont.cab`
- Google Maps Places Autocomplete for address input with geocoding fallback
- Dynamic Car Selection page - real vehicle categories, prices, images from C# API
- Client Authentication (registration + login + email verification)
- Forgot Password flow

### Phase 3.1 - Error Handling & Toast Standardization (Complete)
- Sonner toast notifications across all pages
- Inline error messages with AlertCircle icons

### Phase 4 - Driver/Partner PWA App (Complete)
- Partner Auth (MongoDB): Login system separate from C# client auth
- Admin > Partenaires: CRUD for managing partners
- Admin > Courses Partenaires: View all partner rides, filter by status, change status, add admin notes
- Driver PWA (`/driver`): Mobile-first app for partners
  - Login page at `/driver/login`
  - Dashboard with stats, ride list, tabs (Mes Courses / Disponibles)
  - Create ride form at `/driver/new-ride` with Google Maps Autocomplete + route calculation
  - Ride Detail (`/driver/ride/:id`): Full ride info with status
  - Profile (`/driver/profile`): Partner info + Stripe card management

### Phase 4.1 - Stripe Card Management (Complete)
- Stripe checkout session for card registration
- Card status tracking in partner profile

### Phase 4.2 - Driver Review/Rating System (Complete)
- Peer review system (1-5 stars, comment validation)
- Profile & dashboard integration

### Phase 5 - Client Stripe Payment & Booking Submission (Complete)
- Stripe Elements integration on Checkout page
- 3D Secure (3DS) authentication
- Booking submission to C# auction system

### Phase 5.1 - Partner Ride Proposal & Payment Flow (Complete - March 13, 2026)
- **Dual Authentication**: Partners get both PWA JWT and C# client JWT on login
- **C# Client Registration**: When admin creates a partner, a corresponding client account is created in C# system
- **Stripe SetupIntent**: Partners can enter card via Stripe Elements with 3DS authentication
- **Ride Creation with C# Dispatch**: Partners propose rides with their own price, submitted to C# auction system
- **Status Tracking**: New `submitted_csharp` status shows rides dispatched to C# system
- **Stats Dashboard**: Updated with Total, Attente, Dispatch, Dispo counters
- **Admin Panel**: Rides manager updated with Dispatch filter and status display
- **Bug Fix**: "body stream already read" error fixed by using XMLHttpRequest instead of fetch (Stripe.js conflict)
- **Testing**: 100% pass rate - 27 backend tests, all frontend UI flows verified

### Phase 5.2 - Partner Self-Registration (Complete - March 13, 2026)
- **Self-registration form** on `/driver/login` page with tabs (Connexion / Inscription)
- **Registration fields**: Nom, Email, Telephone, Entreprise (optional), Mot de passe + confirmation
- **Dual creation**: Creates partner in MongoDB + client account in C# system automatically
- **Auto-login**: After registration, partner is automatically logged in with both PWA and C# tokens
- **Validation**: Duplicate email check, password length (min 6 chars), confirmation match
- **Backend endpoint**: `POST /api/partner/auth/register`

### Phase 5.3 - Card Management & Saved Cards (Complete - March 13, 2026)
- **Profile card management**: Partners add/delete cards on `/driver/profile` using C# SetupIntent + Stripe 3DS (0 EUR verification)
- **Saved cards stored in MongoDB**: `partner.saved_cards[]` array with pm_id, brand, added_at
- **Card selector on CreateRide**: Radio buttons to select saved card, no more inline Stripe input
- **Multiple cards support**: Partners can add and manage multiple cards
- **Ride creation simplified**: Select saved card → submit ride → C# verifies funds → dispatch
- **Error handling**: Card errors (insufficient funds, invalid card) shown clearly to partner
- **Backend endpoints**: `POST /api/partner/cards/setup-intent`, `POST /api/partner/cards/save`, `GET /api/partner/cards`, `DELETE /api/partner/cards/{card_id}`
- `POST /api/proxy/distance` - Trip pricing
- `POST /api/proxy/preorder-distance` - Preorder pricing
- `GET /api/proxy/trip-types` - Vehicle types
- `POST /api/proxy/auth/register` - Client registration
- `POST /api/proxy/auth/login` - Client login
- `POST /api/proxy/booking/create` - Create booking/auction in C# backend
- `POST /api/proxy/booking/setup-intent` - Get SetupIntent for 3DS

## Partner PWA Endpoints
- `POST /api/partner/auth/login` - Returns both PWA and C# tokens
- `GET /api/partner/auth/me` - Current partner info
- `GET /api/partner/vehicle-categories` - Vehicle types from C#
- `POST /api/partner/calculate-route` - Google Directions API
- `POST /api/partner/booking/setup-intent` - Stripe SetupIntent via C#
- `POST /api/partner/rides` - Create ride + submit to C# auction
- `GET /api/partner/rides` - Partner's rides
- `GET /api/partner/available-rides` - Other partners' pending rides
- `POST/GET /api/partner/rides/{id}/review` - Review system
- Admin: `GET/POST/PUT/DELETE /api/partner/admin/partners`
- Admin: `GET/PUT /api/partner/admin/rides`

## Credentials
- Admin CMS: admin@zont.cab / admin123
- Test partner: partner_test_1773438684@test.com / Test1234!
- C# Test Client: arthurhayy@gmail.com / 12345678

### Phase 6 - Client Account Management (Complete - March 14, 2026)
- **My Account page** (`/my-account`) with 3 tabs: Profil, Reservations, Paiement
- **Profile tab**: Displays name, email, phone from C# API
- **Reservations tab**: Shows upcoming bookings from C# auction system
- **Payment tab**: Full card management — view saved cards (brand, last4, expiry), add new card via Stripe Elements + 3D Secure, delete cards
- **XHR pattern**: All fetch calls converted to XMLHttpRequest helper to avoid Stripe.js "body stream already read" conflict
- **Date validation**: Frontend + backend prevent booking with past dates
- **Header improvements**: Greets logged-in user by first name ("Bonjour, Arthur")
- **Default to Sign Up**: Auth modal defaults to registration form
- **Backend endpoints**: `GET /api/proxy/client/cards`, `GET /api/proxy/client/add-card`, `DELETE /api/proxy/client/cards/{card_id}`, `GET /api/proxy/client/profile`, `GET /api/proxy/booking/upcoming`
- **Testing**: 100% pass rate — 10 backend tests, all frontend UI flows verified

### Phase 6.1 - Ride Cancellation (Complete - March 14, 2026)
- **Cancel endpoint**: `DELETE /api/proxy/booking/cancel/{auction_id}` proxies to C# `DELETE /api/Auction/cancel/{id}`
- **24h business rule**: Cancellation allowed if >24h before ride, otherwise shows "contactez le service client" warning
- **Frontend UI**: Cancel button (red) on each booking card for >24h, yellow warning banner for <24h
- **Error handling**: 401 without auth, 404 for invalid booking, confirmation dialog before cancel
- **Testing**: 100% pass rate — 6 backend tests + all frontend UI flows verified

### Phase 6.2 - Premium Design Upgrade (Complete - March 15, 2026)
- **Visual overhaul**: "Executive Lounge" aesthetic — glass-morphism, gold accents, Manrope font
- **Profile header**: Circular gold avatar with initial, verified badge, centered layout
- **Pill-shaped tabs**: Glass-morphism background, gold active state with shadow
- **Premium card styling**: Credit card-style display with brand gradient, chip decoration, monospace numbers
- **Improved date parsing**: Fixed "Invalid Date" bug, supports multiple date formats (ISO, DD/MM/YYYY)
- **Fade-in animations**: Smooth entrance effects on tab content
- **Testing**: 100% pass rate — 8 backend + 12 frontend checks

### Phase 7 - Hotel Kiosk Management System - Phase 1 (Complete - March 15, 2026)
- **Backend**: Full CRUD hotels, kiosks, hotel bookings with commission calculation
- **MongoDB Collections**: `hotels`, `hotel_users`, `kiosks`, `hotel_bookings`
- **Auto-create hotel admin**: When creating a hotel, auto-generates admin account
- **Commission engine**: Calculates hotel %, Zont %, driver amount per booking
- **Super Admin Dashboard**: 6 stat cards, monthly revenue chart, hotel ranking table
- **Hotel Management**: List, create, edit, toggle status, delete hotels with search
- **Hotel Detail**: Stats, contact info, commission rates, kiosks status, recent bookings
- **Demo data**: 3 hotels seeded (Le Bristol Paris 15%, Negresco Nice 12%, W Barcelona 18%)
- **Sidebar**: New "HOTEL KIOSK" section with Dashboard Hotels + Gestion Hotels
- **Testing**: 100% pass rate — 20 backend + 16 frontend checks

### Phase 7.2 - Hotel Kiosk Phase 2 (Complete - March 15, 2026)
- **Bornes Tactiles page** (`/admin/hotel-kiosks`): stats (total/online/offline), create form, filters (hotel/status), kiosk cards with toggle + delete
- **Reservations Hotels page** (`/admin/hotel-bookings`): summary cards (count/CA/comm/rev), search, filters (hotel/status/period 7d-30d-90d), sort (date/prix), full table with commission calculs
- **Backend endpoints**: PUT kiosk status toggle, DELETE kiosk, enriched bookings with commission calculations
- **Sidebar**: 4 items under "HOTEL KIOSK" section (Dashboard, Gestion, Bornes, Reservations)
- **Testing**: 100% pass rate — 17 backend + 15 frontend checks

### Phase 7.3 - Hotel Admin Portal (Complete - March 16, 2026)
- **Hotel Login** (`/hotel/login`): Dedicated login page for hotel administrators with email/password auth
- **Hotel Layout** (`/hotel`): Sidebar with navigation (Dashboard, Reservations, Revenus), hotel branding, user info, logout
- **Hotel Dashboard** (`/hotel`): Stats cards (bookings today/month, CA, commission), monthly revenue highlight, revenue chart (6 months), kiosks status
- **Hotel Bookings** (`/hotel/bookings`): Full bookings table with search, status/period filters, sort toggle, CSV export
- **Hotel Revenue** (`/hotel/revenue`): 4 stat cards, monthly comparison (current vs previous), revenue chart, monthly breakdown table
- **Auth Guard**: Unauthenticated users redirected to `/hotel/login`
- **CSV Export**: Backend supports token via query param for `window.open()` downloads
- **Backend endpoints**: `POST /api/hotel/auth/login`, `GET /api/hotel/dashboard`, `GET /api/hotel/bookings`, `GET /api/hotel/bookings/export`, `GET /api/hotel/profile`
- **Testing**: 100% pass rate — 12 backend + 9 frontend scenarios verified
- **Credentials**: Each hotel admin uses `hotel{hotel_id}` as default password (e.g., `admin@bristol.fr` / `hotelc9baf685`)

## Backlog

### P1 - Partner Payment Debits (ON HOLD by user)
- Charge partner's saved Stripe card when a ride they proposed is completed by another driver
- User needs to coordinate with C# developer first

### P1 - Ride Cancellation via C# API (BLOCKED)
- C# backend does not expose a cancellation endpoint yet
- Current cancellation is local-only (MongoDB status update)

### P2 - Notifications
- Email/push notifications for partners (ride status changes, admin notes)

### P2 - Company Dashboard
- Company login via C# API
- Vehicle/driver management

### P3 - Enhancements
- PWA installability (manifest + service worker)
- Full deployment to zont.cab production domain
- Centralize XMLHttpRequest helper into a reusable utility (currently duplicated in MyAccount.js, CreateRide.js, api.js)

## Technical Notes
- C# API requires `Origin: https://zont.cab` and `Referer: https://zont.cab/` headers
- Phone numbers in E.164 format (+33...)
- After registration, email verification changes role from "NotVerified" to "Verified"
- **Toast Library**: ONLY use `toast()` from `sonner`. Do NOT use `useToast()`.
- **Dual Auth**: Partners hold both MongoDB JWT and C# JWT simultaneously
- **Stripe**: Uses LIVE keys (pk_live_lX3FXPqGIJLP5NgXomcdpcWO)
