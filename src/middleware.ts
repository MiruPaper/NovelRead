import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isUploadRoute = request.nextUrl.pathname.startsWith('/upload');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isAuthApiRoute = request.nextUrl.pathname.startsWith('/api/auth');

  // Allow public routes and auth API routes
  if (request.nextUrl.pathname === '/' || 
      request.nextUrl.pathname.startsWith('/novels/') ||
      request.nextUrl.pathname.startsWith('/api/novels/') ||
      isAuthApiRoute) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!token && !isAuthRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin access for admin routes
  if (isAdminRoute || isUploadRoute || (isApiRoute && request.method !== 'GET')) {
    if (!token || token.role !== 'ADMIN') {
      // Instead of redirecting to unauthorized, return a 403 response
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/upload/:path*',
    '/api/:path*',
    '/novels/:path*',
    '/auth/:path*'
  ]
}; 