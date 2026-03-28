/**
 * Presets for /admin/links Discover Cars short links (/dc/{slug} → discovercars.com affiliate).
 * - Generic: only `best-car-rental-options` (not a free-form slug).
 * - Destinations: `car-rentals-in-{destination-slug}`.
 */
export const DISCOVER_DC_GENERIC_SLUG = 'best-car-rental-options';

export const DISCOVER_DC_PRESETS = [
  { label: 'Best car rental options (any destination)', slug: DISCOVER_DC_GENERIC_SLUG },
  { label: 'Prague', slug: 'car-rentals-in-prague' },
  { label: 'Punta Cana', slug: 'car-rentals-in-punta-cana' },
  { label: 'Aruba', slug: 'car-rentals-in-aruba' },
  { label: 'Bonaire', slug: 'car-rentals-in-bonaire' },
  { label: 'Nassau', slug: 'car-rentals-in-nassau' },
  { label: 'Amsterdam', slug: 'car-rentals-in-amsterdam' },
  { label: 'Curaçao', slug: 'car-rentals-in-curacao' },
  { label: 'Miami', slug: 'car-rentals-in-miami' },
  { label: 'New York City', slug: 'car-rentals-in-new-york-city' },
  { label: 'Las Vegas', slug: 'car-rentals-in-las-vegas' },
];
