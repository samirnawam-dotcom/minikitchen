// ============================================================================
// MINI KITCHEN — FINEDINE DIGITAL MENU & MODIFIERS DATA
// Powers FineDine visual category stories, item modals, modifiers & cart.
// ============================================================================

window.MK_MODIFIER_GROUPS = {
  "burger": [
    {
      "id": "prep-style",
      "name": "Preparation & Spice Preference",
      "required": true,
      "type": "radio",
      "options": [
        {
          "label": "Classic Signature Preparation",
          "price": 0,
          "default": true
        },
        {
          "label": "Make It Spicy (House Chili Sauce)",
          "price": 0
        },
        {
          "label": "Sauce on the Side",
          "price": 0
        }
      ]
    },
    {
      "id": "burger-addons",
      "name": "Awesome Add-Ons & Upgrades",
      "required": false,
      "type": "checkbox",
      "options": [
        {
          "label": "200g Molten Cheddar Syringe",
          "price": 2
        },
        {
          "label": "Deep-Fried Mozzarella Patty",
          "price": 2
        },
        {
          "label": "Extra 200g Beef Patty",
          "price": 3
        },
        {
          "label": "Smoked Beef Bacon",
          "price": 2
        },
        {
          "label": "Fried Farm Egg",
          "price": 0.5
        },
        {
          "label": "Upgrade Fries to Curly Fries",
          "price": 4
        },
        {
          "label": "Warm Cheddar Dipping Cup",
          "price": 2
        }
      ]
    }
  ],
  "grill": [
    {
      "id": "grill-temp",
      "name": "Charcoal Grill Preference",
      "required": true,
      "type": "radio",
      "options": [
        {
          "label": "Medium-Well (Chef Recommended)",
          "price": 0,
          "default": true
        },
        {
          "label": "Well-Done",
          "price": 0
        },
        {
          "label": "Medium",
          "price": 0
        }
      ]
    },
    {
      "id": "grill-sides",
      "name": "Extra Sides & Condiments",
      "required": false,
      "type": "checkbox",
      "options": [
        {
          "label": "Extra Whipped Garlic Toum",
          "price": 1
        },
        {
          "label": "Mushroom White Sauce Cup",
          "price": 2
        },
        {
          "label": "Add Grilled Chicken Breast",
          "price": 4
        },
        {
          "label": "Side of Curly Fries",
          "price": 4
        }
      ]
    }
  ],
  "breakfast": [
    {
      "id": "bread-choice",
      "name": "Bread & Accompaniment",
      "required": true,
      "type": "radio",
      "options": [
        {
          "label": "Warm Arabic & Thyme Flatbread",
          "price": 0,
          "default": true
        },
        {
          "label": "Extra Fresh Veggie Crudités",
          "price": 0
        }
      ]
    },
    {
      "id": "breakfast-extras",
      "name": "Morning Add-Ons",
      "required": false,
      "type": "checkbox",
      "options": [
        {
          "label": "Add Fried Egg",
          "price": 0.5
        },
        {
          "label": "Side of Makdous",
          "price": 3.5
        },
        {
          "label": "Cup of Lebanese Tea",
          "price": 2
        }
      ]
    }
  ],
  "pizza": [
    {
      "id": "crust-pref",
      "name": "Baking Style",
      "required": true,
      "type": "radio",
      "options": [
        {
          "label": "Classic Stone-Baked Medium",
          "price": 0,
          "default": true
        },
        {
          "label": "Crispy Well-Baked Crust",
          "price": 0
        }
      ]
    },
    {
      "id": "pizza-extras",
      "name": "Extra Toppings & Dips",
      "required": false,
      "type": "checkbox",
      "options": [
        {
          "label": "Molten Cheddar Syringe",
          "price": 2
        },
        {
          "label": "Extra Mozzarella Cheese",
          "price": 2
        },
        {
          "label": "Ranch / BBQ Dip Sauce",
          "price": 1
        }
      ]
    }
  ],
  "fountain": [
    {
      "id": "fountain-dippers",
      "name": "Select Your Dippers & Bites",
      "required": false,
      "type": "checkbox",
      "options": [
        {
          "label": "+ Crispy Chicken Piece",
          "price": 1.9
        },
        {
          "label": "+ Mozzarella Stick",
          "price": 1.9
        },
        {
          "label": "+ Mozzarella Jalapeño Popper",
          "price": 1.5
        },
        {
          "label": "+ BBQ / Buffalo Wing",
          "price": 1
        },
        {
          "label": "+ Onion Rings (5 pcs)",
          "price": 1.9
        },
        {
          "label": "+ Frankfurter Sausage",
          "price": 1.9
        },
        {
          "label": "+ Chicken Escalope Piece",
          "price": 3.6
        }
      ]
    }
  ],
  "sweet": [
    {
      "id": "sweet-toppings",
      "name": "Sweet Enhancements",
      "required": false,
      "type": "checkbox",
      "options": [
        {
          "label": "Add Vanilla Ice Cream Scoop",
          "price": 2
        },
        {
          "label": "Add Fresh Strawberries",
          "price": 1.5
        },
        {
          "label": "Add Sliced Banana",
          "price": 1
        },
        {
          "label": "Add Kinder Chocolate",
          "price": 2
        },
        {
          "label": "Add Warm Brownie Pieces",
          "price": 2
        }
      ]
    }
  ],
  "pasta": [
    {
      "id": "pasta-addons",
      "name": "Customize Your Pasta",
      "required": false,
      "type": "checkbox",
      "options": [
        {
          "label": "Add Grilled Chicken Breast",
          "price": 4
        },
        {
          "label": "Extra Parmesan & Mozzarella",
          "price": 2
        },
        {
          "label": "Make It Spicy (Arrabbiata Chili)",
          "price": 0
        }
      ]
    }
  ]
};

