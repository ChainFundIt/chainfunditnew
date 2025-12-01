import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/lib/nextauth";
import { generateTokenPair } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

/**
 * This endpoint is called after OAuth sign-in completes
 * It converts the NextAuth session to JWT tokens
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(nextAuthOptions);
    
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/signin?error=oauth_failed", req.url));
    }
    
    // Get user from database
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);
    
    if (dbUser.length === 0) {
      return NextResponse.redirect(new URL("/signin?error=user_not_found", req.url));
    }
    
    // Generate JWT tokens
    const tokens = await generateTokenPair(
      { id: dbUser[0].id, email: dbUser[0].email },
      req
    );
    
    // Determine redirect URL based on user role
    let redirectUrl = "/dashboard";
    try {
      const userResponse = await fetch(`${req.nextUrl.origin}/api/user/me`, {
        headers: {
          'Cookie': `auth_token=${tokens.accessToken}; refresh_token=${tokens.refreshToken}`
        }
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userRole = userData.user?.role;
        if (userRole === 'admin' || userRole === 'super_admin') {
          redirectUrl = '/admin/overview';
        }
      }
    } catch (error) {
      console.error('Error getting user role for OAuth redirect:', error);
    }
    
    // Create redirect response
    const response = NextResponse.redirect(new URL(redirectUrl, req.url));
    
    // Set JWT tokens as cookies
    response.cookies.set("auth_token", tokens.accessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 30 * 60, // 30 minutes
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    
    response.cookies.set("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    
    // Clear NextAuth session cookie (we're using JWT now)
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
    
    return response;
  } catch (error) {
    console.error("[OAuth Callback] Error:", error);
    return NextResponse.redirect(new URL("/signin?error=oauth_failed", req.url));
  }
}

