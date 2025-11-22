import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read API key from config
const apiKeysContent = fs.readFileSync(path.join(__dirname, '../config/api-keys.js'), 'utf8');
const base64Match = apiKeysContent.match(/OPENAI_API_KEY_BASE64:\s*['"]([^'"]+)['"]/);
if (!base64Match) {
  throw new Error('Could not find OPENAI_API_KEY_BASE64 in config/api-keys.js');
}
const OPENAI_API_KEY_BASE64 = base64Match[1];
const OPENAI_API_KEY = Buffer.from(OPENAI_API_KEY_BASE64, 'base64').toString('utf8');

// Load data
const viatorDestinationsPath = path.join(__dirname, '../src/data/viatorDestinationsClassified.json');
const destinationsDataPath = path.join(__dirname, '../src/data/destinationsData.js');

const viatorDestinations = JSON.parse(fs.readFileSync(viatorDestinationsPath, 'utf8'));
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

console.log(`\n📊 DESTINATION ANALYSIS:`);
console.log(`   Total destinations: ${viatorDestinations.length}`);
console.log(`   Destinations with guides: ${destinationsWithGuides.length}`);
console.log(`   Destinations without guides: ${destinationsWithoutGuides.length}\n`);

// Group destinations by country for bestTimeToVisit sharing
const destinationsByCountry = {};
destinationsWithoutGuides.forEach(dest => {
  const country = dest.country || 'Unknown';
  if (!destinationsByCountry[country]) {
    destinationsByCountry[country] = [];
  }
  destinationsByCountry[country].push(dest);
});

// Generate country-level bestTimeToVisit data
async function generateCountryClimateData(country, destinations) {
  if (!country || country === 'Unknown' || destinations.length === 0) return null;
  
  const prompt = `Generate travel climate info for ${country} as JSON:
{
  "weather": "Climate description (2-3 sentences)",
  "bestMonths": "Best months with reasons (1-2 sentences)",
  "peakSeason": "Peak season details (1-2 sentences)",
  "offSeason": "Off-season info (1-2 sentences)"
}
Return ONLY valid JSON, no markdown.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a travel content expert. Always return valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200, // Reduced from 300 - climate data is shorter
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const content = data.choices[0].message.content.trim();
    // Try to parse JSON directly
    let jsonData;
    try {
      jsonData = JSON.parse(content);
    } catch (e) {
      // If parsing fails, try to extract JSON from markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from response');
      }
    }

    return jsonData;
  } catch (error) {
    console.error(`Error generating climate data for ${country}:`, error.message);
    return null;
  }
}

// Generate full destination content
async function generateDestinationContent(destination, countryClimateData) {
  const destName = destination.destinationName || destination.name || '';
  const country = destination.country || '';
  const region = destination.region || '';
  const type = destination.type || '';

  const prompt = `Write authentic travel content for ${destName}, ${country} (${type}). Sound natural, not AI. Include SEO keywords naturally.

Generate JSON:
{
  "whyVisit": [
    "Authentic reason with real features (12-18 words, SEO-friendly)",
    "Genuine reason with location details (12-18 words)",
    "Practical benefit unique to ${destName} (12-18 words)",
    "Cultural/historical appeal (12-18 words)",
    "Local experience that's special (12-18 words)",
    "Reason capturing essence (12-18 words)"
  ],
  "highlights": [
    "Real attraction - specific detail (18-25 words, include ${destName})",
    "Another attraction - why worth visiting (18-25 words)",
    "Local experience - practical info (18-25 words)",
    "Cultural/historical site - significance (18-25 words)",
    "Natural feature - why experience it (18-25 words)",
    "Hidden gem or tip (18-25 words)"
  ],
  "gettingAround": "Transportation advice (60-90 words). Mention specific types, costs if relevant. Include 'getting around ${destName}' naturally.",
  "tourCategories": [
    { "name": "Location-specific category for ${destName}", "hasGuide": false },
    { "name": "Category matching geography/culture", "hasGuide": false },
    { "name": "Popular activity type", "hasGuide": false },
    { "name": "Local specialty/unique offering", "hasGuide": false },
    { "name": "Historical/architectural/natural tour type", "hasGuide": false },
    { "name": "Food/nightlife/entertainment category", "hasGuide": false }
  ]
}

Guidelines: Real person tone, specific place names, natural SEO integration, avoid clichés, location-specific tour categories.
Return ONLY valid JSON, no markdown.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Travel writer. Authentic, natural content. Valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 900, // Reduced from 1200 - still enough for quality content
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const content = data.choices[0].message.content.trim();
    let jsonData;
    try {
      jsonData = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from response');
      }
    }

    // Add country-level bestTimeToVisit
    if (countryClimateData) {
      jsonData.bestTimeToVisit = countryClimateData;
    }

    return jsonData;
  } catch (error) {
    console.error(`Error generating content for ${destName}:`, error.message);
    return null;
  }
}

