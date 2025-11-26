import { NextResponse } from 'next/server';
import { getDestinationById } from '@/data/destinationsData';
import { getViatorDestinationBySlug, getViatorDestinationById } from '@/lib/supabaseCache';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destinationId');

    if (!destinationId) {
      return NextResponse.json({ error: 'destinationId is required' }, { status: 400 });
    }

    // Try curated destinations first
    let destination = getDestinationById(destinationId);
    
    // If not found in curated, try database
    if (!destination) {
      try {
        // Try by slug first
        let dbDestination = await getViatorDestinationBySlug(destinationId);
        
        // If not found by slug, try by ID (numeric Viator ID)
        if (!dbDestination && /^\d+$/.test(destinationId)) {
          dbDestination = await getViatorDestinationById(destinationId);
        }
        
        if (dbDestination) {
          destination = {
            id: dbDestination.slug || destinationId,
            name: dbDestination.name,
            fullName: dbDestination.name,
            country: dbDestination.country,
            category: dbDestination.region, // Use region as category
            imageUrl: null,
          };
        }
      } catch (error) {
        console.error('Error fetching destination from database:', error);
      }
    }
    
    return NextResponse.json({ destination });
  } catch (error) {
    console.error('Error in destination-info API:', error);
    return NextResponse.json({ error: 'Failed to fetch destination info' }, { status: 500 });
  }
}

