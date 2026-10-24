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
    showToast('Uploading photo…');
    const result = await api.upload(file.name, await readAsDataUrl(file));
    const target = byId(input.dataset.target);
    if (target) {
      target.value = result.url;
      target.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const preview = input.dataset.preview && byId(input.dataset.preview);
    if (preview) preview.src = result.url;
    showToast(`Photo uploaded (${result.sizeKb} KB). Remember to press Save.`);
  } catch (err) {
    showError(err.message || 'Could not upload photo to server.');
  } finally {
    input.value = '';
  }
}

/** Markup for the upload button that fills `targetId`. `label` is optional visible text. */
export function uploadButton(targetId, { label = 'Upload', compact = false } = {}) {
  // A real <button> (keyboard reachable) that opens the hidden file picker next to it.
  return `
    <span style="display:inline-flex; flex-shrink:0;">
      <button type="button" class="bo-btn bo-btn-outline${compact ? ' bo-btn-icon' : ''}" data-action="upload:pick"
        title="Upload a photo from this device" aria-label="Upload a photo from this device">
        <i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i>${label && !compact ? ` ${esc(label)}` : ''}
      </button>
      <input type="file" accept="image/*" hidden data-on-change="upload:photo" data-target="${esc(targetId)}" />
    </span>
  `;
}

registerActions({
  'upload:pick': el => el.parentElement?.querySelector('input[type="file"]')?.click(),
  'upload:photo': input => uploadPhoto(input)
});
