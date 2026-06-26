/**
 * Editorial guide: Siem Reap full-day tours — wildlife, remote temples, Angkor circuits & countryside.
 */

export const SIEM_REAP_FULL_DAY_TOURS_SLUG = 'full-day-tours';

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

export function getSiemReapFullDayToursListingMeta() {
  return {
    category_slug: SIEM_REAP_FULL_DAY_TOURS_SLUG,
    category_name: 'Full-Day Tours',
    title: 'Best Siem Reap Full-Day Tours (2026): Angkor, Remote Temples & Countryside',
    subtitle:
      'Ten hand-picked Siem Reap full-day experiences from $10 — Angkor Wildlife Aquarium, Banteay Srei & Koh Ker, sunrise temple circuits, ATV rides, and tuk-tuk Angkor Park.',
    hero_image: taImage('13/c3/c5/a0', '720x480'),
  };
}

export function getSiemReapFullDayToursTopPick() {
  return tour({
    productId: '5507714P2',
    title: 'Full Day Pass Angkor Wildlife and Aquarium - Siem Reap',
    tagLabel: 'Top pick · Skip the line · 174 reviews',
    operatorName: 'Angkor Wildlife & Aquarium',
    imageUrl: taImage('13/c3/c5/a0', '720x480'),
    durationLabel: '2–5 hours',
    priceFrom: 15,
    rating: 4.9,
    reviewCount: 174,
    bestFor:
      'Best for: A temple-free full day at Angkor Wildlife & Aquarium — Mekong freshwater tanks, ocean exhibits, Bengal tigers, sun bears, and a hands-on touch pool from $15.',
    whoFor:
      'Families and wildlife lovers who want a break from stone temples — skip-the-line entry, wheelchair accessible, and proceeds support conservation.',
    details: [
      ['Operator', 'Angkor Wildlife & Aquarium'],
      ['Rating', '4.9 from 174+ reviews'],
      ['Price from', '$15'],
      ['Duration', '~2–5 hours (self-paced)'],
      ['Includes', 'All fees, entry ticket, skip-the-line access'],
      ['Note', 'Lunch and transport not included'],
      ['Cancellation', 'Free cancellation'],
    ],
    summary:
      'Explore Cambodia’s biodiversity under one roof — freshwater Mekong species, marine tanks, tigers, crocodiles, and otters in naturalistic habitats with conservation at the core.',
  });
}

