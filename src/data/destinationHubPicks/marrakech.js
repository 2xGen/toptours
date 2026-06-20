/** Editorial hub picks for Marrakech — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best private Agafay sunset',
    productCode: '182237P1',
    titleMatch: 'Agafay Desert Sunset Tour',
    fallbackTitle: 'Agafay Desert Sunset Tour',
    bestFor: 'Couples who want desert silence, not a party bus',
    why: 'Private 4×4 into a quieter Agafay stretch—nomadic tea in a tent, golden-hour views, and far fewer crowds than the standard sunset dinner convoys from Marrakech.',
  },
  {
    label: 'Best desert dinner evening',
    productCode: '5591264P4',
    titleMatch: 'Agafay Desert Dinner Show Camels & Quad From Marrakech Pick up',
    fallbackTitle: 'Agafay Desert Dinner Show Camels & Quad From Marrakech Pick up',
    bestFor: 'Romantic evenings with a full show under the stars',
    why: 'Private pickup, sunset camel ride, traditional Moroccan dinner, live music, and a fire show—a complete Agafay night without joining a massive group tour.',
  },
  {
    label: 'Best Atlas valleys day',
    productCode: '25014P17',
    titleMatch: 'Private Atlas Mountains and 5 Valleys Tour from Marrakech',
    fallbackTitle: 'Private Atlas Mountains and 5 Valleys Tour from Marrakech - All inclusive',
    bestFor: 'Couples who want mountains and Berber villages in one day',
    why: 'All-inclusive private run through five High Atlas valleys—panoramic village stops, mountain scenery, and a pace you control instead of a packed minibus.',
  },
];

const familiesPicks = [
  {
    label: 'Best Ourika waterfall day',
    productCode: '5579503P5',
    titleMatch: 'Marrakech: Ourika Tour, Waterfalls, Atlas & Lunch',
    fallbackTitle: 'Marrakech: Ourika Tour, Waterfalls, Atlas & Lunch',
    bestFor: 'Families who want nature without a long desert drive',
    why: 'Setti Fatma waterfalls hike with a certified local guide, Berber villages, argan cooperative stop, and optional riverside lunch—Atlas scenery just an hour from the medina.',
  },
  {
    label: 'Best camel and Berber lunch',
    productCode: '5559393P1',
    titleMatch: 'Atlas Mountains Tour from Marrakech: Camel Ride & Berber Lunch',
    fallbackTitle: 'Atlas Mountains Tour from Marrakech: Camel Ride & Berber Lunch',
    bestFor: 'Kids who want a camel ride and a real village meal',
    why: 'Small groups (max 15) with a local Imazighen guide—scenic camel ride, mint tea with snacks, and an authentic Berber lunch included, nothing hidden in the price.',
  },
  {
    label: 'Best family cooking class',
    productCode: '373568P1',
    titleMatch: 'Cooking class with Yassine and family',
    fallbackTitle: 'Cooking class with Yassine and family',
    bestFor: 'Families who want a calm break from the souks',
    why: 'Market run for ingredients in a residential neighborhood, Moroccan tea at home, then a hands-on cooking session in a warm family kitchen—far from the tourist zone chaos.',
  },
];

const adventurePicks = [
  {
    label: 'Best quad half day',
    productCode: '445955P1',
    titleMatch: '2 Hours Quad Excursion in the Heart of the Atlas Mountains',
    fallbackTitle: '2 Hours Quad Excursion in the Heart of the Atlas Mountains',
    bestFor: 'Adrenaline seekers with limited time',
    why: 'Two hours from Lalla Takerkoust Lake into Agafay terrain on quad bikes, plus Berber tea under a tent—adventure and culture in one short burst.',
  },
  {
    label: 'Best full-day desert quad',
    productCode: '6591P10',
    titleMatch: 'Agafay Desert Full Day Tour in Quad bike with lunch',
    fallbackTitle: 'Agafay Desert Full Day Tour in Quad bike with lunch',
    bestFor: 'Riders who want a full Agafay immersion',
    why: 'Small groups on maintained Yamaha Grizzly 350cc quads, professional guide, and lunch in the desert—almost-private feel without driving to Merzouga.',
  },
  {
    label: 'Best Toubkal trek',
    productCode: '425498P1',
    titleMatch: '2-Day Toubkal Trailblazer: From Souks to Summit',
    fallbackTitle: '2-Day Toubkal Trailblazer: From Souks to Summit',
    bestFor: 'Fit hikers aiming for North Africa’s highest peak',
    why: 'Two days through the Mizane Valley and Aremd village to Jebel Toubkal summit—serious mountain trekking with Berber culture along the trail.',
  },
];

const culturePicks = [
  {
    label: 'Best street food walk',
    productCode: '72575P1',
    titleMatch: 'Local Hidden Spots Street Food Tour in Medina Marrakech',
    fallbackTitle: 'Local Hidden Spots Street Food Tour in Medina Marrakech',
    bestFor: 'Food lovers who want what locals actually eat',
    why: 'Harira, maqla with kefta, skewers, and Moroccan pastries at spots tourists rarely find—a break from the tagine-only restaurant loop in the medina.',
  },
  {
    label: 'Best rug workshop',
    productCode: '432324P1',
    titleMatch: 'Myrugy-Small Group Rug Making Workshop in Marrakech with Licensed',
    fallbackTitle: 'Myrugy-Small Group Rug Making Workshop in Marrakech with Licensed',
    bestFor: 'Hands-on travelers who want a souvenir they made',
    why: 'Learn rug-making from local artisans, visit a traditional weavers’ showroom, and leave with your own piece—Moroccan craft culture with mint tea in a small group.',
  },
  {
    label: 'Best souks deep dive',
    productCode: '451280P1',
    titleMatch: 'Guided Excursion in the Souks of Marrakech',
    fallbackTitle: 'Guided Excursion in the Souks of Marrakech',
    bestFor: 'First medina visit without getting lost',
    why: '40,000 artisans across the souks—spices, hand-knotted carpets, copper and wood workshops—with a guide who navigates the maze and explains what you are seeing.',
  },
];

const desertAtlasPicks = [
  {
    label: 'Best Sahara multi-day',
    productCode: '350573P7',
    titleMatch: '3 Day Marrakech to Merzouga Desert Tour',
    fallbackTitle: '3 Day Marrakech to Merzouga Desert Tour',
    bestFor: 'Travelers who want real dunes, not rocky Agafay',
    why: 'High Atlas, Aït Ben Haddou, Todra Gorge, sunset camel trek on Erg Chebbi, and a Berber camp night under the stars—the classic Sahara loop from Marrakech.',
  },
  {
    label: 'Best three-valley day',
    productCode: '408609P1',
    titleMatch: 'Private Tour in Atlas Mountain and 3 Valleys with Camel Ride',
    fallbackTitle: 'Private Tour in Atlas Mountain and 3 Valleys with Camel Ride',
    bestFor: 'One-day Atlas immersion with a camel ride',
    why: 'Private run through Imlil, Sidi Fares, and Ourika on roads most companies skip—real Berber lifestyle, mountain scenery, and a camel ride bundled in one day.',
  },
  {
    label: 'Best four-valley day trip',
    productCode: '461336P1',
    titleMatch: 'Day Trip from Marrakech Explore the Atlas Mountains and 4 Valleys',
    fallbackTitle: 'Day Trip from Marrakech Explore the Atlas Mountains and 4 Valleys',
    bestFor: 'Scenery lovers who want maximum valley variety',
    why: 'Ourika, Oukaimden, Sidi Fares, and Asni Tahnaout in one guided day—waterfalls, terraced fields, snow-capped peaks, and Berber village life beyond the city.',
  },
];

export const marrakechHubPicks = {
  destinationId: 'marrakech',
  useStaticDisplay: true,
  catalogTourCount: 7435,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Marrakech',
  heroDescription:
    "Marrakech is the red city at the edge of the Atlas and the gateway to the Sahara. With thousands of tours competing for your attention—and airport transfers clogging the default list—we've narrowed it to 15 standouts for couples, families, adventurers, culture seekers, and desert day trips.",
  headline: 'Best Marrakech tours by traveler type',
  subheadline:
    'A short list to start with. All bookable Marrakech tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Romance in Marrakech often means desert sunsets and mountain valleys. These picks pair a private Agafay sunset away from the crowds, a camel-and-dinner show night under the stars, and an all-inclusive private run through five Atlas valleys.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These picks balance headline sights with kid-friendly pacing: an Ourika waterfall day with a local guide, a small-group Atlas camel ride with Berber lunch included, and a cooking class in a calm neighborhood far from the medina chaos.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'Beyond the souks, Marrakech launches quad rides and summit treks. These picks cover a two-hour lake-to-Agafay quad run, a full-day desert quad with lunch, and a two-day Jebel Toubkal trail to North Africa’s highest peak.',
      picks: adventurePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'The medina rewards travelers who eat and make things by hand. These picks pair a hidden street-food walk, a small-group rug-making workshop with mint tea, and a guided souks tour through spices, carpets, and copper workshops.',
      picks: culturePicks,
    },
    {
      id: 'desert-atlas',
      title: 'For desert & Atlas trips',
      description:
        'Most travelers want either real Sahara sand or Atlas mountain villages. These picks cover a three-day Merzouga loop with camel trek and camp night, a private three-valley day with camel ride, and a four-valley Atlas circuit from the city.',
      picks: desertAtlasPicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best budget Atlas day',
      text: 'Ourika waterfalls tour — Setti Fatma hike, Berber villages, and optional riverside lunch from about $16.',
      productCode: '5579503P5',
      titleMatch: 'Ourika Tour, Waterfalls, Atlas',
    },
    {
      label: 'Best medina food experience',
      text: 'Hidden street food tour — harira, skewers, and local spots away from tourist-only tagine menus.',
      productCode: '72575P1',
      titleMatch: 'Local Hidden Spots Street Food',
    },
    {
      label: 'Best Sahara from Marrakech',
      text: '3-day Merzouga tour — Aït Ben Haddou, Todra Gorge, Erg Chebbi camel trek, and a Berber camp night.',
      productCode: '350573P7',
      titleMatch: '3 Day Marrakech to Merzouga',
    },
  ],
};
