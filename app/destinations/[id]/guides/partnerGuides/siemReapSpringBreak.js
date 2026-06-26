/**
 * Editorial guide: Siem Reap spring break — adventure picks from nature, bike, bus & airport guides.
 */

import { getSiemReapAirportTransfersBestThree } from './siemReapAirportTransfers';
import { getSiemReapGuidedBikeToursThree } from './siemReapBikeTours';
import { getSiemReapBusPopularDayTripsThree } from './siemReapBusTours';
import {
  getSiemReapNatureBirdwatchingThree,
  getSiemReapNatureWaterfallThree,
} from './siemReapNatureWildlifeTours';

export const SIEM_REAP_SPRING_BREAK_SLUG = 'spring-break';

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

export function getSiemReapSpringBreakListingMeta() {
  return {
    category_slug: SIEM_REAP_SPRING_BREAK_SLUG,
    category_name: 'Spring Break',
    title: 'Siem Reap Spring Break (2026): Waterfalls, Bike Rides, Coach Days & Airport Transfers',
    subtitle:
      'Plan your Siem Reap spring break from $8 — Kulen waterfall picnics, countryside bike sunsets from $18, Angkor coach day trips, and SAI airport shuttles with real reviews.',
    hero_image: taImage('11/ff/51/7f', '720x480'),
  };
}

export function getSiemReapSpringBreakTopPick() {
  const kulenPicnic = getSiemReapNatureWaterfallThree().find((t) => t.productId === '118579P29');
  return (
    kulenPicnic ||
    tour({
      productId: '118579P29',
      title: 'Kulen Mountain Waterfall Tour with Picnic Lunch from Siem Reap',
      tagLabel: 'Top pick · Spring break adventure',
      operatorName: 'Asean Angkor Guide',
      imageUrl: taImage('11/ff/51/7f', '720x480'),
      durationLabel: '8 hours',
      priceFrom: 48,
      rating: 5,
      reviewCount: 270,
      bestFor:
        'Best for: The ultimate spring break day out — swim Kulen waterfall, walk the Thousand Lingas river, and picnic with grilled chicken, fruit, and local beer (park admission included).',
      whoFor:
        'Groups and friends who want adventure beyond the temples — 270 five-star reviews and the best-value full nature day on our spring break list.',
      details: [
        ['Operator', 'Asean Angkor Guide'],
        ['Rating', '5.0 from 270+ reviews'],
        ['Price from', '$48'],
        ['Duration', '~8 hours'],
        ['Includes', 'Guide, transport, Kulen admission, picnic lunch, water & towels'],
        ['Cancellation', 'Free cancellation'],
      ],
      summary:
        'Trade temple fatigue for a swimmable waterfall, sacred river carvings, and a riverside picnic — the most-reviewed Kulen day trip and our top spring break pick from $48.',
    })
  );
}

export function getSiemReapSpringBreakBusAirportThree() {
  const bus = getSiemReapBusPopularDayTripsThree();
  const airport = getSiemReapAirportTransfersBestThree();
  return [bus[0], bus[1], airport[0]].filter(Boolean);
}

export function getSiemReapSpringBreakCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapSpringBreakTopPick());
  getSiemReapNatureBirdwatchingThree().forEach(add);
  getSiemReapGuidedBikeToursThree().forEach(add);
  getSiemReapSpringBreakBusAirportThree().forEach(add);
  return ordered;
}

