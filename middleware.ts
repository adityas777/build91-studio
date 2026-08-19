import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');

  // Cutover redirect flag: set to true in environment variables or explicitly here
  // when cutting over dev.build91.in to studio.build91.in.
  const ENABLE_CUTOVER_REDIRECT = process.env.ENABLE_CUTOVER_REDIRECT === 'true';

  if (ENABLE_CUTOVER_REDIRECT && host === 'dev.build91.in') {
    const url = request.nextUrl.clone();
    url.host = 'studio.build91.in';
    url.port = ''; // Clear port for standard production URLs
    return NextResponse.redirect(url, 308); // 308 permanent redirect
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets/images (local image assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
