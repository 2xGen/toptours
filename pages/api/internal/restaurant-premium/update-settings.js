/**
 * Restaurant Premium - Update Settings
 * Allows users to update their restaurant's button color and CTA text
 */

import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { COLOR_SCHEMES, CTA_OPTIONS } from '@/lib/restaurantPremium';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      restaurantId, 
      destinationId, 
      userId,
      colorScheme,
      heroCTAIndex,
      midCTAIndex,
      endCTAIndex,
      stickyCTAIndex,
    } = req.body;

    if (!restaurantId || !destinationId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate color scheme
    if (colorScheme && !COLOR_SCHEMES[colorScheme]) {
      return res.status(400).json({ error: 'Invalid color scheme' });
    }

    // Validate CTA indexes
    if (heroCTAIndex !== undefined && (heroCTAIndex < 0 || heroCTAIndex >= CTA_OPTIONS.hero.length)) {
      return res.status(400).json({ error: 'Invalid hero CTA index' });
    }
    if (midCTAIndex !== undefined && (midCTAIndex < 0 || midCTAIndex >= CTA_OPTIONS.mid.length)) {
      return res.status(400).json({ error: 'Invalid mid CTA index' });
    }
    if (endCTAIndex !== undefined && (endCTAIndex < 0 || endCTAIndex >= CTA_OPTIONS.end.length)) {
      return res.status(400).json({ error: 'Invalid end CTA index' });
    }
    if (stickyCTAIndex !== undefined && (stickyCTAIndex < 0 || stickyCTAIndex >= CTA_OPTIONS.sticky.length)) {
      return res.status(400).json({ error: 'Invalid sticky CTA index' });
    }

    const supabase = createSupabaseServiceRoleClient();

    // Verify the user owns this subscription
    const { data: subscription, error: fetchError } = await supabase
      .from('restaurant_premium_subscriptions')
      .select('id, user_id')
      .eq('restaurant_id', restaurantId)
      .eq('destination_id', destinationId)
      .single();

    if (fetchError || !subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    if (subscription.user_id !== userId) {
      return res.status(403).json({ error: 'You do not have permission to update this subscription' });
    }

    // Build update object with only provided fields
    const updates = {};
    if (colorScheme !== undefined) updates.color_scheme = colorScheme;
    if (heroCTAIndex !== undefined) updates.hero_cta_index = heroCTAIndex;
    if (midCTAIndex !== undefined) updates.mid_cta_index = midCTAIndex;
    if (endCTAIndex !== undefined) updates.end_cta_index = endCTAIndex;
    if (stickyCTAIndex !== undefined) updates.sticky_cta_index = stickyCTAIndex;
    updates.updated_at = new Date().toISOString();

    // Update the subscription
    const { error: updateError } = await supabase
      .from('restaurant_premium_subscriptions')
      .update(updates)
      .eq('restaurant_id', restaurantId)
      .eq('destination_id', destinationId);

    if (updateError) {
      console.error('Error updating settings:', updateError);
      return res.status(500).json({ error: 'Failed to update settings' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in update-settings:', error);
    return res.status(500).json({ error: error.message || 'Failed to update settings' });
  }
}

