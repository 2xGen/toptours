/**
 * Editorial guide: Best Angkor Wat tours in Siem Reap (hardcoded Viator picks).
 */

export const SIEM_REAP_ANGKOR_WAT_TOURS_SLUG = 'shore-excursions';

const AFF = '?mcid=42383&pid=P00276441&medium=api&api_version=2.0';

function viatorImage(path, w = 800, h = 600) {
  return `https://dynamic-media.tacdn.com/media/photo-o/${path}/caption.jpg?w=${w}&h=${h}&s=1`;
}

/** TripAdvisor CDN — use 540x360 for card grids, 720x480 for hero */
function taImage(path, size = '540x360') {
  return `https://media-cdn.tripadvisor.com/media/attractions-splice-spp-${size}/${path}.jpg`;
}

function tour(partial) {
  return {
    ...partial,
    viatorBookingUrl:
      partial.viatorBookingUrl ||
      `https://www.viator.com/tours/Siem-Reap/t/d5480-${partial.productId}${AFF}`,
  };
}

export function getSiemReapAngkorWatToursListingMeta() {
  return {
    category_slug: SIEM_REAP_ANGKOR_WAT_TOURS_SLUG,
    category_name: 'Shore Excursions',
    title: 'Best Siem Reap Shore Excursions: Angkor Wat Small Group & Private Tours',
    subtitle:
      'Compare hand-picked Siem Reap shore excursions and Angkor Wat temple tours — small-group circuits from $42, private tuk-tuk rides from $45, and full-day trips from $79.',
    hero_image: viatorImage('32/87/87/a3', 720, 480),
  };
}

