/**
 * Editorial guide: Siem Reap new-product showcase — tuk-tuk temples, Kulen waterfalls, Angkor circuits & guided bikes.
 */

import { getSiemReapAngkorWatOptionsThree } from './siemReapAngkorWatTours';
import { getSiemReapGuidedBikeToursThree } from './siemReapBikeTours';
import { getSiemReapNatureWaterfallThree } from './siemReapNatureWildlifeTours';

export const SIEM_REAP_NEW_PRODUCT_SLUG = 'new-product';

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

export function getSiemReapNewProductListingMeta() {
  return {
    category_slug: SIEM_REAP_NEW_PRODUCT_SLUG,
    category_name: 'Siem Reap Tour Picks',
    title: 'Best Siem Reap Tours (2026): Tuk-Tuk Temple Days, Kulen Waterfalls & Guided Bike Rides',
    subtitle:
      'Hand-picked Siem Reap experiences from $15 — private tuk-tuk Angkor days, Kulen waterfall picnics from $48, classic temple circuits from $42, and countryside bike tours from $18.',
    hero_image: taImage('12/e4/dc/5e', '720x480'),
  };
}

export function getSiemReapNewProductTopPick() {
  return tour({
    productId: '103195P50',
    title: 'Angkor Wat Private Tour by Tuk-Tuk with English Speaking Driver',
    tagLabel: 'Top pick · Tuk-tuk temples',
    operatorName: 'About Cambodia Travel & Tours',
    imageUrl: taImage('12/e4/dc/5e', '720x480'),
    durationLabel: '3–8 hours',
    priceFrom: 15,
    rating: 4.8,
    reviewCount: 179,
    bestFor:
      'Best for: Classic Angkor exploration by tuk-tuk — sunrise, full-day small circuit, or sunset options with a flexible English-speaking driver.',
    whoFor:
      'Budget-conscious travelers who want open-air temple hopping without a big tour group — our most affordable private Angkor transport on this list.',
    details: [
      ['Operator', 'About Cambodia Travel & Tours'],
      ['Type', 'Private · tuk-tuk & driver'],
      ['Rating', '4.8 from 179+ reviews'],
      ['Price from', '$15'],
      ['Duration', '3–8 hours (option dependent)'],
      ['Includes', 'Private tuk-tuk, English-speaking driver, hotel pickup'],
      ['Note', 'Angkor Pass & optional licensed guide extra'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'Ride between Angkor Wat, Bayon, and Ta Prohm in a private tuk-tuk with your own English-speaking driver — choose sunrise, sunset, or a flexible full-day small circuit from just $15.',
  });
}

export function getSiemReapNewProductCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapNewProductTopPick());
  getSiemReapNatureWaterfallThree().forEach(add);
  getSiemReapAngkorWatOptionsThree().forEach(add);
  getSiemReapGuidedBikeToursThree().forEach(add);
  return ordered;
}

