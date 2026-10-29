// "Upload Photo" buttons: <input type="file" data-on-change="upload:photo" data-target="inputId">
// uploads the image to /api/upload, writes the returned URL into the target text input and saves
// the card or dish it belongs to, so the website shows the new photo straight away.

import { registerActions } from '../../shared/actions.js';
import { byId, esc } from '../../shared/dom.js';
import { api } from '../api.js';
import { showToast, showError } from './toast.js';

const MAX_BYTES = 6 * 1024 * 1024;
/** Longest side of an uploaded photo; the website never shows photos larger than this. */
const MAX_SIDE = 2400;

/**
 * Camera and phone photos are often 8–20 MB: shrink them in the browser to at most MAX_SIDE pixels
 * (WebP keeps transparency, quality 0.85) so they fit the 6 MB limit and load fast. GIFs and photos
 * that are already small stay as they are; HEIC the browser cannot read is left for the server to convert.
 */
async function shrinkPhoto(file) {
  if (file.type === 'image/gif') return file;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // iPhone HEIC photos cannot be read by Chrome or Edge: send them as they are, the server converts them.
    if (/\.hei[cf]$/i.test(file.name) || /^image\/hei[cf]$/.test(file.type)) {
      return new File([file], file.name, { type: 'image/heic' });
    }
    throw new Error('This photo format cannot be read. Please save it as JPG and try again.');
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= 1.5 * 1024 * 1024) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.85));
  if (!blob || blob.type !== 'image/webp') return file; // ponytail: browsers without WebP export keep the original
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function uploadPhoto(input) {
  const picked = input.files?.[0];
  if (!picked) return;
  try {
    showToast('Preparing photo…');
    const file = await shrinkPhoto(picked);
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
    // Replacing the photo of something already on the website saves it straight away (with any other
    // edits on that card); "Add" forms still wait for their button, since the rest may not be filled in.
    const editForm = target?.closest('form[data-on-submit="menu:edit-submit"]');
    const saveButton = editForm ? null : target?.closest('[data-dirty-scope]')?.querySelector('[data-save-button]');
    if (editForm) editForm.requestSubmit();
    else if (saveButton) saveButton.click();
    else showToast(`Photo uploaded (${result.sizeKb} KB). Press the button below to add it.`);
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
      <input type="file" accept="image/*,.heic,.heif" hidden data-on-change="upload:photo" data-target="${esc(targetId)}" />
    </span>
  `;
}

registerActions({
  'upload:pick': el => el.parentElement?.querySelector('input[type="file"]')?.click(),
  'upload:photo': input => uploadPhoto(input)
});
