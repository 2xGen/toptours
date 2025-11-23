import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load generated content
const generatedPath = path.join(__dirname, '../generated-destination-full-content.json');
const generated = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));

// Load all destinations
const viatorDestinationsPath = path.join(__dirname, '../src/data/viatorDestinationsClassified.json');
const viatorDestinations = JSON.parse(fs.readFileSync(viatorDestinationsPath, 'utf8'));

// Load destinations with guides
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');
const destinationsContent = fs.readFileSync(destinationsDataPath, 'utf8');
const destinationsMatch = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
const destinationsWithGuides = eval(`[${destinationsMatch[1]}]`);

// Get destination IDs with guides
const guideDestinationIds = new Set();
const guideDestinationNames = new Set();
destinationsWithGuides.forEach(dest => {
  guideDestinationIds.add(dest.id);
  guideDestinationNames.add((dest.name || '').toLowerCase().trim());
  guideDestinationNames.add((dest.fullName || dest.name || '').toLowerCase().trim());
});

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Filter destinations without guides
const destinationsWithoutGuides = viatorDestinations.filter(dest => {
  const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
  const baseName = destName.split(',')[0].trim();
  
  if (guideDestinationNames.has(destName)) return false;
  if (guideDestinationNames.has(baseName)) return false;
  
  const slug = generateSlug(destName);
  if (guideDestinationIds.has(slug)) return false;
  
  return true;
});

// Filter for Europe
const europeDestinations = destinationsWithoutGuides.filter(d => {
  const region = (d.region || '').toLowerCase();
  return region.includes('europe');
});

console.log('\n🔍 Checking which European destinations are missing content...\n');

const missing = [];
for (const dest of europeDestinations) {
  const destName = dest.destinationName || dest.name || '';
  const slug = generateSlug(destName);
  
  if (!generated[slug]) {
    missing.push({
      name: destName,
      slug: slug,
      country: dest.country || 'Unknown',
      type: dest.type || 'Unknown',
    });
  }
}

if (missing.length === 0) {
  console.log('✅ All European destinations have content!');
} else {
  console.log(`❌ Found ${missing.length} missing destinations:\n`);
  missing.forEach((dest, index) => {
    console.log(`${index + 1}. ${dest.name} (${dest.country})`);
    console.log(`   Slug: ${dest.slug}`);
    console.log(`   Type: ${dest.type}\n`);
  });
  
  console.log('\n💡 To retry, run:');
  console.log(`   node scripts/generate-destination-full-content.js europe`);
  console.log('\n   Or retry specific destination by filtering the script.\n');
}

