/**
 * Editorial guide: Siem Reap Airport Transfers (hardcoded picks).
 */

export const SIEM_REAP_AIRPORT_TRANSFERS_SLUG = 'airport-transfers';

const AFF = '?mcid=42383&pid=P00276441&medium=api&api_version=2.0';

/** TripAdvisor CDN — use 540x360 for card grids, 720x480 for hero */
function taImage(path, size = '540x360') {
  return `https://media-cdn.tripadvisor.com/media/attractions-splice-spp-${size}/${path}`;
}

function tour(partial) {
  return {
    ...partial,
    viatorBookingUrl: partial.viatorBookingUrl || `https://www.viator.com/tours/Siem-Reap/t/d5480-${partial.productId}${AFF}`,
  };
}

export function getSiemReapAirportTransfersListingMeta() {
  return {
    category_slug: SIEM_REAP_AIRPORT_TRANSFERS_SLUG,
    category_name: 'Airport Transfers',
    title: 'Siem Reap Airport Transfers: Best Private, Shared & Bus Options (SAI)',
    subtitle:
      'Compare verified airport transfers from Siem Reap Angkor International Airport (SAI) to your hotel — private taxis, shared shuttles, and budget bus options from $8.',
    hero_image: taImage('0f/95/30/4b.jpg', '720x480'),
  };
}

export function getSiemReapAirportTransfersTopPick() {
  return tour({
    productId: '367469P1',
    title: 'Siem Reap Angkor Airport Taxis (from Airport to Hotel)',
    tagLabel: 'Top pick · Private',
    operatorName: 'Siem Reap Angkor Airport (SAI) Shuttles and Taxis',
    imageUrl: taImage('0f/95/30/4b.jpg', '720x480'),
    durationLabel: '1 hour',
    priceFrom: 44,
    rating: 5,
    reviewCount: 356,
    bestFor: 'Best for: Arrivals at SAI who want a name board at the terminal and a direct private ride to your hotel.',
    whoFor:
      'First-time visitors, couples, and families who want the most-booked private airport taxi with meet-and-greet at the single arrivals exit.',
    details: [
      ['Operator', 'Siem Reap Angkor Airport (SAI) Shuttles and Taxis'],
      ['Type', 'Private taxi · one way'],
      ['Rating', '5.0 from 356+ reviews'],
      ['Price from', '$44 per vehicle'],
      ['Duration', '~1 hour (traffic dependent)'],
      ['Includes', 'Meet-and-greet sign, AC vehicle, toll fees, GATE 1 pickup'],
    ],
    summary:
      'Your driver waits at the arrivals exit with your name on a board, then drives you in an air-conditioned car straight to your Siem Reap hotel — the highest-reviewed dedicated SAI airport taxi on TopTours.',
  });
}

