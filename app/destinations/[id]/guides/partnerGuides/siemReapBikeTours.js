/**
 * Editorial guide: Siem Reap bike rentals, guided rides, motorbike & tuk-tuk tours.
 */

export const SIEM_REAP_BIKE_TOURS_SLUG = 'bike-tours';

const AFF = '?mcid=42383&pid=P00276441&medium=api&api_version=2.0';

function taImage(path, size = '540x360') {
  return `https://media-cdn.tripadvisor.com/media/attractions-splice-spp-${size}/${path}`;
}

function tour(partial) {
  return {
    ...partial,
    viatorBookingUrl:
      partial.viatorBookingUrl ||
      `https://www.viator.com/tours/Siem-Reap/t/d5480-${partial.productId}${AFF}`,
  };
}

export function getSiemReapBikeToursListingMeta() {
  return {
    category_slug: SIEM_REAP_BIKE_TOURS_SLUG,
    category_name: 'Bike Tours',
    title: 'Siem Reap Bike Tours & Rentals: Countryside Rides, E-Bikes & Tuk-Tuk Temple Days',
    subtitle:
      'Rent a Giant city bike from $5/day, join a 5.0-rated countryside sunset ride from $18, or explore Angkor by tuk-tuk from $15 — hand-picked two-wheel and tuk-tuk options in Siem Reap.',
    hero_image: taImage('17/0e/24/29.jpg', '720x480'),
  };
}

