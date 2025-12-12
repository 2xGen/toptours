/**
 * Quick script to check if newly generated destinations have guides
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Load generated content
const fullContentPath = path.join(__dirname, '../generated-destination-full-content.json');
const fullContentData = JSON.parse(fs.readFileSync(fullContentPath, 'utf8'));

// Check specific destinations
const destinationsToCheck = ['queensland', 'cali'];

console.log('\n🔍 Checking newly generated destinations...\n');

for (const slug of destinationsToCheck) {
  const dest = fullContentData[slug];
  
  if (!dest) {
    console.log(`❌ ${slug}: NOT FOUND in generated content`);
    continue;
  }
  
  console.log(`\n📋 ${slug}:`);
  console.log(`   Name: ${dest.destinationName}`);
  console.log(`   Has tourCategories: ${!!dest.tourCategories}`);
  console.log(`   Categories count: ${dest.tourCategories?.length || 0}`);
  
  if (dest.tourCategories && dest.tourCategories.length > 0) {
    console.log(`   Categories: ${dest.tourCategories.map(c => typeof c === 'object' ? c.name : c).join(', ')}`);
    
    // Check database for existing guides
    const { data, error } = await supabase
      .from('category_guides')
      .select('category_slug')
      .eq('destination_id', slug);
    
    if (error) {
      console.log(`   ❌ Error checking database: ${error.message}`);
    } else {
      const existingGuides = new Set((data || []).map(g => g.category_slug));
      console.log(`   Guides in database: ${existingGuides.size}/${dest.tourCategories.length}`);
      
      if (existingGuides.size < dest.tourCategories.length) {
        const missing = dest.tourCategories
          .map(c => {
            const catName = typeof c === 'object' ? c.name : c;
            const slug = catName.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
            return { name: catName, slug };
          })
          .filter(c => !existingGuides.has(c.slug));
        
        console.log(`   ⚠️  Missing guides: ${missing.map(m => m.name).join(', ')}`);
      } else {
        console.log(`   ✅ All guides exist!`);
      }
    }
  } else {
    console.log(`   ⚠️  No tourCategories defined - guides cannot be generated`);
  }
}

console.log('\n');