export function getSiemReapAirportTransfersBestThree() {
  return [
    tour({
      productId: '233275P26',
      title: 'Siem Reap Airport or Hotel Transfer',
      tagLabel: 'Private · Best value',
      operatorName: 'Angkor Express Boat',
      imageUrl: taImage('11/7c/a5/bc.jpg'),
      durationLabel: '50 min',
      priceFrom: 22,
      rating: 5,
      reviewCount: 55,
      bestFor: 'Best for: Flexible one-way transfers between airport and hotel at the lowest private price.',
      whoFor: 'Budget-conscious travelers who still want a private vehicle and English-speaking driver.',
      details: [
        ['Operator', 'Angkor Express Boat'],
        ['Type', 'Private · airport ↔ hotel'],
        ['Rating', '5.0 from 55+ reviews'],
        ['Price from', '$22'],
        ['Duration', '~50 minutes'],
        ['Includes', 'AC vehicle, cold water, cold towel'],
      ],
    }),
    tour({
      productId: '278050P14',
      title: 'Siem Reap Airport Pick Up, Transfer Siem Reap to SAI Airport',
      tagLabel: 'Private · Both directions',
      operatorName: 'Siem Reap Private Taxi',
      imageUrl: taImage('17/13/1b/da.jpg'),
      durationLabel: '1 hour',
      priceFrom: 23,
      rating: 5,
      reviewCount: 11,
      bestFor: 'Best for: Hotel-to-airport or airport-to-hotel with reconfirmed pickup times.',
      whoFor: 'Travelers who want a reliable private driver for departure day or late-night SAI flights.',
      details: [
        ['Operator', 'Siem Reap Private Taxi'],
        ['Type', 'Private · one way'],
        ['Rating', '5.0 from 11+ reviews'],
        ['Price from', '$23'],
        ['Duration', '~1 hour'],
        ['Includes', 'English driver, tolls, parking, cold water'],
      ],
    }),
    tour({
      productId: '56250P26',
      title: 'PRIVATE / SHARED Siem Reap Airport (SAI) Pick up & Transfers',
      tagLabel: 'Private or shared',
      operatorName: 'Siem Reap Shuttle',
      imageUrl: taImage('15/72/95/32.jpg'),
      durationLabel: '50 min',
      priceFrom: 10,
      rating: 4.9,
      reviewCount: 167,
      bestFor: 'Best for: Choosing private or shared service in one booking at a sharp price.',
      whoFor: 'Solo travelers and couples open to shared transfers, or anyone wanting private door-to-door from $10.',
      details: [
        ['Operator', 'Siem Reap Shuttle'],
        ['Type', 'Private or shared · one way'],
        ['Rating', '4.9 from 167+ reviews'],
        ['Price from', '$10'],
        ['Duration', '~50 minutes'],
        ['Includes', 'AC vehicle, bottled water, welcome sign (pickup), cold towel'],
      ],
    }),
  ];
}

export function getSiemReapAirportTransfersPrivateThree() {
  return [
    tour({
      productId: '26033P24',
      title: 'Private Transfer From Siem Reap Airport to Hotel',
      tagLabel: 'Private · Premium fleet',
      operatorName: 'ANGKOR CAB-OFF BEATEN TRUCK',
      imageUrl: taImage('13/64/36/25.jpg'),
      durationLabel: '1 hour',
      priceFrom: 50,
      rating: 5,
      reviewCount: 16,
      bestFor: 'Best for: Travelers who want a modern, well-maintained private vehicle after a long flight.',
      whoFor: 'Families and groups who prioritize vehicle quality and experienced drivers (10+ years).',
      details: [
        ['Operator', 'ANGKOR CAB-OFF BEATEN TRUCK'],
        ['Type', 'Private · airport to hotel'],
        ['Rating', '5.0 from 16+ reviews'],
        ['Price from', '$50'],
        ['Duration', '~1 hour'],
        ['Includes', 'Water, fuel, airport tolls, parking, driver'],
      ],
    }),
    tour({
      productId: '182077P19',
      title: 'Private Airport Transfer: Hotel → Siem Reap Airport (SAI)',
      tagLabel: 'Private · 24/7',
      operatorName: 'SmartRyde',
      imageUrl: taImage('12/1a/6e/c6.jpg'),
      durationLabel: '40 min',
      priceFrom: 35,
      rating: 5,
      reviewCount: 1,
      bestFor: 'Best for: Early departures and late-night flights with 24-hour operations.',
      whoFor: 'Business travelers and anyone with a tight flight schedule who needs guaranteed pickup times.',
      details: [
        ['Operator', 'SmartRyde'],
        ['Type', 'Private · hotel to SAI'],
        ['Rating', '5.0'],
        ['Price from', '$34.88'],
        ['Duration', '~40 minutes'],
        ['Includes', 'AC vehicle, fuel surcharge, parking fees'],
      ],
    }),
    tour({
      productId: '16658P17',
      title: 'Siem Reap Private One-Way Airport Transfer',
      tagLabel: 'Private · English driver',
      operatorName: 'Siem Reap Angkor Travel and Tour',
      imageUrl: taImage('07/2a/72/ba.jpg'),
      durationLabel: '1 hour',
      priceFrom: 50,
      rating: 4.9,
      reviewCount: 15,
      bestFor: 'Best for: Groups up to 30 passengers with an English-speaking driver.',
      whoFor: 'Families and tour groups who want a straightforward private one-way transfer.',
      details: [
        ['Operator', 'Siem Reap Angkor Travel and Tour'],
        ['Type', 'Private · one way'],
        ['Rating', '4.9 from 15+ reviews'],
        ['Price from', '$50'],
        ['Duration', '~1 hour'],
        ['Includes', 'Toll fees, English-speaking driver, AC car'],
      ],
    }),
  ];
}

