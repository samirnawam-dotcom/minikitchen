// Small DOM and formatting helpers shared by the storefront and the Back Office.

/** Escapes text for safe use inside HTML content and double- or single-quoted attributes. */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const byId = id => document.getElementById(id);

export function setHtml(target, html) {
  const el = typeof target === 'string' ? byId(target) : target;
  if (el) el.innerHTML = html;
  return el;
}

export function deepClone(value) {
  return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}
