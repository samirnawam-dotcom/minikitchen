// HTTP calls to the Mini Kitchen server. Every function resolves (never rejects) so callers can
// fall back to cached data when the visitor is offline.
//
// The static GitHub Pages build marks <html data-api="off">: there is no server, so calls are
// skipped and the site runs on the bundled menu and content (orders still go out via WhatsApp).
const API_ENABLED = document.documentElement.dataset.api !== 'off';

/** Public storefront state: { lbpRate, nextOrderSeq, siteConfig, menuCategories, … } or null. */
export async function fetchState() {
  if (!API_ENABLED) return null;
  try {
    const res = await fetch('/api/state', { cache: 'no-store' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** Records a website order/inquiry. Resolves to the saved order (as stored by the server) or null. */
export async function postOrder(entry) {
  if (!API_ENABLED) return null;
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      keepalive: true // let the request finish while WhatsApp opens in another tab
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.order ? data.order : null;
  } catch {
    return null;
  }
}

/** Public order status lookup (limited fields). Resolves to the order or null. */
export async function trackOrder(orderId) {
  if (!API_ENABLED) return null;
  try {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(orderId)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.order ? data.order : null;
  } catch {
    return null;
  }
}
