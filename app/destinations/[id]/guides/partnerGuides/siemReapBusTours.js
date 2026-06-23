/**
 * Editorial guide: Siem Reap bus tours — double-decker sightseeing, coach temple days & airport shuttles.
 */

export const SIEM_REAP_BUS_TOURS_SLUG = 'bus-tours';

const AFF = '?mcid=42383&pid=P00276441&medium=api&api_version=2.0';

function taImage(path, size = '540x360') {
  const normalized = String(path || '').replace(/\.jpg$/i, '');
  return `https://media-cdn.tripadvisor.com/media/attractions-splice-spp-${size}/${normalized}.jpg`;
}

function tour(partial) {
  return {
    ...partial,
    viatorBookingUrl:
      partial.viatorBookingUrl ||
      `https://www.viator.com/tours/Siem-Reap/t/d5480-${partial.productId}${AFF}`,
  };
}

export function getSiemReapBusToursListingMeta() {
  return {
    category_slug: SIEM_REAP_BUS_TOURS_SLUG,
    category_name: 'Bus Tours',
    title: 'Siem Reap Bus Tours: Double-Decker Sightseeing, Angkor Coach Days & Airport Shuttles',
    subtitle:
      'Ride the Big Bus Angkor double-decker from $9, join a private coach day to Angkor Wat from $60, or catch a shuttle bus to SAI airport from $19 — hand-picked Siem Reap bus options with real reviews.',
    hero_image: taImage('17/0d/a7/53', '720x480'),
  };
}

