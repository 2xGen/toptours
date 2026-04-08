/**
 * Shared revalidate (seconds) for guide listings + related Supabase-derived reads.
 * Long window reduces edge / serverless invocations from crawlers; bump ISR on deploy when needed.
 */
export const GUIDE_SECTION_REVALIDATE_SECONDS = 60 * 60 * 24 * 30; // 30 days
