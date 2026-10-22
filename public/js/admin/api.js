// Every Back Office request to the server goes through here: JSON in/out, readable errors and
// a single place that reacts to an expired session (HTTP 401 → back to the sign-in screen).
// Auth is an HttpOnly cookie the browser attaches by itself; no token is ever handled in JS.

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

let unauthorizedHandler = null;

/** Registers the function called when an admin request is rejected with 401. */
export function onUnauthorized(fn) {
  unauthorizedHandler = fn;
}

/** Signals an expired session discovered by other means (e.g. /api/state without orders). */
export function notifyUnauthorized() {
  if (unauthorizedHandler) unauthorizedHandler();
}

/**
 * @param {string} path
 * @param {{ method?: string, body?: unknown, handle401?: boolean }} [options]
 *   handle401: false for calls where 401 is an expected answer (login, session check).
 */
export async function request(path, { method = 'GET', body, handle401 = true } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new ApiError(0, 'Server unreachable. Please check your connection and try again.');
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {}

  if (res.status === 401 && handle401) notifyUnauthorized();
  if (!res.ok || payload?.ok === false) {
    throw new ApiError(res.status, payload?.error || `Request failed (HTTP ${res.status}).`, payload);
  }
  return payload ?? {};
}

const get = path => request(path);
const send = (method, path, body) => request(path, { method, body });

// ---- Endpoints -------------------------------------------------------------------------------

export const api = {
  login: (username, password, remember) =>
    request('/api/auth/login', { method: 'POST', body: { username, password, remember }, handle401: false }),
  me: () => request('/api/auth/me', { handle401: false }),
  logout: () => request('/api/auth/logout', { method: 'POST', handle401: false }),
  changePassword: body => send('POST', '/api/auth/change-password', body),

  state: () => get('/api/state'),
  saveSiteConfig: (siteConfig, lbpRate) => send('PUT', '/api/site-config', { siteConfig, lbpRate }),
  saveMenu: (menuCategories, lbpRate) => send('PUT', '/api/menu', { menuCategories, lbpRate }),
  reset: target => send('POST', '/api/reset', { target }),

  createOrder: order => send('POST', '/api/orders', order),
  patchOrder: (id, patch) => send('PATCH', `/api/orders/${encodeURIComponent(id)}`, patch),
  deleteOrder: id => send('DELETE', `/api/orders/${encodeURIComponent(id)}`),

  upload: (filename, dataUrl) => send('POST', '/api/upload', { filename, dataUrl }),

  exportDatabase: () => get('/api/db/export'),
  importDatabase: snapshot => send('POST', '/api/db/import', { snapshot })
};
