/**
 * Add images from Supabase storage to destinations and their guides
 * Images are in the "overige destinations" bucket
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Supabase
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

// Destination name to slug mapping
const destinationMapping = {
  'Istanbul': 'istanbul',
  'Antalya': 'antalya',
  'Ankara': 'ankara',
  'Sicily': 'sicily',
  'Sardinia': 'sardinia',
  'Tenerife': 'tenerife',
  'Gran Canaria': 'gran-canaria',
  'Valencia': 'valencia',
  'Zakynthos (Zante)': 'zakynthos',
  'Zante': 'zakynthos',
  'Corfu': 'corfu',
  'Bergen': 'bergen',
  'Porto Santo': 'porto-santo',
  'Taipei': 'taipei',
  'Kaohsiung': 'kaohsiung',
  'Da Nang': 'da-nang',
  'Siem Reap': 'siem-reap',
  'Agra': 'agra',
  'Varanasi': 'varanasi',
  'Galle': 'galle',
  'Colombo': 'colombo',
  'Sharm El Sheikh': 'sharm-el-sheikh',
  'Hurghada': 'hurghada',
  'Petra': 'petra',
  'Tampa': 'tampa',
  'Fort Lauderdale': 'fort-lauderdale',
  'Palm Springs': 'palm-springs',
  'Santa Barbara': 'santa-barbara',
  'Newport': 'newport',
  'Asheville': 'asheville',
  'Burlington': 'burlington',
  'San Juan': 'san-juan',
  'Punta Arenas': 'punta-arenas',
  'Ushuaia': 'ushuaia',
  'La Paz': 'la-paz',
  'Havana': 'havana',
};

// Generate slug from destination name
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Get image URL from Supabase storage
function getImageUrl(destinationName) {
  // Try exact match first
  const slug = destinationMapping[destinationName] || generateSlug(destinationName);
  
  // Construct URL - Supabase storage URL format
  const bucketName = 'overige destinations';
  const fileName = `${destinationName}.png`; // Assuming PNG format
  const encodedFileName = encodeURIComponent(fileName);
  const encodedBucket = encodeURIComponent(bucketName);
  
  return `${SUPABASE_URL}/storage/v1/object/public/${encodedBucket}/${encodedFileName}`;
}

// List files in Supabase storage bucket
async function listStorageFiles() {
  const bucketName = 'overige destinations';
  
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error('❌ Error listing files:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error accessing storage:', error);
    return [];
  }
}

// Update destination image in generated content
function updateDestinationImage(slug, imageUrl) {
  if (!fullContentData[slug]) {
    console.log(`   ⚠️  Destination "${slug}" not found in generated content`);
    return false;
  }

  fullContentData[slug].imageUrl = imageUrl;
  return true;
}

// Update guide hero images in database
async function updateGuideImages(destinationSlug, imageUrl) {
  try {
    const { data, error } = await supabase
      .from('category_guides')
      .update({ hero_image: imageUrl })
      .eq('destination_id', destinationSlug);

    if (error) {
      console.error(`   ❌ Error updating guides for ${destinationSlug}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`   ❌ Error updating guides for ${destinationSlug}:`, error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('\n🖼️  Fetching images from Supabase storage...\n');
  
  // List files in storage
  const files = await listStorageFiles();
  console.log(`✅ Found ${files.length} files in storage\n`);

  if (files.length === 0) {
    console.log('⚠️  No files found in storage. Please check:');
    console.log('   1. Bucket name: "overige destinations"');
    console.log('   2. Files are public');
    console.log('   3. Service role key has storage access\n');
    return;
  }

  // Create mapping of file names to destination names
  const fileMap = {};
  files.forEach(file => {
    const fileName = file.name;
    // Remove extension
    const nameWithoutExt = fileName.replace(/\.(png|jpg|jpeg|webp)$/i, '');
    fileMap[nameWithoutExt] = fileName;
  });

  console.log('📋 Processing destinations...\n');
  console.log('━'.repeat(80));

  const destinations = [
    'Istanbul', 'Antalya', 'Ankara', 'Sicily', 'Sardinia',
    'Tenerife', 'Gran Canaria', 'Valencia', 'Zakynthos (Zante)', 'Corfu',
    'Bergen', 'Porto Santo', 'Taipei', 'Kaohsiung', 'Da Nang',
    'Siem Reap', 'Agra', 'Varanasi', 'Galle', 'Colombo',
    'Sharm El Sheikh', 'Hurghada', 'Petra', 'Tampa', 'Fort Lauderdale',
    'Palm Springs', 'Santa Barbara', 'Newport', 'Asheville', 'Burlington',
    'San Juan', 'Punta Arenas', 'Ushuaia', 'La Paz', 'Havana',
  ];

  let updated = 0;
  let notFound = 0;
  let guidesUpdated = 0;

  for (const destName of destinations) {
    // Find matching file
    const fileName = fileMap[destName] || fileMap[destName.replace(' (Zante)', '')];
    
    if (!fileName) {
      console.log(`❌ ${destName}: File not found in storage`);
      notFound++;
      continue;
    }

    // Get slug
    const slug = destinationMapping[destName] || generateSlug(destName);
    
    // Construct image URL
    const bucketName = 'overige destinations';
    const encodedBucket = encodeURIComponent(bucketName);
    const encodedFile = encodeURIComponent(fileName);
    const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/${encodedBucket}/${encodedFile}`;

    console.log(`\n📍 ${destName} (${slug}):`);
    console.log(`   📸 Image: ${imageUrl}`);

    // Update destination
    const destUpdated = updateDestinationImage(slug, imageUrl);
    if (destUpdated) {
      console.log(`   ✅ Updated destination image`);
      updated++;
    }

    // Update guides
    const guidesUpdatedResult = await updateGuideImages(slug, imageUrl);
    if (guidesUpdatedResult) {
      // Count how many guides were updated
      const { count } = await supabase
        .from('category_guides')
        .select('*', { count: 'exact', head: true })
        .eq('destination_id', slug);
      
      if (count > 0) {
        console.log(`   ✅ Updated ${count} guide(s) with hero image`);
        guidesUpdated += count;
      }
    }
  }

  // Save updated content
  fs.writeFileSync(fullContentPath, JSON.stringify(fullContentData, null, 2));

  console.log('\n' + '━'.repeat(80));
  console.log(`\n📊 SUMMARY:`);
  console.log(`   ✅ Destinations updated: ${updated}`);
  console.log(`   ✅ Guides updated: ${guidesUpdated}`);
  console.log(`   ❌ Not found: ${notFound}`);
  console.log(`\n💾 Saved to: ${fullContentPath}\n`);
}

main().catch(console.error);

