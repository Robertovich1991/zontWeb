# Zont.cab - React Clone PRD

## Original Problem Statement
Convert zont.cab into React with CMS, multilingual support (FR/EN/RU/HY), and SEO optimization.

## What's Been Implemented

### CMS / Admin Panel - COMPLETE
- JWT auth, Dashboard, CRUD for Pages/Places/Trust Blocks/FAQ/Homepage/SEO
- 15 pages, 27 places, 6 trust blocks, 6 FAQs with real site data
- Credentials: admin@zont.cab / admin123
- URL: /admin/login

### CMS-to-Public Connection - COMPLETE (Mar 2026)
All pages dynamically connected to CMS. Admin modifications are reflected on the public site.

**Connected pages and sections:**
- **Homepage**: Hero title, subtitle, stats, Trust Blocks section, CTA
- **All 15 city/airport pages** (Nice, CDG, Orly, Beauvais, Paris Train Stations, Monaco, Cannes, Berlin, Munich, Rome, Milan, Alicante, Barcelona, Yerevan, Paris Airport Transfer): SEO title, meta description, H1, H2, intro text, main content
- **Trust Blocks**: Displayed on Homepage from CMS
- **Public APIs** at /api/public/ (no auth required): homepage, trust-blocks, faqs, pages, places, pages/by-slug/{slug}

**How it works:**
1. Each city page (`CityTransferPage.js`) fetches CMS data by its slug via `/api/public/pages/by-slug/`
2. CMS fields override: SEO title, meta description, H1, H2, intro paragraph, main content paragraph
3. If CMS has no data for a field, it falls back to the static content in the React component
4. Trust blocks on homepage are fetched from `/api/public/trust-blocks`
5. Homepage hero uses CMS homepage config for title, subtitle, stats

### BecomeDriver Page - COMPLETE (Mar 2026)
- Restyled with dark theme, link moved from Header to Footer

### Other Complete Features
- Multilingual (FR/EN/RU/HY), Technical SEO, B2B Section, Static Pages

## Backlog
- **P2**: Connect to real C# backend (blocked on API documentation)
- **P3**: Refactor CityTransferPage.js into smaller components

## Mocked Features
- Main booking flow (search, results, payment) is mocked
- B2B lead generation is REAL (connected to MongoDB)