export function getSiemReapSpringBreakGuideData() {
  const listing = getSiemReapSpringBreakListingMeta();
  const topPick = getSiemReapSpringBreakTopPick();

  return {
    guideLayout: 'siem-reap-spring-break',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Spring break',
    toursSearchQuery: 'Siem Reap spring break tour Kulen bike Angkor',
    heroImage: listing.hero_image,
    heroTagline:
      'Kulen waterfall picnic from $48 · countryside bikes from $18 · coach day trips from $60 · SAI airport transfers from $8',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapSpringBreakCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Kulen Mountain waterfall picnic day',
    transferSections: [
      {
        id: 'nature-wildlife',
        title: 'Nature & wildlife spring break adventures',
        description:
          'Bird sanctuaries, lotus farms, and off-the-beaten-track Tonle Sap wildlife — three nature picks from $70 for a break from temple crowds.',
        tours: getSiemReapNatureBirdwatchingThree(),
      },
      {
        id: 'bike-active',
        title: 'Bike tours & active spring break days',
        description:
          'Countryside sunset rides with food tastings, morning market culture tours, and the pedal-powered bar cycle through Pub Street.',
        tours: getSiemReapGuidedBikeToursThree(),
      },
      {
        id: 'bus-airport',
        title: 'Coach day trips & SAI airport transfers',
        description:
          'Sunrise cycling expeditions, Battambang bamboo-train day trips, vintage Jeep Angkor days, and budget-friendly private airport rides from $22.',
        tours: getSiemReapSpringBreakBusAirportThree(),
      },
    ],
    introParagraphs: [
      'Spring break in Siem Reap is more than Angkor Wat — swim sacred waterfalls, cycle rice fields at sunset, join a vintage Jeep temple run, and land at SAI without overpaying for a taxi.',
      'Below are ten hand-picked tours pulled from our nature, bike, bus, and airport guides — real prices, review counts, and instant booking for every pick.',
    ],
    comparisonSection: {
      title: 'Spring break Siem Reap — quick planner',
      headers: ['Experience', 'Price from', 'Best for', 'Duration'],
      rows: [
        ['Kulen waterfall picnic (top pick)', 'From $48', 'Swim, lingas & lunch', '~8 hours'],
        ['Countryside sunset bike', 'From $18', 'Budget group adventure', '~5 hours'],
        ['Pearaing birding half-day', 'From $70', 'Nature break near town', '~4–5 hours'],
        ['Vintage Jeep Angkor day', 'From $60', 'Stylish temple circuit', '~7 hours'],
        ['Private airport transfer', 'From $22', 'SAI arrival or departure', '~50 min'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap spring break tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Book Kulen waterfall days mid-week', 'Weekend crowds thin out and picnic spots are easier to claim'],
        ['Pair a $18 bike tour with a free Pub Street evening', 'Save budget for temples and street food'],
        ['Buy your Angkor Pass the afternoon before sunrise rides', 'Skip the ticket-office queue on active cycling days'],
        ['Reserve airport transfers before landing at SAI', 'Meet-and-greet drivers fill up during peak spring break weeks'],
        ['Pack swimwear for Kulen and insect repellent for birding', 'Nature days need different gear than temple visits'],
      ],
    },
    stats: {
      toursAvailable: 10,
      priceFrom: 8,
      duration: '50 min – 15h',
      reviewCount: 700,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Siem Reap Spring Break (2026): Tours, Waterfalls & Bike Rides | TopTours',
      description:
        'Plan Siem Reap spring break from $8 — Kulen waterfall picnics, countryside bike tours, Angkor coach days, Tonle Sap birding, and SAI airport transfers with real reviews.',
      keywords:
        'Siem Reap spring break, Kulen waterfall tour, Siem Reap bike tour, SAI airport transfer, Siem Reap group trip',
    },

    faqs: [
      {
        question: 'What is the best spring break tour in Siem Reap?',
        answer:
          'The Kulen Mountain Waterfall Tour with Picnic Lunch (5.0 from 270+ reviews, from $48) is our top pick — swimming, sacred river lingas, and a riverside lunch with admission bundled in one adventure day.',
      },
      {
        question: 'What can you do in Siem Reap besides temples on spring break?',
        answer:
          'Cycle countryside at sunset from $18, birdwatch at Pearaing from $70, take a vintage Jeep Angkor day from $60, or day-trip to Battambang’s bamboo train from $99 — all on our spring break list.',
      },
      {
        question: 'How much is an airport transfer from SAI?',
        answer:
          'Budget shared shuttles start around $8–$19. Private airport-to-hotel transfers start from $22 (Angkor Express Boat, 5.0 from 55+ reviews) up to $44 for meet-and-greet taxis with 350+ reviews.',
      },
      {
        question: 'Are Siem Reap bike tours good for groups?',
        answer:
          'Yes. The countryside sunset ride ($18, 5.0 from 118+ reviews) and bar cycle ($19) are built for small groups and friends traveling together — transport and snacks included on the guided rides.',
      },
      {
        question: 'When is spring break weather best in Siem Reap?',
        answer:
          'March and April are hot and dry — ideal for Kulen waterfall swimming and sunset bike rides. Bring sunscreen and book morning nature tours before afternoon heat peaks.',
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
        label: 'Siem Reap bus tours',
        href: '/destinations/siem-reap/guides/bus-tours',
      },
      {
        label: 'Siem Reap airport transfers (SAI)',
        href: '/destinations/siem-reap/guides/airport-transfers',
      },
      {
        label: 'Siem Reap overnight tours',
        href: '/destinations/siem-reap/guides/overnight-tours',
      },
    ],
  };
}
