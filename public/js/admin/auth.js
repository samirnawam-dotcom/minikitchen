// Sign-in overlay, session check on load, sign-out and session-expiry handling.
// The session is an HttpOnly cookie set by /api/auth/login; nothing auth-related is stored by JS.

import { registerActions } from '../shared/actions.js';
import { byId } from '../shared/dom.js';
import { api, onUnauthorized } from './api.js';
import { ui, clearOrders } from './state.js';
import { refreshFromServer, resetOrderTracking, updateNavBadges } from './sync.js';
import { renderActiveTab } from './router.js';
import { closeModal } from './ui/modal.js';
import { showToast, showError } from './ui/toast.js';

// Older versions kept a bearer token in web storage; remove any leftovers.
try {
  localStorage.removeItem('mk_bo_auth_token');
  sessionStorage.removeItem('mk_bo_auth_token');
} catch {}

const SUBMIT_IDLE = '<i class="fa-solid fa-lock-open"></i> <span>Sign In to Back Office</span>';
const SUBMIT_BUSY = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Verifying Credentials...</span>';

export function setAuthenticated(isAuth, user) {
  ui.authenticated = Boolean(isAuth);
  if (user) ui.adminUser = { ...ui.adminUser, ...user };
  byId('boAuthOverlay')?.classList.toggle('authenticated', ui.authenticated);
  const nameEl = byId('boAdminDisplayName');
  if (nameEl) nameEl.textContent = ui.adminUser.displayName || ui.adminUser.username || 'Mini Kitchen Admin';
}

/** Restores the signed-in state from the session cookie, if it is still valid. */
export async function verifySession() {
  try {
    const result = await api.me();
    if (result.authenticated) {
      setAuthenticated(true, result.user);
      return true;
    }
  } catch {}
  setAuthenticated(false);
  return false;
}

/** Back to the sign-in screen and drop cached customer data. */
function endSession(message, { error = false } = {}) {
  clearOrders();
  resetOrderTracking();
  ui.auditLogs = [];
  ui.databaseInfo = null;
  closeModal();
  setAuthenticated(false);
  updateNavBadges();
  renderActiveTab();
  if (message) (error ? showError : showToast)(message);
}

export async function logout() {
  try {
    await api.logout();
  } catch {}
  endSession('Back Office session locked.');
}

function showLoginError(message) {
  const errEl = byId('boAuthError');
  if (!errEl) return;
  errEl.textContent = message;
  errEl.style.display = 'block';
}

async function submitLogin() {
  const userInput = byId('boLoginUser');
  const passInput = byId('boLoginPass');
  const errEl = byId('boAuthError');
  const btn = byId('boLoginSubmitBtn');
  const username = (userInput?.value || '').trim();
  const password = passInput?.value || '';
  const remember = byId('boLoginRemember')?.checked ?? true;

  if (errEl) errEl.style.display = 'none';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = SUBMIT_BUSY;
  }
  try {
    const result = await api.login(username, password, remember);
    setAuthenticated(true, result.user);
    if (passInput) passInput.value = '';
    await refreshFromServer({ silent: true });
    showToast(
      result.user?.mustChangePassword
        ? 'Please set a new password in the Security & Admin Login tab.'
        : `Welcome back, ${result.user?.displayName || 'Mini Kitchen Admin'}!`
    );
  } catch (err) {
    showLoginError(err.message || 'Invalid username or password.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = SUBMIT_IDLE;
    }
  }
}

function togglePasswordVisibility() {
  const input = byId('boLoginPass');
  const icon = byId('boLoginEyeIcon');
  if (!input) return;
  const reveal = input.type === 'password';
  input.type = reveal ? 'text' : 'password';
  if (icon) icon.className = reveal ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
}

// Any admin request answered with 401 means the cookie is gone: return to the sign-in screen.
onUnauthorized(() => {
  if (!ui.authenticated) return;
  endSession('Your session has expired. Please sign in again.', { error: true });
});

registerActions({
  'auth:login': () => submitLogin(),
  'auth:toggle-password': () => togglePasswordVisibility(),
  'auth:logout': () => logout()
});
