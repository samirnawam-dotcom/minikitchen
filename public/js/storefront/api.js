// HTTP calls to the Mini Kitchen server. Every function resolves (never rejects) so callers can
// fall back to cached data when the visitor is offline.

/** Public storefront state: { lbpRate, nextOrderSeq, siteConfig, menuCategories, … } or null. */
export async function fetchState() {
  try {
    const res = await fetch('/api/state', { cache: 'no-store' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/** Records a website order/inquiry. Resolves to the saved order (as stored by the server) or null. */
export async function postOrder(entry) {
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
  try {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(orderId)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.order ? data.order : null;
  } catch {
    return null;
  }
}
