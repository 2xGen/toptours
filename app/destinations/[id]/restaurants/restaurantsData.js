import { restaurantsCuracao } from './restaurantsData-curacao';

export const restaurantsData = {
  ...restaurantsCuracao,
};

export function getRestaurantsForDestination(destinationId) {
  const destinationRestaurants = restaurantsData[destinationId];
  if (!destinationRestaurants) {
    return [];
  }

  return Object.values(destinationRestaurants);
}

export function getRestaurantBySlug(destinationId, slug) {
  const destinationRestaurants = restaurantsData[destinationId];

  if (!destinationRestaurants) {
    return null;
  }

  return destinationRestaurants[slug] || null;
}

export function getAllRestaurants() {
  return Object.entries(restaurantsData).flatMap(([destinationId, destinationRestaurants]) => {
    if (!destinationRestaurants) {
      return [];
    }

    return Object.values(destinationRestaurants).map((restaurant) => ({
      destinationId,
      restaurant,
    }));
  });
}
