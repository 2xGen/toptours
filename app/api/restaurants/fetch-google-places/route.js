import { NextResponse } from 'next/server';

/**
 * API endpoint to fetch restaurant data from Google Places API
 * DISABLED: No Google Places API calls are made. Nothing is called to Google.
 * POST /api/restaurants/fetch-google-places
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Google Places API is disabled. No API calls are made.' },
    { status: 501 }
  );
}
