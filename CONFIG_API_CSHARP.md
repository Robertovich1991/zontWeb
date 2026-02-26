# Configuration API C# Backend

## Vue d'ensemble

Ce document explique comment connecter le site React Zont à votre backend C# existant.

## Configuration actuelle

### Variable d'environnement
L'URL de votre API C# est configurée dans `/app/frontend/.env` :
```
REACT_APP_CSHARP_API_URL=https://api.zont.cab
```

**⚠️ IMPORTANT : Remplacez cette URL par l'URL réelle de votre backend C#**

## Services API préparés

Tous les services API sont centralisés dans `/app/frontend/src/services/api.js`

### Services disponibles :

#### 1. **rideService** - Gestion des courses
- `searchRides(data)` - Rechercher des courses disponibles
- `createBooking(bookingData)` - Créer une réservation

#### 2. **locationService** - Gestion des localisations
- `getCountries()` - Récupérer la liste des pays
- `getCities(countryCode)` - Récupérer les villes d'un pays

#### 3. **authService** - Authentification
- `login(credentials)` - Connexion utilisateur
- `register(userData)` - Inscription utilisateur
- `logout()` - Déconnexion
- `getCurrentUser()` - Récupérer l'utilisateur actuel

#### 4. **driverService** - Gestion des chauffeurs
- `registerDriver(driverData)` - Inscription chauffeur

## Comment connecter au backend C# ?

### Étape 1 : Mettre à jour l'URL de l'API

Éditez `/app/frontend/.env` :
```bash
REACT_APP_CSHARP_API_URL=https://votre-api-reelle.com
```

### Étape 2 : Mapper les endpoints C#

Ouvrez `/app/frontend/src/services/api.js` et remplacez les endpoints par vos endpoints C# réels :

**Exemple pour la recherche de courses :**
```javascript
// AVANT (placeholder)
searchRides: async (data) => {
  const response = await apiClient.post('/rides/search', data);
  return response.data;
}

// APRÈS (avec votre endpoint réel)
searchRides: async (data) => {
  const response = await apiClient.post('/api/v1/rides/search', data);
  return response.data;
}
```

### Étape 3 : Gestion de l'authentification

Si votre API C# utilise JWT :
- Le token est automatiquement stocké dans `localStorage`
- Il est ajouté à chaque requête via l'intercepteur Axios
- Pas de modification nécessaire

Si votre API utilise un autre système :
- Modifiez l'intercepteur dans `api.js` ligne 14-24

### Étape 4 : Tester la connexion

1. Redémarrez le frontend :
```bash
sudo supervisorctl restart frontend
```

2. Testez les fonctionnalités dans l'interface

## Endpoints à mapper

Voici la liste des endpoints utilisés par l'application :

| Fonctionnalité | Méthode | Endpoint suggéré | Service |
|---------------|---------|------------------|---------|
| Recherche courses | POST | `/rides/search` | rideService |
| Créer réservation | POST | `/bookings` | rideService |
| Liste pays | GET | `/locations/countries` | locationService |
| Liste villes | GET | `/locations/cities/{code}` | locationService |
| Login | POST | `/auth/login` | authService |
| Register | POST | `/auth/register` | authService |
| Register Driver | POST | `/drivers/register` | driverService |

## Format des données

### Recherche de courses
```javascript
{
  "pickup": "Paris CDG Airport",
  "dropoff": "Paris City Center",
  "date": "2025-08-15",
  "time": "14:30",
  "tripType": "oneway" // ou "hourly"
}
```

### Inscription utilisateur
```javascript
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+33 6 12 34 56 78",
  "password": "securepassword"
}
```

### Connexion
```javascript
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Inscription chauffeur
```javascript
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+33 6 12 34 56 78",
  "city": "Paris",
  "carModel": "Toyota Prius",
  "carYear": "2020",
  "licenseNumber": "ABC123456",
  "message": "Optional message"
}
```

## CORS Configuration

Assurez-vous que votre backend C# autorise les requêtes depuis :
- `https://cab-native-preview.preview.emergentagent.com` (pendant le développement)
- Votre domaine de production

## Dépannage

### Erreur CORS
Si vous voyez des erreurs CORS dans la console :
1. Vérifiez la configuration CORS de votre backend C#
2. Assurez-vous que l'origine est autorisée
3. Vérifiez que les headers `Authorization` sont autorisés

### Erreur 401 Unauthorized
1. Vérifiez que le token est bien stocké dans localStorage
2. Vérifiez le format du header Authorization dans l'intercepteur
3. Testez votre endpoint d'authentification avec Postman

### Erreur de connexion
1. Vérifiez l'URL dans `.env`
2. Testez l'accessibilité de votre API C# avec curl :
```bash
curl https://votre-api-reelle.com/health
```

## Contact

Pour toute question, consultez la documentation de votre backend C# ou contactez l'équipe backend.
