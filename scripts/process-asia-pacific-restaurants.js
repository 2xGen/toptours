/**
 * Process Asia-Pacific destinations
 * Fetches restaurants and generates SEO content
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Asia-Pacific destinations with coordinates
const asiaPacificDestinations = [
  // Japan
  { id: 'tokyo', query: 'restaurants in Tokyo', location: '35.6762,139.6503' },
  { id: 'kyoto', query: 'restaurants in Kyoto', location: '35.0116,135.7681' },
  { id: 'osaka', query: 'restaurants in Osaka', location: '34.6937,135.5023' },
  { id: 'hiroshima', query: 'restaurants in Hiroshima', location: '34.3853,132.4553' },
  { id: 'hokkaido', query: 'restaurants in Hokkaido', location: '43.0642,141.3469' },
  
  // Thailand
  { id: 'bangkok', query: 'restaurants in Bangkok', location: '13.7563,100.5018' },
  { id: 'chiang-mai', query: 'restaurants in Chiang Mai', location: '18.7883,98.9853' },
  { id: 'phuket', query: 'restaurants in Phuket', location: '7.8804,98.3923' },
  { id: 'krabi', query: 'restaurants in Krabi', location: '8.0863,98.9063' },
  { id: 'koh-samui', query: 'restaurants in Koh Samui', location: '9.5120,100.0133' },
  
  // Indonesia
  { id: 'bali', query: 'restaurants in Bali', location: '-8.3405,115.0920' },
  { id: 'jakarta', query: 'restaurants in Jakarta', location: '-6.2088,106.8456' },
  { id: 'yogyakarta', query: 'restaurants in Yogyakarta', location: '-7.7956,110.3695' },
  { id: 'gili-islands', query: 'restaurants in Gili Islands', location: '-8.3500,116.0400' },
  
  // Vietnam
  { id: 'hanoi', query: 'restaurants in Hanoi', location: '21.0285,105.8542' },
  { id: 'ho-chi-minh-city', query: 'restaurants in Ho Chi Minh City', location: '10.8231,106.6297' },
  { id: 'hoi-an', query: 'restaurants in Hoi An', location: '15.8801,108.3380' },
  { id: 'halong-bay', query: 'restaurants in Halong Bay', location: '20.9101,107.1839' },
  
  // Malaysia
  { id: 'kuala-lumpur', query: 'restaurants in Kuala Lumpur', location: '3.1390,101.6869' },
  { id: 'langkawi', query: 'restaurants in Langkawi', location: '6.3500,99.8000' },
  { id: 'penang', query: 'restaurants in Penang', location: '5.4164,100.3327' },
  
  // Singapore
  { id: 'singapore', query: 'restaurants in Singapore', location: '1.3521,103.8198' },
  
  // China
  { id: 'beijing', query: 'restaurants in Beijing', location: '39.9042,116.4074' },
  { id: 'shanghai', query: 'restaurants in Shanghai', location: '31.2304,121.4737' },
  { id: 'xian', query: 'restaurants in Xi\'an', location: '34.3416,108.9398' },
  { id: 'guilin', query: 'restaurants in Guilin', location: '25.2345,110.1800' },
  
  // South Korea
  { id: 'seoul', query: 'restaurants in Seoul', location: '37.5665,126.9780' },
  { id: 'busan', query: 'restaurants in Busan', location: '35.1796,129.0756' },
  { id: 'jeju-island', query: 'restaurants in Jeju Island', location: '33.4996,126.5312' },
  
  // Philippines
  { id: 'manila', query: 'restaurants in Manila', location: '14.5995,120.9842' },
  { id: 'cebu', query: 'restaurants in Cebu', location: '10.3157,123.8854' },
  { id: 'palawan', query: 'restaurants in Palawan', location: '9.8349,118.7384' },
  { id: 'boracay', query: 'restaurants in Boracay', location: '11.9674,121.9248' },
  
  // India
  { id: 'new-delhi', query: 'restaurants in New Delhi', location: '28.6139,77.2090' },
  { id: 'jaipur', query: 'restaurants in Jaipur', location: '26.9124,75.7873' },
  { id: 'mumbai', query: 'restaurants in Mumbai', location: '19.0760,72.8777' },
  { id: 'goa', query: 'restaurants in Goa', location: '15.2993,74.1240' },
  { id: 'kerala', query: 'restaurants in Kerala', location: '10.8505,76.2711' },
  
  // Australia
  { id: 'melbourne', query: 'restaurants in Melbourne', location: '-37.8136,144.9631' },
  { id: 'cairns', query: 'restaurants in Cairns', location: '-16.9186,145.7781' },
  { id: 'gold-coast', query: 'restaurants in Gold Coast', location: '-28.0167,153.4000' },
  { id: 'perth', query: 'restaurants in Perth', location: '-31.9505,115.8605' },
  
  // New Zealand
  { id: 'auckland', query: 'restaurants in Auckland', location: '-36.8485,174.7633' },
  { id: 'queenstown', query: 'restaurants in Queenstown', location: '-45.0312,168.6626' },
  { id: 'rotorua', query: 'restaurants in Rotorua', location: '-38.1368,176.2497' },
  { id: 'wellington', query: 'restaurants in Wellington', location: '-41.2865,174.7762' },
  
  // Fiji
  { id: 'nadi', query: 'restaurants in Nadi', location: '-17.7992,177.4161' },
  { id: 'denarau-island', query: 'restaurants in Denarau Island', location: '-17.7778,177.3889' },
  { id: 'mamanuca-islands', query: 'restaurants in Mamanuca Islands', location: '-17.8000,177.2000' },
  
  // French Polynesia
  { id: 'bora-bora', query: 'restaurants in Bora Bora', location: '-16.5004,-151.7415' },
  { id: 'tahiti', query: 'restaurants in Tahiti', location: '-17.6509,-149.4260' },
  { id: 'moorea', query: 'restaurants in Moorea', location: '-17.5388,-149.8295' },
];

async function processDestination(dest, index, total) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[${index + 1}/${total}] Processing: ${dest.id}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Step 1: Fetch restaurants
    console.log(`📥 Fetching restaurants for ${dest.id}...`);
    const fetchCmd = `node scripts/fetch-restaurants-from-google-places.js "${dest.id}" "${dest.query}" "${dest.location}"`;
    const { stdout: fetchOutput, stderr: fetchError } = await execAsync(fetchCmd);
    console.log(fetchOutput);
    if (fetchError) console.error('Fetch error:', fetchError);

    // Wait a bit between API calls
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Generate SEO content
    console.log(`\n📝 Generating SEO content for ${dest.id}...`);
    const seoCmd = `node scripts/generate-restaurant-seo-content.js ${dest.id}`;
    const { stdout: seoOutput, stderr: seoError } = await execAsync(seoCmd);
    console.log(seoOutput);
    if (seoError) console.error('SEO error:', seoError);

    console.log(`\n✅ Completed: ${dest.id}\n`);
  } catch (error) {
    console.error(`❌ Error processing ${dest.id}:`, error.message);
    console.log(`Continuing with next destination...\n`);
  }
}

async function main() {
  console.log(`🚀 Starting batch processing of ${asiaPacificDestinations.length} Asia-Pacific destinations...\n`);

  for (let i = 0; i < asiaPacificDestinations.length; i++) {
    await processDestination(asiaPacificDestinations[i], i, asiaPacificDestinations.length);
    
    // Rate limiting between destinations
    if (i < asiaPacificDestinations.length - 1) {
      console.log('⏳ Waiting 3 seconds before next destination...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 All Asia-Pacific destinations processed!`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error);

