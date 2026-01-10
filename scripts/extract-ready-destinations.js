/**
 * Extract ready-to-create destinations from check script output
 * Helper script to get the JSON array of ready-to-create destinations
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Load the check script's BABYQUIP_DESTINATIONS list (we'll import the logic)
// Actually, let's just run the check and extract the JSON output
const { execSync } = await import('child_process');

try {
  const output = execSync('node scripts/check-babyquip-destinations.js', { encoding: 'utf8' });
  
  // Extract JSON array from output
  const jsonMatch = output.match(/\[[\s\S]*?\]/);
  if (jsonMatch) {
    const jsonStr = jsonMatch[0];
    const destinations = JSON.parse(jsonStr);
    
    console.log(JSON.stringify(destinations, null, 2));
    
    // Also save to file for easy copy-paste
    const fs = await import('fs');
    fs.writeFileSync(
      join(__dirname, 'ready-usa-destinations.json'),
      JSON.stringify(destinations, null, 2)
    );
    console.error(`\n✅ Saved ${destinations.length} destinations to scripts/ready-usa-destinations.json`);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
