/**
 * Editorial guide: Siem Reap nightlife & local entertainment — Apsara, circus, Pub Street & pub crawl.
 */

export const SIEM_REAP_NIGHTLIFE_SLUG = 'nightlife-and-local-entertainment';

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

export function getSiemReapNightlifeListingMeta() {
  return {
    category_slug: SIEM_REAP_NIGHTLIFE_SLUG,
    category_name: 'Nightlife & Local Entertainment',
    title: 'Best Siem Reap Nightlife (2026): Apsara Shows, Phare Circus & Pub Street',
    subtitle:
      'Hand-picked Siem Reap evening tours from $12 — Apsara dance dinner, Phare circus, night market walks, and Mad Monkey pub crawls on Pub Street.',
    hero_image: taImage('16/7c/28/8d', '720x480'),
  };
}

export function getSiemReapNightlifeTopPick() {
  return tour({
    productId: '231435P18',
    title: 'Apsara Dance Performance - Including Buffet Dinner',
    tagLabel: 'Top pick · 5.0★ Apsara show',
    operatorName: 'Bayon Temple Tour',
    imageUrl: taImage('16/7c/28/8d', '720x480'),
    durationLabel: '2–3 hours',
    priceFrom: 30,
    rating: 5,
    reviewCount: 1,
    bestFor:
      'Best for: Classic Khmer Apsara and folk dance with a traditional Cambodian buffet — highest-rated evening show on our list with tuk-tuk hotel pickup at 6:30 PM.',
    whoFor:
      'Culture lovers who want a polished dinner-and-show night without the party scene — performances start 7:30 PM daily.',
    details: [
      ['Operator', 'Bayon Temple Tour'],
      ['Rating', '5.0 from 1+ review — highest on this guide'],
      ['Price from', '$30'],
      ['Duration', '~2–3 hours'],
      ['Includes', 'Buffet dinner, show admission, shared tuk-tuk pickup & drop-off'],
      ['Note', 'Drinks not included · all sales final'],
      ['Schedule', 'Hotel pickup 6:30 PM · show from 7:30 PM'],
    ],
    summary:
      'Feast on Khmer buffet classics, then watch classical and folk Apsara dances in full costume — the top-rated cultural night out in Siem Reap.',
  });
}

