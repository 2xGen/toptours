/**
 * Script to update hasGuide flags in generated-destination-full-content.json
 * based on guides that exist in the Supabase database
 * 
 * Usage: node scripts/update-hasguide-from-database.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Load generated content
const fullContentPath = path.join(__dirname, '../generated-destination-full-content.json');
let fullContentData = {};

if (fs.existsSync(fullContentPath)) {
  fullContentData = JSON.parse(fs.readFileSync(fullContentPath, 'utf8'));
} else {
  console.error('❌ generated-destination-full-content.json not found');
  process.exit(1);
}

// Function to generate category slug (matching the URL generation logic)
function generateCategorySlug(categoryName) {
  return categoryName
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/&/g, 'and')
    .replace(/'/g, '') // Remove apostrophes
    .replace(/\./g, '') // Remove periods
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
}

async function updateHasGuideFlags() {
  console.log('\n🔄 UPDATING hasGuide FLAGS FROM DATABASE\n');
  console.log('━'.repeat(60));
  
  // Fetch all guides from database with pagination
  console.log('📥 Fetching guides from database...');
  let allGuides = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    const { data: guides, error, count } = await supabase
      .from('category_guides')
      .select('destination_id, category_slug, category_name', { count: 'exact' })
      .range(from, to);
    
    if (error) {
      console.error('❌ Error fetching guides:', error);
      process.exit(1);
    }
    
    if (guides && guides.length > 0) {
      allGuides = allGuides.concat(guides);
      console.log(`   📄 Fetched page ${page + 1}: ${guides.length} guides (total: ${allGuides.length})`);
      
      // Check if there are more pages
      hasMore = guides.length === pageSize;
      page++;
    } else {
      hasMore = false;
    }
  }
  
  console.log(`✅ Found ${allGuides.length} total guides in database\n`);
  
  const guides = allGuides;
  
  // Group guides by destination
  const guidesByDestination = {};
  guides.forEach(guide => {
    if (!guidesByDestination[guide.destination_id]) {
      guidesByDestination[guide.destination_id] = [];
    }
    guidesByDestination[guide.destination_id].push({
      slug: guide.category_slug,
      name: guide.category_name,
    });
  });
  
  let updatedCount = 0;
  let totalCategoriesUpdated = 0;
  
  // Debug: Show some destination IDs from database
  console.log('\n📋 Sample destination IDs from database:');
  const sampleDestIds = Object.keys(guidesByDestination).slice(0, 5);
  sampleDestIds.forEach(id => {
    console.log(`   - ${id}: ${guidesByDestination[id].length} guides`);
  });
  
  // Debug: Show some destination IDs from JSON
  console.log('\n📋 Sample destination IDs from JSON:');
  const sampleJsonIds = Object.keys(fullContentData).slice(0, 5);
  sampleJsonIds.forEach(id => {
    console.log(`   - ${id}`);
  });
  console.log('');
  
  // Update each destination
  for (const [destId, content] of Object.entries(fullContentData)) {
    if (!content.tourCategories || !Array.isArray(content.tourCategories)) {
      continue;
    }
    
    const destinationGuides = guidesByDestination[destId] || [];
    
    if (destinationGuides.length === 0) {
      continue; // No guides for this destination
    }
    
    let destinationUpdated = false;
    
    // Check each category
    content.tourCategories = content.tourCategories.map(category => {
      const categoryObj = typeof category === 'string' 
        ? { name: category, hasGuide: false }
        : { ...category };
      
      const categoryName = categoryObj.name;
      const categorySlug = generateCategorySlug(categoryName);
      
      // Check if this category has a guide in the database
      const hasGuide = destinationGuides.some(guide => {
        // Match by slug or name (case-insensitive)
        return guide.slug === categorySlug ||
               guide.name.toLowerCase() === categoryName.toLowerCase();
      });
      
      if (hasGuide && categoryObj.hasGuide !== true) {
        categoryObj.hasGuide = true;
        destinationUpdated = true;
        totalCategoriesUpdated++;
      }
      
      return categoryObj;
    });
    
    if (destinationUpdated) {
      updatedCount++;
      console.log(`✅ Updated ${destId}: ${destinationGuides.length} guides found`);
    }
  }
  
  // Save updated content
  fs.writeFileSync(
    fullContentPath,
    JSON.stringify(fullContentData, null, 2),
    'utf8'
  );
  
  console.log('\n━'.repeat(60));
  console.log(`\n✅ UPDATE COMPLETE!`);
  console.log(`📊 Destinations updated: ${updatedCount}`);
  console.log(`📝 Categories marked with hasGuide: ${totalCategoriesUpdated}`);
  console.log(`📁 Updated file: ${fullContentPath}`);
  console.log(`\n💡 Restart your dev server to see the changes!`);
}

updateHasGuideFlags().catch(error => {
  console.error('\n❌ FATAL ERROR:', error);
  process.exit(1);
});