export function getSiemReapAirportTransfersBusThree() {
  return [
    tour({
      productId: '5503252P3',
      title: 'Siem Reap International Airport Shared Shuttle Bus Transfer',
      tagLabel: 'Budget · Shuttle bus',
      operatorName: 'Siem Reap Airport Shuttle Bus',
      imageUrl: taImage('17/10/83/67.jpg'),
      durationLabel: '1 hour',
      priceFrom: 8,
      rating: 4.5,
      reviewCount: 21,
      bestFor: 'Best for: The cheapest ride from SAI to town or town to the airport.',
      whoFor: 'Solo backpackers and budget travelers who do not mind a shared bus schedule.',
      details: [
        ['Operator', 'Siem Reap Airport Shuttle Bus'],
        ['Type', 'Shared shuttle bus'],
        ['Rating', '4.5 from 21+ reviews'],
        ['Price from', '$8'],
        ['Duration', '~1 hour'],
        ['Includes', 'AC bus, bottled water, WiFi on board'],
      ],
    }),
    tour({
      productId: '367469P2',
      title: 'Siem Reap Angkor Airport to Siem Reap City by Shuttle Bus',
      tagLabel: 'Shared · Door-to-door',
      operatorName: 'Siem Reap Angkor Airport (SAI) Shuttles and Taxis',
      imageUrl: taImage('11/ad/92/8a.jpg'),
      durationLabel: '1 hour',
      priceFrom: 19,
      rating: 5,
      reviewCount: 6,
      bestFor: 'Best for: Shared door-to-door drop-offs at multiple hotels (max 12 passengers).',
      whoFor: 'Travelers who want a middle ground between the $8 bus and a private taxi.',
      details: [
        ['Operator', 'Siem Reap Angkor Airport (SAI) Shuttles and Taxis'],
        ['Type', 'Shared shuttle · max 12 guests'],
        ['Rating', '5.0 from 6+ reviews'],
        ['Price from', '$19'],
        ['Duration', '~1 hour (can be longer on holidays)'],
        ['Includes', 'English driver, toll fees, cold water, hotel drop-off'],
      ],
    }),
    tour({
      productId: '56250P26',
      title: 'PRIVATE / SHARED Siem Reap Airport (SAI) Pick up & Transfers',
      tagLabel: 'Shared option · From $10',
      operatorName: 'Siem Reap Shuttle',
      imageUrl: taImage('15/72/95/32.jpg'),
      durationLabel: '50 min',
      priceFrom: 10,
      rating: 4.9,
      reviewCount: 167,
      bestFor: 'Best for: Shared transfers with private upgrade available — great value at SAI.',
      whoFor: 'Anyone comparing shared vs private on the same operator before booking.',
      details: [
        ['Operator', 'Siem Reap Shuttle'],
        ['Type', 'Shared (private upgrade available)'],
        ['Rating', '4.9 from 167+ reviews'],
        ['Price from', '$10 shared'],
        ['Duration', '~50 minutes'],
        ['Includes', 'AC vehicle, bottled water, door-to-door'],
      ],
    }),
  ];
}

