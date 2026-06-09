import { notFound } from 'next/navigation';
import { isFeaturedDestination } from '@/lib/featuredDestinations';

/** Return 404 for non-featured destination slugs (all nested routes). */
export function requireFeaturedDestination(destinationId) {
  if (!isFeaturedDestination(destinationId)) {
    notFound();
  }
}
