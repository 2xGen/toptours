/**
 * Google Places API Integration
 * Uses LEGACY Places API (maps.googleapis.com) so usage counts under Starter plan
 * "Place Details Essentials" and "Text Search Essentials" (50,000 calls/month).
 * Do not use Places API (New) (places.googleapis.com/v1) — that is pay-as-you-go.
 */

const LEGACY_PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';

function getApiKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    throw new Error('GOOGLE_PLACES_API_KEY environment variable is required');
  }
  return key;
}

// --- Legacy API (Starter plan) ---

/**
 * Legacy Text Search: GET .../textsearch/json
 * Billed as "Places API Text Search Essentials" — counts against 50k.
 */
async function legacyTextSearchPage(query, pageToken = null) {
  const params = new URLSearchParams({
    query: query,
    key: getApiKey(),
    language: 'en',
  });
  if (pageToken) {
    params.set('pagetoken', pageToken);
  }
  const url = `${LEGACY_PLACES_BASE}/textsearch/json?${params.toString()}`;
  const response = await fetch(url, { method: 'GET' });
  const data = await response.json();
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Legacy Text Search error: ${data.status} ${data.error_message || ''}`);
  }
  const results = data.results || [];
  const places = results.map((r) => ({
    id: r.place_id,
    displayName: { text: r.name },
    formattedAddress: r.formatted_address,
    location: r.geometry?.location
      ? { latitude: r.geometry.location.lat, longitude: r.geometry.location.lng }
      : null,
    rating: r.rating ?? null,
    userRatingCount: r.user_ratings_total ?? 0,
    photos: [], // Not used — saves cost
    types: r.types || [],
    priceLevel: r.price_level ?? null,
  }));
  return {
    places,
    nextPageToken: data.next_page_token || null,
  };
}

/**
 * Legacy Place Details: GET .../details/json?place_id=...&fields=...
 * Billed as "Places API Place Details Essentials" — counts against 50k.
 * Request only Essentials-tier fields.
 */
// No 'photos' — saves on call cost; we don't show them on the site.
const LEGACY_DETAILS_FIELDS = [
  'place_id',
  'name',
  'formatted_address',
  'formatted_phone_number',
  'international_phone_number',
  'website',
  'geometry',
  'rating',
  'user_ratings_total',
  'types',
  'opening_hours',
  'address_components',
  'price_level',
].join(',');

async function legacyPlaceDetails(placeId) {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: LEGACY_DETAILS_FIELDS,
    key: getApiKey(),
    language: 'en',
  });
  const url = `${LEGACY_PLACES_BASE}/details/json?${params.toString()}`;
  const response = await fetch(url, { method: 'GET' });
  const data = await response.json();
  if (data.status !== 'OK') {
    throw new Error(`Legacy Place Details error: ${data.status} ${data.error_message || ''}`);
  }
  const r = data.result || {};
  // Normalize to New API-like shape so formatRestaurantData and getPlaceCountryIso work
  const loc = r.geometry?.location;
  const addressComponents = Array.isArray(r.address_components)
    ? r.address_components.map((c) => ({
        types: c.types || [],
        shortText: c.short_name,
        longText: c.long_name,
      }))
    : null;
  return {
    id: r.place_id,
    displayName: { text: r.name },
    formattedAddress: r.formatted_address,
    nationalPhoneNumber: r.formatted_phone_number || null,
    internationalPhoneNumber: r.international_phone_number || null,
    websiteUri: r.website || null,
    location: loc ? { latitude: loc.lat, longitude: loc.lng } : null,
    rating: r.rating ?? null,
    userRatingCount: r.user_ratings_total ?? 0,
    types: r.types || [],
    priceLevel: r.price_level ?? null,
    addressComponents,
    photos: [], // Not requested — saves cost; listing doesn't show photos
    regularOpeningHours: r.opening_hours
      ? {
          weekdayDescriptions: r.opening_hours.weekday_text || [],
        }
      : null,
  };
}

/**
 * Photo URL: legacy uses photo_reference (long string); New API uses path "places/.../photos/...".
 * Legacy URL: .../photo?photo_reference=... (Starter plan).
 */
export function getPhotoUrl(photoNameOrRef, maxWidth = 1200) {
  if (!photoNameOrRef) return null;
  if (typeof photoNameOrRef === 'string' && photoNameOrRef.startsWith('places/')) {
    return `https://places.googleapis.com/v1/${photoNameOrRef}/media?maxWidthPx=${maxWidth}&key=${getApiKey()}`;
  }
  return `${LEGACY_PLACES_BASE}/photo?maxwidth=${maxWidth}&photo_reference=${encodeURIComponent(photoNameOrRef)}&key=${getApiKey()}`;
}

