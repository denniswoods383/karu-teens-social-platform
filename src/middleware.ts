import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add caching headers for static assets
  if (request.nextUrl.pathname.startsWith('/ui/') || 
      request.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Add caching headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  }

  return response;
}

export const config = {
  matcher: ['/ui/:path*', '/api/:path*', '/((?!_next/static|_next/image|favicon.ico|privacy|terms|features|pricing|help|contact|feedback|security|landing).*)']
};