# Zont.cab - React Clone PRD

## Original Problem Statement
Convert the Angular website zont.cab into a React application connected to the existing C# backend. Key requirements:
- Replicate the original design with mobile-first, conversion-optimized approach
- Multilingual support (French, English, Russian, Armenian)
- SEO-optimized landing pages for airport transfers
- B2B section for professional partners
- CMS/Admin Panel for content management

## Core Architecture
- **Frontend**: React 19, Tailwind CSS, custom LanguageContext for i18n
- **Backend**: FastAPI (placeholder), MongoDB for leads & CMS content
- **Languages**: FR, EN, RU, HY (Armenian)
- **SEO**: Custom useSEO.js hook, sitemap.xml, robots.txt, hreflang, JSON-LD

## What's Been Implemented

### Multilingual Support (FR/EN/RU/HY) - COMPLETE
- Custom LanguageContext with localStorage persistence
- Noto Sans Armenian font loaded via Google Fonts

### Technical SEO - COMPLETE
- robots.txt and sitemap.xml, hreflang tags, JSON-LD structured data

### B2B Section - COMPLETE
- 8 dedicated B2B pages with contact forms connected to /api/leads

### CMS / Admin Panel - COMPLETE (Feb-Mar 2026)
- **Authentication**: JWT-based login with route protection
- **Dashboard**: Stats overview (pages, places, trust blocks, FAQs, leads)
- **Pages Manager**: Full CRUD with multi-language SEO fields, tabs, image upload, filters
- **Places Manager**: Full CRUD with types, keywords, pricing, image upload
- **Homepage Editor**: Hero section, stats, advantages, CTA
- **Trust Blocks**: CRUD with icon selection, active toggle, ordering
- **FAQ Manager**: CRUD with multi-language Q&A
- **SEO Overview**: Table view with SEO score indicator
- **Image Upload**: File upload to /api/uploads/
- **Testing**: 26/26 backend + 10/10 frontend tests passed
- **Credentials**: admin@zont.cab / admin123

### CMS Data Seed - COMPLETE (Mar 2026)
- Pre-populated with all real site data:
  - 15 SEO pages (Paris CDG/Orly/Beauvais, Nice, Monaco, Cannes, Berlin, Munich, Rome, Milan, Barcelona, Alicante, Yerevan, Paris Train Stations)
  - 27 places (11 airports, 11 cities, 5 train stations) with real prices and airport codes
  - 6 trust blocks (Meet & Greet, Flight Tracking, Premium Vehicles, Fixed Prices, Secure Payment, 24/7 Support)
  - 6 global FAQs with real content in FR/EN/RU
  - Homepage config with stats, advantages, CTA
- Seed script: /app/backend/seed_cms.py

### Static Pages - COMPLETE
- Home, Help, BecomeDriver, BecomeClient, LookingForPartners
- Countries (120+ cities with transfer pages)
- 404 Not Found page

## Backlog
- **P1**: Connect public-facing pages to CMS (dynamic content from CMS APIs)
- **P2**: Connect to real C# backend (blocked on API documentation)
- **P3**: Refactor CityTransferPage.js

## Mocked Features
- Main booking flow (search, results, payment) is mocked
- B2B lead generation is REAL (connected to MongoDB)

## Admin Panel Access
- URL: /admin/login
- Credentials: admin@zont.cab / admin123
