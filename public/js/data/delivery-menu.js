// ============================================================================
// MINI KITCHEN DELIVERY — DEFAULT DELIVERY MENU
// The dishes and prices of the Mini Kitchen Delivery catalogue, with the studio photos in
// public/images/delivery/ (<slug>-900.webp for cards, <slug>.webp for the dish window).
// The Back Office saves the owner's copy as siteConfig.deliveryMenu; this list is only used
// while nothing is saved. Same item shape as ./menu.js, plus:
//   titleAr / descAr / nameAr / subtitleAr  Arabic text (English stays the second line)
//   unit: 'piece'                            price is per piece ("$1.50 / piece")
//   modType                                  a group in DELIVERY_MODIFIER_GROUPS, or 'none'
// ============================================================================

/** Choices offered in the catalogue itself (no extra charge). */
export const DELIVERY_MODIFIER_GROUPS = {
  'dl-chicken-balls': [
    {
      id: 'dl-balls-flavor',
      name: 'Choose your flavor',
      nameAr: 'اختاروا النكهة',
      required: true,
      type: 'radio',
      options: [
        { label: 'Mozzarella', labelAr: 'موتزاريلا', price: 0, default: true },
        { label: 'Cheddar', labelAr: 'شيدر', price: 0 },
        { label: 'Jalapeño', labelAr: 'هالبينو', price: 0 },
        { label: 'Pesto', labelAr: 'بيستو', price: 0 },
        { label: 'Truffle', labelAr: 'ترافل', price: 0 }
      ]
    },
    {
      id: 'dl-balls-sauce',
      name: 'Choose your sauce',
      nameAr: 'اختاروا الصلصة',
      required: true,
      type: 'radio',
      options: [
        { label: 'Homemade BBQ sauce', labelAr: 'صلصة باربكيو منزلية', price: 0, default: true },
        { label: 'Honey mustard sauce', labelAr: 'صلصة العسل والخردل', price: 0 },
        { label: 'Mango hot chilli sauce', labelAr: 'صلصة المانجو والفلفل الحارّ', price: 0 },
        { label: 'Blue cheese sauce', labelAr: 'صلصة الجبنة الزرقاء', price: 0 }
      ]
    }
  ],
  'dl-wings': [
    {
      id: 'dl-wings-flavor',
      name: 'Choose your flavor',
      nameAr: 'اختاروا النكهة',
      required: true,
      type: 'radio',
      options: [
        { label: 'BBQ', labelAr: 'باربكيو', price: 0, default: true },
        { label: 'Honey mustard', labelAr: 'عسل وخردل', price: 0 },
        { label: 'Buffalo', labelAr: 'بافلو', price: 0 },
        { label: 'Blue cheese', labelAr: 'جبنة زرقاء', price: 0 }
      ]
    }
  ],
  'dl-chicken-flavor': [
    {
      id: 'dl-chicken-flavor',
      name: 'Choose your flavor',
      nameAr: 'اختاروا النكهة',
      required: true,
      type: 'radio',
      options: [
        { label: 'Buffalo', labelAr: 'بافلو', price: 0, default: true },
        { label: 'BBQ', labelAr: 'باربكيو', price: 0 },
        { label: 'Honey mustard', labelAr: 'عسل وخردل', price: 0 }
      ]
    }
  ],
  'dl-bread': [
    {
      id: 'dl-bread',
      name: 'Choose your bread',
      nameAr: 'اختاروا الخبز',
      required: true,
      type: 'radio',
      options: [
        { label: 'White bread', labelAr: 'خبز أبيض', price: 0, default: true },
        { label: 'Brown bread', labelAr: 'خبز أسمر', price: 0 }
      ]
    }
  ],
  'dl-baguette': [
    {
      id: 'dl-baguette',
      name: 'Choose your bread',
      nameAr: 'اختاروا الخبز',
      required: true,
      type: 'radio',
      options: [
        { label: 'White baguette', labelAr: 'باغيت أبيض', price: 0, default: true },
        { label: 'Brown baguette', labelAr: 'باغيت أسمر', price: 0 }
      ]
    }
  ]
};

