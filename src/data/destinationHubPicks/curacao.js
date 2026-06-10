/** Editorial hub picks for Curaçao — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best private sailing',
    productCode: '168364P1',
    titleMatch: 'Exclusive Private Sailing Tour in Beautiful Curacao',
    fallbackTitle: 'Exclusive Private Sailing Tour in Beautiful Curacao',
    bestFor: 'Anniversaries, honeymoons, sunset proposals',
    why: 'Owners host every charter on a 48-ft yacht reserved only for your group—no shared passengers. Sails go up when the wind allows, with time at anchor on turquoise water.',
  },
  {
    label: 'Most romantic sunset',
    productCode: '5628847P3',
    titleMatch: 'Private cruise sunset & tasting local products',
    fallbackTitle: 'Private cruise sunset & tasting local products',
    bestFor: 'Intimate evenings, photographers',
    why: 'A restored classic sailboat, max six guests, and a sunset tasting of local products on Spanish Water Lagoon—far from crowded party boats.',
  },
  {
    label: 'Best photo memory',
    productCode: '400174P10',
    titleMatch: 'Dushi Boat Drone Photoshoot',
    fallbackTitle: 'Dushi Boat Drone Photoshoot | Free Champagne | Fruits and Flowers',
    bestFor: 'Couples who want a unique keepsake',
    why: 'Drone shots from a charming fishing boat, plus champagne and a tropical fruit tray—relaxed, not overly staged.',
  },
];

const familiesPicks = [
  {
    label: 'Best for kids (6+)',
    productCode: '214628P4',
    titleMatch: 'Wake & Knee Board, Water Ski',
    fallbackTitle: 'Wake & Knee Board, Water Ski',
    bestFor: 'Active kids, first-time water sports',
    why: 'The all-in-one ZUP board is easy for first-timers. Small groups and ages 6+ make it a safe intro to water sports.',
  },
  {
    label: 'Best beach day',
    productCode: '439923P2',
    titleMatch: 'The Ultimate Beach Tour Private Experiences Curacao',
    fallbackTitle: 'The Ultimate Beach Tour Private Experiences Curacao',
    bestFor: 'Parents who need flexibility',
    why: 'Your guide tailors beaches to your family—snorkel stops, calm bays, or full relax mode. Private vehicle means nap and snack breaks on your schedule.',
  },
  {
    label: 'Best easy snorkeling',
    productCode: '333322P15',
    titleMatch: 'Curacao Reef Sublue Scooters Experience',
    fallbackTitle: 'Curacao Reef Sublue Scooters Experience',
    bestFor: 'Kids and parents who want reef time without a long swim',
    why: 'Underwater scooters do the work—glide over vibrant reefs with less effort. Guided, beginner-friendly, and genuinely fun for mixed ages.',
  },
];

const adventurePicks = [
  {
    label: 'Best UTV tour',
    productCode: '113255P12',
    titleMatch: 'Curaçao Tours UTV Epic west coast adventure',
    fallbackTitle: 'Curaçao Tours UTV Epic west coast adventure',
    bestFor: 'Thrill-seekers who still want photos',
    why: 'Four hours through caves, cliffside trails, and a beach cool-down—with chances to spot flamingos along the way.',
  },
  {
    label: 'Best ATV expedition',
    productCode: '5618546P2',
    titleMatch: 'West Curacao Off-Road ATV Expedition',
    fallbackTitle: 'West Curacao Off-Road ATV Expedition: Cave-Flamingo-Turtles',
    bestFor: 'Off-road fans, nature lovers',
    why: 'Small local team, automatic ATVs, and a west-coast route through caves, windmills, flamingo sanctuary, and turtle beaches.',
  },
  {
    label: 'Best for certified divers',
    productCode: '47137P2',
    titleMatch: '2 Tank Guided Dive half-day',
    fallbackTitle: '2 Tank Guided Dive half-day',
    bestFor: 'Certified divers short on time',
    why: 'Two different dive sites in one morning—house reef, wall drops, or the famous Tugboat wreck—with small groups.',
  },
];

const cruisePicks = [
  {
    label: 'Best half-day overview',
    productCode: '5608624P6',
    titleMatch: 'Taste of Curaçao: City Tour, Chobolobo & Mambo Beach',
    fallbackTitle: 'Taste of Curaçao: City Tour, Chobolobo & Mambo Beach',
    bestFor: 'Cruise passengers with 4–5 hours ashore',
    why: 'City drive, Blue Curaçao tasting, and beach time at Mambo—designed for short-stay and cruise schedules with transport included.',
  },
  {
    label: 'Best Willemstad walk',
    productCode: '110433P24',
    titleMatch: 'Curacao Walking Tour - Best way to get to know Willemstad',
    fallbackTitle: 'Curacao Walking Tour - Best way to get to know Willemstad!',
    bestFor: 'Cruise visitors who want culture on foot',
    why: 'Covers the floating bridge, forts, and key landmarks in ~2 hours—easy to pair with another shore excursion the same day.',
  },
  {
    label: 'Best private city tour',
    productCode: '348602P2',
    titleMatch: 'Exclusive 3-Hour Private Tour: Explore Willemstad',
    fallbackTitle: 'Exclusive 3-Hour Private Tour: Explore Willemstad & surroundings',
    bestFor: 'Groups wanting a tailored port day',
    why: 'No waiting on strangers or wasted stops—your guide shapes the route around what your group actually wants to see.',
  },
];

const culturePicks = [
  {
    label: 'Best food tour',
    productCode: '5616169P1',
    titleMatch: 'Curacao Authentic Food Tour',
    fallbackTitle: 'Curacao Authentic Food Tour',
    bestFor: 'Food lovers, culture seekers',
    why: 'Four tasting stops through Otrobanda, Punda, and a fisherman’s village—storytelling and local flavors, not hotel buffet food.',
  },
  {
    label: 'Best morning culture bundle',
    productCode: '189147P19',
    titleMatch: 'Six traditions-One morning in Curaçao',
    fallbackTitle: 'Six traditions-One morning in Curaçao',
    bestFor: 'First-time visitors who love hands-on experiences',
    why: 'Liquor, aloe, sculptures, and espadrilles in one walkable morning—you leave with stories and a pair of classic shoes.',
  },
  {
    label: 'Best distillery + city',
    productCode: '332330P3',
    titleMatch: 'Blue Curacao Factory and City Tour',
    fallbackTitle: 'Blue Curacao Factory and City Tour',
    bestFor: 'Rain plans and culture on a budget',
    why: 'Legendary liqueur factory visit plus colorful city highlights—lively atmosphere and strong value in one outing.',
  },
];

export const curacaoHubPicks = {
  destinationId: 'curacao',
  useStaticDisplay: true,
  catalogTourCount: 348,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Curaçao',
  heroDescription:
    "Curaçao combines colorful Caribbean culture with some of the region's best beaches, snorkeling, and boating experiences. If you're not sure where to start, these 15 carefully selected tours are a great introduction to everything the island has to offer.",
  headline: 'Best Curaçao tours by traveler type',
  subheadline: 'A short list to start with. All 347+ bookable tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Our picks here lean intimate and sunset-led: an owner-hosted private sail on a 48-ft yacht with time at anchor on turquoise water, a six-guest classic boat with local product tastings as the sun drops over Spanish Water Lagoon, and a drone photoshoot from a fishing boat with champagne waiting when you climb back aboard.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These three balance active water time with real island variety: beginner-friendly ZUP boarding on Spanish Waters (ages 6+), a private beach-hopping day where your guide picks calm bays and snorkel stops around your family’s pace, and reef time on underwater scooters—so kids and parents cover more coral without a long swim.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'Curaçao’s wild west coast is where caves, flamingo sanctuaries, and cliff views stack into one ride. These picks cover a four-hour UTV loop through Banda Bou, an automatic ATV expedition that hits turtle beaches and windmill country, and a two-tank dive morning that can include the famous Tugboat wreck and wall drop-offs.',
      picks: adventurePicks,
    },
    {
      id: 'cruise',
      title: 'For cruise visitors',
      description:
        'If you are on a cruise, time ashore is the constraint. These operators routinely work around port schedules: a half-day that pairs Willemstad streets with Chobolobo Blue Curaçao tastings and Mambo Beach, a walking loop across the floating bridge and Dutch forts in about two hours, and a private three-hour city tour you shape around what your group actually wants to see.',
      picks: cruisePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'Beyond the resort strip, Curaçao has a Creole-Dutch soul—Blue Curaçao liqueur, aloe tradition, and UNESCO-painted streets in Willemstad. These picks pair a four-tasting food walk through Otrobanda and a fisherman’s village, a single morning where you taste liqueur, visit an aloe farm, and leave with handmade espadrilles, and a distillery-plus-city combo built for rain days and tighter budgets.',
      picks: culturePicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best budget tour',
      text: 'Willemstad Private Walking Tour — from about $45 for a guided city walk.',
      productCode: '439923P6',
      titleMatch: 'Willemstad Private Walking Tour Journey',
    },
    {
      label: 'Best rain-day pick',
      text: 'Blue Curaçao Factory and City Tour — distillery visit plus sheltered city sights.',
      productCode: '332330P3',
      titleMatch: 'Blue Curacao Factory and City Tour',
    },
    {
      label: 'Best easy snorkeling',
      text: 'Curacao Reef Sublue Scooters — glide over reefs with less effort than a long swim.',
      productCode: '333322P15',
      titleMatch: 'Curacao Reef Sublue Scooters Experience',
    },
  ],
};
