/** Editorial hub picks for Aruba — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best sunset sail',
    productCode: '245508',
    titleMatch: 'Aruba Sunset Sail with Open Bar',
    fallbackTitle: 'Aruba Sunset Sail with Open Bar',
    bestFor: 'Couples who want a relaxed evening on the water',
    why: 'Sail along Aruba’s scenic coastline at golden hour with an open bar and snacks aboard a luxurious catamaran—romantic without the private-yacht price tag.',
  },
  {
    label: 'Most romantic sunset',
    productCode: '5493518P2',
    titleMatch: 'Aruba Romantic Sunset Photoshoot',
    fallbackTitle: 'Aruba Romantic Sunset Photoshoot & Beach Picnic in Luxury Cabana',
    bestFor: 'Couples who want a keepsake and a slow evening',
    why: 'Golden-hour photos on the beach, then a private cabana picnic—styled, relaxed, and genuinely romantic without a big group tour vibe.',
  },
  {
    label: 'Best sunset ride',
    productCode: '13835P19',
    titleMatch: 'Private Sunset Horseback Ride',
    fallbackTitle: 'Private Sunset Horseback Ride',
    bestFor: 'Active couples, photographers',
    why: 'Ride along the coast as the sun drops—private booking means your pace, your photos, and no waiting on strangers.',
  },
];

const familiesPicks = [
  {
    label: 'Best for mixed ages',
    productCode: '324189P3',
    titleMatch: 'Baby Beach and San Nicolas Art Murals',
    fallbackTitle: 'Baby Beach and San Nicolas Art Murals Private EZ Raider Adventure',
    bestFor: 'Kids 8+, parents who want variety in one outing',
    why: 'Calm Baby Beach swimming plus colorful San Nicolas murals—easy-rider vehicles keep the pace fun without full ATV intensity.',
  },
  {
    label: 'Best budget beach day',
    productCode: '6593P17',
    titleMatch: 'Open Air Beach Bus Tour of Aruba',
    fallbackTitle: 'Open Air Beach Bus Tour of Aruba',
    bestFor: 'Families who want a simple island loop',
    why: 'Open-air bus, multiple beach stops, and no rental car logistics—straightforward sightseeing that works for grandparents and kids alike.',
  },
  {
    label: 'Best family snorkel sail',
    productCode: '37387P1',
    titleMatch: 'Set Sail in Aruba: Jolly Pirate',
    fallbackTitle: 'Set Sail in Aruba: Jolly Pirate Cruise with Snorkel Adventure',
    bestFor: 'Families who want snorkeling, lunch, and fun on the water',
    why: 'An 85-foot teak schooner with three snorkel stops, BBQ lunch, open bar for adults, and a rope swing—one of Aruba’s most requested family-friendly sails.',
  },
];

const adventurePicks = [
  {
    label: 'Best UTV tour',
    productCode: '459169P1',
    titleMatch: 'Aruba Small-Group UTV Adventure',
    fallbackTitle: 'Aruba Small-Group UTV Adventure|Private Off-Road Tour Max 4 UTVs',
    bestFor: 'Thrill-seekers, small groups',
    why: 'Off-road trails with a cap of four UTVs—enough adrenaline without feeling like a packed convoy through Arikok and the north coast.',
  },
  {
    label: 'Best electric off-road',
    productCode: '392509P1',
    titleMatch: 'Epic Off-Road Surron Electric Bike Tour',
    fallbackTitle: 'Epic Off-Road Surron Electric Bike Tour in Aruba',
    bestFor: 'Adventurers who want something different',
    why: 'Surron e-bikes handle Aruba’s dusty tracks with less noise than ATVs—guided, scenic, and genuinely fun if you have ridden before.',
  },
  {
    label: 'Best turtle snorkel',
    productCode: '5621222P1',
    titleMatch: 'FIN-TASTIC Turtle Spotting',
    fallbackTitle: 'Private Snorkeling Aruba: FIN-TASTIC Turtle Spotting',
    bestFor: 'Snorkelers who want wildlife, not just reefs',
    why: 'Private snorkel charter focused on turtle habitats—small group, patient guide, and time in the water where sightings actually happen.',
  },
];

const cruisePicks = [
  {
    label: 'Best full island day',
    productCode: '5566924P9',
    titleMatch: 'Aruba 6 Hours Private Island Tour',
    fallbackTitle: 'Aruba 6 Hours Private Island Tour',
    bestFor: 'Cruise passengers with a full day ashore',
    why: 'Six-hour private loop hits the island’s headline stops on your schedule—built for port days when you want maximum ground covered.',
  },
  {
    label: 'Best customizable jeep day',
    productCode: '459169P2',
    titleMatch: 'Private Aruba Jeep Adventure',
    fallbackTitle: 'Private Aruba Jeep Adventure|Custom Island Tour with Local Guide',
    bestFor: 'Groups who want to shape their shore excursion',
    why: 'Local guide, private jeep, and a route you can tweak—skip what you have seen before and double down on beaches or Arikok.',
  },
  {
    label: 'Best half-day sail',
    productCode: '444239P2',
    titleMatch: 'Blue Parrot Snorkel Sail',
    fallbackTitle: 'Blue Parrot Snorkel Sail with 4 course lunch or dinner in Aruba',
    bestFor: 'Cruise visitors with 4–5 hours ashore',
    why: 'Snorkel stop, sailing time, and a four-course meal on board—easy to pair with a morning or afternoon in port.',
  },
];

const culturePicks = [
  {
    label: 'Best distillery visit',
    productCode: '5595462P1',
    titleMatch: 'Discovery Papiamento Distillery',
    fallbackTitle: 'Discovery Papiamento Distillery',
    bestFor: 'Rain plans, rum lovers, culture on a budget',
    why: 'Aruba’s own Papiamento rum distillery—guided tasting, island heritage, and a solid indoor option when the beach forecast turns.',
  },
  {
    label: 'Best cooking class',
    productCode: '364486P1',
    titleMatch: 'Caribbean Cooking Class in Aruba',
    fallbackTitle: 'Caribbean Cooking Class in Aruba',
    bestFor: 'Food lovers who want hands-on Caribbean culture',
    why: 'Chef Kari Heron guides a hands-on class in authentic Caribbean foodways—you cook, then share the meal, getting the intimate side of island culture.',
  },
  {
    label: 'Best dinner cruise',
    productCode: '6593P11',
    titleMatch: 'Luxury Four-Course Caribbean Dinner Cruise',
    fallbackTitle: 'Luxury Four-Course Caribbean Dinner Cruise Experience',
    bestFor: 'Food and drink lovers, evening plans',
    why: 'A four-course dinner prepared by a private chef on crystal-clear Caribbean waters—Prosecco welcome, premium open bar, and live music for a memorable evening.',
  },
];

export const arubaHubPicks = {
  destinationId: 'aruba',
  useStaticDisplay: true,
  catalogTourCount: 466,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Aruba',
  heroDescription:
    "With catamaran sails, snorkeling trips, UTV adventures, and sunset cruises competing for your attention, choosing the right Aruba tour can be overwhelming. We've narrowed the options down to 15 experiences that stand out for quality, popularity, and overall traveler satisfaction.",
  headline: 'Best Aruba tours by traveler type',
  subheadline: 'A short list to start with. All 466+ bookable tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Our picks here lean sunset-focused: a catamaran sail with open bar along the coast, a beach cabana photoshoot picnic at golden hour, and a coastal horseback ride reserved for your party as the sun goes down.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These three balance kid-friendly stops with island variety: an EZ Raider route pairing Baby Beach with San Nicolas murals, an open-air beach bus loop that skips rental-car stress, and a classic snorkel sail with BBQ lunch, open bar, and a rope swing kids love.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'Aruba’s north shore and Arikok interior are built for off-road and water action. These picks cover a small-group UTV route (max four vehicles), guided Surron electric bike trails, and a private snorkel charter aimed at sea turtle sightings.',
      picks: adventurePicks,
    },
    {
      id: 'cruise',
      title: 'For cruise visitors',
      description:
        'If you are on a cruise, time ashore is the constraint. These operators routinely work around port schedules: a six-hour private island overview, a customizable jeep day with a local guide, and a half-day snorkel sail with lunch or dinner on board.',
      picks: cruisePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'Beyond the beach, Aruba has a real local spirit—Papiamento rum, Caribbean foodways, and evenings on the water. These picks pair a distillery discovery tour, a hands-on cooking class with a local chef, and a four-course dinner cruise for a deeper cultural and culinary plan.',
      picks: culturePicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best budget tour',
      text: 'Open Air Beach Bus Tour — an affordable loop to multiple beaches without renting a car.',
      productCode: '6593P17',
      titleMatch: 'Open Air Beach Bus Tour of Aruba',
    },
    {
      label: 'Best rain-day pick',
      text: 'Discovery Papiamento Distillery — indoor tastings and island heritage when skies turn gray.',
      productCode: '5595462P1',
      titleMatch: 'Discovery Papiamento Distillery',
    },
    {
      label: 'Best easy snorkeling',
      text: 'FIN-TASTIC Turtle Spotting — private snorkel charter focused on turtle habitats.',
      productCode: '5621222P1',
      titleMatch: 'FIN-TASTIC Turtle Spotting',
    },
  ],
};
