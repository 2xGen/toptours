/**
 * Google Places API Integration
 * Fetches restaurant data from Google Places API
 */

const GOOGLE_PLACES_API_BASE = 'https://places.googleapis.com/v1';

function getApiKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    throw new Error('GOOGLE_PLACES_API_KEY environment variable is required');
  }
  return key;
}

/**
 * Search for restaurants near a location using Text Search
 * @param {string} query - Search query (e.g., "restaurants in Aruba")
 * @param {string} location - Location bias (e.g., "12.5211,-69.9683" for lat,lng)
 * @returns {Promise<Array>} Array of place results
 */
export async function searchRestaurants(query, location = null) {
  try {
    const url = `${GOOGLE_PLACES_API_BASE}/places:searchText`;
    
    const body = {
      textQuery: query,
      maxResultCount: 20,
      includedType: 'restaurant',
      languageCode: 'en',
    };

    if (location) {
      body.locationBias = {
        circle: {
          center: {
            latitude: parseFloat(location.split(',')[0]),
            longitude: parseFloat(location.split(',')[1]),
          },
          radius: 50000, // 50km radius
        },
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': getApiKey(),
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.types,places.priceLevel,places.nationalPhoneNumber,places.websiteUri,places.location',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Places API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.places || [];
  } catch (error) {
    console.error('Error searching restaurants:', error);
    throw error;
  }
}

/**
 * Get detailed information about a place by place ID
 * @param {string} placeId - Google Places API place ID
 * @returns {Promise<Object>} Detailed place information
 */
export async function getPlaceDetails(placeId) {
  try {
    const url = `${GOOGLE_PLACES_API_BASE}/places/${placeId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': getApiKey(),
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,rating,userRatingCount,priceLevel,editorialSummary,photos,types,location,currentOpeningHours,regularOpeningHours,reviews,outdoorSeating,liveMusic,menuForChildren,servesCocktails,servesDessert,servesCoffee,goodForChildren,allowsDogs,restroom,goodForGroups,reservable,dineIn,takeout,delivery,paymentOptions,parkingOptions,accessibilityOptions,addressComponents,plusCode,viewport,businessStatus,primaryTypeDisplayName,servesBeer,servesWine,servesBrunch,servesDinner,utcOffsetMinutes,adrFormatAddress,googleMapsUri',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Places API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error;
  }
}

/**
 * Get a photo URL from Google Places API
 * @param {string} photoName - Photo name from the API response
 * @param {number} maxWidth - Maximum width in pixels (default: 1200)
 * @returns {string} Photo URL
 */
export function getPhotoUrl(photoName, maxWidth = 1200) {
  if (!photoName) return null;
  
  // Extract photo reference from photo name
  // Photo name format: places/ChIJ.../photos/...
  const photoReference = photoName.split('/').pop();
  
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${getApiKey()}`;
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

