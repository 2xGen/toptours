import { restaurantsCuracao } from './restaurantsData-curacao';
import { restaurantsAruba } from './restaurantsData-aruba';
import { restaurantsPuntaCana } from './restaurantsData-punta-cana';

export const restaurantsData = {
  ...restaurantsCuracao,
  ...restaurantsAruba,
  ...restaurantsPuntaCana,
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
