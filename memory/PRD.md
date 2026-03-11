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
- **Paris Airport Transfer** SEO landing page with booking form
- **10 City SEO Landing Pages** (all tested and working):
  - Nice, Monaco, Cannes (France/Riviera)
  - Berlin, Munich (Germany)
  - Rome, Milan (Italy)
  - Alicante, Barcelona (Spain)
  - Yerevan (Armenia)
- **4 New Paris-specific SEO Pages**:
  - CDG Charles de Gaulle Airport Transfer
  - Orly Airport Transfer
  - Beauvais Airport Transfer
  - Paris Train Station Transfer (Gare du Nord, Lyon, Montparnasse, etc.)
- **Mobile-First Conversion Redesign** (all city pages):
  - Booking form above the fold on mobile (white card, clear CTA)
  - Professional photos (Mercedes sedan, interior, airport)
  - Trust elements: 50K+ trips, 24/7 available, 4.9/5 rating
  - Security badges: Visa, Mastercard, PayPal, Apple Pay
  - Verified Drivers, Flight Tracking, Free Cancellation badges
  - Customer reviews section (3 reviews with star ratings)
  - Sticky BOOK NOW button on mobile
  - Photo gallery section with 4 professional images
- **SEO Optimizations**:
  - Custom SEO component (React 19 compatible, no react-helmet)
  - Dynamic page titles and meta descriptions per page/language
  - JSON-LD structured data (Schema.org) on all pages
  - Open Graph tags (og:title, og:description, og:locale)
  - Lazy loading for all routes except Home (code splitting)
  - Non-render-blocking Google Fonts loading
  - Proper HTML lang attribute per language
- **Accessibility** improvements: aria-labels, roles, htmlFor/id on forms
- **Reusable CityTransferPage component** for consistent city pages
- **Vehicle RESERVER button** scrolls to booking form with selected vehicle banner
- **Countries page** listing all 16+ destinations grouped by country
- **All routes** registered in EN/FR/RU URL variants

### Architecture
- Frontend: React + Tailwind CSS + react-router-dom
- i18n: i18next + react-i18next
- Backend: FastAPI (unused, placeholder)
- No database connected yet

## Prioritized Backlog

### P0 (Critical)
- None currently blocking

### P1 (High)
- Fix react-helmet for dynamic SEO meta tags per page/language
- Translate remaining pages (BecomeDriver, BecomeClient, Help, LookingForPartners) to FR/EN/RU

### P2 (Medium)
- Connect to C# backend (bookings, auth, dynamic data)
- Add Cote d'Azur / French Riviera landing page

### P3 (Low)
- Break down Home.js into smaller sub-components
- Add sitemap.xml generation for SEO
- Add structured data (JSON-LD) for rich search results
