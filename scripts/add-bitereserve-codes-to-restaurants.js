/**
 * Script to add BiteReserve codes to restaurants
 * 
 * This script:
 * 1. Adds country_iso_code (2-letter ISO) based on destination's country
 * 2. Generates random 5-digit codes (00001-99999) that are unique per country
 * 
 * Usage: node scripts/add-bitereserve-codes-to-restaurants.js
 * 
 * IMPORTANT: This does NOT change any links yet - it only prepares the data!
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Comprehensive country name to ISO code mapping
 * Handles various country name formats and aliases
 */
const countryToISO = {
  // North America
  'United States': 'US',
  'USA': 'US',
  'United States of America': 'US',
  'Canada': 'CA',
  'Mexico': 'MX',
  
  // Central America
  'Belize': 'BZ',
  'Costa Rica': 'CR',
  'El Salvador': 'SV',
  'Guatemala': 'GT',
  'Honduras': 'HN',
  'Nicaragua': 'NI',
  'Panama': 'PA',
  
  // Caribbean
  'Jamaica': 'JM',
  'The Bahamas': 'BS',
  'Bahamas': 'BS',
  'Barbados': 'BB',
  'Cuba': 'CU',
  'Dominican Republic': 'DO',
  'Haiti': 'HT',
  'Trinidad and Tobago': 'TT',
  'Trinidad & Tobago': 'TT',
  'Aruba': 'AW',
  'Curaçao': 'CW',
  'Curacao': 'CW',
  'Cayman Islands': 'KY',
  'British Virgin Islands': 'VG',
  'U.S. Virgin Islands': 'VI',
  'US Virgin Islands': 'VI',
  'Puerto Rico': 'PR',
  'Saint Kitts and Nevis': 'KN',
  'Saint Kitts & Nevis': 'KN',
  'St Kitts and Nevis': 'KN',
  'Antigua and Barbuda': 'AG',
  'Antigua & Barbuda': 'AG',
  
  // South America
  'Brazil': 'BR',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Peru': 'PE',
  'Ecuador': 'EC',
  'Venezuela': 'VE',
  'Uruguay': 'UY',
  'Paraguay': 'PY',
  'Bolivia': 'BO',
  
  // Europe
  'United Kingdom': 'GB',
  'UK': 'GB',
  'Great Britain': 'GB',
  'France': 'FR',
  'Germany': 'DE',
  'Italy': 'IT',
  'Spain': 'ES',
  'Portugal': 'PT',
  'Greece': 'GR',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Romania': 'RO',
  'Croatia': 'HR',
  'Ireland': 'IE',
  'Norway': 'NO',
  'Sweden': 'SE',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Iceland': 'IS',
  'Russia': 'RU',
  'Turkey': 'TR',
  
  // Asia-Pacific
  'China': 'CN',
  'Japan': 'JP',
  'South Korea': 'KR',
  'Korea': 'KR',
  'Thailand': 'TH',
  'Vietnam': 'VN',
  'Indonesia': 'ID',
  'Malaysia': 'MY',
  'Singapore': 'SG',
  'Philippines': 'PH',
  'India': 'IN',
  'Myanmar': 'MM',
  'Cambodia': 'KH',
  'Laos': 'LA',
  'Australia': 'AU',
  'New Zealand': 'NZ',
  'Fiji': 'FJ',
  'Vanuatu': 'VU',
  'Papua New Guinea': 'PG',
  
  // Middle East
  'United Arab Emirates': 'AE',
  'UAE': 'AE',
  'Saudi Arabia': 'SA',
  'Israel': 'IL',
  'Jordan': 'JO',
  'Lebanon': 'LB',
  'Oman': 'OM',
  'Qatar': 'QA',
  'Egypt': 'EG',
  
  // Africa
  'South Africa': 'ZA',
  'Kenya': 'KE',
  'Tanzania': 'TZ',
  'Morocco': 'MA',
  'Ethiopia': 'ET',
  'Namibia': 'NA',
};

