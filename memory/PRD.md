# Zont.cab - React Migration PRD

## Original Problem Statement
Migration of the Angular website zont.cab to a React frontend with a C# backend, including multilingual support (FR, EN, RU, HY). The project includes a full mobile-first redesign, SEO implementation, B2B lead generation, and a comprehensive CMS.

## Architecture
- **Frontend**: React + Tailwind CSS + i18next (multilingual)
- **Backend**: FastAPI (Python) as CMS + proxy to C# backend at api.zont.cab
- **Database**: MongoDB (CMS data), C# backend (operational data)
- **External APIs**: Google Maps Places API, api.zont.cab (C# backend)

## What's Been Implemented

### Phase 1 - CMS & Content (Complete)
- Admin Panel (login, dashboard, CRUD for pages/places/trust-blocks/FAQs/homepage)
- CMS data seeding with real website content
- Public-facing pages dynamically connected to CMS
- Company registration form + backend

### Phase 2 - UI/UX Redesign (Complete)
- Professional redesign of Car Selection page (Blacklane-inspired)
- Become Driver page overhaul with company registration form
- Full Armenian (hy) translations fix

### Phase 3 - C# API Integration (Complete - March 12, 2026)
- **Backend proxy** routes (`/api/proxy/*`) forwarding to `api.zont.cab`
  - `POST /api/proxy/distance` - Trip pricing calculation
  - `POST /api/proxy/preorder-distance` - Fixed preorder pricing
  - `GET /api/proxy/trip-types` - Vehicle types
  - `GET /api/proxy/vehicle-image/{path}` - Vehicle images
  - `POST /api/proxy/auth/register` - Client registration
  - `POST /api/proxy/auth/login` - Client login
- **Google Maps Places Autocomplete** for address input with geocoding fallback
- **Dynamic Car Selection page** - real vehicle categories, prices, images from C# API
- **Client Authentication** - Registration & login connected to C# API
  - Registration sends to `POST /api/Client` with Origin header for zont.cab
  - Login sends to `POST /api/Login/client`
  - Auto-login after successful registration
  - JWT tokens stored in localStorage

## Key Endpoints
- C# Backend: `https://api.zont.cab`
- Proxy: `/api/proxy/distance`, `/api/proxy/preorder-distance`, `/api/proxy/trip-types`
- Auth Proxy: `/api/proxy/auth/register`, `/api/proxy/auth/login`
- CMS: `/api/admin/*`, `/api/public/*`

## Credentials
- Admin CMS: admin@zont.cab / admin123
- Google Maps API Key: In frontend/.env
- Test Account: proxytest_2026@gmail.com / TestPass1

## Backlog (Priority Order)
### P0 - User Verification
- User to verify registration + login flow

### P1 - Booking Completion Flow
- Booking confirmation page (passenger details, flight number, notes)
- Submit booking to C# API (POST /api/Auction/addAuction)
- Checkout page with payment integration

### P2 - Company Dashboard
- Company login via C# API (POST /api/Login/company)
- Company dashboard (vehicle management, driver management)

### P3 - Enhancements
- Payment integration (Stripe - already used by old site)
- Booking history (GET /api/Auction/client/auctions)
- Multi-stop support
- Flight tracking integration

## Technical Notes
- C# API `POST /api/Client` requires `Origin: https://zont.cab` header for registration
- Phone numbers must be in E.164 format (+33...)
- Gender defaults to "male", dateOfBirth to "01/01/2000"
- Login works with both email and phone number as username
