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
### Session Jun 2026 — Prix d'exemple pages marketing: alignés sur le moteur C# réel
- Vrais prix récupérés via `/api/proxy/preorder-distance` (C# driverTypesTwo). Types: Standard Car / Luxury Sedan / Standard Minivan 8 pers. / Luxury Van.
- **VTC8Places.js** & **VTC7Places.js**: trajets corrigés (CDG 105, Orly 105, Disneyland 112, Versailles 103, Beauvais 155) + `vehiclesPrices={sedan:68,luxury:95,minivan:120,minibus:105}`. Appliqué sur tous les blocs langue (fr/en/ru/es + hy). Avant: 190/170/195/180/280 (trop cher).
- **ParisAirportTransfer.js** & **cities/CDG.js**: `vehiclesPrices` van/minibus abaissés 130→120, 190→105 (sedan/luxury inchangés pour ne rien augmenter).
- **Décision (jugement)**: pages aéroport/gare (Orly, Beauvais, Gares, ParisTrainStation, DisneylandParis) et villes HORS Paris (Barcelona, Berlin, Milan, Monaco, Munich, Nice, Rome, Yerevan, Alicante, Cannes) laissées inchangées — leurs prix « à partir de » sont déjà bas (parfois sous le réel); les modifier les aurait augmentés, contraire à la demande. Le moteur C# est basé Paris et ne fournit pas les tarifs locaux étrangers.
- Table prix réels Paris (max, €): CDG 68/95/105/120 · Orly 70/105/105/152 · Disneyland 95/107/112/156 · Versailles 88/105/103/145 · Beauvais 118/155/155/220.


### Session Jun 2026 — Page B2B hôtel: ajout vidéo démo
- Vidéo `b2b.mp4` (uploadée) téléchargée dans `frontend/public/videos/b2b.mp4` (H.264 Baseline + AAC, yuv420p, faststart moov avant mdat → démarrage instantané; servie en 206 range OK).
- `components/B2BPage.js`: nouvelle prop optionnelle `videoUrl` (+`videoPoster`) → section vidéo sous le hero (titre/sous-titre traduits FR/EN/RU/HY/ES, `autoPlay muted loop playsInline controls`, poster = heroImage). Rendue seulement si `videoUrl` fourni.
- `pages/b2b/Hotels.js`: passe `videoUrl="/videos/b2b.mp4"` → vidéo visible uniquement sur `/borne-reservation-hotel` (+ variantes langue `/hotel-booking-kiosk`, `/terminal-bronirovaniya-otel`, etc.). Les autres pages B2B ne l'affichent pas.
- Note: l'erreur codec vue au test = navigateur Playwright sans codecs propriétaires (pas un vrai problème).


### Session Jun 2026 — Borne: écran d'accueil animé (diaporama photos blog)
- **KioskPage.js `AttractScreen`**: remplace l'image statique unique par un **diaporama animé** des hero images du blog (`GET /api/blog-articles?language=fr&limit=50` → `hero_image_url`). Fondu enchaîné (opacity 1.5s) toutes les 6s + zoom Ken Burns 7s, overlay dégradé + branding ZONT + CTA « Touchez l'écran pour commencer ». Images préchargées. **Repli** sur `/images/kiosk-idle-screen.webp` si aucune image blog (ex. preview = 0 article; prod = 17).
- **Vérifié**: slideshow rendu (mock API, 3 couches image + overlay + CTA); repli statique OK sur preview sans erreur de code.
- **APK**: pas de nouvel APK nécessaire — l'APK `cab.zont.kiosk` est un web-wrapper Capacitor pointant vers `https://www.zont.cab/kiosk` (générique, pas par hôtel). Après Deploy, l'animation apparaît sur toutes les tablettes. APK signé déjà publié à `/downloads/zont-kiosk.apk`; rebuild via GitHub Action "Build Kiosk APK".


### Session Jun 2026 — Dispatch C# addPrepaid (terminal/webhook) + email obligatoire
- **kiosk.py `dispatch_to_csharp`**: login company en **Pascal-case** `{"Username","Password"}` (C# renvoie 400 sinon). Payload aligné sur la spec: `endPointLatitude/Longitude` ajoutés, `utcOffset:0`, `destination:"lat,lng" ou null` (plus de fallback adresse), `additionalComments:"Kiosk booking Ref: ZK-..."`, `externalPaymentRef` = PaymentIntent id (`pi_...`), `startDate` `dd/MM/yyyy HH:mm:ss`. Endpoint = `POST /api/Auction/addPrepaid` (déjà en place). Bearer token depuis `accessToken`.
- **kiosk.py `/webhook/stripe`**: ajout du handler `payment_intent.succeeded` quand `metadata.channel=="kiosk_terminal"` → charge la réservation par `kiosk_reference`, stocke le PI id, puis `_claim_and_dispatch` (idempotent).
- **`_claim_and_dispatch`** (inchangé): claim atomique via `csharpDispatch` → dispatch une seule fois; si `done` → rien; retry si `failed`/`paid`. Le flux terminal poll (`stripe_terminal.py get_payment_status`) délègue déjà à `_claim_and_dispatch`.
- **stripe_terminal.py create-payment**: `client_email` ajouté dans les métadonnées du PaymentIntent.
- **Email OBLIGATOIRE sur la borne** (demande explicite, override du "optional" de la spec): step 3 label `Email *`, validation regex, bouton « Confirmer » désactivé tant que l'email n'est pas valide, message d'erreur `invalidEmail` (FR/EN/RU). Le backend reste tolérant à un email null pour les anciennes réservations/retries.
- **Vérifié preview**: payload dispatch conforme (test HTTP intercepté); webhook terminal → status `dispatched` une seule fois; email obligatoire testé (vide/invalide/valide).


### Session Jun 2026 — Borne: l'heure choisie était réinitialisée à la valeur par défaut (bug)
- **Bug**: l'effet de pré-remplissage date/heure avait `[step]` en dépendances → il se relançait à CHAQUE changement d'étape et écrasait l'heure choisie par le client (revenait au défaut ≈ maintenant+3h, ex. 15:00) dès qu'on revenait sur l'écran de l'heure.
- **Fix (KioskPage.js)**: l'effet ne pose le défaut que si `step===1` ET `!date && !time` (jamais par-dessus un choix existant). `resetKiosk` vide déjà date/time → nouvelle réservation = nouveau défaut correct. Deps `[step, date, time]`.
- **Vérifié preview**: 13:00 choisi → étape suivante → retour → 13:00 conservé (PRESERVED: True).


### Session Jun 2026 — Intégration Pixel publicitaire OpenAI (OAIQ) (P1)
- **Pixel de base** ajouté dans `frontend/public/index.html`, dans le bloc tracking **production-only** (host `zont.cab`), après consentement CookieYes + différé (requestIdleCallback), à côté de Meta/GA4/Google Ads. `pixelId: PkzxozCo2onLD7RvtNz8zQ`, `debug:false`. Sur preview `window.oaiq` reste undefined (pas de pollution).
- **Attribution oppref**: capturée **synchronement** au landing (dans le bloc prod, avant le différé) → `localStorage.zont_oppref`, pour survivre à la navigation SPA. Le SDK OAIQ la lit à l'init.
- **Conversion `order_created`**: util `frontend/src/utils/openaiAds.js` → `trackOrderCreated({priceEuros, bookingId})`. Montant en **centimes** (`Math.round(euros*100)`), `currency:EUR`, `type:contents`, `event_id = booking id` (dédup via localStorage `zont_oaiq_fired` + dédup serveur OpenAI). Appelée dans `Checkout.js` juste après `submitBooking` réussi (même point que la conversion Google Ads) → **uniquement après paiement réel confirmé**. Pas d'InitiateCheckout comme conversion principale (demande explicite).
- **Vérifié preview**: test payload avec stub — 40€→4000, 100,50€→10050, event_id correct, dédup OK, montants invalides ignorés. ⚠️ Le tir réel du SDK ne peut être testé que sur PRODUCTION (tracking prod-only) via le debugger de pixel OpenAI après déploiement.


### Session Jun 2026 — Search History: tracer les recherches sans clic véhicule (P1)
- **Problème**: la recherche n'était loggée qu'au clic « Continuer » (étape date/heure → véhicules). Les recherches abandonnées AVANT (sur l'écran date/heure) n'apparaissaient jamais. L'utilisateur veut voir TOUTES les recherches, même sans appui sur une catégorie de voiture.
- **Fix (KioskPage.js)**: `logSearch` déclenché désormais via un `useEffect` **dès l'entrée sur l'étape 1** (date/heure) quand une destination + prix sont connus (menu, aéroport, gare, Disney, adresse tapée). Dédupliqué par signature destination (`lastLoggedSearchRef`) → pas de doublon au retour/avance. Réinitialisé dans `resetKiosk` (nouvelle session = nouveau log). Retiré l'appel du bouton « Continuer ».
- Résultat: chaque recherche (y compris adresse libre) est enregistrée avec son prix (`minPrice` des véhicules), statut `not_booked` par défaut, puis passe `booked` uniquement au paiement. Les recherches abandonnées sans véhicule sélectionné apparaissent dans « Non réservées ».
- **Vérifié preview**: sélection Orly → arrivée écran date/heure sans toucher un véhicule → 1 `kiosk_searches` créé (Orly, 105€, not_booked).


### Session Jun 2026 — Borne: sélecteur d'heure tactile + délai minimum 3h (P1)
- **Problème**: sur la tablette (APK), l'écran « Quand partez-vous ? » ouvrait la roue horaire native d'Android dont le bouton de validation était coupé/invisible à droite. + besoin métier: n'accepter les réservations borne qu'au moins 3h à l'avance.
- **Fix (KioskPage.js step 1)**: remplacement de `<input type="time">` par un sélecteur **intégré à la page** (data-testid `kiosk-time-picker`) — 2 grandes colonnes HEURES/MINUTES avec gros chevrons +/− (`kiosk-hour-up/down`, `kiosk-minute-up/down`), pas de 15 min, grand affichage. Rien ne peut être coupé (rendu web contrôlé).
- **Règle 3h**: défaut = maintenant +3h (arrondi au quart d'heure sup.). `dateTimeValid` bloque le bouton « Continuer » si l'heure choisie < maintenant+3h, avec message amber `kiosk-min3h-warning` (« Réservation possible au minimum 3 h à l'avance »). FR/EN/RU. Frontend uniquement (site web inchangé).
- **Vérifié preview**: picker s'affiche grand et complet; baisser l'heure sous le seuil → warning + bouton grisé; pas d'overflow.


### Session Jun 2026 — Commission TPE terminal manquante (Novotel Évry) — P0 fix
- **Bug**: réservation 40€ payée par TERMINAL PHYSIQUE (TPE) n'apparaissait pas en commission ni en "Réservé". Cause racine: le flux terminal (`stripe_terminal.py::get_payment_status`) avait un bloc dupliqué qui marquait payé + dispatch C# mais **n'appelait jamais** `_record_paid_side_effects` (contrairement au flux QR/webhook corrigé auparavant). Aucun `hotel_bookings` créé → 0 commission.
- **Fix (a)** `stripe_terminal.py`: le flux terminal appelle désormais `_claim_and_dispatch(ref)` de `kiosk.py` (claim atomique + commission + "booked" + dispatch, idempotent).
- **Fix (b)** `kiosk.py::_record_paid_side_effects`: liaison borne↔hôtel plus robuste — kiosk_slug (hotels) → hotel_users.kiosk_slug → nom (booking OU kiosk_hotels, match **insensible à la casse**) → kiosk_hotels.hotel_id. Résout les hôtels sans `kiosk_slug` renseigné (ex: Bristol).
- **Fix (c)** `kiosk_admin.py` POST `/api/admin/kiosk/backfill-commissions` (admin) + bouton "Récupérer les commissions manquantes" dans KioskSearchHistory.js: recrée les commissions manquantes des réservations payées existantes. Idempotent. Retourne scanned/recovered/already_recorded/unmatched.
- **Vérifié preview**: Negresco (match slug, 12%) + Bristol (match nom, 15%) → hotel_bookings créés; idempotence OK; endpoint backfill recovered=1; bouton UI affiché.
- ⚠️ La réservation Novotel réelle est en PRODUCTION → l'utilisateur doit **déployer** puis cliquer le bouton backfill pour la récupérer.


### Session Jun 2026 — Réservation kiosque → commissions hôtel + historique "réservé" (P0 fix)
- **Bug**: une réservation payée sur la borne partait bien au C# mais n'apparaissait NI dans les commissions de l'extranet NI dans l'historique "Réservé". Cause: le dashboard hôtel agrège `hotel_bookings` alors que le kiosque n'écrivait que dans `kiosk_bookings`; et la recherche était marquée "booked" à la création (même sans paiement).
- **Fix** (`kiosk.py`): `searchId` désormais stocké sur le kiosk_booking. Nouvelle fonction `_record_paid_side_effects(booking)` appelée dans `_claim_and_dispatch` (= paiement confirmé) qui: (1) marque la recherche `booked` UNIQUEMENT au paiement, (2) crée un enregistrement `hotel_bookings` (source=kiosk, status=confirmed, total_price, taux commission) → apparaît dans les commissions. Idempotent via `kiosk_reference`. Lookup hôtel: db.hotels.kiosk_slug → hotel_users.kiosk_slug → db.hotels.name.
- **Vérifié**: simulation paiement 40€ Bristol → dashboard +40€ CA, +6€ commission (15%), course listée; recherche passée en booked.
- ⚠️ Ne rétro-remplit PAS les réservations déjà faites avant le déploiement du correctif; s'applique aux futures réservations payées.

### Session Jun 2026 — Barre de recherche accueil + masquage Standard Car global (P1)
- **Barre de recherche d'adresse** sur l'écran d'accueil (step 0) du kiosque : `PlacesAutocomplete` réutilisant `handleCustomDest` → le client tape une adresse directement. Vérifié desktop + mobile.
- **Masquage "Standard Car" rendu global** : filtre déplacé au niveau du rendu des véhicules (step 2, ligne ~1146) → s'applique à TOUS les flux (menu, aéroports, gares, Disney, disposition horaire, et adresse tapée / custom-price). Avant, le filtre `/prices` ne couvrait pas le flux adresse libre → Standard Car réapparaissait. Corrigé. Vérifié : 3 catégories partout.

### Session Jun 2026 — Historique des recherches (Search History) par hôtel + message de fin traduit (P1)
- **Search History**: nouvelle collection `kiosk_searches` `{id, hotel_slug, device_id, from_address, destination_name, destination_address, price, status: not_booked|booked, booking_reference, created_at}`.
  - Kiosk: `POST /api/kiosk/search-log` (loggé quand le client atteint l'étape véhicule, avec le prix min affiché) → renvoie searchId. `/api/kiosk/book` accepte `searchId` → passe la recherche en `booked`. Aucune donnée perso enregistrée.
  - Admin: `GET /api/admin/kiosk/{slug}/searches?status=&date_from=&date_to=` → liste + agrégat top destinations + totaux. Défaut = not_booked.
  - Frontend: `pages/admin/KioskSearchHistory.js` (filtre Non réservées/Réservées/Toutes, dates, "Les plus recherchées", tableau date/destination/prix/statut). Accès: Gestion Hotels → menu ⋮ → "Search History".
- **Message de fin borne**: remplacé "Votre chauffeur arrive bientôt" par "Vous allez recevoir une confirmation par email ou SMS." traduit FR/EN/RU (clés paymentAccepted/confirmationSoon).
- Filtre "Standard Car" confirmé conforme (garde 3 catégories dont Standard Minivan).

### Session Jun 2026 — Accès Extranet hôtel + définition du mot de passe (admin) (P1)
- **Contexte**: l'extranet hôtel existe (`/hotel/login` → dashboard commissions/réservations/factures). À la création d'un hôtel avec `contact_email`, un `hotel_users` est auto-créé avec mot de passe `hotel{id}` MAIS jamais affiché → impossible de le transmettre.
- **Backend** `admin_hotels.py` : `POST /{hotel_id}/set-password {password}` — définit/réinitialise le mot de passe extranet (crée le hotel_user si absent, via contact_email). Vérifié : login extranet OK avec le mot de passe défini.
- **Frontend HotelForm** : nouvelle section "Accès Extranet Hôtel" (mode édition) — lien `/hotel/login` (+ copier/ouvrir), email de connexion, champ mot de passe + bouton **Générer** + **Enregistrer**, et **Copier les identifiants** (lien + email + mdp).
- Bristol remis à `hotel123` après test.

### Session Jun 2026 — Champ "ID Terminal Stripe" dans le profil hôtel (admin) (P1)
- **Formulaire hôtel (admin, HotelForm)** : nouvelle section "Terminal de paiement Stripe" (mode édition + hôtel ayant un kiosk_slug) — champ Reader ID `tmr_xxx` + bouton "Rattacher le terminal".
- **Backend** `kiosk_admin.py` : `PUT /{slug}/reader` (rattache au niveau hôtel, **tolérant si clé Stripe expirée** → enregistre l'ID quand même + renvoie un warning ; validé une fois la clé renouvelée) et `DELETE /{slug}/reader`. `admin_hotels.py` list_hotels renvoie désormais `stripe_terminal_reader_id` pour préremplir le formulaire.
- ⚠️ **Incident data preview** : le pytest du testing_agent a vidé `db.hotels` (0 hôtel). Restaurés manuellement les 3 hôtels démo (Bristol c9baf685, Negresco 523e9be3, W Barcelona 92bcf8a7) liés aux hotel_users existants.

### Session Jun 2026 — Borne persistante + ergonomie kiosque (P1)
- **Identification persistante**: la borne se connecte/se saisit UNE fois. `KioskPage` persiste `localStorage.kiosk_bound_slug` (+ `kiosk_bound_device`) à l'ouverture. `KioskLanding` redirige automatiquement vers `/kiosk/{slug}` si déjà lié (survit reboot/fermeture). Login/register stockent aussi le slug. Plus jamais de re-login au démarrage.
- **Déconnexion admin**: appui long 2,5s sur le logo/nom (header, data-testid kiosk-brand) → modal de confirmation `kiosk-unbind-modal` → efface le binding et renvoie vers `/kiosk`. Geste volontaire, non déclenchable par un client par accident.
- **Ergonomie**: bouton Retour agrandi (pill blanc contrasté, grande zone tactile, icône 6-7 w/h) ; sélecteur de langue en pill segmenté bien visible (FR actif vert). Vérifié desktop + mobile (pas de débordement header).

### Session Jun 2026 — Module "Configuration Borne" (Kiosk config back-office) (P0)
- **Objectif**: un seul APK pour tous les hôtels, chaque borne pilotée depuis le back-office. Architecture scalable multi-bornes.
- **Backend**:
  - Nouveau routeur `routes/kiosk_admin.py` (prefix `/api/admin/kiosk`, require_admin) :
    - `GET /{slug}/config`, `PUT /{slug}/destinations` (ordre + highlighted + hidden), `PUT /{slug}/settings` (default_language)
    - Bornes: `GET/POST /{slug}/devices`, `DELETE /devices/{id}`, `POST /devices/{id}/register-reader|link-reader|unlink-reader`, `GET /devices/{id}/reader-status`
  - Collection **`kiosk_devices`** : `{id, hotel_slug, device_code (TERM-001…), label, stripe_terminal_reader_id, stripe_terminal_location_id, last_seen_at}`. Statut = connectivité (heartbeat < 2 min = online). Reader mirroré sur `kiosk_hotels` (compat flux single-borne).
  - `kiosk.py` : `/{slug}/prices` filtre `dest.hidden` + conserve l'ordre ; nouveau `POST /heartbeat {deviceId}` ; `KioskBookingRequest.deviceId` stocké sur la réservation.
  - `stripe_terminal.py` create-payment : utilise le reader de la borne (booking.deviceId) sinon fallback reader hôtel.
  - Erreurs Stripe renvoyées en **HTTP 400** (message FR) pour passer le proxy Cloudflare (les 5xx sont remplacés par la page Cloudflare).
- **Frontend**: `pages/admin/KioskConfig.js` — 3 onglets Destinations (drag-drop + flèches, switch mise en avant, switch visible, ajout via Google Places) / Bornes (CRUD, Reader ID + Location ID, statut, dernière connexion, rattacher/lier/remplacer lecteur, lien `/kiosk/{slug}?device=TERM-xxx`) / Paramètres (langue par défaut). Ouvert depuis Gestion Hotels → menu ⋮ → "Configuration Borne".
  - `KioskPage.js` : applique `hotel.default_language` (client peut toujours switcher), lit `?device=`, envoie heartbeat, met la borne à jour ; "Popular" = destinations `highlighted`.
- **Testé**: testing_agent iteration_94 — frontend 100%, backend 11/12 (le 12e = clé Stripe live EXPIRÉE dans l'env preview, pas un bug code). Vérifié desktop + mobile.
- ⚠️ **ACTION USER**: la clé `STRIPE_LIVE_SECRET_KEY` de l'environnement est **expirée** (Stripe: "Expired API Key"). Le rattachement d'un lecteur Stripe échouera tant qu'elle n'est pas renouvelée.

### Session Jun 2026 — Kiosk : masquer la catégorie "Standard Car" (P1)
- **Demande**: Sur les bornes Kiosque uniquement (pas le site web, pas l'app mobile), n'afficher que 3 catégories au lieu de 4. Masquer "Standard Car".
- **Fix**: `KioskPage.js` — filtre appliqué à la réception des tarifs (`fetch .../prices`), retire les véhicules dont `tripType.trim().toLowerCase() === 'standard car'`. Résultat: Luxury Sedan, Luxury Van, Standard Minivan 8 pers.
- **Vérifié**: Screenshot du flux Kiosk bristol → étape véhicule affiche exactement 3 cartes. Aucune régression site/app (le filtre est local au composant Kiosk).

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

### Session Sep 11, 2026 — Bascule GPS VPS→prod + ajout traceurs + fix compteur offline
- Diagnostic : le VPS Teltonika (backend/vps-teltonika/, /opt/teltonika-gateway/.env) envoyait vers l'URL PREVIEW. Guidé l'user pour changer WEBHOOK_URL → https://www.zont.cab/api/fleet/gps/webhook (clé X-GPS-API-Key inchangée : GPS_WEBHOOK_API_KEY). VPS confirmé "Webhook OK".
- Constat : positions bien enregistrées en prod (gps_admin/stats online:2) mais invisibles car /positions et /devices ne renvoient que les IMEI enregistrés dans gps_devices. Seul l'ancien Lexus DZ-960-CK (350317176003840, offline depuis 24/03) était déclaré en prod.
- Action : ajouté 2 traceurs actifs dans la base PROD via POST /api/fleet/gps/devices (compte Fleet Nandetiri1) :
  - Lexus NX300 — DQ-728-JN — IMEI 350317175915150
  - Mercedes Classe E — EK-470-SH — IMEI 350317176004061
  Vérifié : /api/fleet/gps/positions prod renvoie 3 véhicules, 2 en temps réel (age <30s). ✅
- Fix compteur : gps_admin.py /stats — online restreint aux IMEI enregistrés + online=min(online,total_devices) + offline=max(0, total_devices-online). Plus jamais négatif. Vérifié preview (offline:3). NB : ce fix code ne s'applique en prod qu'après Deploy ; l'ajout des traceurs est déjà actif en prod (écrit direct en base prod).
- GPS Admin creds : gps@zont.cab / gpsadmin123 (endpoint seed /api/gps-admin/auth/seed).

### Session Sep 11, 2026 — Kiosk bookings → C# auctions + operator email (FIXED)
- ROOT CAUSE: kiosk pays via Stripe Terminal (stripe_terminal.py). On success it marked booking "paid" but NEVER dispatched to C#. The old dispatch_to_csharp targeted /api/Auction/company (404, nonexistent). And /api/Auction/addAuction requires a cardId + client role → would double-charge the already-paid kiosk guest. No prepaid endpoint existed.
- C# dev added: POST /api/Auction/addPrepaid (company/admin Bearer token, NO card charge). Body: startPointLatitude/Longitude, startAddress, endAddress, destination "lat,lng", startDate "dd/MM/yyyy HH:mm:ss", utcOffset, clientPrice, paidAmount, carType, tripType "distance", distance, passengerName/Phone/Email, paymentStatus "prepaid", externalPaymentRef (Stripe pi id), currency "eur", source "kiosk". Response {auctionId, tripId}.
- IMPLEMENTED:
  - backend/routes/kiosk.py: rewrote dispatch_to_csharp() → company login (CSHARP_COMPANY_USERNAME/PASSWORD env, fallback Nandetiri1) → POST /api/Auction/addPrepaid. KioskBookingRequest + /book now store destLat/destLng/clientEmail/utcOffset.
  - backend/routes/stripe_terminal.py: on PaymentIntent succeeded → atomically claim + mark paid + dispatch_to_csharp() → store csharpAuctionId/csharpTripId (or status paid_dispatch_failed on error). Idempotent via csharpDispatch flag.
  - frontend/src/pages/kiosk/KioskPage.js: optional email field (data-testid kiosk-email), sends destLat/destLng/clientEmail/utcOffset in /book payload.
- VERIFIED end-to-end: called real dispatch_to_csharp against live C# → auctionId 182 created, then deleted via admin (POST /api/Auction/deleteAuction/{id}). NOT testable here: the physical Terminal "succeeded" trigger (needs real card reader) — user to confirm with one real kiosk booking after Deploy.
- DEPLOY REQUIRED to activate on www.zont.cab.

### Session Sep 12, 2026 — Kiosk QR (Checkout Session) flow → auctions + email (FIX, needs deploy)
- USER REPORT: booked via kiosk QR link, no auction/Gmail. ROOT CAUSE: QR is a FALLBACK (shown only when TPE errors) that pays via Stripe CHECKOUT SESSION → confirmation relied on the Stripe WEBHOOK (/api/kiosk/webhook/stripe) which is NOT configured/firing. So paid QR bookings stay awaiting_payment → never dispatched. (My earlier fix only covered the physical TPE PaymentIntent flow.)
- FIX (kiosk.py): added GET /api/kiosk/booking-status/{reference} — verifies the Stripe Checkout Session server-side (no webhook dependency); when payment_status=='paid' → _claim_and_dispatch(). New shared _claim_and_dispatch() (atomic csharpDispatch claim → mark paid → dispatch_to_csharp → store auctionId/tripId; retries 'failed'). Webhook refactored to use it. dispatch_to_csharp now falls back to hotel-config destination coords when destLat/destLng missing (recovers old bookings).
- FIX (KioskPage.js): polls booking-status every 3s while the fallback QR is displayed (detects phone payment → shows success); also calls booking-status on the ?paid=REF phone redirect.
- Verified: backend imports + frontend compile OK; addPrepaid dispatch verified live earlier. NOT E2E-testable on preview (Stripe LIVE key expired on preview + data only on prod).
- DEPLOY REQUIRED. After deploy, recover already-paid bookings via GET https://www.zont.cab/api/kiosk/booking-status/{ref} (safe: only dispatches if Stripe confirms paid). Recommend also configuring the Stripe webhook (checkout.session.completed → https://www.zont.cab/api/kiosk/webhook/stripe) as a backup.
- NOTE: current prod bookings (e.g. ZK-3YRIQ, €3 Standard Car test) lack destLat/destLng (deployed frontend predates coords change) — coord fallback handles them.

### Session Sep 12, 2026 (cont.) — Prod test of QR flow: FOUND + FIXED empty-env creds bug
- Tested live via GET https://www.zont.cab/api/kiosk/booking-status/{ref}: booking-status correctly detected 2 bookings as PAID via Stripe (ZK-3YRIQ, ZK-2U0SL, both €3) and 5 others as genuinely unpaid (abandoned) → not dispatched. Payment detection WORKS.
- BUT dispatch failed: dispatchError = "C# company login failed: 400". ROOT CAUSE: backend/.env has CSHARP_COMPANY_USERNAME= / CSHARP_COMPANY_PASSWORD= as EMPTY strings, and os.environ.get(key, default) returns "" (key exists) instead of the default → empty creds → C# /api/Login/company 400. (Kiosk /prices still works because it uses the PUBLIC /api/PreorderDistance/driverTypesTwo, no token.)
- FIX (kiosk.py): use `os.environ.get(KEY) or "Nandetiri1@gmail.com"` (empty → valid default) in dispatch_to_csharp AND _fetch_trips_price. Verified with .env loaded (empty creds): dispatch_to_csharp → login OK → addPrepaid 200 {auctionId:183} (text-address destination also accepted) → deleted.
- REDEPLOY REQUIRED. After redeploy: (1) new QR payments dispatch → auctions+Gmail; (2) recover the 2 paid tests by re-calling booking-status (retries 'paid_dispatch_failed' via the csharpDispatch $nin claim).

### Session Sep 13, 2026 — Self-service kiosk registration page /kiosk
- Requirement: page /kiosk with login + registration; hotels self-register (email, password, hotel name, address) → instant active kiosk at /kiosk/{auto-slug}. Reuses existing extranet accounts (hotel_users).
- Backend (hotel_portal.py): POST /api/hotel/auth/register (public, instant) — validates, rejects duplicate email, slugifies hotel name (unique in kiosk_hotels), creates kiosk_hotels {slug,name,address,lat,lng,destinations=POPULAR_DESTINATIONS} + hotels doc + hotel_users {…,kiosk_slug}. Reuses pwd_context (bcrypt) + JWT. Login now returns kiosk_slug.
- Frontend: new /pages/kiosk/KioskLanding.js (login/register tabs, Google PlacesAutocomplete for address→lat/lng), route /kiosk added in App.js (before /kiosk/:slug).
- VERIFIED on preview: register "Novotel Paris Test" → slug novotel-paris-test → login returns kiosk_slug → /api/kiosk/{slug} shows hotel+coords+6 dests. Page renders. Test data cleaned.
- DEPLOY REQUIRED for production. NOTE: pre-existing extranet accounts created before this (e.g. admin@bristol.fr) have no kiosk_slug → /kiosk login shows "no kiosk associated"; bristol is still reachable directly at /kiosk/bristol. To make an old account redirect, set kiosk_slug on its hotel_users doc.

## [2026-06] Analyse SEO/GEO + corrections (basée sur Google Search Console)
Diagnostic GSC: pages fortes impressions / mauvaise position (page 2): /vtc-7-places (725 impr, pos 15), /paris-airport-transfer (173 impr, pos 17.7), /disneyland-paris-transfer (pos 11.8). Homepage pos 4.6.

Problème majeur trouvé: AUCUN accent dans le contenu FR ("Prive","Aeroport","Reservez"...) → mauvais pour SEO FR + image premium.

Appliqué et VÉRIFIÉ (preview):
- Accents français restaurés sur VTC7Places.js (fr) et ParisAirportTransfer.js (fr) — tout le contenu visible + meta.
- Ajout champ `h1` propre (sans "| Zont.cab") + `title` raccourci (<60c) + `metaDescription` sur ces 2 pages.
- Schémas JSON-LD `Organization` + `BreadcrumbList` ajoutés dans composant partagé CityTransferPage.js → s'applique à TOUTES les pages services d'un coup.
- Rendu vérifié par screenshot: H1 = "Taxi / VTC 7 Places avec Chauffeur Privé en Île-de-France", accents OK.

BACKLOG SEO/GEO (non fait):
- P1: Restaurer accents FR sur les ~22 autres pages (services/villes/blog FR).
- P1: Enrichir contenu + FAQ sur /vtc-7-places et /paris-airport-transfer pour sortir de la page 2.
- P2: Blocs FAQ + schéma FAQPage sur toutes les pages (SEO + GEO/ChatGPT).
- P2: Pré-rendu (react-snap) pour indexation + lecture par IA (site actuellement 100% CSR).
- Externe (action user): Google Maps = réactiver billing Google Cloud (REQUEST_DENIED).

## [2026-06] Enrichissement SEO/GEO pages page-2 (FAQ)
Appliqué et VÉRIFIÉ (HTML rendu via crawler):
- Section FAQ ajoutée au composant partagé CityTransferPage.js (accordéon <details> natif, data-testid faq-section / faq-item-N), déclenchée par champ `c.faq`. Réutilisable sur toute page ayant `faq`.
- Schéma JSON-LD `FAQPage` injecté conditionnellement (spread dans jsonLd) → rich results Google + réponses IA (GEO).
- Contenu FAQ FR + EN (6 Q/R chacune, avec prix et faits concrets) ajouté à:
  - VTC7Places.js (/vtc-7-places FR + /vtc-7-seats EN)
  - ParisAirportTransfer.js (/transfert-aeroport-paris FR + /paris-airport-transfer EN)
- Vérifié: 6 items FAQ rendus, accents OK, H1 propre.

BACKLOG restant:
- Ajouter `faq` (et accents FR) aux ~22 autres pages services/villes.
- FAQ en RU/HY/ES sur ces 2 pages si besoin.
- Pré-rendu react-snap (site CSR).
- Externe: Google Maps billing (user).

## [2026-06] FAQ sur toutes les pages + accents FR aéroports + Disneyland
Appliqué et VÉRIFIÉ (rendu crawler):
- NOUVEAU générateur de FAQ localisé: /app/frontend/src/utils/faqContent.js (buildFaq + faqHeading). 5 langues (fr/en/ru/es/hy). Génère 6 Q/R par page à partir des vrais trajets/prix de la page (question prix dynamique). 
- Câblé dans CityTransferPage.js: faqList = c.faq explicite OU buildFaq(c, language). => FAQ + schéma FAQPage désormais sur les 24 pages CityTransferPage automatiquement.
- Vérifié sur /transfert-aeroport-nice: FAQ affichée avec prix réels Nice (Monaco 65€, Cannes 75€).
- Tâche 3 (RU/ES FAQ sur vtc-7 et paris): résolue automatiquement via le générateur (ces pages n'avaient faq explicite qu'en fr/en).
- Accents FR corrigés + enrichissement: DisneylandParis.js (fr + meetDriver EN/FR), CDG.js, Orly.js, Beauvais.js (blocs fr complets ré-accentués, + metaDescription).

RESTANT (backlog):
- Accents FR sur les ~14 autres pages villes/gares: Barcelona, Berlin, Milan, Munich, Rome, Cannes, Monaco, Nice, Yerevan, Alicante, GareDuNord, GareDeLyon, GareMontparnasse, GareSaintLazare, GareAusterlitz, ParisTrainStation (contenu FR encore sans accents). FAQ déjà couverte partout.
- Note: la Q2 du générateur FAQ cite les aéroports de Paris même sur pages Riviera (léger, acceptable).
- TÂCHE 4 NON FAITE — Pré-rendu (react-snap): changement de pipeline de build qui peut casser le déploiement et NON vérifiable en preview (preview = dev server). À faire en étape dédiée avec test du build de prod. Google exécute déjà le JS; bénéfice surtout pour crawlers IA.

## [2026-06] Historique recherches kiosk — étape d'abandon
Demande: voir à quel écran le client a abandonné (date/heure vs prix, etc.).
Implémenté et VÉRIFIÉ (curl + DB):
- backend/routes/kiosk.py: kiosk_searches stocke last_step + step_rank. Création = "date_time" (rank 1).
  - Nouvel endpoint POST /api/kiosk/search-step {searchId, step} — avance uniquement (ne régresse jamais, garde par step_rank $lt). Ranks: date_time1, vehicle2, customer_info3, payment4, booked5.
  - _record_paid_side_effects: booked => last_step="booked", step_rank=5.
- frontend KioskPage.js: useEffect appelle /search-step quand step passe à 2 (vehicle), 3 (customer_info), 4 (payment).
- admin KioskSearchHistory.js: nouvelle colonne "Abandon à l'étape" (StepPill coloré): Écran date/heure (gris), Écran des prix (bleu), Infos client (indigo), Écran paiement (orange). Réservé/anciens enregistrements => "—".
- Vérif curl: étape progresse date_time→vehicle→payment, retour arrière n'abaisse pas le rank.
- Note: s'applique aux NOUVELLES recherches; anciens enregistrements (sans last_step) affichent "—".

## [2026-06] Prix fixes réels (API +15%) + cartes trajets avec photos sur pages villes
Demande: afficher les nouveaux prix fixes (live C# +15%, arrondis entiers) avec photos sur les pages aéroport/villes, pattern CityTransferPage.
Implémenté et VÉRIFIÉ (HTML rendu + compile clean):
- CityTransferPage.js: nouvelle prop `routeImages` (par index). Section Popular Routes rend des CARTES avec photo + "From X€" quand image dispo (route.image || routeImgs[i]), sinon liste texte (rétrocompatible). scrollToBooking conservé.
- Prix + routes mis à jour (en/fr/ru, +es Yerevan) + vehiclesPrices.sedan + routeImages sur: Rome(90/94/214/90), Barcelona(48/48/61/78/51 Camp Nou), Milan(127/106/143/104), Munich(115/108/122), Berlin(75/69/104), Alicante(31/31/36/114), Yerevan(8/20), Monaco(109, 1 trajet NCE→Monaco). Valeurs exactes (décimales) en commentaire au-dessus de routeImages.
- NOUVELLE page Strasbourg.js (en/fr/ru/hy) + 4 trajets (40/40/97/138) + routeImages. Routes App.js: /strasbourg-airport-transfer, /transfert-aeroport-strasbourg, /taksi-iz-aeroporta-strasburg, /strasburg-odanavakayani-transfer.
- Home.js popularDest: prix MAJ (Barcelona 48, Rome 90, Berlin 75, Monaco 109) + ajout Milan/Munich/Alicante/Yerevan/Strasbourg (URLs multilingues enregistrées).
- Images: Unsplash/Pexels optimisées (w=800), lazy-loaded, pertinentes par destination.
- Vérifié rendu: Strasbourg + Barcelona (Camp Nou From 51€ OK, photos OK, hreflang fr/ru/hy OK). Backend non modifié.
Note: FAQ Q2 du générateur cite encore "aéroports de Paris" sur pages non-Paris (mineur, backlog).

## [2026-06] Fix "no Strasbourg" + alignement prix page Destinations
Cause: page Strasbourg routée mais absente de data/cities.js (source de /countries + sitemap).
Corrigé et VÉRIFIÉ (crawl):
- data/cities.js: ajout entrée `strasbourg` (France) + 'strasbourg' dans countriesList France.
- public/sitemap.xml: ajout bloc Strasbourg (en/fr/ru/hy + x-default).
- Countries.js: ajout image Strasbourg + startingPrices alignés sur nouveaux prix (rome 90, milan 127, barcelona 48, berlin 75, munich 115, alicante 31, yerevan 8, monaco 109, strasbourg 40).
- Vérifié /countries: Strasbourg sous France (From 40€, photo cathédrale), tous prix MAJ.
Note: libellé "16 cities" dans l'en-tête Countries reste statique (mineur).

## [2026-06] Fix i18n ES + duplication Google (hreflang)
Symptôme user: /taksi-iz-aeroporta-barselona (et autres) ne passent pas en ES; GSC signale duplication.
Causes trouvées:
1. hreflang CityTransferPage: ligne `es` retombait sur l'URL EN quand seoUrls.es absent → URL anglaise déclarée comme EN+ES+x-default = conflit/duplication.
2. 9 villes avaient des pages ES dédiées (pages/es/Es*.js via EsServicePage, routées /es/traslado-aeropuerto-*) MAIS n'étaient pas liées: leur CityTransferPage seoUrls n'avait pas `es` → le sélecteur de langue ne naviguait jamais vers la vraie page ES (affichait l'anglais), et hreflang non bidirectionnel.
Corrigé et VÉRIFIÉ (rendu RU=russe, ES=espagnol, compile clean):
- CityTransferPage.js: hreflang dynamique (seules langues réellement présentes dans seoUrls) + x-default=en. Switch langue: si seoUrls[lang] absent et lang=es → redirige /es (fallback sûr).
- Ajout `es` aux seoUrls de 9 villes: Barcelona, Rome, Milan, Berlin, Munich, Alicante, Monaco, Nice, Cannes (pointant vers /es/traslado-aeropuerto-*).
- EsServicePage.js: nouvelle prop `alt` → hreflang complet vers en/fr/ru/hy (return-tags bidirectionnels) + x-default=en.
- 9 pages Es*.js: passent `alt={{en,fr,ru,hy}}`.
Résultat: chaque URL = une langue cohérente, hreflang bidirectionnel complet → résout la duplication GSC. Switch GB→ES sur ces villes amène désormais à la vraie page espagnole.
Note: Google doit re-crawler (quelques semaines) pour lever les duplicatas.

## [2026-06] Fix pages ES cassées (image hero manquante + "Services" non traduit)
Symptôme: grande zone blanche sous le hero sur les pages ES (ex. /es/traslado-aeropuerto-barcelona).
Cause: EsServicePage rend <img src={heroImage} h-96>; les fichiers /images/<ville>-airport-transfer.webp N'EXISTAIENT PAS → image cassée = bloc blanc + icône cassée (préexistant, visible depuis le lien des pages ES).
Corrigé et VÉRIFIÉ (screenshot ES Barcelona OK: image chargée + "Servicios"):
- heroImage remplacé par photos distantes fiables (Unsplash/Pexels, w=1200) sur 14 pages ES: Barcelona, Rome, Milan, Berlin, Munich, Alicante, Monaco, Nice, Cannes + EsGareAusterlitz/DeLyon/DuNord/Montparnasse/SaintLazare.
- Header.js: "Services" traduit (Servicios ES / Услуги RU / Ծառայություններ HY) desktop + mobile.
Compile clean.

## [2026-11] Lien de réservation partenaire hôtel + commissions (MVP Phase 1) — DONE & TESTÉ
Objectif: chaque hôtel a un lien partageable /p/{kiosk_slug}. Un client qui démarre une réservation via ce lien est attribué à l'hôtel côté serveur et une commission est enregistrée. Choix user validés: Phase 1 d'abord; Validée AUTO depuis statut C#; base commission = montant total payé; taux SPÉCIFIQUE par lien (override du commission_rate hôtel); réutilise le kiosk_slug existant.
Règle anti-fraude (implémentée): l'attribution vient UNIQUEMENT d'un jeton signé né au clic du lien. L'adresse de l'hôtel seule ne déclenche jamais de commission (réservation directe sans jeton = aucune commission). First-touch, non rétroactif, 1 commission/réservation (idempotent).

Architecture:
- Les réservations web payées NE SONT PAS dans notre Mongo (vont au C# api.zont.cab via proxy POST /api/proxy/booking/create). Point de capture serveur = ce proxy: il retire `referralToken` du body AVANT de forwarder au C#, puis appelle record_referral_booking() avec la réf d'auction C# renvoyée.
- Nouvelle collection `db.referral_bookings`: {id, hotel_id, hotel_slug, hotel_name, origin:'partner_link', csharp_auction_id, client_email, pickup/dropoff_address, start_date, amount, client_price, commission_base:'total_paid', commission_rate (snapshot), commission_amount, status (pending|validated|cancelled|paid), csharp_status, payout, token_jti, history[]}.
- Champs ajoutés sur db.hotels: partner_link_enabled (def true), partner_link_rate (def = commission_rate).
- Index uniques partiels: csharp_auction_id (number), token_jti (string) → idempotence même en concurrence (DuplicateKeyError ignoré).
- Transitions serveur (409 sinon): pending→{validated,cancelled}; validated→{cancelled,paid}; cancelled/paid terminaux. Taux borné 0–100.
- Sync auto: cron /api/cron/referral-sync (30 min, .emergent/crons.yml, auth Bearer WEBHOOK_CRON_SECRET dans backend/.env). sync_referral_statuses() lit GET /api/Auction/company/auctions/{aid} (token société) → mappe statut C# (completed/finished/done/ended→validated, cancelled/declined/…→cancelled) + met à jour amount/commission. Forward-only (respecte les transitions).

Endpoints (backend/routes/hotel_referral.py, prefix /api):
- Public: GET /referral/link/{slug} → {enabled, hotelName, destination, token}.
- Admin: GET/PUT /admin/hotels/{id}/partner-link; GET /admin/referrals?hotel_id&origin&status; POST /admin/referrals/{id}/{validate|cancel|payout}; PUT /admin/referrals/{id} (correction, historisée).
- Hôtel: GET /hotel/referrals (isolation stricte par hotel_id).
- Cron: POST /cron/referral-sync.

Frontend:
- /p/:slug → PartnerLink.js (stocke referral dans BookingContext, préremplit destination, redirige /).
- Home.js: prefill drop-off + bannière "Réservez votre transfert vers {hôtel}" (data-testid=referral-banner).
- Checkout.js: ajoute referralToken au payload de réservation.
- Admin: HotelDetail → section "Lien de réservation partenaire" (URL, copier, prévisualiser, toggle actif, taux); page /admin/partner-commissions (AdminReferrals.js, nav "Commissions Liens") filtres + actions valider/annuler/verser + totaux.
- Hôtel extranet: /hotel/referrals (HotelReferrals.js, nav "Lien partenaire") liste + totaux.

Testé: testing_agent 21/21 backend PASS + flows frontend. 3 edge bugs trouvés ET corrigés+revérifiés (race idempotence→1 ligne, garde-fous transitions 409, taux 0–100). BookingContext a un nouveau champ `referral`.
À FAIRE (Phase 2 / backlog): vérifier le mapping exact des statuts C# avec de vraies données (ajuster _VALIDATED_STATES/_CANCELLED_STATES); proratisation remboursements partiels; versements automatisés; tester une VRAIE réservation payée de bout en bout (non testable sans paiement réel). Harmonisation séparée en attente: nb villes (16 vs 120+), capacité Van 7 places (carte=6 pax), note 4,5 vs 4,9.

## [2026-11] Harmonisation infos — nombre de villes + capacité Van 7 places — DONE
Demande user: afficher le NOMBRE RÉEL de destinations partout (au lieu du mélange "16" sur l'accueil et "120+"/"16+" ailleurs), et corriger la capacité du Van 7 places (carte affichait 6 passagers sous un nom "Van 7 Places").
Décisions: nombre réel vérifié = **19 destinations** (source: src/data/cities.js → countriesList : France 11, Monaco 1, Allemagne 2, Italie 2, Espagne 2, Arménie 1). Van 7 places = **7 passagers / 6 bagages** (défaut assumé, user a skip).

Fait (compile clean; vérifié via bundle servi à l'edge preview = contient "19 cities"/"cities: '19'"):
- Remplacé TOUTES les mentions de comptage de villes 16 / 120 / 16+ / 120+ par **19** sur ~30 fichiers, 5 langues (EN/FR/RU/HY/ES): Home (heroSub+stats+seoDesc+CTA), translations/index.js, Countries, Help, BecomeClient, BecomeDriver, About, Partners, LookingForPartners, ParisAirportTransfer, DisneylandParis, VTC7/VTC8, tous les b2b (TourOperators, TravelAgencies, TourismAgencies, EventAgencies, BusinessPartners, ConciergeServices, CorporateClients), pages villes (otherCitiesTitle HY), etc.
- PRESERVÉ volontairement (NE PAS confondre avec villes): stats "Max Passengers/Max Per Vehicle/Passagers Max/Макс пассажиров/1-16 Passengers-Vehicle" = 16 (capacité véhicule), prix (minibus 160, Beauvais 280...), autoroute "A16", festival "16 jours/days", 166 mètres Alicante.
- ⚠️ Le "19" est codé en dur dans les textes marketing (5 langues). À METTRE À JOUR si on ajoute/retire une destination (modifier aussi src/data/cities.js + sitemap + App.js routes).

Van 7 places: capacité de carte rendue par CityTransferPage.js (ligne 150) était hardcodée passengers:6. Rendue per-page: `passengers: c.minivanPax ?? 6, luggage: c.minivanLuggage ?? 6`. ParisAirportTransfer.js et services/VTC7Places.js: `Object.values(content).forEach(v => {v.minivanPax=7; v.minivanLuggage=6})` + desc HY/ES alignés sur 7. Les autres pages villes (Rome, Nice...) gardent 6 (cohérent avec leur texte "jusqu'à 6"). VÉRIFIÉ screenshot page Paris: "Van 7 Places — Mercedes Classe V, jusqu'à 7 passagers — 7 Passagers / 6 Bagages".

Reste non traité (user a reporté à plus tard): note 4,5 vs 4,9 (page V-Class premium).
