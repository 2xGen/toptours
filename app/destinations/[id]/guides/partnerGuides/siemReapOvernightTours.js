/**
 * Editorial guide: Siem Reap overnight & 2-day tours — sunrise Angkor, Banteay Srei, Kulen & Tonle Sap.
 */

export const SIEM_REAP_OVERNIGHT_TOURS_SLUG = 'overnight-tours';

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

export function getSiemReapOvernightToursListingMeta() {
  return {
    category_slug: SIEM_REAP_OVERNIGHT_TOURS_SLUG,
    category_name: 'Overnight Tours',
    title: 'Best Siem Reap Overnight Tours (2026): 2-Day Angkor Sunrise, Banteay Srei & Tonle Sap',
    subtitle:
      'Hand-picked Siem Reap overnight tours from $59 — 1.5-day Angkor sunrise & Kampong Phluk lake trips, 2-day sunrise & sunset temple circuits, and Kulen–Beng Mealea combos with floating villages.',
    hero_image: taImage('0f/9d/59/77', '720x480'),
  };
}

export function getSiemReapOvernightToursTopPick() {
  return tour({
    productId: '31721P15',
    title: 'Angkor Wat Sunrise and Tonle Sap Lake 1.5 Days',
    tagLabel: 'Top pick · Best value overnight',
    operatorName: 'Journey Cambodia',
    imageUrl: taImage('0f/9d/59/77', '720x480'),
    durationLabel: '48 hours',
    priceFrom: 59,
    rating: 5,
    reviewCount: 44,
    bestFor:
      'Best for: Day-one sunrise at Angkor Wat and Angkor Thom, then day two on Tonle Sap — boat through Kampong Phluk’s flooded forest and stilted fishing villages.',
    whoFor:
      'Our highest-reviewed overnight pick on this list (44 five-star reviews) — temples and lake life from $59 with lake entrance and boat cruise included.',
    details: [
      ['Operator', 'Journey Cambodia'],
      ['Type', 'Small group · 1.5-day combo'],
      ['Rating', '5.0 from 44+ reviews'],
      ['Price from', '$59'],
      ['Duration', '48 hours (1.5 days)'],
      ['Includes', 'Guide, A/C transport, Tonle Sap entrance & boat, water, hotel pickup'],
      ['Note', 'Angkor temple pass (~$37) paid on site; meals extra; min. 2 travelers'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'Wake at 4:10am for sunrise over Angkor Wat, explore Angkor Thom the same morning, then spend day two cruising Kampong Phluk’s atmospheric flooded forest — the best-value temple-and-lake overnight on our list.',
  });
}

export function getSiemReapOvernightTwoDayThree() {
  return [
    tour({
      productId: '67476P15',
      title: 'Angkor Sunrise and Sunset two days tour plus Banteay Srei temple',
      tagLabel: '2-day · Banteay Srei included',
      operatorName: 'Travel to Inspire',
      imageUrl: taImage('07/69/10/a1'),
      durationLabel: '48 hours',
      priceFrom: 85,
      rating: 5,
      reviewCount: 19,
      bestFor:
        'Best for: Day one — Banteay Srei’s pink sandstone, Pre Rup, Ta Som, Neak Pean, Preah Khan, and Bakheng sunset; day two — Angkor Wat sunrise, Bayon, Ta Prohm, and Angkor Thom.',
      whoFor:
        'Temple enthusiasts who want both golden hours plus the finest carved temple outside the main park — lunch included, tuk-tuk for 1–3 guests.',
      details: [
        ['Operator', 'Travel to Inspire'],
        ['Type', 'Private/small group · 2-day circuit'],
        ['Rating', '5.0 from 19+ reviews'],
        ['Price from', '$85'],
        ['Duration', '48 hours'],
        ['Includes', 'Guide, transport (tuk-tuk 1–3 pax / van 4+), water, towels, lunch options'],
        ['Note', 'Temple tickets not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '401578P13',
      title: '2 Day Angkor Wat Kulen Mountain Beng Mealea Floating Village Tour',
      tagLabel: '2-day · Temples & nature',
      operatorName: 'BREKSA TRAVEL',
      imageUrl: taImage('16/58/dc/10'),
      durationLabel: '48 hours',
      priceFrom: 88,
      rating: 5,
      reviewCount: 8,
      bestFor:
        'Best for: Sunrise at Angkor Wat, Ta Prohm & Beng Mealea jungle ruins, Kulen waterfalls & Thousand Lingas, Bayon, and a Kampong Phluk boat trip — all admissions bundled.',
      whoFor:
        'Travelers who want temples, sacred mountain, unrestored jungle temple, and floating village in one guided 2-day package with breakfast and lunch included.',
      details: [
        ['Operator', 'BREKSA TRAVEL'],
        ['Type', 'Guided · comprehensive 2-day'],
        ['Rating', '5.0 from 8+ reviews'],
        ['Price from', '$88'],
        ['Duration', '48 hours'],
        ['Includes', 'All admission tickets, guide, driver, breakfast, lunch, water & towels'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '239308P8',
      title: '2 Days Angkor Wat Sunrise and Sunset Private Tour',
      tagLabel: 'Private · Big & small circuits',
      operatorName: 'Angkor Buddy Tour',
      imageUrl: taImage('0f/9d/59/77'),
      durationLabel: '48 hours',
      priceFrom: 134,
      rating: 5,
      reviewCount: 18,
      bestFor:
        'Best for: A private 48-hour deep dive — both Angkor big and small circuits with sunrise at Angkor Wat and sunset from Phnom Bakheng.',
      whoFor:
        'Couples and families who want a dedicated English-speaking guide and A/C vehicle for every major temple gate without sharing a minivan.',
      details: [
        ['Operator', 'Angkor Buddy Tour'],
        ['Type', 'Private · 2-day temple marathon'],
        ['Rating', '5.0 from 18+ reviews'],
        ['Price from', '$134'],
        ['Duration', '48 hours'],
        ['Includes', 'Private A/C transport, guide, water, hotel pickup'],
        ['Note', '3-day Angkor pass, meals & tips extra'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapOvernightToursCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapOvernightToursTopPick());
  getSiemReapOvernightTwoDayThree().forEach(add);
  return ordered;
}

export function getSiemReapOvernightToursGuideData() {
  const listing = getSiemReapOvernightToursListingMeta();
  const topPick = getSiemReapOvernightToursTopPick();

  return {
    guideLayout: 'siem-reap-overnight-tours',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Overnight tours',
    toursSearchQuery: 'Siem Reap overnight 2 day Angkor sunrise tour',
    heroImage: listing.hero_image,
    heroTagline: '1.5-day temple & lake from $59 · 2-day sunrise & sunset from $85 · all-inclusive nature combo from $88',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapOvernightToursCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Angkor sunrise & Tonle Sap lake (1.5 days)',
    transferSections: [
      {
        id: 'two-day-overnight',
        title: 'Best 2-day Angkor overnight tours',
        description:
          'Private sunrise-and-sunset circuits, Banteay Srei pink-sandstone days, and all-inclusive Kulen–Beng Mealea–floating-village combos — three more picks from $85.',
        tours: getSiemReapOvernightTwoDayThree(),
      },
    ],
    introParagraphs: [
      'An overnight or 2-day Siem Reap tour lets you catch Angkor Wat at sunrise without a 4am tuk-tuk scramble on a second visit — and adds lake villages, Kulen waterfalls, or Banteay Srei on day two.',
      'Below are four hand-picked options from $59 to $134 with real review counts. Most require an Angkor Pass (from $37 for one day or ~$62 for 2–3 days) unless the operator bundles all site fees — check each listing before you book.',
    ],
    comparisonSection: {
      title: 'Which overnight tour fits your trip?',
      headers: ['Tour style', 'Price from', 'Best for', 'Trade-off'],
      rows: [
        ['1.5-day Angkor + Tonle Sap', 'From $59', 'Sunrise temples + flooded forest boat', 'Min. 2 travelers; pass extra'],
        ['2-day Banteay Srei circuit', 'From $85', 'Both golden hours + pink temple', 'Temple tickets separate'],
        ['2-day Kulen & Beng Mealea', 'From $88', 'Nature + jungle temple + lake', 'Long days; very full itinerary'],
        ['2-day private big circuit', 'From $134', 'Every major gate, private pace', 'Premium pricing; meals extra'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap overnight tour tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Buy a 2–3 day Angkor Pass if touring two days', 'Cheaper per day than two single-day passes for multi-temple circuits'],
        ['Request a breakfast pack from your hotel', 'Day-one sunrise tours start around 4–4:30am — eat after Angkor Wat'],
        ['Book Tonle Sap trips in wet season', 'Kampong Phluk’s flooded forest is most atmospheric when water levels are high'],
        ['Wear layers for Bakheng sunset', 'The hill gets breezy; arrive early for a good viewpoint spot'],
        ['Confirm if all site fees are included', 'The $88 BREKSA tour bundles admissions; most others do not'],
      ],
    },
    stats: {
      toursAvailable: 4,
      priceFrom: 59,
      duration: '1.5–2 days',
      reviewCount: 89,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Best Siem Reap Overnight Tours (2026): 2-Day Angkor Sunrise & Tonle Sap | TopTours',
      description:
        'Compare Siem Reap overnight tours from $59 — 1.5-day Angkor sunrise & Kampong Phluk lake trips, 2-day Banteay Srei circuits, and Kulen–Beng Mealea combos with real reviews.',
      keywords:
        'Siem Reap overnight tour, 2 day Angkor Wat tour, Angkor sunrise sunset tour, Banteay Srei 2 day tour, Tonle Sap overnight Siem Reap',
    },

    faqs: [
      {
        question: 'What is the best overnight tour in Siem Reap?',
        answer:
          'The Angkor Wat Sunrise and Tonle Sap Lake 1.5 Days tour (5.0 from 44+ reviews, from $59) offers the best value — sunrise at Angkor Wat day one and a Kampong Phluk boat trip day two with lake entrance included.',
      },
      {
        question: 'Do I need to stay overnight outside Siem Reap city?',
        answer:
          'No. All tours on this list return you to your Siem Reap hotel each evening. “Overnight” means the tour spans two calendar days, not camping at the temples.',
      },
      {
        question: 'Which 2-day tour includes Banteay Srei?',
        answer:
          'The Angkor Sunrise and Sunset two days tour plus Banteay Srei temple (from $85, 5.0 from 19+ reviews) dedicates day one to the pink sandstone temple and outer temples before Bakheng sunset, with Angkor Wat sunrise on day two.',
      },
      {
        question: 'Which tour includes Kulen Mountain and Beng Mealea?',
        answer:
          'The 2 Day Angkor Wat Kulen Mountain Beng Mealea Floating Village Tour (from $88) bundles all admission tickets plus breakfast and lunch — covering sunrise Angkor, jungle Beng Mealea, Kulen waterfalls, and Kampong Phluk.',
      },
      {
        question: 'How early do sunrise tours start?',
        answer:
          'Expect a 4:00–4:30am hotel pickup for Angkor Wat sunrise. Pack a headlamp, confirm breakfast arrangements with your hotel, and buy your Angkor Pass the afternoon before to skip morning queues.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Siem Reap multi-day tours',
        href: '/destinations/siem-reap/guides/multi-day-tours',
      },
      {
        label: 'Angkor Wat sunrise complete guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
      },
      {
        label: 'Siem Reap nature & wildlife tours',
        href: '/destinations/siem-reap/guides/nature-and-wildlife-tours',
      },
      {
        label: 'Siem Reap hidden costs & Angkor Pass fees',
        href: '/destinations/siem-reap/guides/additional-fees',
      },
      {
        label: 'Siem Reap half-day tours',
        href: '/destinations/siem-reap/guides/half-day-tours',
      },
    ],
  };
}
