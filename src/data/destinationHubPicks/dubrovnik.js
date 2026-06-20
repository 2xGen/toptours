/** Editorial hub picks for Dubrovnik — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best sunset catamaran',
    productCode: '179010P5',
    titleMatch: 'Sunset Catamaran Tour from Old Town Dubrovnik',
    fallbackTitle: 'Sunset Catamaran Tour from Old Town Dubrovnik',
    bestFor: 'Couples who want golden hour without a private yacht budget',
    why: 'Sail past the city walls and Lokrum with sparkling wine on plush cushions—as the Adriatic turns red and gold with Dubrovnik’s skyline framed from the water.',
  },
  {
    label: 'Best private sunset cruise',
    productCode: '32373P8',
    titleMatch: 'Dubrovnik Sunset Private Boat Experience',
    fallbackTitle: 'Dubrovnik Sunset Private Boat Experience',
    bestFor: 'Romantic evenings with your own skipper',
    why: 'Private speedboat sunset along the walls and Lokrum—photo stops, flexible itinerary, and the Pearl of the Adriatic lit up from the sea on your schedule.',
  },
  {
    label: 'Best one-hour wall cruise',
    productCode: '118286P9',
    titleMatch: 'Private One-Hour Dubrovnik Highlights Cruise with Local Skipper',
    fallbackTitle: 'Private One-Hour Dubrovnik Highlights Cruise with Local Skipper',
    bestFor: 'Short trips that still want the sea perspective',
    why: 'Fort Lovrijenac, coastal caves, and Game of Thrones filming spots from the water—one hour with a local skipper and stories you cannot get from the Stradun alone.',
  },
];

const familiesPicks = [
  {
    label: 'Best cave and beach day',
    productCode: '392016P3',
    titleMatch: 'Blue & Green Cave Experience: Drinks, Snorkeling & Šunj Beach',
    fallbackTitle: 'Blue & Green Cave Experience: Drinks, Snorkeling & Šunj Beach',
    bestFor: 'Families who want islands without chartering a private boat',
    why: 'Morning departure to beat the crowds—Blue Cave, Green caves, snorkel in crystal water, and sandy Šunj beach on Lopud with drinks included for adults.',
  },
  {
    label: 'Best try-dive intro',
    productCode: '418845P1',
    titleMatch: 'Try Scuba Diving Discovery in Dubrovnik',
    fallbackTitle: 'Try Scuba Diving Discovery in Dubrovnik',
    bestFor: 'Teens and adults trying scuba for the first time',
    why: 'Confined-water instruction in the clear Adriatic, then a guided first dive with groupers and octopuses—no certification needed, pace adjusted to each guest.',
  },
  {
    label: 'Best Old Town intro walk',
    productCode: '480784P1',
    titleMatch: 'Walking Tour of Dubrovnik Old Town- Morning or Afternoon',
    fallbackTitle: 'Walking Tour of Dubrovnik Old Town- Morning or Afternoon',
    bestFor: 'First morning in Dubrovnik with kids in tow',
    why: 'Born-and-raised local guides through Pile Gate, Stradun, and Orlando’s Column in cooler hours—everything you need before the cruise-ship crowds arrive.',
  },
];

const adventurePicks = [
  {
    label: 'Best private speedboat day',
    productCode: '480967P1',
    titleMatch: 'Private Speedboat Tour: Caves Beaches Islands and more',
    fallbackTitle: 'Private Speedboat Tour: Caves Beaches Islands and more',
    bestFor: 'Active groups who want their own Adriatic itinerary',
    why: 'Private Elaphiti speedboat with a local skipper—blue caves, sandy beaches, and hidden bays tailored to your pace, starting under $200 for the group.',
  },
  {
    label: 'Best bike and wine ride',
    productCode: '341581P2',
    titleMatch: 'Rural Biking & Wine Tasting Tour in Dubrovnik',
    fallbackTitle: 'Rural Biking & Wine Tasting Tour in Dubrovnik',
    bestFor: 'Cyclists who want countryside beyond the walls',
    why: 'Konavle Valley ride—mostly downhill, low-traffic paths through olive groves and villages, finished with an authentic wine tasting away from Old Town crowds.',
  },
  {
    label: 'Best Game of Thrones walk',
    productCode: '72995P5',
    titleMatch: "Dubrovnik & King's Landing",
    fallbackTitle: "Dubrovnik & King's Landing",
    bestFor: 'Fans who want history and filming locations together',
    why: 'Real Dubrovnik history woven with King’s Landing filming sites—landmarks and GOT locations in one walking tour for history buffs and series fans alike.',
  },
];

const culturePicks = [
  {
    label: 'Best city walls walk',
    productCode: '213777P2',
    titleMatch: 'Walls Of Dubrovnik: Small-Group Walking Tour With A Local',
    fallbackTitle: 'Walls Of Dubrovnik: Small-Group Walking Tour With A Local',
    bestFor: 'Travelers who will not leave without walking the walls',
    why: 'Max eight guests with local history buffs—fact-based stories, personal guide style, and the iconic Adriatic views from Dubrovnik’s medieval ramparts.',
  },
  {
    label: 'Best Pelješac food and wine',
    productCode: '49470P3',
    titleMatch: 'Peljesac&Ston Small-Group Food & Wine Experience from Dubrovnik',
    fallbackTitle: 'Peljesac&Ston Small-Group Food & Wine Experience from Dubrovnik',
    bestFor: 'Food and wine lovers with a full day free',
    why: 'Seven-plus wine tastings, oyster farm stop in Mali Ston, salt pans in Ston, and a konoba lunch—Pelješac peninsula in an eight-person max small group.',
  },
  {
    label: 'Best olive farm visit',
    productCode: '213079P1',
    titleMatch: 'Olive farm & village',
    fallbackTitle: 'Olive farm & village',
    bestFor: 'Travelers curious about rural Dubrovnik life',
    why: 'A family farm rooted since the 16th century—open-air nature, generations of cultivation, and Konavle countryside a short hop from the tourist zone.',
  },
];

const adriaticPicks = [
  {
    label: 'Best private cave speedboat',
    productCode: '118286P4',
    titleMatch: 'Explore Blue & Green Caves With Speedboat - Private Tour',
    fallbackTitle: 'Explore Blue & Green Caves With Speedboat - Private Tour',
    bestFor: 'Groups who want seven caves without the tour-bus feel',
    why: 'Local skippers who know Dubrovnik’s sea caves like the back of their hand—a private loop through blue and green grottoes with time to swim inside.',
  },
  {
    label: 'Best Pelješac wine day',
    productCode: '347742P3',
    titleMatch: 'Private Peljesac Wine Tasting Tour from Dubrovnik',
    fallbackTitle: 'Private Peljesac Wine Tasting Tour from Dubrovnik',
    bestFor: 'Couples or friends who want a private wine route',
    why: 'Scenic drive to Croatia’s top wine peninsula—Ston oysters, top wineries, seafood lunch, and photo stops on a fully private day from Dubrovnik.',
  },
  {
    label: 'Best beaches speedboat half day',
    productCode: '69289P4',
    titleMatch: 'Half-Day Best Beaches & Bays Private Speed Boat Tour',
    fallbackTitle: 'Half-Day Best Beaches & Bays Private Speed Boat Tour',
    bestFor: 'Swimmers who want four top Elaphiti beaches',
    why: 'Four Elaphiti beaches in four hours—snorkel and swim stops in turquoise bays with a private speedboat and half-hour at each stretch of sand.',
  },
];

export const dubrovnikHubPicks = {
  destinationId: 'dubrovnik',
  useStaticDisplay: true,
  catalogTourCount: 1458,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Dubrovnik',
  heroDescription:
    "Dubrovnik is medieval walls, Elaphiti islands, blue caves, and Pelješac wine country. With nearly 1,500 tours competing for your attention—and private transfers clogging the default list—we've narrowed it to 15 standouts for couples, families, adventurers, culture seekers, and Adriatic boat days.",
  headline: 'Best Dubrovnik tours by traveler type',
  subheadline:
    'A short list to start with. All bookable Dubrovnik tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Romance in Dubrovnik often means sunset from the water. These picks pair a catamaran sail with sparkling wine, a private speedboat sunset along the walls, and a one-hour highlights cruise with Fort Lovrijenac and coastal caves.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These picks balance island fun and Old Town basics: a group Blue and Green Cave run with Šunj beach, a try-dive intro in the Adriatic, and a morning or afternoon Old Town walk with guides born in Dubrovnik.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'Beyond the Stradun, Dubrovnik launches speedboats and valley bikes. These picks cover a private Elaphiti speedboat under $200, a Konavle countryside ride with wine tasting, and a King\'s Landing walk for GOT fans.',
      picks: adventurePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'The walls are only the start. These picks pair a small-group ramparts walk, a Pelješac food-and-wine day with oysters and Ston salt pans, and a family olive farm visit in the Konavle countryside.',
      picks: culturePicks,
    },
    {
      id: 'adriatic',
      title: 'For Adriatic boat & wine days',
      description:
        'Most visitors leave the Old Town for the sea. These picks cover a private seven-cave speedboat loop, a private Pelješac wine and oyster day, and a half-day hop to four Elaphiti beaches by private boat.',
      picks: adriaticPicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best budget island tour',
      text: 'Blue & Green Cave experience — caves, snorkel, and Šunj beach from about $64 in a small group.',
      productCode: '392016P3',
      titleMatch: 'Blue & Green Cave Experience',
    },
    {
      label: 'Best city walls tour',
      text: 'Small-group walls walk — local guides, max eight guests, and Adriatic views from the ramparts.',
      productCode: '213777P2',
      titleMatch: 'Walls Of Dubrovnik: Small-Group Walking',
    },
    {
      label: 'Best sunset on the water',
      text: 'Sunset catamaran from Old Town — city walls, Lokrum, and sparkling wine as the sky turns gold.',
      productCode: '179010P5',
      titleMatch: 'Sunset Catamaran Tour from Old Town',
    },
  ],
};
