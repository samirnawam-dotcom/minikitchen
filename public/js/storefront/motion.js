// Motion for the public site (all of it is skipped with prefers-reduced-motion):
//  • home hero slideshow: event photos cross-fade with a slow zoom ("Ken Burns"); dots choose a photo,
//    a button pauses it, and it waits while hovered, focused, off screen or in a background tab;
//  • hero text rises in line by line when a page opens;
//  • gentle parallax on hero and feature photos while the page scrolls;
//  • the showcase strip glides on its own in CSS (see .showcase-track) and pauses on hover or focus.

import { registerActions } from '../shared/actions.js';
import { t } from './i18n-strings.js';
import { state } from './state.js';
import { onAfterRender } from './view.js';

const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const SLIDE_MS = 6500;

// ---------------------------------------------------------------------------
// Hero slideshow
// ---------------------------------------------------------------------------
let hero = null; // { el, slides, dots, index, timer, paused, hovered, visible }

function showSlide(i) {
  if (!hero) return;
  const count = hero.slides.length;
  const previous = hero.index;
  hero.index = (i + count) % count;
  hero.slides.forEach((slide, n) => {
    const active = n === hero.index;
    // The slide that just left keeps its zoom while it fades out
    slide.classList.toggle('was-active', n === previous && !active);
    slide.classList.toggle('is-active', active);
    if (active) slide.removeAttribute('aria-hidden');
    else slide.setAttribute('aria-hidden', 'true');
  });
  hero.dots.forEach((dot, n) => {
    const active = n === hero.index;
    dot.classList.toggle('is-active', active);
    if (active) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
  schedule();
}

function running() {
  return hero && !reduceMotion && !hero.paused && !hero.hovered && hero.visible && !document.hidden;
}

function schedule() {
  if (!hero) return;
  clearTimeout(hero.timer);
  hero.el.classList.toggle('is-playing', running());
  if (running()) hero.timer = setTimeout(() => showSlide(hero.index + 1), SLIDE_MS);
}

function setUpHero(mainEl) {
  if (hero) {
    clearTimeout(hero.timer);
    hero.observer?.disconnect();
  }
  hero = null;
  const el = mainEl.querySelector('[data-hero-slider]');
  if (!el) return;
  const slides = [...el.querySelectorAll('[data-hero-slide]')];
  if (slides.length < 2) return;
  hero = {
    el,
    slides,
    dots: [...el.querySelectorAll('.hero-dot')],
    index: 0,
    paused: reduceMotion,
    hovered: false,
    visible: true
  };
  el.style.setProperty('--slide-ms', `${SLIDE_MS}ms`);
  if (reduceMotion) el.querySelector('.hero-pause')?.setAttribute('hidden', '');

  const hold = on => () => {
    if (!hero) return;
    hero.hovered = on;
    schedule();
  };
  el.addEventListener('mouseenter', hold(true));
  el.addEventListener('mouseleave', hold(false));
  el.addEventListener('focusin', hold(true));
  el.addEventListener('focusout', e => {
    if (!el.contains(e.relatedTarget)) hold(false)();
  });
  if ('IntersectionObserver' in window) {
    hero.observer = new IntersectionObserver(([entry]) => {
      if (!hero) return;
      hero.visible = entry.isIntersecting;
      schedule();
    });
    hero.observer.observe(el);
  }
  schedule();
}

document.addEventListener('visibilitychange', schedule);

registerActions({
  'hero:go': el => showSlide(Number(el.dataset.slide) || 0),
  'hero:toggle': el => {
    if (!hero) return;
    hero.paused = !hero.paused;
    el.setAttribute('aria-pressed', String(hero.paused));
    el.setAttribute('aria-label', t(hero.paused ? 'Play the slideshow' : 'Pause the slideshow'));
    el.querySelector('i')?.classList.replace(
      hero.paused ? 'fa-pause' : 'fa-play',
      hero.paused ? 'fa-play' : 'fa-pause'
    );
    schedule();
  }
});

// ---------------------------------------------------------------------------
// Parallax: photos drift a little slower than the page
// ---------------------------------------------------------------------------
const PARALLAX = '.page-hero-bg img, .home-hero-media, .split-media img, .type-card-media img';
let parallaxEls = [];
let parallaxQueued = false;

function updateParallax() {
  parallaxQueued = false;
  const vh = window.innerHeight;
  for (const el of parallaxEls) {
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh) continue;
    // -1 when the element's centre is at the bottom of the screen, +1 at the top
    const progress = (vh / 2 - (rect.top + rect.height / 2)) / (vh / 2 + rect.height / 2);
    el.style.setProperty('--parallax', `${(progress * 28).toFixed(1)}px`);
  }
}

function queueParallax() {
  if (parallaxQueued) return;
  parallaxQueued = true;
  requestAnimationFrame(updateParallax);
}

if (!reduceMotion) {
  document.documentElement.classList.add('motion-ok');
  window.addEventListener('scroll', queueParallax, { passive: true });
  window.addEventListener('resize', queueParallax, { passive: true });
}

// The hero text animates when a page is opened, not each time the same page redraws (tabs, language)
let lastPage = null;

onAfterRender(mainEl => {
  setUpHero(mainEl);
  if (reduceMotion) return;
  if (state.currentPage !== lastPage) mainEl.querySelector('.home-hero, .page-hero')?.classList.add('hero-enter');
  lastPage = state.currentPage;
  parallaxEls = [...mainEl.querySelectorAll(PARALLAX)];
  updateParallax();
});
