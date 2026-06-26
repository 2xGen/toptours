/**
 * Editorial guide: Siem Reap food & drink — cooking classes and street food tours.
 */

export const SIEM_REAP_FOOD_DRINK_SLUG = 'food-drink';

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

export function getSiemReapFoodDrinkListingMeta() {
  return {
    category_slug: SIEM_REAP_FOOD_DRINK_SLUG,
    category_name: 'Food & Drink',
    title: 'Best Siem Reap Food Tours & Cooking Classes (2026): Street Food & Khmer Cuisine',
    subtitle:
      'Hand-picked Siem Reap food experiences from $22 — Paper Tiger cooking class, local-home lessons, and evening street food tours by tuk-tuk.',
    hero_image: taImage('07/af/87/4d', '720x480'),
  };
}

export function getSiemReapFoodDrinkTopPick() {
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
      'Best for: Historic market tour plus hands-on Amok, chicken curry, and beef loc lac at Paper Tiger Eatery on Pub Street — 807 five-star reviews from $22.',
    whoFor:
      'The most-reviewed cooking class in Siem Reap — ideal for first-timers who want a professional chef, market visit, meal, and digital recipe book.',
    details: [
      ['Operator', 'Paper Tiger Cooking Class'],
      ['Rating', '5.0 from 807+ reviews'],
      ['Price from', '$22'],
      ['Duration', '~3 hours'],
      ['Includes', 'Market tour, professional chef, lunch or dinner, digital recipes'],
      ['Meeting point', 'Pub Street — next to Angkor What? Bar'],
      ['Note', 'No hotel transport — walkable from Old Market area'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'Siem Reap’s original traveler cooking school since 1999 — shop the market, cook classic Khmer dishes with a pro chef, and eat what you make at Paper Tiger Eatery.',
  });
}

