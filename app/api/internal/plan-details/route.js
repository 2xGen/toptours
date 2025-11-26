import { NextResponse } from 'next/server';
import { getPlanItems } from '@/lib/travelPlans';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!planId) {
      return NextResponse.json({ error: 'planId is required' }, { status: 400 });
    }

    const supabase = createSupabaseServiceRoleClient();

    // Fetch plan to get user_id
    const { data: plan, error: planError } = await supabase
      .from('travel_plans')
      .select('user_id')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Fetch creator profile
    let creatorName = null;
    if (plan.user_id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, full_name')
        .eq('id', plan.user_id)
        .maybeSingle();
      
      if (!profileError && profile) {
        creatorName = profile.display_name || profile.full_name || null;
      }
      
      // Debug logging
      if (profileError) {
        console.error(`Error fetching profile for plan ${planId}:`, profileError);
      } else if (profile) {
        console.log(`Profile found for plan ${planId}:`, { display_name: profile.display_name, full_name: profile.full_name, creatorName });
      } else {
        console.log(`No profile found for plan ${planId}, user_id: ${plan.user_id}`);
      }
    }

    // Fetch plan items
    const items = await getPlanItems(planId);

    // Calculate stats
    const toursCount = items.filter(item => item.item_type === 'tour').length;
    const restaurantsCount = items.filter(item => item.item_type === 'restaurant').length;
    
    // Calculate number of days (max day_number, or 0 if no days assigned)
    const days = items.length > 0 
      ? Math.max(...items.map(item => item.day_number || 0).filter(d => d > 0), 0)
      : 0;

    return NextResponse.json({
      creatorName,
      days,
      toursCount,
      restaurantsCount,
    });
  } catch (error) {
    console.error('Error fetching plan details:', error);
    return NextResponse.json({ error: 'Failed to fetch plan details' }, { status: 500 });
  }
}

