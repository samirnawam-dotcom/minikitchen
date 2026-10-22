// ============================================================================
// MINI KITCHEN — SITE CONFIGURATION, BRANDS, CATERING PACKAGES & GALLERIES
// Easy-to-update central configuration file for all three Mini Kitchen brands.
// ============================================================================

window.MK_SITE_CONFIG = {
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
        title: "Catering Menus & Wedding Packages | Mini Kitchen Catering Aley, Lebanon",
        description: "Explore Mini Kitchen's Wedding Catering Packages ($32–$45/guest), Corporate Event Buffets, Live Molten Cheddar & Shawarma Stations, and 239+ Lebanese & American FineDine dishes.",
        keywords: "catering menu Lebanon, wedding catering prices Lebanon, Lebanese mezza buffet catering, live shawarma station wedding, molten cheddar fountain Lebanon, Mini Kitchen menus",
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
  // CATERING PACKAGES & EVENT FORMULAS (SECTION 1 & SECTION 6)
  // ==========================================================================
  cateringPackages: [
    {
      id: "pkg-wedding-royal",
      category: "wedding",
      categoryLabel: "Wedding Catering",
      badge: "Most Popular for Weddings",
      title: "The Royal Mountain Wedding Feast",
      subtitle: "Luxury seated or grand buffet reception crafted for unforgettable Lebanese weddings",
      pricePerPerson: "$45",
      minGuests: "80+ Guests",
      img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=85",
      highlights: [
        "Welcome Drink & Passed Canapés Bar upon guest arrival",
        "Complete Authentic Lebanese Cold & Hot Mezza Spread (14+ varieties: Hommos, Moutabal, Wara2 Enab, Tabbouleh, Fattoush, Kebbe, Sambousik, Cheese Rkakat, Batata Harra, Lemony Makanek & Sejouk)",
        "Live Charcoal Grill & Carving Station (Prime Halal Beef Fillet, Shish Tawouk, Kafta & Deboned Farrouj Msahab)",
        "International Hot Chafing Dish Selection (Tagliatelle Shrimp, Grilled Chicken Breast in Mushroom Cream, Saffron Rice)",
        "Royal Dessert & Live Homemade Knefe Table with Seasonal Fruit Display",
        "Full Uniformed Waitstaff, Event Captain, Chafing Dishes & Luxury Table Setup"
      ]
    },
    {
      id: "pkg-wedding-sunset",
      category: "wedding",
      categoryLabel: "Wedding & Engagement",
      badge: "Cocktail & Grazing",
      title: "Sunset Garden Cocktail & Canapé Reception",
      subtitle: "Chic outdoor cocktail reception for engagements, bridal showers, and modern garden weddings",
      pricePerPerson: "$32",
      minGuests: "50+ Guests",
      img: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=85",
      highlights: [
        "Artisan Grazing Table with Lebanese & Imported Cheeses, Halloumi Skewers & Fresh Fruits",
        "Gourmet Mini Sliders Trio (Mom Style Beef, Crispy Zinger & Truffle Mushroom)",
        "Mediterranean & Seafood Bite Shooters (Shrimp Provençal, Calamari Cones & Mini Quinoa Shrimp Cups)",
        "Live Pasta & Truffle Mac Station cooked to order in front of guests",
        "Mini Dessert Petits Fours, Brownie Bites, Cheesecake Cups & Fresh Mocktail Bar",
        "Elegant High-Top Cocktail Styling, Floral Buffet Accents & Professional Servers"
      ]
    },
    {
      id: "pkg-wedding-imperial",
      category: "wedding",
      categoryLabel: "Luxury Wedding",
      badge: "All-Inclusive VIP",
      title: "Grand Imperial Five-Station Gala",
      subtitle: "Our pinnacle wedding production featuring 5 interactive live cooking stations & VIP table service",
      pricePerPerson: "$60",
      minGuests: "100+ Guests",
      img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=85",
      highlights: [
        "5 Interactive Chef-Manned Live Stations (Lebanese Mezza & Nayye Bar, Prime Beef Fillet Carving, Live Italian Pasta, Gourmet Sliders & Cheddar Fountain, Live Knefe & Crêpe Bar)",
        "Premium Seafood Selection including Jumbo Shrimps, Smoked Salmon & Seafood Salad",
        "Dedicated VIP Bride & Groom Table Concierge Service",
        "Full Beverage, Fresh Juice, Specialty Turkish/Lebanese Rakwe Coffee & Digestif Bar",
        "Complete Porcelain, Gold Cutlery, Linen & Buffet Architecture Included"
      ]
    },
    {
      id: "pkg-corporate-gala",
      category: "corporate",
      categoryLabel: "Corporate Events",
      badge: "Executive Choice",
      title: "Executive Corporate Gala & Annual Dinner Buffet",
      subtitle: "Impressive, seamless catering for company milestones, conferences, and diplomatic receptions",
      pricePerPerson: "$28",
      minGuests: "30+ Guests",
      img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=85",
      highlights: [
        "Selection of 8 Signature Cold & Hot Starters (Lebanese Mezza & American Finger Bites)",
        "3 Premium Main Courses (Grilled Chicken Breast with Mushroom White Sauce, Beef Fillet Medallions & Mixed Grill)",
        "Artisan Salads Corner (Seafood Salad, Chick Wick Honey Mustard, Rocca Halloum & Fattoush)",
        "Executive Pastry, Cheesecake, Tiramisu & Fresh Juice Bar",
        "On-time setup, sleek black & gold chafing dishes, and uniformed corporate hospitality crew"
      ]
    },
    {
      id: "pkg-corporate-launch",
      category: "corporate",
      categoryLabel: "Product Launches & Seminars",
      badge: "Finger Food & Networking",
      title: "Product Launch & Networking Canapé Package",
      subtitle: "Zero-mess, high-impact bite-sized gastronomy designed for mingling, showrooms, and brand launches",
      pricePerPerson: "$22",
      minGuests: "25+ Guests",
      img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1000&q=85",
      highlights: [
        "10 Passed Bite-Sized Savory Creations per Guest (Mini Fajita Sub Rolls, Pesto Chicken Bites, Shrimp Pané Skewers, Mini Kebbe & Cheese Rkakat)",
        "Signature Mini Burger & Wrap Platter Assortment",
        "Specialty Coffee, Espresso, Cappuccino, Fresh Iced Teas & Mojito Bar",
        "Branded Menu Cards & Custom Color-Coordinated Buffet Styling"
      ]
    },
    {
      id: "pkg-private-lebanese",
      category: "private",
      categoryLabel: "Private Parties & Gatherings",
      badge: "Authentic Lebanese Formula",
      title: "Authentic Lebanese Mezza & Mixed Grill Formula",
      subtitle: "Our beloved Lebanese feast scaled for birthdays, family reunions, baptisms, and villa gatherings",
      pricePerPerson: "$25",
      minGuests: "4 to 200+ Guests ($100 per 4 guests)",
      img: "https://rest.thrubits.com/uploads/restorants/7475002e-6c1d-4101-854a-71ffc18760a6_medium.jpg",
      highlights: [
        "Cold Mezza: Traditional Hommos, Moutabal, Wara2 Enab, Lebanese Twist Tabbouleh & Fattouch",
        "Hot Mezza: Batata Harra, French Fries, Kebbe Lahme, Cheese Rkakat, Sambousik, Chhotty Sejouk, Lemony Makanek & Wings Provençal",
        "Charcoal Main Course: Mixed Skewers (Shish Tawouk, Halal Meat & Kafta) OR Charcoal Farrouj Msahab",
        "Lebanese Desserts (Homemade Knefe / 3eych El Saraya), Soft Drinks & Rakwe Coffee"
      ]
    },
    {
      id: "pkg-private-american",
      category: "private",
      categoryLabel: "Birthdays & Youth Parties",
      badge: "Crowd Favorite",
      title: "American Feast & Molten Cheddar Fountain Formula",
      subtitle: "High-energy comfort food extravaganza featuring our famous 1KG Cheddar Fountain, burgers, and pastas",
      pricePerPerson: "$25",
      minGuests: "4 to 150+ Guests ($100 per 4 guests)",
      img: "https://rest.thrubits.com/uploads/restorants/df4795db-abfa-4ca6-8e93-bfd2ac3a3b2a_medium.jpg",
      highlights: [
        "Signature Molten Cheddar Fountain Station with Crispy Chicken, Mozzarella Sticks, Jalapeño Poppers, BBQ/Buffalo Wings & Onion Rings",
        "Starters & Salads: Garlic Bread, BBQ Cheese Nachos, Garden of Green Salad & Chicken Teriyaki Salad",
        "Main Courses: Grilled Chicken Breast in Mushroom Sauce, Tagliatelle Alfredo & Specialty Burgers",
        "Dessert Bar (Calzone Nutella, Fondant, Crêpes) & Chilled Soft Drinks"
      ]
    },
    {
      id: "pkg-private-breakfast",
      category: "private",
      categoryLabel: "Morning Gatherings &Brunch",
      badge: "Mountain Morning Feast",
      title: "Traditional Lebanese Mountain Breakfast & Bil Foron Saj",
      subtitle: "Ideal for morning wedding prep, family brunches, and outdoor mountain gatherings",
      pricePerPerson: "$15",
      minGuests: "10+ Guests (or $36 Formula for 4)",
      img: "https://rest.thrubits.com/uploads/restorants/3874c836-7655-42de-a7ab-13f1f0a6901d_medium.jpg",
      highlights: [
        "Live Bil Foron Manakish Selection: Zaatar, Akkawi & Mozzarella Jebne, Kechek Baladi, Halloum & Labneh bi Kawarma",
        "Hot Morning Pots: Lebanese Foul Mix, Balila with Cumin & Garlic Oil, Hommos Fatteh with Tarator & Pine Nuts",
        "Farm Eggs & Dairy: Eggs with Kawarma Baladi, Grilled Halloumi Platter, Labneh Platter & Makdous",
        "Sweet Pancakes with Honey & Fruits, Traditional Rakwe Coffee & Fresh Mint Tea"
      ]
    }
  ],

  // ==========================================================================
  // LIVE COOKING STATIONS (FOR WEDDINGS & EVENTS)
  // ==========================================================================
  liveStations: [
    {
      title: "The Molten Cheddar Fountain & Sliders Bar",
      desc: "Our viral signature attraction! Flowing warm aged cheddar cheese paired with charcoal-grilled beef sliders, crispy chicken tenders, mozzarella sticks, wings, and curly fries.",
      tag: "Signature Attraction",
      img: "https://rest.thrubits.com/uploads/restorants/df4795db-abfa-4ca6-8e93-bfd2ac3a3b2a_medium.jpg"
    },
    {
      title: "Live Charcoal Mixed Grill & Fillet Carving",
      desc: "Our grill masters sear halal beef fillets, shish tawouk, kafta skewers, and marinated farrouj msahab live over glowing charcoal at your venue.",
      tag: "Wedding Essential",
      img: "https://rest.thrubits.com/uploads/restorants/cecfd5bb-ae60-499d-b744-ee80a3f19031_medium.jpg"
    },
    {
      title: "Authentic Lebanese Mezza & Bil Foron Oven",
      desc: "Freshly baked Zaatar, Jebne, Kechek, and Labneh bi Kawarma straight from the oven alongside 14+ artisan cold and hot Lebanese mezza dishes.",
      tag: "Heritage Hospitality",
      img: "https://rest.thrubits.com/uploads/restorants/7475002e-6c1d-4101-854a-71ffc18760a6_medium.jpg"
    },
    {
      title: "Live Italian Pasta & Shrimp Tagliatelle Wheel",
      desc: "Made-to-order Tagliatelle Shrimp, Penne Arrabiata, Four-Cheese Penne, and Truffle Mac & Cheese tossed live in front of your guests.",
      tag: "Interactive Station",
      img: "https://rest.thrubits.com/uploads/restorants/6fc84d0a-9543-4222-9927-3c9fe7612d20_medium.jpg"
    },
    {
      title: "Live Homemade Knefe, Crêpe & Nutella Calzone Bar",
      desc: "Warm golden Lebanese Knefe, Lotus & Kinder crêpes, Pain Perdu, and oven-baked Nutella Calzones prepared fresh for a sweet finale.",
      tag: "Sweet Finale",
      img: "https://rest.thrubits.com/uploads/restorants/f940752b-2b90-4efb-aad5-22b13acdf2f3_medium.jpg"
    }
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
  // INTERACTIVE EVENT CALCULATOR STATION ADD-ONS & CLIENT TESTIMONIALS
  // ==========================================================================
  stationAddons: [
    { id: "st-burger", name: "Live Charcoal Burger & Cheddar Syringe Station", pricePerGuest: 5 },
    { id: "st-saj", name: "Live Lebanese Saj & Bil Foron Bakery Station", pricePerGuest: 4 },
    { id: "st-pasta", name: "Live Italian Pasta & Truffle Parmesan Wheel", pricePerGuest: 5 },
    { id: "st-knefe", name: "Live Oriental Knefe & Dessert Bar", pricePerGuest: 4 },
    { id: "st-welcome", name: "Welcome Mocktail & Grazing Canapé Reception", pricePerGuest: 3 }
  ],

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
