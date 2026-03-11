# PRD - Zont.cab React Clone

## Original Problem Statement
Convert the existing Angular website zont.cab into a React frontend. The new site must connect to the existing C# backend. Goals: replicate original design, multilingual (FR/EN/RU), and SEO-optimized landing pages for airport transfers in European cities.

## Core Requirements
- React frontend matching zont.cab design
- Multilingual support: French, English, Russian
- SEO landing pages for airport transfers in key cities
- Connection to existing C# backend (future)
- Professional B2B section for partnerships and transport solutions

## What's Been Implemented

### Completed
- **Home Page** redesigned mobile-first with booking form, photos, trust elements, reviews
- **15+ City SEO Landing Pages** (CDG, Orly, Beauvais, Nice, Monaco, Cannes, Berlin, Munich, Rome, Milan, Alicante, Barcelona, Yerevan, Paris Train Station)
- **Multilingual framework** (i18next) with FR/EN/RU content
- **Full Technical SEO Audit** (March 2026): unique titles, meta descriptions, canonicals, hreflang, sitemap.xml, robots.txt, JSON-LD, OG tags, 404 page
- **B2B Professional Section** (March 2026):
  - Main page: /partners - Premium Transport Solutions overview with links to all 8 targets
  - /travel-agencies - Airport transfer partner for travel agencies
  - /tourism-agencies - Private transport for tourism professionals
  - /hotels - Chauffeur and transfer for hotels
  - /concierge-services - VIP transport for concierge professionals
  - /event-agencies - Transport for events and corporate gatherings
  - /corporate-clients - Executive transfers and corporate chauffeur
  - /business-partners - Strategic B2B partnerships, white-label, API, referral
  - /tour-operators - Private transfers for organized tours
  - ALL pages have: unique SEO title/H1/description, 3 languages (FR/EN/RU), canonical, hreflang, JSON-LD, OG tags, B2B contact form, internal linking, responsive design
  - Contact form on each page (MOCKED - not connected to backend)
  - B2B navigation added to header
  - All pages added to sitemap.xml

### Architecture
- Frontend: React 19 + Tailwind CSS + react-router-dom
- i18n: i18next + react-i18next
- SEO: Custom SEO.js component (vanilla DOM manipulation)
- Backend: FastAPI (placeholder, not connected)

## Prioritized Backlog

### P1 (High)
- Translate remaining pages (BecomeDriver, BecomeClient, Help, LookingForPartners) to FR/EN/RU
- Connect B2B contact forms to backend for lead generation

### P2 (Medium)
- Connect to C# backend (bookings, auth, dynamic data)

### P3 (Low)
- Break down CityTransferPage.js into sub-components
- Add more European city landing pages
