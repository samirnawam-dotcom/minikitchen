// Catering offer published with the website, and the upgrades that bring a saved site config up to
// date with it. Saved lists always win over the defaults; two one-off upgrades run on configs saved
// before them (a Back Office save records CATERING_MENU_VERSION, so later edits stay the owner's):
//   • version 2 — dish lists saved empty before the dishes were published are filled once;
//   • version 3 — Arabic names, labels, details and taglines that still read exactly as an earlier
//     published default are replaced with the corrected Arabic. Text the owner wrote is never changed.
// This module has no imports, so the unit tests can load it on its own.

export const CATERING_MENU_VERSION = 3;
const DISHES_VERSION = 2;

/** Site config lists that carry the catering offer. */
export const CATERING_LIST_KEYS = [
  'cateringTypes',
  'cateringChoiceGroups',
  'eventPackages',
  'liveStationMenu',
  'mainCourseTrays',
  'miniBites',
  'cateringExtras'
];

/** Arabic text published before version 3 → its corrected wording. */
const OLD_ARABIC = new Map([
  [
    'بوفيهات مناسباتكم… لحظات لا تُنسى. لكل مناسبة طعمها الخاص.',
    'ضيافة تليق بلحظاتكم المميّزة… وذكريات تدوم. لكل مناسبة مذاقها الخاص.'
  ],
  ['ميني بيرثداي', 'باقات ميني لأعياد الميلاد'],
  [
    'احتفل بيومك مع ميني كيتشن. نكهات صغيرة، ذكريات كبيرة.',
    'احتفلوا بيومكم مع ميني كيتشن. لقيمات صغيرة… وذكريات كبيرة.'
  ],
  ['المحطات الحية', 'المحطات المباشرة'],
  ['الأطباق الرئيسية والقضمات', 'الصواني واللقيمات الصغيرة'],
  ['ميني سندويشات', 'سندويشات صغيرة'],
  ['ميني قضمات', 'لقيمات صغيرة'],
  ['ميني سلطات', 'سلطات صغيرة'],
  ['ميني معجنات', 'معجنات صغيرة'],
  ['ميني حلويات', 'حلويات صغيرة'],
  ['حمص', 'حمّص'],
  ['متبل', 'متبّل'],
  ['محمور', 'مغمور'],
  ['سمكي حارة فيليه', 'سمكة حارّة (فيليه)'],
  ['سمك حار (سمكة كاملة)', 'سمكة حارّة (سمكة كاملة)'],
  ['طاجن فيليه', 'طاجن سمك (فيليه)'],
  ['طاجن (سمكة كاملة)', 'طاجن سمك (سمكة كاملة)'],
  ['حمص بيستو', 'حمّص بالبيستو'],
  ['حمص بيروتي', 'حمّص بيروتي'],
  ['حمص شمندر', 'حمّص بالشمندر'],
  ['متبل بيستو', 'متبّل بالبيستو'],
  ['متبل شمندر', 'متبّل بالشمندر'],
  ['فتوش', 'فتّوش'],
  ['تبوله', 'تبّولة'],
  ['شكن سيزر', 'سلطة سيزر بالدجاج'],
  ['ترياكي تشكن', 'سلطة دجاج ترياكي'],
  ['سلطه باتنجان', 'سلطة الباذنجان'],
  ['سلطه شمندر', 'سلطة الشمندر'],
  ['سلطه يونانيه', 'سلطة يونانية'],
  ['سلطه خضراء', 'سلطة خضراء'],
  ['روكا سلاد', 'سلطة الروكا'],
  ['كراب سلاد', 'سلطة الكراب'],
  ['كينوا سلاد مكس', 'سلطة الكينوا المشكّلة'],
  ['كينوا قريدس سلاد', 'سلطة الكينوا بالقريدس'],
  ['تونا باستا سلاد', 'سلطة المعكرونة بالتونة'],
  ['سلطه موسميه', 'سلطة موسمية'],
  ['نودلز دجاج او لحم', 'نودلز بالدجاج أو باللحم'],
  ['طماطم موتزاريلا بوفالا', 'طماطم وموتزاريلا بوفالا'],
  ['سلطة بريزاولا', 'سلطة البريزاولا'],
  ['سلطة قلب الأرضي شوكي', 'سلطة قلوب الأرضي شوكي'],
  ['ميني كيش دجاج', 'ميني كيش بالدجاج'],
  ['ميني كيش فطر', 'ميني كيش بالفطر'],
  ['رز ع دجاج', 'رز على دجاج'],
  ['رز لحمة', 'رز على لحمة'],
  ['صياديه', 'صيّادية'],
  ['بايلا', 'باييلا'],
  ['لحمة فيليه مع بطاطا وخضار', 'فيليه لحم مع البطاطا والخضار'],
  ['لحمة فيليه مع بطاطا وخضار (3 كغ)', 'فيليه لحم مع البطاطا والخضار (3 كغ)'],
  ['بيف ستروغونوف', 'ستروغانوف باللحم'],
  ['تشكن ستروغونوف', 'ستروغانوف بالدجاج'],
  ['شرمب ستروغونوف', 'ستروغانوف بالقريدس'],
  ['مغربيه دجاج', 'مغربية بالدجاج'],
  ['فريكه لحم', 'فريكة باللحم'],
  ['فريكه دجاج', 'فريكة بالدجاج'],
  ['تشكن كاجو', 'دجاج بالكاجو'],
  ['كبه لبنيه وشيش برك', 'كبّة لبنية وشيش برك'],
  ['محاشي مشكله', 'محاشي مشكّلة'],
  ['روستو شهبايه مع خضره وبطاطا', 'روستو شهباي مع الخضار والبطاطا'],
  ['معكرونه الفريدو', 'معكرونة ألفريدو'],
  ['معكرونه اربياتا', 'معكرونة أرابياتا'],
  ['كبسه دجاج', 'كبسة دجاج'],
  ['كبسه لحم', 'كبسة لحم'],
  ['غرلد تشكن مع بطاطا وخضار', 'دجاج مشوي مع البطاطا والخضار'],
  ['فانيلا، فستق أخضر، شوكولا، بلو بيري أحمر، راسبيري', 'فانيلا، فستق حلبي، شوكولا، توت أزرق وأحمر، فرامبواز'],
  [
    'شوكولا، فانيلا فراولة، مانجو، ليمون، فرامبوز كرز، باشن فروت، جميع التوت',
    'شوكولا، فانيلا وفراولة، مانغو، ليمون، فرامبواز وكرز، باشن فروت، توت مشكّل'
  ],
  [
    'شوكولا فانيلا، مانجو، فراولة ليمون، نوتيلا أوريو، لوتس، كراميل، كرز، باشن فروت',
    'شوكولا وفانيلا، مانغو، فراولة وليمون، نوتيلا وأوريو، لوتس، كراميل، كرز، باشن فروت'
  ],
  ['ميلفاي', 'ميلفوي'],
  [
    'فراولة، فانيلا شوكولا، مانجو، ليمون، فرامبواز، باشن فروت، جميع التوت',
    'فراولة، فانيلا وشوكولا، مانغو، ليمون، فرامبواز، باشن فروت، توت مشكّل'
  ],
  ['ميني سندوتش فاهيتا', 'ميني سندويش فاهيتا'],
  ['ميني سندوتش فيلادلفيا', 'ميني سندويش فيلادلفيا'],
  ['ميني سندوتش تونا ميكس', 'ميني سندويش خلطة التونة'],
  ['ميني سندوتش دجاج ميكس', 'ميني سندويش خلطة الدجاج'],
  ['ميني سندوتش روستو', 'ميني سندويش روستو'],
  ['ميني سندوتش ديك رومي وجبنة', 'ميني سندويش ديك رومي وجبنة'],
  ['ميني سندوتش دجاج بيستو', 'ميني سندويش دجاج بالبيستو'],
  ['ميني سندوتش دجاج أفوكادو', 'ميني سندويش دجاج وأفوكادو'],
  ['ميني سندوتش لحم ترياكي', 'ميني سندويش لحم ترياكي'],
  ['ميني سندوتش فيتا خيار', 'ميني سندويش جبنة فيتا وخيار'],
  ['ميني سندوتش جمبري ميكس', 'ميني سندويش خلطة القريدس'],
  ['ميني سندوتش سلمون مدخن', 'ميني سندويش سلمون مدخّن'],
  ['ميني سندوتش هوت دوغ', 'ميني سندويش هوت دوغ'],
  ['ميني سندوتش كراب', 'ميني سندويش كراب'],
  ['ميني دجاج ميكس', 'ميني خلطة الدجاج'],
  ['ميني تونا ميكس', 'ميني خلطة التونة'],
  ['ميني سجق ميكس', 'ميني خلطة السجق'],
  ['ميني حلومي خيار', 'ميني حلّوم وخيار'],
  ['ميني كعكة لبنة', 'ميني كعك باللبنة'],
  ['ميني كعكة جبنة', 'ميني كعك بالجبنة'],
  ['ميني كعكة تركي وجبنة', 'ميني كعك بالديك الرومي والجبنة'],
  ['الباقة المميزة', 'الباقة المميّزة'],
  ['الباقة الفاخرة', 'الباقة الفاخرة (VIP)'],
  ['محطة الباستا الحية', 'محطة الباستا المباشرة'],
  ['محطة السلطات الحية', 'محطة السلطات المباشرة'],
  ['محطة المشاوي الحية', 'محطة المشاوي المباشرة'],
  ['محطة البرغر والسندويشات الحية', 'محطة البرغر والسندويشات المباشرة'],
  ['محطة الساج الحية', 'محطة الصاج المباشرة'],
  ['محطة الشاورما الحية', 'محطة الشاورما المباشرة'],
  ['محطة الريال فيليه الحية', 'محطة فيليه اللحم المباشرة'],
  ['كلاسيك', 'كلاسيكية'],
  ['VIP', 'فاخرة (VIP)'],
  ['ساج', 'صاج'],
  ['ريال فيليه (1 كغ)', 'فيليه لحم (1 كغ)'],
  ['بار', 'ركن المشروبات (بار)'],
  ['خدمة الصحون', 'خدمة التقديم بالأطباق'],
  ['نُدُل', 'طاقم الخدمة (نُدُل)']
]);

