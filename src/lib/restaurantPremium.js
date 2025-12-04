/**
 * Restaurant Premium Subscription System
 * Configuration and utilities for the premium restaurant visibility feature
 */

// Pricing (in USD)
export const RESTAURANT_PREMIUM_PRICING = {
  monthly: {
    price: 7.99,
    interval: 'month',
    label: '$7.99/month',
    description: 'Billed monthly',
  },
  yearly: {
    price: 4.99, // per month
    totalPrice: 59.88, // per year
    interval: 'year',
    label: '$4.99/month',
    description: 'Billed yearly ($59.88/year)',
    savings: '37% savings',
  },
};

// Layout presets - subtle variations, no heavy gradients
export const LAYOUT_PRESETS = {
  ocean: {
    id: 'ocean',
    name: 'Ocean Classic',
    description: 'Clean blue tones, trustworthy and professional',
    heroClass: 'bg-gradient-to-br from-blue-600/80 via-indigo-600/70 to-purple-700/80', // Blue-purple gradient
    accentColor: '#2563eb',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Warm',
    description: 'Warm amber tones, appetizing and inviting',
    heroClass: 'bg-gradient-to-br from-orange-600/80 via-red-500/70 to-rose-600/80', // Warm sunset gradient
    accentColor: '#f97316',
  },
  twilight: {
    id: 'twilight',
    name: 'Twilight Elegant',
    description: 'Refined purple tones, upscale and sophisticated',
    heroClass: 'bg-gradient-to-br from-purple-700/80 via-violet-600/70 to-indigo-800/80', // Elegant purple gradient
    accentColor: '#7c3aed',
  },
};

// Color schemes for CTA buttons
export const COLOR_SCHEMES = {
  blue: {
    id: 'blue',
    name: 'Ocean Blue',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    stickyClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  coral: {
    id: 'coral',
    name: 'Sunset Coral',
    buttonClass: 'bg-orange-500 hover:bg-orange-600 text-white',
    stickyClass: 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  teal: {
    id: 'teal',
    name: 'Forest Teal',
    buttonClass: 'bg-teal-600 hover:bg-teal-700 text-white',
    stickyClass: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
  },
};

// Pre-approved CTA headline options (no custom input allowed)
export const CTA_OPTIONS = {
  hero: [
    { text: 'Reserve Your Table', icon: 'calendar' },
    { text: 'Book Now', icon: 'calendar' },
    { text: 'Make a Reservation', icon: 'utensils' },
    { text: 'View Menu & Reserve', icon: 'book-open' },
    { text: 'Check Availability', icon: 'clock' },
  ],
  mid: [
    { text: 'Ready to dine? Reserve your spot', subtext: 'Book a table now' },
    { text: "Don't miss out on this experience", subtext: 'Secure your reservation' },
    { text: 'Planning your visit?', subtext: 'Reserve ahead for the best seats' },
    { text: 'Hungry for more?', subtext: 'Book your table today' },
  ],
  end: [
    { text: 'Reserve Your Table Now', icon: 'arrow-right' },
    { text: 'Book Your Experience', icon: 'arrow-right' },
    { text: 'Secure Your Spot', icon: 'arrow-right' },
    { text: 'Visit Restaurant Website', icon: 'external-link' },
  ],
  sticky: [
    { text: 'Reserve Table', icon: 'calendar' },
    { text: 'Book Now', icon: 'utensils' },
    { text: 'Get Directions', icon: 'map-pin' },
    { text: 'View Menu', icon: 'book-open' },
  ],
};

/**
 * Get CTA text by type and index
 */
export function getCTAText(type, index) {
  const options = CTA_OPTIONS[type];
  if (!options || index < 0 || index >= options.length) {
    return options?.[0] || { text: 'Visit Website' };
  }
  return options[index];
}

/**
 * Get layout preset by ID
 */
export function getLayoutPreset(presetId) {
  return LAYOUT_PRESETS[presetId] || LAYOUT_PRESETS.ocean;
}

/**
 * Get color scheme by ID
 */
export function getColorScheme(schemeId) {
  return COLOR_SCHEMES[schemeId] || COLOR_SCHEMES.blue;
}

/**
 * Check if a restaurant has an active premium subscription
 */
export function isPremiumRestaurant(subscription) {
  if (!subscription) return false;
  
  // Check status
  if (subscription.status !== 'active' && subscription.status !== 'pending_cancellation') {
    return false;
  }
  
  // Check if subscription is within billing period
  if (subscription.current_period_end) {
    const endDate = new Date(subscription.current_period_end);
    if (endDate < new Date()) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get premium configuration for a restaurant
 */
export function getPremiumConfig(subscription) {
  if (!isPremiumRestaurant(subscription)) {
    return null;
  }
  
  return {
    layout: getLayoutPreset(subscription.layout_preset),
    colorScheme: getColorScheme(subscription.color_scheme),
    heroCTA: getCTAText('hero', subscription.hero_cta_index || 0),
    midCTA: getCTAText('mid', subscription.mid_cta_index || 0),
    endCTA: getCTAText('end', subscription.end_cta_index || 0),
    stickyCTA: getCTAText('sticky', subscription.sticky_cta_index || 0),
  };
}

// Stripe Price IDs (to be set in environment variables)
export const RESTAURANT_STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_RESTAURANT_PREMIUM_MONTHLY_PRICE_ID,
  yearly: process.env.STRIPE_RESTAURANT_PREMIUM_YEARLY_PRICE_ID,
};

