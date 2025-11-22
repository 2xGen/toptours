// Check if destination has full content (destination page exists)
// This checks generated-destination-full-content.json

// Next.js supports JSON imports natively
import fullContentDataRaw from '../../generated-destination-full-content.json';
import seoContentDataRaw from '../../generated-destination-seo-content.json';

// Ensure we have valid objects
const fullContentData = fullContentDataRaw || {};
const seoContentData = seoContentDataRaw || {};

export function getDestinationFullContent(slug) {
  return fullContentData[slug] || null;
}

export function hasDestinationPage(slug) {
  // Check if full content exists (has destination page with full content)
  const content = getDestinationFullContent(slug);
  if (content && content.whyVisit && content.highlights) {
    return true;
  }
  
  // Also check if SEO content exists - this also creates a destination page
  // Both full content and SEO content mean the destination has a page
  return !!seoContentData[slug];
}

