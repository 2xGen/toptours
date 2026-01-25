import { NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

/**
 * GET /api/admin/partner-guides
 * Get all partner guides (including unapproved)
 */
export async function GET(request) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    const { data, error } = await supabase
      .from('partner_guides')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ guides: data || [] });
  } catch (error) {
    console.error('Error fetching partner guides:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch partner guides' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/partner-guides
 * Create or update a partner guide
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, ...guideData } = body;

    const supabase = createSupabaseServiceRoleClient();

    if (id) {
      // Update existing guide
      const { data, error } = await supabase
        .from('partner_guides')
        .update(guideData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ guide: data });
    } else {
      // Create new guide
      const { data, error } = await supabase
        .from('partner_guides')
        .insert(guideData)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ guide: data });
    }
  } catch (error) {
    console.error('Error saving partner guide:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save partner guide' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/partner-guides
 * Delete a partner guide
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const supabase = createSupabaseServiceRoleClient();

    const { error } = await supabase
      .from('partner_guides')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting partner guide:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete partner guide' },
      { status: 500 }
    );
  }
}