window.MK_MENU_CATEGORIES = [
  {
    "id": "hot-offers",
    "rawCategory": "HOT OFFER ( served in week days only)",
    "name": "Hot Offers & Formulas",
    "subtitle": "Special bundles & 4-person sharing formulas",
    "badge": "Special bundles & 4-person sharing formulas",
    "icon": "fa-fire",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/7475002e-6c1d-4101-854a-71ffc18760a6_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    "modType": "bundle",
    "count": 5,
    "items": [
      {
        "id": "mk-item-1",
        "categoryId": "hot-offers",
        "categoryName": "Hot Offers & Formulas",
        "title": "Breakfast Offer For 4",
        "desc": "Foul mix, balila , scrambled egg, labneh platter, 4 man2oushe (jebneh, zaatar,keshek, khodra), 4 tea.",
        "price": "$36.00",
        "priceValue": 36,
        "img": "https://rest.thrubits.com/uploads/restorants/3874c836-7655-42de-a7ab-13f1f0a6901d_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Vegetarian",
            "type": "veg",
            "icon": "fa-leaf"
          },
          {
            "label": "Sharing",
            "type": "sharing",
            "icon": "fa-users"
          }
        ],
        "modType": "bundle"
      },
      {
        "id": "mk-item-2",
        "categoryId": "hot-offers",
        "categoryName": "Hot Offers & Formulas",
        "title": "Fantastic Four",
        "desc": "1 zinger winner 1 escalope sandwish 1 pesto chicken 1 fajita 4 mozz sticks 4 mozz jalapeno 1 onion rings.",
        "price": "$50.00",
        "priceValue": 50,
        "img": "https://rest.thrubits.com/uploads/restorants/a9d19a4b-0870-41f5-9413-fbb89a2004ee_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Spicy",
            "type": "spicy",
            "icon": "fa-pepper-hot"
          }
        ],
        "modType": "bundle"
      },
      {
        "id": "mk-item-3",
        "categoryId": "hot-offers",
        "categoryName": "Hot Offers & Formulas",
        "title": "Lebanese Mezza Formula For 4 (No Alcohol) 25$ Per Person",
        "desc": "1 homus 1 moutabal 1 wara2 enab 1 tabouleh 1 fatouch 1 fries 1 batata harra 4pcs kebbe 4psc rkakat 4psc sambousik 1 sejouk 1 mecanic 1 wings provencial main course ( 2 skewers tawouk, 2 skewers meat, 2 skewers kafta) or farrouf msahab dessert 4 soft drink.",
        "price": "$100.00",
        "priceValue": 100,
        "img": "https://rest.thrubits.com/uploads/restorants/7475002e-6c1d-4101-854a-71ffc18760a6_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Spicy",
            "type": "spicy",
            "icon": "fa-pepper-hot"
          },
          {
            "label": "Vegetarian",
            "type": "veg",
            "icon": "fa-leaf"
          },
          {
            "label": "Sharing",
            "type": "sharing",
            "icon": "fa-users"
          }
        ],
        "modType": "bundle"
      },
      {
        "id": "mk-item-4",
        "categoryId": "hot-offers",
        "categoryName": "Hot Offers & Formulas",
        "title": "American Formula For 4, 25$ Per Person",
        "desc": "Garlic bread, nachos, garden of green salad, chicken teryake salad, fountain cheddar 0.5kg, 4 crispy, 4 mozzarella stick, 8 wings, onion rings. main course: grilled chicken breast, tagliatelle alfredo dessert 4 soft drings.",
        "price": "$100.00",
        "priceValue": 100,
        "img": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Sharing",
            "type": "sharing",
            "icon": "fa-users"
          }
        ],
        "modType": "bundle"
      },
      {
        "id": "mk-item-5",
        "categoryId": "hot-offers",
        "categoryName": "Hot Offers & Formulas",
        "title": "Burgers Offer",
        "desc": "1 zinger burger 1 cheese please burger 1 magestic runchy burger 1 escalope burger 4 cheddar jalapeno onion rings fries and coleslaw.",
        "price": "$50.00",
        "priceValue": 50,
        "img": "https://rest.thrubits.com/uploads/restorants/ada79229-af4c-4007-b112-c6413dc60d7b_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Spicy",
            "type": "spicy",
            "icon": "fa-pepper-hot"
          }
        ],
        "modType": "bundle"
      }
    ]
  },
  {
    "id": "breakfast",
    "rawCategory": "BREAKFAST",
    "name": "Lebanese Breakfast",
    "subtitle": "Served daily starting 8:00 AM with fresh vegetables & warm bread",
    "badge": "Served daily starting 8:00 AM with fresh vegetables & warm bread",
    "icon": "fa-sun",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/e88f91d3-2df2-4d2d-aab4-734b95bf4712_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
    "modType": "breakfast",
    "count": 11,
    "items": [
      {
        "id": "mk-item-6",
        "categoryId": "breakfast",
        "categoryName": "Lebanese Breakfast",
        "title": "Labne Platter",
        "desc": "Labne , fresh seasonal vegetables, thyme bread.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Vegetarian",
            "type": "veg",
            "icon": "fa-leaf"
          }
        ],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-7",
        "categoryId": "breakfast",
        "categoryName": "Lebanese Breakfast",
        "title": "Grilled Halloum Platter",
        "desc": "6 slice of halloum grilled, served with fresh vegetables & warm bread.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://rest.thrubits.com/uploads/restorants/e88f91d3-2df2-4d2d-aab4-734b95bf4712_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-8",
        "categoryId": "breakfast",
        "categoryName": "Lebanese Breakfast",
        "title": "Foul",
        "desc": "Lebaneese style foul mix served with mix vegg.",
        "price": "$7.00",
        "priceValue": 7,
        "img": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Vegetarian",
            "type": "veg",
            "icon": "fa-leaf"
          }
        ],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-9",
        "categoryId": "breakfast",
        "categoryName": "Lebanese Breakfast",
        "title": "Balila Mix",
        "desc": "Hommos mix with cumin garlic oil, served with fresh vegetables & warm bread.",
        "price": "$7.00",
        "priceValue": 7,
        "img": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Vegetarian",
            "type": "veg",
            "icon": "fa-leaf"
          }
        ],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-10",
        "categoryId": "breakfast",
        "categoryName": "Lebanese Breakfast",
        "title": "Hommos Fatte",
        "desc": "Hommos mix with tarator and toasted pine nuts & cashews.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Vegetarian",
            "type": "veg",
            "icon": "fa-leaf"
          }
        ],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-11",
        "categoryId": "breakfast",
        "categoryName": "Lebanese Breakfast",
        "title": "Pancake",
        "desc": "3 pancake fresh dough served with chocolate or honey and mix fruits.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://rest.thrubits.com/uploads/restorants/ced1d468-4cd0-4aa7-9547-76b0e29e202c_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-12",
        "categoryId": "breakfast",
        "categoryName": "Lebanese Breakfast",
        "title": "Scrambeld Egg",
        "desc": "3 pcs of egg mix with cream.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-13",
        "categoryId": "breakfast",
        "categoryName": "Lebanese Breakfast",
        "title": "Egg Kawarma",
        "desc": "Egg mix served with kawarma balade with vegg platter.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-14",
        "categoryId": "breakfast",
        "categoryName": "Lebanese Breakfast",
        "title": "Egg With Cheese",
        "desc": "Egg mix topped with mozzarella cheese served with fresh garden vegetable plate.",
        "price": "$7.00",
        "priceValue": 7,
        "img": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-15",
        "categoryId": "breakfast",
        "categoryName": "Lebanese Breakfast",
        "title": "Egg With Vegg",
        "desc": "Egg mix topped with vegg (mushrrom green peppers tomato) served with fresh garden vegetable plate.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-16",
        "categoryId": "breakfast",
        "categoryName": "Lebanese Breakfast",
        "title": "Makdous",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$3.50",
        "priceValue": 3.5,
        "img": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "breakfast"
      }
    ]
  },
  {
    "id": "bil-foron",
    "rawCategory": "BIL FORON",
    "name": "Bil Foron (Manakish)",
    "subtitle": "Freshly baked dough from our stone oven",
    "badge": "Freshly baked dough from our stone oven",
    "icon": "fa-wheat-awn",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/bed5f91e-1d91-40bf-84eb-610ded497282_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
    "modType": "breakfast",
    "count": 6,
    "items": [
      {
        "id": "mk-item-17",
        "categoryId": "bil-foron",
        "categoryName": "Bil Foron (Manakish)",
        "title": "Zaatar",
        "desc": "Zaatar mix served with fresh garden vegetable plate.",
        "price": "$3.00",
        "priceValue": 3,
        "img": "https://rest.thrubits.com/uploads/restorants/bed5f91e-1d91-40bf-84eb-610ded497282_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Vegetarian",
            "type": "veg",
            "icon": "fa-leaf"
          }
        ],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-18",
        "categoryId": "bil-foron",
        "categoryName": "Bil Foron (Manakish)",
        "title": "Jebne",
        "desc": "Mix of akkawi cheese and mozzarella served with fresh garden vegetable plate.",
        "price": "$4.00",
        "priceValue": 4,
        "img": "https://rest.thrubits.com/uploads/restorants/41e564c0-033c-463c-867b-7280a6905ed4_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Vegetarian",
            "type": "veg",
            "icon": "fa-leaf"
          }
        ],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-19",
        "categoryId": "bil-foron",
        "categoryName": "Bil Foron (Manakish)",
        "title": "Halloum",
        "desc": "Halloum cheese mix with mozzarella served with fresh garden vegetable plate.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-20",
        "categoryId": "bil-foron",
        "categoryName": "Bil Foron (Manakish)",
        "title": "Kechek",
        "desc": "Lebanese kechek baladi mix with tomato onion and oil served with fresh garden vegetable plate.",
        "price": "$4.00",
        "priceValue": 4,
        "img": "https://rest.thrubits.com/uploads/restorants/e217d99e-e688-4bfe-9346-387ef7f268ca_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-21",
        "categoryId": "bil-foron",
        "categoryName": "Bil Foron (Manakish)",
        "title": "Banadoura W Basal",
        "desc": "Tomato onion green pepper mix with peppers served with fresh garden vegetable plate.",
        "price": "$4.00",
        "priceValue": 4,
        "img": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "breakfast"
      },
      {
        "id": "mk-item-22",
        "categoryId": "bil-foron",
        "categoryName": "Bil Foron (Manakish)",
        "title": "Labne Bi Kawarama",
        "desc": "3 level of labne fresh dough topped with live cooked hot kawaram served with fresh garden vegetable plate.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "breakfast"
      }
    ]
  },
  {
    "id": "appetisers",
    "rawCategory": "PINCH OF BITES - APPETISERS",
    "name": "Pinch of Bites",
    "subtitle": "Crispy starters, loaded fries & sharing appetizers",
    "badge": "Crispy starters, loaded fries & sharing appetizers",
    "icon": "fa-utensils",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/d955437e-d1de-49ae-aaea-53c5464a09dc_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
    "modType": "starters",
    "count": 10,
    "items": [
      {
        "id": "mk-item-23",
        "categoryId": "appetisers",
        "categoryName": "Pinch of Bites",
        "title": "One For All All For One",
        "desc": "3pcs bbq wings, 2 pcs mozz sticks, 2 pcs crispy chicken, pinch of fries serving with mix of sauces.",
        "price": "$11.00",
        "priceValue": 11,
        "img": "https://rest.thrubits.com/uploads/restorants/d955437e-d1de-49ae-aaea-53c5464a09dc_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "starters"
      },
      {
        "id": "mk-item-24",
        "categoryId": "appetisers",
        "categoryName": "Pinch of Bites",
        "title": "Potato Tubes",
        "desc": "400g of chips fries fried, its enough for 2 served with dip of ketchup.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "starters"
      },
      {
        "id": "mk-item-25",
        "categoryId": "appetisers",
        "categoryName": "Pinch of Bites",
        "title": "Curly Fries",
        "desc": "400g of chips curly fries fried, its enough for 2 served with dip of ketchup.",
        "price": "$9.00",
        "priceValue": 9,
        "img": "https://rest.thrubits.com/uploads/restorants/2a173adc-421e-48bc-a0e2-e26ab55dd4c5_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "starters"
      },
      {
        "id": "mk-item-26",
        "categoryId": "appetisers",
        "categoryName": "Pinch of Bites",
        "title": "Garlic Bread",
        "desc": "Mix garlic, butter, mozzarella cheese.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://rest.thrubits.com/uploads/restorants/75dd64b4-06ab-4b76-ac90-d3fba318bd72_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "starters"
      },
      {
        "id": "mk-item-27",
        "categoryId": "appetisers",
        "categoryName": "Pinch of Bites",
        "title": "Cheese Nachos",
        "desc": "Bbq nachos and melted cheese.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://rest.thrubits.com/uploads/restorants/f47e7825-d475-4c65-a4ba-cdd7ae64e044_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "starters"
      },
      {
        "id": "mk-item-28",
        "categoryId": "appetisers",
        "categoryName": "Pinch of Bites",
        "title": "Loaded Chicken Fries",
        "desc": "Mix sauce, escalope chicken, 400g of fries, mozzarella cheese and cheddar cheese.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "starters"
      },
      {
        "id": "mk-item-29",
        "categoryId": "appetisers",
        "categoryName": "Pinch of Bites",
        "title": "Calamari Ring",
        "desc": "6 pc of calamari ring serving with a dip of tartar sauce.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "starters"
      },
      {
        "id": "mk-item-30",
        "categoryId": "appetisers",
        "categoryName": "Pinch of Bites",
        "title": "Shrimps Pane",
        "desc": "6 pc fried shrimps served with dip of cocktail sauce.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://rest.thrubits.com/uploads/restorants/240dccd6-95ec-4208-b20f-b076594c8a97_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "starters"
      },
      {
        "id": "mk-item-31",
        "categoryId": "appetisers",
        "categoryName": "Pinch of Bites",
        "title": "Wedges",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "starters"
      },
      {
        "id": "mk-item-32",
        "categoryId": "appetisers",
        "categoryName": "Pinch of Bites",
        "title": "Baked Potato",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "starters"
      }
    ]
  },
  {
    "id": "cheddar-fountain",
    "rawCategory": "CHEDDAR FOUNTAIN",
    "name": "Cheddar Fountain",
    "subtitle": "Our famous molten cheddar cheese fountain & dippers",
    "badge": "Our famous molten cheddar cheese fountain & dippers",
    "icon": "fa-cheese",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/df4795db-abfa-4ca6-8e93-bfd2ac3a3b2a_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
    "modType": "fountain",
    "count": 11,
    "items": [
      {
        "id": "mk-item-33",
        "categoryId": "cheddar-fountain",
        "categoryName": "Cheddar Fountain",
        "title": "Cheddar Fountain - 1 KG",
        "desc": "Served with french fries you can add anything to it: wings - crispy - drumstick - mozzarella stick - escalope, and anything else you'd want! 4 to 8 persons - depending on the add-ons added.",
        "price": "$17.00",
        "priceValue": 17,
        "img": "https://rest.thrubits.com/uploads/restorants/df4795db-abfa-4ca6-8e93-bfd2ac3a3b2a_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Sharing",
            "type": "sharing",
            "icon": "fa-users"
          }
        ],
        "modType": "fountain"
      },
      {
        "id": "mk-item-34",
        "categoryId": "cheddar-fountain",
        "categoryName": "Cheddar Fountain",
        "title": "Cheddar Fountain - 0.5 KG",
        "desc": "Served with french fries you can add anything to it: wings - crispy - drumstick - mozzarella stick - escalope, and anything else you'd want! 2 to 4 persons - depending on the add-ons added.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://rest.thrubits.com/uploads/restorants/11a8f9bd-e8cb-40fb-b128-e40690eb4a35_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "fountain"
      },
      {
        "id": "mk-item-35",
        "categoryId": "cheddar-fountain",
        "categoryName": "Cheddar Fountain",
        "title": "Wings",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.00",
        "priceValue": 1,
        "img": "https://rest.thrubits.com/uploads/restorants/cc0e36aa-5678-41c7-af4b-f912cb58e5ff_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "fountain"
      },
      {
        "id": "mk-item-36",
        "categoryId": "cheddar-fountain",
        "categoryName": "Cheddar Fountain",
        "title": "Crispy",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.90",
        "priceValue": 1.9,
        "img": "https://rest.thrubits.com/uploads/restorants/583efa96-6b16-491d-9e76-46a9aa235f03_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "fountain"
      },
      {
        "id": "mk-item-37",
        "categoryId": "cheddar-fountain",
        "categoryName": "Cheddar Fountain",
        "title": "Mozzarella Sticks",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.90",
        "priceValue": 1.9,
        "img": "https://rest.thrubits.com/uploads/restorants/5ba491ef-1f3c-4d70-b23f-5f031c3db650_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "fountain"
      },
      {
        "id": "mk-item-38",
        "categoryId": "cheddar-fountain",
        "categoryName": "Cheddar Fountain",
        "title": "Escalope",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$3.60",
        "priceValue": 3.6,
        "img": "https://rest.thrubits.com/uploads/restorants/b278a7db-b35f-4f37-a776-58c5ea936e38_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "fountain"
      },
      {
        "id": "mk-item-39",
        "categoryId": "cheddar-fountain",
        "categoryName": "Cheddar Fountain",
        "title": "Frankfurter",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.90",
        "priceValue": 1.9,
        "img": "https://rest.thrubits.com/uploads/restorants/aa505e85-8383-4aa6-b292-9d29148a818a_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "fountain"
      },
      {
        "id": "mk-item-40",
        "categoryId": "cheddar-fountain",
        "categoryName": "Cheddar Fountain",
        "title": "Onion Rings (5 pc)",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.90",
        "priceValue": 1.9,
        "img": "https://rest.thrubits.com/uploads/restorants/a53434a0-9269-41a5-9bce-44348d2931be_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "fountain"
      },
      {
        "id": "mk-item-41",
        "categoryId": "cheddar-fountain",
        "categoryName": "Cheddar Fountain",
        "title": "Mozzarella Jalapeno",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.50",
        "priceValue": 1.5,
        "img": "https://rest.thrubits.com/uploads/restorants/b9f07304-5bff-4718-a195-43c7e7ddd731_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Spicy",
            "type": "spicy",
            "icon": "fa-pepper-hot"
          }
        ],
        "modType": "fountain"
      },
      {
        "id": "mk-item-42",
        "categoryId": "cheddar-fountain",
        "categoryName": "Cheddar Fountain",
        "title": "Buffalo Wings",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.00",
        "priceValue": 1,
        "img": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "fountain"
      },
      {
        "id": "mk-item-43",
        "categoryId": "cheddar-fountain",
        "categoryName": "Cheddar Fountain",
        "title": "BBQ Wings",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.00",
        "priceValue": 1,
        "img": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "fountain"
      }
    ]
  },
  {
    "id": "burgers",
    "rawCategory": "THE KINGDOM OF BURGERS",
    "name": "Kingdom of Burgers",
    "subtitle": "Charcoal-grilled beef & crispy chicken burgers served with fries & coleslaw",
    "badge": "Charcoal-grilled beef & crispy chicken burgers served with fries & coleslaw",
    "icon": "fa-burger",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/4dc4415a-48df-4d76-9883-3b312497e768_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    "modType": "burger",
    "count": 12,
    "items": [
      {
        "id": "mk-item-44",
        "categoryId": "burgers",
        "categoryName": "Kingdom of Burgers",
        "title": "The Mom Style",
        "desc": "130g of homemade beef burger mix, charcoal grilled served in sesame bun with ketchup coleslaw salad ,tomato onion cucumber pickles . a side fries and coleslaw salad.",
        "price": "$9.50",
        "priceValue": 9.5,
        "img": "https://rest.thrubits.com/uploads/restorants/8fd1b37f-8d50-476d-8e9c-8106371f4f38_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-45",
        "categoryId": "burgers",
        "categoryName": "Kingdom of Burgers",
        "title": "The Doctor Burger",
        "desc": "130g of homemade beef burger mix, charcoal grilled, served in soft burger bun, lettuce, tomato, onion, bbq sauce mix and a hot melted cheddar syringe of hot melted cheddar cheese. a side fries and coleslaw salad.",
        "price": "$10.50",
        "priceValue": 10.5,
        "img": "https://rest.thrubits.com/uploads/restorants/4dc4415a-48df-4d76-9883-3b312497e768_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-46",
        "categoryId": "burgers",
        "categoryName": "Kingdom of Burgers",
        "title": "Cheese Please Burger",
        "desc": "130g of homemade beef burger mix, charcoal grilled, served in soft burger bun, lettuce, tomato, onion and 2 pieces of mozzarella fried , honey mustard sauce. a side fries and coleslaw salad.",
        "price": "$10.50",
        "priceValue": 10.5,
        "img": "https://rest.thrubits.com/uploads/restorants/e0b148d5-9fd6-4be4-a945-0c57d8ef8166_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-47",
        "categoryId": "burgers",
        "categoryName": "Kingdom of Burgers",
        "title": "Majestic Runchy",
        "desc": "130g of homemade beef burger mix, charcoal grilled, serving in soft burger bun, lettuce, tomato, onion and mix of creamy cooked fresh mushroom with rosemary and mozzarella cheese, a side fries and coleslaw salad.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://rest.thrubits.com/uploads/restorants/7c217180-84b0-46b7-a404-5c8027aa3300_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-48",
        "categoryId": "burgers",
        "categoryName": "Kingdom of Burgers",
        "title": "Full Of Flavor",
        "desc": "130g of beef burger mix charcoal grilled served in soft burger bun, onion, lettuce, tomato, beef bacon, egg, bbq sauce, a side fries and coleslaw salad.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://rest.thrubits.com/uploads/restorants/10462bf4-66f7-44fa-8452-33de9d3144d7_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-49",
        "categoryId": "burgers",
        "categoryName": "Kingdom of Burgers",
        "title": "Crispy Chicken Burger",
        "desc": "200g of brining chicken breast, fried served in traditional sesame bun coleslaw ketchup, cucumber pickles, a side fried and coleslaw salad.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://rest.thrubits.com/uploads/restorants/82f38e4b-82c5-405b-9923-979223726025_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-50",
        "categoryId": "burgers",
        "categoryName": "Kingdom of Burgers",
        "title": "Charcoal Chicken",
        "desc": "200g of marinated chicken breast grilled in charcoal grilled, served in soft burger bun, lettuce, tomato, onion, homemade bbq sauce. a side fries and coleslaw salad.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "burger"
      },
      {
        "id": "mk-item-51",
        "categoryId": "burgers",
        "categoryName": "Kingdom of Burgers",
        "title": "Chilly Fried Burger",
        "desc": "Fried burger, rocca, mozzarella patty, tomato salsa and homemade chilly sauce.",
        "price": "$13.00",
        "priceValue": 13,
        "img": "https://rest.thrubits.com/uploads/restorants/c403b6fc-d4d9-47a2-9e57-268fc9e7f361_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Spicy",
            "type": "spicy",
            "icon": "fa-pepper-hot"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-52",
        "categoryId": "burgers",
        "categoryName": "Kingdom of Burgers",
        "title": "Cheddar Lover",
        "desc": "2 pcs beef burger, lettuce, tomato, onion, pickles, mozz patty burger, cheddar and bbq sauce mix.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://rest.thrubits.com/uploads/restorants/aebe388c-6c23-4267-a7de-342f224f75c2_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-53",
        "categoryId": "burgers",
        "categoryName": "Kingdom of Burgers",
        "title": "Escalope Burger",
        "desc": "Fried chicken served with creamy coleslaw garlic paste ketchup served with fries and creamy coleslaw.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "burger"
      },
      {
        "id": "mk-item-54",
        "categoryId": "burgers",
        "categoryName": "Kingdom of Burgers",
        "title": "Zinger Burger",
        "desc": "Crispy chicken spicy served with coleslow garlic paste cheese sauce served with fries and creamy coleslaw.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Spicy",
            "type": "spicy",
            "icon": "fa-pepper-hot"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-55",
        "categoryId": "burgers",
        "categoryName": "Kingdom of Burgers",
        "title": "Aya's Burger",
        "desc": "Double beef patty cheddar cheese caramelize onion and tomato served with french fries and coleslaw salad served in fresh dough.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://rest.thrubits.com/uploads/restorants/53f9470b-1638-42a1-93a5-280fb9c54e27_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "burger"
      }
    ]
  },
  {
    "id": "sandwiches",
    "rawCategory": "THE CLUB - SANDWICHES",
    "name": "The Club Sandwiches",
    "subtitle": "Artisan subs & baguettes served with fries and coleslaw",
    "badge": "Artisan subs & baguettes served with fries and coleslaw",
    "icon": "fa-bread-slice",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/6bf36300-8520-4908-9a0b-8f49e35b7fee_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
    "modType": "burger",
    "count": 9,
    "items": [
      {
        "id": "mk-item-56",
        "categoryId": "sandwiches",
        "categoryName": "The Club Sandwiches",
        "title": "La Reina Mexicano - Fajita",
        "desc": "Traditional marination of mexican fajita served in submarine bread topped with mozzarella cheese with fries and coleslaw salad.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://rest.thrubits.com/uploads/restorants/bb02e074-d60c-49f0-856d-306c7295cc56_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-57",
        "categoryId": "sandwiches",
        "categoryName": "The Club Sandwiches",
        "title": "Zinger Winner",
        "desc": "3 pcs of crispy chicken, bacon beef, homemade honey mustard sauce, iceburg, corn and melted cheddar cheese. a side fries and coleslaw salad.",
        "price": "$13.00",
        "priceValue": 13,
        "img": "https://rest.thrubits.com/uploads/restorants/6bf36300-8520-4908-9a0b-8f49e35b7fee_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Spicy",
            "type": "spicy",
            "icon": "fa-pepper-hot"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-58",
        "categoryId": "sandwiches",
        "categoryName": "The Club Sandwiches",
        "title": "Steak Sandwich",
        "desc": "Seared tender beef steak strips with caramelized onions, sautéed mushrooms, and melted cheese in a toasted sub roll. Served with french fries and coleslaw.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://rest.thrubits.com/uploads/restorants/77379326-1492-4ca4-a5b6-7a185983874b_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-59",
        "categoryId": "sandwiches",
        "categoryName": "The Club Sandwiches",
        "title": "Phyladelphia",
        "desc": "200g brisket beef, green pepper, onion, mushroom, fresh cream, ketchup and mozzarella. a side fries and creamy coleslaw salad.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://rest.thrubits.com/uploads/restorants/627c2e28-9f48-4a0c-b9d7-7d2b64f297e0_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-60",
        "categoryId": "sandwiches",
        "categoryName": "The Club Sandwiches",
        "title": "Pesto Chicken Mushroom",
        "desc": "200g grilled chicken breast, pesto sauce, lettuce, tomato, white sauce mushroom and mozzarella cheese serving fries and coleslaw salad.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://rest.thrubits.com/uploads/restorants/4c6a65fb-537e-48a3-bef7-eb1ed3f28384_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-61",
        "categoryId": "sandwiches",
        "categoryName": "The Club Sandwiches",
        "title": "Seafood Sandwish",
        "desc": "Breast bun, crab sticks, calamari rings, lettuce, pickles, mayo, bbq mix and soya. served with fries and coleslaw.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "burger"
      },
      {
        "id": "mk-item-62",
        "categoryId": "sandwiches",
        "categoryName": "The Club Sandwiches",
        "title": "Volcano Beef",
        "desc": "Beef mixed with peppers onion mozzarella cheese creamy sauce served in pain de conpagne bread with fries.",
        "price": "$16.00",
        "priceValue": 16,
        "img": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "burger"
      },
      {
        "id": "mk-item-63",
        "categoryId": "sandwiches",
        "categoryName": "The Club Sandwiches",
        "title": "Volcano Chicken",
        "desc": "Chicken mix with peppers onion mozzarella cheese creamy sauce served with wedges.",
        "price": "$14.00",
        "priceValue": 14,
        "img": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "burger"
      },
      {
        "id": "mk-item-64",
        "categoryId": "sandwiches",
        "categoryName": "The Club Sandwiches",
        "title": "Scalopini",
        "desc": "Served in breast bread fries chicken tomato basil sauce creamy cheesy pesto sauce served with fries and creamy coleslaw.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "burger"
      }
    ]
  },
  {
    "id": "pizzeria",
    "rawCategory": "PIZZERIA",
    "name": "Pizzeria",
    "subtitle": "Fresh oven-baked medium pizzas with homemade sauce & mozzarella",
    "badge": "Fresh oven-baked medium pizzas with homemade sauce & mozzarella",
    "icon": "fa-pizza-slice",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/818cef5c-7d17-487e-a3ee-05ab6bbe48bd_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    "modType": "pizza",
    "count": 8,
    "items": [
      {
        "id": "mk-item-65",
        "categoryId": "pizzeria",
        "categoryName": "Pizzeria",
        "title": "Classic Pizza (Margueritta) Medium",
        "desc": "Pizza dough, homemade pizza sauce, mozzarella cheese grated, topped with fresh basil.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "pizza"
      },
      {
        "id": "mk-item-66",
        "categoryId": "pizzeria",
        "categoryName": "Pizzeria",
        "title": "From The Garden (Vegetarian) Medium",
        "desc": "Pizza dough, homemade pizza sauce, fresh mushroom, corn, green peppers, black olives, cherry tomato, mozzarella cheese topped with fresh basil.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://rest.thrubits.com/uploads/restorants/fcf186cd-5c5f-42cf-b0f9-46982b4a485d_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Vegetarian",
            "type": "veg",
            "icon": "fa-leaf"
          }
        ],
        "modType": "pizza"
      },
      {
        "id": "mk-item-67",
        "categoryId": "pizzeria",
        "categoryName": "Pizzeria",
        "title": "Pepperoni Style Medium",
        "desc": "Pizza dough, homemade sauce pizza,fresh mushroom, corn, mozzarella grated, hallal beef pepperoni, topped with fresh basil.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "pizza"
      },
      {
        "id": "mk-item-68",
        "categoryId": "pizzeria",
        "categoryName": "Pizzeria",
        "title": "BBQ Chicken Pizza Medium",
        "desc": "Pizza dough, homemade pizza sauce, fresh mushroom, corn, mozzarella cheese, charcoal chicken breast, topped with bbq sauce nad basil leaves.",
        "price": "$16.00",
        "priceValue": 16,
        "img": "https://rest.thrubits.com/uploads/restorants/8e350746-ff79-42f3-a968-cfd043887a65_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "pizza"
      },
      {
        "id": "mk-item-69",
        "categoryId": "pizzeria",
        "categoryName": "Pizzeria",
        "title": "Mexican Fajita Medium",
        "desc": "Pizza dough, mix of chicken fajita cooked, topped with fresh mushroom, corn, cherry tomato, mozzarella cheese and a side dip of guacamole sauce.",
        "price": "$20.00",
        "priceValue": 20,
        "img": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "pizza"
      },
      {
        "id": "mk-item-70",
        "categoryId": "pizzeria",
        "categoryName": "Pizzeria",
        "title": "Cheesy Lover ( 4 Cheese) Medium",
        "desc": "Pizza dough, homemade sauce pizza, mozzarella cheese, blue cheese, edam cheese and cheddar cheese.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://rest.thrubits.com/uploads/restorants/f9a63dbf-51fc-4fe4-b0da-629ce006a5b0_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "pizza"
      },
      {
        "id": "mk-item-71",
        "categoryId": "pizzeria",
        "categoryName": "Pizzeria",
        "title": "Pizza Burger",
        "desc": "2 pc beef burger, pizza sauce, fresh mushroom, corn, cherry tomato, honey mustard sauce, mozzarella cheese. fries and syringe cheddar.",
        "price": "$22.00",
        "priceValue": 22,
        "img": "https://rest.thrubits.com/uploads/restorants/818cef5c-7d17-487e-a3ee-05ab6bbe48bd_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "pizza"
      },
      {
        "id": "mk-item-72",
        "categoryId": "pizzeria",
        "categoryName": "Pizzeria",
        "title": "Sea Food Pizza",
        "desc": "Sauce, mushroom, corn, shrimp , calamarie ring, crab sticks, mozzarella cheese, onion,.",
        "price": "$22.00",
        "priceValue": 22,
        "img": "https://rest.thrubits.com/uploads/restorants/a0d99628-b593-4d46-82fe-f20172637f52_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "pizza"
      }
    ]
  },
  {
    "id": "main-course",
    "rawCategory": "THE REAL MAINCOURSE",
    "name": "Main Courses & Grills",
    "subtitle": "Charcoal mixed grills, 350g beef fillet, farrouj msahab & platters",
    "badge": "Charcoal mixed grills, 350g beef fillet, farrouj msahab & platters",
    "icon": "fa-fire-burner",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/cecfd5bb-ae60-499d-b744-ee80a3f19031_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
    "modType": "grill",
    "count": 18,
    "items": [
      {
        "id": "mk-item-73",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Crispy Chicken Breast Platter",
        "desc": "250g of brining chicken breast fried, served with fries, coleslaw salad, garlic paste and cucumber pickles.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://rest.thrubits.com/uploads/restorants/9841c955-ee41-4e85-bf89-5de63a62f39d_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "grill"
      },
      {
        "id": "mk-item-74",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Traditonal Escalope Platter",
        "desc": "250g of tender chicken breast prepared with eggs and crispy bread crumbs served with fries coleslaw salad, garlic dip, cucumber pickles.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://rest.thrubits.com/uploads/restorants/724f01cd-f7da-4b4e-9be1-583dc915218d_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "grill"
      },
      {
        "id": "mk-item-75",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "The Real Fillet",
        "desc": "350g of beef hallal fillet marinated in virgin olive oil, salt and black peppers, charcoal grilled, served with fries, fresh mushroom creamy sauce, grilled onion, grilled tomatoes.",
        "price": "$25.00",
        "priceValue": 25,
        "img": "https://rest.thrubits.com/uploads/restorants/cecfd5bb-ae60-499d-b744-ee80a3f19031_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "grill"
      },
      {
        "id": "mk-item-76",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Grilled Chicken Breast",
        "desc": "400g of grilled chicken breast, backed potatoes, sauteed vegetables, topped with mushroom white sauce.",
        "price": "$17.00",
        "priceValue": 17,
        "img": "https://rest.thrubits.com/uploads/restorants/1de14d1d-7054-4832-9e4b-35f00e290e52_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "grill"
      },
      {
        "id": "mk-item-77",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Farrouj Msahab",
        "desc": "Farrouj msahhab 1500g marinated in special sauce charcoal grilled served with fries, pickles, grilled tomatoes, drilled onion, garlic paste, and special bread.",
        "price": "$25.00",
        "priceValue": 25,
        "img": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "grill"
      },
      {
        "id": "mk-item-78",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Nos Farrouj",
        "desc": "800g of msahab chicken marinated in special sauce, charcoal grilled,served with fries, grilled tomatoes, grilled onion, garlic paste, and special bread.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "grill"
      },
      {
        "id": "mk-item-79",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Mix Grill Platter For One",
        "desc": "Mix platter ( 1 tawook, 1 meat, 1 kafta served with fries grilled vegteblaes and condiments).",
        "price": "$18.00",
        "priceValue": 18,
        "img": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "grill"
      },
      {
        "id": "mk-item-80",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Tawook Platter",
        "desc": "2 skeweres of tawwok chicken 200g served with fries grilled vegetables and garlic paste.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "grill"
      },
      {
        "id": "mk-item-81",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Meat Platter",
        "desc": "Charcoal grilled meat halal served with fries grilled vegetables and condiments.",
        "price": "$20.00",
        "priceValue": 20,
        "img": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "grill"
      },
      {
        "id": "mk-item-82",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Mix Grill  1 KG",
        "desc": "4 skewers tawouk (400g) 4 skewers of halal meat (400g) 4 skewers of kafta (200g) served with fries grilled vegetables and condiments.",
        "price": "$65.00",
        "priceValue": 65,
        "img": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Sharing",
            "type": "sharing",
            "icon": "fa-users"
          }
        ],
        "modType": "grill"
      },
      {
        "id": "mk-item-83",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Mix Grill Half Kilo",
        "desc": "2 skewers tawouk (200g) 2 skewers of halal meat (200g) 2 skewers of kafta (200g) served with fries grilled vegetables and condiments.",
        "price": "$35.00",
        "priceValue": 35,
        "img": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "grill"
      },
      {
        "id": "mk-item-84",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Kafta Platter",
        "desc": "3 skewers of kafta 300g served with fries grilled vegetables and garlic paste.",
        "price": "$17.00",
        "priceValue": 17,
        "img": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "grill"
      },
      {
        "id": "mk-item-85",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Meat Platter 1kg",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$75.00",
        "priceValue": 75,
        "img": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Sharing",
            "type": "sharing",
            "icon": "fa-users"
          }
        ],
        "modType": "grill"
      },
      {
        "id": "mk-item-86",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Tawook 1kg",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$50.00",
        "priceValue": 50,
        "img": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Sharing",
            "type": "sharing",
            "icon": "fa-users"
          }
        ],
        "modType": "grill"
      },
      {
        "id": "mk-item-87",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Kafta 1kg",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$60.00",
        "priceValue": 60,
        "img": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Sharing",
            "type": "sharing",
            "icon": "fa-users"
          }
        ],
        "modType": "grill"
      },
      {
        "id": "mk-item-88",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Chicken Kabab",
        "desc": "2 skeweres of chicken kabab served with special homemade sauce and fries.",
        "price": "$14.00",
        "priceValue": 14,
        "img": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "grill"
      },
      {
        "id": "mk-item-89",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Jambo Mix",
        "desc": "400g real fillet, 400 chicken breast, 200g shrimp served with vegetables, backed potatoes, mushroom sauce , garden of green salad and fries.",
        "price": "$60.00",
        "priceValue": 60,
        "img": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Sharing",
            "type": "sharing",
            "icon": "fa-users"
          }
        ],
        "modType": "grill"
      },
      {
        "id": "mk-item-90",
        "categoryId": "main-course",
        "categoryName": "Main Courses & Grills",
        "title": "Shrimp Platter",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$17.00",
        "priceValue": 17,
        "img": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "grill"
      }
    ]
  },
  {
    "id": "wraps",
    "rawCategory": "WRAPS",
    "name": "Tortilla Wraps",
    "subtitle": "Griddled wraps stuffed with marinated chicken & sauces",
    "badge": "Griddled wraps stuffed with marinated chicken & sauces",
    "icon": "fa-scroll",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/ef37a7a7-c1aa-4448-98bc-50131d4c11c3_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
    "modType": "burger",
    "count": 2,
    "items": [
      {
        "id": "mk-item-91",
        "categoryId": "wraps",
        "categoryName": "Tortilla Wraps",
        "title": "Chicken Fajita Wrap",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$13.00",
        "priceValue": 13,
        "img": "https://rest.thrubits.com/uploads/restorants/ef37a7a7-c1aa-4448-98bc-50131d4c11c3_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "burger"
      },
      {
        "id": "mk-item-92",
        "categoryId": "wraps",
        "categoryName": "Tortilla Wraps",
        "title": "Boneless Chicken Wrap",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$13.00",
        "priceValue": 13,
        "img": "https://rest.thrubits.com/uploads/restorants/b040359b-9b60-490e-9dad-50662fbab145_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "burger"
      }
    ]
  },
  {
    "id": "pasta",
    "rawCategory": "PASTA",
    "name": "Artisan Pasta",
    "subtitle": "Tagliatelle & penne in creamy Alfredo, truffle cheese, or spicy marinara",
    "badge": "Tagliatelle & penne in creamy Alfredo, truffle cheese, or spicy marinara",
    "icon": "fa-bowl-food",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/6fc84d0a-9543-4222-9927-3c9fe7612d20_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
    "modType": "pasta",
    "count": 6,
    "items": [
      {
        "id": "mk-item-93",
        "categoryId": "pasta",
        "categoryName": "Artisan Pasta",
        "title": "Tagliatelle Alfredo",
        "desc": "Tagliatelle pasta tossed in rich creamy Parmesan Alfredo sauce with tender grilled chicken and fresh mushrooms.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "pasta"
      },
      {
        "id": "mk-item-94",
        "categoryId": "pasta",
        "categoryName": "Artisan Pasta",
        "title": "Four Cheese Penne",
        "desc": "Penne pasta baked in our signature four-cheese blend of mozzarella, cheddar, blue cheese, and edam.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "pasta"
      },
      {
        "id": "mk-item-95",
        "categoryId": "pasta",
        "categoryName": "Artisan Pasta",
        "title": "Penne Arabiata (Spicy)",
        "desc": "Penne pasta tossed in spicy tomato garlic Arrabbiata sauce topped with fresh basil and parmesan.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://rest.thrubits.com/uploads/restorants/5a206ad3-e62d-4907-8b8a-b679bb6e2b7c_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Spicy",
            "type": "spicy",
            "icon": "fa-pepper-hot"
          }
        ],
        "modType": "pasta"
      },
      {
        "id": "mk-item-96",
        "categoryId": "pasta",
        "categoryName": "Artisan Pasta",
        "title": "Truffle Mag And Cheese",
        "desc": "Creamy macaroni and cheese infused with aromatic black truffle and topped with a golden cheese crust.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "pasta"
      },
      {
        "id": "mk-item-97",
        "categoryId": "pasta",
        "categoryName": "Artisan Pasta",
        "title": "Shrim Penne (Spicy)",
        "desc": "Penne, spicy sauce, shrimps.",
        "price": "$17.00",
        "priceValue": 17,
        "img": "https://rest.thrubits.com/uploads/restorants/3b4e62da-c4c2-4830-94f8-d7e183dee8cd_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Spicy",
            "type": "spicy",
            "icon": "fa-pepper-hot"
          }
        ],
        "modType": "pasta"
      },
      {
        "id": "mk-item-98",
        "categoryId": "pasta",
        "categoryName": "Artisan Pasta",
        "title": "Tagliatelle Shrimp",
        "desc": "Tagliatelle pasta with sautéed jumbo shrimps in a velvety creamy pink sauce.",
        "price": "$17.00",
        "priceValue": 17,
        "img": "https://rest.thrubits.com/uploads/restorants/6fc84d0a-9543-4222-9927-3c9fe7612d20_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "pasta"
      }
    ]
  },
  {
    "id": "salads",
    "rawCategory": "SALADS CORNER",
    "name": "Salads Corner",
    "subtitle": "Crisp garden salads, Lebanese tabbouleh, fattoush & seafood salads",
    "badge": "Crisp garden salads, Lebanese tabbouleh, fattoush & seafood salads",
    "icon": "fa-leaf",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/9e8bcedd-7465-41bd-8437-140cd0c03aa3_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    "modType": "salad",
    "count": 9,
    "items": [
      {
        "id": "mk-item-99",
        "categoryId": "salads",
        "categoryName": "Salads Corner",
        "title": "Garden Of Green",
        "desc": "Iceburg lettuce, fresh tomato, fresh cucumber, corn,fresh mushroom, black olives,green peppers, served with fresh lemon oil sauce.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "salad"
      },
      {
        "id": "mk-item-100",
        "categoryId": "salads",
        "categoryName": "Salads Corner",
        "title": "Chick Wick",
        "desc": "Lettuce, fresh tomato, fresh cucumber, corn, fresh mushroom, onion , green peppers and 200g of grilled marinated chicken breast served with homemade honey mustard sauce.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://rest.thrubits.com/uploads/restorants/1a2d8e8d-63bf-4fc0-a147-b0c3356d7b55_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "salad"
      },
      {
        "id": "mk-item-101",
        "categoryId": "salads",
        "categoryName": "Salads Corner",
        "title": "Tossed Together",
        "desc": "Crab sticks, lettuce, corn, fresh mushroom, strawberry, avocado, apple and sesame.",
        "price": "$14.00",
        "priceValue": 14,
        "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "salad"
      },
      {
        "id": "mk-item-102",
        "categoryId": "salads",
        "categoryName": "Salads Corner",
        "title": "Lebanese Twist (Tabbouleh) - For Two",
        "desc": "Fresh parsley, tomato jabaliye, mint leaves, green onion tossed with fresh lemon juice, virgin olive oil served with lebanese lettuce heart.",
        "price": "$7.00",
        "priceValue": 7,
        "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Vegetarian",
            "type": "veg",
            "icon": "fa-leaf"
          },
          {
            "label": "Sharing",
            "type": "sharing",
            "icon": "fa-users"
          }
        ],
        "modType": "salad"
      },
      {
        "id": "mk-item-103",
        "categoryId": "salads",
        "categoryName": "Salads Corner",
        "title": "Lebanese Mix (Fattouch) For Two",
        "desc": "Tomato, cucumber, rocca, zaatar, bakle, fejel,green peppers, onion, topped with arabic bread baked in oven.",
        "price": "$7.00",
        "priceValue": 7,
        "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Vegetarian",
            "type": "veg",
            "icon": "fa-leaf"
          },
          {
            "label": "Sharing",
            "type": "sharing",
            "icon": "fa-users"
          }
        ],
        "modType": "salad"
      },
      {
        "id": "mk-item-104",
        "categoryId": "salads",
        "categoryName": "Salads Corner",
        "title": "Chicken Ceaser",
        "desc": "Lettuce, ceaser sauce, crackers and charcoal chicken.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "salad"
      },
      {
        "id": "mk-item-105",
        "categoryId": "salads",
        "categoryName": "Salads Corner",
        "title": "Sea Food Salad",
        "desc": "Lettuce, carb sticks , carrot, avocado, shrimps, salmon fume, fresh mushroom, and cocktail sauce corn strawbery.",
        "price": "$18.00",
        "priceValue": 18,
        "img": "https://rest.thrubits.com/uploads/restorants/9e8bcedd-7465-41bd-8437-140cd0c03aa3_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "salad"
      },
      {
        "id": "mk-item-106",
        "categoryId": "salads",
        "categoryName": "Salads Corner",
        "title": "Rocca Halloum Salad",
        "desc": "Fresh wild mountain rocca leaves topped with grilled halloumi slices, cherry tomatoes, walnuts, and lemon-olive oil dressing.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "salad"
      },
      {
        "id": "mk-item-107",
        "categoryId": "salads",
        "categoryName": "Salads Corner",
        "title": "Quinoa Shrimp Salad",
        "desc": "Grilled jumbo shrimps served over organic quinoa, crisp greens, avocado, and citrus vinaigrette.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "salad"
      }
    ]
  },
  {
    "id": "lebanese-corner",
    "rawCategory": "LEBANESE CORNER",
    "name": "Lebanese Mezza",
    "subtitle": "Authentic cold & hot Lebanese mezza, nayye & hot specialties",
    "badge": "Authentic cold & hot Lebanese mezza, nayye & hot specialties",
    "icon": "fa-mortar-pestle",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/a12670d7-8df6-4a63-bf35-43b6012d2660_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
    "modType": "mezza",
    "count": 14,
    "items": [
      {
        "id": "mk-item-108",
        "categoryId": "lebanese-corner",
        "categoryName": "Lebanese Mezza",
        "title": "Traditional Hommos",
        "desc": "Homemade hommous mix, served with cheek peas, mint leaves and virgin olive oil.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Vegetarian",
            "type": "veg",
            "icon": "fa-leaf"
          }
        ],
        "modType": "mezza"
      },
      {
        "id": "mk-item-109",
        "categoryId": "lebanese-corner",
        "categoryName": "Lebanese Mezza",
        "title": "Traditional Moutabal",
        "desc": "Homemade moutabal mix served with semmak peppers, parsley leaves and virgin olive oil.",
        "price": "$5.50",
        "priceValue": 5.5,
        "img": "https://rest.thrubits.com/uploads/restorants/a12670d7-8df6-4a63-bf35-43b6012d2660_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Vegetarian",
            "type": "veg",
            "icon": "fa-leaf"
          }
        ],
        "modType": "mezza"
      },
      {
        "id": "mk-item-110",
        "categoryId": "lebanese-corner",
        "categoryName": "Lebanese Mezza",
        "title": "Wara2 Enab",
        "desc": "Traditional hand-rolled vine leaves stuffed with seasoned rice, parsley, and tomatoes in lemon & olive oil.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://rest.thrubits.com/uploads/restorants/2f79c59c-ce43-4312-8d1f-c3c26227336d_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Vegetarian",
            "type": "veg",
            "icon": "fa-leaf"
          }
        ],
        "modType": "mezza"
      },
      {
        "id": "mk-item-111",
        "categoryId": "lebanese-corner",
        "categoryName": "Lebanese Mezza",
        "title": "Hommos Bil Lahme",
        "desc": "Creamy traditional hommos topped with pan-seared halal beef cubes and toasted pine nuts.",
        "price": "$14.00",
        "priceValue": 14,
        "img": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "mezza"
      },
      {
        "id": "mk-item-112",
        "categoryId": "lebanese-corner",
        "categoryName": "Lebanese Mezza",
        "title": "Nayye Platter",
        "desc": "Authentic Lebanese raw meat delicacy prepared fresh to order, served with garlic paste, olive oil, mint, and warm bread.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "mezza"
      },
      {
        "id": "mk-item-113",
        "categoryId": "lebanese-corner",
        "categoryName": "Lebanese Mezza",
        "title": "Nayye 0,5kg",
        "desc": "Authentic Lebanese raw meat delicacy prepared fresh to order, served with garlic paste, olive oil, mint, and warm bread.",
        "price": "$30.00",
        "priceValue": 30,
        "img": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "mezza"
      },
      {
        "id": "mk-item-114",
        "categoryId": "lebanese-corner",
        "categoryName": "Lebanese Mezza",
        "title": "Batata Harra For Two",
        "desc": "Fresh potato fried cooked with coriander, garlic and special homemade salsa harra.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://rest.thrubits.com/uploads/restorants/0fd85aa4-18af-41ea-8db7-080a5df5244e_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Spicy",
            "type": "spicy",
            "icon": "fa-pepper-hot"
          },
          {
            "label": "Sharing",
            "type": "sharing",
            "icon": "fa-users"
          }
        ],
        "modType": "mezza"
      },
      {
        "id": "mk-item-115",
        "categoryId": "lebanese-corner",
        "categoryName": "Lebanese Mezza",
        "title": "Wings Provencial",
        "desc": "6pcs of chicken wings marinated in garlic and coriander charcoal grilled, cooked in special homemade provincial sauce, served with lemon bites.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://rest.thrubits.com/uploads/restorants/c8bddb1e-dde1-4de7-908c-3b4b926dc5c6_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "mezza"
      },
      {
        "id": "mk-item-116",
        "categoryId": "lebanese-corner",
        "categoryName": "Lebanese Mezza",
        "title": "Lemony Makanic For Two",
        "desc": "250g of halal mekanic cooked in pan served with butter, fresh lemon juice, served with lemon bites.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://rest.thrubits.com/uploads/restorants/46642622-2f5c-48e4-9021-98e82dc71948_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          },
          {
            "label": "Sharing",
            "type": "sharing",
            "icon": "fa-users"
          }
        ],
        "modType": "mezza"
      },
      {
        "id": "mk-item-117",
        "categoryId": "lebanese-corner",
        "categoryName": "Lebanese Mezza",
        "title": "Chhotty Sejouk For Two",
        "desc": "250g of halal sejouk cooked with fresh onion green peppers, fresh tomato amd homemade special harra sauce topped with parsley leaves.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Spicy",
            "type": "spicy",
            "icon": "fa-pepper-hot"
          },
          {
            "label": "Sharing",
            "type": "sharing",
            "icon": "fa-users"
          }
        ],
        "modType": "mezza"
      },
      {
        "id": "mk-item-118",
        "categoryId": "lebanese-corner",
        "categoryName": "Lebanese Mezza",
        "title": "Cheese Rkakat Fried",
        "desc": "Cheese roll stuffed with halloum cheese fetta and mozzarella cheese.",
        "price": "$1.50",
        "priceValue": 1.5,
        "img": "https://rest.thrubits.com/uploads/restorants/70e4e8be-9d54-452b-ba40-714c1ee2ab8e_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "mezza"
      },
      {
        "id": "mk-item-119",
        "categoryId": "lebanese-corner",
        "categoryName": "Lebanese Mezza",
        "title": "Kebbe Lahme",
        "desc": "150g of kebbe stuffed with minced beef onion and puch of peppers.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://rest.thrubits.com/uploads/restorants/50bce976-f348-48dd-8036-c4a1a884a40d_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "mezza"
      },
      {
        "id": "mk-item-120",
        "categoryId": "lebanese-corner",
        "categoryName": "Lebanese Mezza",
        "title": "Sambousik Lahme",
        "desc": "Traditional fresh dough, stuffed with minced beef and puch of peppers, fried.",
        "price": "$1.50",
        "priceValue": 1.5,
        "img": "https://rest.thrubits.com/uploads/restorants/80b8d559-36cd-470e-ba4e-fa065b69d4f7_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "mezza"
      },
      {
        "id": "mk-item-121",
        "categoryId": "lebanese-corner",
        "categoryName": "Lebanese Mezza",
        "title": "Shrimp Proviencal",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "mezza"
      }
    ]
  },
  {
    "id": "kids-corner",
    "rawCategory": "KIDS CORNER",
    "name": "Kids Corner",
    "subtitle": "Kid-sized favorites served with golden fries",
    "badge": "Kid-sized favorites served with golden fries",
    "icon": "fa-child",
    "thumbImg": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80",
    "fallbackImg": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
    "modType": "starters",
    "count": 1,
    "items": [
      {
        "id": "mk-item-122",
        "categoryId": "kids-corner",
        "categoryName": "Kids Corner",
        "title": "Chicken Nuggets",
        "desc": "6pcs of chicken nuggets from hawa chicken fried served with 300g of fries and ketchup dip.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "starters"
      }
    ]
  },
  {
    "id": "dessert",
    "rawCategory": "DESSERT",
    "name": "Desserts & Knefe",
    "subtitle": "Homemade Knefe, Nutella Calzone, Fondant, Pain Perdu & Ice Cream",
    "badge": "Homemade Knefe, Nutella Calzone, Fondant, Pain Perdu & Ice Cream",
    "icon": "fa-cake-candles",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/f940752b-2b90-4efb-aad5-22b13acdf2f3_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
    "modType": "sweet",
    "count": 21,
    "items": [
      {
        "id": "mk-item-123",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Calzone Nutella",
        "desc": "Oven baked folded pizza filled with nutella chocolate,spread and nuts.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://rest.thrubits.com/uploads/restorants/331f7e3f-96eb-4af1-83e1-74f4f6f404cc_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "sweet"
      },
      {
        "id": "mk-item-124",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Brownies",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://rest.thrubits.com/uploads/restorants/4fc9d8eb-72b9-426f-b4ad-70c5fa19663b_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "sweet"
      },
      {
        "id": "mk-item-125",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Cheese Cake",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://rest.thrubits.com/uploads/restorants/9ef4a0bd-b849-4d05-9ec6-893ecc42ad7e_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "sweet"
      },
      {
        "id": "mk-item-126",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Biscuit Au Chocolat",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$7.00",
        "priceValue": 7,
        "img": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-127",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Fondant",
        "desc": "Warm Belgian dark chocolate lava cake with a rich molten chocolate center.",
        "price": "$9.00",
        "priceValue": 9,
        "img": "https://rest.thrubits.com/uploads/restorants/3bfa46ab-7ffe-4909-bb63-2a00e9aa58b2_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "sweet"
      },
      {
        "id": "mk-item-128",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Doctor Fruits",
        "desc": "Pancake mix, fresh fruits and dark chocolate.",
        "price": "$14.00",
        "priceValue": 14,
        "img": "https://rest.thrubits.com/uploads/restorants/ffbcf928-8874-4465-b51d-6f75f18609c1_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "sweet"
      },
      {
        "id": "mk-item-129",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Pain Perdu",
        "desc": "Caramelized brioche French toast topped with vanilla cream, berries, and warm caramel drizzle.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://rest.thrubits.com/uploads/restorants/00f419b2-b7b4-4671-85de-843cb70ac4fe_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "sweet"
      },
      {
        "id": "mk-item-130",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Homemade Knefe",
        "desc": "Warm homemade Lebanese cheese Knefe baked golden and drizzled with fragrant orange blossom syrup.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://rest.thrubits.com/uploads/restorants/f940752b-2b90-4efb-aad5-22b13acdf2f3_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "15–20 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "sweet"
      },
      {
        "id": "mk-item-131",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "3eych L Saraya",
        "desc": "Traditional Lebanese caramelized bread pudding topped with rich Ashta cream and crushed pistachios.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-132",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Tiramissu",
        "desc": "Espresso-soaked ladyfingers layered with creamy mascarpone and dusted with cocoa.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-133",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Oreo Cheese Cake",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-134",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Chocolate Moo",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$11.00",
        "priceValue": 11,
        "img": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-135",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Ice Cream Vanille Scoop",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$2.50",
        "priceValue": 2.5,
        "img": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-136",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Ice Cream Strawberry Scoop",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$2.50",
        "priceValue": 2.5,
        "img": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-137",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Ice Cream Wared Scoup",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$2.50",
        "priceValue": 2.5,
        "img": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-138",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Ice Cream Mango Scoop",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$2.50",
        "priceValue": 2.5,
        "img": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-139",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Ice Cream Blueberry Scoup",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$2.50",
        "priceValue": 2.5,
        "img": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-140",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Ice Cream Festo2 Scoop",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$2.50",
        "priceValue": 2.5,
        "img": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-141",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Ice Cream Chemem Scoup",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$2.50",
        "priceValue": 2.5,
        "img": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-142",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Ice Cream Meshmosh Scoup",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$2.50",
        "priceValue": 2.5,
        "img": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-143",
        "categoryId": "dessert",
        "categoryName": "Desserts & Knefe",
        "title": "Ice Cream Loz Scoup",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$2.50",
        "priceValue": 2.5,
        "img": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      }
    ]
  },
  {
    "id": "crepe",
    "rawCategory": "crepe",
    "name": "Crêperie",
    "subtitle": "Freshly folded sweet crêpes with Nutella, Lotus, Oreo & Kinder",
    "badge": "Freshly folded sweet crêpes with Nutella, Lotus, Oreo & Kinder",
    "icon": "fa-cookie-bite",
    "thumbImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=400&q=80",
    "fallbackImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
    "modType": "sweet",
    "count": 13,
    "items": [
      {
        "id": "mk-item-144",
        "categoryId": "crepe",
        "categoryName": "Crêperie",
        "title": "Crepe Nutella",
        "desc": "Freshly folded golden crêpe generously filled with premium chocolate spread and toppings.",
        "price": "$7.00",
        "priceValue": 7,
        "img": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-145",
        "categoryId": "crepe",
        "categoryName": "Crêperie",
        "title": "Crepe Lotus Crunch",
        "desc": "Freshly folded golden crêpe generously filled with premium chocolate spread and toppings.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-146",
        "categoryId": "crepe",
        "categoryName": "Crêperie",
        "title": "Crepe Oreo Madness",
        "desc": "Freshly folded golden crêpe generously filled with premium chocolate spread and toppings.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-147",
        "categoryId": "crepe",
        "categoryName": "Crêperie",
        "title": "Crepe Beuno Fantasy",
        "desc": "Freshly folded golden crêpe generously filled with premium chocolate spread and toppings.",
        "price": "$9.00",
        "priceValue": 9,
        "img": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-148",
        "categoryId": "crepe",
        "categoryName": "Crêperie",
        "title": "Triple Chocolate Heaven",
        "desc": "Freshly folded golden crêpe generously filled with premium chocolate spread and toppings.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-149",
        "categoryId": "crepe",
        "categoryName": "Crêperie",
        "title": "Strawberry Chocolate Dream",
        "desc": "Freshly folded golden crêpe generously filled with premium chocolate spread and toppings.",
        "price": "$7.00",
        "priceValue": 7,
        "img": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-150",
        "categoryId": "crepe",
        "categoryName": "Crêperie",
        "title": "Minikitchen Special",
        "desc": "Freshly folded golden crêpe generously filled with premium chocolate spread and toppings.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-151",
        "categoryId": "crepe",
        "categoryName": "Crêperie",
        "title": "Add Banana",
        "desc": "Freshly folded golden crêpe generously filled with premium chocolate spread and toppings.",
        "price": "$1.00",
        "priceValue": 1,
        "img": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-152",
        "categoryId": "crepe",
        "categoryName": "Crêperie",
        "title": "Add Strawberry",
        "desc": "Freshly folded golden crêpe generously filled with premium chocolate spread and toppings.",
        "price": "$1.50",
        "priceValue": 1.5,
        "img": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-153",
        "categoryId": "crepe",
        "categoryName": "Crêperie",
        "title": "Add Kiwi",
        "desc": "Freshly folded golden crêpe generously filled with premium chocolate spread and toppings.",
        "price": "$1.50",
        "priceValue": 1.5,
        "img": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-154",
        "categoryId": "crepe",
        "categoryName": "Crêperie",
        "title": "Add Ice Cream",
        "desc": "Freshly folded golden crêpe generously filled with premium chocolate spread and toppings.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-155",
        "categoryId": "crepe",
        "categoryName": "Crêperie",
        "title": "Add Kinder",
        "desc": "Freshly folded golden crêpe generously filled with premium chocolate spread and toppings.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      },
      {
        "id": "mk-item-156",
        "categoryId": "crepe",
        "categoryName": "Crêperie",
        "title": "Add Brownies",
        "desc": "Freshly folded golden crêpe generously filled with premium chocolate spread and toppings.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "sweet"
      }
    ]
  },
  {
    "id": "hot-beverage",
    "rawCategory": "HOT BEVERAGE",
    "name": "Hot Beverages",
    "subtitle": "Lebanese Rakwe coffee, espresso, hot chocolate, sahlab & herbal teas",
    "badge": "Lebanese Rakwe coffee, espresso, hot chocolate, sahlab & herbal teas",
    "icon": "fa-mug-hot",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/dc3fe551-1b61-43b6-922f-a7c4c679ea02_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    "modType": "drink",
    "count": 16,
    "items": [
      {
        "id": "mk-item-157",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Rakwe Ahwe Kbire",
        "desc": "Freshly brewed steaming hot beverage prepared by our barista.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-158",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Rakwe Ahwe Zghire",
        "desc": "Freshly brewed steaming hot beverage prepared by our barista.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-159",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Turkish Coffee",
        "desc": "Freshly brewed steaming hot beverage prepared by our barista.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-160",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Cappuccino",
        "desc": "Freshly brewed steaming hot beverage prepared by our barista.",
        "price": "$4.00",
        "priceValue": 4,
        "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-161",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Hot Choclate",
        "desc": "Served with marshmallow and chocolate sauce.",
        "price": "$4.50",
        "priceValue": 4.5,
        "img": "https://rest.thrubits.com/uploads/restorants/dc3fe551-1b61-43b6-922f-a7c4c679ea02_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "5–8 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "drink"
      },
      {
        "id": "mk-item-162",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Nescafe",
        "desc": "Freshly brewed steaming hot beverage prepared by our barista.",
        "price": "$3.00",
        "priceValue": 3,
        "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-163",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Tea",
        "desc": "Freshly brewed steaming hot beverage prepared by our barista.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-164",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Mint",
        "desc": "Freshly brewed steaming hot beverage prepared by our barista.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-165",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Zhourat",
        "desc": "Freshly brewed steaming hot beverage prepared by our barista.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-166",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Green Tea",
        "desc": "Freshly brewed steaming hot beverage prepared by our barista.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-167",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Espresso",
        "desc": "Cofee.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-168",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Sahlba",
        "desc": "Freshly brewed steaming hot beverage prepared by our barista.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://rest.thrubits.com/uploads/restorants/52615c01-8759-498b-9b4b-c3e6855a0eb0_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "5–8 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "drink"
      },
      {
        "id": "mk-item-169",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Cinamon Milk",
        "desc": "Freshly brewed steaming hot beverage prepared by our barista.",
        "price": "$4.50",
        "priceValue": 4.5,
        "img": "https://rest.thrubits.com/uploads/restorants/692c6a11-e91f-434d-b3d6-7f55097c1e5b_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "5–8 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "drink"
      },
      {
        "id": "mk-item-170",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Tripply Chocolate",
        "desc": "Freshly brewed steaming hot beverage prepared by our barista.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-171",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Yansoun W Hamod",
        "desc": "Freshly brewed steaming hot beverage prepared by our barista.",
        "price": "$3.00",
        "priceValue": 3,
        "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-172",
        "categoryId": "hot-beverage",
        "categoryName": "Hot Beverages",
        "title": "Hamod Kamoun",
        "desc": "Freshly brewed steaming hot beverage prepared by our barista.",
        "price": "$3.00",
        "priceValue": 3,
        "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      }
    ]
  },
  {
    "id": "juices",
    "rawCategory": "JUICES",
    "name": "Fresh Juices & Iced Tea",
    "subtitle": "Freshly squeezed fruits, minted lemonade, mojitos & iced teas",
    "badge": "Freshly squeezed fruits, minted lemonade, mojitos & iced teas",
    "icon": "fa-glass-water",
    "thumbImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80",
    "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
    "modType": "drink",
    "count": 18,
    "items": [
      {
        "id": "mk-item-173",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Fresh Orange",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-174",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Fresh Carrots",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-175",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Fresh Apple",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-176",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Lemonade",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-177",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Minted Lemonade",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$7.00",
        "priceValue": 7,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-178",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Fresh Strawberry",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-179",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Fresh Ice Tea Peach",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-180",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Fresh Ice Tea Passion Fruits",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-181",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Fresh Mango Ice Tea",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-182",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Summer Fuel",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$7.00",
        "priceValue": 7,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-183",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Mixed Berries",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-184",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Passion For Life",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-185",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Mojito",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-186",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Very Berry",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-187",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Fresh Lemon Ice Tea",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-188",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Mango Juice",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-189",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Passion Fruits Juice",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-190",
        "categoryId": "juices",
        "categoryName": "Fresh Juices & Iced Tea",
        "title": "Fresh Mango",
        "desc": "100% freshly prepared chilled beverage made to order.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      }
    ]
  },
  {
    "id": "shakes",
    "rawCategory": "SHAKES",
    "name": "Milkshakes",
    "subtitle": "Thick creamy Oreo, Lotus, Chocolate, Strawberry & Vanilla shakes",
    "badge": "Thick creamy Oreo, Lotus, Chocolate, Strawberry & Vanilla shakes",
    "icon": "fa-blender",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/7495814f-6093-400f-9966-e84e6ee95089_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
    "modType": "drink",
    "count": 7,
    "items": [
      {
        "id": "mk-item-191",
        "categoryId": "shakes",
        "categoryName": "Milkshakes",
        "title": "Chocolate Milkshake",
        "desc": "Thick, creamy hand-spun milkshake topped with whipped cream.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-192",
        "categoryId": "shakes",
        "categoryName": "Milkshakes",
        "title": "Oreo Milkshake",
        "desc": "Thick, creamy hand-spun milkshake topped with whipped cream.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://rest.thrubits.com/uploads/restorants/b0462744-ffa1-4ec7-8186-6ab801677b2a_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "5–8 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "drink"
      },
      {
        "id": "mk-item-193",
        "categoryId": "shakes",
        "categoryName": "Milkshakes",
        "title": "Strawberry Milkshake",
        "desc": "Thick, creamy hand-spun milkshake topped with whipped cream.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-194",
        "categoryId": "shakes",
        "categoryName": "Milkshakes",
        "title": "Lotus Milkshake",
        "desc": "Thick, creamy hand-spun milkshake topped with whipped cream.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://rest.thrubits.com/uploads/restorants/7495814f-6093-400f-9966-e84e6ee95089_medium.jpg",
        "fallbackImg": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": true,
        "prepTime": "5–8 min",
        "badges": [
          {
            "label": "Popular",
            "type": "popular",
            "icon": "fa-fire"
          }
        ],
        "modType": "drink"
      },
      {
        "id": "mk-item-195",
        "categoryId": "shakes",
        "categoryName": "Milkshakes",
        "title": "Vanille Milkshake",
        "desc": "Thick, creamy hand-spun milkshake topped with whipped cream.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-196",
        "categoryId": "shakes",
        "categoryName": "Milkshakes",
        "title": "Cookies Milkshake",
        "desc": "Thick, creamy hand-spun milkshake topped with whipped cream.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-197",
        "categoryId": "shakes",
        "categoryName": "Milkshakes",
        "title": "Pina Colada Shake",
        "desc": "Thick, creamy hand-spun milkshake topped with whipped cream.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      }
    ]
  },
  {
    "id": "the-bar",
    "rawCategory": "THE BAR",
    "name": "Soft Drinks & Bar",
    "subtitle": "Chilled soft drinks, sparkling water, Laban Ayran & beers",
    "badge": "Chilled soft drinks, sparkling water, Laban Ayran & beers",
    "icon": "fa-bottle-water",
    "thumbImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80",
    "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
    "modType": "drink",
    "count": 14,
    "items": [
      {
        "id": "mk-item-198",
        "categoryId": "the-bar",
        "categoryName": "Soft Drinks & Bar",
        "title": "Perrier",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$3.00",
        "priceValue": 3,
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-199",
        "categoryId": "the-bar",
        "categoryName": "Soft Drinks & Bar",
        "title": "Water Small",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.00",
        "priceValue": 1,
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-200",
        "categoryId": "the-bar",
        "categoryName": "Soft Drinks & Bar",
        "title": "Water Large",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-201",
        "categoryId": "the-bar",
        "categoryName": "Soft Drinks & Bar",
        "title": "Pepsi",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.50",
        "priceValue": 1.5,
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-202",
        "categoryId": "the-bar",
        "categoryName": "Soft Drinks & Bar",
        "title": "Miranda",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.50",
        "priceValue": 1.5,
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-203",
        "categoryId": "the-bar",
        "categoryName": "Soft Drinks & Bar",
        "title": "7 Up",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.50",
        "priceValue": 1.5,
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-204",
        "categoryId": "the-bar",
        "categoryName": "Soft Drinks & Bar",
        "title": "Diet Pepsi",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.50",
        "priceValue": 1.5,
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-205",
        "categoryId": "the-bar",
        "categoryName": "Soft Drinks & Bar",
        "title": "Diet 7-Up",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.50",
        "priceValue": 1.5,
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-206",
        "categoryId": "the-bar",
        "categoryName": "Soft Drinks & Bar",
        "title": "Ice Tea",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$3.00",
        "priceValue": 3,
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-207",
        "categoryId": "the-bar",
        "categoryName": "Soft Drinks & Bar",
        "title": "Dark Blue",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$3.50",
        "priceValue": 3.5,
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-208",
        "categoryId": "the-bar",
        "categoryName": "Soft Drinks & Bar",
        "title": "Beer",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$5.00",
        "priceValue": 5,
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-209",
        "categoryId": "the-bar",
        "categoryName": "Soft Drinks & Bar",
        "title": "Mexican Beer",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$6.00",
        "priceValue": 6,
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-210",
        "categoryId": "the-bar",
        "categoryName": "Soft Drinks & Bar",
        "title": "Laban Iran",
        "desc": "Laban.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      },
      {
        "id": "mk-item-211",
        "categoryId": "the-bar",
        "categoryName": "Soft Drinks & Bar",
        "title": "Laziza No Alchool",
        "desc": "Laziza.",
        "price": "$3.00",
        "priceValue": 3,
        "img": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "drink"
      }
    ]
  },
  {
    "id": "awesome-add",
    "rawCategory": "AWESOME ADD",
    "name": "Awesome Add-Ons",
    "subtitle": "Extra cheddar syringe, fried mozzarella patty, curly fries & dips",
    "badge": "Extra cheddar syringe, fried mozzarella patty, curly fries & dips",
    "icon": "fa-plus-circle",
    "thumbImg": "https://rest.thrubits.com/uploads/restorants/5ba491ef-1f3c-4d70-b23f-5f031c3db650_medium.jpg",
    "fallbackImg": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
    "modType": "addons",
    "count": 12,
    "items": [
      {
        "id": "mk-item-212",
        "categoryId": "awesome-add",
        "categoryName": "Awesome Add-Ons",
        "title": "Egg Fried",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$0.50",
        "priceValue": 0.5,
        "img": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "addons"
      },
      {
        "id": "mk-item-213",
        "categoryId": "awesome-add",
        "categoryName": "Awesome Add-Ons",
        "title": "Deep Fried Mozarella Patty",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "addons"
      },
      {
        "id": "mk-item-214",
        "categoryId": "awesome-add",
        "categoryName": "Awesome Add-Ons",
        "title": "200g Seringue Melted Cheddar Cheese",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "addons"
      },
      {
        "id": "mk-item-215",
        "categoryId": "awesome-add",
        "categoryName": "Awesome Add-Ons",
        "title": "Alcohol Service",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$8.00",
        "priceValue": 8,
        "img": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "addons"
      },
      {
        "id": "mk-item-216",
        "categoryId": "awesome-add",
        "categoryName": "Awesome Add-Ons",
        "title": "Cheddar Cup",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "addons"
      },
      {
        "id": "mk-item-217",
        "categoryId": "awesome-add",
        "categoryName": "Awesome Add-Ons",
        "title": "Sauce",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.00",
        "priceValue": 1,
        "img": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "addons"
      },
      {
        "id": "mk-item-218",
        "categoryId": "awesome-add",
        "categoryName": "Awesome Add-Ons",
        "title": "Crackers",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.00",
        "priceValue": 1,
        "img": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "addons"
      },
      {
        "id": "mk-item-219",
        "categoryId": "awesome-add",
        "categoryName": "Awesome Add-Ons",
        "title": "Nuts",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$1.50",
        "priceValue": 1.5,
        "img": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "addons"
      },
      {
        "id": "mk-item-220",
        "categoryId": "awesome-add",
        "categoryName": "Awesome Add-Ons",
        "title": "Add Curly Fries",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$4.00",
        "priceValue": 4,
        "img": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "addons"
      },
      {
        "id": "mk-item-221",
        "categoryId": "awesome-add",
        "categoryName": "Awesome Add-Ons",
        "title": "Beef Patty 200g",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$3.00",
        "priceValue": 3,
        "img": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "addons"
      },
      {
        "id": "mk-item-222",
        "categoryId": "awesome-add",
        "categoryName": "Awesome Add-Ons",
        "title": "Add Bacon",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$2.00",
        "priceValue": 2,
        "img": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "addons"
      },
      {
        "id": "mk-item-223",
        "categoryId": "awesome-add",
        "categoryName": "Awesome Add-Ons",
        "title": "Add Chicken Breast",
        "desc": "Prepared fresh to order in our kitchen with signature Mini Kitchen ingredients.",
        "price": "$4.00",
        "priceValue": 4,
        "img": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "5–8 min",
        "badges": [],
        "modType": "addons"
      }
    ]
  },
  {
    "id": "arguile",
    "rawCategory": "ARGUILE",
    "name": "Arguileh Lounge",
    "subtitle": "Traditional & exotic shisha flavors served with natural charcoal",
    "badge": "Traditional & exotic shisha flavors served with natural charcoal",
    "icon": "fa-cloud",
    "thumbImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
    "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    "modType": "arguile",
    "count": 16,
    "items": [
      {
        "id": "mk-item-224",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Arguile Teffahten",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-225",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Arguile Hamod W Na3na3",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-226",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Add Rass",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$3.00",
        "priceValue": 3,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-227",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Arguile Tout",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-228",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Special Boumale",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-229",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Special Teffeh",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-230",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Minikitchen Special",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-231",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Arguile Enab",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-232",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Arguile Nakha",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-233",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Mini Kitchen Add Rass",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$4.50",
        "priceValue": 4.5,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-234",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Exotic",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$15.00",
        "priceValue": 15,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-235",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Love Arguileh",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-236",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Arguileh Bl Inglize",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-237",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Arguile Ajami",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$12.00",
        "priceValue": 12,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-238",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Arguile Enab W Na3na3",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      },
      {
        "id": "mk-item-239",
        "categoryId": "arguile",
        "categoryName": "Arguileh Lounge",
        "title": "Arguile 3elke",
        "desc": "Premium shisha flavor served with natural glowing charcoal.",
        "price": "$10.00",
        "priceValue": 10,
        "img": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "fallbackImg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "hasRealPhoto": false,
        "prepTime": "15–20 min",
        "badges": [],
        "modType": "arguile"
      }
    ]
  }
];
