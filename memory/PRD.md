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

## Backlog

### P1 - Partner Payment Debits
- Charge partner's saved Stripe card when a ride they proposed is completed by another driver

### P2 - Notifications
- Email/push notifications for partners (ride status changes, admin notes)

### P2 - Company Dashboard
- Company login via C# API
- Vehicle/driver management

### P2 - Client Ride History
- Page for logged-in clients to view past and upcoming bookings

### P3 - Enhancements
- PWA installability (manifest + service worker)
- Full deployment to zont.cab production domain

## Technical Notes
- C# API requires `Origin: https://zont.cab` and `Referer: https://zont.cab/` headers
- Phone numbers in E.164 format (+33...)
- After registration, email verification changes role from "NotVerified" to "Verified"
- **Toast Library**: ONLY use `toast()` from `sonner`. Do NOT use `useToast()`.
- **Dual Auth**: Partners hold both MongoDB JWT and C# JWT simultaneously
- **Stripe**: Uses LIVE keys (pk_live_lX3FXPqGIJLP5NgXomcdpcWO)
