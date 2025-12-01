#!/usr/bin/env node
/**
 * Check how many restaurant images are using Google Places API URLs
 * 
 * This is a diagnostic script to see the current state of your database
 * and estimate how much the live API URLs are costing you.
 * 
 * Usage: node scripts/check-google-image-urls.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('🔍 Checking Restaurant Image URLs...\n');
  
  // Get all restaurants
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, destination_id, hero_image_url');
  
  if (error) {
    console.error('❌ Failed to fetch restaurants:', error.message);
    process.exit(1);
  }
  
  const total = restaurants.length;
  const googleUrls = restaurants.filter(r => 
    r.hero_image_url && r.hero_image_url.includes('places.googleapis.com')
  );
  const localUrls = restaurants.filter(r => 
    r.hero_image_url && !r.hero_image_url.includes('places.googleapis.com')
  );
  const noImage = restaurants.filter(r => !r.hero_image_url);
  
  console.log('=' .repeat(60));
  console.log('📊 RESTAURANT IMAGE URL ANALYSIS');
  console.log('=' .repeat(60));
  console.log(`Total restaurants:                    ${total}`);
  console.log(`🔴 Using Google Places API URLs:      ${googleUrls.length} (COSTING MONEY!)`);
  console.log(`🟢 Using local/other URLs:            ${localUrls.length}`);
  console.log(`⚪ No image URL:                      ${noImage.length}`);
  
  if (googleUrls.length > 0) {
    console.log('\n' + '=' .repeat(60));
    console.log('💸 COST ESTIMATION');
    console.log('=' .repeat(60));
    console.log('Google Places Photo API pricing: ~$7 per 1000 requests');
    console.log('');
    console.log('If each restaurant image is loaded:');
    console.log(`  - 100 visitors/day × ${googleUrls.length} images = ${100 * googleUrls.length} API calls/day`);
    console.log(`  - Monthly cost estimate: $${((100 * googleUrls.length * 30 / 1000) * 7).toFixed(2)}`);
    console.log('');
    console.log(`  - 1000 visitors/day × ${googleUrls.length} images = ${1000 * googleUrls.length} API calls/day`);
    console.log(`  - Monthly cost estimate: $${((1000 * googleUrls.length * 30 / 1000) * 7).toFixed(2)}`);
    
    console.log('\n' + '=' .repeat(60));
    console.log('🔴 RESTAURANTS WITH GOOGLE API URLS (by destination)');
    console.log('=' .repeat(60));
    
    // Group by destination
    const byDestination = {};
    googleUrls.forEach(r => {
      const dest = r.destination_id || 'unknown';
      if (!byDestination[dest]) byDestination[dest] = [];
      byDestination[dest].push(r);
    });
    
    Object.entries(byDestination)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([dest, rests]) => {
        console.log(`  ${dest}: ${rests.length} restaurants`);
      });
    
    console.log('\n' + '=' .repeat(60));
    console.log('🛠️  TO FIX THIS, RUN:');
    console.log('=' .repeat(60));
    console.log('node scripts/download-restaurant-images.js');
    console.log('');
    console.log('This will download all images locally (one-time API cost)');
    console.log('and update the database to use local URLs.');
  } else {
    console.log('\n✅ All restaurant images are using local URLs. No action needed!');
  }
}

main().catch(console.error);

