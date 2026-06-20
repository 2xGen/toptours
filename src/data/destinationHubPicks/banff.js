/** Editorial hub picks for Banff — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best Moraine Lake sunrise tour',
    productCode: '467394P11',
    titleMatch: 'Moraine Lake Sunrise 3-Hour Tour from Canmore/Banff',
    fallbackTitle: 'Moraine Lake Sunrise 3-Hour Tour from Canmore/Banff',
    bestFor: 'Early risers who want the valley of ten peaks without crowds',
    why: 'Arrive before dawn with hot drinks and blankets as first light hits Moraine Lake—your guide knows the best viewpoints and a tree is planted for every booking.',
  },
  {
    label: 'Best Bow River kayak paddle',
    productCode: '370405P4',
    titleMatch: 'Banff National Park- Double Kayak Experience',
    fallbackTitle: 'Banff National Park- Double Kayak Experience',
    bestFor: 'Pairs who want Mount Rundle views from the water',
    why: 'Paddle the Bow River in a double kayak before rental boats hit the water—wildlife, beaver sightings, and that classic Canadian Rockies reflection shot together.',
  },
  {
    label: 'Best town stroll with treats',
    productCode: '5558003P1',
    titleMatch: 'Banff Town Walking Tour Includes Refreshment and Sweet Treat',
    fallbackTitle: 'Banff Town Walking Tour Includes Refreshment and Sweet Treat',
    bestFor: 'Couples easing into the Rockies with a gentle intro',
    why: 'Two hours through Banff’s streets with history, scenery, and a sweet treat plus refreshment—low effort, high charm, perfect after a travel day.',
  },
];

const familiesPicks = [
  {
    label: 'Best Banff local e-bike tour',
    productCode: '274286P3',
    titleMatch: 'Small Group E-Bike Tour the Banff Local Explorer',
    fallbackTitle: 'Small Group E-Bike Tour the Banff Local Explorer',
    bestFor: 'Families who want lakes, falls, and wildlife without steep climbs',
    why: 'Vermilion Lakes, Bow Falls, and the Banff Springs Golf Course loop on pedal-assist bikes—elk and deer often graze the fairways while your guide shares Rockies geology.',
  },
  {
    label: 'Best lakes day from Banff',
    productCode: '402277P2',
    titleMatch: 'Explore Moraine Lake, Banff, Lake Louise & Minnewanka',
    fallbackTitle: 'Explore Moraine Lake, Banff, Lake Louise & Minnewanka',
    bestFor: 'First-timers who want the icon lakes in one day',
    why: 'Small-group pickup from Banff, Canmore, or Calgary with short hikes, lakeside walks, and wildlife spotting—leave the driving and parking logistics to the guide.',
  },
  {
    label: 'Best e-bike and canyon hike combo',
    productCode: '45607P45',
    titleMatch: 'Sundance Canyon eBike and Hike Guided Tour',
    fallbackTitle: 'Sundance Canyon eBike and Hike Guided Tour',
    bestFor: 'Active families and first-time hikers',
    why: 'Ride the Bow River pathway from downtown Banff, then a guided hike into secluded Sundance Canyon—moderate effort with highlights away from the main-town crowds.',
  },
];

const adventurePicks = [
  {
    label: 'Best beginner canyoning half-day',
    productCode: '152062P3',
    titleMatch: 'Half Day Heart Creek Canyon - Near Banff & Canmore- For Beginners',
    fallbackTitle: 'Half Day Heart Creek Canyon - Near Banff & Canmore- For Beginners',
    bestFor: 'Thrill-seekers new to rappelling',
    why: 'Heart Creek Canyon near Canmore with progressively longer rappels—half a day of waterfall scenery and coached descents, no prior canyoning experience required.',
  },
  {
    label: 'Best Banff via ferrata climb',
    productCode: '274286P6',
    titleMatch: 'Small Group Banff Skyline Via Ferrata 5-hour Tour',
    fallbackTitle: 'Small Group Banff Skyline Via Ferrata 5-hour Tour',
    bestFor: 'Fit travelers who want cliffs above Banff',
    why: 'A Canadian Signature Experience on Mt Norquay—steel rungs, a 55 m suspension bridge, and panoramic Bow Valley views with ACMG-certified guides handling safety.',
  },
  {
    label: 'Best Abraham Lake ice bubbles tour',
    productCode: '299389P8',
    titleMatch: 'Icefields Parkway and Ice Bubbles of Abraham Lake Adventure',
    fallbackTitle: 'Icefields Parkway and Ice Bubbles of Abraham Lake Adventure',
    bestFor: 'Winter visitors chasing a unique Rockies photo',
    why: 'Frozen methane bubbles on Abraham Lake, Peyto Lake viewpoints, and Icefields Parkway secrets—winter’s answer to turquoise summer lakes, with optional snowshoeing.',
  },
];

const culturePicks = [
  {
    label: 'Best Banff food walking tour',
    productCode: '332715P6',
    titleMatch: 'Taste of Banff Food Tour',
    fallbackTitle: 'Taste of Banff Food Tour',
    bestFor: 'Food lovers who want local flavour with context',
    why: 'Banff’s original walking food tour—handpicked eateries, mountain-town stories, and hidden gems most visitors walk right past on Banff Avenue.',
  },
  {
    label: 'Best craft distillery tasting',
    productCode: '5492728P3',
    titleMatch: 'Park Distillery Tour with Craft Spirits Tasting',
    fallbackTitle: 'Park Distillery Tour with Craft Spirits Tasting',
    bestFor: 'A short, affordable taste of Banff craft spirits',
    why: 'Interactive small-group tour at PARK Distillery followed by a guided flight of four house spirits—including gin—in the heart of Banff town.',
  },
  {
    label: 'Best wildlife sightseeing tour',
    productCode: '387099P6',
    titleMatch: 'Explore Banff + Wildlife',
    fallbackTitle: 'Explore Banff + Wildlife',
    bestFor: 'Nature lovers who want elk, deer, and Rockies history',
    why: 'Three hours through Banff’s best wildlife corridors with expert guides who know where bighorn sheep and elk graze—photography-friendly stops with town history woven in.',
  },
];

const lakeLouisePicks = [
  {
    label: 'Best three-park lakes day',
    productCode: '402277P6',
    titleMatch: 'Explore Lake Louise, Emerald Lake, Takakkaw & 3 National Parks',
    fallbackTitle: 'Explore Lake Louise, Emerald Lake, Takakkaw & 3 National Parks',
    bestFor: 'Travelers who want Banff, Yoho, and Kootenay in one trip',
    why: 'Full-day small-group run through Takakkaw Falls, Emerald Lake, Lake Louise, Marble Canyon, and the Natural Bridge—with short hikes and lunch in Lake Louise Village.',
  },
  {
    label: 'Best Lake Louise small-group tour',
    productCode: '402277P3',
    titleMatch: 'Banff National Park and Lake Louise Small Group Tour',
    fallbackTitle: 'Banff National Park and Lake Louise Small Group Tour',
    bestFor: 'Classic Rockies highlights without a private charter',
    why: 'Johnston Canyon, Lake Louise, Banff town, Surprise Corner, and Bow Falls in one seamless day—max 12 guests with strong wildlife-sighting odds year-round.',
  },
  {
    label: 'Best Moraine Lake and Johnston Canyon day',
    productCode: '180217P55',
    titleMatch: 'Lake Louise,Moraine Lake, Johnston Canyon @ Banff,Canmore,Calgary',
    fallbackTitle: 'Lake Louise,Moraine Lake, Johnston Canyon @ Banff,Canmore,Calgary',
    bestFor: 'Budget-conscious travelers hitting the must-see trio',
    why: 'Turquoise Lake Louise and Moraine Lake plus a Johnston Canyon catwalk hike and Banff town time—from about $57 with pickup options across the region.',
  },
];

export const banffHubPicks = {
  destinationId: 'banff',
  useStaticDisplay: true,
  catalogTourCount: 510,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Banff',
  heroDescription:
    "Banff is Lake Louise, Moraine Lake, Johnston Canyon, and the Icefields Parkway—plus wildlife, e-bikes, and mountain-town food. With 510+ tours on Viator and airport transfers clogging the default sort, we've narrowed it to 15 standouts for couples, families, adventurers, culture seekers, and lake day trips.",
  headline: 'Best Banff tours by traveler type',
  subheadline:
    'A short list to start with. All bookable Banff tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Romance in Banff often means alpine lakes at dawn and quiet moments on the water. These picks pair a Moraine Lake sunrise, a double kayak on the Bow River, and a town walk with sweet treats.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These picks balance gentle activity and icon sights: a local e-bike loop past Vermilion Lakes, a small-group lakes day to Moraine and Lake Louise, and a Sundance Canyon e-bike-and-hike combo.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'The Canadian Rockies reward bold travelers. These picks cover beginner canyoning at Heart Creek, the Mt Norquay via ferrata with a suspension bridge, and a winter Abraham Lake ice-bubbles run on the Icefields Parkway.',
      picks: adventurePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'Banff is mountain-town dining and local craft. These picks pair the original Taste of Banff food tour, a PARK Distillery spirits tasting, and a wildlife sightseeing loop with Rockies history.',
      picks: culturePicks,
    },
    {
      id: 'lake-louise',
      title: 'For Lake Louise & Rockies day trips',
      description:
        'Most visitors come for the lakes. These picks cover a three-national-park day through Emerald Lake and Takakkaw Falls, a Johnston Canyon–Lake Louise small-group tour, and a budget Moraine Lake–Johnston Canyon day.',
      picks: lakeLouisePicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best budget lake day',
      text: 'Three-park tour through Lake Louise, Emerald Lake, and Takakkaw Falls — from about $68.',
      productCode: '402277P6',
      titleMatch: 'Explore Lake Louise, Emerald Lake, Takakkaw',
    },
    {
      label: 'Best sunrise experience',
      text: 'Moraine Lake sunrise tour — hot drinks, blankets, and crowd-free first light.',
      productCode: '467394P11',
      titleMatch: 'Moraine Lake Sunrise 3-Hour Tour',
    },
    {
      label: 'Best quick food & drink stop',
      text: 'PARK Distillery craft spirits tasting — interactive tour from about $11.',
      productCode: '5492728P3',
      titleMatch: 'Park Distillery Tour with Craft Spirits Tasting',
    },
  ],
};
