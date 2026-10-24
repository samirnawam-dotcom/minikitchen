// Security tab: database status, backup export / restore, admin credentials and the audit log.

import { registerActions } from '../../shared/actions.js';
import { esc, byId } from '../../shared/dom.js';
import { data, ui } from '../state.js';
import { api } from '../api.js';
import { formatDateTime } from '../format.js';
import { registerTab, markSaved } from '../router.js';
import { confirmDialog } from '../ui/modal.js';
import { refreshFromServer } from '../sync.js';
import { setAuthenticated } from '../auth.js';
import { showToast, showError } from '../ui/toast.js';
import { downloadFile } from '../ui/download.js';

const STAT =
  'background:var(--bo-bg); border:1px solid var(--bo-border); border-radius:12px; padding:14px 16px; min-width:0;';
const STAT_LABEL = 'font-size:0.78rem; font-weight:700; color:var(--bo-muted);';
const STAT_VALUE =
  'font-family:var(--font-serif); font-weight:700; font-size:1.4rem; margin-top:2px; color:var(--bo-text);';

function databasePanel(db, logCount) {
  return `
    <section class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <h2 class="bo-panel-title"><i class="fa-solid fa-database" aria-hidden="true"></i> Backups</h2>
          <div class="bo-panel-sub">Download a copy of everything (orders, menu, packages, settings) and keep it somewhere safe. The server also makes a backup every day.</div>
        </div>
        <div class="bo-panel-actions">
          <button type="button" class="bo-btn bo-btn-gold" data-action="security:export">
            <i class="fa-solid fa-download" aria-hidden="true"></i> Download a backup
          </button>
          <button type="button" class="bo-btn bo-btn-outline" data-action="security:import-pick">
            <i class="fa-solid fa-upload" aria-hidden="true"></i> Restore a backup…
          </button>
          <input type="file" accept=".json,application/json" hidden data-on-change="security:import" id="secImportInput" />
        </div>
      </div>
      <div class="bo-panel-body">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(min(190px, 100%), 1fr)); gap:12px;">
          <div style="${STAT}">
            <div style="${STAT_LABEL}">Orders &amp; requests stored</div>
            <div style="${STAT_VALUE}">${Number(db.tables?.orders ?? data.orders.length) || 0}</div>
          </div>
          <div style="${STAT}">
            <div style="${STAT_LABEL}">Database size</div>
            <div style="${STAT_VALUE}">${Number(db.fileSizeKb) || 0} KB</div>
          </div>
          <div style="${STAT}">
            <div style="${STAT_LABEL}">Activity entries</div>
            <div style="${STAT_VALUE}">${Number(db.tables?.auditLogs ?? logCount) || 0}</div>
          </div>
          <div style="${STAT}">
            <div style="${STAT_LABEL}">Signed-in sessions</div>
            <div style="${STAT_VALUE}">${Number(db.tables?.activeSessions) || 1}</div>
          </div>
        </div>
        <details style="margin-top:14px;">
          <summary class="bo-muted" style="cursor:pointer; font-size:0.84rem;">Technical details</summary>
          <div class="bo-muted" style="font-size:0.82rem; margin-top:8px; overflow-wrap:anywhere;">
            ${esc(db.engine)} · ${esc(db.journalMode)} mode · <code>${esc(db.filePath)}</code>
          </div>
        </details>
      </div>
    </section>
  `;
}

