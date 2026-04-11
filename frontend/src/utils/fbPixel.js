/**
 * Facebook Pixel helper — fire events from React components.
 * Base pixel (PageView) is already in index.html.
 * This module provides typed helpers for conversion events.
 */

const fbq = (...args) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args);
  }
};

/** SPA page-view (call on route changes) */
export const trackPageView = () => fbq('track', 'PageView');

/** User searches for a transfer (Home → click "Search") */
export const trackSearch = ({ pickup, dropoff, date }) =>
  fbq('track', 'Search', {
    search_string: `${pickup} → ${dropoff}`,
    content_category: 'Transfer',
    ...(date && { checkin_date: date }),
  });

/** User views a vehicle on CarSelection */
export const trackViewContent = ({ vehicle, price, currency = 'EUR' }) =>
  fbq('track', 'ViewContent', {
    content_name: vehicle,
    content_category: 'Vehicle',
    value: price,
    currency,
  });

/** User lands on Checkout page */
export const trackInitiateCheckout = ({ price, currency = 'EUR', vehicle }) =>
  fbq('track', 'InitiateCheckout', {
    value: price,
    currency,
    content_name: vehicle,
    num_items: 1,
  });

/** Booking confirmed (Purchase) */
export const trackPurchase = ({ price, currency = 'EUR', bookingId }) =>
  fbq('track', 'Purchase', {
    value: price,
    currency,
    content_name: 'Airport Transfer',
    content_type: 'product',
    ...(bookingId && { order_id: bookingId }),
  });

/** B2B form submitted */
export const trackLead = ({ source }) =>
  fbq('track', 'Lead', {
    content_name: source || 'B2B Form',
    content_category: 'Lead',
  });

/** Contact / become-driver form */
export const trackCompleteRegistration = ({ type }) =>
  fbq('track', 'CompleteRegistration', {
    content_name: type || 'Driver',
  });
