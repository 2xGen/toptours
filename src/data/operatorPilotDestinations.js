/**
 * Destinations with indexable /operators pages (phased rollout).
 *
 * Kept in a dependency-free module (no `fs`, no server-only imports) so it can be
 * shared by both server code (src/lib/operatorPages.js) and client components
 * (e.g. DestinationStickyNav) as a single source of truth.
 */
export const OPERATOR_PAGE_PILOT_SLUGS = [
  'aruba',
  'arusha',
  'prague',
  'curacao',
  'reykjavik',
  'zanzibar',
  'banff',
  'queenstown',
  'galapagos-islands',
  'interlaken',
  'siem-reap',
  'dubrovnik',
  'san-jose',
  'kuala-lumpur',
  'cairo',
  'hanoi',
  'marrakech',
];

const OPERATOR_PAGE_PILOT_SET = new Set(OPERATOR_PAGE_PILOT_SLUGS);

export function isOperatorPilotDestination(destinationSlug) {
  return OPERATOR_PAGE_PILOT_SET.has(String(destinationSlug || '').toLowerCase());
}
