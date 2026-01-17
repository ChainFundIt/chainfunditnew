import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { requireSuperAdminAuth } from '@/lib/admin-auth';
import { disableTwoFactor } from '@/lib/two-factor-auth';

/**
 * POST /api/admin/2fa/recover
 * Emergency recovery endpoint for super admins to disable 2FA
 * This requires super admin authentication and email verification
 */
export async function POST(request: NextRequest) {
  try {
    // Require super admin authentication
    const user = await requireSuperAdminAuth(request);
    
    const body = await request.json();
    const { email, confirmEmail } = body;

    if (!email || !confirmEmail) {
      return NextResponse.json(
        { error: 'Email confirmation is required' },
        { status: 400 }
      );
    }

    // Verify emails match
    if (email !== confirmEmail) {
      return NextResponse.json(
        { error: 'Email addresses do not match' },
        { status: 400 }
      );
    }

    // Verify email matches the authenticated user
    if (email !== user.email) {
      return NextResponse.json(
        { error: 'Email does not match authenticated user' },
        { status: 403 }
      );
    }

    // Get user from database to verify 2FA is enabled
    const [dbUser] = await db
      .select({
        id: users.id,
        email: users.email,
        twoFactorEnabled: users.twoFactorEnabled,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, user.email))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!dbUser.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is not enabled for this account' },
        { status: 400 }
      );
    }

    // Only allow super admins to use recovery
    if (dbUser.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Recovery is only available for super admins' },
        { status: 403 }
      );
    }

    // Disable 2FA
    const success = await disableTwoFactor(user.email);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to disable 2FA' },
        { status: 500 }
      );
    }

    // Clear 2FA verification cookie
    const response = NextResponse.json({
      success: true,
      message: '2FA has been disabled successfully. Please set up 2FA again.',
    });

    response.cookies.delete('2fa_verified');

    return response;
  } catch (error) {
    console.error('2FA recovery error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      if (error.message === 'Super admin privileges required') {
        return NextResponse.json(
          { error: 'Super admin privileges required for recovery' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}