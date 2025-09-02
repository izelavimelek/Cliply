import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // Get the pathname of the request (e.g. /creator-dashboard, /brand-dashboard)
  const { pathname } = request.nextUrl;

  // If user is not logged in and trying to access protected routes
  if (!token && (pathname.startsWith('/creator-dashboard') || pathname.startsWith('/brand-dashboard'))) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // If user is logged in as creator and trying to access brand routes
  if (userRole === 'creator' && (pathname.startsWith('/brand') || pathname.startsWith('/brand-dashboard'))) {
    return NextResponse.redirect(new URL('/creator-dashboard', request.url));
  }

  // If user is logged in as brand and trying to access creator routes
  if (userRole === 'brand' && (pathname.startsWith('/creator') || pathname.startsWith('/creator-dashboard'))) {
    return NextResponse.redirect(new URL('/brand', request.url));
  }

  // Redirect /brand-dashboard to /brand
  if (pathname.startsWith('/brand-dashboard')) {
    return NextResponse.redirect(new URL('/brand', request.url));
  }

  // Redirect /creator-dashboard to /creator
  if (pathname.startsWith('/creator-dashboard')) {
    return NextResponse.redirect(new URL('/creator', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/creator/:path*',
    '/creator-dashboard/:path*',
    '/brand/:path*',
    '/brand-dashboard/:path*'
  ],
};
