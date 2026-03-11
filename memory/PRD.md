# Zont.cab - React Clone PRD

## Original Problem Statement
Convert the Angular website zont.cab into a React application connected to the existing C# backend. Key requirements:
- Replicate the original design with mobile-first, conversion-optimized approach
- Multilingual support (French, English, Russian, Armenian)
- SEO-optimized landing pages for airport transfers
- B2B section for professional partners

## Core Architecture
- **Frontend**: React 19, Tailwind CSS, custom LanguageContext for i18n
- **Backend**: FastAPI (placeholder), MongoDB for leads
- **Languages**: FR, EN, RU, HY (Armenian)
- **SEO**: Custom useSEO.js hook, sitemap.xml, robots.txt, hreflang, JSON-LD

## What's Been Implemented

### Multilingual Support (FR/EN/RU/HY) - COMPLETE
- Custom LanguageContext with localStorage persistence
- Main translations in `/app/frontend/src/translations/index.js`
- Page-level inline content objects with all 4 languages
- Language selector in header (globe icon dropdown)
- Noto Sans Armenian font loaded via Google Fonts

### Armenian Language (HY) - COMPLETE (Feb 2026)
- Full Armenian translations across all pages
- Noto Sans Armenian font for character rendering
- SEO hreflang tags for Armenian
- Language selector with Armenian flag
- Tested: 13/13 frontend tests passed (95% success rate)

### Technical SEO - COMPLETE
- robots.txt and sitemap.xml with all pages
- hreflang tags for FR/EN/RU/HY on all pages
- Rich JSON-LD structured data
- Canonical URLs

### B2B Section - COMPLETE
- Main /partners page with 8 partner types
- 8 dedicated B2B pages (/travel-agencies, /hotels, etc.)
- Contact forms connected to backend /api/leads endpoint
- All B2B pages translated in 4 languages

### Backend - COMPLETE (Placeholder)
- FastAPI with `/api/leads` POST endpoint
- MongoDB for lead storage
- Lead model: { name, company, email, phone, message, page_source, created_at }

### Static Pages - COMPLETE
- Home, Help, BecomeDriver, BecomeClient, LookingForPartners
- Countries (120+ cities with transfer pages)
- 404 Not Found page
- All pages translated in 4 languages

## Backlog
- **P2**: Connect to real C# backend (blocked on API documentation)
- **P3**: Refactor CityTransferPage.js (large component)

## Mocked Features
- Main booking flow (search, results, payment) is mocked
- B2B lead generation is REAL (connected to MongoDB)