export function getSiemReapNightlifeThree() {
  return [
    tour({
      productId: '53571P19',
      title: 'The Cambodian Circus Show and Pub Street Night Market',
      tagLabel: 'Private · Phare circus',
      operatorName: 'Bayon Tabi Tour',
      imageUrl: taImage('09/2b/aa/60'),
      durationLabel: '3 hours',
      priceFrom: 40,
      rating: 4.6,
      reviewCount: 9,
      bestFor:
        'Best for: 90 minutes of Phare Ponleu Selpak circus — acrobatics, theater, and Cambodian folk music — plus Pub Street night market afterward.',
      whoFor:
        'Travelers who want world-class circus arts with a social cause, then explore Siem Reap’s neon Pub Street strip.',
      details: [
        ['Operator', 'Bayon Tabi Tour'],
        ['Rating', '4.6 from 9+ reviews'],
        ['Price from', '$40'],
        ['Duration', '~3 hours'],
        ['Includes', 'Phare show ticket, private transport, Pub Street night market stop'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '152500P8',
      title: '( Free eSim) Night Market & pub street Night Life walking tour',
      tagLabel: 'Budget · Night market walk',
      operatorName: 'MyProGuide Cambodia',
      imageUrl: taImage('13/ba/c5/e5'),
      durationLabel: '2 hours',
      priceFrom: 12,
      rating: 4,
      reviewCount: 1,
      bestFor:
        'Best for: Guided walk through Siem Reap night market (45 min) then street-food tasting (45 min) with bonus free eSim and shared transport.',
      whoFor:
        'Budget travelers who want Pub Street atmosphere and local market snacks without a bar crawl — from just $12.',
      details: [
        ['Operator', 'MyProGuide Cambodia'],
        ['Rating', '4.0 from 1+ review'],
        ['Price from', '$12'],
        ['Duration', '~2 hours'],
        ['Includes', 'Guide, shared transport, free eSim'],
        ['Note', 'Food and drinks paid on site'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '398801P2',
      title: 'Siem Reap Pub Crawl Walking Tour',
      tagLabel: 'Party · Mad Monkey crawl',
      operatorName: 'Mad Monkey Siem Reap',
      imageUrl: taImage('12/05/17/cd'),
      durationLabel: '6 hours',
      priceFrom: 12,
      bestFor:
        'Best for: Mad Monkey Pub Street pub crawl — free singlet, cocktail, discounted drinks, and free shots from 7:30 PM at Canopy Bar through late-night bars.',
      whoFor:
        'Solo travelers and backpackers 18+ ready for a full party night on Siem Reap’s famous Pub Street.',
      details: [
        ['Operator', 'Mad Monkey Siem Reap'],
        ['Price from', '$12'],
        ['Duration', '~6 hours'],
        ['Includes', 'Mad Monkey singlet, 1 cocktail, discounted drinks, free shots'],
        ['Note', 'Meet Canopy Bar 7:30 PM · Pub Street bars from 11 PM · 18+ only'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapNightlifeCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapNightlifeTopPick());
  getSiemReapNightlifeThree().forEach(add);
  return ordered;
}

export function getSiemReapNightlifeGuideData() {
  const listing = getSiemReapNightlifeListingMeta();
  const topPick = getSiemReapNightlifeTopPick();

  return {
    guideLayout: 'siem-reap-nightlife',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Nightlife & local entertainment',
    toursSearchQuery: 'Siem Reap nightlife Apsara Pub Street pub crawl circus',
    heroImage: listing.hero_image,
    heroTagline:
      'Apsara dinner show from $30 · Phare circus from $40 · Night market walk from $12 · Pub crawl from $12',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapNightlifeCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Apsara dance performance with buffet dinner',
    transferSections: [
      {
        id: 'nightlife-entertainment',
        title: 'Siem Reap nightlife & evening entertainment',
        description:
          'Phare circus acrobatics, night market food walks, and Mad Monkey pub crawls — three evening picks from culture to party.',
        tours: getSiemReapNightlifeThree(),
      },
    ],
    introParagraphs: [
      'After temple days end, Siem Reap comes alive — Apsara dancers, Phare circus artists, neon Pub Street, and night markets that stay open late.',
      'Below are four hand-picked evening experiences from a 5-star Apsara dinner show ($30) to $12 pub crawls. Most shows start around 7:30 PM; pub crawls meet from 7:30 PM and run into the night.',
    ],
    comparisonSection: {
      title: 'Nightlife tours — quick comparison',
      headers: ['Experience', 'Price from', 'Best for', 'Duration'],
      rows: [
        ['Apsara dance + buffet (top pick)', 'From $30', 'Highest-rated cultural dinner show', '~2–3 hours'],
        ['Phare circus + night market', 'From $40', 'Acrobatic circus + Pub Street', '~3 hours'],
        ['Night market & Pub Street walk', 'From $12', 'Budget food & market intro', '~2 hours'],
        ['Mad Monkey pub crawl', 'From $12', 'Full Pub Street party night', '~6 hours'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap nightlife tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Book Apsara shows ahead on weekends', 'Dinner-and-show tables fill on peak nights'],
        ['Phare circus sells out in high season', 'Book a day or two early Nov–Feb'],
        ['Pub crawl is 18+ with valid ID', 'Required at Mad Monkey front desk before departure'],
        ['Night market food is paid separately', 'Bring small USD notes for street snacks'],
        ['Wear comfortable shoes for Pub Street', 'Cobblestones and crowds after 10 PM'],
      ],
    },
    stats: {
      toursAvailable: 4,
      priceFrom: 12,
      duration: '2h – 6h',
      reviewCount: 11,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Best Siem Reap Nightlife (2026): Apsara Shows, Pub Street & Pub Crawl | TopTours',
      description:
        'Compare Siem Reap nightlife from $12 — Apsara dance dinners, Phare circus, night market walks, and Pub Street pub crawls with real reviews.',
      keywords:
        'Siem Reap nightlife, Apsara dance show, Phare circus Siem Reap, Pub Street pub crawl, night market Siem Reap',
    },

    faqs: [
      {
        question: 'What is the best evening show in Siem Reap?',
        answer:
          'The Apsara Dance Performance with Buffet Dinner (5.0 stars, from $30) is our top pick for traditional Khmer culture. For acrobatic theater, Phare Cambodian Circus (4.6 from 9+ reviews, from $40) is the most-reviewed show on this guide.',
      },
      {
        question: 'Is Pub Street worth visiting in Siem Reap?',
        answer:
          'Yes. Pub Street is Siem Reap\'s nightlife hub with bars, neon signs, and street food. The Night Market walking tour ($12) introduces the area, or the Mad Monkey pub crawl ($12) covers multiple bars with drinks included.',
      },
      {
        question: 'What time do Siem Reap evening shows start?',
        answer:
          'Apsara performances typically start at 7:30 PM with hotel pickup at 6:30 PM. Phare circus evening shows vary by season — check your booking. Pub crawls meet at Mad Monkey from 7:30 PM.',
      },
      {
        question: 'Is the Siem Reap pub crawl good for solo travelers?',
        answer:
          'Yes. The Mad Monkey Pub Crawl ($12) is designed for meeting other travelers — includes a singlet, cocktail, free shots, and guided bar hops on Pub Street. Must be 18+ with valid ID.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Siem Reap food & drink tours',
        href: '/destinations/siem-reap/guides/food-drink',
      },
      {
        label: 'Khmer history & culture walks',
        href: '/destinations/siem-reap/guides/khmer-history-and-culture-walks',
      },
      {
        label: 'Siem Reap spring break',
        href: '/destinations/siem-reap/guides/spring-break',
      },
      {
        label: 'Siem Reap half-day tours',
        href: '/destinations/siem-reap/guides/half-day-tours',
      },
      {
        label: 'Angkor Wat sunrise guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
      },
    ],
  };
}
