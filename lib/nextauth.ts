import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const nextAuthOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  // NextAuth is now at /api/oauth instead of /api/auth
  // The route path determines the base URL automatically
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      try {
        // Check if user exists
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);

        if (existingUser.length === 0) {
          // Create new user
          const [newUser] = await db
            .insert(users)
            .values({
              email: user.email,
              fullName:
                user.name ||
                profile?.name ||
                profile?.username ||
                user.email.split("@")[0] ||
                "User",
              avatar: user.image || profile?.picture || profile?.image || profile?.avatar || null,
              isVerified: true,
              hasCompletedProfile: true,
            })
            .returning();

          console.log("[NextAuth] Created new user:", newUser.id);
        } else {
          // Update existing user with OAuth data
          await db
            .update(users)
            .set({
              fullName:
                user.name ||
                profile?.name ||
                profile?.username ||
                existingUser[0].fullName ||
                user.email.split("@")[0],
              avatar: user.image || profile?.picture || profile?.image || profile?.avatar || existingUser[0].avatar,
              isVerified: true,
              hasCompletedProfile: true,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUser[0].id));

          console.log("[NextAuth] Updated existing user:", existingUser[0].id);
        }

        return true;
      } catch (error) {
        console.error("[NextAuth] Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user && account) {
        // Get user from database
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email!))
          .limit(1);

        if (dbUser.length > 0) {
          token.userId = dbUser[0].id;
          token.email = dbUser[0].email;
          token.role = dbUser[0].role || "user";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle errors - redirect to signin page instead of /api/auth/error
      if (url.includes("/api/auth/error") || url.includes("/api/oauth/error")) {
        return `${baseUrl}/signin?error=oauth_failed`;
      }
      
      // After OAuth sign-in, redirect to our callback endpoint to convert to JWT
      if (url.startsWith(baseUrl)) {
        // If it's a callback from OAuth provider, redirect to our conversion endpoint
        if (url.includes("callback") || url.includes("/api/oauth/")) {
          return `${baseUrl}/api/auth/oauth-callback`;
        }
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin?error=oauth_failed",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production",
};

