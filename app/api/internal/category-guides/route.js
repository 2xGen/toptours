import { NextResponse } from 'next/server';
import { getAllCategoryGuidesForDestination } from '@/lib/categoryGuides';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const destinationId = searchParams.get('destinationId');

  if (!destinationId) {
    return NextResponse.json({ error: 'Destination ID is required' }, { status: 400 });
  }

  try {
    const guides = await getAllCategoryGuidesForDestination(destinationId);
    return NextResponse.json({ guides });
  } catch (error) {
    console.error('API Error fetching category guides:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

