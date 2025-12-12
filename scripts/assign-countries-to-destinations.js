/**
 * Assign countries to destinations that are missing country information
 * Uses Gemini AI to determine the country for each destination
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load configuration
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env.local');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// Load generated content
const fullContentPath = path.join(__dirname, '../generated-destination-full-content.json');
const fullContentData = JSON.parse(fs.readFileSync(fullContentPath, 'utf8'));

console.log('\n🌍 Assigning countries to destinations...\n');

// Find destinations missing country
const destinationsMissingCountry = Object.entries(fullContentData)
  .filter(([slug, dest]) => !dest.country || dest.country === 'Unknown' || dest.country === '');

console.log(`📊 Found ${destinationsMissingCountry.length} destinations missing country\n`);

if (destinationsMissingCountry.length === 0) {
  console.log('✅ All destinations have countries assigned!\n');
  process.exit(0);
}

// Rate limiting
const RATE_LIMIT_DELAY = 200; // 200ms between requests (5 requests/second = 300 RPM)

// Assign countries to a batch of destinations
async function assignCountriesToBatch(batch) {
  // Create compact list for batch processing
  const destinationsList = batch.map(([slug, dest]) => {
    const name = dest.destinationName || slug;
    const region = dest.region || '';
    return `${slug}:${name}${region ? ` (${region})` : ''}`;
  }).join(', ');
  
  const prompt = `For each destination, determine which country it is located in.

Return ONLY a JSON array. Format: [{"slug":"istanbul","country":"Turkey"},{"slug":"antalya","country":"Turkey"},...]

Use the full official country name (e.g., "United States", "United Kingdom", "South Korea", "China", "India").

Destinations:
${destinationsList}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    // Extract JSON array
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      return JSON.parse(jsonText);
    }
  } catch (error) {
    console.error(`   ❌ Error processing batch:`, error.message);
    return [];
  }
}

// Process destinations in batches
async function processDestinations() {
  let updated = 0;
  let failed = 0;
  const batchSize = 50; // Process 50 at a time (Gemini can handle this)
  
  for (let i = 0; i < destinationsMissingCountry.length; i += batchSize) {
    const batch = destinationsMissingCountry.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(destinationsMissingCountry.length / batchSize);
    
    console.log(`\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} destinations)...`);
    console.log('━'.repeat(80));
    
    try {
      const results = await assignCountriesToBatch(batch);
      
      if (Array.isArray(results)) {
        results.forEach((item) => {
          const slug = item.slug;
          const country = item.country;
          
          if (slug && country && fullContentData[slug]) {
            fullContentData[slug].country = country;
            const destName = fullContentData[slug].destinationName || slug;
            console.log(`   ✅ ${destName} → ${country}`);
            updated++;
          }
        });
        
        // Check which ones failed
        const processedSlugs = new Set(results.map(r => r.slug));
        batch.forEach(([slug, dest]) => {
          if (!processedSlugs.has(slug)) {
            const destName = dest.destinationName || slug;
            console.log(`   ⚠️  ${destName} → Not in response`);
            failed++;
          }
        });
      } else {
        console.log(`   ⚠️  Unexpected response format`);
        failed += batch.length;
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    } catch (error) {
      console.error(`   ❌ Batch error:`, error.message);
      failed += batch.length;
    }
    
    // Save progress after each batch
    fs.writeFileSync(fullContentPath, JSON.stringify(fullContentData, null, 2));
    console.log(`\n   💾 Progress saved (${updated} updated, ${failed} failed so far)`);
  }
  
  return { updated, failed };
}

// Main execution
async function main() {
  console.log('━'.repeat(80));
  console.log(`\n🚀 Starting country assignment for ${destinationsMissingCountry.length} destinations...\n`);
  
  const { updated, failed } = await processDestinations();
  
  // Final save
  fs.writeFileSync(fullContentPath, JSON.stringify(fullContentData, null, 2));
  
  console.log('\n' + '━'.repeat(80));
  console.log(`\n📊 SUMMARY:`);
  console.log(`   ✅ Successfully assigned: ${updated}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📝 Total processed: ${destinationsMissingCountry.length}`);
  console.log(`\n💾 Saved to: ${fullContentPath}\n`);
}

main().catch(console.error);

