import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, revokeAllUserRefreshTokens } from '@/lib/auth';
import { parse } from 'cookie';

export async function POST(request: NextRequest) {
  try {
    // Get user from token to revoke their refresh tokens
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = parse(cookieHeader);
    const token = cookies['auth_token'];
    
    if (token) {
      const userPayload = verifyAccessToken(token);
      if (userPayload) {
        // Revoke all refresh tokens for this user
        await revokeAllUserRefreshTokens(userPayload.sub);
      }
    }

    // Create response
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });

    // Clear auth token cookie
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0, // Expire immediately
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Clear refresh token cookie
    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0, // Expire immediately
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
