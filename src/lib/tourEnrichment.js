import { destinations as siteDestinations } from '@/data/destinationsData';
import { viatorRefToSlug } from '@/data/viatorDestinationMap';
import { createSupabaseServiceRoleClient } from './supabaseClient';

let cachedOpenAiKey = null;

const resolveOpenAiKey = () => {
  if (cachedOpenAiKey !== null) return cachedOpenAiKey;

  // Check for OPENAI_API_KEY (most common)
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey && envKey.trim()) {
    cachedOpenAiKey = envKey.trim();
    return cachedOpenAiKey;
  }

  // Check for base64 encoded version
  const envBase64 = process.env.OPENAI_API_KEY_BASE64;
  if (envBase64 && envBase64.trim()) {
    try {
      cachedOpenAiKey = Buffer.from(envBase64.trim(), 'base64').toString('utf8');
      return cachedOpenAiKey;
    } catch (e) {
      console.error('Failed to decode OPENAI_API_KEY_BASE64:', e);
    }
  }

  // Check for NEXT_PUBLIC_OPENAI_API_KEY (though this shouldn't be public)
  const publicKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (publicKey && publicKey.trim()) {
    cachedOpenAiKey = publicKey.trim();
    return cachedOpenAiKey;
  }

  // Log available env vars for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    const envKeys = Object.keys(process.env).filter(key => 
      key.includes('OPENAI') || key.includes('OPEN_AI')
    );
    console.log('Available OpenAI-related env vars:', envKeys);
  }

  return null;
};

export const cleanText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/\s+/g, ' ').trim();
};

const extractHighlights = (tour, limit = 3) => {
  const sources = [
    tour.viatorUniqueContent?.highlights,
    tour.description?.highlights,
    tour.productContent?.highlights,
    tour.highlights,
  ];

  for (const source of sources) {
    if (Array.isArray(source) && source.length > 0) {
      const normalized = source
        .map((item) => {
          if (typeof item === 'string') return cleanText(item);
          if (item?.text) return cleanText(item.text);
          if (item?.name) return cleanText(item.name);
          return '';
        })
        .filter(Boolean);

      if (normalized.length > 0) {
        return normalized.slice(0, limit);
      }
    }
  }

  return [];
};

const isKnownSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  return siteDestinations.some((dest) => dest.id === slug);
};

const getSlugFromViatorRef = (ref) => {
  if (!ref) return null;
  const normalized = String(ref).replace(/^d/i, '');
  if (/^\d+$/.test(normalized) && viatorRefToSlug[normalized]) {
    return viatorRefToSlug[normalized];
  }
  return null;
};

const buildRecommendationCopy = (tour) => {
  const summaryParts = [];

  const uniqueSummary =
    tour.viatorUniqueContent?.longDescription ||
    tour.viatorUniqueContent?.shortDescription ||
    tour.description?.summary ||
    tour.description?.shortDescription ||
    '';

  if (uniqueSummary) {
    summaryParts.push(cleanText(uniqueSummary));
  } else if (tour.description?.description) {
    summaryParts.push(cleanText(tour.description.description));
  } else {
    summaryParts.push(`This experience, "${tour.title}", is a standout choice on TopTours thanks to its consistent reviews and balanced itinerary.`);
  }

  const highlights = extractHighlights(tour);
  if (highlights.length > 0) {
    summaryParts.push(
      `Travelers highlight ${highlights
        .map((item, index) => (index === highlights.length - 1 && index !== 0 ? `and ${item}` : item))
        .join(highlights.length > 2 ? ', ' : highlights.length === 2 ? ' ' : '')}.`
    );
  }

  const operator =
    tour.supplier?.name ||
    tour.supplierName ||
    tour.operator?.name ||
    tour.vendor?.name ||
    tour.partner?.name ||
    '';

  if (operator) {
    summaryParts.push(`Operated by ${operator}, this experience keeps itineraries personal and flexible.`);
  }

  if (tour.duration?.fixedDurationInMinutes || typeof tour.duration === 'number') {
    const minutes = tour.duration?.fixedDurationInMinutes || tour.duration;
    if (minutes) {
      const hours = Math.round((minutes / 60) * 10) / 10;
      if (hours > 0) {
        summaryParts.push(`Expect roughly ${hours >= 1 ? `${hours} hour${hours > 1 ? 's' : ''}` : `${minutes} minutes`} of well-paced exploring.`);
      }
    }
  }

  return cleanText(summaryParts.join(' '));
};

