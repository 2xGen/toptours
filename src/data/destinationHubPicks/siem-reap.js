/** Editorial hub picks for Siem Reap — matched to live tours by product code + title. */

const couplesPicks = [
  {
    label: 'Best twilight bike and gondola tour',
    productCode: '53356P7',
    titleMatch: 'Angkor Bike & Gondola Ride at Twilight',
    fallbackTitle: 'Angkor Bike & Gondola Ride at Twilight',
    bestFor: 'Couples who want temples at golden hour, not dawn crowds',
    why: 'Cycle Angkor Thom and jungle trails at dusk, then a tranquil dragon-boat ride on the moat with local snacks and cold drinks as the sun sets over the stones.',
  },
  {
    label: 'Best floating village sunset jeep',
    productCode: '111383P10',
    titleMatch: 'Siem Reap Floating Village Sunset Jeep Tour',
    fallbackTitle: 'Siem Reap Floating Village Sunset Jeep Tour / SUV Car Available',
    bestFor: 'Romantic travelers beyond the temple circuit',
    why: 'Open-air jeep through red-dirt countryside to Tonle Sap’s UNESCO biosphere reserve—private boat cruise, local delicacies, and sunset on Southeast Asia’s largest freshwater lake.',
  },
  {
    label: 'Best vintage jeep temple tour',
    productCode: '87436P7',
    titleMatch: 'Angkor Wat by Vintage Jeep – Private Tour',
    fallbackTitle: 'Angkor Wat by Vintage Jeep – Private Tour',
    bestFor: 'Pairs who want style and unhurried temple time',
    why: 'Private vintage Jeep to Angkor Wat, Angkor Thom, and Ta Prohm—with a quiet stop at jungle-hidden Ta Nei, away from the bus convoys and rigid group schedules.',
  },
];

const familiesPicks = [
  {
    label: 'Best morning bike and market tour',
    productCode: '406636P3',
    titleMatch: 'Siem Reap: Morning Bike Tours with Local Market & Lunch',
    fallbackTitle: 'Siem Reap: Morning Bike Tours with Local Market & Lunch',
    bestFor: 'Families who want culture and food from about $21',
    why: 'Local market tastings, a monk blessing at a Buddhist temple, a gentle countryside ride through Khmer villages, and a home-style lunch—kid-friendly pacing with real local contact.',
  },
  {
    label: 'Best budget Angkor sunrise tour',
    productCode: '152500P2',
    titleMatch: 'Classic Angkor Wat Sunrise or Sunset Private or Small GroupTour',
    fallbackTitle: 'Classic Angkor Wat Sunrise or Sunset Private or Small GroupTour',
    bestFor: 'First-timers who need the icons without a big spend',
    why: 'Angkor Wat, Ta Prohm, Ta Nei, and Bayon with hotel pickup, cold water, and towels—from about $16 in a well-paced small group or private option.',
  },
  {
    label: 'Best Tonle Sap village boat tour',
    productCode: '31721P20',
    titleMatch: 'Tonle Sap Lake - Fishing Village & Flooded Forest',
    fallbackTitle: 'Tonle Sap Lake - Fishing Village & Flooded Forest',
    bestFor: 'Kids curious about life on the water',
    why: 'Boat cruise through fishing villages and a flooded forest on the world’s second-largest freshwater lake—a half-day glimpse of Cambodian countryside life beyond the temples.',
  },
];

const adventurePicks = [
  {
    label: 'Best sunrise cycling expedition',
    productCode: '31721P29',
    titleMatch: 'Angkor Sunrise Expedition Cycling Through Serene Backroads',
    fallbackTitle: 'Angkor Sunrise Expedition Cycling Through Serene Backroads',
    bestFor: 'Active travelers who want sunrise plus backroads',
    why: 'Sunrise at Angkor Wat, then 15–25 km of easy cycling on serene paths through lesser-known corners of the park—breakfast included after the dawn moment.',
  },
  {
    label: 'Best remote temples day trip',
    productCode: '118579P23',
    titleMatch: 'Full Day Banteay Srei Beng Mealea and Koh Ker Small Group Tour',
    fallbackTitle: 'Full Day Banteay Srei Beng Mealea and Koh Ker Small Group Tour',
    bestFor: 'Temple completists ready for a long day out',
    why: 'Banteay Srei’s pink sandstone carvings, jungle-clad Beng Mealea, and the remote Koh Ker complex—small-group day trip to sites most one-day tours skip.',
  },
  {
    label: 'Best Kulen waterfall day',
    productCode: '239308P14',
    titleMatch: 'Phnom Kulen Waterfall and Banteay Srei Temple Tour from Siem Reap',
    fallbackTitle: 'Phnom Kulen Waterfall and Banteay Srei Temple Tour from Siem Reap',
    bestFor: 'Travelers who want swim breaks between ruins',
    why: 'Kulen Mountain’s Big Buddha, cliff viewpoints, a swim at the waterfall, the sacred 1000 Linga River, and Banteay Srei—nature and temples in one refreshing day.',
  },
];

