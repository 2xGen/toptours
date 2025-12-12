/**
 * CLI script to generate partner invite codes
 * 
 * Usage:
 *   node scripts/generate-partner-invite-code.js --type tour_operator --duration 3 --max-tours 15
 *   node scripts/generate-partner-invite-code.js --type restaurant --duration 1
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (flag) => {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
};

const type = getArg('--type') || getArg('-t');
const duration = parseInt(getArg('--duration') || getArg('-d') || '3');
const maxTours = parseInt(getArg('--max-tours') || getArg('-m') || '15');
const restaurantUrl = getArg('--restaurant-url') || getArg('-r');
const expiresAt = getArg('--expires') || getArg('-e');
const notes = getArg('--notes') || getArg('-n');

if (!type || !['tour_operator', 'restaurant'].includes(type)) {
  console.error('❌ Invalid type. Must be "tour_operator" or "restaurant"');
  console.error('\nUsage:');
  console.error('  node scripts/generate-partner-invite-code.js --type tour_operator --duration 3 --max-tours 15');
  console.error('  node scripts/generate-partner-invite-code.js --type restaurant --duration 1');
  process.exit(1);
}

if (![1, 3].includes(duration)) {
  console.error('❌ Invalid duration. Must be 1 or 3');
  process.exit(1);
}

if (type === 'restaurant' && !restaurantUrl) {
  console.error('❌ Restaurant URL is required for restaurant codes');
  console.error('\nUsage:');
  console.error('  node scripts/generate-partner-invite-code.js --type restaurant --duration 1 --restaurant-url "/destinations/aruba/restaurants/barefoot-beach-bar"');
  process.exit(1);
}

// Generate unique code
const generateCode = () => {
  const prefix = type === 'tour_operator' ? 'TOUR' : 'REST';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${year}-${random}`;
};

async function createInviteCode() {
  let code = generateCode();
  let attempts = 0;

  // Ensure code is unique
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from('partner_invite_codes')
      .select('id')
      .eq('code', code)
      .single();

    if (!existing) {
      break;
    }
    code = generateCode();
    attempts++;
  }

  if (attempts >= 10) {
    console.error('❌ Failed to generate unique code');
    process.exit(1);
  }

  // For restaurants, we need to call the API to extract restaurant info from URL
  if (type === 'restaurant') {
    if (!restaurantUrl) {
      console.error('❌ Restaurant URL is required for restaurant codes');
      console.error('\nUsage:');
      console.error('  node scripts/generate-partner-invite-code.js --type restaurant --duration 1 --restaurant-url "/destinations/aruba/restaurants/barefoot-beach-bar"');
      process.exit(1);
    }

    // Call the API endpoint to generate the code (it will extract restaurant info)
    try {
      const response = await fetch('http://localhost:3000/api/internal/partner-invites/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'restaurant',
          duration_months: duration,
          restaurant_url: restaurantUrl,
          expires_at: expiresAt || null,
          notes: notes || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('\n✅ Invite code generated successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Code:        ${data.code}`);
        console.log(`Type:        ${data.inviteCode.type}`);
        console.log(`Duration:    ${data.inviteCode.duration_months} month(s)`);
        if (data.inviteCode.restaurant_name) {
          console.log(`Restaurant:  ${data.inviteCode.restaurant_name}`);
        }
        if (data.inviteCode.restaurant_url) {
          console.log(`URL:         ${data.inviteCode.restaurant_url}`);
        }
        if (data.inviteCode.expires_at) {
          console.log(`Expires:     ${new Date(data.inviteCode.expires_at).toLocaleDateString()}`);
        }
        if (data.inviteCode.notes) {
          console.log(`Notes:       ${data.inviteCode.notes}`);
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\nShare this code: ${data.code}`);
        console.log(`Redeem at: https://toptours.ai/partners/invite\n`);
        process.exit(0);
      } else {
        console.error('❌ Error:', data.error);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error calling API:', error.message);
      console.error('Make sure the dev server is running on localhost:3000');
      process.exit(1);
    }
  }

  // For tour operators, generate directly
  const { data: inviteCode, error } = await supabase
    .from('partner_invite_codes')
    .insert({
      code: code,
      type: type,
      duration_months: duration,
      max_tours: type === 'tour_operator' ? maxTours : null,
      expires_at: expiresAt || null,
      notes: notes || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating invite code:', error);
    process.exit(1);
  }

  console.log('\n✅ Invite code generated successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Code:        ${inviteCode.code}`);
  console.log(`Type:        ${inviteCode.type}`);
  console.log(`Duration:    ${inviteCode.duration_months} month(s)`);
  if (inviteCode.max_tours) {
    console.log(`Max Tours:   ${inviteCode.max_tours}`);
  }
  if (inviteCode.restaurant_name) {
    console.log(`Restaurant:  ${inviteCode.restaurant_name}`);
  }
  if (inviteCode.restaurant_url) {
    console.log(`URL:         ${inviteCode.restaurant_url}`);
  }
  if (inviteCode.expires_at) {
    console.log(`Expires:     ${new Date(inviteCode.expires_at).toLocaleDateString()}`);
  }
  if (inviteCode.notes) {
    console.log(`Notes:       ${inviteCode.notes}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\nShare this code: ${inviteCode.code}`);
  console.log(`Redeem at: https://toptours.ai/partners/invite\n`);
}

createInviteCode().catch(console.error);

