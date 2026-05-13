import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const SUPPORTED_PROVIDERS = new Set(["google"]);

function isProviderConfigured(provider: string) {
  if (provider === "google") {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }
  return false;
}

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  if (!provider || !SUPPORTED_PROVIDERS.has(provider)) {
    return NextResponse.redirect(new URL("/signin?error=oauth_failed", request.url));
  }

  if (!isProviderConfigured(provider)) {
    return NextResponse.redirect(new URL("/signin?error=oauth_failed", request.url));
  }

  try {
    const origin = request.nextUrl.origin;
    const signInRequest = new Request(request.url, {
      method: "POST",
      headers: request.headers,
    });
    const result = await auth.api.signInSocial({
      body: {
        provider,
        callbackURL: `${origin}/api/auth/social-callback`,
        newUserCallbackURL: `${origin}/api/auth/social-callback`,
        errorCallbackURL: `${origin}/signin?error=oauth_failed`,
      },
      headers: request.headers,
      request: signInRequest,
    });

    if ("url" in result && result.url) {
      return NextResponse.redirect(result.url);
    }

    console.warn("[Social SignIn] Unexpected result:", result);
    return NextResponse.redirect(new URL("/signin?error=oauth_failed", request.url));
  } catch (error) {
    console.error("[Social SignIn] Error:", error);
    return NextResponse.redirect(new URL("/signin?error=oauth_failed", request.url));
  }
}
