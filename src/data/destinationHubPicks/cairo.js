/** Editorial hub picks for Cairo — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best pyramid photoshoot tour',
    productCode: '424652P1',
    titleMatch: 'Pyramids of Giza tour with a professional photoshoot',
    fallbackTitle: 'Pyramids of Giza tour with a professional photoshoot +(Editing)',
    bestFor: 'Couples who want edited photos, not just phone snaps',
    why: 'Private Egyptologist tour with a Sony A7RV shoot at every angle—camel ride optional, images edited to perfection so you leave with share-worthy memories of the plateau.',
  },
  {
    label: 'Best GEM and pyramids day',
    productCode: '46130P11',
    titleMatch: 'Private Journey :Grand Egyptian Museum & Giza Pyramids',
    fallbackTitle: 'Private Journey :Grand Egyptian Museum & Giza Pyramids',
    bestFor: 'Culture-loving couples with one well-planned day',
    why: 'The world’s largest archaeological museum paired with the Giza Plateau—private transport and a paced itinerary through Tutankhamun treasures and the Sphinx at your rhythm.',
  },
  {
    label: 'Best photo adventure tour',
    productCode: '442172P7',
    titleMatch: 'Giza Pyramids Photo Tour with Jumping Horse, Camel & Local Crafts',
    fallbackTitle: 'Giza Pyramids Photo Tour with Jumping Horse, Camel & Local Crafts',
    bestFor: 'Travelers who want dramatic desert shots',
    why: 'Licensed local guide, Panorama Point camel ride, timed photo stops with a pro photographer, and papyrus craft insight—flexible pacing without a rushed bus schedule.',
  },
];

const familiesPicks = [
  {
    label: 'Best camel ride pyramids tour',
    productCode: '5508780P3',
    titleMatch: 'Private Tour of Giza Pyramids with Camel Ride and Pyramid Access',
    fallbackTitle: 'Private Tour of Giza Pyramids with Camel Ride and Pyramid Access',
    bestFor: 'Families who want the classic Giza experience bundled',
    why: 'Wi-Fi van pickup, Egyptologist stories, camel photos at the plateau, papyrus museum stop, and lunch included—no hidden fees on the essentials kids remember.',
  },
  {
    label: 'Best half-day camel safari',
    productCode: '386581P3',
    titleMatch: 'Half Day Adventure Pyramids Sphinx and Camel Safari',
    fallbackTitle: 'Half Day Adventure Pyramids Sphinx and Camel Safari',
    bestFor: 'Kids who want desert fun with the monuments',
    why: 'Great Pyramid, Sphinx, and a Sahara camel safari with panorama photo stops—half a day that hits the icons without an exhausting full-day slog.',
  },
  {
    label: 'Best pyramid ATV thrill',
    productCode: '430271P1',
    titleMatch: 'Private 1-Hour ATV Experience in Cairo, Egypt',
    fallbackTitle: 'Private 1-Hour ATV Experience in Cairo, Egypt',
    bestFor: 'Teens who need more than another museum hall',
    why: 'One hour racing dunes with the pyramids on the horizon—short, high-energy, and private so your group sets the pace near Giza.',
  },
];

const adventurePicks = [
  {
    label: 'Best Siwa oasis escape',
    productCode: '5565544P1',
    titleMatch: 'Siwa Oasis All Inclusive 3 Days & 2 Nights Tour From Cairo&Giza',
    fallbackTitle: 'Siwa Oasis All Inclusive 3 Days & 2 Nights Tour From Cairo&Giza',
    bestFor: 'Travelers who want desert beyond the pyramids',
    why: 'Private vehicle from Cairo to Siwa—4WD in the Great Sand Sea, sandboarding, salt lakes, Fatnis Island, and ancient ruins far from the capital’s traffic.',
  },
  {
    label: 'Best Giza and Saqqara deep dive',
    productCode: '18966P5',
    titleMatch: '8-Hour Private Tour to the Pyramids of Giza and Saqqara from Cairo',
    fallbackTitle: '8-Hour Private Tour to the Pyramids of Giza and Saqqara from Cairo',
    bestFor: 'History buffs who want Djoser and Pyramid Texts',
    why: 'Giza trio plus Saqqara’s Step Pyramid, King Teti’s interior with Pyramid Texts, and ancient tombs—eight hours with a qualified Egyptologist, not a shopping stop.',
  },
  {
    label: 'Best Saqqara and Dahshur day',
    productCode: '375833P1',
    titleMatch: 'private tour Saqara+Dahshur in detail, no time waste in shopping',
    fallbackTitle: 'private tour Saqara+Dahshur in detail, no time waste in shopping',
    bestFor: 'Travelers who hate bazaar detours',
    why: 'Licensed guide, no shopping traps, lunch on a local farm with date harvesting—Saqqara and Dahshur in depth with profit supporting stray animals in Egypt.',
  },
];

const culturePicks = [
  {
    label: 'Best street food with locals',
    productCode: '147895P4',
    titleMatch: 'Cairo Street Food with a Local Family',
    fallbackTitle: 'Cairo Street Food with a Local Family',
    bestFor: 'Food lovers who want home cooking, not hotel buffets',
    why: 'Five-plus stops from Downtown to local koshary and taameya—grandmother-style dishes in two neighborhoods with leftovers shared with those in need.',
  },
  {
    label: 'Best Old Cairo highlights',
    productCode: '55015P13',
    titleMatch: 'Cairo Sightseeing Highlights Tour Visiting Egyptian Museum Citade',
    fallbackTitle: 'Cairo Sightseeing Highlights Tour Visiting Egyptian Museum Citadel with Mohamed Ali Mosque and khan khalili Bazaar',
    bestFor: 'First full day beyond the pyramids',
    why: 'Egyptian Museum treasures, Saladin Citadel and Mohamed Ali Mosque, then Khan el-Khalili souk—Cairo’s museum-to-minaret-to-market arc in one guided day.',
  },
  {
    label: 'Best Khan el-Khalili shopping walk',
    productCode: '319706P12',
    titleMatch: 'Guided Shopping Tour in Cairo And Khan Al-Khalili Market',
    fallbackTitle: 'Guided Shopping Tour in Cairo And Khan Al-Khalili Market',
    bestFor: 'Souvenir hunters who want a local negotiator',
    why: 'Handmade papyrus demo, Egyptian cotton stop, and a guided wander through Khan el-Khalili—buy spices and crafts without the hassle of solo haggling.',
  },
];

const pyramidsPicks = [
  {
    label: 'Best VIP pyramids and GEM',
    productCode: '5601916P10',
    titleMatch: 'Private VIP Tour : Giza Pyramids, Sphinx & Grand Egyptian Museum',
    fallbackTitle: 'Private VIP Tour : Giza Pyramids, Sphinx & Grand Egyptian Museum',
    bestFor: 'First-time visitors who want the new museum and pyramids together',
    why: 'Private Egyptologist, comfortable transport, local lunch, and unhurried time at Giza plus the Grand Egyptian Museum—no crowds, no rushing, all entry handled.',
  },
  {
    label: 'Best Memphis and Saqqara loop',
    productCode: '10124P15',
    titleMatch: 'Private Tour: Pyramids of Giza Memphis Saqqara with Lunch',
    fallbackTitle: 'Private Tour: Pyramids of Giza Memphis Saqqara with Lunch',
    bestFor: 'Ancient Egypt completists in one day',
    why: 'Giza Pyramids and Sphinx, then Memphis open-air museum and Saqqara Step Pyramid—hotel pickup, drop-off, and lunch at a local restaurant included.',
  },
  {
    label: 'Best all-tickets GEM day',
    productCode: '426848P20',
    titleMatch: 'Private Tour to GEM and Giza Pyramids includes all entry tickets',
    fallbackTitle: 'Private Tour to GEM and Giza Pyramids includes all entry tickets',
    bestFor: 'Travelers tired of hidden pyramid fees',
    why: 'All entry tickets included upfront—Giza, Sphinx, and the Grand Egyptian Museum with Tutankhamun’s full collection, led by a licensed Egyptologist with no surprise add-ons.',
  },
];

export const cairoHubPicks = {
  destinationId: 'cairo',
  useStaticDisplay: true,
  catalogTourCount: 10205,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Cairo',
  heroDescription:
    "Cairo is the Pyramids of Giza, the Grand Egyptian Museum, Khan el-Khalili, and street food in two neighborhoods. With over 10,000 tours competing for your attention—and airport transfers clogging the default list—we've narrowed it to 15 standouts for couples, families, adventurers, culture seekers, and pyramid day trips.",
  headline: 'Best Cairo tours by traveler type',
  subheadline:
    'A short list to start with. All bookable Cairo tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Romance in Cairo often means golden-hour pyramids and edited photos. These picks pair a professional photoshoot tour with edited images, a private GEM-and-Giza day, and a photo adventure with camel ride and Panorama Point stops.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These picks balance icon sights and kid-friendly thrills: a private Giza tour with camel ride and lunch, a half-day camel safari at the Sphinx, and a one-hour ATV dash with the pyramids on the horizon.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'Beyond the plateau, Egypt rewards desert detours. These picks cover a three-day Siwa Oasis escape with sandboarding, an eight-hour Giza-and-Saqqara deep dive, and a Saqqara-Dahshur day with farm lunch and no bazaar traps.',
      picks: adventurePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'Cairo is koshary, citadels, and souks. These picks pair a street-food walk with a local family, a museum-to-mosque-to-bazaar highlights day, and a guided Khan el-Khalili shopping tour with papyrus and cotton stops.',
      picks: culturePicks,
    },
    {
      id: 'pyramids',
      title: 'For pyramids & ancient Egypt',
      description:
        'Most travelers come for the wonders. These picks cover a VIP private day at Giza and the Grand Egyptian Museum, a Giza-Memphis-Saqqara loop with lunch, and an all-tickets-included GEM and pyramid run with no hidden fees.',
      picks: pyramidsPicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best budget food experience',
      text: 'Cairo street food with a local family — five-plus stops across two neighborhoods from about $43.',
      productCode: '147895P4',
      titleMatch: 'Cairo Street Food with a Local Family',
    },
    {
      label: 'Best all-in pyramids day',
      text: 'Private VIP Giza, Sphinx, and Grand Egyptian Museum — Egyptologist, lunch, and no rushing.',
      productCode: '5601916P10',
      titleMatch: 'Private VIP Tour : Giza Pyramids, Sphinx & Grand Egyptian Museum',
    },
    {
      label: 'Best no-surprise-fees tour',
      text: 'GEM and Giza with all entry tickets included — Tutankhamun galleries and the plateau in one honest price.',
      productCode: '426848P20',
      titleMatch: 'Private Tour to GEM and Giza Pyramids includes all entry',
    },
  ],
};
