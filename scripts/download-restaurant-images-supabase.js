#!/usr/bin/env node
/**
 * Download Restaurant Images and Upload to Supabase Storage
 * 
 * This script:
 * 1. Fetches all restaurants with Google Places API URLs
 * 2. Downloads each image (one-time API cost ~$25 for 3500+ images)
 * 3. Uploads to Supabase Storage bucket "restaurant-images"
 * 4. Updates the hero_image_url in the restaurants table
 * 
 * BEFORE RUNNING:
 * 1. Create a bucket called "restaurant-images" in Supabase Storage
 * 2. Make the bucket PUBLIC (so images can be accessed without auth)
 * 3. Set your GOOGLE_PLACES_API_KEY in .env.local
 * 
 * Usage: node scripts/download-restaurant-images-supabase.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BUCKET_NAME = 'restaurant-images';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

if (!GOOGLE_PLACES_API_KEY) {
  console.error('❌ Missing GOOGLE_PLACES_API_KEY in .env.local');
  console.error('   You need a valid API key to download the images (one-time cost ~$25)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Download image and return as buffer
function downloadImageToBuffer(url) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        return downloadImageToBuffer(redirectUrl).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

// Generate safe filename
function generateFilename(restaurant) {
  const slug = restaurant.slug || restaurant.id;
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
  return `${safeSlug}.jpg`;
}

// Check if URL is Google Places API
function isGooglePlacesUrl(url) {
  return url && url.includes('places.googleapis.com');
}

// Get all restaurants with pagination
async function getAllRestaurants() {
  const allRestaurants = [];
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, slug, destination_id, name, hero_image_url')
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    if (!data || data.length === 0) break;
    
    allRestaurants.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }
  
  return allRestaurants;
}

// Check if file already exists in Supabase Storage
async function fileExistsInStorage(filename) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list('', { search: filename });
  
  if (error) return false;
  return data && data.some(f => f.name === filename);
}

async function main() {
  console.log('🚀 Restaurant Image Migration to Supabase Storage');
  console.log('='.repeat(60));
  
  // Check if bucket exists
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error('❌ Error listing buckets:', bucketError.message);
    process.exit(1);
  }
  
  const bucketExists = buckets.some(b => b.name === BUCKET_NAME);
  if (!bucketExists) {
    console.log(`📦 Creating bucket "${BUCKET_NAME}"...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    });
    if (createError) {
      console.error('❌ Failed to create bucket:', createError.message);
      console.error('   Please create the bucket manually in Supabase Dashboard:');
      console.error('   1. Go to Storage in your Supabase project');
      console.error('   2. Create a new bucket called "restaurant-images"');
      console.error('   3. Make it PUBLIC');
      process.exit(1);
    }
    console.log('✅ Bucket created successfully');
  } else {
    console.log(`✅ Bucket "${BUCKET_NAME}" exists`);
  }
  
  // Fetch all restaurants
  console.log('\n📥 Fetching restaurants from database...');
  const restaurants = await getAllRestaurants();
  console.log(`📊 Found ${restaurants.length} total restaurants`);
  
  // Filter to Google Places URLs only
  const googleUrlRestaurants = restaurants.filter(r => isGooglePlacesUrl(r.hero_image_url));
  console.log(`🔴 ${googleUrlRestaurants.length} restaurants need image migration`);
  
  if (googleUrlRestaurants.length === 0) {
    console.log('\n✅ All images already migrated. Nothing to do!');
    return;
  }
  
  const estimatedCost = (googleUrlRestaurants.length / 1000 * 7).toFixed(2);
  console.log(`\n💰 Estimated one-time cost: ~$${estimatedCost}`);
  console.log('   (Google Places Photo API: $7 per 1000 requests)\n');
  
  // Process each restaurant
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;
  const failed = [];
  
  for (let i = 0; i < googleUrlRestaurants.length; i++) {
    const restaurant = googleUrlRestaurants[i];
    const progress = `[${i + 1}/${googleUrlRestaurants.length}]`;
    const filename = generateFilename(restaurant);
    
    try {
      // Check if already uploaded
      const exists = await fileExistsInStorage(filename);
      if (exists) {
        // File exists, just update database URL
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
        
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({ hero_image_url: publicUrl })
          .eq('id', restaurant.id);
        
        if (updateError) throw updateError;
        
        console.log(`${progress} ⏭️  ${restaurant.name} - Already uploaded, URL updated`);
        skipCount++;
        continue;
      }
      
      console.log(`${progress} 📥 ${restaurant.name}`);
      
      // Download image from Google
      const imageBuffer = await downloadImageToBuffer(restaurant.hero_image_url);
      
      if (imageBuffer.length < 1000) {
        throw new Error('Image too small (likely error response)');
      }
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filename, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
      
      // Update database
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ hero_image_url: publicUrl })
        .eq('id', restaurant.id);
      
      if (updateError) throw updateError;
      
      console.log(`   ✅ Uploaded: ${filename}`);
      successCount++;
      
      // Rate limit: 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      console.error(`${progress} ❌ ${restaurant.name}: ${err.message}`);
      failCount++;
      failed.push({ id: restaurant.id, name: restaurant.name, error: err.message });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Successfully migrated: ${successCount}`);
  console.log(`⏭️  Already migrated:     ${skipCount}`);
  console.log(`❌ Failed:                ${failCount}`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed restaurants:');
    failed.slice(0, 20).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
    if (failed.length > 20) {
      console.log(`   ... and ${failed.length - 20} more`);
    }
    
    // Save failed list
    const fs = await import('fs');
    fs.writeFileSync(
      join(__dirname, 'failed-restaurant-images.json'),
      JSON.stringify(failed, null, 2)
    );
    console.log('\n📝 Full failed list saved to: scripts/failed-restaurant-images.json');
  }
  
  console.log('\n🎉 Done! Restaurant images are now served from Supabase Storage.');
  console.log('   No more Google Places API costs for image loading!');
}

main().catch(console.error);

