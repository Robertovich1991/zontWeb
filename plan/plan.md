# API Réservations « Comfort Cars »

Une API REST sécurisée qui permet à un système externe de récupérer les réservations « Comfort Cars » au format JSON.
La source est la liste des réservations du panneau admin (`admin.zont.cab/#/admin/auctions`), lue avec le compte admin, puis filtrée pour ne renvoyer que les courses rattachées à Comfort Cars.

## Pour qui
- Le système ou l'outil externe de Comfort Cars (logiciel métier, tableur connecté, intégration partenaire) qui a besoin de lire ses réservations automatiquement, sans se connecter au panneau admin.
- Un développeur côté Comfort Cars qui branche cette API sur son propre système.

## Fonctionnalités et expérience
- **Récupérer la liste des réservations Comfort Cars** : les mêmes courses que celles visibles dans le panneau admin « auctions », mais filtrées sur Comfort Cars uniquement (les courses des autres sociétés ne sont jamais renvoyées).
- **Filtrer par plage de dates** (du / au) sur la date de la course.
- **Filtrer par statut** (par ex. en attente, confirmée, assignée, terminée, annulée).
- **Pagination** pour gérer de gros volumes (numéro de page + taille de page, avec le total renvoyé).
- **Récupérer une seule réservation par son identifiant** (uniquement si elle appartient à Comfort Cars).
- **Chaque réponse est en JSON** avec une structure stable et documentée : identifiant, statut, date et heure, adresse de départ, adresse d'arrivée, type de véhicule, type de trajet, montant, informations client (nom, téléphone), chauffeur assigné le cas échéant, société, commentaires.
- **Accès protégé par une clé secrète** : chaque appel doit présenter une clé API dans l'en-tête ; sans clé valide, l'accès est refusé.
- **Un document de référence de l'API** est fourni : URL de base, liste des paramètres, exemples d'appel et exemple de réponse, liste des codes d'erreur.

## Parcours d'utilisation (système appelant)
1. Comfort Cars reçoit une **clé API** (générée et communiquée en privé) et l'URL de base.
2. Le système externe appelle l'URL de la liste des réservations en envoyant la clé dans l'en-tête, avec éventuellement des filtres (dates, statut, page).
3. En coulisses, l'API se connecte au système de dispatch avec le **compte admin**, lit la liste des réservations, **garde seulement celles de Comfort Cars**, puis renvoie un JSON : le tableau des réservations + le nombre total et le nombre de pages.
4. Pour les détails d'une course précise, le système appelle l'URL avec l'identifiant de la réservation et reçoit l'objet complet (ou « non trouvé » si la course n'appartient pas à Comfort Cars).
5. En cas de clé absente ou invalide, l'API répond par une erreur d'authentification claire.

## Convention et « ressenti » de l'API
- **Style REST, réponses JSON** propres et prévisibles, mêmes noms de champs partout.
- **Messages d'erreur explicites** et codes standard (non authentifié, non trouvé, paramètre invalide).
- **Valeurs de statut normalisées** et documentées, pour que l'intégrateur sache exactement ce qu'il peut recevoir.
- **Pagination bornée** (taille de page minimale/maximale) pour protéger les performances.
- Pensée pour être **simple à brancher** : un seul en-tête à fournir, des paramètres optionnels, une réponse auto-descriptive.

## Phases de mise en œuvre

### Phase 1 — MVP (construite maintenant)
- Point d'accès **liste des réservations Comfort Cars** (lues via le compte admin, filtrées sur Comfort Cars) avec : filtre dates, filtre statut, pagination.
- Point d'accès **détail d'une réservation par identifiant** (restreint à Comfort Cars).
- **Protection par clé API** (clé secrète dans l'en-tête).
- Réponses **JSON normalisées** + gestion des erreurs.
- **Document de référence** de l'API (paramètres, exemples, erreurs).

### Phase 2 — Confort d'intégration (plus tard)
- Recherche texte (nom client, adresse, numéro de vol).
- Tri configurable et filtres supplémentaires (type de trajet, type de véhicule).
- Export CSV en option, en complément du JSON.
- Limitation de débit par clé et journal des appels.

### Phase 3 — Temps réel (plus tard)
- Notifications « push » (webhook) vers Comfort Cars à chaque nouvelle réservation Comfort Cars ou changement de statut, pour éviter d'interroger en boucle.
- Plusieurs clés API révocables et gestion fine des accès.

## Hypothèses
- La lecture des réservations se fait avec le **compte admin de `admin.zont.cab`** (qui voit toutes les courses), puis l'API **filtre pour ne garder que Comfort Cars**. Les identifiants admin sont conservés de façon sécurisée (jamais en clair dans le code).
- « Comfort Cars » est identifié parmi les réservations par **le nom (ou l'identifiant) de la société** porté par chaque course. La valeur exacte à faire correspondre (« Comfort Cars » ou son identifiant société) sera confirmée au moment de construire.
- Les réservations correspondent exactement à celles affichées dans le panneau admin « auctions » ; aucune donnée nouvelle n'est inventée, et les champs renvoyés reprennent ceux déjà disponibles (identifiant, statut, dates, adresses, montant, client, chauffeur, société, commentaires).
- La **clé API est générée côté Zont** puis transmise à Comfort Cars ; elle est conservée comme secret.
- L'API est en **lecture seule** (consulter, pas créer/modifier/supprimer).
- Le filtre de dates s'applique à la **date de la course**.
- Valeurs par défaut de pagination : **page 1, 50 résultats par page**, maximum 200 par page.
- Le mode de récupération de la liste admin dépend de ce que le système de dispatch expose (liste paginée ou parcours des identifiants) ; le résultat renvoyé reste le même pour l'appelant.
- L'appel réel aux données de dispatch **fonctionne depuis la production** (l'environnement de prévisualisation est bloqué par le pare-feu du système de dispatch) ; la validation complète se fera donc après publication.
