# PRD - Zont.cab React Clone

## Original Problem Statement
Convert the existing Angular website zont.cab into a React frontend. Goals: replicate original design, multilingual (FR/EN/RU), SEO-optimized, B2B professional section, connected to backend.

## What's Been Implemented

### Completed
- **15+ City SEO Landing Pages** (CDG, Orly, Beauvais, Nice, Monaco, Cannes, Berlin, Munich, Rome, Milan, Alicante, Barcelona, Yerevan, Paris Train)
- **Full Technical SEO Audit**: unique titles, meta descriptions, canonicals, hreflang, sitemap.xml, robots.txt, JSON-LD, OG tags, 404 page
- **9 B2B Professional Pages** (/partners, /travel-agencies, /tourism-agencies, /hotels, /concierge-services, /event-agencies, /corporate-clients, /business-partners, /tour-operators) — all with unique content in 3 languages
- **B2B Lead Generation** (March 2026): POST /api/leads endpoint stores leads in MongoDB. All 9 B2B forms connected to real backend. Success confirmation shown after submission.
- **Multilingual Translation** (March 2026): BecomeDriver, BecomeClient (How It Works), Help (with FAQ accordion), LookingForPartners — all translated FR/EN/RU
- **Help Page**: FAQ accordion with FAQPage JSON-LD schema, multilingual FAQs
- Mobile-first conversion-optimized design across all pages

### Architecture
- Frontend: React 19 + Tailwind CSS + react-router-dom
- i18n: LanguageContext with inline content objects per language (FR/EN/RU)
- SEO: Custom SEO.js component (vanilla DOM manipulation)
- Backend: FastAPI + MongoDB (leads collection)
- API: POST /api/leads, GET /api/leads

## Prioritized Backlog

### P1 (High)
- Connect Help/BecomeDriver forms to backend too

### P2 (Medium)
- Connect to C# backend (bookings, auth, dynamic data)
- Add email notifications for new B2B leads

### P3 (Low)
- Break down CityTransferPage.js into sub-components
- Add more European city landing pages
