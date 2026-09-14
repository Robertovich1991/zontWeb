// OpenAI Ads (OAIQ) conversion helper.
// The base pixel (oaiq init) is loaded in public/index.html — PRODUCTION ONLY, after
// cookie consent and deferred for performance, exactly like Meta/GA4/Google Ads.
// On preview/dev, window.oaiq is never defined, so every call here safely no-ops.

const FIRED_KEY = 'zont_oaiq_fired';

const alreadyFired = (id) => {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    return raw ? JSON.parse(raw).includes(id) : false;
  } catch { return false; }
};

const markFired = (id) => {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    const set = raw ? JSON.parse(raw) : [];
    set.push(id);
    // keep only the last 50 ids to avoid unbounded growth
    localStorage.setItem(FIRED_KEY, JSON.stringify(set.slice(-50)));
  } catch {}
};

/**
 * Fire the OpenAI "order_created" conversion.
 * MUST be called ONLY after a real, paid & confirmed booking.
 * - amount is sent in CENTS (e.g. 100 EUR -> 10000)
 * - event_id = booking id, so OpenAI de-duplicates repeated fires
 */
export const trackOrderCreated = ({ priceEuros, bookingId }) => {
  if (typeof window === 'undefined' || typeof window.oaiq !== 'function') return;
  const id = String(bookingId || '').trim();
  const euros = parseFloat(priceEuros);
  if (!id || !euros || Number.isNaN(euros)) return;
  if (alreadyFired(id)) return;
  const amountCents = Math.round(euros * 100);
  if (!amountCents) return;
  window.oaiq(
    'measure',
    'order_created',
    { type: 'contents', amount: amountCents, currency: 'EUR' },
    { event_id: id }
  );
  markFired(id);
};
