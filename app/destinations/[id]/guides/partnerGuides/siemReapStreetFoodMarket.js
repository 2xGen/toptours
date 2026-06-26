/**
 * Editorial guide: Siem Reap street food & market tours — same curated picks as food-drink,
 * written for night-market crawls and Psar Chaa shopping angles (distinct page copy).
 */

export const SIEM_REAP_STREET_FOOD_MARKET_SLUG = 'siem-reap-street-food-and-market-tours';

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

export function getSiemReapStreetFoodMarketListingMeta() {
  return {
    category_slug: SIEM_REAP_STREET_FOOD_MARKET_SLUG,
    category_name: 'Street Food & Market Tours',
    title: 'Siem Reap Street Food & Market Tours (2026): Night Markets, Tuk-Tuk Tastings & Psar Chaa',
    subtitle:
      'Seven vetted Siem Reap food crawls and market-to-kitchen experiences from $22 — evening tuk-tuk tastings, Old Market snacks, and hands-on Khmer cooking after you shop.',
    hero_image: taImage('07/af/87/4d', '720x480'),
  };
}

export function getSiemReapStreetFoodMarketTopPick() {
  return tour({
    productId: '75672P3',
    title: 'Award-Winning Cooking Class Experience with Professional Teacher',
    tagLabel: 'Top pick · Paper Tiger since 1999',
    operatorName: 'Paper Tiger Cooking Class',
    imageUrl: taImage('07/af/87/4d', '720x480'),
    durationLabel: '3 hours',
    priceFrom: 22,
    rating: 5,
    reviewCount: 807,
    bestFor:
      'Best for: Shop Psar Chaa and nearby produce stalls with a chef, then cook Amok, chicken curry, and beef loc lac at Paper Tiger Eatery on Pub Street — 807 five-star reviews from $22.',
    whoFor:
      'Travelers who want the market visit and the kitchen lesson in one package — Siem Reap’s longest-running traveler cooking school since 1999.',
    details: [
      ['Operator', 'Paper Tiger Cooking Class'],
      ['Rating', '5.0 from 807+ reviews'],
      ['Price from', '$22'],
      ['Duration', '~3 hours'],
      ['Includes', 'Market tour, professional chef, lunch or dinner, digital recipes'],
      ['Meeting point', 'Pub Street — next to Angkor What? Bar'],
      ['Note', 'No hotel transport — walkable from Old Market'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'Start at Psar Chaa Old Market with a pro chef, then cook and eat classic Khmer dishes at Paper Tiger Eatery — the highest-reviewed market-to-kitchen experience in Siem Reap.',
  });
}

function getSiemReapStreetFoodMarketTukTukCrawl() {
  return tour({
    productId: '118579P32',
    title: 'Siem Reap: Local Street Food Experience by Tuk-Tuk',
    tagLabel: '177 reviews · Tuk-tuk evening',
    operatorName: 'Asean Angkor Guide',
    imageUrl: taImage('10/5b/0a/9a'),
    durationLabel: '4 hours',
    priceFrom: 35,
    rating: 5,
    reviewCount: 177,
    bestFor:
      'Best for: A guided evening loop through Siem Reap’s busiest snack stalls — noodles, grilled skewers, desserts, and a beer stop — with hotel tuk-tuk pickup and groups capped at eight.',
    whoFor:
      'First-time visitors who want a safe, structured introduction to Cambodian street food without guessing which cart to trust.',
    details: [
      ['Operator', 'Asean Angkor Guide'],
      ['Rating', '5.0 from 177+ reviews — most-reviewed street food tour here'],
      ['Price from', '$35'],
      ['Duration', '~4 hours'],
      ['Includes', 'Tuk-tuk, guide, food & dessert tastings, beer, water, hotel pickup'],
      ['Dietary', 'Alternatives available on request'],
      ['Cancellation', 'Free cancellation'],
    ],
  });
}

export function getSiemReapStreetFoodMarketCrawlsThree() {
  return [
    getSiemReapStreetFoodMarketTukTukCrawl(),
    tour({
      productId: '124103P5',
      title: 'Siem Reap: 11 Tasting Street Foods & Sombai Spirits Tour',
      tagLabel: '11 stops · Sombai spirits',
      operatorName: 'Asia Future Travel',
      imageUrl: taImage('17/03/28/f9'),
      durationLabel: '4 hours',
      priceFrom: 29.5,
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: A timed 5:30–9:30 PM route — Lort Cha stir-fry noodles, night-market bites, village curry houses, and a cocktail at Asana Wooden House.',
      whoFor:
        'Planners who like a fixed schedule and private transport between each tasting rather than wandering on foot.',
      details: [
        ['Operator', 'Asia Future Travel'],
        ['Rating', '5.0 from 1+ review'],
        ['Price from', '$29.50'],
        ['Duration', '~4 hours'],
        ['Includes', 'Private transport, guided tastings'],
        ['Starts', '5:30 PM with hotel pickup'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '31721P10',
      title: 'Street Food Tasting Tour including Dinner',
      tagLabel: 'Adventurous · Remok ride',
      operatorName: 'Journey Cambodia',
      imageUrl: taImage('06/ff/24/c7'),
      durationLabel: '3h 30m',
      priceFrom: 39,
      rating: 4.5,
      reviewCount: 27,
      bestFor:
        'Best for: A remok ride through fruit markets, back alleys, and picnic spots — full dinner included, with optional fried crickets and spiders for the curious.',
      whoFor:
        'Bold eaters who want off-guidebook stops and a local host willing to push beyond the usual Pub Street circuit.',
      details: [
        ['Operator', 'Journey Cambodia'],
        ['Rating', '4.5 from 27+ reviews'],
        ['Price from', '$39'],
        ['Duration', '~3h 30m'],
        ['Includes', 'Remok transport, guide, dinner, tastings, beer, water, hotel pickup'],
        ['Note', 'Vegetarian options on request · insects optional'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapStreetFoodMarketCookingThree() {
  return [
    tour({
      productId: '233275P14',
      title: "Khmer Private Cooking Class at a Local's Home",
      tagLabel: 'Private · Village market',
      operatorName: 'Angkor Express Boat',
      imageUrl: taImage('0a/64/95/4b'),
      durationLabel: '3 hours',
      priceFrom: 24,
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: Buy herbs, vegetables, and proteins at a morning market, then prepare a four-course Khmer lunch inside a family kitchen with tuk-tuk transfers.',
      whoFor:
        'Couples or small groups who prefer a residential setting over a restaurant classroom — optional mushroom and crocodile farm add-ons.',
      details: [
        ['Operator', 'Angkor Express Boat'],
        ['Rating', '5.0 from 1+ review'],
        ['Price from', '$24'],
        ['Duration', '~3 hours'],
        ['Includes', 'Local host, market visit, ingredients, 4-course meal, tuk-tuk pickup'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '5558111P9',
      title: 'Khmer Cooking Class in a Local House',
      tagLabel: 'Private · Home kitchen',
      operatorName: 'Thanut Tours',
      imageUrl: taImage('r/32/85/08/1a/caption'),
      durationLabel: '3h 30m',
      priceFrom: 35,
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: Fresh spring rolls, fish or chicken Amok, and mango sticky rice prepared in Thanut Kean’s Siem Reap home after sourcing ingredients locally.',
      whoFor:
        'Food-focused travelers who want morning or afternoon sessions, private transport, and a sit-down dinner at the end.',
      details: [
        ['Operator', 'Thanut Tours'],
        ['Rating', '5.0 from 1+ review'],
        ['Price from', '$35'],
        ['Duration', '~3h 30m'],
        ['Includes', 'Private transport, dinner, hands-on class'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '459264P1',
      title: 'Khmer Cooking Class in Cambodia',
      tagLabel: 'Near night market · 37 reviews',
      operatorName: 'Sambo cooking class',
      imageUrl: taImage('13/74/2b/57'),
      durationLabel: '2h 30m',
      priceFrom: 25,
      rating: 5,
      reviewCount: 37,
      bestFor:
        'Best for: Step-by-step Khmer recipes steps from Sambo’s kitchen near Wat Damnak — easy to pair with an evening stroll through the adjacent night market afterward.',
      whoFor:
        'Budget-minded eaters who want a proven five-star class (37 reviews) without paying for hotel pickup — meet at Sambo Khmer & Thai Restaurant.',
      details: [
        ['Operator', 'Sambo cooking class'],
        ['Rating', '5.0 from 37+ reviews'],
        ['Price from', '$25'],
        ['Duration', '~2h 30m'],
        ['Includes', 'Chef guide, lunch, vegetarian & vegan options'],
        ['Meeting point', 'Sambo Khmer & Thai Restaurant, Wat Damnak'],
        ['Note', 'Transport not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapStreetFoodMarketCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapStreetFoodMarketTopPick());
  getSiemReapStreetFoodMarketCrawlsThree().forEach(add);
  getSiemReapStreetFoodMarketCookingThree().forEach(add);
  return ordered;
}

export function getSiemReapStreetFoodMarketGuideData() {
  const listing = getSiemReapStreetFoodMarketListingMeta();
  const topPick = getSiemReapStreetFoodMarketTopPick();

  return {
    guideLayout: 'siem-reap-street-food-market',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Street food & market tours',
    toursSearchQuery: 'Siem Reap street food market tour tuk-tuk',
    heroImage: listing.hero_image,
    heroTagline:
      'Paper Tiger market class from $22 · Evening tuk-tuk crawls from $29.50 · Private home cooking from $24',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapStreetFoodMarketCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Paper Tiger award-winning cooking class',
    transferSections: [
      {
        id: 'evening-food-crawls',
        title: 'Evening street food & night market crawls',
        description:
          'Guided loops through Siem Reap’s night markets, noodle alleys, and local snack carts — tastings and dinner included on most routes.',
        tours: getSiemReapStreetFoodMarketCrawlsThree(),
      },
      {
        id: 'market-to-kitchen',
        title: 'Psar Chaa market-to-kitchen classes',
        description:
          'Shop fresh produce at Old Market or village stalls, then cook Amok, spring rolls, and mango sticky rice with a local chef or host family.',
        tours: getSiemReapStreetFoodMarketCookingThree(),
      },
    ],
    introParagraphs: [
      'Siem Reap after dark is a moving buffet — charcoal grills on Pub Street, fruit carts near Psar Chaa, and noodle shops that only open once the temples close. The trick is knowing which stalls locals actually eat at.',
      'We shortlisted seven market and street-food experiences: Paper Tiger’s Psar Chaa shop-and-cook class, three evening crawls led by guides who vet every stop, and three more cooking classes in local homes.',
    ],
    comparisonSection: {
      title: 'Street food & market tours — quick comparison',
      headers: ['Experience', 'Price from', 'Best for', 'Duration'],
      rows: [
        ['Paper Tiger market + cooking (top pick)', 'From $22', 'Psar Chaa shop then cook on Pub Street, 807 reviews', '~3 hours'],
        ['Street food by tuk-tuk', 'From $35', '177 reviews, small groups, hotel pickup', '~4 hours'],
        ['11 Tasting street foods tour', 'From $29.50', 'Timed evening route with Sombai spirits', '~4 hours'],
        ['Street food + dinner (Journey)', 'From $39', 'Remok ride, adventurous eats', '~3h 30m'],
        ['Private cooking at local home', 'From $24', 'Village market + 4-course lunch', '~3 hours'],
        ['Thanut local house class', 'From $35', 'Amok & mango sticky rice at home', '~3h 30m'],
        ['Sambo Khmer cooking class', 'From $25', '37 reviews, near night market', '~2h 30m'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap market & street food tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Book evening tours for 5:30–6 PM pickup', 'Stalls peak after sunset — you’ll hit the busiest, freshest carts'],
        ['Carry small USD notes', 'Many vendors prefer dollars; change is easier at $1 and $5 bills'],
        ['Eat where locals queue', 'Guided tours do this for you; on your own, follow the longest line'],
        ['Pair a morning market class with a free evening', 'Paper Tiger and Sambo run daytime slots — save street crawls for night two'],
        ['Say no to insects if unsure', 'Journey Cambodia offers crickets and spiders as optional tastings, not requirements'],
      ],
    },
    stats: {
      toursAvailable: 7,
      priceFrom: 22,
      duration: '2h 30m – 4h',
      reviewCount: 1051,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title:
        'Siem Reap Street Food & Market Tours (2026): Night Market Crawls & Tuk-Tuk Tastings | TopTours',
      description:
        'Compare Siem Reap street food tours from $29.50 and market-to-kitchen classes from $22 — tuk-tuk evening crawls, Psar Chaa cooking lessons, and guided night-market tastings.',
      keywords:
        'Siem Reap street food tour, Siem Reap night market food, Psar Chaa market tour, tuk-tuk food tour Siem Reap, Khmer street food Cambodia',
    },

    faqs: [
      {
        question: 'What is the best street food tour in Siem Reap?',
        answer:
          'The Local Street Food Experience by Tuk-Tuk has the strongest street-crawl reviews — 5.0 from 177+ reviews, from $35, with hotel pickup and groups limited to eight. For a market-to-kitchen experience, Paper Tiger Cooking Class is our top pick with 807+ five-star reviews from $22.',
      },
      {
        question: 'Which Siem Reap tour combines a market visit with cooking?',
        answer:
          'Paper Tiger Cooking Class ($22, 807+ reviews) starts with a Psar Chaa market shop before you cook classic dishes on Pub Street. Private home classes with Angkor Express Boat and Thanut Tours also include market sourcing.',
      },
      {
        question: 'Is Siem Reap night market food safe to eat?',
        answer:
          'On guided tours, operators choose busy stalls with high turnover. The tuk-tuk street food tour is the safest entry point for first-timers. Avoid raw salads and unpeeled fruit when eating independently.',
      },
      {
        question: 'What time do Siem Reap street food tours start?',
        answer:
          'Most evening crawls pick up around 5:30 PM and run three to four hours. Cooking classes with market visits are offered morning or afternoon — book the slot that fits your temple schedule.',
      },
      {
        question: 'How is this guide different from the Siem Reap food & drink guide?',
        answer:
          'Both guides cover the same seven vetted experiences, but this page focuses on night-market crawls, Psar Chaa shopping, and evening tasting routes. The food & drink guide emphasizes cooking schools and broader Khmer cuisine.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Siem Reap food & drink',
        href: '/destinations/siem-reap/guides/food-drink',
      },
      {
        label: 'Siem Reap nightlife & local entertainment',
        href: '/destinations/siem-reap/guides/nightlife-and-local-entertainment',
      },
      {
        label: 'Siem Reap half-day tours',
        href: '/destinations/siem-reap/guides/half-day-tours',
      },
      {
        label: 'Siem Reap countryside & village experiences',
        href: '/destinations/siem-reap/guides/countryside-and-village-experiences',
      },
      {
        label: 'Siem Reap restaurants',
        href: '/destinations/siem-reap/restaurants',
      },
    ],
  };
}
