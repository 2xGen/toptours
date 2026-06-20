/** Editorial hub picks for Reykjavik — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best aurora night',
    productCode: '249297P1',
    titleMatch: 'Reykjavik Private Northern Lights Tour with Pro Photographer',
    fallbackTitle: 'Reykjavik Private Northern Lights Tour with Pro Photographer',
    bestFor: 'Couples chasing the northern lights together',
    why: 'Private vehicle, expert aurora tracking, and professional photos of you under the Arctic sky—no crowded bus and no guessing where to stop.',
  },
  {
    label: 'Most romantic aurora hunt',
    productCode: '452727P1',
    titleMatch: 'Private Aurora Hunt in Iceland with Professional Photos',
    fallbackTitle: 'Private Aurora Hunt in Iceland with Professional Photos',
    bestFor: 'Honeymoons and anniversary trips',
    why: 'A dedicated guide hunts clear skies away from city glow, with edited photos included—intimate, unhurried, and built for two.',
  },
  {
    label: 'Best private Golden Circle',
    productCode: '52876P2',
    titleMatch: 'Golden Circle Private Day Tour',
    fallbackTitle: 'Golden Circle Private Day Tour - up to 9 passengers',
    bestFor: 'Couples who want the classics on their own schedule',
    why: 'Þingvellir, Geysir, and Gullfoss with a private driver-guide—stop for photos, coffee, or extra time at each site without a fixed group pace.',
  },
];

const familiesPicks = [
  {
    label: 'Best kid-friendly day trip',
    productCode: '54996P30',
    titleMatch: 'Golden Circle & Lunch at Fridheimar Tomato Farm',
    fallbackTitle: 'Golden Circle & Lunch at Fridheimar Tomato Farm Small-Group Tour',
    bestFor: 'Families who want sights plus a fun lunch stop',
    why: 'Golden Circle highlights plus lunch inside a geothermal tomato greenhouse—engaging for kids and relaxed for parents in a small group.',
  },
  {
    label: 'Best south coast sampler',
    productCode: '30581P7',
    titleMatch: 'South Coast Summer Day Tour in Small-Group',
    fallbackTitle: 'South Coast Summer Day Tour in Small-Group from Reykjavik',
    bestFor: 'Families with one big day to spend outside the city',
    why: 'Waterfalls, black-sand beaches, and glacier views in a capped group from Reykjavik—full day, clear itinerary, no self-drive stress.',
  },
  {
    label: 'Best glacier lagoon day',
    productCode: '386554P12',
    titleMatch: 'Diamond Beach & Jökulsárlón Floating Glacier',
    fallbackTitle: 'Diamond Beach & Jökulsárlón Floating Glacier Guided Day Tour',
    bestFor: 'Families ready for Iceland’s most iconic long day trip',
    why: 'Icebergs on Jökulsárlón lagoon and diamond ice on black sand—one of Iceland’s wow moments, handled as a guided round trip from Reykjavik.',
  },
];

const adventurePicks = [
  {
    label: 'Best snorkel experience',
    productCode: '5590285P1',
    titleMatch: 'Silfra Snorkel - Between Continents',
    fallbackTitle: 'Silfra Snorkel - Between Continents - When Quality Matters',
    bestFor: 'Adventurers who want something only Iceland offers',
    why: 'Snorkel between the North American and Eurasian plates in crystal-clear glacial water—dry suit, small groups, and a genuinely unique active hour.',
  },
  {
    label: 'Best glacier hike',
    productCode: '388640P9',
    titleMatch: 'Glacier Adventure at Sólheimajökull',
    fallbackTitle: 'Glacier Adventure at Sólheimajökull Private Tour',
    bestFor: 'Active travelers who want ice under their boots',
    why: 'Crampons on Sólheimajökull with a certified guide—real glacier terrain, safety gear included, and south-coast scenery on the drive.',
  },
  {
    label: 'Best adrenaline in Reykjavik',
    productCode: '457881P1',
    titleMatch: 'Reykjavik Buggy Adventure',
    fallbackTitle: 'Reykjavik Buggy Adventure with Options',
    bestFor: 'Thrill-seekers short on time',
    why: 'Off-road buggy routes on the Reykjanes peninsula with lava fields and coastal views—high energy without committing to a multi-day expedition.',
  },
];

const firstTimePicks = [
  {
    label: 'Best Golden Circle intro',
    productCode: '399370P3',
    titleMatch: 'Full Day Golden Circle - Guided Tour',
    fallbackTitle: 'Full Day Golden Circle - Guided Tour',
    bestFor: 'First-time visitors with one classic day',
    why: 'The essential trio—Þingvellir, Geysir, and Gullfoss—in a straightforward full-day guided loop, ideal as your first Iceland outing.',
  },
  {
    label: 'Best south coast highlights',
    productCode: '101905P7',
    titleMatch: 'Glacier Lagoon, Diamond Beach, Black Sand Beaches and Waterfalls',
    fallbackTitle: 'Glacier Lagoon, Diamond Beach, Black Sand Beaches and Waterfalls',
    bestFor: 'Travelers who want waterfalls and glacier country',
    why: 'Skógafoss, black sand, and Jökulsárlón in one guided day—the south-coast greatest hits without planning every stop yourself.',
  },
  {
    label: 'Best easy Golden Circle',
    productCode: '423175P7',
    titleMatch: 'Golden Circle Bus Day Tour',
    fallbackTitle: 'Iceland from Reykjavik Golden Circle Bus Day Tour',
    bestFor: 'Budget-conscious first-timers who want a simple join-in day',
    why: 'A no-fuss bus loop to Þingvellir, Geysir, and Gullfoss—easy to book, easy to follow, and a solid baseline before you add aurora or glacier days.',
  },
];

const culturePicks = [
  {
    label: 'Best food tour',
    productCode: '63280P4',
    titleMatch: 'Reykjavik Street Food Walking Tour',
    fallbackTitle: 'Reykjavik Street Food Walking Tour',
    bestFor: 'Food lovers with a free evening',
    why: 'Local bites, Icelandic staples, and neighborhood stops on foot—better context than guessing menus around Laugavegur on your own.',
  },
  {
    label: 'Best local secrets',
    productCode: '319673P1',
    titleMatch: 'Private Iceland Tour - Hidden Gems & Local Experience',
    fallbackTitle: 'Private Iceland Tour - Hidden Gems & Local Experience',
    bestFor: 'Travelers who want stories, not just scenery',
    why: 'A local-led private route through lesser-known stops and Icelandic daily life—flexible, personal, and deeper than a standard sightseeing loop.',
  },
  {
    label: 'Best city overview',
    productCode: '468851P2',
    titleMatch: 'Private Reykjavík Tuk Tuk',
    fallbackTitle: 'Private Reykjavík Tuk Tuk – City Highlights Tour',
    bestFor: 'Short city days between bigger excursions',
    why: 'Hallgrímskirkja, Harpa, and central neighborhoods in a fun open-air ride—compact, photogenic, and easy to pair with a flight arrival day.',
  },
];

export const reykjavikHubPicks = {
  destinationId: 'reykjavik',
  useStaticDisplay: true,
  catalogTourCount: 1900,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Reykjavik',
  heroDescription:
    "Reykjavik is the base camp for Iceland's northern lights, Golden Circle loops, glacier lagoons, and Silfra snorkeling. With hundreds of day trips and multi-day adventures competing for your attention, we've narrowed it to 15 standouts for couples, families, adventurers, first-time visitors, and culture seekers.",
  headline: 'Best Reykjavik tours by traveler type',
  subheadline:
    'A short list to start with. All bookable Reykjavik tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Northern lights and private days out define romance in Iceland. These picks pair an aurora night with a pro photographer, a private aurora hunt with edited photos, and a Golden Circle loop on your own schedule—Þingvellir, Geysir, and Gullfoss without a fixed group pace.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'Not every family day needs a 12-hour glacier haul. These picks balance a Golden Circle run with lunch inside Fridheimar’s tomato greenhouse, a small-group south-coast summer day with waterfalls and black sand, and a guided Jökulsárlón trip to icebergs and Diamond Beach.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'Reykjavik is the launch pad for Iceland’s wildest half-day thrills. These picks cover Silfra snorkel between tectonic plates, a Sólheimajökull glacier hike with crampons, and a Reykjanes buggy run through lava fields and coastal tracks.',
      picks: adventurePicks,
    },
    {
      id: 'first-time',
      title: 'For first-time visitors',
      description:
        'First time in Iceland usually means two questions: Golden Circle or south coast? These picks cover a full-day Golden Circle guided loop, a glacier-lagoon-and-waterfalls south-coast day, and a straightforward join-in bus tour when you want the classics without the planning.',
      picks: firstTimePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'Between big nature days, Reykjavik has a real city pulse—street food, hidden neighborhoods, and compact sightseeing. These picks pair a guided street-food walk, a hidden-gems private tour with a local, and a tuk-tuk spin past Hallgrímskirkja and Harpa.',
      picks: culturePicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best northern lights tour',
      text: 'Northern Lights Jeep Tour — cocoa, photos, and a guide who knows where skies clear.',
      productCode: '341004P2',
      titleMatch: 'Northern Lights Jeep Tour',
    },
    {
      label: 'Best Golden Circle day',
      text: 'Full Day Golden Circle Guided Tour — Þingvellir, Geysir, and Gullfoss in one straightforward outing.',
      productCode: '399370P3',
      titleMatch: 'Full Day Golden Circle - Guided Tour',
    },
    {
      label: 'Best only-in-Iceland activity',
      text: 'Silfra Snorkel Between Continents — dry suit, clear water, and two tectonic plates at once.',
      productCode: '5590285P1',
      titleMatch: 'Silfra Snorkel - Between Continents',
    },
  ],
};
