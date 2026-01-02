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

    if (error) {
      console.error('Error fetching restaurant bookmarks:', error);
      // If table doesn't exist, return empty array instead of error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('restaurant_bookmarks table does not exist, returning empty array');
        return NextResponse.json({ bookmarks: [] });
      }
      throw error;
    }
    return NextResponse.json({ bookmarks: data || [] });
  } catch (err) {
    console.error('Error in restaurant-bookmarks GET:', err);
    return NextResponse.json({ 
      error: err.message || 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
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

    if (error) {
      console.error('Error upserting restaurant bookmark:', error);
      // If table doesn't exist, return success (graceful degradation)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('restaurant_bookmarks table does not exist, skipping bookmark');
        return NextResponse.json({ ok: true, skipped: true });
      }
      throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error in restaurant-bookmarks POST:', err);
    return NextResponse.json({ 
      error: err.message || 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}

