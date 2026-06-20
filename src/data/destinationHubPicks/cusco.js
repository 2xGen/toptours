/** Editorial hub picks for Cusco — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best mystical horseback ride',
    productCode: '333328P1',
    titleMatch: 'Anthropologist-Led Horseback: Moon Temple & Mysticism',
    fallbackTitle: 'Anthropologist-Led Horseback: Moon Temple & Mysticism (Max 5)',
    bestFor: 'Couples who want depth, not a bus tour',
    why: 'Max five guests with an anthropologist guide to the Temple of the Moon—Inka cosmovision, quiet sacred sites, and mindful horseback riding through Cusco’s mystical hills.',
  },
  {
    label: 'Best Sacred Valley picnic day',
    productCode: '44685P5',
    titleMatch: 'Private Ollantaytambo, Pisac Ruins Tour with Farm Visit, Gourmet Picnic Lunch',
    fallbackTitle: 'Private Ollantaytambo, Pisac Ruins Tour with Farm Visit, Gourmet Picnic Lunch',
    bestFor: 'Food-loving couples with a full day to explore',
    why: 'Private ruins at Ollantaytambo and Pisac, a farm visit with guinea pigs and fresh produce, then a chef-prepared organic picnic—history and Andean flavors without a crowded group pace.',
  },
  {
    label: 'Best relaxed Machu Picchu overnight',
    productCode: '316433P5',
    titleMatch: '2-Day Sacred Valley Machu Picchu by Train with Llama Experience',
    fallbackTitle: '2-Day Sacred Valley Machu Picchu by Train with Llama Experience',
    bestFor: 'Couples who want Machu Picchu without a dawn dash',
    why: 'Sacred Valley, a camelid rescue center, train to Aguas Calientes, overnight rest, then Machu Picchu the next morning—a gentler two-day rhythm than a single marathon day trip.',
  },
];

const familiesPicks = [
  {
    label: 'Best alpaca Sacred Valley walk',
    productCode: '5497204P1',
    titleMatch: 'the best sacred valley tour: walk with Alpacas',
    fallbackTitle: 'the best sacred valley tour: walk with Alpacas,culture experience',
    bestFor: 'Kids who love animals and gentle hiking',
    why: 'Small groups, scenic valley trails, and friendly alpacas alongside terraced fields and village views—an authentic Andean walk without the big-bus feel.',
  },
  {
    label: 'Best hands-on textile half day',
    productCode: '213343P2',
    titleMatch: 'The Textile Workshop Experience in Cusco Region',
    fallbackTitle: 'The Textile Workshop Experience in Cusco Region',
    bestFor: 'Families who want a break from ruins and altitude hikes',
    why: 'Dye wool with natural pigments, learn a weaving technique, meet alpacas and llamas, and leave with a bracelet you made—Peruvian craft culture in half a day at Andean Colors.',
  },
  {
    label: 'Best short Inca Trail',
    productCode: '153304P7',
    titleMatch: '2 Day Inca Trail to Machu Picchu (Small groups)',
    fallbackTitle: '2 Day Inca Trail to Machu Picchu (Small groups)',
    bestFor: 'Active families not ready for four days of camping',
    why: 'The highlights of the classic trail—Wiñay Wayna, Sun Gate entry, Machu Picchu—with a hotel night in Aguas Calientes instead of tents, and no extreme high-altitude passes.',
  },
];

const adventurePicks = [
  {
    label: 'Best glacial lake hike',
    productCode: '25721P13',
    titleMatch: 'Humantay Lake Full Day Hike',
    fallbackTitle: 'Humantay Lake Full Day Hike',
    bestFor: 'Fit hikers who want turquoise Andean water',
    why: 'A short but rewarding trek to Humantay’s glacial lagoon—Salkantay on the horizon, green valley below, and one of Cusco’s most photogenic day hikes.',
  },
  {
    label: 'Best early Rainbow Mountain',
    productCode: '153304P5',
    titleMatch: 'Rainbow Mountain Beat-the-Crowd: 7 AM Departure',
    fallbackTitle: 'Rainbow Mountain Beat-the-Crowd: 7 AM Departure (Small groups)',
    bestFor: 'Bucket-list hikers who hate crowds',
    why: '7 AM departure to Vinicunca before the daily rush—mineral-streaked slopes, Ausangate views, and a local mountaineering guide who knows how to pace the altitude.',
  },
  {
    label: 'Best city rock climbing',
    productCode: '146929P5',
    titleMatch: 'Rock Climbing full day',
    fallbackTitle: 'Rock Climbing full day',
    bestFor: 'Adventurers who want a break from trekking',
    why: 'Half-day crag sessions above Cusco with certified Petzl gear, routes from beginner to advanced, and a picnic lunch between climbs—adrenaline without leaving the city for days.',
  },
];

const culturePicks = [
  {
    label: 'Best cooking class',
    productCode: '401893P3',
    titleMatch: 'Cooking Class: Lomo Saltado, Papa Huancaina & Pisco Sour in Cusco',
    fallbackTitle: 'Cooking Class: Lomo Saltado, Papa Huancaina & Pisco Sour in Cusco',
    bestFor: 'Food lovers with one free afternoon',
    why: 'Hands-on lomo saltado and papa a la Huancaína in a 1930s Cusco kitchen, Pisco Sours first, recipes to take home—Peruvian classics you can recreate after the trip.',
  },
  {
    label: 'Best Sacred Valley food day',
    productCode: '458453P1',
    titleMatch: 'Food and Culture Full day Tour in the Sacred Valley',
    fallbackTitle: 'Food and Culture Full day Tour in the Sacred Valley',
    bestFor: 'Travelers who plan trips around meals and markets',
    why: 'Urubamba market tastings, Ollantaytambo, a family lunch in the mountains, and a local dessert finish—the Sacred Valley told through street food and tradition.',
  },
  {
    label: 'Best UNESCO weaving immersion',
    productCode: '101268P6',
    titleMatch: 'Sacred Valley Textile Workshop – Dyeing & Weaving in Cusco',
    fallbackTitle: 'Sacred Valley Textile Workshop – Dyeing & Weaving in Cusco',
    bestFor: 'Culture seekers who want to create, not just watch',
    why: 'Work alongside Ruth Pimentel, Peru’s UNESCO-honored master weaver—dye yarn with ancestral plants, weave on a backstrap loom, and leave with something you made.',
  },
];

const machuPicchuPicks = [
  {
    label: 'Best private Machu Picchu day',
    productCode: '425316P2',
    titleMatch: 'Full Day Private Tour of Machu Picchu from Cusco',
    fallbackTitle: 'Full Day Private Tour of Machu Picchu from Cusco',
    bestFor: 'First-time visitors who want their own guide at the citadel',
    why: 'Private guide through the main enclosures—Guardian House, Intihuatana, Temple of the Condor—plus train scenery and the flexibility a shared group tour cannot match.',
  },
  {
    label: 'Best Sacred Valley highlights',
    productCode: '35087P1',
    titleMatch: 'Sacred Valley Full-Day Tour:Chinchero,Maras,Moray & Ollantaytambo',
    fallbackTitle: 'Sacred Valley Full-Day Tour:Chinchero,Maras,Moray & Ollantaytambo',
    bestFor: 'Day-trippers who want the valley’s greatest hits',
    why: 'Textile center in Chinchero, Moray’s circular terraces, Maras salt pools, and Ollantaytambo fortress—history, scenery, and lunch in the heart of the Sacred Valley.',
  },
  {
    label: 'Best Cusco city and ruins',
    productCode: '66100P10',
    titleMatch: 'Private Cusco City Tour with Sacsayhuaman & Inca Sites',
    fallbackTitle: 'Private Cusco City Tour with Sacsayhuaman & Inca Sites',
    bestFor: 'Arrival days and altitude acclimation',
    why: 'Plaza de Armas, Koricancha, the 12-Angled Stone, then Sacsayhuamán, Qenqo, and Cristo Blanco by private vehicle—the essential Inca capital in a flexible half day.',
  },
];

export const cuscoHubPicks = {
  destinationId: 'cusco',
  useStaticDisplay: true,
  catalogTourCount: 4242,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Cusco',
  heroDescription:
    "Cusco is the gateway to Machu Picchu, the Sacred Valley, Rainbow Mountain, and living Andean culture. With thousands of tours competing for your attention—and airport transfers clogging the default list—we've narrowed it to 15 standouts for couples, families, adventurers, culture seekers, and Machu Picchu trips.",
  headline: 'Best Cusco tours by traveler type',
  subheadline:
    'A short list to start with. All bookable Cusco tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Romance in Cusco often means intimacy and depth. These picks pair an anthropologist-led Moon Temple horseback ride for five, a private Sacred Valley ruins day with a gourmet farm picnic, and a two-day train-and-llama route to Machu Picchu without the single-day rush.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These picks balance headline sites with kid-friendly pacing: a Sacred Valley hike with alpacas, a half-day textile workshop with llamas and a bracelet to keep, and a two-day Inca Trail with a hotel night instead of camping.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'Beyond Machu Picchu, Cusco rewards hikers and climbers. These picks cover a full-day Humantay Lake trek, an early-start Rainbow Mountain run before the crowds, and a rock-climbing session on crags above the city.',
      picks: adventurePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'Cusco is as much kitchen and loom as citadel. These picks pair a hands-on lomo saltado cooking class, a Sacred Valley food-and-market full day, and a UNESCO-honored weaving workshop where you dye yarn and weave your own textile.',
      picks: culturePicks,
    },
    {
      id: 'machu-picchu',
      title: 'For Machu Picchu & Sacred Valley',
      description:
        'Most travelers come for the icons. These picks cover a private full-day Machu Picchu run from Cusco, a Sacred Valley loop through Moray, Maras, and Ollantaytambo, and a private city tour with Sacsayhuamán for your first acclimation day.',
      picks: machuPicchuPicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best budget culture experience',
      text: 'Lomo Saltado cooking class — Pisco Sour, Peruvian classics, and recipes to take home from about $50.',
      productCode: '401893P3',
      titleMatch: 'Cooking Class: Lomo Saltado',
    },
    {
      label: 'Best unique half-day tour',
      text: 'Anthropologist-led Moon Temple horseback — max five guests, sacred Inka sites, and Andean cosmovision.',
      productCode: '333328P1',
      titleMatch: 'Anthropologist-Led Horseback',
    },
    {
      label: 'Best private Machu Picchu day',
      text: 'Full Day Private Tour of Machu Picchu — your own guide at the citadel with train transfers from Cusco.',
      productCode: '425316P2',
      titleMatch: 'Full Day Private Tour of Machu Picchu',
    },
  ],
};
