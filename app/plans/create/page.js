import { redirect } from 'next/navigation';
import PlanBuilderClient from './PlanBuilderClient';
import { getDestinationById } from '@/data/destinationsData';
import { getViatorDestinationBySlug, getViatorDestinationById } from '@/lib/supabaseCache';

export default async function CreatePlanPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const destinationParam = resolvedSearchParams.destination;
  
  // Use the same logic as destination pages: check curated first, then database
  let destination = destinationParam ? getDestinationById(destinationParam) : null;
  
  // If not found in curated, try database lookup (same as destination pages)
  if (!destination && destinationParam) {
    // Try by slug first (most common)
    let dbDestination = await getViatorDestinationBySlug(destinationParam);
    
    // If not found by slug, try by ID (in case it's a numeric Viator ID)
    if (!dbDestination && /^\d+$/.test(destinationParam)) {
      dbDestination = await getViatorDestinationById(destinationParam);
    }
    
    if (dbDestination) {
      // Create a destination object from database data (same format as destination pages)
      destination = {
        id: dbDestination.id?.toString(),
        name: dbDestination.name,
        fullName: dbDestination.name,
        country: dbDestination.country,
        category: dbDestination.region,
        imageUrl: null, // Database destinations don't have images
        // Store the Viator destination ID for tour matching
        destinationId: dbDestination.id?.toString(),
      };
    }
  } else if (destination) {
    // For curated destinations, ensure destinationId is set (same as destination pages)
    if (!destination.destinationId) {
      const dbDestination = await getViatorDestinationBySlug(destination.id);
      if (dbDestination) {
        destination.destinationId = dbDestination.id?.toString();
      }
    }
  }

  return (
    <PlanBuilderClient destinationId={destinationParam} />
  );
}

