import { NextRequest, NextResponse } from "next/server";
import { auth, generateTokenPair } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const sessionResponse = await auth.api.getSession({
      headers: request.headers,
      asResponse: true,
      query: {
        disableRefresh: true,
      },
    });

    if (!sessionResponse.ok) {
      return NextResponse.redirect(new URL("/signin?error=oauth_failed", request.url));
    }

    const sessionData = await sessionResponse.json();
    const sessionUser = sessionData?.user;

    if (!sessionUser?.email) {
      return NextResponse.redirect(new URL("/signin?error=oauth_failed", request.url));
    }

    const normalizedEmail = sessionUser.email.toLowerCase().trim();
    let [dbUser] = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = LOWER(${normalizedEmail})`)
      .limit(1);

    if (!dbUser) {
      const fallbackName =
        sessionUser.name || normalizedEmail.split("@")[0] || "User";
      [dbUser] = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          fullName: fallbackName,
          avatar: sessionUser.image || null,
          isVerified: true,
          hasCompletedProfile: true,
        })
        .returning();
    } else {
      await db
        .update(users)
        .set({
          fullName:
            sessionUser.name ||
            dbUser.fullName ||
            normalizedEmail.split("@")[0] ||
            "User",
          avatar: sessionUser.image || dbUser.avatar,
          isVerified: true,
          hasCompletedProfile: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, dbUser.id));
    }

    const tokens = await generateTokenPair(
      { id: dbUser.id, email: dbUser.email },
      request
    );

    let redirectUrl = "/dashboard";
    try {
      const userResponse = await fetch(`${request.nextUrl.origin}/api/user/me`, {
        headers: {
          Cookie: `auth_token=${tokens.accessToken}; refresh_token=${tokens.refreshToken}`,
        },
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userRole = userData.user?.role;
        if (userRole === "admin" || userRole === "super_admin") {
          redirectUrl = "/admin/overview";
        }
      }
    } catch (error) {
      console.error("Error getting user role for social OAuth redirect:", error);
    }

    const response = NextResponse.redirect(new URL(redirectUrl, request.url));

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

    return response;
  } catch (error) {
    console.error("[Social Callback] Error:", error);
    return NextResponse.redirect(new URL("/signin?error=oauth_failed", request.url));
  }
}