const truncate = (value, max = 900) => {
  if (!value || typeof value !== 'string') return '';
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
};

const stripCodeFences = (text) => {
  if (!text) return text;
  return text.replace(/```json|```/gi, '').trim();
};

const buildAiPrompt = (tour) => {
  const title = tour.title || 'Unknown tour';
  const destination =
    tour.destinations?.[0]?.destinationName ||
    tour.destinations?.[0]?.name ||
    tour.destinationName ||
    '';
  const description = truncate(
    tour.viatorUniqueContent?.longDescription ||
      tour.viatorUniqueContent?.shortDescription ||
      tour.description?.summary ||
      tour.description?.shortDescription ||
      tour.description?.description ||
      ''
  );
  const highlights = extractHighlights(tour).slice(0, 3);
  const inclusions = Array.isArray(tour.inclusions)
    ? tour.inclusions
        .map((item) => {
          if (typeof item === 'string') return cleanText(item);
          if (item?.text) return cleanText(item.text);
          if (item?.name) return cleanText(item.name);
          if (item?.description) return cleanText(item.description);
          return '';
        })
        .filter(Boolean)
        .slice(0, 4)
    : [];
  const operator =
    tour.supplier?.name ||
    tour.supplierName ||
    tour.operator?.name ||
    tour.vendor?.name ||
    tour.partner?.name ||
    '';
  const experienceDetail = description ? truncate(description, 220) : '';
  const durationLabel = (() => {
    const minutes =
      tour.itinerary?.duration?.fixedDurationInMinutes ||
      tour.duration?.fixedDurationInMinutes ||
      tour.duration?.variableDurationFromMinutes ||
      (typeof tour.duration === 'number' ? tour.duration : null);
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.round((minutes / 60) * 10) / 10;
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  })();
  const experienceHook = [
    tour.productContent?.highlights?.[0],
    highlights?.[0],
    inclusions?.[0],
  ].find(Boolean);
  const uniqueDetails = [
    operator ? `Operator: ${operator}` : '',
    inclusions.length ? `Included perks: ${inclusions.join(', ')}` : '',
    tour.description?.highlights
      ? `Tour highlights: ${(Array.isArray(tour.description.highlights)
          ? tour.description.highlights
          : [tour.description.highlights]).join(', ')}`
      : '',
    experienceDetail ? `Signature moment: ${experienceDetail}` : '',
  ].filter(Boolean);

  return `
You are TopTours.ai, the editorial voice behind our “Why We Recommend This Tour” block. Craft copy that directly answers why this specific experience earns our TopTours Pick—think editorial endorsement, not generic description.

Summary guidelines (2-3 sentences):
• Lead with “We love this tour because…” or “We recommend this for…”
• Mention the vibe + pacing (sunset sail, small-group snorkeling, chef-led tasting, etc.)
• Call out the type of traveler it suits (families, adventurous couples, photo lovers)
• Reference a tangible detail (gear included, beach launch, pro guides, rum punch)
• Name-drop the operator if provided, explaining their edge (“Jolly Pirates keeps groups lively with…”)
• Avoid ratings, review counts, or price talk

Highlight bullets (max 3, ≤12 words each):
• Reinforce reasons to recommend (small groups, trusted operator, epic location)
• No generic phrases like “unique experience” or “you’ll love”

Key local details to weave in:
${uniqueDetails.length ? uniqueDetails.map((detail) => `• ${detail}`).join('\n') : '• N/A'}

Return *valid JSON only*:
{
  "summary": "2-3 sentences here",
  "bullets": ["Highlight 1 (max 12 words)", "Highlight 2", "Highlight 3"]
}

If you can't extract highlights, return an empty array. Do not invent details not implied by the data.

Tour Title: ${title}
Destination: ${destination}
Description: ${description || 'N/A'}
Highlights: ${highlights.join('; ') || 'N/A'}
Inclusions: ${inclusions.join('; ') || 'N/A'}
Duration: ${durationLabel || 'N/A'}
Tour Operator: ${operator || 'N/A'}
Notable Hook: ${experienceHook || 'N/A'}
`;
};

