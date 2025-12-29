/**
 * Test script to fetch one tour from Aruba (destination ID 28)
 * to inspect the API response structure for enhanced match scoring
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const VIATOR_API_KEY = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
const ARUBA_DESTINATION_ID = '28';

async function testViatorAPI() {
  console.log('🔍 Testing Viator API for Aruba (Destination ID: 28)\n');
  console.log('Requesting 1 tour to inspect response structure...\n');

  const payload = {
    filtering: {
      destination: ARUBA_DESTINATION_ID,
    },
    sorting: {
      sort: 'TRAVELER_RATING',
      order: 'DESCENDING',
    },
    pagination: {
      start: 1,
      count: 1, // Just get 1 tour to see the structure
    },
    currency: 'USD',
  };

  try {
    const response = await fetch('https://api.viator.com/partner/products/search', {
      method: 'POST',
      headers: {
        'exp-api-key': VIATOR_API_KEY,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, response.statusText);
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('✅ API Response Received\n');
    console.log('='.repeat(80));
    console.log('FULL RESPONSE STRUCTURE:');
    console.log('='.repeat(80));
    console.log(JSON.stringify(data, null, 2));
    
    if (data.products && data.products.length > 0) {
      const tour = data.products[0];
      
      console.log('\n' + '='.repeat(80));
      console.log('SINGLE TOUR OBJECT (First Result):');
      console.log('='.repeat(80));
      console.log(JSON.stringify(tour, null, 2));
      
      console.log('\n' + '='.repeat(80));
      console.log('KEY FIELDS FOR MATCH SCORING:');
      console.log('='.repeat(80));
      
      // Extract key fields for match scoring
      const keyFields = {
        productId: tour.productId || tour.productCode,
        title: tour.title,
        description: {
          summary: tour.description?.summary?.substring(0, 200) + '...',
          shortDescription: tour.description?.shortDescription?.substring(0, 200) + '...',
        },
        pricing: {
          summary: tour.pricing?.summary,
          lowestPrice: tour.pricing?.lowestPrice,
          highestPrice: tour.pricing?.highestPrice,
        },
        reviews: {
          combinedAverageRating: tour.reviews?.combinedAverageRating,
          totalReviews: tour.reviews?.totalReviews,
          reviewCountTotals: tour.reviews?.reviewCountTotals,
        },
        tags: tour.tags || [],
        durationInMinutes: tour.durationInMinutes,
        flags: tour.flags || [],
        images: {
          count: tour.images?.length || 0,
          firstImageVariants: tour.images?.[0]?.variants?.map(v => ({
            width: v.width,
            height: v.height,
            url: v.url?.substring(0, 80) + '...',
          })) || [],
        },
        // Additional fields that might be useful
        productUrl: tour.productUrl,
        destination: tour.destination,
        categories: tour.categories,
        bookingQuestions: tour.bookingQuestions,
      };
      
      console.log(JSON.stringify(keyFields, null, 2));
      
      console.log('\n' + '='.repeat(80));
      console.log('MATCH SCORING OPPORTUNITIES:');
      console.log('='.repeat(80));
      console.log(`
1. RATING BOOST:
   - combinedAverageRating: ${tour.reviews?.combinedAverageRating || 'N/A'}
   - totalReviews: ${tour.reviews?.totalReviews || 'N/A'}
   - Can boost match score by 0-20 points based on rating (4.0-5.0 scale)

2. PRICE MATCHING:
   - fromPrice: ${tour.pricing?.summary?.fromPrice || 'N/A'} ${tour.pricing?.summary?.currency || 'USD'}
   - lowestPrice: ${tour.pricing?.lowestPrice || 'N/A'}
   - highestPrice: ${tour.pricing?.highestPrice || 'N/A'}
   - Can match against user's budgetComfort preference (25/50/75/85)

3. TITLE KEYWORDS:
   - Title: "${tour.title || 'N/A'}"
   - Can extract keywords like "adventure", "relaxing", "private", etc.
   - Simple keyword matching for +0-5 points

4. DURATION:
   - durationInMinutes: ${tour.durationInMinutes || 'N/A'}
   - Can match against user's time preference (half-day vs full-day)

5. FLAGS:
   - flags: ${JSON.stringify(tour.flags || [])}
   - INSTANT_CONFIRMATION, MOBILE_TICKET, etc. can be preference signals

6. TAGS (Current System):
   - tags: ${JSON.stringify(tour.tags || [])}
   - Already used in current match scoring (60% weight)
      `);
    } else {
      console.log('\n⚠️  No tours found in response');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.name === 'AbortError') {
      console.error('Request timed out (exceeded 120 seconds)');
    }
  }
}

testViatorAPI();