export function getSiemReapFoodDrinkCookingThree() {
  return [
    tour({
      productId: '233275P14',
      title: "Khmer Private Cooking Class at a Local's Home",
      tagLabel: 'Private · Local home',
      operatorName: 'Angkor Express Boat',
      imageUrl: taImage('0a/64/95/4b'),
      durationLabel: '3 hours',
      priceFrom: 24,
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: Market shopping for fresh ingredients, then a private 4-course Khmer lunch cooked in a local’s home with tuk-tuk transfers.',
      whoFor:
        'Travelers who want an intimate home kitchen experience rather than a restaurant school — optional mushroom and crocodile farm visits.',
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
      tagLabel: 'Private · Amok & spring rolls',
      operatorName: 'Thanut Tours',
      imageUrl: taImage('r/32/85/08/1a/caption'),
      durationLabel: '3h 30m',
      priceFrom: 35,
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: Fresh spring rolls, fish or chicken Amok, and mango sticky rice in a local Siem Reap house with guide Thanut Kean.',
      whoFor:
        'Food lovers who want morning or afternoon sessions in a real Khmer home with private transport and dinner included.',
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
      tagLabel: 'Best value · 37 reviews',
      operatorName: 'Sambo cooking class',
      imageUrl: taImage('13/74/2b/57'),
      durationLabel: '2h 30m',
      priceFrom: 25,
      rating: 5,
      reviewCount: 37,
      bestFor:
        'Best for: Interactive step-by-step Khmer cooking with friendly chefs near Wat Damnak — lunch included, vegetarian and vegan options.',
      whoFor:
        'Budget-conscious foodies who want a proven 5-star class (37 reviews) without paying for hotel pickup — meet at Sambo near the night market.',
      details: [
        ['Operator', 'Sambo cooking class'],
        ['Rating', '5.0 from 37+ reviews'],
        ['Price from', '$25'],
        ['Duration', '~2h 30m'],
        ['Includes', 'Chef guide, lunch, dietary accommodations'],
        ['Meeting point', 'Sambo Khmer & Thai Restaurant, Wat Damnak'],
        ['Note', 'Transport not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapFoodDrinkStreetFoodThree() {
  return [
    tour({
      productId: '124103P5',
      title: 'Siem Reap: 11 Tasting Street Foods & Sombai Spirits Tour',
      tagLabel: 'Evening · 11 tastings',
      operatorName: 'Asia Future Travel',
      imageUrl: taImage('17/03/28/f9'),
      durationLabel: '4 hours',
      priceFrom: 29.5,
      rating: 5,
      reviewCount: 1,
      bestFor:
        'Best for: Timed evening crawl — Lort Cha noodles, night market snacks, noodle village curries, and cocktails at Asana Wooden House from $29.50.',
      whoFor:
        'Curious eaters who want a structured 5:30–9:30 PM food itinerary with private transport between stops.',
      details: [
        ['Operator', 'Asia Future Travel'],
        ['Rating', '5.0 from 1+ review'],
        ['Price from', '$29.50'],
        ['Duration', '~4 hours'],
        ['Includes', 'Private transport, guided tastings'],
        ['Note', 'Starts 5:30 PM with hotel pickup'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '118579P32',
      title: 'Siem Reap: Local Street Food Experience by Tuk-Tuk',
      tagLabel: 'Top-rated · Tuk-tuk evening',
      operatorName: 'Asean Angkor Guide',
      imageUrl: taImage('10/5b/0a/9a'),
      durationLabel: '4 hours',
      priceFrom: 35,
      rating: 5,
      reviewCount: 177,
      bestFor:
        'Best for: Small-group evening street food by tuk-tuk — local dishes, desserts, beer tasting, and Khmer traditional house stop with 177 five-star reviews.',
      whoFor:
        'The safest bet for street food beginners — expert guide, max 8 guests, dietary alternatives available on request.',
      details: [
        ['Operator', 'Asean Angkor Guide'],
        ['Rating', '5.0 from 177+ reviews'],
        ['Price from', '$35'],
        ['Duration', '~4 hours'],
        ['Includes', 'Tuk-tuk, guide, food & dessert tastings, beer, water, hotel pickup'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '31721P10',
      title: 'Street Food Tasting Tour including Dinner',
      tagLabel: 'Adventurous · Insects optional',
      operatorName: 'Journey Cambodia',
      imageUrl: taImage('06/ff/24/c7'),
      durationLabel: '3h 30m',
      priceFrom: 39,
      rating: 4.5,
      reviewCount: 27,
      bestFor:
        'Best for: Off-the-beaten-path remok ride through fruit markets, alleys, and picnic spots — dinner included, with optional fried crickets and spiders.',
      whoFor:
        'Bold eaters who want the full Khmer street food spectrum with a local guide and vegetarian options on request.',
      details: [
        ['Operator', 'Journey Cambodia'],
        ['Rating', '4.5 from 27+ reviews'],
        ['Price from', '$39'],
        ['Duration', '~3h 30m'],
        ['Includes', 'Remok transport, guide, dinner, food tastings, beer, water, hotel pickup'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapFoodDrinkCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapFoodDrinkTopPick());
  getSiemReapFoodDrinkCookingThree().forEach(add);
  getSiemReapFoodDrinkStreetFoodThree().forEach(add);
  return ordered;
}

export function getSiemReapFoodDrinkGuideData() {
  const listing = getSiemReapFoodDrinkListingMeta();
  const topPick = getSiemReapFoodDrinkTopPick();

  return {
    guideLayout: 'siem-reap-food-drink',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Food & drink',
    toursSearchQuery: 'Siem Reap cooking class street food tour',
    heroImage: listing.hero_image,
    heroTagline:
      'Paper Tiger cooking class from $22 · Local-home lessons from $24 · Street food tours from $29.50',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapFoodDrinkCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Paper Tiger award-winning cooking class',
    transferSections: [
      {
        id: 'cooking-classes',
        title: 'Khmer cooking classes',
        description:
          'Learn Amok, spring rolls, and mango sticky rice — from Paper Tiger’s market-to-kitchen class to private lessons in local homes.',
        tours: getSiemReapFoodDrinkCookingThree(),
      },
      {
        id: 'street-food-tours',
        title: 'Siem Reap street food tours',
        description:
          'Evening tuk-tuk and remok food crawls through night markets, noodle villages, and local eateries — dinner and tastings included.',
        tours: getSiemReapFoodDrinkStreetFoodThree(),
      },
    ],
    introParagraphs: [
      'Siem Reap’s food scene stretches from Pub Street cooking schools to village noodle stalls and night markets serving grilled skewers, Lort Cha, and yes — fried insects for the brave.',
      'Below are seven hand-picked experiences from the legendary Paper Tiger class ($22, 807 reviews) to intimate home kitchens and guided street food evenings. Book cooking classes for lunch or dinner slots; street food tours run in the evening.',
    ],
    comparisonSection: {
      title: 'Food tours & cooking classes — quick comparison',
      headers: ['Experience', 'Price from', 'Best for', 'Duration'],
      rows: [
        ['Paper Tiger cooking class (top pick)', 'From $22', 'Market tour + pro chef, 807 reviews', '~3 hours'],
        ['Private cooking at local home', 'From $24', '4-course lunch in a Khmer house', '~3 hours'],
        ['Sambo Khmer cooking class', 'From $25', '37 five-star reviews, near night market', '~2h 30m'],
        ['Thanut local house class', 'From $35', 'Amok & mango sticky rice at home', '~3h 30m'],
        ['11 Tasting street foods tour', 'From $29.50', 'Timed evening food crawl', '~4 hours'],
        ['Street food by tuk-tuk', 'From $35', '177 reviews, small groups', '~4 hours'],
        ['Street food + dinner (Journey)', 'From $39', 'Adventurous eats incl. insects', '~3h 30m'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap food tour tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Book Paper Tiger morning or afternoon', 'Pub Street location — easy to combine with temple-free half days'],
        ['Tell guides about dietary needs early', 'Most classes offer vegetarian; street tours have alternatives'],
        ['Street food tours start around 5:30 PM', 'Arrive hungry — multiple tastings replace a full restaurant dinner'],
        ['Bring cash for extra drinks', 'Some tours include one beer; cocktails at wooden-house bars are extra'],
        ['Try Amok at least once', 'Cambodia’s signature coconut curry — best learned hands-on in a class'],
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
      title: 'Best Siem Reap Food Tours & Cooking Classes (2026): Street Food & Khmer Cuisine | TopTours',
      description:
        'Compare Siem Reap cooking classes from $22 and street food tours from $29.50 — Paper Tiger, local-home lessons, tuk-tuk evening food crawls with real reviews.',
      keywords:
        'Siem Reap cooking class, Paper Tiger cooking class, Siem Reap street food tour, Khmer food tour, Amok cooking class Siem Reap',
    },

    faqs: [
      {
        question: 'What is the best cooking class in Siem Reap?',
        answer:
          'The Award-Winning Cooking Class at Paper Tiger Eatery is our top pick — 5.0 from 807+ reviews, from $22, with a historic market visit and hands-on Amok, curry, and loc lac lessons on Pub Street.',
      },
      {
        question: 'What is the best street food tour in Siem Reap?',
        answer:
          'The Local Street Food Experience by Tuk-Tuk (5.0 from 177+ reviews, from $35) is the highest-rated evening food tour on our list. For a budget option, the 11 Tasting Street Foods tour starts from $29.50.',
      },
      {
        question: 'How much does a Siem Reap cooking class cost?',
        answer:
          'Cooking classes on our list range from $22 (Paper Tiger) to $35 (private local house with Thanut Tours). Most include the meal you cook; some add market visits and hotel tuk-tuk pickup.',
      },
      {
        question: 'Is Siem Reap street food safe for tourists?',
        answer:
          'Guided tours choose vetted stalls and busy kitchens. The tuk-tuk street food tour limits groups to 8 and accommodates dietary restrictions. Fried insects are optional on the Journey Cambodia dinner tour.',
      },
      {
        question: 'Can vegetarians join Siem Reap food tours?',
        answer:
          'Yes. Sambo cooking class explicitly accommodates vegetarian, vegan, and gluten-free diets. Street food guides offer alternative tastings — notify the operator when you book.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Siem Reap half-day tours',
        href: '/destinations/siem-reap/guides/half-day-tours',
      },
      {
        label: 'Siem Reap countryside & village experiences',
        href: '/destinations/siem-reap/guides/countryside-and-village-experiences',
      },
      {
        label: 'Siem Reap attractions & museums',
        href: '/destinations/siem-reap/guides/attractions-museums',
      },
      {
        label: 'Siem Reap day trips',
        href: '/destinations/siem-reap/guides/day-trips',
      },
      {
        label: 'Siem Reap restaurants',
        href: '/destinations/siem-reap/restaurants',
      },
    ],
  };
}
