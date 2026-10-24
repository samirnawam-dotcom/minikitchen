// ============================================================================
// MINI KITCHEN — SITE CONFIGURATION, BRANDS, CATERING PACKAGES & GALLERIES
// Easy-to-update central configuration file for all three Mini Kitchen brands.
// ============================================================================

const SITE_CONFIG = {
  brandName: "Mini Kitchen",
  tagline: "Serving Authentic Lebanese & American Cuisine with a Modern Twist",
  location: {
    short: "Ain Al Remmaneh, Aley, Mount Lebanon",
    full: "Main Road, Ain Al Remmaneh (Ein L Remeneh), Aley District, Mount Lebanon, Lebanon",
    hours: "Daily from 8:00 AM to 10:00 PM",
    cateringHours: "24/7 Event Support & Consultations by Appointment",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Mini+Kitchen+Ein+L+Remeneh+Aley+Lebanon",
    mapEmbedUrl: "https://www.google.com/maps?q=Ain+Al+Remmaneh+Aley+Lebanon&output=embed"
  },
  contacts: {
    catering: {
      label: "Mini Kitchen Catering & Weddings",
      phoneDisplay: "+961 71 048 154",
      whatsappNumber: "96171048154",
      secondaryDisplay: "+961 3 682 186",
      email: "minikitchen@gmail.com",
      defaultGreeting: "Hello Mini Kitchen Catering! I would like to inquire about catering services and event packages."
    },
    restaurant: {
      label: "Mini Kitchen Restaurant (Aley)",
      phoneDisplay: "+961 3 682 186",
      whatsappNumber: "9613682186",
      secondaryDisplay: "+961 71 048 154",
      email: "minikitchen@gmail.com",
      defaultGreeting: "Hello Mini Kitchen Restaurant! I would like to reserve a table / inquire about dining in Ain Al Remmaneh, Aley."
    },
    delivery: {
      label: "Mini Kitchen Delivery",
      phoneDisplay: "+961 3 682 186",
      whatsappNumber: "9613682186",
      secondaryDisplay: "+961 71 048 154",
      email: "minikitchen@gmail.com",
      defaultGreeting: "Hello Mini Kitchen Delivery! I would like to place a food delivery order."
    }
  },
  socials: {
    instagram: "https://www.instagram.com/minikitchen.leb/",
    instagramHandle: "@minikitchen.leb",
    facebook: "https://www.facebook.com/search/top?q=Mini%20Kitchen%20Aley",
    tiktok: "https://www.tiktok.com/@minikitchen.leb",
    oldMenuReference: "https://rest.thrubits.com/"
  },
  logos: {
    main: "https://rest.thrubits.com/uploads/restorants/b8fbc11a-99b2-420e-adda-0fadd3e15d4f_large.jpg",
    cover: "https://rest.thrubits.com/uploads/restorants/288ad6f9-0b33-468b-977c-8cde4ae48809_cover.jpg"
  },
  deliveryAreas: [
    "Ain Al Remmaneh",
    "Aley Center",
    "Souk El Gharb",
    "Bhamdoun",
    "Kahale",
    "Bsous",
    "Qmatiyeh",
    "Kayfoun",
    "Baysour",
    "Bleibel & Surrounding Mount Lebanon Areas"
  ],

  defaultTheme: "light",

  // ==========================================================================
  // MULTI-BRAND & LOCAL HOSPITALITY SEO CONFIGURATION (ALEY, MOUNT LEBANON)
  // ==========================================================================
  seo: {
    siteUrl: "https://minikitchencatering.com",
    businessName: "Mini Kitchen — Catering, Restaurant & Delivery",
    defaultOgImage: "https://rest.thrubits.com/uploads/restorants/288ad6f9-0b33-468b-977c-8cde4ae48809_cover.jpg",
    geoRegion: "LB-JL",
    geoPlacename: "Ain Al Remmaneh, Aley, Mount Lebanon, Lebanon",
    geoPosition: "33.8053;35.6000",
    pages: {
      catering: {
        title: "Mini Kitchen Catering | Luxury Wedding & Event Catering in Aley, Mount Lebanon",
        description: "Mini Kitchen Catering in Ain Al Remmaneh, Aley provides bespoke wedding catering, corporate galas, live cooking stations, private party buffets & FineDine menus across Mount Lebanon and Beirut. Inquire on WhatsApp: +961 71 048 154.",
        keywords: "Mini Kitchen Catering, wedding catering Lebanon, catering Aley, Mount Lebanon catering, Ain Al Remmaneh catering, Lebanese wedding buffet, corporate event catering Lebanon, live cooking stations Lebanon, minikitchencatering.com",
        canonicalPath: "/"
      },
      "catering-menus": {
        title: "Catering Packages & Menus | Mini Kitchen Catering Aley, Lebanon",
        description: "Mini Kitchen catering packages: event buffets from $20 per person (Classic, Premium, VIP), Birthday Mini packages from $18 per person, live pasta, grill, shawarma & sajj stations, main course trays and mini bites.",
        keywords: "catering packages Lebanon, wedding buffet price per person Lebanon, birthday catering Aley, live shawarma station, live pasta station, catering trays Lebanon, Mini Kitchen packages",
        canonicalPath: "/catering-menus.html"
      },
      restaurant: {
        title: "Mini Kitchen Restaurant | Scenic Mountain Terrace Dining in Ain Al Remmaneh, Aley",
        description: "Dine with panoramic mountain views at Mini Kitchen Restaurant in Ain Al Remmaneh, Aley. Serving authentic Lebanese breakfast, charcoal grills, signature syringe burgers, wood-fired pizza & shisha daily 8 AM – 10 PM.",
        keywords: "Mini Kitchen Restaurant Aley, restaurants in Ain Al Remmaneh Aley, best restaurant in Aley with view, Lebanese breakfast Aley, burgers Aley, family restaurant Mount Lebanon",
        canonicalPath: "/restaurant.html"
      },
      delivery: {
        title: "Mini Kitchen Delivery | Order 239+ Dishes Online via WhatsApp in Aley",
        description: "Order hot food delivery from Mini Kitchen Delivery (+961 3 682 186) across Ain Al Remmaneh, Aley, Bhamdoun, Souk El Gharb & Kahale. Browse 22 categories including Burgers, Lebanese Grills, Pizza, Pasta & Breakfast.",
        keywords: "Mini Kitchen Delivery Aley, food delivery Aley Lebanon, order food WhatsApp Aley, Bhamdoun food delivery, Souk El Gharb delivery, molten cheddar burger Aley",
        canonicalPath: "/delivery.html"
      },
      about: {
        title: "About Mini Kitchen | Our Culinary Story, Chefs & Event Brigade in Aley",
        description: "Discover the story behind Mini Kitchen in Ain Al Remmaneh, Aley—uniting Mini Kitchen Catering, Mini Kitchen Restaurant, and Mini Kitchen Delivery under one passionate Lebanese culinary brigade.",
        keywords: "About Mini Kitchen Aley, Mini Kitchen chefs, Lebanese catering company history, hospitality team Mount Lebanon",
        canonicalPath: "/about.html"
      },
      contact: {
        title: "Contact Mini Kitchen | Instant WhatsApp Catering Quotes, Reservations & Delivery",
        description: "Contact Mini Kitchen in Ain Al Remmaneh, Aley. Catering & Weddings WhatsApp: +961 71 048 154. Restaurant & Delivery WhatsApp: +961 3 682 186. Open daily 8:00 AM – 10:00 PM.",
        keywords: "Contact Mini Kitchen Catering, Mini Kitchen phone number Aley, WhatsApp catering quote Lebanon, Ain Al Remmaneh Aley map",
        canonicalPath: "/contact.html"
      }
    }
  },

  // ==========================================================================
  // CATERING OFFER (from the owner's flyers). Prices are USD.
  //   cateringTypes        — the four kinds of catering shown as entry cards on the home page
  //   cateringChoiceGroups — the lists customers pick from inside a package ("4 appetizers").
  //                          An empty `items` list means the team confirms the options by phone.
  //   eventPackages        — per-person packages: type "buffet" (weddings & occasions) or
  //                          "birthday" (Birthday Mini). `choices` link to a choice group with a
  //                          count; count 0 = "selection included" (nothing to pick).
  //   liveStationMenu      — live stations; each option is priced per person or per kg
  //   mainCourseTrays      — main course trays (each serves 30–40 people)
  //   miniBites            — "La2mi La2mi" mini bites; `unit` is not on the flyer yet
  //   cateringExtras       — services priced on request (bar, plate service, waiters, chef)
  // ==========================================================================
  cateringTypes: [
    {
      id: "buffet",
      name: "Event Buffets",
      nameAr: "بوفيهات المناسبات",
      text: "Weddings and occasions — choose your appetizers, pastries, salads and hot main courses.",
      tagline: "Catering for your special moments… memories that last. Every occasion, a unique taste.",
      taglineAr: "بوفيهات مناسباتكم… لحظات لا تُنسى. لكل مناسبة طعمها الخاص.",
      img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=85"
    },
    {
      id: "birthday",
      name: "Birthday Minis",
      nameAr: "ميني بيرثداي",
      text: "Mini sandwiches, bites, salads, pastries and desserts for birthday parties.",
      tagline: "Celebrate your day with Mini Kitchen. Small Bites, Big Memories.",
      taglineAr: "احتفل بيومك مع ميني كيتشن. نكهات صغيرة، ذكريات كبيرة.",
      img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=85"
    },
    {
      id: "stations",
      name: "Live Stations",
      nameAr: "المحطات الحية",
      text: "Pasta, salad, grill, burger, sajj, shawarma and real fillet — cooked in front of your guests.",
      tagline: "",
      taglineAr: "",
      img: "https://rest.thrubits.com/uploads/restorants/cecfd5bb-ae60-499d-b744-ee80a3f19031_medium.jpg"
    },
    {
      id: "trays",
      name: "Trays & Mini Bites",
      nameAr: "الأطباق الرئيسية والقضمات",
      text: "Main course trays for 30–40 people and La2mi La2mi mini bites.",
      tagline: "",
      taglineAr: "",
      img: "https://rest.thrubits.com/uploads/restorants/7475002e-6c1d-4101-854a-71ffc18760a6_medium.jpg"
    }
  ],

  cateringChoiceGroups: [
    {
      id: "appetizers",
      name: "Appetizers",
      nameAr: "مقبلات",
      items: [
        { name: "Hummus", nameAr: "حمص" },
        { name: "Wara2 Enab (Grape Leaves)", nameAr: "ورق عنب" },
        { name: "Moutabal", nameAr: "متبل" },
        { name: "Raheb", nameAr: "راهب" },
        { name: "Ma8mour", nameAr: "محمور" },
        { name: "Dolma", nameAr: "دولما" },
        { name: "Samki Harra Fillet", nameAr: "سمكي حارة فيليه" },
        { name: "Whole Fish with Hot Sauce", nameAr: "سمك حار (سمكة كاملة)" },
        { name: "Tajen Fillet", nameAr: "طاجن فيليه" },
        { name: "Whole Fish Tajen", nameAr: "طاجن (سمكة كاملة)" },
        { name: "Hummus Pesto", nameAr: "حمص بيستو" },
        { name: "Hummus Beiruti", nameAr: "حمص بيروتي" },
        { name: "Hummus Shmandar (Beetroot)", nameAr: "حمص شمندر" },
        { name: "Moutabal Pesto", nameAr: "متبل بيستو" },
        { name: "Moutabal Shmandar (Beetroot)", nameAr: "متبل شمندر" },
        { name: "Rosto Mad2ou2", nameAr: "روستو مدقوق" }
      ]
    },
    { id: "pastries", name: "Pastries", nameAr: "معجنات", items: [] },
    {
      id: "salads",
      name: "Salads",
      nameAr: "سلطات",
      items: [
        { name: "Fattoush", nameAr: "فتوش" },
        { name: "Tabbouleh", nameAr: "تبوله" },
        { name: "Chicken Caesar", nameAr: "شكن سيزر" },
        { name: "Teriyaki Chicken", nameAr: "ترياكي تشكن" },
        { name: "Eggplant Salad", nameAr: "سلطه باتنجان" },
        { name: "Beetroot Salad", nameAr: "سلطه شمندر" },
        { name: "Greek Salad", nameAr: "سلطه يونانيه" },
        { name: "Green Salad", nameAr: "سلطه خضراء" },
        { name: "Rocca Salad", nameAr: "روكا سلاد" },
        { name: "Crab Salad", nameAr: "كراب سلاد" },
        { name: "Quinoa Mix Salad", nameAr: "كينوا سلاد مكس" },
        { name: "Quinoa Shrimp Salad", nameAr: "كينوا قريدس سلاد" },
        { name: "Tuna Pasta Salad", nameAr: "تونا باستا سلاد" },
        { name: "Seasonal Salad", nameAr: "سلطه موسميه" },
        { name: "Chicken or Beef Noodles", nameAr: "نودلز دجاج او لحم" },
        { name: "Tomato Mozzarella di Bufala", nameAr: "طماطم موتزاريلا بوفالا" },
        { name: "Bresaola Salad", nameAr: "سلطة بريزاولا" },
        { name: "Artichoke Heart Salad", nameAr: "سلطة قلب الأرضي شوكي" },
        { name: "Panache Salad", nameAr: "سلطة باناشيه" }
      ]
    },
    {
      id: "quiche",
      name: "Quiche",
      nameAr: "كيش",
      items: [
        { name: "Mini Quiche Chicken", nameAr: "ميني كيش دجاج" },
        { name: "Mini Quiche Mushroom", nameAr: "ميني كيش فطر" }
      ]
    },
    {
      id: "hot-mains",
      name: "Hot main courses",
      nameAr: "أطباق رئيسية ساخنة",
      items: [
        { name: "Chicken with Rice", nameAr: "رز ع دجاج" },
        { name: "Meat with Rice", nameAr: "رز لحمة" },
        { name: "Sayadieh", nameAr: "صياديه" },
        { name: "Paella", nameAr: "بايلا" },
        { name: "Beef Fillet with Potatoes & Vegetables", nameAr: "لحمة فيليه مع بطاطا وخضار" },
        { name: "Beef Stroganoff", nameAr: "بيف ستروغونوف" },
        { name: "Chicken Stroganoff", nameAr: "تشكن ستروغونوف" },
        { name: "Shrimp Stroganoff", nameAr: "شرمب ستروغونوف" },
        { name: "Moroccan Chicken", nameAr: "مغربيه دجاج" },
        { name: "Freekeh with Meat", nameAr: "فريكه لحم" },
        { name: "Freekeh with Chicken", nameAr: "فريكه دجاج" },
        { name: "Chicken Cashew", nameAr: "تشكن كاجو" },
        { name: "Kibbeh Labanieh & Shish Barak", nameAr: "كبه لبنيه وشيش برك" },
        { name: "Mixed Stuffed Vegetables", nameAr: "محاشي مشكله" },
        { name: "Shahbai Roast with Vegetables & Potatoes", nameAr: "روستو شهبايه مع خضره وبطاطا" },
        { name: "Fettuccine Alfredo", nameAr: "معكرونه الفريدو" },
        { name: "Penne Arrabbiata", nameAr: "معكرونه اربياتا" },
        { name: "Chicken Kabsa", nameAr: "كبسه دجاج" },
        { name: "Meat Kabsa", nameAr: "كبسه لحم" },
        { name: "Grilled Chicken with Potatoes & Vegetables", nameAr: "غرلد تشكن مع بطاطا وخضار" }
      ]
    },
    {
      id: "desserts",
      name: "Desserts",
      nameAr: "حلويات",
      items: [
        { name: "Profiterole", nameAr: "بروفيترول", desc: "Vanilla, green pistachio, chocolate, red blueberry, raspberry", descAr: "فانيلا، فستق أخضر، شوكولا، بلو بيري أحمر، راسبيري" },
        { name: "Tarte", nameAr: "تارت", desc: "Chocolate, vanilla strawberry, mango, lemon, framboise cherry, passion fruit, all berries", descAr: "شوكولا، فانيلا فراولة، مانجو، ليمون، فرامبوز كرز، باشن فروت، جميع التوت" },
        { name: "Mini Cake", nameAr: "ميني كيك", desc: "Chocolate vanilla, mango, strawberry lemon, Nutella Oreo, Lotus, caramel, cherry, passion fruit", descAr: "شوكولا فانيلا، مانجو، فراولة ليمون، نوتيلا أوريو، لوتس، كراميل، كرز، باشن فروت" },
        { name: "Mille-Feuille", nameAr: "ميلفاي", desc: "Strawberry, vanilla chocolate, mango, lemon, framboise, passion fruit, all berries", descAr: "فراولة، فانيلا شوكولا، مانجو، ليمون، فرامبواز، باشن فروت، جميع التوت" },
        { name: "Mini Eclair", nameAr: "ميني إكلير", desc: "Chocolate, vanilla, strawberry", descAr: "شوكولا، فانيلا، فراولة" }
      ]
    },
    {
      id: "mini-sandwiches",
      name: "Mini sandwiches",
      nameAr: "ميني سندويشات",
      items: [
        { name: "Mini Burger Beef", nameAr: "ميني برغر لحم" },
        { name: "Mini Burger Chicken", nameAr: "ميني برغر دجاج" },
        { name: "Mini Sandwich Fajita", nameAr: "ميني سندوتش فاهيتا" },
        { name: "Mini Sandwich Philadelphia", nameAr: "ميني سندوتش فيلادلفيا" },
        { name: "Mini Sandwich Tuna Mix", nameAr: "ميني سندوتش تونا ميكس" },
        { name: "Mini Sandwich Chicken Mix", nameAr: "ميني سندوتش دجاج ميكس" },
        { name: "Mini Sandwich Rosto", nameAr: "ميني سندوتش روستو" },
        { name: "Mini Sandwich Turkey & Cheese", nameAr: "ميني سندوتش ديك رومي وجبنة" },
        { name: "Mini Sandwich Chicken Pesto", nameAr: "ميني سندوتش دجاج بيستو" },
        { name: "Mini Sandwich Chicken Avocado", nameAr: "ميني سندوتش دجاج أفوكادو" },
        { name: "Mini Sandwich Beef Teriyaki", nameAr: "ميني سندوتش لحم ترياكي" },
        { name: "Mini Sandwich Feta Cucumber", nameAr: "ميني سندوتش فيتا خيار" },
        { name: "Mini Sandwich Shrimp Mix", nameAr: "ميني سندوتش جمبري ميكس" },
        { name: "Mini Sandwich Smoked Salmon", nameAr: "ميني سندوتش سلمون مدخن" },
        { name: "Mini Sandwich Hot Dog", nameAr: "ميني سندوتش هوت دوغ" },
        { name: "Mini Sandwich Crab", nameAr: "ميني سندوتش كراب" }
      ]
    },
    {
      id: "mini-bites",
      name: "Mini bites",
      nameAr: "ميني قضمات",
      items: [
        { name: "Shawarma Beef", nameAr: "ميني شاورما لحم" },
        { name: "Shawarma Chicken", nameAr: "ميني شاورما دجاج" },
        { name: "Chicken Mix", nameAr: "ميني دجاج ميكس" },
        { name: "Tuna Mix", nameAr: "ميني تونا ميكس" },
        { name: "Sejok Mix", nameAr: "ميني سجق ميكس" },
        { name: "Halloumi Cucumber", nameAr: "ميني حلومي خيار" },
        { name: "Kaaki Labni", nameAr: "ميني كعكة لبنة" },
        { name: "Kaaki Cheese", nameAr: "ميني كعكة جبنة" },
        { name: "Kaaki Turkey & Cheese", nameAr: "ميني كعكة تركي وجبنة" }
      ]
    },
    { id: "mini-salads", name: "Mini salads", nameAr: "ميني سلطات", items: [] },
    { id: "mini-pastries", name: "Mini mo3ajanet (pastries)", nameAr: "ميني معجنات", items: [] },
    {
      id: "mini-desserts",
      name: "Mini desserts",
      nameAr: "ميني حلويات",
      items: [
        { name: "Profiterole", nameAr: "بروفيترول", desc: "Vanilla, green pistachio, chocolate, red blueberry, raspberry", descAr: "فانيلا، فستق أخضر، شوكولا، بلو بيري أحمر، راسبيري" },
        { name: "Tarte", nameAr: "تارت", desc: "Chocolate, vanilla strawberry, mango, lemon, framboise cherry, passion fruit, all berries", descAr: "شوكولا، فانيلا فراولة، مانجو، ليمون، فرامبوز كرز، باشن فروت، جميع التوت" },
        { name: "Mini Cake", nameAr: "ميني كيك", desc: "Chocolate vanilla, mango, strawberry lemon, Nutella Oreo, Lotus, caramel, cherry, passion fruit", descAr: "شوكولا فانيلا، مانجو، فراولة ليمون، نوتيلا أوريو، لوتس، كراميل، كرز، باشن فروت" },
        { name: "Mille-Feuille", nameAr: "ميلفاي", desc: "Strawberry, vanilla chocolate, mango, lemon, framboise, passion fruit, all berries", descAr: "فراولة، فانيلا شوكولا، مانجو، ليمون، فرامبواز، باشن فروت، جميع التوت" },
        { name: "Mini Eclair", nameAr: "ميني إكلير", desc: "Chocolate, vanilla, strawberry", descAr: "شوكولا، فانيلا، فراولة" }
      ]
    }
  ],

  eventPackages: [
    {
      id: "buffet-classic",
      type: "buffet",
      name: "Classic",
      nameAr: "الباقة الكلاسيكية",
      pricePerPerson: 20,
      badge: "Ideal for weddings",
      note: "",
      choices: [
        { group: "appetizers", count: 4 },
        { group: "pastries", count: 5 },
        { group: "salads", count: 5 },
        { group: "hot-mains", count: 2 },
        { group: "desserts", count: 0 }
      ],
      includes: [],
      img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=85"
    },
    {
      id: "buffet-premium",
      type: "buffet",
      name: "Premium",
      nameAr: "الباقة المميزة",
      pricePerPerson: 25,
      badge: "",
      note: "",
      choices: [
        { group: "appetizers", count: 6 },
        { group: "pastries", count: 8 },
        { group: "salads", count: 5 },
        { group: "quiche", count: 2 },
        { group: "hot-mains", count: 3 },
        { group: "desserts", count: 0 }
      ],
      includes: [],
      img: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=85"
    },
    {
      id: "buffet-vip",
      type: "buffet",
      name: "VIP",
      nameAr: "الباقة الفاخرة",
      pricePerPerson: 30,
      badge: "",
      note: "",
      choices: [
        { group: "appetizers", count: 8 },
        { group: "pastries", count: 8 },
        { group: "salads", count: 8 },
        { group: "quiche", count: 3 },
        { group: "hot-mains", count: 4 },
        { group: "desserts", count: 0 }
      ],
      includes: ["Live pasta station"],
      img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=85"
    },
    {
      id: "birthday-classic",
      type: "birthday",
      name: "Classic",
      nameAr: "الباقة الكلاسيكية",
      pricePerPerson: 18,
      badge: "",
      note: "",
      choices: [
        { group: "mini-sandwiches", count: 2 },
        { group: "mini-bites", count: 2 },
        { group: "mini-salads", count: 2 },
        { group: "mini-pastries", count: 2 },
        { group: "mini-desserts", count: 2 }
      ],
      includes: [],
      img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=85"
    },
    {
      id: "birthday-premium",
      type: "birthday",
      name: "Premium",
      nameAr: "الباقة المميزة",
      pricePerPerson: 25,
      badge: "",
      note: "",
      choices: [
        { group: "mini-sandwiches", count: 3 },
        { group: "mini-bites", count: 3 },
        { group: "mini-salads", count: 3 },
        { group: "mini-pastries", count: 3 },
        { group: "mini-desserts", count: 3 }
      ],
      includes: [],
      img: "https://rest.thrubits.com/uploads/restorants/df4795db-abfa-4ca6-8e93-bfd2ac3a3b2a_medium.jpg"
    },
    {
      id: "birthday-vip",
      type: "birthday",
      name: "VIP",
      nameAr: "الباقة الفاخرة",
      pricePerPerson: 28,
      badge: "",
      note: "",
      choices: [
        { group: "mini-sandwiches", count: 5 },
        { group: "mini-bites", count: 5 },
        { group: "mini-salads", count: 5 },
        { group: "mini-pastries", count: 5 },
        { group: "mini-desserts", count: 5 }
      ],
      includes: [],
      img: "https://rest.thrubits.com/uploads/restorants/f940752b-2b90-4efb-aad5-22b13acdf2f3_medium.jpg"
    }
  ],

  liveStationMenu: [
    {
      id: "station-pasta",
      name: "Live pasta station",
      nameAr: "محطة الباستا الحية",
      options: [
        { label: "Classic", labelAr: "كلاسيك", price: 3, unit: "person" },
        { label: "VIP", labelAr: "VIP", price: 5, unit: "person" }
      ]
    },
    {
      id: "station-salad",
      name: "Live salad station",
      nameAr: "محطة السلطات الحية",
      options: [
        { label: "Classic", labelAr: "كلاسيك", price: 3, unit: "person" },
        { label: "VIP", labelAr: "VIP", price: 6, unit: "person" }
      ]
    },
    {
      id: "station-mashewe",
      name: "Live mashewe (grill) station",
      nameAr: "محطة المشاوي الحية",
      options: [
        { label: "Classic", labelAr: "كلاسيك", price: 8, unit: "person" },
        { label: "VIP", labelAr: "VIP", price: 12, unit: "person" }
      ]
    },
    {
      id: "station-burger",
      name: "Live burger & sandwiches station",
      nameAr: "محطة البرغر والسندويشات الحية",
      options: [
        { label: "Classic", labelAr: "كلاسيك", price: 4, unit: "person" },
        { label: "VIP", labelAr: "VIP", price: 6, unit: "person" }
      ]
    },
    {
      id: "station-sajj",
      name: "Live sajj station",
      nameAr: "محطة الساج الحية",
      options: [{ label: "Sajj", labelAr: "ساج", price: 2, unit: "person" }]
    },
    {
      id: "station-shawarma",
      name: "Live shawarma station",
      nameAr: "محطة الشاورما الحية",
      options: [
        { label: "Chicken (1 kg)", labelAr: "دجاج (1 كغ)", price: 25, unit: "kg" },
        { label: "Beef (1 kg)", labelAr: "لحم (1 كغ)", price: 35, unit: "kg" }
      ]
    },
    {
      id: "station-real-fillet",
      name: "Live real fillet station",
      nameAr: "محطة الريال فيليه الحية",
      options: [{ label: "Real fillet (1 kg)", labelAr: "ريال فيليه (1 كغ)", price: 45, unit: "kg" }]
    }
  ],

  mainCourseTrays: [
    { id: "tray-chicken-rice", name: "Chicken with Rice", nameAr: "رز ع دجاج", price: 150, serves: "30–40 people" },
    { id: "tray-meat-rice", name: "Meat with Rice", nameAr: "رز لحمة", price: 180, serves: "30–40 people" },
    { id: "tray-sayadieh", name: "Sayadieh", nameAr: "صياديه", price: 160, serves: "30–40 people" },
    { id: "tray-paella", name: "Paella", nameAr: "بايلا", price: 210, serves: "30–40 people" },
    { id: "tray-beef-fillet", name: "Beef Fillet with Potatoes & Vegetables (3 kg)", nameAr: "لحمة فيليه مع بطاطا وخضار (3 كغ)", price: 300, serves: "30–40 people" },
    { id: "tray-beef-stroganoff", name: "Beef Stroganoff", nameAr: "بيف ستروغونوف", price: 180, serves: "30–40 people" },
    { id: "tray-chicken-stroganoff", name: "Chicken Stroganoff", nameAr: "تشكن ستروغونوف", price: 150, serves: "30–40 people" },
    { id: "tray-shrimp-stroganoff", name: "Shrimp Stroganoff", nameAr: "شرمب ستروغونوف", price: 200, serves: "30–40 people" },
    { id: "tray-moroccan-chicken", name: "Moroccan Chicken", nameAr: "مغربيه دجاج", price: 180, serves: "30–40 people" },
    { id: "tray-freekeh-meat", name: "Freekeh with Meat", nameAr: "فريكه لحم", price: 200, serves: "30–40 people" },
    { id: "tray-freekeh-chicken", name: "Freekeh with Chicken", nameAr: "فريكه دجاج", price: 180, serves: "30–40 people" },
    { id: "tray-chicken-cashew", name: "Chicken Cashew", nameAr: "تشكن كاجو", price: 150, serves: "30–40 people" },
    { id: "tray-kibbeh-labanieh", name: "Kibbeh Labanieh & Shish Barak", nameAr: "كبه لبنيه وشيش برك", price: 150, serves: "30–40 people" },
    { id: "tray-stuffed-vegetables", name: "Mixed Stuffed Vegetables", nameAr: "محاشي مشكله", price: 180, serves: "30–40 people" },
    { id: "tray-shahbai-roast", name: "Shahbai Roast with Vegetables & Potatoes", nameAr: "روستو شهبايه مع خضره وبطاطا", price: 180, serves: "30–40 people" },
    { id: "tray-fettuccine-alfredo", name: "Fettuccine Alfredo", nameAr: "معكرونه الفريدو", price: 120, serves: "30–40 people" },
    { id: "tray-penne-arrabbiata", name: "Penne Arrabbiata", nameAr: "معكرونه اربياتا", price: 100, serves: "30–40 people" },
    { id: "tray-chicken-kabsa", name: "Chicken Kabsa", nameAr: "كبسه دجاج", price: 150, serves: "30–40 people" },
    { id: "tray-meat-kabsa", name: "Meat Kabsa", nameAr: "كبسه لحم", price: 180, serves: "30–40 people" },
    { id: "tray-grilled-chicken", name: "Grilled Chicken with Potatoes & Vegetables", nameAr: "غرلد تشكن مع بطاطا وخضار", price: 150, serves: "30–40 people" }
  ],

  miniBites: [
    { id: "bite-shawarma-beef", name: "Shawarma Beef", nameAr: "ميني شاورما لحم", desc: "Mini beef shawarma bites", price: 18, unit: "" },
    { id: "bite-shawarma-chicken", name: "Shawarma Chicken", nameAr: "ميني شاورما دجاج", desc: "Mini chicken shawarma bites", price: 18, unit: "" },
    { id: "bite-chicken-mix", name: "Chicken Mix", nameAr: "ميني دجاج ميكس", desc: "", price: 18, unit: "" },
    { id: "bite-tuna-mix", name: "Tuna Mix", nameAr: "ميني تونا ميكس", desc: "", price: 20, unit: "" },
    { id: "bite-sejok-mix", name: "Sejok Mix", nameAr: "ميني سجق ميكس", desc: "", price: 18, unit: "" },
    { id: "bite-halloumi-cucumber", name: "Halloumi Cucumber", nameAr: "ميني حلومي خيار", desc: "", price: 18, unit: "" },
    { id: "bite-kaaki-labni", name: "Kaaki Labni", nameAr: "ميني كعكة لبنة", desc: "", price: 12, unit: "" },
    { id: "bite-kaaki-cheese", name: "Kaaki Cheese", nameAr: "ميني كعكة جبنة", desc: "", price: 12, unit: "" },
    { id: "bite-kaaki-turkey-cheese", name: "Kaaki Turkey & Cheese", nameAr: "ميني كعكة تركي وجبنة", desc: "", price: 13, unit: "" }
  ],

  cateringExtras: [
    { id: "extra-bar", name: "Bar", nameAr: "بار" },
    { id: "extra-plate-service", name: "Plate service", nameAr: "خدمة الصحون" },
    { id: "extra-waiters", name: "Waiters", nameAr: "نُدُل" },
    { id: "extra-chef", name: "Chef", nameAr: "شيف" }
  ],

  // ==========================================================================
  // CATERING & WEDDING GALLERY (SECTION 1)
  // ==========================================================================
  cateringGallery: [
    {
      title: "Luxury Mountain Wedding Reception",
      category: "Weddings",
      caption: "Full-service bridal banquet & floral buffet styling in Mount Lebanon",
      img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=85"
    },
    {
      title: "Grand Lebanese Mezza Table",
      category: "Buffet Setups",
      caption: "Authentic hommos, moutabal, wara2 enab, kibbeh, and hot mezza display",
      img: "https://rest.thrubits.com/uploads/restorants/7475002e-6c1d-4101-854a-71ffc18760a6_medium.jpg"
    },
    {
      title: "Elegant Outdoor Bridal Table Arrangement",
      category: "Weddings",
      caption: "Bespoke table settings, crystal glassware, and curated multi-course menus",
      img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=85"
    },
    {
      title: "Signature Molten Cheddar Fountain Station",
      category: "Live Stations",
      caption: "Interactive cheese fountain with crispy bites for private parties & weddings",
      img: "https://rest.thrubits.com/uploads/restorants/df4795db-abfa-4ca6-8e93-bfd2ac3a3b2a_medium.jpg"
    },
    {
      title: "Executive Corporate Gala Buffet",
      category: "Corporate Events",
      caption: "Chafing dish presentations and uniformed service for 250+ corporate guests",
      img: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=85"
    },
    {
      title: "Charcoal Beef Fillet & Grill Presentation",
      category: "Food Displays",
      caption: "350g Halal beef fillet seared over charcoal with creamy mushroom sauce",
      img: "https://rest.thrubits.com/uploads/restorants/cecfd5bb-ae60-499d-b744-ee80a3f19031_medium.jpg"
    }
  ],

  // ==========================================================================
  // RESTAURANT ATMOSPHERE & VIEWS GALLERY (SECTION 3)
  // ==========================================================================
  restaurantGallery: [
    {
      title: "Panoramic Aley Mountain Sunset View",
      tag: "The View",
      desc: "Breathtaking horizon views from our terrace in Ain Al Remmaneh, Aley",
      img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85"
    },
    {
      title: "Open-Air Terrace & Evening Ambiance",
      tag: "Outdoor Dining",
      desc: "Cool mountain breeze, warm ambient lighting, and relaxed family seating",
      img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=85"
    },
    {
      title: "Traditional Lebanese Breakfast on the Terrace",
      tag: "Morning Spreads",
      desc: "Foul, Balila, Grilled Halloum, Labneh, Eggs with Kawarma & Hot Manakish",
      img: "https://rest.thrubits.com/uploads/restorants/3874c836-7655-42de-a7ab-13f1f0a6901d_medium.jpg"
    },
    {
      title: "The Kingdom of Burgers & Cheddar Syringe",
      tag: "Signature Burgers",
      desc: "Charcoal-grilled homemade beef burgers with molten cheddar & crispy sides",
      img: "https://rest.thrubits.com/uploads/restorants/4dc4415a-48df-4d76-9883-3b312497e768_medium.jpg"
    },
    {
      title: "Authentic Lebanese Mezza & Charcoal Grills",
      tag: "Lebanese Corner",
      desc: "Generous family tables filled with cold mezza, hot appetizers, and mixed grills",
      img: "https://rest.thrubits.com/uploads/restorants/7475002e-6c1d-4101-854a-71ffc18760a6_medium.jpg"
    },
    {
      title: "Cozy Interior & Family-Friendly Lounge",
      tag: "Indoor Atmosphere",
      desc: "Modern, welcoming dining room designed for families, friends, and celebrations",
      img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=85"
    }
  ],

  // ==========================================================================
  // ABOUT US: TEAM & BEHIND THE SCENES (SECTION 5)
  // ==========================================================================
  teamMembers: [
    {
      name: "Executive Culinary Director",
      role: "Head of Catering & Menu Innovation",
      bio: "Mastermind behind Mini Kitchen's #NotSoTraditional philosophy—blending time-honored Lebanese mountain recipes with bold American culinary flair.",
      img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Master of Lebanese Mezza & Grill",
      role: "Senior Oriental & Charcoal Chef",
      bio: "Specializes in authentic Lebanese cold & hot mezza, premium halal meat aging, charcoal mixed grills, and large-scale wedding banquet production.",
      img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Artisan Bakery & Pastry Chef",
      role: "Bil Foron, Knefe & Dessert Specialist",
      bio: "Leads our morning Saj & Bil Foron oven, handcrafted pizza doughs, homemade Lebanese Knefe, and live dessert stations at weddings.",
      img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Events & Hospitality Operations Manager",
      role: "Wedding & Corporate Event Execution",
      bio: "Coordinates every detail from initial menu tasting and venue layout to uniformed waitstaff choreography and on-time event execution.",
      img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
    }
  ],

  behindTheScenes: [
    {
      title: "Precision Kitchen Preparation",
      stage: "In The Kitchen",
      desc: "Daily fresh vegetable preparation, house-ground beef patties, and scratch-made sauces in our Aley kitchen.",
      img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Live Charcoal Grill Mastery",
      stage: "Cooking & Fire",
      desc: "Searing prime beef fillets, shish tawouk, and homemade burgers over real charcoal for unmistakable aroma.",
      img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Wedding Buffet Architecture & Setup",
      stage: "Catering Setup",
      desc: "Our event team arranging floral centerpieces, porcelain platters, and gold chafing dishes hours before guest arrival.",
      img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "White-Glove Service at Weddings & Galas",
      stage: "Event Execution",
      desc: "Attentive, uniformed hospitality staff ensuring every guest enjoys warm, freshly replenished dishes.",
      img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80"
    }
  ],

  // ==========================================================================
  // DELIVERY ZONES & PROMO CODES (MANAGED IN BACK OFFICE)
  // ==========================================================================
  deliveryZones: [
    { id: "zone-ain-al-remmaneh", name: "Ain Al Remmaneh (Local Area)", feeUsd: 1.0, eta: "20–30 min" },
    { id: "zone-aley-center", name: "Aley Center / Ras El Jabal / Souk", feeUsd: 2.0, eta: "25–35 min" },
    { id: "zone-bhamdoun-souk", name: "Bhamdoun / Souk El Gharb / Bsous", feeUsd: 3.0, eta: "30–45 min" },
    { id: "zone-kahale-araya", name: "Kahale / Araya / Jamhour", feeUsd: 4.0, eta: "35–50 min" },
    { id: "zone-pickup", name: "Restaurant Dine-In / Self Pickup (Aley Terrace)", feeUsd: 0.0, eta: "15–25 min" }
  ],

  promoCodes: [
    { code: "WELCOME10", type: "percent", value: 10, minOrderUsd: 15, label: "10% OFF Welcome Discount", active: true },
    { code: "ALEYVIP", type: "percent", value: 15, minOrderUsd: 35, label: "15% OFF Aley VIP Order ($35+)", active: true },
    { code: "FREEDELIVERY", type: "fixed", value: 2, minOrderUsd: 20, label: "$2.00 Delivery Credit", active: true }
  ],

  // ==========================================================================
  // CLIENT TESTIMONIALS
  // ==========================================================================
  testimonials: [
    {
      name: "Nadine & Karim H.",
      role: "Outdoor Mountain Wedding • 220 Guests (Aley)",
      quote: "Mini Kitchen Catering made our wedding in Mount Lebanon unforgettable. Guests are still talking about the live charcoal burger & cheddar station alongside the traditional Lebanese mezza buffet!",
      img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80",
      rating: 5
    },
    {
      name: "Tarek El-Khoury",
      role: "Corporate Annual Gala • 110 Guests (Beirut)",
      quote: "Flawless presentation, punctual white-glove waitstaff, and generous portions. Their executive buffet and canapé setup exceeded five-star hotel standards.",
      img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80",
      rating: 5
    },
    {
      name: "Maya & Family",
      role: "Restaurant Terrace & WhatsApp Delivery • Bhamdoun",
      quote: "Whether we visit the Ain Al Remmaneh terrace for sunset views and Manakish Bil Foron or order the Kingdom of Burgers to our villa via WhatsApp, the quality is always 10/10.",
      img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
      rating: 5
    }
  ]
};

export default SITE_CONFIG;
