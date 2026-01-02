import { NextResponse } from 'next/server';

/**
 * GET /api/internal/promotion/account
 * 
 * NOTE: This endpoint is deprecated - promotion_accounts table has been removed.
 * Returns null immediately to prevent 404 errors from cached client code.
 * 
 * This stub exists to gracefully handle old cached code that may still call this endpoint.
 */
export async function GET(request) {
  // Return null immediately - no database queries, no processing
  // This prevents 404 errors from cached client-side code
  return NextResponse.json({ 
    account: null,
    message: 'Promotion accounts feature has been removed'
  });
}

