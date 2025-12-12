/**
 * Check which destinations with images have guides
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentPath = path.join(__dirname, '../generated-destination-full-content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

const destinationsWithImages = [
  'anchorage', 'aspen', 'austin', 'boston', 'breckenridge', 'buffalo',
  'charleston', 'cincinnati', 'columbus', 'dallas', 'houston', 'indianapolis',
  'juneau', 'kansas-city', 'key-west', 'milwaukee', 'park-city', 'philadelphia',
  'portland', 'providence', 'san-antonio', 'san-diego', 'savannah', 'scottsdale',
  'phoenix', 'seattle', 'st-louis', 'vail'
];

console.log('\n📊 Checking destinations with images...\n');

let withGuides = 0;
let withoutGuides = 0;
let notFound = 0;

destinationsWithImages.forEach(slug => {
  const dest = content[slug];
  if (!dest) {
    console.log(`❌ ${slug}: NOT FOUND`);
    notFound++;
    return;
  }
  
  const hasGuides = dest.tourCategories?.some(c => 
    typeof c === 'object' && c.hasGuide === true
  );
  const hasImage = !!dest.imageUrl;
  
  if (hasImage && hasGuides) {
    console.log(`✅ ${slug}: ${dest.destinationName} - Has image & guides`);
    withGuides++;
  } else if (hasImage && !hasGuides) {
    console.log(`⚠️  ${slug}: ${dest.destinationName} - Has image but NO guides`);
    withoutGuides++;
  } else {
    console.log(`❌ ${slug}: ${dest.destinationName} - Missing image`);
  }
});

console.log('\n' + '━'.repeat(60));
console.log(`\n📊 Summary:`);
console.log(`   ✅ With images & guides: ${withGuides}`);
console.log(`   ⚠️  With images but NO guides: ${withoutGuides}`);
console.log(`   ❌ Not found: ${notFound}`);
console.log(`\n💡 Destinations with images but no guides need guides generated first`);
console.log(`   They will appear in the count once guides are generated.\n`);

