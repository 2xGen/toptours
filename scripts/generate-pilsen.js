import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY');
  process.exit(1);
}

// Load generated content
const generatedPath = join(__dirname, '../generated-destination-full-content.json');
let generated = {};
if (fs.existsSync(generatedPath)) {
  generated = JSON.parse(fs.readFileSync(generatedPath, 'utf8'));
}

async function generateDestinationContent(destName, country, type) {
  const prompt = `Write authentic travel content for ${destName}, ${country || 'Czech Republic'} (${type || 'CITY'}). Sound natural, not AI. Include SEO keywords naturally.

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
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    
    let content = null;
    let lastError = null;
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.8,
            responseMimeType: 'application/json',
            maxOutputTokens: 900,
          }
        });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        content = response.text();
        
        if (content) {
          console.log(`   ✓ Using Gemini model: ${modelName}`);
          break;
        }
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    
    if (!content) {
      throw new Error(lastError?.message || 'All Gemini models failed');
    }

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

    // Add Czech Republic climate data
    const czechClimate = {
      weather: "Czech Republic has a temperate continental climate with warm summers and cold winters. Spring and autumn offer mild temperatures perfect for exploring.",
      bestMonths: "May through September offer the best weather for travel, with warm temperatures and longer daylight hours ideal for sightseeing.",
      peakSeason: "Summer months (June-August) are peak tourist season with festivals and outdoor activities, though prices are higher.",
      offSeason: "Winter months offer lower prices and fewer crowds, perfect for experiencing local culture and indoor attractions."
    };
    jsonData.bestTimeToVisit = czechClimate;

    return jsonData;
  } catch (error) {
    console.error(`Error generating content:`, error.message);
    return null;
  }
}

async function main() {
  console.log('\n🚀 Generating content for Pilsen...\n');
  
  const destName = 'Pilsen';
  const country = 'Czech Republic';
  const type = 'CITY';
  const slug = 'pilsen';
  
  if (generated[slug]) {
    console.log('✓ Pilsen already has generated content');
    return;
  }
  
  console.log(`Generating content for ${destName}, ${country}...`);
  const content = await generateDestinationContent(destName, country, type);
  
  if (content) {
    generated[slug] = {
      destinationId: null,
      destinationName: destName,
      country: country,
      region: 'Europe',
      type: type,
      ...content,
    };
    
    fs.writeFileSync(generatedPath, JSON.stringify(generated, null, 2));
    console.log('\n✅ Pilsen content generated successfully!');
    console.log(`   Saved to: generated-destination-full-content.json\n`);
  } else {
    console.log('\n❌ Failed to generate content for Pilsen\n');
  }
}

main().catch(console.error);

