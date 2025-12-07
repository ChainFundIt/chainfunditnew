import { NextRequest, NextResponse } from "next/server";
import { verifyUserJWT } from "@/lib/auth-middleware";
import { refreshAccessToken } from "@/lib/auth";
import { serialize } from "cookie";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip token refresh endpoint to avoid infinite loops
  if (pathname === '/api/auth/refresh') {
    return NextResponse.next();
  }
  
  // Define protected routes
  const protectedRoutes = [
    '/create-campaign',
    '/dashboard',
    '/admin',
    '/api/dashboard',
    '/api/payouts',
    '/api/user/profile',
    '/api/admin'
  ];
  
  // Check if the route is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Check if it's a protected API route
  const isProtectedApi = pathname.startsWith('/api/') && 
    (pathname.includes('/dashboard') || 
     pathname.includes('/payouts') || 
     pathname.includes('/user/profile') ||
     pathname.includes('/admin') ||
     (pathname.includes('/campaigns') && ['POST', 'PUT', 'DELETE'].includes(request.method)) ||
     (pathname.includes('/donations') && request.method === 'POST'));

  if (isProtected || isProtectedApi) {
    const token = request.cookies.get("auth_token");
    const refreshToken = request.cookies.get("refresh_token");
    
    if (!token) {
      // No access token - try to refresh if refresh token exists
      if (refreshToken) {
        try {
          const result = await refreshAccessToken(refreshToken.value, request);
          
          if (result) {
            // Successfully refreshed - continue with new tokens
            const response = NextResponse.next();
            
            // Set new access token
            response.cookies.set('auth_token', result.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 30 * 60, // 30 minutes
              path: '/',
            });
            
            // If token rotation is enabled, set new refresh token
            if (result.refreshToken) {
              response.cookies.set('refresh_token', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60, // 30 days
                path: '/',
              });
            }
            
            return response;
          }
        } catch (error) {
          console.error('Token refresh failed in proxy:', error);
        }
      }
      
      // No token or refresh failed - require authentication
      if (isProtectedApi) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Redirect to unified signin page
      const signinUrl = new URL("/signin", request.url);
      signinUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signinUrl);
    }
    
    // Verify token
    const userPayload = verifyUserJWT(token.value);
    if (!userPayload) {
      // Access token is invalid/expired - try to refresh
      if (refreshToken) {
        try {
          const result = await refreshAccessToken(refreshToken.value, request);
          
          if (result) {
            // Successfully refreshed - continue with new tokens
            const response = NextResponse.next();
            
            // Set new access token
            response.cookies.set('auth_token', result.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 30 * 60, // 30 minutes
              path: '/',
            });
            
            // If token rotation is enabled, set new refresh token
            if (result.refreshToken) {
              response.cookies.set('refresh_token', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60, // 30 days
                path: '/',
              });
            }
            
            return response;
          }
        } catch (error) {
          console.error('Token refresh failed in proxy:', error);
        }
      }
      
      // Token invalid and refresh failed
      if (isProtectedApi) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      
      // Clear invalid tokens and redirect
      const signinUrl = new URL("/signin", request.url);
      signinUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(signinUrl);
      response.cookies.delete("auth_token");
      response.cookies.delete("refresh_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/create-campaign/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/dashboard/:path*',
    '/api/campaigns/:path*',
    '/api/donations/:path*',
    '/api/payouts/:path*',
    '/api/user/profile/:path*',
    '/api/admin/:path*',
  ],
};

