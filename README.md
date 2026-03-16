# Site Web Zont - Version React

## 🚀 Vue d'ensemble

Ce projet est une reconstruction complète du site **Zont.cab** en React, prêt à être connecté à votre backend C# existant.

## ✨ Fonctionnalités implémentées

### Pages
- ✅ **Page d'accueil** - Hero section avec formulaire de recherche
- ✅ **Devenir Chauffeur** - Formulaire d'inscription chauffeur
- ✅ **Devenir Client** - Guide d'utilisation et téléchargement app
- ✅ **Aide** - FAQ et formulaire de contact
- ✅ **Pays** - Liste des pays et villes disponibles

### Composants
- ✅ Header avec navigation complète
- ✅ Footer avec liens sociaux
- ✅ Formulaire de recherche (One way / Hourly rental)
- ✅ Modal d'authentification (Sign in / Sign up)
- ✅ Système de gestion d'état avec Context API

### Services API
- ✅ Configuration centralisée pour connexion au backend C#
- ✅ Services prêts : rides, locations, auth, drivers
- ✅ Gestion automatique du token JWT
- ✅ Intercepteurs Axios configurés

## 🎨 Technologies utilisées

- **React 19** - Framework frontend
- **React Router** - Navigation
- **Axios** - Requêtes HTTP
- **Tailwind CSS** - Styling
- **Radix UI** - Composants UI
- **Lucide React** - Icônes

## 📦 Installation

Les dépendances sont déjà installées. Si besoin :

```bash
cd /app/frontend
yarn install
```

## 🔧 Configuration

### 1. Configurer l'URL de votre API C#

Éditez `/app/frontend/.env` et remplacez par l'URL de votre backend :

```env
REACT_APP_CSHARP_API_URL=https://votre-api-reelle.com
```

### 2. Mapper les endpoints

Ouvrez `/app/frontend/src/services/api.js` et mettez à jour les endpoints avec ceux de votre API C#.

**📄 Consultez `/app/CONFIG_API_CSHARP.md` pour le guide détaillé**

## 🚀 Lancement

Les services sont gérés par supervisor :

```bash
# Redémarrer tous les services
sudo supervisorctl restart all

# Redémarrer uniquement le frontend
sudo supervisorctl restart frontend

# Voir le statut
sudo supervisorctl status

# Voir les logs
tail -f /var/log/supervisor/frontend.out.log
```

## 🌐 Accès

Une fois lancé, le site est accessible à :
- **Frontend** : https://partner-hotel-portal.preview.emergentagent.com

## 📁 Structure du projet

```
/app/frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.js       # Navigation principale
│   │   │   └── Footer.js       # Pied de page
│   │   ├── auth/
│   │   │   └── AuthModal.js    # Modal connexion/inscription
│   │   ├── search/
│   │   │   └── SearchForm.js   # Formulaire recherche de courses
│   │   └── ui/                 # Composants UI réutilisables
│   ├── pages/
│   │   ├── Home.js             # Page d'accueil
│   │   ├── BecomeDriver.js     # Page inscription chauffeur
│   │   ├── BecomeClient.js     # Page devenir client
│   │   ├── Help.js             # Page aide & support
│   │   └── Countries.js        # Page liste pays
│   ├── services/
│   │   └── api.js              # Configuration API & services
│   ├── context/
│   │   └── AuthContext.js      # Gestion authentification
│   ├── App.js                  # Composant principal
│   └── index.js                # Point d'entrée
├── .env                        # Variables d'environnement
└── package.json               # Dépendances
```

## 🔗 Connexion au Backend C#

### Étapes à suivre :

1. **Obtenir les informations de votre API C#**
   - URL de base de l'API
   - Liste des endpoints disponibles
   - Format d'authentification (JWT, OAuth, etc.)

2. **Mettre à jour la configuration**
   - Modifier `REACT_APP_CSHARP_API_URL` dans `.env`
   - Mapper les endpoints dans `api.js`

3. **Tester la connexion**
   - Tester l'authentification
   - Tester la recherche de courses
   - Vérifier les autres fonctionnalités

## 📋 Endpoints à connecter

Consultez le fichier `/app/CONFIG_API_CSHARP.md` pour :
- Liste complète des endpoints nécessaires
- Format des données attendues
- Exemples de requêtes/réponses
- Guide de dépannage

## 🎯 Prochaines étapes

1. **Vous fournir les informations du backend C# :**
   - URL de l'API
   - Documentation des endpoints
   - Credentials si nécessaire

2. **Je mettrai à jour les services API** pour connecter au backend réel

3. **Tests et validation** de toutes les fonctionnalités

## 📝 Notes importantes

- ⚠️ Actuellement, les appels API sont des **placeholders**
- ⚠️ L'authentification fonctionne en **mode local** (localStorage)
- ✅ L'interface utilisateur est **100% fonctionnelle**
- ✅ Prêt à être connecté au backend C# réel

## 🆘 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs : `tail -f /var/log/supervisor/frontend.out.log`
2. Vérifiez la configuration dans `.env`
3. Consultez `/app/CONFIG_API_CSHARP.md`

## 📱 Caractéristiques

- ✅ Design responsive (mobile, tablet, desktop)
- ✅ Navigation fluide avec React Router
- ✅ Formulaires avec validation
- ✅ Gestion d'état globale (AuthContext)
- ✅ Toast notifications
- ✅ Composants réutilisables
- ✅ Code organisé et maintenable

---

**Développé pour Zont** 🚕
