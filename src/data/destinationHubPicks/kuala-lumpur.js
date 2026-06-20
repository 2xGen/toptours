/** Editorial hub picks for Kuala Lumpur — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best sip and paint night',
    productCode: '239761P1',
    titleMatch: 'Sip & Paint Night',
    fallbackTitle: 'Sip & Paint Night',
    bestFor: 'Couples who want a relaxed creative evening',
    why: 'KL’s original sip-and-paint studio—guided canvas session, wine, and conversation in a stress-free night out without needing any art skills.',
  },
  {
    label: 'Best Chinatown food and nightlife',
    productCode: '15250P5',
    titleMatch: 'KL Chinatown street food, sunset, nightcap& nightlife',
    fallbackTitle: 'KL Chinatown street food, sunset, nightcap& nightlife',
    bestFor: 'Food-loving couples after dark',
    why: 'Malaysian-infused cocktails in hidden bars, clay pot chicken rice and street food in Petaling Street alleys, plus murals and stories of how KL transforms at night.',
  },
  {
    label: 'Best firefly evening',
    productCode: '133205P14',
    titleMatch: 'Private Kuala Lumpur Fairy Firefly And Monkey Hill Tour',
    fallbackTitle: 'Private Kuala Lumpur Fairy Firefly And Monkey Hill Tour',
    bestFor: 'Romantic evenings beyond the city skyline',
    why: 'Melawati Hill monkeys and ocean views, seafood in a fisherman’s village, then a river boat among glowing fireflies—a private coastal night few visitors find on their own.',
  },
];

const familiesPicks = [
  {
    label: 'Best elephant sanctuary day',
    productCode: '203617P10',
    titleMatch: 'Full Day Elephant Sanctuary Tour with lunch Local food',
    fallbackTitle: 'Full Day Elephant Sanctuary Tour with lunch Local food',
    bestFor: 'Families who want ethical wildlife without riding',
    why: 'Private run to Kuala Gandah—observe wild elephants up close (no touching), local lunch included, and a friendly driver who knows the sanctuary’s conservation story.',
  },
  {
    label: 'Best theme park day',
    productCode: '20961P148',
    titleMatch: 'Full Day Trip from Kuala Lumpur to Sunway Lagoon Park',
    fallbackTitle: 'Full Day Trip from Kuala Lumpur to Sunway Lagoon Park',
    bestFor: 'Kids who want water slides and rides in one ticket',
    why: 'Round-trip transfers plus access to all six Sunway Lagoon parks—water park, amusement rides, wildlife park, and more—in Malaysia’s biggest city theme park complex.',
  },
  {
    label: 'Best Genting highlands escape',
    productCode: '63959P76',
    titleMatch: 'Genting Highland Day Tour',
    fallbackTitle: 'Genting Highland Day Tour',
    bestFor: 'Families who want cool air and cable car views',
    why: 'Awana Skyway cable car to 1,800 metres, theme park options, and mall entertainment—a mountain break from KL’s heat without an overnight trip.',
  },
];

const adventurePicks = [
  {
    label: 'Best rock climbing day',
    productCode: '110690P3',
    titleMatch: 'Climb and Abseiling Hidden Pinnacles of Takun',
    fallbackTitle: 'Climb and Abseiling Hidden Pinnacles of Takun',
    bestFor: 'Climbers who want jungle pinnacles near the city',
    why: 'Professional climber-led routes and abseiling in dense forest at Bukit Takun—nature and adrenaline half a day from downtown KL.',
  },
  {
    label: 'Best jungle ridge trek',
    productCode: '117717P3',
    titleMatch: 'Dragonback Trek',
    fallbackTitle: 'Dragonback Trek',
    bestFor: 'Hikers who want skyline and jungle in one view',
    why: 'Small groups (max six) on a signature ridge trek—virgin jungle on one side, KL city panorama on the other, with an early-morning start before the heat.',
  },
  {
    label: 'Best backcountry cycling',
    productCode: '117717P1',
    titleMatch: 'Backcountry Cycling',
    fallbackTitle: 'Backcountry Cycling',
    bestFor: 'Cyclists who want rural Malaysia on two wheels',
    why: '45 km guided ride through villages, forest reserve, and a picturesque lake—local breakfast, mountain bikes and helmets included, from 6:15 AM for cooler roads.',
  },
];

const culturePicks = [
  {
    label: 'Best market cooking class',
    productCode: '136080P1',
    titleMatch: 'Market Visit & Private Hands-on Cooking Class at Daun Senja',
    fallbackTitle: 'Market Visit & Private Hands-on Cooking Class at Daun Senja',
    bestFor: 'Food lovers who want to cook what locals buy',
    why: 'Wet market run first, then a private English-language class at your own station—home-style Malaysian dishes and lunch with what you cooked, max four guests.',
  },
  {
    label: 'Best batik workshop',
    productCode: '23424P5',
    titleMatch: 'Batik Bag Painting Workshop by myBatik',
    fallbackTitle: 'Batik Bag Painting Workshop by myBatik',
    bestFor: 'Hands-on travelers who want a usable souvenir',
    why: 'Paint and design your own batik cotton bag in 90 minutes—take it home the same day, no experience needed, in a small private workshop.',
  },
  {
    label: 'Best colonial history walk',
    productCode: '5579203P7',
    titleMatch: 'Kuala Lumpur Colonial History Walk - Private Guided Tour',
    fallbackTitle: 'Kuala Lumpur Colonial History Walk - Private Guided Tour',
    bestFor: 'History buffs who prefer walking to bus tours',
    why: 'Boutique heritage walk through colonial KL with a storytelling guide—research-backed anecdotes and local colour, not a cookie-cutter hop-on route.',
  },
];

const dayTripPicks = [
  {
    label: 'Best KL highlights day',
    productCode: '383435P1',
    titleMatch: "Kuala Lumpur's Famous Spots: Private Day Tour",
    fallbackTitle: "Kuala Lumpur's Famous Spots: Private Day Tour",
    bestFor: 'First-time visitors with one full day',
    why: 'Batu Caves, Thean Hou Temple, Petronas Towers photo stops, National Mosque, and Independence Square—a private buddy guide through KL’s headline sights in one go.',
  },
  {
    label: 'Best Cameron Highlands day',
    productCode: '166587P3',
    titleMatch: 'Cameron Highlands Day Trip',
    fallbackTitle: 'Cameron Highlands Day Trip',
    bestFor: 'Travelers who want tea country and cool mountain air',
    why: 'Malaysia’s premier hill station—tea plantations, strawberry farms, and terraced gardens at 1,800 metres—a full-day escape from KL’s tropical heat.',
  },
  {
    label: 'Best Malacca heritage day',
    productCode: '383435P3',
    titleMatch: "Malacca's Famous Spots: Private Day Tour",
    fallbackTitle: "Malacca's Famous Spots: Private Day Tour",
    bestFor: 'History lovers who want a UNESCO port city',
    why: 'Two-hour drive to Malacca’s Cheng Hoon Teng Temple, Jonker Street, Strait Mosque, trishaw ride, and river cruise—colonial and Peranakan heritage with a local buddy guide.',
  },
];

export const kualaLumpurHubPicks = {
  destinationId: 'kuala-lumpur',
  useStaticDisplay: true,
  catalogTourCount: 1963,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Kuala Lumpur',
  heroDescription:
    "Kuala Lumpur blends Petronas skyline views, Batu Caves, street food alleys, and highland escapes to Cameron and Malacca. With nearly 2,000 tours competing for your attention—and airport transfers clogging the default list—we've narrowed it to 15 standouts for couples, families, adventurers, culture seekers, and day trips.",
  headline: 'Best Kuala Lumpur tours by traveler type',
  subheadline:
    'A short list to start with. All bookable Kuala Lumpur tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Romance in KL often means nights out, not just towers and caves. These picks pair a sip-and-paint evening with wine, a Chinatown street-food and hidden-bar crawl, and a private firefly boat trip with seafood and Melawati Hill monkeys.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These picks balance wildlife, rides, and mountain air: a private elephant sanctuary day with local lunch, full access to Sunway Lagoon’s six parks, and a Genting Highlands cable car escape from the city heat.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'Beyond the malls, KL launches climbers and cyclists into the jungle. These picks cover Takun pinnacle climbing and abseiling, the Dragonback ridge trek with city views, and a 45 km backcountry bike ride through villages and forest.',
      picks: adventurePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'KL rewards travelers who cook, paint, and walk the old town. These picks pair a wet-market cooking class at Daun Senja, a batik bag workshop you take home, and a private colonial heritage walk with a storytelling guide.',
      picks: culturePicks,
    },
    {
      id: 'day-trips',
      title: 'For day trips & highlights',
      description:
        'Many travelers want Batu Caves plus one big outing. These picks cover a private KL famous-spots day, a Cameron Highlands tea-country run, and a Malacca UNESCO heritage loop with Jonker Street and a river cruise.',
      picks: dayTripPicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best hands-on food experience',
      text: 'Daun Senja cooking class — wet market visit, private stations, and lunch with what you cooked from about $110.',
      productCode: '136080P1',
      titleMatch: 'Market Visit & Private Hands-on Cooking Class',
    },
    {
      label: 'Best budget culture workshop',
      text: 'Batik bag painting at myBatik — design your own bag in 90 minutes and take it home the same day.',
      productCode: '23424P5',
      titleMatch: 'Batik Bag Painting Workshop',
    },
    {
      label: 'Best headline KL day tour',
      text: "Kuala Lumpur's Famous Spots — Batu Caves, Petronas Towers, Thean Hou Temple, and more with a private guide.",
      productCode: '383435P1',
      titleMatch: "Kuala Lumpur's Famous Spots",
    },
  ],
};
