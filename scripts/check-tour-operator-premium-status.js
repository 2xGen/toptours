/**
 * Diagnostic script to check tour operator premium status
 * Usage: node scripts/check-tour-operator-premium-status.js <productId>
 */

import { createSupabaseServiceRoleClient } from '../src/lib/supabaseClient.js';

const productId = process.argv[2];

if (!productId) {
  console.error('Usage: node scripts/check-tour-operator-premium-status.js <productId>');
  console.error('Example: node scripts/check-tour-operator-premium-status.js 119085P2');
  process.exit(1);
}

async function checkPremiumStatus() {
  const supabase = createSupabaseServiceRoleClient();
  
  console.log(`\n🔍 Checking premium status for tour: ${productId}\n`);
  
  // Check if tour exists in operator_tours
  const { data: operatorTour, error: tourError } = await supabase
    .from('operator_tours')
    .select(`
      *,
      tour_operator_subscriptions (
        id,
        operator_name,
        status,
        subscription_plan,
        verified_tour_ids,
        current_period_end
      )
    `)
    .eq('product_id', productId)
    .single();
  
  if (tourError) {
    if (tourError.code === 'PGRST116') {
      console.log('❌ Tour NOT found in operator_tours table');
      console.log('\n📋 Checking all active subscriptions...\n');
      
      // List all active subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('tour_operator_subscriptions')
        .select('id, operator_name, status, verified_tour_ids, total_tours_count')
        .eq('status', 'active');
      
      if (subError) {
        console.error('Error fetching subscriptions:', subError);
        return;
      }
      
      if (subscriptions && subscriptions.length > 0) {
        console.log(`Found ${subscriptions.length} active subscription(s):\n`);
        subscriptions.forEach((sub, idx) => {
          console.log(`${idx + 1}. Subscription ID: ${sub.id}`);
          console.log(`   Operator: ${sub.operator_name}`);
          console.log(`   Tours: ${sub.total_tours_count || 0}`);
          console.log(`   Verified Tour IDs: ${JSON.stringify(sub.verified_tour_ids || [])}\n`);
        });
      } else {
        console.log('No active subscriptions found');
      }
      
      return;
    } else {
      console.error('Error checking operator_tours:', tourError);
      return;
    }
  }
  
  console.log('✅ Tour found in operator_tours table:');
  console.log(JSON.stringify(operatorTour, null, 2));
  
  const subscription = operatorTour.tour_operator_subscriptions;
  
  if (!subscription) {
    console.log('\n❌ No subscription linked to this tour');
    return;
  }
  
  console.log('\n📦 Subscription details:');
  console.log(`   ID: ${subscription.id}`);
  console.log(`   Operator: ${subscription.operator_name}`);
  console.log(`   Status: ${subscription.status}`);
  console.log(`   Plan: ${subscription.subscription_plan}`);
  console.log(`   Period End: ${subscription.current_period_end}`);
  
  if (subscription.status === 'active') {
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    if (endDate < now) {
      console.log('\n⚠️  Subscription has EXPIRED');
    } else {
      console.log('\n✅ Subscription is ACTIVE and valid');
    }
  } else {
    console.log(`\n⚠️  Subscription status is: ${subscription.status} (not active)`);
  }
  
  // Check flags
  console.log('\n🔍 Tour flags:');
  console.log(`   is_selected: ${operatorTour.is_selected}`);
  console.log(`   is_active: ${operatorTour.is_active}`);
  
  if (!operatorTour.is_selected || !operatorTour.is_active) {
    console.log('\n⚠️  Tour is not selected or not active!');
  }
}

checkPremiumStatus().catch(console.error);

