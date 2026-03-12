# Zont.cab - React Migration PRD

## Original Problem Statement
Migration of the Angular website zont.cab to a React frontend with a C# backend, including multilingual support (FR, EN, RU, HY). The project includes a full mobile-first redesign, SEO implementation, B2B lead generation, and a comprehensive CMS.

## Architecture
- **Frontend**: React + Tailwind CSS + i18next (multilingual)
- **Backend**: FastAPI (Python) as CMS + proxy to C# backend at api.zont.cab
- **Database**: MongoDB (CMS data), C# backend (operational data)
- **External APIs**: Google Maps Places API, api.zont.cab (C# backend)
- **Toast Library**: `sonner` (standardized across entire project - March 12, 2026)

## What's Been Implemented

### Phase 1 - CMS & Content (Complete)
- Admin Panel (login, dashboard, CRUD for pages/places/trust-blocks/FAQs/homepage)
- CMS data seeding with real website content
- Public-facing pages dynamically connected to CMS

### Phase 2 - UI/UX Redesign (Complete)
- Professional redesign of Car Selection page (Blacklane-inspired)
- Become Driver page overhaul with company registration form
- Full Armenian (hy) translations fix

### Phase 3 - C# API Integration (Complete - March 12, 2026)
- **Backend proxy** routes (`/api/proxy/*`) forwarding to `api.zont.cab`
- **Google Maps Places Autocomplete** for address input with geocoding fallback
- **Dynamic Car Selection page** - real vehicle categories, prices, images from C# API
- **Client Authentication** (registration + login + email verification)
  - Registration: `POST /api/Client` (requires Origin: https://zont.cab header)
  - Send verification email: `GET /api/Verification/clientVerifyEmail`
  - Verify code: `GET /api/Verification/verify/{code}`
  - Login: `POST /api/Login/client`
  - Auto-login after registration with "NotVerified" status
  - Email verification step transitions account to "Verified" status

### Phase 3.1 - Error Handling & Toast Standardization (Complete - March 12, 2026)
- Fixed registration form error display (was using broken useToast, now uses sonner)
- Inline error messages with AlertCircle icons below each form field
- Toast notifications via sonner for all success/error feedback
- Removed `required` HTML attribute from sign-in inputs for custom validation
- Cleaned up ALL remaining useToast references across: CityTransferPage, SearchForm, Checkout, Help

### Phase 3.2 - Forgot Password (Complete - March 12, 2026)
- **"Mot de passe oublie ?"** link on Sign-in form
- Forgot password modal step: email input → sends reset email via C# API
- Confirmation screen after email sent with resend option
- **Reset Password page** (`/reset-password?token=xxx` & `/forgetpassword/:token`) for entering new password
- Backend proxy endpoints: `POST /api/proxy/auth/forgot-password`, `POST /api/proxy/auth/reset-password`
- Connected to C# API: `GET /api/Account/{email}?host=zont.cab` and `POST /api/Account`

### Phase 4 - Driver/Partner PWA App (Complete - March 12, 2026)
- **Partner Auth** (MongoDB): Login system separate from C# client auth
- **Admin > Partenaires**: CRUD for managing partners (name, email, phone, company, status)
- **Admin > Courses Partenaires**: View all partner rides, filter by status, change status, add admin notes
- **Driver PWA** (`/driver`): Mobile-first app for partners
  - Login page at `/driver/login`
  - Dashboard with stats (total, pending, accepted, available), ride list
  - **Tabs: "Mes Courses" / "Disponibles"** (courses d'autres chauffeurs)
  - Create ride form at `/driver/new-ride` with **Google Maps Autocomplete** + route calculation
  - **Ride Detail** (`/driver/ride/:id`): Status, itinéraire (distance/durée via Google Directions API), véhicule, prix, détails passager, notes admin
  - **Profil** (`/driver/profile`): Info partenaire + **carte bancaire Stripe** pour débit automatique
  - Vehicle categories fetched dynamically from C# backend and normalized

### Phase 4.1 - Stripe Card Management (Complete - March 12, 2026)
- Stripe checkout session for card registration (€1 auth charge)
- Card status tracking in partner profile
- Admin can charge rides after completion via Stripe
- Backend endpoints: `/api/partner/payment/add-card`, `/my-card`, `/card-status/{session_id}`, `/charge-ride/{ride_id}`

## Key Proxy Endpoints
- `POST /api/proxy/distance` - Trip pricing
- `POST /api/proxy/preorder-distance` - Preorder pricing
- `GET /api/proxy/trip-types` - Vehicle types
- `GET /api/proxy/vehicle-image/{path}` - Vehicle images
- `POST /api/proxy/auth/register` - Client registration
- `POST /api/proxy/auth/login` - Client login
- `POST /api/proxy/auth/forgot-password` - Send password reset email
- `POST /api/proxy/auth/reset-password` - Reset password with token
- `GET /api/proxy/auth/send-verification?email=` - Send verification email
- `GET /api/proxy/auth/verify/{code}` - Verify email code
- `POST /api/proxy/booking/create` - Create booking/auction in C# backend (requires auth + Stripe cardId)
- `GET /api/proxy/booking/upcoming` - Get client's upcoming auctions

## Credentials
- Admin CMS: admin@zont.cab / admin123
- Google Maps API Key: In frontend/.env

### Phase 4.2 - Driver Review/Rating System (Complete - March 12, 2026)
- **Peer review system**: Partner who created a ride can rate the completed ride (1-5 stars)
- **Comment validation**: Comment mandatory for ratings 1-4, optional for 5 stars
- **Duplicate prevention**: Only one review per ride allowed
- **Profile integration**: Review stats (average, total, rating breakdown chart) + individual review cards on `/driver/profile`
- **Dashboard integration**: Star ratings shown on completed ride cards, "Avis requis" badge for unreviewed completed rides
- **Backend endpoints**: `POST/GET /api/partner/rides/{id}/review`, `GET /api/partner/reviews/my`, `GET /api/partner/reviews/stats/{partner_id}`, `GET /api/partner/admin/reviews`
- **Testing**: 100% pass rate - 14 backend tests, 12 frontend UI flows verified

### Phase 5 - Client Stripe Payment & Booking Submission (Complete - March 12, 2026)
- **Stripe Elements** integration on the Checkout page using the C# backend's live Stripe key (`pk_live_...`)
- **Payment flow**: Client enters card via Stripe Elements -> creates PaymentMethod -> submits to C# API with card ID
- **Backend proxy**: `POST /api/proxy/booking/create` proxies to C# `POST /api/Auction/addAuction`
- **Backend proxy**: `GET /api/proxy/booking/upcoming` proxies to C# `GET /api/Auction/client/upcomingAuctions`
- **C# API format discovered**: Date must be `dd/MM/yyyy HH:mm:ss`, required fields: `startPointLatitude`, `startPointLongitude`, `clientPrice`
- **BookingConfirmation page**: Updated with dark theme, French translations, and new data format
- **Testing**: 100% pass rate - 7 backend tests, code verification passed on all frontend files

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
- C# API requires `Origin: https://zont.cab` header for client registration
- Phone numbers in E.164 format (+33...)
- Gender defaults to "male", dateOfBirth to "01/01/2000"
- After registration, email verification changes role from "NotVerified" to "Verified"
- **Toast Library**: ONLY use `toast()` from `sonner`. Do NOT use `useToast()` from hooks/use-toast.
