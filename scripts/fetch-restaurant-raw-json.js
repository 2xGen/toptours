/**
 * Script to fetch one restaurant from Google Places API and save raw JSON response
 * Usage: node scripts/fetch-restaurant-raw-json.js <placeId or searchQuery>
 * 
 * Example:
 * node scripts/fetch-restaurant-raw-json.js "ChIJxci8McU5hY4RMmMqEc6kDZc"
 * node scripts/fetch-restaurant-raw-json.js "The Vue Rooftop Aruba"
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyA9oGVujy1ntmAcRjXO7FngHxvOOK9lFKM';

// Google Places API functions
async function searchRestaurant(query, location = null) {
  const url = 'https://places.googleapis.com/v1/places:searchText';
  
  const body = {
    textQuery: query,
    maxResultCount: 1,
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
      'X-Goog-FieldMask': '*', // Get all fields
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Places API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function getPlaceDetails(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': '*', // Get all fields
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Places API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const input = args[0];
  const location = args[1]; // Optional location for search

  if (!input) {
    console.error('Usage: node scripts/fetch-restaurant-raw-json.js <placeId or searchQuery> [location]');
    console.error('Example: node scripts/fetch-restaurant-raw-json.js "ChIJxci8McU5hY4RMmMqEc6kDZc"');
    console.error('Example: node scripts/fetch-restaurant-raw-json.js "The Vue Rooftop Aruba" "12.5211,-69.9683"');
    process.exit(1);
  }

  try {
    let placeData;
    let placeId;

    // Check if input looks like a place ID (starts with ChIJ)
    if (input.startsWith('ChIJ')) {
      console.log(`Fetching place details for Place ID: ${input}`);
      placeData = await getPlaceDetails(input);
      placeId = input;
    } else {
      // It's a search query
      console.log(`Searching for: ${input}`);
      if (location) {
        console.log(`Location bias: ${location}`);
      }
      const searchResult = await searchRestaurant(input, location);
      
      if (!searchResult.places || searchResult.places.length === 0) {
        console.error('No restaurants found');
        process.exit(1);
      }

      placeId = searchResult.places[0].id;
      console.log(`Found restaurant: ${searchResult.places[0].displayName?.text}`);
      console.log(`Place ID: ${placeId}`);
      console.log(`\nFetching full details...`);
      
      // Get full details
      placeData = await getPlaceDetails(placeId);
    }

    // Save raw JSON to file
    const outputFile = join(__dirname, '..', 'restaurant-raw-response.json');
    const jsonData = {
      placeId: placeId,
      fetchedAt: new Date().toISOString(),
      searchQuery: input.startsWith('ChIJ') ? null : input,
      location: location || null,
      data: placeData,
    };

    fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2));
    
    console.log(`\n✅ Raw JSON response saved to: ${outputFile}`);
    console.log(`\nRestaurant: ${placeData.displayName?.text || 'N/A'}`);
    console.log(`Address: ${placeData.formattedAddress || 'N/A'}`);
    console.log(`Rating: ${placeData.rating || 'N/A'} (${placeData.userRatingCount || 0} reviews)`);
    console.log(`\n📋 Available fields in response:`);
    console.log(`- displayName: ${placeData.displayName ? '✅' : '❌'}`);
    console.log(`- formattedAddress: ${placeData.formattedAddress ? '✅' : '❌'}`);
    console.log(`- rating: ${placeData.rating ? '✅' : '❌'}`);
    console.log(`- userRatingCount: ${placeData.userRatingCount ? '✅' : '❌'}`);
    console.log(`- photos: ${placeData.photos ? `✅ (${placeData.photos.length} photos)` : '❌'}`);
    console.log(`- editorialSummary: ${placeData.editorialSummary ? '✅' : '❌'}`);
    console.log(`- reviews: ${placeData.reviews ? `✅ (${placeData.reviews.length} reviews)` : '❌'}`);
    console.log(`- regularOpeningHours: ${placeData.regularOpeningHours ? '✅' : '❌'}`);
    console.log(`- currentOpeningHours: ${placeData.currentOpeningHours ? '✅' : '❌'}`);
    console.log(`- priceLevel: ${placeData.priceLevel ? '✅' : '❌'}`);
    console.log(`- types: ${placeData.types ? `✅ (${placeData.types.length} types)` : '❌'}`);
    console.log(`- nationalPhoneNumber: ${placeData.nationalPhoneNumber ? '✅' : '❌'}`);
    console.log(`- websiteUri: ${placeData.websiteUri ? '✅' : '❌'}`);
    console.log(`- location: ${placeData.location ? '✅' : '❌'}`);
    
    // Show sample of key fields
    if (placeData.editorialSummary) {
      console.log(`\n📝 Editorial Summary (first 200 chars):`);
      console.log(placeData.editorialSummary.text?.substring(0, 200) || 'N/A');
    }
    
    if (placeData.reviews && placeData.reviews.length > 0) {
      console.log(`\n💬 Sample Review (first 200 chars):`);
      console.log(placeData.reviews[0].text?.text?.substring(0, 200) || 'N/A');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

