/**
 * Editorial guide: Siem Reap day trips — temples, culture, nature & adventure.
 */

export const SIEM_REAP_DAY_TRIPS_SLUG = 'day-trips';

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

export function getSiemReapDayTripsListingMeta() {
  return {
    category_slug: SIEM_REAP_DAY_TRIPS_SLUG,
    category_name: 'Day Trips',
    title: 'Best Siem Reap Day Trips (2026): Angkor Temples, Kulen Waterfalls & Adventures',
    subtitle:
      'Hand-picked Siem Reap day trips from $18 — sunrise Angkor tours with 13,000+ reviews, countryside bike rides, Kulen Mountain waterfalls, zip lines, and quad bikes.',
    hero_image: taImage('07/81/86/b4', '720x480'),
  };
}

export function getSiemReapDayTripsTopPick() {
  return tour({
    productId: '68746P15',
    title: 'Angkor Wat Sunrise or Sunset Tour with Guide from Siem Reap',
    tagLabel: 'Top pick · Angkor temples',
    operatorName: 'Angkor Wat Travel Tour',
    imageUrl: taImage('07/81/86/b4', '720x480'),
    durationLabel: '8 hours',
    priceFrom: 18,
    rating: 5,
    reviewCount: 13143,
    bestFor:
      'Best for: First-time visitors who want the classic Angkor Wat sunrise or sunset with an English guide, cold water, and air-conditioned transport.',
    whoFor:
      'Our highest-reviewed Siem Reap day trip — 13,000+ five-star reviews at a budget price. Small-group or private options at booking.',
    details: [
      ['Operator', 'Angkor Wat Travel Tour'],
      ['Rating', '5.0 from 13,100+ reviews'],
      ['Price from', '$18'],
      ['Duration', '8 hours'],
      ['Includes', 'English guide, cold water & towel, A/C vehicle'],
      ['Note', 'Angkor Pass ($37) not included'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'Watch sunrise or sunset at Angkor Wat with a knowledgeable guide who knows how to avoid crowds and heat — the most-booked temple day trip in Siem Reap.',
  });
}

export function getSiemReapAngkorTempleDayTripsThree() {
  return [
    tour({
      productId: '68746P15',
      title: 'Angkor Wat Sunrise or Sunset Tour with Guide from Siem Reap',
      tagLabel: 'Best value · Sunrise/sunset',
      operatorName: 'Angkor Wat Travel Tour',
      imageUrl: taImage('07/81/86/b4'),
      durationLabel: '8 hours',
      priceFrom: 18,
      rating: 5,
      reviewCount: 13143,
      bestFor:
        'Best for: The definitive Angkor day — sunrise or sunset at Angkor Wat with expert guiding and transport included.',
      whoFor: 'Budget-conscious travelers who still want a licensed guide and A/C minivan between temples.',
      details: [
        ['Rating', '5.0 from 13,100+ reviews'],
        ['Price from', '$18'],
        ['Duration', '8 hours'],
        ['Includes', 'Guide, water, towel, transport'],
      ],
    }),
    tour({
      productId: '71686P9',
      title: 'A-Day Angkor Wat Sunrise Shared Tours-Bayon, Ta Prohm-South Gate',
      tagLabel: 'Small group · Sunrise',
      operatorName: 'Local operator',
      imageUrl: taImage('12/7d/36/18'),
      durationLabel: '6 hours',
      priceFrom: 20,
      rating: 5,
      reviewCount: 29,
      bestFor:
        'Best for: A compact sunrise small-group circuit — Angkor Wat dawn, Bayon faces, and jungle Ta Prohm in one morning.',
      whoFor: 'Solo travelers and pairs who prefer shared adventure over a private tour.',
      details: [
        ['Rating', '5.0 from 29+ reviews'],
        ['Price from', '$20'],
        ['Duration', '6 hours'],
        ['Includes', 'Sunrise at Angkor Wat, Bayon, Ta Prohm, A/C minivan'],
      ],
    }),
    tour({
      productId: '31721P14',
      title: 'Banteay Srei and Grand Circuit Heritage Tour from Siem Reap',
      tagLabel: 'Grand Circuit · Banteay Srei',
      operatorName: 'Local operator',
      imageUrl: taImage('15/12/e1/df'),
      durationLabel: '8 hours',
      priceFrom: 24,
      rating: 4.9,
      reviewCount: 150,
      bestFor:
        'Best for: A second temple day — pink-sandstone Banteay Srei plus Grand Circuit sites ending with sunset over the ruins.',
      whoFor: 'Temple enthusiasts who have done the small circuit and want Preah Khan, Neak Pean, and Banteay Srei.',
      details: [
        ['Rating', '4.9 from 150+ reviews'],
        ['Price from', '$24'],
        ['Duration', '8 hours'],
        ['Includes', 'Banteay Srei, Grand Circuit temples, sunset'],
      ],
    }),
  ];
}

export function getSiemReapCultureAdventureDayTripsThree() {
  return [
    tour({
      productId: '406636P1',
      title: 'Small Group Countryside, Sunset, Siem Reap; Bike Tours & Picnic',
      tagLabel: 'Countryside · Bike & food',
      operatorName: 'Countryside Sunset Bike Tours',
      imageUrl: taImage('17/0e/24/29'),
      durationLabel: '5 hours',
      priceFrom: 18,
      rating: 5,
      reviewCount: 118,
      bestFor:
        'Best for: A non-temple day — Khmer villages, rice paddies, street-food tastings, and countryside sunset with drinks.',
      whoFor: 'Travelers who want culture and food without another Angkor ticket day.',
      details: [
        ['Rating', '5.0 from 118+ reviews'],
        ['Price from', '$18'],
        ['Duration', '5 hours'],
        ['Includes', 'Tuk-tuk transport, snacks, street food, drinks'],
      ],
    }),
    tour({
      productId: '17674P21',
      title: 'Ultimate Siem Reap Food Tour (10 Locals Tasting with Drinks & Transport)',
      tagLabel: 'Food tour · Evening',
      operatorName: 'Local operator',
      imageUrl: taImage('0e/be/d6/c6'),
      durationLabel: '2.5 hours',
      priceFrom: 29.25,
      priceNote: 'Special offer from $39',
      rating: 4.8,
      reviewCount: 110,
      bestFor:
        'Best for: Food lovers — 10 hand-picked local tastings, night market stops, and transport through Siem Reap after temple days.',
      whoFor: 'Couples and groups who want authentic Khmer street food with a local guide.',
      details: [
        ['Rating', '4.8 from 110+ reviews'],
        ['Price from', '~$29'],
        ['Duration', '2.5 hours'],
        ['Includes', '10 tastings, drinks, transport'],
      ],
    }),
    tour({
      productId: '137038P6',
      title: 'Angkor Adventure Vespa Tour / Tuk Tuk or Car',
      tagLabel: 'Vespa · Temple adventure',
      operatorName: 'Vespa Backstreet',
      imageUrl: taImage('14/f9/d3/27'),
      durationLabel: '8 hours',
      priceFrom: 31.2,
      priceNote: 'Special offer from $39',
      rating: 5,
      reviewCount: 58,
      bestFor:
        'Best for: Full-day Angkor on a Vespa (or tuk-tuk/car) — hidden trails, major temples, and historian-guided stories.',
      whoFor: 'Adventurous travelers who want open-air temple hopping with a local expert.',
      details: [
        ['Rating', '5.0 from 58+ reviews'],
        ['Price from', '~$31'],
        ['Duration', '8 hours'],
        ['Includes', 'Vespa/tuk-tuk, English guide, major Angkor sites'],
      ],
    }),
  ];
}

export function getSiemReapNatureRemoteDayTripsThree() {
  return [
    tour({
      productId: '401578P4',
      title: 'Kulen Mountain Beng Mealea and Tonle Sap Tour in Siem Reap',
      tagLabel: 'Nature · Floating village',
      operatorName: 'Local operator',
      imageUrl: taImage('12/47/8b/4b'),
      durationLabel: '10 hours',
      priceFrom: 44.1,
      priceNote: 'Special offer from $49',
      rating: 5,
      reviewCount: 35,
      bestFor:
        'Best for: A full nature day — Kulen Mountain waterfalls, jungle Beng Mealea, and a boat through Kampong Phluk floating village.',
      whoFor: 'Travelers who have seen Angkor and want waterfalls, jungle temples, and Tonle Sap life in one trip.',
      details: [
        ['Rating', '5.0 from 35+ reviews'],
        ['Price from', '~$44'],
        ['Duration', '10 hours'],
        ['Includes', 'Kulen, Beng Mealea, floating village boat'],
      ],
    }),
    tour({
      productId: '239308P11',
      title: 'Kulen Waterfall Day Tour with Snacks Small-Group',
      tagLabel: 'Kulen · Swim & hike',
      operatorName: 'Local operator',
      imageUrl: taImage('17/14/1d/6e'),
      durationLabel: '7 hours',
      priceFrom: 47,
      rating: 5,
      reviewCount: 27,
      bestFor:
        'Best for: Phnom Kulen National Park — swim at the waterfall, see the Reclining Buddha, and explore the 1000 Linga River.',
      whoFor: 'Active travelers who want a refreshing break from temple stone and midday heat.',
      details: [
        ['Rating', '5.0 from 27+ reviews'],
        ['Price from', '$47'],
        ['Duration', '7 hours'],
        ['Includes', 'Small group, light snacks, waterfall swim time'],
      ],
    }),
    tour({
      productId: '349857P4',
      title: 'Full Day Adventure to Remote temples, Koh Ker and Beng Mealea',
      tagLabel: 'Remote · Koh Ker',
      operatorName: 'Local operator',
      imageUrl: taImage('12/7d/3e/74'),
      durationLabel: '8 hours',
      priceFrom: 63,
      priceNote: 'Special offer from $70',
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: Off-the-beaten-path temple hunters — Koh Ker pyramid capital and jungle-swallowed Beng Mealea far from Angkor crowds.',
      whoFor: 'Dedicated explorers willing to drive deep into rural Cambodia for forgotten Khmer ruins.',
      details: [
        ['Type', 'Private full-day adventure'],
        ['Price from', '~$63'],
        ['Duration', '8 hours'],
        ['Includes', 'Koh Ker, Beng Mealea, rural scenery'],
      ],
    }),
  ];
}

export function getSiemReapActiveAdventureDayTripsThree() {
  return [
    tour({
      productId: '6923REPAPKC09',
      title: 'Siem Reap: Bike the Angkor Temples - Full-Day 30km Tour',
      tagLabel: 'Cycling · 30 km',
      operatorName: 'Discova Southeast Asia',
      imageUrl: taImage('07/54/65/47'),
      durationLabel: '8.5 hours',
      priceFrom: 35,
      rating: 4.9,
      reviewCount: 473,
      bestFor:
        'Best for: Active travelers who want Angkor Wat, Bayon, and Ta Prohm by bike on hidden forest trails — 30 km with vehicle support.',
      whoFor: 'Fit cyclists who prefer backroads over minivan convoys — 473 five-star reviews.',
      details: [
        ['Rating', '4.9 from 473+ reviews'],
        ['Price from', '$35'],
        ['Duration', '8.5 hours'],
        ['Includes', 'Bike, helmet, guide, snacks & water'],
        ['Note', 'Angkor Pass separate; lunch optional'],
      ],
    }),
    tour({
      productId: '47138P1',
      title: 'Angkor Wat Park Zip Line Adventure in Siem Reap',
      tagLabel: 'Zip line · Jungle',
      operatorName: 'Angkor Zipline',
      imageUrl: taImage('07/72/42/2f'),
      durationLabel: '3 hours',
      priceFrom: 53.9,
      rating: 4.9,
      reviewCount: 612,
      bestFor:
        'Best for: Adrenaline between temple days — 10 ziplines through the jungle canopy inside Angkor Archaeological Park.',
      whoFor: 'Families and thrill-seekers who want a unique perspective on the park (612 reviews, 4.9 stars).',
      details: [
        ['Rating', '4.9 from 612+ reviews'],
        ['Price from', '~$54'],
        ['Duration', '3 hours'],
        ['Includes', '10 ziplines, 21 platforms, 2 guides'],
      ],
    }),
    tour({
      productId: '457151P1',
      title: '1 Hour Private Sunset Quad Bike Tour in Siem Reap',
      tagLabel: 'Quad bike · Sunset',
      operatorName: 'Siem Reap Quad Bike Adventure ATV Tours',
      imageUrl: taImage('12/4e/f5/36'),
      durationLabel: '1 hour',
      priceFrom: 33,
      rating: 5,
      reviewCount: 16,
      bestFor:
        'Best for: A short adrenaline hit — ride through rice paddies and countryside tracks at golden hour, no license required.',
      whoFor: 'Travelers with limited time who want an outdoor adventure without a full-day commitment.',
      details: [
        ['Rating', '5.0 from 16+ reviews'],
        ['Price from', '$33'],
        ['Duration', '1 hour'],
        ['Includes', 'Hotel pickup, quad bike, guide'],
      ],
    }),
  ];
}

export function getSiemReapDayTripsCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapDayTripsTopPick());
  getSiemReapAngkorTempleDayTripsThree().forEach(add);
  getSiemReapCultureAdventureDayTripsThree().forEach(add);
  getSiemReapNatureRemoteDayTripsThree().forEach(add);
  getSiemReapActiveAdventureDayTripsThree().forEach(add);
  return ordered;
}

