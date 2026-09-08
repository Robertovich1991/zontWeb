# PRD - Zont.cab Multi-Portal Platform

## Original Problem Statement
Multi-portal platform (Client, Admin, Hotel, Fleet, Driver) integrating external C# backend (api.zont.cab) and internal MongoDB.

## Core Portals
- **Client Portal** — Booking, checkout, payment (Stripe)
- **Admin Portal** — Super admin for managing pages, hotels, rides, reviews
- **Hotel Portal** — Hotel-specific dashboard, bookings, revenue
- **Fleet Portal** — Company management: drivers, vehicles, bookings, planning, GPS
- **Driver Portal** — Chauffeur app: Zont offers + company missions

## Architecture
- React Frontend + FastAPI Backend + MongoDB
- C# Backend proxy (api.zont.cab) for core business logic
- Custom GPS system (Teltonika TCP decoder on VPS -> webhook)

## Key Technical Decisions
- DO NOT use BaseHTTPMiddleware (corrupts JSON streaming)
### Session Jun 01, 2026 — Kiosk Hourly Disposal Vehicles Fix (P0)
- **Bug**: Kiosk "Location voiture à l'heure" (Disposal excursions screen) showed empty vehicle list at Step 2 because clicking a disposal destination (Paris 4h / Versailles 5h / Fontainebleau 8h / Mont-Saint-Michel 12h) only set `selectedDest` locally without calling pricing API → `selectedDest.vehicles` was always undefined.
- **Fix**: `KioskPage.js` disposal buttons now call existing `POST /api/kiosk/{slug}/custom-price` with proper lat/lng for each disposal destination → populates `vehicles[]` with 4 categories (Shuttle 8p, Luxury Sedan, Luxury Van, Standard Car) returned from C# `/api/PreorderDistance/driverTypesTwo`.
- Added full-screen loading overlay during pricing fetch + auto-error handling.
- **Tested**: Versailles 5h flow → 4 vehicles rendered with images & prices (81€, 108€, 123€, 69€).
- **Note for user**: Prices shown are *transfer/round-trip distance* baseline from C# (no dedicated hourly endpoint exists in C# Swagger). If you provide a fixed hourly rate table per vehicle, we can replace these later.


- Schema.org reviews use `Product` type (not `LocalBusiness`) for Google compliance
- PlacesAutocomplete shows place name + address for clarity
- AuthModal checks `isOpen` prop before rendering

## What's Been Implemented

### Session Feb 20, 2026 (Latest) — Driver at Disposal SEO page
- **New service page**: "Driver at Disposal / Chauffeur mis à disposition / Водитель в распоряжение / Վարորդ տրամադրությամբ"
- Main listing page at 4 multilingual URLs:
  - `/driver-at-disposal` (EN), `/chauffeur-mis-a-disposition` (FR), `/voditel-s-avtomobilem` (RU), `/varorde-tramadrutyamb` (HY)
- 4 dedicated SEO vehicle sub-pages, each with H1, hero image, 4h/8h/12h pricing strip, 3 long-form SEO paragraphs, vehicle-specific FAQ, related vehicles:
  - Mercedes S-Class (Flagship VIP/diplomatic)
  - Mercedes E-Class (Business reference sedan)
  - Mercedes V-Class (7-seat luxury van)
  - Renault Trafic (8-seat eco minibus)
- **SEO**: per-page title, meta description, canonical, hreflang (4 langs), Schema.org Service+Product+AggregateRating JSON-LD
- **Pricing**: placeholder "On request / Sur demande / По запросу / Ըստ պահանջի" for 4h/8h/12h — user will provide later
- **Images**: 4 optimized WebP (134-173 KB each, originally 2+ MB PNG) with SEO-friendly filenames in `/app/frontend/public/images/`:
  - `mercedes-classe-s-chauffeur-prive-paris.webp`
  - `mercedes-classe-e-chauffeur-prive-paris.webp`
  - `mercedes-classe-v-chauffeur-prive-paris.webp`
  - `renault-trafic-minibus-chauffeur-paris.webp`
- **Navigation**: Added gold-highlighted "Chauffeur mis à disposition" link at top of Services dropdown (Header desktop + mobile) and Footer
- **Test status**: 18/18 acceptance items pass (iteration 67), 0 issues found

