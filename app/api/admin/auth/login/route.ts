import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { generateTokenPair } from '@/lib/auth';

/**
 * POST /api/admin/auth/login
 * Admin login endpoint with role-based authentication
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        password: users.password,
        isVerified: users.isVerified,
        accountLocked: users.accountLocked,
        role: users.role,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (!user.role || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Check if account is locked
    if (user.accountLocked) {
      return NextResponse.json(
        { error: 'Account is locked. Please contact support.' },
        { status: 403 }
      );
    }

    // Check if account is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Account not verified. Please verify your email first.' },
        { status: 403 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokens = await generateTokenPair({ 
      id: user.id, 
      email: user.email 
    }, request);

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      message: 'Login successful',
    });

    // Set access token cookie (30 minutes)
    response.cookies.set("auth_token", tokens.accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 30 * 60, // 30 minutes
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Set refresh token cookie (30 days)
    response.cookies.set("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