/**
 * Extract ISO code from address_components JSON
 * Looks for country component with shortText (ISO code)
 */
function extractISOFromAddressComponents(addressComponents) {
  if (!addressComponents) return null;
  
  try {
    const components = typeof addressComponents === 'string' 
      ? JSON.parse(addressComponents) 
      : addressComponents;
    
    if (!Array.isArray(components)) return null;
    
    // Find country component
    const countryComponent = components.find(comp => 
      comp.types && comp.types.includes('country')
    );
    
    if (countryComponent && countryComponent.shortText) {
      return countryComponent.shortText.toUpperCase();
    }
  } catch (error) {
    // Invalid JSON, ignore
  }
  
  return null;
}

/**
 * Map destination slug to country name
 */
function getCountryFromDestinationSlug(slug) {
  const slugToCountry = {
    'aruba': 'Aruba',
    'curacao': 'Curaçao',
    'jamaica': 'Jamaica',
    'punta-cana': 'Dominican Republic',
    'santo-domingo': 'Dominican Republic',
    'nassau': 'The Bahamas',
    'exuma': 'The Bahamas',
    'barbados': 'Barbados',
    'st-lucia': 'Saint Lucia',
    'puerto-rico': 'Puerto Rico',
    'turks-and-caicos': 'Turks and Caicos',
    'grenada': 'Grenada',
    'st-martin': 'Saint Martin',
    'bonaire': 'Bonaire',
    'cayman-islands': 'Cayman Islands',
    'antigua-and-barbuda': 'Antigua and Barbuda',
    'trinidad-and-tobago': 'Trinidad and Tobago',
    'british-virgin-islands': 'British Virgin Islands',
    'st-kitts-and-nevis': 'Saint Kitts and Nevis',
    'martinique': 'Martinique',
    'guadeloupe': 'Guadeloupe',
    // Add more as needed
  };
  
  return slugToCountry[slug] || null;
}

/**
 * Get ISO code from country name (handles variations)
 */
function getISOCodeFromCountryName(countryName) {
  if (!countryName) return null;
  
  // Direct lookup
  if (countryToISO[countryName]) {
    return countryToISO[countryName];
  }
  
  // Case-insensitive lookup
  const normalized = countryName.trim();
  for (const [key, iso] of Object.entries(countryToISO)) {
    if (key.toLowerCase() === normalized.toLowerCase()) {
      return iso;
    }
  }
  
  // Try to extract from strings like "Dubai, UAE" -> "UAE"
  const commaMatch = countryName.match(/,\s*([^,]+)$/);
  if (commaMatch) {
    const lastPart = commaMatch[1].trim();
    if (countryToISO[lastPart]) {
      return countryToISO[lastPart];
    }
    // Case-insensitive
    for (const [key, iso] of Object.entries(countryToISO)) {
      if (key.toLowerCase() === lastPart.toLowerCase()) {
        return iso;
      }
    }
  }
  
  return null;
}

/**
 * Generate a random 5-digit code (00001-99999)
 */
function generateRandomCode() {
  const min = 1;
  const max = 99999;
  const code = Math.floor(Math.random() * (max - min + 1)) + min;
  return code.toString().padStart(5, '0');
}

/**
 * Fetch all rows from a table with pagination
 */
async function fetchAllRows(table, select = '*', batchSize = 1000) {
  let allData = [];
  let from = 0;
  let hasMore = true;
  
  while (hasMore) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + batchSize - 1);
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allData = allData.concat(data);
      from += batchSize;
      
      // If we got less than batchSize, we're done
      if (data.length < batchSize) {
        hasMore = false;
      }
    }
  }
  
  return allData;
}

/**
 * Get all used codes for a specific country (with pagination)
 * This is called once per country to build a cache
 */
