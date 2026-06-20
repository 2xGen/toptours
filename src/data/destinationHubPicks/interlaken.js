/** Editorial hub picks for Interlaken — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best tandem paragliding flight',
    productCode: '436352P1',
    titleMatch: 'Tandem Paragliding in Interlaken',
    fallbackTitle: 'Tandem Paragliding in Interlaken',
    bestFor: 'Couples who want a shared alpine adrenaline moment',
    why: 'Launch from Beatenberg with AlpinAir pilots and glide over both Lake Thun and Lake Brienz—10–20 minutes of airtime with the Eiger, Mönch, and Jungfrau on the horizon.',
  },
  {
    label: 'Best photogenic walking tour',
    productCode: '76545P28',
    titleMatch: 'Discover Interlaken’s most Photogenic Spots with a Local',
    fallbackTitle: 'Discover Interlaken’s most Photogenic Spots with a Local',
    bestFor: 'Light-footed pairs who want photos and local tips',
    why: 'A 90-minute walk through Unterseen and the Monastery district with a local who knows the best angles—and where to grab drinks afterward.',
  },
  {
    label: 'Best private Harder Kulm hike',
    productCode: '5494782P1',
    titleMatch: 'Interlaken: Summit Harder Kulm with a Swiss Athlete',
    fallbackTitle: 'Interlaken: Summit Harder Kulm with a Swiss Athlete',
    bestFor: 'Active couples who prefer a private pace',
    why: 'Forest trails from town to one of the region’s iconic viewpoints—flexible pacing with a Swiss athlete guide instead of a crowded group schedule.',
  },
];

const familiesPicks = [
  {
    label: 'Best scenic e-bike loop',
    productCode: '6891P39',
    titleMatch: 'Scenic E Bike Tour Interlaken',
    fallbackTitle: 'Scenic E Bike Tour Interlaken',
    bestFor: 'Families who want lakes and villages without steep climbs',
    why: 'E-bikes make alpine lakes, rivers, and rustic villages accessible—plus cheese, chocolate, and beer tastings that keep teens and parents equally happy.',
  },
  {
    label: 'Best Grindelwald First ticket',
    productCode: '8283P303',
    titleMatch: 'Attraction Ticket: Grindelwald First from Interlaken',
    fallbackTitle: 'Attraction Ticket: Grindelwald First from Interlaken',
    bestFor: 'Families who want a self-paced mountain adventure day',
    why: 'Gondola to First, cliff walk, gentle hiking trails, and adventure playgrounds—choose your own add-ons while trains and cable cars do the heavy lifting.',
  },
  {
    label: 'Best winter jetboat ride',
    productCode: '6891P29',
    titleMatch: 'Winter Jetboat Ride',
    fallbackTitle: 'Winter Jetboat Ride',
    bestFor: 'Kids who need a short, high-energy thrill',
    why: 'Twenty minutes on turquoise Lake Brienz with 360° spins, mountain views, and gear that keeps everyone dry—compact enough for younger attention spans.',
  },
];

const adventurePicks = [
  {
    label: 'Best snowshoe alpine trek',
    productCode: '6891SNOWSHOE',
    titleMatch: 'Snowshoe Adventure in the Swiss Alps',
    fallbackTitle: 'Snowshoe Adventure in the Swiss Alps',
    bestFor: 'Winter visitors who want beyond-the-resort wilderness',
    why: 'Four hours deep into snowy forest beneath the Eiger, Mönch, and Jungfrau—1.5 hours on snowshoes through alpine villages most day-trippers never reach.',
  },
  {
    label: 'Best Interlaken skydive',
    productCode: '6891P34',
    titleMatch: 'Airplane Skydive Interlaken Action Packed Alps Adventure',
    fallbackTitle: 'Airplane Skydive Interlaken Action Packed Alps Adventure',
    bestFor: 'Thrill-seekers checking off a bucket-list jump',
    why: 'Scenic flight over both lakes, a 45-second freefall at 200 kph, then a five-minute parachute descent with the Bernese Alps spread below.',
  },
  {
    label: 'Best Lauterbrunnen valley hike',
    productCode: '5569934P9',
    titleMatch: 'Hike Lauterbrunnen-Murren including Trummelbach Waterfalls Visit',
    fallbackTitle: 'Hike Lauterbrunnen-Murren including Trummelbach Waterfalls Visit',
    bestFor: 'Hikers who want waterfalls and mountain trails in one day',
    why: 'Gondola up, ridge walk overlooking the valley of 72 waterfalls, then Trümmelbach Falls hidden inside the mountain—a classic Swiss Alps day on foot.',
  },
];

const culturePicks = [
  {
    label: 'Best winter e-bike with hot chocolate',
    productCode: '440842P1',
    titleMatch: 'Interlaken Valley Winter E-Bike Tour: Rivers, Lakes & Castles',
    fallbackTitle: 'Interlaken Valley Winter E-Bike Tour: Rivers, Lakes & Castles',
    bestFor: 'Travelers who want castles, lakes, and a cozy stop',
    why: 'Ride the turquoise Aare past Thun and Brienz, 12th-century castle ruins, and Bönigen village—with a lakeside Swiss hot chocolate break built in.',
  },
  {
    label: 'Best Iseltwald & Giessbach ride',
    productCode: '5591757P10',
    titleMatch: 'Explore Iseltwald & Giessbach E-Bike Tour from Interlaken',
    fallbackTitle: 'Explore Iseltwald & Giessbach E-Bike Tour from Interlaken',
    bestFor: 'Culture lovers drawn to lakeside villages and Belle Époque hotels',
    why: 'Cheese tasting at a farm, Lake Brienz shores to picturesque Iseltwald, Giessbach Falls, and the historic Grand Hotel via Europe’s first funicular.',
  },
  {
    label: 'Best lakes-and-ruins e-bike tour',
    productCode: '5591757P11',
    titleMatch: 'Discover Interlaken E-Bike Tour – Lakes Ruins and Scenic Views',
    fallbackTitle: 'Discover Interlaken E-Bike Tour – Lakes Ruins and Scenic Views',
    bestFor: 'Curious riders who want history with their scenery',
    why: 'Medieval Unspunnen and Weissenau ruins, Heimwehfluh panoramas, three alpine rivers, and both Lake Thun and Lake Brienz in one half-day story-rich loop.',
  },
];

const alpineDayTripsPicks = [
  {
    label: 'Best Jungfraujoch self-guided ticket',
    productCode: '8283P108',
    titleMatch: 'Attraction Ticket: Jungfraujoch Top of Europe self-guided trip',
    fallbackTitle: 'Attraction Ticket: Jungfraujoch Top of Europe self-guided trip',
    bestFor: 'Independent travelers targeting Top of Europe',
    why: 'Ticket plus travel handbook for Europe’s highest railway station—Eiger Express or classic Lauterbrunnen route, with mandatory Jungfrau seat reservation included.',
  },
  {
    label: 'Best Kleine Scheidegg small-group day',
    productCode: '8283P243',
    titleMatch: 'Grindelwald -Kleine Scheidegg-Lauterbrunnen Small Group Day Trip',
    fallbackTitle: 'Grindelwald -Kleine Scheidegg-Lauterbrunnen Small Group Day Trip',
    bestFor: 'First-timers who want the Jungfrau region by Swiss train',
    why: 'Grindelwald, cogwheel to Kleine Scheidegg with Eiger views, Wengen, and Lauterbrunnen with Staubbach Falls—small group, mountain lunch included.',
  },
  {
    label: 'Best Schilthorn afternoon tour',
    productCode: '8283P310',
    titleMatch: 'Schilthorn Piz Gloria afternoon small group tour from Interlaken',
    fallbackTitle: 'Schilthorn Piz Gloria afternoon small group tour from Interlaken',
    bestFor: 'Bond fans and viewpoint hunters with half a day',
    why: 'Lauterbrunnen Valley to Schilthorn summit at 2,970 m, revolving Piz Gloria restaurant, and James Bond lore—afternoon escape without a full private charter.',
  },
];

export const interlakenHubPicks = {
  destinationId: 'interlaken',
  useStaticDisplay: true,
  catalogTourCount: 229,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Interlaken',
  heroDescription:
    "Interlaken sits between Lake Thun and Lake Brienz with the Jungfrau region at your doorstep—paragliding, e-bikes, Jungfraujoch, and Lauterbrunnen waterfalls. With 229+ tours on Viator and airport transfers cluttering the default sort, we've narrowed it to 15 standouts for couples, families, adventurers, culture seekers, and alpine day trips.",
  headline: 'Best Interlaken tours by traveler type',
  subheadline:
    'A short list to start with. All bookable Interlaken tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Romance in Interlaken often means alpine views and shared thrills. These picks pair tandem paragliding over both lakes, a photogenic walk with a local, and a private Harder Kulm hike at your pace.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These picks balance gentle adventure and icon sights: a scenic e-bike with tastings, a self-guided Grindelwald First ticket day, and a short winter jetboat spin on Lake Brienz.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'The Bernese Oberland rewards bold travelers. These picks cover a snowshoe trek beneath the big three peaks, an airplane skydive over the lakes, and a guided Lauterbrunnen–Mürren hike with Trümmelbach Falls.',
      picks: adventurePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'Swiss culture here is lakeside villages, castle ruins, and farm tastings. These picks pair a winter e-bike with hot chocolate, an Iseltwald–Giessbach ride with cheese, and a lakes-and-ruins e-bike loop.',
      picks: culturePicks,
    },
    {
      id: 'alpine-day-trips',
      title: 'For Jungfrau region day trips',
      description:
        'Most visitors come for the peaks. These picks cover a Jungfraujoch self-guided ticket, a small-group Kleine Scheidegg train day through Grindelwald and Lauterbrunnen, and a Schilthorn afternoon with Piz Gloria.',
      picks: alpineDayTripsPicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best budget couples pick',
      text: 'Photogenic spots walk with a local — Unterseen and monastery highlights from about $71.',
      productCode: '76545P28',
      titleMatch: 'Discover Interlaken’s most Photogenic Spots with a Local',
    },
    {
      label: 'Best Top of Europe day',
      text: 'Jungfraujoch self-guided ticket — Eiger Express or classic route, seat reservation included.',
      productCode: '8283P108',
      titleMatch: 'Attraction Ticket: Jungfraujoch Top of Europe self-guided',
    },
    {
      label: 'Best short family thrill',
      text: 'Winter jetboat on Lake Brienz — 20 minutes of spins and mountain views from about $100.',
      productCode: '6891P29',
      titleMatch: 'Winter Jetboat Ride',
    },
  ],
};
