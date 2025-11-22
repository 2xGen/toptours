/**
 * Script to fetch all destinations from Viator API and store them in Supabase
 * This allows us to have all destinations available for search without API calls
 */

// Load environment variables from .env.local FIRST (before any other imports)
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file - must be done before importing supabaseClient
const envPath = resolve(__dirname, '../.env.local');
const result = config({ path: envPath });

if (result.error) {
  console.warn(`Warning: Could not load .env.local from ${envPath}`);
  console.warn('Attempting to load from default location...');
  config(); // Try default .env location
} else {
  console.log(`✅ Loaded environment variables from ${envPath}`);
}

const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';

async function fetchAllViatorDestinations() {
  try {
    console.log('📡 Fetching all destinations from Viator API...\n');
    
    const response = await fetch('https://api.viator.com/partner/destinations', {
      method: 'GET',
      headers: {
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'exp-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch destinations: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const destinations = data.destinations || [];
    
    console.log(`✅ Fetched ${destinations.length} destinations from Viator\n`);
    
    return destinations;
  } catch (error) {
    console.error('❌ Error fetching destinations:', error);
    throw error;
  }
}

async function storeDestinationsInSupabase(destinations) {
  // Dynamic import after env vars are loaded
  const { createSupabaseServiceRoleClient } = await import('../src/lib/supabaseClient.js');
  const supabase = createSupabaseServiceRoleClient();
  
  console.log('💾 Storing destinations in Supabase...\n');
  
  let stored = 0;
  let errors = 0;
  
    for (const dest of destinations) {
      try {
        // Handle both destinationId and id fields
        const destinationId = dest.destinationId?.toString() || dest.id?.toString() || '';
        // Handle both destinationName and name fields
        const destinationName = dest.destinationName || dest.name || '';
        
        if (!destinationId || !destinationName) {
          console.warn(`   Skipping invalid destination:`, dest);
          continue; // Skip invalid destinations
        }
      
      // Store in viator_cache with cache_type = 'destination' and cache_key = destinationId
      // Use explicit update/insert to ensure all fields are updated
      const { data: existing } = await supabase
        .from('viator_cache')
        .select('id')
        .eq('cache_key', destinationId)
        .eq('cache_type', 'destination')
        .maybeSingle();

      const tourData = {
        destinationId: destinationId,
        destinationName: destinationName,
        name: dest.name || destinationName, // Store both for compatibility
        type: dest.type || null,
        parentDestinationId: dest.parentDestinationId || null,
        timeZone: dest.timeZone || null,
        languages: dest.languages || null,
        countryCallingCode: dest.countryCallingCode || null,
        center: dest.center || null,
      };

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('viator_cache')
          .update({
            tour_data: tourData,
            cached_at: new Date().toISOString(),
          })
          .eq('cache_key', destinationId)
          .eq('cache_type', 'destination');
        
        if (error) {
          console.warn(`   Warning updating destination ${destinationId}:`, error.message);
        }
      } else {
        // Insert new record
        const { error } = await supabase
          .from('viator_cache')
          .insert({
            cache_key: destinationId,
            cache_type: 'destination',
            tour_data: tourData,
            cached_at: new Date().toISOString(),
          });
        
        if (error) {
          console.warn(`   Warning inserting destination ${destinationId}:`, error.message);
        }
      }
      
      stored++;
      
      if (stored % 100 === 0) {
        console.log(`   Stored ${stored}/${destinations.length} destinations...`);
      }
    } catch (error) {
      errors++;
      console.error(`   Error storing destination ${dest.destinationId}:`, error.message);
    }
  }
  
  console.log(`\n✅ Stored ${stored} destinations`);
  if (errors > 0) {
    console.log(`⚠️  ${errors} errors occurred`);
  }
  
  return { stored, errors };
}

async function exportToJson(destinations) {
  try {
    // Dynamic import after env vars are loaded
    const { createSupabaseServiceRoleClient } = await import('../src/lib/supabaseClient.js');
    const supabase = createSupabaseServiceRoleClient();
    const { writeFileSync } = await import('fs');
    const { resolve } = await import('path');
    const { fileURLToPath } = await import('url');
    const { dirname } = await import('path');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    console.log('\n📄 Exporting destinations to JSON...\n');
    
    // Fetch all stored destinations from Supabase
    let allData = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('viator_cache')
        .select('cache_key, tour_data, cached_at')
        .eq('cache_type', 'destination')
        .neq('cache_key', 'destinations_list')
        .order('cached_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error('Error fetching destinations for export:', error);
        break;
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        page++;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    // Extract destination data
    const exportedDestinations = allData
      .map(item => {
        const destData = item.tour_data;
        const destinationName = destData?.destinationName || destData?.name;
        if (destData && destinationName) {
          return {
            destinationId: item.cache_key,
            destinationName: destinationName,
            type: destData.type || null,
            parentDestinationId: destData.parentDestinationId || null,
          };
        }
        return null;
      })
      .filter(Boolean);

    // Write to JSON file
    const outputPath = resolve(__dirname, '../src/data/viatorDestinations.json');
    writeFileSync(outputPath, JSON.stringify(exportedDestinations, null, 2), 'utf8');
    
    console.log(`✅ Exported ${exportedDestinations.length} destinations to JSON`);
    return exportedDestinations.length;
  } catch (error) {
    console.error('⚠️  Error exporting to JSON:', error.message);
    return 0;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Viator destinations import...\n');
    
    const destinations = await fetchAllViatorDestinations();
    const result = await storeDestinationsInSupabase(destinations);
    
    // Export to JSON after storing
    const exportedCount = await exportToJson(destinations);
    
    console.log('\n============================================================');
    console.log('📊 SUMMARY');
    console.log('============================================================');
    console.log(`✅ Destinations fetched: ${destinations.length}`);
    console.log(`✅ Destinations stored: ${result.stored}`);
    if (exportedCount > 0) {
      console.log(`✅ Destinations exported to JSON: ${exportedCount}`);
    }
    if (result.errors > 0) {
      console.log(`⚠️  Errors: ${result.errors}`);
    }
    console.log('============================================================\n');
    
    console.log('✅ Import complete!');
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

main();

