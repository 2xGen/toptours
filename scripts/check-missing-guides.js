/**
 * Diagnostic script to find destinations that are missing category guides
 * Compares tourCategories in generated content with actual guides in database
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

// Load all destination sources
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');
const destinationsContent = fs.readFileSync(destinationsDataPath, 'utf8');
const destinationsMatch = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
let hardcodedDestinations = [];
if (destinationsMatch) {
  hardcodedDestinations = eval(`[${destinationsMatch[1]}]`);
}

const fullContentPath = path.join(__dirname, '../generated-destination-full-content.json');
let fullContentData = {};
if (fs.existsSync(fullContentPath)) {
  fullContentData = JSON.parse(fs.readFileSync(fullContentPath, 'utf8'));
}

// Helper to find destination by slug (same as batch script)
function findDestinationBySlug(slug) {
  let dest = hardcodedDestinations.find(d => d.id === slug);
  if (dest) return dest;
  
  const fullContent = fullContentData[slug];
  if (fullContent) {
    return {
      id: slug,
      name: fullContent?.destinationName || slug,
      fullName: fullContent?.destinationName || slug,
      country: fullContent?.country || null,
      category: fullContent?.region || 'Europe',
      briefDescription: fullContent?.briefDescription || '',
      imageUrl: fullContent?.imageUrl || null,
      tourCategories: fullContent?.tourCategories || [],
      destinationId: null,
    };
  }
  
  return null;
}

// Get all destinations (same logic as batch script)
function getAllDestinations() {
  const allDestinations = [];
  
  // From hardcoded destinationsData.js
  hardcodedDestinations.forEach(dest => {
    if (dest.tourCategories && dest.tourCategories.length > 0) {
      allDestinations.push(dest);
    }
  });
  
  // From generated content
  Object.keys(fullContentData).forEach(slug => {
    const content = fullContentData[slug];
    if (content && content.tourCategories && content.tourCategories.length > 0) {
      const dest = findDestinationBySlug(slug);
      if (dest && !allDestinations.find(d => d.id === dest.id)) {
        allDestinations.push(dest);
      }
    }
  });
  
  return allDestinations;
}

// Helper to generate category slug
function generateCategorySlug(categoryName) {
  return categoryName
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/&/g, 'and')
    .replace(/'/g, '')
    .replace(/\./g, '');
}

// Get existing guides from database for a destination
async function getExistingGuides(destinationId) {
  try {
    const { data, error } = await supabase
      .from('category_guides')
      .select('category_slug')
      .eq('destination_id', destinationId);
    
    if (error) {
      console.warn(`   ⚠️  Error checking ${destinationId}: ${error.message}`);
      return new Set();
    }
    
    return new Set((data || []).map(g => g.category_slug));
  } catch (error) {
    return new Set();
  }
}

// Main function
async function checkMissingGuides() {
  console.log('\n🔍 Checking for missing category guides...\n');
  
  // Get all destinations (hardcoded + generated)
  const allDestinations = getAllDestinations();
  const totalDestinations = allDestinations.length;
  
  const hardcodedCount = hardcodedDestinations.filter(d => d.tourCategories?.length > 0).length;
  const generatedCount = Object.keys(fullContentData).filter(slug => fullContentData[slug]?.tourCategories?.length > 0).length;
  
  console.log(`📊 Found ${totalDestinations} total destinations with tour categories`);
  console.log(`   - Hardcoded destinations (from destinationsData.js): ${hardcodedCount}`);
  console.log(`   - Generated destinations (from generated-destination-full-content.json): ${generatedCount}`);
  console.log(`   - Note: Some hardcoded destinations may also appear in generated content (deduplicated)\n`);
  
  const destinationsWithMissingGuides = [];
  let checked = 0;
  
  for (const destination of allDestinations) {
    checked++;
    if (checked % 100 === 0) {
      console.log(`   Checked ${checked}/${totalDestinations} destinations...`);
    }
    
    if (!destination.tourCategories || destination.tourCategories.length === 0) {
      continue;
    }
    
    const existingGuides = await getExistingGuides(destination.id);
    const missingCategories = [];
    
    for (const category of destination.tourCategories) {
      const categoryName = typeof category === 'object' ? category.name : category;
      const categorySlug = generateCategorySlug(categoryName);
      
      if (!existingGuides.has(categorySlug)) {
        missingCategories.push(categoryName);
      }
    }
    
    if (missingCategories.length > 0) {
      destinationsWithMissingGuides.push({
        destinationId: destination.id,
        destinationName: destination.fullName || destination.name,
        totalCategories: destination.tourCategories.length,
        existingGuides: existingGuides.size,
        missingCategories,
        region: destination.category || destination.region || 'Unknown',
      });
    }
  }
  
  console.log('\n━'.repeat(60));
  console.log(`\n📊 RESULTS:\n`);
  console.log(`   Total destinations checked: ${totalDestinations}`);
  console.log(`   Destinations with missing guides: ${destinationsWithMissingGuides.length}`);
  console.log(`   Destinations with all guides: ${totalDestinations - destinationsWithMissingGuides.length}`);
  
  if (destinationsWithMissingGuides.length > 0) {
    console.log(`\n⚠️  DESTINATIONS WITH MISSING GUIDES:\n`);
    
    // Sort by number of missing guides (most missing first)
    destinationsWithMissingGuides.sort((a, b) => b.missingCategories.length - a.missingCategories.length);
    
    // Show top 20
    const top20 = destinationsWithMissingGuides.slice(0, 20);
    top20.forEach((dest, index) => {
      console.log(`   ${index + 1}. ${dest.destinationName} (${dest.destinationId})`);
      console.log(`      Missing ${dest.missingCategories.length}/${dest.totalCategories} guides`);
      console.log(`      Missing: ${dest.missingCategories.join(', ')}`);
      console.log('');
    });
    
    if (destinationsWithMissingGuides.length > 20) {
      console.log(`   ... and ${destinationsWithMissingGuides.length - 20} more destinations\n`);
    }
    
    // Save full report to file
    const reportPath = path.join(__dirname, '../missing-guides-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(destinationsWithMissingGuides, null, 2));
    console.log(`\n💾 Full report saved to: ${reportPath}`);
    
    // Summary by region
    const byRegion = {};
    destinationsWithMissingGuides.forEach(dest => {
      const region = dest.region || 'Unknown';
      if (!byRegion[region]) {
        byRegion[region] = { count: 0, totalMissing: 0 };
      }
      byRegion[region].count++;
      byRegion[region].totalMissing += dest.missingCategories.length;
    });
    
    console.log(`\n📊 BY REGION:\n`);
    Object.entries(byRegion)
      .sort((a, b) => b[1].totalMissing - a[1].totalMissing)
      .forEach(([region, stats]) => {
        console.log(`   ${region}: ${stats.count} destinations, ${stats.totalMissing} missing guides`);
      });
  } else {
    console.log(`\n✅ All destinations have all their guides!`);
  }
  
  console.log('\n━'.repeat(60));
}

checkMissingGuides().catch(error => {
  console.error('\n❌ ERROR:', error);
  process.exit(1);
});