export function getSiemReapFullDayRemoteTemplesThree() {
  return [
    tour({
      productId: '118579P23',
      title: 'Full Day Banteay Srei Beng Mealea and Koh Ker Small Group Tour',
      tagLabel: 'Small group · 43 reviews',
      operatorName: 'Asean Angkor Guide',
      imageUrl: taImage('11/8d/88/ba'),
      durationLabel: '10 hours',
      priceFrom: 75,
      rating: 5,
      reviewCount: 43,
      bestFor:
        'Best for: A full-day road trip to three remote temple sites — pink-sandstone Banteay Srei, jungle Beng Mealea, and the pyramid temples of Koh Ker with lunch included.',
      whoFor:
        'Repeat Angkor visitors who want less-crowded ruins beyond the main park — A/C transport, guide, water, towels, and seasonal fruit.',
      details: [
        ['Operator', 'Asean Angkor Guide'],
        ['Rating', '5.0 from 43+ reviews'],
        ['Price from', '$75'],
        ['Duration', '~10 hours'],
        ['Includes', 'A/C vehicle, guide, lunch, water, towels, fruit'],
        ['Note', 'Temple passes for Beng Mealea & Banteay Srei not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '349857P3',
      title: 'Full Day to Banteay Srei, Kulen National Park and Beng Mealea',
      tagLabel: 'Private · Kulen waterfalls',
      operatorName: 'The Fin Travel & Tours',
      imageUrl: taImage('0f/48/5a/a2'),
      durationLabel: '9–10 hours',
      priceFrom: 60,
      rating: 5,
      reviewCount: 4,
      bestFor:
        'Best for: Kulen Mountain waterfalls and sacred river carvings, untouched Beng Mealea jungle ruins, and Banteay Srei — led by veteran guide Fin with 20+ years experience.',
      whoFor:
        'Travelers who want a private vehicle and deep cultural commentary — separate passes needed for Angkor ($37), Kulen ($20), and lunch (~$5–7).',
      details: [
        ['Operator', 'The Fin Travel & Tours'],
        ['Rating', '5.0 from 4+ reviews'],
        ['Price from', '$60'],
        ['Duration', '~9–10 hours'],
        ['Includes', 'English guide, bottled water, A/C vehicle'],
        ['Note', 'Park & temple passes and lunch extra'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '488810P1',
      title: 'Full Day Angkor Wat Sunrise and Banteay Srei Tour',
      tagLabel: 'Best value · 43 reviews',
      operatorName: 'Cambo Angkor Guide',
      imageUrl: taImage('13/18/2a/e2'),
      durationLabel: '7–8 hours',
      priceFrom: 24.99,
      rating: 5,
      reviewCount: 43,
      bestFor:
        'Best for: Angkor Wat sunrise, temple carvings in the morning, then pink-sandstone Banteay Srei — with Cambodian lunch and handicrafts in Preah Dak village, back by ~2 PM.',
      whoFor:
        'Budget travelers who want sunrise at Angkor and Banteay Srei in one efficient day without the long haul to Koh Ker — guide, A/C vehicle, and water included.',
      details: [
        ['Operator', 'Cambo Angkor Guide'],
        ['Rating', '5.0 from 43+ reviews'],
        ['Price from', '$24.99'],
        ['Duration', '~7–8 hours'],
        ['Includes', 'A/C vehicle, tour guide, bottled water'],
        ['Note', 'Angkor Pass and breakfast not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapFullDayAngkorThree() {
  return [
    tour({
      productId: '53571P1',
      title: 'Angkor wat and Small group temples Full day tours',
      tagLabel: 'Small group · Ta Prohm',
      operatorName: 'Bayon Tabi Tour',
      imageUrl: taImage('06/6e/ec/77'),
      durationLabel: '9 hours',
      priceFrom: 45,
      rating: 5,
      reviewCount: 14,
      bestFor:
        'Best for: A relaxed small-group circuit — Angkor Wat, Bayon’s stone faces, jungle Ta Prohm, Sras Srang, and Angkor Thom at a pace that doesn’t rush.',
      whoFor:
        'First-timers who want the classic temple highlights with hotel pickup, licensed guide, and A/C van from $45.',
      details: [
        ['Operator', 'Bayon Tabi Tour'],
        ['Rating', '5.0 from 14+ reviews'],
        ['Price from', '$45'],
        ['Duration', '~9 hours'],
        ['Includes', 'Hotel pickup, A/C vehicle, licensed guide, water'],
        ['Note', 'Angkor Pass and meals not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '121561P14',
      title: 'Angkor Wat Full-Day Sunrise & Sunset Private Tour All Interesting Major Temples',
      tagLabel: 'Private · Sunrise to sunset',
      operatorName: 'Happy Angkor Tour',
      imageUrl: taImage('10/01/e7/53'),
      durationLabel: '11–12 hours',
      priceFrom: 88.5,
      rating: 5,
      reviewCount: 48,
      bestFor:
        'Best for: One packed private day — Angkor Wat sunrise, Ta Prohm morning, then Angkor Thom (Bayon, terraces, gates) and Phnom Bakheng sunset.',
      whoFor:
        'Short-stay visitors who want every major temple in a single marathon day with private A/C vehicle and licensed guide.',
      details: [
        ['Operator', 'Happy Angkor Tour'],
        ['Rating', '5.0 from 48+ reviews'],
        ['Price from', '$88.50'],
        ['Duration', '~11–12 hours'],
        ['Includes', 'Private A/C vehicle, guide, water, towels, parking'],
        ['Note', 'Meals (~$5) and Angkor Pass not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '68746P1',
      title: 'Full-Day Angkor Wat Sunrise Private Tour with Guide from Siem Reap',
      tagLabel: '3,356 reviews · Private sunrise',
      operatorName: 'Angkor Wat Travel Tour',
      imageUrl: taImage('06/73/d9/f5'),
      durationLabel: '8 hours',
      priceFrom: 60,
      rating: 5,
      reviewCount: 3356,
      bestFor:
        'Best for: Beat the crowds at Angkor Wat dawn, then Ta Prohm, Angkor Thom, and Banteay Kdei with a guide who knows photo spots and shade routes.',
      whoFor:
        'The most-reviewed private sunrise tour on our list — ideal when you want expertise without a 12-hour marathon.',
      details: [
        ['Operator', 'Angkor Wat Travel Tour'],
        ['Rating', '5.0 from 3,356+ reviews'],
        ['Price from', '$60'],
        ['Duration', '~8 hours'],
        ['Includes', 'Private transport, English guide, cold water & towel'],
        ['Note', 'Entrance tickets and meals not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapFullDayAdventureThree() {
  return [
    tour({
      productId: '68642P5',
      title: 'ATV Experience Tour in Siem Reap',
      tagLabel: 'Private · 1-hour quad',
      operatorName: 'Quad Adventure Cambodia Siem Reap',
      imageUrl: taImage('11/7b/da/29'),
      durationLabel: '1 hour',
      priceFrom: 36,
      rating: 5,
      reviewCount: 4,
      bestFor:
        'Best for: A private ATV ride through Siem Reap’s red-dirt countryside and village lanes — helmets, tuk-tuk hotel pickup, and routes tailored to your skill level.',
      whoFor:
        'Active travelers who want an adrenaline break from temples — wear long sleeves and closed shoes.',
      details: [
        ['Operator', 'Quad Adventure Cambodia Siem Reap'],
        ['Rating', '5.0 from 4+ reviews'],
        ['Price from', '$36'],
        ['Duration', '~1 hour riding'],
        ['Includes', 'Helmet, mask, rain coat, instructor, tuk-tuk pickup, water & towel'],
        ['Note', 'Food and tips not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '91714P1',
      title: 'Motobike Countryside Adventure - Full day with lakeside lunch',
      tagLabel: 'Full day · Lakeside lunch',
      operatorName: 'Sabai Adventures Cambodia',
      imageUrl: taImage('0f/33/ec/cb'),
      durationLabel: '6 hours',
      priceFrom: 64,
      rating: 5,
      reviewCount: 3,
      bestFor:
        'Best for: A guided motorbike loop through remote villages, a Buddhist pagoda, a traditional market, and a swim stop at an eco lake with lunch included.',
      whoFor:
        'Adventurous riders who want rural Cambodia beyond the temples — crosses a 1,000-year-old Angkor-era bridge still in use.',
      details: [
        ['Operator', 'Sabai Adventures Cambodia'],
        ['Rating', '5.0 from 3+ reviews'],
        ['Price from', '$64'],
        ['Duration', '~6 hours'],
        ['Includes', 'Moto, fuel, lunch, all fees & taxes'],
        ['Note', 'Moderate fitness required'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
    tour({
      productId: '202635P19',
      title: 'Full Day Angkor Park with Sunset by Tuk Tuk - Private Tour',
      tagLabel: 'Budget · Tuk-tuk sunset',
      operatorName: 'Angkor Temple Tours',
      imageUrl: taImage('12/27/ff/7d'),
      durationLabel: '8 hours',
      priceFrom: 10,
      rating: null,
      reviewCount: 0,
      bestFor:
        'Best for: A full Angkor Park day by tuk-tuk from just $10 — hotel pickup at 8 AM, licensed guide, water, towels, and sunset at the temples.',
      whoFor:
        'Budget travelers who prefer open-air tuk-tuk transport over a minivan — Angkor Pass ($37) purchased separately.',
      details: [
        ['Operator', 'Angkor Temple Tours'],
        ['Price from', '$10'],
        ['Duration', '~8 hours'],
        ['Includes', 'Private tuk-tuk & driver, guide, water, towels, hotel pickup'],
        ['Note', 'Angkor Temple Pass not included'],
        ['Cancellation', 'Free cancellation'],
      ],
    }),
  ];
}

export function getSiemReapFullDayToursCuratedForSchema() {
  const seen = new Set();
  const ordered = [];
  const add = (t) => {
    if (!t?.productId || seen.has(t.productId)) return;
    seen.add(t.productId);
    ordered.push(t);
  };
  add(getSiemReapFullDayToursTopPick());
  getSiemReapFullDayRemoteTemplesThree().forEach(add);
  getSiemReapFullDayAngkorThree().forEach(add);
  getSiemReapFullDayAdventureThree().forEach(add);
  return ordered;
}

export function getSiemReapFullDayToursGuideData() {
  const listing = getSiemReapFullDayToursListingMeta();
  const topPick = getSiemReapFullDayToursTopPick();

  return {
    guideLayout: 'siem-reap-full-day-tours',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Full-day tours',
    toursSearchQuery: 'Siem Reap full day tour Angkor temples',
    heroImage: listing.hero_image,
    heroTagline:
      'Wildlife pass from $15 · Remote temples from $60 · Angkor full day from $45 · Tuk-tuk park day from $10',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    curatedToursForSchema: getSiemReapFullDayToursCuratedForSchema(),
    topPick,
    topPickHeading: 'Top pick: Angkor Wildlife & Aquarium full-day pass',
    transferSections: [
      {
        id: 'remote-temple-day-trips',
        title: 'Remote temple full-day trips',
        description:
          'Venture beyond Angkor Park to Banteay Srei’s pink sandstone, jungle-clad Beng Mealea, Koh Ker pyramids, or Kulen Mountain waterfalls.',
        tours: getSiemReapFullDayRemoteTemplesThree(),
      },
      {
        id: 'full-day-angkor',
        title: 'Full-day Angkor temple circuits',
        description:
          'Sunrise at Angkor Wat, Bayon’s faces, Ta Prohm’s tree roots, and Angkor Thom — by small group van or private A/C vehicle.',
        tours: getSiemReapFullDayAngkorThree(),
      },
      {
        id: 'atv-tuk-tuk-countryside',
        title: 'ATV, motorbike & tuk-tuk full days',
        description:
          'Swap temple fatigue for red-dirt ATV trails, guided motorbike village loops, or a budget-friendly Angkor Park day by tuk-tuk.',
        tours: getSiemReapFullDayAdventureThree(),
      },
    ],
    introParagraphs: [
      'A full day in Siem Reap can mean sunrise at Angkor Wat, a 10-hour dash to Koh Ker, or a wildlife break at the Angkor Aquarium when temple legs need a rest.',
      'Below are ten curated full-day options — from a $15 skip-the-line wildlife pass to private sunrise circuits with 3,000+ reviews and a $24.99 Angkor–Banteay Srei sunrise day.',
    ],
    comparisonSection: {
      title: 'Full-day tours — quick comparison',
      headers: ['Experience', 'Price from', 'Best for', 'Duration'],
      rows: [
        ['Angkor Wildlife & Aquarium (top pick)', 'From $15', 'Families, conservation, skip the line', '~2–5 hours'],
        ['Banteay Srei, Beng Mealea & Koh Ker', 'From $75', 'Remote temples, small group, lunch', '~10 hours'],
        ['Kulen, Banteay Srei & Beng Mealea', 'From $60', 'Private with veteran guide Fin', '~9–10 hours'],
        ['Angkor sunrise & Banteay Srei', 'From $24.99', 'Sunrise + village lunch, back by 2 PM', '~7–8 hours'],
        ['Small group Angkor temples', 'From $45', 'Classic circuit, relaxed pace', '~9 hours'],
        ['Sunrise & sunset private Angkor', 'From $88.50', 'All major temples in one marathon day', '~11–12 hours'],
        ['Angkor Wat sunrise private tour', 'From $60', '3,356 reviews, crowd-beating guide', '~8 hours'],
        ['ATV countryside experience', 'From $36', '1-hour private quad ride', '~1 hour'],
        ['Motobike countryside + lunch', 'From $64', 'Villages, lake swim, pagoda', '~6 hours'],
        ['Angkor Park by tuk-tuk + sunset', 'From $10', 'Budget full-day temple transport', '~8 hours'],
      ],
    },
    tipsSection: {
      title: 'Siem Reap full-day tour tips',
      headers: ['Tip', 'Why'],
      rows: [
        ['Buy your Angkor Pass the day before', 'Queues at the ticket office eat into sunrise timing'],
        ['Remote temple tours leave early', 'Banteay Srei and Koh Ker are 2+ hours from Siem Reap — expect 7 AM pickups'],
        ['Pack lunch money on Fin’s Kulen tour', 'Guide covers transport; meals and park fees are separate'],
        ['Wildlife Aquarium needs no temple pass', 'Good recovery day between heavy temple itineraries'],
        ['Tuk-tuk days are cheapest but sun-exposed', 'Bring hat, sunscreen, and USD for the $37 Angkor Pass'],
      ],
    },
    stats: {
      toursAvailable: 10,
      priceFrom: 10,
      duration: '1h – 12h',
      reviewCount: 3689,
    },
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',

    seo: {
      title: 'Best Siem Reap Full-Day Tours (2026): Angkor, Remote Temples & Wildlife | TopTours',
      description:
        'Compare Siem Reap full-day tours from $10 — Angkor Wildlife Aquarium, Banteay Srei & Koh Ker, sunrise temple circuits, ATV rides, and tuk-tuk Angkor Park days.',
      keywords:
        'Siem Reap full day tour, Angkor full day tour, Banteay Srei day trip, Koh Ker tour, Angkor Wildlife Aquarium, Siem Reap ATV tour',
    },

    faqs: [
      {
        question: 'What is the best full-day tour in Siem Reap?',
        answer:
          'For temples, the Full-Day Angkor Wat Sunrise Private Tour (5.0 from 3,356+ reviews, from $60) is the most trusted. For a non-temple day, the Angkor Wildlife & Aquarium pass (4.9 from 174+ reviews, from $15) is our top pick.',
      },
      {
        question: 'How much does a full-day Angkor tour cost?',
        answer:
          'Small-group temple circuits start from $45. Private sunrise tours run $60–$88.50. Budget tuk-tuk full days start from just $10 plus the $37 Angkor Pass.',
      },
      {
        question: 'Can I visit Koh Ker and Beng Mealea in one day?',
        answer:
          'Yes. The Full Day Banteay Srei, Beng Mealea and Koh Ker tour ($75, 10 hours) covers all three with lunch, guide, and A/C transport. For a shorter Banteay Srei day with Angkor sunrise, the Cambo Angkor Guide tour starts from $24.99.',
      },
      {
        question: 'Do I need an Angkor Pass for every full-day tour?',
        answer:
          'Angkor Park temple tours require the $37 pass. Remote sites like Beng Mealea and Banteay Srei need their own tickets. The Wildlife Aquarium and ATV/motorbike countryside tours do not.',
      },
      {
        question: 'What is the cheapest full-day tour in Siem Reap?',
        answer:
          'The Full Day Angkor Park with Sunset by Tuk-Tuk starts from $10 for private transport and a guide — you add the Angkor Pass separately. The Wildlife Aquarium pass starts from $15 with no temple ticket needed.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Siem Reap day trips',
        href: '/destinations/siem-reap/guides/day-trips',
      },
      {
        label: 'Siem Reap half-day tours',
        href: '/destinations/siem-reap/guides/half-day-tours',
      },
      {
        label: 'Angkor Wat sunrise complete guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
      },
      {
        label: 'Siem Reap countryside & village experiences',
        href: '/destinations/siem-reap/guides/countryside-and-village-experiences',
      },
      {
        label: 'Siem Reap attractions & museums',
        href: '/destinations/siem-reap/guides/attractions-museums',
      },
    ],
  };
}
