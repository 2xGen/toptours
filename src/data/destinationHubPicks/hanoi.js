/** Editorial hub picks for Hanoi — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best after-dark vespa food tour',
    productCode: '102744P3',
    titleMatch: 'Hanoi Vespa Tours: Hanoi After Dark Vespa Food Tours',
    fallbackTitle: 'Hanoi Vespa Tours: Hanoi After Dark Vespa Food Tours',
    bestFor: 'Couples who want nightlife, food, and wind in their hair',
    why: 'Ride pillion through Hanoi’s lit-up streets, sample hidden street food, and hear the stories behind each dish—sights, smells, and flavors of the city after dark on vintage vespas.',
  },
  {
    label: 'Best women-led motorbike tour',
    productCode: '73282P7',
    titleMatch: 'Hanoi Motorbike Tour Led By Women: Hanoi City Half Day',
    fallbackTitle: 'Hanoi Motorbike Tour Led By Women: Hanoi City Half Day',
    bestFor: 'Travelers who want a local perspective on the capital',
    why: 'Female riders guide you through Banana Island, Long Bien Bridge, Train Street, and Cho Gioi market—landmarks and hidden alleys capped with egg coffee or mango pudding.',
  },
  {
    label: 'Best secret coffee walk',
    productCode: '11021P10',
    titleMatch: 'Hanoi Secret Coffee tour',
    fallbackTitle: 'Hanoi Secret Coffee tour',
    bestFor: 'Coffee lovers who want hidden cafés, not chains',
    why: 'Four off-the-beaten-path cafés including the legendary egg-coffee spot—French colonial roots to salt coffee and coconut coffee, one cup at a time with a local guide.',
  },
];

const familiesPicks = [
  {
    label: 'Best hands-on cooking class',
    productCode: '91605P6',
    titleMatch: 'Hanoi Cooking Class Learning 5 Dishes including Banh Xeo',
    fallbackTitle: 'Hanoi Cooking Class Learning 5 Dishes including Banh Xeo',
    bestFor: 'Families who want to eat what they cook',
    why: 'Market tour near the Old Quarter, then five authentic Hanoi dishes including banh xeo—vegetarian options, rice wine toast, cookbook, and certificate in half a day.',
  },
  {
    label: 'Best ceramic village day',
    productCode: '216020P3',
    titleMatch: 'VIETNAM BACKSTREET TOURS: Explore Bat Trang Ceramic Village By Minsk Motorcycle',
    fallbackTitle: 'VIETNAM BACKSTREET TOURS: Explore Bat Trang Ceramic Village By Minsk Motorcycle',
    bestFor: 'Kids who like making things with their hands',
    why: 'Vintage Minsk ride along the Red River dyke to Bat Trang—watch ceramic being made, design your own bowl or cup, then lunch in a local home before returning to Hanoi.',
  },
  {
    label: 'Best city and countryside combo',
    productCode: '216020P4',
    titleMatch: 'Hanoi Full-day combo: Half-day city and Half-day countryside',
    fallbackTitle: 'Hanoi Full-day combo: Half-day city and Half-day countryside',
    bestFor: 'Families who want both Old Quarter buzz and village calm',
    why: 'Morning Minsk tour through markets and Train Street, Ho Chi Minh Mausoleum, local lunch, then an army Jeep to vegetable gardens and the 1,000-year-old Bat Trang ceramic village.',
  },
];

const adventurePicks = [
  {
    label: 'Best Ha Giang loop',
    productCode: '5570597P1',
    titleMatch: '3 Days and 2 Nights Ha Giang Loop Tour',
    fallbackTitle: '3 Days and 2 Nights Ha Giang Loop Tour',
    bestFor: 'Riders who want Vietnam’s most dramatic mountain roads',
    why: 'Ma Pi Leng Pass, Quan Ba Twin Mountains, and Lung Cu Flag Tower—three days through H’mong, Tay, and Dao communities on the northern frontier loop.',
  },
  {
    label: 'Best Sapa homestay trek',
    productCode: '134742P1',
    titleMatch: '2 Day 1 Night Trek',
    fallbackTitle: '2 Day 1 Night Trek',
    bestFor: 'Hikers who want tribal villages off the tourist trail',
    why: 'Private English-speaking guide, homestay or local family stay, and routes that skip the crowded paths—two days in the highlands with fair wages back to local hosts.',
  },
  {
    label: 'Best vintage motorbike highlights',
    productCode: '87200P6',
    titleMatch: 'Hanoi Motorbike Tour: Hanoi HIGHTLIGHTS & HIDDEN GEMS',
    fallbackTitle: 'Hanoi Motorbike Tour: Hanoi HIGHTLIGHTS & HIDDEN GEMS',
    bestFor: 'First-timers who want the real Hanoi in half a day',
    why: 'Hanoi’s highest-rated motorbike experience—top sights plus backstreet cafés, family homes, temples, and markets where ordinary Hanoian life happens, not just the postcard stops.',
  },
];

const culturePicks = [
  {
    label: 'Best coffee workshop',
    productCode: '5609309P1',
    titleMatch: 'Six Cups of Vietnam Coffee Workshop in Hanoi with Local Barista',
    fallbackTitle: 'Six Cups of Vietnam Coffee Workshop in Hanoi with Local Barista',
    bestFor: 'Coffee enthusiasts on a budget',
    why: 'Brew six styles with a local barista—phin filter, egg coffee, salt coffee, coconut coffee—plus recipes and a takeaway gift in a small group of eight.',
  },
  {
    label: 'Best banh mi baking class',
    productCode: '5606651P1',
    titleMatch: 'Vietnamese Bread & Brew: Banh Mi Baking Class & Specialty Coffee',
    fallbackTitle: 'Vietnamese Bread & Brew: Banh Mi Baking Class & Specialty Coffee',
    bestFor: 'Food lovers who want street-food skills',
    why: 'Knead baguette dough, pickle vegetables, and brew egg coffee from scratch in a home kitchen—Hanoi’s iconic sandwich paired with its legendary coffee culture.',
  },
  {
    label: 'Best lotus tea workshop',
    productCode: '379197P2',
    titleMatch: 'Hanoi Tea Workshop: Specialty Fresh Lotus Tea from West Lake',
    fallbackTitle: 'Hanoi Tea Workshop: Specialty Fresh Lotus Tea from West Lake',
    bestFor: 'Travelers curious about living heritage crafts',
    why: 'West Lake lotus tea scenting by hand—not factory perfume but seasonal craftsmanship, patience, and the fragrance of a Hanoi summer in one cup.',
  },
];

const dayTripPicks = [
  {
    label: 'Best Ninh Binh day',
    productCode: '252399P16',
    titleMatch: 'Luxury Ninh Binh Full Day Tour From Hanoi (Trang An - Hoa Lu)',
    fallbackTitle: 'Luxury Ninh Binh Full Day Tour From Hanoi (Trang An - Hoa Lu)',
    bestFor: 'Travelers who want karst scenery without an overnight',
    why: 'Max eight guests—Hoa Lu ancient capital, Tam Coc boat ride, local family visit, and biking through rice fields and limestone peaks in Ninh Binh’s best-rated small-group day tour.',
  },
  {
    label: 'Best Ha Long Bay cruise',
    productCode: '5578294P4',
    titleMatch: 'Ha Long Bay Cruise: Caves, Kayaking & Swimming (Standard/Luxury)',
    fallbackTitle: 'Ha Long Bay Cruise: Caves, Kayaking & Swimming (Standard/Luxury)',
    bestFor: 'First-time visitors who need to see the bay',
    why: 'Titop Island swim or summit hike, Luon Cave by kayak, and Sung Sot Cave stalactites—emerald water and limestone karsts with lunch onboard and Old Quarter pickup options.',
  },
  {
    label: 'Best city plus bay overnight',
    productCode: '159025P24',
    titleMatch: 'Tour Package Hanoi City - Halong Bay 2 Days 1 Night',
    fallbackTitle: 'Tour Package Hanoi City - Halong Bay 2 Days 1 Night',
    bestFor: 'Short trips that want Hanoi highlights and Ha Long',
    why: 'Day one covers the capital’s cultural landmarks; day two swaps city bustle for bay sunshine, caves, and cruise time—a compact two-day Vietnam sampler from Hanoi.',
  },
];

export const hanoiHubPicks = {
  destinationId: 'hanoi',
  useStaticDisplay: true,
  catalogTourCount: 8963,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Hanoi',
  heroDescription:
    "Hanoi is street food alleys, egg coffee, motorbike backstreets, and launches to Ha Long Bay and Ninh Binh. With nearly 9,000 tours competing for your attention—and airport transfers clogging the default list—we've narrowed it to 15 standouts for couples, families, adventurers, culture seekers, and bay day trips.",
  headline: 'Best Hanoi tours by traveler type',
  subheadline:
    'A short list to start with. All bookable Hanoi tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Romance in Hanoi often means night rides and hidden cafés. These picks pair an after-dark vespa food tour, a women-led motorbike half day through Train Street and Long Bien Bridge, and a secret coffee walk through four off-map cafés.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These picks balance hands-on fun and city-plus-countryside variety: a five-dish cooking class with market tour, a Bat Trang ceramic village ride where kids make their own bowl, and a full-day Minsk-and-Jeep combo through markets and villages.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'Beyond the Old Quarter, Hanoi launches serious road trips. These picks cover a three-day Ha Giang loop, a two-day Sapa homestay trek with a private guide, and the city’s top-rated vintage motorbike highlights tour.',
      picks: adventurePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'Hanoi is Vietnam’s coffee and kitchen capital. These picks pair a six-cup barista workshop, a from-scratch banh mi and egg coffee class, and a West Lake lotus tea scenting session—craft, not just tasting.',
      picks: culturePicks,
    },
    {
      id: 'day-trips',
      title: 'For bay & Ninh Binh day trips',
      description:
        'Most travelers leave Hanoi for the karsts. These picks cover a luxury Ninh Binh day with Trang An boating and biking, a Ha Long Bay cruise with caves and kayaking, and a two-day Hanoi-plus-bay package when time is tight.',
      picks: dayTripPicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best overall Hanoi experience',
      text: 'Vintage motorbike highlights tour — top-rated ride through sights and backstreets locals actually use.',
      productCode: '87200P6',
      titleMatch: 'Hanoi Motorbike Tour: Hanoi HIGHTLIGHTS',
    },
    {
      label: 'Best budget coffee class',
      text: 'Six Cups coffee workshop — brew egg, salt, and coconut coffee with a local barista from about $14.',
      productCode: '5609309P1',
      titleMatch: 'Six Cups of Vietnam Coffee Workshop',
    },
    {
      label: 'Best Ha Long Bay day trip',
      text: 'Ha Long Bay cruise — Titop Island, Luon Cave kayak, Sung Sot Cave, and lunch onboard.',
      productCode: '5578294P4',
      titleMatch: 'Ha Long Bay Cruise: Caves, Kayaking',
    },
  ],
};
