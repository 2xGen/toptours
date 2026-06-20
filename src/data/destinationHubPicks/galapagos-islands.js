/** Editorial hub picks for Galápagos Islands — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best Tortuga Bay snorkel tour',
    productCode: '181466P9',
    titleMatch: 'Beach Wildlife and Snorkel Adventure with Underwater Specialist',
    fallbackTitle: 'Beach Wildlife and Snorkel Adventure with Underwater Specialist',
    bestFor: 'Couples who want a private, expert-led snorkel day',
    why: 'From wild Playa Brava to calm Tortuga Bay with an underwater specialist—sea turtles, rays, and marine iguanas in crystal water, ideal prep for later boat snorkels.',
  },
  {
    label: 'Best Bartolomé yacht day tour',
    productCode: '262714P7',
    titleMatch: 'Bartolome Island on Board of Sea Lion Yacht',
    fallbackTitle: 'Bartolome Island on Board of Sea Lion Yacht (Tue / Fri)',
    bestFor: 'Pairs chasing Pinnacle Rock panoramas',
    why: 'Aboard the Sea Lion yacht to Bartolomé’s wooden walkway and summit viewpoint—one of the archipelago’s most iconic photo spots, with certified naturalist guides.',
  },
  {
    label: 'Best highlands eco-dome stay',
    productCode: '389221P3',
    titleMatch: 'Stay at an Eco Dome Lodge & Explore Giant Tortoises, Lava Tunnels',
    fallbackTitle: 'Stay at an Eco Dome Lodge & Explore Giant Tortoises, Lava Tunnels',
    bestFor: 'Romantic overnights away from Puerto Ayora crowds',
    why: 'Private reserve on Santa Cruz where tortoises roam freely—guided lava tunnels, endemic forest walks, and an overnight in a dome lodge from about $65.',
  },
];

const familiesPicks = [
  {
    label: 'Best giant tortoise reserve tour',
    productCode: '104124P1',
    titleMatch: 'The Galapagos Giant Tortoise Experience + Los Gemelos | Private',
    fallbackTitle: 'The Galapagos Giant Tortoise Experience + Los Gemelos | Private',
    bestFor: 'Families who want close tortoise encounters in half a day',
    why: 'Los Gemelos sinkholes, a private tortoise reserve with guaranteed wildlife contact, and a lava-tube walk—compact, kid-friendly, and led by a certified naturalist guide.',
  },
  {
    label: 'Best Sierra Negra family hike',
    productCode: '19569P11',
    titleMatch: 'Hiking Day Trip to Sierra Negra Volcano Galapagos',
    fallbackTitle: 'Hiking Day Trip to Sierra Negra Volcano Galapagos',
    bestFor: 'Active families on Isabela Island',
    why: 'Hike the rim of one of the world’s largest volcanic calderas with hawks, finches, and surreal lava fields—a full-day adventure from Puerto Villamil from about $65.',
  },
  {
    label: 'Best North Seymour wildlife day',
    productCode: '19569P15',
    titleMatch: 'North Seymour Day Trip Galapagos',
    fallbackTitle: 'North Seymour Day Trip Galapagos',
    bestFor: 'Bird-loving families who want boobies and sea lions',
    why: 'Blue-footed boobies, frigatebirds, and sea lion colonies on an uninhabited island—hiking, beach time at Bachas, box lunch, and hotel pickup included.',
  },
];

const adventurePicks = [
  {
    label: 'Best Sierra Negra volcano trek',
    productCode: '418793P1',
    titleMatch: 'Galapagos Hiking excursion to Sierra Negra Volcano & Lava Fields',
    fallbackTitle: 'Galapagos Hiking excursion to Sierra Negra Volcano & Lava Fields',
    bestFor: 'Hikers who want the full caldera circuit',
    why: 'Sixteen kilometres around the world’s third-largest active caldera with a bilingual volcanology guide, box lunch, and dietary options—hotel pickup on Isabela included.',
  },
  {
    label: 'Best Floreana off-path day tour',
    productCode: '181466P11',
    titleMatch: 'Day Tour to Floreana Island with Highland Tour and Snorkeling',
    fallbackTitle: 'Day Tour to Floreana Island with Highland Tour and Snorkeling',
    bestFor: 'Adventurers drawn to pirate caves and hidden history',
    why: 'Speedboat to Floreana’s highlands, Pirates’ Cave, Asilo de la Paz, quality snorkel gear, and a traditional Ecuadorian lunch—far from the standard Santa Cruz circuit.',
  },
  {
    label: 'Best Pinzón Island snorkel day',
    productCode: '220666P69',
    titleMatch: 'Full Day Pinzon Island, Finishing in la Fe with Snorkeling and Lunch included',
    fallbackTitle: 'Full Day Pinzon Island, Finishing in la Fe with Snorkeling and Lunch included',
    bestFor: 'Snorkelers who want dolphins, turtles, and rays',
    why: 'Full day to Pinzón with giant tortoises on land and rich marine life underwater—eagles rays, marine iguanas, and lunch included on this less-visited island run.',
  },
];

const culturePicks = [
  {
    label: 'Best Puerto Ayora food walk',
    productCode: '68892P1',
    titleMatch: 'Private Gastronomy Walking Tour',
    fallbackTitle: 'Private Gastronomy Walking Tour',
    bestFor: 'Food lovers who want chef-level local tasting',
    why: 'Private stroll through Puerto Ayora’s best restaurants with dishes, drinks, and chef meet-and-greets—menus customized for allergies and a deep dive into island culinary culture.',
  },
  {
    label: 'Best volcano fumaroles tour',
    productCode: '418793P4',
    titleMatch: 'Half-Day Private Tour in Sierra Negra Volcano\'s Sulfur fumaroles',
    fallbackTitle: 'Half-Day Private Tour in Sierra Negra Volcano\'s Sulfur fumaroles',
    bestFor: 'Travelers fascinated by living geology',
    why: 'Private access to Sierra Negra’s sulfur mines and steaming fumaroles with masks provided—lunch in nature and insights into volcanic gases you cannot get on a standard caldera hike.',
  },
  {
    label: 'Best North Seymour snorkel lunch tour',
    productCode: '120233P55',
    titleMatch: 'Galapagos - North Seymour Island Wildlife Snorkeling Tour + Lunch',
    fallbackTitle: 'Galapagos - North Seymour Island Wildlife Snorkeling Tour + Lunch',
    bestFor: 'A full day blending wildlife walks and reef time',
    why: 'Black-rock trails, booby and frigatebird colonies, snorkel off North Seymour, and lunch included—round-trip from Puerto Ayora with gear and a local naturalist guide.',
  },
];

const islandDayTripsPicks = [
  {
    label: 'Best North Seymour yacht day',
    productCode: '181466P14',
    titleMatch: 'North Seymour and Bachas or Mosquera Beach Yacht Day Tour',
    fallbackTitle: 'North Seymour and Bachas or Mosquera Beach Yacht Day Tour',
    bestFor: 'Comfortable sailing with top snorkel gear',
    why: 'Wildlife-rich North Seymour plus Bachas or Mosquera on a well-equipped yacht—Cressi and Scubapro snorkel kit, meals on board, and a certified naturalist throughout.',
  },
  {
    label: 'Best Santa Fe yacht day',
    productCode: '262714P5',
    titleMatch: 'Santa Fé island on board of Sea Lion Yacht',
    fallbackTitle: 'Santa Fé island on board of Sea Lion Yacht',
    bestFor: 'Snorkelers who want a sheltered turquoise cove',
    why: 'Sea Lion yacht to Santa Fe’s anchorage—one of the archipelago’s oldest uplifted islands, land iguanas, sea lions, and snorkeling in a protected lagoon.',
  },
  {
    label: 'Best 7-day island-hopping expedition',
    productCode: '92349P14',
    titleMatch: '7-day Galapagos Island Hopping Adventure Expedition',
    fallbackTitle: '7-day Galapagos Island Hopping Adventure Expedition',
    bestFor: 'Land-based travelers who want Santa Cruz and Isabela depth',
    why: 'Seven days of tortoise reserves, Pinzón snorkels, Sierra Negra hikes, and Los Túneles—speedboats, local hotels, and naturalist guides without sleeping on a cruise ship.',
  },
];

export const galapagosIslandsHubPicks = {
  destinationId: 'galapagos-islands',
  useStaticDisplay: true,
  catalogTourCount: 192,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in the Galápagos Islands',
  heroDescription:
    "The Galápagos is giant tortoises, marine iguanas, Tortuga Bay snorkels, and yacht days to Bartolomé and North Seymour. With 192+ tours on Viator and airport transfers cluttering the default sort, we've narrowed it to 15 standouts for couples, families, adventurers, culture seekers, and island day trips.",
  headline: 'Best Galápagos tours by traveler type',
  subheadline:
    'A short list to start with. All bookable Galápagos tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Romance in the Galápagos often means pristine beaches and iconic viewpoints. These picks pair a private Tortuga Bay snorkel with an underwater specialist, a Bartolomé yacht day to Pinnacle Rock, and an eco-dome overnight among free-roaming tortoises.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These picks balance wildlife close-ups and manageable activity: a private tortoise reserve and lava tubes, a Sierra Negra volcano hike on Isabela, and a North Seymour day with boobies and sea lions.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'The archipelago rewards active explorers. These picks cover a full Sierra Negra caldera trek, a Floreana Island speedboat day with caves and snorkel, and a Pinzón full-day with dolphins and reef life.',
      picks: adventurePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'Beyond wildlife, the islands have local flavor and living geology. These picks pair a private Puerto Ayora gastronomy walk, Sierra Negra sulfur fumaroles, and a North Seymour wildlife-and-snorkel day with lunch.',
      picks: culturePicks,
    },
    {
      id: 'island-day-trips',
      title: 'For yacht days & island hopping',
      description:
        'Most visitors mix land stays with boat days. These picks cover a North Seymour yacht tour with Bachas or Mosquera, a Santa Fe Sea Lion yacht run, and a seven-day land-based island-hopping expedition through Santa Cruz and Isabela.',
      picks: islandDayTripsPicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best budget highlands stay',
      text: 'Eco dome lodge with tortoises and lava tunnels — overnight from about $65.',
      productCode: '389221P3',
      titleMatch: 'Stay at an Eco Dome Lodge & Explore Giant Tortoises',
    },
    {
      label: 'Best value volcano hike',
      text: 'Sierra Negra day hike on Isabela — caldera rim trail from about $65.',
      productCode: '19569P11',
      titleMatch: 'Hiking Day Trip to Sierra Negra Volcano',
    },
    {
      label: 'Best land-based week',
      text: '7-day island-hopping expedition — Santa Cruz, Isabela, snorkel, and volcanoes from about $2,130.',
      productCode: '92349P14',
      titleMatch: '7-day Galapagos Island Hopping Adventure',
    },
  ],
};
