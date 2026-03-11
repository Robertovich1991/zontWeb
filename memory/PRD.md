# PRD - Zont.cab React Clone

## Original Problem Statement
Convert the existing Angular website zont.cab into a React frontend. The new site must connect to the existing C# backend. Goals: replicate original design, multilingual (FR/EN/RU), and SEO-optimized landing pages for airport transfers in European cities.

## Core Requirements
- React frontend matching zont.cab design
- Multilingual support: French, English, Russian
- SEO landing pages for airport transfers in key cities
- Connection to existing C# backend (future)

## What's Been Implemented

### Completed (Feb 2026)
- **Home Page** redesigned mobile-first with booking form above the fold, photos, trust elements, popular destinations, reviews
- **Paris Airport Transfer** converted to CityTransferPage component (same mobile-optimized design as all cities)
- **Header/Footer** with navigation, language switcher (FR/EN/RU)
- **Multilingual framework** using i18next (Home + Footer translated)
- **15+ City SEO Landing Pages** (all tested and working):
  - Paris CDG, Orly, Beauvais, Paris Train Station
  - Nice, Monaco, Cannes (France/Riviera)
  - Berlin, Munich (Germany)
  - Rome, Milan (Italy)
  - Alicante, Barcelona (Spain)
  - Yerevan (Armenia)
- **Mobile-First Conversion Redesign** (all city pages)
- **Full Technical SEO Audit (March 2026):**
  - Enhanced SEO component with: title, description, canonical, hreflang, og:url, og:image, og:type, og:site_name, robots meta, JSON-LD
  - Unique `<title>` and `<meta description>` on every page (verified)
  - Single `<h1>` per page (verified on all pages)
  - Canonical URLs set on all public pages
  - hreflang tags (en, fr, ru, x-default) on all multilingual city pages
  - `robots.txt` created - blocks utility pages, references sitemap
  - `sitemap.xml` created with all pages + hreflang annotations
  - JSON-LD structured data: Organization+WebSite (Home), Service with AggregateOffer+Rating (city pages), FAQPage (Help)
  - OG tags complete: title, description, type, url, image, locale, site_name
  - noindex on utility pages (car-selection, checkout, booking-confirmation)
  - Removed duplicate content routes (/how-it-works, /hotels-b2b-tours-operators)
  - 404 catch-all route with noindex
  - SEO testing agent: 44/44 checks passed (98% success rate)

### Architecture
- Frontend: React 19 + Tailwind CSS + react-router-dom
- i18n: i18next + react-i18next
- SEO: Custom SEO.js component (vanilla DOM manipulation, React 19 compatible)
- Backend: FastAPI (unused, placeholder)
- No database connected yet

## Prioritized Backlog

### P0 (Critical)
- None currently blocking

### P1 (High)
- Translate remaining pages (BecomeDriver, BecomeClient, Help, LookingForPartners) to FR/EN/RU

### P2 (Medium)
- Connect to C# backend (bookings, auth, dynamic data)

### P3 (Low)
- Break down CityTransferPage.js into smaller sub-components
- Add Cote d'Azur / French Riviera landing page
