// Full-screen photo viewer for gallery tiles:
//   <button data-action="lightbox:open" data-lightbox="home" data-caption="…"><img src="…"></button>
// Tiles that share a data-lightbox name are browsed together, in page order. Close with Esc, the
// close button or a tap on the backdrop; browse with the arrow keys, the side buttons or a swipe.

import { registerActions } from '../shared/actions.js';
import { esc } from '../shared/dom.js';
import { t } from './i18n-strings.js';

let slides = [];
let index = 0;
let lastFocus = null;
let touchStartX = null;

const isRtl = () => document.documentElement.dir === 'rtl';

function ensureDom() {
  let box = document.getElementById('mkLightbox');
  if (box) return box;
  box = document.createElement('div');
  box.id = 'mkLightbox';
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', t('Photo viewer'));
  box.setAttribute('data-action', 'lightbox:backdrop');
  box.innerHTML = `
      <button type="button" class="lightbox-btn lightbox-close" data-action="lightbox:close" aria-label="${t('Close')}"><i class="fa-solid fa-xmark"></i></button>
      <button type="button" class="lightbox-btn lightbox-prev" data-action="lightbox:prev" aria-label="${t('Previous photo')}"><i class="fa-solid fa-chevron-left"></i></button>
      <figure class="lightbox-figure">
        <img class="lightbox-img" alt="" />
        <figcaption class="lightbox-caption">
          <span class="lightbox-text"></span>
          <span class="lightbox-count"></span>
        </figcaption>
      </figure>
      <button type="button" class="lightbox-btn lightbox-next" data-action="lightbox:next" aria-label="${t('Next photo')}"><i class="fa-solid fa-chevron-right"></i></button>`;
  box.addEventListener('touchstart', e => (touchStartX = e.changedTouches[0].clientX), { passive: true });
  box.addEventListener(
    'touchend',
    e => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(dx) < 40) return;
      // Swiping toward the reading direction's start shows the next photo
      step(dx < 0 !== isRtl() ? 1 : -1);
    },
    { passive: true }
  );
  document.body.appendChild(box);
  return box;
}

function show() {
  const box = ensureDom();
  const slide = slides[index];
  if (!slide) return;
  const imgEl = box.querySelector('.lightbox-img');
  imgEl.src = slide.src;
  imgEl.alt = slide.alt;
  box.querySelector('.lightbox-text').innerHTML = esc(slide.caption);
  box.querySelector('.lightbox-count').textContent = slides.length > 1 ? `${index + 1} / ${slides.length}` : '';
  box.classList.toggle('single', slides.length < 2);
}

function step(delta) {
  if (slides.length < 2) return;
  index = (index + delta + slides.length) % slides.length;
  show();
}

function open(tile) {
  const group = tile.dataset.lightbox;
  const tiles = [...document.querySelectorAll(`[data-action="lightbox:open"][data-lightbox="${CSS.escape(group)}"]`)];
  slides = tiles.map(tileEl => {
    const imgEl = tileEl.querySelector('img');
    return { src: imgEl?.currentSrc || imgEl?.src || '', alt: imgEl?.alt || '', caption: tileEl.dataset.caption || '' };
  });
  index = Math.max(0, tiles.indexOf(tile));
  lastFocus = document.activeElement;
  const box = ensureDom();
  // The viewer is built once; its labels follow the language chosen since then.
  box.setAttribute('aria-label', t('Photo viewer'));
  box.querySelector('.lightbox-close').setAttribute('aria-label', t('Close'));
  box.querySelector('.lightbox-prev').setAttribute('aria-label', t('Previous photo'));
  box.querySelector('.lightbox-next').setAttribute('aria-label', t('Next photo'));
  show();
  box.classList.add('open');
  document.documentElement.classList.add('lightbox-lock');
  box.querySelector('.lightbox-close').focus({ preventScroll: true });
}

function close() {
  const box = document.getElementById('mkLightbox');
  if (!box || !box.classList.contains('open')) return;
  box.classList.remove('open');
  document.documentElement.classList.remove('lightbox-lock');
  if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus({ preventScroll: true });
}

document.addEventListener('keydown', e => {
  if (!document.getElementById('mkLightbox')?.classList.contains('open')) return;
  if (e.key === 'Escape') close();
  else if (e.key === 'ArrowRight') step(isRtl() ? -1 : 1);
  else if (e.key === 'ArrowLeft') step(isRtl() ? 1 : -1);
  else return;
  e.preventDefault();
});

registerActions({
  'lightbox:open': open,
  'lightbox:close': close,
  'lightbox:prev': () => step(-1),
  'lightbox:next': () => step(1),
  'lightbox:backdrop': (el, event) => {
    if (event.target === el || event.target.classList.contains('lightbox-figure')) close();
  }
});
