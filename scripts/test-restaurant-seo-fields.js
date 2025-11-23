/**
 * Test script to check if restaurant SEO fields exist in database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testFields() {
  console.log('🔍 Checking if SEO fields exist in restaurants table...\n');
  
  // Try to select the fields
  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name, seo_title, meta_description, unique_content')
    .limit(1);
  
  if (error) {
    if (error.code === '42703') {
      console.error('❌ Columns do not exist! Error:', error.message);
      console.error('\n💡 Run this SQL script first:');
      console.error('   scripts/supabase-add-restaurant-content-fields.sql\n');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
  
  console.log('✅ Columns exist!');
  console.log('📊 Sample data:', data && data.length > 0 ? JSON.stringify(data[0], null, 2) : 'No restaurants found');
  
  // Check if any restaurant has content
  const { data: withContent, error: error2 } = await supabase
    .from('restaurants')
    .select('id, name, seo_title, meta_description, unique_content')
    .not('seo_title', 'is', null)
    .limit(5);
  
  if (!error2 && withContent && withContent.length > 0) {
    console.log(`\n✅ Found ${withContent.length} restaurant(s) with SEO content:`);
    withContent.forEach(r => {
      console.log(`   - ${r.name}: ${r.seo_title ? '✓' : '✗'} title, ${r.meta_description ? '✓' : '✗'} meta, ${r.unique_content ? '✓' : '✗'} content`);
    });
  } else {
    console.log('\nℹ️  No restaurants have SEO content yet.');
  }
}

testFields();

