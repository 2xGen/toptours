/**
 * Fix restaurants with non-English names and bad slugs
 * - Generates proper slugs for restaurants with non-English characters
 * - Creates English-friendly name variations where needed
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Generate a proper slug from restaurant data
 */
function generateSlug(restaurant) {
  const name = restaurant.name || '';
  const destinationId = restaurant.destination_id || '';
  
  // Try to generate slug from name
  let baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/'/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') || '';
  
  // If slug is empty or only dashes (non-English characters), create fallback
  if (!baseSlug || baseSlug.replace(/-/g, '').length === 0) {
    // Parse cuisines from JSON if available
    let cuisines = [];
    try {
      if (typeof restaurant.cuisines === 'string') {
        cuisines = JSON.parse(restaurant.cuisines);
      } else if (Array.isArray(restaurant.cuisines)) {
        cuisines = restaurant.cuisines;
      }
    } catch (e) {
      cuisines = [];
    }
    
    // Use cuisine type as fallback
    const cuisineType = cuisines.length > 0 
      ? cuisines[0].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : 'restaurant';
    
    // Use location from address
    const address = restaurant.address || restaurant.formatted_address || '';
    const addressParts = address.split(',');
    const locationPart = addressParts.length > 1 
      ? addressParts[addressParts.length - 2]?.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || ''
      : '';
    
    // Create fallback slug
    baseSlug = locationPart ? `${cuisineType}-${locationPart}` : cuisineType;
    
    // If still empty, use restaurant ID
    if (!baseSlug || baseSlug.replace(/-/g, '').length === 0) {
      baseSlug = `restaurant-${restaurant.id || 'unknown'}`;
    }
  }
  
  // Clean up multiple dashes
  baseSlug = baseSlug.replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  // Add destination ID
  return `${baseSlug}-${destinationId}`;
}

/**
 * Generate an English-friendly name variation
 */
function generateEnglishName(restaurant) {
  const name = restaurant.name || '';
  const shortName = restaurant.short_name || '';
  
  // Check if name contains non-Latin script characters (CJK, Arabic, Thai, etc.)
  // Allow Latin characters with accents (é, ç, ñ, etc.) as they're still readable
  const hasNonLatinScript = /[\u4E00-\u9FFF\uAC00-\uD7AF\u3040-\u309F\u30A0-\u30FF\u0600-\u06FF\u0E00-\u0E7F]/.test(name);
  
  if (!hasNonLatinScript) {
    return null; // Name is already English-friendly (may have accents but still readable)
  }
  
  // Try to extract English text from short_name if available
  if (shortName && !/[^\x00-\x7F]/.test(shortName)) {
    return shortName;
  }
  
  // Parse cuisines and location to create a descriptive name
  let cuisines = [];
  try {
    if (typeof restaurant.cuisines === 'string') {
      cuisines = JSON.parse(restaurant.cuisines);
    } else if (Array.isArray(restaurant.cuisines)) {
      cuisines = restaurant.cuisines;
    }
  } catch (e) {
    cuisines = [];
  }
  
  const cuisineName = cuisines.length > 0 ? cuisines[0] : 'Restaurant';
  const address = restaurant.address || restaurant.formatted_address || '';
  const addressParts = address.split(',');
  const location = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : '';
  
  // Create English-friendly name: "Cuisine in Location" or just "Cuisine"
  if (location) {
    return `${cuisineName} in ${location}`;
  }
  
  return cuisineName;
}

async function main() {
  console.log('🔍 Finding restaurants with non-English names or bad slugs...\n');
  
  // Find restaurants with:
  // 1. Slugs that are just "--destination" or start with "--"
  // 2. Names with non-ASCII characters
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, short_name, slug, destination_id, cuisines, address, formatted_address')
    .eq('is_active', true);
  
  if (error) {
    console.error('❌ Error fetching restaurants:', error);
    process.exit(1);
  }
  
  if (!restaurants || restaurants.length === 0) {
    console.log('✅ No restaurants found');
    return;
  }
  
  console.log(`📊 Found ${restaurants.length} restaurants to check\n`);
  
  let fixedCount = 0;
  let skippedCount = 0;
  
  for (const restaurant of restaurants) {
    const hasBadSlug = restaurant.slug?.startsWith('--') || 
                       restaurant.slug === `--${restaurant.destination_id}` ||
                       !restaurant.slug ||
                       restaurant.slug.length < 5;
    
    // Check for non-Latin scripts (CJK, Arabic, Thai, etc.) - not just accented characters
    const hasNonLatinScriptName = /[\u4E00-\u9FFF\uAC00-\uD7AF\u3040-\u309F\u30A0-\u30FF\u0600-\u06FF\u0E00-\u0E7F]/.test(restaurant.name || '');
    
    if (!hasBadSlug && !hasNonLatinScriptName) {
      skippedCount++;
      continue;
    }
    
    console.log(`\n🔧 Fixing: ${restaurant.name} (ID: ${restaurant.id})`);
    
    const updates = {};
    
    // Fix slug if needed
    if (hasBadSlug) {
      const newSlug = generateSlug(restaurant);
      if (newSlug !== restaurant.slug) {
        updates.slug = newSlug;
        console.log(`   📝 Slug: "${restaurant.slug}" → "${newSlug}"`);
      }
    }
    
    // Generate English-friendly name if needed (only for non-Latin scripts)
    if (hasNonLatinScriptName) {
      const englishName = generateEnglishName(restaurant);
      if (englishName && englishName !== restaurant.name) {
        // Update short_name with English-friendly version
        const hasNonLatinShortName = /[\u4E00-\u9FFF\uAC00-\uD7AF\u3040-\u309F\u30A0-\u30FF\u0600-\u06FF\u0E00-\u0E7F]/.test(restaurant.short_name || '');
        if (!restaurant.short_name || hasNonLatinShortName) {
          updates.short_name = englishName;
          console.log(`   📝 Short name: "${restaurant.short_name || 'N/A'}" → "${englishName}"`);
        }
        
        // Also update main name to include both original and English: "Original Name (English Name)"
        // This helps with SEO and user understanding while preserving the original
        const combinedName = `${restaurant.name} (${englishName})`;
        if (combinedName !== restaurant.name) {
          updates.name = combinedName;
          console.log(`   📝 Name: "${restaurant.name}" → "${combinedName}"`);
        }
      }
    }
    
    // Update database if there are changes
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', restaurant.id);
      
      if (updateError) {
        console.error(`   ❌ Error updating: ${updateError.message}`);
      } else {
        console.log(`   ✅ Updated successfully`);
        fixedCount++;
      }
    } else {
      console.log(`   ⏭️  No changes needed`);
      skippedCount++;
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Fix complete!`);
  console.log(`   Fixed: ${fixedCount} restaurant(s)`);
  console.log(`   Skipped: ${skippedCount} restaurant(s)`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error);

