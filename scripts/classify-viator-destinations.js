/**
 * Script to classify Viator destinations into regions and countries
 * Uses timezone, language codes, and other data from Viator API
 * Optionally uses OpenAI for ambiguous cases
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = resolve(__dirname, '../.env.local');
config({ path: envPath });

// Region mapping based on timezone patterns
const timezoneToRegion = {
  'Europe/': 'Europe',
  'America/New_York': 'North America',
  'America/Chicago': 'North America',
  'America/Denver': 'North America',
  'America/Los_Angeles': 'North America',
  'America/Toronto': 'North America',
  'America/Mexico': 'North America',
  'America/': 'North America', // Fallback for other Americas
  'Asia/': 'Asia-Pacific',
  'Pacific/': 'Asia-Pacific',
  'Australia/': 'Asia-Pacific',
  'Africa/': 'Africa',
  'Atlantic/': 'Caribbean', // Many Caribbean islands
};

// Country code to region mapping (from language codes)
const countryCodeToRegion = {
  'US': 'North America',
  'CA': 'North America',
  'MX': 'North America',
  'BZ': 'North America', // Belize
  'CR': 'North America', // Costa Rica
  'GT': 'North America', // Guatemala
  'HN': 'North America', // Honduras
  'NI': 'North America', // Nicaragua
  'PA': 'North America', // Panama
  'JM': 'Caribbean', // Jamaica
  'BS': 'Caribbean', // Bahamas
  'BB': 'Caribbean', // Barbados
  'CU': 'Caribbean', // Cuba
  'DO': 'Caribbean', // Dominican Republic
  'HT': 'Caribbean', // Haiti
  'TT': 'Caribbean', // Trinidad and Tobago
  'AW': 'Caribbean', // Aruba
  'CW': 'Caribbean', // Curaçao
  'KY': 'Caribbean', // Cayman Islands
  'VG': 'Caribbean', // British Virgin Islands
  'BR': 'South America', // Brazil
  'AR': 'South America', // Argentina
  'CL': 'South America', // Chile
  'CO': 'South America', // Colombia
  'PE': 'South America', // Peru
  'EC': 'South America', // Ecuador
  'VE': 'South America', // Venezuela
  'UY': 'South America', // Uruguay
  'PY': 'South America', // Paraguay
  'BO': 'South America', // Bolivia
  'CN': 'Asia-Pacific', // China
  'JP': 'Asia-Pacific', // Japan
  'KR': 'Asia-Pacific', // South Korea
  'TH': 'Asia-Pacific', // Thailand
  'VN': 'Asia-Pacific', // Vietnam
  'ID': 'Asia-Pacific', // Indonesia
  'MY': 'Asia-Pacific', // Malaysia
  'SG': 'Asia-Pacific', // Singapore
  'PH': 'Asia-Pacific', // Philippines
  'IN': 'Asia-Pacific', // India
  'MM': 'Asia-Pacific', // Myanmar
  'KH': 'Asia-Pacific', // Cambodia
  'LA': 'Asia-Pacific', // Laos
  'AE': 'Middle East', // UAE
  'SA': 'Middle East', // Saudi Arabia
  'IL': 'Middle East', // Israel
  'JO': 'Middle East', // Jordan
  'LB': 'Middle East', // Lebanon
  'OM': 'Middle East', // Oman
  'QA': 'Middle East', // Qatar
  'EG': 'Middle East', // Egypt (sometimes)
  'TR': 'Middle East', // Turkey (sometimes)
  'ZA': 'Africa', // South Africa
  'KE': 'Africa', // Kenya
  'TZ': 'Africa', // Tanzania
  'MA': 'Africa', // Morocco
  'ET': 'Africa', // Ethiopia
  'NA': 'Africa', // Namibia
};

// Known country names
const countryNames = new Set([
  'United States', 'USA', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile',
  'Colombia', 'Peru', 'Ecuador', 'Venezuela', 'Uruguay', 'Paraguay', 'Bolivia',
  'United Kingdom', 'UK', 'France', 'Germany', 'Italy', 'Spain', 'Portugal',
  'Greece', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Poland',
  'Czech Republic', 'Hungary', 'Romania', 'Croatia', 'Ireland', 'Norway',
  'Sweden', 'Denmark', 'Finland', 'Iceland', 'Russia', 'Turkey',
  'China', 'Japan', 'South Korea', 'Thailand', 'Vietnam', 'Indonesia',
  'Malaysia', 'Singapore', 'Philippines', 'India', 'Myanmar', 'Cambodia',
  'Laos', 'Australia', 'New Zealand', 'Fiji', 'Vanuatu', 'Papua New Guinea',
  'UAE', 'United Arab Emirates', 'Saudi Arabia', 'Israel', 'Jordan', 'Lebanon',
  'Oman', 'Qatar', 'Egypt', 'South Africa', 'Kenya', 'Tanzania', 'Morocco',
  'Ethiopia', 'Namibia', 'Jamaica', 'Bahamas', 'Barbados', 'Cuba',
  'Dominican Republic', 'Haiti', 'Trinidad and Tobago', 'Aruba', 'Curaçao',
  'Cayman Islands', 'British Virgin Islands', 'Belize', 'Costa Rica',
  'Guatemala', 'Honduras', 'Nicaragua', 'Panama'
]);

function classifyDestination(dest) {
  const name = (dest.destinationName || dest.name || '').toLowerCase();
  const timezone = dest.timeZone || '';
  const languages = dest.languages || [];
  const type = dest.type || '';
  
  // Extract country code from language (e.g., "en-US" -> "US")
  const countryCode = languages.length > 0 
    ? languages[0].split('-')[1]?.toUpperCase() 
    : null;
  
  let region = null;
  let country = null;
  
  // Method 1: Check if destination name is a known country
  if (countryNames.has(dest.destinationName) || countryNames.has(dest.name)) {
    country = dest.destinationName || dest.name;
    // Determine region from country
    if (countryCodeToRegion[countryCode]) {
      region = countryCodeToRegion[countryCode];
    }
  }
  
  // Method 2: Use country code from language
  if (!region && countryCode && countryCodeToRegion[countryCode]) {
    region = countryCodeToRegion[countryCode];
  }
  
  // Method 3: Use timezone patterns
  if (!region && timezone) {
    for (const [pattern, reg] of Object.entries(timezoneToRegion)) {
      if (timezone.startsWith(pattern)) {
        region = reg;
        break;
      }
    }
  }
  
  // Method 4: Special cases based on name patterns
  if (!region) {
    if (name.includes('caribbean') || name.includes('west indies')) {
      region = 'Caribbean';
    } else if (name.includes('europe') || name.includes('eastern europe')) {
      region = 'Europe';
    } else if (name.includes('asia') || name.includes('pacific')) {
      region = 'Asia-Pacific';
    } else if (name.includes('africa') || name.includes('safari')) {
      region = 'Africa';
    } else if (name.includes('middle east') || name.includes('gulf')) {
      region = 'Middle East';
    }
  }
  
  return { region, country: country || null, confidence: region ? 'medium' : 'low' };
}

async function classifyWithOpenAI(destinations, useOpenAI = false) {
  // First, classify all destinations with basic method
  const preClassified = destinations.map(dest => ({
    ...dest,
    ...classifyDestination(dest)
  }));
  
  if (!useOpenAI) {
    return preClassified;
  }
  
  // OpenAI classification for ALL destinations (faster than checking each one)
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // Classify all destinations with OpenAI for accuracy
  const ambiguous = preClassified;
  
  if (ambiguous.length === 0) {
    return destinations.map(dest => ({
      ...dest,
      ...classifyDestination(dest)
    }));
  }
  
  console.log(`\n🤖 Classifying ${ambiguous.length} ambiguous destinations with OpenAI...\n`);
  
  // Batch process (200 at a time for faster processing)
  const batchSize = 200;
  const totalBatches = Math.ceil(ambiguous.length / batchSize);
  
  for (let i = 0; i < ambiguous.length; i += batchSize) {
    const batch = ambiguous.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    // Create a more compact prompt
    const destinationsList = batch.map(d => 
      `${d.destinationId}:${d.destinationName || d.name}`
    ).join(', ');
    
    const prompt = `For each destination, return its region and country. Regions: Europe, North America, Caribbean, Asia-Pacific, Africa, South America, Middle East.

Return ONLY a JSON array. Format: [{"destinationId":"906","region":"North America","country":"United States"},...]

Destinations:
${destinationsList}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 4000,
      });
      
      const content = response.choices[0].message.content.trim();
      let result;
      
      // Extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
      
      // Update destinations
      if (Array.isArray(result)) {
        let updated = 0;
        result.forEach((item) => {
          const dest = destinations.find(d => d.destinationId?.toString() === item.destinationId?.toString());
          if (dest && item.region) {
            dest.region = item.region;
            dest.country = item.country || null;
            dest.confidence = 'high';
            updated++;
          }
        });
        console.log(`   ✅ Batch ${batchNum}/${totalBatches} (${updated}/${batch.length} classified)`);
      }
    } catch (error) {
      console.error(`   ❌ Error batch ${batchNum}:`, error.message);
      // Continue with next batch
    }
  }
  
  return destinations.map(dest => ({
    ...dest,
    ...(dest.region ? {} : classifyDestination(dest))
  }));
}

async function main() {
  const useOpenAI = process.argv.includes('--openai');
  
  console.log('📊 Classifying Viator destinations...\n');
  
  // Load destinations from JSON
  const jsonPath = resolve(__dirname, '../src/data/viatorDestinations.json');
  const destinations = JSON.parse(readFileSync(jsonPath, 'utf8'));
  
  console.log(`📦 Loaded ${destinations.length} destinations\n`);
  
  // We need to fetch full destination data from Supabase or API to get timezone info
  // For now, let's use what we have and enhance with OpenAI if needed
  
  if (useOpenAI && !process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    process.exit(1);
  }
  
  // Classify destinations
  const classified = await classifyWithOpenAI(destinations, useOpenAI);
  
  // Count by region
  const regionCounts = {};
  classified.forEach(d => {
    const region = d.region || 'Unknown';
    regionCounts[region] = (regionCounts[region] || 0) + 1;
  });
  
  console.log('\n📊 Classification Results:');
  console.log('============================================================');
  Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([region, count]) => {
      console.log(`  ${region}: ${count}`);
    });
  console.log('============================================================\n');
  
  // Save classified destinations
  const outputPath = resolve(__dirname, '../src/data/viatorDestinationsClassified.json');
  writeFileSync(outputPath, JSON.stringify(classified, null, 2), 'utf8');
  
  console.log(`✅ Saved classified destinations to ${outputPath}`);
  
  if (useOpenAI) {
    // Estimate cost
    const ambiguousCount = classified.filter(d => !d.region || d.confidence === 'low').length;
    const estimatedCost = (ambiguousCount / 50) * 0.01; // Rough estimate
    console.log(`\n💰 Estimated OpenAI cost: ~$${estimatedCost.toFixed(4)}`);
  }
}

main().catch(console.error);

