import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * POST /api/internal/restaurant-premium/update-settings
 * Updates restaurant premium settings (button colors, CTA text, etc.)
 * Uses restaurant_premium_subscriptions table
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      restaurantId,
      destinationId,
      userId,
      subscriptionId, // Optional: if provided, update by subscription ID
      colorScheme,
      heroCTAIndex,
      midCTAIndex,
      endCTAIndex,
      stickyCTAIndex,
    } = body;

    if (!restaurantId || !destinationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: restaurantId, destinationId, userId' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();

    const updateData = {};
    
    if (colorScheme !== undefined) updateData.color_scheme = colorScheme;
    if (heroCTAIndex !== undefined) updateData.hero_cta_index = heroCTAIndex;
    if (midCTAIndex !== undefined) updateData.mid_cta_index = midCTAIndex;
    if (endCTAIndex !== undefined) updateData.end_cta_index = endCTAIndex;
    if (stickyCTAIndex !== undefined) updateData.sticky_cta_index = stickyCTAIndex;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No settings provided to update' },
        { status: 400 }
      );
    }

    // If subscriptionId is provided, try to update by ID first (more reliable)
    if (subscriptionId) {
      const { error: premiumError } = await supabase
        .from('restaurant_premium_subscriptions')
        .update(updateData)
        .eq('id', subscriptionId)
        .eq('user_id', userId); // Security: ensure user owns this subscription

      if (!premiumError) {
        console.log(`✅ Updated restaurant_premium_subscriptions settings for subscription ${subscriptionId}`);
        return NextResponse.json({ success: true });
      } else {
        console.warn('Could not update restaurant_premium_subscriptions by ID:', premiumError);
        // Fall through to update by restaurant_id + destination_id
      }
    }

    // Fallback: Update old restaurant_premium_subscriptions table
    const updateData = {};
    
    if (colorScheme !== undefined) updateData.color_scheme = colorScheme;
    if (heroCTAIndex !== undefined) updateData.hero_cta_index = heroCTAIndex;
    if (midCTAIndex !== undefined) updateData.mid_cta_index = midCTAIndex;
    if (endCTAIndex !== undefined) updateData.end_cta_index = endCTAIndex;
    if (stickyCTAIndex !== undefined) updateData.sticky_cta_index = stickyCTAIndex;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No settings provided to update' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('restaurant_premium_subscriptions')
      .update(updateData)
      .eq('restaurant_id', restaurantId)
      .eq('destination_id', destinationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating restaurant premium settings:', error);
      return NextResponse.json(
        { error: 'Failed to update settings', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Updated restaurant_premium_subscriptions settings for restaurant ${restaurantId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in update-settings route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

