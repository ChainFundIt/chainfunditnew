import { NextRequest, NextResponse } from "next/server";
import { shortenLink } from "@/lib/shorten-link";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const shortUrl = await shortenLink(url);
    // Never hard-fail the UX: if shortening fails (misconfig, 3rd-party error, etc),
    // fall back to the original URL.
    return NextResponse.json({ shortUrl: shortUrl ?? url, shortened: !!shortUrl });
  } catch (error) {
    console.error("Error shortening link:", error);
    // Same fallback in case request parsing fails unexpectedly.
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 