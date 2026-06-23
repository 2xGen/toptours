import {
  SAFETYWING_NOMAD_INSURANCE_URL,
  SAFETYWING_NOMAD_INSURANCE_COMPLETE_URL,
} from '@/lib/safetyWingAffiliate';

export const SIEM_REAP_TRAVEL_INSURANCE = {
  destinationId: 'siem-reap',
  destinationName: 'Siem Reap',
  heroImage:
    'https://soaacpusdhyxwucjhhpy.supabase.co/storage/v1/object/public/images/travel%20insurance%20in%20aruba.jpg',
  title: 'Siem Reap Travel Insurance: What You Need to Know (2026)',
  subtitle:
    "Cambodia doesn't require travel insurance for entry, but it is strongly recommended. US health insurance may not provide coverage abroad — many visitors pay out of pocket for medical care in Cambodia unless they carry separate travel medical insurance.",
  heroBadges: ['2026 Updated', 'Hospital + Emergency Info', 'From ~$2/day'],
  quickAnswer: {
    headline: 'Quick Answer',
    points: [
      'Siem Reap travel insurance is not required for entry, but most visitors should carry separate travel medical insurance.',
      'US health plans: Medicare, Medicaid, and many employer plans often provide limited or no coverage for care in Cambodia — check your policy before you travel',
      'Hospitals: Many clinics and hospitals may require upfront payment from foreign visitors before treatment',
      'Typical cost: Travel medical insurance from about $2/day for ages 18–39 on a one-week trip',
      'Popular option: SafetyWing Nomad Insurance Essential — see exactly what\'s included',
    ],
    planningNote:
      'Planning your first trip? Pair this with our Angkor Wat Sunrise Complete Guide and Siem Reap Airport Transfers guide.',
    planningLinks: [
      {
        label: 'Angkor Wat Sunrise Complete Guide',
        href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
      },
      {
        label: 'Siem Reap Airport Transfers',
        href: '/destinations/siem-reap/guides/airport-transfers',
      },
    ],
  },
  whyItMatters: {
    title: 'Why Siem Reap Travel Insurance Matters for Visitors',
    paragraphs: [
      "Cambodia doesn't require travel insurance for entry. But here is what many visitors don't realize until they are standing at a Siem Reap clinic reception desk at midnight: US health insurance — including Medicare, Medicaid, and many employer plans — may not provide coverage abroad and is often limited or not accepted by local providers. Many hospitals may require upfront payment from foreign visitors before treatment.",
      'A motorbike scrape on the way back from Angkor Wat, a fall on the steep steps of Ta Keo, a sudden case of food poisoning from Pub Street, or a cut from a coral reef during a Tonle Sap snorkel trip can turn a dream vacation into a four-figure out-of-pocket expense overnight. In serious cases, medical evacuation to Bangkok or Singapore can in some cases exceed $50,000 to $100,000 without coverage.',
      'Siem Reap is safe. But "safe" doesn\'t mean accident-proof. That is why travel medical insurance is one of the most practical investments you can make for a Cambodia trip — and why many visitors use SafetyWing Nomad Insurance. It costs about $2 per day (less than a single meal at Pub Street) and covers eligible medical emergencies, evacuation, trip delays, and even lost luggage — subject to policy terms.',
      'Here is exactly what you need to know about travel insurance for Siem Reap in 2026.',
    ],
  },
  needInsuranceTable: {
    title: 'Do I Need Travel Insurance for Siem Reap?',
    intro: 'Technically no, but practically yes — especially if you are coming from the US without separate travel medical insurance.',
    headers: ['Reason', 'Why It Matters'],
    rows: [
      [
        'US health insurance may not cover care here',
        'Many hospitals may require upfront payment from foreign visitors. This is a top reason visitors search for cambodia travel insurance before they fly.',
      ],
      [
        'Temple exploration is physical',
        'Climbing steep stone steps in heat and humidity leads to falls, scrapes, and twisted ankles.',
      ],
      ['Motorbike and bicycle accidents', 'Renting a motorbike or bicycle is common in Siem Reap. Accidents happen.'],
      [
        'Food and waterborne illness',
        'Street food and local restaurants are amazing, but stomach issues are common.',
      ],
      [
        'Medical evacuation is expensive',
        'In serious cases, air evacuation to Bangkok or Singapore can in some cases exceed $50,000 to $100,000 without coverage.',
      ],
      ['Affordable protection', 'Travel medical insurance from about $2/day for younger travelers.'],
    ],
  },
  healthcare: {
    title: 'Healthcare in Siem Reap: What to Expect',
    intro:
      'If you are researching cambodia health care for tourists or siem reap visitor insurance, the key thing to know is that Siem Reap has solid medical facilities for a Cambodian city — but many providers may require payment upfront, with reimbursement later if your insurer covers foreign care.',
    hospitalHeaders: ['Name', 'Type', 'Address / Contact', 'Services'],
    hospitals: [
      [
        'Angkor Hospital for Children',
        'NGO hospital',
        'Tep Vong Road, Siem Reap',
        'Pediatric care, emergency services',
      ],
      [
        'Royal Angkor International Hospital',
        'Private hospital',
        'National Road 6, Siem Reap',
        'General care, emergency, international standards',
      ],
      [
        'Preah Norodom Sihanouk Provincial Hospital',
        'Public hospital',
        'National Road 6',
        'Public care, basic services',
      ],
    ],
    notes: [
      'Private hospitals (like Royal Angkor) offer higher quality care but cost more',
      'Public hospitals are cheaper but may have limited English-speaking staff',
      'Upfront payment may be required from foreign visitors at many facilities',
      'Serious emergencies may require evacuation to Phnom Penh, Bangkok, or Singapore',
    ],
  },
  emergencyNumbers: {
    title: 'Emergency Numbers in Siem Reap',
    headers: ['Service', 'Number'],
    rows: [
      ['Police', '117'],
      ['Fire Department', '118'],
      ['Ambulance', '119'],
      ['Royal Angkor International Hospital', '+855 63 966 677'],
      ['Angkor Hospital for Children', '+855 63 963 409'],
    ],
  },
  plansIntro:
    'SafetyWing Nomad Insurance is a widely used travel medical insurance option for Siem Reap trips. Essential fits most one-week vacations; Complete suits longer stays or travelers who want broader coverage. Both are travel medical insurance plans — not full domestic health insurance.',
  essentialPlan: {
    name: 'Nomad Insurance Essential',
    priceLabel: 'From ~$2/day · $62.72 / 4 weeks (ages 18–39)',
    summary: 'Good for short Siem Reap vacations, temple tours, and standard travel.',
    url: SAFETYWING_NOMAD_INSURANCE_URL,
    cta: 'See exactly what Essential includes',
    coverageHeaders: ['Coverage', 'Limit'],
    coverage: [
      ['Medical treatment & hospitalization', '$250,000'],
      ['Emergency evacuation', '$100,000 lifetime'],
      ['Adventure sports & activities', '$250,000'],
      ['Lost checked luggage', '$500/item, $3,000 max'],
      ['Travel delay', '$60 (3hr+) / $150 (8hr+)'],
    ],
    exclusion: 'Does not cover: pre-existing conditions, maternity, or cancer treatment.',
    note:
      'One quick note: with the Essential plan, you\'re covered for 15 days back home in the US for every 3 months of coverage.',
  },
  completePlan: {
    name: 'Nomad Insurance Complete',
    priceLabel: 'From ~$6/day · $177.50 / month (ages 18–39)',
    summary: 'Good for longer stays, frequent travelers, and broader medical coverage needs.',
    url: SAFETYWING_NOMAD_INSURANCE_COMPLETE_URL,
    cta: 'See current Complete pricing',
    coverageHeaders: ['Coverage', 'Limit'],
    coverage: [
      ['Medical treatment & hospitalization', '$1,500,000'],
      ['Emergency evacuation', '$100,000 lifetime'],
      ['Adventure sports & activities', '$250,000'],
      ['Cancer treatment', '$1,500,000'],
      ['Maternity care', '$2,500 (10-month waiting)'],
      ['Stolen belongings', '$5,000'],
    ],
    exclusion: 'Does not cover: pre-existing conditions.',
    note:
      'The biggest advantage of the Complete plan is that it is a global health insurance plan with travel protection. Includes routine appointments, maternity care, and others. Unfortunately, not available for US residents — only for US citizens who reside outside the United States.',
  },
  coverageNeeds: {
    title: 'What Coverage Do You Need for Siem Reap?',
    headers: ['Coverage Type', 'Why You Need It'],
    rows: [
      [
        'Travel medical coverage',
        'The most essential piece for Siem Reap. Look for at least $100,000 — SafetyWing Nomad Insurance Essential includes $250,000.',
      ],
      [
        'Emergency medical evacuation',
        'In serious cases, transport to Bangkok or Singapore can in some cases exceed $50,000 to $100,000. Both SafetyWing plans include up to $100,000.',
      ],
      [
        'Adventure sports coverage',
        'Both plans include leisure sports up to $250,000, including bicycle tours, trekking, and water activities.',
      ],
      [
        'Trip cancellation and interruption',
        'Helps recover prepaid non-refundable costs for covered reasons — useful if a weather disruption affects your plans.',
      ],
      [
        'Baggage and personal items',
        'Both plans include checked-luggage protection at $500/item up to $3,000. Complete adds stolen belongings coverage up to $5,000 — relevant if you are bringing phones, cameras, or temple-photography gear.',
      ],
    ],
  },
  scenarios: {
    title: 'Siem Reap-Specific Insurance Scenarios',
    headers: ['Scenario', 'Why Insurance Matters'],
    rows: [
      [
        'Temple step injury',
        'You slip on steep stone stairs at Angkor Wat, twist your ankle, and need X-rays. Without insurance: $300–500 out of pocket. With insurance: covered subject to policy terms.',
      ],
      [
        'Motorbike accident',
        'You rent a motorbike for a countryside tour and get into a minor accident. Without insurance: $500–2,000 for treatment. With insurance: covered subject to policy terms.',
      ],
      [
        'Food poisoning',
        'You eat street food and get severe food poisoning requiring IV fluids. Without insurance: $200–400 at a private clinic. With insurance: covered subject to policy terms.',
      ],
      [
        'Lost baggage',
        'Your luggage is delayed and you need clothes and toiletries for 2 days. Without insurance: $200+ out of pocket. With insurance: covered up to policy limits.',
      ],
      [
        'Medical evacuation',
        'You have a serious accident requiring air evacuation to Bangkok. Without insurance: costs can in some cases reach $50,000–100,000. With insurance: covered up to $100,000, subject to policy terms.',
      ],
    ],
  },
  pricing: {
    title: 'How Much Does Siem Reap Travel Insurance Cost?',
    intro:
      'When people search for cambodia trip insurance or siem reap vacation insurance, cost is usually the first question. Here is how SafetyWing Nomad Insurance breaks down by age group — prices shown per billing period, with the daily equivalent for context.',
    headers: ['Age', 'Essential (~per day)', 'Complete (~per day)'],
    rows: [
      ['18–39', '~$2/day ($62.72 / 4 weeks)', '~$6/day ($177.50 / month)'],
      ['40–49', 'Higher', 'Higher'],
      ['50–59', 'Higher', 'Higher'],
    ],
    footnote:
      'For a one-week Siem Reap trip, Essential travel medical insurance is roughly $15 to $20 total for ages 18–39 — less than a single dinner at a Pub Street restaurant.',
    cta: 'See your exact price for Siem Reap',
    ctaUrl: SAFETYWING_NOMAD_INSURANCE_URL,
  },
  worthIt: {
    title: 'Is Siem Reap Travel Insurance Worth It?',
    paragraphs: [
      'For most Siem Reap travelers: yes. The city is safe, but accidents and delays still happen. The question is whether you want to pay a small amount now or potentially thousands later.',
      'SafetyWing Nomad Insurance Essential is a practical baseline for most temple vacations. For multi-day tours, motorbike rentals, or broader protection, Complete offers stronger coverage limits.',
    ],
    cta: 'See current pricing before your Siem Reap trip',
    ctaUrl: SAFETYWING_NOMAD_INSURANCE_URL,
    disclosure:
      'We earn a commission from SafetyWing sign-ups through our affiliate links, at no extra cost to you.',
  },
  relatedGuides: {
    title: 'More Siem Reap Travel Guides',
    intro: 'Plan the rest of your trip with our comprehensive guides:',
    groups: [
      {
        label: 'Temple Guides',
        links: [
          {
            label: 'Angkor Wat Sunrise: Complete Guide',
            href: '/destinations/siem-reap/guides/angkor-wat-sunrise-complete-guide',
          },
          {
            label: 'Angkor Wat Sunrise & Sunset Tours',
            href: '/destinations/siem-reap/guides/angkor-wat-sunrise-sunset-tours',
          },
          {
            label: 'Siem Reap: Attractions & Museums',
            href: '/destinations/siem-reap/guides/attractions-museums',
          },
        ],
      },
      {
        label: 'Getting Around',
        links: [
          {
            label: 'Siem Reap Airport Transfers (SAI)',
            href: '/destinations/siem-reap/guides/airport-transfers',
          },
          {
            label: 'Siem Reap Countryside & Village Tours',
            href: '/destinations/siem-reap/guides/countryside-village-tours',
          },
        ],
      },
      {
        label: 'Food & Culture',
        links: [
          {
            label: 'Siem Reap Food & Drink Experiences',
            href: '/destinations/siem-reap/guides/food-drink-experiences',
          },
          {
            label: 'Siem Reap Street Food & Market Tours',
            href: '/destinations/siem-reap/guides/street-food-market-tours',
          },
        ],
      },
      {
        label: 'Activities',
        links: [
          {
            label: 'Siem Reap Bike Tour Adventures',
            href: '/destinations/siem-reap/guides/bike-tour-adventures',
          },
          {
            label: 'Siem Reap Multi-Day Tours',
            href: '/destinations/siem-reap/guides/multi-day-tours',
          },
        ],
      },
    ],
  },
  faqs: [
    {
      question: 'Is travel insurance mandatory for Siem Reap in 2026?',
      answer:
        'No. Cambodia does not require travel insurance for entry. Still, it is a smart add-on for most visitors because many facilities may require upfront payment, and trip delays or cancellations can quickly become expensive without coverage.',
    },
    {
      question: 'Will my US health insurance work in Cambodia?',
      answer:
        'Often limited. US plans — including Medicare and Medicaid — usually do not cover routine or emergency care outside the United States, and many employer plans may not reimburse foreign care or may only offer limited out-of-network benefits. Check your policy and consider separate travel medical insurance before departure.',
    },
    {
      question: 'Is Siem Reap travel insurance worth it?',
      answer:
        'For most travelers, yes. A basic travel medical insurance policy can cost around the price of a casual meal per day, while a single urgent care visit, ER treatment, or evacuation can cost hundreds to tens of thousands of dollars out of pocket.',
    },
    {
      question: 'Is Siem Reap safe to visit?',
      answer:
        'Yes. Siem Reap is widely considered one of the safer cities in Southeast Asia. Travel medical insurance is still useful for non-crime risks like injuries, illness, flight disruptions, or lost luggage.',
    },
    {
      question: 'What documents are required to travel to Cambodia?',
      answer:
        'You will need a valid passport (at least 6 months validity), a Cambodian tourist visa (e-visa or visa on arrival), and proof of onward travel. Visa requirements may change, so check with the Cambodian embassy before flying.',
    },
    {
      question: 'What travel medical insurance can I buy if I have already left my home country?',
      answer:
        'SafetyWing Nomad Insurance can often be purchased after departure, which is useful if you forgot to buy coverage before your Siem Reap flight. Always confirm current eligibility rules on their site before purchasing.',
    },
    {
      question: 'Can I pay monthly for travel medical insurance?',
      answer:
        'Yes. SafetyWing Nomad Insurance Essential renews every 4 weeks, and Nomad Insurance Complete can be billed monthly. This can be helpful for longer Siem Reap stays or multi-country Southeast Asia trips.',
    },
    {
      question: 'Does SafetyWing charge a deductible?',
      answer:
        'SafetyWing Nomad Insurance plans typically use a per-incident deductible rather than an annual deductible. Check the current policy wording for exact amounts, as terms can change.',
    },
    {
      question: 'Does SafetyWing cover me in Siem Reap?',
      answer:
        'Yes. SafetyWing Nomad Insurance covers eligible medical treatment in Cambodia, including emergency care and activities like bicycle tours and trekking, subject to policy terms and exclusions.',
    },
    {
      question: 'How much does cambodia vacation insurance cost for a one-week trip?',
      answer:
        'For ages 18–39, SafetyWing Nomad Insurance Essential works out to roughly $2 per day — about $15 to $20 total for a one-week Siem Reap vacation. Older age groups pay more; use the quote tool for your exact price.',
    },
    {
      question: 'Does travel insurance cover electronics theft in Siem Reap?',
      answer:
        'SafetyWing Nomad Insurance Essential covers lost checked luggage but not theft of belongings you carry day to day. Nomad Insurance Complete includes stolen belongings coverage up to $5,000, which can apply to items like phones, cameras, and GoPros when stolen — subject to policy terms, deductibles, and proof of theft.',
    },
    {
      question: 'Is there travel medical insurance that covers multiple countries on one trip?',
      answer:
        'Yes. SafetyWing Nomad Insurance is built for multi-country travel on a single policy — useful if your itinerary combines Siem Reap with Phnom Penh, Bangkok, Ho Chi Minh City, or other Southeast Asian stops.',
    },
    {
      question: 'Does SafetyWing include coverage when I am back home in the US?',
      answer:
        'Nomad Insurance Essential includes limited US home coverage: 15 days back home in the US for every 3 months of coverage. Complete is designed as global health insurance with travel protection, but it is not available to US residents — only to US citizens who live abroad. Always confirm current eligibility and limits on SafetyWing\'s site before purchasing.',
    },
  ],
  seo: {
    title: 'Siem Reap Travel Insurance: What You Need to Know (2026) | TopTours',
    description:
      'Siem Reap travel insurance guide for 2026 — US plans may not cover care abroad, upfront hospital costs, SafetyWing from ~$2/day, evacuation coverage, and FAQs for temple trips.',
    keywords:
      'Siem Reap travel insurance, Cambodia travel insurance, SafetyWing Siem Reap, cambodia health insurance tourists',
  },
  schemaDatePublished: '2026-06-10',
  schemaDateModified: '2026-06-10',
};
