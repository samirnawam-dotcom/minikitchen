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

/**
 * Public order status lookup (limited fields). The server needs proof the order is the visitor's:
 * the private `key` from their link or this browser, or the last 4 digits of the order's `phone`.
 * Resolves to { order } on success, { error, status } when the server says no, or null offline.
 */
export async function trackOrder(orderId, { key = '', phone = '' } = {}) {
  if (!API_ENABLED) return null;
  const query = new URLSearchParams();
  if (key) query.set('key', key);
  if (phone) query.set('phone', phone);
  try {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(orderId)}?${query}`, { cache: 'no-store' });
    const data = await res.json().catch(() => null);
    if (res.ok && data && data.order) return { order: data.order };
    return { error: (data && data.error) || '', status: res.status };
  } catch {
    return null;
  }
}
