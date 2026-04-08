/**
 * Shared revalidate (seconds) for guide listings + related Supabase-derived reads.
 * Long window reduces edge / serverless invocations from crawlers; bump ISR on deploy when needed.
 *
 * Note: App Router `export const revalidate` on pages must use the same numeric literal (2592000);
 * Next.js cannot analyze imported constants for segment config.
 */
export const GUIDE_SECTION_REVALIDATE_SECONDS = 2592000; // 30 days
