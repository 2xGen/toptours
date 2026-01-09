import { NextResponse } from 'next/server';

/**
 * Preview Mode Route for Viator Certification
 * 
 * Usage: /api/preview?secret={PREVIEW_SECRET}&slug=/tours/{productId}
 * 
 * Enables Next.js preview mode so we can show unpublished review snippets
 * implementation to Viator team before going live.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug') || '/';
  
  // Verify secret
  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid token', { 
      status: 401,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
  
  // Validate slug
  if (!slug || !slug.startsWith('/')) {
    return new Response('Invalid slug. Must start with /', { 
      status: 400,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
  
  // Redirect to the page with preview mode enabled
  // Next.js will set cookies for preview mode
  const response = NextResponse.redirect(new URL(slug, request.url));
  
  // Set preview mode cookies
  response.cookies.set('__prerender_bypass', '1', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 60 * 60 * 24, // 24 hours
  });
  
  response.cookies.set('__next_preview_data', JSON.stringify({
    preview: true,
  }), {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 60 * 60 * 24, // 24 hours
  });
  
  return response;
}
