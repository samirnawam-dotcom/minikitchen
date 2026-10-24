// Interface text in Arabic. Templates write their English text through t(): in English it comes back
// unchanged, in Arabic it is looked up in AR below (keys are the exact English, `{name}` marks a
// value filled in by the caller). Text without an entry stays English, so owner-written content
// from the Back Office always shows as written; the published defaults (gallery captions, reviews,
// team, delivery areas, menu categories…) have entries so the Arabic site reads as one language.
//
// Register: clear Modern Standard Arabic as used by Lebanese caterers, addressing visitors politely
// in the plural (اختاروا، ضيوفكم). Fixed terms: محطة … المباشرة (live station), الباقة الكلاسيكية /
// المميّزة / الفاخرة (VIP), للشخص الواحد (per person), للكيلو (per kg), عند الطلب (on request),
// صواني الأطباق الرئيسية (main course trays), لقيمات صغيرة (mini bites), واتساب (WhatsApp).
// Western digits are kept (as used in Lebanon); amounts keep the "$" before the number.

import { state } from './state.js';

export const isAr = () => state.lang === 'ar';

/**
 * The visitor's language version of `en`. `vars` fill `{name}` placeholders; they are inserted as
 * given, so the caller escapes anything that comes from the owner or the visitor.
 */
export function t(en, vars) {
  const text = isAr() && Object.hasOwn(AR, en) ? AR[en] : en;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, key) => (Object.hasOwn(vars, key) ? String(vars[key]) : match));
}

/** Keeps an amount, number or code in one left-to-right piece inside Arabic text ("$25" stays "$25"). */
export const ltr = text => (isAr() ? `\u2066${text}\u2069` : String(text));

/**
 * Arabic text with its Latin words ("VIP", "(1 kg)"…) wrapped in Unicode isolates, so a price or
 * number written after it keeps its place in the right-to-left line ("فاخرة (VIP) — $5" would
 * otherwise pull "$5" into the English run).
 */
export function isolateLatin(text) {
  return String(text).replace(/[A-Za-z][A-Za-z0-9.&'’-]*(?:\s+[A-Za-z0-9][A-Za-z0-9.&'’-]*)*/g, '\u2066$&\u2069');
}

/** "50 guests" / "50 ضيفًا" (Arabic counted nouns change form with the number). */
export function guestsText(n) {
  const count = Number(n) || 0;
  if (!isAr()) return `${count} guests`;
  if (count === 1) return 'ضيف واحد';
  if (count === 2) return 'ضيفان';
  if (count >= 3 && count <= 10) return `${count} ضيوف`;
  return `${count} ضيفًا`;
}

/** "15–20 min" → "15–20 دقيقة" in Arabic. */
export function minutesText(text) {
  const value = String(text || '');
  return isAr() ? value.replace(/\bmins?\b\.?/i, 'دقيقة') : value;
}

/** "30–40 people" → "Serves 30–40 people" / "تكفي من 30 إلى 40 شخصًا". */
export function servesText(serves) {
  const value = String(serves || '').trim();
  if (!isAr()) return `Serves ${value}`;
  const range = value.match(/^(\d+)\s*[–-]\s*(\d+)\s*(people|persons|guests)?$/i);
  if (range) return `تكفي من ${range[1]} إلى ${range[2]} شخصًا`;
  const single = value.match(/^(\d+)\s*(people|persons|guests)?$/i);
  if (single) return `تكفي ${single[1]} شخصًا`;
  return `تكفي ${value}`;
}

// ---------------------------------------------------------------------------
// The fixed page frame in views/storefront.html (header, drawers, footer): its text nodes and
// labels are translated in place. The English originals are remembered, so switching back restores
// them exactly. Elements marked data-i18n-skip are kept up to date by their own code.
// ---------------------------------------------------------------------------
const STATIC_ROOTS =
  '.skip-link, #mkPreloader, .site-header, #navDrawer, #cartDrawer .cart-drawer-header, #cartDrawer .cart-drawer-footer, .floating-wa-container, .site-footer';
const STATIC_ATTRS = ['aria-label', 'title', 'alt', 'placeholder'];
const textOriginals = new WeakMap();
const attrOriginals = new WeakMap();

const skipped = node => Boolean((node.nodeType === 1 ? node : node.parentElement)?.closest('[data-i18n-skip]'));

function translateText(node) {
  if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue);
  const original = textOriginals.get(node);
  const key = original.replace(/\s+/g, ' ').trim();
  if (!key) return;
  const translated = t(key);
  const value = translated === key ? original : `${original.match(/^\s*/)[0]}${translated}${original.match(/\s*$/)[0]}`;
  if (node.nodeValue !== value) node.nodeValue = value;
}

function translateAttrs(el) {
  let originals = attrOriginals.get(el);
  if (!originals) {
    originals = {};
    for (const attr of STATIC_ATTRS) if (el.hasAttribute(attr)) originals[attr] = el.getAttribute(attr);
    attrOriginals.set(el, originals);
  }
  for (const [attr, original] of Object.entries(originals)) {
    const value = t(original);
    if (el.getAttribute(attr) !== value) el.setAttribute(attr, value);
  }
}

export function translateStatic(root = document) {
  for (const section of root.querySelectorAll(STATIC_ROOTS)) {
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!skipped(node)) translateText(node);
    }
    for (const el of [section, ...section.querySelectorAll('*')]) {
      if (!skipped(el)) translateAttrs(el);
    }
  }
}

