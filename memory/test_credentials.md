# Test Credentials (preview)

- Super Admin (portail admin): admin@zont.cab / admin123
- C# Fleet/Company Account: Nandetiri1@gmail.com / 12345678 (verified working Jun 2026 — used for admin reservations, kiosk dispatch, TripsPrice)
- Test Client (site public): garikgalstyan@gmail.com / 12345678

## Notes
- Backend .env: CSHARP_COMPANY_USERNAME / CSHARP_COMPANY_PASSWORD set to the C# company account above.
- Kiosk Bristol: https://<preview>/kiosk/bristol — no auth required.
- C# Admin panel (admin.zont.cab): admin@zont.cab / 2ooVphFh82ZDQ7m — login via C# POST /api/Login (role=Admin). Used to manage/delete auctions (POST /api/Auction/deleteAuction/{id}).
- GPS Admin (React /gps-admin): gps@zont.cab / gpsadmin123 (seed: POST /api/gps-admin/auth/seed).
- Hotel Bristol extranet (/hotel/login): admin@bristol.fr / hotel123.
- C# login endpoints: /api/Login/company (company), /api/Login/client (client), /api/Login (admin).

## Hotel Partner Link (2026-11)
- Partner commission sync cron auth: WEBHOOK_CRON_SECRET is set in backend/.env (Bearer token for POST /api/cron/referral-sync).
- Test hotel with active partner link: slug `hotel-negresco-nice` (hotel id 523e9be3, commission_rate 12%). Public link: /p/hotel-negresco-nice.
- Hotel extranet with the "Lien partenaire" tab: admin@bristol.fr / hotel123 (Hotel Le Bristol Paris).
