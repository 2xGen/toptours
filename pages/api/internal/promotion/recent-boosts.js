import { getRecentBoosts } from '@/lib/promotionSystem';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;

    const boosts = await getRecentBoosts(limit);

    return NextResponse.json(boosts);
  } catch (error) {
    console.error('Error in recent-boosts API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent boosts' },
      { status: 500 }
    );
  }
}

