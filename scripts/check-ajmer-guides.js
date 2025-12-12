// Quick script to check if guides exist for destination_id = 'ajmer'
import { createSupabaseServiceRoleClient } from '../src/lib/supabaseClient.js';

(async () => {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    // Check for guides with destination_id = 'ajmer'
    console.log('🔍 Checking category_guides for destination_id = "ajmer"...\n');
    
    const { data, error } = await supabase
      .from('category_guides')
      .select('id, destination_id, category_slug, category_name, title, subtitle')
      .eq('destination_id', 'ajmer')
      .order('category_name', { ascending: true });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No guides found for destination_id = "ajmer"');
      console.log('\n🔍 Trying lowercase "ajmer"...');
      
      const { data: lowerData, error: lowerError } = await supabase
        .from('category_guides')
        .select('id, destination_id, category_slug, category_name, title, subtitle')
        .eq('destination_id', 'ajmer'.toLowerCase())
        .order('category_name', { ascending: true });
      
      if (lowerError) {
        console.error('❌ Error (lowercase):', lowerError);
        return;
      }
      
      if (!lowerData || lowerData.length === 0) {
        console.log('⚠️ No guides found for lowercase "ajmer" either');
      } else {
        console.log(`✅ Found ${lowerData.length} guides for lowercase "ajmer":`);
        lowerData.forEach((guide, idx) => {
          console.log(`  ${idx + 1}. ${guide.category_name} (${guide.category_slug})`);
        });
      }
    } else {
      console.log(`✅ Found ${data.length} guides for destination_id = "ajmer":`);
      data.forEach((guide, idx) => {
        console.log(`  ${idx + 1}. ${guide.category_name} (${guide.category_slug})`);
        console.log(`     Title: ${guide.title}`);
      });
    }
    
    // Also check what destination_id values exist (sample)
    console.log('\n🔍 Checking sample destination_id values in category_guides...');
    const { data: sampleData } = await supabase
      .from('category_guides')
      .select('destination_id')
      .limit(20);
    
    if (sampleData) {
      const uniqueDests = [...new Set(sampleData.map(d => d.destination_id))];
      console.log(`Sample destination_id values: ${uniqueDests.slice(0, 10).join(', ')}...`);
    }
    
  } catch (err) {
    console.error('❌ Script error:', err);
  }
})();

