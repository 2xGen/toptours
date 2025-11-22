/**
 * Script to export Viator destinations from Supabase to a static JSON file
 * This avoids making API calls on every page load
 */

// Load environment variables from .env.local FIRST (before any other imports)
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { writeFileSync } from 'fs';

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

async function exportDestinationsToJson() {
  try {
    // Dynamic import after env vars are loaded
    const { createSupabaseServiceRoleClient } = await import('../src/lib/supabaseClient.js');
    const supabase = createSupabaseServiceRoleClient();
    
    console.log('📡 Fetching all destinations from Supabase...\n');
    
    // Fetch all destinations with pagination (Supabase limit is 1000 per query)
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
        console.error('Error fetching destinations:', error);
        break;
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        page++;
        console.log(`   Fetched ${allData.length} destinations...`);
        // If we got less than pageSize, we've reached the end
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    // Extract destination data from cache
    const destinations = allData
      .map(item => {
        const destData = item.tour_data;
        // Handle both destinationName and name fields
        const destinationName = destData?.destinationName || destData?.name;
        if (destData && destinationName) {
          return {
            destinationId: item.cache_key,
            destinationName: destinationName,
            type: destData.type || null,
            parentDestinationId: destData.parentDestinationId || null,
            timeZone: destData.timeZone || null,
            languages: destData.languages || null,
            countryCallingCode: destData.countryCallingCode || null,
            center: destData.center || null,
          };
        }
        return null;
      })
      .filter(Boolean);

    // Write to JSON file
    const outputPath = resolve(__dirname, '../src/data/viatorDestinations.json');
    writeFileSync(outputPath, JSON.stringify(destinations, null, 2), 'utf8');
    
    console.log(`\n✅ Exported ${destinations.length} destinations to ${outputPath}`);
    console.log('============================================================');
    console.log('📊 SUMMARY');
    console.log('============================================================');
    console.log(`✅ Destinations exported: ${destinations.length}`);
    console.log(`📁 File: src/data/viatorDestinations.json`);
    console.log('============================================================\n');
    
    return destinations;
  } catch (error) {
    console.error('❌ Error exporting destinations:', error);
    throw error;
  }
}

// Run the export
exportDestinationsToJson()
  .then(() => {
    console.log('✅ Export complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Export failed:', error);
    process.exit(1);
  });