// ---------------------------------------------------------------------------
// Arabic text, by English key
// ---------------------------------------------------------------------------
const AR = {
  // Site frame: header, drawers, footer (views/storefront.html)
  'Skip to content': 'انتقل إلى المحتوى',
  'Loading Mini Kitchen': 'جارٍ تحميل ميني كيتشن',
  'Mini Kitchen logo': 'شعار ميني كيتشن',
  'Catering · Restaurant · Delivery': 'ضيافة · مطعم · توصيل',
  'Open navigation menu': 'فتح قائمة التنقّل',
  Menu: 'القائمة',
  'Primary navigation': 'التنقّل الرئيسي',
  Home: 'الرئيسية',
  'Packages & Menus': 'الباقات والقوائم',
  'About Us': 'من نحن',
  Contact: 'تواصل معنا',
  Restaurant: 'المطعم',
  Delivery: 'التوصيل',
  'Order basket': 'سلّة الطلب',
  'Open order basket': 'فتح سلّة الطلب',
  'Catering & Events': 'الضيافة والمناسبات',
  'Restaurant · Aley': 'المطعم · عاليه',
  'Delivery · Aley': 'التوصيل · عاليه',
  'Catering WhatsApp': 'واتساب الضيافة',
  'Book a Table': 'احجزوا طاولة',
  'Order on WhatsApp': 'اطلبوا عبر واتساب',
  'Site navigation': 'التنقّل في الموقع',
  'Close menu': 'إغلاق القائمة',
  'Aley · Mount Lebanon': 'عاليه · جبل لبنان',
  'Catering for weddings, birthdays & occasions': 'ضيافة للأعراس وأعياد الميلاد والمناسبات',
  'Buffets, Birthday Minis, live stations & trays': 'بوفيهات، باقات أعياد الميلاد، محطات مباشرة وصوانٍ',
  'Our story and our team': 'قصتنا وفريقنا',
  'Phone, WhatsApp, form & map': 'الهاتف وواتساب والنموذج والخريطة',
  'Also from Mini Kitchen': 'أيضًا من ميني كيتشن',
  'Terrace dining in Ain Al Remmaneh': 'جلسات على التراس في عين الرمانة',
  'Order online, send on WhatsApp': 'اطلبوا عبر الموقع وأرسلوا الطلب عبر واتساب',
  'Track an order': 'تتبّع طلب',
  'Back Office': 'لوحة الإدارة',
  WhatsApp: 'واتساب',
  'Catering & weddings': 'الضيافة والأعراس',
  'Restaurant tables': 'حجز طاولات المطعم',
  'Delivery orders': 'طلبات التوصيل',
  'Your order': 'طلبكم',
  'Order Basket': 'سلّة الطلب',
  'Sent to Mini Kitchen on WhatsApp · +961 3 682 186': 'يُرسَل إلى ميني كيتشن عبر واتساب · \u2066+961 3 682 186\u2069',
  'Close basket': 'إغلاق السلّة',
  'Estimated total': 'المجموع التقديري',
  'Send Order on WhatsApp': 'أرسلوا الطلب عبر واتساب',
  'Planning an event?': 'تخطّطون لمناسبة؟',
  'Build your catering package in a few minutes': 'صمّموا باقة الضيافة الخاصة بكم في دقائق',
  'Send it on WhatsApp and our catering team confirms the menu, date and price with you.':
    'أرسلوها عبر واتساب، ويؤكّد معكم فريق الضيافة القائمة والموعد والسعر.',
  'Build your package': 'صمّموا باقتكم',
  'WhatsApp catering': 'واتساب الضيافة',
  'Lebanese and international cooking from Ain Al Remmaneh, Aley — for weddings, events, our terrace and your home.':
    'مطبخ لبناني وعالمي من عين الرمانة، عاليه، لأعراسكم ومناسباتكم، على تراسنا وحتى منازلكم.',
  'Instagram @minikitchen.leb': 'إنستغرام @minikitchen.leb',
  'Instagram @minikitchen.leb (opens in a new tab)': 'إنستغرام @minikitchen.leb (يُفتح في علامة تبويب جديدة)',
  TikTok: 'تيك توك',
  'TikTok (opens in a new tab)': 'تيك توك (يُفتح في علامة تبويب جديدة)',
  Facebook: 'فيسبوك',
  'Facebook (opens in a new tab)': 'فيسبوك (يُفتح في علامة تبويب جديدة)',
  Catering: 'الضيافة',
  'Visit & Call': 'زورونا واتصلوا بنا',
  'Daily 8:00 AM – 10:00 PM': 'يوميًا من 8:00 صباحًا حتى 10:00 مساءً',
  'Restaurant & delivery': 'المطعم والتوصيل',
  '© 2026 Mini Kitchen · Catering, Restaurant & Delivery · Ain Al Remmaneh, Aley':
    '© 2026 ميني كيتشن · ضيافة ومطعم وتوصيل · عين الرمانة، عاليه',
  'Back to top': 'العودة إلى الأعلى',
  // Catering offer: package cards, price lists, how it works
  Package: 'الباقة',
  'Event buffet': 'بوفيه المناسبات',
  'Birthday Mini': 'ميني أعياد الميلاد',
  'From {price} / person': 'ابتداءً من {price} للشخص الواحد',
  'Trays from {price}': 'الصواني ابتداءً من {price}',
  '{price} / person': '{price} للشخص الواحد',
  '{price} / kg': '{price} للكيلو',
  kg: 'كغ',
  'per person': 'للشخص الواحد',
  Recommended: 'موصى بها',
  '{label} catering buffet': 'بوفيه {label} من ميني كيتشن',
  'You choose': 'تختارون',
  '<strong>{name}</strong> included': '<strong>{name}</strong> ضمن الباقة',
  'Build this package': 'صمّموا هذه الباقة',
  Ask: 'استفسار',
  'Ideal for weddings': 'مثالية للأعراس',
  'Live pasta station': 'محطة الباستا المباشرة',
  'Live stations are coming soon.': 'المحطات المباشرة متوفّرة قريبًا.',
  'Trays are coming soon.': 'الصواني متوفّرة قريبًا.',
  'Mini bites are coming soon.': 'اللقيمات الصغيرة متوفّرة قريبًا.',
  'Mini beef shawarma bites': 'لقيمات شاورما لحم صغيرة',
  'Mini chicken shawarma bites': 'لقيمات شاورما دجاج صغيرة',
  'Included in every package': 'ضمن كل الباقات',
  'Our chef shares the current choices with you when you send your request.':
    'يطلعكم الشيف على الخيارات المتوفّرة حين ترسلون طلبكم.',
  'Event buffet menu': 'قائمة بوفيه المناسبات',
  'Event buffets': 'بوفيهات المناسبات',
  'Choose {n}': 'اختاروا {n}',
  'Choose {lo}–{hi}': 'اختاروا من {lo} إلى {hi}',
  'Show all {n} dishes': 'عرض كل الأطباق ({n})',
  'Show fewer dishes': 'عرض أطباق أقل',
  'Which menu': 'أي قائمة',
  Courses: 'الأصناف',
  'Birthday Mini menu': 'قائمة ميني أعياد الميلاد',
  'Our menu is coming soon.': 'قائمتنا متوفّرة قريبًا.',
  'Extras on request:': 'خدمات إضافية عند الطلب:',
  'Choose a package': 'اختاروا الباقة',
  'Event buffets and Birthday Minis are priced per person — or skip the package and pick stations, trays or mini bites.':
    'تُسعَّر بوفيهات المناسبات وباقات ميني لأعياد الميلاد للشخص الواحد، ويمكنكم الاستغناء عن الباقة واختيار محطات مباشرة أو صوانٍ أو لقيمات صغيرة.',
  'Build your menu': 'نسّقوا قائمتكم',
  'Pick your dishes, add live stations, trays and extras, and watch the estimate update as you go.':
    'اختاروا أطباقكم وأضيفوا المحطات المباشرة والصواني والخدمات الإضافية، وتابعوا التقدير يتحدّث فورًا.',
  'Send it on WhatsApp': 'أرسلوه عبر واتساب',
  'Your request arrives with our catering team, who confirm the menu, date and final price with you.':
    'يصل طلبكم إلى فريق الضيافة الذي يؤكّد معكم القائمة والموعد والسعر النهائي.',
  'Step {n}': 'الخطوة {n}',
  'Weddings and occasions — choose your appetizers, pastries, salads and hot main courses.':
    'للأعراس والمناسبات: اختاروا المقبلات والمعجنات والسلطات والأطباق الرئيسية الساخنة.',
  'Mini sandwiches, bites, salads, pastries and desserts for birthday parties.':
    'سندويشات ولقيمات وسلطات ومعجنات وحلويات صغيرة لحفلات أعياد الميلاد.',
  'Pasta, salad, grill, burger, sajj, shawarma and real fillet — cooked in front of your guests.':
    'باستا وسلطات ومشاوٍ وبرغر وصاج وشاورما وفيليه لحم، تُحضَّر أمام ضيوفكم.',
  'Main course trays for 30–40 people and La2mi La2mi mini bites.':
    'صواني أطباق رئيسية تكفي من 30 إلى 40 شخصًا، ولقيمات «لقمي لقمي» الصغيرة.',
  // Home page
  'A Mini Kitchen event set-up': 'تجهيزات إحدى مناسبات ميني كيتشن',
  'A Mini Kitchen event': 'مناسبة من تنظيم ميني كيتشن',
  'Mini Kitchen event': 'مناسبة من تنظيم ميني كيتشن',
  'Choose a photo': 'اختيار صورة',
  'Photo {n} of {total}': 'الصورة {n} من {total}',
  carousel: 'عرض صور',
  'Photos from our events': 'صور من مناسباتنا',
  'Play the slideshow': 'تشغيل عرض الصور',
  'Pause the slideshow': 'إيقاف عرض الصور مؤقتًا',
  'Mini Kitchen Catering · Aley, Lebanon': 'ميني كيتشن للضيافة · عاليه، لبنان',
  'Catering for weddings, birthdays &amp; every occasion': 'ضيافة للأعراس وأعياد الميلاد وكل المناسبات',
  'Event buffets, Birthday Mini packages, live stations and main course trays — priced per person, anywhere in Lebanon.':
    'بوفيهات المناسبات، باقات ميني لأعياد الميلاد، محطات مباشرة وصواني أطباق رئيسية، بأسعار للشخص الواحد وفي كل المناطق اللبنانية.',
  'See packages &amp; prices': 'الباقات والأسعار',
  'View photo: {title}': 'عرض الصورة: {title}',
  'Moments from our events': 'لحظات من مناسباتنا',
  Showcase: 'من أعمالنا',
  'What would you like for your event?': 'ماذا تختارون لمناسبتكم؟',
  'See {name}': 'عرض {name}',
  'See prices': 'الأسعار',
  'Event buffets · per person': 'بوفيهات المناسبات · للشخص الواحد',
  'Weddings &amp; occasions': 'الأعراس والمناسبات',
  'See our full catering menu': 'قائمة الضيافة كاملة',
  'Birthday Mini · per person': 'ميني أعياد الميلاد · للشخص الواحد',
  'Celebrate your day with Mini Kitchen': 'احتفلوا بيومكم مع ميني كيتشن',
  'Add-ons': 'إضافات',
  'Live stations': 'المحطات المباشرة',
  'Cooked in front of your guests. Add one to any package.': 'تُحضَّر أمام ضيوفكم، ويمكن إضافتها إلى أي باقة.',
  'Main course trays &amp; mini bites': 'صواني الأطباق الرئيسية واللقيمات الصغيرة',
  Gallery: 'معرض الصور',
  'From our events': 'من مناسباتنا',
  'Tap a photo to see it full screen.': 'اضغطوا على أي صورة لعرضها بملء الشاشة.',
  'How it works': 'كيف نعمل',
  'From first idea to confirmed menu': 'من الفكرة الأولى إلى القائمة المؤكّدة',
  'No forms to print and no deposit online — your request goes straight to our catering team.':
    'لا نماذج للطباعة ولا عربون عبر الإنترنت، فطلبكم يصل مباشرةً إلى فريق الضيافة.',
  'Start building your package': 'ابدأوا بتصميم باقتكم',
  'Good to know': 'معلومات تهمّكم',
  'Questions we are often asked': 'أسئلة متكرّرة',
  'Order from our menu on WhatsApp': 'اطلبوا من قائمتنا عبر واتساب',
  // Packages page
  'Mini Kitchen Catering · Packages': 'ميني كيتشن للضيافة · الباقات',
  'Packages &amp; menus': 'الباقات والقوائم',
  'Event buffets and Birthday Minis priced per person, plus live stations, main course trays and mini bites.':
    'بوفيهات المناسبات وباقات ميني لأعياد الميلاد بأسعار للشخص الواحد، إلى جانب المحطات المباشرة وصواني الأطباق الرئيسية واللقيمات الصغيرة.',
  'A Mini Kitchen catering buffet': 'بوفيه ضيافة من ميني كيتشن',
  'Priced per person': 'أسعار للشخص الواحد',
  'Choose your own dishes': 'اختاروا أطباقكم بأنفسكم',
  'Confirmed with you on WhatsApp': 'نؤكّد معكم عبر واتساب',
  'Catering menus': 'قوائم الضيافة',
  'Event Buffets': 'بوفيهات المناسبات',
  'Birthday Minis': 'ميني أعياد الميلاد',
  'Our Menu': 'قائمتنا',
  'Live Stations': 'المحطات المباشرة',
  'Main Course Trays': 'صواني الأطباق الرئيسية',
  'Mini Bites': 'اللقيمات الصغيرة',
  'See every dish you can choose': 'اطّلعوا على كل الأطباق المتاحة',
  'Our catering menu': 'قائمة الضيافة',
  'Every dish you can choose from, before you build your package. The numbers show how many of each course every package includes.':
    'كل الأطباق التي يمكنكم الاختيار منها قبل تصميم باقتكم، وتبيّن الأرقام عدد الأطباق من كل صنف في كل باقة.',
  'Event buffets — price per person': 'بوفيهات المناسبات — السعر للشخص الواحد',
  'Birthday Mini — price per person': 'ميني أعياد الميلاد — السعر للشخص الواحد',
  'Add a live station to any package. Per-person stations are priced for every guest; shawarma and real fillet are priced per kg.':
    'أضيفوا محطة مباشرة إلى أي باقة. تُسعَّر معظم المحطات للشخص الواحد عن كل ضيف، أما الشاورما وفيليه اللحم فتُسعَّران بالكيلو.',
  'Add a station to your request': 'أضيفوا محطة إلى طلبكم',
  'Main course trays': 'صواني الأطباق الرئيسية',
  'Each tray serves 30–40 people. Prices in US dollars.':
    'تكفي كل صينية من 30 إلى 40 شخصًا. الأسعار بالدولار الأميركي.',
  'Add trays to your request': 'أضيفوا صوانيَ إلى طلبكم',
  'Mini bites — La2mi La2mi': 'اللقيمات الصغيرة — لقمي لقمي',
  'Small bites, big taste. Prices in US dollars.': 'لقيمات صغيرة بنكهة كبيرة. الأسعار بالدولار الأميركي.',
  'Add mini bites to your request': 'أضيفوا لقيمات صغيرة إلى طلبكم',
  'Three steps to your event menu': 'ثلاث خطوات إلى قائمة مناسبتكم',
  // Build your package
  'Pick a package above to choose your dishes, or skip it and add stations, trays or mini bites below.':
    'اختاروا باقة من الأعلى لتحديد أطباقكم، أو تجاوزوها وأضيفوا محطات أو صوانيَ أو لقيمات صغيرة أدناه.',
  'Tray: {name}': 'صينية: {name}',
  'Mini bites: {name}': 'لقيمات صغيرة: {name}',
  'On request': 'عند الطلب',
  'Extras are priced on request.': 'تُسعَّر الخدمات الإضافية عند الطلب.',
  'Our team confirms the final menu and price with you on WhatsApp.':
    'يؤكّد فريقنا معكم القائمة والسعر النهائيين عبر واتساب.',
  'Choose a package, a station, trays or mini bites to see an estimate.':
    'اختاروا باقة أو محطة أو صوانيَ أو لقيمات صغيرة لعرض التقدير.',
  'No package': 'من دون باقة',
  'Choose one': 'اختاروا باقة',
  Dishes: 'الأطباق',
  '{n} of {total} done': '{n} من {total} مكتملة',
  Included: 'ضمن الباقة',
  'With a package': 'مع الباقة',
  Added: 'أُضيفت',
  Optional: 'اختياري',
  'Your details': 'بياناتكم',
  'Name & phone': 'الاسم والهاتف',
  '(done)': '(مكتملة)',
  '(to do)': '(غير مكتملة)',
  'No package — stations, trays or mini bites only': 'من دون باقة — محطات أو صوانٍ أو لقيمات صغيرة فقط',
  'Event buffets (weddings &amp; occasions)': 'بوفيهات المناسبات (الأعراس والمناسبات)',
  'To confirm': 'بانتظار التأكيد',
  'Our team will confirm the {list} options with you. Add any wishes under “Your preferences”.':
    'يؤكّد فريقنا معكم خيارات {list}. أضيفوا رغباتكم في خانة «تفضيلاتكم».',
  'choose {n}': 'اختاروا {n}',
  '{n} of {total} chosen': 'تم اختيار {n} من {total}',
  'Your preferences (optional)': 'تفضيلاتكم (اختياري)',
  'Dishes you love, allergies, vegetarian guests…': 'أطباق تحبّونها، حساسية غذائية، ضيوف نباتيون…',
  optional: 'اختياري',
  No: 'لا',
  '{name}, kg': '{name}، بالكيلو',
  '{name}, quantity': '{name}، الكمية',
  'Trays &amp; mini bites': 'الصواني واللقيمات الصغيرة',
  'each serves 30–40 people': 'تكفي كل صينية من 30 إلى 40 شخصًا',
  '{price} a tray': '{price} للصينية',
  Extras: 'خدمات إضافية',
  'priced on request': 'تُسعَّر عند الطلب',
  'Request #{id}': 'الطلب \u2066#{id}\u2069',
  'Thank you — your request is ready on WhatsApp': 'شكرًا لكم، طلبكم جاهز في واتساب',
  'Press send in WhatsApp if you have not yet. Our catering team will reply there to confirm the menu, the date and the final price.':
    'اضغطوا «إرسال» في واتساب إن لم تفعلوا بعد، وسيردّ عليكم فريق الضيافة هناك لتأكيد القائمة والموعد والسعر النهائي.',
  'Open WhatsApp again': 'افتحوا واتساب مجددًا',
  'Start a new request': 'ابدأوا طلبًا جديدًا',
  'Your progress': 'مراحل الطلب',
  'Package &amp; guests': 'الباقة وعدد الضيوف',
  'Number of guests': 'عدد الضيوف',
  'Event date': 'تاريخ المناسبة',
  'Your dishes': 'أطباقكم',
  'Your name': 'الاسم',
  'e.g. Nadine Karam': 'مثلًا نادين كرم',
  'Phone / WhatsApp': 'الهاتف / واتساب',
  'e.g. 03 123 456': 'مثلًا \u206603 123 456\u2069',
  'Location / venue': 'المكان / القاعة',
  'e.g. Aley, Beirut, Bhamdoun': 'مثلًا عاليه، بيروت، بحمدون',
  Notes: 'ملاحظات',
  'Timing, set-up, anything else we should know': 'التوقيت، التجهيزات، وأي تفاصيل أخرى يهمّنا معرفتها',
  'Your estimate': 'التقدير',
  'Send my request on WhatsApp': 'إرسال الطلب عبر واتساب',
  'Nothing is booked or paid yet — we confirm everything with you first.':
    'لا حجز ولا دفع في هذه المرحلة، فنحن نؤكّد كل التفاصيل معكم أولًا.',
  'Plan your event with us': 'خطّطوا مناسبتكم معنا',
  'Choose a package and your dishes, add live stations, trays or mini bites, and send it to our catering team on WhatsApp. Your choices are saved on this device as you go.':
    'اختاروا الباقة وأطباقكم، وأضيفوا المحطات المباشرة أو الصواني أو اللقيمات الصغيرة، ثم أرسلوا طلبكم إلى فريق الضيافة عبر واتساب. تُحفَظ اختياراتكم على هذا الجهاز تلقائيًا.',
  'Enter the number of guests.': 'أدخلوا عدد الضيوف.',
  'Choose {n} {list} ({chosen} chosen).': 'اختاروا {n} من {list} (تم اختيار {chosen}).',
  'Choose a package, or add a station, trays or mini bites.': 'اختاروا باقة، أو أضيفوا محطة أو صوانيَ أو لقيمات صغيرة.',
  'Enter your name.': 'أدخلوا الاسم.',
  'Enter a phone number we can reach on WhatsApp.': 'أدخلوا رقم هاتف يمكننا التواصل معكم عليه عبر واتساب.',
  'Please check:': 'يُرجى التحقّق من:',
  'Request #{id} saved — opening WhatsApp…': 'حُفظ الطلب \u2066#{id}\u2069، جارٍ فتح واتساب…',
  'You can choose {n}. Untick one to change your choice.': 'يمكنكم اختيار {n} فقط. ألغوا أحد الاختيارات لتغييره.',
  'Catering request': 'طلب ضيافة',
  'Send request': 'إرسال الطلب',
  'WhatsApp our catering team': 'راسلوا فريق الضيافة عبر واتساب',
  // About, contact, restaurant and delivery pages
  'About Mini Kitchen': 'عن ميني كيتشن',
  'A family kitchen in the mountains of Aley': 'مطبخ عائلي في جبال عاليه',
  'A catering kitchen first — buffets, birthdays and live stations for your events — with our restaurant terrace and delivery on the side.':
    'مطبخ ضيافة قبل كل شيء، يقدّم البوفيهات وباقات أعياد الميلاد والمحطات المباشرة لمناسباتكم، ومعه تراس مطعمنا وخدمة التوصيل.',
  'The Mini Kitchen team at work': 'فريق ميني كيتشن أثناء العمل',
  'Our story': 'قصتنا',
  'Lebanese at heart, #NotSoTraditional in spirit': 'لبنانيون في الصميم، وغير تقليديين في الروح',
  'Mini Kitchen began in Ain Al Remmaneh, Aley, cooking the generous Lebanese food we grew up with — and adding a few modern American favourites along the way.':
    'انطلقت ميني كيتشن من عين الرمانة في عاليه، تطهو المأكولات اللبنانية السخية التي نشأنا عليها، وأضافت إليها مع الوقت بعض الأطباق الأميركية العصرية المحبّبة.',
  'As guests fell for our morning manakish, mezza, charcoal grills and the molten cheddar fountain, they asked us to cook for their weddings, company events and villa parties.':
    'ومع إعجاب ضيوفنا بمناقيش الصباح والمازة والمشاوي على الفحم ونافورة الشيدر الذائبة، صاروا يطلبون منا الطهو لأعراسهم ومناسبات شركاتهم وحفلاتهم الخاصة.',
  'Today the same brigade runs Mini Kitchen Catering, Restaurant and Delivery, with fresh, halal ingredients and the same care in every plate.':
    'واليوم يدير الفريق نفسه خدمات ميني كيتشن للضيافة والمطعم والتوصيل، بمكوّنات طازجة وحلال وبالعناية نفسها في كل طبق.',
  'Brands, one kitchen': 'علامات تجارية ومطبخ واحد',
  'Dishes on our menu': 'طبق في قائمتنا',
  'Fresh & halal': 'طازج وحلال',
  'A Mini Kitchen chef plating': 'شيف من ميني كيتشن يجهّز طبقًا',
  'Our team': 'فريقنا',
  'The people behind the plates': 'الفريق الذي يقف وراء كل طبق',
  'Behind the scenes': 'خلف الكواليس',
  'From our kitchen to your event': 'من مطبخنا إلى مناسبتكم',
  'Or build your package online': 'أو صمّموا باقتكم عبر الموقع',
  'Talk to the right team': 'تواصلوا مع الفريق المناسب',
  'Catering and weddings, a table at the restaurant, or a delivery order — we answer on WhatsApp and by phone.':
    'للضيافة والأعراس، أو لحجز طاولة في المطعم، أو لطلب التوصيل، نردّ عليكم عبر واتساب والهاتف.',
  'Weddings & events': 'الأعراس والمناسبات',
  'Packages, corporate events, private parties and live stations.':
    'الباقات، مناسبات الشركات، الحفلات الخاصة والمحطات المباشرة.',
  'Second line': 'رقم إضافي',
  'Message catering': 'راسلوا قسم الضيافة',
  'Dine in': 'في المطعم',
  'Table bookings, group dining and birthday tables in Ain Al Remmaneh.':
    'حجز الطاولات وجلسات المجموعات وطاولات أعياد الميلاد في عين الرمانة.',
  'Book a table': 'احجزوا طاولة',
  'Home & office': 'إلى المنزل والمكتب',
  'Hot food delivered across Aley, Bhamdoun, Souk El Gharb, Kahale and nearby.':
    'نوصل الطعام ساخنًا إلى عاليه وبحمدون وسوق الغرب والكحالة والمناطق المجاورة.',
  'Or order from our online menu': 'أو اطلبوا من قائمتنا على الموقع',
  'Order delivery': 'اطلبوا التوصيل',
  'Send us a message': 'أرسلوا لنا رسالة',
  'Fill in the details and press send — the message opens in WhatsApp with the right team.':
    'املأوا التفاصيل واضغطوا «إرسال»، فتُفتح الرسالة في واتساب مع الفريق المعني.',
  'Full name': 'الاسم الكامل',
  Phone: 'الهاتف',
  About: 'الموضوع',
  'Event buffet — wedding or occasion': 'بوفيه مناسبة — عرس أو مناسبة',
  'Live stations, trays or mini bites': 'محطات مباشرة أو صوانٍ أو لقيمات صغيرة',
  'Restaurant table booking': 'حجز طاولة في المطعم',
  'Delivery / group order': 'توصيل / طلب جماعي',
  'e.g. 100': 'مثلًا 100',
  Date: 'التاريخ',
  'e.g. Aley, Beirut, villa…': 'مثلًا عاليه، بيروت، فيلا…',
  'Package or services': 'الباقة أو الخدمات',
  'e.g. Wedding buffet, live burger station, mezza': 'مثلًا بوفيه عرس، محطة برغر مباشرة، مازة',
  Message: 'الرسالة',
  'Questions or special requests…': 'أسئلة أو طلبات خاصة…',
  'Send on WhatsApp': 'أرسلوا عبر واتساب',
  'Find us': 'موقعنا',
  'Ain Al Remmaneh, Aley': 'عين الرمانة، عاليه',
  'Map: Mini Kitchen, Ain Al Remmaneh': 'خريطة: ميني كيتشن، عين الرمانة',
  'Open in Google Maps': 'افتحوا في خرائط غوغل',
  'Visit us': 'زورونا',
  'Breakfast to dinner, with a view': 'من الفطور إلى العشاء، مع إطلالة',
  'Manakish and foul in the morning, charcoal grills and burgers at sunset. Walk in or book a table.':
    'مناقيش وفول في الصباح، ومشاوٍ على الفحم وبرغر عند الغروب. تفضّلوا مباشرةً أو احجزوا طاولة.',
  Directions: 'الاتجاهات',
  'Mini Kitchen Restaurant · Ain Al Remmaneh': 'مطعم ميني كيتشن · عين الرمانة',
  'Mountain views &amp; honest food': 'إطلالات جبلية وطعام أصيل',
  'Lebanese breakfast, charcoal grills, burgers and pizza on our terrace in Aley — every day from 8:00 AM to 10:00 PM.':
    'فطور لبناني ومشاوٍ على الفحم وبرغر وبيتزا على تراسنا في عاليه، يوميًا من 8:00 صباحًا حتى 10:00 مساءً.',
  'The Mini Kitchen restaurant terrace': 'تراس مطعم ميني كيتشن',
  'Terrace & family area': 'تراس وركن للعائلات',
  'Restaurant menu, photos and opening hours': 'قائمة المطعم والصور ومواعيد العمل',
  'Photos, hours &amp; map': 'الصور والمواعيد والخريطة',
  'Mini Kitchen Delivery · Aley': 'ميني كيتشن للتوصيل · عاليه',
  'Delivering to {areas} and nearby, daily from 8:00 AM to 10:00 PM.':
    'نوصل إلى {areas} والمناطق المجاورة، يوميًا من 8:00 صباحًا حتى 10:00 مساءً.',
  'A spread of Mini Kitchen dishes ready for delivery': 'تشكيلة من أطباق ميني كيتشن جاهزة للتوصيل',
  Basket: 'السلّة',
  'Delivery menu': 'قائمة التوصيل',
  'Welcome to Mini Kitchen Restaurant': 'أهلًا بكم في مطعم ميني كيتشن',
  'You are at table {table} · dine-in, no delivery fee':
    'أنتم على الطاولة رقم {table} · داخل المطعم، من دون رسوم توصيل',
  'Call waiter': 'استدعاء النادل',
  'Inquiry #{id} recorded & opening WhatsApp...': 'سُجّل الاستفسار \u2066#{id}\u2069، جارٍ فتح واتساب…',
  // Reviews and photo viewer
  'Kind words': 'كلمات طيّبة',
  'What our guests say': 'ماذا يقول ضيوفنا',
  '{n} out of 5 stars': '{n} من 5 نجوم',
  'Valued Client': 'عميل كريم',
  'Mini Kitchen client': 'عميل ميني كيتشن',
  'Photo viewer': 'عارض الصور',
  Close: 'إغلاق',
  'Previous photo': 'الصورة السابقة',
  'Next photo': 'الصورة التالية',
  // Delivery and restaurant menu, basket, dish options
  Popular: 'الأكثر طلبًا',
  Spicy: 'حارّ',
  Vegetarian: 'نباتي',
  Veg: 'نباتي',
  Sharing: 'للمشاركة',
  'Sold out': 'نفد',
  Add: 'إضافة',
  '{n} in basket': '{n} في السلّة',
  '{n} in basket, add another': '{n} في السلّة، إضافة المزيد',
  Options: 'خيارات',
  'Prepared fresh to order in our Ain Al Remmaneh, Aley kitchen.':
    'يُحضَّر طازجًا عند الطلب في مطبخنا في عين الرمانة، عاليه.',
  'Prepared fresh to order with signature Mini Kitchen ingredients.':
    'يُحضَّر طازجًا عند الطلب بمكوّنات ميني كيتشن المميّزة.',
  'Prepared fresh to order in our Ain Al Remmaneh, Aley kitchen using signature Mini Kitchen ingredients.':
    'يُحضَّر طازجًا عند الطلب في مطبخنا في عين الرمانة، عاليه، بمكوّنات ميني كيتشن المميّزة.',
  '{n} dishes': 'عدد الأطباق: {n}',
  'All categories': 'كل الأصناف',
  'Ask about this': 'استفسروا عن هذا القسم',
  'See all {n} dishes': 'عرض كل الأطباق ({n})',
  'No matching dishes': 'لا أطباق مطابقة',
  'Try another search or filter, or ask us on WhatsApp.': 'جرّبوا بحثًا أو تصفية أخرى، أو اسألونا عبر واتساب.',
  'Reset filters': 'إلغاء التصفية',
  Categories: 'الأصناف',
  'Show all': 'عرض الكل',
  'Tap a dish to choose options and add it': 'اضغطوا على أي طبق لاختيار الإضافات وإضافته',
  'All Categories': 'كل الأصناف',
  All: 'الكل',
  'Search {n} dishes…': 'ابحثوا بين الأطباق ({n})…',
  'Switch Menu Currency': 'تغيير عملة القائمة',
  'Switch Menu Layout': 'تغيير طريقة العرض',
  '$ USD': '$ دولار',
  'L.L. LBP': 'ل.ل. ليرة',
  List: 'قائمة',
  Photos: 'صور',
  'All dishes': 'كل الأطباق',
  'For sharing': 'للمشاركة',
  'Rate: 1 USD = {rate} L.L.': 'سعر الصرف: 1 دولار = {rate} ل.ل.',
  'Prices shown in USD ($)': 'الأسعار بالدولار الأميركي ($)',
  'Required · choose 1': 'إلزامي · اختاروا واحدًا',
  'Note for the kitchen (optional)': 'ملاحظة للمطبخ (اختياري)',
  'e.g. no pickles, allergy note…': 'مثلًا من دون مخلّلات، ملاحظة عن الحساسية…',
  'Add to basket': 'أضيفوا إلى السلّة',
  'Added {qty}x "{title}" to your Order!': 'أُضيف {qty} × «{title}» إلى طلبكم!',
  'This dish is currently marked Sold Out.': 'هذا الطبق غير متوفّر حاليًا.',
  'Your basket': 'سلّتكم',
  'Review &amp; send': 'المراجعة والإرسال',
  'Your basket is empty': 'سلّتكم فارغة',
  'Open the menu and tap any dish to add it.': 'افتحوا القائمة واضغطوا على أي طبق لإضافته.',
  'Browse the menu': 'تصفّحوا القائمة',
  'Note: “{note}”': 'ملاحظة: «{note}»',
  '{price} each': '{price} للواحدة',
  'One less': 'إنقاص واحد',
  'One more': 'إضافة واحد',
  '{label} applied ({amount})': 'طُبّق {label} ({amount})',
  'Promo code': 'رمز الخصم',
  'e.g. WELCOME10': 'مثلًا WELCOME10',
  Apply: 'تطبيق',
  'Remove promo code': 'إزالة رمز الخصم',
  Name: 'الاسم',
  'e.g. Rami': 'مثلًا رامي',
  'e.g. +961 3 123 456': 'مثلًا \u2066+961 3 123 456\u2069',
  'Address or table': 'العنوان أو رقم الطاولة',
  'Street, building, floor': 'الشارع، المبنى، الطابق',
  'Note for the kitchen': 'ملاحظة للمطبخ',
  'e.g. extra garlic, call on arrival': 'مثلًا ثوم إضافي، الاتصال عند الوصول',
  Items: 'الأصناف',
  'Clear all': 'إفراغ السلّة',
  'Delivery area or dine-in': 'منطقة التوصيل أو تناول الطعام في المطعم',
  FREE: 'مجانًا',
  'Delivery ({zone})': 'التوصيل ({zone})',
  'Promo ({code})': 'الخصم ({code})',
  Total: 'المجموع',
  'Promo code {code} applied ({amount})!': 'طُبّق رمز الخصم {code} ({amount})!',
  'Order #{id} recorded & opening WhatsApp...': 'سُجّل الطلب \u2066#{id}\u2069، جارٍ فتح واتساب…',
  'Promo code "{code}" is not valid.': 'رمز الخصم «{code}» غير صالح.',
  'Code {code} requires a minimum order of {amount}.': 'يتطلّب الرمز {code} طلبًا لا تقلّ قيمته عن {amount}.',
  Aley: 'عاليه',
  '10% OFF Welcome Discount': 'خصم ترحيبي 10%',
  '15% OFF Aley VIP Order ($35+)': 'خصم 15% للطلبات المميّزة في عاليه (من $35)',
  '$2.00 Delivery Credit': 'رصيد توصيل بقيمة $2.00',
  // Order tracker
  'Track your order or quote': 'تتبّعوا طلبكم أو عرض السعر',
  'Order tracker': 'تتبّع الطلبات',
  'Close tracker': 'إغلاق نافذة التتبّع',
  'Order reference, e.g. MK-1001': 'رقم الطلب، مثلًا MK-1001',
  'Order reference': 'رقم الطلب',
  Track: 'تتبّع',
  'Looking up your order…': 'جارٍ البحث عن طلبكم…',
  'Looking up <b>#{id}</b>…': 'جارٍ البحث عن <b>\u2066#{id}\u2069</b>…',
  'Order #{id} not found': 'لم نعثر على الطلب \u2066#{id}\u2069',
  'Please check the reference on your WhatsApp message, for example <b>MK-1001</b>.':
    'يُرجى التحقّق من رقم الطلب في رسالة واتساب، مثلًا <b>MK-1001</b>.',
  'This order was cancelled. Message us on WhatsApp if you need help.':
    'أُلغي هذا الطلب. راسلونا عبر واتساب إن احتجتم إلى المساعدة.',
  'Order Received': 'استلمنا الطلب',
  Confirmed: 'تم التأكيد',
  'Preparing in Kitchen': 'قيد التحضير في المطبخ',
  'Out for Delivery / Ready': 'في الطريق إليكم / جاهز',
  Completed: 'مكتمل',
  'Catering & Event Quote': 'عرض سعر للضيافة والمناسبات',
  'Restaurant Table Booking': 'حجز طاولة في المطعم',
  'Delivery Order': 'طلب توصيل',
  'Valued Guest': 'ضيفنا الكريم',
  'Reference #{id}': 'رقم المرجع \u2066#{id}\u2069',
  Refresh: 'تحديث',
  Summary: 'الملخّص',
  Occasion: 'المناسبة',
  Guests: 'عدد الضيوف',
  'Updated {time}': 'آخر تحديث {time}',
  'Ask about #{id}': 'استفسروا عن \u2066#{id}\u2069',
  // Published defaults: location, delivery areas and zones
  'Ain Al Remmaneh, Aley, Mount Lebanon': 'عين الرمانة، عاليه، جبل لبنان',
  'Main Road, Ain Al Remmaneh (Ein L Remeneh), Aley District, Mount Lebanon, Lebanon':
    'الطريق العام، عين الرمانة، قضاء عاليه، جبل لبنان، لبنان',
  'Daily from 8:00 AM to 10:00 PM': 'يوميًا من 8:00 صباحًا حتى 10:00 مساءً',
  'Ain Al Remmaneh': 'عين الرمانة',
  'Aley Center': 'وسط عاليه',
  'Souk El Gharb': 'سوق الغرب',
  Bhamdoun: 'بحمدون',
  Kahale: 'الكحالة',
  Bsous: 'بسوس',
  Qmatiyeh: 'قماطية',
  Kayfoun: 'كيفون',
  Baysour: 'بيصور',
  'Bleibel & Surrounding Mount Lebanon Areas': 'بليبل ومناطق جبل لبنان المجاورة',
  'Ain Al Remmaneh (Local Area)': 'عين الرمانة (المنطقة المحلية)',
  'Aley Center / Ras El Jabal / Souk': 'وسط عاليه / رأس الجبل / السوق',
  'Bhamdoun / Souk El Gharb / Bsous': 'بحمدون / سوق الغرب / بسوس',
  'Kahale / Araya / Jamhour': 'الكحالة / عاريا / الجمهور',
  'Restaurant Dine-In / Self Pickup (Aley Terrace)': 'في المطعم / استلام شخصي (تراس عاليه)',
  // Published defaults: galleries, team and reviews
  'Luxury Mountain Wedding Reception': 'حفل زفاف فاخر في الجبل',
  'Full-service bridal banquet & floral buffet styling in Mount Lebanon':
    'مأدبة زفاف بخدمة متكاملة وبوفيه مزيّن بالزهور في جبل لبنان',
  'Grand Lebanese Mezza Table': 'مائدة مازة لبنانية عامرة',
  'Authentic hommos, moutabal, wara2 enab, kibbeh, and hot mezza display':
    'حمّص ومتبّل وورق عنب وكبّة وتشكيلة من المازة الساخنة',
  'Elegant Outdoor Bridal Table Arrangement': 'تنسيق أنيق لطاولة العروسين في الهواء الطلق',
  'Bespoke table settings, crystal glassware, and curated multi-course menus':
    'طاولات منسّقة حسب الطلب وأوانٍ كريستالية وقوائم متعدّدة الأطباق مختارة بعناية',
  'Signature Molten Cheddar Fountain Station': 'محطة نافورة الشيدر الذائبة',
  'Interactive cheese fountain with crispy bites for private parties & weddings':
    'نافورة جبنة تفاعلية مع لقيمات مقرمشة للحفلات الخاصة والأعراس',
  'Executive Corporate Gala Buffet': 'بوفيه راقٍ لحفلات الشركات',
  'Chafing dish presentations and uniformed service for 250+ corporate guests':
    'تقديم في أوانٍ حافظة للحرارة وطاقم خدمة بزيّ موحّد لأكثر من 250 ضيفًا',
  'Charcoal Beef Fillet & Grill Presentation': 'فيليه لحم ومشاوٍ على الفحم',
  '350g Halal beef fillet seared over charcoal with creamy mushroom sauce':
    'فيليه لحم حلال بوزن 350 غ مشويّ على الفحم مع صلصة الفطر بالكريمة',
  'Panoramic Aley Mountain Sunset View': 'إطلالة بانورامية على غروب جبال عاليه',
  'Breathtaking horizon views from our terrace in Ain Al Remmaneh, Aley':
    'إطلالات خلّابة على الأفق من تراسنا في عين الرمانة، عاليه',
  'Open-Air Terrace & Evening Ambiance': 'تراس في الهواء الطلق وأجواء مسائية',
  'Cool mountain breeze, warm ambient lighting, and relaxed family seating':
    'نسيم جبلي عليل وإضاءة دافئة وجلسات عائلية مريحة',
  'Traditional Lebanese Breakfast on the Terrace': 'فطور لبناني تقليدي على التراس',
  'Foul, Balila, Grilled Halloum, Labneh, Eggs with Kawarma & Hot Manakish':
    'فول، بليلة، حلّوم مشوي، لبنة، بيض بالقاورما ومناقيش ساخنة',
  'The Kingdom of Burgers & Cheddar Syringe': 'مملكة البرغر وحقنة الشيدر',
  'Charcoal-grilled homemade beef burgers with molten cheddar & crispy sides':
    'برغر لحم من تحضيرنا مشويّ على الفحم مع الشيدر الذائب وأطباق جانبية مقرمشة',
  'Authentic Lebanese Mezza & Charcoal Grills': 'مازة لبنانية أصيلة ومشاوٍ على الفحم',
  'Generous family tables filled with cold mezza, hot appetizers, and mixed grills':
    'موائد عائلية عامرة بالمازة الباردة والمقبلات الساخنة والمشاوي المشكّلة',
  'Cozy Interior & Family-Friendly Lounge': 'صالة داخلية دافئة تناسب العائلات',
  'Modern, welcoming dining room designed for families, friends, and celebrations':
    'صالة طعام عصرية ومرحّبة، مصمّمة للعائلات والأصدقاء والاحتفالات',
  'Precision Kitchen Preparation': 'تحضير دقيق في المطبخ',
  'Daily fresh vegetable preparation, house-ground beef patties, and scratch-made sauces in our Aley kitchen.':
    'خضار طازجة نحضّرها يوميًا، وأقراص لحم نفرمها بأنفسنا، وصلصات نعدّها من الصفر في مطبخنا في عاليه.',
  'Live Charcoal Grill Mastery': 'براعة الشواء على الفحم',
  'Searing prime beef fillets, shish tawouk, and homemade burgers over real charcoal for unmistakable aroma.':
    'نشوي فيليه اللحم الممتاز والشيش طاووق والبرغر المحضّر لدينا على فحم حقيقي، لنكهة لا تُخطئها.',
  'Wedding Buffet Architecture & Setup': 'تصميم بوفيه الأعراس وتجهيزه',
  'Our event team arranging floral centerpieces, porcelain platters, and gold chafing dishes hours before guest arrival.':
    'فريق المناسبات ينسّق الزهور وأطباق البورسلين والأواني الذهبية الحافظة للحرارة قبل وصول الضيوف بساعات.',
  'White-Glove Service at Weddings & Galas': 'خدمة راقية في الأعراس والحفلات',
  'Attentive, uniformed hospitality staff ensuring every guest enjoys warm, freshly replenished dishes.':
    'طاقم ضيافة بزيّ موحّد يحرص على أن يستمتع كل ضيف بأطباق ساخنة تُجدَّد باستمرار.',
  'Executive Culinary Director': 'المدير التنفيذي للطهي',
  'Head of Catering & Menu Innovation': 'رئيس قسم الضيافة وتطوير القوائم',
  "Mastermind behind Mini Kitchen's #NotSoTraditional philosophy—blending time-honored Lebanese mountain recipes with bold American culinary flair.":
    'العقل المدبّر لفلسفة ميني كيتشن غير التقليدية، التي تمزج وصفات الجبل اللبناني العريقة بلمسة أميركية جريئة.',
  'Master of Lebanese Mezza & Grill': 'خبير المازة اللبنانية والمشاوي',
  'Senior Oriental & Charcoal Chef': 'كبير طهاة المطبخ الشرقي والمشاوي',
  'Specializes in authentic Lebanese cold & hot mezza, premium halal meat aging, charcoal mixed grills, and large-scale wedding banquet production.':
    'متخصّص في المازة اللبنانية الباردة والساخنة، وتعتيق اللحوم الحلال الممتازة، والمشاوي المشكّلة على الفحم، وإعداد مآدب الأعراس الكبيرة.',
  'Artisan Bakery & Pastry Chef': 'شيف المخبوزات والحلويات',
  'Bil Foron, Knefe & Dessert Specialist': 'اختصاصي مخبوزات الفرن والكنافة والحلويات',
  'Leads our morning Saj & Bil Foron oven, handcrafted pizza doughs, homemade Lebanese Knefe, and live dessert stations at weddings.':
    'يشرف على الصاج والفرن الصباحي، وعجين البيتزا المحضّر يدويًا، والكنافة اللبنانية البيتية، ومحطات الحلويات المباشرة في الأعراس.',
  'Events & Hospitality Operations Manager': 'مدير عمليات المناسبات والضيافة',
  'Wedding & Corporate Event Execution': 'تنفيذ الأعراس ومناسبات الشركات',
  'Coordinates every detail from initial menu tasting and venue layout to uniformed waitstaff choreography and on-time event execution.':
    'ينسّق كل التفاصيل، من تذوّق القائمة الأول وتخطيط المكان إلى تنظيم طاقم الخدمة وتنفيذ المناسبة في موعدها.',
  'Nadine & Karim H.': 'نادين وكريم ح.',
  'Outdoor Mountain Wedding • 220 Guests (Aley)': 'عرس في الهواء الطلق في الجبل • 220 ضيفًا (عاليه)',
  'Mini Kitchen Catering made our wedding in Mount Lebanon unforgettable. Guests are still talking about the live charcoal burger & cheddar station alongside the traditional Lebanese mezza buffet!':
    'جعلت ميني كيتشن للضيافة عرسنا في جبل لبنان لا يُنسى. ما زال ضيوفنا يتحدّثون عن محطة البرغر والشيدر المباشرة على الفحم إلى جانب بوفيه المازة اللبنانية التقليدية!',
  'Tarek El-Khoury': 'طارق الخوري',
  'Corporate Annual Gala • 110 Guests (Beirut)': 'الحفل السنوي لشركة • 110 ضيوف (بيروت)',
  'Flawless presentation, punctual white-glove waitstaff, and generous portions. Their executive buffet and canapé setup exceeded five-star hotel standards.':
    'تقديم لا تشوبه شائبة، وطاقم خدمة راقٍ ودقيق في مواعيده، وحصص سخية. فاق البوفيه والكانابيه مستوى فنادق الخمس نجوم.',
  'Maya & Family': 'مايا والعائلة',
  'Restaurant Terrace & WhatsApp Delivery • Bhamdoun': 'تراس المطعم والتوصيل عبر واتساب • بحمدون',
  'Whether we visit the Ain Al Remmaneh terrace for sunset views and Manakish Bil Foron or order the Kingdom of Burgers to our villa via WhatsApp, the quality is always 10/10.':
    'سواء زرنا التراس في عين الرمانة لنستمتع بالغروب ومناقيش الفرن، أو طلبنا من «مملكة البرغر» إلى منزلنا عبر واتساب، فالجودة دائمًا 10/10.',
  // Menu categories (public/js/data/menu.js); dish names stay as written
  'Hot Offers & Formulas': 'عروض ووجبات مميّزة',
  'Special bundles & 4-person sharing formulas': 'عروض خاصة ووجبات مشاركة لأربعة أشخاص',
  'Lebanese Breakfast': 'فطور لبناني',
  'Served daily starting 8:00 AM with fresh vegetables & warm bread':
    'يُقدَّم يوميًا ابتداءً من 8:00 صباحًا مع خضار طازجة وخبز ساخن',
  'Bil Foron (Manakish)': 'مناقيش عالفرن',
  'Freshly baked dough from our stone oven': 'عجين طازج من فرننا الحجري',
  'Pinch of Bites': 'لقيمات ومقبّلات',
  'Crispy starters, loaded fries & sharing appetizers': 'مقبّلات مقرمشة وبطاطا بالإضافات ومقبّلات للمشاركة',
  'Cheddar Fountain': 'نافورة الشيدر',
  'Our famous molten cheddar cheese fountain & dippers': 'نافورة جبنة الشيدر الذائبة الشهيرة مع ما يُغمَس فيها',
  'Kingdom of Burgers': 'مملكة البرغر',
  'Charcoal-grilled beef & crispy chicken burgers served with fries & coleslaw':
    'برغر لحم مشويّ على الفحم وبرغر دجاج مقرمش، مع البطاطا وسلطة الملفوف',
  'The Club Sandwiches': 'سندويشات الكلوب',
  'Artisan subs & baguettes served with fries and coleslaw': 'سندويشات صب وباغيت مع البطاطا وسلطة الملفوف',
  Pizzeria: 'البيتزا',
  'Fresh oven-baked medium pizzas with homemade sauce & mozzarella':
    'بيتزا وسط طازجة من الفرن مع صلصة بيتية وموتزاريلا',
  'Main Courses & Grills': 'الأطباق الرئيسية والمشاوي',
  'Charcoal mixed grills, 350g beef fillet, farrouj msahab & platters':
    'مشاوٍ مشكّلة على الفحم، فيليه لحم 350 غ، فرّوج مسحّب وأطباق مشكّلة',
  'Tortilla Wraps': 'لفائف التورتيلا',
  'Griddled wraps stuffed with marinated chicken & sauces': 'لفائف محمّصة محشوّة بالدجاج المتبّل والصلصات',
  'Artisan Pasta': 'الباستا',
  'Tagliatelle & penne in creamy Alfredo, truffle cheese, or spicy marinara':
    'تالياتيلي وبيني بصلصة ألفريدو الكريمية أو جبنة الكمأة أو المارينارا الحارّة',
  'Salads Corner': 'ركن السلطات',
  'Crisp garden salads, Lebanese tabbouleh, fattoush & seafood salads':
    'سلطات خضراء مقرمشة، تبّولة لبنانية، فتّوش وسلطات ثمار البحر',
  'Lebanese Mezza': 'المازة اللبنانية',
  'Authentic cold & hot Lebanese mezza, nayye & hot specialties':
    'مازة لبنانية أصيلة باردة وساخنة، نيّة وأطباق ساخنة مميّزة',
  'Kids Corner': 'ركن الأطفال',
  'Kid-sized favorites served with golden fries': 'أطباق الأطفال المفضّلة بحصص صغيرة مع بطاطا ذهبية',
  'Desserts & Knefe': 'الحلويات والكنافة',
  'Homemade Knefe, Nutella Calzone, Fondant, Pain Perdu & Ice Cream':
    'كنافة بيتية، كالزوني بالنوتيلا، فوندان، بان بيردو وبوظة',
  Crêperie: 'الكريب',
  'Freshly folded sweet crêpes with Nutella, Lotus, Oreo & Kinder': 'كريب حلو طازج بالنوتيلا واللوتس والأوريو والكيندر',
  'Hot Beverages': 'المشروبات الساخنة',
  'Lebanese Rakwe coffee, espresso, hot chocolate, sahlab & herbal teas':
    'قهوة لبنانية بالركوة، إسبريسو، شوكولا ساخنة، سحلب وشاي أعشاب',
  'Fresh Juices & Iced Tea': 'العصائر الطازجة والشاي المثلّج',
  'Freshly squeezed fruits, minted lemonade, mojitos & iced teas':
    'عصير فواكه طازج، ليموناضة بالنعناع، موهيتو وشاي مثلّج',
  Milkshakes: 'ميلك شيك',
  'Thick creamy Oreo, Lotus, Chocolate, Strawberry & Vanilla shakes':
    'ميلك شيك كثيف بالأوريو واللوتس والشوكولا والفراولة والفانيلا',
  'Soft Drinks & Bar': 'المشروبات الغازية والبار',
  'Chilled soft drinks, sparkling water, Laban Ayran & beers': 'مشروبات غازية باردة، مياه فوّارة، لبن عيران وبيرة',
  'Awesome Add-Ons': 'إضافات مميّزة',
  'Extra cheddar syringe, fried mozzarella patty, curly fries & dips':
    'حقنة شيدر إضافية، قرص موتزاريلا مقلي، بطاطا مجعّدة وصلصات',
  'Arguileh Lounge': 'ركن الأرجيلة',
  'Traditional & exotic shisha flavors served with natural charcoal':
    'نكهات أرجيلة تقليدية ومميّزة تُقدَّم مع فحم طبيعي',
  // Dish options (modifier groups in public/js/data/menu.js and the default serving choice)
  'Preparation & Spice Preference': 'طريقة التحضير ودرجة الحرّ',
  'Classic Signature Preparation': 'تحضيرنا الكلاسيكي',
  'Make It Spicy (House Chili Sauce)': 'حارّ (صلصة الفلفل الخاصة بنا)',
  'Sauce on the Side': 'الصلصة على حدة',
  'Awesome Add-Ons & Upgrades': 'إضافات وترقيات مميّزة',
  '200g Molten Cheddar Syringe': 'حقنة شيدر ذائب 200 غ',
  'Deep-Fried Mozzarella Patty': 'قرص موتزاريلا مقلي',
  'Extra 200g Beef Patty': 'قرص لحم إضافي 200 غ',
  'Smoked Beef Bacon': 'بيكون لحم بقر مدخّن',
  'Fried Farm Egg': 'بيضة بلدية مقلية',
  'Upgrade Fries to Curly Fries': 'استبدال البطاطا ببطاطا مجعّدة',
  'Warm Cheddar Dipping Cup': 'كوب شيدر ساخن للغمس',
  'Charcoal Grill Preference': 'درجة الشواء على الفحم',
  'Medium-Well (Chef Recommended)': 'متوسّط إلى ناضج (اقتراح الشيف)',
  'Well-Done': 'ناضج تمامًا',
  Medium: 'متوسّط',
  'Extra Sides & Condiments': 'أطباق جانبية وإضافات',
  'Extra Whipped Garlic Toum': 'ثوم مخفوق إضافي',
  'Mushroom White Sauce Cup': 'كوب صلصة الفطر البيضاء',
  'Add Grilled Chicken Breast': 'إضافة صدر دجاج مشوي',
  'Side of Curly Fries': 'طبق جانبي من البطاطا المجعّدة',
  'Bread & Accompaniment': 'الخبز والمرافقات',
  'Warm Arabic & Thyme Flatbread': 'خبز عربي ساخن ورقائق بالزعتر',
  'Extra Fresh Veggie Crudités': 'خضار طازجة إضافية',
  'Morning Add-Ons': 'إضافات الصباح',
  'Add Fried Egg': 'إضافة بيضة مقلية',
  'Side of Makdous': 'طبق جانبي من المكدوس',
  'Cup of Lebanese Tea': 'كوب شاي لبناني',
  'Baking Style': 'طريقة الخَبز',
  'Classic Stone-Baked Medium': 'كلاسيكية على الحجر، خَبز متوسّط',
  'Crispy Well-Baked Crust': 'عجينة مقرمشة جيّدة الخَبز',
  'Extra Toppings & Dips': 'إضافات وصلصات',
  'Molten Cheddar Syringe': 'حقنة شيدر ذائب',
  'Extra Mozzarella Cheese': 'موتزاريلا إضافية',
  'Ranch / BBQ Dip Sauce': 'صلصة رانش / باربكيو للغمس',
  'Select Your Dippers & Bites': 'اختاروا ما تغمسونه في النافورة',
  '+ Crispy Chicken Piece': '+ قطعة دجاج مقرمشة',
  '+ Mozzarella Stick': '+ إصبع موتزاريلا',
  '+ Mozzarella Jalapeño Popper': '+ موتزاريلا بالهالابينو',
  '+ BBQ / Buffalo Wing': '+ جانح باربكيو / بافالو',
  '+ Onion Rings (5 pcs)': '+ حلقات بصل (5 قطع)',
  '+ Frankfurter Sausage': '+ نقانق فرانكفورتر',
  '+ Chicken Escalope Piece': '+ قطعة إسكالوب دجاج',
  'Sweet Enhancements': 'إضافات حلوة',
  'Add Vanilla Ice Cream Scoop': 'إضافة كرة بوظة فانيلا',
  'Add Fresh Strawberries': 'إضافة فراولة طازجة',
  'Add Sliced Banana': 'إضافة شرائح موز',
  'Add Kinder Chocolate': 'إضافة شوكولا كيندر',
  'Add Warm Brownie Pieces': 'إضافة قطع براونيز ساخنة',
  'Customize Your Pasta': 'خصّصوا طبق الباستا',
  'Extra Parmesan & Mozzarella': 'بارميزان وموتزاريلا إضافية',
  'Make It Spicy (Arrabbiata Chili)': 'حارّ (فلفل أرابياتا)',
  'Serving & Preparation Preference': 'طريقة التقديم والتحضير',
  'Chef Signature Preparation': 'تحضير الشيف الخاص',
  'Extra Hot / Fresh from Oven': 'ساخن جدًا / طازج من الفرن',
  'Dressings & Sauces on the Side': 'الصلصات والتتبيلات على حدة'
};
