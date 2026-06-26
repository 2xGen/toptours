/**
 * Editorial guide: Siem Reap countryside & village experiences — ATV, quad bikes & rural tours.
 */

export const SIEM_REAP_COUNTRYSIDE_VILLAGE_SLUG = 'countryside-and-village-experiences';

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

export function getSiemReapCountrysideVillageListingMeta() {
  return {
    category_slug: SIEM_REAP_COUNTRYSIDE_VILLAGE_SLUG,
    category_name: 'Countryside & Village Experiences',
    title: 'Best Siem Reap Countryside Tours (2026): ATV, Quad Bikes & Village Adventures',
    subtitle:
      'Hand-picked Siem Reap countryside tours from $36 — rice-field quad bikes, sunset buggies, cooking class combos, and full-day village expeditions beyond the temples.',
    hero_image: taImage('09/94/1f/8d', '720x480'),
  };
}

export function getSiemReapCountrysideVillageTopPick() {
  return tour({
    productId: '68642P1',
    title: 'ATV Sunset and Cooking Class',
    tagLabel: 'Top pick · Cook + ride',
    operatorName: 'Quad Adventure Cambodia Siem Reap',
    imageUrl: taImage('09/94/1f/8d', '720x480'),
    durationLabel: '5 hours',
    priceFrom: 92.31,
    rating: 5,
    reviewCount: 2,
    bestFor:
      'Best for: Morning Cambodian cooking class with market visit and 3-course lunch, then a 2-hour private ATV sunset ride through villages and rice paddies.',
    whoFor:
      'Foodies and adventure seekers who want the fullest countryside day — authentic Khmer cooking plus pink-sunset quad riding in one private package.',
    details: [
      ['Operator', 'Quad Adventure Cambodia Siem Reap'],
      ['Type', 'Private · cooking + ATV sunset'],
      ['Rating', '5.0 from 2+ reviews'],
      ['Price from', '$92.31'],
      ['Duration', '~5 hours'],
      ['Includes', 'Cooking class, 3-course lunch, guided market visit, ATV gear, hotel pickup'],
      ['Note', 'Minimum age 18 to drive solo — younger riders get instructor on back'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'Learn Cambodian recipes in a family kitchen, eat a 3-course lunch, then ride out for a private ATV sunset over Siem Reap’s rice fields — the best combo on our list.',
  });
}

export function getSiemReapCountrysideAtvThree() {
  return [
    tour({
      productId: '199392P6',
      title: 'Siem Reap Rustic Side Quad Bike Adventure',
      tagLabel: 'Budget · Sunset quad',
      operatorName: 'SARUS Co., Ltd',
      imageUrl: taImage('12/71/ce/e0'),
      durationLabel: '1 hour',
      priceFrom: 36,
      rating: 5,
      reviewCount: 3,
      bestFor:
        'Best for: Evening quad ride ~16 km to village outskirts with sunset over endless rice fields, buffalo ponds, and golden-hour skies.',
      whoFor:
        'Thrill-seekers on a budget who want a short, scenic ATV sunset without a full half-day commitment.',
      details: [
        ['Operator', 'SARUS Co., Ltd'],
        ['Rating', '5.0 from 3+ reviews'],
        ['Price from', '$36'],
        ['Duration', '~1 hour'],
        ['Includes', 'Quad bike, instructor per vehicle, hotel pickup & drop-off'],
        ['Note', 'All sales final — no refund on cancellation'],
      ],
    }),
    tour({
      productId: '68642P5',
      title: 'ATV Experience Tour in Siem Reap',
      tagLabel: 'Private · Tailored routes',
      operatorName: 'Quad Adventure Cambodia Siem Reap',
      imageUrl: taImage('11/7b/da/29'),
      durationLabel: '1 hour',
      priceFrom: 36,
      rating: 5,
      reviewCount: 4,
      bestFor:
        'Best for: Private 1-hour ATV through Siem Reap countryside — routes tailored to your skill level and season, with helmet, mask, and tuk-tuk transfers.',
      whoFor:
        'First-time quad riders who want a private assessment, safety gear, and village routes adjusted to ability.',
      details: [
        ['Operator', 'Quad Adventure Cambodia Siem Reap'],
        ['Rating', '5.0 from 4+ reviews'],
        ['Price from', '$36'],
        ['Duration', '~1 hour'],
        ['Includes', 'Private tour, instructor, helmet & rain gear, water, towel, hotel tuk-tuk pickup'],
        ['Note', 'Wear long clothes and sturdy shoes'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '5577932P5',
      title: 'Cambodia Buggy Sunset Tour Experience around Siem Reap',
      tagLabel: 'Buggy · Cultural sunset',
      operatorName: 'Cambodian Villages Buggy Adventures',
      imageUrl: taImage('15/c1/1f/ef'),
      durationLabel: '2h 20m',
      priceFrom: 45,
      rating: 5,
      reviewCount: 3,
      bestFor:
        'Best for: Self-drive late-model automatic buggies through markets, countryside, and villages with expert guides and a sunset finish.',
      whoFor:
        'Families and groups who prefer easy-drive buggies over solo quads — 2+ hours of off-the-beaten-path Cambodia.',
      details: [
        ['Operator', 'Cambodian Villages Buggy Adventures'],
        ['Rating', '5.0 from 3+ reviews'],
        ['Price from', '$45'],
        ['Duration', '~2h 20m'],
        ['Includes', 'Hotel pickup, safety briefing, buggy, cold drink'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapCountrysideVillageThree() {
  return [
    tour({
      productId: '182505P1',
      title: '1 Day City Tour + Countryside Tour in Siem Reap',
      tagLabel: 'Private · Full day',
      operatorName: 'Icare Tours',
      imageUrl: taImage('12/71/ce/e0'),
      durationLabel: '8–10 hours',
      priceFrom: 133.34,
      rating: 5,
      reviewCount: 6,
      bestFor:
        'Best for: Private full-day covering Siem Reap city highlights and countryside — ideal when you have limited time in Cambodia.',
      whoFor:
        'Short-stay travelers who want city temples, markets, and rural landscapes in one guided day with private transport.',
      details: [
        ['Operator', 'Icare Tours'],
        ['Rating', '5.0 from 6+ reviews'],
        ['Price from', '$133.34'],
        ['Duration', '~8–10 hours'],
        ['Includes', 'Private transportation, guide to main regional sights'],
        ['Note', 'Lunch not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '31721P41',
      title: 'Countryside Quad Bike with Sunset Drink',
      tagLabel: 'Sunset · Rice fields',
      operatorName: 'Journey Cambodia',
      imageUrl: taImage('r/32/70/07/72/caption'),
      durationLabel: '3 hours',
      priceFrom: 37.05,
      priceNote: 'often on special offer',
      rating: 4.7,
      reviewCount: 7,
      bestFor:
        'Best for: Drive your own Polaris quad through rice fields and remote villages, meet local farmers, and end with sunset drinks and a seasonal snack.',
      whoFor:
        'Riders who want a longer countryside loop than 1-hour tours — hotel pickup, fuel, helmet, and sunset viewpoint included.',
      details: [
        ['Operator', 'Journey Cambodia'],
        ['Rating', '4.7 from 7+ reviews'],
        ['Price from', '$37.05'],
        ['Duration', '~3 hours'],
        ['Includes', 'Polaris Trail Boss quad, guide, fuel, helmet, water, sunset drink & snack, hotel pickup'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '5577932P6',
      title: 'The Ultimate Siem Reap Buggy Expedition',
      tagLabel: 'Full day · Village deep-dive',
      operatorName: 'Cambodian Villages Buggy Adventures',
      imageUrl: taImage('15/d0/2a/ca'),
      durationLabel: '7 hours',
      priceFrom: 155,
      bestFor:
        'Best for: Full-day self-drive buggy expedition through Siem Reap villages — school supply stops, monastery visit, lunch, and rural Cambodia immersion.',
      whoFor:
        'Adventure travelers ready for a 7-hour buggy day who want meaningful village stops beyond a quick sunset ride.',
      details: [
        ['Operator', 'Cambodian Villages Buggy Adventures'],
        ['Price from', '$155'],
        ['Duration', '~7 hours'],
        ['Includes', 'Late-model automatic buggy, local guide, bottled water, lunch'],
        ['Note', 'Community stops including school supplies and monastery donation'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapCountrysideVillageCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapCountrysideVillageTopPick());
  getSiemReapCountrysideAtvThree().forEach(add);
  getSiemReapCountrysideVillageThree().forEach(add);
  return ordered;
}

export function getSiemReapCountrysideVillageGuideData() {
  const listing = getSiemReapCountrysideVillageListingMeta();
  const topPick = getSiemReapCountrysideVillageTopPick();

  return {
    guideLayout: 'siem-reap-countryside-village',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Countryside & village experiences',
    toursSearchQuery: 'Siem Reap ATV quad bike countryside village',
    heroImage: listing.hero_image,
    heroTagline:
      'Quad bikes from $36 · Sunset buggies from $45 · Cooking + ATV from $92 · Full-day village expeditions from $155',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapCountrysideVillageCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: ATV Sunset and Cooking Class',
    transferSections: [
      {
        id: 'atv-quad-tours',
        title: 'ATV & quad bike countryside tours',
        description:
          'Short quad and buggy rides through Siem Reap rice paddies and villages — from 1-hour budget sunsets to 2+ hour self-drive buggy adventures.',
        tours: getSiemReapCountrysideAtvThree(),
      },
      {
        id: 'countryside-village',
        title: 'Countryside & village experiences',
        description:
          'Longer rural immersions — full-day city-plus-countryside tours, 3-hour sunset quad loops, and 7-hour buggy village expeditions.',
        tours: getSiemReapCountrysideVillageThree(),
      },
    ],
    introParagraphs: [
      'Beyond Angkor’s temple gates, Siem Reap’s countryside is a patchwork of rice fields, stilt villages, and red-dirt tracks best explored on quad bikes and buggies.',
      'Below are seven hand-picked tours from quick $36 sunset quads to full-day buggy expeditions with village stops. Wear long sleeves, closed shoes, and expect dust — the reward is Cambodia as locals live it.',
    ],
    comparisonSection: {
      title: 'Countryside tours — quick comparison',
      headers: ['Tour', 'Price from', 'Best for', 'Duration'],
      rows: [
        ['ATV Sunset & Cooking Class (top pick)', 'From $92', 'Cooking + sunset ATV combo', '~5 hours'],
        ['Rustic Side Quad Bike Adventure', 'From $36', 'Budget sunset rice fields', '~1 hour'],
        ['ATV Experience Tour', 'From $36', 'Private tailored village routes', '~1 hour'],
        ['Buggy Sunset Tour', 'From $45', 'Self-drive buggy + culture', '~2h 20m'],
        ['Countryside Quad + Sunset Drink', 'From $37', '3-hour Polaris village loop', '~3 hours'],
        ['1 Day City + Countryside', 'From $133', 'Full private city & rural day', '~8–10 hours'],
        ['Ultimate Buggy Expedition', 'From $155', '7-hour village deep-dive', '~7 hours'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap countryside tour tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Book sunset slots in dry season', 'Nov–Apr skies give the best golden-hour rice-field photos'],
        ['Wear long pants and closed shoes', 'Dust, mud, and sun exposure on open quads and buggies'],
        ['Check cancellation policies', 'Some budget quad tours are non-refundable'],
        ['Minimum age 18 to drive solo', 'Younger riders can ride with an instructor on back'],
        ['Pair with a temple rest day', 'Countryside tours are ideal between heavy Angkor walking days'],
      ],
    },
    stats: {
      toursAvailable: 7,
      priceFrom: 36,
      duration: '1h – 10h',
      reviewCount: 25,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Best Siem Reap Countryside Tours (2026): ATV, Quad Bikes & Villages | TopTours',
      description:
        'Compare Siem Reap ATV and quad bike tours from $36 — sunset rice-field rides, buggy village tours, cooking class combos, and full-day countryside expeditions.',
      keywords:
        'Siem Reap ATV tour, quad bike Siem Reap, countryside tour Cambodia, buggy tour Siem Reap, village experience Siem Reap',
    },

    faqs: [
      {
        question: 'What is the best ATV tour in Siem Reap?',
        answer:
          'Our top pick is the ATV Sunset and Cooking Class ($92, 5 hours) combining a Khmer cooking lesson with a private sunset quad ride. For budget travelers, the Siem Reap Rustic Side Quad Bike Adventure and ATV Experience Tour both start from $36 for about 1 hour.',
      },
      {
        question: 'Quad bike or buggy — which is better?',
        answer:
          'Quad bikes (ATVs) suit solo riders who want a motorcycle-style ride. Buggies from Cambodian Villages Buggy Adventures are easier to drive — automatic, two-seater, and better for families. The Buggy Sunset Tour starts from $45 for 2+ hours.',
      },
      {
        question: 'Do Siem Reap quad tours include hotel pickup?',
        answer:
          'Most tours on our list include hotel pickup and drop-off in central Siem Reap. Quad Adventure Cambodia uses tuk-tuks to their HQ; Journey Cambodia and SARUS pick up directly from your hotel.',
      },
      {
        question: 'Can beginners ride ATVs in Siem Reap?',
        answer:
          'Yes. Operators assess your ability before departure and provide helmets, briefings, and instructors. Routes are tailored to skill level and season — start with the 1-hour ATV Experience Tour if you are unsure.',
      },
      {
        question: 'What is the longest countryside tour?',
        answer:
          'The Ultimate Siem Reap Buggy Expedition is a 7-hour self-drive adventure with lunch, village stops, and school supply visits from $155. For a full city-plus-countryside day, Icare Tours offers an 8–10 hour private tour from $133.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Siem Reap nature & wildlife tours',
        href: '/destinations/siem-reap/guides/nature-and-wildlife-tours',
      },
      {
        label: 'Siem Reap bike tours',
        href: '/destinations/siem-reap/guides/bike-tours',
      },
      {
        label: 'Siem Reap half-day tours',
        href: '/destinations/siem-reap/guides/half-day-tours',
      },
      {
        label: 'Siem Reap day trips',
        href: '/destinations/siem-reap/guides/day-trips',
      },
      {
        label: 'Siem Reap attractions & museums',
        href: '/destinations/siem-reap/guides/attractions-museums',
      },
    ],
  };
}
