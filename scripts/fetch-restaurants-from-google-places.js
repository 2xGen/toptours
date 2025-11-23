/**
 * Script to fetch restaurants from Google Places API for destinations
 * Usage: node scripts/fetch-restaurants-from-google-places.js <destinationId> [query] [location]
 * 
 * Example:
 * node scripts/fetch-restaurants-from-google-places.js aruba "restaurants in Aruba" "12.5211,-69.9683"
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GOOGLE_PLACES_API_KEY) {
  console.error('❌ Missing GOOGLE_PLACES_API_KEY environment variable');
  console.error('Please set GOOGLE_PLACES_API_KEY in your .env.local file');
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Google Places API functions
async function searchRestaurants(query, location = null) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  
  const body = {
    textQuery: query,
    maxResultCount: 20,
    includedType: 'restaurant',
    languageCode: 'en',
  };

  if (location) {
    const [lat, lng] = location.split(',').map(Number);
    body.locationBias = {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 50000, // 50km
      },
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos,places.types,places.priceLevel,places.nationalPhoneNumber,places.websiteUri,places.location',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Places API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.places || [];
}

async function getPlaceDetails(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,rating,userRatingCount,priceLevel,editorialSummary,photos,types,location,currentOpeningHours,regularOpeningHours,reviews,outdoorSeating,liveMusic,menuForChildren,servesCocktails,servesDessert,servesCoffee,goodForChildren,allowsDogs,restroom,goodForGroups,reservable,dineIn,takeout,delivery,paymentOptions,parkingOptions,accessibilityOptions,addressComponents,plusCode,viewport,businessStatus,primaryTypeDisplayName,servesBeer,servesWine,servesBrunch,servesDinner,utcOffsetMinutes,adrFormatAddress,googleMapsUri',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Places API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

function getPhotoUrl(photoName, maxWidth = 1200) {
  if (!photoName) return null;
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_PLACES_API_KEY}`;
}

function formatRestaurantData(place, destinationId) {
  // Generate base slug from restaurant name
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

  const primaryPhoto = place.photos && place.photos.length > 0 
    ? getPhotoUrl(place.photos[0].name) 
    : null;

  const cuisineTypes = place.types || [];
  const cuisines = cuisineTypes
    .filter(type => type.includes('restaurant') || type.includes('food'))
    .map(type => {
      const cuisineMap = {
        'restaurant': 'Restaurant',
        'food': 'Food',
        'meal_takeaway': 'Takeaway',
        'meal_delivery': 'Delivery',
      };
      return cuisineMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    })
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 3);

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
      // No character limit - store full review summary for better SEO and user experience
    }
  }
  // Fallback to editorialSummary if no reviews
  if (!reviewSummary && editorialText) {
    reviewSummary = editorialText;
  }

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

  // Generate short name and English-friendly name for non-English restaurants
  const originalName = place.displayName?.text || 'Restaurant';
  // Check for non-Latin scripts (CJK, Arabic, Thai, etc.) - not just accented characters
  const hasNonLatinScript = /[\u4E00-\u9FFF\uAC00-\uD7AF\u3040-\u309F\u30A0-\u30FF\u0600-\u06FF\u0E00-\u0E7F]/.test(originalName);
  
  let shortName = originalName.split(' ').slice(0, 2).join(' ');
  let displayName = originalName;
  
  // If name has non-Latin script characters, create English-friendly version
  if (hasNonLatinScript) {
    // Try to extract English text from the name if it exists
    const englishMatch = originalName.match(/[A-Za-z][A-Za-z\s&']+/);
    if (englishMatch) {
      shortName = englishMatch[0].trim().split(' ').slice(0, 2).join(' ');
      // Keep original name, but add English in parentheses for better SEO
      displayName = `${originalName} (${shortName})`;
    } else {
      // Create descriptive name from cuisine and location
      const cuisineTypes = place.types || [];
      const cuisineType = cuisineTypes.find(t => t.includes('restaurant') || t.includes('food')) || 'Restaurant';
      const cuisineName = cuisineType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      const addressParts = place.formattedAddress?.split(',') || [];
      const location = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : '';
      
      shortName = location ? `${cuisineName} in ${location}` : cuisineName;
      // Add English-friendly name in parentheses to original name
      displayName = `${originalName} (${shortName})`;
    }
  }

  return {
    google_place_id: place.id,
    destination_id: destinationId,
    slug: slug,
    name: displayName, // Keep original name (may contain non-ASCII)
    short_name: shortName, // Use English-friendly version for short_name
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
    
    google_data: place,
  };
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const destinationId = args[0];
  const query = args[1] || `restaurants in ${destinationId}`;
  const location = args[2];

  if (!destinationId) {
    console.error('Usage: node scripts/fetch-restaurants-from-google-places.js <destinationId> [query] [location]');
    console.error('Example: node scripts/fetch-restaurants-from-google-places.js aruba "restaurants in Aruba" "12.5211,-69.9683"');
    process.exit(1);
  }

  console.log(`Fetching restaurants for destination: ${destinationId}`);
  console.log(`Query: ${query}`);
  if (location) console.log(`Location: ${location}`);

  try {
    const places = await searchRestaurants(query, location);
    console.log(`Found ${places.length} restaurants`);

    const results = [];
    for (const place of places) {
      try {
        console.log(`\nProcessing: ${place.displayName?.text}`);
        
        // Get full details
        const placeDetails = await getPlaceDetails(place.id);
        const formattedData = formatRestaurantData(placeDetails, destinationId);
        
        // Check if exists by google_place_id
        const { data: existing } = await supabase
          .from('restaurants')
          .select('id, slug')
          .eq('google_place_id', place.id)
          .single();
        
        // Check if slug already exists for this destination (to avoid conflicts)
        // Only check if this is a new restaurant (not updating existing)
        if (!existing) {
          const { data: slugConflict } = await supabase
            .from('restaurants')
            .select('id')
            .eq('destination_id', destinationId)
            .eq('slug', formattedData.slug)
            .single();
          
          // If slug conflict exists, append a number or use google_place_id suffix
          if (slugConflict) {
            const baseSlug = formattedData.slug.replace(`-${destinationId}`, ''); // Remove destination suffix
            let counter = 1;
            let newSlug = `${baseSlug}-${counter}-${destinationId}`;
            
            // Keep checking until we find a unique slug
            let checkResult = await supabase
              .from('restaurants')
              .select('id')
              .eq('destination_id', destinationId)
              .eq('slug', newSlug)
              .single();
            
            while (checkResult.data) {
              counter++;
              newSlug = `${baseSlug}-${counter}-${destinationId}`;
              checkResult = await supabase
                .from('restaurants')
                .select('id')
                .eq('destination_id', destinationId)
                .eq('slug', newSlug)
                .single();
            }
            
            formattedData.slug = newSlug;
            console.log(`  ⚠️  Slug conflict resolved: ${formattedData.slug} → ${newSlug}`);
          }
        }

        if (existing) {
          const { data, error } = await supabase
            .from('restaurants')
            .update({
              ...formattedData,
              data_updated_at: new Date().toISOString(),
            })
            .eq('google_place_id', place.id)
            .select()
            .single();

          if (error) throw error;
          console.log(`  ✓ Updated: ${formattedData.name}`);
          results.push({ action: 'updated', name: formattedData.name });
        } else {
          const { data, error } = await supabase
            .from('restaurants')
            .insert({
              ...formattedData,
              is_active: true,
            })
            .select()
            .single();

          if (error) throw error;
          console.log(`  ✓ Created: ${formattedData.name}`);
          results.push({ action: 'created', name: formattedData.name });
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        results.push({ action: 'error', error: error.message });
      }
    }

    console.log(`\n✅ Complete! Processed ${results.length} restaurants`);
    console.log(`Created: ${results.filter(r => r.action === 'created').length}`);
    console.log(`Updated: ${results.filter(r => r.action === 'updated').length}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

