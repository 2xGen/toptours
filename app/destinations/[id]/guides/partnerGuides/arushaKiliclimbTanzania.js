/**
 * Featured partner guide: Kiliclimb Africa Safaris (Tanzania / Arusha hub).
 * Copy is original; not a verbatim lift from third-party sites.
 */

export const ARUSHA_KILICLIMB_GUIDE_SLUG = 'tanzania-safaris-kiliclimb';

const HERO =
  'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/15/16/89/3a.jpg';

/** @returns {{ category_slug: string, category_name: string, title: string, subtitle: string, hero_image: string }} */
export function getArushaKiliclimbListingMeta() {
  return {
    category_slug: ARUSHA_KILICLIMB_GUIDE_SLUG,
    category_name: 'Tanzania Safaris — Kiliclimb',
    title: 'Tanzania Safaris & Kilimanjaro with Kiliclimb Africa Safaris',
    subtitle:
      'Plan northern-circuit wildlife trips, mountain days, and coastal add-ons with a locally rooted team that focuses on clear communication and well-run logistics.',
    hero_image: HERO,
  };
}

/**
 * Hand-picked experiences (TopTours + Viator) shown as hero-style cards on the guide.
 * Internal paths use the same slug rules as tour detail pages.
 */
export function getKiliclimbPartnerShowcaseTours() {
  return [
    {
      productId: '447435P2',
      title: '4 Days Tarangire, Serengeti & Ngorongoro Crater',
      tagLabel: '4WD Tours · Arusha',
      imageUrl:
        'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/15/16/44/af.jpg',
      durationHours: 96,
      priceFrom: 930,
      rating: 5,
      reviewCount: 30,
      viatorBookingUrl:
        'https://www.viator.com/tours/Arusha/4-Days-Tarangire-Serengeti-Ngorongoro-Crater/d5593-447435P2?mcid=42383&pid=P00276441&medium=api&api_version=2.0',
    },
    {
      productId: '447435P26',
      title: '6 Day Private Camping Safari in Tanzania from Kilimanjaro Airport',
      tagLabel: 'Wildlife · Moshi',
      imageUrl:
        'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/r/32/8c/0a/06/caption.jpg',
      durationHours: 144,
      priceFrom: 2400,
      rating: 5,
      reviewCount: 30,
      viatorBookingUrl:
        'https://www.viator.com/tours/Moshi/6-day-Private-Camping-Safari-in-Tanzania-from-Kilimanjaro-Airport/d24103-447435P26?mcid=42383&pid=P00276441&medium=api&api_version=2.0',
    },
    {
      productId: '447435P24',
      title: 'Lake Manyara National Park Full-Day Tour from Arusha',
      tagLabel: '4WD Tours · Arusha',
      imageUrl: HERO,
      durationHours: 8,
      priceFrom: 280,
      rating: 5,
      reviewCount: 12,
      viatorBookingUrl:
        'https://www.viator.com/tours/Arusha/Lake-Manyara-National-Park-Full-Day-Tour-from-Arusha/d5593-447435P24?mcid=42383&pid=P00276441&medium=api&api_version=2.0',
    },
    {
      productId: '447435P23',
      title: 'Shira Route Kilimanjaro Day Trip via Lemosho Route',
      tagLabel: '4WD Tours · Arusha',
      imageUrl:
        'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/15/b7/8a/36.jpg',
      durationHours: 10,
      priceFrom: 435,
      rating: 5,
      reviewCount: 1,
      viatorBookingUrl:
        'https://www.viator.com/tours/Arusha/Shira-route-Kilimanjaro-Day-Trip-via-Lemosho-route/d5593-447435P23?mcid=42383&pid=P00276441&medium=api&api_version=2.0',
    },
    {
      productId: '447435P19',
      title: 'Full-Day Safari Adventure in Tarangire National Park',
      tagLabel: '4WD Tours · Moshi',
      imageUrl:
        'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/15/b4/ba/0a.jpg',
      durationHours: 8,
      priceFrom: 250,
      rating: 5,
      reviewCount: 1,
      viatorBookingUrl:
        'https://www.viator.com/tours/Moshi/1-Full-Day-Safari-Adventure-in-Tarangire-National-Park/d24103-447435P19?mcid=42383&pid=P00276441&medium=api&api_version=2.0',
    },
  ];
}

