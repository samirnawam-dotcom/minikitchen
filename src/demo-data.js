'use strict';

/**
 * Sample Back Office records used ONLY for local development / demos.
 * Seeded when SEED_DEMO_ORDERS=true (default outside production).
 */
function getDemoOrders() {
  const now = Date.now();
  return [
    {
      id: 'MK-1004',
      createdAt: new Date(now - 1000 * 60 * 18).toISOString(),
      type: 'delivery_order',
      brand: 'delivery',
      status: 'new',
      customerName: 'Rami Talhouk',
      customerPhone: '+961 3 912 440',
      address: 'Aley Center, Near Piscine Aley, Building 4, 2nd Floor',
      notes: 'Extra garlic toum and please ring the bell',
      items: [
        {
          id: 'mk-item-85',
          title: 'The Molten Syringe Burger',
          qty: 2,
          priceValue: 9.5,
          modifiers: ['Classic Signature Preparation', '200g Molten Cheddar Syringe (+$2.00)'],
          note: 'No pickles on one burger'
        },
        {
          id: 'mk-item-121',
          title: '1KG Cheddar Fountain Family Box',
          qty: 1,
          priceValue: 28.0,
          modifiers: ['+ Mozzarella Stick (+$1.90)'],
          note: ''
        },
        { id: 'mk-item-31', title: 'Curly Fries Basket', qty: 1, priceValue: 5.5, modifiers: [], note: '' }
      ],
      totalUsd: 52.5,
      lbpRate: 89500,
      staffNotes: 'Sent via Website WhatsApp Cart',
      whatsappText: 'NEW FINEDINE DIGITAL ORDER — MINI KITCHEN\nCustomer: Rami Talhouk\nTotal: $52.50'
    },
    {
      id: 'MK-1003',
      createdAt: new Date(now - 1000 * 60 * 75).toISOString(),
      type: 'catering_quote',
      brand: 'catering',
      status: 'confirmed',
      customerName: 'Nadine Karam & Marc Haddad',
      customerPhone: '+961 71 445 890',
      address: 'Private Garden Villa, Bhamdoun, Mount Lebanon',
      eventType: 'Wedding Reception',
      eventDate: '2026-11-14',
      guests: 160,
      packageSelected: 'The Royal Mountain Wedding Feast ($45/guest)',
      notes:
        'We would love to add the Live Molten Cheddar Fountain station for the after-party and schedule a tasting in Aley.',
      items: [],
      totalUsd: 7200,
      lbpRate: 89500,
      staffNotes: 'Tasting scheduled for Saturday at 4:00 PM in Ain Al Remmaneh.',
      whatsappText:
        'NEW CATERING QUOTATION REQUEST — MINI KITCHEN CATERING\nClient: Nadine Karam & Marc Haddad\nEvent: Wedding Reception (160 Guests)'
    },
    {
      id: 'MK-1002',
      createdAt: new Date(now - 1000 * 60 * 190).toISOString(),
      type: 'table_reservation',
      brand: 'restaurant',
      status: 'confirmed',
      customerName: 'Fadi Chehayeb',
      customerPhone: '+961 70 662 118',
      address: 'Ain Al Remmaneh, Aley — Outdoor Mountain View Terrace',
      eventType: 'Restaurant Table Reservation',
      eventDate: new Date(now).toISOString().slice(0, 10),
      guests: 8,
      packageSelected: 'Sunset Terrace Table + Arguileh',
      notes: 'Corner table overlooking the mountain sunset for 8 guests at 7:30 PM.',
      items: [],
      totalUsd: 0,
      lbpRate: 89500,
      staffNotes: 'Reserved Terrace Table #4',
      whatsappText: 'Hello Mini Kitchen Restaurant! I would like to reserve a sunset terrace table for 8 guests.'
    },
    {
      id: 'MK-1001',
      createdAt: new Date(now - 1000 * 60 * 340).toISOString(),
      type: 'catering_quote',
      brand: 'catering',
      status: 'completed',
      customerName: 'Cedar Tech Holding (Maya Saab)',
      customerPhone: '+961 1 889 230',
      address: 'Souk El Gharb Conference Hall',
      eventType: 'Corporate Event / Gala',
      eventDate: '2026-10-25',
      guests: 65,
      packageSelected: 'Executive Corporate Gala Buffet ($28/guest)',
      notes: 'Include vegetarian mezza options and specialty coffee bar.',
      items: [],
      totalUsd: 1820,
      lbpRate: 89500,
      staffNotes: 'Deposit received, menu finalized.',
      whatsappText: 'NEW CATERING QUOTATION REQUEST — MINI KITCHEN CATERING\nClient: Cedar Tech Holding\nGuests: 65'
    }
  ];
}

module.exports = { getDemoOrders };
