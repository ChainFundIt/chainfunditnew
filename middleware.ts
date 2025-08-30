import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtected = 
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/campaigns') ||
    pathname.startsWith('/donations') ||
    pathname.startsWith('/payouts') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/create-campaign') ||
    pathname === '/complete-profile';

  if (isProtected) {
    const token = request.cookies.get("auth_token");
    if (!token) {
      // Redirect to signin, preserving the original destination
      const signinUrl = new URL("/signin", request.url);
      signinUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signinUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/campaigns/:path*',
    '/donations/:path*',
    '/payouts/:path*',
    '/settings/:path*',
    '/create-campaign/:path*',
    '/complete-profile'
  ],
};

