import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function deleteRestaurantGuidesForDestination(destinationId) {
  console.log(`\n🗑️  Deleting restaurant guides for: ${destinationId}\n`);

  // First, check what exists
  const { data: existingGuides, error: fetchError } = await supabase
    .from('restaurant_guides')
    .select('id, category_slug, title')
    .eq('destination_id', destinationId);

  if (fetchError) {
    console.error('❌ Error fetching guides:', fetchError.message);
    return;
  }

  if (!existingGuides || existingGuides.length === 0) {
    console.log(`✅ No restaurant guides found for ${destinationId}`);
    return;
  }

  console.log(`📋 Found ${existingGuides.length} guide(s) to delete:`);
  existingGuides.forEach(guide => {
    console.log(`   - ${guide.category_slug}: ${guide.title}`);
  });

  // Delete all guides for this destination
  const { error: deleteError } = await supabase
    .from('restaurant_guides')
    .delete()
    .eq('destination_id', destinationId);

  if (deleteError) {
    console.error('❌ Error deleting guides:', deleteError.message);
    return;
  }

  console.log(`\n✅ Successfully deleted ${existingGuides.length} restaurant guide(s) for ${destinationId}`);
}

// Main execution
async function main() {
  const destinationId = process.argv[2];

  if (!destinationId) {
    console.error('❌ Please provide a destination ID');
    console.error('Usage: node scripts/delete-restaurant-guides.js <destination-id>');
    console.error('Example: node scripts/delete-restaurant-guides.js aruba');
    process.exit(1);
  }

  await deleteRestaurantGuidesForDestination(destinationId);
}

// Run if called directly
main().catch(console.error);

