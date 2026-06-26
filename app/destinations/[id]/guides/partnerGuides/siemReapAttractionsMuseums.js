/**
 * Editorial guide: Siem Reap attractions & museums — war history, national museum & Kulen park.
 */

export const SIEM_REAP_ATTRACTIONS_MUSEUMS_SLUG = 'attractions-museums';

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

export function getSiemReapAttractionsMuseumsListingMeta() {
  return {
    category_slug: SIEM_REAP_ATTRACTIONS_MUSEUMS_SLUG,
    category_name: 'Attractions & Museums',
    title: 'Best Siem Reap Attractions & Museums (2026): War Museum, National Museum & Kulen Park',
    subtitle:
      'Hand-picked Siem Reap museum and history tours from $18 — War Museum & killing fields, Angkor National Museum, HERO mine-detection rats, and Kulen National Park day trips.',
    hero_image: taImage('09/d9/5d/50', '720x480'),
  };
}

export function getSiemReapAttractionsMuseumsTopPick() {
  return tour({
    productId: '68160P27',
    title: 'Private Tour: HERO Rats & Angkor National Museum',
    tagLabel: 'Top pick · Museums & history',
    operatorName: 'Tour East Cambodia',
    imageUrl: taImage('09/d9/5d/50', '720x480'),
    durationLabel: '4 hours',
    priceFrom: 98,
    rating: 4.6,
    reviewCount: 16,
    bestFor:
      'Best for: A private half-day combining APOPO Hero Rats (landmine detection), Wat Thmei killing fields, and Angkor National Museum with guide, car, and admissions bundled.',
    whoFor:
      'Travelers who want Cambodia’s recent history and Khmer art in one curated private tour — the most distinctive museum experience on our list.',
    details: [
      ['Operator', 'Tour East Cambodia'],
      ['Type', 'Private · half-day museums'],
      ['Rating', '4.6 from 16+ reviews'],
      ['Price from', '$98'],
      ['Duration', '~4 hours'],
      ['Includes', 'Guide, private A/C car, admissions, water'],
      ['Note', 'Confirm Angkor National Museum hours — itinerary may adjust if closed'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'Meet the mine-sniffing Hero Rats, reflect at Siem Reap’s killing fields, and explore Khmer golden-age art at the Angkor National Museum — a private half-day unlike any temple circuit.',
  });
}

export function getSiemReapAttractionsHistoricalThree() {
  return [
    tour({
      productId: '152500P21',
      title: 'Siem Reap City Historical Half Day Tour',
      tagLabel: 'Budget · Half-day history',
      operatorName: 'MyProGuide Cambodia',
      imageUrl: taImage('15/c0/aa/7d'),
      durationLabel: '4–5 hours',
      priceFrom: 18.25,
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: War Museum, Wat Thmei killing field, Angkor National Museum, and Old Market — the cheapest guided historical half-day on our list.',
      whoFor:
        'Budget travelers who want Siem Reap beyond the temples with hotel transfers and a professional guide from under $20.',
      details: [
        ['Operator', 'MyProGuide Cambodia'],
        ['Rating', '5.0 from 1+ review'],
        ['Price from', '$18.25'],
        ['Duration', '~4–5 hours'],
        ['Includes', 'Guide, hotel round-trip, cold water'],
        ['Note', 'Museum entrance fees paid on site'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '264753P14',
      title: 'Siem Reap City Tour',
      tagLabel: 'Private · City & crafts',
      operatorName: 'Join Me Cambodia',
      imageUrl: taImage('0a/d6/cf/f2'),
      durationLabel: '4–5 hours',
      priceFrom: 37,
      rating: 5,
      reviewCount: 26,
      bestFor:
        'Best for: Wat Thmei, War Museum, Wat Preah Prom Rath pagoda, Old Market, and Artisans Angkor workshop — the highest-reviewed city history tour here.',
      whoFor:
        'Couples and small groups who want a tuk-tuk city loop with 26 five-star reviews and ~$8 entrance fees per person.',
      details: [
        ['Operator', 'Join Me Cambodia'],
        ['Rating', '5.0 from 26+ reviews'],
        ['Price from', '$37'],
        ['Duration', '~4–5 hours'],
        ['Includes', 'English guide, tuk-tuk (2 per vehicle), water & towels, hotel pickup'],
        ['Note', 'Entrance fees ~$8/person extra'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '415085P7',
      title: 'Siem Reap City Tour with War Museum and Killing Field',
      tagLabel: 'Private · War & markets',
      operatorName: 'Angkor Daily Trip',
      imageUrl: taImage('13/53/bd/ee'),
      durationLabel: '5 hours',
      priceFrom: 50,
      rating: 4.9,
      reviewCount: 34,
      bestFor:
        'Best for: In-depth War Museum visit, Wat Thmey killing field, Artisans Angkor crafts, and Psah Chas Old Market with A/C transport included.',
      whoFor:
        'Travelers who want Cambodia’s civil-war history balanced with living Khmer craft culture — 34 reviews at 4.9 stars.',
      details: [
        ['Operator', 'Angkor Daily Trip'],
        ['Rating', '4.9 from 34+ reviews'],
        ['Price from', '$50'],
        ['Duration', '~5 hours'],
        ['Includes', 'Guide, A/C vehicle, water, hotel pickup, museum & killing field stops'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapAttractionsMuseumParkThree() {
  return [
    tour({
      productId: '349857P3',
      title: 'Full Day to Banteay Srei, Kulen National Park and Beng Mealea',
      tagLabel: 'Private · Kulen national park',
      operatorName: 'The Fin Travel & Tours',
      imageUrl: taImage('0f/48/5a/a2'),
      durationLabel: '9–10 hours',
      priceFrom: 60,
      rating: 5,
      reviewCount: 4,
      bestFor:
        'Best for: Pink sandstone Banteay Srei, Kulen Mountain waterfalls & sacred sites, and jungle-clad Beng Mealea — Cambodia’s national park in one Fin-guided day.',
      whoFor:
        'History lovers who want temples plus protected park landscapes with a 20-year veteran English guide from $60.',
      details: [
        ['Operator', 'The Fin Travel & Tours'],
        ['Rating', '5.0 from 4+ reviews'],
        ['Price from', '$60'],
        ['Duration', '~9–10 hours'],
        ['Includes', 'English guide, A/C vehicle, bottled water'],
        ['Note', 'Angkor pass $37, Kulen $20, lunch ~$5–7 extra'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '415085P36',
      title: 'Siem Reap City Tour and Angkor National Museum Experience',
      tagLabel: 'Private · Museum included',
      operatorName: 'Angkor Daily Trip',
      imageUrl: taImage('r/32/c4/54/b7/caption'),
      durationLabel: '5 hours',
      priceFrom: 69,
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: Siem Reap city heritage plus a guided Angkor National Museum visit — museum ticket and tuk-tuk or car transport bundled.',
      whoFor:
        'Culture seekers who want Khmer golden-era art explained by a guide before or after their temple days.',
      details: [
        ['Operator', 'Angkor Daily Trip'],
        ['Rating', '5.0 from 1+ review'],
        ['Price from', '$69'],
        ['Duration', '~5 hours'],
        ['Includes', 'Guide, museum ticket, hotel pickup, tuk-tuk or car, water'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '53571P49',
      title: 'Angkor National Museum with transport',
      tagLabel: 'Self-guided · Museum only',
      operatorName: 'Bayon Tabi Tour',
      imageUrl: taImage('06/6e/ec/c0'),
      durationLabel: '2–3 hours',
      priceFrom: 33,
      rating: 4.8,
      reviewCount: 9,
      bestFor:
        'Best for: Hotel pickup, museum admission, and 2–3 hours at the Angkor National Museum — no guide, explore the galleries at your own pace.',
      whoFor:
        'Independent travelers who want the best-value museum visit with transport and ticket included from $33.',
      details: [
        ['Operator', 'Bayon Tabi Tour'],
        ['Rating', '4.8 from 9+ reviews'],
        ['Price from', '$33'],
        ['Duration', '~2–3 hours'],
        ['Includes', 'Museum fee, car or tuk-tuk pickup & drop-off, water'],
        ['Note', 'No guide — audio guides available at museum'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapAttractionsMuseumsCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapAttractionsMuseumsTopPick());
  getSiemReapAttractionsHistoricalThree().forEach(add);
  getSiemReapAttractionsMuseumParkThree().forEach(add);
  return ordered;
}

export function getSiemReapAttractionsMuseumsGuideData() {
  const listing = getSiemReapAttractionsMuseumsListingMeta();
  const topPick = getSiemReapAttractionsMuseumsTopPick();

  return {
    guideLayout: 'siem-reap-attractions-museums',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Attractions & museums',
    toursSearchQuery: 'Siem Reap museum war Angkor National Museum',
    heroImage: listing.hero_image,
    heroTagline:
      'City history from $18 · Angkor National Museum from $33 · Kulen national park from $60 · HERO Rats private tour from $98',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapAttractionsMuseumsCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: HERO Rats & Angkor National Museum private tour',
    transferSections: [
      {
        id: 'historical-city',
        title: 'Historical Siem Reap city tours',
        description:
          'War Museum tanks and helicopters, Wat Thmei killing fields, pagodas, Old Market, and Artisans Angkor — three guided city history picks from $18.',
        tours: getSiemReapAttractionsHistoricalThree(),
      },
      {
        id: 'museums-national-park',
        title: 'National museum, Kulen park & cultural sites',
        description:
          'Angkor National Museum with transport or guide, Kulen National Park with Banteay Srei and Beng Mealea, and bundled city-museum experiences.',
        tours: getSiemReapAttractionsMuseumParkThree(),
      },
    ],
    introParagraphs: [
      'Siem Reap’s museums and memorials tell a story the temples cannot — Cambodia’s civil war, the Khmer Rouge era, and the golden-age art that preceded Angkor’s fall.',
      'Below are seven hand-picked tours from budget historical half-days ($18) to private HERO Rat and museum combos ($98). Museum entrance fees are included on some tours and paid on site on others — check each listing before you book.',
    ],
    comparisonSection: {
      title: 'Museum & history tours — quick comparison',
      headers: ['Tour', 'Price from', 'Best for', 'Duration'],
      rows: [
        ['HERO Rats & National Museum (top pick)', 'From $98', 'Unique mine-rat + museum combo', '~4 hours'],
        ['Historical half-day city tour', 'From $18', 'Budget war & market intro', '~4–5 hours'],
        ['Join Me city tour', 'From $37', 'Most-reviewed city loop (26 reviews)', '~4–5 hours'],
        ['War Museum & killing field tour', 'From $50', 'Deep civil-war focus + crafts', '~5 hours'],
        ['Angkor National Museum + transport', 'From $33', 'Self-paced galleries', '~2–3 hours'],
        ['Kulen park + Banteay Srei day', 'From $60', 'National park & jungle temple', '~9–10 hours'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap museum visit tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Visit War Museum in the morning', 'Outdoor exhibits heat up quickly after midday'],
        ['Dress respectfully at Wat Thmei', 'This is an active memorial site — covered shoulders advised'],
        ['See Angkor National Museum before temples', 'Context on Khmer art makes Angkor Wat more meaningful'],
        ['Confirm museum opening hours', 'Some tours note temporary Angkor National Museum closures'],
        ['Budget $8–20 in site fees on cheaper tours', 'Half-day city tours often exclude entrance passes'],
      ],
    },
    stats: {
      toursAvailable: 7,
      priceFrom: 18.25,
      duration: '2h – 10h',
      reviewCount: 91,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Best Siem Reap Attractions & Museums (2026): War Museum & Angkor National Museum | TopTours',
      description:
        'Compare Siem Reap museum tours from $18 — War Museum, killing fields, Angkor National Museum, HERO Rats, and Kulen National Park day trips with real reviews.',
      keywords:
        'Siem Reap War Museum tour, Angkor National Museum, Wat Thmei killing fields, Kulen National Park tour, Siem Reap city tour',
    },

    faqs: [
      {
        question: 'What is the best museum tour in Siem Reap?',
        answer:
          'The Private HERO Rats & Angkor National Museum tour (4.6 from 16+ reviews, from $98) is our top pick for a unique half-day. For budget travelers, the Siem Reap City Historical Half Day Tour starts from $18.25 with war museum and killing field stops.',
      },
      {
        question: 'Is the War Museum in Siem Reap worth visiting?',
        answer:
          'Yes. The Cambodia War Museum displays tanks, helicopters, and personal stories from the civil war era. Tours from $18–$50 include guided visits with hotel transport — pair it with Wat Thmei for full historical context.',
      },
      {
        question: 'Do I need a guide at Angkor National Museum?',
        answer:
          'Not necessarily. The Angkor National Museum with transport tour ($33) includes admission and pickup without a guide. The Siem Reap City Tour and Angkor National Museum Experience ($69) adds a professional English guide and city stops.',
      },
      {
        question: 'What is Kulen National Park?',
        answer:
          'Phnom Kulen is a protected mountain park north of Siem Reap with waterfalls, the River of a Thousand Lingas, and sacred sites. The Full Day to Banteay Srei, Kulen and Beng Mealea tour (from $60) combines the park with pink-sandstone and jungle temples.',
      },
      {
        question: 'What are HERO Rats in Siem Reap?',
        answer:
          'APOPO Hero Rats are trained African giant pouched rats that detect landmines in Cambodia. The private tour from $98 includes a visit to see them at work, plus killing fields and the Angkor National Museum.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Siem Reap half-day tours',
        href: '/destinations/siem-reap/guides/half-day-tours',
      },
      {
        label: 'Siem Reap nature & wildlife tours',
        href: '/destinations/siem-reap/guides/nature-and-wildlife-tours',
      },
      {
        label: 'Siem Reap hidden costs & Angkor Pass fees',
        href: '/destinations/siem-reap/guides/additional-fees',
      },
      {
        label: 'Angkor Wat sunrise complete guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
      },
      {
        label: 'Siem Reap day trips',
        href: '/destinations/siem-reap/guides/day-trips',
      },
    ],
  };
}
