#!/usr/bin/env node
/**
 * Check ALL restaurant images (with pagination)
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function getAllRestaurants() {
  const allRestaurants = [];
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, destination_id, hero_image_url')
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    if (!data || data.length === 0) break;
    
    allRestaurants.push(...data);
    console.log(`Fetched ${allRestaurants.length} restaurants...`);
    
    if (data.length < limit) break;
    offset += limit;
  }
  
  return allRestaurants;
}

async function main() {
  console.log('🔍 Checking ALL Restaurant Image URLs...\n');
  
  const restaurants = await getAllRestaurants();
  
  const total = restaurants.length;
  const googleUrls = restaurants.filter(r => 
    r.hero_image_url && r.hero_image_url.includes('places.googleapis.com')
  );
  const localUrls = restaurants.filter(r => 
    r.hero_image_url && !r.hero_image_url.includes('places.googleapis.com')
  );
  const noImage = restaurants.filter(r => !r.hero_image_url);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPLETE RESTAURANT IMAGE URL ANALYSIS');
  console.log('='.repeat(60));
  console.log(`Total restaurants:                    ${total}`);
  console.log(`🔴 Using Google Places API URLs:      ${googleUrls.length} (COSTING MONEY!)`);
  console.log(`🟢 Using local/other URLs:            ${localUrls.length}`);
  console.log(`⚪ No image URL:                      ${noImage.length}`);
  
  if (googleUrls.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('💸 ONE-TIME DOWNLOAD COST');
    console.log('='.repeat(60));
    const cost = (googleUrls.length / 1000 * 7).toFixed(2);
    console.log(`${googleUrls.length} images × $7/1000 = ~$${cost}`);
  }
}

main().catch(console.error);

