import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { getRestaurantBySlug } from '@/lib/restaurants';
import { cookies } from 'next/headers';

/**
 * POST /api/internal/partner-invites/generate
 * Generate a new partner invite code (Admin only)
 * 
 * Body: {
 *   type: 'tour_operator' | 'restaurant',
 *   duration_months: 1 | 3,
 *   max_tours?: number (for tour operators, default 15),
 *   restaurant_url?: string (for restaurants: e.g., "/destinations/aruba/restaurants/barefoot-beach-bar"),
 *   expires_at?: string (ISO date),
 *   notes?: string
 * }
 */
export async function POST(request) {
  try {
    // TODO: Add admin authentication check
    // For now, we'll allow it but you should add proper admin auth
    
    const body = await request.json();
    const {
      type,
      duration_months,
      max_tours,
      restaurant_url,
      expires_at,
      notes
    } = body;

    if (!type || !['tour_operator', 'restaurant'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "tour_operator" or "restaurant"' },
        { status: 400 }
      );
    }

    if (!duration_months || ![1, 3].includes(duration_months)) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be 1 or 3 months' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();

    // Generate a unique code
    const generateCode = () => {
      const prefix = type === 'tour_operator' ? 'TOUR' : 'REST';
      const year = new Date().getFullYear();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      return `${prefix}${year}-${random}`;
    };

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
        break; // Code is unique
      }
      code = generateCode();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'Failed to generate unique code. Please try again.' },
        { status: 500 }
      );
    }

    // For restaurants, extract info from URL
    let restaurantId = null;
    let destinationId = null;
    let restaurantSlug = null;
    let restaurantName = null;

    if (type === 'restaurant') {
      if (!restaurant_url) {
        return NextResponse.json(
          { error: 'Restaurant URL is required for restaurant codes' },
          { status: 400 }
        );
      }

      // Parse URL: /destinations/{destinationId}/restaurants/{restaurantSlug}
      const urlMatch = restaurant_url.match(/\/destinations\/([^\/]+)\/restaurants\/([^\/]+)/);
      if (!urlMatch) {
        return NextResponse.json(
          { error: 'Invalid restaurant URL format. Expected: /destinations/{destination}/restaurants/{restaurant-slug}' },
          { status: 400 }
        );
      }

      destinationId = urlMatch[1];
      restaurantSlug = urlMatch[2];

      // Fetch restaurant from database to get ID and name
      const restaurant = await getRestaurantBySlug(destinationId, restaurantSlug);
      if (!restaurant) {
        return NextResponse.json(
          { error: `Restaurant not found: ${restaurantSlug} in ${destinationId}` },
          { status: 404 }
        );
      }

      restaurantId = restaurant.id;
      restaurantName = restaurant.name || restaurant.restaurant_name || null;
    }

    // Create invite code
    const { data: inviteCode, error } = await supabase
      .from('partner_invite_codes')
      .insert({
        code: code,
        type: type,
        duration_months: duration_months,
        max_tours: type === 'tour_operator' ? (max_tours || 15) : null,
        restaurant_id: restaurantId,
        destination_id: destinationId,
        restaurant_slug: restaurantSlug,
        restaurant_name: restaurantName,
        restaurant_url: restaurant_url || null,
        expires_at: expires_at || null,
        notes: notes || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invite code:', error);
      return NextResponse.json(
        { error: 'Failed to create invite code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      code: inviteCode.code,
      inviteCode: inviteCode,
    });

  } catch (error) {
    console.error('Error generating invite code:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

