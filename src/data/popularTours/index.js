// Central aggregator for all popular tours data
import { arubaTours, getAllArubaTours, getArubaTourById, getArubaToursByCategory } from './aruba-tours';

// Export all tours by destination
export const popularToursByDestination = {
  aruba: arubaTours,
  // Add more destinations as they're created
  // curacao: curacaoTours,
  // 'punta-cana': puntaCanaTours,
};

// Helper function to get tours for a destination
export function getPopularToursForDestination(destinationId) {
  return popularToursByDestination[destinationId] || [];
}

// Helper function to get a specific tour
export function getPopularTour(destinationId, productId) {
  const destinationTours = popularToursByDestination[destinationId];
  if (!destinationTours) return null;
  return destinationTours.find(tour => tour.productId === productId);
}

// Get all popular tours
export function getAllPopularTours() {
  return Object.values(popularToursByDestination).flat();
}

// Export destination-specific helpers
export {
  getAllArubaTours,
  getArubaTourById,
  getArubaToursByCategory,
};

