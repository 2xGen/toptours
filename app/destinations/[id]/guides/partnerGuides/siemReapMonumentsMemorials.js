/**
 * Editorial guide: Siem Reap monuments & memorials — temples, war history & floating villages.
 */

export const SIEM_REAP_MONUMENTS_MEMORIALS_SLUG = 'monuments-and-memorials';

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

export function getSiemReapMonumentsMemorialsListingMeta() {
  return {
    category_slug: SIEM_REAP_MONUMENTS_MEMORIALS_SLUG,
    category_name: 'Monuments & Memorials',
    title: 'Best Siem Reap Monuments & Memorials Tours (2026): Angkor, War Museum & Killing Fields',
    subtitle:
      'Hand-picked Siem Reap monument tours from $15 — private Angkor tuk-tuk, small-group temple explorer, war museum & Kampong Phluk, and killing field city highlights.',
    hero_image: taImage('0b/01/07/9f', '720x480'),
  };
}

export function getSiemReapMonumentsMemorialsTopPick() {
  return tour({
    productId: '270263P2',
    title: 'Private Tuk Tuk Tour to Angkor Wat and Small Circle with Two Extras',
    tagLabel: 'Top pick · Private Angkor',
    operatorName: 'Angkor-Travel Tours',
    imageUrl: taImage('0b/01/07/9f', '720x480'),
    durationLabel: '9–10 hours',
    priceFrom: 15,
    rating: 5,
    reviewCount: 3,
    bestFor:
      'Best for: Private tuk-tuk small circuit — Angkor Wat twice (morning + golden hour), Ta Prohm, Angkor Thom, plus two hidden jungle temples from just $15.',
    whoFor:
      'Independent temple explorers who want a driver (not a guide) and flexibility to wander each site at their own pace with water included.',
    details: [
      ['Operator', 'Angkor-Travel Tours'],
      ['Rating', '5.0 from 3+ reviews'],
      ['Price from', '$15'],
      ['Duration', '~9–10 hours'],
      ['Includes', 'Private tuk-tuk, English-speaking driver, drinking water'],
      ['Note', 'Angkor pass $37/person not included · lunch at Srah Srang reservoir'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'See Angkor Wat from both sides in the best light, explore Ta Prohm’s jungle roots and Bayon’s stone faces, and discover two bonus hidden temples — the best-value private monument day in Siem Reap.',
  });
}

export function getSiemReapMonumentsMemorialsThree() {
  return [
    tour({
      productId: '415085P16',
      title: 'Kampong Phluk Floating Village with War Museum & Killing Field',
      tagLabel: 'Private · History + village',
      operatorName: 'Angkor Daily Trip',
      imageUrl: taImage('16/23/21/51'),
      durationLabel: '6 hours',
      priceFrom: 85,
      rating: 5,
      reviewCount: 8,
      bestFor:
        'Best for: War Museum relics, Wat Thmey killing field memorial, and an afternoon boat cruise through Kampong Phluk’s stilted houses and mangroves.',
      whoFor:
        'Travelers who want Cambodia’s civil-war history and living water culture in one private day with A/C transport and English guide.',
      details: [
        ['Operator', 'Angkor Daily Trip'],
        ['Rating', '5.0 from 8+ reviews'],
        ['Price from', '$85'],
        ['Duration', '~6 hours'],
        ['Includes', 'Guide, A/C vehicle, hotel pickup, war museum, killing field, floating village cruise'],
        ['Note', 'Meals and gratuities not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '139551P2',
      title: 'Full Day Temples Explorer - Small Group',
      tagLabel: 'Budget · Small group temples',
      operatorName: 'Tourme ANGKOR',
      imageUrl: taImage('13/eb/53/e9'),
      durationLabel: '8 hours',
      priceFrom: 19,
      rating: 4.9,
      reviewCount: 10,
      bestFor:
        'Best for: Angkor Wat, Angkor Thom south gate, Bayon’s 200+ faces, and Ta Prohm in an air-conditioned minivan — max 10 guests from $19.',
      whoFor:
        'Budget travelers who want a licensed English guide and crowd-smart temple routing without paying for a private car.',
      details: [
        ['Operator', 'Tourme ANGKOR'],
        ['Rating', '4.9 from 10+ reviews'],
        ['Price from', '$19'],
        ['Duration', '~8 hours'],
        ['Includes', 'Licensed guide, A/C minivan (max 10), water, hotel pickup'],
        ['Note', 'Angkor pass paid on site · children under 5 not allowed'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '166746P9',
      title: 'Killing Fields & Hidden Gem Highlights Guided Tour',
      tagLabel: 'Private · City memorials',
      operatorName: 'Siem Reap Locals',
      imageUrl: taImage('r/33/80/75/0a/caption'),
      durationLabel: '4–5 hours',
      priceFrom: 55,
      bestFor:
        'Best for: Wat Thmey memorial, fallen soldiers monument, Phsar Leu market, Royal Garden fruit bats, Wat Preah Prom Rath, and Artisans Angkor by tuk-tuk.',
      whoFor:
        'History-minded travelers who want Siem Reap’s memorials woven into a broader city culture loop — not only the killing fields.',
      details: [
        ['Operator', 'Siem Reap Locals'],
        ['Price from', '$55'],
        ['Duration', '~4–5 hours'],
        ['Includes', 'English guide, tuk-tuk pickup & drop-off, cold water'],
        ['Note', 'Killing field entrance fees paid on site'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapMonumentsMemorialsCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapMonumentsMemorialsTopPick());
  getSiemReapMonumentsMemorialsThree().forEach(add);
  return ordered;
}

export function getSiemReapMonumentsMemorialsGuideData() {
  const listing = getSiemReapMonumentsMemorialsListingMeta();
  const topPick = getSiemReapMonumentsMemorialsTopPick();

  return {
    guideLayout: 'siem-reap-monuments-memorials',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Monuments & memorials',
    toursSearchQuery: 'Siem Reap Angkor monuments war museum killing fields memorial',
    heroImage: listing.hero_image,
    heroTagline:
      'Private Angkor tuk-tuk from $15 · Temple small group from $19 · Killing fields city tour from $55 · Kampong Phluk + war history from $85',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapMonumentsMemorialsCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Private Angkor Wat tuk-tuk small circuit',
    transferSections: [
      {
        id: 'monuments-memorials',
        title: 'Monuments, temples & memorial tours',
        description:
          'Angkor’s stone monuments, Khmer Rouge memorials, and floating village life — three guided picks from budget temple days to private history tours.',
        tours: getSiemReapMonumentsMemorialsThree(),
      },
    ],
    introParagraphs: [
      'Siem Reap’s monuments span millennia — from Angkor Wat’s sandstone towers to Wat Thmey’s skull stupa and the war museum’s rusted tanks.',
      'Below are four hand-picked tours from a $15 private tuk-tuk temple circuit to a $85 day combining killing fields with Kampong Phluk floating village. All temple tours require a separate Angkor pass ($37/day).',
    ],
    comparisonSection: {
      title: 'Monument & memorial tours — quick comparison',
      headers: ['Tour', 'Price from', 'Best for', 'Duration'],
      rows: [
        ['Private Angkor tuk-tuk (top pick)', 'From $15', 'Angkor Wat twice + hidden temples', '~9–10 hours'],
        ['Full Day Temples Explorer', 'From $19', 'Budget small-group Angkor circuit', '~8 hours'],
        ['Killing fields & city highlights', 'From $55', 'Memorials + markets + pagodas', '~4–5 hours'],
        ['Kampong Phluk + war museum', 'From $85', 'History + floating village boat', '~6 hours'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap monument visit tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Buy Angkor pass the night before', 'Queues at the ticket office delay morning sunrise starts'],
        ['Dress respectfully at temples and pagodas', 'Shoulders and knees covered at sacred sites'],
        ['War museum visits are emotionally heavy', 'Pair with a lighter afternoon like floating village'],
        ['Private tuk-tuk tours use drivers not guides', 'Hire a licensed guide separately if you want deep history'],
        ['Kampong Phluk best in wet season', 'Jun–Oct — higher water levels for mangrove boat rides'],
      ],
    },
    stats: {
      toursAvailable: 4,
      priceFrom: 15,
      duration: '4h – 10h',
      reviewCount: 21,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Best Siem Reap Monuments & Memorials Tours (2026): Angkor & Killing Fields | TopTours',
      description:
        'Compare Siem Reap monument tours from $15 — private Angkor tuk-tuk, temple small groups, war museum, killing fields, and Kampong Phluk floating village.',
      keywords:
        'Siem Reap monuments tour, Angkor Wat tuk-tuk, war museum Siem Reap, killing fields tour, Kampong Phluk floating village',
    },

    faqs: [
      {
        question: 'What is the best Angkor monument tour in Siem Reap?',
        answer:
          'Our top pick is the Private Tuk Tuk Tour to Angkor Wat and Small Circle with Two Extras (from $15) — Angkor Wat visited twice for best light, plus Ta Prohm, Bayon, and two hidden temples. For guided commentary, the Full Day Temples Explorer small group starts from $19.',
      },
      {
        question: 'Where are the killing fields in Siem Reap?',
        answer:
          'Wat Thmey on the outskirts of Siem Reap is the main killing field memorial, with a stupa of Khmer Rouge victims. The Killing Fields & Hidden Gem tour ($55) and Kampong Phluk + War Museum tour ($85) both include this site.',
      },
      {
        question: 'Is the Siem Reap War Museum worth visiting?',
        answer:
          'Yes. The Cambodia War Museum displays tanks, helicopters, and veteran stories from the civil war era. It is included on the Kampong Phluk Floating Village with War Museum & Killing Field tour from $85.',
      },
      {
        question: 'Do I need an Angkor pass for monument tours?',
        answer:
          'Yes for all Angkor Archaeological Park temples. A 1-day pass costs $37 per person, paid at the ticket office — not included on tuk-tuk or small-group temple tours listed here.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Angkor Wat sunrise complete guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
      },
      {
        label: 'Siem Reap attractions & museums',
        href: '/destinations/siem-reap/guides/attractions-museums',
      },
      {
        label: 'Siem Reap Khmer history & culture',
        href: '/destinations/siem-reap/guides/khmer-history-and-culture-walks',
      },
      {
        label: 'Siem Reap half-day tours',
        href: '/destinations/siem-reap/guides/half-day-tours',
      },
      {
        label: 'Siem Reap bus tours',
        href: '/destinations/siem-reap/guides/bus-tours',
      },
    ],
  };
}
