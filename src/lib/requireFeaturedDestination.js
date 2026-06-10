import { redirect } from 'next/navigation';
import { isFeaturedDestination } from '@/lib/featuredDestinations';

/**
 * Non-featured destination slugs (hub, /tours, guides, etc.) → /destinations.
 * Numeric Viator IDs are allowed through so pages can resolve slug → featured hub.
 */
export function requireFeaturedDestination(destinationId) {
  if (/^\d+$/.test(String(destinationId || ''))) return;
  if (!isFeaturedDestination(destinationId)) {
    redirect('/destinations');
  }
}
