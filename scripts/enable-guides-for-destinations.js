/**
 * Enable guides (set hasGuide: true) for specific destinations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentPath = path.join(__dirname, '../generated-destination-full-content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

const destinationSlugs = ['buffalo', 'park-city', 'st-louis'];

console.log('\n🔧 Enabling guides for destinations...\n');

destinationSlugs.forEach(slug => {
  const dest = content[slug];
  if (!dest) {
    console.log(`❌ ${slug}: NOT FOUND`);
    return;
  }

  if (!dest.tourCategories || dest.tourCategories.length === 0) {
    console.log(`⚠️  ${slug}: No tour categories`);
    return;
  }

  console.log(`\n📍 ${dest.destinationName} (${slug}):`);
  
  let updated = 0;
  dest.tourCategories.forEach((cat, index) => {
    const categoryObj = typeof cat === 'object' ? cat : { name: cat };
    const categoryName = categoryObj.name;
    
    // Set hasGuide: true for first 6 categories
    if (index < 6) {
      if (typeof cat === 'object') {
        if (cat.hasGuide !== true) {
          cat.hasGuide = true;
          updated++;
          console.log(`   ✅ Enabled: ${categoryName}`);
        } else {
          console.log(`   ⏭️  Already enabled: ${categoryName}`);
        }
      } else {
        // Convert string to object
        dest.tourCategories[index] = {
          name: categoryName,
          hasGuide: true
        };
        updated++;
        console.log(`   ✅ Enabled: ${categoryName}`);
      }
    } else {
      console.log(`   ⏭️  Skipping: ${categoryName} (not in first 6)`);
    }
  });

  console.log(`   📊 Updated ${updated} categories`);
});

// Save updated content
fs.writeFileSync(contentPath, JSON.stringify(content, null, 2));

console.log('\n' + '━'.repeat(60));
console.log('\n✅ Updated generated-destination-full-content.json');
console.log('   💾 Saved to: ' + contentPath);
console.log('\n🚀 Now run: node scripts/generate-guides-for-specific-destinations.js\n');

