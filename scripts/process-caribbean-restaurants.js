/**
 * Process all remaining Caribbean destinations
 * Fetches restaurants and generates SEO content
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const caribbeanDestinations = [
  { id: 'st-lucia', query: 'restaurants in St Lucia', location: '13.9094,-60.9789' },
  { id: 'barbados', query: 'restaurants in Barbados', location: '13.1939,-59.5432' },
  { id: 'santo-domingo', query: 'restaurants in Santo Domingo', location: '18.4861,-69.9312' },
  { id: 'exuma', query: 'restaurants in Exuma Bahamas', location: '23.6198,-75.9695' },
  { id: 'puerto-rico', query: 'restaurants in Puerto Rico', location: '18.2208,-66.5901' },
  { id: 'turks-and-caicos', query: 'restaurants in Turks and Caicos', location: '21.6940,-71.7978' },
  { id: 'grenada', query: 'restaurants in Grenada', location: '12.1165,-61.6790' },
  { id: 'st-martin', query: 'restaurants in St Martin', location: '18.0708,-63.0501' },
  { id: 'bonaire', query: 'restaurants in Bonaire', location: '12.1784,-68.2385' },
  { id: 'cayman-islands', query: 'restaurants in Cayman Islands', location: '19.3133,-81.2546' },
  { id: 'antigua-and-barbuda', query: 'restaurants in Antigua', location: '17.0747,-61.7964' },
  { id: 'trinidad-and-tobago', query: 'restaurants in Trinidad and Tobago', location: '10.6918,-61.2225' },
  { id: 'british-virgin-islands', query: 'restaurants in British Virgin Islands', location: '18.4207,-64.6399' },
  { id: 'st-kitts-and-nevis', query: 'restaurants in St Kitts', location: '17.3578,-62.7830' },
  { id: 'martinique', query: 'restaurants in Martinique', location: '14.6415,-61.0242' },
  { id: 'guadeloupe', query: 'restaurants in Guadeloupe', location: '16.2650,-61.5510' },
];

async function processDestination(dest, index, total) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[${index + 1}/${total}] Processing: ${dest.id}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Step 1: Fetch restaurants
    console.log(`📥 Fetching restaurants for ${dest.id}...`);
    const fetchCmd = `node scripts/fetch-restaurants-from-google-places.js "${dest.id}" "${dest.query}" "${dest.location}"`;
    const { stdout: fetchOutput, stderr: fetchError } = await execAsync(fetchCmd);
    console.log(fetchOutput);
    if (fetchError) console.error('Fetch error:', fetchError);

    // Wait a bit between API calls
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Generate SEO content
    console.log(`\n📝 Generating SEO content for ${dest.id}...`);
    const seoCmd = `node scripts/generate-restaurant-seo-content.js ${dest.id}`;
    const { stdout: seoOutput, stderr: seoError } = await execAsync(seoCmd);
    console.log(seoOutput);
    if (seoError) console.error('SEO error:', seoError);

    console.log(`\n✅ Completed: ${dest.id}\n`);
  } catch (error) {
    console.error(`❌ Error processing ${dest.id}:`, error.message);
    console.log(`Continuing with next destination...\n`);
  }
}

async function main() {
  console.log(`🚀 Starting batch processing of ${caribbeanDestinations.length} Caribbean destinations...\n`);

  for (let i = 0; i < caribbeanDestinations.length; i++) {
    await processDestination(caribbeanDestinations[i], i, caribbeanDestinations.length);
    
    // Rate limiting between destinations
    if (i < caribbeanDestinations.length - 1) {
      console.log('⏳ Waiting 3 seconds before next destination...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 All Caribbean destinations processed!`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error);

