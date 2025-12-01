#!/usr/bin/env node
/**
 * Download Restaurant Images from Google Places API
 * 
 * This script downloads all restaurant images that are currently using Google Places API URLs
 * and saves them locally, then updates the database to use local paths.
 * 
 * This is a ONE-TIME operation to stop the recurring API costs from image loads.
 * 
 * Usage: node scripts/download-restaurant-images.js
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'restaurants');

// Validate environment
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Ensure images directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        file.close();
        fs.unlinkSync(filepath);
        return downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
      
      file.on('error', (err) => {
        file.close();
        fs.unlinkSync(filepath);
        reject(err);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

// Generate a safe filename from restaurant data
function generateFilename(restaurant) {
  const slug = restaurant.slug || restaurant.id;
  // Clean the slug to be filesystem-safe
  const safeSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100); // Limit length
  return `${safeSlug}.jpg`;
}

// Check if URL is a Google Places API URL
function isGooglePlacesUrl(url) {
  return url && url.includes('places.googleapis.com');
}

async function main() {
  console.log('🚀 Starting Restaurant Image Download Script');
  console.log('=' .repeat(60));
  
  // Ensure output directory exists
  ensureDirectoryExists(IMAGES_DIR);
  
  // Fetch all restaurants with Google Places API URLs
  console.log('\n📥 Fetching restaurants from database...');
  
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, slug, destination_id, name, hero_image_url')
    .not('hero_image_url', 'is', null);
  
  if (error) {
    console.error('❌ Failed to fetch restaurants:', error.message);
    process.exit(1);
  }
  
  console.log(`📊 Found ${restaurants.length} restaurants with images`);
  
  // Filter to only those using Google Places API URLs
  const googleUrlRestaurants = restaurants.filter(r => isGooglePlacesUrl(r.hero_image_url));
  const alreadyLocalRestaurants = restaurants.filter(r => !isGooglePlacesUrl(r.hero_image_url));
  
  console.log(`🔴 ${googleUrlRestaurants.length} restaurants using LIVE Google Places API URLs (costing you money!)`);
  console.log(`🟢 ${alreadyLocalRestaurants.length} restaurants already using local/other URLs`);
  
  if (googleUrlRestaurants.length === 0) {
    console.log('\n✅ No restaurants need image downloads. All good!');
    return;
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('⚠️  WARNING: This will download images from Google Places API.');
  console.log('   This is a ONE-TIME cost to save future recurring costs.');
  console.log('=' .repeat(60));
  
  // Process each restaurant
  let successCount = 0;
  let failCount = 0;
  const failedRestaurants = [];
  
  for (let i = 0; i < googleUrlRestaurants.length; i++) {
    const restaurant = googleUrlRestaurants[i];
    const progress = `[${i + 1}/${googleUrlRestaurants.length}]`;
    
    try {
      const filename = generateFilename(restaurant);
      const filepath = path.join(IMAGES_DIR, filename);
      const localUrl = `/images/restaurants/${filename}`;
      
      // Check if file already exists
      if (fs.existsSync(filepath)) {
        console.log(`${progress} ⏭️  ${restaurant.name} - Image already downloaded`);
        
        // Update database to use local URL
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({ hero_image_url: localUrl })
          .eq('id', restaurant.id);
        
        if (updateError) {
          console.error(`   ❌ Failed to update database: ${updateError.message}`);
          failCount++;
          failedRestaurants.push({ ...restaurant, error: updateError.message });
        } else {
          successCount++;
        }
        continue;
      }
      
      console.log(`${progress} 📥 Downloading: ${restaurant.name}`);
      
      // Download the image
      await downloadImage(restaurant.hero_image_url, filepath);
      
      // Verify the file was created and has content
      const stats = fs.statSync(filepath);
      if (stats.size < 1000) {
        // File too small, likely an error response
        fs.unlinkSync(filepath);
        throw new Error('Downloaded file too small (likely error response)');
      }
      
      // Update database to use local URL
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ hero_image_url: localUrl })
        .eq('id', restaurant.id);
      
      if (updateError) {
        console.error(`   ❌ Failed to update database: ${updateError.message}`);
        failCount++;
        failedRestaurants.push({ ...restaurant, error: updateError.message });
      } else {
        console.log(`   ✅ Saved to: ${localUrl}`);
        successCount++;
      }
      
      // Rate limit: wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (err) {
      console.error(`${progress} ❌ ${restaurant.name}: ${err.message}`);
      failCount++;
      failedRestaurants.push({ ...restaurant, error: err.message });
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Successfully processed: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  
  if (failedRestaurants.length > 0) {
    console.log('\n❌ Failed restaurants:');
    failedRestaurants.forEach(r => {
      console.log(`   - ${r.name} (${r.destination_id}): ${r.error}`);
    });
    
    // Save failed restaurants to a file for retry
    const failedPath = path.join(__dirname, 'failed-restaurant-images.json');
    fs.writeFileSync(failedPath, JSON.stringify(failedRestaurants, null, 2));
    console.log(`\n📝 Failed restaurants saved to: ${failedPath}`);
  }
  
  console.log('\n🎉 Done! Your restaurant images are now stored locally.');
  console.log('   No more Google Places API costs for image loading!');
}

main().catch(console.error);

