/** Editorial hub picks for Prague — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best dinner cruise',
    productCode: '63851P6',
    titleMatch: 'Prague Boats 3-hours Crystal Dinner Cruise',
    fallbackTitle: 'Prague Boats 3-hours Crystal Dinner Cruise',
    bestFor: 'Couples who want Castle views at golden hour',
    why: 'Buffet dinner and prosecco under a glass roof as Prague Castle and Charles Bridge light up—live music, no fighting for a riverside table.',
  },
  {
    label: 'Most indulgent spa',
    productCode: '402036P7',
    titleMatch: 'Nectar of Cleopatra Wine Bath',
    fallbackTitle: 'Nectar of Cleopatra Wine Bath with Jacuzzi for Two in Prague',
    bestFor: 'Anniversaries, something truly different',
    why: 'A private wine bath for two with Prosecco, then Prague’s largest Himalayan salt cave—romance and indulgence in one evening on Letná.',
  },
  {
    label: 'Best photo memory',
    productCode: '286699P2',
    titleMatch: 'Photo Shoot for couple in Prague',
    fallbackTitle: 'Photo Shoot for couple in Prague',
    bestFor: 'Couples who want keepsake photos, not selfies',
    why: '70 edited photos across medieval streets and red rooftops with a local photographer—romantic, funny, or both, your call.',
  },
];

const familiesPicks = [
  {
    label: 'Best city e-bike ride',
    productCode: '73335P5',
    titleMatch: 'The Highlights of Prague on eBike',
    fallbackTitle: 'The Highlights of Prague on eBike or electric Scooter',
    bestFor: 'Families with kids 7+, first-time visitors',
    why: 'No driving license needed—e-bikes and scooters reach Castle Hill and the Vltava riverbank without a walking marathon. Max 10 per guide.',
  },
  {
    label: 'Best day trip',
    productCode: '5577125P10',
    titleMatch: 'Kutná Hora, Bone Church and Folk Village',
    fallbackTitle: 'Kutná Hora, Bone Church and Folk Village Small Group Day Tour',
    bestFor: 'Families who want history beyond Prague',
    why: 'Small-group day to a folk village museum, two cathedrals, and the Bone Church—hotel pickup, unhurried pace, late-afternoon ossuary when it’s quieter.',
  },
  {
    label: 'Best zoo day',
    productCode: '20364P20',
    titleMatch: 'Vltava River Boat Trip and Zoo Entrance',
    fallbackTitle: 'Vltava River Boat Trip and Zoo Entrance Ticket in Prague',
    bestFor: 'Kids who love animals and boat rides',
    why: 'A 1.5-hour river cruise to one of the world’s top-ranked zoos—gorilla pavilion, playgrounds, and Prague’s skyline from the water.',
  },
];

const adventurePicks = [
  {
    label: 'Best city canoe',
    productCode: '428424P1',
    titleMatch: 'Canoe Adventure Tour Through Prague',
    fallbackTitle: 'Canoe Adventure Tour Through Prague',
    bestFor: 'Active travelers who want a different angle',
    why: 'Paddle the Devil’s Channel and under Charles Bridge—two easy rapids, National Theatre views, and Prague from the river, not the sidewalk.',
  },
  {
    label: 'Best national park day',
    productCode: '72192P3',
    titleMatch: 'Bohemian & Saxon Switzerland From Prague',
    fallbackTitle: "Bohemian & Saxon Switzerland From Prague-Travelers' Choice 2026",
    bestFor: 'Hikers, photographers, Narnia fans',
    why: 'Two countries in one day—Pravčická Gate, Bastei Bridge, gondola through Kamenice gorge, lunch included. Max eight in a minivan with hotel pickup.',
  },
  {
    label: 'Best river escape',
    productCode: '40610P2',
    titleMatch: 'Easy Canoe Mission to the Sazava River',
    fallbackTitle: 'Easy Canoe Mission to the Sazava River from Prague Day Trip',
    bestFor: 'Adventurers who want forest and gorge outside the city',
    why: 'Canadian canoe through a dramatic Sázava gorge past communist-era cabins—lunch, beer, hotel pickup, and a full day away from tourist crowds.',
  },
];

const budgetPicks = [
  {
    label: 'Best under $10',
    productCode: '107194P161',
    titleMatch: 'Prague: Alchemy & Dark Arts Exploration Game',
    fallbackTitle: 'Prague: Alchemy & Dark Arts Exploration Game Tour',
    bestFor: 'Solo travelers, couples, curious minds',
    why: 'Self-guided phone game through Old Town—alchemists, Charles Bridge, and a bloody legend for the price of a coffee. Play anytime after booking.',
  },
  {
    label: 'Best self-guided food crawl',
    productCode: '404605P2',
    titleMatch: 'Anti Tour Prague - Self Guided Beer and Food',
    fallbackTitle: 'Anti Tour Prague - Self Guided Beer and Food Tour',
    bestFor: 'Travelers who hate overpriced group tours',
    why: 'Digital download, local neighborhood beyond the castle—traditional beer, craft pints, and a Czech meal for about $45pp total. One purchase covers your group.',
  },
  {
    label: 'Best audioguide walk',
    productCode: '366784P44',
    titleMatch: 'Charles Bridge & Old Town Prague Tour with Audioguide',
    fallbackTitle: 'Charles Bridge & Old Town Prague Tour with Audioguide',
    bestFor: 'Budget travelers who want structure without a guide',
    why: '27 narrated stops—Astronomical Clock, Jewish Quarter, Charles Bridge—offline map on your phone, one-year access, under $15.',
  },
];

const culturePicks = [
  {
    label: 'Best deep-dive food tour',
    productCode: '169084P1',
    titleMatch: 'Delicious Prague Food Tour by Prague Food Tour',
    fallbackTitle: 'Delicious Prague Food Tour by Prague Food Tour',
    bestFor: 'Serious food lovers, four hours to spare',
    why: 'George and Leona’s award-winning tour—10 tastings and six drinks with the stories behind each dish. One of Prague’s oldest independent food tours.',
  },
  {
    label: 'Best Czech classics',
    productCode: '7812P36',
    titleMatch: 'Prague Food Tour with 10 Tastings',
    fallbackTitle: 'Prague Food Tour with 10 Tastings of Authentic Czech Classics',
    bestFor: 'Hungry walkers who want variety on a budget',
    why: 'Pickled sausage, open-faced chlebíčky, Bohemian soup, craft beer, and gingerbread—ten stops in three hours, dietary needs accommodated.',
  },
  {
    label: 'Best street food intro',
    productCode: '423010P8',
    titleMatch: 'Prague Guided Street Food Walking Tour',
    fallbackTitle: 'Prague Guided Street Food Walking Tour',
    bestFor: 'First evening in Prague, casual eaters',
    why: 'Five local bistro tastings in Old Town—open sandwiches, potato bread, insider tips on where to eat for the rest of your trip.',
  },
];

export const pragueHubPicks = {
  destinationId: 'prague',
  useStaticDisplay: true,
  catalogTourCount: 520,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Prague',
  heroDescription:
    "Prague offers everything from medieval castles and river cruises to beer tastings and day trips into the Czech countryside. To help you skip the endless scrolling, we've selected 15 standout experiences that consistently deliver great value, memorable moments, and excellent traveler feedback.",
  headline: 'Best Prague tours by traveler type',
  subheadline: 'A short list to start with. All bookable Prague tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Prague was built for romance—cobblestones, castle views, and evenings on the Vltava. These picks pair a glass-roof dinner cruise past lit-up Charles Bridge, a private Cleopatra wine bath with salt cave, and a couples photoshoot through medieval streets and red rooftops.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These three balance kid-friendly energy with real sightseeing: an e-bike loop to Castle Hill (no license needed), a small-group Kutná Hora day with the Bone Church at quieter hours, and a river cruise straight to one of the world’s top-ranked zoos.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'Prague’s river and surrounding gorges reward anyone willing to paddle or hike. These picks cover a canoe through Devil’s Channel under Charles Bridge, a two-country Bohemian Switzerland day with Pravčická Gate and Bastei Bridge, and a full-day Sázava gorge canoe with lunch and beer.',
      picks: adventurePicks,
    },
    {
      id: 'budget',
      title: 'On a budget',
      description:
        'You don’t need a big tour budget to see Prague well. These picks start under $20: a self-guided alchemy game through Old Town, a downloadable beer-and-food crawl in a local neighborhood (about $45pp for food and drinks), and a year-long audioguide walk across 27 landmarks including Charles Bridge.',
      picks: budgetPicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'Beyond tourist-trap restaurants, Prague has a serious food culture—open-faced sandwiches, pickled sausage, and stories behind every pint. These picks pair a four-hour deep dive with two locals, a ten-tasting Czech classics walk, and a guided street-food intro through bistros locals actually use.',
      picks: culturePicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best budget tour',
      text: 'Charles Bridge & Old Town Audioguide — 27 narrated stops, offline map, under $15.',
      productCode: '366784P44',
      titleMatch: 'Charles Bridge & Old Town Prague Tour with Audioguide',
    },
    {
      label: 'Best rain-day pick',
      text: 'Nectar of Cleopatra Wine Bath — indoor spa, salt cave, and Prosecco for two.',
      productCode: '402036P7',
      titleMatch: 'Nectar of Cleopatra Wine Bath',
    },
    {
      label: 'Best day trip',
      text: 'Bohemian & Saxon Switzerland — sandstone arches, gorge boat ride, lunch included.',
      productCode: '72192P3',
      titleMatch: 'Bohemian & Saxon Switzerland From Prague',
    },
  ],
};
