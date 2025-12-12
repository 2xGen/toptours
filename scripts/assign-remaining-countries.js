/**
 * Assign countries to the remaining destinations that failed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

const fullContentPath = path.join(__dirname, '../generated-destination-full-content.json');
const fullContentData = JSON.parse(fs.readFileSync(fullContentPath, 'utf8'));

// Find remaining destinations missing country
const missing = Object.entries(fullContentData)
  .filter(([slug, dest]) => !dest.country || dest.country === 'Unknown' || dest.country === '');

console.log(`\n🌍 Assigning countries to ${missing.length} remaining destinations...\n`);

if (missing.length === 0) {
  console.log('✅ All destinations have countries!\n');
  process.exit(0);
}

async function assignCountry(slug, destination) {
  const name = destination.destinationName || slug;
  const region = destination.region || '';
  
  const prompt = `What country is "${name}" located in? ${region ? `Region: ${region}` : ''}

Return ONLY a JSON object: {"country": "Country Name"}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsed = JSON.parse(text);
    return parsed.country || null;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

for (const [slug, destination] of missing) {
  const name = destination.destinationName || slug;
  console.log(`📍 ${name}...`);
  
  const country = await assignCountry(slug, destination);
  
  if (country) {
    fullContentData[slug].country = country;
    console.log(`   ✅ → ${country}\n`);
  } else {
    console.log(`   ⚠️  Could not determine country\n`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 200));
}

fs.writeFileSync(fullContentPath, JSON.stringify(fullContentData, null, 2));
console.log('💾 Saved!\n');