/**
 * Search for restaurants (legacy API — first page only).
 */
export async function searchRestaurants(query, location = null) {
  const { places } = await legacyTextSearchPage(query, null);
  return places;
}

/**
 * Single search request with optional pageToken (legacy API).
 * When pageToken is set, only pagetoken is sent (legacy requirement).
 */
export async function searchRestaurantsPage(query, location = null, pageToken = null) {
  return legacyTextSearchPage(query, pageToken);
}

/**
 * Fetch up to 60 restaurants for one query using pagination (3 pages × 20).
 * Waits 2 seconds between pages so nextPageToken is valid.
 * @param {string} query - Text query
 * @param {string|null} location - Optional "lat,lng"
 * @param {number} maxResults - Max places to return (API max 60 per query)
 * @returns {Promise<Array>} Array of place objects (no duplicates by id)
 */
export async function searchRestaurantsWithPagination(query, location = null, maxResults = 60) {
  const seen = new Set();
  const all = [];
  let pageToken = null;

  for (let page = 0; page < 3; page++) {
    const { places, nextPageToken } = await searchRestaurantsPage(query, location, pageToken);
    for (const p of places) {
      if (p.id && !seen.has(p.id)) {
        seen.add(p.id);
        all.push(p);
        if (all.length >= maxResults) return all;
      }
    }
    pageToken = nextPageToken;
    if (!pageToken || all.length >= maxResults) break;
    await new Promise((r) => setTimeout(r, 2000));
  }

  return all;
}

/**
 * Fetch up to maxTotal unique restaurants by running multiple queries and merging by place id.
 * Use this to get 100+ restaurants per destination (e.g. 5 queries × up to 60 = 300, capped at maxTotal).
 * @param {string[]} queries - Array of text queries (e.g. "restaurants in Paris", "best restaurants Paris")
 * @param {string|null} location - Optional "lat,lng"
 * @param {number} maxTotal - Max unique places to return (e.g. 100 or 200)
 * @returns {Promise<Array>} Array of place objects, deduplicated by id
 */
