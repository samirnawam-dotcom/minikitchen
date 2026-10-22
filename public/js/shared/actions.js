// ============================================================================
// DECLARATIVE EVENT WIRING
// Replaces inline on* attributes (which a strict Content-Security-Policy blocks).
//
//   <button data-action="cart:add" data-id="mk-item-12">          click
//   <input data-on-input="menu:search">                            input
//   <select data-on-change="menu:currency">                        change
//   <form data-on-submit="quote:submit">                           submit
//   <img data-fallback="https://…/backup.jpg">                     image error fallback
//
// Handlers receive (element, event) and are registered once per module:
//   registerActions({ 'cart:add': el => addToCart(el.dataset.id) });
// ============================================================================

const handlers = new Map();

const EVENT_ATTRS = {
  click: 'data-action',
  input: 'data-on-input',
  change: 'data-on-change',
  submit: 'data-on-submit',
  keydown: 'data-on-keydown'
};

export function registerActions(map) {
  for (const [name, fn] of Object.entries(map)) {
    if (handlers.has(name)) throw new Error(`Action "${name}" is registered twice`);
    handlers.set(name, fn);
  }
}

function dispatch(attr, event) {
  const el = event.target instanceof Element ? event.target.closest(`[${attr}]`) : null;
  if (!el) return;
  const name = el.getAttribute(attr);
  const fn = handlers.get(name);
  if (!fn) {
    console.error(`No handler registered for ${attr}="${name}"`);
    return;
  }
  if (event.type === 'submit') event.preventDefault();
  fn(el, event);
}

for (const [type, attr] of Object.entries(EVENT_ATTRS)) {
  document.addEventListener(type, event => dispatch(attr, event));
}

// Image fallbacks: try data-fallback once, then the page-wide default (never loops).
let defaultImageFallback = '';

export function setDefaultImageFallback(url) {
  defaultImageFallback = url;
}

document.addEventListener(
  'error',
  event => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.hasAttribute('data-fallback')) return;
    const stage = Number(img.dataset.fallbackStage || 0);
    const next = stage === 0 ? img.dataset.fallback || defaultImageFallback : stage === 1 ? defaultImageFallback : '';
    img.dataset.fallbackStage = String(stage + 1);
    if (next && next !== img.src) {
      img.src = next;
    } else if (stage >= 1) {
      img.removeAttribute('data-fallback');
    }
  },
  true // error events do not bubble; capture them on the way down
);
