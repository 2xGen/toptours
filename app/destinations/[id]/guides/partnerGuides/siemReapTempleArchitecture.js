/**
 * Editorial guide: Siem Reap temple architecture & archaeology — Angkor Wat, Bayon, Ta Prohm circuits.
 */

export const SIEM_REAP_TEMPLE_ARCHITECTURE_SLUG = 'temple-architecture-and-archaeology';

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

export function getSiemReapTempleArchitectureListingMeta() {
  return {
    category_slug: SIEM_REAP_TEMPLE_ARCHITECTURE_SLUG,
    category_name: 'Temple Architecture & Archaeology',
    title: 'Siem Reap Temple Architecture & Archaeology Tours (2026): Angkor Wat, Bayon & Ta Prohm',
    subtitle:
      'Hand-picked Angkor architecture tours from $10 — a 2-day historian-guided temple deep dive, sunrise highlights with breakfast, and private tuk-tuk small-loop circuits.',
    hero_image: taImage('07/72/59/2b', '720x480'),
  };
}

export function getSiemReapTempleArchitectureTopPick() {
  return tour({
    productId: '31721P17',
    title: '2 Days Exclusive Temple Highlights with Sunset and Sunrise Tour',
    tagLabel: 'Top pick · 1,251 reviews · Historian guide',
    operatorName: 'Journey Cambodia',
    imageUrl: taImage('07/72/59/2b', '720x480'),
    durationLabel: '2 days',
    priceFrom: 49,
    rating: 5,
    reviewCount: 1251,
    bestFor:
      'Best for: A two-day, historian-led study of Khmer architecture — Angkor Wat at sunrise, Bayon’s 200+ stone faces, and hidden gems explained across 600 years of empire (802–1432 AD).',
    whoFor:
      'Architecture and archaeology enthusiasts who want depth over a rushed day trip — by far the most-reviewed temple deep dive on our list, with private and small-group options.',
    details: [
      ['Operator', 'Journey Cambodia'],
      ['Rating', '5.0 from 1,251+ reviews — highest on this guide'],
      ['Price from', '$49'],
      ['Duration', '2 days (48 hours)'],
      ['Includes', 'Historian guide, A/C vehicle, hotel pickup, water & cool towel, sunset stop'],
      ['Note', 'Angkor 2–3 day pass ($62) paid on site · cover shoulders & knees'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'Two unhurried days decoding Angkor’s architecture with a personal historian — sunrise at Angkor Wat, the enigmatic Bayon faces, and lesser-seen carvings most one-day tours skip.',
  });
}

export function getSiemReapTempleArchitectureThree() {
  return [
    tour({
      productId: '142149P20',
      title: 'Angkor Wat Sunrise & Main Temples Highlight with Breakfast',
      tagLabel: 'Budget · Sunrise + breakfast',
      operatorName: 'Pitt Angkor Tour',
      imageUrl: taImage('09/dd/e7/64'),
      durationLabel: '7 hours',
      priceFrom: 10,
      rating: 5,
      reviewCount: 4,
      bestFor:
        'Best for: An APSARA-authorised guide walking you through the art and architecture of the three main temples after an Angkor Wat sunrise — from just $10.',
      whoFor:
        'Budget travelers who still want a licensed expert explaining the carvings, not just a driver — early 4:20–5:10 AM pickup, drop-off by 1 PM.',
      details: [
        ['Operator', 'Pitt Angkor Tour'],
        ['Rating', '5.0 from 4+ reviews'],
        ['Price from', '$10'],
        ['Duration', '~7 hours'],
        ['Includes', 'APSARA-authorised guide, hotel pickup, cold water'],
        ['Note', 'Angkor Pass, food & tips not included · all sales final'],
      ],
    }),
    tour({
      productId: '5644257P14',
      title: 'Wang 007 - One Day Explore Angkor Wat Small Loop Tour',
      tagLabel: 'New · Private tuk-tuk small loop',
      operatorName: 'Wang Siem Reap Driver',
      imageUrl: taImage('r/32/bd/17/46/caption'),
      durationLabel: '8 hours',
      priceFrom: 20,
      rating: 5,
      reviewCount: 7,
      bestFor:
        'Best for: The classic small-loop architecture circuit by private tuk-tuk — Angkor Wat, Angkor Thom, Bayon bas-reliefs, Ta Prohm’s roots, and Banteay Kdei.',
      whoFor:
        'Independent travelers who want a flexible private driver and the freedom to linger at each temple — guide can be added separately.',
      details: [
        ['Operator', 'Wang Siem Reap Driver'],
        ['Rating', '5.0 from 7+ reviews'],
        ['Price from', '$20'],
        ['Duration', '~8 hours'],
        ['Includes', 'Private tuk-tuk, English-speaking driver, cold water & towels, hotel pickup'],
        ['Note', 'Angkor Pass and licensed guide not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '5579643P2',
      title: 'Full Day Angkor Wat Temples Tour with Pickup',
      tagLabel: 'Private · Tomb Raider temple',
      operatorName: 'La English Speaking Private Driver',
      imageUrl: taImage('15/9b/9d/3c'),
      durationLabel: '6–7 hours',
      priceFrom: 30,
      rating: 5,
      reviewCount: 23,
      bestFor:
        'Best for: A comprehensive Angkor Wat and Angkor Thom day — Bayon’s stone faces, the ancient Baphuon, the Elephant Terrace, and Ta Prohm of Tomb Raider fame.',
      whoFor:
        'Travelers who want a private tuk-tuk and a relaxed full-day architecture circuit with pickup, water, and cold towels included.',
      details: [
        ['Operator', 'La English Speaking Private Driver'],
        ['Rating', '5.0 from 23+ reviews'],
        ['Price from', '$30'],
        ['Duration', '~6–7 hours'],
        ['Includes', 'Private tuk-tuk, hotel pickup & drop-off, cold water & towels'],
        ['Note', 'Angkor Pass not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapTempleArchitectureCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapTempleArchitectureTopPick());
  getSiemReapTempleArchitectureThree().forEach(add);
  return ordered;
}

export function getSiemReapTempleArchitectureGuideData() {
  const listing = getSiemReapTempleArchitectureListingMeta();
  const topPick = getSiemReapTempleArchitectureTopPick();

  return {
    guideLayout: 'siem-reap-temple-architecture',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Temple architecture & archaeology',
    toursSearchQuery: 'Siem Reap Angkor temple architecture tour',
    heroImage: listing.hero_image,
    heroTagline:
      '2-day historian temple deep dive from $49 · Sunrise + breakfast from $10 · Private tuk-tuk circuits from $20',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapTempleArchitectureCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: 2-day exclusive temple highlights with a historian guide',
    transferSections: [
      {
        id: 'angkor-architecture-tours',
        title: 'Angkor temple architecture & archaeology tours',
        description:
          'Decode Khmer architecture across Angkor Wat, Angkor Thom, Bayon, Baphuon, and Ta Prohm — from budget sunrise highlights to private full-day circuits.',
        tours: getSiemReapTempleArchitectureThree(),
      },
    ],
    introParagraphs: [
      'The temples of Angkor represent 600 years of Khmer civilisation (802–1432 AD) — from the symmetrical galleries of Angkor Wat to Bayon’s 200-plus carved faces and the strangler-fig roots swallowing Ta Prohm. To truly read the architecture, the guide matters as much as the itinerary.',
      'Below are four hand-picked tours focused on temple art and archaeology — led by APSARA-authorised guides and historians. Start with a budget sunrise highlight, go private by tuk-tuk, or take two unhurried days to study the carvings in depth.',
    ],
    comparisonSection: {
      title: 'Temple architecture tours — quick comparison',
      headers: ['Experience', 'Price from', 'Best for', 'Duration'],
      rows: [
        ['2-day exclusive highlights (top pick)', 'From $49', 'Historian-led architecture deep dive', '2 days'],
        ['Sunrise & main temples + breakfast', 'From $10', 'Budget APSARA-guided highlights', '~7 hours'],
        ['Wang 007 small-loop private tuk-tuk', 'From $20', 'Flexible private circuit', '~8 hours'],
        ['Full-day Angkor Wat temples + pickup', 'From $30', 'Private tuk-tuk, Ta Prohm included', '~6–7 hours'],
      ],
    },
    tipsSection: {
      title: 'Angkor architecture tour tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Buy the right Angkor Pass', '1-day ($37) suits single circuits; 2–3 day ($62) is needed for the 2-day deep dive'],
        ['Hire a licensed guide for the carvings', 'Drivers handle transport; APSARA-authorised guides explain the bas-reliefs and history'],
        ['Cover shoulders and knees', 'Required for entry — light long layers also help with sunrise chill and midday heat'],
        ['Start at sunrise for Bayon light', 'Morning side-light brings out the depth of the stone faces and reliefs'],
        ['Save Ta Prohm for later morning', 'Crowds thin after the sunrise rush, making the tree-root architecture easier to photograph'],
      ],
    },
    stats: {
      toursAvailable: 4,
      priceFrom: 10,
      duration: '7h – 2 days',
      reviewCount: 1285,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title:
        'Siem Reap Temple Architecture & Archaeology Tours (2026): Angkor Wat, Bayon & Ta Prohm | TopTours',
      description:
        'Compare Siem Reap temple architecture tours from $10 — a 2-day historian-led Angkor deep dive (1,251+ reviews), sunrise highlights with breakfast, and private tuk-tuk temple circuits.',
      keywords:
        'Siem Reap temple tour, Angkor Wat architecture tour, Bayon temple tour, Ta Prohm tour, Angkor archaeology tour, Khmer temple guide',
    },

    faqs: [
      {
        question: 'What is the best temple architecture tour in Siem Reap?',
        answer:
          'The 2 Days Exclusive Temple Highlights with Sunset and Sunrise Tour (5.0 from 1,251+ reviews, from $49) is our top pick — a historian-led deep dive across Angkor Wat, Bayon, and lesser-seen carvings over two unhurried days.',
      },
      {
        question: 'Do I need a guide to understand Angkor’s architecture?',
        answer:
          'Highly recommended. Private tuk-tuk tours like Wang 007 ($20) and La’s full-day tour ($30) include an English-speaking driver but not a licensed guide. For the carvings and history, choose an APSARA-authorised guide such as the $10 sunrise highlight or the 2-day deep dive.',
      },
      {
        question: 'How much is an Angkor temple tour?',
        answer:
          'Budget sunrise highlights start from $10. Private tuk-tuk full-day circuits run $20–$30. The 2-day historian-guided architecture tour starts from $49. The Angkor Pass ($37 for one day, $62 for 2–3 days) is paid separately on site.',
      },
      {
        question: 'Which temples cover the best architecture and archaeology?',
        answer:
          'Angkor Wat (classical galleries and bas-reliefs), Bayon (200+ carved faces), Baphuon, the Elephant Terrace in Angkor Thom, and Ta Prohm (the Tomb Raider tree-root temple) are the architectural highlights every tour on this list covers.',
      },
      {
        question: 'How many days do I need for Angkor temples?',
        answer:
          'One full day covers the main circuit (Angkor Wat, Bayon, Ta Prohm). For architecture and archaeology lovers, two days lets you study the carvings without rushing — which is why our top pick is the 2-day historian tour.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Angkor Wat sunrise complete guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
      },
      {
        label: 'Siem Reap full-day tours',
        href: '/destinations/siem-reap/guides/full-day-tours',
      },
      {
        label: 'Siem Reap half-day tours',
        href: '/destinations/siem-reap/guides/half-day-tours',
      },
      {
        label: 'Siem Reap Khmer history & culture walks',
        href: '/destinations/siem-reap/guides/khmer-history-and-culture-walks',
      },
      {
        label: 'Siem Reap attractions & museums',
        href: '/destinations/siem-reap/guides/attractions-museums',
      },
    ],
  };
}
