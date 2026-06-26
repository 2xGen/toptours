/**
 * Editorial guide: Siem Reap multi-day tours — 2 to 6-day Angkor circuits & Cambodia overland trips.
 */

export const SIEM_REAP_MULTI_DAY_TOURS_SLUG = 'multi-day-tours';

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

export function getSiemReapMultiDayToursListingMeta() {
  return {
    category_slug: SIEM_REAP_MULTI_DAY_TOURS_SLUG,
    category_name: 'Multi-Day Tours',
    title: 'Best Siem Reap Multi-Day Tours (2026): 2–6 Day Angkor Circuits & Cambodia Overland',
    subtitle:
      'Hand-picked Siem Reap multi-day tours from $49 — 2-day sunrise & sunset Angkor circuits with 2,700+ reviews, 3-day Kulen & floating-village combos, and 4–6 day trips to Koh Ker and Phnom Penh.',
    hero_image: taImage('11/8a/3c/9a', '720x480'),
  };
}

export function getSiemReapMultiDayToursTopPick() {
  return tour({
    productId: '31721P16',
    title: 'Angkor 2-Day Sunset & Sunrise Small-Group Tour',
    tagLabel: 'Top pick · Best value 2-day',
    operatorName: 'Journey Cambodia',
    imageUrl: taImage('11/8a/3c/9a', '720x480'),
    durationLabel: '2 days',
    priceFrom: 49,
    rating: 5,
    reviewCount: 2727,
    bestFor:
      'Best for: Travelers who want the classic Angkor arc — sunset on day one, sunrise over Angkor Wat on day two, plus Bayon, Ta Prohm, and Banteay Srei — in a small group from $49.',
    whoFor:
      'Our highest-reviewed 2-day Angkor pick on this list (2,700+ five-star reviews). Ideal for solo travelers and couples who want a guided circuit without private-tour pricing.',
    details: [
      ['Operator', 'Journey Cambodia'],
      ['Type', 'Small group · 2-day temple circuit'],
      ['Rating', '5.0 from 2,727+ reviews'],
      ['Price from', '$49'],
      ['Duration', '48 hours (2 days)'],
      ['Includes', 'A/C transport, guide, hotel pickup, water & towels'],
      ['Note', 'Angkor pass (~$62 for 2–3 days) paid on site; meals extra'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'The most-booked 2-day Angkor experience on our list — watch sunset on day one and return for sunrise at Angkor Wat, with Angkor Thom, Ta Prohm, and the pink sandstone of Banteay Srei woven in between.',
  });
}

export function getSiemReapMultiDayTwoDayThree() {
  return [
    tour({
      productId: '118579P43',
      title: 'Siem Reap Tourist Attractions 2 Day Angkor Wat Shared Tour',
      tagLabel: 'Shared · All-inclusive',
      operatorName: 'Asean Angkor Guide',
      imageUrl: taImage('16/6e/ca/ae'),
      durationLabel: '2 days',
      priceFrom: 88,
      rating: 5,
      reviewCount: 7,
      bestFor:
        'Best for: Maximum coverage in 48 hours — sunrise Angkor, Kulen waterfalls, Beng Mealea, and Kampong Phluk with admission tickets, breakfast, and picnic lunch included.',
      whoFor:
        'Packagers who want temples, jungle ruins, sacred mountain, and floating village in one shared itinerary without piecing passes and transport together.',
      details: [
        ['Operator', 'Asean Angkor Guide'],
        ['Type', 'Shared · comprehensive 2-day'],
        ['Rating', '5.0 from 7+ reviews'],
        ['Price from', '$88'],
        ['Duration', '48 hours'],
        ['Includes', 'All admission tickets, breakfast, picnic lunch, guide & transport'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '184072P46',
      title: '2-Day Angkor Wat Sunrise & Sunset - Private Guide',
      tagLabel: 'Private · Sunrise & sunset',
      operatorName: 'Angkor Pro Travel',
      imageUrl: taImage('16/bc/a7/c5'),
      durationLabel: '2 days',
      priceFrom: 80,
      rating: 5,
      reviewCount: 2,
      bestFor:
        'Best for: A private 2-day temple deep-dive — sunset day one, sunrise at Angkor Wat day two, plus Angkor Thom and Banteay Srei with tuk-tuk and A/C transport mix.',
      whoFor:
        'Couples and families who want a licensed private guide and flexible pacing without paying for a full luxury minivan both days.',
      details: [
        ['Operator', 'Angkor Pro Travel'],
        ['Type', 'Private · 2-day guide & transport'],
        ['Rating', '5.0 from 2+ reviews'],
        ['Price from', '$80'],
        ['Duration', '48 hours'],
        ['Includes', 'Licensed guide, A/C vehicle & tuk-tuk, hotel pickup'],
        ['Note', 'Angkor pass not included'],
        ['Cancellation', 'Non-refundable'],
      ],
    }),
    tour({
      productId: '157703P2',
      title: '2-Day Private Angkor Wat, Floating Village & Countryside Tour',
      tagLabel: 'Private · Temples & lake',
      operatorName: 'Angkor Visitor',
      imageUrl: taImage('07/98/98/f4'),
      durationLabel: '2 days',
      priceFrom: 235,
      rating: 5,
      reviewCount: 121,
      bestFor:
        'Best for: Angkor temples plus Kampong Phluk floating village and countryside villages — the highest-reviewed private 2-day combo on our list.',
      whoFor:
        'Travelers who want temples on one day and Tonle Sap lake life the next, with SUV or minivan transport and 121 five-star reviews backing the operator.',
      details: [
        ['Operator', 'Angkor Visitor'],
        ['Type', 'Private · temples & floating village'],
        ['Rating', '5.0 from 121+ reviews'],
        ['Price from', '$235'],
        ['Duration', '48 hours'],
        ['Includes', 'English guide, A/C SUV or minivan, water & towels'],
        ['Note', 'Temple passes, boat fees & meals extra'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapMultiDayTwoDayMoreThree() {
  return [
    tour({
      productId: '74464P7',
      title: 'Private Tour Angkor Wat 2 Days - Banteay Srey - National Park Phnom Kulen (55Km)',
      tagLabel: 'Private · Kulen & Banteay Srei',
      operatorName: 'Angkor Wat Private Day Tours',
      imageUrl: taImage('10/3f/8b/9d'),
      durationLabel: '2 days',
      priceFrom: 271,
      rating: 5,
      reviewCount: 8,
      bestFor:
        'Best for: A fully flexible private 2-day plan — must-see temples plus Phnom Kulen National Park and Banteay Srei, adjusted to your pace on arrival.',
      whoFor:
        'Repeat visitors and temple completists who want a Lexus or Mercedes minivan, licensed guide, and itinerary tweaked after you discuss preferences.',
      details: [
        ['Operator', 'Angkor Wat Private Day Tours'],
        ['Type', 'Private · Lexus / Mercedes minivan'],
        ['Rating', '5.0 from 8+ reviews'],
        ['Price from', '$271'],
        ['Duration', '48 hours'],
        ['Includes', 'Licensed guide, driver, water & cold towels'],
        ['Note', 'Temple pass, Kulen ticket, boat & meals extra'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '264753P5',
      title: 'Siem Reap in Focus: 2 Days of Iconic Sights and Culture',
      tagLabel: 'Private · Culture & village',
      operatorName: 'Join Me Cambodia',
      imageUrl: taImage('0a/d6/bb/a8'),
      durationLabel: '2 days',
      priceFrom: 117.3,
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: Balancing temples with culture — floating village and Artisans d’Angkor workshop one day, Angkor Wat sunrise the next (days can be swapped).',
      whoFor:
        'Travelers who want more than stone temples — live craft workshops, stilted village boat rides, and a flexible 2-day split.',
      details: [
        ['Operator', 'Join Me Cambodia'],
        ['Type', 'Private · culture & temples'],
        ['Rating', '5.0 from 1+ review'],
        ['Price from', '$117.30'],
        ['Duration', '48 hours'],
        ['Includes', 'Guide, A/C vehicle, boat & village entry, water & towels'],
        ['Note', 'Angkor pass, accommodation & meals extra'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '39527P29',
      title: '2-Day Best of Angkor Wat and Tonle Sap Lake Tour',
      tagLabel: 'Private · Angkor & Tonle Sap',
      operatorName: 'Green Era Travel',
      imageUrl: taImage('06/71/4e/ef'),
      durationLabel: '2 days',
      priceFrom: 99,
      rating: 4.9,
      reviewCount: 31,
      bestFor:
        'Best for: Day one at Angkor Wat, Angkor Thom, Bayon, and Ta Prohm — day two on Tonle Sap Lake at Kampong Phluk, plus Artisans Angkor and Old Market time.',
      whoFor:
        'The strongest-reviewed Green Era 2-day combo (31 reviews) — temples and lake village in one private itinerary without the higher price of all-inclusive remote-temple packages.',
      details: [
        ['Operator', 'Green Era Travel'],
        ['Type', 'Private · temples & lake'],
        ['Rating', '4.9 from 31+ reviews'],
        ['Price from', '$99'],
        ['Duration', '48 hours'],
        ['Includes', 'Private A/C vehicle, guide, Tonle Sap boat trip, water, hotel pickup'],
        ['Note', 'Angkor pass (~$37–62) & meals extra'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapMultiDayThreeDayThree() {
  return [
    tour({
      productId: '118579P2',
      title: '3-Days Discovery Of Angkor: Waterfalls, Floating Village and Banteay Srei temple',
      tagLabel: 'Private · Best 3-day value',
      operatorName: 'Asean Angkor Guide',
      imageUrl: taImage('07/02/2c/43'),
      durationLabel: '3 days',
      priceFrom: 183.08,
      rating: 5,
      reviewCount: 215,
      bestFor:
        'Best for: The most-reviewed 3-day pick — Angkor sunrise, Kulen Mountain waterfalls, Kampong Phluk floating village, and Banteay Srei at a sharp private price.',
      whoFor:
        'Travelers with three days who want temples, jungle waterfall, and lake village without rushing — 215 five-star reviews and village breakfast on day three.',
      details: [
        ['Operator', 'Asean Angkor Guide'],
        ['Type', 'Private · 3-day discovery'],
        ['Rating', '5.0 from 215+ reviews'],
        ['Price from', '$183.08'],
        ['Duration', '72 hours'],
        ['Includes', 'Private A/C transport, guide, water & towels, breakfast day 3'],
        ['Note', 'Kulen pass, Tonle Sap boat & meals extra; best Aug–Jan for water levels'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '74464P8',
      title: 'Private Tour Angkor Wat 3 Days - Banteay Srey - National Park Phnom Kulen (55Km)',
      tagLabel: 'Private · Flexible 3-day',
      operatorName: 'Angkor Wat Private Day Tours',
      imageUrl: taImage('10/3f/8b/90'),
      durationLabel: '3 days',
      priceFrom: 344,
      rating: 5,
      reviewCount: 7,
      bestFor:
        'Best for: A structured but self-paced 3-day private circuit — temples, Banteay Srei, Phnom Kulen, and Siem Reap highlights on your own schedule.',
      whoFor:
        'Groups who plan to buy a 3-day Angkor pass and want premium Lexus or Mercedes transport with a guide who adjusts daily based on energy and interests.',
      details: [
        ['Operator', 'Angkor Wat Private Day Tours'],
        ['Type', 'Private · 3-day custom pace'],
        ['Rating', '5.0 from 7+ reviews'],
        ['Price from', '$344'],
        ['Duration', '72 hours'],
        ['Includes', 'Licensed guide, driver, water & towels'],
        ['Note', '3-day temple pass, Kulen ticket, Banteay Srei fee & meals extra'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '206973P10',
      title: '3 Day Angkor Angkor Wat Avoid Crowded and Tour Guide',
      tagLabel: 'Private · Uncrowded temples',
      operatorName: 'Angkor Wat Cambodia Tour',
      imageUrl: taImage('09/7a/73/55'),
      durationLabel: '3 days',
      priceFrom: 150,
      rating: 5,
      reviewCount: 3,
      bestFor:
        'Best for: Temple lovers who want quieter routes and a dedicated English guide across three full Angkor days without joining a big bus group.',
      whoFor:
        'Photographers and slow travelers who prefer off-peak timing and a guide focused on avoiding the worst crowds at major gates.',
      details: [
        ['Operator', 'Angkor Wat Cambodia Tour'],
        ['Type', 'Private · 3-day Angkor focus'],
        ['Rating', '5.0 from 3+ reviews'],
        ['Price from', '$150'],
        ['Duration', '72 hours'],
        ['Includes', 'Professional English guide, A/C vehicle'],
        ['Note', 'Angkor pass (~$62) extra; non-refundable'],
        ['Cancellation', 'All sales final'],
      ],
    }),
  ];
}

export function getSiemReapMultiDayExtendedThree() {
  return [
    tour({
      productId: '118579P1',
      title: '4-Day Excursion of Angkor, Koh Ker, Beng Mealea, Tonle Sap and Waterfalls',
      tagLabel: '4-day · Remote temples',
      operatorName: 'Asean Angkor Guide',
      imageUrl: taImage('0a/5c/99/32'),
      durationLabel: '4 days',
      priceFrom: 249,
      rating: 5,
      reviewCount: 87,
      bestFor:
        'Best for: Four days beyond the main circuit — Koh Ker, Beng Mealea jungle temple, Kulen waterfalls, Tonle Sap floating village, and the classic Angkor highlights.',
      whoFor:
        'Adventurous travelers with four days who want lost-city ruins and waterfall birthplaces of the Angkor Empire, not just the crowded core temples.',
      details: [
        ['Operator', 'Asean Angkor Guide'],
        ['Type', 'Private · 4-day excursion'],
        ['Rating', '5.0 from 87+ reviews'],
        ['Price from', '$249'],
        ['Duration', '96 hours'],
        ['Includes', 'Private A/C SUV/minivan, guide, water & towels, local breakfast day 4'],
        ['Note', 'Separate passes for Angkor, Koh Ker, Kulen, Beng Mealea & boat (~$50+ total)'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '103195P23',
      title: 'Cambodia 5 Days Tour from Siem Reap to Phnom Penh',
      tagLabel: '5-day · Siem Reap to capital',
      operatorName: 'About Cambodia Travel & Tours',
      imageUrl: taImage('r/33/06/cc/81/caption'),
      durationLabel: '5 days',
      priceFrom: 587,
      rating: 5,
      reviewCount: 20,
      bestFor:
        'Best for: Angkor’s greatest hits plus Phnom Penh’s Royal Palace, Silver Pagoda, and Tuol Sleng — hotels and daily breakfast included.',
      whoFor:
        'First-time Cambodia visitors who want both ancient temples and modern history with 3–5 star hotel options and a single private guide throughout.',
      details: [
        ['Operator', 'About Cambodia Travel & Tours'],
        ['Type', 'Private · 5-day overland'],
        ['Rating', '5.0 from 20+ reviews'],
        ['Price from', '$587'],
        ['Duration', '120 hours (5 days)'],
        ['Includes', 'Hotels with breakfast, guide, transport, entrance fees, water'],
        ['Note', 'Tips extra; cancel 6+ days ahead for full refund'],
        ['Cancellation', 'Tiered refund policy'],
      ],
    }),
    tour({
      productId: '103195P6',
      title: 'Cambodia Highlight 6 Days Tour from Siem Reap to Phnom Penh',
      tagLabel: '6-day · Full Cambodia arc',
      operatorName: 'About Cambodia Travel & Tours',
      imageUrl: taImage('15/d1/15/00'),
      durationLabel: '6 days',
      priceFrom: 725,
      rating: 5,
      reviewCount: 43,
      bestFor:
        'Best for: The deepest single booking on our list — three nights Siem Reap, overland to Phnom Penh, two nights capital, sunrise & sunset Angkor, and killing fields context.',
      whoFor:
        'Travelers with a full week who want UNESCO Angkor, countryside transfer, and Phnom Penh’s royal and memorial sites without organizing hotels and drivers separately.',
      details: [
        ['Operator', 'About Cambodia Travel & Tours'],
        ['Type', 'Private · 6-day highlight tour'],
        ['Rating', '5.0 from 43+ reviews'],
        ['Price from', '$725'],
        ['Duration', '144 hours (6 days)'],
        ['Includes', '3★–5★ hotels, breakfast, guide, transport, entrance fees'],
        ['Note', 'Tips extra; single room +40%'],
        ['Cancellation', 'Tiered refund policy'],
      ],
    }),
  ];
}

export function getSiemReapMultiDayToursCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapMultiDayToursTopPick());
  getSiemReapMultiDayTwoDayThree().forEach(add);
  getSiemReapMultiDayTwoDayMoreThree().forEach(add);
  getSiemReapMultiDayThreeDayThree().forEach(add);
  getSiemReapMultiDayExtendedThree().forEach(add);
  return ordered;
}

export function getSiemReapMultiDayToursGuideData() {
  const listing = getSiemReapMultiDayToursListingMeta();
  const topPick = getSiemReapMultiDayToursTopPick();

  return {
    guideLayout: 'siem-reap-multi-day-tours',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Multi-day tours',
    toursSearchQuery: 'Siem Reap multi day tour Angkor',
    heroImage: listing.hero_image,
    heroTagline: '2-day Angkor from $49 · 3-day discovery from $150 · 6-day Siem Reap to Phnom Penh from $725',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapMultiDayToursCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: 2-day Angkor sunset & sunrise small-group tour',
    transferSections: [
      {
        id: 'two-day-best',
        title: 'Best 2-day Siem Reap & Angkor tours',
        description:
          'Forty-eight hours to cover sunrise, sunset, floating villages, or all-inclusive shared circuits — our top 2-day picks from $80 to $235.',
        tours: getSiemReapMultiDayTwoDayThree(),
      },
      {
        id: 'two-day-private',
        title: 'More 2-day private & culture options',
        description:
          'Flexible private minivans to Phnom Kulen, Banteay Srei, Tonle Sap, and artisan villages — three picks from $99 to $271.',
        tours: getSiemReapMultiDayTwoDayMoreThree(),
      },
      {
        id: 'three-day',
        title: 'Best 3-day Angkor & beyond itineraries',
        description:
          'Add Kulen waterfalls, Kampong Phluk, and quieter temple routes — three highly rated private options from $150 to $344.',
        tours: getSiemReapMultiDayThreeDayThree(),
      },
      {
        id: 'extended',
        title: '4 to 6-day Cambodia excursions',
        description:
          'Remote Koh Ker and Beng Mealea, or full overland journeys to Phnom Penh with hotels included — for travelers with four days or more.',
        tours: getSiemReapMultiDayExtendedThree(),
      },
    ],
    introParagraphs: [
      'Multi-day tours let you see Angkor without the rush of a single sunrise dash — sunset on day one, Ta Prohm and Banteay Srei on day two, or Kulen waterfalls and floating villages when you stretch to three or four days.',
      'Below are our hand-picked 2 to 6-day options with real prices and review counts. Remember: most temple tours require a separate Angkor pass ($37 one-day, $62 two- or three-day), and remote sites like Koh Ker and Kulen have their own entrance fees.',
    ],
    comparisonSection: {
      title: '2-day vs 3-day vs 4–6 day — quick comparison',
      headers: ['Duration', 'Typical price', 'Best for', 'Trade-off'],
      rows: [
        ['2-day Angkor circuit', 'From $49', 'Sunrise + sunset + main temples', 'Angkor pass extra; packed schedule'],
        ['3-day discovery', 'From $150', 'Kulen, floating village, Banteay Srei', 'More driving; seasonal water levels'],
        ['4-day remote temples', 'From $249', 'Koh Ker, Beng Mealea, Kulen', 'Multiple site passes (~$50+ on top)'],
        ['5–6 day overland', 'From $587', 'Angkor + Phnom Penh with hotels', 'Higher cost; long transfer days'],
        ['All-inclusive shared 2-day', 'From $88', 'Tickets + meals bundled', 'Less flexibility than private'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap multi-day tour tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Buy the right Angkor pass length upfront', '$62 for 2–3 days saves vs stacking one-day passes'],
        ['Book Kulen & floating village tours in wet season', 'Aug–Jan offers the best waterfall and flooded-forest scenery'],
        ['Confirm what passes are included', 'Remote 4-day tours often list Angkor, Koh Ker, Kulen & boat fees separately'],
        ['Pack light day bags for temple days', 'You will walk 8–12 km across multi-day circuits'],
        ['5–6 day tours include hotels but not all lunches', 'Budget $10–15 per person per meal outside inclusions'],
        ['Check cancellation rules on private tours', 'Some 2-day privates are non-refundable once booked'],
      ],
    },
    stats: {
      toursAvailable: 13,
      priceFrom: 49,
      duration: '2–6 days',
      reviewCount: 3271,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Best Siem Reap Multi-Day Tours (2026): 2–6 Day Angkor & Cambodia | TopTours',
      description:
        'Compare Siem Reap multi-day tours from $49 — 2-day Angkor sunrise circuits with 2,700+ reviews, 3-day Kulen & floating village trips, and 6-day Siem Reap to Phnom Penh packages.',
      keywords:
        'Siem Reap multi day tour, 2 day Angkor tour, 3 day Angkor itinerary, Siem Reap to Phnom Penh tour, Koh Ker Beng Mealea tour',
    },

    faqs: [
      {
        question: 'What is the best multi-day tour in Siem Reap?',
        answer:
          'For value and reviews, the Angkor 2-Day Sunset & Sunrise Small-Group Tour (5.0 from 2,727+ reviews, from $49) is our top pick. For maximum sights in 48 hours with tickets included, the Siem Reap Tourist Attractions 2-Day Shared Tour (from $88) covers Kulen, Beng Mealea, and Kampong Phluk.',
      },
      {
        question: 'How much does a 2-day Angkor tour cost?',
        answer:
          'Small-group 2-day circuits start around $49. Private guided options run from about $80 to $271 depending on vehicle type and whether Kulen or floating villages are included. Angkor passes are usually extra ($62 for a 2–3 day pass).',
      },
      {
        question: 'Do I need a multi-day Angkor pass?',
        answer:
          'Yes for any tour spanning more than one temple day. A 2-day pass costs $62 and covers 2–3 consecutive days. Your guide or driver typically stops at the ticket office before your first temple entry.',
      },
      {
        question: 'What is the best 3-day itinerary for Siem Reap?',
        answer:
          'The 3-Days Discovery tour (5.0 from 215+ reviews, from $183) balances Angkor sunrise, Kulen waterfalls, Kampong Phluk floating village, and Banteay Srei. Private flexible options from Angkor Wat Private Day Tours start around $344 with premium vehicles.',
      },
      {
        question: 'Can I do Siem Reap and Phnom Penh in one tour?',
        answer:
          'Yes. The 5-day tour (from $587) and 6-day Cambodia Highlight tour (from $725) include hotels, breakfast, transport, and guided visits to both Angkor and Phnom Penh’s Royal Palace, museums, and memorial sites.',
      },
      {
        question: 'When is the best time for Kulen and floating village multi-day tours?',
        answer:
          'The wet season (roughly May through November, peak Aug–January) floods Kampong Phluk’s mangrove forest and fills Kulen’s waterfalls. Dry season still works but water levels are lower and boat routes may differ.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Siem Reap half-day tours',
        href: '/destinations/siem-reap/guides/half-day-tours',
      },
      {
        label: 'Siem Reap day trips',
        href: '/destinations/siem-reap/guides/day-trips',
      },
      {
        label: 'Best Angkor Wat tours (shore excursions)',
        href: '/destinations/siem-reap/guides/shore-excursions',
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