const generateAiSummary = async (tour) => {
  const apiKey = resolveOpenAiKey();
  if (!apiKey) {
    return { error: 'Missing OpenAI API key' };
  }

  try {
    const prompt = buildAiPrompt(tour);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TOUR_MODEL || 'gpt-3.5-turbo',
        temperature: 0.6,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful travel copywriter for TopTours.ai.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI request failed:', errorText);
      return { error: 'OpenAI request failed' };
    }

    const json = await response.json();
    const content = stripCodeFences(json?.choices?.[0]?.message?.content?.trim());

    if (!content) {
      return { error: 'OpenAI response missing content' };
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      // Fall back to raw text if parsing failed
      parsed = {
        summary: content,
        bullets: [],
      };
    }

    const summary = cleanText(parsed.summary || content || '');
    const bullets = Array.isArray(parsed.bullets)
      ? parsed.bullets.map(cleanText).filter(Boolean).slice(0, 3)
      : [];

    if (!summary) {
      return { error: 'OpenAI did not return a usable summary' };
    }

    return { summary, bullets };
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return { error: 'Failed to generate summary' };
  }
};

export async function getTourEnrichment(productId) {
  if (!productId) return null;

  // Use cached version if available
  try {
    const { getCachedTourEnrichment } = await import('./supabaseCache');
    const cached = await getCachedTourEnrichment(productId);
    if (cached) return cached;
  } catch (error) {
    // Fallback to direct query if cache import fails
    console.error('Error using cache, falling back to direct query:', error);
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('tour_enrichment')
      .select('*')
      .eq('product_id', productId)
      .single();
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching tour enrichment:', error);
    }
    return data || null;
  } catch (error) {
    console.error('Unable to fetch tour enrichment:', error);
    return null;
  }
}

const normalizeString = (value) => {
  if (!value) return '';
  return value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
};

const getDestinationIdFromArray = (tour) => {
  if (!tour?.destinations || tour.destinations.length === 0) return null;
  const destinationEntry =
    tour.destinations.find((dest) => dest?.primary) || tour.destinations[0];

  if (!destinationEntry) return null;

  if (typeof destinationEntry.id === 'string' && isKnownSlug(destinationEntry.id)) {
    return destinationEntry.id;
  }

  const slugFromRef =
    getSlugFromViatorRef(destinationEntry.destinationId) ||
    getSlugFromViatorRef(destinationEntry.id) ||
    getSlugFromViatorRef(destinationEntry.ref);

  if (slugFromRef) return slugFromRef;

  return null;
};

const matchDestinationByName = (tour) => {
  const candidateStrings = [
    tour.destinationName,
    tour.title,
    tour.summary,
    tour.description?.summary,
    tour.description?.shortDescription,
  ];

  if (Array.isArray(tour?.destinations)) {
    tour.destinations.forEach((dest) => {
      candidateStrings.push(dest?.destinationName, dest?.name);
      const refSlug =
        getSlugFromViatorRef(dest?.destinationId) ||
        getSlugFromViatorRef(dest?.id) ||
        getSlugFromViatorRef(dest?.ref);
      if (refSlug) {
        candidateStrings.push(refSlug);
      }
    });
  }

  const normalizedCandidates = candidateStrings
    .map(normalizeString)
    .filter(Boolean);

  if (normalizedCandidates.length === 0) return null;

  for (const dest of siteDestinations) {
    const destCandidates = [
      dest.id,
      dest.name,
      dest.fullName,
      dest.country,
    ]
      .map(normalizeString)
      .filter(Boolean);

    if (
      destCandidates.length > 0 &&
      normalizedCandidates.some((candidate) =>
        destCandidates.some(
          (needle) =>
            (needle && candidate.includes(needle)) ||
            (needle && needle.includes(candidate))
        )
      )
    ) {
      return dest.id;
    }
  }

  return null;
};

const resolveDestinationId = (tour) => {
  return getDestinationIdFromArray(tour) || matchDestinationByName(tour);
};

export async function generateTourEnrichment(productId, tour) {
  if (!productId || !tour) {
    return { error: 'Missing tour data' };
  }
  try {
    const supabase = createSupabaseServiceRoleClient();

    let generatedSummary = '';
    let highlights = [];

    const aiResult = await generateAiSummary(tour);
    if (aiResult.summary) {
      generatedSummary = aiResult.summary;
      highlights = aiResult.bullets || [];
    }

    if (!generatedSummary) {
      generatedSummary = buildRecommendationCopy(tour);
    }

    if (!highlights.length) {
      highlights = extractHighlights(tour);
    }

    const payload = {
      product_id: productId,
      destination_id: resolveDestinationId(tour),
      tour_title: tour.title || null,
      supplier_name: tour.supplier?.name || null,
      ai_summary: generatedSummary,
      ai_highlights: highlights,
    };

    const { data, error } = await supabase
      .from('tour_enrichment')
      .upsert(payload, { onConflict: 'product_id' })
      .select()
      .single();

    if (error) {
      console.error('Error upserting tour enrichment:', error);
      return { error: 'Failed to save summary' };
    }

    return { data };
  } catch (error) {
    console.error('Unable to create tour enrichment:', error);
    return { error: 'Unexpected error occurred' };
  }
}

