// "Upload Photo" buttons: <input type="file" data-on-change="upload:photo" data-target="inputId">
// uploads the image to /api/upload and writes the returned URL into the target text input.

import { registerActions } from '../../shared/actions.js';
import { byId, esc } from '../../shared/dom.js';
import { api } from '../api.js';
import { showToast, showError } from './toast.js';

const MAX_BYTES = 6 * 1024 * 1024;

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function uploadPhoto(input) {
  const file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > MAX_BYTES) {
      showError('Image must be under 6 MB.');
      return;
    }
    showToast('Uploading photo to server...');
    const result = await api.upload(file.name, await readAsDataUrl(file));
    const target = byId(input.dataset.target);
    if (target) {
      target.value = result.url;
      target.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const preview = input.dataset.preview && byId(input.dataset.preview);
    if (preview) preview.src = result.url;
    showToast(`Photo uploaded (${result.sizeKb} KB) → ${result.url}`);
  } catch (err) {
    showError(err.message || 'Could not upload photo to server.');
  } finally {
    input.value = '';
  }
}

/** Markup for the upload button that fills `targetId`. `label` is optional visible text. */
export function uploadButton(targetId, { label = 'Upload Photo', compact = false } = {}) {
  const style = compact
    ? 'cursor:pointer; padding:7px 10px; font-size:0.74rem; white-space:nowrap; margin:0;'
    : 'cursor:pointer; white-space:nowrap; margin:0;';
  return `
    <label class="bo-btn bo-btn-outline" style="${style}"${compact ? ' title="Upload Photo from Device"' : ''}>
      <i class="fa-solid fa-cloud-arrow-up"></i>${label ? ` ${esc(label)}` : ''}
      <input type="file" accept="image/*" hidden data-on-change="upload:photo" data-target="${esc(targetId)}" />
    </label>
  `;
}

registerActions({
  'upload:photo': input => uploadPhoto(input)
});
