import { NextResponse } from 'next/server';
import { getDestinationNameById } from '@/lib/viatorCache';

/**
 * POST /api/internal/destinations
 * Batch fetch destination names from IDs
 * Body: { destinationIds: string[] }
 */
export async function POST(request) {
  try {
    const { destinationIds } = await request.json();
    
    if (!Array.isArray(destinationIds) || destinationIds.length === 0) {
      return NextResponse.json({ success: true, data: {} });
    }

    // Fetch all destination names in parallel
    const destinationPromises = destinationIds.map(async (id) => {
      const result = await getDestinationNameById(id);
      return { id, name: result?.destinationName || null };
    });

    const results = await Promise.all(destinationPromises);
    
    // Convert to object: { "123": "Dubai, UAE", "456": "Paris, France" }
    const destinationMap = {};
    results.forEach(({ id, name }) => {
      if (name) {
        destinationMap[id] = name;
      }
    });

    return NextResponse.json({ success: true, data: destinationMap });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

