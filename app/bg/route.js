import { NextResponse } from 'next/server';
import { COCONUT_BG_SLUG } from '@/lib/coconutRentalsAffiliate';

export const dynamic = 'force-dynamic';

/** Legacy short URL: /bg → canonical /bg/beach-gear-rentals-in-aruba */
export async function GET(request) {
  try {
    const u = new URL(request.url);
    return NextResponse.redirect(`${u.origin}/bg/${COCONUT_BG_SLUG}`, 308);
  } catch {
    return NextResponse.redirect(`https://toptours.ai/bg/${COCONUT_BG_SLUG}`, 308);
  }
}
