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

## Key Proxy Endpoints
- `POST /api/proxy/distance` - Trip pricing
- `POST /api/proxy/preorder-distance` - Preorder pricing
- `GET /api/proxy/trip-types` - Vehicle types
- `GET /api/proxy/vehicle-image/{path}` - Vehicle images
- `POST /api/proxy/auth/register` - Client registration
- `POST /api/proxy/auth/login` - Client login
- `GET /api/proxy/auth/send-verification?email=` - Send verification email
- `GET /api/proxy/auth/verify/{code}` - Verify email code

## Credentials
- Admin CMS: admin@zont.cab / admin123
- Google Maps API Key: In frontend/.env

## Backlog
### P1 - Booking Completion Flow
- Booking confirmation page (passenger details, flight number)
- Submit booking to C# API (POST /api/Auction/addAuction)

### P2 - Company Dashboard
- Company login via C# API
- Vehicle/driver management

### P3 - Enhancements
- Payment integration (Stripe)
- Booking history
- Multi-stop support

## Technical Notes
- C# API requires `Origin: https://zont.cab` header for client registration
- Phone numbers in E.164 format (+33...)
- Gender defaults to "male", dateOfBirth to "01/01/2000"
- After registration, email verification changes role from "NotVerified" to "Verified"
- **Toast Library**: ONLY use `toast()` from `sonner`. Do NOT use `useToast()` from hooks/use-toast.
