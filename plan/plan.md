# API Comfort Cars — ajout de la liste « Mes Réservations » (flotte)

Extension de l'API Comfort Cars en lecture seule pour exposer, sous la même clé `X-API-Key`, la liste « Mes Réservations » du compte flotte Comfort Cars (celle visible sur `/fleet/my-bookings`).
Aujourd'hui l'API ne renvoie que les courses du dispatch (« auctions ») ; cette liste-ci est une source différente que votre admin pourra désormais lire via un seul et même mécanisme d'accès.

## Pour qui
- Le développeur de l'application admin `admin.zont.cab` qui doit afficher les réservations propres de la flotte Comfort Cars.
- L'exploitant Zont qui configure, depuis l'admin Zont CMS, quel compte flotte correspond à Comfort Cars.

## Contexte (deux listes distinctes)
- **Courses dispatch (déjà en place)** : `GET /reservations` — les courses « auctions » attribuées à Comfort Cars.
- **Réservations flotte (objet de ce plan)** : les réservations créées/gérées par le compte flotte Comfort Cars (identité, trajet, prix, client, chauffeur, statut), aujourd'hui accessibles seulement après connexion au portail flotte.

## Fonctionnalités et expérience (Phase 1)
- **Nouveau point d'accès « réservations flotte »** dans l'API Comfort Cars, protégé par la **même clé `X-API-Key`**, renvoyant les réservations du compte flotte Comfort Cars.
- **Filtres** : plage de dates (du / au), **statut**, **type** (transfert / mise à disposition / excursion), et **recherche texte** (client, adresse, numéro de vol, chauffeur).
- **Pagination** identique au reste de l'API (numéro de page + taille, défaut 50, max 200, total renvoyé).
- **Réponse JSON normalisée** avec la même forme que l'endpoint existant (`data` + bloc `pagination`), pour une intégration homogène.
- **Réglage dans l'admin Zont CMS** (page « API Comfort Cars ») pour désigner **le compte flotte Comfort Cars** :
  - soit en collant son **identifiant de société**,
  - soit via un **assistant** : saisir une seule fois l'email + mot de passe du compte flotte Comfort Cars ; le système résout l'identifiant, l'enregistre et **n'enregistre pas** le mot de passe.
- **Message d'erreur clair** si le compte flotte n'est pas encore configuré (l'endpoint indique quoi faire plutôt que de renvoyer une liste vide ambiguë).
- **Documentation mise à jour** : référence écrite + référence en direct `GET /docs` + spécification OpenAPI, incluant le nouvel endpoint, ses filtres, ses statuts et un exemple de réponse.

## Parcours d'utilisation
1. L'exploitant ouvre l'admin Zont CMS → « API Comfort Cars » et configure le compte flotte Comfort Cars (identifiant collé, ou résolu via l'assistant).
2. Le système admin (via le backend, de préférence) appelle le nouvel endpoint avec l'en-tête `X-API-Key` et, au besoin, des filtres (dates, statut, type, recherche, page).
3. L'API renvoie en JSON les réservations flotte de Comfort Cars + le total et le nombre de pages.
4. En cas de clé absente/invalide → erreur d'authentification ; si le compte flotte n'est pas configuré → erreur explicite.

## Convention et « ressenti » de l'API
- **Même style, même clé, mêmes conventions** que l'endpoint des courses dispatch : en-tête unique, paramètres optionnels, réponse auto-descriptive.
- **Statuts documentés** propres à cette liste (nouvelle, affectée, envoyée Zont, en cours, terminée, annulée) et **types** documentés (transfert, mise à disposition, excursion).
- **Lecture seule** en Phase 1 (consulter, pas modifier).
- Même recommandation de sécurité : faire relayer l'appel par votre backend (la clé reste secrète) plutôt que de l'exposer dans le navigateur.

## Phases de mise en œuvre
- **Phase 1 — MVP (construite maintenant)** : nouvel endpoint « réservations flotte » protégé par `X-API-Key`, filtres (dates, statut, type, recherche) + pagination, réglage du compte flotte Comfort Cars dans l'admin (identifiant collé ou assistant de résolution sans stockage du mot de passe), erreurs claires, et documentation complète (écrite + `/docs` + OpenAPI). Lecture seule.
- **Phase 2 — confort d'intégration (plus tard)** : actions d'écriture optionnelles depuis l'API (affecter un chauffeur, envoyer vers Zont, annuler) si vous voulez piloter la flotte depuis votre admin ; export CSV ; tri configurable supplémentaire.
- **Phase 3 — temps réel & gouvernance (plus tard)** : notification webhook à chaque nouvelle réservation flotte ou changement de statut ; plusieurs clés révocables et journal des appels par clé.

## Hypothèses
- La nouvelle liste est **en lecture seule** en Phase 1 ; aucune réservation n'est créée/modifiée via l'API à ce stade.
- Le compte flotte « Comfort Cars » est **désigné par configuration dans l'admin** (email non fourni pour l'instant) ; tant qu'il n'est pas configuré, l'endpoint renvoie une erreur explicite au lieu d'une liste.
- La liste renvoyée correspond exactement à celle de `/fleet/my-bookings` pour ce compte (mêmes données : type, date/heure, adresses, client, chauffeur, prix, statut, note, numéro de vol) ; aucune donnée nouvelle n'est inventée.
- La **forme de réponse** suit l'API existante (`data` + `pagination`) pour rester cohérente, même si l'endpoint flotte actuel du portail utilise une forme légèrement différente.
- **Même clé `X-API-Key`** que les courses dispatch ; pas de clé séparée.
- Valeurs de pagination par défaut : page 1, 50 résultats, maximum 200.
- Recommandation inchangée : appel relayé par votre backend (clé non exposée au navigateur) ; l'appel direct reste techniquement possible mais déconseillé.
- Validation réelle des données après **déploiement en production** (l'environnement de prévisualisation est bloqué par le pare-feu du dispatch pour la partie « auctions » ; la partie flotte, elle, est lisible en base).