const ARABIC_FIELDS = ['nameAr', 'labelAr', 'descAr', 'taglineAr'];
const NESTED_LISTS = ['items', 'options'];

/** Returns the corrected Arabic for an old published default, otherwise the text unchanged. */
export function correctedArabic(text) {
  return typeof text === 'string' && OLD_ARABIC.has(text) ? OLD_ARABIC.get(text) : text;
}

/** A copy of one saved entry (and its dishes / options) with old default Arabic replaced. */
function upgradeArabicEntry(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return entry;
  let out = entry;
  const set = (key, value) => {
    if (out[key] === value) return;
    if (out === entry) out = { ...entry };
    out[key] = value;
  };
  for (const key of ARABIC_FIELDS) set(key, correctedArabic(entry[key]));
  for (const key of NESTED_LISTS) {
    if (Array.isArray(entry[key])) {
      const list = entry[key].map(upgradeArabicEntry);
      if (list.some((item, i) => item !== entry[key][i])) set(key, list);
    }
  }
  return out;
}

const savedVersion = siteConfig => Number(siteConfig?.cateringMenuVersion) || 0;

/** Returns the choice groups to use: saved groups with empty lists filled from the defaults. */
export function upgradeCateringMenu(siteConfig, defaults) {
  const saved = siteConfig?.cateringChoiceGroups;
  const fallback = Array.isArray(defaults?.cateringChoiceGroups) ? defaults.cateringChoiceGroups : [];
  if (!Array.isArray(saved)) return fallback;
  const version = savedVersion(siteConfig);
  if (version >= CATERING_MENU_VERSION) return saved;
  const groups =
    version >= DISHES_VERSION
      ? saved
      : saved.map(group => {
          if (Array.isArray(group?.items) && group.items.length) return group;
          const published = fallback.find(g => g.id === group?.id);
          return published && published.items?.length ? { ...group, items: published.items } : group;
        });
  return groups.map(upgradeArabicEntry);
}

/**
 * One catering list to use (see CATERING_LIST_KEYS): the saved list brought up to date, or the
 * defaults when nothing is saved. An empty saved list stays empty (e.g. no extras offered).
 */
export function upgradeCateringList(siteConfig, defaults, key) {
  if (key === 'cateringChoiceGroups') return upgradeCateringMenu(siteConfig, defaults);
  const saved = siteConfig?.[key];
  if (!Array.isArray(saved)) return Array.isArray(defaults?.[key]) ? defaults[key] : [];
  if (savedVersion(siteConfig) >= CATERING_MENU_VERSION) return saved;
  return saved.map(upgradeArabicEntry);
}