const culturePicks = [
  {
    label: 'Best Khmer cooking class',
    productCode: '459264P1',
    titleMatch: 'Khmer Cooking Class in Cambodia',
    fallbackTitle: 'Khmer Cooking Class in Cambodia',
    bestFor: 'Food lovers who want hands-on Khmer recipes',
    why: 'Interactive class with a friendly chef—step-by-step instructions to prepare favourite Cambodian dishes, then eat what you cook in a fun, small-group setting.',
  },
  {
    label: 'Best countryside jeep discovery',
    productCode: '111383P7',
    titleMatch: 'Siem Reap Countryside Jeep Tour / SUV Car Available',
    fallbackTitle: 'Siem Reap Countryside Jeep Tour / SUV Car Available',
    bestFor: 'Culture seekers who want rural life, not just ruins',
    why: 'Landmine museum context, then red-dirt roads to villages making Khmer noodles, bamboo rice cakes, and handicrafts—authentic countryside half-day beyond Pub Street.',
  },
  {
    label: 'Best Apsara dinner show',
    productCode: '362441P1',
    titleMatch: 'Apsara Theatre Performance include Dinner & hotel pick up',
    fallbackTitle: 'Apsara Theatre Performance include Dinner & hotel pick up',
    bestFor: 'An easy cultural evening after temple days',
    why: 'International buffet dinner with a one-and-a-half-hour Apsara dance performance—hotel tuk-tuk pickup included for a classic Khmer cultural night out from about $29.',
  },
];

const angkorPicks = [
  {
    label: 'Best budget private sunrise tour',
    productCode: '107360P2',
    titleMatch: 'Private Angkor Sunrise Guided Tour',
    fallbackTitle: 'Private Angkor Sunrise Guided Tour',
    bestFor: 'Value-focused travelers who still want a private guide',
    why: 'Sunrise at Angkor Wat with a professional English-speaking guide in air-conditioned comfort—optional Khmer breakfast, lunch, or Apsara show add-ons if you want to upgrade.',
  },
  {
    label: 'Best vespa sunrise adventure',
    productCode: '137038P12',
    titleMatch: 'Angkor Sunrise Vespa Tour / Tuk Tuk or Car',
    fallbackTitle: 'Angkor Sunrise Vespa Tour / Tuk Tuk or Car',
    bestFor: 'Travelers who want sunrise with backroad buzz',
    why: 'Dawn at Angkor Wat, then Vespa runs through jungle trails to iconic and lesser-known temples—with local food stops and stories woven through the day from about $31.',
  },
  {
    label: 'Best sunrise and Banteay Srei day',
    productCode: '488810P1',
    titleMatch: 'Full Day Angkor Wat Sunrise and Banteay Srei Tour',
    fallbackTitle: 'Full Day Angkor Wat Sunrise and Banteay Srei Tour',
    bestFor: 'One-day visitors who want Angkor Wat plus the Lady Temple',
    why: 'Early start for sunrise at Angkor Wat, temple complex carvings, then Banteay Srei’s pink sandstone and a Preah Dak village lunch—back to Siem Reap by mid-afternoon.',
  },
];

export const siemReapHubPicks = {
  destinationId: 'siem-reap',
  useStaticDisplay: true,
  catalogTourCount: 2433,
  heroEyebrow: 'Curated by travel style',
  heroTitle: 'Best tours in Siem Reap',
  heroDescription:
    "Siem Reap is Angkor Wat at sunrise, Ta Prohm’s jungle roots, Tonle Sap floating villages, and Khmer food beyond Pub Street. With 2,400+ tours on Viator and airport transfers clogging the default sort, we've narrowed it to 15 standouts for couples, families, adventurers, culture seekers, and Angkor temple days.",
  headline: 'Best Siem Reap tours by traveler type',
  subheadline:
    'A short list to start with. All bookable Siem Reap tours are still one click away under Tours.',
  showMoreTours: false,
  travelerSections: [
    {
      id: 'couples',
      title: 'For couples',
      description:
        'Romance in Siem Reap often means golden light on ancient stone. These picks pair a twilight bike-and-gondola ride, a floating-village sunset jeep on Tonle Sap, and a private vintage Jeep run through Angkor’s highlights.',
      picks: couplesPicks,
    },
    {
      id: 'families',
      title: 'For families',
      description:
        'These picks balance gentle activity and icon sights: a morning market bike tour with monk blessing and lunch, a classic Angkor sunrise from about $16, and a Tonle Sap fishing-village boat cruise.',
      picks: familiesPicks,
    },
    {
      id: 'adventure',
      title: 'For adventure',
      description:
        'Beyond the small circuit, Cambodia rewards bold days out. These picks cover sunrise cycling on backroads, a remote Banteay Srei–Beng Mealea–Koh Ker run, and a Kulen Mountain waterfall swim day.',
      picks: adventurePicks,
    },
    {
      id: 'culture',
      title: 'For culture & food',
      description:
        'Siem Reap is noodles, Apsara dance, and village life. These picks pair a Khmer cooking class, a countryside jeep through noodle-makers and handicrafts, and an Apsara dinner show with hotel pickup.',
      picks: culturePicks,
    },
    {
      id: 'angkor',
      title: 'For Angkor temple days',
      description:
        'Most visitors come for the temples. These picks cover a budget private sunrise tour, a Vespa sunrise adventure through the park, and a full day pairing Angkor Wat dawn with Banteay Srei’s carvings.',
      picks: angkorPicks,
    },
  ],
  quickAnswers: [
    {
      label: 'Best budget temple day',
      text: 'Classic Angkor sunrise or sunset tour — major temples from about $16 with pickup.',
      productCode: '152500P2',
      titleMatch: 'Classic Angkor Wat Sunrise or Sunset',
    },
    {
      label: 'Best value private sunrise',
      text: 'Private Angkor sunrise guided tour — professional guide and A/C vehicle from about $30.',
      productCode: '107360P2',
      titleMatch: 'Private Angkor Sunrise Guided Tour',
    },
    {
      label: 'Best quick cultural evening',
      text: 'Apsara theatre with dinner — dance performance and buffet from about $29.',
      productCode: '362441P1',
      titleMatch: 'Apsara Theatre Performance include Dinner',
    },
  ],
};