export function getSiemReapBusToursTopPick() {
  return tour({
    productId: '5621307P1',
    title: 'Siem Reap Angkor Sunset Sightseeing Tour',
    tagLabel: 'Top pick · Double-decker bus',
    operatorName: 'Big Bus Angkor',
    imageUrl: taImage('17/0d/a7/53', '720x480'),
    durationLabel: '1h 15m',
    priceFrom: 9,
    rating: 5,
    reviewCount: 1,
    bestFor:
      'Best for: Travelers who want panoramic, open-top views of Siem Reap and the Angkor area without a full-day temple commitment.',
    whoFor:
      'Our top-rated double-decker sightseeing pick — iconic Big Bus Angkor coaches with unobstructed upper-deck views of the city and surrounding landscapes.',
    details: [
      ['Operator', 'Big Bus Angkor'],
      ['Type', 'Double-decker sightseeing bus'],
      ['Rating', '5.0 from 1+ review'],
      ['Price from', '$9'],
      ['Duration', '~1 hour 15 minutes'],
      ['Includes', 'Panoramic upper-deck seating, city & Angkor-area route'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'Big Bus Angkor’s double-decker city tour gives you a perspective you cannot get from a tuk-tuk or minivan — hop on the upper deck for sunset sightseeing across Siem Reap.',
  });
}

export function getSiemReapBusTempleCoachThree() {
  return [
    tour({
      productId: '231435P13',
      title: '1 Day Angkor Wat with Small Tour, Pre Rup and Banteay Srei Tour',
      tagLabel: 'Private · Coach day tour',
      operatorName: 'Local private tour operator',
      imageUrl: taImage('12/33/5f/ef'),
      durationLabel: '9 hours',
      priceFrom: 60,
      rating: 5,
      reviewCount: 2,
      bestFor:
        'Best for: Travelers who want an unhurried private coach day through the Small Circuit — Angkor Wat, Angkor Thom, Bayon, Ta Prohm, Pre Rup, and Banteay Srei.',
      whoFor:
        'Couples and small groups who prefer a private minivan or coach over rushed group circuits — time to appreciate each temple without the crowd pressure.',
      details: [
        ['Type', 'Private · full-day coach/minivan'],
        ['Rating', '5.0 from 2+ reviews'],
        ['Price from', '$60'],
        ['Duration', '9 hours'],
        ['Covers', 'Angkor Wat, Bayon, Ta Prohm, Pre Rup, Banteay Srei'],
        ['Note', 'Angkor Pass not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapBusAirportShuttleThree() {
  return [
    tour({
      productId: '367469P4',
      title: 'Siem Reap City to Siem Reap Angkor Airport by Shuttle Bus',
      tagLabel: 'Shuttle bus · City to SAI',
      operatorName: 'Siem Reap Angkor Airport (SAI) Shuttles and Taxis',
      imageUrl: taImage('12/00/a2/0c'),
      durationLabel: '1 hour',
      priceFrom: 19,
      rating: 5,
      reviewCount: 65,
      bestFor:
        'Best for: Hotel pickup in central Siem Reap with a comfortable shuttle drop-off at Siem Reap Angkor International Airport (SAI).',
      whoFor:
        'The highest-reviewed airport shuttle bus on our list — professional English-speaking drivers, bottled water, and door-to-airport service.',
      details: [
        ['Operator', 'Siem Reap Angkor Airport (SAI) Shuttles and Taxis'],
        ['Type', 'Shared shuttle bus · city to airport'],
        ['Rating', '5.0 from 65+ reviews'],
        ['Price from', '$19'],
        ['Duration', '~1 hour'],
        ['Includes', 'Hotel pickup, airport drop-off, bottled water'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '367469P2',
      title: 'Siem Reap Angkor Airport to Siem Reap City by Shuttle Bus',
      tagLabel: 'Shuttle bus · SAI to city',
      operatorName: 'Siem Reap Angkor Airport (SAI) Shuttles and Taxis',
      imageUrl: taImage('11/ad/92/8a'),
      durationLabel: '1 hour',
      priceFrom: 19,
      rating: 5,
      reviewCount: 6,
      bestFor:
        'Best for: Arriving at SAI and needing a shared shuttle with door-to-door hotel drop-offs across Siem Reap.',
      whoFor: 'Travelers landing at the new airport who want a middle ground between the $8 public bus and a private taxi.',
      details: [
        ['Type', 'Shared shuttle · max 12 guests'],
        ['Rating', '5.0 from 6+ reviews'],
        ['Price from', '$19'],
        ['Duration', '~1 hour'],
        ['Includes', 'English driver, toll fees, cold water, hotel drop-off'],
      ],
    }),
    tour({
      productId: '5503252P3',
      title: 'Siem Reap International Airport Shared Shuttle Bus Transfer',
      tagLabel: 'Budget · Shuttle bus',
      operatorName: 'Siem Reap Airport Shuttle Bus',
      imageUrl: taImage('17/10/83/67'),
      durationLabel: '1 hour',
      priceFrom: 8,
      rating: 4.5,
      reviewCount: 21,
      bestFor:
        'Best for: The cheapest shared bus ride between SAI and downtown Siem Reap — ideal for backpackers on a budget.',
      whoFor: 'Solo travelers who do not mind a fixed shuttle schedule and shared seating for the lowest airport transfer price.',
      details: [
        ['Type', 'Shared shuttle bus'],
        ['Rating', '4.5 from 21+ reviews'],
        ['Price from', '$8'],
        ['Duration', '~1 hour'],
        ['Includes', 'AC bus, bottled water, WiFi on board'],
      ],
    }),
  ];
}

export function getSiemReapBusPopularDayTripsThree() {
  return [
    tour({
      productId: '31721P29',
      title: 'Angkor Sunrise Expedition Cycling Through Serene Backroads',
      tagLabel: 'Small group · Sunrise cycling',
      operatorName: 'Local cycling tour operator',
      imageUrl: taImage('11/85/06/7e'),
      durationLabel: '8 hours',
      priceFrom: 69,
      rating: 5,
      reviewCount: 70,
      bestFor:
        'Best for: Active travelers who want sunrise at Angkor Wat plus 15–25 km of easy cycling on serene backroads after breakfast.',
      whoFor:
        'Small-group adventurers who want temples and countryside on two wheels — one of the highest-reviewed active day trips in Siem Reap.',
      details: [
        ['Rating', '5.0 from 70+ reviews'],
        ['Price from', '$69'],
        ['Duration', '8 hours'],
        ['Includes', 'Sunrise at Angkor Wat, breakfast, guided cycling loop'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '240081P86',
      title: 'Full Day From Siem Reap - Bamboo Train, Killing Cave & Sunset',
      tagLabel: 'Private · Battambang day trip',
      operatorName: 'Local private tour operator',
      imageUrl: taImage('12/45/5f/db'),
      durationLabel: '15 hours',
      priceFrom: 99,
      rating: 5,
      reviewCount: 57,
      bestFor:
        'Best for: A full private day to Battambang — bamboo train ride, Killing Caves, Wat Banan temple, and sunset with round-trip coach transport from Siem Reap.',
      whoFor:
        'Travelers who want to explore Cambodia beyond Angkor without organizing their own minivan and tuk-tuk logistics.',
      details: [
        ['Type', 'Private · full-day excursion'],
        ['Rating', '5.0 from 57+ reviews'],
        ['Price from', '$99'],
        ['Duration', '~15 hours'],
        ['Includes', 'Round-trip transport, tuk-tuk in Battambang, guide'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '87436P7',
      title: 'Angkor Wat by Vintage Jeep – Private Tour',
      tagLabel: 'Private · Vintage Jeep',
      operatorName: 'Local Jeep tour operator',
      imageUrl: taImage('07/86/39/47'),
      durationLabel: '7 hours',
      priceFrom: 60,
      rating: 5,
      reviewCount: 51,
      bestFor:
        'Best for: A stylish private Angkor day in an open-air vintage Jeep — Angkor Wat, Angkor Thom, Ta Prohm, and quiet Ta Nei away from crowds.',
      whoFor:
        'Couples and small groups who want adventure and flexibility without a standard minivan — unhurried pacing with a knowledgeable local guide.',
      details: [
        ['Type', 'Private · vintage Jeep'],
        ['Rating', '5.0 from 51+ reviews'],
        ['Price from', '$60'],
        ['Duration', '7 hours'],
        ['Covers', 'Angkor Wat, Angkor Thom, Ta Prohm, Ta Nei'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapBusToursCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapBusToursTopPick());
  getSiemReapBusTempleCoachThree().forEach(add);
  getSiemReapBusAirportShuttleThree().forEach(add);
  getSiemReapBusPopularDayTripsThree().forEach(add);
  return ordered;
}

export function getSiemReapBusToursGuideData() {
  const listing = getSiemReapBusToursListingMeta();
  const topPick = getSiemReapBusToursTopPick();

  return {
    guideLayout: 'siem-reap-bus-tours',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Bus tours',
    toursSearchQuery: 'Siem Reap bus tour shuttle',
    heroImage: listing.hero_image,
    heroTagline: 'Double-decker sightseeing from $9 · private Angkor coach days from $60 · airport shuttles from $8',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapBusToursCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Big Bus Angkor double-decker sunset sightseeing',
    transferSections: [
      {
        id: 'temple-coach',
        title: 'Best Siem Reap bus & coach Angkor day tours',
        description:
          'Full-day private coach and minivan circuits through Angkor Wat, Bayon, Ta Prohm, and beyond — slower pacing than rushed group buses.',
        tours: getSiemReapBusTempleCoachThree(),
      },
      {
        id: 'airport-shuttle',
        title: 'Bus & shuttle airport transfers',
        description:
          'Shared shuttle buses between Siem Reap city and Siem Reap Angkor International Airport (SAI) — from budget $8 rides to door-to-door hotel pickup.',
        tours: getSiemReapBusAirportShuttleThree(),
      },
      {
        id: 'popular-day-trips',
        title: 'Other popular Siem Reap day trips',
        description:
          'Highly rated alternatives when you want more than a bus — sunrise cycling, a Battambang bamboo-train adventure, or a vintage Jeep through the temples.',
        tours: getSiemReapBusPopularDayTripsThree(),
      },
    ],
    introParagraphs: [
      'Siem Reap bus tours fall into three buckets: open-top double-decker sightseeing, private coach days to Angkor, and shared shuttle buses to the airport. Each solves a different problem — city views, temple depth, or getting to SAI on a budget.',
      'Below are our hand-picked options with real prices, review counts, and what is included. Remember: Angkor Pass ($37+) is separate on any temple day, and airport shuttles run on fixed schedules unlike private taxis.',
    ],
    comparisonSection: {
      title: 'Double-decker vs coach temple day vs airport shuttle — quick comparison',
      headers: ['Option', 'Typical price', 'Best for', 'Trade-off'],
      rows: [
        ['Double-decker sightseeing', 'From $9', 'City & sunset views, short visit', 'Not a full Angkor temple day'],
        ['Private coach temple tour', 'From $60', 'Unhurried Angkor circuit', 'Angkor Pass extra; longer day'],
        ['Airport shuttle bus', 'From $8–$19', 'SAI airport transfers', 'Shared schedule; may stop at multiple hotels'],
        ['Cycling / Jeep day trips', 'From $60–$99', 'Active or adventurous Angkor days', 'Higher price; more physical or longer hours'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap bus tour tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Book double-decker tours for late afternoon', 'Upper-deck sunset views are the main draw — avoid midday heat'],
        ['Buy your Angkor Pass before coach temple days', '$37 one-day pass required; drivers stop at the ticket office on the way in'],
        ['Confirm shuttle direction (city→airport vs airport→city)', 'Product codes differ — book the leg you actually need'],
        ['Allow extra time for shared airport shuttles', 'Multiple hotel pickups can add 20–30 minutes on busy days'],
        ['Pack light for sightseeing buses', 'Upper-deck seating has limited storage — keep bags small'],
        ['Compare $8 shared bus vs $19 door-to-door shuttle', 'Budget bus is cheapest; $19 shuttle picks up at your hotel'],
      ],
    },
    stats: {
      toursAvailable: 8,
      priceFrom: 8,
      duration: '1h – 15h',
      reviewCount: 280,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Siem Reap Bus Tours (2026): Double-Decker, Angkor Coach Days & Airport Shuttles | TopTours',
      description:
        'Compare Siem Reap bus tours from $9 — Big Bus Angkor double-decker sightseeing, private Angkor coach days from $60, and SAI airport shuttle buses from $8 with real reviews.',
      keywords:
        'Siem Reap bus tour, Big Bus Angkor, Siem Reap double decker bus, Angkor bus tour, Siem Reap airport shuttle bus, SAI airport transfer',
    },

    faqs: [
      {
        question: 'What is the best Siem Reap bus tour for first-time visitors?',
        answer:
          'For a quick introduction, the Big Bus Angkor double-decker sunset sightseeing tour (from $9) offers panoramic city views without committing to a full temple day. For temples, the private 1-day Angkor coach tour (from $60) covers Angkor Wat, Bayon, Ta Prohm, Pre Rup, and Banteay Srei at an unhurried pace.',
      },
      {
        question: 'How much does a Siem Reap airport shuttle bus cost?',
        answer:
          'Shared shuttle buses start around $8 for the basic SAI transfer. Door-to-door hotel pickup shuttles run from about $19 each way. Private taxis cost more but run on your schedule — see our airport transfers guide for a full comparison.',
      },
      {
        question: 'Does a Siem Reap bus tour include the Angkor Pass?',
        answer:
          'No. Sightseeing buses and coach temple tours do not include the Angkor Archaeological Park pass ($37 for one day). Your driver or guide will stop at the ticket office so you can buy one before entering the park.',
      },
      {
        question: 'What is the difference between a double-decker bus tour and a coach temple day?',
        answer:
          'Double-decker sightseeing tours (from $9, ~1 hour) focus on city and landscape views from an open upper deck. Coach temple days (from $60, ~9 hours) are full private circuits through Angkor Wat and multiple temples with a guide and minivan transport.',
      },
      {
        question: 'Can I take a bus from Siem Reap to Battambang?',
        answer:
          'Public buses run between cities, but most travelers book a private day trip like the Battambang bamboo train tour (from $99) which includes round-trip coach transport, a local guide, and tuk-tuk access to sites — saving hours of independent logistics.',
      },
      {
        question: 'Are Siem Reap airport shuttle buses reliable?',
        answer:
          'Yes — the top-rated city-to-airport shuttle (5.0 from 65+ reviews) includes hotel pickup, professional drivers, and bottled water. Shared $8 buses are reliable but follow fixed schedules. Allow extra time during peak hours and holidays.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Siem Reap airport transfers (taxis & shuttles)',
        href: '/destinations/siem-reap/guides/airport-transfers',
      },
      {
        label: 'Best Angkor Wat tours (shore excursions)',
        href: '/destinations/siem-reap/guides/shore-excursions',
      },
      {
        label: 'Siem Reap day trips',
        href: '/destinations/siem-reap/guides/day-trips',
      },
      {
        label: 'Siem Reap hidden costs & Angkor Pass fees',
        href: '/destinations/siem-reap/guides/additional-fees',
      },
      {
        label: 'All Siem Reap travel guides',
        href: '/destinations/siem-reap/guides',
      },
    ],
  };
}
