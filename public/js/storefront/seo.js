// Keeps <title>, description, Open Graph / Twitter tags and the canonical URL in sync with the
// page shown (the server renders the initial values; site config `seo.pages` can override them).

import { content } from './config.js';

const setAttr = (id, attr, value) => document.getElementById(id)?.setAttribute(attr, value);

export function updatePageSeoMeta(pageId) {
  const seo = content.config.seo || {};
  const pagesMap = seo.pages || {};
  const pageMeta = pagesMap[pageId] || pagesMap.catering;
  if (!pageMeta) return;

  if (pageMeta.title) {
    document.title = pageMeta.title;
    setAttr('ogTitle', 'content', pageMeta.title);
    setAttr('twitterTitle', 'content', pageMeta.title);
  }
  if (pageMeta.description) {
    setAttr('metaDescription', 'content', pageMeta.description);
    setAttr('ogDescription', 'content', pageMeta.description);
    setAttr('twitterDescription', 'content', pageMeta.description);
  }
  if (pageMeta.keywords) setAttr('metaKeywords', 'content', pageMeta.keywords);

  const baseSiteUrl = seo.siteUrl || 'https://minikitchencatering.com';
  const canonicalUrl = baseSiteUrl.replace(/\/$/, '') + (pageMeta.canonicalPath || '/');
  setAttr('canonicalLink', 'href', canonicalUrl);
  setAttr('ogUrl', 'content', canonicalUrl);
}