export function getSiemReapAngkorWatToursTopPick() {
  return tour({
    productId: '39527P10',
    title: 'Angkor Wat Private Tour in a Tuk Tuk',
    tagLabel: 'Top pick · Private tuk-tuk',
    operatorName: 'Local operator',
    imageUrl: viatorImage('2e/f9/99/0b', 720, 480),
    durationLabel: '6–7 hours',
    priceFrom: 45,
    priceNote: 'Price varies by group size',
    rating: 5,
    reviewCount: 76,
    bestFor:
      'Best for: Travelers who want a classic Siem Reap experience — open-air tuk-tuk rides between Angkor Wat, Bayon, and Ta Prohm with a private guide.',
    whoFor:
      'Couples and small groups who prefer the breeze and photo stops of a tuk-tuk over a minivan — our highest-reviewed Angkor Wat private tour on this list.',
    details: [
      ['Type', 'Private · tuk-tuk temple circuit'],
      ['Rating', '5.0 from 76+ reviews'],
      ['Price from', '$45 (varies by group size)'],
      ['Duration', '6–7 hours'],
      ['Covers', 'Angkor Wat, Bayon, Ta Prohm & major temples'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'The most-booked private Angkor Wat experience on our list — ride between temple gates in a tuk-tuk with your own guide, at a sharp price for a private day.',
  });
}

export function getSiemReapAngkorWatOptionsThree() {
  return [
    tour({
      productId: '5639769P1',
      title: 'Small tour: Angkor Wat, Bayon And Ta Prohm Small Group',
      tagLabel: 'Small group · Best budget',
      imageUrl: viatorImage('32/87/87/a3'),
      durationLabel: '8 hours',
      priceFrom: 42,
      rating: 5,
      reviewCount: 8,
      bestFor:
        'Best for: Budget travelers who want the classic three-temple circuit without paying for a private guide.',
      whoFor: 'Solo travelers and pairs happy to join a small group for Angkor Wat, Bayon, and Ta Prohm.',
      details: [
        ['Type', 'Small group · shared guide'],
        ['Rating', '5.0 from 8+ reviews'],
        ['Price from', '$42'],
        ['Duration', '~8 hours'],
        ['Includes', 'Angkor Wat, Bayon & Ta Prohm'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '39527P10',
      title: 'Angkor Wat Private Tour in a Tuk Tuk',
      tagLabel: 'Private · Tuk-tuk',
      imageUrl: viatorImage('2e/f9/99/0b'),
      durationLabel: '6–7 hours',
      priceFrom: 45,
      priceNote: 'Price varies by group size',
      rating: 5,
      reviewCount: 76,
      bestFor: 'Best for: A private temple day with iconic open-air tuk-tuk transport between sites.',
      whoFor: 'Couples and friends who want flexibility and the classic Siem Reap tuk-tuk feel.',
      details: [
        ['Type', 'Private · tuk-tuk'],
        ['Rating', '5.0 from 76+ reviews'],
        ['Price from', '$45'],
        ['Duration', '6–7 hours'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '69623P7',
      title: 'Full-Day Private Tour of Angkor Wat with Pick Up',
      tagLabel: 'Private · Full day',
      imageUrl: viatorImage('2e/f5/60/e1'),
      durationLabel: '8–9 hours',
      priceFrom: 95,
      priceNote: 'Per group',
      rating: 5,
      reviewCount: 13,
      bestFor: 'Best for: Groups who want a dedicated vehicle and guide for a full Angkor circuit with hotel pickup.',
      whoFor: 'Families and friends traveling together — one price per group, not per person.',
      details: [
        ['Type', 'Private · full day'],
        ['Rating', '5.0 from 13+ reviews'],
        ['Price from', '$95 per group'],
        ['Duration', '8–9 hours'],
        ['Includes', 'Hotel pickup'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapAngkorWatPrivateThree() {
  return [
    tour({
      productId: '16658P8',
      title: 'Private City Tour in Siem Reap',
      tagLabel: 'Private · City & temples',
      imageUrl: viatorImage('2e/f5/81/a5'),
      durationLabel: '4 hours',
      priceFrom: 58,
      rating: 4.6,
      reviewCount: 15,
      bestFor: 'Best for: A shorter private day mixing Siem Reap city highlights with temple time.',
      whoFor: 'Travelers with limited time or anyone who wants a half-day private introduction before a full Angkor day.',
      details: [
        ['Type', 'Private · city tour'],
        ['Rating', '4.6 from 15+ reviews'],
        ['Price from', '$58'],
        ['Duration', '4 hours'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '24380P1226',
      title: 'The Ultimate Angkor Wat Temple Private Day Trip',
      tagLabel: 'Private · Hidden gems',
      imageUrl: taImage('0a/3e/77/98'),
      durationLabel: '7 hours',
      priceFrom: 62,
      priceNote: 'Price varies by group size',
      rating: 4.9,
      reviewCount: 96,
      bestFor:
        'Best for: Temple completists who want major sites plus lesser-known stops with a highly rated private guide.',
      whoFor: 'Repeat visitors and first-timers who want the deepest single-day Angkor experience without a big group.',
      details: [
        ['Type', 'Private · full access day trip'],
        ['Rating', '4.9 from 96+ reviews'],
        ['Price from', '$62'],
        ['Duration', '7 hours'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '339029P1',
      title: 'Private Tour Hiking and Trekking to Phnom Krom',
      tagLabel: 'Private · Trekking',
      imageUrl: taImage('12/78/fe/58'),
      durationLabel: '4 hours',
      priceFrom: 115,
      rating: null,
      reviewCount: null,
      bestFor:
        'Best for: Active travelers who want views over Tonle Sap and the countryside beyond the temple circuit.',
      whoFor: 'Hikers and photographers looking for something different from a standard Angkor minivan day.',
      details: [
        ['Type', 'Private · hiking & trekking'],
        ['Price from', '$115'],
        ['Duration', '4 hours'],
        ['Highlights', 'Phnom Krom hill views, countryside trails'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapAngkorWatFullDayThree() {
  return [
    tour({
      productId: '461077P1',
      title: 'ONE FULL DAY-Tours, Beautiful SUNRISE at ANGKOR WAT Temple',
      tagLabel: 'Sunrise · Per group',
      imageUrl: viatorImage('32/ce/79/8c', 400, 300),
      durationLabel: '8 hours',
      priceFrom: 129,
      priceNote: 'Per group',
      rating: 5,
      reviewCount: 3,
      bestFor: 'Best for: Sunrise at Angkor Wat with a full-day private itinerary — one price for your whole group.',
      whoFor: 'Families and groups who will get up early once and want sunrise plus a complete temple day covered.',
      details: [
        ['Type', 'Private · sunrise + full day'],
        ['Rating', '5.0 from 3+ reviews'],
        ['Price from', '$129 per group'],
        ['Duration', '8 hours'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '13001P21',
      title: 'Full Day Angkor Wat - Tra Prohm - Angkor Thom',
      tagLabel: 'Full day · Classic circuit',
      imageUrl: viatorImage('2e/f9/5a/14', 400, 300),
      durationLabel: '8 hours',
      priceFrom: 79,
      rating: 5,
      reviewCount: 1,
      bestFor: 'Best for: The essential Angkor small-circuit day — Wat, jungle Ta Prohm, and Angkor Thom at a mid-range price.',
      whoFor: 'First-time visitors who want all three headline temples in one well-paced day.',
      details: [
        ['Type', 'Full-day temple tour'],
        ['Rating', '5.0'],
        ['Price from', '$79'],
        ['Duration', '8 hours'],
        ['Covers', 'Angkor Wat, Ta Prohm, Angkor Thom'],
      ],
    }),
    tour({
      productId: '257096P17',
      title: 'Preah Vihear and Koh Ker group Full-Day private Tour',
      tagLabel: 'Full day · Remote temples',
      imageUrl: viatorImage('2e/f4/73/d2', 400, 300),
      durationLabel: '8 hours',
      priceFrom: 116,
      priceNote: 'Price varies by group size',
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: Adventurous travelers who have done the main circuit and want remote Preah Vihear and Koh Ker in one long day.',
      whoFor: 'Repeat Angkor visitors and temple enthusiasts with a full day to spare for outlying sites.',
      details: [
        ['Type', 'Private · remote temple day'],
        ['Rating', '5.0'],
        ['Price from', '$116'],
        ['Duration', '8 hours'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapAngkorWatToursCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapAngkorWatToursTopPick());
  getSiemReapAngkorWatOptionsThree().forEach(add);
  getSiemReapAngkorWatPrivateThree().forEach(add);
  getSiemReapAngkorWatFullDayThree().forEach(add);
  return ordered;
}

export function getSiemReapAngkorWatToursGuideData() {
  const listing = getSiemReapAngkorWatToursListingMeta();
  const topPick = getSiemReapAngkorWatToursTopPick();

  return {
    guideLayout: 'siem-reap-angkor-wat-tours',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Shore excursions',
    toursSearchQuery: 'Siem Reap shore excursions Angkor Wat',
    heroImage: listing.hero_image,
    heroTagline: 'Small-group tours from $42 · private tuk-tuk from $45 · full-day trips from $79',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapAngkorWatToursCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Angkor Wat private tuk-tuk tour',
    transferSections: [
      {
        id: 'options',
        title: 'Best Angkor Wat tour options',
        description:
          'The classic Siem Reap temple day — small-group circuits, private tuk-tuk rides, and full-day private pickups covering Angkor Wat, Bayon, and Ta Prohm.',
        tours: getSiemReapAngkorWatOptionsThree(),
      },
      {
        id: 'private',
        title: 'Best private Angkor Wat tours',
        description:
          'Dedicated guides and flexible pacing — from half-day city tours to hidden-gem temple days and countryside trekking.',
        tours: getSiemReapAngkorWatPrivateThree(),
      },
      {
        id: 'full-day',
        title: 'Best full-day Angkor Wat tours',
        description:
          'Sunrise starts, complete small-circuit days, and remote temple runs for travelers with a full day to invest.',
        tours: getSiemReapAngkorWatFullDayThree(),
      },
    ],
    introParagraphs: [
      'Angkor Archaeological Park spans 400+ km² — most first-time visitors focus on Angkor Wat, Bayon, and Ta Prohm, but choosing the right tour format (small group, private tuk-tuk, or full-day private) matters as much as which temples you tick off.',
      'Below are our hand-picked Angkor Wat tours on Viator: one top recommendation, three best all-round options, three private picks, and three full-day experiences — all with live pricing on TopTours.',
    ],
    comparisonSection: {
      title: 'Small group vs private tuk-tuk vs full-day private — quick comparison',
      headers: ['Tour type', 'Typical price', 'Best for', 'Trade-off'],
      rows: [
        ['Small group circuit', 'From $42', 'Budget travelers, meeting people', 'Fixed schedule, shared guide'],
        ['Private tuk-tuk', 'From $45', 'Iconic Siem Reap experience, photo stops', 'Open-air — heat and rain'],
        ['Full-day private', 'From $79–$129', 'Families, sunrise chasers, temple completists', 'Long days, early starts'],
      ],
    },
    tipsSection: {
      title: 'Angkor Wat tour booking tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Book sunrise tours early', 'Limited passes and guides — peak season (Nov–Feb) sells out'],
        ['Wear temple-appropriate clothing', 'Shoulders and knees covered — scarves alone may not pass at gates'],
        ['Bring cash for the park pass', 'Angkor pass is separate from most tour prices — buy at the ticket office'],
        ['Start before 8 AM in peak season', 'Bayon and Ta Prohm get crowded by mid-morning'],
        ['Confirm pickup time the night before', 'Sunrise tours often leave hotels around 4:30–5:00 AM'],
      ],
    },
    stats: {
      toursAvailable: 10,
      priceFrom: 42,
      duration: '4–9 hours',
      reviewCount: 200,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Best Siem Reap Shore Excursions: Angkor Wat Tours (2026) | TopTours',
      description:
        'Compare the best Siem Reap shore excursions and Angkor Wat tours — small-group circuits from $42, private tuk-tuk tours from $45, and full-day private trips from $79.',
      keywords:
        'Siem Reap shore excursions, Angkor Wat tours, Angkor Wat private tour, Angkor Wat small group, Angkor Wat tuk tuk tour',
    },

    faqs: [
      {
        question: 'How much does an Angkor Wat tour cost in Siem Reap?',
        answer:
          'Small-group temple circuits start around $42 per person. Private tuk-tuk tours run from about $45 (price varies by group size). Full-day private tours range from $79 to $129 per group or person depending on the itinerary. The Angkor Archaeological Park pass (from $37 for one day) is usually separate.',
      },
      {
        question: 'Should I book a small group or private Angkor Wat tour?',
        answer:
          'Small groups ($42+) suit budget travelers who do not mind fixed schedules. Private tuk-tuk tours ($45+) offer flexibility and the classic Siem Reap experience. Full-day private tours ($79–$129+) are best for families, sunrise chasers, or anyone who wants a dedicated guide and vehicle all day.',
      },
      {
        question: 'How long do Angkor Wat tours take?',
        answer:
          'Most classic circuits (Angkor Wat, Bayon, Ta Prohm) take 6–9 hours including travel and lunch breaks. Half-day city-and-temple tours run about 4 hours. Remote full-day trips to Preah Vihear and Koh Ker also take roughly 8 hours of driving and sightseeing.',
      },
      {
        question: 'Do Angkor Wat tours include the temple entrance pass?',
        answer:
          'Usually not — most operators expect you to buy an Angkor pass at the ticket office on the way in (1-day from about $37, 3-day from about $62). Confirm inclusions when you book; some private tours assist with the purchase but rarely include the pass price.',
      },
      {
        question: 'What is the best Angkor Wat tour for first-time visitors?',
        answer:
          'First-timers typically want Angkor Wat, Bayon, and Ta Prohm in one day. Our top pick is the private tuk-tuk tour (5.0 from 76+ reviews, from $45). Budget travelers should consider the small-group circuit from $42; groups traveling together often get better value from a per-group full-day private tour from $95.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Angkor Wat sunrise complete guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
      },
      {
        label: 'Siem Reap airport transfers',
        href: '/destinations/siem-reap/guides/airport-transfers',
      },
      {
        label: 'All Siem Reap travel guides',
        href: '/destinations/siem-reap/guides',
      },
    ],
  };
}
