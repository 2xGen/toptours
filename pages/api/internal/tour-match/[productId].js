import { extractTourStructuredValues, calculatePreferenceMatch } from '@/lib/tourEnrichment';
import { createSupabaseServiceRoleClient } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ error: 'Missing product id' });
    }

    const supabase = createSupabaseServiceRoleClient();
    const { extractOnly } = req.body;
    
    // If extractOnly, we don't need user preferences
    let userPreferences = null;
    if (!extractOnly) {
      // Get user ID from request (should be sent from client after auth check)
      const { userId } = req.body;
      if (!userId) {
        return res.status(401).json({ error: 'User authentication required' });
      }

      // Fetch user preferences from Supabase (use cached version)
      const { getCachedUserProfile } = await import('@/lib/supabaseCache');
      const profile = await getCachedUserProfile(userId);

      if (!profile) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      userPreferences = profile.trip_preferences;
      if (!userPreferences || typeof userPreferences !== 'object') {
        return res.status(400).json({ 
          error: 'No trip preferences found. Please set your preferences in your profile first.' 
        });
      }
    }

    // Get tour data (from request body or fetch from Viator)
    let tour = null;
    if (req.body && typeof req.body === 'object' && req.body.tour) {
      tour = req.body.tour;
    }

    if (!tour) {
      const apiKey = process.env.VIATOR_API_KEY || '282a363f-5d60-456a-a6a0-774ec4832b07';
      const url = `https://api.viator.com/partner/products/${productId}?currency=USD`;

      const productResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'exp-api-key': apiKey,
          Accept: 'application/json;version=2.0',
          'Accept-Language': 'en-US',
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!productResponse.ok) {
        const errorText = await productResponse.text();
        console.error('Failed to fetch tour from Viator:', errorText);
        return res.status(500).json({ error: 'Unable to fetch tour details' });
      }

      tour = await productResponse.json();
    }

    if (!tour || tour.error) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Check if tour already has structured values in database (use cached version)
    const { getCachedTourEnrichment } = await import('@/lib/supabaseCache');
    const enrichment = await getCachedTourEnrichment(productId);

    let tourValues = null;

    // If structured values exist, use them
    if (enrichment?.structured_values && typeof enrichment.structured_values === 'object') {
      tourValues = enrichment.structured_values;
    } else {
      // Extract structured values using AI (one-time)
      const extractionResult = await extractTourStructuredValues(tour);
      
      if (extractionResult.error) {
        return res.status(500).json({ error: extractionResult.error });
      }

      tourValues = extractionResult.values;

      // Save structured values to database for future use (as JSONB)
      const { error: upsertError } = await supabase
        .from('tour_enrichment')
        .upsert({
          product_id: productId,
          structured_values: tourValues, // JSONB column accepts object directly
        }, {
          onConflict: 'product_id',
        });

      if (upsertError) {
        console.error('Error saving structured values:', upsertError);
        // Continue anyway - we have the values in memory
      }
    }

    // If extractOnly mode, just return that values were extracted
    if (extractOnly) {
      return res.status(200).json({ 
        valuesExtracted: true,
        structuredValues: tourValues 
      });
    }

    // Calculate match using simple algorithm (no AI)
    const matchResult = calculatePreferenceMatch(userPreferences, tourValues);

    if (matchResult.error) {
      return res.status(500).json({ error: matchResult.error });
    }

    return res.status(200).json({ match: matchResult });
  } catch (error) {
    console.error('Error generating tour match:', error);
    return res.status(500).json({ error: 'Failed to generate tour match' });
  }
}

