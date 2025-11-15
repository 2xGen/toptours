import { createRequire } from 'module';
import { destinations as siteDestinations } from '@/data/destinationsData';
import { viatorRefToSlug } from '@/data/viatorDestinationMap';
import { createSupabaseServiceRoleClient } from './supabaseClient';

const require = createRequire(import.meta.url);
let cachedOpenAiKey = null;

const loadFallbackOpenAiKey = () => {
  if (cachedOpenAiKey !== null) return cachedOpenAiKey;
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const config = require('../../config/api-keys.js');
    cachedOpenAiKey = config?.OPENAI_API_KEY || null;
  } catch (error) {
    cachedOpenAiKey = null;
  }
  return cachedOpenAiKey;
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
  const apiKey = process.env.OPENAI_API_KEY || loadFallbackOpenAiKey();
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

