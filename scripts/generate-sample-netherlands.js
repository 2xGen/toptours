import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the main generation function
const generateScript = await import('./generate-destination-full-content.js');

// Load data
const viatorDestinationsPath = path.join(__dirname, '../src/data/viatorDestinationsClassified.json');
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');

const viatorDestinations = JSON.parse(fs.readFileSync(viatorDestinationsPath, 'utf8'));
const destinationsContent = fs.readFileSync(destinationsDataPath, 'utf8');
const destinationsMatch = destinationsContent.match(/export const destinations = \[([\s\S]*?)\];/);
const destinationsWithGuides = eval(`[${destinationsMatch[1]}]`);

// Get destination IDs with guides
const guideDestinationNames = new Set();
destinationsWithGuides.forEach(dest => {
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

// Filter Netherlands cities without guides
const netherlandsCities = viatorDestinations
  .filter(dest => {
    const country = (dest.country || '').toLowerCase().trim();
    const type = dest.type || '';
    const destName = (dest.destinationName || dest.name || '').toLowerCase().trim();
    
    return country === 'netherlands' && 
           type === 'CITY' && 
           !guideDestinationNames.has(destName);
  })
  .slice(0, 10); // Get first 10

console.log(`\n📊 Found ${netherlandsCities.length} Netherlands cities without guides:\n`);
netherlandsCities.forEach((d, i) => {
  console.log(`   ${i + 1}. ${d.destinationName} (ID: ${d.destinationId})`);
});

// Now run the generation for just these cities
console.log(`\n🚀 Generating content for ${netherlandsCities.length} Netherlands destinations...\n`);

// We'll need to modify the main function to accept a filter
// For now, let's create a simplified version

