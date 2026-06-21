/**
 * Editorial guide: Siem Reap hidden costs & additional fees (practical budget guide).
 */

import {
  getSiemReapAirportTransfersTopPick,
  getSiemReapAirportTransfersBestThree,
} from './siemReapAirportTransfers';
import {
  getSiemReapAngkorWatToursTopPick,
  getSiemReapAngkorWatOptionsThree,
} from './siemReapAngkorWatTours';

export const SIEM_REAP_ADDITIONAL_FEES_SLUG = 'additional-fees';

function viatorImage(path, w = 800, h = 600) {
  return `https://dynamic-media.tacdn.com/media/photo-o/${path}/caption.jpg?w=${w}&h=${h}&s=1`;
}

export function getSiemReapAdditionalFeesListingMeta() {
  return {
    category_slug: SIEM_REAP_ADDITIONAL_FEES_SLUG,
    category_name: 'Additional Fees',
    title: 'Siem Reap Hidden Costs: What to Budget for Angkor Wat (2026 Guide)',
    subtitle:
      'Angkor Wat tours rarely include everything. Here is what you will actually pay — park passes, tipping, lunch, and hidden extras that catch most first-time visitors.',
    hero_image: viatorImage('32/87/87/a3', 720, 480),
  };
}

export function getSiemReapAdditionalFeesFeaturedTours() {
  return {
    airportTransfers: {
      title: 'Book your SAI airport transfer',
      description:
        'Separate from temple fees — budget for getting from Siem Reap Angkor International Airport (SAI) to your hotel before your Angkor day.',
      guideHref: '/destinations/siem-reap/guides/airport-transfers',
      guideLabel: 'Full airport transfers guide',
      tours: [getSiemReapAirportTransfersTopPick(), getSiemReapAirportTransfersBestThree()[0]],
    },
    angkorTours: {
      title: 'Book your Angkor Wat tour',
      description:
        'Tour prices below do not include the Angkor Pass — add $37–$72 per person plus tips and lunch when you budget.',
      guideHref: '/destinations/siem-reap/guides/shore-excursions',
      guideLabel: 'Full Angkor Wat tours guide',
      tours: [getSiemReapAngkorWatToursTopPick(), getSiemReapAngkorWatOptionsThree()[0]],
    },
  };
}

