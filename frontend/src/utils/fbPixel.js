/**
 * Facebook Pixel + Conversions API helper
 * Fires browser-side Pixel events AND mirrors them server-side for deduplication.
 */
const API = process.env.REACT_APP_BACKEND_URL;

// ---- helpers ----
const genId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const getCookie = (name) => {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : '';
};

const fbq = (...args) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args);
  }
};

/** Send event server-side (fire-and-forget, no await) */
const sendServer = (payload) => {
  try {
    fetch(`${API}/api/fb/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        fbp: getCookie('_fbp'),
        fbc: getCookie('_fbc'),
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
};

// ---- public API ----

/** SPA page-view (call on route changes) */
export const trackPageView = () => {
  const eventId = genId();
  fbq('track', 'PageView', {}, { eventID: eventId });
  sendServer({ event_name: 'PageView', event_id: eventId, event_source_url: window.location.href });
};

/** User searches for a transfer */
export const trackSearch = ({ pickup, dropoff, date }) => {
  const eventId = genId();
  const searchStr = `${pickup} → ${dropoff}`;
  fbq('track', 'Search', {
    search_string: searchStr,
    content_category: 'Transfer',
    ...(date && { checkin_date: date }),
  }, { eventID: eventId });
  sendServer({
    event_name: 'Search',
    event_id: eventId,
    search_string: searchStr,
    content_category: 'Transfer',
    event_source_url: window.location.href,
  });
};

/** User views a vehicle on CarSelection */
export const trackViewContent = ({ vehicle, price, currency = 'EUR' }) => {
  const eventId = genId();
  fbq('track', 'ViewContent', {
    content_name: vehicle,
    content_category: 'Vehicle',
    value: price,
    currency,
  }, { eventID: eventId });
  sendServer({
    event_name: 'ViewContent',
    event_id: eventId,
    content_name: vehicle,
    content_category: 'Vehicle',
    value: price,
    currency,
    event_source_url: window.location.href,
  });
};

/** User lands on Checkout page */
export const trackInitiateCheckout = ({ price, currency = 'EUR', vehicle }) => {
  const eventId = genId();
  fbq('track', 'InitiateCheckout', {
    value: price,
    currency,
    content_name: vehicle,
    num_items: 1,
  }, { eventID: eventId });
  sendServer({
    event_name: 'InitiateCheckout',
    event_id: eventId,
    value: price,
    currency,
    content_name: vehicle,
    num_items: 1,
    event_source_url: window.location.href,
  });
};

/** Booking confirmed (Purchase) */
export const trackPurchase = ({ price, currency = 'EUR', bookingId }) => {
  const eventId = genId();
  fbq('track', 'Purchase', {
    value: price,
    currency,
    content_name: 'Airport Transfer',
    content_type: 'product',
    ...(bookingId && { order_id: String(bookingId) }),
  }, { eventID: eventId });
  sendServer({
    event_name: 'Purchase',
    event_id: eventId,
    value: price,
    currency,
    content_name: 'Airport Transfer',
    order_id: bookingId ? String(bookingId) : '',
    event_source_url: window.location.href,
  });
};

/** B2B form submitted */
export const trackLead = ({ source }) => {
  const eventId = genId();
  fbq('track', 'Lead', {
    content_name: source || 'B2B Form',
    content_category: 'Lead',
  }, { eventID: eventId });
  sendServer({
    event_name: 'Lead',
    event_id: eventId,
    content_name: source || 'B2B Form',
    content_category: 'Lead',
    event_source_url: window.location.href,
  });
};

/** Contact / become-driver form */
export const trackCompleteRegistration = ({ type }) => {
  const eventId = genId();
  fbq('track', 'CompleteRegistration', {
    content_name: type || 'Driver',
  }, { eventID: eventId });
  sendServer({
    event_name: 'CompleteRegistration',
    event_id: eventId,
    content_name: type || 'Driver',
    event_source_url: window.location.href,
  });
};
