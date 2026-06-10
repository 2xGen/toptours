/** Editorial hub picks for Arusha — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best private sandbank',
    productCode: '427486P16',
    titleMatch: 'Romantic Nakupenda Bis/Nyange Sandbank',
    fallbackTitle: 'Romantic Nakupenda Bis/Nyange Sandbank Trip',
    bestFor: 'Couples who want a private beach day on the water',
    why: 'A private sandbank escape—crystal-clear swim stops, tropical lunch on board, and time on pristine sand away from crowded resort beaches.',
  },
  {
    label: 'Best romantic safari',
    productCode: '411336P2',
    titleMatch: '3-Day Romantic Safari in Tanzania',
    fallbackTitle: '3-Day Romantic Safari in Tanzania: Ngorongoro and Tarangire',
    bestFor: 'Honeymoons and anniversary trips',
    why: 'Three days through Tarangire and Ngorongoro with private game drives, a Maasai mock-wedding ceremony, and full-board lodge stays—built for couples, not bus groups.',
  },
  {
    label: 'Best luxury short safari',
    productCode: '114963P10',
    titleMatch: 'Private 2-Day Luxury Safari: Tarangire',
    fallbackTitle: 'Private 2-Day Luxury Safari: Tarangire & Ngorongoro Crater',
    bestFor: 'Couples who want comfort without a week on the road',
    why: 'Private 4×4, luxury lodge, and a dedicated guide across Tarangire’s elephant herds and the Ngorongoro Crater floor—Big Five potential in two days.',
  },
];

const familiesPicks = [
  {
    label: 'Best waterfall hike',
    productCode: '202273P3',
    titleMatch: 'Mount Meru Arusha Napuru Waterfall',
    fallbackTitle: 'Mount Meru Arusha Napuru Waterfall Hike by Kingstone Asilia',
    bestFor: 'Families who want nature without a full safari day',
    why: 'A family-run hike to 78m Napuru Falls on Mount Meru’s slopes—swim in the pool below, home-grown coffee afterward, and village roads kids find genuinely interesting.',
  },
  {
    label: 'Best dolphin snorkel',
    productCode: '5608934P4',
    titleMatch: 'Mnemba Island Dolphin and Snorkeling',
    fallbackTitle: 'Mnemba Island Dolphin and Snorkeling Tour',
    bestFor: 'Kids who love marine wildlife',
    why: 'Wild dolphins, Mnemba Atoll reef snorkeling, tropical fruit on board, and hotel pickup—half a day on turquoise water that works for mixed ages.',
  },
  {
    label: 'Best Kilimanjaro taster',
    productCode: '305732P11',
    titleMatch: 'Mount Kilimanjaro Day Hike Through Marangu',
    fallbackTitle: 'Mount Kilimanjaro Day Hike Through Marangu Route to Mandara Hut',
    bestFor: 'Families not ready for a full summit trek',
    why: 'One day up the Marangu Route to Mandara Hut and back—enough to feel the mountain without committing to a week. Popular with kids who are not ready for the full climb.',
  },
];

const adventurePicks = [
  {
    label: 'Best elephant safari day',
    productCode: '259457P11',
    titleMatch: 'Day Trip to Tarangire National Park',
    fallbackTitle: 'Day Trip to Tarangire National Park Wildlife Safari Adventure',
    bestFor: 'First-time safari visitors with one free day',
    why: 'Full day in Tarangire—huge elephant herds, lions, picnic lunch in the park, and optional Materuni Waterfalls stop on the drive back to Arusha.',
  },
  {
    label: 'Best crater day trip',
    productCode: '142902P29',
    titleMatch: 'Ngorongoro Adventures in a day',
    fallbackTitle: 'Ngorongoro Adventures in a day',
    bestFor: 'Wildlife lovers who want the crater floor',
    why: 'Animals concentrated inside the crater make for dense game viewing in a single day—one of the most reliable short safari options from Arusha.',
  },
  {
    label: 'Best paddle and pedal',
    productCode: '392474P1',
    titleMatch: 'Lake duluti Canoeing',
    fallbackTitle: 'Lake duluti Canoeing/kayaking &/or cycling adventure with lunch',
    bestFor: 'Active travelers who want more than a jeep',
    why: 'Canoe Lake Duluti with Meru and Kilimanjaro views, then cycle to Mangalia Waterfalls through coffee farms and a banana-beer stop—local lunch included.',
  },
];

const soloPicks = [
  {
    label: 'Best group Kilimanjaro trek',
    productCode: '150526P11',
    titleMatch: 'Affordable 7-day Machame Route',
    fallbackTitle: 'Affordable 7-day Machame Route on Kilimanjaro Group Hiking Tour',
    bestFor: 'Solo climbers who want a group and a fair price',
    why: 'The classic Machame Route in a guided group—porters, camp gear, and meals included. Flexible departures from Arusha make it easy to join without a private booking.',
  },
  {
    label: 'Best multi-day safari',
    productCode: '392474P8',
    titleMatch: '5-Day affordable Tanzania safari',
    fallbackTitle: '5-Day affordable Tanzania safari with extra activities',
    bestFor: 'Solo travelers who want Serengeti and culture',
    why: 'Five days through Tarangire, Serengeti, and Ngorongoro plus Materuni Waterfalls and Kikuletwa Hot Springs—designed for solo joiners and small groups.',
  },
  {
    label: 'Best private crater day',
    productCode: '480452P1',
    titleMatch: 'Adventure Day Trip to Ngorongoro Crater',
    fallbackTitle: 'Adventure Day Trip to Ngorongoro Crater with Picnic Lunch',
    bestFor: 'Solo travelers who want a private vehicle',
    why: 'Private open-roof safari vehicle, packed lunch, and a full day on the crater floor with Big Five potential—no waiting on a shared group’s pace.',
  },
];

const culturePicks = [
  {
    label: 'Best city walking tour',
    productCode: '5596000P1',
    titleMatch: 'Arusha Guided Walking City Tour',
    fallbackTitle: 'Arusha Guided Walking City Tour: Culture, History & Local Markets',
    bestFor: 'First day in Arusha before or after safari',
    why: 'Markets, the Tanzanite Museum, and Honest’s local storytelling on a four-hour walk—spice tastings, art gallery stops, and the clock tower between Cairo and Cape Town.',
  },
  {
    label: 'Best farm visit',
    productCode: '141010P1',
    titleMatch: 'Microfinance family farm tour',
    fallbackTitle: 'Microfinance family farm tour - all proceeds to charity',
    bestFor: 'Travelers who want real community contact',
    why: 'Visit Mama Max’s farm through a microfinance nonprofit—chai, milk the cow, collect eggs, and hear how local women climb out of poverty. All proceeds to charity.',
  },
  {
    label: 'Best gem and craft day',
    productCode: '114963P4',
    titleMatch: 'Tanzanite Shopping Experience',
    fallbackTitle: 'Tanzanite Shopping Experience in Arusha',
    bestFor: 'Shoppers who want context, not hard sells',
    why: 'Tanzanite found only in northern Tanzania—learn grading at The Tanzanite Experience, browse Shanga artisan workshops, and the Cultural Heritage Centre with a private guide.',
  },
];

export const arushaHubPicks = {
  destinationId: 'arusha',
  useStaticDisplay: true,
  catalogTourCount: 2320,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Arusha',
  heroDescription:
    "Arusha sits at the gateway to Tanzania's northern safari circuit—Ngorongoro, Tarangire, Serengeti, and Kilimanjaro all within reach. With hundreds of day trips, multi-day safaris, and cultural experiences competing for your attention, we've narrowed it to 15 standouts for couples, families, adventurers, solo travelers, and culture seekers.",
  headline: 'Best Arusha tours by traveler type',
  subheadline: 'A short list to start with. All bookable Arusha tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Romance in northern Tanzania means private sandbanks, crater sunsets, and safari lodges built for two. These picks pair a Nyange sandbank day on crystal water, a three-day honeymoon safari with a Maasai ceremony, and a two-day luxury loop through Tarangire and Ngorongoro.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'Not every family day needs a full safari jeep. These picks balance a Napuru waterfall hike with swim time, a Mnemba dolphin-and-snorkel boat trip kids love, and a one-day Kilimanjaro taste on the Marangu Route—enough mountain without the week-long trek.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'Arusha is where serious safari days and active outdoor trips start. These picks cover a Tarangire elephant safari with picnic lunch, a Ngorongoro crater-floor game drive, and a Lake Duluti canoe-and-cycle loop ending at a waterfall swim.',
      picks: adventurePicks,
    },
    {
      id: 'solo',
      title: 'For solo travelers',
      description:
        'Solo does not mean alone on the road. These picks include a join-in Machame Route Kilimanjaro group trek, a five-day safari through Tanzania’s headline parks, and a private Ngorongoro crater day when you want your own vehicle and pace.',
      picks: soloPicks,
    },
    {
      id: 'culture',
      title: 'For culture & community',
      description:
        'Between safari legs, Arusha has a real city pulse—markets, gemstones, and farms that tell Tanzania’s story. These picks pair a guided walking tour through local markets and the Tanzanite Museum, a charity farm visit with Mama Max, and a gem-and-craft day at Shanga and Cultural Heritage.',
      picks: culturePicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best budget tour',
      text: 'Arusha Guided Walking City Tour — markets, Tanzanite Museum, and local culture from about $19.',
      productCode: '5596000P1',
      titleMatch: 'Arusha Guided Walking City Tour',
    },
    {
      label: 'Best day safari',
      text: 'Ngorongoro Adventures in a day — dense wildlife on the crater floor in one outing.',
      productCode: '142902P29',
      titleMatch: 'Ngorongoro Adventures in a day',
    },
    {
      label: 'Best Kilimanjaro intro',
      text: 'Marangu Route day hike to Mandara Hut — a taste of the mountain without the full trek.',
      productCode: '305732P11',
      titleMatch: 'Mount Kilimanjaro Day Hike Through Marangu',
    },
  ],
};