export function getSiemReapAdditionalFeesGuideData() {
  const listing = getSiemReapAdditionalFeesListingMeta();

  return {
    guideLayout: 'siem-reap-additional-fees',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Additional fees',
    heroImage: listing.hero_image,
    heroTagline: 'Angkor Pass: $37–$72 · Typical tip: $5–$10/day · Camera fee: $0',
    schemaDatePublished: '2026-06-10',
    schemaDateModified: '2026-06-10',
    hideWhatToExpect: true,
    hideExpertTips: true,
    whyChoose: [],
    tourTypes: [],
    introduction: '',
    stats: {},

    featuredTourSections: getSiemReapAdditionalFeesFeaturedTours(),

    quickAnswer: {
      title: 'Quick answer: what is not included in your tour price?',
      intro:
        'Most Angkor Wat tours include transport, a guide, and sometimes water. They do not include the items below — plan $50–$100 per person beyond the tour price.',
      headers: ['Fee type', 'Cost', 'Notes'],
      rows: [
        ['Angkor Pass (mandatory)', '$37 (1-day) / $62 (3-day) / $72 (7-day)', 'Purchased separately at the ticket office'],
        ['Tipping guide', '$5–$10/day per group', 'Expected, not required. Cash only.'],
        ['Tipping driver', '$3–$5/day per group', 'Separate from the guide tip'],
        ['Lunch', '$5–$15 per person', 'Some tours include lunch — check your booking'],
        ['Drinks & snacks', '$1–$5 each', 'Cold water is essential in the heat'],
        ['In-temple guide at Angkor Wat', '$15–$30', 'Not included in most tours — optional hire inside'],
        ['Souvenirs', '$1–$50+', 'Bargaining is expected'],
      ],
      footnote: 'Total extra budget: plan for $50–$100 per person beyond your tour price.',
    },

    angkorPass: {
      title: 'The Angkor Pass: complete breakdown',
      intro:
        'The Angkor Pass is the single biggest hidden cost most first-time visitors miss. It is not included in your tour price and must be purchased before entering the archaeological park.',
      headers: ['Pass type', 'Price (2026)', 'Best for'],
      rows: [
        ['1-Day Pass', '$37', 'First-time visitors doing the small circuit'],
        ['3-Day Pass', '$62', 'Temple enthusiasts and photographers'],
        ['7-Day Pass', '$72', 'Slow travelers and remote-site visitors'],
      ],
      notes: [
        'Buy at the official ticket office on the way to Angkor Wat — there is no other way to enter.',
        'Cash is faster. Cards are accepted but lines move slower.',
        'Bring your passport — a photo is taken on site and printed on the pass.',
        'The 3-day pass is valid for 10 consecutive days, not three calendar days in a row only.',
      ],
    },

    tipping: {
      title: 'What to tip in Siem Reap: guide & driver etiquette',
      intro:
        'Tipping is not required, but it is expected for good service. Guides and drivers often rely on tips as part of their income.',
      headers: ['Role', 'Amount (per day)', 'When to pay'],
      rows: [
        ['Tour guide', '$5–$10 per group', 'At the end of the day'],
        ['Driver', '$3–$5 per group', 'At the end of the day'],
        ['Tuk-tuk driver', '$2–$5 per ride', 'At the end of the ride'],
        ['Restaurant server', '5–10% (optional)', 'Round up the bill — not mandatory'],
      ],
      notes: [
        'Tip more ($10–$15/day) for guides who add extra stops, deep context, or special access.',
        'Cash only. USD is widely accepted — keep $1, $5, and $10 bills.',
      ],
    },

    otherCosts: {
      title: 'Other hidden costs to budget for',
      headers: ['Expense', 'Typical cost', 'When it applies'],
      rows: [
        ['Lunch', '$5–$15', 'Most tours stop at a restaurant — not always included'],
        ['Cold water', '$1–$2 per bottle', 'Bring a refillable bottle to save money'],
        ['Snacks', '$1–$5', 'Coconut water, fruit, or local snacks'],
        ['Toilet fees', '$0.50–$1', 'Many temple toilets charge a small fee'],
        ['Parking (motorbike/bicycle)', '$1–$2', 'If you self-drive to the park'],
        ['Camera fee', '$0', 'No extra charge for photos at Angkor (drones prohibited)'],
      ],
    },

    entryCosts: {
      title: "Cambodia's visa & entry costs (separate from Angkor Pass)",
      intro:
        'Do not confuse the Angkor Pass with country entry requirements. The pass is for temples only.',
      headers: ['Cost', 'Amount', 'Notes'],
      rows: [
        ['Cambodian tourist visa', '$30–$40 (e-visa) / ~$30 on arrival', 'Required for most nationalities'],
        ['Cambodia e-Arrival (ED) card', 'Free', 'Online registration required before arrival'],
        ['Travel insurance', '~$2/day', 'Not mandatory — strongly recommended'],
      ],
    },

    avoidSurprises: {
      title: 'How to avoid fee surprises in Siem Reap',
      headers: ['Tip', 'Why it matters'],
      rows: [
        ['Ask your guide what is included', 'Confirm lunch, water, and tips before the tour starts'],
        ['Buy the Angkor Pass before the gates', 'You cannot enter without it — your tour will stop at the ticket office'],
        ['Bring small USD bills', '$1, $5, and $10 bills for tips, snacks, and toilets'],
        ['Pack a refillable water bottle', 'Save $5–$10 per day on bottled water'],
        ['Confirm hotel pickup', 'Some tours charge extra for pickup outside central Siem Reap'],
        ['Decline commission stops if you want', 'Some tours visit shops — you are not obliged to buy'],
      ],
    },

    dayExample: {
      title: 'Real cost example: one day at Angkor Wat',
      headers: ['Item', 'Cost (per person)'],
      rows: [
        ['Tour (small-group circuit)', '$42'],
        ['Angkor Pass (1-day)', '$37'],
        ['Tip for guide', '$7'],
        ['Tip for driver', '$4'],
        ['Lunch', '$10'],
        ['Water & snacks', '$5'],
        ['Total for one day', '$105'],
      ],
      paragraphs: [
        'Without planning: you might budget $42 for the tour and be surprised by the $37 pass, $11 in tips, and $15 for food.',
        'With planning: you know the total is about $105 and can budget accordingly.',
      ],
    },

    faqs: [
      {
        question: 'Is the Angkor Pass included in my tour price?',
        answer:
          'Usually no. Most tours explicitly exclude the Angkor Pass. Check your booking confirmation — if the pass is not listed, assume you need to buy it separately at the ticket office.',
      },
      {
        question: 'How much is the Angkor Pass in 2026?',
        answer:
          '$37 for a 1-day pass, $62 for a 3-day pass, and $72 for a 7-day pass. Prices can change — verify on the official Angkor Enterprise site before your trip.',
      },
      {
        question: 'Can I buy the Angkor Pass online?',
        answer:
          'You can pre-purchase through the official Angkor Enterprise website, but most visitors buy at the ticket office on the way to the temples. The office opens from 5 AM for sunrise visitors.',
      },
      {
        question: 'Do I need to tip in Siem Reap?',
        answer:
          'Tipping is not mandatory but is appreciated. $5–$10 per day for a guide and $3–$5 for a driver is standard for a full temple day.',
      },
      {
        question: 'Can I use USD in Siem Reap?',
        answer:
          'Yes. USD is widely accepted. Small bills ($1, $5, $10) are essential for tips, snacks, and toilet fees. Cambodian Riel is used for small change.',
      },
      {
        question: 'Are credit cards accepted for the Angkor Pass?',
        answer:
          'Yes, but cash is faster. The ticket office accepts major cards but the queue moves more slowly than the cash line.',
      },
      {
        question: 'Is there a camera fee at Angkor Wat?',
        answer:
          'No. Photography is free inside the park. Drone use is prohibited.',
      },
      {
        question: 'Are there any other hidden costs I should know about?',
        answer:
          'Some tours stop at restaurants or shops that charge a premium. Budget $5–$15 for lunch. Temple toilets may charge $0.50–$1. Optional in-temple guides inside Angkor Wat cost $15–$30.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Angkor Wat sunrise complete guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
      },
      {
        label: 'Siem Reap airport transfers',
        href: '/destinations/siem-reap/guides/airport-transfers',
      },
      {
        label: 'Siem Reap travel insurance',
        href: '/destinations/siem-reap/travel-insurance',
      },
      {
        label: 'Best Angkor Wat tours (shore excursions)',
        href: '/destinations/siem-reap/guides/shore-excursions',
      },
      {
        label: 'Siem Reap food & drink experiences',
        href: '/destinations/siem-reap/guides/food-drink-experiences',
      },
      {
        label: 'All Siem Reap travel guides',
        href: '/destinations/siem-reap/guides',
      },
    ],

    seo: {
      title: 'Siem Reap Hidden Costs & Angkor Pass Fees (2026 Budget Guide) | TopTours',
      description:
        'What Angkor Wat tours do not include: Angkor Pass ($37–$72), tipping ($5–$10/day), lunch, and hidden extras. Real 2026 prices and a sample $105/day budget for Siem Reap.',
      keywords:
        'Angkor Wat ticket price, Angkor pass cost 2026, Siem Reap budget, tipping Cambodia, Angkor Wat hidden costs',
    },
  };
}