/** Unique curated picks for JSON-LD ItemList (10 transfers, deduped by productId). */
export function getSiemReapAirportTransfersCuratedToursForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapAirportTransfersTopPick());
  getSiemReapAirportTransfersBestThree().forEach(add);
  getSiemReapAirportTransfersPrivateThree().forEach(add);
  getSiemReapAirportTransfersBusThree().forEach(add);
  return ordered;
}

export function getSiemReapAirportTransfersGuideData() {
  const listing = getSiemReapAirportTransfersListingMeta();
  const topPick = getSiemReapAirportTransfersTopPick();
  const bestThree = getSiemReapAirportTransfersBestThree();

  return {
    guideLayout: 'siem-reap-airport-transfers',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Airport transfers',
    toursSearchQuery: 'Siem Reap airport transfer',
    heroImage: listing.hero_image,
    heroTagline: 'Verified transfers from $8 · private taxis from $22 · 600+ reviews on our top picks',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapAirportTransfersCuratedToursForSchema(),
    topPick,
    transferSections: [
      {
        id: 'best-three',
        title: 'Our 3 best Siem Reap airport transfers',
        description:
          'Strong ratings, clear inclusions, and prices that cover most traveler types — private, flexible, or shared.',
        tours: bestThree,
      },
      {
        id: 'private',
        title: 'Best private airport transfers',
        description:
          'Dedicated vehicles with meet-and-greet or hotel pickup — ideal after a long flight or with luggage and kids.',
        tours: getSiemReapAirportTransfersPrivateThree(),
      },
      {
        id: 'bus',
        title: 'Budget bus & shared shuttle options',
        description:
          'The cheapest ways to reach Siem Reap city from SAI — shared buses and shuttles from about $8.',
        tours: getSiemReapAirportTransfersBusThree(),
      },
    ],
    stats: {
      toursAvailable: 10,
      priceFrom: 8,
      duration: '40 min – 1 hr',
      reviewCount: 650,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Siem Reap Airport Transfers (SAI): Private, Shared & Bus Options | TopTours',
      description:
        'Compare the best Siem Reap Angkor International Airport transfers — top-rated private taxis from $22, shared shuttles from $10, and shuttle buses from $8.',
      keywords:
        'Siem Reap airport transfer, SAI airport taxi, Siem Reap Angkor International Airport shuttle, private transfer Siem Reap',
    },

    faqs: [
      {
        question: 'How far is Siem Reap Angkor International Airport (SAI) from the city?',
        answer:
          'SAI is about 53 km (33 miles) east of central Siem Reap. Transfer times are typically 45–75 minutes depending on traffic, time of day, and whether you use a private car or shared shuttle with multiple hotel drop-offs.',
      },
      {
        question: 'Should I book a private transfer or shared shuttle?',
        answer:
          'Private transfers ($22–$50) are best after long flights, with kids, or late arrivals — you go straight to your hotel. Shared shuttles and buses ($8–$19) save money but may wait for other passengers or follow fixed schedules.',
      },
      {
        question: 'Where do I meet my driver at SAI?',
        answer:
          'SAI has a single arrivals exit (GATE 1). Most private operators provide meet-and-greet with your name on a sign. Shared bus services usually have a counter or sign near the exit — check your confirmation for exact instructions.',
      },
      {
        question: 'Can I book both arrival and departure transfers?',
        answer:
          'Yes. Several operators on this page cover airport-to-hotel and hotel-to-airport (one-way each). Book two one-way transfers or look for round-trip options when comparing live prices.',
      },
      {
        question: 'Is it worth booking in advance?',
        answer:
          'Yes — especially November through March. Pre-booking locks in price, guarantees a vehicle, and avoids negotiating with informal taxis after a long flight.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Angkor Wat sunrise complete guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
      },
      {
        label: 'All Siem Reap travel guides',
        href: '/destinations/siem-reap/guides',
      },
      {
        label: 'Siem Reap destination hub',
        href: '/destinations/siem-reap',
      },
    ],
  };
}