### Session Apr 22, 2026
- **Checkout 2-Step Flow**: Split card addition and payment into visible steps
  - Step 1: "Add your card" → 3D Secure (0€) → Green banner "Card verified ✓"
  - Step 2: Button changes to "Pay X€" → booking created + payment charged
  - Saved cards skip step 1 and pay immediately (no change)
  - Labels added in EN/FR/RU
- **Yandex Metrica Webvisor Fix**: Moved Yandex Metrika from deferred loading (4s timeout) to immediate loading in `<head>` so Webvisor captures styles correctly
- **MyBookings Cancel Button**: Added "Annuler" button on each booking card
- **Auth Redirect Fix**: MyBookings + MyAccount now wait for `authLoading` before redirecting to homepage
- **XHR Conversion (Complete)**: All authService functions in api.js converted to XMLHttpRequest to avoid Stripe.js fetch() interception

### Session Apr 19, 2026
- **Checkout "body stream already read" Bug Fix (P0)**: Fixed JS error blocking card addition for existing users
  - Root cause: Stripe.js intercepts native `fetch()` and consumes the Response body stream before application code reads it
  - Fix: Converted all `fetch()` calls in `Checkout.js` to `XMLHttpRequest` (not intercepted by Stripe.js), matching the established pattern in `api.js` `submitBooking`
  - Affected: setup-intent (card creation), saved cards fetch, card deletion

### Session Apr 11, 2026
- **Facebook Conversions API (Server-Side)**: Complete backend integration using Meta Graph API v21.0
  - `fb_conversions.py` module with SHA256 PII hashing, async fire-and-forget sends
  - `POST /api/fb/track` endpoint for frontend→server event mirroring
  - Auto Purchase tracking on successful booking (in `proxy_create_booking`)
  - Auto Lead tracking on B2B lead creation
  - Frontend `fbPixel.js` updated with event_id deduplication + fbp/fbc cookie extraction
  - 6 events tracked: PageView, Search, ViewContent, InitiateCheckout, Purchase, Lead
  - All events verified as received by Facebook (`events_received: 1`)

### Session Apr 10, 2026
- **Google Structured Data Fix**: Split LocalBusiness/Product, string→number, real phone
- **Client Review Collection**: Public form `/review` + `/avis`, 4 languages, auto-translate, pending status
- **PlacesAutocomplete UX Fix**: Shows "CDG Airport, 95700 Roissy" instead of just postal code
- **Prefilled Field Fix**: Default pickup/dropoff no longer locks user - can clear and retype
- **AuthModal Fix**: Added `if (!isOpen) return null;` guard
- **Error Message Enhancement**: Login error banner more prominent
- **French Accents Overhaul**: 200+ accent corrections across 12 files
- **PhoneInput Validation**: 149 countries + IP auto-detect confirmed working
- **Facebook Pixel (Frontend)**: Meta Pixel installed with React event tracking
- **Saved Credit Cards**: Selection + pay on Checkout page

### Previous Sessions
- Fleet Admin pricing fix, Driver Portal, Leads Manager, Reservations Manager
- Android download button, GPS Super Admin Portal
- Complete Wialon removal + Custom GPS webhook system
- Reviews system with LLM auto-translation, Google Ads/GA4 tracking
- 2026-02-09: Fixed Google Search Console "missing highPrice/lowPrice" warnings in Product structured data on city transfer pages (CityTransferPage.js) — now filters numeric prices, adds availability, falls back to default tier when vehiclesPrices is empty/undefined
- 2026-02-09: **Stripe Terminal physique (Reader S700) opérationnel** — Registered at Bristol Lobby (slug: `bristol`) | Reader ID: `tmr_GiSbzAmuecR6pP` | Location ID: `tml_GiSbzA31RMBRID` | Bug fix: `address.line2` was sent as empty string causing Stripe 400 — now omitted if not provided | E2E flow validated: booking → push payment → reader prompt → tap card → `paid` in DB (canal `terminal`)

## Prioritized Backlog

### P1 (High)
- Google Sheets/CSV Planning Import
- Hotel Kiosk App (Web-view for tablets)
- AI-assisted Booking Creation (LLM text parsing)

### P2 (Medium)
- Geofences & GPS Alerts
- Editable Company Profile Page
- Trip History & Route Replay

