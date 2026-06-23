/**
 * Editorial guide: Siem Reap half-day tours — Angkor sunrise/sunset, floating villages & city.
 */

export const SIEM_REAP_HALF_DAY_TOURS_SLUG = 'half-day-tours';

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

export function getSiemReapHalfDayToursListingMeta() {
  return {
    category_slug: SIEM_REAP_HALF_DAY_TOURS_SLUG,
    category_name: 'Half-Day Tours',
    title: 'Best Siem Reap Half-Day Tours (2026): Angkor Sunrise, Floating Villages & City',
    subtitle:
      'Hand-picked Siem Reap half-day tours from $20 — Angkor sunrise with 270+ five-star reviews, Kampong Phluk floating villages, city culture walks, and the River Monster aquarium experience.',
    hero_image: taImage('06/6f/1d/77', '720x480'),
  };
}

export function getSiemReapHalfDayToursTopPick() {
  return tour({
    productId: '56250P19',
    title: 'Angkor Sunrise Half-Day Tour with Private Vehicles & Tour Guide',
    tagLabel: 'Top pick · Angkor sunrise',
    operatorName: 'Siem Reap Shuttle',
    imageUrl: taImage('06/6f/1d/77', '720x480'),
    durationLabel: '7 hours',
    priceFrom: 25,
    rating: 5,
    reviewCount: 272,
    bestFor:
      'Best for: Early risers who want sunrise at Angkor Wat plus the three major temples in a private A/C vehicle — Lexus SUV, minivan, or 12-seater luxury van.',
    whoFor:
      'Our highest-reviewed half-day Angkor pick — 270+ five-star reviews at a sharp price. Guide is optional ($50 extra); transport, cold towels, and iced water included.',
    details: [
      ['Operator', 'Siem Reap Shuttle'],
      ['Type', 'Private · A/C vehicle half-day'],
      ['Rating', '5.0 from 272+ reviews'],
      ['Price from', '$25'],
      ['Duration', '~7 hours (5am pickup, finish midday)'],
      ['Includes', 'Hotel pickup, A/C vehicle, cold towels & bottled water'],
      ['Note', 'Angkor Pass ($37) & guide optional; lunch not included'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'Rise at 5am for sunrise at Angkor Wat, then tour Angkor Thom and Ta Prohm in a private air-conditioned vehicle — the most-booked half-day temple experience on our list.',
  });
}

export function getSiemReapHalfDayAngkorThree() {
  return [
    tour({
      productId: '87807P23',
      title: 'Half Day Private Angkor Wat Sunset by Tuk Tuk',
      tagLabel: 'Private · Sunset tuk-tuk',
      operatorName: 'Angkor Friendly tour',
      imageUrl: taImage('06/e0/73/22'),
      durationLabel: '6 hours',
      priceFrom: 51.29,
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: A relaxed afternoon-to-evening Angkor experience — explore Angkor Wat until 5pm, then row on the ancient moat for sunset over Angkor Thom.',
      whoFor:
        'Couples and small groups who want the open-air charm of a private tuk-tuk with a licensed guide, water, and towels included.',
      details: [
        ['Operator', 'Angkor Friendly tour'],
        ['Type', 'Private · tuk-tuk sunset tour'],
        ['Rating', '5.0 from 1+ review'],
        ['Price from', '$51.29'],
        ['Duration', '~6 hours (starts 1:30pm)'],
        ['Includes', 'Tuk-tuk, licensed driver, English guide, water & towels'],
        ['Note', 'Angkor Pass not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapHalfDayFloatingVillageThree() {
  return [
    tour({
      productId: '415085P17',
      title: 'Half Day Kampong Phluk Floating Village and Flooded Forest Tour',
      tagLabel: 'Private · Boat & village',
      operatorName: 'Angkor Daily Trip',
      imageUrl: taImage('15/51/b1/f4'),
      durationLabel: '4 hours',
      priceFrom: 55,
      rating: 5,
      reviewCount: 8,
      bestFor:
        'Best for: A boat ride through Kampong Phluk’s flooded mangrove forest and stilted village on Tonle Sap Lake — surreal wet-season scenery.',
      whoFor:
        'Travelers who want lake life beyond the temples — fishing communities on tall stilts, mangrove ecosystems, and a licensed English guide with A/C transport.',
      details: [
        ['Operator', 'Angkor Daily Trip'],
        ['Type', 'Private · boat & village tour'],
        ['Rating', '5.0 from 8+ reviews'],
        ['Price from', '$55'],
        ['Duration', '4 hours'],
        ['Includes', 'Boat ride, A/C vehicle, guide, bottled water, hotel pickup'],
        ['Note', 'Lunch not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '39527P20',
      title: 'Tonle Sap Lake and Kampong Phluk Village Private Half Day Tour',
      tagLabel: 'Private · Tonle Sap',
      operatorName: 'Green Era Travel',
      imageUrl: taImage('06/6e/ec/9d'),
      durationLabel: '4 hours',
      priceFrom: 59,
      rating: 4.9,
      reviewCount: 150,
      bestFor:
        'Best for: A private morning on Tonle Sap — stilted houses, village school, pagoda on the only hill, and wetland birdlife with an expert local guide.',
      whoFor:
        'The highest-reviewed Kampong Phluk option on our list (150 reviews) — ideal for travelers who want a deeper cultural briefing on lake ecology and village life.',
      details: [
        ['Operator', 'Green Era Travel'],
        ['Type', 'Private · lake & village half-day'],
        ['Rating', '4.9 from 150+ reviews'],
        ['Price from', '$59'],
        ['Duration', '4 hours'],
        ['Includes', 'Private A/C vehicle, English guide, bottled water, hotel pickup'],
        ['Note', 'Mangrove canoe ride extra (Aug–Jan)'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapHalfDayCityCultureThree() {
  return [
    tour({
      productId: '152500P13',
      title: 'Siem Reap Half Day City Tour',
      tagLabel: 'City tour · Culture',
      operatorName: 'MyProGuide Cambodia',
      imageUrl: taImage('r/32/e7/3f/da/caption'),
      durationLabel: '4 hours',
      priceFrom: 20,
      rating: 5,
      reviewCount: 2,
      bestFor:
        'Best for: A temple-free morning or afternoon exploring Siem Reap’s Old Market, royal monuments, and local traditions with a professional guide.',
      whoFor:
        'History and culture seekers with limited time — includes round-trip transport, water, towels, and a free eSIM card for every traveler.',
      details: [
        ['Operator', 'MyProGuide Cambodia'],
        ['Type', 'Small group or private (select at booking)'],
        ['Rating', '5.0 from 2+ reviews'],
        ['Price from', '$20'],
        ['Duration', '4–5 hours'],
        ['Includes', 'Guide, transport, water & towel, free eSIM'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '5507714P3',
      title: 'Half Day River Monster Tour with Private Guide in Siem Reap',
      tagLabel: 'Private · Aquarium',
      operatorName: 'Angkor Wildlife & Aquarium',
      imageUrl: taImage('13/c3/c5/a0'),
      durationLabel: 'Half day',
      priceFrom: 30,
      rating: 5,
      reviewCount: 88,
      bestFor:
        'Best for: A break from temples — meet Mekong river giants face-to-face at Angkor Wildlife & Aquarium with behind-the-scenes access and full park entry.',
      whoFor:
        'Families and wildlife fans who watched River Monsters and want something completely different — snacks, water, round-trip transport, and a private guide included.',
      details: [
        ['Operator', 'Angkor Wildlife & Aquarium'],
        ['Type', 'Private · aquarium & river giants'],
        ['Rating', '5.0 from 88+ reviews'],
        ['Price from', '$30'],
        ['Duration', 'Half day (flexible, ~1–5 hours at park)'],
        ['Includes', 'Park entry, private guide, snacks, water, round-trip transport'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapHalfDayToursCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapHalfDayToursTopPick());
  getSiemReapHalfDayAngkorThree().forEach(add);
  getSiemReapHalfDayFloatingVillageThree().forEach(add);
  getSiemReapHalfDayCityCultureThree().forEach(add);
  return ordered;
}

export function getSiemReapHalfDayToursGuideData() {
  const listing = getSiemReapHalfDayToursListingMeta();
  const topPick = getSiemReapHalfDayToursTopPick();

  return {
    guideLayout: 'siem-reap-half-day-tours',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Half-day tours',
    toursSearchQuery: 'Siem Reap half day tour',
    heroImage: listing.hero_image,
    heroTagline: 'Angkor sunrise from $25 · floating villages from $55 · city tours from $20',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapHalfDayToursCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Angkor sunrise half-day with private A/C vehicle',
    transferSections: [
      {
        id: 'angkor-half-day',
        title: 'Best Angkor half-day sunset & temple tours',
        description:
          'Afternoon and evening Angkor experiences when you do not want a pre-dawn start — private tuk-tuk sunsets with moat rowing included.',
        tours: getSiemReapHalfDayAngkorThree(),
      },
      {
        id: 'floating-village',
        title: 'Tonle Sap & Kampong Phluk floating village half-days',
        description:
          'Boat rides through flooded mangrove forests and stilted fishing villages on Cambodia’s great lake — two highly rated private options.',
        tours: getSiemReapHalfDayFloatingVillageThree(),
      },
      {
        id: 'city-culture',
        title: 'Siem Reap city tours & beyond-the-temple experiences',
        description:
          'Temple fatigue? Explore the Old Market and royal sites, or meet river giants at Angkor Wildlife & Aquarium — both fit in a half-day window.',
        tours: getSiemReapHalfDayCityCultureThree(),
      },
    ],
    introParagraphs: [
      'Half-day tours are Siem Reap’s sweet spot — enough time for sunrise at Angkor Wat, a boat through Kampong Phluk, or a city culture walk without burning an entire day.',
      'Below are our hand-picked options with real prices, review counts, and what is included. Remember: Angkor Pass ($37) is separate on any temple tour, and floating-village boat routes vary by season.',
    ],
    comparisonSection: {
      title: 'Sunrise Angkor vs floating village vs city tour — quick comparison',
      headers: ['Option', 'Typical price', 'Best for', 'Trade-off'],
      rows: [
        ['Angkor sunrise half-day', 'From $25', 'Iconic temples at dawn', 'Early 5am pickup; pass & guide extra'],
        ['Kampong Phluk boat tour', 'From $55', 'Tonle Sap lake life & mangroves', 'Seasonal water levels affect routes'],
        ['City culture half-day', 'From $20', 'Markets, monuments, local life', 'No temples — pair with a temple day'],
        ['River Monster aquarium', 'From $30', 'Families, wildlife fans', 'Not a cultural or temple experience'],
        ['Sunset tuk-tuk Angkor', 'From $51', 'Afternoon start, moat sunset', 'Higher price; tuk-tuk not A/C minivan'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap half-day tour tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Book sunrise tours the night before', '5am hotel pickup — confirm alarm and pass purchase plan'],
        ['Buy Angkor Pass before your first temple half-day', '$37 one-day pass at the ticket office on the way to Angkor'],
        ['Check Tonle Sap water levels for floating villages', 'Wet season (May–Nov) offers the most dramatic flooded-forest scenery'],
        ['Afternoon city tours pair well with morning temples', 'Split a full Angkor day across two half-days to avoid heat exhaustion'],
        ['River Monster tour includes full AWA park access', 'Allow 2–4 hours to explore after the guided river-giants section'],
        ['Dress for temples even on half-days', 'Shoulders and knees covered — applies to sunrise and sunset Angkor tours'],
      ],
    },
    stats: {
      toursAvailable: 6,
      priceFrom: 20,
      duration: '4h – 7h',
      reviewCount: 520,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Best Siem Reap Half-Day Tours (2026): Angkor Sunrise, Kampong Phluk & City | TopTours',
      description:
        'Compare Siem Reap half-day tours from $20 — Angkor sunrise with 270+ reviews, Kampong Phluk floating villages, city culture walks, and River Monster aquarium experiences.',
      keywords:
        'Siem Reap half day tour, Angkor sunrise half day, Kampong Phluk half day tour, Siem Reap city tour, Tonle Sap floating village tour',
    },

    faqs: [
      {
        question: 'What is the best half-day tour in Siem Reap?',
        answer:
          'For temples, the Angkor Sunrise Half-Day Tour with private A/C vehicle (5.0 from 272+ reviews, from $25) is our top pick. For something different, the Tonle Sap & Kampong Phluk private tour (4.9 from 150+ reviews, from $59) is the best-rated floating-village half-day.',
      },
      {
        question: 'How much does a Siem Reap half-day tour cost?',
        answer:
          'Prices range from about $20 for a city culture half-day to $59 for a private Kampong Phluk lake tour. Angkor sunrise half-days start around $25 for transport only; sunset tuk-tuk tours run from about $51 with a guide included.',
      },
      {
        question: 'Do half-day Angkor tours include the temple pass?',
        answer:
          'No. All Angkor half-day tours require a separate Angkor Archaeological Park pass ($37 for one day). Your driver stops at the ticket office before entering the park.',
      },
      {
        question: 'Can I do Angkor Wat in a half day?',
        answer:
          'Yes. Sunrise half-day tours (from $25) cover Angkor Wat at dawn plus Angkor Thom and Ta Prohm, finishing around midday. Sunset tuk-tuk tours start at 1:30pm and end after dark on the ancient moat.',
      },
      {
        question: 'When is the best time for Kampong Phluk floating village tours?',
        answer:
          'The wet season (roughly May through November) floods the mangrove forest around Kampong Phluk, creating the iconic “trees growing from water” scenery. Dry season still offers stilted village visits but lower water levels.',
      },
      {
        question: 'What should I wear on a Siem Reap half-day tour?',
        answer:
          'Temple tours require shoulders and knees covered. Bring sunscreen, a hat, and comfortable walking shoes. For boat tours, light layers and insect repellent help. Sunrise tours mean a very early start — dress in layers for cool pre-dawn air.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Angkor Wat sunrise complete guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
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
