# Zont.cab - React Clone PRD

## Original Problem Statement
Convert the Angular website zont.cab into a React application connected to the existing C# backend. Key requirements:
- Multilingual support (French, English, Russian, Armenian)
- SEO-optimized landing pages for airport transfers
- B2B section, CMS/Admin Panel for content management
- Dynamic content: admin modifications reflected on public site

## What's Been Implemented

### CMS / Admin Panel - COMPLETE
- JWT auth, Dashboard, CRUD for Pages/Places/Trust Blocks/FAQ/Homepage/SEO
- 15 pages, 27 places, 6 trust blocks, 6 FAQs seeded with real data
- Credentials: admin@zont.cab / admin123

### CMS-to-Public Connection - COMPLETE (Mar 2026)
- Public APIs at /api/public/ (no auth): homepage, trust-blocks, faqs, pages, places
- Home.js trust blocks section dynamically loaded from CMS
- Home.js CTA section dynamically loaded from CMS
- **Tested**: Modified trust block in admin -> verified change visible on public site

### BecomeDriver Page Restyle - COMPLETE (Mar 2026)
- Restyled with dark theme (#1a2332) matching other pages
- Link removed from Header, added to Footer

### Other Complete Features
- Multilingual (FR/EN/RU/HY), Technical SEO, B2B Section, Static Pages

## Backlog
- **P1**: Connect remaining pages to CMS (city pages, homepage hero, reviews)
- **P2**: Connect to real C# backend (blocked on API documentation)
- **P3**: Refactor CityTransferPage.js

## Admin Panel Access
- URL: /admin/login
- Credentials: admin@zont.cab / admin123