### P3 (Low)
- Hotel Admin Automated Invoicing
- Super Admin Hotel Leaderboard

### Blocked
- Partner Ride Cancellation (waiting for C# team endpoint)
- SEO Redirections for old URLs (waiting for user confirmation on approach)

## Latest Changes (Feb 2026)
- **Hourly Booking bugfix (Feb 2026)** : Fixed 3 bugs on `/hourly-booking` — (1) `PlacesAutocomplete` was called with non-existent `onSelect` prop; corrected to use `onChange({address, latitude, longitude})` so `pickup.lat/lng` is set properly. (2) Car categories now appear after pickup selection (was blocked by null lat). (3) Added explicit `text-gray-900 bg-white` to date/time/comment/terminal/card inputs and pickup input to fix invisible white text. Verified 100% via testing agent (iteration_70.json).
- **Blog Auto-Translation Claude Sonnet 4.5** (DONE) : nouveau module `routes/blog_translator.py` qui traduit chaque article EN reçu via webhook en FR/ES/RU/HY automatiquement (background task). Endpoints : `POST /api/blog-articles/translate-all?overwrite=true` (backfill schedulé) et `GET /api/blog-translate-status` (compteurs par langue). Champs traduits : title, meta_description, content_html (HTML préservé), jsonLd, faqJsonLd. Post-processing strict pour title (1 ligne, 120 chars) et meta (160 chars, sans phrases d'auto-correction). Testé : 1 article EN → 4 traductions générées en ~3 min. Coût LLM via Emergent Universal Key.
- **Routes ES réorganisées** : `/es` est la Home espagnole (auparavant Paris transfer). Nouvelle URL `/es/traslado-aeropuerto-paris`. URL detection ajoutée dans `LanguageContext` (URL `/es*` → langue 'es' automatique).
- **Spanish localization fixes** : Disposal CTA, TripAdvisor reviews, Footer service labels — tous traduits.
- **Blog Webhook + Native Blog Pages** : routes `/blog`, `/fr/blog`, `/es/blog`, `/ru/blog`, `/hy/blog` avec UI 100% traduite par langue. Sitemap : 5 URLs blog avec hreflang complet.
- **Menu Blog** ajouté dans le Header (desktop + mobile), pointe vers la version langue active.

## Credentials
- Super Admin: admin@zont.cab / admin123
- Fleet Admin: Nandetiri1@gmail.com / 12345678
- Hotel Admin: admin@bristol.fr / hotel123
- GPS Admin: gps@zont.cab / gpsadmin123
- Test Client: garikgalstyan@gmail.com / 12345678

### Session Jun 2026 — Fix GSC "Page en double avec balise canonique correcte"
- Root cause 1: `SITE = 'https://zont.cab'` (non-www) in `DriverAtDisposal.js` + `DisposalVehicle.js` → canonicals/hreflang pointed to non-www (301 redirect) → Google excluded all disposal pages (FR/EN/RU/HY/ES). Fixed to `https://www.zont.cab`.
- Root cause 2: `/cgv` hardcoded canonical to `/terms`. Fixed: `/cgv` now forces FR content + own canonical `https://www.zont.cab/cgv`, `/terms` keeps `/terms`, added hreflang fr↔en + x-default in `TermsOfUse.js`.
- Verified via Playwright: canonicals + hreflang correct on both page types.

### Session Jun 2026 — Terminal Stripe en production (kiosk Bristol)
- Cause QR code en prod : le lien terminal↔hôtel n'existe que dans la DB preview ; la prod a sa propre DB (deploy = code, pas données).
- Ajout endpoint `POST /api/stripe-terminal/link-reader {hotelSlug, readerId}` — lie un reader déjà enregistré chez Stripe sans code de pairing. Testé OK sur preview (reader tmr_GiSbzAmuecR6pP online).
- APK kiosk déjà en ligne : https://www.zont.cab/downloads/zont-kiosk.apk (pointe vers https://zont.cab/kiosk/bristol).
- EN ATTENTE : après redéploiement prod, exécuter: curl -X POST https://www.zont.cab/api/stripe-terminal/link-reader -H "Content-Type: application/json" -d '{"hotelSlug":"bristol","readerId":"tmr_GiSbzAmuecR6pP"}'

### Session Jun 2026 — APK Kiosk corrigé (s'ouvrait dans le navigateur)
- Cause : server.url pointait sur zont.cab (sans www) ; le site redirige vers www.zont.cab que Capacitor considérait comme domaine externe → ouverture dans Chrome.
- Fix : capacitor.config.json → url https://www.zont.cab/kiosk/bristol + allowNavigation [www.zont.cab, zont.cab]. APK rebuild (Java 17 + Android SDK 34 réinstallés, aapt2 ARM64 via Commit451/android-arm-build-tools, override -Pandroid.aapt2FromMavenOverride=/opt/android-sdk/aapt2-arm/aapt2).
- Nouvel APK copié dans /app/frontend/public/downloads/zont-kiosk.apk. Lien après deploy : https://www.zont.cab/downloads/zont-kiosk.apk

### Session Jun 2026 — Fallback paiement en iframe (Telegram WebApp)
- Contexte : Stripe Elements bloqué dans les WebView qui ne rendent pas les iframes (Telegram Desktop).
- Checkout.js : détection IN_IFRAME (exclut *.emergentagent.com), bannière multilingue + bouton "Ouvrir le paiement dans le navigateur" (Telegram.WebApp.openLink → top.location → window.open).
- Transfert d'état : /checkout?resume=<base64url {searchData,selectedCar}> — décodé au mount, restauré via startBooking/selectCar, URL nettoyée. Testé OK via Playwright.
- CSP : aucune CSP définie côté site — rien à changer.

### Session Jun 2026 — Numéro de téléphone → WhatsApp
- Header (mobile + desktop) et Footer : lien tel:+33783777027 remplacé par https://wa.me/33783777027 (target _blank). Vérifié via Playwright.

### Session Jun 2026 — Traductions Checkout (bouton "nouvelle carte" + blocs complets)
- Bloc hy (arménien) de Checkout.js était corrompu ("delays" partout) → réécrit intégralement en arménien correct (dont addNewCard, savedCards, payNow).
- Bloc es (espagnol) inexistant → ajouté complet. Vérifié via Playwright (titres + boutons en es/hy).

### Session Jun 2026 — Header russe : retours à la ligne corrigés
- Header.js desktop nav : whitespace-nowrap + gaps responsives (gap-x-3/5/6), ml-6 vs logo, salutation "Здравствуйте, X" visible seulement ≥2xl, numéro téléphone texte visible seulement ≥xl (icône WhatsApp seule en lg).
- Vérifié Playwright connecté en RU à 1024/1280/1440/1920 px : tout tient sur une ligne.

### Session Jun 2026 — Kiosk : aéroports + tarifs mise à disposition
- Aéroports : POPULAR_DESTINATIONS → Charles de Gaulle (CDG), Orly (ORY), Beauvais (BVA) + gares/Disney. Nouvel endpoint POST /api/kiosk/{slug}/reset-destinations (utilitaire admin). Appliqué sur preview. À FAIRE APRÈS DEPLOY PROD: curl -X POST https://www.zont.cab/api/kiosk/bristol/reset-destinations
- Tarifs disposal/hourly : /hourly-price réécrit pour utiliser l'API C# PUBLIQUE /api/Distance/driverTypesWithStatus (comme /hourly-booking du site) au lieu de TripsPrice (auth company cassée — mdp Nandetiri1@gmail.com changé). Testé: 4h=193€, 12h=577€ Standard Car. Tri par prix croissant, images incluses.
- RESTE BLOQUÉ sur mdp company C#: dispatch_to_csharp (envoi des réservations kiosk payées vers C#) + admin reservations. Demander le nouveau mot de passe.

### Session Jun 2026 — Compte C# entreprise rétabli
- Nandetiri1@gmail.com / 12345678 fonctionne à nouveau (HTTP 200). Ajouté dans backend/.env (CSHARP_COMPANY_USERNAME/PASSWORD), backend redémarré.
- Testé: GET /api/admin/reservations → 200, 59 réservations. dispatch_to_csharp (kiosk) débloqué aussi. Issue P0 admin reservations RÉSOLUE.

### Session Jun 2026 — Auto-migration destinations kiosk
- /prices : si l'hôtel a encore les anciennes entrées "CDG Terminal 1/2", elles sont remplacées automatiquement par la nouvelle liste (CDG/Orly/Beauvais/gares/Disney) au premier chargement. Plus besoin d'action manuelle en prod après deploy. Testé preview OK.

### Session Jun 2026 — Fix GSC "Excluded by noindex tag" /fr/search?q={search_term_string}
- Cause : JSON-LD SearchAction (Sitelinks Searchbox) dans Home.js annonçait /search?q=... alors qu'aucune route /search n'existe → Google crawlait le placeholder → 404 noindex.
- Fix : potentialAction/SearchAction supprimé du schéma WebSite. Sitemap ✅ (aucune URL search), noindex ✅ (uniquement 404/confirmation/admin). Vérifié Playwright : plus de SearchAction dans le DOM.

### Session Jun 2026 — My Account : annulation de réservation
- BUG corrigé : canCancelBooking/shouldShowContactMessage utilisaient new Date() sur le format C# DD/MM/YYYY → dates invalides/inversées → message "Moins de 24h" affiché à tort. Passés sur parseCSharpDate + fallback date+time.
- UI : bouton "Annuler la réservation" toujours visible ; grisé/désactivé (cursor-not-allowed) sous le message amber quand <24h du départ. data-testid: cancel-booking-{i} / cancel-booking-disabled-{i}.
- Logique validée par tests node (48h→annulable, 10h→non, jour>12 ok). Client test sans réservations pour test UI complet.

### Session Jun 2026 — Prix web alignés sur mobile (maxAmount)
- CarSelection.js : sélection, tri et affichage passés de minAmount → maxAmount (promo appliquée sur maxAmount, clientPrice cohérent).
- KioskPage.js : affichages, tri et prix envoyé à /api/kiosk/book passés sur maxAmount.
- kiosk.py : champ "cheapest" (prix "À PARTIR DE") calculé sur maxAmount.
- HourlyBooking inchangé (utilise perMinuteForTime/baseFare).
- Vérifié Playwright : Bristol→Strasbourg affiche 801€ (max) au lieu de 834€ (min), tri croissant OK.

### Session Jun 2026 — Pricing web = mobile (Distance + maxAmount)
- api.js calculatePrice : radius 50 → 50000 (comme mobile). Callers transfert (CarSelection, Home ×2, CityTransferPage) basculés de calculatePreorderPrice → calculatePrice (/api/proxy/distance → C# /api/Distance). calculatePreorderPrice conservé (kiosk backend l'utilise côté serveur).
- Vérifié Playwright : CDG→Beauvais Luxury Sedan = 187€ (fourchette mobile 185-197) au lieu de ~171€. Hourly/disposal inchangés.

### Session Jun 2026 — Landing page Marseille (SEO 4 langues)
- Nouvelle page /pages/cities/Marseille.js via CityTransferPage : URLs /marseille (EN), /fr/marseille, /ru/marseille, /es/marseille. H1 uniques par langue, canonicals auto-référentes, hreflang en/fr/ru/es/x-default, meta descriptions dédiées.
- FAQ 7 questions traduites + JSON-LD FAQPage + BreadcrumbList (injectés via extraSections). LocalBusiness/Product sans notes/prix inventés.
- CityTransferPage : nouveau prop hidePrices (masque prix véhicules + offers JSON-LD) + prix de routes optionnels (route.price facultatif). Aucun prix inventé (pricing C# ne couvre pas Marseille : /api/proxy/distance renvoie une erreur pour MRS).
- /countries : Marseille ajouté (cities.js + countriesList France), desc "Transfer company Marseille", image Vieux-Port, support urlEs dans getCityUrl. Sitemap.xml : 4 URLs Marseille + hreflang.
- Vérifié Playwright : 4 pages OK (H1/canonical/FAQ/schémas), carte Marseille sur /countries OK.

### Session Jun 2026 — Page Aéroport Marseille (MRS) + Countries en espagnol
- MarseilleAirport.js : URLs /marseille-airport-transfer, /fr/transfert-aeroport-marseille, /ru/transfer-aeroport-marsel, /es/traslado-aeropuerto-marsella. H1/title/meta/canonical/hreflang par langue, FAQ 10 questions + FAQPage + BreadcrumbList, contenu distinct de /marseille (anti-cannibalisation). Maillage croisé bidirectionnel /marseille ↔ page aéroport (4 langues). Sitemap à jour.
- Countries ES : nouvelle URL /es/destinos (force langue es, canonical propre, hreflang en/es/x-default sur /countries et /es/destinos). Traductions es complètes du template Countries, nameEs+urlEs ajoutés aux 17 villes dans cities.js (getCityName/getCityUrl es). Liens Header/Footer/CityTransferPage → /es/destinos quand langue=es. Sitemap à jour.
- Vérifié Playwright : 4 pages aéroport OK (canonical, crosslinks, FAQ×10), /es/destinos OK (UI es, cartes pointent vers les pages ES).

### Session Jun 2026 — Upload admin migré vers Emergent Object Storage
- admin_upload.py réécrit : POST /api/admin/upload → put_object (bucket zontcab/uploads/), GET /api/uploads/{filename} servi depuis l'object storage avec fallback disque legacy. Mount StaticFiles retiré de server.py. Testé : PUT/GET OK, 404 OK. Nécessite EMERGENT_LLM_KEY en prod.

### Session Jun 2026 — Fix hreflang Home (P0 de l'audit SEO)
- Home.js : bloc hreflang corrigé — en→/, fr→/fr, ru→/ru, hy→/hy, es→/es + x-default→/. Identique (réciproque) sur les 5 versions, aligné avec le sitemap. Canonicals auto-référents déjà OK. Vérifié Playwright sur les 5 URLs + visiteur neuf (Googlebot-like) : / reste / avec canonical /.
- Audit restant non appliqué : P1 sitemap x-default (21 entrées villes pointent FR/RU au lieu de EN), P2 doublon /es dans sitemap, P3 URLs dédiées /fr pour countries/help/about.

### Session Jun 2026 — URLs dédiées par langue pour pages statiques (P3 audit SEO)
- Nouveau système générique : MULTI_LANG_URLS étendu (countries/help/about/hourly/privacy/terms) dans pageUrlMaps.js + helpers buildCanonicalUrl, buildHreflangCluster, langUrl. Nouveau hook useLangRouting.js (langue forcée par URL + redirect base EN → URL de préférence).
- Nouvelles routes indexables : /fr|ru|hy/help, /fr|ru|hy|es/about, /fr|ru|hy/countries (es=/es/destinos conservé), /fr|ru|hy|es/hourly-booking, /fr|ru/privacy, /ru/terms (fr=/cgv conservé). Chaque URL : contenu dans la langue, canonical auto-référent, cluster hreflang + x-default→EN.
- Privacy/Terms : clusters limités à en/fr/ru (traductions hy placeholder "Delays" supprimées, es inexistante). Help : en/fr/ru/hy (hy = translittération latine, à retraduire).
- Header/Footer : liens help/hourly/countries/about/terms/privacy dynamiques via langUrl(). Sélecteur de langue navigue vers l'URL équivalente.
- sitemap.xml : entrées + clusters xhtml:link ajoutés pour les 6 groupes (about et hourly-booking étaient absents du sitemap).
- Testing agent : 12/13 flux OK ; bug "retour vers English" (course changeLanguage/navigate) corrigé dans useLangRouting (sync URL sur pathname uniquement) puis re-vérifié Playwright.
- Fix lint : AuthModal.js setMode → onSwitchMode.
- Restant : traductions es (privacy/terms/help) et hy propre (privacy/terms/help) pour compléter les clusters ; P1 sitemap x-default villes ; P2 doublon /es sitemap.

### Session Jun 2026 — Traductions ES + HY complètes (privacy/terms/help)
- PrivacyPolicy.js : blocs es + hy (arménien natif) complets (13 sections chacun).
- TermsOfUse.js : blocs es + hy complets (23 sections chacun).
- Help.js : bloc hy translittéré remplacé par du vrai arménien + nouveau bloc es (8 FAQ + labels).
- Nouvelles URLs : /es/privacy, /hy/privacy, /es/terms, /hy/terms, /es/help (routes App.js + MULTI_LANG_URLS). Clusters hreflang désormais à 5 langues sur privacy/terms/help. Sitemap régénéré par script (clusters + nouvelles entrées, XML validé).
- Vérifié Playwright : 5 URLs OK (H1 dans la bonne langue, canonical auto-référent, cluster en/fr/ru/hy/es + x-default).

### Session Jun 2026 — Sitemap x-default alignés + doublon /es supprimé (Issues 1 & 2 audit SEO)
- 30 entrées corrigées par script : x-default pointait vers l'URL FR au lieu de l'URL EN (pages villes/aéroports, gares, VTC 7/8 places, B2B, kiosk, driver-at-disposal, /es/traslado-aeropuerto-paris).
- Entrée /es dupliquée (cluster incomplet es+x-default seul) supprimée ; l'entrée /es complète conservée.
- Validation : XML parse OK, 0 mismatch x-default vs en, 0 entrée sans en, 0 doublon, sitemap servi vérifié via curl. Aligné avec la logique on-page (SEO.js / CityTransferPage x-default=EN).

### Session Jun 2026 — Multi-stop (jusqu'à 3 destinations) sur réservation transfert web
- Nouveau : utils/routeStops.js (formatDestinationCoords "lat,lng|...", buildRouteSearchData, getDestinationCoords) + components/ExtraStops.js (composant + hook useExtraStops + stopLabels 5 langues).
- Home.js & CityTransferPage.js : bouton "+ Ajouter un arrêt" (max 2 arrêts extra), label dropoff devient "Destination 1" si arrêts, validation arrêts vides, geocode via safeRefs, recherches récentes multi-stop. Caché en mode disposal/hourly.
- api.js : calculatePriceForRoute → /api/proxy/distance avec [pickup,...dests] ; normalise maxAmount=max(min,max) (C# multipleDest les inverse !) et trie par prix croissant (sinon le "Recommandé" était le plus cher). calculatePreorderPriceForRoute ajouté aussi.
- CarSelection : getDestinationCoords + calculatePriceForRoute. Checkout : payload destination="lat,lng|lat,lng", endAddress="A|B", endPoint=dernier arrêt ; récap liste les arrêts (checkout-stop-N / checkout-dropoff).
- csharp_proxy.py : /distance → /api/Distance/multipleDest si 3+ coords ; /preorder-distance → driverTypesMultipleDest si 3+ ; /booking/create garde le pipe et set endPoint depuis le dernier arrêt.
- Décision utilisateur : garder /api/Distance + maxAmount (aligné mobile), PAS de retour à preorder/minAmount.
- Testing agent : 11/11 scénarios PASS (backend pytest 6/6 dans /app/backend/tests/test_multistop_distance.py). Fix appliqué post-test : tri par prix. Restant (mineur, non demandé) : marqueur d'arrêt intermédiaire sur carte TripRecap, persistance formulaire Home au retour arrière, GSI origin preview, chaînes FR dans checkout EN.

### Session Jun 2026 — Page "Partenaire VTC Hôtel Paris"
- Nouvelle page FR /partenaire-vtc-hotel-paris (pages/b2b/HotelPartnersParis.js) : contenu éditorial complet fourni par l'utilisateur (commission 10% Premium, transferts CDG/Orly/Beauvais, types d'hôtels, borne), Title/H1/meta exacts du brief, canonical auto-référent, JSON-LD Service.
- Maillage : 4 liens vers /borne-reservation-hotel (hero, encart inline, section borne, footer form), lien retour hub B2B, entrée ajoutée dans la grille du hub B2B (Partners.js) + relatedPages de la page borne (Hotels.js). Sitemap à jour.
- Formulaire lead → POST /api/leads (source_page), testé en curl (lead créé puis nettoyé). Screenshot OK.

### Session Jun 2026 — Audit complet sitemap (avant soumission GSC)
- 249 URLs testées une par une : 249/249 en HTTP 200, 0 doublon, 0 alternate hreflang manquant du sitemap, XML valide.
- Toutes les pages récentes présentes (partenaire-vtc-hotel-paris, /es|/hy privacy/terms/help, /fr|ru|hy countries/about/hourly, Marseille...).
- sitemap-index.xml : lastmod rafraîchi 2026-06-20. sitemap-blog.xml : généré dynamiquement depuis Mongo, vide en preview (articles en prod uniquement) — normal.
- URLs GSC : https://www.zont.cab/sitemap-index.xml (recommandé, couvre tout) ou sitemap.xml + api/sitemap-blog.xml séparément.

### Session Jun 2026 — Audit SEO + maillage interne
- Sitemap : 249/249 URLs matchent une vraie route React (0 URL morte), 0 doublon, 0 alternate hreflang manquant. Routes privées (/hotel, /my-bookings, admin/fleet/driver) correctement exclues.
- Alias : /es/vtc-7-plazas et /es/vtc-8-plazas sont des alias avec canonical correct vers /es/minivan-7-plazas et /es/minibus-8-plazas (vérifié rendu) — volontairement hors sitemap. 404 (ex /fr/transfert-aeroport-paris) = noindex,nofollow ✔.
- Maillage : 83 liens internes uniques extraits de 9 pages clés rendues — 1 seul lien cassé trouvé et CORRIGÉ : la carte "Côte d'Azur" de cities.js pointait vers /french-riviera-airport-transfer, /transfert-aeroport-cote-azur, /taksi-iz-aeroporta-lazurnyy-bereg (pages inexistantes → 404) ; redirigée vers les pages Nice existantes (EN/FR/RU/ES). Vérifié rendu sur /countries et /fr/countries.
- Échantillon SEO rendu OK : 1 seul H1 par page, canonicals auto-référents, hreflang 6 tags sur pages multilingues.

### Session Jun 2026 — Fix tracking Meta Pixel (Purchase & InitiateCheckout)
- Bug : Checkout et BookingConfirmation gardaient sur `searchData.price` (champ inexistant) → InitiateCheckout et Purchase ne partaient JAMAIS. Corrigé : prix depuis `selectedCar.price` (+ Number() forcé avec fallback 0 dans fbPixel.js).
- Purchase se déclenche sur /booking-confirmation (après paiement réussi, tous moyens : carte, wallet), avec order_id. Refresh = pas de doublon (contexte perdu → early return).
- Lead ajouté : formulaire HotelPartnersParis + formulaire B2BPage (les 9 pages B2B) — avant seul Partners.js traçait.
- Rappel : les événements ne partent QUE sur zont.cab (prod) — tester après Deploy avec Meta Pixel Helper / Test Events. Lint OK, pages vérifiées au rendu.

### Session Jun 2026 — Durcissement InitiateCheckout/Purchase (rapport user : non visible en prod)
- Cause probable : la prod déployée datait d'avant le fix Meta Pixel. En plus, durcissement : InitiateCheckout part désormais dès que selectedCar est dispo (useEffect [selectedCar] + ref anti-doublon) au lieu du montage seul ; idem Purchase ([bookingDetails, selectedCar] + ref). Couvre les cas resume/iframe et restauration tardive.
- Vérifié : lint OK, /checkout sans contexte rend l'état vide sans crash. User doit REDÉPLOYER puis tester avec Meta Test Events.

### Session Jun 2026 — Redirect non-www → www dans index.html
- Script inline ajouté en tout premier dans <head> : si hostname === "zont.cab" → location.replace vers https://www.zont.cab + path + search. Aucun autre script/canonical/og:url touché. Vérifié servi (curl). En attente de Deploy par l'utilisateur.

### Session Sep 08, 2026 — Cartes GPS : Leaflet → Google Maps (clé existante)
- Nouveau utils/googleFleetMap.js : réutilise le loader loadGoogleMaps (clé REACT_APP_GOOGLE_MAPS_KEY), style clair épuré LIGHT_MAP_STYLE, carIcon (SVG data-URI avec rotation cap intégrée), dotIcon, animateMarkerG, createFleetMap.
- 4 cartes converties de Leaflet/CartoCDN vers Google Maps JS API : FleetGeolocation (UnifiedMap live+historique), FleetGPSHistory (ReplayMap), gps-admin/GpsAdminMap (MapView), gps-admin/GpsAdminHistory. Toutes fonctions conservées : marqueurs voiture pivotants, couleurs statut, animation position, fitBounds, panTo, polyligne colorée par vitesse, marqueurs départ/arrivée, replay.
- Message d'erreur clair si "Maps JavaScript API" non activée (data-testid *-map-error).
- Vérifié en réel : carte Fleet Géoloc affiche Google Maps ("Map data ©2026 Google"), 3 véhicules positionnés avec bons statuts, mode Historique OK. La clé a bien Maps JS API activée.
- Leaflet plus référencé dans ces 4 fichiers (l'import de la lib peut rester dans package.json, inoffensif). Deploy requis pour la prod.
