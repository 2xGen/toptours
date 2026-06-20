/** Editorial hub picks for San José — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best premium Arenal day',
    productCode: '169001P7',
    titleMatch: 'Premium Adventure from San Jose Arenal Volcano Waterfall and Thermal',
    fallbackTitle: 'Premium Adventure from San Jose Arenal Volcano Waterfall and Thermal',
    bestFor: 'Couples who want comfort and small groups on a big nature day',
    why: 'Super-small groups, premium transport, hidden viewpoints, and thermal pools—Arenal Volcano, waterfalls, and hot springs without a generic bus-tour feel.',
  },
  {
    label: 'Best thermal pools day',
    productCode: '218955P11',
    titleMatch: 'Arenal Volcano Tour & EcoTermales Thermal Pools from San José',
    fallbackTitle: 'Arenal Volcano Tour & EcoTermales Thermal Pools from San José',
    bestFor: 'Relaxation-focused couples after city days',
    why: 'Scenic drive to La Fortuna, volcano viewpoints, then intimate Ecotermales hot springs surrounded by rainforest—nature and soak time in one full day.',
  },
  {
    label: 'Best Poás and La Paz loop',
    productCode: '102973P43',
    titleMatch: 'Poas Coffee tour, La Paz Falls and Poas Volcano',
    fallbackTitle: 'Poas Coffee tour, La Paz Falls and Poas Volcano',
    bestFor: 'Couples who love coffee culture and cloud forest',
    why: 'Fresh coffee on a mountain estate, the turquoise Poás crater, and La Paz waterfall gardens—highland scenery and Costa Rican hospitality in a single outing.',
  },
];

const familiesPicks = [
  {
    label: 'Best coffee farm half day',
    productCode: '106730P6',
    titleMatch: 'Horseback our Hacienda - 4 hours Coffee Tour',
    fallbackTitle: 'Horseback our Hacienda - 4 hours Coffee Tour',
    bestFor: 'Families who want farm life without a long drive',
    why: 'Horseback riding through Aquiares coffee country, seed-to-cup storytelling, and a family-run hacienda pace—options for riders and non-riders alike.',
  },
  {
    label: 'Best full coffee day',
    productCode: '106730P4',
    titleMatch: 'Full day, the Aquiares way - Complete Coffee Tour',
    fallbackTitle: 'Full day, the Aquiares way - Complete Coffee Tour',
    bestFor: 'Kids curious about how coffee grows',
    why: 'Farm-truck ride through the coffee cycle, waterfall swims, and lunch on the estate—the full Aquiares experience when you have a whole day to spare.',
  },
  {
    label: 'Best rainforest waterfall day',
    productCode: '172814P1',
    titleMatch: 'Ebano Waterfalls and Rainforest Safari Tour',
    fallbackTitle: 'Ebano Waterfalls and Rainforest Safari Tour',
    bestFor: 'Active families who love wildlife and swimming',
    why: '4×4 safari truck, short rainforest hike, two waterfall pools, and a banana-leaf lunch by the river—monkeys, birds, and swim stops kids remember.',
  },
];

const adventurePicks = [
  {
    label: 'Best beginner rafting',
    productCode: '382740P1',
    titleMatch: 'Rafting Sarapiqui River Class II-III Costa Rica',
    fallbackTitle: 'Rafting Sarapiqui River Class II-III Costa Rica',
    bestFor: 'First-time rafters and mixed-age groups',
    why: 'Class II–III Sarapiquí rapids through rainforest scenery—enough splash for adrenaline without needing prior rafting experience.',
  },
  {
    label: 'Best canopy near the city',
    productCode: '345782P1',
    titleMatch: 'Zipline tour on the central valley of Costa Rica',
    fallbackTitle: 'Zipline tour on the central valley of Costa Rica',
    bestFor: 'Half-day thrill seekers based in San José',
    why: 'Canopy lines through cloud forest just 25 minutes from downtown—Central Valley views and treetop speed without a full-day Arenal transfer.',
  },
  {
    label: 'Best adrenaline combo',
    productCode: '40636P6',
    titleMatch: 'Bungee Jump near San José, Costa Rica w/ Canopy Ziplines',
    fallbackTitle: 'Bungee Jump near San José, Costa Rica w/ Canopy Ziplines and Superman Cable',
    bestFor: 'Adventurers who want maximum variety in one trip',
    why: '150-meter bungee over the La Balsa river plus canopy ziplines, a Tarzan swing, and the Superman cable—cloud-forest adrenaline under pro guides.',
  },
];

const culturePicks = [
  {
    label: 'Best foodie crawl',
    productCode: '68129P3',
    titleMatch: 'San Jose Foodie Tour | Costa Rican Culinary Culture',
    fallbackTitle: 'San Jose Foodie Tour | Costa Rican Culinary Culture',
    bestFor: 'Travelers who plan trips around meals',
    why: 'Three curated stops—specialty coffee workshop, a full local tasting, and a mixology session—while walking historic neighborhoods between bites.',
  },
  {
    label: 'Best coffee and chocolate walk',
    productCode: '5585860P3',
    titleMatch: 'San Jose Walking City Tour Coffee and Chocolate Tastings',
    fallbackTitle: 'San Jose Walking City Tour Coffee and Chocolate Tastings',
    bestFor: 'First afternoon in the capital',
    why: 'Prestigious districts and parks on foot, then a barista-led coffee tasting with artisanal chocolate—a compact intro to Tico flavor and city history.',
  },
  {
    label: 'Best nightlife culture',
    productCode: '5521744P1',
    titleMatch: 'San Jose Exclusive Bar Crawl with Drinks and Club Entrys',
    fallbackTitle: 'San Jose Exclusive Bar Crawl with Drinks and Club Entrys',
    bestFor: 'Evening explorers and groups',
    why: 'Skip-the-line entry to San José’s best bars and clubs with drinks at each stop—local music, gastronomy, and a planned safe night out.',
  },
];

const dayTripPicks = [
  {
    label: 'Best Tortuguero day',
    productCode: '26853P120',
    titleMatch: 'Tortuguero One Day Private Tour from San Jose',
    fallbackTitle: 'Tortuguero One Day Private Tour from San Jose',
    bestFor: 'Wildlife lovers with one long day free',
    why: 'Canals, howler monkeys, sloths, and Caribbean lunch in Tortuguero National Park—100% private boat and van day when you cannot spare multiple nights.',
  },
  {
    label: 'Best Poás half day',
    productCode: '148805P4',
    titleMatch: 'Poas Volcano - Half Day',
    fallbackTitle: 'Poas Volcano - Half Day',
    bestFor: 'Short on time but want a headline volcano',
    why: 'Half-day run to Poás National Park—active crater views, microclimate shifts on the drive up, and back to your hotel by midday.',
  },
  {
    label: 'Best Arenal bridges day',
    productCode: '150268P4',
    titleMatch: '2 in 1 : Suspension Bridges + Hot Springs in Arenal',
    fallbackTitle: '2 in 1 : Suspension Bridges + Hot Springs in Arenal',
    bestFor: 'Nature lovers who want forest walks and a soak',
    why: 'Mistico Park suspension bridges above the rainforest canopy, then Los Lagos hot springs with volcano views—adventure and relaxation from San José in one day.',
  },
];

export const sanJoseHubPicks = {
  destinationId: 'san-jose',
  useStaticDisplay: true,
  catalogTourCount: 784,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in San José',
  heroDescription:
    "San José is Costa Rica's gateway to volcanoes, coffee country, rainforest waterfalls, and Caribbean wildlife. With hundreds of tours competing for your attention—and airport transfers clogging the default list—we've narrowed it to 15 standouts for couples, families, adventurers, culture seekers, and volcano day trips.",
  headline: 'Best San José tours by traveler type',
  subheadline:
    'A short list to start with. All bookable San José tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Romance in Costa Rica often means volcano views and thermal pools. These picks pair a premium small-group Arenal day with hidden viewpoints, an Ecotermales hot-springs run from the capital, and a Poás–La Paz loop with coffee on a mountain estate.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These picks balance farm fun and rainforest without overloading young travelers: a four-hour Aquiares coffee-and-horseback half day, the full estate coffee experience with waterfall swims, and an Ébano reserve safari with wildlife, pools, and banana-leaf lunch.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'From the capital you can raft, zip, and jump in a single trip. These picks cover beginner-friendly Sarapiquí rafting, a Central Valley canopy run 25 minutes from downtown, and a bungee-plus-zipline combo in cloud forest.',
      picks: adventurePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'San José rewards travelers who eat and walk the city. These picks pair a three-stop foodie tour with coffee and mixology, a walking tasting of volcanic coffee and artisan chocolate, and an exclusive bar crawl through the capital's nightlife.',
      picks: culturePicks,
    },
    {
      id: 'day-trips',
      title: 'For volcano & wildlife day trips',
      description:
        'Many headline Costa Rica experiences launch from San José. These picks cover a private Tortuguero canals day, a half-day Poás Volcano run, and an Arenal suspension-bridge hike paired with hot springs when you want forest and soak in one outing.',
      picks: dayTripPicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best rainforest day from the city',
      text: 'Ébano Waterfalls safari — 4×4, two waterfall pools, wildlife, and a banana-leaf lunch without an overnight trip.',
      productCode: '172814P1',
      titleMatch: 'Ebano Waterfalls and Rainforest Safari',
    },
    {
      label: 'Best food tour in San José',
      text: 'San Jose Foodie Tour — coffee workshop, local tasting, and mixology across three curated stops.',
      productCode: '68129P3',
      titleMatch: 'San Jose Foodie Tour',
    },
    {
      label: 'Best Arenal day with hot springs',
      text: 'Premium Adventure from San José — small groups, volcano viewpoints, waterfalls, and thermal pools in one premium outing.',
      productCode: '169001P7',
      titleMatch: 'Premium Adventure from San Jose',
    },
  ],
};
