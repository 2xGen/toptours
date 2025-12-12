/**
 * Add image URLs to destinations in generated-destination-full-content.json
 * Updates destinations that have images available
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Destination images mapping
const destinationImages = {
  'anchorage': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Anchorage.png',
  'aspen': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Aspen.png',
  'austin': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Austin.png',
  'boston': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Boston.png',
  'breckenridge': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Breckenridge.png',
  'buffalo': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Buffalo.png',
  'charleston': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Charleston.png',
  'cincinnati': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Cincinnati.png',
  'columbus': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Columbus.png',
  'dallas': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Dallas.png',
  'houston': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Houston.png',
  'indianapolis': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Indianapolis.png',
  'juneau': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Juneau.png',
  'kansas-city': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Kansas%20City.png',
  'key-west': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Key%20West.png',
  'milwaukee': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Milwaukee.png',
  'minneapolis': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Minneapolis.png',
  'park-city': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Park%20City.png',
  'philadelphia': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Philadelphia.png',
  'portland': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Portland.png',
  'providence': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Providence.png',
  'san-antonio': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/San%20Antonio.png',
  'san-diego': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/san%20diego.png',
  'savannah': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Savannah.png',
  'scottsdale': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Scottsdale.png',
  'phoenix': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Scottsdale.png', // Same as Scottsdale
  'seattle': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/seattle.png',
  'st-louis': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/St.%20Louis.png',
  'vail': 'https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/new%20destinations/Vail.png',
};

// Load generated content
const contentPath = path.join(__dirname, '../generated-destination-full-content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

console.log('\n🖼️  Adding image URLs to destinations...\n');

let updated = 0;
let notFound = 0;

Object.entries(destinationImages).forEach(([slug, imageUrl]) => {
  if (content[slug]) {
    if (content[slug].imageUrl && content[slug].imageUrl !== imageUrl) {
      console.log(`   🔄 Updating ${slug}: ${content[slug].destinationName}`);
      console.log(`      Old: ${content[slug].imageUrl}`);
      console.log(`      New: ${imageUrl}`);
    } else if (!content[slug].imageUrl) {
      console.log(`   ✅ Adding image to ${slug}: ${content[slug].destinationName}`);
    } else {
      console.log(`   ⏭️  ${slug} already has correct image`);
      return;
    }
    content[slug].imageUrl = imageUrl;
    updated++;
  } else {
    console.log(`   ⚠️  ${slug} not found in generated content`);
    notFound++;
  }
});

// Save updated content
fs.writeFileSync(contentPath, JSON.stringify(content, null, 2));

console.log(`\n✅ Updated ${updated} destinations with images`);
if (notFound > 0) {
  console.log(`   ⚠️  ${notFound} destinations not found (may need to be added first)`);
}
console.log(`\n💾 Saved to: ${contentPath}\n`);

