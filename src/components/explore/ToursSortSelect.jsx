'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export const SORT_OPTIONS = [
  { value: '', label: 'Sort by' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating_desc', label: 'Rating: highest first' },
  { value: 'rating_asc', label: 'Rating: lowest first' },
];

/**
 * Sort dropdown for explore tours listing.
 * Updates URL: /explore/[destinationSlug]/tours?sort=price_asc|price_desc|rating_asc|rating_desc
 */
export function ToursSortSelect({ currentValue, basePath }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value) {
    const next = new URLSearchParams(searchParams?.toString() ?? '');
    if (value) {
      next.set('sort', value);
    } else {
      next.delete('sort');
    }
    next.delete('page');
    const query = next.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  const validValue = SORT_OPTIONS.some((o) => o.value === currentValue) ? currentValue : '';

  return (
    <div className="relative inline-block min-w-[200px] sm:min-w-[220px]">
      <label htmlFor="tours-sort-select" className="sr-only">
        Sort by
      </label>
      <select
        id="tours-sort-select"
        value={validValue ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full appearance-none rounded-xl border-2 border-gray-200 bg-white py-3 pl-4 pr-11 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        aria-label="Sort by"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value || 'default'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        aria-hidden
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  );
}
