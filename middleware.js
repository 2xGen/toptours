import { NextResponse } from 'next/server';

// www → non-www redirect is handled by Vercel redirects (vercel.json) to avoid Edge invocations.
// This middleware is kept but never runs (matcher matches no real path) so we don't pay for Edge Requests.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  // Match a path that is never requested so middleware effectively never runs (saves Edge cost).
  matcher: ['/internal-middleware-noop-vercel'],
};