const PHOTO_DIR = 'images/delivery/';
const FOOD_TIME = '15–20 min';
const DRINK_TIME = '5 min';

/**
 * One category: `dishes` rows are [slug, title, titleAr, price, desc, descAr, extra?].
 * `extra` may set unit, badges, modType, prepTime or noPhoto.
 */
function category({ id, name, nameAr, subtitle, subtitleAr, icon, prepTime = FOOD_TIME, dishes }) {
  const items = dishes.map(([slug, title, titleAr, price, desc, descAr, extra = {}]) => {
    const { noPhoto, ...rest } = extra;
    const img = noPhoto ? '' : `${PHOTO_DIR}${slug}-900.webp`;
    return {
      id: `dl-${slug}`,
      categoryId: id,
      categoryName: name,
      title,
      titleAr,
      desc,
      descAr,
      price: `$${price.toFixed(2)}`,
      priceValue: price,
      img,
      fallbackImg: img,
      hasRealPhoto: !noPhoto,
      prepTime,
      badges: [],
      modType: 'none',
      ...rest
    };
  });
  return {
    id,
    name,
    nameAr,
    subtitle,
    subtitleAr,
    badge: subtitle,
    icon,
    thumbImg: items.find(i => i.img)?.img || '',
    fallbackImg: '',
    modType: 'none',
    count: items.length,
    items
  };
}

const PIECE = { unit: 'piece' };
const VEG = { badges: ['Vegetarian'] };
const SPICY = { badges: ['Spicy'] };
const SHARING = { badges: ['Sharing'] };
const COMBO = 'Sharing combo box.';
const COMBO_AR = 'علبة كومبو للمشاركة.';