export async function searchRestaurantsMany(queries, location = null, maxTotal = 100) {
  const seen = new Set();
  const all = [];

  for (const query of queries) {
    if (all.length >= maxTotal) break;
    const remaining = maxTotal - all.length;
    const places = await searchRestaurantsWithPagination(query, location, Math.min(60, remaining));
    for (const p of places) {
      if (p.id && !seen.has(p.id)) {
        seen.add(p.id);
        all.push(p);
        if (all.length >= maxTotal) return all;
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  return all;
}

/**
 * Get detailed information about a place by place ID (legacy API — Starter plan).
 */
export async function getPlaceDetails(placeId) {
  return legacyPlaceDetails(placeId);
}

/**
 * Convert Google Places API response to our restaurant data format
 * @param {Object} place - Google Places API place object
 * @param {string} destinationId - Destination ID
 * @returns {Object} Formatted restaurant data
 */
export function formatRestaurantData(place, destinationId) {
  // Generate slug from display name
  let baseSlug = place.displayName?.text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/'/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') || '';
  
  // If slug is empty or only dashes (non-English characters), create fallback slug
  if (!baseSlug || baseSlug.replace(/-/g, '').length === 0) {
    // Try to use cuisine type or primary type as fallback
    const cuisineTypes = place.types || [];
    const cuisineType = cuisineTypes.find(t => t.includes('restaurant') || t.includes('food')) || 'restaurant';
    const cuisineSlug = cuisineType.replace(/_/g, '-').replace(/restaurant/g, '').replace(/food/g, '').trim() || 'restaurant';
    
    // Use location from address if available
    const addressParts = place.formattedAddress?.split(',') || [];
    const locationPart = addressParts[addressParts.length - 2]?.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
    
    // Create fallback slug: cuisine-location or just cuisine
    baseSlug = locationPart ? `${cuisineSlug}-${locationPart}` : cuisineSlug;
    
    // If still empty, use restaurant ID as last resort
    if (!baseSlug || baseSlug.replace(/-/g, '').length === 0) {
      baseSlug = `restaurant-${place.id?.substring(0, 8) || 'unknown'}`;
    }
  }
  
  // Clean up multiple dashes
  baseSlug = baseSlug.replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  // Add destination ID to make it unique per destination
  const slug = `${baseSlug}-${destinationId}`;

  // Get primary photo
  const primaryPhoto = place.photos && place.photos.length > 0 
    ? getPhotoUrl(place.photos[0].name) 
    : null;

  // Extract cuisines from types
  const cuisineTypes = place.types || [];
  const cuisines = cuisineTypes
    .filter(type => type.includes('restaurant') || type.includes('food'))
    .map(type => {
      // Convert type to readable cuisine name
      const cuisineMap = {
        'restaurant': 'Restaurant',
        'food': 'Food',
        'meal_takeaway': 'Takeaway',
        'meal_delivery': 'Delivery',
      };
      return cuisineMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    })
    .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
    .slice(0, 3); // Limit to 3

  // Convert price level from string to integer if needed
  let priceLevelInt = null;
  if (place.priceLevel !== undefined && place.priceLevel !== null) {
    if (typeof place.priceLevel === 'string') {
      // Convert string like "PRICE_LEVEL_EXPENSIVE" to integer
      const priceLevelMap = {
        'PRICE_LEVEL_FREE': 0,
        'PRICE_LEVEL_INEXPENSIVE': 1,
        'PRICE_LEVEL_MODERATE': 2,
        'PRICE_LEVEL_EXPENSIVE': 3,
        'PRICE_LEVEL_VERY_EXPENSIVE': 4,
      };
      priceLevelInt = priceLevelMap[place.priceLevel] || null;
    } else {
      priceLevelInt = place.priceLevel;
    }
  }

  const priceLevelMap = {
    0: { range: 'Free', label: 'Free' },
    1: { range: '$', label: 'Budget-friendly' },
    2: { range: '$$', label: 'Moderate' },
    3: { range: '$$$', label: 'Upscale' },
    4: { range: '$$$$', label: 'Very expensive' },
  };
  const pricing = priceLevelInt !== null
    ? priceLevelMap[priceLevelInt] || { range: '$$', label: 'Moderate' }
    : { range: '$$', label: 'Moderate' };

  // Format opening hours
  const openingHours = place.regularOpeningHours || place.currentOpeningHours;
  const hours = openingHours?.weekdayDescriptions?.map(desc => {
    const match = desc.match(/([^:]+):\s*(.+)/);
    if (match) {
      return {
        label: match[1].trim(),
        days: match[1].trim(),
        time: match[2].trim(),
      };
    }
    return {
      label: desc,
      days: 'Daily',
      time: desc,
    };
  }) || [];

  // Use editorialSummary for description/summary/tagline
  const editorialText = place.editorialSummary?.text || '';
  const description = editorialText;
  const summary = editorialText;
  const tagline = editorialText ? editorialText.split('.')[0] + '.' : '';

  // Create a better review summary from top reviews
  const reviews = place.reviews || [];
  let reviewSummary = null;
  if (reviews.length > 0) {
    // Take first 2-3 reviews and create a summary
    const topReviews = reviews.slice(0, 3).map(r => r.text?.text).filter(Boolean);
    if (topReviews.length > 0) {
      reviewSummary = topReviews.join(' ');
      // Limit length to avoid too long summaries
      if (reviewSummary.length > 500) {
        reviewSummary = reviewSummary.substring(0, 500) + '...';
      }
    }
  }
  // Fallback to editorialSummary if no reviews
  if (!reviewSummary && editorialText) {
    reviewSummary = editorialText;
  }

  // Format contact information
  const contact = {
    address: place.formattedAddress || '',
    formattedAddress: place.formattedAddress || '',
    phone: place.nationalPhoneNumber || place.internationalPhoneNumber || '',
    formattedPhone: place.nationalPhoneNumber || place.internationalPhoneNumber || '',
    website: place.websiteUri || '',
    googleMapsUrl: place.location 
      ? `https://maps.google.com/?q=${place.location.latitude},${place.location.longitude}`
      : `https://maps.google.com/?q=${encodeURIComponent(place.formattedAddress || '')}`,
  };

  // Generate short name (first word or first 2 words)
  const shortName = place.displayName?.text
    ? place.displayName.text.split(' ').slice(0, 2).join(' ')
    : place.displayName?.text || 'Restaurant';

  return {
    google_place_id: place.id,
    destination_id: destinationId,
    slug: slug,
    name: place.displayName?.text || 'Restaurant',
    short_name: shortName,
    description: description,
    summary: summary,
    tagline: tagline,
    hero_image_url: primaryPhoto,
    image_alt: `${place.displayName?.text || 'Restaurant'} in ${destinationId}`,
    address: place.formattedAddress || '',
    formatted_address: place.formattedAddress || '',
    phone: contact.phone,
    formatted_phone: contact.formattedPhone,
    website: contact.website,
    google_maps_url: contact.googleMapsUrl,
    latitude: place.location?.latitude || null,
    longitude: place.location?.longitude || null,
    google_rating: place.rating || null,
    review_count: place.userRatingCount || 0,
    cuisines: cuisines.length > 0 ? cuisines : ['Restaurant'],
    price_level: priceLevelInt,
    price_range: pricing.range,
    price_range_label: pricing.label,
    opening_hours: hours.length > 0 ? hours : null,
    review_summary: reviewSummary,
    
    // Business Attributes
    outdoor_seating: place.outdoorSeating || null,
    live_music: place.liveMusic || null,
    menu_for_children: place.menuForChildren || null,
    serves_cocktails: place.servesCocktails || null,
    serves_dessert: place.servesDessert || null,
    serves_coffee: place.servesCoffee || null,
    good_for_children: place.goodForChildren || null,
    allows_dogs: place.allowsDogs || null,
    restroom: place.restroom || null,
    good_for_groups: place.goodForGroups || null,
    reservable: place.reservable || null,
    dine_in: place.dineIn || null,
    takeout: place.takeout || null,
    delivery: place.delivery || null,
    
    // Payment Options
    payment_options: place.paymentOptions || null,
    
    // Parking Options
    parking_options: place.parkingOptions || null,
    
    // Accessibility Options
    accessibility_options: place.accessibilityOptions || null,
    
    // Store reviews for AI description generation
    reviews: reviews.length > 0 ? reviews.map(r => ({
      text: r.text?.text || '',
      rating: r.rating || null,
      publishTime: r.publishTime || null,
      author: r.authorAttribution?.displayName || 'Anonymous',
    })) : null,
    
    // SEO & Additional Valuable Fields
    address_components: place.addressComponents || null,
    plus_code: place.plusCode || null,
    viewport: place.viewport || null,
    business_status: place.businessStatus || null,
    primary_type: place.primaryTypeDisplayName?.text || null,
    serves_beer: place.servesBeer || null,
    serves_wine: place.servesWine || null,
    serves_brunch: place.servesBrunch || null,
    serves_dinner: place.servesDinner || null,
    utc_offset_minutes: place.utcOffsetMinutes || null,
    adr_format_address: place.adrFormatAddress || null,
    google_maps_uri: place.googleMapsUri || place.googleMapsLinks?.placeUri || null,
    reviews_uri: place.googleMapsLinks?.reviewsUri || null,
    photos_uri: place.googleMapsLinks?.photosUri || null,
    next_open_time: (place.regularOpeningHours?.nextOpenTime || place.currentOpeningHours?.nextOpenTime) || null,
    open_now: (place.regularOpeningHours?.openNow || place.currentOpeningHours?.openNow) ?? null,
    
    google_data: place, // Store full response for reference
  };
}

