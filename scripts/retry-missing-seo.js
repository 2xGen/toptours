/**
 * Retry SEO generation for all restaurants missing SEO content
 * Processes in batches to avoid overwhelming the API
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getMissingSEO() {
  const { data, error } = await supabase
    .from('restaurants')
    .select('id, destination_id')
    .eq('is_active', true)
    .or('seo_title.is.null,meta_description.is.null,unique_content.is.null');

  if (error) {
    console.error('Error:', error);
    return [];
  }

  return data || [];
}

async function retrySEOForDestination(destinationId, restaurantIds) {
  console.log(`\n📝 Retrying SEO generation for ${destinationId} (${restaurantIds.length} restaurants)...`);
  
  try {
    const seoCmd = `node scripts/generate-restaurant-seo-content.js ${destinationId}`;
    const { stdout: seoOutput, stderr: seoError } = await execAsync(seoCmd);
    console.log(seoOutput);
    if (seoError && !seoError.includes('Already has SEO content')) {
      console.error('SEO error:', seoError);
    }
  } catch (error) {
    console.error(`❌ Error processing ${destinationId}:`, error.message);
  }
}

async function main() {
  console.log('🔍 Finding restaurants missing SEO content...\n');
  
  const missing = await getMissingSEO();
  
  if (missing.length === 0) {
    console.log('✅ All restaurants have SEO content!');
    return;
  }

  console.log(`📊 Found ${missing.length} restaurants missing SEO content\n`);

  // Group by destination
  const byDestination = {};
  missing.forEach(r => {
    if (!byDestination[r.destination_id]) {
      byDestination[r.destination_id] = [];
    }
    byDestination[r.destination_id].push(r.id);
  });

  const destinations = Object.keys(byDestination);
  console.log(`📍 Processing ${destinations.length} destinations...\n`);

  for (let i = 0; i < destinations.length; i++) {
    const destId = destinations[i];
    const restaurantIds = byDestination[destId];
    
    await retrySEOForDestination(destId, restaurantIds);
    
    // Rate limiting between destinations
    if (i < destinations.length - 1) {
      console.log('⏳ Waiting 2 seconds before next destination...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 SEO retry complete!`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error);

