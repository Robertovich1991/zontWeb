const API = process.env.REACT_APP_BACKEND_URL;

export const transferService = {
  /**
   * Calculate pricing between pickup and dropoff coordinates.
   * Returns array of vehicle types with pricing from C# backend.
   */
  calculatePrice: async (pickupCoords, dropoffCoords) => {
    const resp = await fetch(`${API}/api/proxy/distance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coordinates: [
          { latitude: pickupCoords.latitude, longitude: pickupCoords.longitude },
          { latitude: dropoffCoords.latitude, longitude: dropoffCoords.longitude },
        ],
        radius: 50,
      }),
    });
    if (!resp.ok) throw new Error('Failed to calculate price');
    return resp.json();
  },

  /**
   * Get fixed preorder pricing between two points.
   */
  calculatePreorderPrice: async (pickupCoords, dropoffCoords) => {
    const resp = await fetch(`${API}/api/proxy/preorder-distance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coordinates: [
          { latitude: pickupCoords.latitude, longitude: pickupCoords.longitude },
          { latitude: dropoffCoords.latitude, longitude: dropoffCoords.longitude },
        ],
      }),
    });
    if (!resp.ok) throw new Error('Failed to calculate preorder price');
    return resp.json();
  },

  /**
   * Get vehicle image URL from C# backend.
   */
  getVehicleImageUrl: (imagePath) => {
    if (!imagePath) return null;
    return `${API}/api/proxy/vehicle-image/${imagePath}`;
  },

  /**
   * Get available trip types.
   */
  getTripTypes: async () => {
    const resp = await fetch(`${API}/api/proxy/trip-types`);
    if (!resp.ok) throw new Error('Failed to fetch trip types');
    return resp.json();
  },
};

export const authService = {
  login: async (credentials) => {
    const token = localStorage.getItem('auth_token');
    return { token };
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default transferService;
