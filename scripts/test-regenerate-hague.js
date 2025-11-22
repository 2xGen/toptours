import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateContentWithAI } from './generate-destination-seo-content.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load The Hague from classified data
const viatorDestinationsPath = path.join(__dirname, '../src/data/viatorDestinationsClassified.json');
const viatorDestinations = JSON.parse(fs.readFileSync(viatorDestinationsPath, 'utf8'));

// Find The Hague
const theHague = viatorDestinations.find(dest => {
  const name = (dest.destinationName || '').toLowerCase();
  return name.includes('hague') || name === 'the hague';
});

if (!theHague) {
  console.error('❌ Could not find The Hague in destinations');
  process.exit(1);
}

console.log('🔄 Regenerating content for The Hague...\n');
console.log(`Destination: ${theHague.destinationName}`);
console.log(`Country: ${theHague.country || 'N/A'}`);
console.log(`Region: ${theHague.region || 'N/A'}\n`);

// Generate new content
const content = await generateContentWithAI(theHague);

if (!content) {
  console.error('❌ Failed to generate content');
  process.exit(1);
}

console.log('\n✅ Generated new content:\n');
console.log('HERO DESCRIPTION:');
console.log(content.heroDescription);
console.log('\nCARD SENTENCE:');
console.log(content.cardSentence);
console.log('\nSEO TITLE:');
console.log(content.seoTitle);

// Update the JSON file
const seoContentPath = path.join(__dirname, '../generated-destination-seo-content.json');
const seoContent = JSON.parse(fs.readFileSync(seoContentPath, 'utf8'));

seoContent['the-hague'] = {
  destinationId: theHague.destinationId,
  destinationName: theHague.destinationName,
  country: theHague.country || '',
  region: theHague.region || '',
  type: theHague.type || '',
  briefDescription: content.cardSentence,
  heroDescription: content.heroDescription,
  seo: {
    title: content.seoTitle,
    description: content.cardSentence,
    ogImage: "https://ouqeoizufbofdqbuiwvx.supabase.co/storage/v1/object/public/blogs/How%20to%20Choose%20the%20Best%20Tour%20for%20Your%20Next%20Vacation.png"
  }
};

fs.writeFileSync(seoContentPath, JSON.stringify(seoContent, null, 2));

console.log('\n✅ Updated generated-destination-seo-content.json');
console.log('\nYou can now check http://localhost:3001/destinations/the-hague to see the new description');