export function getSiemReapBikeToursTopPick() {
  return tour({
    productId: '406636P1',
    title: 'Small Group Countryside, Sunset, Siem Reap; Bike Tours & Picnic',
    tagLabel: 'Top pick · Guided bike tour',
    operatorName: 'Countryside Sunset Bike Tours',
    imageUrl: taImage('17/0e/24/29.jpg', '720x480'),
    durationLabel: '5 hours',
    priceFrom: 18,
    rating: 5,
    reviewCount: 118,
    bestFor:
      'Best for: Travelers who want rice paddies, village life, street-food tastings, and a countryside sunset — all on two wheels with transport included.',
    whoFor:
      'Our highest-reviewed guided bike experience in Siem Reap — ideal for couples and small groups who want culture, food, and golden-hour views without planning logistics.',
    details: [
      ['Operator', 'Countryside Sunset Bike Tours'],
      ['Type', 'Small-group guided ride'],
      ['Rating', '5.0 from 118+ reviews'],
      ['Price from', '$18'],
      ['Duration', '5 hours'],
      ['Includes', 'Tuk-tuk to/from ride, drinks, snacks, street food tasting'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'Hotel pickup by tuk-tuk, then pedal through Khmer villages and rice fields, sample local street food, and finish with a cold drink at sunset over the fields.',
  });
}

export function getSiemReapBikeRentalsThree() {
  return [
    tour({
      productId: '47164P15',
      title: 'Classic Rental Bike in Siem Reap City Bike, Giant, Titanium',
      tagLabel: 'Rental · Best budget',
      operatorName: 'Aing Kimsan Bicycle Shop and Rental',
      imageUrl: taImage('r/32/d2/7f/ab/caption.jpg'),
      durationLabel: '24 hours',
      priceFrom: 5,
      rating: null,
      reviewCount: null,
      bestFor:
        'Best for: Independent riders who want a quality Giant, Trek, or Scott city bike to explore temple paths and quiet roads at your own pace.',
      whoFor: 'Solo travelers and couples on a tight budget — helmet and lock included, local team helps with fit and route tips.',
      details: [
        ['Operator', 'Aing Kimsan Bicycle Shop and Rental'],
        ['Type', 'Self-guided rental · 24h'],
        ['Price from', '$5'],
        ['Includes', 'Helmet, bike lock'],
        ['Brands', 'Giant, Trek, Scott, titanium gravel options'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '47164P1',
      title: 'Premium Rental E-Bike in Siem Reap: E-MTB Giant',
      tagLabel: 'Rental · E-bike',
      operatorName: 'Aing Kimsan Bicycle Shop and Rental',
      imageUrl: taImage('r/33/0f/82/a3/caption.jpg'),
      durationLabel: '24 hours',
      priceFrom: 25,
      rating: null,
      reviewCount: null,
      bestFor:
        'Best for: Riders who want electric assist on Angkor hills and longer countryside loops without exhausting themselves in the heat.',
      whoFor: 'Active travelers covering more ground — Giant Talon E-MTB with helmet and lock from the same trusted rental shop.',
      details: [
        ['Operator', 'Aing Kimsan Bicycle Shop and Rental'],
        ['Type', 'E-MTB rental · 24h'],
        ['Price from', '$25'],
        ['Includes', 'Helmet, bike lock'],
        ['Best for', 'Angkor park loops & countryside trails'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '71885P1',
      title: 'Be Your Own Driver: Motorbike Rental in Siem Reap',
      tagLabel: 'Rental · Motorbike · 12h',
      operatorName: 'About Siem Reap Tours',
      imageUrl: taImage('06/74/1d/33.jpg'),
      durationLabel: '12 hours',
      priceFrom: 10.26,
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: Solo riders or couples who want flexible self-drive access to temples and villages without a guided tour.',
      whoFor: 'Confident motorbike riders (18+) who prefer setting their own schedule — Honda Airblade-style bike for a full day.',
      details: [
        ['Operator', 'About Siem Reap Tours'],
        ['Type', 'Motorbike rental · self-drive'],
        ['Rating', '5.0'],
        ['Price from', '~$10'],
        ['Duration', '12 hours'],
        ['Note', 'Insurance not included — Angkor Pass separate'],
      ],
    }),
  ];
}

export function getSiemReapGuidedBikeToursThree() {
  return [
    tour({
      productId: '406636P1',
      title: 'Small Group Countryside, Sunset, Siem Reap; Bike Tours & Picnic',
      tagLabel: 'Guided · Sunset',
      operatorName: 'Countryside Sunset Bike Tours',
      imageUrl: taImage('17/0e/24/29.jpg'),
      durationLabel: '5 hours',
      priceFrom: 18,
      rating: 5,
      reviewCount: 118,
      bestFor: 'Best for: The classic Siem Reap countryside bike day — villages, food stops, and sunset over the rice fields.',
      whoFor: 'First-time visitors who want a guided ride with everything included from pickup to snacks.',
      details: [
        ['Rating', '5.0 from 118+ reviews'],
        ['Price from', '$18'],
        ['Duration', '5 hours'],
        ['Includes', 'Transport, drinks, snacks, street food'],
      ],
    }),
    tour({
      productId: '131578P4',
      title: 'Siem Reap: Barcycle with Unlimited Cold Beers & Soft drinks',
      tagLabel: 'Fun · Pub Street',
      operatorName: 'Bar Cycle Cambodia',
      imageUrl: taImage('09/f9/70/3e.jpg'),
      durationLabel: '1 hour',
      priceFrom: 19,
      rating: 4.6,
      reviewCount: 11,
      bestFor:
        'Best for: A lighthearted evening rolling through Pub Street, Old Market, and Riverside with unlimited drinks on board.',
      whoFor: 'Groups and friends who want a unique social ride — pedaling optional, driver included.',
      details: [
        ['Rating', '4.6 from 11+ reviews'],
        ['Price from', '$19'],
        ['Duration', '1 hour'],
        ['Includes', 'Unlimited beer & soft drinks, bar cycle driver'],
      ],
    }),
    tour({
      productId: '406636P3',
      title: 'Siem Reap: Morning Bike Tours with Local Market & Lunch',
      tagLabel: 'Guided · Market & lunch',
      operatorName: 'Countryside Sunset Bike Tours',
      imageUrl: taImage('17/0e/12/76.jpg'),
      durationLabel: '5 hours',
      priceFrom: 21,
      rating: 5,
      reviewCount: 53,
      bestFor:
        'Best for: Culture-focused mornings — local market tastings, monk blessing at a temple, village ride, and home-style Khmer lunch.',
      whoFor: 'Food lovers and culture seekers who prefer a morning start over a sunset ride.',
      details: [
        ['Rating', '5.0 from 53+ reviews'],
        ['Price from', '$21'],
        ['Duration', '5 hours'],
        ['Includes', 'Guide, transport, lunch, biking, dessert tasting'],
      ],
    }),
  ];
}

export function getSiemReapMotorbikeVespaThree() {
  return [
    tour({
      productId: '5621307P4',
      title: 'Angkor Wat Private Electric Scooter or Bike Tour',
      tagLabel: 'Private · E-scooter',
      operatorName: 'Big Bus Angkor Cambodia',
      imageUrl: taImage('17/0f/c3/ae.jpg'),
      durationLabel: '8 hours',
      priceFrom: 20,
      rating: null,
      reviewCount: null,
      bestFor:
        'Best for: Eco-friendly temple hopping on an electric scooter or e-bike with a relaxed, uncrowded route plan.',
      whoFor: 'Active travelers who want Angkor highlights without a minivan — helmet, locker, and water included.',
      details: [
        ['Type', 'Private · e-scooter or e-bike'],
        ['Price from', '$20'],
        ['Duration', '8 hours'],
        ['Includes', 'Helmet, locker, water, insurance for scooter'],
        ['Note', 'English guide optional add-on; Angkor Pass separate'],
      ],
    }),
    tour({
      productId: '441519P2',
      title: "Discover Siem Reap's beauty on thrilling half-day motorbike tour",
      tagLabel: 'Guided · Motorbike',
      operatorName: 'Khmer Kruisers',
      imageUrl: taImage('12/73/4a/a5.jpg'),
      durationLabel: '3.5 hours',
      priceFrom: 18,
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: A guided half-day motorbike loop to Wat Bo temple, buffalo fields, and a fresh coconut stop.',
      whoFor: 'Riders who want a local guide and structured route without committing to a full Angkor temple day.',
      details: [
        ['Operator', 'Khmer Kruisers'],
        ['Rating', '5.0'],
        ['Price from', '$18'],
        ['Duration', '3.5 hours'],
        ['Includes', 'Hotel pickup/drop-off, helmet, water, guide'],
      ],
    }),
    tour({
      productId: '137038P5',
      title: 'Siem Reap Countryside Vespa Tour / Tuk Tuk Available',
      tagLabel: 'Vespa · Countryside',
      operatorName: 'Vespa Backstreet',
      imageUrl: taImage('0f/ff/e0/7c.jpg'),
      durationLabel: '5 hours',
      priceFrom: 24,
      priceNote: 'Special offer from $30',
      rating: 5,
      reviewCount: 193,
      bestFor:
        'Best for: The most-reviewed countryside Vespa experience — local villages, scenery, and food tastings off the beaten path.',
      whoFor: 'Adventurous couples and solo travelers who want to ride pillion with an experienced local driver.',
      details: [
        ['Rating', '5.0 from 193+ reviews'],
        ['Price from', '$24'],
        ['Duration', '5 hours'],
        ['Includes', 'Hotel pickup, Vespa & driver, snacks, village food tasting, guide'],
      ],
    }),
  ];
}

export function getSiemReapTukTukThree() {
  return [
    tour({
      productId: '103195P50',
      title: 'Angkor Wat Private Tour by Tuk-Tuk with English Speaking Driver',
      tagLabel: 'Tuk-tuk · Temples',
      operatorName: 'About Cambodia Travel & Tours',
      imageUrl: taImage('12/e4/dc/5e.jpg'),
      durationLabel: '3–8 hours',
      priceFrom: 15,
      rating: 4.8,
      reviewCount: 179,
      bestFor:
        'Best for: Classic Angkor exploration by tuk-tuk — sunrise, full-day small circuit, or sunset options with a flexible English-speaking driver.',
      whoFor: 'Budget-conscious travelers who want open-air temple hopping without a big tour group.',
      details: [
        ['Rating', '4.8 from 179+ reviews'],
        ['Price from', '$15'],
        ['Duration', '3–8 hours (option dependent)'],
        ['Includes', 'Private tuk-tuk & driver, hotel pickup'],
        ['Note', 'Angkor Pass & optional licensed guide extra'],
      ],
    }),
    tour({
      productId: '451638P1',
      title: 'Apsara Dance Show & Dinner with Tuk-Tuk Transfers',
      tagLabel: 'Tuk-tuk · Evening culture',
      operatorName: 'Cambo Tours',
      imageUrl: taImage('12/45/9c/d6.jpg'),
      durationLabel: '2 hours',
      priceFrom: 21,
      rating: 4.7,
      reviewCount: 21,
      bestFor:
        'Best for: A cultural evening — Apsara dance performance and Khmer buffet with round-trip tuk-tuk from your hotel.',
      whoFor: 'Travelers resting their legs after temple days who still want an authentic Siem Reap night out.',
      details: [
        ['Rating', '4.7 from 21+ reviews'],
        ['Price from', '$21'],
        ['Duration', '~2 hours'],
        ['Includes', 'Show admission, buffet dinner, tuk-tuk transfers'],
      ],
    }),
    tour({
      productId: '76334P9',
      title: "Private one-day tuktuk 'small tour' of the oldest Angkor temples",
      tagLabel: 'Tuk-tuk · Full day',
      operatorName: 'Angkor Wat Shared Tours',
      imageUrl: taImage('06/d0/b8/b9.jpg'),
      durationLabel: '8–9 hours',
      priceFrom: 23,
      rating: 4.9,
      reviewCount: 106,
      bestFor:
        'Best for: A full-day private tuk-tuk small circuit — Angkor Wat, Bayon, Ta Prohm — with water and hotel transfers included.',
      whoFor: 'Couples and small groups who want a dedicated tuk-tuk for the day without paying for a minivan tour.',
      details: [
        ['Rating', '4.9 from 106+ reviews'],
        ['Price from', '$23'],
        ['Duration', '8–9 hours'],
        ['Includes', 'Private tuk-tuk, water, hotel pickup/drop-off'],
        ['Note', 'Licensed guide & Angkor Pass separate'],
      ],
    }),
  ];
}

export function getSiemReapBikeToursCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapBikeToursTopPick());
  getSiemReapBikeRentalsThree().forEach(add);
  getSiemReapGuidedBikeToursThree().forEach(add);
  getSiemReapMotorbikeVespaThree().forEach(add);
  getSiemReapTukTukThree().forEach(add);
  return ordered;
}

export function getSiemReapBikeToursGuideData() {
  const listing = getSiemReapBikeToursListingMeta();
  const topPick = getSiemReapBikeToursTopPick();

  return {
    guideLayout: 'siem-reap-bike-tours',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Bike tours',
    toursSearchQuery: 'Siem Reap bike tour rental',
    heroImage: listing.hero_image,
    heroTagline: 'Rentals from $5/day · guided countryside rides from $18 · tuk-tuk temple days from $15',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapBikeToursCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Siem Reap countryside sunset bike tour',
    transferSections: [
      {
        id: 'rentals',
        title: 'Best bike & motorbike rentals in Siem Reap',
        description:
          'Explore at your own pace — city bikes from $5/day, Giant e-MTBs from $25/day, or a 12-hour motorbike rental for temple-hopping freedom.',
        tours: getSiemReapBikeRentalsThree(),
      },
      {
        id: 'guided-bike',
        title: 'Best guided bike tours in Siem Reap',
        description:
          'Countryside rides with food tastings, morning market culture tours, and the famous pedal-powered bar cycle through Pub Street.',
        tours: getSiemReapGuidedBikeToursThree(),
      },
      {
        id: 'motorbike-vespa',
        title: 'Best motorbike, Vespa & e-scooter tours',
        description:
          'Electric scooters at Angkor, guided motorbike loops to Wat Bo, and the top-rated countryside Vespa experience with 193 five-star reviews.',
        tours: getSiemReapMotorbikeVespaThree(),
      },
      {
        id: 'tuk-tuk',
        title: 'Best tuk-tuk tours in Siem Reap',
        description:
          'The classic open-air way to see Angkor — private temple days from $15, full small-circuit tours, and evening Apsara dance with hotel pickup.',
        tours: getSiemReapTukTukThree(),
      },
    ],
    introParagraphs: [
      'Siem Reap is flat, warm, and built for two wheels — but your options split into four very different experiences: self-guided rentals, guided countryside rides, motorbike or Vespa adventures, and tuk-tuk temple days.',
      'Below are our hand-picked options in each category — with real prices, review counts, and what is (and is not) included. Remember: Angkor Pass ($37+) is separate on any temple ride.',
    ],
    comparisonSection: {
      title: 'Rental vs guided bike vs tuk-tuk — quick comparison',
      headers: ['Option', 'Typical price', 'Best for', 'Trade-off'],
      rows: [
        ['City bike rental', 'From $5/day', 'Independent riders, short loops', 'No guide; you buy Angkor Pass separately'],
        ['Guided countryside ride', 'From $18', 'Culture, food, sunset', 'Fixed schedule, small group'],
        ['Vespa / motorbike tour', 'From $18–$24', 'Adventure, rural scenery', 'Requires moderate fitness or pillion riding'],
        ['Tuk-tuk temple day', 'From $15', 'Angkor small circuit, flexible driver', 'Less exercise; still need Angkor Pass'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap biking & riding tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Ride early morning or late afternoon', 'Avoid midday heat — especially April–May'],
        ['Budget for the Angkor Pass', '$37 (1-day) required for any temple access — not included in rentals'],
        ['Wear temple-appropriate clothing', 'Shoulders and knees covered when entering Angkor sites'],
        ['Confirm e-bike battery range', 'Ask the shop about distance if riding to remote temples'],
        ['Tuk-tuk drivers wait at each stop', 'Agree on itinerary and tip ($3–$5) at the end of the day'],
        ['Barcycle is evening-only fun', 'Not a temple tour — book separately from your Angkor day'],
      ],
    },
    stats: {
      toursAvailable: 12,
      priceFrom: 5,
      duration: '1h – 24h rental',
      reviewCount: 700,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Siem Reap Bike Tours & Rentals (2026): Countryside Rides, E-Bikes & Tuk-Tuk | TopTours',
      description:
        'Compare Siem Reap bike rentals from $5/day, guided countryside sunset rides from $18, Vespa tours, and tuk-tuk temple days from $15 — hand-picked Viator options with reviews.',
      keywords:
        'Siem Reap bike tour, bike rental Siem Reap, Angkor Wat bike tour, Siem Reap tuk tuk tour, countryside bike tour Cambodia',
    },

    faqs: [
      {
        question: 'Can I ride a bike to Angkor Wat without a tour?',
        answer:
          'Yes — rent a city bike ($5/day) or e-MTB ($25/day) and ride to the park yourself. You still need an Angkor Pass ($37 for one day) and should start early to avoid heat and traffic. Most rental shops are in central Siem Reap and can suggest routes.',
      },
      {
        question: 'What is the best Siem Reap bike tour for first-time visitors?',
        answer:
          'The Small Group Countryside Sunset ride (5.0 from 118+ reviews, from $18) is our top pick — it includes transport, food tastings, and a sunset without navigating on your own. For temples specifically, a private tuk-tuk day (from $15) is easier than biking the full Angkor circuit in the heat.',
      },
      {
        question: 'How much does bike rental cost in Siem Reap?',
        answer:
          'Classic city bikes start around $5 for 24 hours. Premium Giant e-MTBs run from about $25/day. Motorbike self-drive rentals start near $10 for 12 hours. Guided tours range from $18 (countryside) to $24 (Vespa).',
      },
      {
        question: 'Is it safe to bike in Siem Reap?',
        answer:
          'Countryside guided tours use quiet village paths and include support. Riding independently to Angkor means sharing roads with cars and tuk-tuks — go early, wear a helmet, and stick to daylight hours. Heat and dehydration are the bigger risks than traffic in rural areas.',
      },
      {
        question: 'Does a tuk-tuk tour include the Angkor Pass?',
        answer:
          'No. Tuk-tuk tours include the vehicle and driver (and sometimes water). Your driver will stop at the ticket office so you can buy an Angkor Pass before entering the archaeological park.',
      },
      {
        question: 'What is the difference between a bike tour and a Vespa tour?',
        answer:
          'Guided bike tours are pedal-powered small-group rides through villages and rice fields. Vespa tours put you on the back of a scooter with an experienced driver — better for longer distances and riders who prefer not to cycle in the heat.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Siem Reap hidden costs & Angkor Pass fees',
        href: '/destinations/siem-reap/guides/additional-fees',
      },
      {
        label: 'Best Angkor Wat tours (shore excursions)',
        href: '/destinations/siem-reap/guides/shore-excursions',
      },
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
