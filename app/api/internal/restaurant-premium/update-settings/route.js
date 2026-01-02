import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * POST /api/internal/restaurant-premium/update-settings
 * Updates restaurant premium settings (button colors, CTA text, etc.)
 * Supports both old restaurant_premium_subscriptions and new restaurant_subscriptions tables
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      restaurantId,
      destinationId,
      userId,
      subscriptionId, // Optional: if provided, update restaurant_subscriptions table
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

    // If subscriptionId is provided, update the new restaurant_subscriptions table
    if (subscriptionId) {
      const updateData = {};
      
      if (colorScheme !== undefined) updateData.color_scheme = colorScheme;
      if (heroCTAIndex !== undefined) updateData.hero_cta_index = heroCTAIndex;
      if (midCTAIndex !== undefined) updateData.mid_cta_index = midCTAIndex;
      if (endCTAIndex !== undefined) updateData.end_cta_index = endCTAIndex;
      if (stickyCTAIndex !== undefined) updateData.sticky_cta_index = stickyCTAIndex;

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('restaurant_subscriptions')
          .update(updateData)
          .eq('id', subscriptionId)
          .eq('user_id', userId); // Security: ensure user owns this subscription

        if (error) {
          console.error('Error updating restaurant_subscriptions settings:', error);
          return NextResponse.json(
            { error: 'Failed to update settings', details: error.message },
            { status: 500 }
          );
        }

        console.log(`✅ Updated restaurant_subscriptions settings for subscription ${subscriptionId}`);
      }

      // Also update the old restaurant_premium_subscriptions table for backward compatibility
      const { error: oldTableError } = await supabase
        .from('restaurant_premium_subscriptions')
        .update(updateData)
        .eq('restaurant_id', restaurantId)
        .eq('destination_id', destinationId)
        .eq('user_id', userId);

      if (oldTableError) {
        // Don't fail if old table doesn't exist or record doesn't exist - just log
        console.warn('Could not update restaurant_premium_subscriptions (may not exist):', oldTableError);
      }

      return NextResponse.json({ success: true });
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

