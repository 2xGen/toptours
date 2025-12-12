/**
 * List all destinations that have guides
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

// Load destinations data
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');
const destinationsContent = fs.readFileSync(destinationsDataPath, 'utf8');
const destinationsMatch = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
let hardcodedDestinations = [];
if (destinationsMatch) {
  hardcodedDestinations = eval(`[${destinationsMatch[1]}]`);
}

// Load generated content
const fullContentPath = path.join(__dirname, '../generated-destination-full-content.json');
const fullContentData = JSON.parse(fs.readFileSync(fullContentPath, 'utf8'));

console.log('\n📚 Fetching all destinations with guides from database...\n');

// Get all unique destination IDs from category_guides table
async function getAllDestinationsWithGuides() {
  const allGuides = [];
  const limit = 1000;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('category_guides')
      .select('destination_id')
      .order('destination_id', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching guides:', error);
      process.exit(1);
    }

    if (data && data.length > 0) {
      allGuides.push(...data);
      offset += data.length;
      hasMore = data.length === limit;
    } else {
      hasMore = false;
    }
  }

  // Get unique destination IDs
  const uniqueDestinationIds = [...new Set(allGuides.map(g => g.destination_id))];
  return uniqueDestinationIds.sort();
}

// Get destination name from various sources
function getDestinationName(destinationId) {
  // Check hardcoded destinations
  const hardcoded = hardcodedDestinations.find(d => d.id === destinationId);
  if (hardcoded) {
    return {
      name: hardcoded.fullName || hardcoded.name,
      country: hardcoded.country || null,
      region: hardcoded.category || null,
      source: 'hardcoded',
      imageUrl: hardcoded.imageUrl || null,
    };
  }

  // Check generated content
  const generated = fullContentData[destinationId];
  if (generated) {
    return {
      name: generated.destinationName || destinationId,
      country: generated.country || null,
      region: generated.region || null,
      source: 'generated',
      imageUrl: generated.imageUrl || null,
    };
  }

  // Fallback to ID
  return {
    name: destinationId,
    country: null,
    region: null,
    source: 'unknown',
    imageUrl: null,
  };
}

// Main execution
async function main() {
  const destinationIds = await getAllDestinationsWithGuides();
  
  console.log(`✅ Found ${destinationIds.length} destinations with guides\n`);
  console.log('━'.repeat(80));
  console.log('\n📋 DESTINATIONS WITH GUIDES:\n');

  const destinations = destinationIds.map(id => ({
    id,
    ...getDestinationName(id),
  }));

  // Group by region
  const byRegion = {};
  destinations.forEach(dest => {
    const region = dest.region || 'Unknown';
    if (!byRegion[region]) {
      byRegion[region] = [];
    }
    byRegion[region].push(dest);
  });

  // Sort regions
  const regionOrder = ['North America', 'Europe', 'Caribbean', 'Asia-Pacific', 'Africa', 'South America', 'Middle East', 'Unknown'];
  const sortedRegions = Object.keys(byRegion).sort((a, b) => {
    const aIndex = regionOrder.indexOf(a);
    const bIndex = regionOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  let totalCount = 0;
  sortedRegions.forEach(region => {
    const regionDests = byRegion[region].sort((a, b) => a.name.localeCompare(b.name));
    console.log(`\n📍 ${region.toUpperCase()} (${regionDests.length} destinations):`);
    console.log('─'.repeat(80));
    
    regionDests.forEach((dest, index) => {
      const imageIcon = dest.imageUrl ? '📸' : '  ';
      const sourceIcon = dest.source === 'hardcoded' ? '⭐' : '📝';
      console.log(`   ${(totalCount + index + 1).toString().padStart(3)}. ${imageIcon} ${sourceIcon} ${dest.name}${dest.country ? ` (${dest.country})` : ''}`);
    });
    
    totalCount += regionDests.length;
  });

  console.log('\n' + '━'.repeat(80));
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total destinations with guides: ${destinations.length}`);
  console.log(`   With images: ${destinations.filter(d => d.imageUrl).length}`);
  console.log(`   Hardcoded: ${destinations.filter(d => d.source === 'hardcoded').length}`);
  console.log(`   Generated: ${destinations.filter(d => d.source === 'generated').length}`);
  console.log(`   Unknown: ${destinations.filter(d => d.source === 'unknown').length}`);
  console.log('\n');

  // Also create a simple list file
  const simpleList = destinations.map((d, i) => 
    `${i + 1}. ${d.name}${d.country ? ` (${d.country})` : ''}`
  ).join('\n');

  const outputPath = path.join(__dirname, '../DESTINATIONS_WITH_GUIDES_LIST.txt');
  fs.writeFileSync(outputPath, `DESTINATIONS WITH GUIDES (${destinations.length} total)\n\n${simpleList}`);
  console.log(`💾 Simple list saved to: ${outputPath}\n`);
}

main().catch(console.error);