function credentialsPanel(u) {
  return `
    <section class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <h2 class="bo-panel-title"><i class="fa-solid fa-user-lock" aria-hidden="true"></i> Your sign-in details</h2>
          <div class="bo-panel-sub">Change your username, the name shown in the Back Office, or your password.</div>
        </div>
        <button type="button" class="bo-btn bo-btn-outline" data-action="auth:logout">
          <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Sign out
        </button>
      </div>
      <div class="bo-panel-body">
        <form data-on-submit="security:change-credentials" data-dirty-scope style="border:0;">
          <div class="bo-form-grid">
            <div class="bo-form-group">
              <label for="secAdminUsername">Username *</label>
              <input type="text" id="secAdminUsername" class="bo-input" value="${esc(u.username || 'admin')}" autocomplete="username" required />
            </div>
            <div class="bo-form-group">
              <label for="secAdminDisplayName">Your name *</label>
              <input type="text" id="secAdminDisplayName" class="bo-input" value="${esc(u.displayName || 'Mini Kitchen Admin')}" required />
            </div>
            <div class="bo-form-group">
              <label for="secNewPass">New password</label>
              <input type="password" id="secNewPass" class="bo-input" autocomplete="new-password" minlength="10" aria-describedby="secNewPassHelp" />
              <div class="bo-help" id="secNewPassHelp">At least 10 characters. Leave empty to keep your current password.</div>
            </div>
            <div class="bo-form-group">
              <label for="secCurrentPass">Current password *</label>
              <input type="password" id="secCurrentPass" class="bo-input" autocomplete="current-password" required aria-describedby="secCurrentPassHelp" />
              <div class="bo-help" id="secCurrentPassHelp">Needed to confirm it is really you.</div>
            </div>
          </div>
          <div class="bo-form-footer">
            <span class="bo-save-state">Unsaved changes</span>
            <button type="submit" class="bo-btn bo-btn-gold" data-save-button style="margin-left:auto;">
              <i class="fa-solid fa-check" aria-hidden="true"></i> Save sign-in details
            </button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function auditPanel(logs) {
  return `
    <section class="bo-panel">
      <div class="bo-panel-header">
        <div>
          <h2 class="bo-panel-title"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i> Recent activity</h2>
          <div class="bo-panel-sub">Sign-ins and changes, newest first.</div>
        </div>
      </div>
      <div class="bo-panel-body">
        ${
          logs.length === 0
            ? '<div class="bo-empty" style="padding:24px;"><div class="bo-empty-title">No activity yet</div><p>Sign-ins and saved changes will be listed here.</p></div>'
            : `<table class="bo-table">
                <thead><tr><th scope="col">When</th><th scope="col">Who</th><th scope="col">What</th><th scope="col">Details</th></tr></thead>
                <tbody>
                  ${logs
                    .map(
                      l => `
                    <tr>
                      <td data-label="When" style="white-space:nowrap;" class="bo-muted">${esc(formatDateTime(l.createdAt))}</td>
                      <td data-label="Who" style="font-weight:700;">${esc(l.actor)}</td>
                      <td data-label="What"><code>${esc(l.action)}</code></td>
                      <td data-label="Details" class="bo-muted">${esc(l.details)}</td>
                    </tr>`
                    )
                    .join('')}
                </tbody>
              </table>`
        }
      </div>
    </section>
  `;
}

function render() {
  const logs = ui.auditLogs.slice(0, 15);
  const db = ui.databaseInfo || {
    engine: 'SQLite 3',
    journalMode: 'WAL',
    filePath: 'data/minikitchen.sqlite',
    fileSizeKb: 48,
    tables: { orders: data.orders.length, activeSessions: 1, auditLogs: ui.auditLogs.length }
  };
  return credentialsPanel(ui.adminUser || {}) + databasePanel(db, logs.length) + auditPanel(logs);
}

async function exportDatabase() {
  try {
    const snapshot = await api.exportDatabase();
    downloadFile(
      JSON.stringify(snapshot, null, 2),
      `minikitchen-sqlite-backup-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json;charset=utf-8;'
    );
    showToast('Backup downloaded. Keep the file somewhere safe.');
  } catch (err) {
    showError(`Could not download the backup: ${err.message}`);
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
      showError('This file is not a Mini Kitchen backup.');
      return;
    }
    const sure = await confirmDialog(
      `Restoring “${file.name}” replaces the current website content and orders with the ones in the backup.\n\nThis cannot be undone.`,
      { title: 'Restore this backup?', confirmLabel: 'Restore backup' }
    );
    if (!sure) return;
    showToast('Restoring the backup…');
    const result = await api.importDatabase(snapshot);
    await refreshFromServer({ silent: true });
    showToast(`Backup restored (${result.ordersImported || 0} orders).`);
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
    markSaved(currentPass);
    currentPass.value = '';
    newPass.value = '';
    await refreshFromServer({ silent: true });
    showToast('Sign-in details saved.');
  } catch (err) {
    showError(err.message || 'Could not update credentials.');
  }
}

registerActions({
  'security:export': () => exportDatabase(),
  'security:import': input => importDatabase(input),
  'security:import-pick': () => document.getElementById('secImportInput')?.click(),
  'security:change-credentials': () => changeCredentials()
});

registerTab('security', {
  title: 'Account & backups',
  subtitle: 'Your sign-in details, backups and recent activity.',
  render
});
