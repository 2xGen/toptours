import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env.local');
  console.error('   Get your API key from: https://aistudio.google.com/app/apikey');
  process.exit(1);
}

console.log(`🔑 Using Gemini API key (first 10 chars): ${GEMINI_API_KEY.substring(0, 10)}...`);

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
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Try different models in order of preference
    const models = [
      'gemini-2.5-flash-lite', // Cheapest, fastest - try first
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ];
    
    let content = null;
    let lastError = null;
    
    let usedModel = null;
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            responseMimeType: 'application/json',
            maxOutputTokens: 200,
          }
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        content = response.text();
        
        if (content) {
          usedModel = modelName;
          break; // Success, exit loop
        }
      } catch (error) {
        lastError = error;
        continue; // Try next model
      }
    }
    
    if (usedModel) {
      console.log(`   ✓ Using Gemini model: ${usedModel}`);
    }
    
    if (!content) {
      throw new Error(lastError?.message || 'All Gemini models failed');
    }

    // Parse JSON response with multiple fallback strategies
    let jsonData;
    try {
      // First, try direct parsing
      jsonData = JSON.parse(content);
    } catch (e) {
      // Strategy 2: Remove markdown code blocks if present
      let cleanedContent = content.trim();
      cleanedContent = cleanedContent.replace(/^```json\s*/i, '');
      cleanedContent = cleanedContent.replace(/^```\s*/i, '');
      cleanedContent = cleanedContent.replace(/\s*```$/i, '');
      
      try {
        jsonData = JSON.parse(cleanedContent);
      } catch (e2) {
        // Strategy 3: Extract JSON object from text using regex
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            jsonData = JSON.parse(jsonMatch[0]);
          } catch (e3) {
            // Strategy 4: Try to fix common JSON issues
            let fixedJson = jsonMatch[0]
              .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
              .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3'); // Quote unquoted keys
            
            try {
              jsonData = JSON.parse(fixedJson);
            } catch (e4) {
              // Last resort: log the actual content for debugging
              console.error(`   ⚠️  Raw response (first 200 chars): ${content.substring(0, 200)}`);
              throw new Error(`Could not parse JSON from response: ${e4.message}`);
            }
          }
        } else {
          console.error(`   ⚠️  Raw response (first 200 chars): ${content.substring(0, 200)}`);
          throw new Error('Could not find JSON object in response');
        }
      }
    }

    // Validate that we have the required fields
    if (!jsonData.weather || !jsonData.bestMonths) {
      console.warn(`   ⚠️  Incomplete climate data for ${country}, using fallback`);
      // Return a basic fallback structure
      return {
        weather: `${country} has diverse climate conditions across different regions.`,
        bestMonths: 'Spring and fall typically offer the best weather conditions.',
        peakSeason: 'Summer months are peak season with warmer weather and more tourists.',
        offSeason: 'Winter months offer lower prices and fewer crowds.'
      };
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
  "bestTimeToVisit": {
    "weather": "Climate description for ${destName} (2-3 sentences). Describe the typical weather patterns, seasonal variations, and regional climate characteristics specific to this destination.",
    "bestMonths": "Best months to visit ${destName} with specific reasons (1-2 sentences). Mention actual month names and why those months are ideal (weather, events, fewer crowds, etc.).",
    "peakSeason": "Peak season details for ${destName} (1-2 sentences). Describe when peak season occurs, what to expect (weather, crowds, prices), and the atmosphere during this time.",
    "offSeason": "Off-season information for ${destName} (1-2 sentences). Describe off-season months, what conditions to expect (weather, prices, crowds), and benefits of visiting during this time."
  },
  "tourCategories": [
    { "name": "Location-specific category for ${destName}", "hasGuide": false },
    { "name": "Category matching geography/culture", "hasGuide": false },
    { "name": "Popular activity type", "hasGuide": false },
    { "name": "Local specialty/unique offering", "hasGuide": false },
    { "name": "Historical/architectural/natural tour type", "hasGuide": false },
    { "name": "Food/nightlife/entertainment category", "hasGuide": false }
  ]
}

Guidelines: Real person tone, specific place names, natural SEO integration, avoid clichés, location-specific tour categories. For bestTimeToVisit, be specific about ${destName}'s climate and seasons - mention actual months, weather patterns, and seasonal characteristics unique to this destination.
Return ONLY valid JSON, no markdown.`;

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Try different models in order of preference
    const models = [
      'gemini-2.5-flash-lite', // Cheapest, fastest - try first
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ];
    
    let content = null;
    let lastError = null;
    let usedModel = null;
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.8,
            responseMimeType: 'application/json',
            maxOutputTokens: 1200, // Increased to accommodate bestTimeToVisit
          }
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        content = response.text();
        
        if (content) {
          usedModel = modelName;
          break; // Success, exit loop
        }
      } catch (error) {
        lastError = error;
        continue; // Try next model
      }
    }
    
    if (usedModel) {
      console.log(`   ✓ Using Gemini model: ${usedModel}`);
    }
    
    if (!content) {
      throw new Error(lastError?.message || 'All Gemini models failed');
    }

    // Parse JSON response with improved error handling
    let jsonData;
    try {
      // First, try direct parsing
      jsonData = JSON.parse(content);
    } catch (e) {
      // Strategy 2: Remove markdown code blocks if present
      let cleanedContent = content.trim();
      cleanedContent = cleanedContent.replace(/^```json\s*/i, '');
      cleanedContent = cleanedContent.replace(/^```\s*/i, '');
      cleanedContent = cleanedContent.replace(/\s*```$/i, '');
      
      try {
        jsonData = JSON.parse(cleanedContent);
      } catch (e2) {
        // Strategy 3: Extract JSON object from text using regex
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            jsonData = JSON.parse(jsonMatch[0]);
          } catch (e3) {
            // Strategy 4: Try to fix common JSON issues
            let fixedJson = jsonMatch[0]
              .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
              .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3'); // Quote unquoted keys
            
            try {
              jsonData = JSON.parse(fixedJson);
            } catch (e4) {
              console.error(`   ⚠️  Raw response (first 200 chars): ${content.substring(0, 200)}`);
              throw new Error(`Could not parse JSON from response: ${e4.message}`);
            }
          }
        } else {
          console.error(`   ⚠️  Raw response (first 200 chars): ${content.substring(0, 200)}`);
          throw new Error('Could not find JSON object in response');
        }
      }
    }

    // Ensure bestTimeToVisit exists (should be in response, but add fallback if missing)
    if (!jsonData.bestTimeToVisit || !jsonData.bestTimeToVisit.weather) {
      // Use country climate data if available, otherwise use fallback
      if (countryClimateData && countryClimateData.weather) {
        jsonData.bestTimeToVisit = countryClimateData;
      } else {
        // Fallback: provide basic bestTimeToVisit structure
        const country = destination.country || '';
        jsonData.bestTimeToVisit = {
          weather: `${destName}${country ? `, ${country}` : ''} has diverse climate conditions that vary by region and season.`,
          bestMonths: 'Spring and fall typically offer the best combination of pleasant weather and fewer crowds.',
          peakSeason: 'Summer months are peak season with warmer weather, but also higher prices and more tourists.',
          offSeason: 'Winter months offer lower prices and fewer crowds, though weather may be cooler in some regions.'
        };
      }
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

  console.log(`\n🚀 Starting content generation with Gemini 2.5 Flash Lite...`);
  console.log(`   Total destinations to process: ${destinationsToProcess.length}`);
  console.log(`   Already generated: ${alreadyGenerated}`);
  console.log(`   Remaining to generate: ${total}`);
  console.log(`   Estimated cost: ~$${(total * 0.0003).toFixed(2)} (vs $${(total * 0.0016).toFixed(2)} with OpenAI)`);
  console.log(`   Estimated time: ~${Math.ceil(total / 300)} minutes (vs ~${Math.ceil(total / 50)} minutes with OpenAI)\n`);

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
      // Note: bestTimeToVisit is now generated directly in destination content, 
      // so country climate data is optional (only used as fallback if needed)
      // We skip country climate generation to save API calls and time
      
      // Generate destination content (includes bestTimeToVisit in the response)
      console.log(`   [${processed + 1}/${total}] Generating content for ${destName}...`);
      const content = await generateDestinationContent(
        destination,
        null // No longer needed since bestTimeToVisit is in the prompt
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

      // Rate limiting: Reduced delay for Gemini (higher rate limits)
      await new Promise(resolve => setTimeout(resolve, 200));
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