export function getSiemReapDayTripsGuideData() {
  const listing = getSiemReapDayTripsListingMeta();
  const topPick = getSiemReapDayTripsTopPick();

  return {
    guideLayout: 'siem-reap-day-trips',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Day trips',
    toursSearchQuery: 'Siem Reap adventure day trip',
    heroImage: listing.hero_image,
    heroTagline: 'Angkor sunrise from $18 · Kulen waterfalls from $44 · zip lines & quad bikes',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapDayTripsCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Angkor Wat sunrise or sunset tour with guide',
    transferSections: [
      {
        id: 'angkor-temples',
        title: 'Best Angkor temple day trips from Siem Reap',
        description:
          'Sunrise at Angkor Wat, shared small-group circuits, and Grand Circuit days with Banteay Srei — from $18 with thousands of verified reviews.',
        tours: getSiemReapAngkorTempleDayTripsThree(),
      },
      {
        id: 'culture-adventure',
        title: 'Best culture & countryside day trips',
        description:
          'Break from the temples with countryside bike rides, a 10-stop food tour, or a full-day Vespa adventure through Angkor.',
        tours: getSiemReapCultureAdventureDayTripsThree(),
      },
      {
        id: 'nature-remote',
        title: 'Best nature & remote temple day trips',
        description:
          'Kulen Mountain waterfalls, floating villages on Tonle Sap, and remote Koh Ker — full days beyond the Angkor Archaeological Park.',
        tours: getSiemReapNatureRemoteDayTripsThree(),
      },
      {
        id: 'active-adventure',
        title: 'Best active adventure day trips',
        description:
          'Cycle 30 km through Angkor, zip-line through the jungle canopy, or blast through rice fields on a sunset quad bike.',
        tours: getSiemReapActiveAdventureDayTripsThree(),
      },
    ],
    introParagraphs: [
      'Siem Reap day trips split into four worlds: classic Angkor temple circuits, culture and food beyond the ruins, nature escapes to Kulen and Tonle Sap, and active adventures on bikes, zip lines, and quad bikes.',
      'These picks come from our adventure tour search — ranked by reviews, value, and what is actually included. Almost all temple tours require a separate Angkor Pass ($37 for one day).',
    ],
    comparisonSection: {
      title: 'Which Siem Reap day trip is right for you?',
      headers: ['Day trip type', 'Typical price', 'Duration', 'Best for'],
      rows: [
        ['Angkor sunrise/sunset tour', 'From $18', '6–8 hours', 'First-time visitors, classic temples'],
        ['Countryside bike or food tour', 'From $18–$29', '2.5–5 hours', 'Culture, food, no Angkor Pass needed'],
        ['Kulen / remote temples', 'From $44–$63', '7–10 hours', 'Waterfalls, jungle ruins, floating villages'],
        ['Active adventure', 'From $33–$54', '1–8.5 hours', 'Cycling, zip lines, quad bikes'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap day trip planning tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Buy your Angkor Pass online or at the ticket office', '$37 (1-day) required for any temple tour — rarely included in the price'],
        ['Book sunrise tours the night before', 'Popular dates fill up; confirm pickup time (often 4:30–5:00 AM)'],
        ['Plan two temple days max back-to-back', 'Heat and walking add up — mix in countryside or Kulen between Angkor days'],
        ['Kulen Mountain is 50 km north', 'Allow a full day; bring swimwear for waterfall stops'],
        ['Quad and zip-line tours need closed-toe shoes', 'Sandals are not allowed on ziplines; long pants help on quad bikes'],
        ['Check what meals are included', 'Full-day remote tours may not include lunch — budget $5–$10 extra'],
      ],
    },
    stats: {
      toursAvailable: 12,
      priceFrom: 18,
      duration: '1h – 10h',
      reviewCount: 15000,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Best Siem Reap Day Trips (2026): Angkor, Kulen Waterfalls & Adventures | TopTours',
      description:
        'Compare the best Siem Reap day trips from $18 — Angkor sunrise tours (13,000+ reviews), countryside bike rides, Kulen waterfalls, zip lines, and quad bikes.',
      keywords:
        'Siem Reap day trips, Angkor Wat day tour, Kulen Mountain day trip, Siem Reap adventure tours, Banteay Srei tour',
    },

    faqs: [
      {
        question: 'What is the best day trip from Siem Reap for first-time visitors?',
        answer:
          'The Angkor Wat Sunrise or Sunset Tour with Guide (5.0 from 13,000+ reviews, from $18) is the clear winner for first-timers. It covers the main temples with transport and an English guide — you only need to buy the Angkor Pass ($37) separately.',
      },
      {
        question: 'How much does a Siem Reap day trip cost?',
        answer:
          'Budget temple day trips start around $18–$24. Countryside bike and food tours run $18–$30. Nature trips to Kulen Mountain or Beng Mealea cost $44–$63. Active adventures like zip lines ($54) and temple cycling ($35) sit in the middle.',
      },
      {
        question: 'Is the Angkor Pass included in day trip prices?',
        answer:
          'Almost never. The 1-day Angkor Pass costs $37 and must be purchased separately for any tour entering the archaeological park. Your guide or driver will stop at the ticket office on the way in.',
      },
      {
        question: 'What are the best day trips besides Angkor Wat?',
        answer:
          'Popular alternatives include the countryside sunset bike tour ($18), Kulen Waterfall day trip ($47), Kulen + Beng Mealea + Tonle Sap combo ($44), and the 30 km Angkor temple cycling tour ($35). Food lovers should try the Ultimate Siem Reap Food Tour (~$29).',
      },
      {
        question: 'Can I do Kulen Mountain and Angkor Wat in one day?',
        answer:
          'Not realistically — Kulen is 50 km north and needs 7–10 hours. Plan Kulen or remote temple days (Koh Ker, Beng Mealea) as separate trips from your Angkor small-circuit days.',
      },
      {
        question: 'What should I wear on a Siem Reap day trip?',
        answer:
          'For temples: shoulders and knees covered, comfortable walking shoes, hat, and sunscreen. For Kulen waterfalls: bring swimwear and a towel. For zip lines and quad bikes: closed-toe shoes required.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Siem Reap hidden costs & Angkor Pass fees',
        href: '/destinations/siem-reap/guides/additional-fees',
      },
      {
        label: 'Best Angkor Wat shore excursions',
        href: '/destinations/siem-reap/guides/shore-excursions',
      },
      {
        label: 'Siem Reap bike tours & rentals',
        href: '/destinations/siem-reap/guides/bike-tours',
      },
      {
        label: 'Angkor Wat sunrise complete guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
      },
      {
        label: 'All Siem Reap travel guides',
        href: '/destinations/siem-reap/guides',
      },
    ],
  };
}