async function getUsedCodesForCountry(isoCode) {
  let allCodes = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('bitereserve_code')
      .eq('country_iso_code', isoCode)
      .not('bitereserve_code', 'is', null)
      .range(from, from + batchSize - 1);
    
    if (error) {
      console.error(`Error fetching used codes for ${isoCode}:`, error);
      return new Set();
    }
    
    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allCodes = allCodes.concat(data.map(r => r.bitereserve_code).filter(Boolean));
      from += batchSize;
      
      if (data.length < batchSize) {
        hasMore = false;
      }
    }
  }
  
  return new Set(allCodes);
}

/**
 * Generate a unique random code for a country
 */
async function generateUniqueCodeForCountry(isoCode) {
  const usedCodes = await getUsedCodesForCountry(isoCode);
  let attempts = 0;
  const maxAttempts = 1000; // Safety limit
  
  while (attempts < maxAttempts) {
    const code = generateRandomCode();
    if (!usedCodes.has(code)) {
      return code;
    }
    attempts++;
  }
  
  throw new Error(`Could not generate unique code for ${isoCode} after ${maxAttempts} attempts`);
}

/**
 * Main function to process all restaurants
 */
async function main() {
  console.log('🚀 Starting BiteReserve code generation...\n');
  
  // Fetch all destinations first (with pagination)
  console.log('🌍 Fetching all destinations...');
  let destinations;
  try {
    destinations = await fetchAllRows('viator_destinations', 'id, country');
    console.log(`✅ Found ${destinations.length} destinations`);
  } catch (error) {
    console.error('❌ Error fetching destinations:', error);
    process.exit(1);
  }
  
  // Create a map of destination_id -> country
  const destinationCountryMap = {};
  destinations.forEach(dest => {
    if (dest.id && dest.country) {
      destinationCountryMap[dest.id] = dest.country;
    }
  });
  
  console.log(`✅ Mapped ${Object.keys(destinationCountryMap).length} destinations with countries\n`);
  
  // Fetch all restaurants with pagination (include address_components for ISO extraction)
  console.log('📊 Fetching all restaurants...');
  let restaurants;
  try {
    restaurants = await fetchAllRows('restaurants', 'id, destination_id, name, country_iso_code, bitereserve_code, address_components');
    console.log(`✅ Found ${restaurants.length} restaurants\n`);
  } catch (error) {
    console.error('❌ Error fetching restaurants:', error);
    process.exit(1);
  }
  
  // Group restaurants by country to build code caches efficiently
  console.log('🗺️  Grouping restaurants by country...');
  const restaurantsByCountry = {};
  const restaurantsNeedingUpdate = [];
  const unmappedRestaurants = [];
  
  for (const restaurant of restaurants) {
    // Skip if already has codes
    if (restaurant.country_iso_code && restaurant.bitereserve_code) {
      continue;
    }
    
    let isoCode = null;
    
    // Method 1: Extract from address_components (most reliable)
    if (restaurant.address_components) {
      isoCode = extractISOFromAddressComponents(restaurant.address_components);
    }
    
    // Method 2: Map destination_id slug to country, then to ISO
    if (!isoCode && restaurant.destination_id) {
      const countryName = getCountryFromDestinationSlug(restaurant.destination_id);
      if (countryName) {
        isoCode = getISOCodeFromCountryName(countryName);
      }
    }
    
    // Method 3: Try viator_destinations lookup (fallback)
    if (!isoCode) {
      const destinationCountry = destinationCountryMap[restaurant.destination_id];
      if (destinationCountry) {
        isoCode = getISOCodeFromCountryName(destinationCountry);
      }
    }
    
    if (!isoCode) {
      unmappedRestaurants.push({
        id: restaurant.id,
        name: restaurant.name,
        destination_id: restaurant.destination_id
      });
      continue;
    }
    
    // Add to processing list
    if (!restaurantsByCountry[isoCode]) {
      restaurantsByCountry[isoCode] = [];
    }
    restaurantsByCountry[isoCode].push(restaurant);
    restaurantsNeedingUpdate.push({ restaurant, isoCode });
  }
  
  console.log(`✅ Found ${restaurantsNeedingUpdate.length} restaurants needing codes across ${Object.keys(restaurantsByCountry).length} countries`);
  
  if (unmappedRestaurants.length > 0) {
    console.log(`⚠️  Warning: ${unmappedRestaurants.length} restaurants could not be mapped to ISO codes`);
    if (unmappedRestaurants.length <= 10) {
      console.log(`   Examples:`);
      unmappedRestaurants.slice(0, 5).forEach(r => {
        console.log(`     - ${r.name} (destination: ${r.destination_id})`);
      });
    }
  }
  console.log('');
  
  // Build code caches for each country
  console.log('🔢 Building code caches...');
  const codeCaches = {};
  for (const isoCode of Object.keys(restaurantsByCountry)) {
    codeCaches[isoCode] = await getUsedCodesForCountry(isoCode);
    console.log(`  ${isoCode}: ${codeCaches[isoCode].size} existing codes`);
  }
  console.log('');
  
  // Process restaurants in batches
  const batchSize = 50;
  let processed = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  const countryStats = {};
  
  console.log('🔄 Processing restaurants...\n');
  
  for (let i = 0; i < restaurantsNeedingUpdate.length; i += batchSize) {
    const batch = restaurantsNeedingUpdate.slice(i, i + batchSize);
    
    for (const { restaurant, isoCode } of batch) {
      try {
        // Check if already has codes (double-check)
        if (restaurant.country_iso_code && restaurant.bitereserve_code) {
          skipped++;
          continue;
        }
        
        // Generate unique code using the cache
        const usedCodes = codeCaches[isoCode];
        let code = restaurant.bitereserve_code;
        
        if (!code) {
          let attempts = 0;
          const maxAttempts = 1000;
          
          while (attempts < maxAttempts) {
            code = generateRandomCode();
            if (!usedCodes.has(code)) {
              usedCodes.add(code); // Add to cache
              break;
            }
            attempts++;
          }
          
          if (attempts >= maxAttempts) {
            throw new Error(`Could not generate unique code for ${isoCode} after ${maxAttempts} attempts`);
          }
        } else {
          // Code already exists, add to cache
          usedCodes.add(code);
        }
        
        // Update restaurant
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({
            country_iso_code: isoCode,
            bitereserve_code: code
          })
          .eq('id', restaurant.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${restaurant.name} (ID: ${restaurant.id}):`, updateError);
          errors++;
        } else {
          if (processed % 10 === 0 || processed < 10) {
            console.log(`✅ Updated ${restaurant.name} (ID: ${restaurant.id}) → ${isoCode}/${code}`);
          }
          updated++;
          
          // Track stats
          if (!countryStats[isoCode]) {
            countryStats[isoCode] = 0;
          }
          countryStats[isoCode]++;
        }
        
        processed++;
        
        // Small delay to avoid overwhelming the database
        if (processed % 50 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`❌ Error processing restaurant ${restaurant.id}:`, error);
        errors++;
      }
    }
    
    // Progress update
    if ((i + batchSize) % 100 === 0 || i + batchSize >= restaurantsNeedingUpdate.length) {
      console.log(`\n📈 Progress: ${Math.min(i + batchSize, restaurantsNeedingUpdate.length)}/${restaurantsNeedingUpdate.length} processed\n`);
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total restaurants in database: ${restaurants.length}`);
  console.log(`Restaurants needing codes: ${restaurantsNeedingUpdate.length}`);
  console.log(`Successfully updated: ${updated}`);
  console.log(`Skipped (already had codes): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log('\n📈 Updated By Country:');
  Object.entries(countryStats)
    .sort((a, b) => b[1] - a[1])
    .forEach(([iso, count]) => {
      console.log(`  ${iso}: ${count} restaurants`);
    });
  console.log('='.repeat(60));
  console.log('\n✅ Done! Remember: This did NOT change any links yet.');
  console.log('   The data is now ready for export to BiteReserve.');
  console.log(`   Format: bite.reserve/r/{iso_code}/{5_digit_code}`);
  console.log(`   Example: bite.reserve/r/nl/04480\n`);
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
