/**
 * Resolve a destination by id from either curated destinationsData or generated fullContent/seoContent.
 * Use this for pages that must support both 182 curated and 65+ generated destinations (e.g. restaurants).
 */

import { getDestinationById } from '@/data/destinationsData';
import { getDestinationFullContent } from '@/data/destinationFullContent';
import { getDestinationSeoContent } from '@/data/destinationSeoContent';

/**
 * Resolve destination by id (slug). Returns curated destination or a minimal synthetic object from fullContent/seoContent.
 * @param {string} id - Destination slug (e.g. 'gouda', 'aruba')
 * @returns {{ id: string, name: string, fullName: string, country?: string, imageUrl?: string, destinationId?: string, ... } | null}
 */
export function resolveDestinationById(id) {
  const curated = getDestinationById(id);
  if (curated) return curated;

  const fullContent = getDestinationFullContent(id);
  const seoContent = getDestinationSeoContent(id);
  if (!fullContent && !seoContent) return null;

  const name = fullContent?.destinationName || seoContent?.destinationName || id;
  return {
    id,
    name,
    fullName: name,
    country: fullContent?.country || seoContent?.country || null,
    imageUrl: fullContent?.imageUrl || seoContent?.imageUrl || seoContent?.ogImage || null,
    destinationId: fullContent?.destinationId || seoContent?.destinationId || null,
    briefDescription: fullContent?.briefDescription || seoContent?.briefDescription || null,
    heroDescription: fullContent?.heroDescription || seoContent?.heroDescription || null,
    seo: fullContent?.seo || seoContent?.seo || null,
    isViatorDestination: true,
  };
}
