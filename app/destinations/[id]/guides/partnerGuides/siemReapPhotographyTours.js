/**
 * Editorial guide: Siem Reap photography tours — Angkor photoshoots with pro photographers.
 */

export const SIEM_REAP_PHOTOGRAPHY_TOURS_SLUG = 'photography-tours';

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

export function getSiemReapPhotographyToursListingMeta() {
  return {
    category_slug: SIEM_REAP_PHOTOGRAPHY_TOURS_SLUG,
    category_name: 'Photography Tours',
    title: 'Best Siem Reap Photography Tours (2026): Angkor Photoshoots & Pro Temple Shoots',
    subtitle:
      'Hand-picked Angkor photography tours from $59 — private sunrise shoots with 60+ edited photos, couple & family sessions at Ta Prohm, and Sony A7R4 pro photographer packages.',
    hero_image: taImage('16/68/ea/be', '720x480'),
  };
}

export function getSiemReapPhotographyToursTopPick() {
  return tour({
    productId: '70177P2',
    title: 'Professional Photo Shoot in Angkor Archaeological Park, Siem Reap',
    tagLabel: 'Top pick · Most reviews',
    operatorName: 'Travel Through the Real Cambodia',
    imageUrl: taImage('16/68/ea/be', '720x480'),
    durationLabel: '6 hours',
    priceFrom: 70,
    rating: 5,
    reviewCount: 44,
    bestFor:
      'Best for: A fully private Angkor photoshoot — sunrise at Angkor Wat, jungle temples like Ta Prohm and Bayon, and 60–70 edited high-res photos plus unlimited raw files.',
    whoFor:
      'Couples, families, and solo travelers who want the most-reviewed photography tour on our list (44 five-star reviews) with tuk-tuk transport and a customizable route.',
    details: [
      ['Operator', 'Travel Through the Real Cambodia'],
      ['Type', 'Private · photographer + guide + tuk-tuk'],
      ['Rating', '5.0 from 44+ reviews'],
      ['Price from', '$70'],
      ['Duration', '~6 hours'],
      ['Includes', 'Pro photographer, guide, tuk-tuk, hotel pickup, 60–70 edited photos & raw files'],
      ['Note', 'Angkor Pass (~$37) & meals not included'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'The most-booked Angkor photography experience on our list — your own local photographer and guide craft a 100% personalized route from sunrise at Angkor Wat through vine-covered Ta Prohm, delivering a full portfolio of edited images.',
  });
}

export function getSiemReapPhotographyToursThree() {
  return [
    tour({
      productId: '369596P1',
      title: 'Unseen Angkor Tour & Photoshoot',
      tagLabel: 'Private · Couple & family',
      operatorName: 'Unseen Angkor Tour & Photoshoot',
      imageUrl: taImage('10/08/14/95'),
      durationLabel: '5 hours',
      priceFrom: 80.1,
      rating: 5,
      reviewCount: 7,
      bestFor:
        'Best for: A guided temple loop with a photographer in tow — Angkor Wat, Phimeanakas, Ta Som, and Banteay Kdei sunset over rice fields and lotus farms, plus 20 edited photos.',
      whoFor:
        'Couples and families who want sightseeing and a professional shoot combined — enjoy the tour while your photographer captures the best frames.',
      details: [
        ['Operator', 'Unseen Angkor Tour & Photoshoot'],
        ['Type', 'Private · tour + photoshoot'],
        ['Rating', '5.0 from 7+ reviews'],
        ['Price from', '$80.10'],
        ['Duration', '~5 hours'],
        ['Includes', 'Photographer on tour, 20 selected high-res digital photos, water'],
        ['Note', 'Angkor day pass (~$37) purchased separately'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '5575949P23',
      title: 'Angkor Wat Private Photo Tour Pro Photographer and Sony A7R4',
      tagLabel: 'Budget pick · Sony A7R4',
      operatorName: 'T-vision Trip',
      imageUrl: taImage('r/32/8b/8a/b2/caption'),
      durationLabel: '5 hours',
      priceFrom: 59,
      rating: null,
      reviewCount: null,
      bestFor:
        'Best for: Flexible shooting at Bayon, Ta Prohm, and Angkor Wat with a pro Sony A7R4 photographer — four package tiers from photographer-only to guide + tickets included.',
      whoFor:
        'Photo enthusiasts on a budget who want retouched digital deliverables and a customizable half-day route without paying for a full guided history tour.',
      details: [
        ['Operator', 'T-vision Trip'],
        ['Type', 'Private · pro photographer packages'],
        ['Price from', '$59'],
        ['Duration', '~5 hours'],
        ['Includes', 'Sony A7R4 shoot, retouched photos, tuk-tuk or A/C car transfers'],
        ['Note', 'Choose package with or without $37 Angkor pass & licensed guide'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '63511P849',
      title: 'Private Photo Session with a Local Photographer in Siem Reap',
      tagLabel: 'Vacation · Localgrapher',
      operatorName: 'Localgrapher',
      imageUrl: taImage('07/38/94/96'),
      durationLabel: '30 minutes',
      priceFrom: 270,
      rating: null,
      reviewCount: null,
      bestFor:
        'Best for: A focused vacation photoshoot — honeymoon, family, couple, or solo portraits at hand-picked Siem Reap locations with edited HD photos delivered within 4 working days.',
      whoFor:
        'Travelers who want a global vacation-photography network (700+ destinations) with location and outfit recommendations plus a 100% money-back satisfaction guarantee — no temple tour required.',
      details: [
        ['Operator', 'Localgrapher'],
        ['Type', 'Private · vacation photo session'],
        ['Price from', '$270'],
        ['Duration', '~30 minutes'],
        ['Includes', 'Private session, location tips, edited HD photos within 4 work days'],
        ['Note', 'Angkor Pass not required for non-temple city locations; all sales final'],
        ['Cancellation', 'All sales final'],
      ],
    }),
  ];
}

export function getSiemReapPhotographyToursCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapPhotographyToursTopPick());
  getSiemReapPhotographyToursThree().forEach(add);
  return ordered;
}

export function getSiemReapPhotographyToursGuideData() {
  const listing = getSiemReapPhotographyToursListingMeta();
  const topPick = getSiemReapPhotographyToursTopPick();

  return {
    guideLayout: 'siem-reap-photography-tours',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Photography tours',
    toursSearchQuery: 'Siem Reap Angkor photography photoshoot tour',
    heroImage: listing.hero_image,
    heroTagline: 'Pro Angkor shoots from $59 · 60+ edited photos from $70 · couple & family sessions from $80',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapPhotographyToursCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Professional photo shoot in Angkor Archaeological Park',
    transferSections: [
      {
        id: 'angkor-photoshoots',
        title: 'More Angkor photography & photoshoot tours',
        description:
          'Couple and family temple sessions, flexible Sony A7R4 pro shoots, and premium Localgrapher vacation portraits — three more picks from $59.',
        tours: getSiemReapPhotographyToursThree(),
      },
    ],
    introParagraphs: [
      'Angkor’s stone corridors, strangler fig roots, and golden-hour reflections deserve better than a selfie stick. These private photography tours pair you with a local pro who knows where the light falls at Ta Prohm and how to beat the sunrise crowds at Angkor Wat.',
      'All four picks below are private experiences — compare deliverables (20 vs 60+ edited photos), session length (30 minutes to 6 hours), and whether the Angkor Pass is needed (~$37 for temple shoots).',
    ],
    comparisonSection: {
      title: 'Which Angkor photography tour fits you?',
      headers: ['Tour', 'Price from', 'Photos delivered', 'Best for'],
      rows: [
        ['Professional Photo Shoot (top pick)', 'From $70', '60–70 edited + raw files', 'Full portfolio, sunrise, most reviews'],
        ['Unseen Angkor Tour & Photoshoot', 'From $80', '20 selected high-res edits', 'Couples & families, sunset lotus fields'],
        ['Sony A7R4 Private Photo Tour', 'From $59', 'Retouched digital package', 'Budget pro shoot, flexible packages'],
        ['Localgrapher vacation session', 'From $270', 'Edited HD within 4 work days', 'Honeymoon & family portraits, 30 min'],
      ],
    },
    tipsSection: {
      title: 'Angkor photography tour tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Book sunrise shoots the day before your pass', 'Buy the Angkor Pass after 4:30pm for same-day evening + next-morning entry'],
        ['Wear solid colors, avoid busy patterns', 'Stone backgrounds pop with white, red, or earth tones — photographers often suggest this'],
        ['Confirm photo delivery timeline', 'Most operators send edits within 3–7 days; ask about raw file access if you edit yourself'],
        ['Bring comfortable shoes for temple steps', 'You will walk 5–6 hours between shooting spots'],
        ['Check if guide is included', 'Photographer-only packages save money if you already know the temple names'],
      ],
    },
    stats: {
      toursAvailable: 4,
      priceFrom: 59,
      duration: '30 min – 6h',
      reviewCount: 51,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Best Siem Reap Photography Tours (2026): Angkor Photoshoots | TopTours',
      description:
        'Compare Siem Reap photography tours from $59 — private Angkor Wat photoshoots with 60+ edited photos, couple sessions at Ta Prohm, and Sony A7R4 pro photographer packages.',
      keywords:
        'Siem Reap photography tour, Angkor Wat photoshoot, Ta Prohm photo shoot, Angkor professional photographer, Cambodia couple photoshoot',
    },

    faqs: [
      {
        question: 'What is the best photography tour in Siem Reap?',
        answer:
          'The Professional Photo Shoot in Angkor Archaeological Park (5.0 from 44+ reviews, from $70) is our top pick — private tuk-tuk, customizable route, and 60–70 edited photos plus unlimited raw files.',
      },
      {
        question: 'Do photography tours include the Angkor Pass?',
        answer:
          'Usually no. Most tours require you to buy a one-day pass (~$37) at the ticket office. The T-vision Sony A7R4 tour offers package tiers with admission tickets bundled — check your selected package at checkout.',
      },
      {
        question: 'How many photos will I receive?',
        answer:
          'Unseen Angkor delivers 20 selected high-resolution edits. Travel Through the Real Cambodia provides 60–70 edited photos plus unlimited raw files. T-vision Trip includes professionally retouched digital photos per package tier. Localgrapher delivers edited HD pictures within 4 working days with a satisfaction guarantee.',
      },
      {
        question: 'Can I do a couple or engagement shoot at Angkor?',
        answer:
          'Yes. Unseen Angkor Tour & Photoshoot specializes in couple and family sessions across Angkor Wat, Ta Som, and sunset at Banteay Kdei. The Professional Photo Shoot tour is also fully private and 100% personalized for couples.',
      },
      {
        question: 'What should I wear for an Angkor photoshoot?',
        answer:
          'Temple dress code requires covered shoulders and knees. Solid, flowing fabrics photograph beautifully against grey stone — many travelers bring a change for rice-field sunset shots at Banteay Kdei.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Angkor Wat sunrise complete guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
      },
      {
        label: 'Siem Reap half-day tours',
        href: '/destinations/siem-reap/guides/half-day-tours',
      },
      {
        label: 'Siem Reap shore excursions & Angkor tours',
        href: '/destinations/siem-reap/guides/shore-excursions',
      },
      {
        label: 'Siem Reap hidden costs & Angkor Pass fees',
        href: '/destinations/siem-reap/guides/additional-fees',
      },
      {
        label: 'Siem Reap overnight tours',
        href: '/destinations/siem-reap/guides/overnight-tours',
      },
    ],
  };
}