// Main execution
async function main() {
  // Load existing generated content
  const existingContentPath = path.join(__dirname, '../generated-destination-full-content.json');
  let existingContent = {};
  if (fs.existsSync(existingContentPath)) {
    try {
      existingContent = JSON.parse(fs.readFileSync(existingContentPath, 'utf8'));
      console.log(`\n📦 Loaded ${Object.keys(existingContent).length} existing entries`);
    } catch (e) {
      console.log(`\n⚠️  Could not load existing content, starting fresh`);
    }
  }
  
  const output = { ...existingContent }; // Start with existing content
  const countryClimateCache = {};
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  
  // Check if we should filter by country or region (for batch processing)
  const filterArg = process.argv[2] ? process.argv[2].toLowerCase() : null;
  let destinationsToProcess = destinationsWithoutGuides; // All destination types (CITY, TOWN, VILLAGE, REGION, etc.)
  
  if (filterArg) {
    // Check if it's a region filter (common regions)
    const regionKeywords = {
      'caribbean': ['caribbean'],
      'europe': ['europe'],
      'north america': ['north america', 'northamerica'],
      'asia': ['asia', 'asia-pacific', 'asiapacific'],
      'africa': ['africa'],
      'south america': ['south america', 'southamerica'],
      'middle east': ['middle east', 'middleeast']
    };
    
    const isRegionFilter = Object.keys(regionKeywords).some(region => 
      regionKeywords[region].includes(filterArg)
    );
    
    if (isRegionFilter) {
      // Filter by region
      const regionName = Object.keys(regionKeywords).find(region => 
        regionKeywords[region].includes(filterArg)
      );
      destinationsToProcess = destinationsToProcess.filter(d => {
        const destRegion = (d.region || '').toLowerCase();
        const destCountry = (d.country || '').toLowerCase();
        return destRegion.includes(regionName) || 
               (regionName === 'caribbean' && ['jamaica', 'bahamas', 'aruba', 'puerto rico', 'dominican republic', 'barbados', 'trinidad', 'cuba', 'cayman islands', 'british virgin islands', 'us virgin islands', 'st lucia', 'antigua', 'grenada', 'st kitts', 'anguilla', 'montserrat', 'turks and caicos', 'bonaire', 'curacao'].some(c => destCountry.includes(c)));
      });
      console.log(`\n🎯 Filtering for ${regionName} region...`);
      console.log(`   Found ${destinationsToProcess.length} destinations\n`);
    } else {
      // Filter by country
      destinationsToProcess = destinationsToProcess.filter(d => 
        (d.country || '').toLowerCase() === filterArg
      );
      console.log(`\n🎯 Filtering for ${filterArg} country...`);
      console.log(`   Found ${destinationsToProcess.length} destinations\n`);
    }
  }
  
  // Filter out already generated destinations
  const destinationsNeedingGeneration = destinationsToProcess.filter(dest => {
    const slug = generateSlug(dest.destinationName || dest.name || '');
    return !output[slug];
  });
  
  const total = destinationsNeedingGeneration.length;
  const alreadyGenerated = destinationsToProcess.length - total;

  console.log(`\n🚀 Starting content generation...`);
  console.log(`   Total destinations to process: ${destinationsToProcess.length}`);
  console.log(`   Already generated: ${alreadyGenerated}`);
  console.log(`   Remaining to generate: ${total}\n`);

  for (const destination of destinationsNeedingGeneration) {
    const destName = destination.destinationName || destination.name || '';
    const country = destination.country || 'Unknown';
    const slug = generateSlug(destName);

    // Skip if already generated
    if (output[slug]) {
      skipped++;
      continue;
    }

    try {
      // Get or generate country climate data
      if (!countryClimateCache[country] && country !== 'Unknown') {
        console.log(`   Generating climate data for ${country}...`);
        countryClimateCache[country] = await generateCountryClimateData(
          country,
          destinationsByCountry[country] || []
        );
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Generate destination content
      console.log(`   [${processed + 1}/${total}] Generating content for ${destName}...`);
      const content = await generateDestinationContent(
        destination,
        countryClimateCache[country] || null
      );

      if (content) {
        output[slug] = {
          destinationId: destination.destinationId,
          destinationName: destName,
          country: country,
          region: destination.region || '',
          type: destination.type || '',
          ...content,
        };
        processed++;
        
        // Save incrementally every 10 destinations so changes appear in real-time
        if (processed % 10 === 0) {
          const outputPath = path.join(__dirname, '../generated-destination-full-content.json');
          fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
          console.log(`   💾 Progress saved (${processed} generated so far)`);
        }
      } else {
        errors++;
        console.error(`   ❌ Failed to generate content for ${destName}`);
      }

      // Rate limiting: 50 requests per minute
      await new Promise(resolve => setTimeout(resolve, 1200));
    } catch (error) {
      errors++;
      console.error(`   ❌ Error processing ${destName}:`, error.message);
    }
  }

  // Save output
  const outputPath = path.join(__dirname, '../generated-destination-full-content.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n✅ GENERATION COMPLETE!`);
  console.log(`   Successfully generated: ${processed}`);
  console.log(`   Skipped (already exists): ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total processed: ${total}`);
  console.log(`   Total entries in file: ${Object.keys(output).length}`);
  console.log(`\n📁 Results saved to: generated-destination-full-content.json`);
  console.log(`\n📋 NEXT STEPS:`);
  console.log(`   1. Review generated-destination-full-content.json`);
  console.log(`   2. Content is already integrated into destination pages`);
  console.log(`   3. Pages will automatically use this content\n`);
}

main().catch(console.error);