export const DELIVERY_MENU = [
  category({
    id: 'dl-appetizers',
    name: 'Appetizers',
    nameAr: 'المقبّلات',
    subtitle: 'Fries, crispy bites by the piece and sharing boxes',
    subtitleAr: 'بطاطا، لقيمات مقرمشة بالقطعة وعلب للمشاركة',
    icon: 'fa-drumstick-bite',
    dishes: [
      [
        'imported-fries',
        'Imported Fries',
        'بطاطا مقلية مستوردة',
        5,
        '200g of imported fries served with ketchup.',
        '200 غ من البطاطا المقلية المستوردة تُقدَّم مع الكاتشب.',
        VEG
      ],
      [
        'mozzarella-sticks-served-by-pcs',
        'Mozzarella Sticks',
        'أصابع الموتزاريلا',
        1.5,
        'Premium mozzarella sticks served with homemade honey mustard sauce.',
        'أصابع موتزاريلا عالية الجودة تُقدَّم مع صلصة العسل والخردل المنزلية.',
        { ...PIECE, ...VEG }
      ],
      [
        'chicken-balls',
        'Chicken Balls',
        'كرات الدجاج',
        1,
        'Choose your flavor of chicken balls (mozzarella, cheddar, jalapeño, pesto or truffle), served with your choice of sauce (homemade BBQ, honey mustard, mango hot chilli or blue cheese).',
        'اختاروا نكهة كرات الدجاج (موتزاريلا، شيدر، هالبينو، بيستو أو ترافل) مع الصلصة التي تفضّلونها (باربكيو منزلية، عسل وخردل، مانجو وفلفل حارّ أو جبنة زرقاء).',
        { ...PIECE, modType: 'dl-chicken-balls' }
      ],
      [
        'chiken-tenders',
        'Chicken Tenders',
        'تندرز الدجاج',
        1.5,
        'Chicken fillet breaded with a special mix of peppers, served with honey mustard sauce.',
        'فيليه دجاج مغطّى بالبقسماط مع خلطة خاصة من الفلفل، يُقدَّم مع صلصة العسل والخردل.',
        PIECE
      ],
      [
        'halloum-stick-served-by-pcs',
        'Halloumi Sticks',
        'أصابع الحلّوم',
        0.8,
        'Breaded halloumi sticks served with mango hot chilli sauce.',
        'أصابع حلّوم مغطّاة بالبقسماط تُقدَّم مع صلصة المانجو والفلفل الحارّ.',
        { ...PIECE, ...VEG }
      ],
      [
        'cheddar-jalapino-served-by-pc',
        'Cheddar Jalapeño',
        'هالبينو بالشيدر',
        0.8,
        'Fried cheddar jalapeño served with honey mustard sauce.',
        'هالبينو محشوّ بالشيدر ومقلي، يُقدَّم مع صلصة العسل والخردل.',
        { ...PIECE, ...VEG }
      ],
      [
        'wings-served-by-pcs',
        'Chicken Wings',
        'أجنحة الدجاج',
        1.5,
        'Fried chicken wings tossed in your favorite flavor (BBQ, honey mustard, buffalo or blue cheese).',
        'أجنحة دجاج مقلية مغموسة بالنكهة التي تفضّلونها (باربكيو، عسل وخردل، بافلو أو جبنة زرقاء).',
        { ...PIECE, modType: 'dl-wings' }
      ],
      [
        'imported-curly-fries',
        'Imported Curly Fries',
        'بطاطا مجعّدة مستوردة',
        7,
        '200g of imported curly fries served with BBQ mayo sauce.',
        '200 غ من البطاطا المجعّدة المستوردة تُقدَّم مع صلصة مايونيز بالباربكيو.',
        VEG
      ],
      [
        'dinamite-mango-shrimp-6psc',
        'Dynamite Mango Shrimp (6 pcs)',
        'ديناميت روبيان بالمانجو (6 قطع)',
        8,
        '6 pieces of fried medium shrimp tossed in mango chilli sauce.',
        '6 قطع من الروبيان المقلي متوسط الحجم ممزوجة بصلصة المانجو والفلفل الحارّ.',
        SPICY
      ],
      [
        'dinamite-mango-chicken-6pcs',
        'Dynamite Mango Chicken (6 pcs)',
        'ديناميت دجاج بالمانجو (6 قطع)',
        8,
        '250g of crispy chicken balls dipped in hot chilli mango sauce.',
        '250 غ من كرات الدجاج المقرمشة مغموسة بصلصة المانجو والفلفل الحارّ.',
        SPICY
      ],
      ['say-cheese-box', 'Say Cheese Box', 'علبة «ساي تشيز»', 18, COMBO, COMBO_AR, SHARING],
      [
        'winner-winner-chicken-dinner-box',
        'Winner Winner Chicken Dinner Box',
        'علبة «وينر وينر تشيكن دينر»',
        18,
        COMBO,
        COMBO_AR,
        SHARING
      ],
      ['truffle-fries', 'Truffle Fries', 'بطاطا بالترافل', 8, '', '', { noPhoto: true }]
    ]
  }),
  category({
    id: 'dl-salads',
    name: 'Salads',
    nameAr: 'السلطات',
    subtitle: 'Fresh salads made to order',
    subtitleAr: 'سلطات طازجة تُحضَّر عند الطلب',
    icon: 'fa-leaf',
    dishes: [
      [
        'chicken-ceaser-salad',
        'Chicken Caesar Salad',
        'سلطة سيزر بالدجاج',
        10,
        'Romaine lettuce, parmesan cheese, grilled chicken breast, crispy croutons and Caesar sauce.',
        'خسّ روماني، جبنة بارميزان، صدر دجاج مشوي، خبز محمّص مقرمش وصلصة السيزر.'
      ],
      [
        'chicken-balls-salad',
        'Chicken Balls Salad',
        'سلطة كرات الدجاج',
        10,
        'Iceberg lettuce, cherry tomatoes, cucumber, fresh mushrooms and 4 chicken balls, served with lemon mustard sauce.',
        'خسّ آيسبرغ، بندورة كرزية، خيار، فطر طازج و4 كرات دجاج، تُقدَّم مع صلصة الليمون والخردل.'
      ],
      [
        'greek-salad',
        'Greek Salad',
        'سلطة يونانية',
        10,
        'Lettuce, tomato, cucumber, onion, olives, green pepper and feta cheese, served with lemon oil sauce.',
        'خسّ، بندورة، خيار، بصل، زيتون، فليفلة خضراء وجبنة فيتا، تُقدَّم مع صلصة الليمون والزيت.',
        VEG
      ],
      [
        'halloum-rocca-pesto',
        'Halloumi Rocca Pesto',
        'سلطة حلّوم وروكا بالبيستو',
        10,
        'Baby rocca, grilled halloumi, cherry tomatoes, cucumber and fresh mushrooms with pesto sauce.',
        'روكا صغيرة، حلّوم مشوي، بندورة كرزية، خيار وفطر طازج مع صلصة البيستو.',
        VEG
      ],
      [
        'green-b-green',
        'Green B Green',
        'سلطة «غرين بي غرين»',
        8,
        'Lettuce, baby rocca, cucumber, mint and cherry tomatoes.',
        'خسّ، روكا صغيرة، خيار، نعناع وبندورة كرزية.',
        VEG
      ]
    ]
  }),
  category({
    id: 'dl-burgers',
    name: 'Burgers',
    nameAr: 'البرغر',
    subtitle: '130g beef patties and crispy chicken burgers',
    subtitleAr: 'برغر لحم 130 غ وبرغر دجاج مقرمش',
    icon: 'fa-burger',
    dishes: [
      [
        'the-doctor-burger',
        'The Doctor Burger',
        'برغر «ذا دكتور»',
        10,
        '130g beef patty, iceberg lettuce, tomato, fresh onion, homemade BBQ sauce and a cheddar syringe.',
        'قرص لحم 130 غ، خسّ آيسبرغ، بندورة، بصل طازج، صلصة باربكيو منزلية وحقنة شيدر.'
      ],
      [
        'huge-chicke',
        'Huge Chicken',
        'برغر «هيوج تشيكن»',
        10,
        '130g fried chicken breast and 1 mozzarella patty, the chicken dipped in your favorite flavor: buffalo, BBQ or honey mustard.',
        'صدر دجاج مقلي 130 غ وقرص موتزاريلا، والدجاج مغموس بالنكهة التي تفضّلونها: بافلو، باربكيو أو عسل وخردل.',
        { modType: 'dl-chicken-flavor' }
      ],
      [
        'the-real-swiis-mushroom',
        'The Real Swiss Mushroom',
        'برغر «ذا ريل سويس مشروم»',
        12,
        '130g beef patty, mushroom mix (fresh Paris mushrooms, shiitake and cèpe mushrooms), emmental cheese, baby rocca and mushroom mayo sauce.',
        'قرص لحم 130 غ، خليط فطر (فطر باريس طازج، فطر شيتاكي وفطر سيب)، جبنة إمنتال، روكا صغيرة وصلصة مايونيز بالفطر.'
      ],
      [
        'cheese-please',
        'Cheese Please',
        'برغر «تشيز بليز»',
        12,
        '130g beef patty, honey mustard sauce, fried mozzarella patty, lettuce, tomato and onion.',
        'قرص لحم 130 غ، صلصة العسل والخردل، قرص موتزاريلا مقلي، خسّ، بندورة وبصل.'
      ],
      [
        'chicken-breast',
        'Chicken Breast',
        'برغر صدر الدجاج',
        12,
        'Garlic BBQ mayo, 130g chicken breast, tomato, onion and baby rocca.',
        'مايونيز بالثوم والباربكيو، صدر دجاج 130 غ، بندورة، بصل وروكا صغيرة.'
      ],
      [
        'ohhh-my-doubly',
        'Ohhh My Doubly',
        'برغر «أوه ماي دبلي»',
        15,
        'Two 130g beef patties, lettuce, tomato, onion, fried mozzarella patty and melted cheddar on top.',
        'قرصا لحم 130 غ، خسّ، بندورة، بصل، قرص موتزاريلا مقلي وجبنة شيدر ذائبة على الوجه.'
      ],
      ['truffle-burger', 'Truffle Burger', 'برغر الترافل', 14, '', '']
    ]
  }),
  category({
    id: 'dl-sandwiches',
    name: 'Sandwiches',
    nameAr: 'السندويشات',
    subtitle: 'Fillet, chicken and volcano sandwiches',
    subtitleAr: 'سندويشات فيليه ودجاج وفولكانو',
    icon: 'fa-bread-slice',
    dishes: [
      [
        'volcano-beef',
        'Volcano Beef',
        'فولكانو لحم',
        15,
        '130g beef fillet mixed with vegetables, crème fraîche and mozzarella cheese, served in a special bread.',
        'فيليه لحم 130 غ مع الخضار، كريم فريش وجبنة موتزاريلا، يُقدَّم في خبز خاص.'
      ],
      [
        'volcano-chicken',
        'Volcano Chicken',
        'فولكانو دجاج',
        13,
        '130g chicken breast, mixed vegetables, crème fraîche and mozzarella cheese, served in a special bread.',
        'صدر دجاج 130 غ، خضار مشكّلة، كريم فريش وجبنة موتزاريلا، يُقدَّم في خبز خاص.'
      ],
      [
        'philadelphia',
        'Philadelphia',
        'فيلادلفيا',
        11,
        '130g beef fillet, green pepper, fresh mushrooms, onion, special sauce and emmental cheese, served in white or brown bread.',
        'فيليه لحم 130 غ، فليفلة خضراء، فطر طازج، بصل، صلصة خاصة وجبنة إمنتال، يُقدَّم بالخبز الأبيض أو الأسمر.',
        { modType: 'dl-bread' }
      ],
      [
        'real-steak-sand',
        'Real Steak Sandwich',
        'سندويش ستيك',
        14,
        'Real 130g fillet in ciabatta bread with baby rocca, mushroom mix and chimichurri sauce.',
        'فيليه لحم 130 غ في خبز تشاباتا مع روكا صغيرة، خليط فطر وصلصة تشيميتشوري.'
      ],
      [
        'chicken-avocado',
        'Chicken Avocado',
        'دجاج بالأفوكادو',
        10,
        'Grilled chicken breast, homemade garlic mayo avocado sauce and baby rocca, served in a white or brown baguette.',
        'صدر دجاج مشوي، صلصة أفوكادو بمايونيز الثوم المنزلية وروكا صغيرة، يُقدَّم بباغيت أبيض أو أسمر.',
        { modType: 'dl-baguette' }
      ]
    ]
  }),
  category({
    id: 'dl-pasta',
    name: 'Pasta',
    nameAr: 'الباستا',
    subtitle: 'Tagliatelle and mac and cheese',
    subtitleAr: 'تالياتيلي وماك أند تشيز',
    icon: 'fa-bowl-food',
    dishes: [
      [
        'taguliatelle-alfredo',
        'Tagliatelle Alfredo',
        'تالياتيلي ألفريدو',
        14,
        'Tagliatelle pasta, fresh mushrooms, chicken breast, fresh cream and mozzarella cheese.',
        'باستا تالياتيلي، فطر طازج، صدر دجاج، كريمة طازجة وجبنة موتزاريلا.'
      ],
      [
        'taguliatelle-shrimp',
        'Tagliatelle Shrimp',
        'تالياتيلي بالروبيان',
        15,
        'Tagliatelle pasta, fresh mushrooms, breaded shrimp on top, fresh cream and mozzarella cheese.',
        'باستا تالياتيلي، فطر طازج، روبيان بالبقسماط على الوجه، كريمة طازجة وجبنة موتزاريلا.'
      ],
      [
        'taguliatelle-beef',
        'Tagliatelle Beef',
        'تالياتيلي باللحم',
        15,
        'Tagliatelle pasta, beef fillet, onion, green pepper, red sauce and parmesan cheese.',
        'باستا تالياتيلي، فيليه لحم، بصل، فليفلة خضراء، صلصة حمراء وجبنة بارميزان.'
      ],
      [
        'taguliatelle-for-cheese',
        'Tagliatelle Four Cheese',
        'تالياتيلي بالأجبان الأربعة',
        10,
        'Tagliatelle pasta, fresh cream, mozzarella, emmental, blue cheese and parmesan.',
        'باستا تالياتيلي، كريمة طازجة، موتزاريلا، إمنتال، جبنة زرقاء وبارميزان.',
        VEG
      ],
      ['taguliatelle-pesto', 'Tagliatelle Pesto', 'تالياتيلي بالبيستو', 10, '', ''],
      ['taguliatelle-truffle', 'Tagliatelle Truffle', 'تالياتيلي بالترافل', 14, '', ''],
      ['taguliatelle-red-sauce', 'Tagliatelle Red Sauce', 'تالياتيلي بالصلصة الحمراء', 10, '', ''],
      ['mac-and-cheese', 'Mac and Cheese', 'ماك أند تشيز', 10, '', '']
    ]
  }),
  category({
    id: 'dl-platters',
    name: 'Platters',
    nameAr: 'الأطباق',
    subtitle: 'Grilled fillet, chicken and boneless chicken platters',
    subtitleAr: 'فيليه ودجاج مشوي وفرّوج مسحّب',
    icon: 'fa-plate-wheat',
    dishes: [
      [
        'grilled-beef-fillet',
        'Grilled Beef Fillet',
        'فيليه لحم مشوي',
        25,
        '250g beef fillet served with baked potato, steamed vegetables and mushroom sauce.',
        'فيليه لحم 250 غ يُقدَّم مع بطاطا مشوية في الفرن، خضار على البخار وصلصة الفطر.'
      ],
      [
        'grilled-chicken-breast',
        'Grilled Chicken Breast',
        'صدر دجاج مشوي',
        17,
        '200g grilled chicken breast served with baked potato, steamed vegetables and mushroom sauce.',
        'صدر دجاج مشوي 200 غ يُقدَّم مع بطاطا مشوية في الفرن، خضار على البخار وصلصة الفطر.'
      ],
      [
        'crispy-chicken-platter',
        'Crispy Chicken Platter',
        'طبق الدجاج المقرمش',
        14,
        '3 pieces of crispy chicken (240g) served with fries and coleslaw.',
        '3 قطع دجاج مقرمش (240 غ) تُقدَّم مع البطاطا المقلية وسلطة الملفوف.'
      ],
      [
        'chicken-escalope',
        'Chicken Escalope',
        'إسكالوب الدجاج',
        14,
        '2 pieces of chicken escalope served with fries and coleslaw.',
        'قطعتا إسكالوب دجاج تُقدَّمان مع البطاطا المقلية وسلطة الملفوف.'
      ],
      [
        'half-boneless-chicken',
        'Half Boneless Chicken',
        'نصف فرّوج مسحّب',
        15,
        '600g boneless chicken marinated in our signature sauce, served with grilled vegetables, fries, garlic paste, pickles and coleslaw.',
        'دجاج مسحّب 600 غ متبّل بصلصتنا الخاصة، يُقدَّم مع خضار مشوية، بطاطا مقلية، ثوم، كبيس وسلطة الملفوف.'
      ],
      [
        'whole-boneless-chicken',
        'Whole Boneless Chicken',
        'فرّوج مسحّب كامل',
        25,
        '1200g whole boneless chicken served with our special bread, fries, grilled vegetables, coleslaw, pickles and garlic paste.',
        'فرّوج كامل مسحّب 1200 غ يُقدَّم مع خبزنا الخاص، بطاطا مقلية، خضار مشوية، سلطة الملفوف، كبيس وثوم.',
        SHARING
      ]
    ]
  }),
  category({
    id: 'dl-soft-drinks',
    name: 'Soft Drinks',
    nameAr: 'المشروبات الغازية',
    subtitle: 'Chilled soft drinks and sparkling water',
    subtitleAr: 'مشروبات غازية باردة ومياه فوّارة',
    icon: 'fa-bottle-water',
    prepTime: DRINK_TIME,
    dishes: [
      ['miranda', 'Mirinda', 'ميريندا', 2, '', ''],
      ['diet-pepsi', 'Diet Pepsi', 'دايت بيبسي', 2.04, '', ''],
      ['7up', '7Up', 'سفن أب', 2, '', ''],
      ['diet-7up', 'Diet 7Up', 'دايت سفن أب', 2, '', ''],
      ['pepsi', 'Pepsi', 'بيبسي', 2, '', ''],
      ['rim', 'Rim', 'ريم', 2, 'Sparkling water.', 'مياه فوّارة.']
    ]
  })
];
