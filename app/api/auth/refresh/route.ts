import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/auth';
import { parse, serialize } from 'cookie';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parse(cookieHeader);
    const refreshToken = cookies['refresh_token'];
    
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token provided' },
        { status: 401 }
      );
    }
    
    // Refresh the access token
    const result = await refreshAccessToken(refreshToken, request);
    
    if (!result) {
      // Clear invalid tokens
      const response = NextResponse.json(
        { success: false, error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
      
      response.headers.set('Set-Cookie', [
        serialize('auth_token', '', { maxAge: 0, path: '/' }),
        serialize('refresh_token', '', { maxAge: 0, path: '/' }),
      ].join(', '));
      
      return response;
    }
    
    // Set new tokens in cookies
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
    });
    
    // Set access token (30 minutes)
    response.headers.append(
      'Set-Cookie',
      serialize('auth_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 60, // 30 minutes
        path: '/',
      })
    );
    
    // If token rotation is enabled, set new refresh token (30 days)
    if (result.refreshToken) {
      response.headers.append(
        'Set-Cookie',
        serialize('refresh_token', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/',
        })
      );
    }
    
    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/refresh
 * Check if refresh token is valid
 */
export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parse(cookieHeader);
    const refreshToken = cookies['refresh_token'];
    
    if (!refreshToken) {
      return NextResponse.json({ valid: false });
    }
    
    // Try to refresh to validate
    const result = await refreshAccessToken(refreshToken, request);
    
    return NextResponse.json({ valid: !!result });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json({ valid: false });
  }
}