export async function saveTestNote(productId, note) {
  if (!productId) return { error: 'Missing product id' };
  try {
    const supabase = createSupabaseServiceRoleClient();

    const payload = {
      product_id: productId,
      metadata: {
        test_note: note || `Saved at ${new Date().toISOString()}`,
      },
    };

    const { data, error } = await supabase
      .from('tour_enrichment')
      .upsert(payload, { onConflict: 'product_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving test note:', error);
      return {
        error: error?.message || 'Unable to save note',
        details: error,
      };
    }

    return { data };
  } catch (error) {
    console.error('Unexpected error saving test note:', error);
    return { error: error?.message || 'Unexpected error', details: error };
  }
}

export async function incrementTourView(productId) {
  if (!productId) return { error: 'Missing product id' };
  try {
    const supabase = createSupabaseServiceRoleClient();

    const { data: existing, error: fetchError } = await supabase
      .from('tour_enrichment')
      .select('view_count, first_viewed_at')
      .eq('product_id', productId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching view count:', fetchError);
      return { error: 'Unable to fetch view count' };
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from('tour_enrichment')
        .update({
          view_count: (existing.view_count || 0) + 1,
          last_viewed_at: new Date().toISOString(),
        })
        .eq('product_id', productId);

      if (updateError) {
        console.error('Error updating view count:', updateError);
        return { error: 'Unable to update view count' };
      }
    } else {
      const now = new Date().toISOString();
      const { error: insertError } = await supabase.from('tour_enrichment').insert({
        product_id: productId,
        view_count: 1,
        first_viewed_at: now,
        last_viewed_at: now,
      });

      if (insertError) {
        console.error('Error inserting view count row:', insertError);
        return { error: 'Unable to create view count row' };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error incrementing view count:', error);
    return { error: 'Unexpected error' };
  }
}

export async function incrementViewCount(productId, destinationId = null) {
  if (!productId) return { error: 'Missing product id' };
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('tour_enrichment')
      .select('view_count, first_viewed_at, destination_id')
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching view count row:', error);
      return { error: 'Unable to fetch view data' };
    }

    const nowIso = new Date().toISOString();

    if (data) {
      const updatePayload = {
        view_count: (data.view_count || 0) + 1,
        first_viewed_at: data.first_viewed_at || nowIso,
        last_viewed_at: nowIso,
      };

      if (!data.destination_id && destinationId) {
        updatePayload.destination_id = destinationId;
      }

      const { error: updateError } = await supabase
        .from('tour_enrichment')
        .update(updatePayload)
        .eq('product_id', productId);

      if (updateError) {
        console.error('Error updating view count:', updateError);
        return { error: 'Unable to update views' };
      }
    } else {
      const { error: insertError } = await supabase.from('tour_enrichment').insert({
        product_id: productId,
        destination_id: destinationId || null,
        view_count: 1,
        first_viewed_at: nowIso,
        last_viewed_at: nowIso,
      });

      if (insertError) {
        console.error('Error inserting view count row:', insertError);
        return { error: 'Unable to insert view record' };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error tracking view:', error);
    return { error: 'Unexpected error' };
  }
}

/**
 * Extract structured values from a tour using AI (one-time analysis)
 * Returns values like adventureLevel, structureLevel, foodImportance, etc.
 */
export const extractTourStructuredValues = async (tour) => {
  const apiKey = resolveOpenAiKey();
  if (!apiKey) {
    return { error: 'Missing OpenAI API key' };
  }

  if (!tour || typeof tour !== 'object') {
    return { error: 'Missing tour data' };
  }

  try {
    // Extract tour data for the prompt
    const title = tour.seo?.title || tour.title || 'Tour';
    const operator = tour.supplier?.name || tour.operatorName || 'Tour operator';
    const flags = tour.flags || tour.specialFlags || [];
    const categories = (tour.categories || []).map(c => c.categoryName || c.name || '').filter(Boolean);
    
    const highlights = extractHighlights(tour, 5);
    const description = cleanText(
      tour.viatorUniqueContent?.shortDescription ||
      tour.viatorUniqueContent?.longDescription ||
      tour.description ||
      tour.content?.heroDescription ||
      ''
    );

    const inclusions = (tour.inclusions || []).map(item => {
      if (typeof item === 'string') return item;
      if (item.category === 'OTHER' && item.otherDescription) return item.otherDescription;
      return item.categoryDescription || item.typeDescription || '';
    }).filter(Boolean);

    // Determine group type from tour data
    const isPrivate = flags.includes('PRIVATE_TOUR') || tour.logistics?.isPrivate || false;
    const groupType = isPrivate ? 'private' : tour.logistics?.groupType || 'group';

    // Build the prompt to extract structured values
    const prompt = `You are analyzing a tour to extract structured values that will be used for matching with traveler preferences.

Your job:
- Analyze the tour description, highlights, inclusions, and categories
- Extract structured numeric values (0-100) for each dimension
- Be objective and accurate based on what the tour actually offers

OUTPUT FORMAT:
Return ONLY a single JSON object with this exact shape and keys:

{
  "adventureLevel": 0,        // 0-100: 0 = very relaxed/chill, 100 = very adventurous/thrilling
  "structureLevel": 0,        // 0-100: 0 = independent/flexible, 100 = fully guided/structured
  "foodImportance": 0,       // 0-100: 0 = food not important, 100 = food/drinks are central
  "groupType": 0,            // 0-100: 0 = big groups, 100 = private/small groups
  "budgetLevel": 0,          // 0-100: 0 = budget-friendly, 100 = luxury/premium
  "relaxationVsExploration": 0  // 0-100: 0 = relaxation/beach, 100 = exploration/culture/discovery
}

GUIDELINES:
- adventureLevel: Consider activities (ATV, hiking, water sports = high; walking tours, sightseeing = medium; spa, beach = low)
- structureLevel: Fully guided with fixed itinerary = high; hop-on-hop-off, self-guided = low; mix = medium
- foodImportance: Food tours, wine tastings, dinner cruises = high; no food mentioned = low; snacks/drinks included = medium
- groupType: Private tours, small groups (<10) = high; large bus tours = low; medium groups = 50
- budgetLevel: Luxury, premium experiences = high; budget-friendly, free = low; mid-range = 50
- relaxationVsExploration: Beach, spa, relaxation = low; museums, history, culture, discovery = high

Now here is the tour data:

{
  "title": "${title}",
  "operatorName": "${operator}",
  "flags": ${JSON.stringify(flags)},
  "categories": ${JSON.stringify(categories)},
  "highlights": ${JSON.stringify(highlights)},
  "description": "${description.substring(0, 1500)}",
  "inclusions": ${JSON.stringify(inclusions.slice(0, 15))},
  "logistics": {
    "groupType": "${groupType}",
    "isPrivate": ${isPrivate}
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TOUR_MODEL || 'gpt-3.5-turbo',
        temperature: 0.3, // Lower temperature for more consistent extraction
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that extracts structured data from tour descriptions. Always return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      let errorMessage = 'Failed to extract tour values';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      return { error: `OpenAI API error (${response.status}): ${errorMessage}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { error: 'No response from AI' };
    }

    // Parse JSON response
    let structuredValues;
    try {
      structuredValues = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structuredValues = JSON.parse(jsonMatch[0]);
      } else {
        return { error: 'Invalid JSON response from AI' };
      }
    }

    // Validate and normalize values (ensure 0-100 range)
    const normalized = {
      adventureLevel: Math.max(0, Math.min(100, Number(structuredValues.adventureLevel) || 50)),
      structureLevel: Math.max(0, Math.min(100, Number(structuredValues.structureLevel) || 50)),
      foodImportance: Math.max(0, Math.min(100, Number(structuredValues.foodImportance) || 50)),
      groupType: Math.max(0, Math.min(100, Number(structuredValues.groupType) || 50)),
      budgetLevel: Math.max(0, Math.min(100, Number(structuredValues.budgetLevel) || 50)),
      relaxationVsExploration: Math.max(0, Math.min(100, Number(structuredValues.relaxationVsExploration) || 50)),
    };

    return { values: normalized };
  } catch (error) {
    console.error('Error extracting tour structured values:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      cause: error.cause
    });
    return { 
      error: error.message || 'Failed to extract tour values',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
};

/**
 * Simple matching algorithm (no AI) - compares user preferences with tour structured values
 */
export const calculatePreferenceMatch = (userPreferences, tourValues) => {
  if (!userPreferences || !tourValues) {
    return { error: 'Missing preferences or tour values' };
  }

  // Calculate match percentage for each dimension
  const calculateMatch = (userValue, tourValue) => {
    // Closer values = higher match
    // 0 difference = 100% match, 50 difference = 0% match
    const diff = Math.abs(userValue - tourValue);
    return Math.max(0, 100 - (diff * 2)); // Linear scale: 0 diff = 100%, 50 diff = 0%
  };

  const matches = {
    adventure: calculateMatch(userPreferences.adventureLevel || 50, tourValues.adventureLevel || 50),
    structure: calculateMatch(userPreferences.structurePreference || 50, tourValues.structureLevel || 50),
    food: calculateMatch(userPreferences.foodAndDrinkInterest || 50, tourValues.foodImportance || 50),
    group: calculateMatch(userPreferences.groupPreference || 50, tourValues.groupType || 50),
    budget: calculateMatch(userPreferences.budgetComfort || 50, tourValues.budgetLevel || 50),
    relaxExplore: calculateMatch(userPreferences.cultureVsBeach || 50, tourValues.relaxationVsExploration || 50),
  };

  // Calculate weighted average
  // Give more weight to preferences that are far from 50 (strong preferences)
  const weights = {
    adventure: Math.abs((userPreferences.adventureLevel || 50) - 50) / 50, // 0-1
    structure: Math.abs((userPreferences.structurePreference || 50) - 50) / 50,
    food: Math.abs((userPreferences.foodAndDrinkInterest || 50) - 50) / 50,
    group: Math.abs((userPreferences.groupPreference || 50) - 50) / 50,
    budget: Math.abs((userPreferences.budgetComfort || 50) - 50) / 50,
    relaxExplore: Math.abs((userPreferences.cultureVsBeach || 50) - 50) / 50,
  };

  // Normalize weights (sum to 1)
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const normalizedWeights = totalWeight > 0 
    ? Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, v / totalWeight]))
    : Object.fromEntries(Object.keys(weights).map(k => [k, 1 / Object.keys(weights).length]));

  // Calculate weighted average
  const overallScore = Math.round(
    matches.adventure * normalizedWeights.adventure +
    matches.structure * normalizedWeights.structure +
    matches.food * normalizedWeights.food +
    matches.group * normalizedWeights.group +
    matches.budget * normalizedWeights.budget +
    matches.relaxExplore * normalizedWeights.relaxExplore
  );

  // Generate match summary
  const getMatchLabel = (score) => {
    if (score >= 80) return 'Excellent match';
    if (score >= 65) return 'Strong match';
    if (score >= 50) return 'Good match';
    if (score >= 35) return 'Partial match';
    return 'Poor match';
  };

  // Generate pros and cons
  const pros = [];
  const cons = [];

  Object.entries(matches).forEach(([key, score]) => {
    const labels = {
      adventure: 'Adventure level',
      structure: 'Structure preference',
      food: 'Food & drink interest',
      group: 'Group size preference',
      budget: 'Budget vs comfort',
      relaxExplore: 'Relaxation vs exploration',
    };

    if (score >= 75) {
      pros.push(`${labels[key]} matches well (${score}%)`);
    } else if (score < 50) {
      cons.push(`${labels[key]} differs (${score}% match)`);
    }
  });

  return {
    matchScore: overallScore,
    fitSummary: `${getMatchLabel(overallScore)}: ${overallScore}% compatibility with your travel preferences.`,
    matches,
    pros: pros.length > 0 ? pros : ['Overall good compatibility'],
    cons: cons.length > 0 ? cons : [],
    idealFor: overallScore >= 70 ? 'Your travel style' : 'Consider if other factors align',
  };
};

