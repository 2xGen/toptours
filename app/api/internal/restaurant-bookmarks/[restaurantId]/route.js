import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  const supabase = createSupabaseServiceRoleClient();

  try {
    const { restaurantId } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!restaurantId || !userId) {
      return NextResponse.json({ error: 'Missing restaurantId or userId' }, { status: 400 });
    }

    const { error } = await supabase
      .from('restaurant_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId);

    if (error) {
      console.error('Error deleting restaurant bookmark:', error);
      // If table doesn't exist, return success (graceful degradation)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('restaurant_bookmarks table does not exist, skipping delete');
        return NextResponse.json({ ok: true, skipped: true });
      }
      throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error in restaurant-bookmarks DELETE:', err);
    return NextResponse.json({ 
      error: err.message || 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}

