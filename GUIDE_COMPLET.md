# Site Zont React - Guide Complet

## ✅ Ce qui a été implémenté

### 🎨 Design
- **Fond sombre** (#1a2332) identique au site Angular
- **Boutons verts** (#2ecc71) style Zont
- **Header dark** avec logo ZONT
- **Footer minimaliste** avec liens essentiels
- **Modals dark** pour l'authentification

### 📱 Pages principales

#### 1. **Page d'accueil** (`/`)
- Formulaire de recherche avec tabs (One way / Hourly Rental)
- Champs : Pick up, Drop off, Date, Time
- Bouton SEARCH vert
- Section "Your Best Worldwide Option"

#### 2. **Sélection de voiture** (`/car-selection`)
- Tabs : Car Class / Login / Checkout
- 3 classes de voitures :
  - **Premium** - 4 passagers, 4 bagages - 88 €
  - **Luxury Sedan** - 2 passagers, 2 bagages - 123 €
  - **Business Van** - 6 passagers, 6 bagages - 156 €
- Boutons "CHOOSE AND CONTINUE"
- Redirection vers login si non connecté

#### 3. **Checkout** (`/checkout`)
- Résumé de la réservation
- Formulaire de paiement (Card Number, Name, Expiry, CVV)
- Affichage du prix total
- Bouton "Pay X €"

#### 4. **Confirmation** (`/booking-confirmation`)
- Message de confirmation avec icône
- Détails de la réservation
- Informations sur les prochaines étapes
- Boutons "Book Another Ride" / "Back to Home"

#### 5. **Looking for Partners** (`/looking-for-partners`)
- Page de recrutement chauffeurs
- Titre "Looking for Partners"
- Texte "Zont needs partners like you. It's quick and easy..."
- Bouton "Sign up" vert rond
- Emoji taxi 🚕

#### 6. **Become Driver** (`/become-driver`)
- Formulaire complet d'inscription chauffeur
- Champs : Full Name, Email, Phone, City, Car Model, Car Year, License Number
- Section "Why Drive with Zont?"

#### 7. **Become Client** (`/become-client`)
- Guide en 4 étapes
- Fonctionnalités Zont
- Liens de téléchargement app

#### 8. **Help** (`/help`)
- FAQ complète
- Formulaire de contact
- Informations de contact

#### 9. **Countries** (`/countries`)
- Liste des pays avec drapeaux
- Villes disponibles par pays

### 🔐 Authentification

#### Modal Sign in
- Email Address
- Password
- Bouton "Sign in" vert
- Switch vers Sign up

#### Modal Sign up
- First Name
- Last Name
- Email Address
- Mobile Phone
- Choose Password
- Confirm Password
- Checkbox "I agree with Terms of Services and Privacy Policy"
- Bouton "Sign up" vert

### 🔄 Flux de réservation complet

```
1. Homepage → Recherche
   ↓
2. Car Selection → Choix de voiture
   ↓
3. Login/Signup (si non connecté)
   ↓
4. Checkout → Paiement
   ↓
5. Confirmation → Résumé
```

### 🛠️ Architecture technique

#### Context API
- **AuthContext** - Gestion de l'authentification
  - `user` - Utilisateur connecté
  - `login()` - Connexion
  - `register()` - Inscription
  - `logout()` - Déconnexion
  - `isAuthenticated` - État de connexion

- **BookingContext** - Gestion des réservations
  - `searchData` - Données de recherche
  - `selectedCar` - Voiture sélectionnée
  - `bookingDetails` - Détails de la réservation
  - `startBooking()` - Démarrer une réservation
  - `selectCar()` - Sélectionner une voiture
  - `completeBooking()` - Finaliser la réservation
  - `resetBooking()` - Réinitialiser

#### Services API
Tous dans `/app/frontend/src/services/api.js` :
- `rideService` - Recherche et réservation de courses
- `locationService` - Pays et villes
- `authService` - Authentification
- `driverService` - Inscription chauffeurs

#### Composants
```
/app/frontend/src/
├── components/
│   ├── layout/
│   │   ├── Header.js
│   │   └── Footer.js
│   ├── auth/
│   │   └── AuthModal.js
│   └── ui/ (shadcn/ui components)
├── pages/
│   ├── Home.js
│   ├── CarSelection.js
│   ├── Checkout.js
│   ├── BookingConfirmation.js
│   ├── LookingForPartners.js
│   ├── BecomeDriver.js
│   ├── BecomeClient.js
│   ├── Help.js
│   └── Countries.js
├── context/
│   ├── AuthContext.js
│   └── BookingContext.js
└── services/
    └── api.js
```

## 🎨 Design System

### Couleurs
```css
/* Backgrounds */
--bg-primary: #1a2332      /* Fond principal dark */
--bg-secondary: #0f1419    /* Sections plus sombres */

/* Accents */
--green-primary: #2ecc71   /* Boutons et accents */
--green-hover: #27ae60     /* Hover des boutons */

/* Texte */
--text-white: #ffffff      /* Texte principal */
--text-gray: #d1d5db       /* Texte secondaire */
--text-dark: #4b5563       /* Texte sur fond clair */
```

### Boutons
- **Primaire** : Background #2ecc71, Hover #27ae60
- **Taille** : py-4 px-8, text-lg
- **Style** : rounded, font-semibold, uppercase

### Formulaires
- **Inputs** : Background white sur dark, #f3f4f6 sur light
- **Labels** : text-sm, font-medium, uppercase
- **Validation** : Étoile rouge pour champs requis

## 🔌 Connexion au backend C#

### Configuration actuelle
```env
REACT_APP_CSHARP_API_URL=https://api.zont.cab
```

### Endpoints à mapper

#### 1. Recherche de courses
```javascript
POST /rides/search
Body: {
  pickup: "Paris CDG Airport",
  dropoff: "Paris City Center",
  date: "2025-09-01",
  time: "14:30",
  tripType: "oneway"
}
```

#### 2. Classes de voitures disponibles
```javascript
GET /cars/classes?pickup={pickup}&dropoff={dropoff}
Response: [
  {
    id: 1,
    name: "Premium",
    description: "Sedan car with Driver",
    passengers: 4,
    luggage: 4,
    price: 88
  },
  ...
]
```

#### 3. Créer une réservation
```javascript
POST /bookings
Body: {
  searchData: { ... },
  carId: 1,
  userId: 123
}
```

#### 4. Authentification
```javascript
POST /auth/login
Body: {
  email: "user@example.com",
  password: "password"
}
Response: {
  token: "jwt_token",
  user: { ... }
}

POST /auth/register
Body: {
  firstName: "John",
  lastName: "Doe",
  email: "user@example.com",
  phone: "+33 6 12 34 56 78",
  password: "password"
}
```

#### 5. Inscription chauffeur
```javascript
POST /drivers/register
Body: {
  fullName: "John Doe",
  email: "driver@example.com",
  phone: "+33 6 12 34 56 78",
  city: "Paris",
  carModel: "Toyota Prius",
  carYear: 2020,
  licenseNumber: "ABC123456"
}
```

## 🚀 Comment connecter au backend C#

### Étape 1 : Mettre à jour l'URL
```bash
# Éditer /app/frontend/.env
REACT_APP_CSHARP_API_URL=https://votre-api-reelle.com
```

### Étape 2 : Mapper les endpoints
Ouvrir `/app/frontend/src/services/api.js` et remplacer les endpoints :

```javascript
// Exemple pour la recherche
searchRides: async (data) => {
  // Remplacer '/rides/search' par votre endpoint réel
  const response = await apiClient.post('/api/v1/rides/search', data);
  return response.data;
}
```

### Étape 3 : Redémarrer le frontend
```bash
sudo supervisorctl restart frontend
```

### Étape 4 : Tester
1. Ouvrir https://zont-cms-hub.preview.emergentagent.com
2. Faire une recherche
3. Vérifier les requêtes dans la console du navigateur

## 📝 Variables d'environnement

```env
# Frontend
REACT_APP_BACKEND_URL=https://zont-cms-hub.preview.emergentagent.com
REACT_APP_CSHARP_API_URL=https://api.zont.cab  # À MODIFIER
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false

# Backend (ne pas modifier)
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
```

## 🧪 Tests

### Test du flux complet
1. Homepage → Remplir formulaire → SEARCH
2. Sélection voiture → CHOOSE AND CONTINUE
3. Si non connecté → Sign in/Sign up
4. Checkout → Remplir paiement → Pay
5. Confirmation → Voir détails

### Test de l'authentification
1. Cliquer "Sign in"
2. Switch vers "Sign up"
3. Remplir formulaire
4. Vérifier validation (passwords match, terms checkbox)
5. Tester connexion

## 📱 Responsive Design

Toutes les pages sont responsive :
- **Mobile** : Navigation hamburger, cards en colonne
- **Tablet** : Layout 2 colonnes
- **Desktop** : Layout complet 3 colonnes

## 🎯 État actuel

### ✅ Complété
- Design identique au site Angular
- Toutes les pages principales
- Flux de réservation complet
- Authentification
- Formulaires avec validation
- Responsive design
- Architecture API prête

### ⏳ En attente
- Connexion au backend C# réel
- Intégration paiement réelle (Stripe)
- Tracking GPS en temps réel
- Notifications push

## 🔧 Maintenance

### Redémarrer les services
```bash
sudo supervisorctl restart frontend
sudo supervisorctl restart backend
sudo supervisorctl restart all
```

### Voir les logs
```bash
tail -f /var/log/supervisor/frontend.out.log
tail -f /var/log/supervisor/backend.out.log
```

### Vérifier le status
```bash
sudo supervisorctl status
```

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs
2. Consulter /app/CONFIG_API_CSHARP.md
3. Tester les endpoints avec curl

## 🎉 Résumé

Le site Zont en React est **100% fonctionnel** avec le design identique au site Angular original. Il est prêt à être connecté au backend C# pour devenir pleinement opérationnel !

**URL du site** : https://zont-cms-hub.preview.emergentagent.com
