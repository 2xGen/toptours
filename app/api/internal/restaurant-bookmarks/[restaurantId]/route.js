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

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

