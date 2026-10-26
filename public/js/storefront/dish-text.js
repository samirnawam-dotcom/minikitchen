// Dish and menu-category text in the visitor's language. Dishes may carry titleAr / descAr and
// categories nameAr / subtitleAr (the delivery menu does); in Arabic those are shown first with the
// English name as a quiet second line. Without them the English text is used (categories still go
// through the interface dictionary, as before). A dish priced per piece has unit: 'piece'.

import { esc } from '../shared/dom.js';
import { formatPrice } from './format.js';
import { isAr, t } from './i18n-strings.js';

/** The dish (or basket line) name in the visitor's language. */
export const dishTitle = item => String((isAr() && item?.titleAr) || item?.title || '');

/** The English name shown under the Arabic one, or '' (English site, or no Arabic name). */
export const dishOtherTitle = item => (isAr() && item?.titleAr && item?.title ? String(item.title) : '');

/** The dish description in the visitor's language ('' when there is none). */
export const dishDesc = item => String((isAr() && item?.descAr) || item?.desc || '');

export const categoryName = cat => String((isAr() && cat?.nameAr) || t(String(cat?.name || '')));

export const categorySubtitle = cat =>
  String((isAr() && cat?.subtitleAr) || t(String(cat?.subtitle || cat?.badge || '')));

/** Escaped name markup: the main name, plus the English second line in Arabic. */
export function dishTitleHtml(item) {
  const other = dishOtherTitle(item);
  return `${esc(dishTitle(item))}${other ? `<span class="dish-name-other" lang="en" dir="ltr">${esc(other)}</span>` : ''}`;
}

export const isPerPiece = item => item?.unit === 'piece';

/** "$1.50" or, for dishes sold by the piece, "$1.50 / piece" (markup, already escaped). */
export function dishPriceHtml(item, amount = item?.priceValue) {
  const price = formatPrice(amount);
  return isPerPiece(item) ? `${price} <span class="dish-unit">${t('/ piece')}</span>` : price;
}

/** Plain-text price for labels: "$1.50 / piece". */
export const dishPriceText = (item, amount = item?.priceValue) =>
  isPerPiece(item) ? `${formatPrice(amount)} ${t('/ piece')}` : formatPrice(amount);

/** Text a menu search matches: names and descriptions in both languages. */
export const dishSearchText = item =>
  [item?.title, item?.titleAr, item?.desc, item?.descAr].filter(Boolean).join(' ').toLowerCase();
