// Security tab: database status, backup export / restore, admin credentials and the audit log.

import { registerActions } from '../../shared/actions.js';
import { esc, byId } from '../../shared/dom.js';
import { data, ui } from '../state.js';
import { api } from '../api.js';
import { formatDateTime } from '../format.js';
import { registerTab } from '../router.js';
import { refreshFromServer } from '../sync.js';
import { setAuthenticated } from '../auth.js';
import { showToast, showError } from '../ui/toast.js';
import { downloadFile } from '../ui/download.js';

const STAT = 'background:var(--bo-bg); border:1px solid var(--bo-border); border-radius:12px; padding:14px 16px;';
const STAT_LABEL = 'font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--bo-muted);';

function databasePanel(db, logCount) {
  return `
    <div class="bo-panel" style="margin-bottom:22px;">
      <div class="bo-panel-header">
        <div>
          <div class="bo-panel-title"><i class="fa-solid fa-layer-group" style="color:var(--bo-gold);"></i> Production SQLite Relational Database Engine</div>
          <div style="font-size:0.8rem; color:var(--bo-muted);">All WhatsApp orders, catering quotes, FineDine menu items, SEO settings, and sessions are persisted in a transactional SQLite database</div>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" class="bo-btn bo-btn-outline" data-action="sync:refresh">
            <i class="fa-solid fa-arrows-rotate"></i> Refresh DB Stats
          </button>
          <label class="bo-btn bo-btn-outline" style="cursor:pointer; margin:0;">
            <i class="fa-solid fa-file-import"></i> Restore Backup (.json)
            <input type="file" accept=".json,application/json" hidden data-on-change="security:import" />
          </label>
          <button type="button" class="bo-btn bo-btn-gold" data-action="security:export">
            <i class="fa-solid fa-floppy-disk"></i> Download Full Database Backup (.json)
          </button>
        </div>
      </div>
      <div class="bo-panel-body">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:14px;">
          <div style="${STAT}">
            <div style="${STAT_LABEL}">Database Engine</div>
            <div style="font-weight:800; font-size:0.95rem; margin-top:4px; color:var(--bo-text);">${esc(db.engine)}</div>
            <div style="font-size:0.75rem; color:#16a34a; font-weight:700; margin-top:4px;"><i class="fa-solid fa-circle-check"></i> ${esc(db.journalMode)} Mode • ACID Transactions</div>
          </div>
          <div style="${STAT}">
            <div style="${STAT_LABEL}">Database File & Size</div>
            <div style="font-weight:800; font-size:0.95rem; margin-top:4px; color:var(--bo-text);"><code>${esc(db.filePath)}</code></div>
            <div style="font-size:0.75rem; color:var(--bo-muted); margin-top:4px;">Size: <b>${Number(db.fileSizeKb) || 0} KB</b> + Daily Auto-Backup</div>
          </div>
          <div style="${STAT}">
            <div style="${STAT_LABEL}">Stored Orders & Quotes</div>
            <div style="font-weight:800; font-size:1.25rem; margin-top:4px; color:var(--bo-text);">${Number(db.tables?.orders ?? data.orders.length) || 0} Records</div>
            <div style="font-size:0.75rem; color:var(--bo-gold-dark); font-weight:700; margin-top:2px;">Indexed by Date, Brand & Status</div>
          </div>
          <div style="${STAT}">
            <div style="${STAT_LABEL}">Security & Audit Events</div>
            <div style="font-weight:800; font-size:1.25rem; margin-top:4px; color:var(--bo-text);">${Number(db.tables?.auditLogs ?? logCount) || 0} Logged</div>
            <div style="font-size:0.75rem; color:var(--bo-muted); margin-top:2px;">Active Sessions: <b>${Number(db.tables?.activeSessions) || 1}</b></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function credentialsPanel(u) {
  return `
    <div class="bo-panel" style="margin-bottom:22px;">
      <div class="bo-panel-header">
        <div>
          <div class="bo-panel-title"><i class="fa-solid fa-shield-halved" style="color:var(--bo-gold);"></i> Back Office Authentication & Administrator Credentials</div>
          <div style="font-size:0.8rem; color:var(--bo-muted);">Update your Back Office login username, display name, and encrypted password</div>
        </div>
        <button type="button" class="bo-btn bo-btn-danger" data-action="auth:logout">
          <i class="fa-solid fa-right-from-bracket"></i> Sign Out & Lock Portal Now
        </button>
      </div>
      <div class="bo-panel-body">
        <form data-on-submit="security:change-credentials">
          <div class="bo-form-grid">
            <div class="bo-form-group">
              <label for="secAdminUsername">Admin Login Username *</label>
              <input type="text" id="secAdminUsername" class="bo-input" value="${esc(u.username || 'admin')}" autocomplete="username" required />
            </div>
            <div class="bo-form-group">
              <label for="secAdminDisplayName">Administrator Display Name *</label>
              <input type="text" id="secAdminDisplayName" class="bo-input" value="${esc(u.displayName || 'Mini Kitchen Executive Admin')}" required />
            </div>
            <div class="bo-form-group">
              <label for="secCurrentPass">Current Password (Required to Authorize Changes) *</label>
              <input type="password" id="secCurrentPass" class="bo-input" placeholder="Enter your current password" autocomplete="current-password" required />
            </div>
            <div class="bo-form-group">
              <label for="secNewPass">New Password (Min 10 characters — leave blank to keep current)</label>
              <input type="password" id="secNewPass" class="bo-input" placeholder="Enter new password (optional)" autocomplete="new-password" minlength="10" />
            </div>
          </div>
          <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="font-size:0.8rem; color:var(--bo-muted);">
              <i class="fa-solid fa-lock" style="color:var(--bo-gold);"></i> Passwords are encrypted with <b>PBKDF2-SHA512 (210,000 iterations)</b> in the SQLite <code>admin_users</code> table.
            </div>
            <button type="submit" class="bo-btn bo-btn-gold">
              <i class="fa-solid fa-key"></i> Update Administrator Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function auditPanel(logs) {
  const cell = 'padding:8px;';
  return `
    <div class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <div class="bo-panel-title"><i class="fa-solid fa-table-list" style="color:var(--bo-gold);"></i> Recent Database & Security Audit Log</div>
          <div style="font-size:0.8rem; color:var(--bo-muted);">Recorded in the SQLite <code>audit_logs</code> table</div>
        </div>
      </div>
      <div class="bo-panel-body">
        ${
          logs.length === 0
            ? '<div style="color:var(--bo-muted); font-size:0.85rem;">No audit events recorded yet.</div>'
            : `<div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:0.82rem;">
                  <thead>
                    <tr style="text-align:left; border-bottom:1px solid var(--bo-border); color:var(--bo-muted);">
                      <th style="${cell}">Timestamp</th><th style="${cell}">Actor</th><th style="${cell}">Event</th><th style="${cell}">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${logs
                      .map(
                        l => `
                      <tr style="border-bottom:1px dashed var(--bo-border);">
                        <td style="${cell} white-space:nowrap; color:var(--bo-muted);">${esc(formatDateTime(l.createdAt))}</td>
                        <td style="${cell} font-weight:700;">${esc(l.actor)}</td>
                        <td style="${cell}"><code>${esc(l.action)}</code></td>
                        <td style="${cell} color:var(--bo-muted);">${esc(l.details)}</td>
                      </tr>`
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>`
        }
      </div>
    </div>
  `;
}

function render() {
  const logs = ui.auditLogs.slice(0, 15);
  const db = ui.databaseInfo || {
    engine: 'SQLite 3 (Node.js native node:sqlite)',
    journalMode: 'WAL',
    filePath: 'data/minikitchen.sqlite',
    fileSizeKb: 48,
    tables: { orders: data.orders.length, activeSessions: 1, auditLogs: ui.auditLogs.length }
  };
  return databasePanel(db, logs.length) + credentialsPanel(ui.adminUser || {}) + auditPanel(logs);
}

async function exportDatabase() {
  try {
    const snapshot = await api.exportDatabase();
    downloadFile(
      JSON.stringify(snapshot, null, 2),
      `minikitchen-sqlite-backup-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json;charset=utf-8;'
    );
    showToast('Downloaded full SQLite database snapshot!');
  } catch (err) {
    showError(`Could not download SQLite backup: ${err.message}`);
  }
}

async function importDatabase(input) {
  const file = input.files?.[0];
  if (!file) return;
  try {
    let snapshot;
    try {
      snapshot = JSON.parse(await file.text());
    } catch {
      showError('Invalid JSON backup file.');
      return;
    }
    if (!window.confirm(`Restore "${file.name}"? This replaces the current website content and orders.`)) return;
    showToast('Restoring SQLite database backup...');
    const result = await api.importDatabase(snapshot);
    await refreshFromServer({ silent: true });
    showToast(`Database restored! Imported ${result.ordersImported || 0} order(s).`);
  } catch (err) {
    showError(`Could not restore database backup: ${err.message}`);
  } finally {
    input.value = '';
  }
}

async function changeCredentials() {
  const currentPass = byId('secCurrentPass');
  const newPass = byId('secNewPass');
  try {
    const result = await api.changePassword({
      currentPassword: currentPass.value,
      newUsername: byId('secAdminUsername').value.trim(),
      newDisplayName: byId('secAdminDisplayName').value.trim(),
      newPassword: newPass.value
    });
    setAuthenticated(true, result.user);
    currentPass.value = '';
    newPass.value = '';
    await refreshFromServer({ silent: true });
    showToast('Administrator credentials updated in SQLite database!');
  } catch (err) {
    showError(err.message || 'Could not update credentials.');
  }
}

registerActions({
  'security:export': () => exportDatabase(),
  'security:import': input => importDatabase(input),
  'security:change-credentials': () => changeCredentials()
});

registerTab('security', {
  title: 'Back Office Security & Administrator Login Credentials',
  subtitle: 'Manage administrator username, display profile, password encryption & active session security',
  render
});
