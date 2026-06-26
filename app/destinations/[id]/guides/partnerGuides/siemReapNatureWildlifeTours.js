/**
 * Editorial guide: Siem Reap nature & wildlife tours — Kulen waterfalls, bird sanctuaries & elephant forest.
 */

export const SIEM_REAP_NATURE_WILDLIFE_TOURS_SLUG = 'nature-and-wildlife-tours';

const AFF = '?mcid=42383&pid=P00276441&medium=api&api_version=2.0';

function taImage(path, size = '540x360') {
  const normalized = String(path || '').replace(/\.jpg$/i, '');
  if (normalized.includes('/caption')) {
    return `https://media-cdn.tripadvisor.com/media/attractions-splice-spp-${size}/${normalized}.jpg`;
  }
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

export function getSiemReapNatureWildlifeToursListingMeta() {
  return {
    category_slug: SIEM_REAP_NATURE_WILDLIFE_TOURS_SLUG,
    category_name: 'Nature and Wildlife Tours',
    title: 'Best Siem Reap Nature & Wildlife Tours (2026): Kulen Waterfalls, Bird Sanctuaries & Elephants',
    subtitle:
      'Hand-picked Siem Reap nature tours from $60 — Phnom Kulen waterfalls & 1000 Lingas, Koh Ker & Beng Mealea jungle temples, Prek Toal bird sanctuary, and ethical Kulen Elephant Forest experiences.',
    hero_image: taImage('15/6e/df/1e', '720x480'),
  };
}

export function getSiemReapNatureWildlifeToursTopPick() {
  return tour({
    productId: '67476P34',
    title: 'Siem Reap to Phnom Kulen: Waterfalls & 1000 Lingas Tour',
    tagLabel: 'Top pick · Kulen waterfalls',
    operatorName: 'Travel to Inspire',
    imageUrl: taImage('15/6e/df/1e', '720x480'),
    durationLabel: '5–7 hours',
    priceFrom: 67.94,
    rating: 5,
    reviewCount: 26,
    bestFor:
      'Best for: A full Phnom Kulen day — swim at the two-tiered waterfall, walk the River of a Thousand Lingas, visit the Reclining Buddha, and stop at a Khmer village on the way back.',
    whoFor:
      'Our highest-reviewed dedicated Kulen nature day trip — spiritual river carvings, waterfall swimming, and village culture without the long drive to remote Koh Ker.',
    details: [
      ['Operator', 'Travel to Inspire'],
      ['Type', 'Small group or private · Kulen day trip'],
      ['Rating', '5.0 from 26+ reviews'],
      ['Price from', '$67.94'],
      ['Duration', '~5–7 hours'],
      ['Includes', 'Guide, hotel pickup, snacks, water & towels'],
      ['Note', 'Kulen entrance fee (~$20) & lunch extra; 50% profits support student education'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'Phnom Kulen is where the Angkor Empire began — this day trip combines sacred riverbed lingas, a swimmable waterfall, the summit Reclining Buddha, and a village stop for palm wine and crafts before returning to Siem Reap by late afternoon.',
  });
}

export function getSiemReapNatureWaterfallThree() {
  return [
    tour({
      productId: '118579P29',
      title: 'Kulen Mountain Waterfall Tour with Picnic Lunch from Siem Reap',
      tagLabel: 'Best value · Kulen picnic',
      operatorName: 'Asean Angkor Guide',
      imageUrl: taImage('11/ff/51/7f'),
      durationLabel: '8 hours',
      priceFrom: 48,
      rating: 5,
      reviewCount: 270,
      bestFor:
        'Best for: Kulen waterfall swimming, the River of 1000 Lingas, Reclining Buddha, and a riverside picnic with grilled chicken, local sauces, fruit, and beer — Kulen entrance included.',
      whoFor:
        'Budget-conscious travelers who want the most-reviewed Kulen day on our list (270 five-star reviews) with lunch and park admission bundled from just $48.',
      details: [
        ['Operator', 'Asean Angkor Guide'],
        ['Rating', '5.0 from 270+ reviews'],
        ['Price from', '$48'],
        ['Duration', '~8 hours'],
        ['Includes', 'Guide, transport, Kulen admission, picnic lunch, water & towels'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '239308P12',
      title: 'Koh Ker, Kulen Waterfall and Beng Mealea from Siem Reap',
      tagLabel: 'Full day · Remote temples',
      operatorName: 'Angkor Buddy Tour',
      imageUrl: taImage('17/0a/17/2e'),
      durationLabel: '12 hours',
      priceFrom: 78,
      rating: 5,
      reviewCount: 15,
      bestFor:
        'Best for: Three sites in one long day — Kulen waterfall, the lost city of Koh Ker, and vine-covered Beng Mealea jungle temple ruins.',
      whoFor:
        'Adventure seekers who want waterfalls plus Cambodia’s most atmospheric unrestored temple in a single guided van day from Siem Reap.',
      details: [
        ['Operator', 'Angkor Buddy Tour'],
        ['Rating', '5.0 from 15+ reviews'],
        ['Price from', '$78'],
        ['Duration', '~12–13 hours'],
        ['Includes', 'A/C van, guide, water, hotel pickup'],
        ['Note', 'Kulen $20, Koh Ker $15, Beng Mealea $10 paid on site'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '349857P3',
      title: 'Full Day to Banteay Srei, Kulen National Park and Beng Mealea',
      tagLabel: 'Private · Pink temple & jungle',
      operatorName: 'The Fin Travel & Tours',
      imageUrl: taImage('0f/48/5a/a2'),
      durationLabel: '9–10 hours',
      priceFrom: 60,
      rating: 5,
      reviewCount: 4,
      bestFor:
        'Best for: Banteay Srei’s intricate pink sandstone, Kulen’s waterfalls and sacred sites, and untouched Beng Mealea — led by a 20-year veteran guide.',
      whoFor:
        'Culture-focused travelers who want Fin’s deep local knowledge across three distinct landscapes in one private day from $60.',
      details: [
        ['Operator', 'The Fin Travel & Tours'],
        ['Type', 'Private · 3-site day tour'],
        ['Rating', '5.0 from 4+ reviews'],
        ['Price from', '$60'],
        ['Duration', '~9–10 hours'],
        ['Includes', 'English guide, A/C vehicle, bottled water'],
        ['Note', 'Angkor pass $37, Kulen $20, lunch ~$5–7 extra'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapNatureBirdwatchingThree() {
  return [
    tour({
      productId: '142149P8',
      title: 'Bird Watching at Tonle Sap Forest and Lotus Farm Siem Reap',
      tagLabel: 'Private · Wetland birds',
      operatorName: 'Pitt Angkor Tour',
      imageUrl: taImage('14/ca/ff/e4'),
      durationLabel: '4–5 hours',
      priceFrom: 70,
      rating: 5,
      reviewCount: 4,
      bestFor:
        'Best for: A half-day at Pearaing Biodiversity Conservation Center — the closest serious birding site to Siem Reap, plus a lotus farm stop.',
      whoFor:
        'Birders and photographers who want a short, focused wetland trip without the full-day Prek Toal commitment — best March to May in dry season.',
      details: [
        ['Operator', 'Pitt Angkor Tour'],
        ['Type', 'Private · birding half-day'],
        ['Rating', '5.0 from 4+ reviews'],
        ['Price from', '$70'],
        ['Duration', '~4–5 hours'],
        ['Includes', 'Birding specialist guide, A/C car, hotel pickup'],
        ['Cancellation', 'All sales final'],
      ],
    }),
    tour({
      productId: '5643071P14',
      title: 'Private Angkor Birding and Ancient Temples Tour with Khmer lunch',
      tagLabel: 'Private · Temples & birds',
      operatorName: 'Angkor Bike Rental Service',
      imageUrl: taImage('r/33/0f/b0/b6/caption'),
      durationLabel: '10–11 hours',
      priceFrom: 145,
      rating: null,
      reviewCount: null,
      bestFor:
        'Best for: A slow-paced day mixing quiet temple corners with birdwatching led by a licensed guide and birding specialist — Khmer lunch included.',
      whoFor:
        'Travelers who want Angkor culture and nature together without rushing — Ta Nei, Ta Prohm, and peaceful bird habitats away from tour-bus crowds.',
      details: [
        ['Operator', 'Angkor Bike Rental Service'],
        ['Type', 'Private · birding + temples'],
        ['Price from', '$145'],
        ['Duration', '~10–11 hours'],
        ['Includes', 'Birding specialist guide, tuk-tuk & driver, lunch, water'],
        ['Note', 'Angkor temple pass extra; bring binoculars'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '26033P15',
      title: 'Private Tour Prek Toal Bird Sanctuary Off Beaten Track',
      tagLabel: 'Private · Prek Toal sanctuary',
      operatorName: 'ANGKOR CAB-OFF BEATEN TRUCK',
      imageUrl: taImage('0a/97/dd/34'),
      durationLabel: '8 hours',
      priceFrom: 399,
      rating: 5,
      reviewCount: 3,
      bestFor:
        'Best for: Tonle Sap’s premier bird sanctuary by private boat — pelicans, storks, and floating village life on a full off-the-beaten-track day.',
      whoFor:
        'Serious birders and nature photographers willing to pay for a private boat, lunch included, and hundreds of thousands of migratory birds on the lake.',
      details: [
        ['Operator', 'ANGKOR CAB-OFF BEATEN TRUCK'],
        ['Type', 'Private · full-day boat safari'],
        ['Rating', '5.0 from 3+ reviews'],
        ['Price from', '$399'],
        ['Duration', '~8 hours'],
        ['Includes', 'Private boat, guide, lunch, water, taxes'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapNatureElephantThree() {
  return [
    tour({
      productId: '240081P78',
      title: 'Kulen Elephant Forest & Kampong Phluk by Private Tour',
      tagLabel: 'Top elephant pick · 83 reviews',
      operatorName: 'Angkor Focus Travel',
      imageUrl: taImage('11/8d/a5/3f'),
      durationLabel: '6 hours',
      priceFrom: 215,
      rating: 4.8,
      reviewCount: 83,
      bestFor:
        'Best for: The highest-reviewed Kulen Elephant Forest combo — feed elephants, jungle trek with mahouts, lunch in the forest, then Kampong Phluk floating village.',
      whoFor:
        'Families and wildlife lovers who want the most-booked ethical elephant experience on our list, paired with Tonle Sap stilted village views.',
      details: [
        ['Operator', 'Angkor Focus Travel'],
        ['Type', 'Private · elephant sanctuary + lake'],
        ['Rating', '4.8 from 83+ reviews'],
        ['Price from', '$215'],
        ['Duration', '~6 hours'],
        ['Includes', 'Elephant camp & village entry, guide, A/C transport, lunch, water'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '233275P22',
      title: 'Kulen Elephant Forest and Tonle Sap Lake by Private Tour',
      tagLabel: 'Private · Elephant & lake',
      operatorName: 'Angkor Express Boat',
      imageUrl: taImage('10/3d/fe/47'),
      durationLabel: '8 hours',
      priceFrom: 199,
      rating: 4.7,
      reviewCount: 18,
      bestFor:
        'Best for: Morning or afternoon elephant walks with mahouts, sanctuary learning, Khmer lunch, and an afternoon boat through Kampong Phluk’s floating community.',
      whoFor:
        'Travelers who want a full day at the elephant forest plus Tonle Sap lake life — camp entrance and village boat ride bundled in one private itinerary.',
      details: [
        ['Operator', 'Angkor Express Boat'],
        ['Rating', '4.7 from 18+ reviews'],
        ['Price from', '$199'],
        ['Duration', '~8 hours'],
        ['Includes', 'Elephant camp entry, lake village admission, lunch, guide, A/C van'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '239763P14',
      title: 'Kulen Elephant Forest & Tonlesap Lake',
      tagLabel: 'Private · Full elephant day',
      operatorName: 'Cambodia Transport Service',
      imageUrl: taImage('10/3d/76/36'),
      durationLabel: '8 hours',
      priceFrom: 198,
      rating: 5,
      reviewCount: 6,
      bestFor:
        'Best for: Face-to-face elephant encounters, a 2 km guided jungle trek, and a Tonle Sap cruise through Kampong Phluk’s floating market and stilted homes.',
      whoFor:
        'Couples and small groups seeking a sanctuary-focused day with perfect 5.0 reviews from recent travelers — wheelchair-accessible transport available.',
      details: [
        ['Operator', 'Cambodia Transport Service'],
        ['Rating', '5.0 from 6+ reviews'],
        ['Price from', '$198'],
        ['Duration', '~8 hours'],
        ['Includes', 'Camp & village fees, guide, A/C transport, lunch at elephant camp'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapNatureWildlifeToursCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapNatureWildlifeToursTopPick());
  getSiemReapNatureWaterfallThree().forEach(add);
  getSiemReapNatureBirdwatchingThree().forEach(add);
  getSiemReapNatureElephantThree().forEach(add);
  return ordered;
}

export function getSiemReapNatureWildlifeToursGuideData() {
  const listing = getSiemReapNatureWildlifeToursListingMeta();
  const topPick = getSiemReapNatureWildlifeToursTopPick();

  return {
    guideLayout: 'siem-reap-nature-wildlife-tours',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Nature and wildlife tours',
    toursSearchQuery: 'Siem Reap nature wildlife Kulen elephant bird',
    heroImage: listing.hero_image,
    heroTagline: 'Kulen waterfalls from $68 · bird sanctuaries from $70 · elephant forest from $198',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapNatureWildlifeToursCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Phnom Kulen waterfalls & 1000 Lingas day trip',
    transferSections: [
      {
        id: 'waterfalls-jungle',
        title: 'Kulen waterfalls, Koh Ker & Beng Mealea day trips',
        description:
          'Swim beneath Phnom Kulen’s tiers, picnic by the lingas river, or pair waterfalls with jungle temples at Koh Ker and Beng Mealea — three more picks from $48 (see top pick above for another Kulen-only option).',
        tours: getSiemReapNatureWaterfallThree(),
      },
      {
        id: 'birdwatching',
        title: 'Birdwatching & Tonle Sap wildlife tours',
        description:
          'From quick lotus-farm birding near town to full-day Prek Toal sanctuary boat trips and temple-and-bird combo days — for serious and casual birders alike.',
        tours: getSiemReapNatureBirdwatchingThree(),
      },
      {
        id: 'elephant-forest',
        title: 'Kulen Elephant Forest ethical experiences',
        description:
          'Observe rescued elephants with mahouts, trek the sanctuary jungle, and pair your visit with Kampong Phluk floating village — three private combos from $198.',
        tours: getSiemReapNatureElephantThree(),
      },
    ],
    introParagraphs: [
      'Beyond Angkor’s temples, Siem Reap province holds sacred mountains, flooded forests, and ethical wildlife sanctuaries — enough for several days of nature without repeating a single itinerary.',
      'Below are our hand-picked waterfall, birding, and elephant-forest tours with real prices and review counts. Remember: Phnom Kulen, Koh Ker, Beng Mealea, and Prek Toal each have separate entrance fees, and bird numbers peak in the dry season (roughly November through May).',
    ],
    comparisonSection: {
      title: 'Waterfalls vs birding vs elephant forest — quick comparison',
      headers: ['Experience', 'Typical price', 'Best for', 'Trade-off'],
      rows: [
        ['Kulen picnic lunch day', 'From $48', 'Waterfall swim + lingas + lunch & beer', '8-hour day; most reviews on our list'],
        ['Phnom Kulen waterfall day', 'From $68', 'Swimming, lingas, Reclining Buddha', 'Kulen pass ~$20 extra'],
        ['Koh Ker + Beng Mealea combo', 'From $78', 'Remote jungle temples + falls', '12+ hour day; multiple passes'],
        ['Pearaing birding half-day', 'From $70', 'Quick wetland birds near town', 'Shorter list than Prek Toal'],
        ['Prek Toal sanctuary', 'From $399', 'Mass migratory flocks by boat', 'Premium private pricing'],
        ['Kulen Elephant Forest', 'From $198', 'Ethical elephant observation', 'Not a riding camp; book ahead'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap nature tour tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Visit Kulen waterfall in wet season', 'May–November fills the tiers for the best swim (still doable in dry months)'],
        ['Book Prek Toal for dawn or late afternoon', 'Bird activity peaks at cooler hours on Tonle Sap'],
        ['Bring binoculars for all birding tours', 'Operators rarely include optics — essential at Pearaing and Prek Toal'],
        ['Wear grippy shoes for Kulen riverbed walks', 'The Thousand Lingas path is slippery on wet rock'],
        ['Confirm elephant tours are observation-only', 'Kulen Elephant Forest is a sanctuary, not a riding operation'],
        ['Budget $45+ in site fees for Koh Ker combos', 'Kulen, Koh Ker, and Beng Mealea passes are paid separately'],
      ],
    },
    stats: {
      toursAvailable: 10,
      priceFrom: 60,
      duration: '4h – 13h',
      reviewCount: 190,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Best Siem Reap Nature & Wildlife Tours (2026): Kulen, Birds & Elephants | TopTours',
      description:
        'Compare Siem Reap nature tours from $60 — Phnom Kulen waterfalls, Koh Ker & Beng Mealea, Tonle Sap bird sanctuaries, and Kulen Elephant Forest experiences with real reviews.',
      keywords:
        'Siem Reap nature tour, Phnom Kulen waterfall tour, Prek Toal bird sanctuary, Kulen Elephant Forest, Beng Mealea tour, Tonle Sap bird watching',
    },

    faqs: [
      {
        question: 'What is the best nature tour in Siem Reap?',
        answer:
          'For waterfalls, the Phnom Kulen Waterfalls & 1000 Lingas tour (5.0 from 26+ reviews, from $67.94) is our top pick. For elephants, Kulen Elephant Forest & Kampong Phluk (4.8 from 83+ reviews, from $215) is the most-booked ethical sanctuary combo.',
      },
      {
        question: 'Can you swim at Phnom Kulen waterfall?',
        answer:
          'Yes. The two-tiered Kulen waterfall has pools where visitors swim on most dedicated Kulen day trips. Bring swimwear and a towel — the water is refreshing after the riverbed linga walk.',
      },
      {
        question: 'When is the best time for birdwatching on Tonle Sap?',
        answer:
          'The dry season (roughly November through May) concentrates birds at Pearaing and Prek Toal. March to May is especially good for the close-to-town Pearaing conservation center half-day tours.',
      },
      {
        question: 'How much does a Kulen Elephant Forest tour cost?',
        answer:
          'Private elephant forest and floating-village combos start around $198–$215 for 6–8 hours, including sanctuary entry, guide, transport, and usually lunch. This is an observation sanctuary — not elephant riding.',
      },
      {
        question: 'What is the difference between Kulen-only and Koh Ker combo tours?',
        answer:
          'Kulen-only days (from ~$68) focus on the sacred mountain, waterfall, and Reclining Buddha in 5–7 hours. Koh Ker combos (from ~$78) add the lost city of Koh Ker and vine-covered Beng Mealea — a 12-hour adventure with three separate entrance fees.',
      },
      {
        question: 'Is Prek Toal worth the higher price?',
        answer:
          'For dedicated birders, yes — the private Prek Toal boat safari (from $399) reaches Cambodia’s most important waterbird colony with hundreds of thousands of migratory birds. Casual birders may prefer the $70 Pearaing half-day closer to Siem Reap.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Siem Reap multi-day tours',
        href: '/destinations/siem-reap/guides/multi-day-tours',
      },
      {
        label: 'Siem Reap day trips',
        href: '/destinations/siem-reap/guides/day-trips',
      },
      {
        label: 'Siem Reap half-day tours',
        href: '/destinations/siem-reap/guides/half-day-tours',
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
