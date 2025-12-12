/**
 * Migration script to move all hardcoded category guides (1050 guides from 182 destinations)
 * from JSON files to the database
 * 
 * This will:
 * 1. Load all guide JSON files
 * 2. Extract all guides from all destinations
 * 3. Convert to database format
 * 4. Insert/upsert into category_guides table
 * 5. Skip guides that already exist (or update them)
 * 
 * Usage:
 *   node scripts/migrate-hardcoded-guides-to-database.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Load configuration
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Paths to guide files
const guidesBasePath = path.join(__dirname, '../app/destinations/[id]/guides/guidesData.js');
const guidesNAPath = path.join(__dirname, '../app/destinations/[id]/guides/guidesData-north-america.js');
const guidesAfricaPath = path.join(__dirname, '../app/destinations/[id]/guides/guidesData-africa.js');
const guidesSAPath = path.join(__dirname, '../app/destinations/[id]/guides/guidesData-south-america.js');
const guidesAP1Path = path.join(__dirname, '../app/destinations/[id]/guides/guidesData-asia-pacific-part1.js');
const guidesAP2Path = path.join(__dirname, '../app/destinations/[id]/guides/guidesData-asia-pacific-part2.js');
const guidesMEPath = path.join(__dirname, '../app/destinations/[id]/guides/guidesData-middle-east.js');

// Load destination image map for hero_image fallback
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');
let destinationImageMap = {};

try {
  const destinationsContent = fs.readFileSync(destinationsDataPath, 'utf8');
  const destinationsMatch = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
  if (destinationsMatch) {
    const destinations = eval(`[${destinationsMatch[1]}]`);
    destinations.forEach(dest => {
      if (dest.imageUrl) {
        destinationImageMap[dest.id] = dest.imageUrl;
      }
    });
  }
} catch (error) {
  console.warn('⚠️ Could not load destinations for image map:', error.message);
}

// Load all guide files using require (same as categoryGuides.js loadCategoryGuidesSync)
function loadAllGuides() {
  const allGuides = {};
  
  try {
    // Use require to load the modules (same approach as categoryGuides.js)
    const guidesBase = require(guidesBasePath);
    const guidesNA = require(guidesNAPath);
    const guidesAfrica = require(guidesAfricaPath);
    const guidesSA = require(guidesSAPath);
    const guidesAP1 = require(guidesAP1Path);
    const guidesAP2 = require(guidesAP2Path);
    const guidesME = require(guidesMEPath);
    
    // Merge all guides (same as categoryGuides.js)
    const mergedGuides = {
      ...guidesBase.categoryGuides,
      ...guidesNA.categoryGuidesNorthAmerica,
      ...guidesAfrica.categoryGuidesAfrica,
      ...guidesSA.categoryGuidesSouthAmerica,
      ...guidesAP1.categoryGuidesAsiaPacificPart1,
      ...guidesAP2.categoryGuidesAsiaPacificPart2,
      ...guidesME.categoryGuidesMiddleEast,
    };
    
    // Copy to allGuides
    Object.assign(allGuides, mergedGuides);
    
    console.log(`✅ Loaded all guide files: ${Object.keys(allGuides).length} destinations`);
  } catch (error) {
    console.error(`❌ Error loading guide files:`, error.message);
    console.error(`   Stack:`, error.stack);
    throw error;
  }
  
  return allGuides;
}

// Convert guide to database format (matches convertGuideToDBFormat from generate script)
function convertGuideToDBFormat(destinationId, categorySlug, guide) {
  // Fix heroImage: if it's "null" string or null, use destination image URL
  let heroImage = guide.heroImage || guide.hero_image;
  if (heroImage === "null" || heroImage === null || heroImage === undefined) {
    heroImage = destinationImageMap[destinationId] || null;
  }
  
  return {
    destination_id: destinationId,
    category_slug: categorySlug,
    category_name: guide.categoryName || guide.category_name || '',
    title: guide.title || '',
    subtitle: guide.subtitle || '',
    hero_image: heroImage,
    stats: guide.stats || null,
    introduction: guide.introduction || '',
    seo: guide.seo || null,
    why_choose: guide.whyChoose || guide.why_choose || null,
    tour_types: guide.tourTypes || guide.tour_types || null,
    what_to_expect: guide.whatToExpect || guide.what_to_expect || null,
    expert_tips: guide.expertTips || guide.expert_tips || [],
    faqs: guide.faqs || [],
  };
}

// Generate category slug from category name (same logic as frontend)
function generateCategorySlug(categoryName) {
  return categoryName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/&/g, 'and')
    .replace(/'/g, '')
    .replace(/\./g, '')
    .replace(/ /g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Check which guides already exist in database
async function getExistingGuides() {
  try {
    const { data, error } = await supabase
      .from('category_guides')
      .select('destination_id, category_slug');
    
    if (error) {
      console.warn(`⚠️ Could not check existing guides: ${error.message}`);
      return new Set();
    }
    
    const existing = new Set();
    (data || []).forEach(guide => {
      existing.add(`${guide.destination_id}:${guide.category_slug}`);
    });
    
    return existing;
  } catch (error) {
    console.warn(`⚠️ Error checking existing guides: ${error.message}`);
    return new Set();
  }
}

// Save guide to database
async function saveGuideToDatabase(destinationId, categorySlug, guide) {
  try {
    const dbGuide = convertGuideToDBFormat(destinationId, categorySlug, guide);
    
    // Use upsert to handle both insert and update
    const { data, error } = await supabase
      .from('category_guides')
      .upsert(dbGuide, {
        onConflict: 'destination_id,category_slug',
      })
      .select();
    
    if (error) {
      console.error(`   ❌ Database error for ${destinationId}/${categorySlug}: ${error.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error saving ${destinationId}/${categorySlug}: ${error.message}`);
    return false;
  }
}

// Main migration function
async function migrateGuides() {
  console.log('🚀 Starting migration of hardcoded guides to database...\n');
  
  // Load all guides
  console.log('📚 Loading guide files...');
  const allGuides = loadAllGuides();
  
  const totalDestinations = Object.keys(allGuides).length;
  let totalGuides = 0;
  Object.values(allGuides).forEach(destGuides => {
    totalGuides += Object.keys(destGuides).length;
  });
  
  console.log(`\n📊 Found ${totalGuides} guides across ${totalDestinations} destinations\n`);
  
  // Check existing guides
  console.log('🔍 Checking existing guides in database...');
  const existingGuides = await getExistingGuides();
  console.log(`   Found ${existingGuides.size} existing guides in database\n`);
  
  // Process guides
  let processed = 0;
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  
  console.log('💾 Migrating guides to database...\n');
  
  for (const [destinationId, categories] of Object.entries(allGuides)) {
    console.log(`📍 Processing ${destinationId}...`);
    
    for (const [categorySlug, guide] of Object.entries(categories)) {
      processed++;
      
      // Check if already exists
      const key = `${destinationId}:${categorySlug}`;
      if (existingGuides.has(key)) {
        skipped++;
        if (processed % 50 === 0) {
          process.stdout.write(`   ⏭️  Skipped ${skipped} (already exist), processed ${processed}/${totalGuides}\r`);
        }
        continue;
      }
      
      // Validate required fields
      if (!guide.title || !guide.subtitle || !guide.introduction) {
        console.warn(`   ⚠️  Skipping ${destinationId}/${categorySlug}: missing required fields`);
        errors++;
        continue;
      }
      
      // Ensure categoryName exists (use from guide or generate from title)
      if (!guide.categoryName) {
        // Try to extract from title (e.g., "Aruba Sunset Cruises" -> "Sunset Cruises")
        const titleParts = guide.title.split(' ');
        if (titleParts.length > 1) {
          guide.categoryName = titleParts.slice(1).join(' ');
        } else {
          guide.categoryName = guide.title;
        }
      }
      
      // Save to database
      const success = await saveGuideToDatabase(destinationId, categorySlug, guide);
      
      if (success) {
        inserted++;
        if (inserted % 10 === 0 || processed === totalGuides) {
          process.stdout.write(`   ✅ Inserted ${inserted}, skipped ${skipped}, processed ${processed}/${totalGuides}\r`);
        }
      } else {
        errors++;
      }
      
      // Small delay to avoid overwhelming the database
      if (processed % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`   ✅ ${destinationId}: ${Object.keys(categories).length} guides processed`);
  }
  
  console.log('\n\n📊 Migration Summary:');
  console.log(`   Total guides: ${totalGuides}`);
  console.log(`   ✅ Inserted: ${inserted}`);
  console.log(`   ⏭️  Skipped (already exist): ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`   📍 Destinations: ${totalDestinations}`);
  
  if (errors === 0) {
    console.log('\n✅ Migration completed successfully!');
  } else {
    console.log(`\n⚠️  Migration completed with ${errors} errors. Please review the logs above.`);
  }
}

// Run migration
migrateGuides().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});

