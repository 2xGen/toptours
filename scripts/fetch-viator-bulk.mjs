/**
 * One-off: call Viator POST /products/bulk (sandbox or live) and log/write response.
 * Use for batch export of Central Park (or other) product details.
 * Loads .env.local from project root. Run: node scripts/fetch-viator-bulk.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env.local');
const cwdEnv = path.join(process.cwd(), '.env.local');
const toLoad = fs.existsSync(envPath) ? envPath : cwdEnv;

if (toLoad && fs.existsSync(toLoad)) {
  const content = fs.readFileSync(toLoad, 'utf8').replace(/\r\n/g, '\n');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) {
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  }
}

const apiKey = process.env.VIATOR_API_KEY;
const base = process.env.VIATOR_API_BASE_URL || 'https://api.sandbox.viator.com/partner';

if (!apiKey) {
  console.error('Missing VIATOR_API_KEY in .env.local');
  process.exit(1);
}

// Central Park tours: bike, walking, horse, secrets, picnic (user-provided)
const productCodes = [
  '5548740P2',  // Central Park Bike Tour
  '233384P5',   // Best of Central Park Bike Tour
  '37907P15',   // Guided Walking Tour Of Central Park
  '147315P6',   // Central Park Private Walking Tour
  '180862P2',   // NYC Central Park Horse and Carriage Ride: Long Ride 45 min
  '186327P2',   // Private NYC Central Park Horse Carriage Ride (Guided) Since 1965
  '86536P1',    // Secret Places of Central Park
  '43581P4',    // Central Park Secrets And Highlights
  '399066P1',   // Central Park Luxury Picnic for 2
  '5557P20',    // Central Park Picnic with Full Day Bike Rental',
];

const url = `${base}/products/bulk`;

const res = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json;version=2.0',
    'Accept-Language': 'en-US',
    'exp-api-key': apiKey,
  },
  body: JSON.stringify({ productCodes }),
});

console.log('Status:', res.status);
const data = await res.json();

if (!res.ok) {
  console.log('Error body:', JSON.stringify(data, null, 2));
  process.exit(1);
}

const outPath = path.join(root, 'scripts', 'viator-bulk-central-park.json');
fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Written', Array.isArray(data) ? data.length : 0, 'products to', outPath);

if (Array.isArray(data) && data[0]) {
  const first = data[0];
  console.log('\n--- First product keys:', Object.keys(first));
  console.log('--- productCode:', first.productCode);
  console.log('--- title:', first.title);
  if (first.itinerary?.itineraryItems?.length) {
    console.log('--- itinerary items:', first.itinerary.itineraryItems.length);
  }
}
