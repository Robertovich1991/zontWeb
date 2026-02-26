import axios from 'axios';

// Configuration de l'API C# - à mettre à jour avec l'URL réelle
const CSHARP_API_URL = process.env.REACT_APP_CSHARP_API_URL || 'https://api.zont.cab';

const apiClient = axios.create({
  baseURL: CSHARP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification si disponible
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Services API - À connecter au backend C# plus tard
export const rideService = {
  // Rechercher des courses disponibles
  searchRides: async (data) => {
    try {
      // TODO: Connecter à l'endpoint C# réel
      const response = await apiClient.post('/rides/search', data);
      return response.data;
    } catch (error) {
      console.error('Erreur recherche de courses:', error);
      throw error;
    }
  },

  // Créer une réservation
  createBooking: async (bookingData) => {
    try {
      // TODO: Connecter à l'endpoint C# réel
      const response = await apiClient.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Erreur création réservation:', error);
      throw error;
    }
  },
};

export const locationService = {
  // Récupérer la liste des pays
  getCountries: async () => {
    try {
      // TODO: Connecter à l'endpoint C# réel
      const response = await apiClient.get('/locations/countries');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération pays:', error);
      throw error;
    }
  },

  // Récupérer les villes d'un pays
  getCities: async (countryCode) => {
    try {
      // TODO: Connecter à l'endpoint C# réel
      const response = await apiClient.get(`/locations/cities/${countryCode}`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération villes:', error);
      throw error;
    }
  },
};

export const authService = {
  // Connexion
  login: async (credentials) => {
    try {
      // TODO: Connecter à l'endpoint C# réel
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Erreur connexion:', error);
      throw error;
    }
  },

  // Inscription
  register: async (userData) => {
    try {
      // TODO: Connecter à l'endpoint C# réel
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur inscription:', error);
      throw error;
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export const driverService = {
  // Inscription driver
  registerDriver: async (driverData) => {
    try {
      // TODO: Connecter à l'endpoint C# réel
      const response = await apiClient.post('/drivers/register', driverData);
      return response.data;
    } catch (error) {
      console.error('Erreur inscription driver:', error);
      throw error;
    }
  },
};

export default apiClient;