/**
 * Generate AI-powered tour match score based on user preferences and tour data
 * DEPRECATED: Use extractTourStructuredValues + calculatePreferenceMatch instead
 */
export const generateTourMatch = async (tour, userPreferences) => {
  const apiKey = resolveOpenAiKey();
  if (!apiKey) {
    return { error: 'Missing OpenAI API key' };
  }

  if (!userPreferences || typeof userPreferences !== 'object') {
    return { error: 'Missing user preferences' };
  }

  if (!tour || typeof tour !== 'object') {
    return { error: 'Missing tour data' };
  }

  try {
    // Extract tour data for the prompt
    const title = tour.seo?.title || tour.title || 'Tour';
    const operator = tour.supplier?.name || tour.operatorName || 'Tour operator';
    // Extract price from multiple possible locations
    const price = tour.pricing?.summary?.fromPrice || 
                  tour.pricing?.summary?.fromPriceBeforeDiscount ||
                  tour.price || 
                  tour.fromPrice ||
                  (tour.pricing && typeof tour.pricing === 'object' ? Object.values(tour.pricing).find(v => typeof v === 'number' && v > 0) : null) ||
                  0;
    const originalPrice = tour.pricing?.summary?.fromPriceBeforeDiscount || null;
    const hasDiscount = originalPrice && originalPrice > price && price > 0;
    const durationMinutes = tour.itinerary?.duration?.fixedDurationInMinutes ||
                           tour.duration?.fixedDurationInMinutes ||
                           tour.duration?.variableDurationFromMinutes ||
                           null;
    const durationLabel = durationMinutes
      ? durationMinutes < 60
        ? `${durationMinutes} min`
        : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
      : 'N/A';

    const flags = tour.flags || tour.specialFlags || [];
    const categories = (tour.categories || []).map(c => c.categoryName || c.name || '').filter(Boolean);
    
    const highlights = extractHighlights(tour, 5);
    const description = cleanText(
      tour.viatorUniqueContent?.shortDescription ||
      tour.viatorUniqueContent?.longDescription ||
      tour.description ||
      tour.content?.heroDescription ||
      ''
    );

    const inclusions = (tour.inclusions || []).map(item => {
      if (typeof item === 'string') return item;
      if (item.category === 'OTHER' && item.otherDescription) return item.otherDescription;
      return item.categoryDescription || item.typeDescription || '';
    }).filter(Boolean);

    // Determine group type from tour data
    const isPrivate = flags.includes('PRIVATE_TOUR') || tour.logistics?.isPrivate || false;
    const groupType = isPrivate ? 'private' : tour.logistics?.groupType || 'group';

    // Build the prompt
    const prompt = `You are an AI travel advisor helping a traveler understand how well a specific tour matches their trip preferences.

You are given:
1) The traveler's saved trip preferences.
2) Detailed data about ONE tour.

Your job:
- Analyze how well this tour fits the traveler's preferences.
- Produce a numeric score between 0 and 100 (integer).
- Explain the reasoning in clear, traveler-friendly language.
- Be honest: a low score is okay if there are real mismatches.
- Do NOT mention star ratings or "4.7/5" type review scores.
- DO mention the tour operator by name when relevant.

Scoring guidelines (high level):
- 90–100: Excellent match; fits nearly everything they care about.
- 75–89: Strong match with only minor trade-offs.
- 55–74: Decent option but with noticeable compromises.
- 30–54: Only a partial fit; highlight who it *is* a good fit for instead.
- 0–29: Poor match for this traveler; call that out clearly.

PREFERENCE VALUE INTERPRETATION (CRITICAL - READ CAREFULLY):
All preference sliders are 0–100. The value indicates WHERE on the spectrum they prefer:
- adventureLevel: 0 = very relaxed, 100 = very adventurous
- cultureVsBeach: 0 = relaxation/beach/unwind, 100 = exploration/culture/discovery
- groupPreference: 0 = big groups ok, 100 = prefer private/small groups
- budgetComfort: 0 = budget first, 100 = comfort/quality first
- structurePreference: 0 = lots of free time, 100 = fully structured
- foodAndDrinkInterest: 0 = not focused on food, 100 = food & drinks are a big part
- familyFriendlyImportance: 0 = not important, 100 = very important
- accessibilityImportance: 0 = not important, 100 = very important

IMPORTANT: A LOW value (0–40) means they prefer the LEFT side. A HIGH value (60–100) means they prefer the RIGHT side. 
- Example: cultureVsBeach = 23 means they prefer RELAXATION/BEACH, NOT culture
- Example: structurePreference = 25 means they want LOTS OF FREE TIME, NOT structured tours
- Example: familyFriendlyImportance = 50 means NEUTRAL, not a strong preference either way

Weighting (conceptual – you apply it):
- Give more weight to preferences that are far from 50 (strong preferences).
- Values near 50 (40–60) are neutral/indifferent - don't penalize or reward based on these.
- "Must-have" flags or hard constraints (e.g., maxPricePerPerson) should heavily penalize the score if violated.
- If the tour strongly matches 1–2 very important dimensions (e.g., adventure + private) but slightly misses some less important ones, you can still give a high score.

OUTPUT FORMAT:
Return ONLY a single JSON object with this exact shape and keys:

{
  "matchScore": 0,          // integer 0–100
  "fitSummary": "",         // 1–2 sentences overall verdict
  "pros": [],               // 2–4 bullet points, each a short sentence
  "cons": [],               // 1–3 bullet points, or [] if none
  "idealFor": "",           // short phrase like "Adventurous couples" or "Families with teens"
  "notes": ""               // optional nuance; 1–2 sentences, can be empty string
}

Make the tone:
- Clear, friendly, and practical.
- Focused on what the traveler would actually feel on the tour (pace, vibe, crowd size, inclusions).
- Avoid generic fluff like "This is a great experience" without saying why.

ANALYSIS GUIDELINES:
- If cultureVsBeach is LOW (0–40), they prefer relaxation/beach - DON'T say they want "cultural insights"
- If structurePreference is LOW (0–40), they want free time - a highly structured tour is a MISMATCH
- If familyFriendlyImportance is around 50 (40–60), it's NEUTRAL - don't mention it as a preference unless it's very far from 50
- If a preference value is 50 or close to it (45–55), treat it as neutral/indifferent - don't use it to penalize or reward
- Only mention preferences that are STRONG (far from 50) as important factors

Now here is the input data as JSON:

{
  "userPreferences": ${JSON.stringify(userPreferences, null, 2)},
  "tour": {
    "title": "${title}",
    "operatorName": "${operator}",
    "priceFrom": ${price > 0 ? price : 'null'},
    "priceDisplay": ${price > 0 ? `"From $${price}"` : '"Price on booking"'},
    ${hasDiscount ? `"originalPrice": ${originalPrice},` : ''}
    ${hasDiscount ? `"hasDiscount": true,` : ''}
    "durationMinutes": ${durationMinutes || 'null'},
    "durationLabel": "${durationLabel}",
    "flags": ${JSON.stringify(flags)},
    "categories": ${JSON.stringify(categories)},
    "highlights": ${JSON.stringify(highlights)},
    "description": "${description.substring(0, 1000)}",
    "inclusions": ${JSON.stringify(inclusions.slice(0, 10))},
    "logistics": {
      "groupType": "${groupType}",
      "isPrivate": ${isPrivate},
      "isFamilyFriendly": ${tour.logistics?.isFamilyFriendly || false},
      "hasAccessibilityNotes": ${tour.logistics?.hasAccessibilityNotes || false}
    }
  }
}

IMPORTANT: If "priceFrom" is a number (not null), the tour HAS a price. Do NOT say "doesn't mention the price" or "price not available" - use the actual price value in your analysis. Compare it to the user's maxPricePerPerson preference if provided.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TOUR_MODEL || 'gpt-3.5-turbo',
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI travel advisor for TopTours.ai. You analyze tours and match them to traveler preferences.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI match request failed:', errorText);
      return { error: 'OpenAI request failed' };
    }

    const json = await response.json();
    const content = stripCodeFences(json?.choices?.[0]?.message?.content?.trim());

    if (!content) {
      return { error: 'OpenAI response missing content' };
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error('Failed to parse OpenAI match response:', err, content);
      return { error: 'Failed to parse AI response' };
    }

    // Validate and clean the response
    const matchScore = Math.max(0, Math.min(100, parseInt(parsed.matchScore) || 0));
    const fitSummary = cleanText(parsed.fitSummary || '');
    const pros = Array.isArray(parsed.pros) ? parsed.pros.map(cleanText).filter(Boolean) : [];
    const cons = Array.isArray(parsed.cons) ? parsed.cons.map(cleanText).filter(Boolean) : [];
    const idealFor = cleanText(parsed.idealFor || '');
    const notes = cleanText(parsed.notes || '');

    if (!fitSummary) {
      return { error: 'OpenAI did not return a usable match summary' };
    }

    return {
      matchScore,
      fitSummary,
      pros,
      cons,
      idealFor,
      notes,
    };
  } catch (error) {
    console.error('Error generating tour match:', error);
    return { error: 'Failed to generate tour match' };
  }
};

