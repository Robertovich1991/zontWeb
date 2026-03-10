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
- **Home page** with full layout matching zont.cab
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
- **Reusable CityTransferPage component** for consistent city pages
- **Vehicle RESERVER button** scrolls to booking form (not navigates away)
- **Selected vehicle banner** shows above booking form after selection
- **Countries page** listing all 16+ destinations grouped by country with links
- **All routes** registered in EN/FR/RU URL variants
- **City data model** in `/frontend/src/data/cities.js`
- **Booking flow**: form → car selection → checkout → confirmation

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
