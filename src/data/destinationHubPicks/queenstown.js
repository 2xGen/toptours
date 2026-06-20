/** Editorial hub picks for Queenstown — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best floating sauna experience',
    productCode: '5618758P1',
    titleMatch: 'Queenstown Floating Sauna & Cold Plunge on Lake Whakatipu',
    fallbackTitle: 'Queenstown Floating Sauna & Cold Plunge on Lake Whakatipu',
    bestFor: 'Couples who want to slow down after adventure days',
    why: 'Finnish saunas and Lake Wakatipu cold plunges on a floating deck with alpine views—contrast therapy minutes from town, popular as a post-hike or post-ski reset from about $38.',
  },
  {
    label: 'Best stargazing portrait tour',
    productCode: '113352P3',
    titleMatch: 'AuthenticAs Star Gazing -Nightscape Portrait Photography Tour',
    fallbackTitle: 'AuthenticAs Star Gazing -Nightscape Portrait Photography Tour',
    bestFor: 'Romantic nights under the Southern Sky',
    why: '4WD to dark-sky locations with EVscope views, constellation storytelling, and a professional portrait against the galactic core—images from the telescope and your shoot included.',
  },
  {
    label: 'Best private Glenorchy day trip',
    productCode: '5590256P1',
    titleMatch: 'Glenorchy Private Day Trip from Queenstown: TravelnGo',
    fallbackTitle: 'Glenorchy Private Day Trip from Queenstown: TravelnGo',
    bestFor: 'Pairs who want Lord of the Rings scenery at their pace',
    why: 'Six hours private to Moke Lake, Bennetts Bluff, and Glenorchy’s red shed—optional lagoon walks and café stops along one of the world’s great lake drives, fully tailored.',
  },
];

const familiesPicks = [
  {
    label: 'Best Skippers Canyon history tour',
    productCode: '5590728P1',
    titleMatch: 'Queenstown: Skippers Canyon Goldrush Small Group Tour',
    fallbackTitle: 'Queenstown: Skippers Canyon Goldrush Small Group Tour',
    bestFor: 'Families who want gold-rush stories, not just views',
    why: 'Small-group 4WD into Skippers Canyon with cinematic gold-rush storytelling, photo stops, and a complimentary coffee or drink at a historic pub—max 11 guests from about $99.',
  },
  {
    label: 'Best Highlands motorsport taxi',
    productCode: '162745P4',
    titleMatch: 'Highlands Taxi - Highlands Motorsport and Tourism Park',
    fallbackTitle: 'Highlands Taxi - Highlands Motorsport and Tourism Park',
    bestFor: 'Kids and teens who want speed and karting fun',
    why: 'Transfer to Cromwell’s Highlands park—TripAdvisor’s top Cromwell activity with go-karts, experiences, and kiwi hospitality, ideal as a half-day family escape from Queenstown.',
  },
  {
    label: 'Best Glenorchy island kayak safari',
    productCode: '16846P4',
    titleMatch: 'Glenorchy Island Safari departing Queenstown',
    fallbackTitle: 'Glenorchy Island Safari departing Queenstown',
    bestFor: 'Active families who want a wildlife sanctuary paddle',
    why: 'Kayak to Pigeon Island—a reserve the public cannot reach by foot—with beaches, mountains, and wildlife away from the Wakatipu crowds, transfers from Queenstown included.',
  },
];

const adventurePicks = [
  {
    label: 'Best guided dirt bike ride',
    productCode: '18270P3',
    titleMatch: 'Queenstown: Guided Dirt Bike Ride – Private Off-Road Trails',
    fallbackTitle: 'Queenstown: Guided Dirt Bike Ride – Private Off-Road Trails',
    bestFor: 'Riders who want private 650-acre trails',
    why: 'Hill climbs, creek crossings, and canyon views on a private property five minutes from town—full MX gear, award-winning coaches, and photos included, minimum age 10.',
  },
  {
    label: 'Best canyoning day trip',
    productCode: '15518P2',
    titleMatch: 'Mt Aspiring Full Day Canyon ex Queenstown or Wanaka',
    fallbackTitle: 'Mt Aspiring Full Day Canyon ex Queenstown or Wanaka',
    bestFor: 'Thrill-seekers ready to abseil and jump',
    why: 'Full-day canyoning with climb, jump, swim, slide, and abseil—small groups up to five, picnic lunch, gear, and Queenstown transfers included, no experience required.',
  },
  {
    label: 'Best jet sprint and off-road combo',
    productCode: '318829P7',
    titleMatch: 'Jet Sprint Boating, Ultimate Off-Roading & Clay Target Shooting',
    fallbackTitle: 'Jet Sprint Boating, Ultimate Off-Roading & Clay Target Shooting',
    bestFor: 'Adrenaline lovers who want three hits in 90 minutes',
    why: 'Custom jet sprint boat, all-terrain off-roader, and clay shooting at Oxbow Gun Club—one of Queenstown’s most unique triple-threat adventure bundles.',
  },
];

const culturePicks = [
  {
    label: 'Best Gibbston wine tour',
    productCode: '3960P28',
    titleMatch: 'Queenstown Wine Tour',
    fallbackTitle: 'Queenstown Wine Tour',
    bestFor: 'Pinot lovers who want four cellar doors unhurried',
    why: 'Small-group tastings at Gibbston and Arrowtown boutiques—including Brennan, Waitiri Creek, and Chard Farm—with a light platter and time with knowledgeable hosts from about $158.',
  },
  {
    label: 'Best e-bike ride to the vines',
    productCode: '251248P3',
    titleMatch: 'Guided eBike Wine Tour Ride to the Vines',
    fallbackTitle: 'Guided eBike Wine Tour Ride to the Vines',
    bestFor: 'Active travelers who want to earn their tastings',
    why: 'Three-hour e-bike ride through vineyard country, suspension bridges, and bungy history—then two winery tastings with an artisan platter, family-friendly on the ride portion.',
  },
  {
    label: 'Best private Gibbston wine lunch',
    productCode: '72435P6',
    titleMatch: 'Gibbston Half-Day Private Wine Tour with Hotel Pickup',
    fallbackTitle: 'Gibbston Half-Day Private Wine Tour with Hotel Pickup',
    bestFor: 'Couples or friends who want a gourmet valley lunch',
    why: 'Private half-day to four off-the-beaten-path cellar doors with a gourmet lunch overlooking the gorge—itinerary varies daily based on your group and the valley’s best pours.',
  },
];

const milfordPicks = [
  {
    label: 'Best Milford Sound coach and cruise',
    productCode: '56760P79',
    titleMatch: 'Queenstown to Te Anau via Milford Sound inc Cruise & Lunch',
    fallbackTitle: 'Queenstown to Te Anau via Milford Sound inc Cruise & Lunch',
    bestFor: 'Travelers who want the classic fiord day by road',
    why: 'Premium small-group van from Queenstown through Fiordland with a Milford cruise and lunch, finishing with drop-off in Te Anau—storytelling guides and photo stops throughout.',
  },
  {
    label: 'Best Milford scenic flight with landing',
    productCode: '38244P5',
    titleMatch: 'Milford Sound Scenic Flight with Landing from Queenstown',
    fallbackTitle: 'Milford Sound Scenic Flight with Landing from Queenstown',
    bestFor: 'Time-pressed visitors who want fiord views from the air',
    why: 'Four-and-a-half hours with a Milford Sound landing and up to two hours on the shoreline walk, café stop, and photos before the scenic flight back to Queenstown.',
  },
  {
    label: 'Best premium Milford helicopter flight',
    productCode: '9180P11',
    titleMatch: '2hr Scenic Milford Sound Flight with Landing - 201',
    fallbackTitle: '2hr Scenic Milford Sound Flight with Landing - 201',
    bestFor: 'Once-in-a-lifetime fiord and glacier landings',
    why: 'Two-hour helicopter over Mitre Peak with landings in Milford Sound and on an alpine glacier in Fiordland National Park—the flagship aerial Milford experience from Queenstown.',
  },
];

export const queenstownHubPicks = {
  destinationId: 'queenstown',
  useStaticDisplay: true,
  catalogTourCount: 401,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Queenstown',
  heroDescription:
    "Queenstown is Milford Sound cruises, Skippers Canyon gold rush, Gibbston Pinot, and jet boats on the Shotover. With 401+ tours on Viator and airport transfers clogging the default sort, we've narrowed it to 15 standouts for couples, families, adventurers, wine lovers, and Milford Sound day trips.",
  headline: 'Best Queenstown tours by traveler type',
  subheadline:
    'A short list to start with. All bookable Queenstown tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Romance in Queenstown often means lake views and quiet moments between thrills. These picks pair a floating sauna and cold plunge, a Southern Sky stargazing portrait tour, and a private Glenorchy day along the Wakatipu.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These picks balance history, fun, and gentle adventure: a Skippers Canyon gold-rush small-group tour, a Highlands motorsport park run in Cromwell, and a Glenorchy kayak safari to Pigeon Island.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'The adventure capital lives up to its name. These picks cover a guided private dirt bike session, a full-day Mt Aspiring canyoning trip, and a jet sprint, off-roader, and clay-shooting combo.',
      picks: adventurePicks,
    },
    {
      id: 'culture',
      title: 'For wine & local flavour',
      description:
        'Central Otago is world-class Pinot country. These picks pair a four-winery Gibbston small-group tour, an e-bike ride to the vines with tastings, and a private half-day with gourmet lunch in the valley.',
      picks: culturePicks,
    },
    {
      id: 'milford',
      title: 'For Milford Sound & fiord days',
      description:
        'Most visitors want the fiord. These picks cover a Queenstown-to-Te Anau coach day with Milford cruise and lunch, a scenic flight with Milford landing, and a two-hour helicopter with glacier touchdown.',
      picks: milfordPicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best budget couples pick',
      text: 'Floating sauna and cold plunge on Lake Wakatipu — contrast therapy from about $38.',
      productCode: '5618758P1',
      titleMatch: 'Queenstown Floating Sauna & Cold Plunge',
    },
    {
      label: 'Best value history tour',
      text: 'Skippers Canyon gold-rush small-group tour — 1860s stories and pub stop from about $99.',
      productCode: '5590728P1',
      titleMatch: 'Skippers Canyon Goldrush Small Group Tour',
    },
    {
      label: 'Best classic Milford day',
      text: 'Queenstown to Te Anau via Milford Sound — cruise and lunch from about $205.',
      productCode: '56760P79',
      titleMatch: 'Queenstown to Te Anau via Milford Sound inc Cruise',
    },
  ],
};
