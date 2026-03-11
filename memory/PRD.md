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
- Main translations in `/app/frontend/src/translations/index.js`
- Page-level inline content objects with all 4 languages
- Language selector in header (globe icon dropdown)
- Noto Sans Armenian font loaded via Google Fonts

### Armenian Language (HY) - COMPLETE (Feb 2026)
- Full Armenian translations across all pages
- Tested: 13/13 frontend tests passed

### Technical SEO - COMPLETE
- robots.txt and sitemap.xml with all pages
- hreflang tags for FR/EN/RU/HY on all pages
- Rich JSON-LD structured data, Canonical URLs

### B2B Section - COMPLETE
- Main /partners page with 8 partner types
- 8 dedicated B2B pages
- Contact forms connected to backend /api/leads endpoint

### CMS / Admin Panel - COMPLETE (Feb 2026)
- **Authentication**: JWT-based login/register with route protection
- **Dashboard**: Stats overview (pages, places, trust blocks, FAQs, leads)
- **Pages Manager**: Full CRUD with multi-language SEO fields, content tabs (general/seo/content/faq), image upload, status toggle, filtering & search
- **Places Manager**: Full CRUD with multi-language names, place types (city/airport/station/country/region), keywords, pricing, image upload
- **Homepage Editor**: Hero section, stats, advantages, CTA, section ordering
- **Trust Blocks**: CRUD with icon selection, active toggle, ordering
- **FAQ Manager**: CRUD with multi-language Q&A, page association, active toggle
- **SEO Overview**: Table view of all pages with SEO score indicator
- **Image Upload**: File upload to /api/uploads/ with preview
- **Testing**: 26/26 backend pytest tests + 10/10 frontend tests passed
- **Credentials**: admin@zont.cab / admin123

### Static Pages - COMPLETE
- Home, Help, BecomeDriver, BecomeClient, LookingForPartners
- Countries (120+ cities with transfer pages)
- 404 Not Found page
- All pages translated in 4 languages

### Backend - COMPLETE
- FastAPI with leads API, admin auth, CMS CRUD endpoints
- MongoDB collections: leads, admin_users, cms_pages, cms_places, cms_homepage, cms_trust_blocks, cms_faqs

## Backlog
- **P1**: Connect public-facing pages to CMS (dynamic content from CMS APIs instead of static i18next files)
- **P2**: Connect to real C# backend (blocked on API documentation)
- **P3**: Refactor CityTransferPage.js (large component)

## Mocked Features
- Main booking flow (search, results, payment) is mocked
- B2B lead generation is REAL (connected to MongoDB)

## Admin Panel Access
- URL: /admin/login
- Credentials: admin@zont.cab / admin123