/** Full guide payload for CategoryGuideClient / metadata */
export function getKiliclimbPartnerGuideData() {
  const listing = getArushaKiliclimbListingMeta();
  return {
    title: listing.title,
    subtitle: listing.subtitle,
    /** Display label for templates (hero, CTAs) — not “partner”; partnership is called out in copy and badges. */
    categoryName: 'Tanzania safaris',
    /** Used for /destinations/arusha/tours?search=… and on-demand tour load (avoid encoding the display category as the search). */
    toursSearchQuery: 'Tanzania safari',
    heroImage: listing.hero_image,
    partnerShowcaseTours: getKiliclimbPartnerShowcaseTours(),
    stats: {
      toursAvailable: 5,
      priceFrom: 250,
      duration: 'Day trips to multi-day circuits',
    },
    introduction: `Arusha is the natural hub for northern Tanzania: within a few hours you can be on the floor of the Ngorongoro Crater, scanning the Serengeti plains, or walking beneath rainforest on the slopes of Kilimanjaro. This guide highlights Kiliclimb Africa Safaris, a TopTours premium partner that stitches those pieces together with transparent planning and round-the-clock support.

The team focuses on clear itineraries, responsive communication, and field-ready logistics—so you spend less time worrying about transfers and more time with wildlife, landscapes, and local culture. Whether you want a compact circuit (Tarangire–Serengeti–Ngorongoro), a Kilimanjaro day on the forested Shira/Lemosho side, or a relaxed day in Lake Manyara, you get the same consultative approach: questions answered first, then options that fit your dates and budget.`,

    seo: {
      title: 'Tanzania Safaris & Kilimanjaro Tours with Kiliclimb Africa Safaris | Arusha',
      description:
        'Explore northern Tanzania with Kiliclimb Africa Safaris: wildlife circuits, Kilimanjaro day trips, and full-day parks from Arusha and Moshi. Premium TopTours partner.',
      keywords:
        'Tanzania safari, Arusha tours, Kilimanjaro day trip, Serengeti, Ngorongoro, Tarangire, Lake Manyara, Kiliclimb Africa Safaris',
    },

    whyChoose: [
      {
        icon: 'Clock',
        title: 'Support when you need it',
        description:
          'Questions about last-minute changes, flight delays, or park rules? The operations desk is set up for quick answers so small issues do not snowball into trip stress.',
      },
      {
        icon: 'Users',
        title: 'Specialists who live the routes',
        description:
          'Guides and planners spend real time on the roads and trails they sell—so recommendations reflect current road conditions, camp quality, and realistic pacing.',
      },
      {
        icon: 'MapPin',
        title: 'Logistics that stay on track',
        description:
          'From meet-and-greets to camp handovers, the focus is on dependable timing and clean handoffs between drivers, lodges, and trekking crews.',
      },
      {
        icon: 'Heart',
        title: 'Consultation over pressure',
        description:
          'Expect a conversation about what you actually want from the trip—pace, comfort level, and photography time—rather than a one-size-fits-all pitch.',
      },
    ],

    tourTypes: [
      {
        icon: 'Star',
        title: 'Northern wildlife circuits',
        description:
          'Multi-day loops that combine Tarangire, Serengeti, and Ngorongoro with camping or lodge nights tuned to your budget.',
        features: ['Big-game viewing', 'Flexible pacing', 'Park fees handled in the workflow'],
      },
      {
        icon: 'MapPin',
        title: 'Mountain & foothill days',
        description:
          'Day trips on Kilimanjaro’s forested routes and scenic drives that suit acclimatisation without committing to a full summit expedition.',
        features: ['Local guides', 'Safety-first routing', 'Clear difficulty notes'],
      },
      {
        icon: 'Camera',
        title: 'Culture & add-ons',
        description:
          'Pair wildlife time with community visits or a Zanzibar extension when you want beach recovery after dust and altitude.',
        features: ['Optional extensions', 'Beach pairing', 'Family-friendly options'],
      },
    ],

    whatToExpect: {
      title: 'What to expect when booking',
      items: [
        {
          icon: 'Clock',
          title: 'Response times',
          description:
            'You should get a clear written outline (days, inclusions, rough drive times) before you pay—not a vague “we’ll sort it there.”',
        },
        {
          icon: 'DollarSign',
          title: 'Pricing clarity',
          description:
            'Ask what is bundled (park fees, meals, camping gear) versus billed separately so the final invoice matches what you discussed.',
        },
        {
          icon: 'Users',
          title: 'Group style',
          description:
            'Private departures are common; say upfront if you prefer your own vehicle or are happy to join a small shared group.',
        },
      ],
    },

    expertTips: [
      'Book the northern circuit at least a few weeks ahead in high season—lodges inside the parks fill faster than city hotels.',
      'Carry USD in small bills for tips and incidental park payments where cards are unreliable.',
      'If you add a Kilimanjaro day trip, sleep near the gate the night before to avoid a rushed dawn drive.',
      'Download offline maps—cell service drops quickly once you leave Arusha.',
    ],

    faqs: [
      {
        question: 'Is Kiliclimb Africa Safaris a verified TopTours partner?',
        answer:
          'Yes. Linked departures show the Premium TopTours partner label so you can compare several itineraries from the same operator in one place before completing booking on our partner checkout.',
      },
      {
        question: 'Should I start in Arusha or Moshi?',
        answer:
          'Arusha works well for Lake Manyara, Tarangire, and northern-circuit staging. Moshi sits closer to Kilimanjaro airport and many camping-safari starts—pick based on your first park or flight hub.',
      },
      {
        question: 'How far in advance should I book?',
        answer:
          'For June–September and Christmas windows, aim for about four to eight weeks ahead for lodge-based trips; camping departures can be slightly more flexible but still fill up in peak season.',
      },
      {
        question: 'Are park fees included?',
        answer:
          'Inclusions vary by product—always confirm whether park entry, crater service fees, and camping equipment are in the listed price. The booking page shows the authoritative breakdown before payment.',
      },
    ],
  };
}
