import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * GET /api/partners/invite/check?code=ABC123
 * Check if an invite code exists and return its type
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();

    const { data: inviteCode, error } = await supabase
      .from('partner_invite_codes')
      .select('type, duration_months, max_tours, restaurant_id, destination_id, restaurant_slug, restaurant_name, restaurant_url, is_active, used_at, expires_at')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (error || !inviteCode) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      );
    }

    // Check if code is valid
    if (!inviteCode.is_active) {
      return NextResponse.json(
        { error: 'This invite code has been deactivated' },
        { status: 400 }
      );
    }

    if (inviteCode.used_at) {
      return NextResponse.json(
        { error: 'This invite code has already been used' },
        { status: 400 }
      );
    }

    if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invite code has expired' },
        { status: 400 }
      );
    }

    const response = {
      type: inviteCode.type,
      duration_months: inviteCode.duration_months,
      max_tours: inviteCode.max_tours,
    };

    // Include restaurant info if it's a restaurant code
    if (inviteCode.type === 'restaurant') {
      response.restaurant = {
        id: inviteCode.restaurant_id,
        destination_id: inviteCode.destination_id,
        slug: inviteCode.restaurant_slug,
        name: inviteCode.restaurant_name,
        url: inviteCode.restaurant_url,
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error checking invite code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