export function getSiemReapNewProductGuideData() {
  const listing = getSiemReapNewProductListingMeta();
  const topPick = getSiemReapNewProductTopPick();

  return {
    guideLayout: 'siem-reap-new-product',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Siem Reap tour picks',
    toursSearchQuery: 'Siem Reap tuk tuk Angkor Kulen bike tour',
    heroImage: listing.hero_image,
    heroTagline: 'Tuk-tuk temples from $15 · Kulen waterfalls from $48 · Angkor circuits from $42 · guided bikes from $18',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapNewProductCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Angkor Wat private tuk-tuk tour with English-speaking driver',
    transferSections: [
      {
        id: 'kulen-waterfalls',
        title: 'Kulen waterfalls, Koh Ker & Beng Mealea day trips',
        description:
          'Swim beneath Phnom Kulen’s tiers, picnic by the lingas river, or pair waterfalls with jungle temples at Koh Ker and Beng Mealea — three hand-picked day trips from $48.',
        tours: getSiemReapNatureWaterfallThree(),
      },
      {
        id: 'angkor-wat-options',
        title: 'Best Angkor Wat tour options',
        description:
          'The classic Siem Reap temple day — small-group circuits, private tuk-tuk rides, and full-day private pickups covering Angkor Wat, Bayon, and Ta Prohm.',
        tours: getSiemReapAngkorWatOptionsThree(),
      },
      {
        id: 'guided-bike-tours',
        title: 'Best guided bike tours in Siem Reap',
        description:
          'Countryside rides with food tastings, morning market culture tours, and the famous pedal-powered bar cycle through Pub Street.',
        tours: getSiemReapGuidedBikeToursThree(),
      },
    ],
    introParagraphs: [
      'Siem Reap rewards travelers who mix temple days with countryside rides and sacred-mountain escapes. Below are nine hand-picked tours across three categories — each with real prices, review counts, and instant booking.',
      'Budget tip: a private tuk-tuk driver from $15 covers transport between temples; add an Angkor Pass ($37 for one day) and optional licensed guide separately. Kulen waterfall days bundle park admission on some tours from $48.',
    ],
    comparisonSection: {
      title: 'Tuk-tuk vs guided temple tour vs Kulen day — quick comparison',
      headers: ['Experience', 'Typical price', 'Best for', 'Trade-off'],
      rows: [
        ['Private tuk-tuk & driver', 'From $15', 'Flexible Angkor transport', 'Pass & guide extra'],
        ['Small-group temple circuit', 'From $42', 'Budget guided Angkor day', 'Fixed group schedule'],
        ['Kulen picnic waterfall day', 'From $48', 'Swim, lingas, lunch included', 'Full 8-hour mountain day'],
        ['Countryside guided bike', 'From $18', 'Villages, food & sunset', 'Not a temple-focused day'],
        ['Koh Ker + Beng Mealea combo', 'From $78', 'Remote jungle temples + falls', '12+ hours; multiple passes'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap booking tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Buy your Angkor Pass the afternoon before', 'Skip morning queues at the ticket office on temple days'],
        ['Confirm tuk-tuk tour includes sunrise if you want dawn', 'Some drivers offer 3-hour sunrise vs 8-hour full circuit'],
        ['Book Kulen picnic tours for bundled park fees', 'The $48 picnic day includes Kulen admission — saves planning'],
        ['Wear temple-appropriate clothing every Angkor day', 'Shoulders and knees covered at all religious sites'],
        ['Reserve countryside bike tours for dry season afternoons', 'Sunset rides are best with clear skies Nov–April'],
      ],
    },
    stats: {
      toursAvailable: 10,
      priceFrom: 15,
      duration: '1h – 12h',
      reviewCount: 650,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Best Siem Reap Tours (2026): Tuk-Tuk, Kulen Waterfalls & Bike Rides | TopTours',
      description:
        'Compare hand-picked Siem Reap tours from $15 — private tuk-tuk Angkor days, Kulen waterfall picnics, small-group temple circuits, and guided countryside bike rides with real reviews.',
      keywords:
        'Siem Reap tuk tuk tour, Angkor Wat private tour, Phnom Kulen waterfall, Siem Reap bike tour, Koh Ker Beng Mealea, Siem Reap countryside bike',
    },

    faqs: [
      {
        question: 'What is the cheapest way to tour Angkor Wat?',
        answer:
          'A private tuk-tuk with English-speaking driver starts from $15 for transport between temples. You still need an Angkor Pass ($37 for one day) and may want to hire a licensed guide at the gates — but the tuk-tuk itself is the most affordable private option on our list.',
      },
      {
        question: 'What is the best Kulen waterfall tour from Siem Reap?',
        answer:
          'The Kulen Mountain Waterfall Tour with Picnic Lunch (5.0 from 270+ reviews, from $48) bundles park admission, a riverside lunch with grilled chicken and local beer, and the Thousand Lingas river walk — the best value Kulen day on our list.',
      },
      {
        question: 'Should I book a small-group or private Angkor tour?',
        answer:
          'Small-group circuits from $42 suit solo travelers and pairs on a budget. Private tuk-tuk tours from $45 offer more flexibility. Full-day private van tours from $95 per group work well for families who want one price for the whole party.',
      },
      {
        question: 'Are Siem Reap bike tours suitable for beginners?',
        answer:
          'Yes. The countryside sunset ride ($18, 5.0 from 118+ reviews) and morning market tour ($21, 5.0 from 53+ reviews) use flat village paths with support vehicle nearby. The bar cycle ($19) is a slow social roll through Pub Street — no fitness required.',
      },
      {
        question: 'How long does a Koh Ker and Beng Mealea day trip take?',
        answer:
          'Expect 12–13 hours door to door. The Koh Ker, Kulen Waterfall and Beng Mealea tour (from $78) covers three sites with separate entrance fees — plan an early start and pack snacks for the long drives.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Siem Reap nature & wildlife tours',
        href: '/destinations/siem-reap/guides/nature-and-wildlife-tours',
      },
      {
        label: 'Siem Reap bike tours & rentals',
        href: '/destinations/siem-reap/guides/bike-tours',
      },
      {
        label: 'Siem Reap Angkor Wat tours',
        href: '/destinations/siem-reap/guides/shore-excursions',
      },
      {
        label: 'Siem Reap hidden costs & Angkor Pass fees',
        href: '/destinations/siem-reap/guides/additional-fees',
      },
      {
        label: 'Angkor Wat sunrise guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
      },
    ],
  };
}
