import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createSupabaseServiceRoleClient();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('restaurant_bookmarks')
      .select('restaurant_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ bookmarks: data || [] });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const supabase = createSupabaseServiceRoleClient();

  try {
    const body = await request.json();
    const { userId, restaurantId } = body;

    if (!userId || !restaurantId) {
      return NextResponse.json({ error: 'Missing userId or restaurantId' }, { status: 400 });
    }

    const { error } = await supabase
      .from('restaurant_bookmarks')
      .upsert({ user_id: userId, restaurant_id: restaurantId });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

