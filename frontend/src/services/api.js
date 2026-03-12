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

  /**
   * Submit a booking to the C# backend with Stripe payment method.
   * Uses XMLHttpRequest to avoid 'body stream already read' issues with fetch + Stripe.js
   */
  submitBooking: (bookingData) => {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('auth_token');
      if (!token) return reject(new Error('Authentication required'));

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API}/api/proxy/booking/create`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.onload = () => {
        let data;
        try { data = JSON.parse(xhr.responseText); } catch { data = {}; }
        // If 3DS is required, return the data with clientSecret (don't reject)
        if (data?.requiresAction && data?.clientSecret) {
          resolve(data);
          return;
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          const detail = data?.detail;
          const errorMsg = detail?.invalidCard?.[0] || detail?.error || (typeof detail === 'string' ? detail : null) || data?.error || 'Booking failed';
          reject(new Error(errorMsg));
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(JSON.stringify(bookingData));
    });
  },
};

export const authService = {
  registerPhone: async (phone) => {
    const resp = await fetch(`${API}/api/proxy/auth/register-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await resp.json();
    if (!resp.ok) throw { response: { data } };
    return data;
  },

  verifyPhone: async (phoneNumber, verificationCode) => {
    const resp = await fetch(`${API}/api/proxy/auth/verify-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, verificationCode }),
    });
    const data = await resp.json();
    if (!resp.ok) throw { response: { data } };
    return data;
  },

  register: async (userData) => {
    const resp = await fetch(`${API}/api/proxy/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await resp.json();
    if (!resp.ok) throw { response: { data } };
    return data;
  },

  sendVerificationEmail: async (email) => {
    const resp = await fetch(`${API}/api/proxy/auth/send-verification?email=${encodeURIComponent(email)}`);
    const data = await resp.json();
    if (!resp.ok) throw { response: { data } };
    return data;
  },

  verifyCode: async (code) => {
    const resp = await fetch(`${API}/api/proxy/auth/verify/${encodeURIComponent(code)}`);
    const data = await resp.json();
    if (!resp.ok) throw { response: { data } };
    return data;
  },

  login: async (credentials) => {
    const resp = await fetch(`${API}/api/proxy/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: credentials.email, password: credentials.password }),
    });
    const data = await resp.json();
    if (!resp.ok) throw { response: { data } };
    localStorage.setItem('auth_token', data.accessToken);
    localStorage.setItem('user', JSON.stringify({ token: data.accessToken, roles: data.roles }));
    return { user: { token: data.accessToken, roles: data.roles }, token: data.accessToken };
  },

  forgotPassword: async (email) => {
    const resp = await fetch(`${API}/api/proxy/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await resp.json();
    if (!resp.ok) throw { response: { data } };
    return data;
  },

  resetPassword: async (forgotPasswordToken, newPassword) => {
    const resp = await fetch(`${API}/api/proxy/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ forgotPasswordToken, newPassword }),
    });
    const data = await resp.json();
    if (!resp.ok) throw { response: { data } };
    return data;
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
