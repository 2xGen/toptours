/** Editorial hub picks for Zanzibar — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best sunset dinner sail',
    productCode: '384585P4',
    titleMatch: 'Exclusive Private Sunset Dinner Sail along North Coast',
    fallbackTitle: 'Exclusive Private Sunset Dinner Sail along North Coast Zanzibar',
    bestFor: 'Couples who want seafood BBQ on the water at golden hour',
    why: 'A traditional dhow from Kendwa with a fresh seafood barbecue anchored offshore—sunset views along Nungwi and Kendwa without a crowded party boat.',
  },
  {
    label: 'Best Stone Town sunset',
    productCode: '438526P3',
    titleMatch: 'Catamaran Sunset Cruise in Stone Town',
    fallbackTitle: 'Catamaran Sunset Cruise in Stone Town (Private)',
    bestFor: 'Romantic evenings near Stone Town',
    why: 'A 65-foot catamaran with open deck lounging, complimentary drinks, and optional swim stops—golden hour off Stone Town with room to spread out.',
  },
  {
    label: 'Best north-coast dhow',
    productCode: '384585P5',
    titleMatch: 'Exclusive Private Sunset Dhow Sailing Tour in North Zanzibar',
    fallbackTitle: 'Exclusive Private Sunset Dhow Sailing Tour in North Zanzibar',
    bestFor: 'Couples staying in Nungwi or Kendwa',
    why: 'Late-afternoon sail past fishing villages with snacks and cold drinks on deck—smooth return after dark with the coast lit up below.',
  },
];

const familiesPicks = [
  {
    label: 'Best full-day island sampler',
    productCode: '461598P6',
    titleMatch: 'Private Full Day Tour to Spice Farm Stone Town and Prison Island',
    fallbackTitle: 'Private Full Day Tour to Spice Farm Stone Town and Prison Island',
    bestFor: 'Families who want spice, history, and tortoises in one day',
    why: 'Spice farm aromas, UNESCO Stone Town alleys, and giant tortoises on Prison Island—three Zanzibar icons in a single private itinerary from your hotel.',
  },
  {
    label: 'Best dolphin snorkel half day',
    productCode: '461598P11',
    titleMatch: 'Private Half Day Dolphins and Snorkeling in Mnemba',
    fallbackTitle: 'Private Half Day Dolphins and Snorkeling in Mnemba',
    bestFor: 'Kids who love marine wildlife',
    why: 'Mnemba Atoll reef, spinner dolphins in Menai Bay, and a sandbank stop—half a day on turquoise water that works for mixed ages without a long drive.',
  },
  {
    label: 'Best nature and beach combo',
    productCode: '5570447P3',
    titleMatch: 'Jozani Forest Kuza Cave Paje Beach and the Rock Restaurant',
    fallbackTitle: 'Jozani Forest Kuza Cave Paje Beach and the Rock Restaurant',
    bestFor: 'Families who want forest, swim, and a famous lunch spot',
    why: 'Red colobus monkeys in Jozani, a swim in Kuza Cave’s cool pool, Paje beach time, and a photo stop at The Rock—variety without booking four separate trips.',
  },
];

const adventurePicks = [
  {
    label: 'Best Mnemba day sail',
    productCode: '384585P1',
    titleMatch: 'Exclusive private full-day Dhow sail & snorkel Mnemba sandbank',
    fallbackTitle: 'Exclusive private full-day Dhow sail & snorkel Mnemba sandbank',
    bestFor: 'Active travelers who want a full day on the water',
    why: 'Traditional dhow from Kendwa to Mnemba—snorkel stops, lunch cooked on board, sandbank lounging, and dolphin sightings when conditions allow.',
  },
  {
    label: 'Best off-the-beaten-path sail',
    productCode: '384585P2',
    titleMatch: 'Half-Day Dhow Sailing Tour to Tumbatu Island',
    fallbackTitle: 'Half-Day Dhow Sailing Tour to Tumbatu Island with snorkeling',
    bestFor: 'Snorkelers who want fewer crowds',
    why: 'Tumbatu’s quieter reef and twin snorkel stops from Kendwa—family-run, sustainability-focused, and less packed than Mnemba day boats.',
  },
  {
    label: 'Best south-coast active day',
    productCode: '370672P2',
    titleMatch: 'Luxury Tour to SALAAM CAVE and THE ROCK RESTAURANT',
    fallbackTitle: 'Luxury Tour to SALAAM CAVE and THE ROCK RESTAURANT',
    bestFor: 'Adventurers who want dolphins, cave swim, and icon photos',
    why: 'Dolphin swimming and snorkeling in the morning, then Kuza Cave’s turquoise pool and The Rock Restaurant on the reef—high-energy south-coast loop.',
  },
];

const culturePicks = [
  {
    label: 'Best cultural immersion',
    productCode: '257758P2',
    titleMatch: 'Flora Zanzibar - A Culinary & Authentic Cultural Experience',
    fallbackTitle: 'Flora Zanzibar - A Culinary & Authentic Cultural Experience.',
    bestFor: 'Travelers who want real village life, not just sights',
    why: 'Unguja Ukuu village—cook Swahili lunch with a local family, walk daily life scenes, and hear stories you will not get on a standard Stone Town loop.',
  },
  {
    label: 'Best Stone Town walk',
    productCode: '373325P1',
    titleMatch: 'Stone Town Hidden Gems: Historical Walking Tour',
    fallbackTitle: 'Stone Town Hidden Gems: Historical Walking Tour with Local Guide',
    bestFor: 'First afternoon in Zanzibar, history lovers',
    why: 'UNESCO alleys, carved doors, markets, and layered Arab–Indian–African history with a local guide—dense culture in two hours and one of the island’s highest-rated walks.',
  },
  {
    label: 'Best spice and cooking day',
    productCode: '252195P2',
    titleMatch: 'Zanzibar Private Tour & Cooking Class',
    fallbackTitle: 'Zanzibar Private Tour & Cooking Class',
    bestFor: 'Food-focused travelers',
    why: 'Stone Town landmarks, a spice farm with tastings, then a hands-on Swahili cooking class in a local home—taste and technique in one private day.',
  },
];

const safariPicks = [
  {
    label: 'Best fly-in safari',
    productCode: '252690P1',
    titleMatch: '3 Days Ngorongoro & Serengeti Fly in Safari',
    fallbackTitle: '3 Days Ngorongoro & Serengeti Fly in Safari',
    bestFor: 'Beach holidayers adding a Serengeti chapter',
    why: 'Fly from Zanzibar into Tanzania’s headline parks—Serengeti plains and Ngorongoro Crater without losing a week to overland drives.',
  },
  {
    label: 'Best one-day safari',
    productCode: '252690P7',
    titleMatch: '1-Day Fly in Shared Safari to Mikumi National Park',
    fallbackTitle: '1-Day Fly in Shared Safari to Mikumi National Park from Zanzibar',
    bestFor: 'Limited time but want a real game drive',
    why: 'Morning flight to Mikumi, full-day game drive with picnic lunch, and return to Zanzibar by evening—lions, elephants, and zebras in one long but doable day.',
  },
  {
    label: 'Best private Mikumi day',
    productCode: '164528P5',
    titleMatch: 'Day Trip From Zanzibar To Mikumi',
    fallbackTitle: 'Day Trip From Zanzibar To Mikumi',
    bestFor: 'Wildlife lovers who prefer a private safari pace',
    why: 'Private Mikumi day from the beach—big-five potential, 300+ bird species, and a full national-park day without committing to a multi-night mainland trip.',
  },
];

export const zanzibarHubPicks = {
  destinationId: 'zanzibar',
  useStaticDisplay: true,
  catalogTourCount: 1493,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Zanzibar',
  heroDescription:
    "Zanzibar pairs turquoise water and Stone Town heritage with spice farms, sandbanks, and fly-in safaris to the mainland. With hundreds of tours competing for your attention, we've narrowed it to 15 standouts for couples, families, adventurers, culture seekers, and safari add-ons.",
  headline: 'Best Zanzibar tours by traveler type',
  subheadline:
    'A short list to start with. All bookable Zanzibar tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Romance on Zanzibar means dhow sails at golden hour. These picks pair a north-coast sunset dinner sail with seafood BBQ, a Stone Town catamaran cruise with drinks on deck, and a private Kendwa dhow run as the coast lights up after dark.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These picks balance island icons without overloading young travelers: a spice-farm, Stone Town, and Prison Island full day, a Mnemba dolphin-and-snorkel half day, and a Jozani–Kuza Cave–Paje loop with The Rock photo stop.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'Zanzibar’s reef and south coast reward active days. These picks cover a full-day Mnemba dhow sail with snorkel and sandbank time, a quieter Tumbatu Island half-day sail, and a dolphin–cave–Rock restaurant run on the southeast coast.',
      picks: adventurePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'Beyond the beach, Zanzibar is spice, Swahili kitchens, and UNESCO Stone Town. These picks pair a village culinary experience in Unguja Ukuu, the island’s top-rated hidden-gems walking tour, and a spice-farm day that ends in a hands-on cooking class.',
      picks: culturePicks,
    },
    {
      id: 'safari',
      title: 'For safari add-ons',
      description:
        'Many travelers pair Zanzibar with mainland wildlife. These picks cover a three-day Serengeti and Ngorongoro fly-in, a shared one-day Mikumi flight from the beach, and a private Mikumi day trip when you want your own vehicle and pace.',
      picks: safariPicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best budget culture tour',
      text: 'Stone Town Hidden Gems walking tour — UNESCO alleys, markets, and layered history from about $13.',
      productCode: '373325P1',
      titleMatch: 'Stone Town Hidden Gems',
    },
    {
      label: 'Best sandbank day',
      text: 'Private full day spice farm, Stone Town, and Prison Island — tortoises, spices, and old-town alleys in one outing.',
      productCode: '461598P6',
      titleMatch: 'Private Full Day Tour to Spice Farm Stone Town and Prison Island',
    },
    {
      label: 'Best safari from the beach',
      text: '1-Day fly-in shared safari to Mikumi — morning flight, game drive, back to Zanzibar by evening.',
      productCode: '252690P7',
      titleMatch: '1-Day Fly in Shared Safari to Mikumi',
    },
  ],
};
