# Zont.cab - React Clone PRD

## Original Problem Statement
Convert zont.cab into React with CMS, multilingual support (FR/EN/RU/HY), SEO, and company registration.

## What's Been Implemented

### CMS / Admin Panel - COMPLETE
- JWT auth, Dashboard, CRUD for Pages/Places/Trust Blocks/FAQ/Homepage/SEO
- 15 pages, 27 places, 6 trust blocks, 6 FAQs with real site data
- Credentials: admin@zont.cab / admin123 | URL: /admin/login

### CMS-to-Public Connection - COMPLETE
- All 15 city/airport pages + Homepage dynamically connected to CMS
- Public APIs at /api/public/ (no auth): homepage, trust-blocks, faqs, pages, places

### Company Registration - COMPLETE (Mar 2026)
- **Page /become-driver**: Full company registration form matching original zont.cab design
- **Fields**: First Name*, Last Name*, Company Name*, Company Address, Email*, Phone (with country code selector), Password*, Confirm Password*, Terms checkbox
- **Backend**: POST /api/company/register + POST /api/company/login
- **MongoDB collection**: `companies` with status "pending"
- **Multilingual**: FR, EN, RU, HY
- **Validations**: Duplicate email, password match, terms acceptance
- **Success flow**: Shows confirmation message after registration
- **Note**: Vehicle and driver management will be handled by the existing C# backend

### BecomeDriver Page Restyle - COMPLETE
- Dark theme (#1a2332), link moved from Header to Footer

### Other Complete Features
- Multilingual (FR/EN/RU/HY), Technical SEO, B2B Section, Static Pages

## Backlog
- **P1**: Connect company login to C# backend for vehicle/driver management
- **P2**: Connect booking flow to C# backend (blocked on API docs)
- **P3**: Refactor CityTransferPage.js

## DB Schema: companies collection
```
{
  id: uuid, first_name: str, last_name: str,
  company_name: str, company_address: str,
  email: str (unique), phone: str, phone_country: str,
  hashed_password: str, status: "pending"|"active"|"rejected",
  created_at: datetime
}
```
