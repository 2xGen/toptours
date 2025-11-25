/**
 * Quick helper to inspect a single destination in the viator_destinations table.
 * Usage:
 *   node scripts/check-viator-destination.js <destinationId>
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const destIdArg = process.argv[2];
if (!destIdArg) {
  console.error('Please provide a destination ID, e.g.: node scripts/check-viator-destination.js 4187');
  process.exit(1);
}

const destinationId = destIdArg.toString().replace(/^d/i, '');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const { data, error } = await supabase
  .from('viator_destinations')
  .select('*')
  .eq('id', destinationId)
  .maybeSingle();

console.log('Error:', error);
console.log('Data:', data);

