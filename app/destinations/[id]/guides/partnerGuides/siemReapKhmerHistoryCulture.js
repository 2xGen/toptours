/**
 * Editorial guide: Siem Reap Khmer history & culture walks — floating villages, Apsara dance & traditions.
 */

export const SIEM_REAP_KHMER_HISTORY_CULTURE_SLUG = 'khmer-history-and-culture-walks';

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

export function getSiemReapKhmerHistoryCultureListingMeta() {
  return {
    category_slug: SIEM_REAP_KHMER_HISTORY_CULTURE_SLUG,
    category_name: 'Khmer History & Culture Walks',
    title: 'Best Siem Reap Khmer Culture Tours (2026): Floating Villages, Apsara Dance & Traditions',
    subtitle:
      'Hand-picked Siem Reap cultural experiences from $23 — Tonle Sap floating villages, Apsara dance dinners, Khmer costume at Angkor Wat, and local-home cooking classes.',
    hero_image: taImage('07/9c/b6/78', '720x480'),
  };
}

export function getSiemReapKhmerHistoryCultureTopPick() {
  return tour({
    productId: '68746P37',
    title: "Khmer Cooking Class at a Local's Home in Krong Siem Reap",
    tagLabel: 'Top pick · 3,000+ reviews',
    operatorName: 'Angkor Wat Travel Tour',
    imageUrl: taImage('07/9c/b6/78', '720x480'),
    durationLabel: '3 hours',
    priceFrom: 27,
    rating: 5,
    reviewCount: 3004,
    bestFor:
      'Best for: Market shopping, private cooking in a Khmer home, and a 4-course lunch you prepare — the highest-reviewed cultural experience on our list.',
    whoFor:
      'Travelers who want authentic Cambodian hospitality with 3,004 five-star reviews — tuk-tuk pickup, local host, and optional mushroom or crocodile farm stops.',
    details: [
      ['Operator', 'Angkor Wat Travel Tour'],
      ['Rating', '5.0 from 3,004+ reviews'],
      ['Price from', '$27'],
      ['Duration', '~3 hours'],
      ['Includes', 'Local host, market visit, ingredients, 4-course lunch, tuk-tuk pickup'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'Shop Siem Reap’s market for fresh ingredients, cook four Khmer dishes in a local home, and eat what you make — the most-loved cultural immersion in the city.',
  });
}

export function getSiemReapKhmerHistoryCultureThree() {
  return [
    tour({
      productId: '398801P4',
      title: 'Siem Reap Floating Village Tour with Khmer Meal & Beer',
      tagLabel: 'Tonle Sap · Lake life',
      operatorName: 'Mad Monkey Siem Reap',
      imageUrl: taImage('12/18/d6/bc'),
      durationLabel: '6 hours',
      priceFrom: 25.2,
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: Tonle Sap floating villages, local market visit, sunset lake cruise with beer, and a traditional Khmer meal back at Mad Monkey hostel.',
      whoFor:
        'Social travelers and backpackers who want lake ecology plus village life on the water — meet at Mad Monkey lobby at 1:45 PM.',
      details: [
        ['Operator', 'Mad Monkey Siem Reap'],
        ['Rating', '5.0 from 1+ review'],
        ['Price from', '$25.20'],
        ['Duration', '~6 hours'],
        ['Includes', 'Guide, transport, water, towels, Khmer meal, one beer or soft drink'],
        ['Note', 'Community boat ~$5/person extra · 18+ only'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '124113P16',
      title: 'Apsara Dancing Show with Buffet Dinner Free Hotel Pick up',
      tagLabel: 'Evening · Apsara dance',
      operatorName: 'KH Angkor Tour',
      imageUrl: taImage('11/85/69/9f'),
      durationLabel: '3 hours',
      priceFrom: 23,
      rating: 5,
      reviewCount: 3,
      bestFor:
        'Best for: Classic Khmer Apsara dance at Amazon Angkor Restaurant with a traditional Cambodian buffet and free tuk-tuk pickup from your hotel.',
      whoFor:
        'First-time visitors who want a thousand-year-old dance tradition paired with dinner — the cheapest cultural evening on our list from $23.',
      details: [
        ['Operator', 'KH Angkor Tour'],
        ['Rating', '5.0 from 3+ reviews'],
        ['Price from', '$23'],
        ['Duration', '~3 hours'],
        ['Includes', 'Buffet dinner, Apsara show admission, hotel pickup by tuk-tuk or car'],
        ['Note', 'Drinks and return transfer not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '152500P20',
      title: 'Angkor Wat Khmer Traditional Custom Dressing Experience',
      tagLabel: 'Angkor Wat · Photo culture',
      operatorName: 'MyProGuide Cambodia',
      imageUrl: taImage('16/a1/34/55'),
      durationLabel: '4 hours',
      priceFrom: 25,
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: Dressing in authentic Khmer costume with jewelry at Angkor Wat temples — guided photos in traditional attire among the ruins.',
      whoFor:
        'Couples and friends who want Instagram-worthy temple shots with classic Khmer dress, accessories, and an English-speaking guide.',
      details: [
        ['Operator', 'MyProGuide Cambodia'],
        ['Rating', '5.0 from 1+ review'],
        ['Price from', '$25'],
        ['Duration', '~4 hours'],
        ['Includes', 'Traditional costume & accessories, guide, hotel transfers, water & cold towel'],
        ['Note', 'Angkor pass $37/person extra · special costume set upgrade available'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapKhmerHistoryCultureCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapKhmerHistoryCultureTopPick());
  getSiemReapKhmerHistoryCultureThree().forEach(add);
  return ordered;
}

export function getSiemReapKhmerHistoryCultureGuideData() {
  const listing = getSiemReapKhmerHistoryCultureListingMeta();
  const topPick = getSiemReapKhmerHistoryCultureTopPick();

  return {
    guideLayout: 'siem-reap-khmer-history-culture',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Khmer history & culture walks',
    toursSearchQuery: 'Siem Reap Khmer culture Apsara floating village traditional',
    heroImage: listing.hero_image,
    heroTagline:
      'Local-home cooking from $27 · Apsara dinner from $23 · Floating village from $25 · Khmer dress at Angkor from $25',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapKhmerHistoryCultureCuratedForSchema(),
    topPick,
    topPickHeading: "Top pick: Khmer cooking class at a local's home",
    transferSections: [
      {
        id: 'khmer-culture-experiences',
        title: 'Khmer history & culture experiences',
        description:
          'Life on Tonle Sap, classical Apsara dance, and traditional dress at Angkor Wat — three immersive ways to experience Khmer heritage beyond temple hopping.',
        tours: getSiemReapKhmerHistoryCultureThree(),
      },
    ],
    introParagraphs: [
      'Siem Reap’s culture lives on the water, on stage, and in home kitchens — not only inside Angkor’s stone temples.',
      'Below are four hand-picked experiences from a 3,000-review cooking class in a local home to sunset cruises on Southeast Asia’s largest lake. Book Apsara shows for evenings; floating village tours depart early afternoon.',
    ],
    comparisonSection: {
      title: 'Khmer culture tours — quick comparison',
      headers: ['Experience', 'Price from', 'Best for', 'Duration'],
      rows: [
        ['Local-home cooking class (top pick)', 'From $27', '3,004 reviews, market + 4 courses', '~3 hours'],
        ['Floating village + Khmer meal', 'From $25', 'Tonle Sap lake life & sunset', '~6 hours'],
        ['Apsara dance + buffet dinner', 'From $23', 'Classic Khmer evening show', '~3 hours'],
        ['Khmer costume at Angkor Wat', 'From $25', 'Traditional dress temple photos', '~4 hours'],
      ],
    },
    tipsSection: {
      title: 'Khmer culture tour tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Visit floating villages in dry season', 'Nov–May — lower water but easier village access'],
        ['Book Apsara shows for 6–7 PM', 'Dinner-and-show combos fill tables on peak nights'],
        ['Bring cash for community boat fees', 'Floating village tours often charge ~$5 for local boat rides'],
        ['Respect dress codes at temples', 'Cover shoulders and knees even in costume photo tours'],
        ['Pair cooking class with a temple-free day', 'Best recovery activity between long Angkor days'],
      ],
    },
    stats: {
      toursAvailable: 4,
      priceFrom: 23,
      duration: '3h – 6h',
      reviewCount: 3009,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Best Siem Reap Khmer Culture Tours (2026): Floating Villages & Apsara Dance | TopTours',
      description:
        'Compare Siem Reap Khmer culture tours from $23 — Tonle Sap floating villages, Apsara dance dinners, Angkor costume experiences, and local-home cooking classes.',
      keywords:
        'Siem Reap floating village tour, Apsara dance Siem Reap, Khmer cooking class, Angkor traditional dress, Khmer culture tour',
    },

    faqs: [
      {
        question: 'What is the best Khmer cultural experience in Siem Reap?',
        answer:
          'The Khmer Cooking Class at a Local\'s Home (5.0 from 3,004+ reviews, from $27) is our top pick for hands-on culture. For an evening, the Apsara Dancing Show with Buffet Dinner starts from $23 with hotel pickup.',
      },
      {
        question: 'Are Siem Reap floating village tours worth it?',
        answer:
          'Yes. The Tonle Sap Floating Village Tour (from $25) combines a local market, lake cruise at sunset, and a traditional Khmer meal — a unique look at life on Cambodia\'s great lake. Budget ~$5 extra for the community boat.',
      },
      {
        question: 'What is an Apsara dance show?',
        answer:
          'Apsara is classical Khmer dance dating to the Angkor era — slow, graceful movements with ornate costumes. The Amazon Angkor Restaurant show includes a Cambodian buffet and tuk-tuk pickup from $23.',
      },
      {
        question: 'Can I wear traditional Khmer dress at Angkor Wat?',
        answer:
          'Yes. The Khmer Traditional Custom Dressing Experience (from $25) provides costume, jewelry, guide, and transfers for temple photo walks. You still need a separate Angkor pass ($37).',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Siem Reap food & drink tours',
        href: '/destinations/siem-reap/guides/food-drink',
      },
      {
        label: 'Siem Reap attractions & museums',
        href: '/destinations/siem-reap/guides/attractions-museums',
      },
      {
        label: 'Angkor Wat sunrise complete guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
      },
      {
        label: 'Siem Reap countryside experiences',
        href: '/destinations/siem-reap/guides/countryside-and-village-experiences',
      },
      {
        label: 'Siem Reap half-day tours',
        href: '/destinations/siem-reap/guides/half-day-tours',
      },
    ],
  };
}
