// Page 5 — About Us: story with key figures, the team, reviews and behind-the-scenes photos.

import { esc } from '../../shared/dom.js';
import { configList } from '../config.js';
import { registerPage } from '../view.js';
import { galleryGrid, pageHero, sectionHeader, testimonialsSection } from './sections.js';
import { t } from '../i18n-strings.js';

const stat = (value, label) => `
              <div class="stat">
                <div class="stat-value">${value}</div>
                <div class="stat-label">${label}</div>
              </div>`;

function buildAboutPage() {
  return `
      ${pageHero({
        eyebrow: t('About Mini Kitchen'),
        title: t('A family kitchen in the mountains of Aley'),
        text: t(
          'A catering kitchen first — buffets, birthdays and live stations for your events — with our restaurant terrace and delivery on the side.'
        ),
        photo: 'images/pages/about.webp',
        alt: t('The Mini Kitchen team at work')
      })}

      <section class="section-pad">
        <div class="container split">
          <div class="split-copy">
            <span class="eyebrow">${t('Our story')}</span>
            <h2 class="section-title">${t('Lebanese at heart, #NotSoTraditional in spirit')}</h2>
            <p>${t('Mini Kitchen began in Ain Al Remmaneh, Aley, cooking the generous Lebanese food we grew up with — and adding a few modern American favourites along the way.')}</p>
            <p>${t('As guests fell for our morning manakish, mezza, charcoal grills and the molten cheddar fountain, they asked us to cook for their weddings, company events and villa parties.')}</p>
            <p>${t('Today the same brigade runs Mini Kitchen Catering, Restaurant and Delivery, with fresh, halal ingredients and the same care in every plate.')}</p>
            <div class="stats-row">
              ${stat('3', t('Brands, one kitchen'))}
              ${stat('239+', t('Dishes on our menu'))}
              ${stat('100%', t('Fresh & halal'))}
            </div>
          </div>
          <div class="split-media">
            <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1000&q=85" data-fallback="" alt="${t('A Mini Kitchen chef plating')}" loading="lazy" />
          </div>
        </div>
      </section>

      <section class="section-pad section-ivory">
        <div class="container">
          ${sectionHeader({ eyebrow: t('Our team'), title: t('The people behind the plates') })}
          <div class="team-grid">
            ${configList('teamMembers')
              .map(
                m => `
            <article class="team-card">
              <div class="team-card-media"><img src="${esc(m.img)}" data-fallback="" alt="${esc(t(m.name))}" loading="lazy" /></div>
              <div class="team-role">${esc(t(m.role))}</div>
              <h3 class="team-name">${esc(t(m.name))}</h3>
              <p class="team-bio">${esc(t(m.bio))}</p>
            </article>`
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="section-pad">
        <div class="container">
          ${sectionHeader({ eyebrow: t('Behind the scenes'), title: t('From our kitchen to your event') })}
          ${galleryGrid(configList('behindTheScenes'), 'about', 'desc')}
        </div>
      </section>

      ${testimonialsSection({ tone: 'plain' })}
    `;
}

registerPage('about', buildAboutPage);
