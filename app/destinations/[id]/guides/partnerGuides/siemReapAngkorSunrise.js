/**
 * Editorial guide: Angkor Wat Sunrise (Siem Reap hub spoke #1).
 * Static payload — no Supabase row required.
 */

export const ANGKOR_SUNRISE_GUIDE_SLUG = 'angkor-wat-sunrise-complete-guide';

const HERO =
  'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/06/73/d9/f5.jpg';

/** @returns {{ category_slug: string, category_name: string, title: string, subtitle: string, hero_image: string }} */
export function getAngkorSunriseListingMeta() {
  return {
    category_slug: ANGKOR_SUNRISE_GUIDE_SLUG,
    category_name: 'Angkor Wat Sunrise',
    title: 'Angkor Wat Sunrise: Complete Guide – Best Spots, Timing, Photography & Tour Options',
    subtitle:
      'The world\'s most famous sunrise draws thousands to Angkor Wat each morning. This guide covers where to stand, when to arrive, photography tips, and the three best sunrise tours in Siem Reap.',
    hero_image: HERO,
  };
}

export function getAngkorSunriseShowcaseTours() {
  return [
    {
      productId: '68746P1',
      title: 'Full-Day Angkor Wat Sunrise Private Tour with Guide from Siem Reap',
      tagLabel: 'Private · Siem Reap',
      operatorName: 'Angkor Wat Travel Tour',
      imageUrl:
        'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/06/73/d9/f5.jpg',
      durationHours: 8,
      priceFrom: 60,
      rating: 5,
      reviewCount: 3350,
      viatorBookingUrl:
        'https://www.viator.com/tours/Siem-Reap/Angkor-Wat-Sunrise-Private-Tour/d5480-68746P1?mcid=42383&pid=P00276441&medium=api&api_version=2.0',
    },
    {
      productId: '76334P1',
      title: 'Angkor Wat Sunrise tour with Small - Group and Guide tours',
      tagLabel: 'Small group · Siem Reap',
      operatorName: 'Angkor Wat Shared Tours',
      imageUrl:
        'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/11/ed/26/22.jpg',
      durationHours: 8,
      priceFrom: 14,
      rating: 5,
      reviewCount: 4226,
      viatorBookingUrl:
        'https://www.viator.com/tours/Siem-Reap/Angkor-Wat-Sunrise-Small-Tours-Shared-Groups/d5480-76334P1?mcid=42383&pid=P00276441&medium=api&api_version=2.0',
    },
    {
      productId: '118579P4',
      title: 'Angkor Wat Sunrise Small Group Tour With Breakfast',
      tagLabel: 'Small group · Breakfast included',
      operatorName: 'Asean Angkor Guide',
      imageUrl:
        'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/16/18/e2/79.jpg',
      durationHours: 9,
      priceFrom: 23,
      rating: 5,
      reviewCount: 480,
      viatorBookingUrl:
        'https://www.viator.com/tours/Siem-Reap/ANGKOR-TOUR-SUNRISE/d5480-118579P4?mcid=42383&pid=P00276441&medium=api&api_version=2.0',
    },
  ];
}

/** Full guide payload for CategoryGuideClient / metadata */
export function getAngkorSunriseGuideData() {
  const listing = getAngkorSunriseListingMeta();
  return {
    guideLayout: 'angkor-sunrise',
    title: listing.title,
    subtitle: listing.subtitle,
    categoryName: 'Angkor Wat sunrise',
    toursSearchQuery: 'Angkor Wat sunrise',
    heroImage: listing.hero_image,
    heroTagline:
      '8,000+ verified reviews across our top picks · sunrise tours from $14',
    partnerShowcaseTours: getAngkorSunriseShowcaseTours(),
    showcaseConfig: {
      showPartnerBadge: false,
      centered: true,
      heading: 'Our 3 top picks for Angkor Wat sunrise',
      description:
        'Based on 8,000+ verified traveler reviews, these three tours stand out for quality, value, and experience — private, small group, or small group with breakfast.',
    },
    stats: {
      toursAvailable: 3,
      priceFrom: 14,
      duration: '8–9 hours',
      reviewCount: 8056,
    },
    introduction: `The world's most famous sunrise isn't just a photo opportunity — it's a ritual that draws thousands of travelers to Angkor Wat's lotus-shaped towers each morning. Five towers emerging from darkness as the sky shifts from deep purple to orange and gold, doubled in the lotus pond reflection, is one of Southeast Asia's defining travel moments.

The short answer on whether it's worth it: yes — but only with realistic expectations. You will not be alone between November and March, when 2,000–3,000 people gather around the lotus ponds. What makes it worthwhile is the sunrise itself, plus the advantage of exploring Angkor Wat's inner galleries before the main midday crowds arrive.`,

    seo: {
      title:
        'Angkor Wat Sunrise Guide: Best Spots, Timing, Photography & Tours | Siem Reap',
      description:
        'Complete Angkor Wat sunrise guide: best viewing spots, arrival times, photography tips, 2026 pass prices, and our top 3 sunrise tours in Siem Reap from $14.',
      keywords:
        'Angkor Wat sunrise, Angkor Wat sunrise tour, best spot Angkor sunrise, Siem Reap sunrise tour, Angkor Wat photography',
    },

    whyChoose: [],
    tourTypes: [],
    hideWhatToExpect: true,
    hideExpertTips: true,

    faqs: [
      {
        question: 'Is Angkor Wat sunrise better than sunset?',
        answer:
          'Yes, for most photographers. Angkor Wat faces west, so sunrise offers backlighting and the iconic reflection in the lotus ponds. Sunset lights the front façade directly — beautiful, but quieter and without the reflection shot most visitors want.',
      },
      {
        question: 'What time should I arrive for Angkor Wat sunrise?',
        answer:
          'Arrive by 5:00 AM for a good spot at the lotus ponds. For a front-row position, aim for 4:45 AM. Pickup for most tours is between 4:00 and 4:30 AM.',
      },
      {
        question: 'Is the Angkor Pass included in the tour price?',
        answer:
          'No. Purchase the Angkor Pass separately at the official Angkor Enterprise ticket office (open from 5:00 AM) or online in advance. As of January 2026: $37 for 1 day, $62 for 3 days, $72 for 7 days.',
      },
      {
        question: 'Can I book a sunrise tour the night before?',
        answer:
          'Sometimes, but high-season tours (November–February) sell out. Book at least 2 days ahead — ideally 2 weeks ahead in peak season.',
      },
      {
        question: 'Is an Angkor Wat sunrise tour suitable for children?',
        answer:
          'Full-day temple circuits are long and hot. Families with young children may prefer splitting temples across two days. The breakfast-included small-group tour is a slower-paced option.',
      },
    ],

    relatedGuideLinks: [
      {
        label: 'Best Siem Reap shore excursions & Angkor Wat tours',
        href: '/destinations/siem-reap/guides/shore-excursions',
      },
      {
        label: 'All Siem Reap travel guides',
        href: '/destinations/siem-reap/guides',
      },
      {
        label: 'Siem Reap destination hub',
        href: '/destinations/siem-reap',
      },
    ],
  };
}
